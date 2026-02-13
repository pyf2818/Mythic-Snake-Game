class EnergySystem {
    constructor(owner) {
        this.owner = owner;
        this.energy = 100;
        this.maxEnergy = 100;
        
        // 消耗速率
        this.consumptionRates = {
            fastMove: 1.5,
            normalMove: 0.3,
            boostMove: 3,
            stationary: -5
        };
        
        // 被动恢复配置
        this.passiveRecovery = {
            enabled: true,
            baseRate: 2,
            movingRate: 1,
            stationaryRate: 5,
            interval: 1
        };
        
        // 恢复值
        this.recoveryValues = {
            normalFood: 15,
            specialFood: 35
        };
        
        // 警告阈值
        this.warningThreshold = 20;
        this.isWarning = false;
        
        // 音效和视觉效果
        this.warningTimer = 0;
        this.warningInterval = 1;
        
        // 被动恢复计时器
        this.passiveRecoveryTimer = 0;
    }
    
    update(deltaTime) {
        this.updateEnergyStatus(deltaTime);
        this.updatePassiveRecovery(deltaTime);
        this.updateWarningStatus(deltaTime);
    }
    
    updateEnergyStatus(deltaTime) {
        if (this.owner.isMoving) {
            if (this.owner.isBoosting) {
                this.consume(this.consumptionRates.boostMove * deltaTime);
            } else if (this.owner.speed > 7) {
                this.consume(this.consumptionRates.fastMove * deltaTime);
            } else {
                this.consume(this.consumptionRates.normalMove * deltaTime);
            }
        } else {
            this.recover(Math.abs(this.consumptionRates.stationary) * deltaTime);
        }
    }
    
    updatePassiveRecovery(deltaTime) {
        if (!this.passiveRecovery.enabled) return;
        
        this.passiveRecoveryTimer += deltaTime;
        
        if (this.passiveRecoveryTimer >= this.passiveRecovery.interval) {
            this.passiveRecoveryTimer = 0;
            
            // 根据状态恢复不同量的能量
            if (this.owner.isMoving) {
                this.recover(this.passiveRecovery.movingRate);
            } else {
                this.recover(this.passiveRecovery.stationaryRate);
            }
        }
        
        // 持续恢复（每秒恢复基础量）
        const baseRecovery = this.passiveRecovery.baseRate * deltaTime;
        this.recover(baseRecovery);
    }
    
    updateWarningStatus(deltaTime) {
        if (this.energy < this.warningThreshold) {
            if (!this.isWarning) {
                this.isWarning = true;
                this.triggerWarning();
            }
            
            this.warningTimer += deltaTime;
            if (this.warningTimer >= this.warningInterval) {
                this.warningTimer = 0;
                this.triggerWarning();
            }
        } else {
            this.isWarning = false;
        }
    }
    
    consume(amount) {
        this.energy -= amount;
        if (this.energy < 0) {
            this.energy = 0;
        }
    }
    
    recover(amount) {
        this.energy += amount;
        if (this.energy > this.maxEnergy) {
            this.energy = this.maxEnergy;
        }
    }
    
    eatFood(foodType) {
        if (this.recoveryValues[foodType]) {
            this.recover(this.recoveryValues[foodType]);
        }
    }
    
    triggerWarning() {
        if (this.owner.isPlayer) {
            const energyBar = document.getElementById('energy-bar');
            if (energyBar) {
                energyBar.style.animation = 'warning 1s infinite';
                
                setTimeout(() => {
                    if (energyBar) {
                        energyBar.style.animation = '';
                    }
                }, 1000);
            }
        }
        
        console.log('能量过低警告！');
    }
    
    getEnergyPercentage() {
        return (this.energy / this.maxEnergy) * 100;
    }
    
    isEnergyCritical() {
        return this.energy < this.warningThreshold;
    }
    
    isEnergyEmpty() {
        return this.energy <= 0;
    }
    
    boostMaxEnergy(amount) {
        this.maxEnergy += amount;
        this.energy = this.maxEnergy;
    }
    
    reset() {
        this.energy = this.maxEnergy;
        this.isWarning = false;
        this.warningTimer = 0;
        this.passiveRecoveryTimer = 0;
    }
    
    serialize() {
        return {
            energy: this.energy,
            maxEnergy: this.maxEnergy,
            isWarning: this.isWarning
        };
    }
    
    deserialize(data) {
        if (!data) {
            console.warn('EnergySystem.deserialize: 数据为空');
            return;
        }
        this.energy = data.energy !== undefined ? data.energy : this.maxEnergy;
        this.maxEnergy = data.maxEnergy || this.maxEnergy;
        this.isWarning = data.isWarning || false;
        console.log('EnergySystem.deserialize 完成, energy:', this.energy);
    }
}

// 导出能量管理系统
try {
    module.exports = EnergySystem;
} catch (e) {
    // 浏览器环境
    window.EnergySystem = EnergySystem;
}