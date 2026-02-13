/**
 * 卡牌系统 - 肉鸽元素卡牌抽取系统
 * 每3波敌人进攻后触发卡牌抽取，玩家可选择一张卡牌获得永久增益
 *
 * Mythic Snake - Copyright (C) 2024 Mythic Snake Team
 * All rights reserved. Unauthorized commercial use strictly prohibited.
 */

// 卡牌稀有度定义
const CardRarity = {
    COMMON: { name: '普通', color: '#ffffff', bgColor: '#2c3e50', weight: 60 },
    RARE: { name: '稀有', color: '#3498db', bgColor: '#1a5276', weight: 25 },
    EPIC: { name: '史诗', color: '#9b59b6', bgColor: '#6c3483', weight: 12 },
    LEGENDARY: { name: '传说', color: '#f39c12', bgColor: '#b7950b', weight: 3 }
};

// 卡牌效果类型
const CardEffectType = {
    // 属性增长类
    MAX_HEALTH: 'maxHealth',
    HEALTH_REGEN: 'healthRegen',
    SPEED: 'speed',
    DEFENSE: 'defense',
    ENERGY_MAX: 'energyMax',
    ENERGY_REGEN: 'energyRegen',
    
    // 武器升级类
    BULLET_DAMAGE: 'bulletDamage',
    BULLET_SIZE: 'bulletSize',
    BULLET_SPEED: 'bulletSpeed',
    
    // 射速增加类
    FIRE_RATE: 'fireRate',
    
    // 多弹发射类
    MULTI_SHOT: 'multiShot',
    SPREAD_SHOT: 'spreadShot',
    
    // 特殊效果类
    CRITICAL_CHANCE: 'criticalChance',
    DODGE_CHANCE: 'dodgeChance',
    LIFESTEAL: 'lifesteal',
    
    // 技能增强类
    FLASH_COOLDOWN: 'flashCooldown',
    FLASH_DISTANCE: 'flashDistance'
};

