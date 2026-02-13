class WormholeSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.wormholes = [];
        this.maxWormholes = 6; // 最多6个虫洞（3对）
        
        this.spawnTimer = 0;
        this.spawnInterval = 15; // 每15秒生成虫洞，缩短生成时间间隔
        this.minSpawnCount = 1;
        this.maxSpawnCount = 3;
        
        // 虫洞类型
        this.wormholeTypes = {
            normal: {
                name: '普通虫洞',
                color: '#9b59b6',
                secondaryColor: '#8e44ad',
                stability: 1.0,
                teleportRange: 500,
                rotationSpeed: 0.05,
                scaleOscillation: 0.1,
                lifetime: 30,
                energyCost: 0,
                description: '基本的空间传送通道',
                particleCount: 12,
                particleSpeed: 10
            },
            unstable: {
                name: '不稳定虫洞',
                color: '#e74c3c',
                secondaryColor: '#c0392b',
                stability: 0.5,
                teleportRange: 1000,
                rotationSpeed: 0.1,
                scaleOscillation: 0.2,
                lifetime: 20,
                energyCost: 20,
                description: '高风险高回报的传送通道',
                particleCount: 16,
                particleSpeed: 15
            },
            stable: {
                name: '稳定虫洞',
                color: '#3498db',
                secondaryColor: '#2980b9',
                stability: 2.0,
                teleportRange: 300,
                rotationSpeed: 0.03,
                scaleOscillation: 0.05,
                lifetime: 40,
                energyCost: -10,
                description: '安全可靠的传送通道',
                particleCount: 10,
                particleSpeed: 8
            }
        };
    }
    
    update(deltaTime) {
        // 更新虫洞生成计时器
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnWormholes();
        }
        
        // 更新虫洞状态
        this.updateWormholes(deltaTime);
    }
    
    spawnWormholes() {
        // 生成新的虫洞
        const spawnCount = Math.floor(Math.random() * (this.maxSpawnCount - this.minSpawnCount + 1)) + this.minSpawnCount;
        
        // 确保不会超过最大虫洞数量
        const availableSlots = this.maxWormholes - this.wormholes.length;
        const actualSpawnCount = Math.min(spawnCount * 2, availableSlots); // 每个虫洞需要配对，所以乘以2
        
        if (actualSpawnCount >= 2) {
            // 生成虫洞对
            for (let i = 0; i < actualSpawnCount; i += 2) {
                this.createWormholePair();
            }
        }
    }
    
    createWormholePair() {
        // 创建一对虫洞
        const type = Object.keys(this.wormholeTypes)[Math.floor(Math.random() * Object.keys(this.wormholeTypes).length)];
        const wormholeType = this.wormholeTypes[type];
        
        // 生成第一个虫洞位置
        const pos1 = this.getRandomPosition();
        
        // 生成第二个虫洞位置（在 teleportRange 范围内）
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * wormholeType.teleportRange;
        const pos2 = {
            x: pos1.x + Math.cos(angle) * distance,
            y: pos1.y + Math.sin(angle) * distance
        };
        
        // 确保位置在游戏区域内
        pos2.x = Math.max(50, Math.min(950, pos2.x));
        pos2.y = Math.max(50, Math.min(750, pos2.y));
        
        // 生成唯一的配对ID
        const pairId = Math.random().toString(36).substr(2, 9);
        
        // 创建两个虫洞，使用相同的pairId
        const wormhole1 = new Wormhole(this.gameManager, pos1.x, pos1.y, wormholeType, pairId);
        const wormhole2 = new Wormhole(this.gameManager, pos2.x, pos2.y, wormholeType, pairId);
        
        // 配对虫洞
        wormhole1.target = wormhole2;
        wormhole2.target = wormhole1;
        
        // 添加到虫洞列表
        this.wormholes.push(wormhole1, wormhole2);
        
        // 添加到游戏对象
        this.gameManager.addGameObject(wormhole1);
        this.gameManager.addGameObject(wormhole2);
        
        console.log(`生成了一对${wormholeType.name}，位置1: (${Math.round(pos1.x)}, ${Math.round(pos1.y)}), 位置2: (${Math.round(pos2.x)}, ${Math.round(pos2.y)})`);
    }
    
    updateWormholes(deltaTime) {
        // 更新虫洞状态
        for (let i = this.wormholes.length - 1; i >= 0; i--) {
            const wormhole = this.wormholes[i];
            wormhole.update(deltaTime);
            
            if (!wormhole.active) {
                // 移除失效的虫洞
                this.wormholes.splice(i, 1);
                this.gameManager.removeGameObject(wormhole);
            }
        }
    }
    
    getRandomPosition() {
        // 获取随机位置
        return {
            x: Math.random() * 900 + 50,
            y: Math.random() * 700 + 50
        };
    }
    
    findWormholeAt(x, y) {
        // 查找指定位置的虫洞
        const radius = 30; // 虫洞检测半径
        
        return this.wormholes.find(wormhole => {
            const dx = wormhole.x - x;
            const dy = wormhole.y - y;
            return Math.sqrt(dx * dx + dy * dy) < radius;
        });
    }
    
    reset() {
        // 重置虫洞系统
        // 移除所有虫洞
        this.wormholes.forEach(wormhole => {
            this.gameManager.removeGameObject(wormhole);
        });
        
        this.wormholes = [];
        this.spawnTimer = 0;
    }
    
    serialize() {
        // 序列化虫洞系统状态
        return {
            wormholes: this.wormholes.map(wormhole => wormhole.serialize()),
            spawnTimer: this.spawnTimer
        };
    }
    
    deserialize(data) {
        // 反序列化虫洞系统状态
        if (data.wormholes) {
            this.wormholes = [];
            data.wormholes.forEach(wormholeData => {
                const wormhole = new Wormhole(this.gameManager, 0, 0);
                wormhole.deserialize(wormholeData);
                this.wormholes.push(wormhole);
                this.gameManager.addGameObject(wormhole);
            });
            
            // 重新配对虫洞
            for (let i = 0; i < this.wormholes.length; i += 2) {
                if (i + 1 < this.wormholes.length) {
                    this.wormholes[i].target = this.wormholes[i + 1];
                    this.wormholes[i + 1].target = this.wormholes[i];
                }
            }
        }
        
        if (data.spawnTimer) {
            this.spawnTimer = data.spawnTimer;
        }
    }
}

