class DayNight {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.currentTime = 0; // 游戏内时间（分钟）
        this.dayLength = 240; // 一天的长度（分钟）
        this.timeSpeed = 1; // 时间流逝速度
        this.transitionDuration = 10; // 过渡持续时间（秒）
        
        // 时间阶段
        this.timeStages = [
            { name: '夜晚', start: 0, end: 60, color: '#0a1929', visibility: 0.3 },
            { name: '日出', start: 60, end: 120, color: '#ff9a8b', visibility: 0.7 },
            { name: '正午', start: 120, end: 180, color: '#4ecdc4', visibility: 1.0 },
            { name: '黄昏', start: 180, end: 240, color: '#ff6b6b', visibility: 0.7 }
        ];
        
        // 当前阶段
        this.currentStage = this.timeStages[0];
        this.previousStage = this.currentStage;
        this.transitionProgress = 0;
        this.isTransitioning = false;
        this.lastStageChangeTime = 0;
    }
    
    update(deltaTime) {
        // 更新时间
        this.currentTime += deltaTime * this.timeSpeed;
        
        // 时间循环
        if (this.currentTime >= this.dayLength) {
            this.currentTime -= this.dayLength;
        }
        
        // 检查阶段变化
        const newStage = this.getTimeStage(this.currentTime);
        if (newStage !== this.currentStage) {
            this.startTransition(newStage);
        }
        
        // 更新过渡
        if (this.isTransitioning) {
            this.transitionProgress += deltaTime;
            if (this.transitionProgress >= this.transitionDuration) {
                this.endTransition();
            }
        }
        
        // 更新当前阶段
        this.updateCurrentStage();
    }
    
    getTimeStage(time) {
        // 获取指定时间的阶段
        for (let i = 0; i < this.timeStages.length; i++) {
            const stage = this.timeStages[i];
            if (time >= stage.start && time < stage.end) {
                return stage;
            }
        }
        return this.timeStages[0];
    }
    
    startTransition(newStage) {
        // 开始过渡
        this.previousStage = this.currentStage;
        this.currentStage = newStage;
        this.transitionProgress = 0;
        this.isTransitioning = true;
        this.lastStageChangeTime = Date.now();
        
        // 发送过渡通知
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(`进入${newStage.name}`, newStage.color, 'transition');
        }
    }
    
    endTransition() {
        // 结束过渡
        this.isTransitioning = false;
        this.transitionProgress = 0;
    }
    
    updateCurrentStage() {
        // 更新当前时间阶段
        if (!this.isTransitioning) {
            this.currentStage = this.getTimeStage(this.currentTime);
        }
    }
    
    getCurrentStage() {
        // 获取当前时间阶段
        return this.currentStage;
    }
    
    getVisibility() {
        // 获取当前能见度
        if (this.isTransitioning) {
            const progress = this.easeInOutCubic(this.transitionProgress / this.transitionDuration);
            return this.lerp(this.previousStage.visibility, this.currentStage.visibility, progress);
        }
        return this.currentStage.visibility;
    }
    
    getAmbientColor() {
        // 获取当前环境颜色
        if (this.isTransitioning) {
            const progress = this.easeInOutCubic(this.transitionProgress / this.transitionDuration);
            return this.lerpColor(this.previousStage.color, this.currentStage.color, progress);
        }
        return this.currentStage.color;
    }
    
    getLightIntensity() {
        // 获取当前光照强度
        return this.getVisibility();
    }
    
    lerp(start, end, t) {
        // 线性插值
        return start + (end - start) * t;
    }
    
    lerpColor(color1, color2, t) {
        // 颜色插值
        const c1 = this.hexToRgb(color1);
        const c2 = this.hexToRgb(color2);
        
        const r = Math.round(this.lerp(c1.r, c2.r, t));
        const g = Math.round(this.lerp(c1.g, c2.g, t));
        const b = Math.round(this.lerp(c1.b, c2.b, t));
        
        return this.rgbToHex(r, g, b);
    }
    
    hexToRgb(hex) {
        // 十六进制颜色转RGB
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    rgbToHex(r, g, b) {
        // RGB转十六进制颜色
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    easeInOutCubic(t) {
        // 缓动函数
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    isNight() {
        // 检查是否是夜晚
        return this.currentStage.name === '夜晚';
    }
    
    isDay() {
        // 检查是否是白天（日出、正午、黄昏）
        return this.currentStage.name !== '夜晚';
    }
    
    setTimeSpeed(speed) {
        // 设置时间流逝速度
        this.timeSpeed = speed;
    }
    
    setTime(time) {
        // 设置游戏内时间
        this.currentTime = time % this.dayLength;
        this.updateCurrentStage();
    }
    
    reset() {
        // 重置昼夜系统
        this.currentTime = 0;
        this.currentStage = this.timeStages[0];
        this.timeSpeed = 1;
    }
    
    serialize() {
        // 序列化昼夜系统状态
        return {
            currentTime: this.currentTime,
            timeSpeed: this.timeSpeed
        };
    }
    
    deserialize(data) {
        // 反序列化昼夜系统状态
        this.currentTime = data.currentTime;
        this.timeSpeed = data.timeSpeed;
        this.updateCurrentStage();
    }
}

// 导出昼夜系统
try {
    module.exports = DayNight;
} catch (e) {
    // 浏览器环境
    window.DayNight = DayNight;
}