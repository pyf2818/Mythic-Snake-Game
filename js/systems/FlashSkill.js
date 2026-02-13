class FlashSkill {
    constructor(owner) {
        this.owner = owner;
        this.gameManager = owner.gameManager;
        
        this.cooldown = 4;
        this.cooldownTimer = 0;
        this.isReady = true;
        this.isFlashing = false;
        
        this.flashDistance = owner.height * 2;
        
        // 双击检测配置
        this.doubleTapInterval = 0.4;
        this.maxHoldTime = 0.25;
        
        // 双击检测状态
        this.lastTapTime = 0;
        this.tapCount = 0;
        this.tapResetTimer = null;
        this.isHolding = false;
        this.holdStartTime = 0;
        
        // 防误触机制
        this.minTapInterval = 0.08;
        this.lastKeyDownTime = 0;
        
        this.startParticles = [];
        this.endParticles = [];
        this.flashTrail = [];
        
        this.energyCost = 15;
        
        this.debugMode = false;
    }
    
    update(deltaTime) {
        if (this.cooldownTimer > 0) {
            this.cooldownTimer -= deltaTime;
            if (this.cooldownTimer <= 0) {
                this.cooldownTimer = 0;
                this.isReady = true;
            }
        }
        
        this.updateParticles(deltaTime);
        this.updateTrail(deltaTime);
    }
    
    handleShiftKeyDown() {
        const currentTime = Date.now() / 1000;
        
        // 防误触：检测按键间隔是否过短（防止按键抖动）
        const timeSinceLastKeyDown = currentTime - this.lastKeyDownTime;
        if (timeSinceLastKeyDown < this.minTapInterval) {
            if (this.debugMode) {
                console.log(`[FlashSkill] 按键间隔过短，忽略 (${timeSinceLastKeyDown.toFixed(3)}s)`);
            }
            return;
        }
        
        this.lastKeyDownTime = currentTime;
        this.isHolding = true;
        this.holdStartTime = currentTime;
        
        if (this.tapResetTimer) {
            clearTimeout(this.tapResetTimer);
            this.tapResetTimer = null;
        }
        
        const timeSinceLastTap = currentTime - this.lastTapTime;
        
        if (this.debugMode) {
            console.log(`[FlashSkill] Shift按下. 距上次: ${timeSinceLastTap.toFixed(3)}s, 计数: ${this.tapCount}`);
        }
        
        // 检测是否为有效的双击（在间隔时间内且之前有一次有效点击）
        if (timeSinceLastTap <= this.doubleTapInterval && this.tapCount === 1) {
            // 标记为第二次点击，等待释放时确认
            this.tapCount = 2;
            if (this.debugMode) {
                console.log('[FlashSkill] 检测到可能的二次点击，等待释放确认');
            }
        } else {
            // 第一次点击或超时后的新点击
            this.tapCount = 1;
            this.lastTapTime = currentTime;
            
            // 设置重置定时器
            this.tapResetTimer = setTimeout(() => {
                if (this.debugMode) {
                    console.log('[FlashSkill] 点击计数重置（超时）');
                }
                this.tapCount = 0;
                this.lastTapTime = 0;
                this.tapResetTimer = null;
            }, this.doubleTapInterval * 1000);
        }
    }
    
    handleShiftKeyUp() {
        const currentTime = Date.now() / 1000;
        const holdDuration = currentTime - this.holdStartTime;
        
        this.isHolding = false;
        
        if (this.debugMode) {
            console.log(`[FlashSkill] Shift释放. 按住时长: ${holdDuration.toFixed(3)}s, 计数: ${this.tapCount}`);
        }
        
        // 如果按住时间过长，不算作点击
        if (holdDuration > this.maxHoldTime) {
            if (this.debugMode) {
                console.log(`[FlashSkill] 按住时间过长，重置计数`);
            }
            this.tapCount = 0;
            this.lastTapTime = 0;
            if (this.tapResetTimer) {
                clearTimeout(this.tapResetTimer);
                this.tapResetTimer = null;
            }
            return;
        }
        
        // 确认双击：释放时计数为2且按住时间合理
        if (this.tapCount === 2) {
            if (this.debugMode) {
                console.log('[FlashSkill] 确认双击，尝试激活闪现');
            }
            this.tryActivate();
            this.tapCount = 0;
            this.lastTapTime = 0;
            if (this.tapResetTimer) {
                clearTimeout(this.tapResetTimer);
                this.tapResetTimer = null;
            }
        }
    }
    
    tryActivate() {
        if (!this.isReady) {
            this.showCooldownNotification();
            return false;
        }
        
        if (this.owner.frozen) {
            this.showFrozenNotification();
            return false;
        }
        
        if (this.owner.energySystem && this.owner.energySystem.energy < this.energyCost) {
            this.showLowEnergyNotification();
            return false;
        }
        
        // 边界条件：确保能量足够且不会透支
        if (this.owner.energySystem) {
            const currentEnergy = this.owner.energySystem.energy;
            if (currentEnergy < this.energyCost || currentEnergy <= 0) {
                this.showLowEnergyNotification();
                return false;
            }
        }
        
        return this.activate();
    }
    
    activate() {
        if (!this.isReady) return false;
        
        // 再次检查能量（防止竞态条件）
        if (this.owner.energySystem) {
            const currentEnergy = this.owner.energySystem.energy;
            if (currentEnergy < this.energyCost) {
                this.showLowEnergyNotification();
                return false;
            }
        }
        
        const direction = { ...this.owner.direction };
        
        if (direction.x === 0 && direction.y === 0) {
            direction.x = 1;
        }
        
        const startPos = { x: this.owner.x, y: this.owner.y };
        
        // 闪现距离：角色高度 × 2 × 身体长度系数
        const bodyLengthFactor = Math.min(this.owner.bodyLength || 1, 10);
        const distance = this.flashDistance * bodyLengthFactor;
        
        let targetX = this.owner.x + direction.x * distance;
        let targetY = this.owner.y + direction.y * distance;
        
        targetX = Math.max(0, Math.min(1000, targetX));
        targetY = Math.max(0, Math.min(800, targetY));
        
        this.createStartParticles(startPos.x, startPos.y);
        
        this.owner.x = targetX;
        this.owner.y = targetY;
        
        this.createEndParticles(targetX, targetY);
        this.createFlashTrail(startPos, { x: targetX, y: targetY });
        
        // 消耗能量，确保不会透支
        if (this.owner.energySystem) {
            const energyToConsume = Math.min(this.energyCost, this.owner.energySystem.energy);
            this.owner.energySystem.consume(energyToConsume);
            
            // 确保能量不为负
            if (this.owner.energySystem.energy < 0) {
                this.owner.energySystem.energy = 0;
            }
        }
        
        this.isReady = false;
        this.cooldownTimer = this.cooldown;
        this.isFlashing = true;
        
        setTimeout(() => {
            this.isFlashing = false;
        }, 100);
        
        this.playFlashSound();
        this.showFlashNotification();
        
        this.updateBodyPositions();
        
        return true;
    }
    
    updateBodyPositions() {
        if (this.owner.body && this.owner.body.length > 0) {
            this.owner.body[0].x = this.owner.x;
            this.owner.body[0].y = this.owner.y;
        }
    }
    
    createStartParticles(x, y) {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            this.startParticles.push({
                x: x + this.owner.width / 2,
                y: y + this.owner.height / 2,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                size: Math.random() * 8 + 4,
                color: this.getRandomFlashColor(),
                lifetime: 0.5,
                maxLifetime: 0.5
            });
        }
        
        if (this.gameManager && this.gameManager.systems && this.gameManager.systems.renderer) {
            const renderer = this.gameManager.systems.renderer;
            for (let i = 0; i < particleCount; i++) {
                renderer.addParticle({
                    x: x + this.owner.width / 2,
                    y: y + this.owner.height / 2,
                    size: Math.random() * 8 + 4,
                    color: this.getRandomFlashColor(),
                    velocity: {
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 200
                    },
                    lifetime: 0.5,
                    opacity: 1
                });
            }
        }
    }
    
    createEndParticles(x, y) {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            this.endParticles.push({
                x: x + this.owner.width / 2,
                y: y + this.owner.height / 2,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                size: Math.random() * 8 + 4,
                color: this.getRandomFlashColor(),
                lifetime: 0.5,
                maxLifetime: 0.5
            });
        }
        
        if (this.gameManager && this.gameManager.systems && this.gameManager.systems.renderer) {
            const renderer = this.gameManager.systems.renderer;
            for (let i = 0; i < particleCount; i++) {
                renderer.addParticle({
                    x: x + this.owner.width / 2,
                    y: y + this.owner.height / 2,
                    size: Math.random() * 8 + 4,
                    color: this.getRandomFlashColor(),
                    velocity: {
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 200
                    },
                    lifetime: 0.5,
                    opacity: 1
                });
            }
        }
    }
    
    createFlashTrail(start, end) {
        const segments = 10;
        for (let i = 0; i < segments; i++) {
            const t = i / segments;
            this.flashTrail.push({
                x: start.x + (end.x - start.x) * t,
                y: start.y + (end.y - start.y) * t,
                size: this.owner.width * 0.8,
                color: this.getRandomFlashColor(),
                lifetime: 0.3,
                maxLifetime: 0.3
            });
        }
    }
    
    getRandomFlashColor() {
        const colors = ['#00ffff', '#00ccff', '#0099ff', '#66ffff', '#99ffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    updateParticles(deltaTime) {
        const updateArray = (particles) => {
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx * deltaTime;
                p.y += p.vy * deltaTime;
                p.lifetime -= deltaTime;
                
                if (p.lifetime <= 0) {
                    particles.splice(i, 1);
                }
            }
        };
        
        updateArray(this.startParticles);
        updateArray(this.endParticles);
    }
    
    updateTrail(deltaTime) {
        for (let i = this.flashTrail.length - 1; i >= 0; i--) {
            this.flashTrail[i].lifetime -= deltaTime;
            if (this.flashTrail[i].lifetime <= 0) {
                this.flashTrail.splice(i, 1);
            }
        }
    }
    
    render(ctx) {
        ctx.save();
        
        this.flashTrail.forEach(trail => {
            const alpha = trail.lifetime / trail.maxLifetime;
            ctx.globalAlpha = alpha * 0.5;
            ctx.fillStyle = trail.color;
            ctx.beginPath();
            ctx.arc(trail.x + this.owner.width / 2, trail.y + this.owner.height / 2, trail.size / 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        const renderParticles = (particles) => {
            particles.forEach(p => {
                const alpha = p.lifetime / p.maxLifetime;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                ctx.fill();
            });
        };
        
        renderParticles(this.startParticles);
        renderParticles(this.endParticles);
        
        ctx.restore();
    }
    
    playFlashSound() {
        if (this.gameManager && this.gameManager.systems && this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playSound('flash');
        }
    }
    
    showFlashNotification() {
        if (this.gameManager && this.gameManager.systems && this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                '⚡ 闪现！',
                '#00ffff',
                'info',
                1
            );
        }
    }
    
    showCooldownNotification() {
        const remaining = this.cooldownTimer.toFixed(1);
        if (this.gameManager && this.gameManager.systems && this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `⏳ 闪现冷却中 (${remaining}秒)`,
                '#ffcc5c',
                'warning',
                1
            );
        }
    }
    
    showFrozenNotification() {
        if (this.gameManager && this.gameManager.systems && this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                '❄️ 被冻结无法闪现！',
                '#87ceeb',
                'warning',
                1
            );
        }
    }
    
    showLowEnergyNotification() {
        if (this.gameManager && this.gameManager.systems && this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `⚠️ 能量不足！需要 ${this.energyCost} 能量`,
                '#ff6b6b',
                'error',
                1
            );
        }
    }
    
    getCooldownPercent() {
        if (this.isReady) return 1;
        return 1 - (this.cooldownTimer / this.cooldown);
    }
    
    getCooldownRemaining() {
        return Math.max(0, this.cooldownTimer);
    }
    
    serialize() {
        return {
            cooldown: this.cooldown,
            cooldownTimer: this.cooldownTimer,
            isReady: this.isReady,
            energyCost: this.energyCost
        };
    }
    
    deserialize(data) {
        if (data.cooldown !== undefined) this.cooldown = data.cooldown;
        if (data.cooldownTimer !== undefined) this.cooldownTimer = data.cooldownTimer;
        if (data.isReady !== undefined) this.isReady = data.isReady;
        if (data.energyCost !== undefined) this.energyCost = data.energyCost;
    }
}

try {
    module.exports = FlashSkill;
} catch (e) {
    window.FlashSkill = FlashSkill;
}
