/**
 * 掉落物品系统 - 完整设计方案
 * 包含：物品分类、稀有度、属性生成、Buff系统、武器效果
 */

// ==================== 物品类型定义 ====================
const DropType = {
    SOUVENIR: 'souvenir',
    ACCESSORY: 'accessory',
    WEAPON: 'weapon',
    CONSUMABLE: 'consumable'
};

// ==================== 稀有度系统 ====================
const DropRarity = {
    COMMON: { 
        name: '普通', 
        nameEn: 'Common',
        color: '#9e9e9e', 
        weight: 100,
        multiplier: 1.0,
        maxRandomStats: 1,
        randomStatRange: [0.8, 1.0],
        glowColor: 'rgba(158, 158, 158, 0.3)'
    },
    RARE: { 
        name: '稀有', 
        nameEn: 'Rare',
        color: '#2196f3', 
        weight: 60,
        multiplier: 1.3,
        maxRandomStats: 2,
        randomStatRange: [0.9, 1.2],
        glowColor: 'rgba(33, 150, 243, 0.4)'
    },
    EPIC: { 
        name: '史诗', 
        nameEn: 'Epic',
        color: '#9c27b0', 
        weight: 30,
        multiplier: 1.6,
        maxRandomStats: 3,
        randomStatRange: [1.0, 1.4],
        glowColor: 'rgba(156, 39, 176, 0.5)'
    },
    LEGENDARY: { 
        name: '传说', 
        nameEn: 'Legendary',
        color: '#ff9800', 
        weight: 12,
        multiplier: 2.0,
        maxRandomStats: 4,
        randomStatRange: [1.2, 1.6],
        glowColor: 'rgba(255, 152, 0, 0.6)'
    },
    MYTHIC: { 
        name: '神话', 
        nameEn: 'Mythic',
        color: '#e91e63', 
        weight: 4,
        multiplier: 2.5,
        maxRandomStats: 5,
        randomStatRange: [1.4, 2.0],
        glowColor: 'rgba(233, 30, 99, 0.7)'
    }
};

// ==================== 属性定义 ====================
const StatDefinitions = {
    // 基础属性
    maxHealth: { name: '最大生命值', icon: '❤️', baseRange: [20, 100], isPercent: false },
    healthRegen: { name: '生命回复', icon: '💚', baseRange: [1, 10], isPercent: false, perSecond: true },
    maxEnergy: { name: '最大能量', icon: '⚡', baseRange: [10, 50], isPercent: false },
    energyRegen: { name: '能量恢复', icon: '🔋', baseRange: [1, 8], isPercent: false, perSecond: true },
    speed: { name: '移动速度', icon: '👟', baseRange: [0.05, 0.25], isPercent: true },
    defense: { name: '防御力', icon: '🛡️', baseRange: [0.05, 0.30], isPercent: true },
    
    // 攻击属性
    bulletDamage: { name: '攻击力', icon: '⚔️', baseRange: [0.10, 0.50], isPercent: true },
    bulletSpeed: { name: '子弹速度', icon: '💨', baseRange: [0.10, 0.40], isPercent: true },
    bulletSize: { name: '子弹大小', icon: '⭕', baseRange: [0.10, 0.35], isPercent: true },
    fireRate: { name: '射速', icon: '🔥', baseRange: [0.10, 0.50], isPercent: true },
    criticalChance: { name: '暴击率', icon: '💥', baseRange: [0.05, 0.25], isPercent: true },
    criticalDamage: { name: '暴击伤害', icon: '💫', baseRange: [0.20, 0.80], isPercent: true },
    
    // 特殊属性
    dodgeChance: { name: '闪避率', icon: '🌀', baseRange: [0.05, 0.25], isPercent: true },
    lifesteal: { name: '吸血', icon: '🩸', baseRange: [0.03, 0.15], isPercent: true },
    flashCooldown: { name: '闪现冷却', icon: '⏱️', baseRange: [-0.15, -0.40], isPercent: true, isNegative: true },
    flashDistance: { name: '闪现距离', icon: '✨', baseRange: [0.15, 0.50], isPercent: true },
    pickupRange: { name: '拾取范围', icon: '🧲', baseRange: [20, 80], isPercent: false },
    expBonus: { name: '经验加成', icon: '📚', baseRange: [0.10, 0.50], isPercent: true },
    coinBonus: { name: '金币加成', icon: '💰', baseRange: [0.10, 0.50], isPercent: true }
};