// 卡牌池定义
const CardPool = [
    // ========== 属性增长类 ==========
    {
        id: 'health_boost_1',
        name: '生命强化 I',
        description: '最大生命值 +20',
        icon: '❤️',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.MAX_HEALTH,
        effectValue: 20,
        maxStacks: 5
    },
    {
        id: 'health_boost_2',
        name: '生命强化 II',
        description: '最大生命值 +50',
        icon: '❤️',
        rarity: CardRarity.RARE,
        effectType: CardEffectType.MAX_HEALTH,
        effectValue: 50,
        maxStacks: 3
    },
    {
        id: 'health_regen_1',
        name: '生命回复 I',
        description: '生命回复速度 +2/秒',
        icon: '💚',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.HEALTH_REGEN,
        effectValue: 2,
        maxStacks: 5
    },
    {
        id: 'health_regen_2',
        name: '生命回复 II',
        description: '生命回复速度 +5/秒',
        icon: '💚',
        rarity: CardRarity.RARE,
        effectType: CardEffectType.HEALTH_REGEN,
        effectValue: 5,
        maxStacks: 3
    },
    {
        id: 'speed_boost_1',
        name: '疾风 I',
        description: '移动速度 +10%',
        icon: '💨',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.SPEED,
        effectValue: 0.1,
        isPercentage: true,
        maxStacks: 5
    },
    {
        id: 'speed_boost_2',
        name: '疾风 II',
        description: '移动速度 +20%',
        icon: '💨',
        rarity: CardRarity.RARE,
        effectType: CardEffectType.SPEED,
        effectValue: 0.2,
        isPercentage: true,
        maxStacks: 3
    },
    {
        id: 'defense_1',
        name: '铁壁 I',
        description: '受到伤害减少 10%',
        icon: '🛡️',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.DEFENSE,
        effectValue: 0.1,
        isPercentage: true,
        maxStacks: 5
    },
    {
        id: 'defense_2',
        name: '铁壁 II',
        description: '受到伤害减少 20%',
        icon: '🛡️',
        rarity: CardRarity.RARE,
        effectType: CardEffectType.DEFENSE,
        effectValue: 0.2,
        isPercentage: true,
        maxStacks: 3
    },
    {
        id: 'energy_max_1',
        name: '能量池 I',
        description: '最大能量 +20',
        icon: '⚡',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.ENERGY_MAX,
        effectValue: 20,
        maxStacks: 5
    },
    {
        id: 'energy_regen_1',
        name: '能量恢复 I',
        description: '能量恢复速度 +2/秒',
        icon: '🔋',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.ENERGY_REGEN,
        effectValue: 2,
        maxStacks: 5
    },
    
    // ========== 武器升级类 ==========
    {
        id: 'bullet_damage_1',
        name: '穿透弹 I',
        description: '子弹伤害 +50%',
        icon: '💥',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.BULLET_DAMAGE,
        effectValue: 0.5,
        isPercentage: true,
        maxStacks: 5
    },
    {
        id: 'bullet_size_1',
        name: '巨型弹 I',
        description: '子弹大小 +30%',
        icon: '🔴',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.BULLET_SIZE,
        effectValue: 0.3,
        isPercentage: true,
        maxStacks: 5
    },
    {
        id: 'bullet_speed_1',
        name: '速射弹 I',
        description: '子弹速度 +20%',
        icon: '➡️',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.BULLET_SPEED,
        effectValue: 0.2,
        isPercentage: true,
        maxStacks: 5
    },
    
    // ========== 射速增加类 ==========
    {
        id: 'fire_rate_1',
        name: '急速射击 I',
        description: '射速 +30%',
        icon: '🔥',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.FIRE_RATE,
        effectValue: 0.3,
        isPercentage: true,
        maxStacks: 5
    },
    {
        id: 'fire_rate_2',
        name: '急速射击 II',
        description: '射速 +50%',
        icon: '🔥',
        rarity: CardRarity.RARE,
        effectType: CardEffectType.FIRE_RATE,
        effectValue: 0.5,
        isPercentage: true,
        maxStacks: 3
    },
    {
        id: 'fire_rate_3',
        name: '狂暴射击',
        description: '射速 +100%',
        icon: '🔥',
        rarity: CardRarity.EPIC,
        effectType: CardEffectType.FIRE_RATE,
        effectValue: 1.0,
        isPercentage: true,
        maxStacks: 1
    },
    
    // ========== 多弹发射类 ==========
    {
        id: 'multi_shot_1',
        name: '双发',
        description: '同时发射 2 颗子弹',
        icon: '🎯',
        rarity: CardRarity.RARE,
        effectType: CardEffectType.MULTI_SHOT,
        effectValue: 2,
        maxStacks: 1
    },
    {
        id: 'multi_shot_2',
        name: '三连发',
        description: '同时发射 3 颗子弹',
        icon: '🎯',
        rarity: CardRarity.EPIC,
        effectType: CardEffectType.MULTI_SHOT,
        effectValue: 3,
        maxStacks: 1
    },
    {
        id: 'spread_shot_1',
        name: '散射 I',
        description: '发射扇形弹幕 (3发)',
        icon: '🌸',
        rarity: CardRarity.RARE,
        effectType: CardEffectType.SPREAD_SHOT,
        effectValue: 3,
        maxStacks: 1
    },
    {
        id: 'spread_shot_2',
        name: '散射 II',
        description: '发射扇形弹幕 (5发)',
        icon: '🌸',
        rarity: CardRarity.EPIC,
        effectType: CardEffectType.SPREAD_SHOT,
        effectValue: 5,
        maxStacks: 1
    },
    
    // ========== 特殊效果类 ==========
    {
        id: 'critical_1',
        name: '暴击 I',
        description: '暴击率 +15%',
        icon: '⚡',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.CRITICAL_CHANCE,
        effectValue: 0.15,
        isPercentage: true,
        maxStacks: 5
    },
    {
        id: 'critical_2',
        name: '暴击 II',
        description: '暴击率 +30%',
        icon: '⚡',
        rarity: CardRarity.RARE,
        effectType: CardEffectType.CRITICAL_CHANCE,
        effectValue: 0.3,
        isPercentage: true,
        maxStacks: 3
    },
    {
        id: 'dodge_1',
        name: '闪避 I',
        description: '闪避率 +10%',
        icon: '✨',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.DODGE_CHANCE,
        effectValue: 0.1,
        isPercentage: true,
        maxStacks: 5
    },
    {
        id: 'dodge_2',
        name: '闪避 II',
        description: '闪避率 +20%',
        icon: '✨',
        rarity: CardRarity.RARE,
        effectType: CardEffectType.DODGE_CHANCE,
        effectValue: 0.2,
        isPercentage: true,
        maxStacks: 3
    },
    {
        id: 'lifesteal_1',
        name: '吸血 I',
        description: '造成伤害时回复 5% 生命',
        icon: '🩸',
        rarity: CardRarity.RARE,
        effectType: CardEffectType.LIFESTEAL,
        effectValue: 0.05,
        isPercentage: true,
        maxStacks: 5
    },
    {
        id: 'lifesteal_2',
        name: '吸血 II',
        description: '造成伤害时回复 10% 生命',
        icon: '🩸',
        rarity: CardRarity.EPIC,
        effectType: CardEffectType.LIFESTEAL,
        effectValue: 0.1,
        isPercentage: true,
        maxStacks: 3
    },
    
    // ========== 技能增强类 ==========
    {
        id: 'flash_cooldown_1',
        name: '闪现精通 I',
        description: '闪现冷却 -20%',
        icon: '⚡',
        rarity: CardRarity.COMMON,
        effectType: CardEffectType.FLASH_COOLDOWN,
        effectValue: -0.2,
        isPercentage: true,
        maxStacks: 3
    },
    {
        id: 'flash_distance_1',
        name: '闪现距离 I',
        description: '闪现距离 +30%',
        icon: '🌟',
        rarity: CardRarity.RARE,
        effectType: CardEffectType.FLASH_DISTANCE,
        effectValue: 0.3,
        isPercentage: true,
        maxStacks: 3
    },
    
    // ========== 传说卡牌 ==========
    {
        id: 'legendary_health',
        name: '不朽之躯',
        description: '最大生命值 +100，生命回复 +10/秒',
        icon: '👑',
        rarity: CardRarity.LEGENDARY,
        effectType: CardEffectType.MAX_HEALTH,
        effectValue: 100,
        secondaryEffect: {
            type: CardEffectType.HEALTH_REGEN,
            value: 10
        },
        maxStacks: 1
    },
    {
        id: 'legendary_damage',
        name: '毁灭之刃',
        description: '子弹伤害 +100%，暴击率 +50%',
        icon: '⚔️',
        rarity: CardRarity.LEGENDARY,
        effectType: CardEffectType.BULLET_DAMAGE,
        effectValue: 1.0,
        isPercentage: true,
        secondaryEffect: {
            type: CardEffectType.CRITICAL_CHANCE,
            value: 0.5,
            isPercentage: true
        },
        maxStacks: 1
    },
    {
        id: 'legendary_speed',
        name: '神速',
        description: '移动速度 +50%，闪现冷却 -50%',
        icon: '🌀',
        rarity: CardRarity.LEGENDARY,
        effectType: CardEffectType.SPEED,
        effectValue: 0.5,
        isPercentage: true,
        secondaryEffect: {
            type: CardEffectType.FLASH_COOLDOWN,
            value: -0.5,
            isPercentage: true
        },
        maxStacks: 1
    }
];

/**
 * 卡牌系统类
 */
class CardSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        // 玩家已获得的卡牌
        this.ownedCards = {};
        
        // 卡牌效果缓存
        this.activeEffects = {};
        
        // 触发间隔（每N波触发）
        this.triggerInterval = 3;
        
        // 上次触发的波次
        this.lastTriggeredWave = 0;
        
        // 当前抽取的卡牌选项
        this.currentChoices = [];
        
        // UI状态
        this.isShowingUI = false;
        
        // 初始化UI
        this.initUI();
    }
    
    /**
     * 初始化卡牌UI - 科技感界面
     */
    initUI() {
        // 创建卡牌选择界面容器
        const container = document.createElement('div');
        container.id = 'card-selection-container';
        container.className = 'card-selection-container hidden';
        container.innerHTML = `
            <div class="card-selection-overlay"></div>
            <div class="card-selection-panel">
                <!-- 装饰性角落元素 -->
                <div class="panel-corner panel-corner-tl"></div>
                <div class="panel-corner panel-corner-tr"></div>
                <div class="panel-corner panel-corner-bl"></div>
                <div class="panel-corner panel-corner-br"></div>
                
                <div class="card-selection-header">
                    <div class="header-decoration">
                        <span class="deco-line"></span>
                        <span class="deco-diamond"></span>
                        <span class="deco-line"></span>
                    </div>
                    <h2>
                        <span class="title-bracket">[</span>
                        选择卡牌
                        <span class="title-bracket">]</span>
                    </h2>
                    <p class="card-selection-subtitle">SELECT YOUR UPGRADE</p>
                </div>
                <div class="card-selection-cards" id="card-choices-container">
                    <!-- 卡牌将通过JavaScript动态生成 -->
                </div>
                <div class="card-selection-footer">
                    <div class="footer-line"></div>
                    <span class="footer-text">SYSTEM READY</span>
                    <div class="footer-line"></div>
                </div>
            </div>
        `;
        
        document.getElementById('game-container').appendChild(container);
        
        // 添加样式
        this.addStyles();
    }
    
    /**
     * 添加卡牌系统样式 - 科技感UI设计
     */
    addStyles() {
        if (document.getElementById('card-system-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'card-system-styles';
        style.textContent = `
            /* ========================================
               科技感卡牌系统 - 设计系统变量
               ======================================== */
            :root {
                --tech-cyan: #00d4ff;
                --tech-purple: #b347ff;
                --tech-pink: #ff006e;
                --tech-gold: #ffd700;
                --tech-green: #00ff88;
                --tech-orange: #ff6b35;
                --bg-dark: #0a0a0f;
                --bg-darker: #050508;
                --bg-card: rgba(15, 15, 25, 0.95);
                --border-glow: rgba(0, 212, 255, 0.3);
                --text-primary: #ffffff;
                --text-secondary: #a0a0b0;
                --text-muted: #606070;
            }

            /* ========================================
               主容器样式
               ======================================== */
            .card-selection-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                            visibility 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: 'Segoe UI', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            
            .card-selection-container.active {
                opacity: 1;
                visibility: visible;
            }
            
            /* 科技感背景遮罩 - 网格 + 渐变 */
            .card-selection-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: 
                    /* 扫描线效果 */
                    repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(0, 212, 255, 0.03) 2px,
                        rgba(0, 212, 255, 0.03) 4px
                    ),
                    /* 网格图案 */
                    repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 50px,
                        rgba(0, 212, 255, 0.05) 50px,
                        rgba(0, 212, 255, 0.05) 51px
                    ),
                    repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 50px,
                        rgba(0, 212, 255, 0.05) 50px,
                        rgba(0, 212, 255, 0.05) 51px
                    ),
                    /* 径向渐变 */
                    radial-gradient(ellipse at center, rgba(10, 10, 20, 0.9) 0%, rgba(5, 5, 10, 0.98) 100%);
                backdrop-filter: blur(8px);
                animation: overlay-pulse 4s ease-in-out infinite;
            }

            @keyframes overlay-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.95; }
            }

            /* ========================================
               面板样式
               ======================================== */
            .card-selection-panel {
                position: relative;
                z-index: 1;
                max-width: 1000px;
                width: 95%;
                padding: 40px 30px;
                background: linear-gradient(135deg, 
                    rgba(20, 20, 35, 0.9) 0%, 
                    rgba(10, 10, 20, 0.95) 100%);
                border: 1px solid rgba(0, 212, 255, 0.2);
                border-radius: 20px;
                box-shadow: 
                    0 0 60px rgba(0, 212, 255, 0.15),
                    0 0 100px rgba(179, 71, 255, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
            }

            /* 面板装饰角 */
            .card-selection-panel::before,
            .card-selection-panel::after {
                content: '';
                position: absolute;
                width: 30px;
                height: 30px;
                border: 2px solid var(--tech-cyan);
                opacity: 0.6;
            }

            .card-selection-panel::before {
                top: -1px;
                left: -1px;
                border-right: none;
                border-bottom: none;
                border-radius: 20px 0 0 0;
            }

            .card-selection-panel::after {
                bottom: -1px;
                right: -1px;
                border-left: none;
                border-top: none;
                border-radius: 0 0 20px 0;
            }

            /* ========================================
               标题样式
               ======================================== */
            .card-selection-header {
                text-align: center;
                margin-bottom: 40px;
                position: relative;
            }

            .card-selection-header h2 {
                font-size: 2.8em;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0 0 15px 0;
                letter-spacing: 2px;
                text-transform: uppercase;
                background: linear-gradient(135deg, var(--tech-cyan) 0%, var(--tech-purple) 50%, var(--tech-pink) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: none;
                filter: drop-shadow(0 0 30px rgba(0, 212, 255, 0.5));
                animation: title-glow 3s ease-in-out infinite;
            }

            @keyframes title-glow {
                0%, 100% { filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.4)); }
                50% { filter: drop-shadow(0 0 40px rgba(179, 71, 255, 0.6)); }
            }

            .card-selection-subtitle {
                color: var(--text-secondary);
                font-size: 1.1em;
                margin: 0;
                letter-spacing: 3px;
                text-transform: uppercase;
                opacity: 0.8;
            }

            /* 装饰分隔线 */
            .card-selection-header::after {
                content: '';
                display: block;
                width: 200px;
                height: 2px;
                margin: 20px auto 0;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    var(--tech-cyan) 20%, 
                    var(--tech-purple) 50%, 
                    var(--tech-cyan) 80%, 
                    transparent 100%);
                animation: line-scan 2s linear infinite;
            }

            @keyframes line-scan {
                0% { background-position: -200px 0; }
                100% { background-position: 200px 0; }
            }

            /* ========================================
               卡牌容器
               ======================================== */
            .card-selection-cards {
                display: flex;
                justify-content: center;
                gap: 30px;
                flex-wrap: wrap;
                perspective: 1500px;
            }

            /* ========================================
               卡牌主体样式 - 科技感金属质感
               ======================================== */
            .card-item {
                width: 260px;
                height: 380px;
                background: var(--bg-card);
                border-radius: 16px;
                padding: 20px;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                transform-style: preserve-3d;
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                            box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform, box-shadow;
                
                /* 金属边框效果 */
                border: 2px solid transparent;
                background-clip: padding-box;
            }

            /* 卡牌金属边框 - 使用伪元素实现渐变边框 */
            .card-item::before {
                content: '';
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                border-radius: 18px;
                background: linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.1) 0%,
                    rgba(255, 255, 255, 0.05) 25%,
                    rgba(0, 0, 0, 0.1) 50%,
                    rgba(255, 255, 255, 0.05) 75%,
                    rgba(255, 255, 255, 0.1) 100%);
                z-index: -2;
                opacity: 0.8;
            }

            /* 卡牌内部网格纹理 */
            .card-item::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    /* 电路图案 */
                    linear-gradient(90deg, transparent 49%, rgba(0, 212, 255, 0.03) 50%, transparent 51%),
                    linear-gradient(0deg, transparent 49%, rgba(0, 212, 255, 0.03) 50%, transparent 51%);
                background-size: 20px 20px;
                pointer-events: none;
                z-index: 0;
                opacity: 0.5;
            }

            /* 卡牌顶部发光条 */
            .card-item .card-top-glow {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, 
                    var(--card-accent, var(--tech-cyan)) 0%, 
                    rgba(255, 255, 255, 0.8) 50%, 
                    var(--card-accent, var(--tech-cyan)) 100%);
                border-radius: 16px 16px 0 0;
                box-shadow: 0 0 20px var(--card-accent, var(--tech-cyan)),
                            0 0 40px var(--card-accent, var(--tech-cyan));
            }

            /* 扫描光效 */
            .card-item .card-scan-line {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 100%;
                background: linear-gradient(180deg, 
                    transparent 0%, 
                    rgba(0, 212, 255, 0.1) 50%, 
                    transparent 100%);
                transform: translateY(-100%);
                pointer-events: none;
                z-index: 10;
            }

            .card-item:hover .card-scan-line {
                animation: scan-effect 1.5s linear infinite;
            }

            @keyframes scan-effect {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
            }

            /* ========================================
               悬停效果 - 上浮 + 阴影增强
               ======================================== */
            .card-item:hover {
                transform: translateY(-8px) scale(1.02);
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.5),
                    0 0 40px var(--card-accent, var(--tech-cyan)),
                    inset 0 0 30px rgba(0, 212, 255, 0.05);
            }

            /* 点击波纹效果容器 */
            .card-item .ripple-container {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                overflow: hidden;
                border-radius: 16px;
                pointer-events: none;
                z-index: 20;
            }

            .card-item .ripple {
                position: absolute;
                border-radius: 50%;
                background: radial-gradient(circle, 
                    rgba(0, 212, 255, 0.4) 0%, 
                    transparent 70%);
                transform: scale(0);
                animation: ripple-effect 0.6s ease-out forwards;
            }

            @keyframes ripple-effect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }

            /* ========================================
               稀有度样式 - 科技感配色
               ======================================== */
            .card-item.rarity-common {
                --card-accent: #8899aa;
                --card-glow: rgba(136, 153, 170, 0.3);
                border-color: rgba(136, 153, 170, 0.3);
            }

            .card-item.rarity-common:hover {
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.5),
                    0 0 40px rgba(136, 153, 170, 0.3);
            }

            .card-item.rarity-rare {
                --card-accent: var(--tech-cyan);
                --card-glow: rgba(0, 212, 255, 0.4);
                border-color: rgba(0, 212, 255, 0.4);
                background: linear-gradient(145deg, 
                    rgba(0, 40, 60, 0.9) 0%, 
                    rgba(10, 20, 35, 0.95) 100%);
            }

            .card-item.rarity-rare:hover {
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.5),
                    0 0 50px rgba(0, 212, 255, 0.4),
                    0 0 80px rgba(0, 212, 255, 0.2);
            }

            .card-item.rarity-epic {
                --card-accent: var(--tech-purple);
                --card-glow: rgba(179, 71, 255, 0.4);
                border-color: rgba(179, 71, 255, 0.4);
                background: linear-gradient(145deg, 
                    rgba(50, 20, 70, 0.9) 0%, 
                    rgba(20, 10, 35, 0.95) 100%);
            }

            .card-item.rarity-epic:hover {
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.5),
                    0 0 50px rgba(179, 71, 255, 0.4),
                    0 0 80px rgba(179, 71, 255, 0.2);
            }

            .card-item.rarity-legendary {
                --card-accent: var(--tech-gold);
                --card-glow: rgba(255, 215, 0, 0.5);
                border-color: rgba(255, 215, 0, 0.5);
                background: linear-gradient(145deg, 
                    rgba(60, 50, 20, 0.9) 0%, 
                    rgba(30, 25, 10, 0.95) 100%);
                animation: legendary-pulse 2s ease-in-out infinite;
            }

            .card-item.rarity-legendary:hover {
                box-shadow: 
                    0 20px 60px rgba(0, 0, 0, 0.5),
                    0 0 60px rgba(255, 215, 0, 0.5),
                    0 0 100px rgba(255, 215, 0, 0.3);
            }

            @keyframes legendary-pulse {
                0%, 100% { 
                    box-shadow: 
                        0 10px 40px rgba(0, 0, 0, 0.5),
                        0 0 30px rgba(255, 215, 0, 0.3);
                }
                50% { 
                    box-shadow: 
                        0 10px 40px rgba(0, 0, 0, 0.5),
                        0 0 50px rgba(255, 215, 0, 0.5),
                        0 0 80px rgba(255, 215, 0, 0.2);
                }
            }

            /* ========================================
               卡牌内容样式
               ======================================== */
            .card-rarity {
                position: absolute;
                top: 15px;
                right: 15px;
                font-size: 0.7em;
                padding: 4px 12px;
                border-radius: 20px;
                background: linear-gradient(135deg, 
                    var(--card-accent, var(--tech-cyan)) 0%, 
                    rgba(255, 255, 255, 0.2) 100%);
                color: var(--bg-dark);
                font-weight: 700;
                letter-spacing: 1px;
                text-transform: uppercase;
                box-shadow: 0 0 15px var(--card-glow, var(--border-glow));
                z-index: 5;
            }

            .card-icon {
                font-size: 4.5em;
                text-align: center;
                margin: 25px 0 15px;
                filter: drop-shadow(0 0 20px var(--card-accent, var(--tech-cyan)));
                position: relative;
                z-index: 5;
                animation: icon-float 3s ease-in-out infinite;
            }

            @keyframes icon-float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }

            .card-name {
                font-size: 1.4em;
                font-weight: 700;
                color: var(--text-primary);
                text-align: center;
                margin-bottom: 12px;
                letter-spacing: 1px;
                text-shadow: 0 0 20px var(--card-accent, var(--tech-cyan));
                position: relative;
                z-index: 5;
            }

            .card-description {
                font-size: 0.95em;
                color: var(--text-secondary);
                text-align: center;
                line-height: 1.6;
                padding: 12px 15px;
                background: rgba(0, 0, 0, 0.4);
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.05);
                position: relative;
                z-index: 5;
                backdrop-filter: blur(5px);
            }

            /* 高亮数值 */
            .card-description .highlight {
                color: var(--tech-cyan);
                font-weight: 700;
                text-shadow: 0 0 10px var(--tech-cyan);
            }

            .card-stacks {
                position: absolute;
                bottom: 15px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 0.8em;
                color: var(--text-muted);
                letter-spacing: 1px;
                z-index: 5;
            }

            .card-stacks span {
                color: var(--tech-cyan);
                font-weight: 700;
            }

            /* ========================================
               选中状态
               ======================================== */
            .card-item.selected {
                transform: translateY(-15px) scale(1.05);
                border-color: var(--card-accent, var(--tech-cyan));
                box-shadow: 
                    0 0 50px var(--card-glow, var(--border-glow)),
                    0 0 100px var(--card-glow, var(--border-glow)),
                    inset 0 0 50px rgba(0, 212, 255, 0.1);
            }

            /* ========================================
               禁用状态
               ======================================== */
            .card-item.disabled {
                opacity: 0.4;
                cursor: not-allowed;
                filter: grayscale(50%);
            }

            .card-item.disabled:hover {
                transform: none;
                box-shadow: none;
            }

            .card-item.disabled .card-scan-line {
                display: none;
            }

            /* ========================================
               卡牌出现动画 - 3D翻转
               ======================================== */
            .card-item.appearing {
                animation: card-appear-3d 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes card-appear-3d {
                0% {
                    opacity: 0;
                    transform: translateY(80px) rotateY(-180deg) rotateX(10deg) scale(0.8);
                    filter: blur(10px);
                }
                50% {
                    opacity: 0.5;
                    filter: blur(5px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) rotateY(0) rotateX(0) scale(1);
                    filter: blur(0);
                }
            }

            /* ========================================
               卡牌选中动画 - 脉冲消失
               ======================================== */
            .card-item.selecting {
                animation: card-select-pulse 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }

            @keyframes card-select-pulse {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                30% {
                    transform: scale(1.15);
                    box-shadow: 
                        0 0 80px var(--card-glow, var(--border-glow)),
                        0 0 120px var(--card-glow, var(--border-glow));
                }
                60% {
                    transform: scale(1.1);
                }
                100% {
                    transform: scale(0.8);
                    opacity: 0;
                    filter: blur(10px);
                }
            }

            /* ========================================
               加载骨架屏效果
               ======================================== */
            .card-item.loading {
                background: linear-gradient(90deg, 
                    var(--bg-card) 0%, 
                    rgba(30, 30, 50, 0.9) 50%, 
                    var(--bg-card) 100%);
                background-size: 200% 100%;
                animation: skeleton-shimmer 1.5s ease-in-out infinite;
            }

            .card-item.loading .card-icon,
            .card-item.loading .card-name,
            .card-item.loading .card-description,
            .card-item.loading .card-rarity {
                background: rgba(40, 40, 60, 0.8);
                border-radius: 8px;
                color: transparent;
                text-shadow: none;
                filter: none;
            }

            .card-item.loading .card-icon {
                height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .card-item.loading .card-name {
                height: 30px;
                margin: 0 auto 12px;
                width: 80%;
            }

            .card-item.loading .card-description {
                height: 60px;
            }

            @keyframes skeleton-shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            /* ========================================
               响应式设计
               ======================================== */
            @media (max-width: 900px) {
                .card-selection-cards {
                    gap: 20px;
                }
                
                .card-item {
                    width: 240px;
                    height: 360px;
                }
            }

            @media (max-width: 768px) {
                .card-selection-panel {
                    padding: 30px 20px;
                }

                .card-selection-header h2 {
                    font-size: 2em;
                }

                .card-selection-subtitle {
                    font-size: 0.9em;
                    letter-spacing: 2px;
                }
                
                .card-selection-cards {
                    flex-direction: column;
                    align-items: center;
                    gap: 25px;
                }
                
                .card-item {
                    width: 280px;
                    height: 400px;
                }
                
                .card-icon {
                    font-size: 4em;
                }
                
                .card-name {
                    font-size: 1.3em;
                }

                .card-description {
                    font-size: 0.9em;
                }
            }

            @media (max-width: 480px) {
                .card-selection-panel {
                    padding: 20px 15px;
                    border-radius: 15px;
                }

                .card-selection-header h2 {
                    font-size: 1.6em;
                }

                .card-selection-header {
                    margin-bottom: 25px;
                }
                
                .card-item {
                    width: 260px;
                    height: 380px;
                }

                .card-icon {
                    font-size: 3.5em;
                    margin: 20px 0 10px;
                }
            }

            /* ========================================
               性能优化 - GPU加速
               ======================================== */
            .card-item,
            .card-item::before,
            .card-item::after,
            .card-scan-line,
            .ripple {
                will-change: transform, opacity;
                backface-visibility: hidden;
                -webkit-font-smoothing: antialiased;
            }

            /* ========================================
               装饰性元素样式
               ======================================== */
            /* 面板角落装饰 */
            .panel-corner {
                position: absolute;
                width: 20px;
                height: 20px;
                pointer-events: none;
            }

            .panel-corner::before,
            .panel-corner::after {
                content: '';
                position: absolute;
                background: var(--tech-cyan);
                box-shadow: 0 0 10px var(--tech-cyan);
            }

            .panel-corner-tl {
                top: 0;
                left: 0;
            }
            .panel-corner-tl::before {
                top: 0;
                left: 0;
                width: 20px;
                height: 2px;
            }
            .panel-corner-tl::after {
                top: 0;
                left: 0;
                width: 2px;
                height: 20px;
            }

            .panel-corner-tr {
                top: 0;
                right: 0;
            }
            .panel-corner-tr::before {
                top: 0;
                right: 0;
                width: 20px;
                height: 2px;
            }
            .panel-corner-tr::after {
                top: 0;
                right: 0;
                width: 2px;
                height: 20px;
            }

            .panel-corner-bl {
                bottom: 0;
                left: 0;
            }
            .panel-corner-bl::before {
                bottom: 0;
                left: 0;
                width: 20px;
                height: 2px;
            }
            .panel-corner-bl::after {
                bottom: 0;
                left: 0;
                width: 2px;
                height: 20px;
            }

            .panel-corner-br {
                bottom: 0;
                right: 0;
            }
            .panel-corner-br::before {
                bottom: 0;
                right: 0;
                width: 20px;
                height: 2px;
            }
            .panel-corner-br::after {
                bottom: 0;
                right: 0;
                width: 2px;
                height: 20px;
            }

            /* 标题装饰 */
            .header-decoration {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 15px;
            }

            .deco-line {
                width: 60px;
                height: 1px;
                background: linear-gradient(90deg, transparent, var(--tech-cyan), transparent);
            }

            .deco-diamond {
                width: 8px;
                height: 8px;
                background: var(--tech-cyan);
                transform: rotate(45deg);
                margin: 0 15px;
                box-shadow: 0 0 15px var(--tech-cyan);
                animation: diamond-pulse 2s ease-in-out infinite;
            }

            @keyframes diamond-pulse {
                0%, 100% { 
                    box-shadow: 0 0 10px var(--tech-cyan);
                    transform: rotate(45deg) scale(1);
                }
                50% { 
                    box-shadow: 0 0 25px var(--tech-cyan);
                    transform: rotate(45deg) scale(1.2);
                }
            }

            .title-bracket {
                color: var(--tech-cyan);
                font-weight: 300;
                margin: 0 10px;
                opacity: 0.8;
                animation: bracket-blink 1.5s ease-in-out infinite;
            }

            @keyframes bracket-blink {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 0.4; }
            }

            /* 底部状态栏 */
            .card-selection-footer {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 30px;
                padding-top: 20px;
            }

            .footer-line {
                flex: 1;
                max-width: 100px;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
            }

            .footer-text {
                color: var(--text-muted);
                font-size: 0.75em;
                letter-spacing: 3px;
                margin: 0 20px;
                text-transform: uppercase;
                animation: text-flicker 3s ease-in-out infinite;
            }

            @keyframes text-flicker {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }

            /* 减少动画偏好支持 */
            @media (prefers-reduced-motion: reduce) {
                .card-item,
                .card-selection-overlay,
                .card-selection-header h2,
                .card-icon,
                .deco-diamond,
                .title-bracket,
                .footer-text {
                    animation: none !important;
                    transition: opacity 0.3s ease !important;
                }

                .card-item:hover {
                    transform: none;
                }

                .card-item.appearing {
                    animation: card-appear-simple 0.3s ease forwards !important;
                }

                @keyframes card-appear-simple {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 检查是否应该触发卡牌抽取
     * @param {number} currentWave - 当前波次
     */
    checkTrigger(currentWave) {
        if (currentWave > 0 && currentWave % this.triggerInterval === 0 && currentWave !== this.lastTriggeredWave) {
            this.lastTriggeredWave = currentWave;
            this.triggerCardSelection();
            return true;
        }
        return false;
    }
    
    /**
     * 触发卡牌抽取
     */
    triggerCardSelection() {
        console.log('[CardSystem] triggerCardSelection called');
        this.pauseGame();
        
        this.currentChoices = this.drawCards(3);
        
        this.showCardSelectionUI();
    }
    
    pauseGame() {
        this.previousGameState = this.gameManager.gameState;
        this.gameManager.gameState = 'cardSelection';
    }
    
    resumeGame() {
        console.log('[CardSystem] resumeGame called');
        
        const currentWave = this.gameManager.waveSystem?.currentWave || 0;
        const bossManager = this.gameManager.bossManager;
        
        // 卡牌选择完成后，检查是否应该生成BOSS（每3波）
        if (currentWave > 0 && currentWave % 3 === 0 && bossManager) {
            const alreadyDefeated = bossManager.defeatedBosses.includes(currentWave);
            console.log(`[CardSystem] Checking boss spawn: wave=${currentWave}, alreadyDefeated=${alreadyDefeated}, isWarningActive=${bossManager.isWarningActive}`);
            
            if (!alreadyDefeated && !bossManager.isWarningActive && !bossManager.currentBoss) {
                console.log('[CardSystem] Starting boss warning after card selection');
                bossManager.startBossWarning(currentWave);
            }
        }
        
        this.gameManager.gameState = this.previousGameState || 'playing';
    }
    
    /**
     * 从卡牌池中抽取指定数量的卡牌
     * @param {number} count - 抽取数量
     * @returns {Array} 抽取的卡牌数组
     */
    drawCards(count) {
        const availableCards = this.getAvailableCards();
        const selectedCards = [];
        const usedIds = new Set();
        
        // 使用加权随机选择
        while (selectedCards.length < count && availableCards.length > 0) {
            const card = this.weightedRandomSelect(availableCards, usedIds);
            if (card) {
                selectedCards.push(card);
                usedIds.add(card.id);
            }
        }
        
        return selectedCards;
    }
    
    /**
     * 获取可用的卡牌列表（排除已达到最大叠加次数的卡牌）
     * @returns {Array} 可用卡牌数组
     */
    getAvailableCards() {
        return CardPool.filter(card => {
            const owned = this.ownedCards[card.id];
            return !owned || owned.stacks < card.maxStacks;
        });
    }
    
    /**
     * 加权随机选择卡牌
     * @param {Array} cards - 卡牌数组
     * @param {Set} usedIds - 已使用的卡牌ID集合
     * @returns {Object} 选中的卡牌
     */
    weightedRandomSelect(cards, usedIds) {
        const availableCards = cards.filter(c => !usedIds.has(c.id));
        if (availableCards.length === 0) return null;
        
        // 计算总权重
        const totalWeight = availableCards.reduce((sum, card) => sum + card.rarity.weight, 0);
        
        // 随机选择
        let random = Math.random() * totalWeight;
        for (const card of availableCards) {
            random -= card.rarity.weight;
            if (random <= 0) {
                return card;
            }
        }
        
        return availableCards[0];
    }
    
    /**
     * 显示卡牌选择UI
     */
    showCardSelectionUI() {
        this.isShowingUI = true;
        
        const container = document.getElementById('card-selection-container');
        const choicesContainer = document.getElementById('card-choices-container');
        
        // 清空之前的卡牌
        choicesContainer.innerHTML = '';
        
        // 创建卡牌元素
        this.currentChoices.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            choicesContainer.appendChild(cardElement);
            
            // 添加出现动画延迟
            setTimeout(() => {
                cardElement.classList.add('appearing');
            }, index * 150);
        });
        
        // 显示容器
        container.classList.remove('hidden');
        setTimeout(() => {
            container.classList.add('active');
        }, 10);
        
        // 播放音效
        if (this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playSound('cardDraw');
        }
    }
    
    /**
     * 创建卡牌元素 - 科技感UI
     * @param {Object} card - 卡牌数据
     * @param {number} index - 卡牌索引
     * @returns {HTMLElement} 卡牌元素
     */
    createCardElement(card, index) {
        const element = document.createElement('div');
        element.className = `card-item rarity-${card.rarity.name.toLowerCase()}`;
        element.dataset.cardId = card.id;
        
        const owned = this.ownedCards[card.id];
        const currentStacks = owned ? owned.stacks : 0;
        const canSelect = currentStacks < card.maxStacks;
        
        if (!canSelect) {
            element.classList.add('disabled');
        }
        
        const rarityClass = card.rarity.name.toLowerCase();
        
        // 高亮描述中的数值
        const highlightedDescription = card.description.replace(
            /(\+?\d+%?|\d+\/\d+)/g, 
            '<span class="highlight">$1</span>'
        );
        
        element.innerHTML = `
            <!-- 顶部发光条 -->
            <div class="card-top-glow"></div>
            
            <!-- 扫描光效 -->
            <div class="card-scan-line"></div>
            
            <!-- 波纹效果容器 -->
            <div class="ripple-container"></div>
            
            <span class="card-rarity" style="background: linear-gradient(135deg, ${card.rarity.color} 0%, rgba(255,255,255,0.3) 100%); color: ${rarityClass === 'common' ? '#000' : '#fff'}">${card.rarity.name}</span>
            <div class="card-icon">${card.icon}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-description">${highlightedDescription}</div>
            ${card.maxStacks > 1 ? `<div class="card-stacks">已拥有: <span>${currentStacks}/${card.maxStacks}</span></div>` : ''}
        `;
        
        // 添加点击事件（包含波纹效果）
        if (canSelect) {
            element.addEventListener('click', (e) => {
                // 创建波纹效果
                this.createRipple(e, element);
                // 选择卡牌
                this.selectCard(card, element);
            });
        }
        
        // 添加悬停效果
        element.addEventListener('mouseenter', () => {
            if (canSelect) {
                if (this.gameManager.systems.audioManager) {
                    this.gameManager.systems.audioManager.playSound('cardHover');
                }
            }
        });
        
        return element;
    }
    
    /**
     * 创建点击波纹效果
     * @param {Event} event - 点击事件
     * @param {HTMLElement} element - 卡牌元素
     */
    createRipple(event, element) {
        const rippleContainer = element.querySelector('.ripple-container');
        if (!rippleContainer) return;
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        rippleContainer.appendChild(ripple);
        
        // 动画结束后移除波纹元素
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }
    
    /**
     * 选择卡牌
     * @param {Object} card - 选中的卡牌
     * @param {HTMLElement} element - 卡牌元素
     */
    selectCard(card, element) {
        // 播放选中动画
        element.classList.add('selecting');
        
        // 播放音效
        if (this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playSound('cardSelect');
        }
        
        // 应用卡牌效果
        setTimeout(() => {
            this.applyCard(card);
            this.hideCardSelectionUI();
            this.resumeGame();
            
            // 显示获得卡牌通知
            if (this.gameManager.systems.notificationManager) {
                this.gameManager.systems.notificationManager.showNotification(
                    `${card.icon} 获得卡牌: ${card.name}`,
                    card.rarity.color,
                    'success',
                    3
                );
            }
        }, 500);
    }
    
    /**
     * 应用卡牌效果
     * @param {Object} card - 卡牌数据
     */
    applyCard(card) {
        // 记录拥有的卡牌
        if (!this.ownedCards[card.id]) {
            this.ownedCards[card.id] = {
                card: card,
                stacks: 0
            };
        }
        this.ownedCards[card.id].stacks++;
        
        // 更新效果缓存
        this.updateActiveEffects();
        
        // 应用效果到玩家
        this.applyEffectsToPlayer();
    }
    
    /**
     * 更新活跃效果缓存
     */
    updateActiveEffects() {
        this.activeEffects = {};
        
        for (const key in this.ownedCards) {
            const owned = this.ownedCards[key];
            const card = owned.card;
            const stacks = owned.stacks;
            
            // 主效果
            const effectType = card.effectType;
            if (!this.activeEffects[effectType]) {
                this.activeEffects[effectType] = {
                    value: 0,
                    isPercentage: card.isPercentage || false
                };
            }
            
            if (card.isPercentage) {
                this.activeEffects[effectType].value += card.effectValue * stacks;
            } else {
                this.activeEffects[effectType].value += card.effectValue * stacks;
            }
            
            // 副效果
            if (card.secondaryEffect) {
                const secondaryType = card.secondaryEffect.type;
                if (!this.activeEffects[secondaryType]) {
                    this.activeEffects[secondaryType] = {
                        value: 0,
                        isPercentage: card.secondaryEffect.isPercentage || false
                    };
                }
                this.activeEffects[secondaryType].value += card.secondaryEffect.value * stacks;
            }
        }
    }
    
    /**
     * 应用效果到玩家
     */
    applyEffectsToPlayer() {
        const player = this.gameManager.player;
        if (!player) return;
        
        // 应用生命值效果
        if (this.activeEffects[CardEffectType.MAX_HEALTH]) {
            const bonus = this.activeEffects[CardEffectType.MAX_HEALTH].value;
            const oldMax = 100;
            const newMax = oldMax + bonus;
            player.maxHealth = newMax;
            // 按比例恢复生命
            if (player.health) {
                player.health = Math.min(player.health + bonus, newMax);
            }
        }
        
        // 应用生命回复效果
        if (this.activeEffects[CardEffectType.HEALTH_REGEN]) {
            player.healthRegenRate = 5 + this.activeEffects[CardEffectType.HEALTH_REGEN].value;
        }
        
        // 应用速度效果
        if (this.activeEffects[CardEffectType.SPEED]) {
            const multiplier = 1 + this.activeEffects[CardEffectType.SPEED].value;
            player.speed = 10 * multiplier;
            player.maxSpeed = 15 * multiplier;
            player.baseSpeed = 5 * multiplier;
        }
        
        // 应用防御效果
        if (this.activeEffects[CardEffectType.DEFENSE]) {
            player.defense = this.activeEffects[CardEffectType.DEFENSE].value;
        }
        
        // 应用能量效果
        if (this.activeEffects[CardEffectType.ENERGY_MAX] && player.energySystem) {
            const bonus = this.activeEffects[CardEffectType.ENERGY_MAX].value;
            player.energySystem.maxEnergy = 100 + bonus;
        }
        
        if (this.activeEffects[CardEffectType.ENERGY_REGEN] && player.energySystem) {
            player.energySystem.passiveRecovery.baseRate = 2 + this.activeEffects[CardEffectType.ENERGY_REGEN].value;
        }
        
        // 应用闪现效果
        if (this.activeEffects[CardEffectType.FLASH_COOLDOWN] && player.flashSkill) {
            const reduction = this.activeEffects[CardEffectType.FLASH_COOLDOWN].value;
            player.flashSkill.cooldown = 4 * (1 + reduction);
        }
        
        if (this.activeEffects[CardEffectType.FLASH_DISTANCE] && player.flashSkill) {
            const multiplier = 1 + this.activeEffects[CardEffectType.FLASH_DISTANCE].value;
            player.flashSkill.flashDistance = player.height * 2 * multiplier;
        }
        
        // 应用子弹系统效果
        if (this.gameManager.systems.bulletSystem) {
            const bulletSystem = this.gameManager.systems.bulletSystem;
            
            // 子弹伤害
            if (this.activeEffects[CardEffectType.BULLET_DAMAGE]) {
                const multiplier = 1 + this.activeEffects[CardEffectType.BULLET_DAMAGE].value;
                bulletSystem.config.bulletDamage = 9999 * multiplier;
            }
            
            // 子弹大小
            if (this.activeEffects[CardEffectType.BULLET_SIZE]) {
                const multiplier = 1 + this.activeEffects[CardEffectType.BULLET_SIZE].value;
                bulletSystem.config.bulletSize = 16 * multiplier;
            }
            
            // 子弹速度
            if (this.activeEffects[CardEffectType.BULLET_SPEED]) {
                const multiplier = 1 + this.activeEffects[CardEffectType.BULLET_SPEED].value;
                bulletSystem.config.bulletSpeed = 10 * multiplier;
            }
            
            // 射速
            if (this.activeEffects[CardEffectType.FIRE_RATE]) {
                const multiplier = 1 + this.activeEffects[CardEffectType.FIRE_RATE].value;
                bulletSystem.config.fireRate = 2 * multiplier;
                bulletSystem.fireInterval = 1 / bulletSystem.config.fireRate;
            }
            
            // 多弹发射
            if (this.activeEffects[CardEffectType.MULTI_SHOT]) {
                bulletSystem.config.multiShot = this.activeEffects[CardEffectType.MULTI_SHOT].value;
            }
            
            // 散射
            if (this.activeEffects[CardEffectType.SPREAD_SHOT]) {
                bulletSystem.config.spreadShot = this.activeEffects[CardEffectType.SPREAD_SHOT].value;
            }
        }
        
        // 应用特殊效果到玩家
        if (this.activeEffects[CardEffectType.CRITICAL_CHANCE]) {
            player.criticalChance = this.activeEffects[CardEffectType.CRITICAL_CHANCE].value;
        }
        
        if (this.activeEffects[CardEffectType.DODGE_CHANCE]) {
            player.dodgeChance = this.activeEffects[CardEffectType.DODGE_CHANCE].value;
        }
        
        if (this.activeEffects[CardEffectType.LIFESTEAL]) {
            player.lifesteal = this.activeEffects[CardEffectType.LIFESTEAL].value;
        }
    }
    
    /**
     * 隐藏卡牌选择UI
     */
    hideCardSelectionUI() {
        this.isShowingUI = false;
        
        const container = document.getElementById('card-selection-container');
        container.classList.remove('active');
        
        setTimeout(() => {
            container.classList.add('hidden');
        }, 300);
    }
    
    /**
     * 获取效果值
     * @param {string} effectType - 效果类型
     * @returns {number} 效果值
     */
    getEffectValue(effectType) {
        return this.activeEffects[effectType]?.value || 0;
    }
    
    /**
     * 检查是否有某效果
     * @param {string} effectType - 效果类型
     * @returns {boolean}
     */
    hasEffect(effectType) {
        return this.activeEffects[effectType] !== undefined;
    }
    
    /**
     * 获取已拥有卡牌列表
     * @returns {Array} 卡牌列表
     */
    getOwnedCards() {
        return Object.values(this.ownedCards).map(owned => ({
            ...owned.card,
            currentStacks: owned.stacks
        }));
    }
    
    /**
     * 序列化状态 - 卡牌效果仅当局生效，不保存
     * @returns {Object} 序列化数据
     */
    serialize() {
        return {
            lastTriggeredWave: this.lastTriggeredWave
        };
    }
    
    /**
     * 反序列化状态 - 卡牌效果仅当局生效，不恢复
     * @param {Object} data - 序列化数据
     */
    deserialize(data) {
        if (data.lastTriggeredWave !== undefined) {
            this.lastTriggeredWave = data.lastTriggeredWave;
        }
    }
    
    /**
     * 重置系统 - 游戏开始时调用，清除所有卡牌效果
     */
    reset() {
        this.ownedCards = {};
        this.activeEffects = {};
        this.lastTriggeredWave = 0;
        this.currentChoices = [];
        this.isShowingUI = false;
    }
    
    /**
     * 游戏结束时清除所有效果
     */
    onGameEnd() {
        this.ownedCards = {};
        this.activeEffects = {};
        this.lastTriggeredWave = 0;
        this.currentChoices = [];
        this.isShowingUI = false;
    }
}

// 导出
try {
    module.exports = { CardSystem, CardPool, CardRarity, CardEffectType };
} catch (e) {
    window.CardSystem = CardSystem;
    window.CardPool = CardPool;
    window.CardRarity = CardRarity;
    window.CardEffectType = CardEffectType;
}