class Wormhole {
    constructor(gameManager, x, y, type = null, pairId = null) {
        this.gameManager = gameManager;
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 60;
        this.wormholeType = type || Object.values(this.gameManager.systems.wormhole.wormholeTypes)[0];
        this.active = true;
        this.lifetime = this.wormholeType.lifetime;
        this.maxLifetime = this.wormholeType.lifetime;
        this.stability = this.wormholeType.stability;
        this.target = null;
        this.rotation = 0;
        this.rotationSpeed = this.wormholeType.rotationSpeed;
        this.scale = 1;
        this.scaleOscillation = 0;
        this.collider = true;
        this.type = 'wormhole';
        this.id = Math.random().toString(36).substr(2, 9);
        this.pairId = pairId || Math.random().toString(36).substr(2, 9);
        this.pulseTimer = 0;
        
        // 高级视觉效果系统
        this.visualRenderer = null;
        this.initVisualRenderer();
        
        // 动画状态
        this.animationState = 'idle'; // idle, activating, deactivating
        this.animationProgress = 0;
    }
    
    initVisualRenderer() {
        if (window.WormholeVisualRenderer && this.gameManager.systems.renderer) {
            this.visualRenderer = new window.WormholeVisualRenderer(
                this.gameManager.systems.renderer.ctx
            );
        }
    }
    
    update(deltaTime) {
        this.lifetime -= deltaTime;
        this.pulseTimer += deltaTime;
        
        if (this.lifetime <= 0) {
            this.active = false;
            return;
        }
        
        // 更新动画状态
        this.updateAnimationState(deltaTime);
        
        // 更新视觉效果
        this.rotation += this.rotationSpeed * deltaTime * 60;
        this.scaleOscillation = Math.sin(Date.now() * 0.01) * this.wormholeType.scaleOscillation + 1;
        this.scale = this.scaleOscillation * (0.8 + (this.lifetime / this.maxLifetime) * 0.2);
        
        // 更新视觉渲染器
        if (this.visualRenderer) {
            this.visualRenderer.updateTime(deltaTime);
        }
    }
    
