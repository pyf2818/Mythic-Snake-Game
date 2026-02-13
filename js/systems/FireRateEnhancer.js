/**
 * 射速增强系统
 * 提供射速提升、平滑过渡、视觉反馈功能
 */

class FireRateEnhancer {
    constructor(bulletSystem) {
        this.bulletSystem = bulletSystem;
        this.gameManager = bulletSystem.gameManager;
        
        // 难度模式配置
        this.difficultyModes = {
            normal: {
                fireRateMultiplier: 1.0,
                fireRateIncrease: 0.3
            },
            hard: {
                fireRateMultiplier: 1.2,
                fireRateIncrease: 0.5
            },
            extreme: {
                fireRateMultiplier: 1.5,
                fireRateIncrease: 0.7
            }
        };
        
        this.currentDifficulty = 'normal';
        
        // 射速系统
        this.fireRateSystem = {
            baseRate: 2,
            currentRate: 2,
            targetRate: 2,
            minRate: 1,
            maxRate: 8,
            transitionSpeed: 0.5,
            isTransitioning: false,
            boostLevel: 0,
            boostMultiplier: 1.0
        };
        
        // 视觉反馈
        this.visualFeedback = {
            muzzleFlashIntensity: 0,
            muzzleFlashDecay: 3,
            rateIndicatorAlpha: 0,
            rateIndicatorTimer: 0,
            glowPulsePhase: 0,
            lastFireTime: 0,
            fireCount: 0,
            comboTimer: 0,
            comboCount: 0
        };
        
        // 射速等级颜色
        this.levelColors = ['#00ffff', '#00ff88', '#88ff00', '#ffff00', '#ff8800', '#ff0088'];
    }
    
    /**
     * 设置难度模式
     */
    setDifficultyMode(mode) {
        if (this.difficultyModes[mode]) {
            this.currentDifficulty = mode;
            const modeConfig = this.difficultyModes[mode];
            this.fireRateSystem.baseRate = this.bulletSystem.config.fireRate * modeConfig.fireRateMultiplier;
            this.fireRateSystem.currentRate = this.fireRateSystem.baseRate;
            this.fireRateSystem.targetRate = this.fireRateSystem.baseRate;
        }
    }
    
    /**
     * 提升射速
     */
    increaseFireRate(amount, instant = false) {
        const modeConfig = this.difficultyModes[this.currentDifficulty];
        const effectiveAmount = amount * (1 + modeConfig.fireRateIncrease);
        
        this.fireRateSystem.targetRate = Math.min(
            this.fireRateSystem.maxRate,
            this.fireRateSystem.targetRate + effectiveAmount
        );
        
        if (instant) {
            this.fireRateSystem.currentRate = this.fireRateSystem.targetRate;
            this.applyFireRate();
        } else {
            this.fireRateSystem.isTransitioning = true;
        }
        
        this.showRateIndicator();
    }
    
    /**
     * 应用当前射速
     */
    applyFireRate() {
        this.bulletSystem.config.fireRate = this.fireRateSystem.currentRate;
        this.bulletSystem.fireInterval = 1 / this.bulletSystem.config.fireRate;
    }
    
    /**
     * 显示射速指示器
     */
    showRateIndicator() {
        this.visualFeedback.rateIndicatorAlpha = 1;
        this.visualFeedback.rateIndicatorTimer = 2;
    }
    
    /**
     * 更新系统
     */
    update(deltaTime) {
        this.updateFireRateTransition(deltaTime);
        this.updateVisualFeedback(deltaTime);
    }
    
    /**
     * 更新射速过渡
     */
    updateFireRateTransition(deltaTime) {
        if (this.fireRateSystem.isTransitioning) {
            const diff = this.fireRateSystem.targetRate - this.fireRateSystem.currentRate;
            
            if (Math.abs(diff) < 0.1) {
                this.fireRateSystem.currentRate = this.fireRateSystem.targetRate;
                this.fireRateSystem.isTransitioning = false;
            } else {
                const transitionAmount = this.fireRateSystem.transitionSpeed * deltaTime;
                
                if (diff > 0) {
                    this.fireRateSystem.currentRate = Math.min(
                        this.fireRateSystem.targetRate,
                        this.fireRateSystem.currentRate + transitionAmount
                    );
                } else {
                    this.fireRateSystem.currentRate = Math.max(
                        this.fireRateSystem.targetRate,
                        this.fireRateSystem.currentRate - transitionAmount
                    );
                }
            }
            
            this.applyFireRate();
        }
        
        // 更新射速倍率和等级
        this.fireRateSystem.boostMultiplier = this.fireRateSystem.currentRate / this.fireRateSystem.baseRate;
        this.fireRateSystem.boostLevel = Math.floor(Math.min(5, (this.fireRateSystem.boostMultiplier - 1) * 5));
    }
    
