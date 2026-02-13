class SeasonalFallingObjectsManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.fallingObjects = [];
        this.maxObjects = 50;
        this.spawnTimer = 0;
        this.spawnInterval = 0.1;
        
        // 四季飘落物配置
        this.seasonalObjects = {
            '春季': {
                type: 'petal',
                colors: ['#ffb3ba', '#ff9999', '#ff6666', '#ff3333'],
                size: { min: 2, max: 4 },
                speed: { min: 1, max: 2 },
                drift: { min: -0.5, max: 0.5 },
                rotationSpeed: { min: -0.05, max: 0.05 },
                spawnRate: 1.0
            },
            '夏季': {
                type: 'leaf',
                colors: ['#90ee90', '#98fb98', '#7cfc00', '#32cd32'],
                size: { min: 3, max: 5 },
                speed: { min: 1.5, max: 2.5 },
                drift: { min: -0.8, max: 0.8 },
                rotationSpeed: { min: -0.08, max: 0.08 },
                spawnRate: 0.8
            },
            '秋季': {
                type: 'leaf',
                colors: ['#ffd700', '#ffaa00', '#ff8c00', '#ff4500'],
                size: { min: 3, max: 6 },
                speed: { min: 2, max: 3 },
                drift: { min: -1, max: 1 },
                rotationSpeed: { min: -0.1, max: 0.1 },
                spawnRate: 1.2
            },
            '冬季': {
                type: 'snowflake',
                colors: ['#ffffff', '#f0f8ff', '#e6f7ff', '#cceeff'],
                size: { min: 2, max: 5 },
                speed: { min: 0.5, max: 1.5 },
                drift: { min: -0.3, max: 0.3 },
                rotationSpeed: { min: -0.03, max: 0.03 },
                spawnRate: 1.5
            }
        };
    }
    
    update(deltaTime) {
        // 更新飘落物生成计时器
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnFallingObjects();
        }
        
        // 更新飘落物状态
        this.updateFallingObjects(deltaTime);
    }
    
    spawnFallingObjects() {
        // 根据当前季节生成飘落物
        if (this.fallingObjects.length >= this.maxObjects) {
            return;
        }
        
        const season = this.gameManager.systems.season;
        if (!season) return;
        
        const currentSeason = season.currentSeason;
        if (!currentSeason) return;
        
        const seasonConfig = this.seasonalObjects[currentSeason.name];
        if (!seasonConfig) return;
        
        // 根据季节的生成率决定是否生成
        if (Math.random() > seasonConfig.spawnRate) {
            return;
        }
        
        // 生成飘落物
        const spawnCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < spawnCount; i++) {
            if (this.fallingObjects.length >= this.maxObjects) {
                break;
            }
            
            const x = Math.random() * 1000;
            const y = -20; // 从屏幕顶部外开始飘落
            
            const size = Math.random() * (seasonConfig.size.max - seasonConfig.size.min) + seasonConfig.size.min;
            const color = seasonConfig.colors[Math.floor(Math.random() * seasonConfig.colors.length)];
            const speed = Math.random() * (seasonConfig.speed.max - seasonConfig.speed.min) + seasonConfig.speed.min;
            const drift = Math.random() * (seasonConfig.drift.max - seasonConfig.drift.min) + seasonConfig.drift.min;
            const rotationSpeed = Math.random() * (seasonConfig.rotationSpeed.max - seasonConfig.rotationSpeed.min) + seasonConfig.rotationSpeed.min;
            
            const fallingObject = {
                id: Math.random().toString(36).substr(2, 9),
                x: x,
                y: y,
                size: size,
                color: color,
                speed: speed,
                drift: drift,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: rotationSpeed,
                type: seasonConfig.type,
                active: true
            };
            
            this.fallingObjects.push(fallingObject);
        }
    }
    
    updateFallingObjects(deltaTime) {
        // 更新飘落物状态
        for (let i = this.fallingObjects.length - 1; i >= 0; i--) {
            const obj = this.fallingObjects[i];
            
            // 更新位置
            obj.y += obj.speed;
            obj.x += obj.drift;
            
            // 更新旋转
            obj.rotation += obj.rotationSpeed;
            
            // 检查是否超出边界
            if (obj.y > 820 || obj.x < -20 || obj.x > 1020) {
                this.fallingObjects.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        // 渲染飘落物
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        
        this.fallingObjects.forEach(obj => {
            renderCtx.save();
            renderCtx.translate(obj.x, obj.y);
            renderCtx.rotate(obj.rotation);
            
            renderCtx.fillStyle = obj.color;
            
            switch (obj.type) {
                case 'petal':
                    this.renderPetal(renderCtx, obj.size);
                    break;
                case 'leaf':
                    this.renderLeaf(renderCtx, obj.size);
                    break;
                case 'snowflake':
                    this.renderSnowflake(renderCtx, obj.size);
                    break;
            }
            
            renderCtx.restore();
        });
    }
    
    renderPetal(ctx, size) {
        // 渲染花瓣
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.5, size, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderLeaf(ctx, size) {
        // 渲染叶子
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-size, -size * 2, 0, -size * 3);
        ctx.quadraticCurveTo(size, -size * 2, 0, 0);
        ctx.fill();
    }
    
    renderSnowflake(ctx, size) {
        // 渲染雪花
        ctx.beginPath();
        
        // 绘制六边形雪花
        for (let i = 0; i < 6; i++) {
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -size);
            
            if (size > 3) {
                // 添加分支
                ctx.moveTo(0, -size * 0.5);
                ctx.lineTo(-size * 0.3, -size * 0.7);
                
                ctx.moveTo(0, -size * 0.5);
                ctx.lineTo(size * 0.3, -size * 0.7);
            }
            
            ctx.rotate(Math.PI / 3);
        }
        
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    reset() {
        // 重置飘落物系统
        this.fallingObjects = [];
        this.spawnTimer = 0;
    }
}

// 导出季节飘落物管理器
try {
    module.exports = SeasonalFallingObjectsManager;
} catch (e) {
    // 浏览器环境
    window.SeasonalFallingObjectsManager = SeasonalFallingObjectsManager;
}