    updateAnimationState(deltaTime) {
        const lifeRatio = this.lifetime / this.maxLifetime;
        
        if (lifeRatio > 0.9) {
            this.animationState = 'activating';
            this.animationProgress = 1 - (lifeRatio - 0.9) * 10;
        } else if (lifeRatio < 0.1) {
            this.animationState = 'deactivating';
            this.animationProgress = lifeRatio * 10;
        } else {
            this.animationState = 'idle';
            this.animationProgress = 1;
        }
    }
    
    render(ctx) {
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        
        // 使用增强的视觉渲染器
        if (this.visualRenderer) {
            this.renderEnhanced(renderCtx);
        } else {
            this.renderBasic(renderCtx);
        }
    }
    
    renderEnhanced(ctx) {
        // 应用动画状态
        ctx.save();
        ctx.globalAlpha = this.animationProgress;
        
        // 使用高级渲染器
        this.visualRenderer.render(this, 1/60);
        
        // 渲染虫洞类型标识
        this.renderTypeIndicator(ctx);
        
        // 渲染剩余时间指示器
        this.renderLifetimeIndicator(ctx);
        
        ctx.restore();
    }
    
    renderTypeIndicator(ctx) {
        ctx.save();
        
        // 类型图标
        const icons = {
            normal: '◆',
            unstable: '⚡',
            stable: '○'
        };
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icons[this.wormholeType.name.includes('普通') ? 'normal' : 
                          this.wormholeType.name.includes('不稳定') ? 'unstable' : 'stable'] || '◆', 
                     this.x, this.y - this.width / 2 - 15);
        
