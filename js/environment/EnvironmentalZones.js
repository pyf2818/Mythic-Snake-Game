class EnvironmentalZones {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.zones = [];
        this.maxZones = 8; // 最多8个环境区域
        this.zoneSize = 150; // 区域大小
        
        this.spawnTimer = 0;
        this.spawnInterval = 30; // 每30秒生成新区域
        
        // 环境区域类型
        this.zoneTypes = {
            fire: {
                name: '加速区',
                color: '#ff6b6b',
                effect: 'speed_enhancement',
                modifier: 1.5, // 速度增加到150%
                duration: 8, // 效果持续时间（秒）
                icon: '🔥'
            },
            ice: {
                name: '减速区',
                color: '#4ecdc4',
                effect: 'speed_reduction',
                modifier: 0.7, // 速度降低到70%
                duration: 8, // 效果持续时间（秒）
                icon: '❄️'
            },
            confusion: {
                name: '混乱区',
                color: '#9b59b6',
                effect: 'reverse_controls',
                modifier: 1,
                duration: 6, // 效果持续时间（秒）
                icon: '🔄'
            },
            poison: {
                name: '毒区',
                color: '#96ceb4',
                effect: 'energy_drain',
                modifier: 2, // 能量消耗增加到200%
                duration: 8,
                icon: '☠️'
            }
        };
    }
    
    update(deltaTime) {
        // 更新环境区域生成计时器
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnZones();
        }
        
        // 更新所有环境区域
        this.updateZones(deltaTime);
        
        // 检查游戏对象是否在环境区域内
        this.checkObjectsInZones();
    }
    
    spawnZones() {
        // 生成新的环境区域
        if (this.zones.length >= this.maxZones) return;
        
        const spawnCount = Math.floor(Math.random() * 2) + 1; // 生成1-2个新区域
        
        for (let i = 0; i < spawnCount; i++) {
            // 生成随机位置
            const x = Math.random() * (1000 - this.zoneSize);
            const y = Math.random() * (800 - this.zoneSize);
            
            // 确保新区域不与现有区域重叠
            if (!this.isZoneOverlapping(x, y)) {
                // 随机选择区域类型
                const zoneType = Object.values(this.zoneTypes)[Math.floor(Math.random() * Object.values(this.zoneTypes).length)];
                
                // 创建新区域
                const zone = {
                    x: x,
                    y: y,
                    width: this.zoneSize,
                    height: this.zoneSize,
                    type: zoneType,
                    lifetime: 60, // 区域生命周期（秒）
                    opacity: 0.3
                };
                
                this.zones.push(zone);
            }
        }
    }
    
    isZoneOverlapping(x, y) {
        // 检查新区域是否与现有区域重叠
        for (let zone of this.zones) {
            const distance = Math.sqrt(Math.pow(zone.x - x, 2) + Math.pow(zone.y - y, 2));
            if (distance < this.zoneSize) {
                return true;
            }
        }
        return false;
    }
    
    updateZones(deltaTime) {
        // 更新所有环境区域
        for (let i = this.zones.length - 1; i >= 0; i--) {
            const zone = this.zones[i];
            zone.lifetime -= deltaTime;
            
            // 当区域生命周期结束时，移除区域
            if (zone.lifetime <= 0) {
                this.zones.splice(i, 1);
            }
        }
        
        // 更新区域效果持续时间
        this.updateZoneEffects(deltaTime);
    }
    
    updateZoneEffects(deltaTime) {
        // 更新所有游戏对象的区域效果持续时间
        this.gameManager.gameObjects.forEach(obj => {
            if (obj.type === 'snake' && obj.zoneEffectDuration > 0) {
                obj.zoneEffectDuration -= deltaTime;
                
                // 当效果持续时间结束时，移除效果
                if (obj.zoneEffectDuration <= 0) {
                    this.removeZoneEffect(obj);
                }
            }
        });
    }
    
    checkObjectsInZones() {
        // 检查游戏对象是否在环境区域内
        this.gameManager.gameObjects.forEach(obj => {
            if (obj.type === 'snake' && obj.isPlayer) {
                // 检查玩家是否在环境区域内
                const currentZone = this.getZoneAtPosition(obj.x, obj.y);
                
                // 如果玩家进入新区域，应用区域效果
                if (currentZone && currentZone !== obj.currentZone) {
                    this.applyZoneEffect(obj, currentZone);
                    obj.currentZone = currentZone;
                } else if (!currentZone && obj.currentZone) {
                    // 如果玩家离开区域，移除区域效果
                    this.removeZoneEffect(obj);
                    obj.currentZone = null;
                }
            }
        });
    }
    
    getZoneAtPosition(x, y) {
        // 获取指定位置的环境区域
        for (let zone of this.zones) {
            if (x >= zone.x && x <= zone.x + zone.width &&
                y >= zone.y && y <= zone.y + zone.height) {
                return zone;
            }
        }
        return null;
    }
    
    applyZoneEffect(obj, zone) {
        // 应用区域效果
        switch (zone.type.effect) {
            case 'speed_reduction':
                obj.speed *= zone.type.modifier;
                obj.zoneEffect = zone.type.effect;
                obj.zoneEffectDuration = zone.type.duration;
                obj.zoneEffectType = zone.type;
                break;
            case 'speed_enhancement':
                obj.speed *= zone.type.modifier;
                obj.zoneEffect = zone.type.effect;
                obj.zoneEffectDuration = zone.type.duration;
                obj.zoneEffectType = zone.type;
                break;
            case 'reverse_controls':
                obj.reverseControls = true;
                obj.zoneEffect = zone.type.effect;
                obj.zoneEffectDuration = zone.type.duration;
                obj.zoneEffectType = zone.type;
                break;
            case 'energy_drain':
                obj.energyDrainMultiplier = zone.type.modifier;
                obj.zoneEffect = zone.type.effect;
                obj.zoneEffectDuration = zone.type.duration;
                obj.zoneEffectType = zone.type;
                break;
        }
        
        // 显示区域效果通知
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showZoneNotification(`${zone.type.icon} ${zone.type.name}：${this.getEffectDescription(zone.type.effect)}`, zone.type);
        } else {
            this.gameManager.showNotification(`${zone.type.name}：${this.getEffectDescription(zone.type.effect)}`, zone.type.color, 'zoneEnter');
        }
        
        // 添加视觉效果
        this.createZoneEntryEffect(obj, zone);
    }
    
    createZoneEntryEffect(obj, zone) {
        // 创建区域进入效果
        if (this.gameManager.systems.renderer) {
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                this.gameManager.systems.renderer.addParticle({
                    x: obj.x,
                    y: obj.y,
                    size: Math.random() * 6 + 3,
                    color: zone.type.color,
                    velocity: {
                        x: Math.cos(angle) * 8,
                        y: Math.sin(angle) * 8
                    },
                    lifetime: 0.8,
                    opacity: 1
                });
            }
        }
    }
    
    removeZoneEffect(obj) {
        // 移除区域效果
        const zoneType = obj.zoneEffectType;
        
        switch (obj.zoneEffect) {
            case 'speed_reduction':
            case 'speed_enhancement':
                obj.speed = obj.isPlayer ? 5 : 5.75; // 恢复原始速度
                break;
            case 'reverse_controls':
                obj.reverseControls = false;
                break;
            case 'energy_drain':
                obj.energyDrainMultiplier = 1;
                break;
        }
        
        // 显示效果结束通知
        if (zoneType && this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(`${zoneType.icon} ${zoneType.name}效果结束`, zoneType.color, 'info', 0);
        }
        
        // 清理效果属性
        obj.zoneEffect = null;
        obj.zoneEffectDuration = 0;
        obj.zoneEffectType = null;
    }
    
    getEffectDescription(effect) {
        // 获取效果描述
        switch (effect) {
            case 'speed_reduction':
                return '速度降低';
            case 'speed_enhancement':
                return '速度增加';
            case 'reverse_controls':
                return ' controls反转';
            case 'energy_drain':
                return '能量消耗增加';
            default:
                return '';
        }
    }
    
    render(ctx) {
        // 渲染环境区域
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        
        this.zones.forEach(zone => {
            // 绘制区域
            renderCtx.globalAlpha = zone.opacity;
            renderCtx.fillStyle = zone.type.color;
            renderCtx.fillRect(zone.x, zone.y, zone.width, zone.height);
            
            // 绘制区域边框
            renderCtx.globalAlpha = 0.8;
            renderCtx.strokeStyle = zone.type.color;
            renderCtx.lineWidth = 2;
            renderCtx.strokeRect(zone.x, zone.y, zone.width, zone.height);
            
            // 绘制区域名称
            renderCtx.globalAlpha = 1;
            renderCtx.fillStyle = '#ffffff';
            renderCtx.font = '14px Arial';
            renderCtx.textAlign = 'center';
            renderCtx.fillText(zone.type.name, zone.x + zone.width / 2, zone.y + zone.height / 2);
        });
        
        renderCtx.globalAlpha = 1;
    }
    
    reset() {
        // 重置环境区域系统
        this.zones = [];
        this.spawnTimer = 0;
    }
    
    serialize() {
        // 序列化环境区域系统状态
        return {
            zones: this.zones.map(zone => ({
                x: zone.x,
                y: zone.y,
                width: zone.width,
                height: zone.height,
                type: zone.type,
                lifetime: zone.lifetime
            })),
            spawnTimer: this.spawnTimer
        };
    }
    
    deserialize(data) {
        // 反序列化环境区域系统状态
        if (data.zones) {
            this.zones = data.zones.map(zoneData => ({
                x: zoneData.x,
                y: zoneData.y,
                width: zoneData.width,
                height: zoneData.height,
                type: zoneData.type,
                lifetime: zoneData.lifetime,
                opacity: 0.3
            }));
        }
        
        if (data.spawnTimer) {
            this.spawnTimer = data.spawnTimer;
        }
    }
}

// 导出环境区域系统
try {
    module.exports = EnvironmentalZones;
} catch (e) {
    // 浏览器环境
    window.EnvironmentalZones = EnvironmentalZones;
}