// ==================== Buff效果系统 ====================
const BuffTypes = {
    // 触发型Buff
    ON_HIT: 'onHit',
    ON_KILL: 'onKill',
    ON_DODGE: 'onDodge',
    ON_CRITICAL: 'onCritical',
    ON_DAMAGE_TAKEN: 'onDamageTaken',
    ON_HEAL: 'onHeal',
    
    // 持续型Buff
    PASSIVE: 'passive',
    ON_EQUIP: 'onEquip',
    ON_UNEQUIP: 'onUnequip'
};

const BuffDefinitions = {
    // 攻击触发
    burnOnHit: {
        id: 'burnOnHit',
        name: '灼烧',
        icon: '🔥',
        description: '攻击时有概率点燃敌人',
        type: BuffTypes.ON_HIT,
        triggerChance: 0.15,
        effect: {
            damagePerSecond: 10,
            duration: 3
        }
    },
    slowOnHit: {
        id: 'slowOnHit',
        name: '冰冻',
        icon: '❄️',
        description: '攻击时有概率减速敌人',
        type: BuffTypes.ON_HIT,
        triggerChance: 0.20,
        effect: {
            slowAmount: 0.4,
            duration: 2
        }
    },
    chainLightning: {
        id: 'chainLightning',
        name: '连锁闪电',
        icon: '⚡',
        description: '攻击时有概率触发连锁闪电',
        type: BuffTypes.ON_HIT,
        triggerChance: 0.10,
        effect: {
            chainCount: 3,
            damagePercent: 0.3,
            range: 150
        }
    },
    
    // 击杀触发
    healOnKill: {
        id: 'healOnKill',
        name: '嗜血',
        icon: '🩸',
        description: '击杀敌人时恢复生命值',
        type: BuffTypes.ON_KILL,
        effect: {
            healAmount: 15
        }
    },
    explosionOnKill: {
        id: 'explosionOnKill',
        name: '爆裂',
        icon: '💥',
        description: '击杀敌人时产生爆炸',
        type: BuffTypes.ON_KILL,
        effect: {
            radius: 80,
            damage: 30
        }
    },
    
    // 闪避触发
    speedOnDodge: {
        id: 'speedOnDodge',
        name: '疾风',
        icon: '🌬️',
        description: '成功闪避后获得移动速度提升',
        type: BuffTypes.ON_DODGE,
        effect: {
            speedBonus: 0.5,
            duration: 2
        }
    },
    
    // 暴击触发
    extraDamageOnCrit: {
        id: 'extraDamageOnCrit',
        name: '致命一击',
        icon: '💀',
        description: '暴击时造成额外伤害',
        type: BuffTypes.ON_CRITICAL,
        effect: {
            extraDamagePercent: 0.5
        }
    },
    
    // 受伤触发
    thorns: {
        id: 'thorns',
        name: '荆棘',
        icon: '🌵',
        description: '受到伤害时反弹伤害',
        type: BuffTypes.ON_DAMAGE_TAKEN,
        effect: {
            reflectPercent: 0.25
        }
    },
    shieldOnDamage: {
        id: 'shieldOnDamage',
        name: '守护',
        icon: '🛡️',
        description: '受到伤害时获得临时护盾',
        type: BuffTypes.ON_DAMAGE_TAKEN,
        triggerChance: 0.20,
        effect: {
            shieldAmount: 30,
            duration: 3
        }
    },
    
    // 被动效果
    regenAura: {
        id: 'regenAura',
        name: '生命光环',
        icon: '💚',
        description: '周围持续恢复生命值',
        type: BuffTypes.PASSIVE,
        effect: {
            healPerSecond: 2,
            range: 100
        }
    },
    damageAura: {
        id: 'damageAura',
        name: '灼热光环',
        icon: '🔥',
        description: '周围敌人持续受到伤害',
        type: BuffTypes.PASSIVE,
        effect: {
            damagePerSecond: 5,
            range: 80
        }
    }
};