        ctx.restore();
    }
    
    renderLifetimeIndicator(ctx) {
        const lifeRatio = this.lifetime / this.maxLifetime;
        
        ctx.save();
        ctx.translate(this.x, this.y + this.width / 2 + 10);
        
        // 背景条
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-20, 0, 40, 4);
        
        // 生命条
        const barColor = lifeRatio > 0.5 ? '#4CAF50' : 
                        lifeRatio > 0.2 ? '#ffcc5c' : '#ff6b6b';
        ctx.fillStyle = barColor;
        ctx.fillRect(-20, 0, 40 * lifeRatio, 4);
        
        ctx.restore();
    }
    
    renderBasic(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        // 基础渐变
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, this.wormholeType.color + '80');
        gradient.addColorStop(0.3, this.wormholeType.secondaryColor + '60');
        gradient.addColorStop(0.7, this.wormholeType.color + '40');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // 光环
        ctx.strokeStyle = this.wormholeType.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    teleport(obj) {
        // 传送对象
        if (!this.active || !this.target || !this.target.active) return;
        
        // 检查目标虫洞是否有效且在游戏边界内
        if (this.target.x < 0 || this.target.x > 1000 || this.target.y < 0 || this.target.y > 800) {
            console.error('目标虫洞位置无效');
            return;
        }
        
        // 立即取消喷射特效
        if (this.gameManager.systems.jetEffectManager) {
            this.gameManager.systems.jetEffectManager.deactivateJetEffect(obj);
            console.log('取消喷射特效');
        }
        
        // 检查能量消耗
        if (obj.isPlayer && obj.energySystem) {
            if (this.wormholeType.energyCost > 0) {
                if (obj.energySystem.energy < this.wormholeType.energyCost) {
                    // 能量不足，无法使用不稳定虫洞
                    if (this.gameManager.systems.notificationManager) {
                        this.gameManager.systems.notificationManager.showNotification(
                            `能量不足，无法使用${this.wormholeType.name}`,
                            '#e74c3c',
                            'error'
                        );
                    }
                    return;
                } else {
                    // 消耗能量
                    obj.energySystem.consume(this.wormholeType.energyCost);
                }
            } else if (this.wormholeType.energyCost < 0) {
                // 稳定虫洞恢复能量
                obj.energySystem.recover(Math.abs(this.wormholeType.energyCost));
            }
        }
        
        // 计算目标位置，考虑虫洞的大小和对象的方向
        const targetX = this.target.x;
        const targetY = this.target.y;
        
        // 创建入口传送效果
        this.createTeleportEntryEffect(obj);
        
        // 保存原始位置用于计算偏移
        const originalX = obj.x;
        const originalY = obj.y;
        
        // 计算位置偏移
        const offsetX = targetX - originalX;
        const offsetY = targetY - originalY;
        
        // 设置对象位置，确保对象出现在虫洞的另一侧
        // 稍微调整位置，避免传送后立即再次碰撞目标虫洞
        const safetyOffset = 40; // 安全偏移量，大于虫洞半径
        let adjustedX = targetX;
        let adjustedY = targetY;
        
        // 根据蛇的当前方向调整位置，使其远离虫洞
        if (obj.direction) {
            adjustedX += obj.direction.x * safetyOffset;
            adjustedY += obj.direction.y * safetyOffset;
        } else {
            // 如果没有方向信息，随机偏移
            adjustedX += (Math.random() - 0.5) * safetyOffset * 2;
            adjustedY += (Math.random() - 0.5) * safetyOffset * 2;
        }
        
        // 确保位置在游戏边界内
        adjustedX = Math.max(20, Math.min(980, adjustedX));
        adjustedY = Math.max(20, Math.min(780, adjustedY));
        
        obj.x = adjustedX;
        obj.y = adjustedY;
        
        // 计算新的偏移量
        const newOffsetX = adjustedX - originalX;
        const newOffsetY = adjustedY - originalY;
        
        // 移动整个蛇身，保持相对位置
        if (obj.body && obj.body.length > 0) {
            obj.body.forEach(segment => {
                segment.x += newOffsetX;
                segment.y += newOffsetY;
            });
        }
        
        // 调整对象方向，使其与虫洞的旋转一致
        if (obj.direction) {
            // 根据虫洞的旋转角度调整对象方向
            const angle = this.rotation - this.target.rotation;
            if (Math.abs(angle) > Math.PI / 2) {
                // 反转方向
                obj.direction = { x: -obj.direction.x, y: -obj.direction.y };
                obj.nextDirection = { x: -obj.nextDirection.x, y: -obj.nextDirection.y };
            }
        }
        
        // 创建出口传送效果
        this.target.createTeleportExitEffect(obj);
        
        // 显示虫洞传送通知
        if (obj.isPlayer) {
            let notificationMessage = `通过${this.wormholeType.name}传送到新位置`;
            
            // 添加能量变化信息
            if (this.wormholeType.energyCost > 0) {
                notificationMessage += ` (消耗${this.wormholeType.energyCost}能量)`;
            } else if (this.wormholeType.energyCost < 0) {
                notificationMessage += ` (恢复${Math.abs(this.wormholeType.energyCost)}能量)`;
            }
            
            if (this.gameManager.systems.notificationManager) {
                this.gameManager.systems.notificationManager.showWormholeNotification(notificationMessage, this.wormholeType);
            } else {
                this.gameManager.showNotification(notificationMessage, this.wormholeType.color, 'wormhole');
            }
            
            // 更新成就系统 - 虫洞旅行者成就
            if (window.gameDataManager) {
                // 获取当前成就进度
                const currentProgress = window.gameDataManager.getAchievement('wormhole_traveler').progress;
                // 增加一次虫洞使用次数
                window.gameDataManager.updateAchievement('wormhole_traveler', currentProgress + 1);
            }
        }
        
        console.log(`${obj.isPlayer ? '玩家' : '对象'}通过${this.wormholeType.name}传送到了新位置: (${Math.round(targetX)}, ${Math.round(targetY)})`);
    }
    
    createTeleportEntryEffect(obj) {
        // 创建入口传送特效 - 漩涡状效果
        if (!this.gameManager.systems.renderer) return;
        
        // 创建漩涡入口效果
        const particleCount = this.wormholeType.particleCount; // 根据虫洞类型确定粒子数量
        const duration = 0.8; // 特效持续时间
        const particleSpeed = this.wormholeType.particleSpeed; // 根据虫洞类型确定粒子速度
        
        // 漩涡中心效果
        setTimeout(() => {
            if (this.gameManager.systems.renderer) {
                this.gameManager.systems.renderer.addParticle({
                    x: this.x,
                    y: this.y,
                    size: 30,
                    color: this.wormholeType.color,
                    velocity: { x: 0, y: 0 },
                    lifetime: duration,
                    opacity: 0.8
                });
            }
        }, 0);
        
        // 漩涡旋转粒子
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const radius = 30; // 漩涡半径
            
            setTimeout(() => {
                if (this.gameManager.systems.renderer) {
                    this.gameManager.systems.renderer.addParticle({
                        x: this.x + Math.cos(angle) * radius,
                        y: this.y + Math.sin(angle) * radius,
                        size: Math.random() * 6 + 4,
                        color: Math.random() > 0.5 ? this.wormholeType.color : this.wormholeType.secondaryColor,
                        velocity: {
                            x: Math.cos(angle) * particleSpeed + (Math.random() - 0.5) * 2,
                            y: Math.sin(angle) * particleSpeed + (Math.random() - 0.5) * 2
                        },
                        lifetime: duration,
                        opacity: 1
                    });
                }
            }, i * 30);
        }
        
        // 对象消失效果 - 收缩动画
        setTimeout(() => {
            if (this.gameManager.systems.renderer) {
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i;
                    this.gameManager.systems.renderer.addParticle({
                        x: obj.x,
                        y: obj.y,
                        size: obj.width * (0.8 + Math.random() * 0.4),
                        color: Math.random() > 0.5 ? this.wormholeType.color : this.wormholeType.secondaryColor,
                        velocity: {
                            x: Math.cos(angle) * 6,
                            y: Math.sin(angle) * 6
                        },
                        lifetime: 0.5,
                        opacity: 1
                    });
                }
            }
        }, 200);
    }
    
    createTeleportExitEffect(obj) {
        // 创建出口传送特效 - 漩涡状效果
        if (!this.gameManager.systems.renderer) return;
        
        // 创建漩涡出口效果
        const particleCount = this.wormholeType.particleCount; // 根据虫洞类型确定粒子数量
        const duration = 0.8; // 特效持续时间
        const particleSpeed = this.wormholeType.particleSpeed; // 根据虫洞类型确定粒子速度
        
        // 漩涡中心效果
        setTimeout(() => {
            if (this.gameManager.systems.renderer) {
                this.gameManager.systems.renderer.addParticle({
                    x: this.x,
                    y: this.y,
                    size: 30,
                    color: this.wormholeType.color,
                    velocity: { x: 0, y: 0 },
                    lifetime: duration,
                    opacity: 0.8
                });
            }
        }, 0);
        
        // 漩涡旋转粒子
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i;
            const radius = 30; // 漩涡半径
            
            setTimeout(() => {
                if (this.gameManager.systems.renderer) {
                    this.gameManager.systems.renderer.addParticle({
                        x: this.x + Math.cos(angle) * radius,
                        y: this.y + Math.sin(angle) * radius,
                        size: Math.random() * 6 + 4,
                        color: Math.random() > 0.5 ? this.wormholeType.color : this.wormholeType.secondaryColor,
                        velocity: {
                            x: Math.cos(angle) * -particleSpeed + (Math.random() - 0.5) * 2,
                            y: Math.sin(angle) * -particleSpeed + (Math.random() - 0.5) * 2
                        },
                        lifetime: duration,
                        opacity: 1
                    });
                }
            }, i * 30);
        }
        
        // 对象出现效果 - 扩散动画
        setTimeout(() => {
            if (this.gameManager.systems.renderer) {
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI * 2 / 6) * i;
                    this.gameManager.systems.renderer.addParticle({
                        x: obj.x,
                        y: obj.y,
                        size: obj.width * (0.8 + Math.random() * 0.4),
                        color: Math.random() > 0.5 ? this.wormholeType.color : this.wormholeType.secondaryColor,
                        velocity: {
                            x: Math.cos(angle) * -6,
                            y: Math.sin(angle) * -6
                        },
                        lifetime: 0.5,
                        opacity: 1
                    });
                }
            }
        }, 200);
    }
    
    onCollision(obj) {
        // 处理碰撞
        if (obj.type === 'snake') {
            this.teleport(obj);
        }
    }
    
    serialize() {
        // 序列化虫洞状态
        return {
            x: this.x,
            y: this.y,
            wormholeType: this.wormholeType,
            lifetime: this.lifetime,
            stability: this.stability
        };
    }
    
    deserialize(data) {
        // 反序列化虫洞状态
        this.x = data.x;
        this.y = data.y;
        this.wormholeType = data.wormholeType;
        this.lifetime = data.lifetime;
        this.stability = data.stability;
    }
}

// 导出虫洞系统
try {
    module.exports = { WormholeSystem, Wormhole };
} catch (e) {
    // 浏览器环境
    window.WormholeSystem = WormholeSystem;
    window.Wormhole = Wormhole;
}