class JetEffectManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.activeEffects = new Map();
        this.particleSystem = gameManager.systems.renderer;
    }
    
    activateJetEffect(entity, options = {}) {
        // 激活喷射特效
        if (!entity || !entity.id) return;
        
        // 检查是否已有活跃的特效
        if (this.activeEffects.has(entity.id)) {
            this.deactivateJetEffect(entity);
        }
        
        // 配置特效选项
        const config = {
            color: options.color || '#ff6b6b',
            particleCount: options.particleCount || 10,
            particleSize: options.particleSize || 3,
            particleSpeed: options.particleSpeed || 8,
            particleLifetime: options.particleLifetime || 0.5,
            soundEnabled: options.soundEnabled || false
        };
        
        // 创建特效记录
        const effect = {
            entityId: entity.id,
            config: config,
            active: true,
            lastEmissionTime: 0,
            emissionInterval: 0.05
        };
        
        this.activeEffects.set(entity.id, effect);
        console.log(`激活喷射特效: ${entity.id}`);
    }
    
    update(deltaTime) {
        // 更新所有活跃的喷射特效
        this.activeEffects.forEach((effect, entityId) => {
            if (!effect.active) return;
            
            // 找到对应的实体
            const entity = this.gameManager.gameObjects.find(obj => obj.id === entityId);
            if (!entity) {
                this.deactivateJetEffectById(entityId);
                return;
            }
            
            // 定期发射粒子
            effect.lastEmissionTime += deltaTime;
            if (effect.lastEmissionTime >= effect.emissionInterval) {
                effect.lastEmissionTime = 0;
                this.emitParticles(entity, effect.config);
            }
        });
    }
    
    emitParticles(entity, config) {
        // 发射粒子
        const directionX = -entity.direction.x;
        const directionY = -entity.direction.y;
        
        for (let i = 0; i < config.particleCount; i++) {
            // 计算粒子位置（在实体后方）
            const offsetX = directionX * (entity.width / 2 + 5);
            const offsetY = directionY * (entity.height / 2 + 5);
            
            // 创建粒子
            this.particleSystem.addParticle({
                x: entity.x + entity.width / 2 + offsetX,
                y: entity.y + entity.height / 2 + offsetY,
                size: config.particleSize * (0.8 + Math.random() * 0.4),
                color: config.color,
                velocity: {
                    x: directionX * (config.particleSpeed * (0.8 + Math.random() * 0.4)),
                    y: directionY * (config.particleSpeed * (0.8 + Math.random() * 0.4))
                },
                lifetime: config.particleLifetime * (0.8 + Math.random() * 0.4),
                opacity: 1
            });
        }
    }
    
    deactivateJetEffect(entity) {
        // 停用喷射特效
        if (!entity || !entity.id) return;
        
        this.deactivateJetEffectById(entity.id);
    }
    
    deactivateJetEffectById(entityId) {
        // 停用指定实体的喷射特效
        const effect = this.activeEffects.get(entityId);
        if (effect) {
            effect.active = false;
            this.activeEffects.delete(entityId);
            console.log(`停用喷射特效: ${entityId}`);
        }
    }
    
    deactivateAllEffects() {
        // 停用所有喷射特效
        this.activeEffects.forEach((effect, entityId) => {
            effect.active = false;
        });
        this.activeEffects.clear();
        console.log('停用所有喷射特效');
    }
    
    isJetEffectActive(entity) {
        // 检查实体是否有活跃的喷射特效
        if (!entity || !entity.id) return false;
        
        return this.activeEffects.has(entity.id);
    }
    
    getActiveEffectCount() {
        // 获取活跃特效的数量
        return this.activeEffects.size;
    }
    
    reset() {
        // 重置喷射特效管理器
        this.deactivateAllEffects();
    }
    
    serialize() {
        // 序列化喷射特效管理器状态
        const activeEffects = [];
        this.activeEffects.forEach((effect, entityId) => {
            activeEffects.push({
                entityId: entityId,
                config: effect.config,
                active: effect.active
            });
        });
        
        return {
            activeEffects: activeEffects
        };
    }
    
    deserialize(data) {
        // 反序列化喷射特效管理器状态
        if (data.activeEffects) {
            this.activeEffects.clear();
            data.activeEffects.forEach(effectData => {
                const effect = {
                    entityId: effectData.entityId,
                    config: effectData.config,
                    active: effectData.active,
                    lastEmissionTime: 0,
                    emissionInterval: 0.05
                };
                this.activeEffects.set(effectData.entityId, effect);
            });
        }
    }
}

// 导出喷射特效管理器
try {
    module.exports = JetEffectManager;
} catch (e) {
    // 浏览器环境
    window.JetEffectManager = JetEffectManager;
}
