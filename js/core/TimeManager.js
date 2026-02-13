class TimeManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.backtrackCount = 5;
        this.maxBacktracks = 5;
        this.backtrackCooldown = 0;
        this.backtrackCooldownTime = 5; // 5秒冷却
        
        // 时间状态记录
        this.timeStates = [];
        this.maxStates = 30; // 最多记录30个状态（5秒 @ 60fps）
        this.stateInterval = 1/6; // 每10帧记录一次状态
        this.stateTimer = 0;
        
        // 时间流逝
        this.gameTime = 0;
        this.timeScale = 1;
    }
    
    update(deltaTime) {
        // 应用时间缩放
        const scaledDelta = deltaTime * this.timeScale;
        
        // 更新游戏时间
        this.gameTime += scaledDelta;
        
        // 更新冷却时间
        if (this.backtrackCooldown > 0) {
            this.backtrackCooldown -= scaledDelta;
            if (this.backtrackCooldown < 0) {
                this.backtrackCooldown = 0;
            }
        }
        
        // 记录时间状态
        this.stateTimer += scaledDelta;
        if (this.stateTimer >= this.stateInterval) {
            this.stateTimer = 0;
            this.recordState();
        }
    }
    
    recordState() {
        // 记录当前游戏状态
        const state = {
            time: this.gameTime,
            player: this.gameManager.player ? this.gameManager.player.serialize() : null,
            gameObjects: this.gameManager.gameObjects.map(obj => obj.serialize ? obj.serialize() : null),
            score: this.gameManager.score,
            systems: {
                energy: this.gameManager.systems.energySystem ? this.gameManager.systems.energySystem.serialize() : null,
                organ: this.gameManager.systems.organSystem ? this.gameManager.systems.organSystem.serialize() : null,
                dayNight: this.gameManager.systems.dayNight ? this.gameManager.systems.dayNight.serialize() : null,
                season: this.gameManager.systems.season ? this.gameManager.systems.season.serialize() : null
            }
        };
        
        // 添加到状态列表
        this.timeStates.push(state);
        
        // 限制状态数量
        if (this.timeStates.length > this.maxStates) {
            this.timeStates.shift();
        }
    }
    
    backtrack() {
        // 检查是否可以回溯
        if (this.backtrackCount <= 0) {
            console.log('时间回溯次数已用尽');
            this.gameManager.showNotification('回溯保护已耗尽', '#ff6b6b', 'backtrack');
            return false;
        }
        
        if (this.backtrackCooldown > 0) {
            console.log('时间回溯冷却中');
            this.gameManager.showNotification('回溯冷却中', '#ffcc5c');
            return false;
        }
        
        if (this.timeStates.length === 0) {
            console.log('没有可回溯的时间状态');
            this.gameManager.showNotification('没有可回溯的时间状态', '#ffcc5c');
            return false;
        }
        
        // 消耗回溯次数
        this.backtrackCount--;
        
        // 设置冷却时间
        this.backtrackCooldown = this.backtrackCooldownTime;
        
        // 获取5秒前的状态（或最近的状态）
        const targetStateIndex = Math.max(0, this.timeStates.length - 30);
        const targetState = this.timeStates[targetStateIndex];
        
        // 恢复状态
        this.restoreState(targetState);
        
        // 显示回溯成功通知
        this.gameManager.showNotification(`回溯成功，剩余次数: ${this.backtrackCount}`, '#4ecdc4', 'backtrack');
        
        console.log('时间回溯成功');
        return true;
    }
    
    restoreState(state) {
        // 恢复游戏时间
        this.gameTime = state.time;
        
        // 恢复分数
        this.gameManager.score = state.score;
        
        // 恢复玩家状态
        if (state.player && this.gameManager.player) {
            this.gameManager.player.deserialize(state.player);
        }
        
        // 恢复游戏对象状态
        this.gameManager.gameObjects = [];
        if (state.player) {
            this.gameManager.player = new Snake(this.gameManager, true);
            this.gameManager.player.deserialize(state.player);
            this.gameManager.gameObjects.push(this.gameManager.player);
        }
        
        if (state.gameObjects) {
            state.gameObjects.forEach(objData => {
                if (objData && objData.isPlayer === false) {
                    if (objData.type === 'snake') {
                        const aiSnake = new Snake(this.gameManager, false);
                        aiSnake.deserialize(objData);
                        this.gameManager.gameObjects.push(aiSnake);
                    } else if (objData.type === 'food') {
                        const food = new Food(this.gameManager, objData.x, objData.y);
                        food.deserialize(objData);
                        this.gameManager.gameObjects.push(food);
                    } else if (objData.type === 'enemy') {
                        const enemy = new Enemy(this.gameManager, objData.x, objData.y);
                        enemy.deserialize(objData);
                        this.gameManager.gameObjects.push(enemy);
                    } else if (objData.type === 'wormhole') {
                        const wormhole = new Wormhole(this.gameManager, objData.x, objData.y);
                        wormhole.deserialize(objData);
                        this.gameManager.gameObjects.push(wormhole);
                    }
                }
            });
        }
        
        // 恢复系统状态
        if (state.systems) {
            if (state.systems.energy && this.gameManager.systems.energySystem) {
                this.gameManager.systems.energySystem.deserialize(state.systems.energy);
            }
            
            if (state.systems.organ && this.gameManager.systems.organSystem) {
                this.gameManager.systems.organSystem.deserialize(state.systems.organ);
            }
            
            if (state.systems.dayNight && this.gameManager.systems.dayNight) {
                this.gameManager.systems.dayNight.deserialize(state.systems.dayNight);
            }
            
            if (state.systems.season && this.gameManager.systems.season) {
                this.gameManager.systems.season.deserialize(state.systems.season);
            }
        }
    }
    
    reset() {
        // 重置时间管理器
        this.backtrackCount = this.maxBacktracks;
        this.backtrackCooldown = 0;
        this.timeStates = [];
        this.stateTimer = 0;
        this.gameTime = 0;
        this.timeScale = 1;
    }
    
    serialize() {
        // 序列化时间管理器状态
        return {
            backtrackCount: this.backtrackCount,
            backtrackCooldown: this.backtrackCooldown,
            gameTime: this.gameTime,
            timeScale: this.timeScale
        };
    }
    
    deserialize(data) {
        // 反序列化时间管理器状态
        this.backtrackCount = data.backtrackCount;
        this.backtrackCooldown = data.backtrackCooldown;
        this.gameTime = data.gameTime;
        this.timeScale = data.timeScale;
    }
}

// 导出时间管理器
try {
    module.exports = TimeManager;
} catch (e) {
    // 浏览器环境
    window.TimeManager = TimeManager;
}