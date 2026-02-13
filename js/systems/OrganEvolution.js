/**
 * Mythic Snake - Organ Evolution System
 * Copyright (C) 2024 Mythic Snake Team
 * All rights reserved.
 *
 * This software is proprietary. Unauthorized commercial use is strictly prohibited.
 * See LICENSE file for full terms.
 */

class OrganEvolution {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.availableOrgans = this.createOrganTypes();
    }
    
    createOrganTypes() {
        // 创建12种可进化器官
        return {
            // 头部器官
            '锋利牙齿': {
                id: 'sharp_teeth',
                name: '锋利牙齿',
                description: '增加咬合力，对猎物造成更多伤害',
                color: '#ff6b6b',
                effects: {
                    damageBoost: 2,
                    foodConsumption: 1.2
                },
                position: 'head',
                level: 1,
                maxLevel: 3
            },
            '毒液腺': {
                id: 'venom_gland',
                name: '毒液腺',
                description: '使攻击带有毒液效果，持续伤害敌人',
                color: '#96ceb4',
                effects: {
                    poisonDamage: 1,
                    poisonDuration: 3
                },
                position: 'head',
                level: 1,
                maxLevel: 3
            },
            '热感应': {
                id: 'heat_sensor',
                name: '热感应',
                description: '提高视野范围，更容易发现猎物',
                color: '#ffcc5c',
                effects: {
                    visionRange: 1.5,
                    detectionSpeed: 1.2
                },
                position: 'head',
                level: 1,
                maxLevel: 3
            },
            
            // 身体器官
            '坚硬鳞片': {
                id: 'hard_scales',
                name: '坚硬鳞片',
                description: '减少受到的伤害，提高防御力',
                color: '#45b7d1',
                effects: {
                    damageReduction: 0.3,
                    energyConsumption: 1.1
                },
                position: 'body',
                level: 1,
                maxLevel: 3
            },
            '再生能力': {
                id: 'regeneration',
                name: '再生能力',
                description: '缓慢恢复体力，提高生存能力',
                color: '#4ecdc4',
                effects: {
                    healthRegen: 0.5,
                    energyConsumption: 1.2
                },
                position: 'body',
                level: 1,
                maxLevel: 3
            },
            '储能器官': {
                id: 'energy_storage',
                name: '储能器官',
                description: '增加最大体力值，提高持续活动能力',
                color: '#a8e6cf',
                effects: {
                    maxEnergyBoost: 20,
                    energyRegen: 1.1
                },
                position: 'body',
                level: 1,
                maxLevel: 3
            },
            
            // 尾部器官
            '锋利尾刺': {
                id: 'sharp_tail',
                name: '锋利尾刺',
                description: '尾部攻击能力，可对后方敌人造成伤害',
                color: '#ff8b94',
                effects: {
                    tailDamage: 1,
                    attackRange: 1.2
                },
                position: 'tail',
                level: 1,
                maxLevel: 3
            },
            '平衡器官': {
                id: 'balance_organ',
                name: '平衡器官',
                description: '提高移动速度和转向灵活性',
                color: '#dcedc1',
                effects: {
                    speedBoost: 1.2,
                    turnRate: 1.3
                },
                position: 'tail',
                level: 1,
                maxLevel: 3
            },
            '发光尾部': {
                id: 'glowing_tail',
                name: '发光尾部',
                description: '尾部发光，在黑暗中提供照明',
                color: '#ffd93d',
                effects: {
                    nightVision: 1.5,
                    attraction: 0.8
                },
                position: 'tail',
                level: 1,
                maxLevel: 3
            },
            
            // 特殊器官
            '翅膀': {
                id: 'wings',
                name: '翅膀',
                description: '短暂飞行能力，跨越障碍和水域',
                color: '#f9d5e5',
                effects: {
                    flightAbility: true,
                    flightDuration: 2,
                    energyConsumption: 1.5
                },
                position: 'body',
                level: 1,
                maxLevel: 3
            },
            '水下呼吸器': {
                id: 'gills',
                name: '水下呼吸器',
                description: '在水中呼吸，提高游泳速度',
                color: '#a8d8ea',
                effects: {
                    underwaterBreathing: true,
                    swimSpeed: 1.5,
                    waterVision: 1.3
                },
                position: 'head',
                level: 1,
                maxLevel: 3
            },
            '心灵感应': {
                id: 'telepathy',
                name: '心灵感应',
                description: '与其他蛇进行简单交流，可能形成临时联盟',
                color: '#c3aed6',
                effects: {
                    communication: true,
                    allianceChance: 0.5,
                    detectionAvoidance: 1.2
                },
                position: 'head',
                level: 1,
                maxLevel: 3
            }
        };
    }
    
    evolveOrgan(snake, organName) {
        // 进化器官
        const organData = this.availableOrgans[organName];
        if (!organData) return false;
        
        // 检查是否已经有该器官
        const existingOrgan = snake.organs.find(organ => organ.id === organData.id);
        
        if (existingOrgan) {
            // 升级现有器官
            if (existingOrgan.level < existingOrgan.maxLevel) {
                existingOrgan.level++;
                this.applyOrganEffects(snake, existingOrgan);
                console.log(`${snake.isPlayer ? '玩家' : 'AI蛇'}的${existingOrgan.name}升级到${existingOrgan.level}级`);
                return true;
            } else {
                console.log(`${existingOrgan.name}已经达到最高等级`);
                return false;
            }
        } else {
            // 添加新器官
            const newOrgan = JSON.parse(JSON.stringify(organData));
            snake.addOrgan(newOrgan);
            this.applyOrganEffects(snake, newOrgan);
            console.log(`${snake.isPlayer ? '玩家' : 'AI蛇'}获得了${newOrgan.name}`);
            return true;
        }
    }
    
    applyOrganEffects(snake, organ) {
        // 应用器官效果
        const effects = organ.effects;
        
        // 根据器官等级调整效果
        const levelMultiplier = organ.level * 0.5 + 0.5;
        
        // 应用各种效果
        if (effects.damageBoost) {
            snake.damageBoost = (snake.damageBoost || 1) * (1 + effects.damageBoost * levelMultiplier);
        }
        
        if (effects.foodConsumption) {
            snake.foodConsumption = (snake.foodConsumption || 1) * effects.foodConsumption;
        }
        
        if (effects.poisonDamage) {
            snake.poisonDamage = effects.poisonDamage * levelMultiplier;
        }
        
        if (effects.visionRange) {
            snake.visionRange = (snake.visionRange || 1) * effects.visionRange;
        }
        
        if (effects.damageReduction) {
            snake.damageReduction = (snake.damageReduction || 0) + effects.damageReduction * levelMultiplier;
        }
        
        if (effects.healthRegen) {
            snake.healthRegen = effects.healthRegen * levelMultiplier;
        }
        
        if (effects.maxEnergyBoost) {
            if (snake.energySystem) {
                snake.energySystem.boostMaxEnergy(effects.maxEnergyBoost * organ.level);
            }
        }
        
        if (effects.speedBoost) {
            snake.speed = (snake.speed || 5) * effects.speedBoost;
        }
        
        if (effects.flightAbility) {
            snake.canFly = true;
            snake.flightDuration = effects.flightDuration * levelMultiplier;
        }
        
        if (effects.underwaterBreathing) {
            snake.canBreatheUnderwater = true;
            snake.swimSpeed = (snake.swimSpeed || snake.speed) * effects.swimSpeed;
        }
    }
    
    removeOrgan(snake, organId) {
        // 移除器官
        snake.removeOrgan(organId);
        // 重新计算所有效果
        this.recalculateOrganEffects(snake);
    }
    
    recalculateOrganEffects(snake) {
        // 重新计算所有器官效果
        // 重置所有效果
        snake.damageBoost = 1;
        snake.foodConsumption = 1;
        snake.poisonDamage = 0;
        snake.visionRange = 1;
        snake.damageReduction = 0;
        snake.healthRegen = 0;
        snake.speed = 5;
        snake.canFly = false;
        snake.canBreatheUnderwater = false;
        
        // 重新应用所有器官效果
        snake.organs.forEach(organ => {
            this.applyOrganEffects(snake, organ);
        });
    }
    
    getOrganByPosition(snake, position) {
        // 根据位置获取器官
        return snake.organs.find(organ => organ.position === position);
    }
    
    getOrganComboEffects(snake) {
        // 获取器官组合效果
        const combos = [];
        
        // 检查翅膀和热感应的组合
        const hasWings = snake.organs.some(organ => organ.id === 'wings');
        const hasHeatSensor = snake.organs.some(organ => organ.id === 'heat_sensor');
        
        if (hasWings && hasHeatSensor) {
            combos.push({
                name: '空中侦察',
                description: '飞行时视野范围大幅增加',
                effects: {
                    visionRange: 2
                }
            });
        }
        
        // 检查坚硬鳞片和再生能力的组合
        const hasHardScales = snake.organs.some(organ => organ.id === 'hard_scales');
        const hasRegeneration = snake.organs.some(organ => organ.id === 'regeneration');
        
        if (hasHardScales && hasRegeneration) {
            combos.push({
                name: '钢铁意志',
                description: '防御力和恢复速度同时提升',
                effects: {
                    damageReduction: 0.2,
                    healthRegen: 0.3
                }
            });
        }
        
        // 检查毒液腺和锋利牙齿的组合
        const hasVenomGland = snake.organs.some(organ => organ.id === 'venom_gland');
        const hasSharpTeeth = snake.organs.some(organ => organ.id === 'sharp_teeth');
        
        if (hasVenomGland && hasSharpTeeth) {
            combos.push({
                name: '剧毒獠牙',
                description: '毒液效果增强，伤害更高',
                effects: {
                    poisonDamage: 1,
                    damageBoost: 1
                }
            });
        }
        
        return combos;
    }
    
    applyComboEffects(snake) {
        // 应用组合效果
        const combos = this.getOrganComboEffects(snake);
        combos.forEach(combo => {
            Object.entries(combo.effects).forEach(([effect, value]) => {
                if (effect === 'visionRange') {
                    snake.visionRange = (snake.visionRange || 1) * value;
                } else if (effect === 'damageReduction') {
                    snake.damageReduction = (snake.damageReduction || 0) + value;
                } else if (effect === 'healthRegen') {
                    snake.healthRegen = (snake.healthRegen || 0) + value;
                } else if (effect === 'poisonDamage') {
                    snake.poisonDamage = (snake.poisonDamage || 0) + value;
                } else if (effect === 'damageBoost') {
                    snake.damageBoost = (snake.damageBoost || 1) * value;
                }
            });
        });
    }
    
    reset() {
        // 重置器官进化系统
        // 重新创建器官类型
        this.availableOrgans = this.createOrganTypes();
    }
    
    serialize() {
        // 序列化器官进化系统状态
        return {
            availableOrgans: this.availableOrgans
        };
    }
    
    deserialize(data) {
        // 反序列化器官进化系统状态
        if (data.availableOrgans) {
            this.availableOrgans = data.availableOrgans;
        }
    }
}

// 导出器官进化系统
try {
    module.exports = OrganEvolution;
} catch (e) {
    // 浏览器环境
    window.OrganEvolution = OrganEvolution;
}