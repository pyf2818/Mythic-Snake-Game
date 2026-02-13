class Season {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.currentTime = 0; // 游戏内时间（分钟）
        this.seasonLength = 60; // 每个季节的长度（秒）
        this.timeSpeed = 1; // 时间流逝速度
        this.transitionDuration = 5; // 过渡持续时间（秒）
        
        // 季节定义
        this.seasons = [
            {
                name: '春季',
                colorTint: { r: 0.8, g: 1.0, b: 0.8 },
                foodMultiplier: 1.5,
                temperature: 15,
                description: '万物复苏，食物丰富',
                particleColor: '#ffb3ba',
                particleIcon: '🌸'
            },
            {
                name: '夏季',
                colorTint: { r: 1.0, g: 0.9, b: 0.7 },
                foodMultiplier: 1.2,
                temperature: 25,
                description: '炎热干燥，食物减少',
                particleColor: '#87ceeb',
                particleIcon: '🌊'
            },
            {
                name: '秋季',
                colorTint: { r: 1.0, g: 0.7, b: 0.5 },
                foodMultiplier: 1.8,
                temperature: 10,
                description: '收获季节，食物丰盛',
                particleColor: '#ffcc99',
                particleIcon: '🍂'
            },
            {
                name: '冬季',
                colorTint: { r: 0.7, g: 0.9, b: 1.0 },
                foodMultiplier: 0.5,
                temperature: 0,
                description: '寒冷刺骨，食物稀缺',
                particleColor: '#e6f7ff',
                particleIcon: '❄️'
            }
        ];
        
        // 当前季节
        this.currentSeasonIndex = 0;
        this.currentSeason = this.seasons[this.currentSeasonIndex];
        this.previousSeason = this.currentSeason;
        this.transitionProgress = 0;
        this.isTransitioning = false;
        this.lastSeasonChangeTime = 0;
        this.particleCount = 0;
        this.maxParticles = 150; // 增加最大粒子数量，确保特效明显
    }
    
    update(deltaTime) {
        // 更新时间
        this.currentTime += deltaTime * this.timeSpeed;
        
        // 检查季节变化
        if (this.currentTime >= this.seasonLength) {
            this.currentTime -= this.seasonLength;
            this.nextSeason();
        }
        
        // 更新过渡
        if (this.isTransitioning) {
            this.transitionProgress += deltaTime;
            if (this.transitionProgress >= this.transitionDuration) {
                this.endTransition();
            }
        }
        
        // 生成季节粒子效果
        this.generateSeasonalParticles(deltaTime);
    }
    
    nextSeason() {
        // 切换到下一个季节
        this.previousSeason = this.currentSeason;
        this.currentSeasonIndex = (this.currentSeasonIndex + 1) % this.seasons.length;
        this.currentSeason = this.seasons[this.currentSeasonIndex];
        this.transitionProgress = 0;
        this.isTransitioning = true;
        this.lastSeasonChangeTime = Date.now();
        
        console.log(`季节变化：${this.currentSeason.name}`);
        
        // 发送季节变化通知
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(`进入${this.currentSeason.name}`, this.getSeasonColor(), 'season');
        }
        
        // 应用季节效果
        this.applySeasonEffects();
    }
    
    endTransition() {
        // 结束过渡
        this.isTransitioning = false;
        this.transitionProgress = 0;
    }
    
    applySeasonEffects() {
        // 应用季节效果
        // 1. 改变环境颜色
        // 2. 调整食物生成率
        // 3. 影响生物行为
        
        // 这里可以添加具体的季节效果实现
    }
    
    generateSeasonalParticles(deltaTime) {
        // 生成季节粒子效果
        if (!this.gameManager.systems.renderer) return;
        
        // 限制粒子数量
        if (this.gameManager.systems.renderer.particles.length >= this.maxParticles) {
            return;
        }
        
        // 根据季节生成不同的粒子
        let particleRate = 2.0; // 增加粒子生成率，每秒生成2个粒子
        
        // 根据季节调整粒子生成率
        switch (this.currentSeason.name) {
            case '春季':
                particleRate = 2.5; // 春季花瓣较多
                break;
            case '夏季':
                particleRate = 3.0; // 夏季雨滴密集
                break;
            case '秋季':
                particleRate = 2.0; // 秋季落叶适中
                break;
            case '冬季':
                particleRate = 3.5; // 冬季雪花密集
                break;
        }
        
        // 生成多个粒子，确保特效明显
        const particlesToGenerate = Math.floor(particleRate * deltaTime * 60);
        for (let i = 0; i < particlesToGenerate; i++) {
            if (this.gameManager.systems.renderer.particles.length < this.maxParticles) {
                this.createSeasonalParticle();
            } else {
                break;
            }
        }
    }
    
    createSeasonalParticle() {
        // 创建季节粒子
        if (!this.gameManager.systems.renderer) return;
        
        const canvasWidth = 1000;
        const canvasHeight = 800;
        
        // 随机位置
        const x = Math.random() * canvasWidth;
        const y = -20; // 从顶部生成
        
        // 根据季节设置粒子属性
        let size, velocity, lifetime, color;
        
        switch (this.currentSeason.name) {
            case '春季':
                // 樱花花瓣
                size = Math.random() * 5 + 4; // 增加花瓣大小
                velocity = {
                    x: (Math.random() - 0.5) * 3, // 增加水平飘动
                    y: Math.random() * 2 + 1 // 减慢下落速度
                };
                lifetime = Math.random() * 6 + 4; // 增加生命周期
                color = Math.random() > 0.5 ? '#ffb3ba' : '#ffc0cb'; // 两种粉色花瓣
                break;
            case '夏季':
                // 雨滴
                size = Math.random() * 3 + 2; // 雨滴较小
                velocity = {
                    x: (Math.random() - 0.5) * 1,
                    y: Math.random() * 8 + 6 // 雨滴下落较快
                };
                lifetime = Math.random() * 2 + 1; // 生命周期较短
                color = Math.random() > 0.5 ? '#87ceeb' : '#add8e6'; // 两种蓝色雨滴
                break;
            case '秋季':
                // 枫叶
                size = Math.random() * 6 + 4; // 增加枫叶大小
                velocity = {
                    x: (Math.random() - 0.5) * 4, // 增加水平飘动
                    y: Math.random() * 3 + 2 // 适中下落速度
                };
                lifetime = Math.random() * 7 + 5; // 增加生命周期
                color = Math.random() > 0.5 ? '#ffcc99' : '#ff9966'; // 两种橙色枫叶
                break;
            case '冬季':
                // 雪花
                size = Math.random() * 4 + 3; // 增加雪花大小
                velocity = {
                    x: (Math.random() - 0.5) * 2, // 增加水平飘动
                    y: Math.random() * 1.5 + 0.5 // 减慢下落速度
                };
                lifetime = Math.random() * 9 + 6; // 增加生命周期
                color = Math.random() > 0.5 ? '#e6f7ff' : '#ffffff'; // 两种白色雪花
                break;
        }
        
        // 添加粒子
        this.gameManager.systems.renderer.addParticle({
            x: x,
            y: y,
            size: size,
            color: color,
            velocity: velocity,
            lifetime: lifetime,
            opacity: 1
        });
    }
    
    getCurrentSeason() {
        // 获取当前季节
        return this.currentSeason;
    }
    
    getSeasonColorTint() {
        // 获取当前季节的颜色 tint
        if (this.isTransitioning) {
            const progress = this.transitionProgress / this.transitionDuration;
            return this.lerpColorTint(this.previousSeason.colorTint, this.currentSeason.colorTint, progress);
        }
        return this.currentSeason.colorTint;
    }
    
    getSeasonColor() {
        // 获取当前季节的颜色
        const tint = this.getSeasonColorTint();
        return `rgb(${Math.round(tint.r * 255)}, ${Math.round(tint.g * 255)}, ${Math.round(tint.b * 255)})`;
    }
    
    getFoodMultiplier() {
        // 获取当前季节的食物生成倍率
        if (this.isTransitioning) {
            const progress = this.transitionProgress / this.transitionDuration;
            return this.lerp(this.previousSeason.foodMultiplier, this.currentSeason.foodMultiplier, progress);
        }
        return this.currentSeason.foodMultiplier;
    }
    
    getTemperature() {
        // 获取当前季节的温度
        if (this.isTransitioning) {
            const progress = this.transitionProgress / this.transitionDuration;
            return this.lerp(this.previousSeason.temperature, this.currentSeason.temperature, progress);
        }
        return this.currentSeason.temperature;
    }
    
    getSeasonDescription() {
        // 获取当前季节的描述
        return this.currentSeason.description;
    }
    
    isSeason(seasonName) {
        // 检查是否是指定季节
        return this.currentSeason.name === seasonName;
    }
    
    setTimeSpeed(speed) {
        // 设置时间流逝速度
        this.timeSpeed = speed;
    }
    
    setSeason(seasonIndex) {
        // 设置当前季节
        this.previousSeason = this.currentSeason;
        this.currentSeasonIndex = seasonIndex % this.seasons.length;
        this.currentSeason = this.seasons[this.currentSeasonIndex];
        this.currentTime = 0;
        this.transitionProgress = 0;
        this.isTransitioning = true;
        this.applySeasonEffects();
    }
    
    reset() {
        // 重置季节系统
        this.currentTime = 0;
        this.currentSeasonIndex = 0;
        this.currentSeason = this.seasons[this.currentSeasonIndex];
        this.previousSeason = this.currentSeason;
        this.transitionProgress = 0;
        this.isTransitioning = false;
        this.timeSpeed = 1;
    }
    
    lerp(start, end, t) {
        // 线性插值
        return start + (end - start) * t;
    }
    
    lerpColorTint(tint1, tint2, t) {
        // 颜色 tint 插值
        return {
            r: this.lerp(tint1.r, tint2.r, t),
            g: this.lerp(tint1.g, tint2.g, t),
            b: this.lerp(tint1.b, tint2.b, t)
        };
    }
    
    serialize() {
        // 序列化季节系统状态
        return {
            currentTime: this.currentTime,
            currentSeasonIndex: this.currentSeasonIndex,
            timeSpeed: this.timeSpeed
        };
    }
    
    deserialize(data) {
        // 反序列化季节系统状态
        this.currentTime = data.currentTime;
        this.currentSeasonIndex = data.currentSeasonIndex;
        this.timeSpeed = data.timeSpeed;
        this.currentSeason = this.seasons[this.currentSeasonIndex];
        this.previousSeason = this.currentSeason;
        this.transitionProgress = 0;
        this.isTransitioning = false;
    }
}

// 导出季节系统
try {
    module.exports = Season;
} catch (e) {
    // 浏览器环境
    window.Season = Season;
}