// ==================== 武器效果系统 ====================
const WeaponFireModes = {
    SINGLE: 'single',
    SPREAD: 'spread',
    BURST: 'burst',
    EXPLOSIVE: 'explosive',
    PIERCE: 'pierce',
    HOMING: 'homing',
    LIGHTNING: 'lightning',
    BEAM: 'beam',
    WAVE: 'wave',
    RAIN: 'rain'
};

const WeaponDefinitions = {
    // 散射武器
    spread: {
        name: '散射',
        description: '发射多发子弹形成扇形攻击',
        icon: '🎯',
        defaultStats: {
            projectileCount: 5,
            spreadAngle: Math.PI / 4,
            damage: 60,
            cooldown: 0.8
        }
    },
    
    // 爆炸武器
    explosive: {
        name: '爆炸',
        description: '发射爆炸弹丸造成范围伤害',
        icon: '💣',
        defaultStats: {
            damage: 150,
            radius: 60,
            speed: 10,
            cooldown: 1.5
        }
    },
    
    // 穿透武器
    pierce: {
        name: '穿透',
        description: '发射可穿透多个敌人的子弹',
        icon: '🗡️',
        defaultStats: {
            damage: 80,
            speed: 15,
            pierceCount: 3,
            cooldown: 0.6
        }
    },
    
    // 追踪武器
    homing: {
        name: '追踪',
        description: '发射自动追踪敌人的导弹',
        icon: '🚀',
        defaultStats: {
            damage: 50,
            speed: 8,
            homingStrength: 0.05,
            cooldown: 0.4
        }
    },
    
    // 闪电武器
    lightning: {
        name: '闪电',
        description: '召唤闪电链式攻击多个敌人',
        icon: '⚡',
        defaultStats: {
            damage: 120,
            chainCount: 4,
            range: 200,
            cooldown: 1.0
        }
    },
    
    // 光束武器
    beam: {
        name: '光束',
        description: '发射持续伤害的光束',
        icon: '💡',
        defaultStats: {
            damagePerTick: 15,
            range: 250,
            width: 30,
            tickRate: 0.1,
            cooldown: 0.1
        }
    },
    
    // 波浪武器
    wave: {
        name: '波浪',
        description: '发射穿透性的能量波',
        icon: '🌊',
        defaultStats: {
            damage: 100,
            width: 150,
            speed: 6,
            cooldown: 1.2
        }
    },
    
    // 火雨武器
    rain: {
        name: '火雨',
        description: '召唤从天而降的火焰',
        icon: '☄️',
        defaultStats: {
            damage: 30,
            areaWidth: 300,
            duration: 2,
            dropRate: 0.2,
            cooldown: 3.0
        }
    }
};

// ==================== 掉落概率算法 ====================
class DropProbabilityCalculator {
    static calculateDropChance(rarity, bossLevel = 1, playerLuck = 0) {
        const baseChance = rarity.weight / 206;
        const levelBonus = Math.min(bossLevel * 0.05, 0.5);
        const luckBonus = playerLuck * 0.01;
        return Math.min(baseChance * (1 + levelBonus + luckBonus), 0.95);
    }
    
    static selectRarity(bossLevel = 1, playerLuck = 0) {
        const rarities = Object.values(DropRarity);
        const adjustedWeights = rarities.map(r => {
            let weight = r.weight;
            if (bossLevel >= 5 && r === DropRarity.LEGENDARY) weight *= 2;
            if (bossLevel >= 10 && r === DropRarity.MYTHIC) weight *= 3;
            weight *= (1 + playerLuck * 0.02);
            return weight;
        });
        
        const totalWeight = adjustedWeights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < rarities.length; i++) {
            random -= adjustedWeights[i];
            if (random <= 0) return rarities[i];
        }
        return DropRarity.COMMON;
    }
    
    static selectDropType() {
        const roll = Math.random();
        if (roll < 0.15) return DropType.WEAPON;
        if (roll < 0.45) return DropType.ACCESSORY;
        if (roll < 0.70) return DropType.SOUVENIR;
        return DropType.CONSUMABLE;
    }
}