    /**
     * 更新视觉反馈
     */
    updateVisualFeedback(deltaTime) {
        // 更新枪口闪光
        if (this.visualFeedback.muzzleFlashIntensity > 0) {
            this.visualFeedback.muzzleFlashIntensity -= this.visualFeedback.muzzleFlashDecay * deltaTime;
            if (this.visualFeedback.muzzleFlashIntensity < 0) {
                this.visualFeedback.muzzleFlashIntensity = 0;
            }
        }
        
        // 更新射速指示器
        if (this.visualFeedback.rateIndicatorTimer > 0) {
            this.visualFeedback.rateIndicatorTimer -= deltaTime;
            if (this.visualFeedback.rateIndicatorTimer < 0.5) {
                this.visualFeedback.rateIndicatorAlpha = this.visualFeedback.rateIndicatorTimer * 2;
            }
        }
        
        // 更新发光脉冲
        this.visualFeedback.glowPulsePhase += deltaTime * (2 + this.fireRateSystem.boostLevel);
        
        // 更新连击计时器
        if (this.visualFeedback.comboTimer > 0) {
            this.visualFeedback.comboTimer -= deltaTime;
            if (this.visualFeedback.comboTimer <= 0) {
                this.visualFeedback.comboCount = 0;
            }
        }
    }
    
    /**
     * 发射时调用
     */
    onFire() {
        this.visualFeedback.fireCount++;
        this.visualFeedback.lastFireTime = Date.now();
        this.visualFeedback.muzzleFlashIntensity = 1;
        this.visualFeedback.comboCount++;
        this.visualFeedback.comboTimer = 0.5;
    }
    
    /**
     * 获取子弹配置
     */
    getBulletConfig() {
        const boostLevel = this.fireRateSystem.boostLevel;
        const sizeMultiplier = 1 + boostLevel * 0.1;
        const color = this.levelColors[Math.min(boostLevel, this.levelColors.length - 1)];
        
        return {
            sizeMultiplier,
            color
        };
    }
    
    /**
     * 获取特效粒子数量
     */
    getParticleCount() {
        return 10 + this.fireRateSystem.boostLevel * 3;
    }
    
    /**
     * 渲染射速UI
     */
    renderFireRateUI(ctx, playerX, playerY) {
        if (this.visualFeedback.rateIndicatorAlpha <= 0) return;
        
        const x = playerX;
        const y = playerY - 40;
        const alpha = this.visualFeedback.rateIndicatorAlpha;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        const boostLevel = this.fireRateSystem.boostLevel;
        const levelText = boostLevel > 0 ? `射速 Lv.${boostLevel}` : '';
        
        if (levelText) {
            ctx.fillStyle = this.getBulletConfig().color;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(levelText, x, y);
            
            const rateText = `x${this.fireRateSystem.boostMultiplier.toFixed(1)}`;
            ctx.font = '10px Arial';
            ctx.fillText(rateText, x, y + 14);
        }
        
        ctx.restore();
    }
    
    /**
     * 获取射速状态
     */
    getStatus() {
        return {
            currentRate: this.fireRateSystem.currentRate,
            targetRate: this.fireRateSystem.targetRate,
            boostLevel: this.fireRateSystem.boostLevel,
            boostMultiplier: this.fireRateSystem.boostMultiplier,
            isTransitioning: this.fireRateSystem.isTransitioning,
            difficulty: this.currentDifficulty
        };
    }
    
    /**
     * 重置
     */
    reset() {
        this.fireRateSystem.currentRate = this.fireRateSystem.baseRate;
        this.fireRateSystem.targetRate = this.fireRateSystem.baseRate;
        this.fireRateSystem.isTransitioning = false;
        this.fireRateSystem.boostLevel = 0;
        this.fireRateSystem.boostMultiplier = 1.0;
        
        this.visualFeedback.muzzleFlashIntensity = 0;
        this.visualFeedback.rateIndicatorAlpha = 0;
        this.visualFeedback.fireCount = 0;
        this.visualFeedback.comboCount = 0;
    }
}

// 导出
try {
    module.exports = { FireRateEnhancer };
} catch (e) {
    window.FireRateEnhancer = FireRateEnhancer;
}
