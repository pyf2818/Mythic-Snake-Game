/**
 * 游戏UI管理器
 * 处理玩家属性面板和四季时间面板的更新
 */

class GameUIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        // UI元素引用
        this.elements = {
            // 玩家属性
            energyFill: document.getElementById('energy-fill'),
            energyText: document.getElementById('energy-text'),
            attackValue: document.getElementById('attack-value'),
            defenseValue: document.getElementById('defense-value'),
            backtrackValue: document.getElementById('backtrack-value'),
            speedValue: document.getElementById('speed-value'),
            
            // 四季时间
            seasonIcon: document.getElementById('season-icon'),
            seasonText: document.getElementById('season-text'),
            timeText: document.getElementById('time-text'),
            seasonProgressFill: document.getElementById('season-progress-fill'),
            seasonProgressText: document.getElementById('season-progress-text'),
            weatherIcon: document.getElementById('weather-icon'),
            weatherText: document.getElementById('weather-text'),
            seasonPanel: document.getElementById('season-time-panel'),
            
            // 底部工具栏
            coinsCount: document.getElementById('coins-count'),
            scoreCount: document.getElementById('score-count')
        };
        
        // 上一次的值（用于检测变化）
        this.lastValues = {
            energy: 100,
            attack: 10,
            defense: 5,
            backtrack: 3,
            speed: 7.5,
            coins: 0,
            score: 0
        };
        
        // 季节配置
        this.seasonConfig = {
            spring: {
                name: '春季',
                icon: '🌸',
                color: '#FFB6C1',
                decoration: '🌸🌷🌺'
            },
            summer: {
                name: '夏季',
                icon: '☀️',
                color: '#FFD700',
                decoration: '🌻🌴🍉'
            },
            autumn: {
                name: '秋季',
                icon: '🍂',
                color: '#FF8C00',
                decoration: '🍁🌰🎃'
            },
            winter: {
                name: '冬季',
                icon: '❄️',
                color: '#ADD8E6',
                decoration: '⛄🎄🎿'
            }
        };
        
        // 天气配置
        this.weatherConfig = {
            sunny: { icon: '☀️', name: '晴朗' },
            cloudy: { icon: '☁️', name: '多云' },
            rainy: { icon: '🌧️', name: '下雨' },
            stormy: { icon: '⛈️', name: '暴风雨' },
            snowy: { icon: '🌨️', name: '下雪' },
            foggy: { icon: '🌫️', name: '有雾' }
        };
        
        // 当前状态
        this.currentSeason = 'spring';
        this.currentWeather = 'sunny';
        this.dayCount = 1;
    }
    
    /**
     * 更新所有UI
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        this.updatePlayerStats();
        this.updateSeasonTime();
    }
    
    /**
     * 更新玩家属性面板
     */
    updatePlayerStats() {
        const player = this.gameManager.player;
        if (!player) return;
        
        // 更新能量值
        if (player.energySystem) {
            const energy = player.energySystem.energy;
            const maxEnergy = player.energySystem.maxEnergy || 100;
            this.updateStatBar(
                this.elements.energyFill,
                this.elements.energyText,
                energy,
                maxEnergy,
                'energy',
                true
            );
        }
        
        // 更新攻击力
        const attack = player.damageMultiplier ? Math.round(10 * player.damageMultiplier) : 10;
        this.updateStatValue(this.elements.attackValue, attack, 'attack');
        
        // 更新防御力
        const defense = player.defenseMultiplier ? Math.round(5 / player.defenseMultiplier) : 5;
        this.updateStatValue(this.elements.defenseValue, defense, 'defense');
        
        // 更新回溯次数
        if (this.gameManager.systems.timeManager) {
            const backtrack = this.gameManager.systems.timeManager.backtrackCount;
            this.updateStatValue(this.elements.backtrackValue, backtrack, 'backtrack');
        }
        
        // 更新速度
        this.updateStatValue(this.elements.speedValue, player.speed.toFixed(1), 'speed');
        
        // 更新金币
        this.updateStatValue(this.elements.coinsCount, this.gameManager.coins || 0, 'coins');
        
        // 更新分数
        this.updateStatValue(this.elements.scoreCount, this.gameManager.score || 0, 'score');
    }
    
    /**
     * 更新属性条
     */
    updateStatBar(fillElement, valueElement, current, max, statKey, showPercent = false) {
        if (!fillElement || !valueElement) return;
        
        const percent = (current / max) * 100;
        fillElement.style.width = `${percent}%`;
        
        let displayValue;
        if (showPercent) {
            displayValue = `${Math.round(percent)}%`;
        } else {
            displayValue = `${Math.round(current)}/${Math.round(max)}`;
        }
        
        // 检测变化并添加动画
        if (this.lastValues[statKey] !== current) {
            valueElement.textContent = displayValue;
            valueElement.classList.add('changed');
            setTimeout(() => valueElement.classList.remove('changed'), 300);
            this.lastValues[statKey] = current;
        } else {
            valueElement.textContent = displayValue;
        }
    }
    
    /**
     * 更新属性值
     */
    updateStatValue(element, value, statKey) {
        if (!element) return;
        
        const stringValue = String(value);
        if (this.lastValues[statKey] !== value) {
            element.textContent = stringValue;
            element.classList.add('changed');
            setTimeout(() => element.classList.remove('changed'), 300);
            this.lastValues[statKey] = value;
        } else {
            element.textContent = stringValue;
        }
    }
    
    /**
     * 更新四季时间面板
     */
    updateSeasonTime() {
        // 获取季节系统
        const seasonSystem = this.gameManager.systems.season;
        if (seasonSystem) {
            const season = seasonSystem.currentSeason;
            if (season !== this.currentSeason) {
                this.changeSeason(season);
            }
        }
        
        // 更新时间
        const dayNight = this.gameManager.systems.dayNight;
        if (dayNight) {
            const time = dayNight.currentTime || 0;
            const hours = Math.floor(time);
            const minutes = Math.floor((time - hours) * 60);
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            if (this.elements.timeText) {
                this.elements.timeText.textContent = timeString;
            }
        }
        
        // 更新天气
        this.updateWeather();
    }
    
    /**
     * 更改季节
     */
    changeSeason(season) {
        const config = this.seasonConfig[season];
        if (!config) return;
        
        // 添加季节更替动画
        if (this.elements.seasonPanel) {
            this.elements.seasonPanel.classList.add('season-changing');
            this.elements.seasonPanel.setAttribute('data-season', season);
            setTimeout(() => {
                this.elements.seasonPanel.classList.remove('season-changing');
            }, 1000);
        }
        
        // 更新季节图标和文字
        if (this.elements.seasonIcon) {
            this.elements.seasonIcon.textContent = config.icon;
        }
        if (this.elements.seasonText) {
            this.elements.seasonText.textContent = config.name;
        }
        
        this.currentSeason = season;
        
        // 显示季节变化通知
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `🌍 季节更替：${config.name}`,
                config.color,
                'info',
                3
            );
        }
    }
    
    /**
     * 更新天气
     */
    updateWeather() {
        // 根据季节和随机因素确定天气
        const weatherSystem = this.gameManager.systems.weatherDisaster;
        let weather = 'sunny';
        
        if (weatherSystem && weatherSystem.currentDisaster) {
            // 根据灾难类型确定天气
            const disasterType = weatherSystem.currentDisaster.type;
            const weatherMap = {
                'rain': 'rainy',
                'storm': 'stormy',
                'snow': 'snowy',
                'fog': 'foggy'
            };
            weather = weatherMap[disasterType] || 'cloudy';
        } else {
            // 根据季节随机天气
            const seasonWeathers = {
                spring: ['sunny', 'cloudy', 'rainy'],
                summer: ['sunny', 'sunny', 'cloudy', 'stormy'],
                autumn: ['cloudy', 'rainy', 'foggy'],
                winter: ['cloudy', 'snowy', 'foggy']
            };
            const weathers = seasonWeathers[this.currentSeason] || ['sunny'];
            // 只在天气变化时更新
            if (Math.random() < 0.001) {
                weather = weathers[Math.floor(Math.random() * weathers.length)];
            } else {
                weather = this.currentWeather;
            }
        }
        
        if (weather !== this.currentWeather) {
            this.setWeather(weather);
        }
    }
    
    /**
     * 设置天气
     */
    setWeather(weather) {
        const config = this.weatherConfig[weather];
        if (!config) return;
        
        if (this.elements.weatherIcon) {
            this.elements.weatherIcon.textContent = config.icon;
        }
        if (this.elements.weatherText) {
            this.elements.weatherText.textContent = config.name;
        }
        
        this.currentWeather = weather;
    }
    
    /**
     * 更新季节进度
     */
    updateSeasonProgress(progress, day) {
        if (this.elements.seasonProgressFill) {
            this.elements.seasonProgressFill.style.width = `${progress * 100}%`;
        }
        if (this.elements.seasonProgressText) {
            this.elements.seasonProgressText.textContent = `第 ${day} 天`;
        }
        this.dayCount = day;
    }
    
    /**
     * 重置UI
     */
    reset() {
        // 重置所有值为默认
        this.lastValues = {
            health: 100,
            maxHealth: 100,
            energy: 100,
            attack: 10,
            defense: 5,
            backtrack: 3,
            speed: 7.5,
            coins: 0,
            score: 0
        };
        
        this.currentSeason = 'spring';
        this.currentWeather = 'sunny';
        this.dayCount = 1;
        
        // 重置UI元素
        if (this.elements.healthFill) this.elements.healthFill.style.width = '100%';
        if (this.elements.healthValue) this.elements.healthValue.textContent = '100/100';
        if (this.elements.energyFill) this.elements.energyFill.style.width = '100%';
        if (this.elements.energyText) this.elements.energyText.textContent = '100%';
        if (this.elements.attackValue) this.elements.attackValue.textContent = '10';
        if (this.elements.defenseValue) this.elements.defenseValue.textContent = '5';
        if (this.elements.backtrackValue) this.elements.backtrackValue.textContent = '3';
        if (this.elements.speedValue) this.elements.speedValue.textContent = '7.5';
        if (this.elements.coinsCount) this.elements.coinsCount.textContent = '0';
        if (this.elements.scoreCount) this.elements.scoreCount.textContent = '0';
        if (this.elements.timeText) this.elements.timeText.textContent = '00:00';
        if (this.elements.seasonProgressFill) this.elements.seasonProgressFill.style.width = '25%';
        if (this.elements.seasonProgressText) this.elements.seasonProgressText.textContent = '第 1 天';
        
        // 重置季节
        this.changeSeason('spring');
        this.setWeather('sunny');
    }
}

// 导出
try {
    module.exports = { GameUIManager };
} catch (e) {
    window.GameUIManager = GameUIManager;
}