// ==================== 属性生成器 ====================
class ItemStatGenerator {
    static generateRandomStats(rarity, type) {
        const stats = {};
        const numStats = Math.floor(Math.random() * (rarity.maxRandomStats + 1));
        
        if (numStats === 0) return stats;
        
        const availableStats = Object.keys(StatDefinitions).filter(stat => {
            if (type === DropType.WEAPON) {
                return ['bulletDamage', 'bulletSpeed', 'bulletSize', 'fireRate', 'criticalChance', 'criticalDamage'].includes(stat);
            }
            return true;
        });
        
        const selectedStats = this.shuffleArray([...availableStats]).slice(0, numStats);
        
        selectedStats.forEach(statKey => {
            const def = StatDefinitions[statKey];
            const [min, max] = def.baseRange;
            const [rarityMin, rarityMax] = rarity.randomStatRange;
            
            const baseValue = min + Math.random() * (max - min);
            const finalValue = baseValue * (rarityMin + Math.random() * (rarityMax - rarityMin));
            
            stats[statKey] = def.isPercent ? 
                Math.round(finalValue * 100) / 100 : 
                Math.round(finalValue);
        });
        
        return stats;
    }
    
    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

// ==================== Buff效果生成器 ====================
class BuffGenerator {
    static generateBuff(rarity) {
        const buffChance = {
            [DropRarity.COMMON.name]: 0,
            [DropRarity.RARE.name]: 0.15,
            [DropRarity.EPIC.name]: 0.35,
            [DropRarity.LEGENDARY.name]: 0.60,
            [DropRarity.MYTHIC.name]: 0.85
        };
        
        if (Math.random() > buffChance[rarity.name]) return null;
        
        const availableBuffs = Object.values(BuffDefinitions);
        const buff = availableBuffs[Math.floor(Math.random() * availableBuffs.length)];
        
        return {
            ...buff,
            power: rarity.multiplier
        };
    }
}

// ==================== 完整掉落物池 ====================
const BossDropPool = {
    souvenirs: [
        {
            id: 'souvenir_hydra_skull',
            name: '九头蛇头颅',
            description: '九头蛇的首级，象征着战胜了多头恶魔的荣耀',
            icon: '💀',
            type: DropType.SOUVENIR,
            rarity: DropRarity.LEGENDARY,
            sourceBoss: '九头蛇',
            flavorText: '"九个头颅，九条命，如今只剩这一个。"',
            baseStats: { expBonus: 0.2, coinBonus: 0.15 }
        },
        {
            id: 'souvenir_flame_heart',
            name: '炎魔之心',
            description: '炎魔的核心，燃烧着永不熄灭的火焰',
            icon: '🔥',
            type: DropType.SOUVENIR,
            rarity: DropRarity.EPIC,
            sourceBoss: '炎魔',
            flavorText: '"火焰是生命的本质，也是毁灭的源头。"',
            baseStats: { expBonus: 0.15 }
        },
        {
            id: 'souvenir_titan_core',
            name: '泰坦核心',
            description: '泰坦巨人的能量核心，蕴含着毁灭性的力量',
            icon: '💎',
            type: DropType.SOUVENIR,
            rarity: DropRarity.LEGENDARY,
            sourceBoss: '泰坦',
            flavorText: '"这颗核心曾是世界的支柱。"',
            baseStats: { coinBonus: 0.25 }
        },
        {
            id: 'souvenir_thunder_hammer',
            name: '雷神之锤碎片',
            description: '雷神武器的碎片，依然闪烁着电光',
            icon: '⚡',
            type: DropType.SOUVENIR,
            rarity: DropRarity.EPIC,
            sourceBoss: '雷神',
            flavorText: '"雷霆万钧，一击必杀。"',
            baseStats: { expBonus: 0.12, coinBonus: 0.12 }
        },
        {
            id: 'souvenir_chaos_crown',
            name: '混沌王冠',
            description: '混沌之王的力量象征，蕴含着无尽混沌',
            icon: '👑',
            type: DropType.SOUVENIR,
            rarity: DropRarity.MYTHIC,
            sourceBoss: '混沌之王',
            flavorText: '"混沌是秩序的终点，也是新生的起点。"',
            baseStats: { expBonus: 0.3, coinBonus: 0.3 }
        }
    ],
    
    accessories: [
        {
            id: 'accessory_hydra_amulet',
            name: '九头蛇护符',
            description: '蕴含九头蛇生命力的护符',
            icon: '📿',
            type: DropType.ACCESSORY,
            rarity: DropRarity.LEGENDARY,
            sourceBoss: '九头蛇',
            baseStats: { maxHealth: 50, healthRegen: 3 },
            possibleBuffs: ['regenAura', 'healOnKill']
        },
        {
            id: 'accessory_flame_ring',
            name: '炎魔戒指',
            description: '燃烧着永恒火焰的戒指',
            icon: '💍',
            type: DropType.ACCESSORY,
            rarity: DropRarity.EPIC,
            sourceBoss: '炎魔',
            baseStats: { bulletDamage: 0.25, criticalChance: 0.12 },
            possibleBuffs: ['burnOnHit', 'damageAura']
        },
        {
            id: 'accessory_titan_gauntlet',
            name: '泰坦护手',
            description: '泰坦巨人的护手，坚不可摧',
            icon: '🧤',
            type: DropType.ACCESSORY,
            rarity: DropRarity.EPIC,
            sourceBoss: '泰坦',
            baseStats: { defense: 0.25, maxHealth: 30 },
            possibleBuffs: ['thorns', 'shieldOnDamage']
        },
        {
            id: 'accessory_thunder_amulet',
            name: '雷霆护符',
            description: '蕴含雷电之力的护符',
            icon: '⚡',
            type: DropType.ACCESSORY,
            rarity: DropRarity.RARE,
            sourceBoss: '雷神',
            baseStats: { flashCooldown: -0.25, flashDistance: 0.35, speed: 0.1 },
            possibleBuffs: ['chainLightning', 'speedOnDodge']
        },
        {
            id: 'accessory_chaos_cloak',
            name: '混沌披风',
            description: '混沌之王遗留的神秘披风',
            icon: '🧥',
            type: DropType.ACCESSORY,
            rarity: DropRarity.LEGENDARY,
            sourceBoss: '混沌之王',
            baseStats: { dodgeChance: 0.20, speed: 0.15, criticalDamage: 0.4 },
            possibleBuffs: ['speedOnDodge', 'extraDamageOnCrit']
        },
        {
            id: 'accessory_vampire_fang',
            name: '吸血鬼獠牙',
            description: '散发着血腥气息的獠牙',
            icon: '🦷',
            type: DropType.ACCESSORY,
            rarity: DropRarity.EPIC,
            sourceBoss: '炎魔',
            baseStats: { lifesteal: 0.08, criticalDamage: 0.35 },
            possibleBuffs: ['healOnKill']
        },
        {
            id: 'accessory_ice_crystal',
            name: '冰霜水晶',
            description: '永恒冻结的水晶',
            icon: '❄️',
            type: DropType.ACCESSORY,
            rarity: DropRarity.RARE,
            sourceBoss: '泰坦',
            baseStats: { fireRate: 0.20, bulletSpeed: 0.15 },
            possibleBuffs: ['slowOnHit']
        }
    ],
    
    weapons: [
        {
            id: 'weapon_hydra_breath',
            name: '九头蛇吐息',
            description: '发射多发子弹的扇形攻击',
            icon: '🐉',
            type: DropType.WEAPON,
            rarity: DropRarity.MYTHIC,
            sourceBoss: '九头蛇',
            weaponStats: {
                fireMode: WeaponFireModes.SPREAD,
                projectileCount: 9,
                damage: 70,
                cooldown: 0.8,
                spreadAngle: Math.PI / 3
            }
        },
        {
            id: 'weapon_flame_burst',
            name: '炎魔爆裂',
            description: '发射爆炸火球造成范围伤害',
            icon: '🔥',
            type: DropType.WEAPON,
            rarity: DropRarity.LEGENDARY,
            sourceBoss: '炎魔',
            weaponStats: {
                fireMode: WeaponFireModes.EXPLOSIVE,
                damage: 180,
                radius: 70,
                speed: 10,
                cooldown: 1.8
            }
        },
        {
            id: 'weapon_titan_hammer',
            name: '泰坦之锤',
            description: '发射重型弹丸造成大范围伤害',
            icon: '🔨',
            type: DropType.WEAPON,
            rarity: DropRarity.EPIC,
            sourceBoss: '泰坦',
            weaponStats: {
                fireMode: WeaponFireModes.EXPLOSIVE,
                damage: 220,
                radius: 90,
                speed: 8,
                cooldown: 2.2
            }
        },
        {
            id: 'weapon_thunder_strike',
            name: '雷霆一击',
            description: '召唤闪电从天而降攻击多个敌人',
            icon: '⚡',
            type: DropType.WEAPON,
            rarity: DropRarity.RARE,
            sourceBoss: '雷神',
            weaponStats: {
                fireMode: WeaponFireModes.LIGHTNING,
                damage: 150,
                chainCount: 4,
                range: 180,
                cooldown: 1.0
            }
        },
        {
            id: 'weapon_chaos_blade',
            name: '混沌之刃',
            description: '发射穿透敌人的混沌刀刃',
            icon: '🗡️',
            type: DropType.WEAPON,
            rarity: DropRarity.LEGENDARY,
            sourceBoss: '混沌之王',
            weaponStats: {
                fireMode: WeaponFireModes.PIERCE,
                damage: 130,
                speed: 18,
                pierceCount: 6,
                cooldown: 1.0
            }
        },
        {
            id: 'weapon_homing_missile',
            name: '追踪导弹',
            description: '发射自动追踪敌人的导弹',
            icon: '🚀',
            type: DropType.WEAPON,
            rarity: DropRarity.EPIC,
            sourceBoss: '混沌之王',
            weaponStats: {
                fireMode: WeaponFireModes.HOMING,
                damage: 60,
                speed: 7,
                homingStrength: 0.06,
                cooldown: 0.5
            }
        }
    ]
};

// 首领击杀成就定义
const BossKillAchievements = [
    {
        id: 'achievement_first_blood',
        name: '初次击杀',
        description: '击败第一个首领',
        icon: '🏆',
        requirement: { type: 'total_kills', value: 1 },
        reward: { coins: 100 }
    },
    {
        id: 'achievement_hydra_slayer',
        name: '九头蛇终结者',
        description: '击败九头蛇',
        icon: '🐍',
        requirement: { type: 'boss_kill', bossId: 'hydra', value: 1 },
        reward: { coins: 200 }
    },
    {
        id: 'achievement_boss_hunter',
        name: '首领猎手',
        description: '击败10个首领',
        icon: '⚔️',
        requirement: { type: 'total_kills', value: 10 },
        reward: { coins: 500 }
    },
    {
        id: 'achievement_boss_master',
        name: '首领大师',
        description: '击败50个首领',
        icon: '👑',
        requirement: { type: 'total_kills', value: 50 },
        reward: { coins: 2000 }
    }
];

// 导出
try {
    module.exports = { 
        DropType, DropRarity, StatDefinitions, BuffTypes, BuffDefinitions,
        WeaponFireModes, WeaponDefinitions, DropProbabilityCalculator,
        ItemStatGenerator, BuffGenerator, BossDropPool, BossKillAchievements
    };
} catch (e) {
    window.DropType = DropType;
    window.DropRarity = DropRarity;
    window.StatDefinitions = StatDefinitions;
    window.BuffTypes = BuffTypes;
    window.BuffDefinitions = BuffDefinitions;
    window.WeaponFireModes = WeaponFireModes;
    window.WeaponDefinitions = WeaponDefinitions;
    window.DropProbabilityCalculator = DropProbabilityCalculator;
    window.ItemStatGenerator = ItemStatGenerator;
    window.BuffGenerator = BuffGenerator;
    window.BossDropPool = BossDropPool;
    window.BossKillAchievements = BossKillAchievements;
}
