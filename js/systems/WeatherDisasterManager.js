class WeatherDisasterManager {
    constructor(gameManager) {
        console.log('WeatherDisasterManager constructor called with gameManager:', gameManager);
        this.gameManager = gameManager;
        this.activeDisasters = [];
        this.maxActiveDisasters = 2;
        this.disasterTimer = 0;
        this.minSpawnInterval = 20; // 调整频率：最小20秒
        this.maxSpawnInterval = 30; // 调整频率：最大30秒
        
        // 灾害预警系统
        this.warningSystem = {
            activeWarnings: [],
            warningDuration: 5, // 预警持续时间（秒）
            warningCooldown: 10 // 预警冷却时间（秒）
        };
        
        // 天气灾害类型
        this.disasterTypes = {
            rainstorm: {
                name: '暴雨',
                duration: 20,
                intensity: { min: 1, max: 3 },
                visualEffects: {
                    rainDensity: { min: 50, max: 150 },
                    cloudOpacity: 0.8,
                    tintColor: '#3498db',
                    tintIntensity: 0.3
                },
                gameplayEffects: {
                    movementSpeedMultiplier: 0.8,
                    energyConsumptionMultiplier: 1.2,
                    foodSpawnRateMultiplier: 1.5,
                    visibilityReduction: 0.2
                },
                audioEffects: {
                    rainSound: true,
                    thunderChance: 0.3
                },
                description: '大雨倾盆，视野受限，移动速度减慢，但食物更加丰富',
                difficulty: 2,
                recoveryTime: 60
            },
            blizzard: {
                name: '暴风雪',
                duration: 10,
                intensity: { min: 2, max: 4 },
                visualEffects: {
                    snowDensity: { min: 80, max: 200 },
                    cloudOpacity: 0.9,
                    tintColor: '#ecf0f1',
                    tintIntensity: 0.4
                },
                gameplayEffects: {
                    movementSpeedMultiplier: 0.6,
                    energyConsumptionMultiplier: 1.5,
                    foodSpawnRateMultiplier: 0.5,
                    visibilityReduction: 0.4
                },
                audioEffects: {
                    windSound: true,
                    snowSound: true
                },
                description: '暴风雪来袭，严重影响视野和移动，能量消耗加快',
                difficulty: 3,
                recoveryTime: 90
            },
            sandstorm: {
                name: '沙尘暴',
                duration: 10,
                intensity: { min: 1.5, max: 3.5 },
                visualEffects: {
                    sandDensity: { min: 100, max: 250 },
                    cloudOpacity: 0.7,
                    tintColor: '#f39c12',
                    tintIntensity: 0.35
                },
                gameplayEffects: {
                    movementSpeedMultiplier: 0.7,
                    energyConsumptionMultiplier: 1.3,
                    foodSpawnRateMultiplier: 0.8,
                    visibilityReduction: 0.3
                },
                audioEffects: {
                    windSound: true,
                    sandSound: true
                },
                description: '沙尘暴席卷大地，视野模糊，移动困难',
                difficulty: 2.5,
                recoveryTime: 75
            },
            thunderstorm: {
                name: '雷暴',
                duration: 10,
                intensity: { min: 2, max: 4 },
                visualEffects: {
                    lightningFrequency: { min: 5, max: 15 },
                    cloudOpacity: 0.95,
                    tintColor: '#8e44ad',
                    tintIntensity: 0.45
                },
                gameplayEffects: {
                    movementSpeedMultiplier: 0.85,
                    energyConsumptionMultiplier: 1.4,
                    foodSpawnRateMultiplier: 1.2,
                    visibilityReduction: 0.35,
                    randomDamage: { min: 5, max: 20 }
                },
                audioEffects: {
                    thunderSound: true,
                    rainSound: true
                },
                description: '雷暴天气，闪电可能造成随机伤害，能量消耗加快',
                difficulty: 3.5,
                recoveryTime: 80
            },
            heatwave: {
                name: '热浪',
                duration: 10,
                intensity: { min: 1, max: 3 },
                visualEffects: {
                    heatHazeIntensity: { min: 0.3, max: 0.7 },
                    tintColor: '#e67e22',
                    tintIntensity: 0.25
                },
                gameplayEffects: {
                    movementSpeedMultiplier: 0.9,
                    energyConsumptionMultiplier: 1.6,
                    foodSpawnRateMultiplier: 0.7,
                    visibilityReduction: 0.15
                },
                audioEffects: {
                    heatHazeSound: true
                },
                description: '热浪来袭，能量消耗急剧增加，需要更多食物补充',
                difficulty: 2.5,
                recoveryTime: 85
            },
            tornado: {
                name: '龙卷风',
                duration: 10,
                intensity: { min: 2, max: 4 },
                visualEffects: {
                    tornadoDensity: { min: 100, max: 300 },
                    cloudOpacity: 0.85,
                    tintColor: '#95a5a6',
                    tintIntensity: 0.3
                },
                gameplayEffects: {
                    movementSpeedMultiplier: 0.5,
                    energyConsumptionMultiplier: 1.3,
                    visibilityReduction: 0.4,
                    tornadoRadius: { min: 100, max: 200 }
                },
                audioEffects: {
                    windSound: true,
                    tornadoSound: true
                },
                description: '龙卷风席卷而来，会将角色卷入并持续吸附',
                difficulty: 4,
                recoveryTime: 70
            },
            heavySnowstorm: {
                name: '大风雪',
                duration: 10,
                intensity: { min: 2.5, max: 4.5 },
                visualEffects: {
                    snowDensity: { min: 150, max: 300 },
                    cloudOpacity: 0.95,
                    tintColor: '#bdc3c7',
                    tintIntensity: 0.5
                },
                gameplayEffects: {
                    movementSpeedMultiplier: 0.4,
                    energyConsumptionMultiplier: 1.6,
                    foodSpawnRateMultiplier: 0.4,
                    visibilityReduction: 0.5,
                    freezeDuration: 3
                },
                audioEffects: {
                    windSound: true,
                    snowSound: true,
                    freezeSound: true
                },
                description: '大风雪来袭，会使角色定身3秒无法行动',
                difficulty: 3.5,
                recoveryTime: 85
            },
            magmaEruption: {
                name: '岩浆爆发',
                duration: 10,
                intensity: { min: 3, max: 5 },
                visualEffects: {
                    magmaDensity: { min: 80, max: 200 },
                    cloudOpacity: 0.9,
                    tintColor: '#e74c3c',
                    tintIntensity: 0.4
                },
                gameplayEffects: {
                    movementSpeedMultiplier: 0.7,
                    energyConsumptionMultiplier: 1.4,
                    visibilityReduction: 0.3,
                    eruptionDamage: { min: 20, max: 40 },
                    eruptionRadius: { min: 80, max: 150 }
                },
                audioEffects: {
                    eruptionSound: true,
                    fireSound: true
                },
                description: '岩浆爆发，对范围内角色造成直接伤害',
                difficulty: 4.5,
                recoveryTime: 95
            }
        };
        
        // 游戏进程难度调整
        this.gameProgress = 0;
        this.difficultyIncreaseInterval = 180; // 每3分钟增加一次难度
        this.difficultyTimer = 0;
        
        // 初始化生成间隔（必须在gameProgress初始化后调用）
        this.currentSpawnInterval = this.getRandomSpawnInterval();
        console.log('WeatherDisasterManager initialized with spawn interval:', this.currentSpawnInterval);
        
        // 初始化视觉效果系统
        this.visualEffects = new WeatherVisualEffects(this.gameManager);
    }
    
    update(deltaTime) {
        // 检查update方法是否被调用
        console.log('WeatherDisasterManager.update() called with deltaTime:', deltaTime);
        
        // 更新灾害生成计时器
        this.disasterTimer += deltaTime;
        this.difficultyTimer += deltaTime;
        
        // 增加游戏进程
        this.gameProgress += deltaTime;
        
        // 定期增加难度
        if (this.difficultyTimer >= this.difficultyIncreaseInterval) {
            this.difficultyTimer = 0;
            this.increaseDifficulty();
        }
        
        // 检查灾害预警
        this.checkDisasterWarnings();
        
        // 更新活跃预警
        this.updateWarnings(deltaTime);
        
        // 生成新的灾害
        if (this.disasterTimer >= this.currentSpawnInterval) {
            console.log(`灾害生成：计时器达到间隔 ${this.disasterTimer.toFixed(2)} >= ${this.currentSpawnInterval.toFixed(2)}`);
            this.disasterTimer = 0;
            this.spawnDisaster();
            this.currentSpawnInterval = this.getRandomSpawnInterval();
            console.log(`灾害生成：新的间隔 ${this.currentSpawnInterval.toFixed(2)} 秒`);
        }
        
        // 定期日志记录
        if (Math.floor(this.gameProgress) % 10 === 0 && Math.floor(this.gameProgress * 10) % 10 === 0) {
            console.log(`灾害系统：游戏时间 ${Math.floor(this.gameProgress)} 秒，计时器 ${this.disasterTimer.toFixed(2)} 秒，目标间隔 ${this.currentSpawnInterval.toFixed(2)} 秒，活跃灾害 ${this.activeDisasters.length}/${this.maxActiveDisasters}`);
        }
        
        // 更新活跃灾害
        this.updateActiveDisasters(deltaTime);
        
        // 更新视觉效果
        this.visualEffects.update(deltaTime);
        
        // 渲染预警指示器
        this.renderWarningIndicators();
    }
    

    
    spawnDisaster() {
        // 检查是否达到最大活跃灾害数量
        if (this.activeDisasters.length >= this.maxActiveDisasters) {
            console.log(`灾害生成：达到最大活跃灾害数量 ${this.maxActiveDisasters}`);
            return;
        }
        
        // 根据游戏进程和难度选择灾害
        const disasterType = this.selectDisasterType();
        if (!disasterType) {
            console.log(`灾害生成：未选择到灾害类型`);
            return;
        }
        
        const disasterConfig = this.disasterTypes[disasterType];
        if (!disasterConfig) {
            console.log(`灾害生成：未找到灾害配置 ${disasterType}`);
            return;
        }
        
        // 生成灾害实例
        const disaster = {
            id: Math.random().toString(36).substr(2, 9),
            type: disasterType,
            config: disasterConfig,
            intensity: this.calculateDisasterIntensity(disasterConfig),
            duration: disasterConfig.duration,
            elapsedTime: 0,
            active: true,
            effectsApplied: false
        };
        
        this.activeDisasters.push(disaster);
        
        // 应用灾害效果
        this.applyDisasterEffects(disaster);
        
        // 显示灾害开始通知
        this.showDisasterNotification(disaster);
        
        console.log(`天气灾害开始: ${disaster.config.name} (强度: ${disaster.intensity.toFixed(1)})`);
    }
    
    selectDisasterType() {
        // 根据游戏进程和当前条件选择灾害类型
        const availableTypes = Object.keys(this.disasterTypes);
        
        console.log(`选择灾害类型：可用类型 ${availableTypes.length} 个`, availableTypes);
        
        if (availableTypes.length === 0) {
            console.log(`选择灾害类型：没有可用的灾害类型`);
            return null;
        }
        
        // 根据难度和游戏进程加权选择
        const weightedTypes = availableTypes.map(type => {
            const config = this.disasterTypes[type];
            const weight = config.difficulty + (this.gameProgress / 300); // 随游戏进程增加难度较高的灾害权重
            return { type, weight };
        });
        
        console.log(`选择灾害类型：加权类型`, weightedTypes);
        
        // 加权随机选择
        const totalWeight = weightedTypes.reduce((sum, item) => sum + item.weight, 0);
        console.log(`选择灾害类型：总权重 ${totalWeight}`);
        
        let random = Math.random() * totalWeight;
        console.log(`选择灾害类型：随机值 ${random}`);
        
        for (const item of weightedTypes) {
            random -= item.weight;
            console.log(`选择灾害类型：检查 ${item.type}，剩余随机值 ${random}`);
            if (random <= 0) {
                console.log(`选择灾害类型：选择 ${item.type}`);
                return item.type;
            }
        }
        
        // 后备随机选择
        const fallbackType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        console.log(`选择灾害类型：后备选择 ${fallbackType}`);
        return fallbackType;
    }
    
    calculateDisasterIntensity(config) {
        // 根据游戏进程计算灾害强度
        const baseIntensity = Math.random() * (config.intensity.max - config.intensity.min) + config.intensity.min;
        
        // 动态进度乘数 - 随着游戏时间增加而逐渐提高强度
        const progressMultiplier = 1 + (this.gameProgress / 480); // 每8分钟增加12.5%强度
        
        // 难度曲线 - 后期游戏强度增长更快
        const difficultyCurve = 1 + Math.pow(this.gameProgress / 1200, 1.2); // 非线性增长
        
        // 最终强度计算
        let finalIntensity = baseIntensity * progressMultiplier * difficultyCurve;
        
        // 强度上限
        const maxIntensity = config.intensity.max * 2.0; // 允许最高达到配置最大值的2倍
        
        return Math.min(finalIntensity, maxIntensity);
    }
    
    /**
     * 计算灾害频率
     * @returns {number} 灾害生成间隔（秒）
     */
    getRandomSpawnInterval() {
        // 基础间隔
        let baseMin = this.minSpawnInterval;
        let baseMax = this.maxSpawnInterval;
        
        // 随着游戏进度缩短间隔
        const progressReduction = Math.min(0.6, this.gameProgress / 1800); // 最多减少40%
        
        // 计算最终间隔范围
        const finalMin = baseMin * (1 - progressReduction);
        const finalMax = baseMax * (1 - progressReduction);
        
        return Math.random() * (finalMax - finalMin) + finalMin;
    }
    
    updateActiveDisasters(deltaTime) {
        // 更新活跃灾害
        for (let i = this.activeDisasters.length - 1; i >= 0; i--) {
            const disaster = this.activeDisasters[i];
            
            disaster.elapsedTime += deltaTime;
            
            // 检查灾害是否结束
            if (disaster.elapsedTime >= disaster.duration) {
                this.endDisaster(disaster);
                this.activeDisasters.splice(i, 1);
            } else {
                // 更新灾害效果
                this.updateDisasterEffects(disaster, deltaTime);
            }
        }
    }
    
    applyDisasterEffects(disaster) {
        // 应用灾害效果
        const effects = disaster.config.gameplayEffects;
        
        // 检查玩家是否拥有防护道具
        const hasProtection = this.checkWeatherProtection(disaster.type);
        
        // 应用移动速度影响
        if (effects.movementSpeedMultiplier) {
            // 存储原始速度
            if (!this.gameManager.player) return;
            
            if (!this.gameManager.player.originalSpeed) {
                this.gameManager.player.originalSpeed = this.gameManager.player.speed;
            }
            
            // 应用速度修改
            const intensityMultiplier = (disaster.intensity - 1) * 0.2 + 1;
            let speedMultiplier = effects.movementSpeedMultiplier * intensityMultiplier;
            
            // 如果有防护道具，减轻速度影响
            if (hasProtection) {
                speedMultiplier = (speedMultiplier - 1) * 0.7 + 1;
            }
            
            this.gameManager.player.speed *= speedMultiplier;
        }
        
        // 触发特殊事件
        this.triggerSpecialEvents(disaster);
        
        // 应用视觉效果
        this.visualEffects.startDisasterEffects(disaster);
        
        // 应用音频效果
        this.applyAudioEffects(disaster);
        
        disaster.effectsApplied = true;
    }
    
    triggerSpecialEvents(disaster) {
        // 触发天气灾害相关的特殊事件
        const eventChance = this.specialEventChance || 0.3; // 使用动态的特殊事件触发概率
        
        if (Math.random() < eventChance) {
            switch (disaster.type) {
                case 'rainstorm':
                    this.triggerFloodEvent(disaster);
                    break;
                case 'blizzard':
                    this.triggerIceEvent(disaster);
                    break;
                case 'sandstorm':
                    this.triggerRareResourceEvent(disaster);
                    break;
                case 'thunderstorm':
                    this.triggerLightningStrikeEvent(disaster);
                    break;
                case 'heatwave':
                    this.triggerDroughtEvent(disaster);
                    break;
            }
        }
    }
    
    triggerFloodEvent(disaster) {
        // 暴雨导致洪水事件
        if (this.gameManager.systems.liquidPhysics) {
            // 生成临时的水域区域
            const floodX = Math.random() * 800 + 100;
            const floodY = Math.random() * 600 + 100;
            const floodSize = 100 + disaster.intensity * 20;
            
            // 通知玩家
            if (this.gameManager.systems.notificationManager) {
                this.gameManager.systems.notificationManager.showNotification(
                    `🌊 暴雨导致洪水！小心水域区域`,
                    '#3498db',
                    'info'
                );
            }
            
            console.log(`洪水事件：在(${floodX}, ${floodY})生成了大小为${floodSize}的水域`);
        }
    }
    
    triggerIceEvent(disaster) {
        // 暴风雪导致结冰事件
        // 通知玩家
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `❄️ 暴风雪导致地面结冰！移动时要小心`,
                '#ecf0f1',
                'info'
            );
        }
        
        console.log(`结冰事件：地面变得滑溜溜的，影响移动`);
    }
    
    triggerRareResourceEvent(disaster) {
        // 沙尘暴带来稀有资源事件
        // 在随机位置生成稀有食物
        const rareFoodX = Math.random() * 800 + 100;
        const rareFoodY = Math.random() * 600 + 100;
        
        // 通知玩家
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `💎 沙尘暴带来了稀有资源！快去寻找`,
                '#f39c12',
                'info'
            );
        }
        
        console.log(`稀有资源事件：在(${rareFoodX}, ${rareFoodY})附近生成了稀有资源`);
    }
    
    triggerLightningStrikeEvent(disaster) {
        // 雷暴击中地面生成特殊物品事件
        // 在随机位置生成特殊物品
        const strikeX = Math.random() * 800 + 100;
        const strikeY = Math.random() * 600 + 100;
        
        // 通知玩家
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `⚡ 闪电击中了地面！可能生成了特殊物品`,
                '#8e44ad',
                'info'
            );
        }
        
        console.log(`闪电击中事件：在(${strikeX}, ${strikeY})生成了特殊物品`);
    }
    
    triggerDroughtEvent(disaster) {
        // 热浪导致地面干裂事件
        // 通知玩家
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `🔥 热浪导致地面干裂！出现了新的地形`,
                '#e67e22',
                'info'
            );
        }
        
        console.log(`干旱事件：地面干裂，出现了新的地形`);
    }
    
    checkWeatherProtection(disasterType) {
        // 检查玩家是否拥有对应灾害的防护道具
        if (!window.gameDataManager) return false;
        
        const hasUmbrella = window.gameDataManager.hasItem('weather_umbrella');
        const hasWarmClothes = window.gameDataManager.hasItem('weather_warm_clothes');
        const hasGoggles = window.gameDataManager.hasItem('weather_goggles');
        
        switch (disasterType) {
            case 'rainstorm':
            case 'thunderstorm':
                return hasUmbrella;
            case 'blizzard':
            case 'heatwave':
                return hasWarmClothes;
            case 'sandstorm':
                return hasGoggles;
            default:
                return false;
        }
    }
    
    updateDisasterEffects(disaster, deltaTime) {
        // 更新灾害效果
        const effects = disaster.config.gameplayEffects;
        
        // 检查玩家是否拥有防护道具
        const hasProtection = this.checkWeatherProtection(disaster.type);
        
        // 处理雷暴的视觉效果（已移除伤害）
        if (disaster.type === 'thunderstorm' && effects.randomDamage) {
            // 仅保留视觉效果，不造成伤害
        }
        
        // 处理热浪的视觉效果（已移除能量消耗）
        if (disaster.type === 'heatwave') {
            // 仅保留视觉效果，不消耗能量
        }
        
        // 处理龙卷风的吸附效果
        if (disaster.type === 'tornado') {
            this.applyTornadoEffects(disaster, deltaTime, hasProtection);
        }
        
        // 处理大风雪的定身效果
        if (disaster.type === 'heavySnowstorm') {
            this.applyHeavySnowstormEffects(disaster, deltaTime, hasProtection);
        }
        
        // 处理岩浆爆发的伤害效果
        if (disaster.type === 'magmaEruption') {
            this.applyMagmaEruptionEffects(disaster, deltaTime, hasProtection);
        }
    }
    
    applyTornadoEffects(disaster, deltaTime, hasProtection) {
        // 处理龙卷风的吸附效果
        if (!this.gameManager.player) return;
        
        // 计算龙卷风中心位置（随机生成）
        if (!disaster.tornadoCenter) {
            disaster.tornadoCenter = {
                x: Math.random() * 800 + 100,
                y: Math.random() * 600 + 100
            };
        }
        
        // 计算龙卷风半径
        const effects = disaster.config.gameplayEffects;
        const radius = (effects.tornadoRadius.min + (effects.tornadoRadius.max - effects.tornadoRadius.min) * (disaster.intensity / 4));
        
        // 计算玩家与龙卷风中心的距离
        const dx = this.gameManager.player.x - disaster.tornadoCenter.x;
        const dy = this.gameManager.player.y - disaster.tornadoCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 如果玩家在龙卷风范围内，应用吸附效果
        if (distance < radius) {
            // 初始化吸附计时器
            if (!disaster.suctionTimer) {
                disaster.suctionTimer = 0;
            }
            
            // 更新吸附计时器
            disaster.suctionTimer += deltaTime;
            
            // 吸附持续时间（秒）
            const maxSuctionDuration = 3; // 最大吸附时间为3秒
            
            // 根据吸附时间计算吸力衰减
            let suctionMultiplier = 1.0;
            if (disaster.suctionTimer > maxSuctionDuration) {
                // 超过最大吸附时间后，吸力开始衰减
                const decayTime = disaster.suctionTimer - maxSuctionDuration;
                suctionMultiplier = Math.max(0, 1 - (decayTime / 2)); // 2秒内完全衰减
            }
            
            // 计算吸附力
            const suction = (1 - distance / radius) * 0.5 * disaster.intensity * suctionMultiplier;
            
            // 如果有防护道具，减少吸力
            const protectionMultiplier = hasProtection ? 0.6 : 1;
            const adjustedSuction = suction * protectionMultiplier;
            
            // 应用吸附效果
            if (adjustedSuction > 0) {
                const angle = Math.atan2(dy, dx);
                this.gameManager.player.x -= Math.cos(angle) * adjustedSuction;
                this.gameManager.player.y -= Math.sin(angle) * adjustedSuction;
            }
            
            // 显示龙卷风吸附通知
            if (!disaster.suctionNotified) {
                disaster.suctionNotified = true;
                if (this.gameManager.systems.notificationManager) {
                    this.gameManager.systems.notificationManager.showNotification(
                        `🌪️ 你被龙卷风吸附了！`,
                        '#95a5a6',
                        'warning'
                    );
                }
            }
        } else {
            // 玩家离开龙卷风范围，重置相关标志和计时器
            disaster.suctionNotified = false;
            delete disaster.suctionTimer;
        }
    }
    
    applyHeavySnowstormEffects(disaster, deltaTime, hasProtection) {
        // 处理大风雪的定身效果
        if (!this.gameManager.player) return;
        
        // 已移除定身效果，仅保留视觉效果
    }
    
    applyMagmaEruptionEffects(disaster, deltaTime, hasProtection) {
        // 处理岩浆爆发的伤害效果
        if (!this.gameManager.player) return;
        
        // 计算岩浆爆发位置（随机生成）
        if (!disaster.eruptionCenter) {
            disaster.eruptionCenter = {
                x: Math.random() * 800 + 100,
                y: Math.random() * 600 + 100
            };
            
            // 生成岩浆爆发区域
            this.generateMagmaAreas(disaster);
        }
        
        // 计算岩浆爆发半径
        const effects = disaster.config.gameplayEffects;
        const radius = (effects.eruptionRadius.min + (effects.eruptionRadius.max - effects.eruptionRadius.min) * (disaster.intensity / 5));
        
        // 处理玩家与岩浆区域的交互
        this.checkPlayerMagmaInteraction(disaster, deltaTime, hasProtection);
    }
    
    generateMagmaAreas(disaster) {
        // 生成岩浆爆发区域
        disaster.magmaAreas = [];
        const effects = disaster.config.gameplayEffects;
        const radius = (effects.eruptionRadius.min + (effects.eruptionRadius.max - effects.eruptionRadius.min) * (disaster.intensity / 5));
        
        // 生成多个岩浆地块
        const areaCount = Math.floor(disaster.intensity * 2) + 3; // 根据强度生成3-13个地块
        
        for (let i = 0; i < areaCount; i++) {
            // 围绕爆发中心随机生成地块位置
            const angle = (i / areaCount) * Math.PI * 2;
            const distance = Math.random() * radius * 0.8 + radius * 0.2;
            const areaSize = Math.random() * 30 + 20; // 地块大小20-50
            
            disaster.magmaAreas.push({
                x: disaster.eruptionCenter.x + Math.cos(angle) * distance,
                y: disaster.eruptionCenter.y + Math.sin(angle) * distance,
                size: areaSize
            });
        }
        
        // 将岩浆区域信息传递给视觉效果系统
        if (this.visualEffects && this.visualEffects.activeEffects) {
            const magmaEffect = this.visualEffects.activeEffects.find(effect => effect.type === 'magmaEruption');
            if (magmaEffect) {
                magmaEffect.magmaAreas = disaster.magmaAreas;
            }
        }
    }
    
    checkPlayerMagmaInteraction(disaster, deltaTime, hasProtection) {
        // 检查玩家与岩浆区域的交互
        if (!disaster.magmaAreas || !this.gameManager.player) return;
        
        const effects = disaster.config.gameplayEffects;
        const playerX = this.gameManager.player.x;
        const playerY = this.gameManager.player.y;
        
        // 检查玩家是否在任何岩浆区域内
        let inMagmaArea = false;
        
        for (const area of disaster.magmaAreas) {
            // 计算玩家与地块中心的距离
            const dx = playerX - area.x;
            const dy = playerY - area.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 如果玩家在地块范围内（已移除伤害，仅保留视觉效果）
            if (distance < area.size) {
                inMagmaArea = true;
                // 不再造成伤害，仅保留视觉效果
                break; // 只需要处理一个地块
            }
        }
        
        // 如果玩家离开岩浆区域，重置通知标志
        if (!inMagmaArea) {
            disaster.lastDamageNotification = null;
        }
    }
    
    endDisaster(disaster) {
        console.log(`结束灾害: ${disaster.config.name}, 持续时间: ${disaster.elapsedTime.toFixed(1)}秒`);
        
        // 结束灾害效果
        const effects = disaster.config.gameplayEffects;
        
        // 恢复移动速度
        if (effects.movementSpeedMultiplier && this.gameManager.player) {
            if (this.gameManager.player.originalSpeed) {
                this.gameManager.player.speed = this.gameManager.player.originalSpeed;
                delete this.gameManager.player.originalSpeed;
            }
        }
        
        // 停止视觉效果
        this.visualEffects.stopDisasterEffects(disaster);
        
        // 停止音频效果
        this.stopAudioEffects(disaster);
        
        // 显示灾害结束通知
        this.showDisasterEndNotification(disaster);
        
        console.log(`天气灾害结束: ${disaster.config.name}`);
    }
    
    applyLightningDamage(disaster, hasProtection = false) {
        // 应用闪电伤害（带预警系统）
        if (!this.gameManager.player || !this.gameManager.player.energySystem) return;
        
        const effects = disaster.config.gameplayEffects;
        let damage = Math.random() * (effects.randomDamage.max - effects.randomDamage.min) + effects.randomDamage.min;
        
        // 如果有防护道具，减少闪电伤害
        if (hasProtection) {
            damage *= 0.6;
        }
        
        // 获取玩家位置作为闪电落点
        const strikeX = this.gameManager.player.x + this.gameManager.player.width / 2;
        const strikeY = this.gameManager.player.y + this.gameManager.player.height / 2;
        
        // 创建闪电预警，预警结束后造成伤害
        this.visualEffects.createLightningWarning(strikeX, strikeY, (x, y) => {
            // 检查玩家是否在预警范围内
            if (this.gameManager.player) {
                const playerCenterX = this.gameManager.player.x + this.gameManager.player.width / 2;
                const playerCenterY = this.gameManager.player.y + this.gameManager.player.height / 2;
                const distance = Math.sqrt(
                    Math.pow(playerCenterX - x, 2) + 
                    Math.pow(playerCenterY - y, 2)
                );
                
                // 如果玩家还在预警范围内，造成伤害
                if (distance <= this.visualEffects.warningRadius) {
                    this.gameManager.player.energySystem.consume(damage);
                    
                    // 显示闪电伤害通知
                    if (this.gameManager.systems.notificationManager) {
                        const message = hasProtection 
                            ? `⚡ 闪电击中！但雨伞减轻了伤害，仅失去${Math.round(damage)}点能量` 
                            : `⚡ 闪电击中！失去${Math.round(damage)}点能量`;
                        
                        this.gameManager.systems.notificationManager.showNotification(
                            message,
                            '#f1c40f',
                            'warning'
                        );
                    }
                } else {
                    // 玩家成功躲避
                    if (this.gameManager.systems.notificationManager) {
                        this.gameManager.systems.notificationManager.showNotification(
                            `⚡ 成功躲避闪电！`,
                            '#2ecc71',
                            'success'
                        );
                    }
                }
            }
            
            // 执行闪电视觉效果
            this.visualEffects.executeLightningStrike(x, y);
        });
    }
    
    applyAudioEffects(disaster) {
        // 应用音频效果
        if (!this.gameManager.systems.audioManager) return;
        
        const audioEffects = disaster.config.audioEffects;
        const intensity = disaster.intensity;
        
        // 根据灾害强度调整音效音量
        const volumeMultiplier = Math.min(1.0, 0.5 + intensity * 0.2);
        const originalVolume = this.gameManager.systems.audioManager.getVolume();
        const adjustedVolume = originalVolume * volumeMultiplier;
        
        // 保存原始音量，以便在停止时恢复
        disaster.originalAudioVolume = originalVolume;
        
        // 调整音量
        this.gameManager.systems.audioManager.setVolume(adjustedVolume);
        
        // 播放对应音效
        if (audioEffects.rainSound) {
            this.gameManager.systems.audioManager.startRainSound();
        }
        
        if (audioEffects.thunderSound) {
            // 雷声音效根据强度调整播放频率
            if (Math.random() < 0.3 * intensity) {
                this.gameManager.systems.audioManager.playThunderSound();
            }
        }
        
        if (audioEffects.windSound) {
            this.gameManager.systems.audioManager.startWindSound();
        }
        
        if (audioEffects.snowSound) {
            this.gameManager.systems.audioManager.startSnowSound();
        }
        
        if (audioEffects.sandSound) {
            this.gameManager.systems.audioManager.startSandSound();
        }
        
        if (audioEffects.heatHazeSound) {
            this.gameManager.systems.audioManager.startHeatHazeSound();
        }
        
        if (audioEffects.tornadoSound) {
            // 添加龙卷风音效
            if (this.gameManager.systems.audioManager.startTornadoSound) {
                this.gameManager.systems.audioManager.startTornadoSound();
            }
        }
        
        if (audioEffects.freezeSound) {
            // 添加冻结音效
            if (this.gameManager.systems.audioManager.playFreezeSound) {
                this.gameManager.systems.audioManager.playFreezeSound();
            }
        }
        
        if (audioEffects.eruptionSound) {
            // 添加岩浆爆发音效
            if (this.gameManager.systems.audioManager.playEruptionSound) {
                this.gameManager.systems.audioManager.playEruptionSound();
            }
        }
    }
    
    stopAudioEffects(disaster) {
        console.log(`停止灾害音效: ${disaster.config.name}`);
        
        // 停止音频效果
        if (!this.gameManager.systems.audioManager) {
            console.log('audioManager 不存在');
            return;
        }
        
        // 恢复原始音量
        if (disaster.originalAudioVolume !== undefined) {
            this.gameManager.systems.audioManager.setVolume(disaster.originalAudioVolume);
        }
        
        this.gameManager.systems.audioManager.stopWeatherSounds();
        console.log('天气音效已停止');
    }
    
    /**
     * 检查是否需要发布灾害预警
     */
    checkDisasterWarnings() {
        // 检查是否接近灾害生成时间
        const timeUntilNextDisaster = this.currentSpawnInterval - this.disasterTimer;
        
        // 如果距离下次灾害生成还有10-15秒，发布预警
        if (timeUntilNextDisaster <= 15 && timeUntilNextDisaster >= 10) {
            // 检查是否已经有活跃的预警
            const hasActiveWarning = this.warningSystem.activeWarnings.some(warning => 
                warning.type === 'disaster_warning' && warning.timeRemaining > 0
            );
            
            if (!hasActiveWarning) {
                // 预测下次可能的灾害类型
                const possibleDisasters = Object.keys(this.disasterTypes);
                const predictedDisasterType = possibleDisasters[Math.floor(Math.random() * possibleDisasters.length)];
                const predictedDisaster = this.disasterTypes[predictedDisasterType];
                
                // 发布预警
                this.issueDisasterWarning(predictedDisasterType, predictedDisaster);
            }
        }
    }
    
    /**
     * 发布灾害预警
     * @param {string} disasterType - 灾害类型
     * @param {Object} disasterConfig - 灾害配置
     */
    issueDisasterWarning(disasterType, disasterConfig) {
        // 创建预警
        const warning = {
            id: Date.now(),
            type: 'disaster_warning',
            disasterType: disasterType,
            disasterName: disasterConfig.name,
            timeRemaining: this.warningSystem.warningDuration,
            severity: disasterConfig.difficulty,
            description: disasterConfig.description
        };
        
        // 添加到活跃预警列表
        this.warningSystem.activeWarnings.push(warning);
        
        // 显示预警通知
        if (this.gameManager.systems.notificationManager) {
            const warningColors = {
                1: '#3498db', // 低难度
                2: '#f39c12', // 中等难度
                3: '#e74c3c', // 高难度
                4: '#c0392b', // 极高难度
                5: '#8e44ad'  // 最高难度
            };
            
            const color = warningColors[Math.floor(warning.severity)] || '#95a5a6';
            
            this.gameManager.systems.notificationManager.showNotification(
                `⚠️  灾害预警: ${warning.disasterName}即将来临！`,
                color,
                'warning',
                5
            );
        }
        
        // 这里可以添加预警音频效果
        console.log(`发布灾害预警: ${warning.disasterName}`);
    }
    
    /**
     * 更新活跃预警
     * @param {number} deltaTime - 时间增量（秒）
     */
    updateWarnings(deltaTime) {
        // 更新预警时间
        for (let i = this.warningSystem.activeWarnings.length - 1; i >= 0; i--) {
            const warning = this.warningSystem.activeWarnings[i];
            warning.timeRemaining -= deltaTime;
            
            // 移除过期预警
            if (warning.timeRemaining <= 0) {
                this.warningSystem.activeWarnings.splice(i, 1);
            }
        }
    }
    
    /**
     * 渲染灾害预警指示器
     */
    renderWarningIndicators() {
        // 检查是否有活跃的预警
        if (this.warningSystem.activeWarnings.length === 0) return;
        
        // 这里可以添加预警指示器的渲染代码
        // 例如在游戏界面顶部显示预警条
    }
    
    showDisasterNotification(disaster) {
        // 触发闪屏视觉效果
        this.triggerScreenFlash(disaster);
        
        // 显示详细的灾害提醒信息
        if (this.gameManager.systems.notificationManager) {
            // 构建灾害提醒信息
            const disasterInfo = this.getDisasterAlertInfo(disaster);
            
            // 显示长时间通知（5-8秒）
            this.showLongNotification(
                disasterInfo.message,
                this.getDisasterColor(disaster.type),
                'disaster',
                3 // 高优先级
            );
        }
    }
    
    /**
     * 触发闪屏视觉效果
     * @param {Object} disaster - 灾害对象
     */
    triggerScreenFlash(disaster) {
        if (!this.gameManager.systems.renderer) return;
        
        const ctx = this.gameManager.systems.renderer.ctx;
        const flashCount = 3; // 闪烁次数
        const flashDuration = 0.4; // 每次闪烁持续时间（秒）
        
        // 根据灾害类型获取闪屏颜色
        const flashColor = this.getDisasterFlashColor(disaster.type);
        
        // 执行闪屏效果
        for (let i = 0; i < flashCount; i++) {
            setTimeout(() => {
                // 显示闪屏
                ctx.save();
                ctx.fillStyle = flashColor;
                ctx.globalAlpha = 0.3; // 低透明度，不影响操作
                ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();
                
                // 0.3秒后清除闪屏
                setTimeout(() => {
                    // 闪屏会被下一帧的渲染自动清除
                }, 300);
            }, i * flashDuration * 1000);
        }
    }
    
    /**
     * 获取灾害闪屏颜色
     * @param {string} disasterType - 灾害类型
     * @returns {string} 闪屏颜色
     */
    getDisasterFlashColor(disasterType) {
        const flashColors = {
            rainstorm: 'rgba(52, 152, 219, 0.3)',
            blizzard: 'rgba(236, 240, 241, 0.3)',
            sandstorm: 'rgba(243, 156, 18, 0.3)',
            thunderstorm: 'rgba(241, 196, 15, 0.3)',
            heatwave: 'rgba(230, 126, 34, 0.3)',
            tornado: 'rgba(149, 165, 166, 0.3)',
            heavySnowstorm: 'rgba(189, 195, 199, 0.3)',
            magmaEruption: 'rgba(231, 76, 60, 0.3)'
        };
        
        return flashColors[disasterType] || 'rgba(255, 255, 255, 0.3)';
    }
    
    /**
     * 获取灾害警报信息
     * @param {Object} disaster - 灾害对象
     * @returns {Object} 灾害警报信息
     */
    getDisasterAlertInfo(disaster) {
        const disasterType = disaster.type;
        const intensity = disaster.intensity;
        
        // 确定预警级别
        let alertLevel;
        if (intensity < 2) {
            alertLevel = '轻度';
        } else if (intensity < 3) {
            alertLevel = '中度';
        } else if (intensity < 4) {
            alertLevel = '重度';
        } else {
            alertLevel = '极度';
        }
        
        // 获取应对建议
        const recommendations = this.getDisasterRecommendations(disasterType);
        
        // 构建消息
        const message = `
⚠️ ${disaster.config.name}来袭！

预警级别: ${alertLevel}

灾害描述: ${disaster.config.description}

应对建议:
${recommendations}

持续时间: ${disaster.duration}秒
`;
        
        return {
            message,
            alertLevel,
            recommendations
        };
    }
    
    /**
     * 获取灾害应对建议
     * @param {string} disasterType - 灾害类型
     * @returns {string} 应对建议
     */
    getDisasterRecommendations(disasterType) {
        const recommendations = {
            rainstorm: '• 移动速度会减慢，注意调整移动策略\n• 能量消耗增加，合理使用能量\n• 食物更加丰富，趁机收集',
            blizzard: '• 视野严重受限，小心敌人\n• 移动速度大幅降低，避免危险区域\n• 能量消耗加快，及时补充',
            sandstorm: '• 视野模糊，保持警惕\n• 移动困难，选择安全路径\n• 注意沙尘暴带来的稀有资源',
            thunderstorm: '• 闪电可能造成伤害，注意躲避\n• 能量消耗加快，节约使用\n• 寻找掩护，减少被闪电击中的风险',
            heatwave: '• 能量消耗急剧增加，需要更多食物\n• 保持移动，寻找水源\n• 合理规划能量使用',
            tornado: '• 远离龙卷风中心，避免被吸附\n• 移动速度大幅降低，提前规避\n• 注意龙卷风的移动路径',
            heavySnowstorm: '• 可能被冻住无法行动，注意避开\n• 视野几乎完全受阻，小心碰撞\n• 移动速度极低，选择安全区域',
            magmaEruption: '• 远离岩浆爆发区域，避免伤害\n• 注意爆发范围，及时躲避\n• 移动速度降低，提前规划路线'
        };
        
        return recommendations[disasterType] || '• 注意观察灾害影响\n• 调整移动和能量使用策略\n• 保持警惕，确保安全';
    }
    
    /**
     * 显示长时间通知
     * @param {string} message - 通知消息
     * @param {string} color - 通知颜色
     * @param {string} type - 通知类型
     * @param {number} priority - 优先级
     */
    showLongNotification(message, color, type, priority) {
        if (!this.gameManager.systems.notificationManager) return;
        
        // 显示长时间通知（6秒）
        this.gameManager.systems.notificationManager.showNotification(
            message,
            color,
            type,
            priority,
            null, // soundType
            6000 // 6秒持续时间
        );
    }
    
    showDisasterEndNotification(disaster) {
        // 显示灾害结束通知
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `🌤️ ${disaster.config.name}结束，环境恢复正常`,
                '#27ae60',
                'info'
            );
        }
    }
    
    getDisasterColor(disasterType) {
        // 获取灾害对应的颜色
        const colors = {
            rainstorm: '#3498db',
            blizzard: '#ecf0f1',
            sandstorm: '#f39c12',
            thunderstorm: '#8e44ad',
            heatwave: '#e67e22',
            tornado: '#95a5a6',
            heavySnowstorm: '#bdc3c7',
            magmaEruption: '#e74c3c'
        };
        
        return colors[disasterType] || '#95a5a6';
    }
    
    /**
     * 根据温度获取岩浆颜色
     * @param {number} temperature - 温度（摄氏度，范围500-1500）
     * @returns {string} 岩浆颜色
     */
    getMagmaColor(temperature) {
        // 温度范围：500°C（暗红）到 1500°C（亮黄白）
        const temp = Math.max(500, Math.min(1500, temperature));
        const ratio = (temp - 500) / 1000;
        
        // 颜色渐变：暗红 -> 红 -> 橙 -> 黄 -> 白
        if (ratio < 0.25) {
            // 暗红到红
            const t = ratio / 0.25;
            const r = Math.floor(139 + t * (231 - 139));
            const g = Math.floor(0 + t * 76);
            const b = Math.floor(0 + t * 60);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (ratio < 0.5) {
            // 红到橙
            const t = (ratio - 0.25) / 0.25;
            const r = Math.floor(231 + t * (255 - 231));
            const g = Math.floor(76 + t * (140 - 76));
            const b = Math.floor(60 - t * 60);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (ratio < 0.75) {
            // 橙到黄
            const t = (ratio - 0.5) / 0.25;
            const r = 255;
            const g = Math.floor(140 + t * (215 - 140));
            const b = Math.floor(0 + t * 0);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            // 黄到白
            const t = (ratio - 0.75) / 0.25;
            const r = 255;
            const g = Math.floor(215 + t * (255 - 215));
            const b = Math.floor(0 + t * 200);
            return `rgb(${r}, ${g}, ${b})`;
        }
    }
    
    increaseDifficulty() {
        // 增加游戏难度
        // 调整灾害间隔减少速率
        this.minSpawnInterval = Math.max(15, this.minSpawnInterval - 1); // 最小保持15秒
        this.maxSpawnInterval = Math.max(25, this.maxSpawnInterval - 1.5); // 最大保持25秒
        
        // 增加灾害强度，但保持平衡
        Object.values(this.disasterTypes).forEach(config => {
            // 灾害强度增长
            config.intensity.max *= 1.05; // 更快的强度增长
            
            // 移动速度影响增长，但保持下限
            config.gameplayEffects.movementSpeedMultiplier = Math.max(0.5, config.gameplayEffects.movementSpeedMultiplier * 0.98);
            
            // 能量消耗影响增长，但保持合理范围
            config.gameplayEffects.energyConsumptionMultiplier *= 1.03;
            config.gameplayEffects.energyConsumptionMultiplier = Math.min(config.gameplayEffects.energyConsumptionMultiplier, 2.5);
            
            // 能见度影响增长
            config.gameplayEffects.visibilityReduction *= 1.03;
            config.gameplayEffects.visibilityReduction = Math.min(config.gameplayEffects.visibilityReduction, 0.7);
        });
        
        // 增加特殊事件触发概率
        this.specialEventChance = Math.min(0.7, (this.specialEventChance || 0.3) + 0.03); // 更高的特殊事件概率
        
        console.log('天气灾害难度增加，当前特殊事件触发概率:', this.specialEventChance);
    }
    
    getActiveDisasters() {
        // 获取当前活跃的灾害
        return this.activeDisasters.filter(disaster => disaster.active);
    }
    
    hasActiveDisaster() {
        // 检查是否有活跃的灾害
        return this.activeDisasters.length > 0;
    }
    
    getDisasterEffects() {
        // 获取当前灾害效果的总和
        let combinedEffects = {
            movementSpeedMultiplier: 1,
            energyConsumptionMultiplier: 1,
            foodSpawnRateMultiplier: 1,
            visibilityReduction: 0
        };
        
        this.activeDisasters.forEach(disaster => {
            const effects = disaster.config.gameplayEffects;
            const intensityMultiplier = (disaster.intensity - 1) * 0.2 + 1;
            
            // 检查玩家是否拥有对应灾害的防护道具
            const hasProtection = this.checkWeatherProtection(disaster.type);
            const protectionMultiplier = hasProtection ? 0.7 : 1;
            
            if (effects.movementSpeedMultiplier) {
                let speedMultiplier = effects.movementSpeedMultiplier * intensityMultiplier;
                
                // 如果有防护道具，减轻速度影响
                if (hasProtection) {
                    speedMultiplier = (speedMultiplier - 1) * protectionMultiplier + 1;
                }
                
                combinedEffects.movementSpeedMultiplier *= speedMultiplier;
            }
            
            if (effects.energyConsumptionMultiplier) {
                let energyMultiplier = effects.energyConsumptionMultiplier * intensityMultiplier;
                
                // 如果有防护道具，减轻能量消耗
                if (hasProtection) {
                    energyMultiplier = (energyMultiplier - 1) * protectionMultiplier + 1;
                }
                
                combinedEffects.energyConsumptionMultiplier *= energyMultiplier;
            }
            
            if (effects.foodSpawnRateMultiplier) {
                combinedEffects.foodSpawnRateMultiplier *= effects.foodSpawnRateMultiplier * intensityMultiplier;
            }
            
            if (effects.visibilityReduction) {
                let visibilityReduction = effects.visibilityReduction * intensityMultiplier * 0.5;
                
                // 如果有防护道具，减轻能见度影响
                if (hasProtection) {
                    visibilityReduction *= protectionMultiplier;
                }
                
                combinedEffects.visibilityReduction += visibilityReduction;
            }
        });
        
        // 限制效果范围
        combinedEffects.visibilityReduction = Math.min(combinedEffects.visibilityReduction, 0.8);
        
        return combinedEffects;
    }
    
    reset() {
        // 重置天气灾害系统
        // 结束所有活跃灾害
        this.activeDisasters.forEach(disaster => {
            this.endDisaster(disaster);
        });
        
        this.activeDisasters = [];
        this.disasterTimer = 0;
        this.gameProgress = 0;
        this.difficultyTimer = 0;
        
        // 重新初始化生成间隔
        this.currentSpawnInterval = this.getRandomSpawnInterval();
        console.log('WeatherDisasterManager reset with spawn interval:', this.currentSpawnInterval);
        
        // 重置视觉效果
        this.visualEffects.reset();
    }
}

class WeatherVisualEffects {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.activeEffects = [];
        this.particleSystems = {};
        
        // 性能优化系统
        this.performance = {
            fps: 60,
            frameTime: 16.67,
            averageFrameTime: 16.67,
            lowPerformanceThreshold: 30, // 低性能阈值
            mediumPerformanceThreshold: 45, // 中等性能阈值
            performanceLevel: 'high', // high, medium, low
            lastPerformanceCheck: Date.now(),
            performanceCheckInterval: 2000, // 每2秒检查一次性能
            frameCount: 0,
            lastFrameTime: Date.now()
        };
        
        // 特效过渡系统
        this.transitions = {};
        
        // 闪电预警系统
        this.lightningWarnings = [];
        this.warningDuration = 1.8; // 预警持续时间（秒）
        this.warningRadius = 60; // 预警圆圈半径
        
        // 三维灾害视觉效果管理器
        if (window.DisasterVisualManager) {
            this.disasterVisualManager = null; // 延迟初始化
        }
    }
    
    /**
     * 初始化灾害视觉效果管理器
     */
    initDisasterVisualManager() {
        if (!this.disasterVisualManager && window.DisasterVisualManager && this.gameManager.systems.renderer) {
            this.disasterVisualManager = new window.DisasterVisualManager(
                this.gameManager.systems.renderer.ctx
            );
        }
        return this.disasterVisualManager;
    }
    
    update(deltaTime) {
        // 更新性能监控
        this.updatePerformanceMonitor(deltaTime);
        
        // 更新特效过渡
        this.updateTransitions(deltaTime);
        
        // 更新闪电预警
        this.updateLightningWarnings(deltaTime);
        
        // 根据性能水平调整特效质量
        const qualityMultiplier = this.getPerformanceQualityMultiplier();
        
        // 更新视觉效果
        this.updateParticleSystems(deltaTime, qualityMultiplier);
        this.updateActiveEffects(deltaTime, qualityMultiplier);
        
        // 更新三维灾害视觉效果
        this.updateDisasterVisuals(deltaTime, qualityMultiplier);
    }
    
    /**
     * 更新三维灾害视觉效果
     */
    updateDisasterVisuals(deltaTime, qualityMultiplier) {
        if (!this.disasterVisualManager) {
            this.initDisasterVisualManager();
        }
        
        if (this.disasterVisualManager && this.activeEffects.length > 0) {
            // 渲染所有活跃的灾害效果
            this.activeEffects.forEach(effect => {
                if (this.shouldRenderDisaster3D(effect.type)) {
                    this.disasterVisualManager.renderDisaster(effect, deltaTime);
                }
            });
        }
    }
    
    /**
     * 判断是否应该渲染三维灾害效果
     */
    shouldRenderDisaster3D(type) {
        const supportedTypes = ['tornado', 'magmaEruption', 'thunderstorm', 'sandstorm', 'blizzard'];
        return supportedTypes.includes(type);
    }
    
    /**
     * 更新性能监控
     * @param {number} deltaTime - 时间增量
     */
    updatePerformanceMonitor(deltaTime) {
        const now = Date.now();
        this.performance.frameCount++;
        this.performance.frameTime = deltaTime * 1000;
        
        // 平滑计算平均帧时间
        this.performance.averageFrameTime = (
            this.performance.averageFrameTime * 0.9 + 
            this.performance.frameTime * 0.1
        );
        
        this.performance.fps = 1000 / this.performance.averageFrameTime;
        
        // 定期检查性能水平
        if (now - this.performance.lastPerformanceCheck >= this.performance.performanceCheckInterval) {
            this.updatePerformanceLevel();
            this.performance.lastPerformanceCheck = now;
            this.performance.frameCount = 0;
        }
    }
    
    /**
     * 更新性能水平
     */
    updatePerformanceLevel() {
        const fps = this.performance.fps;
        
        if (fps < this.performance.lowPerformanceThreshold) {
            this.performance.performanceLevel = 'low';
        } else if (fps < this.performance.mediumPerformanceThreshold) {
            this.performance.performanceLevel = 'medium';
        } else {
            this.performance.performanceLevel = 'high';
        }
        
        console.log(`性能水平更新: ${this.performance.performanceLevel}, FPS: ${fps.toFixed(1)}`);
    }
    
    /**
     * 获取性能质量乘数
     * @returns {number} 质量乘数
     */
    getPerformanceQualityMultiplier() {
        switch (this.performance.performanceLevel) {
            case 'low':
                return 0.5;
            case 'medium':
                return 0.75;
            case 'high':
            default:
                return 1.0;
        }
    }
    
    /**
     * 更新特效过渡
     * @param {number} deltaTime - 时间增量
     */
    updateTransitions(deltaTime) {
        // 清理完成的过渡
        Object.keys(this.transitions).forEach(key => {
            const transition = this.transitions[key];
            transition.progress += deltaTime / transition.duration;
            
            if (transition.progress >= 1) {
                transition.onComplete && transition.onComplete();
                delete this.transitions[key];
            }
        });
    }
    
    /**
     * 创建特效过渡
     * @param {string} key - 过渡键
     * @param {number} duration - 过渡持续时间
     * @param {Function} onComplete - 完成回调
     */
    createTransition(key, duration, onComplete) {
        this.transitions[key] = {
            progress: 0,
            duration: duration,
            onComplete: onComplete
        };
    }
    
    startDisasterEffects(disaster) {
        // 开始灾害视觉效果
        const effects = {
            type: disaster.type,
            intensity: disaster.intensity,
            config: disaster.config.visualEffects,
            active: true
        };
        
        this.activeEffects.push(effects);
        
        // 启动粒子系统
        this.startParticleSystem(disaster);
    }
    
    stopDisasterEffects(disaster) {
        // 停止灾害视觉效果
        this.activeEffects = this.activeEffects.filter(effect => effect.type !== disaster.type);
        
        // 停止粒子系统
        this.stopParticleSystem(disaster.type);
    }
    
    startParticleSystem(disaster) {
        // 启动粒子系统
        const config = disaster.config.visualEffects;
        
        switch (disaster.type) {
            case 'rainstorm':
                this.createRainParticles(disaster);
                break;
            case 'blizzard':
                this.createSnowParticles(disaster);
                break;
            case 'sandstorm':
                this.createSandParticles(disaster);
                break;
            case 'thunderstorm':
                this.createRainParticles(disaster);
                break;
            case 'heatwave':
                this.createHeatHazeEffect(disaster);
                break;
            case 'tornado':
                this.createTornadoParticles(disaster);
                break;
            case 'heavySnowstorm':
                this.createHeavySnowstormParticles(disaster);
                break;
            case 'magmaEruption':
                this.createMagmaEruptionParticles(disaster);
                break;
        }
    }
    
    createTornadoParticles(disaster) {
        // 创建龙卷风粒子 - 优化版
        this.particleSystems[disaster.type] = {
            particles: [],
            spawnRate: 40, // 原30，提升33%
            intensity: disaster.intensity,
            center: disaster.tornadoCenter || { x: 400, y: 300 }
        };
    }
    
    createHeavySnowstormParticles(disaster) {
        // 创建大风雪粒子 - 优化版
        this.particleSystems[disaster.type] = {
            particles: [],
            spawnRate: 50, // 原40，提升25%
            intensity: disaster.intensity
        };
    }
    
    createMagmaEruptionParticles(disaster) {
        // 创建岩浆爆发粒子系统 - 增强版
        this.particleSystems[disaster.type] = {
            particles: [],
            spawnRate: 45, // 原35，提升29%
            intensity: disaster.intensity,
            center: disaster.eruptionCenter || { x: 400, y: 300 },
            // 岩浆流动系统
            lavaFlows: [],
            maxLavaFlows: 10, // 原8，提升25%
            // 烟雾系统
            smokeParticles: [],
            maxSmokeParticles: 40, // 原30，提升33%
            // 火星系统
            sparkParticles: [],
            maxSparkParticles: 60, // 原50，提升20%
            // 蒸汽系统
            steamParticles: [],
            maxSteamParticles: 30, // 原20，提升50%
            // 时间追踪
            eruptionTime: 0,
            lastFlowSpawn: 0
        };
    }
    
    createRainParticles(disaster) {
        // 创建雨水粒子 - 优化版
        this.particleSystems[disaster.type] = {
            particles: [],
            spawnRate: 28, // 原20，提升40%
            intensity: disaster.intensity
        };
    }
    
    createSnowParticles(disaster) {
        // 创建雪花粒子 - 优化版
        this.particleSystems[disaster.type] = {
            particles: [],
            spawnRate: 22, // 原15，提升47%
            intensity: disaster.intensity
        };
    }
    
    createSandParticles(disaster) {
        // 创建沙尘粒子 - 优化版
        this.particleSystems[disaster.type] = {
            particles: [],
            spawnRate: 35, // 原25，提升40%
            intensity: disaster.intensity
        };
    }
    
    createHeatHazeEffect(disaster) {
        // 创建热浪效果
        this.particleSystems[disaster.type] = {
            active: true,
            intensity: disaster.intensity
        };
    }
    
    updateParticleSystems(deltaTime, qualityMultiplier = 1.0) {
        // 更新粒子系统
        Object.entries(this.particleSystems).forEach(([type, system]) => {
            if (system.particles) {
                // 设置粒子系统限制（优化后：提升粒子数量以增强视觉效果）
                const baseParticleLimits = {
                    rainstorm: 500,      // 原350，提升43%
                    blizzard: 450,       // 原300，提升50%
                    sandstorm: 400,      // 原250，提升60%
                    tornado: 300,        // 原200，提升50%
                    heavySnowstorm: 600, // 原400，提升50%
                    magmaEruption: 400   // 原250，提升60%
                };
                
                // 根据性能水平调整粒子数量
                const adjustedParticleLimits = {
                    rainstorm: Math.max(150, Math.floor(baseParticleLimits.rainstorm * qualityMultiplier)),
                    blizzard: Math.max(120, Math.floor(baseParticleLimits.blizzard * qualityMultiplier)),
                    sandstorm: Math.max(100, Math.floor(baseParticleLimits.sandstorm * qualityMultiplier)),
                    tornado: Math.max(80, Math.floor(baseParticleLimits.tornado * qualityMultiplier)),
                    heavySnowstorm: Math.max(180, Math.floor(baseParticleLimits.heavySnowstorm * qualityMultiplier)),
                    magmaEruption: Math.max(120, Math.floor(baseParticleLimits.magmaEruption * qualityMultiplier))
                };
                
                const maxParticles = adjustedParticleLimits[type] || Math.max(50, Math.floor(150 * qualityMultiplier));
                
                // 更新粒子
                for (let i = system.particles.length - 1; i >= 0; i--) {
                    const particle = system.particles[i];
                    
                    // 保存粒子的前一位置
                    const prevX = particle.x;
                    const prevY = particle.y;
                    
                    // 根据灾害类型添加不同的运动效果
                    switch (type) {
                        case 'rainstorm':
                            // 雨滴运动 - 加速下落
                            particle.speed += 0.2 * deltaTime;
                            particle.y += particle.speed * deltaTime * 60;
                            particle.x += particle.drift * Math.sin(Date.now() * 0.002) * deltaTime * 30;
                            break;
                        
                        case 'blizzard':
                            // 雪花运动 - 飘动效果
                            particle.speed += 0.1 * deltaTime;
                            particle.y += particle.speed * deltaTime * 60;
                            particle.x += particle.drift * Math.sin(Date.now() * 0.001 + i) * deltaTime * 40;
                            break;
                        
                        case 'sandstorm':
                            // 沙尘运动 - 湍流效果
                            particle.speed += 0.15 * deltaTime;
                            particle.y += particle.speed * deltaTime * 60;
                            particle.x += particle.drift * Math.sin(Date.now() * 0.003 + i * 0.1) * deltaTime * 50;
                            break;
                        
                        case 'tornado':
                            // 龙卷风粒子 - 螺旋运动
                            if (system.center) {
                                const angle = Math.atan2(particle.y - system.center.y, particle.x - system.center.x);
                                const distance = Math.sqrt(
                                    Math.pow(particle.x - system.center.x, 2) + 
                                    Math.pow(particle.y - system.center.y, 2)
                                );
                                
                                // 向中心螺旋运动
                                const spiralSpeed = 50 * deltaTime;
                                const rotateSpeed = 0.5 * deltaTime;
                                
                                particle.x += (Math.cos(angle) * spiralSpeed) + (Math.sin(angle) * distance * rotateSpeed);
                                particle.y += (Math.sin(angle) * spiralSpeed) - (Math.cos(angle) * distance * rotateSpeed);
                            }
                            break;
                        
                        case 'heavySnowstorm':
                            // 大风雪粒子 - 强风效果
                            particle.speed += 0.2 * deltaTime;
                            particle.y += particle.speed * deltaTime * 60;
                            particle.x += particle.drift * Math.sin(Date.now() * 0.002 + i * 0.05) * deltaTime * 60;
                            break;
                        
                        case 'magmaEruption':
                            // 岩浆爆发粒子 - 增强的抛物运动
                            if (system.center) {
                                // 从中心向外喷发
                                const upwardSpeed = (particle.speed - 10) * deltaTime * 60;
                                particle.y -= upwardSpeed;
                                particle.x += particle.drift * deltaTime * 60;
                                
                                // 模拟重力
                                particle.speed -= 2.5 * deltaTime;
                                
                                // 更新温度（冷却效果）
                                if (particle.temperature !== undefined) {
                                    particle.temperature -= deltaTime * 0.5;
                                }
                                
                                // 更新粘度（影响运动）
                                if (particle.viscosity !== undefined) {
                                    particle.viscosity = Math.min(1, (particle.viscosity || 0) + deltaTime * 0.3);
                                }
                            }
                            break;
                        
                        default:
                            // 默认运动
                            particle.y += particle.speed * deltaTime * 60;
                            particle.x += particle.drift * deltaTime * 30;
                    }
                    
                    // 检测与地面的碰撞
                    if (this.checkGroundCollision(particle)) {
                        this.handleGroundCollision(particle, type);
                    }
                    
                    // 检测与游戏对象的碰撞
                    if (this.checkGameObjectCollision(particle)) {
                        this.handleGameObjectCollision(particle, type);
                    }
                    
                    particle.lifetime -= deltaTime;
                    
                    // 检查粒子是否需要移除
                    if (particle.lifetime <= 0 || particle.y > 800 || particle.x < -50 || particle.x > 1050) {
                        system.particles.splice(i, 1);
                    }
                }
                
                // 生成新粒子（如果未达到限制）
                if (system.particles.length < maxParticles) {
                    const spawnRateMultiplier = Math.max(0.5, 1 - (system.particles.length / maxParticles));
                    const spawnCount = Math.floor(system.spawnRate * deltaTime * system.intensity * spawnRateMultiplier * qualityMultiplier);
                    
                    // 根据性能水平调整每帧生成的粒子数量
                    const baseMaxSpawnPerFrame = 15; // 增加每帧生成的粒子数量以提升效果密度
                    const adjustedMaxSpawnPerFrame = Math.max(3, Math.floor(baseMaxSpawnPerFrame * qualityMultiplier));
                    const safeSpawnCount = Math.min(spawnCount, adjustedMaxSpawnPerFrame);
                    
                    for (let i = 0; i < safeSpawnCount; i++) {
                        this.spawnParticle(type, system, qualityMultiplier);
                    }
                }
                
                // 渲染粒子
                this.renderParticles(type, system, qualityMultiplier);
            }
        });
    }
    
    spawnParticle(type, system, qualityMultiplier = 1.0) {
        // 生成粒子 - 优化版（增大粒子尺寸）
        const particle = {
            x: Math.random() * 1000,
            y: -20,
            size: (Math.random() * 3 + 1) * qualityMultiplier,
            speed: 0,
            drift: 0,
            lifetime: 0,
            color: '',
            detail: qualityMultiplier > 0.7
        };
        
        switch (type) {
            case 'rainstorm':
                // 暴雨粒子：1.5-5px（原1-4px）
                particle.size = (Math.random() * 3.5 + 1.5) * qualityMultiplier;
                particle.speed = Math.random() * 15 + 10;
                particle.drift = (Math.random() - 0.5) * 2;
                particle.lifetime = Math.random() * 2 + 1;
                particle.color = '#3498db';
                break;
            case 'blizzard':
                // 暴风雪粒子：2-8px（原2-6px）
                particle.size = (Math.random() * 6 + 2) * qualityMultiplier;
                particle.speed = Math.random() * 8 + 5;
                particle.drift = (Math.random() - 0.5) * 3;
                particle.lifetime = Math.random() * 3 + 2;
                particle.color = '#ecf0f1';
                break;
            case 'sandstorm':
                // 沙尘暴粒子：1.5-4px（原1-3px）
                particle.size = (Math.random() * 2.5 + 1.5) * qualityMultiplier;
                particle.speed = Math.random() * 10 + 7;
                particle.drift = (Math.random() - 0.5) * 4;
                particle.lifetime = Math.random() * 2.5 + 1.5;
                particle.color = '#f39c12';
                break;
            case 'tornado':
                // 龙卷风粒子：3-7px（原2-5px）
                particle.size = (Math.random() * 4 + 3) * qualityMultiplier;
                if (system.center) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 200;
                    particle.x = system.center.x + Math.cos(angle) * distance;
                    particle.y = system.center.y + Math.sin(angle) * distance;
                }
                particle.speed = Math.random() * 5 + 3;
                particle.drift = (Math.random() - 0.5) * 2;
                particle.lifetime = Math.random() * 3 + 2;
                particle.color = '#95a5a6';
                break;
            case 'heavySnowstorm':
                // 大风雪粒子：2.5-7px（原2-5px）
                particle.size = (Math.random() * 4.5 + 2.5) * qualityMultiplier;
                particle.speed = Math.random() * 10 + 8;
                particle.drift = (Math.random() - 0.5) * 5;
                particle.lifetime = Math.random() * 4 + 3;
                particle.color = '#bdc3c7';
                break;
            case 'magmaEruption':
                // 岩浆爆发粒子：5-20px（已优化）
                if (system.center) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * 30;
                    particle.x = system.center.x + Math.cos(angle) * distance;
                    particle.y = system.center.y + Math.sin(angle) * distance;
                }
                particle.temperature = Math.random() * 500 + 1000;
                particle.particleType = Math.random() < 0.7 ? 0 : (Math.random() < 0.8 ? 1 : 2);
                particle.size = particle.particleType === 2 ? Math.random() * 15 + 10 : 
                               (particle.particleType === 1 ? Math.random() * 4 + 2 : Math.random() * 8 + 5);
                particle.speed = Math.random() * 15 + 10;
                particle.drift = (Math.random() - 0.5) * 8;
                particle.lifetime = Math.random() * 3 + 2;
                particle.color = this.getMagmaColor(particle.temperature);
                particle.viscosity = 0;
                particle.rotation = Math.random() * Math.PI * 2;
                particle.rotationSpeed = (Math.random() - 0.5) * 0.5;
                break;
        }
        
        system.particles.push(particle);
    }
    
    renderParticles(type, system, qualityMultiplier = 1.0) {
        // 渲染粒子
        if (!this.gameManager.systems.renderer || system.particles.length === 0) return;
        
        const ctx = this.gameManager.systems.renderer.ctx;
        
        // 批量渲染粒子 - 减少canvas save/restore操作
        ctx.save();
        
        // 按类型分组渲染
        const particlesByType = {
            rainstorm: [],
            blizzard: [],
            sandstorm: [],
            thunderstorm: [],
            heatwave: [],
            tornado: [],
            heavySnowstorm: [],
            magmaEruption: []
        };
        
        // 分组粒子
        if (system.particles && Array.isArray(system.particles)) {
            system.particles.forEach(particle => {
                if (particlesByType[type]) {
                    particlesByType[type].push(particle);
                }
            });
        }
        
        // 渲染粒子
        if (particlesByType[type] && particlesByType[type].length > 0) {
            particlesByType[type].forEach(particle => {
                // 计算粒子生命周期的比例
                const lifeRatio = Math.min(1, particle.lifetime / 3);
                
                // 根据性能水平调整渲染细节
                const renderDetailed = qualityMultiplier > 0.7 && particle.detail;
                
                switch (type) {
                    case 'rainstorm':
                        // 渲染雨滴 - 添加渐变效果
                        const rainGradient = ctx.createLinearGradient(particle.x, particle.y, particle.x, particle.y + particle.size * 3);
                        rainGradient.addColorStop(0, particle.color + '80');
                        rainGradient.addColorStop(1, particle.color + '20');
                        ctx.fillStyle = rainGradient;
                        ctx.globalAlpha = lifeRatio * 0.8;
                        ctx.fillRect(particle.x, particle.y, 2, particle.size * 3);
                        
                        // 添加雨滴反光效果（仅在高性能下）
                        if (renderDetailed) {
                            ctx.fillStyle = '#ffffff20';
                            ctx.fillRect(particle.x + 0.5, particle.y, 1, particle.size * 2);
                        }
                        break;
                    
                    case 'blizzard':
                        // 渲染雪花 - 添加发光效果
                        if (renderDetailed) {
                            ctx.shadowColor = particle.color;
                            ctx.shadowBlur = 10;
                        }
                        ctx.fillStyle = particle.color + '80';
                        ctx.globalAlpha = lifeRatio * 0.9;
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // 添加雪花高光（仅在高性能下）
                        if (renderDetailed) {
                            ctx.fillStyle = '#ffffff40';
                            ctx.beginPath();
                            ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.4, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                    
                    case 'sandstorm':
                        // 渲染沙尘 - 添加颗粒效果
                        ctx.fillStyle = particle.color + '90';
                        ctx.globalAlpha = lifeRatio * 0.7;
                        ctx.fillRect(particle.x, particle.y, particle.size * 2, particle.size);
                        
                        // 添加沙尘发光效果（仅在高性能下）
                        if (renderDetailed) {
                            ctx.shadowColor = '#f39c12';
                            ctx.shadowBlur = 5;
                            ctx.fillRect(particle.x + 0.5, particle.y + 0.5, particle.size, particle.size * 0.8);
                        }
                        break;
                    
                    case 'tornado':
                        // 渲染龙卷风粒子 - 添加旋转效果
                        if (renderDetailed) {
                            ctx.save();
                            ctx.translate(particle.x, particle.y);
                            ctx.rotate(Date.now() * 0.001);
                            ctx.fillStyle = particle.color + '70';
                            ctx.globalAlpha = lifeRatio * 0.6;
                            ctx.beginPath();
                            ctx.arc(0, 0, particle.size * 1.5, 0, Math.PI * 2);
                            ctx.fill();
                            
                            // 添加龙卷风内部发光
                            ctx.fillStyle = '#ffffff30';
                            ctx.beginPath();
                            ctx.arc(0, 0, particle.size * 0.5, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.restore();
                        } else {
                            // 简化渲染
                            ctx.fillStyle = particle.color + '70';
                            ctx.globalAlpha = lifeRatio * 0.6;
                            ctx.beginPath();
                            ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                    
                    case 'heavySnowstorm':
                        // 渲染大风雪粒子 - 添加密集效果
                        if (renderDetailed) {
                            ctx.shadowColor = particle.color;
                            ctx.shadowBlur = 8;
                        }
                        ctx.fillStyle = particle.color + 'a0';
                        ctx.globalAlpha = lifeRatio * 0.8;
                        ctx.beginPath();
                        ctx.arc(particle.x, particle.y, particle.size * 1.2, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // 添加多层雪花效果（仅在高性能下）
                        if (renderDetailed) {
                            ctx.fillStyle = particle.color + '50';
                            ctx.beginPath();
                            ctx.arc(particle.x + 2, particle.y - 2, particle.size * 0.8, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        break;
                    
                    case 'magmaEruption':
                        // 渲染岩浆爆发粒子 - 增强版
                        const tempRatio = particle.temperature ? (particle.temperature - 500) / 1000 : 0.5;
                        
                        // 根据粒子类型渲染不同效果
                        if (particle.particleType === 1) {
                            // 火星粒子 - 小而亮
                            ctx.fillStyle = particle.color;
                            ctx.globalAlpha = lifeRatio * (0.8 + Math.sin(Date.now() * 0.01) * 0.2);
                            ctx.beginPath();
                            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                            ctx.fill();
                            
                            // 火星拖尾
                            if (renderDetailed) {
                                ctx.strokeStyle = '#ffff00';
                                ctx.lineWidth = 1;
                                ctx.globalAlpha = lifeRatio * 0.5;
                                ctx.beginPath();
                                ctx.moveTo(particle.x, particle.y);
                                ctx.lineTo(particle.x - particle.drift * 2, particle.y + particle.size * 3);
                                ctx.stroke();
                            }
                        } else if (particle.particleType === 2) {
                            // 熔岩块 - 大而不规则
                            ctx.save();
                            ctx.translate(particle.x, particle.y);
                            ctx.rotate(particle.rotation || 0);
                            
                            // 熔岩块渐变
                            const blockGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
                            blockGradient.addColorStop(0, '#ffffff');
                            blockGradient.addColorStop(0.2, '#ffff00');
                            blockGradient.addColorStop(0.5, particle.color);
                            blockGradient.addColorStop(1, '#8b0000');
                            
                            ctx.fillStyle = blockGradient;
                            ctx.globalAlpha = lifeRatio * 0.9;
                            
                            // 不规则形状
                            ctx.beginPath();
                            for (let i = 0; i < 6; i++) {
                                const angle = (i / 6) * Math.PI * 2;
                                const radius = particle.size * (0.7 + Math.sin(angle * 3 + particle.rotation) * 0.3);
                                if (i === 0) {
                                    ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                                } else {
                                    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
                                }
                            }
                            ctx.closePath();
                            ctx.fill();
                            
                            // 发光效果
                            if (renderDetailed) {
                                ctx.shadowColor = '#ff4500';
                                ctx.shadowBlur = 20;
                                ctx.fill();
                            }
                            
                            ctx.restore();
                        } else {
                            // 普通岩浆滴 - 带流动效果
                            // 将rgb颜色转换为rgba格式
                            const colorToRgba = (color, alpha) => {
                                const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                                if (match) {
                                    return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
                                }
                                return color;
                            };
                            
                            if (renderDetailed) {
                                // 外层发光
                                const outerGlow = ctx.createRadialGradient(
                                    particle.x, particle.y, 0,
                                    particle.x, particle.y, particle.size * 2
                                );
                                outerGlow.addColorStop(0, colorToRgba(particle.color, 0.8));
                                outerGlow.addColorStop(0.5, colorToRgba(particle.color, 0.4));
                                outerGlow.addColorStop(1, colorToRgba(particle.color, 0));
                                
                                ctx.fillStyle = outerGlow;
                                ctx.globalAlpha = lifeRatio * 0.6;
                                ctx.beginPath();
                                ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
                                ctx.fill();
                            }
                            
                            // 岩浆核心渐变
                            const magmaGradient = ctx.createRadialGradient(
                                particle.x, particle.y, 0,
                                particle.x, particle.y, particle.size
                            );
                            magmaGradient.addColorStop(0, '#ffffff');
                            magmaGradient.addColorStop(0.1, '#ffffaa');
                            magmaGradient.addColorStop(0.3, '#ff6b00');
                            magmaGradient.addColorStop(0.6, particle.color);
                            magmaGradient.addColorStop(1, '#8b0000');
                            
                            ctx.fillStyle = magmaGradient;
                            ctx.globalAlpha = lifeRatio * 0.9;
                            
                            // 椭圆形岩浆滴（模拟粘稠液体）
                            ctx.beginPath();
                            ctx.ellipse(
                                particle.x, 
                                particle.y, 
                                particle.size * (1 + (particle.viscosity || 0) * 0.3), 
                                particle.size * (1 - (particle.viscosity || 0) * 0.2), 
                                0, 0, Math.PI * 2
                            );
                            ctx.fill();
                            
                            // 表面高光
                            if (renderDetailed) {
                                ctx.fillStyle = 'rgba(255, 255, 200, 0.4)';
                                ctx.beginPath();
                                ctx.ellipse(
                                    particle.x - particle.size * 0.2, 
                                    particle.y - particle.size * 0.2, 
                                    particle.size * 0.3, 
                                    particle.size * 0.2, 
                                    -Math.PI / 4, 0, Math.PI * 2
                                );
                                ctx.fill();
                            }
                        }
                        break;
                }
            });
        }
        
        // 重置阴影效果
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    
    /**
     * 创建闪电预警
     * @param {number} x - 闪电落点X坐标
     * @param {number} y - 闪电落点Y坐标
     * @param {Function} callback - 预警结束后的回调函数
     */
    createLightningWarning(x, y, callback) {
        const warning = {
            x: x,
            y: y,
            radius: this.warningRadius,
            duration: this.warningDuration,
            elapsed: 0,
            phase: 'fadeIn', // fadeIn, hold, fadeOut
            opacity: 0,
            callback: callback,
            id: Date.now() + Math.random()
        };
        
        this.lightningWarnings.push(warning);
        
        // 播放预警音效
        if (this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playSound('thunder');
        }
        
        return warning.id;
    }
    
    /**
     * 更新闪电预警状态
     * @param {number} deltaTime - 时间增量
     */
    updateLightningWarnings(deltaTime) {
        const warningsToRemove = [];
        
        this.lightningWarnings.forEach((warning, index) => {
            warning.elapsed += deltaTime;
            
            const fadeInDuration = 0.3;  // 渐显时间
            const holdDuration = warning.duration - 0.6; // 保持时间
            const fadeOutDuration = 0.3; // 渐隐时间
            
            if (warning.elapsed < fadeInDuration) {
                // 渐显阶段
                warning.phase = 'fadeIn';
                warning.opacity = warning.elapsed / fadeInDuration;
            } else if (warning.elapsed < fadeInDuration + holdDuration) {
                // 保持阶段
                warning.phase = 'hold';
                warning.opacity = 1;
            } else if (warning.elapsed < warning.duration) {
                // 渐隐阶段
                warning.phase = 'fadeOut';
                const fadeProgress = (warning.elapsed - fadeInDuration - holdDuration) / fadeOutDuration;
                warning.opacity = 1 - fadeProgress;
            } else {
                // 预警结束，触发闪电
                warning.phase = 'complete';
                warning.opacity = 0;
                
                // 执行回调（触发闪电）
                if (warning.callback) {
                    warning.callback(warning.x, warning.y);
                }
                
                warningsToRemove.push(index);
            }
        });
        
        // 移除已完成的预警
        warningsToRemove.reverse().forEach(index => {
            this.lightningWarnings.splice(index, 1);
        });
        
        // 渲染所有活跃的预警
        this.renderLightningWarnings();
    }
    
    /**
     * 渲染闪电预警圆圈
     */
    renderLightningWarnings() {
        if (!this.gameManager.systems.renderer || this.lightningWarnings.length === 0) return;
        
        const ctx = this.gameManager.systems.renderer.ctx;
        
        this.lightningWarnings.forEach(warning => {
            ctx.save();
            
            const time = Date.now() * 0.005;
            const pulseScale = 1 + Math.sin(time * 3) * 0.1; // 脉冲效果
            const currentRadius = warning.radius * pulseScale;
            
            // 1. 外层发光效果
            const outerGlow = ctx.createRadialGradient(
                warning.x, warning.y, currentRadius * 0.8,
                warning.x, warning.y, currentRadius * 1.5
            );
            outerGlow.addColorStop(0, `rgba(255, 215, 0, ${warning.opacity * 0.3})`);
            outerGlow.addColorStop(0.5, `rgba(255, 180, 0, ${warning.opacity * 0.15})`);
            outerGlow.addColorStop(1, 'rgba(255, 150, 0, 0)');
            
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(warning.x, warning.y, currentRadius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // 2. 主圆圈 - 金色边框
            ctx.strokeStyle = `rgba(255, 215, 0, ${warning.opacity})`;
            ctx.lineWidth = 4;
            ctx.setLineDash([15, 8]); // 虚线效果
            ctx.lineDashOffset = -time * 20; // 虚线动画
            ctx.beginPath();
            ctx.arc(warning.x, warning.y, currentRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // 3. 内圈 - 实线
            ctx.strokeStyle = `rgba(255, 255, 200, ${warning.opacity * 0.8})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(warning.x, warning.y, currentRadius * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            
            // 4. 中心十字标记
            ctx.strokeStyle = `rgba(255, 215, 0, ${warning.opacity * 0.9})`;
            ctx.lineWidth = 3;
            const crossSize = currentRadius * 0.3;
            
            // 水平线
            ctx.beginPath();
            ctx.moveTo(warning.x - crossSize, warning.y);
            ctx.lineTo(warning.x + crossSize, warning.y);
            ctx.stroke();
            
            // 垂直线
            ctx.beginPath();
            ctx.moveTo(warning.x, warning.y - crossSize);
            ctx.lineTo(warning.x, warning.y + crossSize);
            ctx.stroke();
            
            // 5. 闪烁的中心点
            const centerPulse = 0.5 + Math.sin(time * 8) * 0.5;
            ctx.fillStyle = `rgba(255, 255, 255, ${warning.opacity * centerPulse})`;
            ctx.beginPath();
            ctx.arc(warning.x, warning.y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // 6. 警告文字
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = `rgba(255, 215, 0, ${warning.opacity})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('⚡ 闪电预警 ⚡', warning.x, warning.y - currentRadius - 20);
            
            // 7. 倒计时显示
            const remainingTime = Math.max(0, warning.duration - warning.elapsed);
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = `rgba(255, 255, 255, ${warning.opacity})`;
            ctx.fillText(remainingTime.toFixed(1) + 's', warning.x, warning.y + currentRadius + 20);
            
            ctx.restore();
        });
    }
    
    /**
     * 创建闪电效果（带预警）
     * @param {number} x - 闪电落点X坐标
     * @param {number} y - 闪电落点Y坐标
     * @param {boolean} withWarning - 是否显示预警
     */
    createLightningEffectWithWarning(x, y, withWarning = true) {
        if (withWarning) {
            // 创建预警，预警结束后触发闪电
            this.createLightningWarning(x, y, (strikeX, strikeY) => {
                this.executeLightningStrike(strikeX, strikeY);
            });
        } else {
            // 直接触发闪电
            this.executeLightningStrike(x, y);
        }
    }
    
    /**
     * 执行闪电打击
     * @param {number} x - 闪电落点X坐标
     * @param {number} y - 闪电落点Y坐标
     */
    executeLightningStrike(x, y) {
        if (!this.gameManager.systems.renderer) return;
        
        const ctx = this.gameManager.systems.renderer.ctx;
        
        // 绘制主闪电
        ctx.save();
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 1;
        
        ctx.beginPath();
        ctx.moveTo(x, 0);
        
        // 创建闪电的分支
        let currentX = x;
        let currentY = 0;
        const branches = [];
        
        while (currentY < y) {
            const stepX = (Math.random() - 0.5) * 40;
            const stepY = Math.random() * 25 + 15;
            
            ctx.lineTo(currentX + stepX, currentY + stepY);
            
            // 随机创建分支
            if (Math.random() < 0.3) {
                branches.push({
                    startX: currentX + stepX,
                    startY: currentY + stepY,
                    angle: (Math.random() - 0.5) * Math.PI * 0.5,
                    length: Math.random() * 50 + 30
                });
            }
            
            currentX += stepX;
            currentY += stepY;
        }
        
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // 绘制分支
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        branches.forEach(branch => {
            ctx.beginPath();
            ctx.moveTo(branch.startX, branch.startY);
            ctx.lineTo(
                branch.startX + Math.cos(branch.angle) * branch.length,
                branch.startY + Math.sin(branch.angle) * branch.length
            );
            ctx.stroke();
        });
        
        ctx.restore();
        
        // 闪电击中点效果
        ctx.save();
        const impactGradient = ctx.createRadialGradient(x, y, 0, x, y, 80);
        impactGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        impactGradient.addColorStop(0.3, 'rgba(255, 215, 0, 0.6)');
        impactGradient.addColorStop(0.6, 'rgba(255, 150, 0, 0.3)');
        impactGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
        
        ctx.fillStyle = impactGradient;
        ctx.beginPath();
        ctx.arc(x, y, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // 全屏闪烁效果
        setTimeout(() => {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.4;
            ctx.fillRect(0, 0, 1000, 800);
            ctx.restore();
        }, 50);
        
        // 播放雷声音效
        if (this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playSound('thunder');
        }
    }
    
    createLightningEffect(x, y) {
        // 创建闪电效果
        if (!this.gameManager.systems.renderer) return;
        
        const ctx = this.gameManager.systems.renderer.ctx;
        
        // 绘制闪电
        ctx.save();
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.8;
        
        ctx.beginPath();
        ctx.moveTo(x, 0);
        
        // 创建闪电的分支
        let currentX = x;
        let currentY = 0;
        
        while (currentY < y) {
            const stepX = (Math.random() - 0.5) * 30;
            const stepY = Math.random() * 20 + 10;
            
            ctx.lineTo(currentX + stepX, currentY + stepY);
            
            currentX += stepX;
            currentY += stepY;
        }
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.restore();
        
        // 闪烁效果
        setTimeout(() => {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.3;
            ctx.fillRect(0, 0, 1000, 800);
            ctx.restore();
        }, 50);
    }
    
    updateActiveEffects(deltaTime) {
        // 更新活跃效果
        if (!this.gameManager.systems.renderer) return;
        
        const ctx = this.gameManager.systems.renderer.ctx;
        
        // 应用屏幕色调变化效果
        this.activeEffects.forEach(effect => {
            if (effect.active) {
                this.applyScreenTint(ctx, effect);
                
                // 为沙尘暴添加黄色颗粒滤镜效果
                if (effect.type === 'sandstorm') {
                    this.applySandstormFilter(ctx, effect);
                }
                
                // 为岩浆爆发添加红色地块视觉效果
                if (effect.type === 'magmaEruption' && effect.magmaAreas) {
                    this.renderMagmaAreas(ctx, effect.magmaAreas, effect.intensity);
                }
                
                // 渲染玩家与灾害的交互效果
                this.renderPlayerInteractionEffects(ctx, effect, deltaTime);
            }
        });
    }
    
    /**
     * 渲染玩家与灾害的交互效果
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {Object} effect - 灾害效果
     * @param {number} deltaTime - 时间增量
     */
    renderPlayerInteractionEffects(ctx, effect, deltaTime) {
        if (!this.gameManager.player) return;
        
        const player = this.gameManager.player;
        const playerX = player.x;
        const playerY = player.y;
        const playerSize = player.width || 30;
        
        // 根据灾害类型渲染不同的交互效果
        switch (effect.type) {
            case 'rainstorm':
                // 玩家在雨中的效果
                this.renderRainInteraction(ctx, playerX, playerY, playerSize, effect.intensity);
                break;
            
            case 'blizzard':
                // 玩家在暴风雪中的效果
                this.renderBlizzardInteraction(ctx, playerX, playerY, playerSize, effect.intensity);
                break;
            
            case 'sandstorm':
                // 玩家在沙尘暴中的效果
                this.renderSandstormInteraction(ctx, playerX, playerY, playerSize, effect.intensity);
                break;
            
            case 'thunderstorm':
                // 玩家在雷暴中的效果
                this.renderThunderstormInteraction(ctx, playerX, playerY, playerSize, effect.intensity);
                break;
            
            case 'heatwave':
                // 玩家在热浪中的效果
                this.renderHeatwaveInteraction(ctx, playerX, playerY, playerSize, effect.intensity);
                break;
            
            case 'tornado':
                // 玩家在龙卷风中的效果
                this.renderTornadoInteraction(ctx, playerX, playerY, playerSize, effect.intensity);
                break;
            
            case 'heavySnowstorm':
                // 玩家在大风雪中的效果
                this.renderHeavySnowstormInteraction(ctx, playerX, playerY, playerSize, effect.intensity);
                break;
            
            case 'magmaEruption':
                // 玩家在岩浆爆发中的效果
                this.renderMagmaEruptionInteraction(ctx, playerX, playerY, playerSize, effect.intensity);
                break;
        }
        
        // 渲染玩家状态指示器
        this.renderPlayerStatusIndicator(ctx, player);
    }
    
    /**
     * 获取灾害对应的颜色
     * @param {string} disasterType - 灾害类型
     * @returns {string} 灾害对应的颜色
     */
    getDisasterColor(disasterType) {
        // 获取灾害对应的颜色
        const colors = {
            rainstorm: '#3498db',
            blizzard: '#ecf0f1',
            sandstorm: '#f39c12',
            thunderstorm: '#8e44ad',
            heatwave: '#e67e22',
            tornado: '#95a5a6',
            heavySnowstorm: '#bdc3c7',
            magmaEruption: '#e74c3c'
        };
        
        return colors[disasterType] || '#95a5a6';
    }
    
    /**
     * 根据温度获取岩浆颜色
     * @param {number} temperature - 温度（摄氏度，范围500-1500）
     * @returns {string} 岩浆颜色
     */
    getMagmaColor(temperature) {
        const temp = Math.max(500, Math.min(1500, temperature));
        const ratio = (temp - 500) / 1000;
        
        if (ratio < 0.25) {
            const t = ratio / 0.25;
            const r = Math.floor(139 + t * (231 - 139));
            const g = Math.floor(0 + t * 76);
            const b = Math.floor(0 + t * 60);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (ratio < 0.5) {
            const t = (ratio - 0.25) / 0.25;
            const r = Math.floor(231 + t * (255 - 231));
            const g = Math.floor(76 + t * (140 - 76));
            const b = Math.floor(60 - t * 60);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (ratio < 0.75) {
            const t = (ratio - 0.5) / 0.25;
            const r = 255;
            const g = Math.floor(140 + t * (215 - 140));
            const b = Math.floor(0 + t * 0);
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            const t = (ratio - 0.75) / 0.25;
            const r = 255;
            const g = Math.floor(215 + t * (255 - 215));
            const b = Math.floor(0 + t * 200);
            return `rgb(${r}, ${g}, ${b})`;
        }
    }
    
    /**
     * 渲染玩家状态指示器
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {Object} player - 玩家对象
     */
    renderPlayerStatusIndicator(ctx, player) {
        if (!player || !player.energySystem) return;
        
        const playerX = player.x;
        const playerY = player.y;
        const energy = player.energySystem.energy;
        
        // 检查是否有活跃的灾害效果
        let activeDisasters = [];
        if (this.gameManager.systems && this.gameManager.systems.weatherDisaster) {
            activeDisasters = this.gameManager.systems.weatherDisaster.getActiveDisasters();
        }
        if (activeDisasters.length === 0) return;
        
        // 渲染状态指示器
        ctx.save();
        
        // 绘制状态指示器背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.beginPath();
        ctx.arc(playerX, playerY - 40, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制状态指示器边框
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(playerX, playerY - 40, 25, 0, Math.PI * 2);
        ctx.stroke();
        
        // 根据活跃灾害绘制不同的图标
        activeDisasters.forEach((disaster, index) => {
            const angle = (index / activeDisasters.length) * Math.PI * 2;
            const iconX = playerX + Math.cos(angle) * 15;
            const iconY = playerY - 40 + Math.sin(angle) * 15;
            
            // 绘制灾害图标
            ctx.fillStyle = this.getDisasterColor(disaster.type);
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 根据灾害类型显示不同的图标
            const disasterIcons = {
                rainstorm: '🌧️',
                blizzard: '❄️',
                sandstorm: '🌪️',
                thunderstorm: '⚡',
                heatwave: '🔥',
                tornado: '🌪️',
                heavySnowstorm: '❄️',
                magmaEruption: '🌋'
            };
            
            ctx.fillText(disasterIcons[disaster.type] || '⚠️', iconX, iconY);
        });
        
        ctx.restore();
    }
    
    /**
     * 渲染玩家在雨中的交互效果
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - 玩家X坐标
     * @param {number} y - 玩家Y坐标
     * @param {number} size - 玩家大小
     * @param {number} intensity - 灾害强度
     */
    renderRainInteraction(ctx, x, y, size, intensity) {
        // 绘制玩家周围的雨滴溅起效果
        ctx.save();
        
        for (let i = 0; i < 5; i++) {
            const splashX = x - size/2 + Math.random() * size;
            const splashY = y + size/2;
            const splashSize = 3 + intensity * 2;
            
            // 绘制溅起的水花
            ctx.fillStyle = '#3498db30';
            ctx.beginPath();
            ctx.arc(splashX, splashY, splashSize, 0, Math.PI * 2);
            ctx.fill();
            
            // 绘制水花波纹
            ctx.strokeStyle = '#3498db40';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(splashX, splashY, splashSize + 2, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    /**
     * 渲染玩家在暴风雪中的交互效果
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - 玩家X坐标
     * @param {number} y - 玩家Y坐标
     * @param {number} size - 玩家大小
     * @param {number} intensity - 灾害强度
     */
    renderBlizzardInteraction(ctx, x, y, size, intensity) {
        // 绘制玩家周围的雪花堆积效果
        ctx.save();
        
        // 绘制玩家脚印
        for (let i = 0; i < 3; i++) {
            const footprintX = x - size/2 + Math.random() * size;
            const footprintY = y + size/2 + i * 5;
            const footprintSize = 5 + intensity;
            
            ctx.fillStyle = '#ecf0f120';
            ctx.beginPath();
            ctx.ellipse(footprintX, footprintY, footprintSize, footprintSize * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * 渲染玩家在沙尘暴中的交互效果
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - 玩家X坐标
     * @param {number} y - 玩家Y坐标
     * @param {number} size - 玩家大小
     * @param {number} intensity - 灾害强度
     */
    renderSandstormInteraction(ctx, x, y, size, intensity) {
        // 绘制玩家周围的沙尘效果
        ctx.save();
        
        for (let i = 0; i < 8; i++) {
            const sandX = x - size/2 + Math.random() * size;
            const sandY = y - size/2 + Math.random() * size;
            const sandSize = 2 + intensity * 0.5;
            
            ctx.fillStyle = '#f39c1230';
            ctx.fillRect(sandX, sandY, sandSize, sandSize);
        }
        
        ctx.restore();
    }
    
    /**
     * 渲染玩家在雷暴中的交互效果
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - 玩家X坐标
     * @param {number} y - 玩家Y坐标
     * @param {number} size - 玩家大小
     * @param {number} intensity - 灾害强度
     */
    renderThunderstormInteraction(ctx, x, y, size, intensity) {
        // 随机生成闪电击中效果
        if (Math.random() < 0.01 * intensity) {
            this.createLightningEffect(x, y);
        }
    }
    
    /**
     * 渲染玩家在热浪中的交互效果
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - 玩家X坐标
     * @param {number} y - 玩家Y坐标
     * @param {number} size - 玩家大小
     * @param {number} intensity - 灾害强度
     */
    renderHeatwaveInteraction(ctx, x, y, size, intensity) {
        // 绘制热浪扭曲效果
        ctx.save();
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        gradient.addColorStop(0, 'rgba(230, 126, 34, 0.1)');
        gradient.addColorStop(1, 'rgba(230, 126, 34, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 添加热浪扭曲线条
        for (let i = 0; i < 3; i++) {
            const waveX = x - size + Math.random() * size * 2;
            const waveY = y - size + Math.random() * size * 2;
            const waveLength = size * 0.5;
            
            ctx.strokeStyle = 'rgba(230, 126, 34, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(waveX, waveY);
            ctx.lineTo(waveX + waveLength, waveY + Math.sin(Date.now() * 0.001) * 5);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    /**
     * 渲染玩家在龙卷风中的交互效果
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - 玩家X坐标
     * @param {number} y - 玩家Y坐标
     * @param {number} size - 玩家大小
     * @param {number} intensity - 灾害强度
     */
    renderTornadoInteraction(ctx, x, y, size, intensity) {
        // 绘制玩家被龙卷风影响的效果
        ctx.save();
        
        // 绘制旋转的粒子
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2 + Date.now() * 0.002;
            const distance = size * 0.8;
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;
            const particleSize = 2 + intensity * 0.3;
            
            ctx.fillStyle = '#95a5a640';
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * 渲染玩家在大风雪中的交互效果
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - 玩家X坐标
     * @param {number} y - 玩家Y坐标
     * @param {number} size - 玩家大小
     * @param {number} intensity - 灾害强度
     */
    renderHeavySnowstormInteraction(ctx, x, y, size, intensity) {
        // 绘制玩家被风雪包围的效果
        ctx.save();
        
        // 绘制厚重的雪花
        for (let i = 0; i < 8; i++) {
            const snowX = x - size + Math.random() * size * 2;
            const snowY = y - size + Math.random() * size * 2;
            const snowSize = 3 + intensity * 0.5;
            
            ctx.fillStyle = '#bdc3c730';
            ctx.beginPath();
            ctx.arc(snowX, snowY, snowSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * 渲染玩家在岩浆爆发中的交互效果
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {number} x - 玩家X坐标
     * @param {number} y - 玩家Y坐标
     * @param {number} size - 玩家大小
     * @param {number} intensity - 灾害强度
     */
    renderMagmaEruptionInteraction(ctx, x, y, size, intensity) {
        // 绘制玩家周围的岩浆热度效果
        ctx.save();
        
        // 绘制热力波
        const heatGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        heatGradient.addColorStop(0, 'rgba(231, 76, 60, 0.2)');
        heatGradient.addColorStop(1, 'rgba(231, 76, 60, 0)');
        
        ctx.fillStyle = heatGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制火星效果
        for (let i = 0; i < 5; i++) {
            const sparkX = x - size + Math.random() * size * 2;
            const sparkY = y - size + Math.random() * size * 2;
            const sparkSize = 2 + intensity * 0.3;
            
            ctx.fillStyle = '#e74c3c50';
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * 检查粒子与地面的碰撞
     * @param {Object} particle - 粒子对象
     * @returns {boolean} 是否发生碰撞
     */
    checkGroundCollision(particle) {
        // 地面高度
        const groundY = 750;
        return particle.y >= groundY;
    }
    
    /**
     * 处理粒子与地面的碰撞
     * @param {Object} particle - 粒子对象
     * @param {string} type - 灾害类型
     */
    handleGroundCollision(particle, type) {
        switch (type) {
            case 'rainstorm':
                // 雨滴落地效果
                this.createRainSplash(particle);
                // 播放雨滴落地音效（如果有）
                if (this.gameManager.systems.audioManager && this.gameManager.systems.audioManager.playRainDropSound) {
                    if (Math.random() < 0.1) { // 随机播放，避免音效过于密集
                        this.gameManager.systems.audioManager.playRainDropSound();
                    }
                }
                particle.lifetime = 0; // 标记粒子为过期
                break;
            
            case 'blizzard':
                // 雪花落地效果
                this.createSnowAccumulation(particle);
                particle.lifetime = 0;
                break;
            
            case 'sandstorm':
                // 沙尘落地效果
                this.createSandAccumulation(particle);
                particle.lifetime = 0;
                break;
            
            case 'magmaEruption':
                // 岩浆落地效果
                this.createMagmaSplash(particle);
                // 播放岩浆落地音效（如果有）
                if (this.gameManager.systems.audioManager && this.gameManager.systems.audioManager.playMagmaSplashSound) {
                    if (Math.random() < 0.2) { // 随机播放
                        this.gameManager.systems.audioManager.playMagmaSplashSound();
                    }
                }
                particle.lifetime = 0;
                break;
            
            case 'heavySnowstorm':
                // 大风雪落地效果
                this.createHeavySnowAccumulation(particle);
                particle.lifetime = 0;
                break;
        }
    }
    
    /**
     * 检查粒子与游戏对象的碰撞
     * @param {Object} particle - 粒子对象
     * @returns {boolean} 是否发生碰撞
     */
    checkGameObjectCollision(particle) {
        if (!this.gameManager || !this.gameManager.gameObjects) return false;
        
        for (const gameObject of this.gameManager.gameObjects) {
            if (gameObject.collider && gameObject.x && gameObject.y && gameObject.width && gameObject.height) {
                // 简单的矩形碰撞检测
                if (
                    particle.x < gameObject.x + gameObject.width &&
                    particle.x + particle.size > gameObject.x &&
                    particle.y < gameObject.y + gameObject.height &&
                    particle.y + particle.size > gameObject.y
                ) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * 处理粒子与游戏对象的碰撞
     * @param {Object} particle - 粒子对象
     * @param {string} type - 灾害类型
     */
    handleGameObjectCollision(particle, type) {
        // 根据灾害类型处理碰撞效果
        switch (type) {
            case 'rainstorm':
                // 雨滴与物体碰撞
                this.createRainSplash(particle);
                particle.lifetime = 0;
                break;
            
            case 'blizzard':
                // 雪花与物体碰撞
                this.createSnowAccumulation(particle);
                particle.lifetime = 0;
                break;
            
            case 'sandstorm':
                // 沙尘与物体碰撞
                this.createSandAccumulation(particle);
                particle.lifetime = 0;
                break;
            
            case 'magmaEruption':
                // 岩浆与物体碰撞
                this.createMagmaSplash(particle);
                particle.lifetime = 0;
                break;
        }
    }
    
    /**
     * 创建雨滴溅起效果
     * @param {Object} particle - 粒子对象
     */
    createRainSplash(particle) {
        if (!this.gameManager.systems.renderer) return;
        
        const ctx = this.gameManager.systems.renderer.ctx;
        ctx.save();
        
        // 绘制溅起的水花
        ctx.fillStyle = '#3498db30';
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const distance = Math.random() * 10 + 5;
            const splashX = particle.x + Math.cos(angle) * distance;
            const splashY = particle.y - Math.sin(angle) * distance;
            const splashSize = Math.random() * 2 + 1;
            
            ctx.beginPath();
            ctx.arc(splashX, splashY, splashSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * 创建雪花堆积效果
     * @param {Object} particle - 粒子对象
     */
    createSnowAccumulation(particle) {
        if (!this.gameManager.systems.renderer) return;
        
        const ctx = this.gameManager.systems.renderer.ctx;
        ctx.save();
        
        // 绘制雪花堆积
        ctx.fillStyle = '#ecf0f120';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * 创建沙尘堆积效果
     * @param {Object} particle - 粒子对象
     */
    createSandAccumulation(particle) {
        if (!this.gameManager.systems.renderer) return;
        
        const ctx = this.gameManager.systems.renderer.ctx;
        ctx.save();
        
        // 绘制沙尘堆积
        ctx.fillStyle = '#f39c1220';
        ctx.fillRect(particle.x - particle.size, particle.y - particle.size * 0.5, particle.size * 2, particle.size);
        
        ctx.restore();
    }
    
    /**
     * 创建岩浆溅起效果
     * @param {Object} particle - 粒子对象
     */
    createMagmaSplash(particle) {
        if (!this.gameManager.systems.renderer) return;
        
        const ctx = this.gameManager.systems.renderer.ctx;
        ctx.save();
        
        // 获取粒子温度
        const temperature = particle.temperature || 1200;
        
        // 将rgb颜色转换为rgba格式的辅助函数
        const colorToRgba = (color, alpha) => {
            const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
            }
            return color;
        };
        
        // 绘制岩浆溅起 - 多层次效果
        // 1. 核心爆炸光
        const coreGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, 30
        );
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        coreGradient.addColorStop(0.2, 'rgba(255, 255, 100, 0.6)');
        coreGradient.addColorStop(0.5, colorToRgba(this.getMagmaColor(temperature), 0.25));
        coreGradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 30, 0, Math.PI * 2);
        ctx.fill();
        
        // 2. 飞溅的岩浆滴
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
            const distance = Math.random() * 25 + 15;
            const splashX = particle.x + Math.cos(angle) * distance;
            const splashY = particle.y + Math.sin(angle) * distance;
            const splashSize = Math.random() * 5 + 3;
            const splashTemp = temperature - Math.random() * 200;
            
            // 飞溅滴渐变
            const dropGradient = ctx.createRadialGradient(
                splashX, splashY, 0,
                splashX, splashY, splashSize
            );
            dropGradient.addColorStop(0, '#ffffff');
            dropGradient.addColorStop(0.3, this.getMagmaColor(splashTemp));
            dropGradient.addColorStop(1, this.getMagmaColor(splashTemp - 200));
            
            ctx.fillStyle = dropGradient;
            ctx.shadowColor = '#ff4500';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(splashX, splashY, splashSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 3. 火星粒子
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 40 + 20;
            const sparkX = particle.x + Math.cos(angle) * distance;
            const sparkY = particle.y + Math.sin(angle) * distance;
            const sparkSize = Math.random() * 2 + 1;
            
            ctx.fillStyle = Math.random() < 0.5 ? '#ffff00' : '#ff6600';
            ctx.shadowColor = '#ff4500';
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 4. 烟雾效果
        for (let i = 0; i < 3; i++) {
            const smokeX = particle.x + (Math.random() - 0.5) * 30;
            const smokeY = particle.y - Math.random() * 20;
            const smokeSize = Math.random() * 15 + 10;
            
            const smokeGradient = ctx.createRadialGradient(
                smokeX, smokeY, 0,
                smokeX, smokeY, smokeSize
            );
            smokeGradient.addColorStop(0, 'rgba(80, 80, 80, 0.5)');
            smokeGradient.addColorStop(0.5, 'rgba(60, 60, 60, 0.3)');
            smokeGradient.addColorStop(1, 'rgba(40, 40, 40, 0)');
            
            ctx.fillStyle = smokeGradient;
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * 创建大风雪堆积效果
     * @param {Object} particle - 粒子对象
     */
    createHeavySnowAccumulation(particle) {
        if (!this.gameManager.systems.renderer) return;
        
        const ctx = this.gameManager.systems.renderer.ctx;
        ctx.save();
        
        // 绘制大风雪堆积
        ctx.fillStyle = '#bdc3c730';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * 渲染岩浆爆发红色地块区域
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {Array} magmaAreas - 岩浆区域数组
     * @param {number} intensity - 灾害强度
     */
    renderMagmaAreas(ctx, magmaAreas, intensity) {
        ctx.save();
        
        magmaAreas.forEach(area => {
            // 岩浆核心温度
            const coreTemp = area.temperature || 1400;
            const surfaceTemp = coreTemp - 200;
            
            // 绘制岩浆流动区域 - 多层渐变
            // 1. 最外层 - 冷却边缘
            const outerSize = area.size * 1.5;
            const outerGradient = ctx.createRadialGradient(
                area.x, area.y, 0,
                area.x, area.y, outerSize
            );
            outerGradient.addColorStop(0, 'rgba(50, 20, 10, 0.8)');
            outerGradient.addColorStop(0.7, 'rgba(30, 10, 5, 0.6)');
            outerGradient.addColorStop(1, 'rgba(20, 5, 0, 0)');
            
            ctx.fillStyle = outerGradient;
            ctx.beginPath();
            ctx.arc(area.x, area.y, outerSize, 0, Math.PI * 2);
            ctx.fill();
            
            // 2. 中层 - 半凝固岩浆
            const midSize = area.size * 1.2;
            const midGradient = ctx.createRadialGradient(
                area.x, area.y, 0,
                area.x, area.y, midSize
            );
            midGradient.addColorStop(0, this.getMagmaColor(surfaceTemp));
            midGradient.addColorStop(0.5, this.getMagmaColor(surfaceTemp - 200));
            midGradient.addColorStop(1, 'rgba(80, 30, 10, 0.9)');
            
            ctx.fillStyle = midGradient;
            ctx.beginPath();
            ctx.arc(area.x, area.y, midSize, 0, Math.PI * 2);
            ctx.fill();
            
            // 3. 核心层 - 高温岩浆
            const coreGradient = ctx.createRadialGradient(
                area.x, area.y, 0,
                area.x, area.y, area.size
            );
            coreGradient.addColorStop(0, '#ffffff');
            coreGradient.addColorStop(0.1, this.getMagmaColor(coreTemp));
            coreGradient.addColorStop(0.4, this.getMagmaColor(coreTemp - 100));
            coreGradient.addColorStop(0.7, this.getMagmaColor(surfaceTemp));
            coreGradient.addColorStop(1, this.getMagmaColor(surfaceTemp - 300));
            
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(area.x, area.y, area.size, 0, Math.PI * 2);
            ctx.fill();
            
            // 4. 表面流动效果
            const time = Date.now() * 0.001;
            for (let i = 0; i < 5; i++) {
                const flowAngle = time + i * Math.PI * 0.4;
                const flowX = area.x + Math.cos(flowAngle) * area.size * 0.5;
                const flowY = area.y + Math.sin(flowAngle) * area.size * 0.5;
                const flowSize = area.size * 0.3;
                
                const flowGradient = ctx.createRadialGradient(
                    flowX, flowY, 0,
                    flowX, flowY, flowSize
                );
                flowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
                flowGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
                flowGradient.addColorStop(1, 'rgba(255, 100, 50, 0)');
                
                ctx.fillStyle = flowGradient;
                ctx.beginPath();
                ctx.arc(flowX, flowY, flowSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 5. 烟雾效果
            if (Math.random() < 0.3) {
                const smokeX = area.x + (Math.random() - 0.5) * area.size;
                const smokeY = area.y - Math.random() * area.size * 0.5;
                const smokeSize = Math.random() * 20 + 10;
                
                const smokeGradient = ctx.createRadialGradient(
                    smokeX, smokeY, 0,
                    smokeX, smokeY, smokeSize
                );
                smokeGradient.addColorStop(0, 'rgba(100, 100, 100, 0.4)');
                smokeGradient.addColorStop(0.5, 'rgba(80, 80, 80, 0.2)');
                smokeGradient.addColorStop(1, 'rgba(60, 60, 60, 0)');
                
                ctx.fillStyle = smokeGradient;
                ctx.beginPath();
                ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 6. 火星飞溅
            if (Math.random() < 0.2) {
                const sparkAngle = Math.random() * Math.PI * 2;
                const sparkDist = Math.random() * area.size * 0.8;
                const sparkX = area.x + Math.cos(sparkAngle) * sparkDist;
                const sparkY = area.y + Math.sin(sparkAngle) * sparkDist;
                const sparkSize = Math.random() * 3 + 1;
                
                ctx.fillStyle = '#ffff00';
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
        
        ctx.restore();
    }
    
    /**
     * 应用沙尘暴黄色颗粒滤镜效果
     * @param {CanvasRenderingContext2D} ctx - 画布上下文
     * @param {Object} effect - 效果对象
     */
    applySandstormFilter(ctx, effect) {
        // 保存当前状态
        ctx.save();
        
        // 创建黄色颗粒滤镜效果
        const particleCount = Math.floor(150 * effect.intensity); // 减少颗粒数量以提高性能
        const alpha = 0.3 * effect.intensity; // 根据强度调整透明度
        
        // 绘制随机黄色颗粒
        ctx.fillStyle = 'rgba(243, 156, 18, 0.6)'; // 沙尘黄色
        
        // 批量绘制粒子以减少canvas操作
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * ctx.canvas.width;
            const y = Math.random() * ctx.canvas.height;
            const size = Math.random() * 2 + 0.5; // 颗粒大小
            
            ctx.globalAlpha = alpha * (Math.random() * 0.5 + 0.5); // 随机透明度
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 恢复状态
        ctx.restore();
    }
    
    applyScreenTint(ctx, effect) {
        // 应用屏幕色调变化
        const config = effect.config;
        
        if (config.tintColor && config.tintIntensity) {
            ctx.save();
            ctx.fillStyle = config.tintColor;
            ctx.globalAlpha = config.tintIntensity * (effect.intensity / 3);
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.restore();
        }
    }
    
    stopParticleSystem(type) {
        // 停止粒子系统
        delete this.particleSystems[type];
    }
    
    reset() {
        // 重置视觉效果
        this.activeEffects = [];
        this.particleSystems = {};
    }
}

// 导出天气灾害管理系统
try {
    module.exports = WeatherDisasterManager;
} catch (e) {
    // 浏览器环境
    window.WeatherDisasterManager = WeatherDisasterManager;
}
