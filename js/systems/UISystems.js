/**
 * UI系统管理类 - 管理游戏中的UI系统，包括器官技能树和事件日志
 */
class UISystems {
    /**
     * 构造函数
     * @param {GameManager} gameManager - 游戏管理器实例
     */
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.organSystem = new OrganSystem(gameManager, this);
        this.eventLogSystem = new EventLogSystem(gameManager, this);
        
        // 初始化UI动画增强系统
        this.initAnimationSystem();
        
        this.initEventListeners();
    }
    
    /**
     * 初始化动画系统
     */
    initAnimationSystem() {
        // 等待DOM加载完成后增强所有UI元素
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.enhanceAllUIElements();
            });
        } else {
            this.enhanceAllUIElements();
        }
    }
    
    /**
     * 增强所有UI元素
     */
    enhanceAllUIElements() {
        if (window.uiElementEnhancer) {
            window.uiElementEnhancer.enhanceAll();
        }
        
        // 添加全局UI样式增强
        this.injectGlobalUIStyles();
    }
    
    /**
     * 注入全局UI样式
     */
    injectGlobalUIStyles() {
        if (document.getElementById('global-ui-enhancements')) return;
        
        const style = document.createElement('style');
        style.id = 'global-ui-enhancements';
        style.textContent = `
            /* 器官系统增强 */
            #organ-system {
                transition: transform 0.3s ease-out, opacity 0.3s ease-out;
            }
            
            .organ-node {
                transition: all 0.3s ease-out;
                position: relative;
                overflow: hidden;
            }
            
            .organ-node:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(155, 89, 182, 0.3);
            }
            
            .organ-node.unlocked {
                animation: nodeUnlock 0.5s ease-out;
            }
            
            @keyframes nodeUnlock {
                0% { transform: scale(0.9); opacity: 0.5; }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .organ-node-icon {
                transition: transform 0.3s ease-out, filter 0.3s ease-out;
            }
            
            .organ-node:hover .organ-node-icon {
                transform: scale(1.1) rotate(5deg);
                filter: drop-shadow(0 0 8px rgba(155, 89, 182, 0.5));
            }
            
            .organ-node-icon.unlocked {
                animation: iconPulse 2s ease-in-out infinite;
            }
            
            @keyframes iconPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            /* 进度条增强 */
            .progress-bar-fill {
                position: relative;
                overflow: hidden;
            }
            
            .progress-bar-fill::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                animation: progressShine 2s infinite;
            }
            
            @keyframes progressShine {
                from { left: -100%; }
                to { left: 100%; }
            }
            
            /* 事件日志增强 */
            #event-log {
                transition: transform 0.3s ease-out;
            }
            
            .event-item {
                animation: eventSlideIn 0.3s ease-out;
                transition: background-color 0.2s ease-out;
            }
            
            @keyframes eventSlideIn {
                from { 
                    transform: translateX(-20px); 
                    opacity: 0; 
                }
                to { 
                    transform: translateX(0); 
                    opacity: 1; 
                }
            }
            
            .event-item:hover {
                background-color: rgba(155, 89, 182, 0.1);
            }
            
            /* 顶部状态栏增强 */
            #top-bar {
                transition: transform 0.3s ease-out;
            }
            
            .stat-item {
                transition: transform 0.2s ease-out, color 0.2s ease-out;
            }
            
            .stat-item:hover {
                transform: scale(1.05);
                color: #f39c12;
            }
            
            .stat-value {
                transition: transform 0.3s ease-out;
            }
            
            .stat-value.changed {
                animation: statValuePop 0.3s ease-out;
            }
            
            @keyframes statValuePop {
                0% { transform: scale(1.3); color: #f39c12; }
                100% { transform: scale(1); }
            }
            
            /* 按钮增强 */
            button, .btn {
                position: relative;
                overflow: hidden;
            }
            
            button::after, .btn::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: width 0.3s ease-out, height 0.3s ease-out;
            }
            
            button:active::after, .btn:active::after {
                width: 200px;
                height: 200px;
            }
            
            /* 面板增强 */
            .panel {
                transition: box-shadow 0.3s ease-out, transform 0.3s ease-out;
            }
            
            .panel:hover {
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            }
            
            /* 标签页增强 */
            .tab {
                transition: all 0.2s ease-out;
            }
            
            .tab.active {
                animation: tabActivate 0.3s ease-out;
            }
            
            @keyframes tabActivate {
                0% { transform: translateY(2px); }
                100% { transform: translateY(0); }
            }
            
            /* 工具提示增强 */
            .tooltip {
                animation: tooltipFadeIn 0.2s ease-out;
            }
            
            @keyframes tooltipFadeIn {
                from { 
                    opacity: 0; 
                    transform: translateY(5px); 
                }
                to { 
                    opacity: 1; 
                    transform: translateY(0); 
                }
            }
            
            /* 加载状态 */
            .loading {
                position: relative;
                pointer-events: none;
            }
            
            .loading::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* 滚动条美化 */
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            
            ::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.1);
                border-radius: 4px;
            }
            
            ::-webkit-scrollbar-thumb {
                background: rgba(155, 89, 182, 0.5);
                border-radius: 4px;
                transition: background 0.2s ease-out;
            }
            
            ::-webkit-scrollbar-thumb:hover {
                background: rgba(155, 89, 182, 0.8);
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 现在器官系统和事件日志是固定显示的，不需要切换按钮
    }
    
    /**
     * 更新UI系统
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        this.organSystem.update(deltaTime);
        this.eventLogSystem.update(deltaTime);
        
        // 定期增强新添加的UI元素
        if (Math.random() < 0.01) {
            if (window.uiElementEnhancer) {
                window.uiElementEnhancer.enhanceAll();
            }
        }
    }
    
    /**
     * 重置UI系统
     */
    reset() {
        this.organSystem.reset();
        this.eventLogSystem.reset();
    }
    
    /**
     * 显示加载动画
     */
    showLoading(container, text = '加载中...') {
        if (window.LoadingAnimation) {
            const loading = new window.LoadingAnimation(container);
            loading.start();
            loading.setText(text);
            return loading;
        }
        return null;
    }
    
    /**
     * 播放UI动画
     */
    playAnimation(element, animationName, duration = 0.3) {
        if (window.microInteractions) {
            switch (animationName) {
                case 'slideIn':
                    window.microInteractions.slideIn(element, 'up', duration);
                    break;
                case 'scaleIn':
                    window.microInteractions.scaleIn(element, duration);
                    break;
                case 'pulse':
                    window.microInteractions.pulse(element, duration);
                    break;
                case 'shake':
                    window.microInteractions.shake(element, duration);
                    break;
                case 'glow':
                    window.microInteractions.addGlow(element);
                    break;
            }
        }
    }
    
    /**
     * 器官系统和事件日志现在是固定显示的，不需要显示方法
     */
}

/**
 * 器官系统类 - 管理技能树系统
 */
class OrganSystem {
    /**
     * 构造函数
     * @param {GameManager} gameManager - 游戏管理器实例
     * @param {UISystems} uiSystems - UI系统管理实例
     */
    constructor(gameManager, uiSystems) {
        this.gameManager = gameManager;
        this.uiSystems = uiSystems;
        this.evolutionPoints = 0;
        this.unlockedOrgans = new Set();
        this.organTree = this.createOrganTree();
        this.container = document.getElementById('organ-system');
        this.organTreeContainer = document.getElementById('organ-tree-container');
        this.evolutionPointsElement = document.getElementById('evolution-points');
        this.isVisible = true;
        this.initializeOrganTree();
    }
    
    /**
     * 创建器官技能树
     * @returns {Array} 器官技能树节点数组
     */
    createOrganTree() {
        return [
            {
                id: 'basic_attack',
                name: '基础攻击',
                description: '增强你的基础攻击能力，提高对敌人的伤害',
                cost: 0,
                effects: '基础伤害 +10%',
                prerequisites: [],
                unlocked: true,
                icon: '⚔️'
            },
            {
                id: 'speed_boost',
                name: '速度提升',
                description: '提高你的移动速度，使你更容易躲避敌人攻击',
                cost: 50,
                effects: '移动速度 +15%',
                prerequisites: ['basic_attack'],
                icon: '💨'
            },
            {
                id: 'energy_efficiency',
                name: '能量效率',
                description: '提高能量使用效率，减少技能消耗',
                cost: 50,
                effects: '能量消耗 -20%',
                prerequisites: ['basic_attack'],
                icon: '⚡'
            },
            {
                id: 'damage_boost',
                name: '伤害增强',
                description: '进一步提高你的攻击能力',
                cost: 50,
                effects: '所有伤害 +20%',
                prerequisites: ['speed_boost'],
                icon: '🔥'
            },
            {
                id: 'energy_regen',
                name: '能量恢复',
                description: '提高能量恢复速度，让你更频繁地使用技能',
                cost: 50,
                effects: '能量恢复速度 +25%',
                prerequisites: ['energy_efficiency'],
                icon: '💖'
            },
            {
                id: 'defense_boost',
                name: '防御增强',
                description: '提高你的防御能力，减少受到的伤害',
                cost: 50,
                effects: '受到伤害 -15%',
                prerequisites: ['damage_boost', 'energy_regen'],
                icon: '🛡️'
            },
            {
                id: 'special_attack',
                name: '特殊攻击',
                description: '解锁特殊攻击技能，造成额外伤害',
                cost: 50,
                effects: '解锁特殊攻击技能',
                prerequisites: ['damage_boost'],
                icon: '🌟'
            },
            {
                id: 'ultimate_ability',
                name: '终极能力',
                description: '解锁强大的终极能力，扭转战局',
                cost: 50,
                effects: '解锁终极能力',
                prerequisites: ['defense_boost', 'special_attack'],
                icon: '💥'
            }
        ];
    }
    
    /**
     * 初始化器官技能树
     */
    initializeOrganTree() {
        if (!this.organTreeContainer) return;
        
        this.organTreeContainer.innerHTML = '';
        const organTreeElement = document.createElement('div');
        organTreeElement.className = 'organ-tree';
        
        this.organTree.forEach(organ => {
            const organNode = this.createOrganNode(organ);
            organTreeElement.appendChild(organNode);
        });
        
        this.organTreeContainer.appendChild(organTreeElement);
        this.updateEvolutionPoints();
    }
    
    /**
     * 创建器官节点元素
     * @param {Object} organ - 器官节点数据
     * @returns {HTMLElement} 器官节点HTML元素
     */
    createOrganNode(organ) {
        const node = document.createElement('div');
        node.className = `organ-node ${organ.unlocked ? 'unlocked' : this.canUnlock(organ) ? '' : 'locked'}`;
        node.dataset.id = organ.id;
        
        const header = document.createElement('div');
        header.className = 'organ-node-header';
        
        const iconContainer = document.createElement('div');
        iconContainer.className = `organ-node-icon ${organ.unlocked ? 'unlocked' : ''}`;
        iconContainer.textContent = organ.icon || '🧬';
        
        const nameContainer = document.createElement('div');
        nameContainer.className = 'organ-node-name-container';
        
        const name = document.createElement('div');
        name.className = 'organ-node-name';
        name.textContent = organ.name;
        
        const cost = document.createElement('div');
        cost.className = 'organ-node-cost';
        cost.textContent = `进化点: ${organ.cost}`;
        
        nameContainer.appendChild(name);
        nameContainer.appendChild(cost);
        
        header.appendChild(iconContainer);
        header.appendChild(nameContainer);
        
        const description = document.createElement('div');
        description.className = 'organ-node-description';
        description.textContent = organ.description;
        
        const effects = document.createElement('div');
        effects.className = 'organ-node-effects';
        effects.textContent = `效果: ${organ.effects}`;
        
        // 显示前置条件
        if (organ.prerequisites && organ.prerequisites.length > 0) {
            const prerequisites = document.createElement('div');
            prerequisites.className = 'organ-node-prerequisites';
            prerequisites.textContent = `前置条件: ${organ.prerequisites.map(prereqId => {
                const prereq = this.organTree.find(o => o.id === prereqId);
                return prereq ? prereq.name : prereqId;
            }).join(', ')}`;
            node.appendChild(prerequisites);
        }
        
        // 添加技能点进度显示
        if (!organ.unlocked) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'organ-node-progress';
            
            // 计算当前进度
            const progress = Math.min(100, (this.evolutionPoints / organ.cost) * 100);
            const progressPercentage = Math.round(progress);
            
            // 创建进度条容器
            const progressBarContainer = document.createElement('div');
            progressBarContainer.className = 'progress-bar-container';
            
            // 创建进度条背景
            const progressBarBackground = document.createElement('div');
            progressBarBackground.className = 'progress-bar-background';
            
            // 创建进度条填充
            const progressBarFill = document.createElement('div');
            progressBarFill.className = 'progress-bar-fill';
            progressBarFill.style.width = `${progress}%`;
            progressBarFill.style.transition = 'width 0.5s ease-in-out';
            
            // 创建进度百分比文本
            const progressText = document.createElement('div');
            progressText.className = 'progress-text';
            progressText.textContent = `${progressPercentage}%`;
            
            // 组装进度条
            progressBarBackground.appendChild(progressBarFill);
            progressBarContainer.appendChild(progressBarBackground);
            progressContainer.appendChild(progressBarContainer);
            progressContainer.appendChild(progressText);
            
            node.appendChild(progressContainer);
        }
        
        node.appendChild(header);
        node.appendChild(description);
        node.appendChild(effects);
        
        // 添加点击事件
        if (!organ.unlocked && this.canUnlock(organ)) {
            node.addEventListener('click', () => {
                this.unlockOrgan(organ.id);
            });
        }
        
        return node;
    }
    
    /**
     * 检查是否可以解锁器官
     * @param {Object} organ - 器官节点数据
     * @returns {boolean} 是否可以解锁
     */
    canUnlock(organ) {
        // 检查前置条件
        const allPrerequisitesUnlocked = organ.prerequisites.every(prereq => {
            return this.unlockedOrgans.has(prereq) || 
                   this.organTree.some(o => o.id === prereq && o.unlocked);
        });
        
        // 检查进化点是否足够
        return allPrerequisitesUnlocked && this.evolutionPoints >= organ.cost;
    }
    
    /**
     * 应用器官效果
     * @param {Object} organ - 器官节点数据
     */
    applyOrganEffects(organ) {
        if (!this.gameManager.player) return;
        
        const player = this.gameManager.player;
        
        switch(organ.id) {
            case 'speed_boost':
                player.speed *= 1.15;
                player.maxSpeed *= 1.15;
                this.showBuffNotification('速度提升', '移动速度 +15%', '#3498db');
                break;
            case 'energy_efficiency':
                if (player.energySystem) {
                    player.energySystem.energyConsumptionMultiplier = player.energySystem.energyConsumptionMultiplier || 1;
                    player.energySystem.energyConsumptionMultiplier *= 0.8;
                    this.showBuffNotification('能量效率', '能量消耗 -20%', '#9b59b6');
                }
                break;
            case 'damage_boost':
                // 添加伤害增强逻辑
                if (!player.damageMultiplier) {
                    player.damageMultiplier = 1;
                }
                player.damageMultiplier *= 1.2;
                this.showBuffNotification('伤害增强', '所有伤害 +20%', '#e74c3c');
                break;
            case 'energy_regen':
                if (player.energySystem) {
                    player.energySystem.energyRegenRate = player.energySystem.energyRegenRate || 3;
                    player.energySystem.energyRegenRate *= 1.25;
                    this.showBuffNotification('能量恢复', '能量恢复速度 +25%', '#f39c12');
                }
                break;
            case 'defense_boost':
                // 添加防御增强逻辑
                if (!player.defenseMultiplier) {
                    player.defenseMultiplier = 1;
                }
                player.defenseMultiplier *= 0.85;
                this.showBuffNotification('防御增强', '受到伤害 -15%', '#27ae60');
                break;
            case 'special_attack':
                // 解锁特殊攻击技能
                player.hasSpecialAttack = true;
                this.showBuffNotification('特殊攻击', '解锁特殊攻击技能', '#8e44ad');
                break;
            case 'ultimate_ability':
                // 解锁终极能力
                player.hasUltimateAbility = true;
                this.showBuffNotification('终极能力', '解锁终极能力', '#c0392b');
                break;
        }
    }
    
    /**
     * 显示buff效果通知
     * @param {string} title - 通知标题
     * @param {string} message - 通知消息
     * @param {string} color - 通知颜色
     */
    showBuffNotification(title, message, color) {
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `${title}: ${message}`,
                color,
                'success',
                2
            );
        }
        
        // 添加到事件日志
        this.gameManager.systems.uiSystems.eventLogSystem.addEvent(
            `解锁buff: ${title} - ${message}`,
            'skill'
        );
    }
    
    /**
     * 重新应用所有已解锁器官的效果
     * 用于游戏状态重置或加载时
     */
    reapplyAllOrganEffects() {
        if (!this.gameManager.player) return;
        
        // 重置玩家的buff效果
        const player = this.gameManager.player;
        player.speed = 7.5; // 重置为基础速度
        player.maxSpeed = 7.5; // 重置为基础最大速度
        player.damageMultiplier = 1; // 重置伤害倍率
        player.defenseMultiplier = 1; // 重置防御倍率
        player.hasSpecialAttack = false; // 重置特殊攻击
        player.hasUltimateAbility = false; // 重置终极能力
        
        if (player.energySystem) {
            player.energySystem.energyConsumptionMultiplier = 1; // 重置能量消耗倍率
            player.energySystem.energyRegenRate = 3; // 重置能量恢复速度
        }
        
        // 重新应用所有已解锁器官的效果
        this.organTree.forEach(organ => {
            if (organ.unlocked) {
                this.applyOrganEffects(organ);
            }
        });
    }
    
    /**
     * 增加进化点
     * @param {number} amount - 增加的进化点数量
     */
    addEvolutionPoints(amount) {
        this.evolutionPoints += amount;
        this.updateEvolutionPoints();
        this.updateProgressDisplays();
        
        // 检查是否有可以自动解锁的技能
        this.checkAutoUnlockSkills();
        
        // 添加事件日志
        this.gameManager.systems.uiSystems.eventLogSystem.addEvent(
            `获得 ${amount} 进化点`,
            'player'
        );
    }
    
    /**
     * 更新进化点显示
     */
    updateEvolutionPoints() {
        if (this.evolutionPointsElement) {
            this.evolutionPointsElement.textContent = this.evolutionPoints;
        }
    }
    
    /**
     * 检查是否有可以自动解锁的技能
     */
    checkAutoUnlockSkills() {
        // 检查所有未解锁的技能
        this.organTree.forEach(organ => {
            if (!organ.unlocked && this.canUnlock(organ)) {
                // 自动解锁技能
                this.unlockOrgan(organ.id);
            }
        });
    }
    
    /**
     * 器官系统现在是固定显示的，不需要切换方法
     */
    
    /**
     * 更新器官系统
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        // 更新技能点进度显示
        this.updateProgressDisplays();
    }
    
    /**
     * 更新技能点进度显示
     */
    updateProgressDisplays() {
        if (!this.organTreeContainer) return;
        
        // 更新所有器官节点的进度显示
        this.organTree.forEach(organ => {
            if (!organ.unlocked) {
                const node = document.querySelector(`.organ-node[data-id="${organ.id}"]`);
                if (node) {
                    const progressContainer = node.querySelector('.organ-node-progress');
                    if (progressContainer) {
                        // 计算当前进度
                        const progress = Math.min(100, (this.evolutionPoints / organ.cost) * 100);
                        const progressPercentage = Math.round(progress);
                        
                        // 更新进度条
                        const progressBarFill = progressContainer.querySelector('.progress-bar-fill');
                        if (progressBarFill) {
                            progressBarFill.style.width = `${progress}%`;
                        }
                        
                        // 更新进度文本
                        const progressText = progressContainer.querySelector('.progress-text');
                        if (progressText) {
                            progressText.textContent = `${progressPercentage}%`;
                        }
                        
                        // 检查是否可以解锁
                        if (this.canUnlock(organ)) {
                            node.classList.remove('locked');
                        } else {
                            node.classList.add('locked');
                        }
                    }
                }
            }
        });
    }
    
    /**
     * 解锁器官
     * @param {string} organId - 器官ID
     */
    unlockOrgan(organId) {
        const organ = this.organTree.find(o => o.id === organId);
        if (!organ) return;
        
        if (this.canUnlock(organ)) {
            this.evolutionPoints -= organ.cost;
            organ.unlocked = true;
            this.unlockedOrgans.add(organId);
            this.initializeOrganTree();
            
            // Animate the unlocked skill
            const skillNode = document.querySelector(`.organ-node[data-id="${organId}"]`);
            if (skillNode) {
                // Add new unlock indicator class
                skillNode.classList.add('newly-unlocked');
                
                // Set initial state
                skillNode.style.transform = 'translateY(-50px)';
                skillNode.style.opacity = '0';
                skillNode.style.transition = 'transform 0.7s ease-out, opacity 0.7s ease-out';
                
                // Trigger reflow
                void skillNode.offsetWidth;
                
                // Set final state
                skillNode.style.transform = 'translateY(0)';
                skillNode.style.opacity = '1';
                
                // Add pulse animation for newly unlocked buff
                skillNode.style.animation = 'pulse 1.5s ease-in-out 3';
                
                // Scroll to the skill after animation completes
                setTimeout(() => {
                    this.scrollToSkill(organId);
                }, 700);
                
                // Remove newly-unlocked class after a period
                setTimeout(() => {
                    skillNode.classList.remove('newly-unlocked');
                }, 5000);
            } else {
                // If no skill node found, scroll immediately
                this.scrollToSkill(organId);
            }
            
            this.updateEvolutionPoints();
            this.updateProgressDisplays();
            
            // 添加事件日志
            this.gameManager.systems.uiSystems.eventLogSystem.addEvent(
                `解锁器官: ${organ.name}`,
                'skill'
            );
            
            // 应用器官效果
            this.applyOrganEffects(organ);
        }
    }
    
    /**
     * 滚动到指定技能
     * @param {string} skillId - 技能ID
     */
    scrollToSkill(skillId) {
        const node = document.querySelector(`.organ-node[data-id="${skillId}"]`);
        if (node && this.container) {
            // 计算滚动位置，使技能节点居中
            const offsetTop = node.offsetTop;
            const scrollTo = offsetTop - (this.container.clientHeight / 2) + (node.clientHeight / 2);
            
            // 平滑滚动
            this.container.scrollTo({
                top: scrollTo,
                behavior: 'smooth'
            });
        }
    }
    
    /**
     * 重置器官系统
     */
    reset() {
        this.evolutionPoints = 0;
        this.unlockedOrgans.clear();
        this.organTree.forEach(organ => {
            organ.unlocked = organ.id === 'basic_attack';
        });
        this.initializeOrganTree();
    }
}

/**
 * 事件日志系统类 - 管理游戏中的事件日志
 */
class EventLogSystem {
    /**
     * 构造函数
     * @param {GameManager} gameManager - 游戏管理器实例
     * @param {UISystems} uiSystems - UI系统管理实例
     */
    constructor(gameManager, uiSystems) {
        this.gameManager = gameManager;
        this.uiSystems = uiSystems;
        this.events = [];
        this.maxEvents = 200;
        this.container = document.getElementById('event-log');
        this.eventLogContainer = document.getElementById('event-log-container');
        this.isVisible = true;
    }
    
    /**
     * 添加事件到日志
     * @param {string} message - 事件消息
     * @param {string} type - 事件类型 (enemy, skill, player, system)
     */
    addEvent(message, type = 'system') {
        const event = {
            id: Date.now() + Math.random(),
            message,
            type,
            timestamp: new Date()
        };
        
        this.events.unshift(event);
        
        // 限制事件数量
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(0, this.maxEvents);
        }
        
        // 更新事件日志显示
        this.updateEventLog();
    }
    
    /**
     * 更新事件日志显示
     */
    updateEventLog() {
        if (!this.eventLogContainer) return;
        
        // 清空容器
        this.eventLogContainer.innerHTML = '';
        
        // 添加事件
        this.events.forEach(event => {
            const eventElement = this.createEventElement(event);
            this.eventLogContainer.appendChild(eventElement);
        });
        
        // 自动滚动到最新事件
        this.eventLogContainer.scrollTop = 0;
    }
    
    /**
     * 创建事件元素
     * @param {Object} event - 事件数据
     * @returns {HTMLElement} 事件HTML元素
     */
    createEventElement(event) {
        const element = document.createElement('div');
        element.className = `event-log-item ${event.type}`;
        
        // 获取事件类型图标
        const getEventIcon = (type) => {
            switch(type) {
                case 'enemy': return '👾';
                case 'skill': return '✨';
                case 'player': return '🐍';
                case 'system': return '📢';
                default: return '📅';
            }
        };
        
        const eventIcon = getEventIcon(event.type);
        
        const iconContainer = document.createElement('span');
        iconContainer.className = 'event-log-icon';
        iconContainer.textContent = eventIcon;
        
        const contentContainer = document.createElement('div');
        contentContainer.className = 'event-log-content';
        
        const time = document.createElement('span');
        time.className = 'event-log-time';
        time.textContent = event.timestamp.toLocaleTimeString('zh-CN', { hour12: false });
        
        const message = document.createElement('span');
        message.className = 'event-log-message';
        message.textContent = event.message;
        
        contentContainer.appendChild(time);
        contentContainer.appendChild(message);
        
        element.appendChild(iconContainer);
        element.appendChild(contentContainer);
        
        return element;
    }
    
    /**
     * 事件日志现在是固定显示的，不需要切换方法
     */
    
    /**
     * 更新事件日志系统
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        // 可以添加动画效果或其他更新逻辑
    }
    
    /**
     * 重置事件日志系统
     */
    reset() {
        this.events = [];
        this.updateEventLog();
    }
    
    /**
     * 清除事件日志
     */
    clearEvents() {
        this.events = [];
        this.updateEventLog();
    }
}

// 导出UI系统类
try {
    module.exports = UISystems;
} catch (e) {
    // 浏览器环境
    window.UISystems = UISystems;
    window.OrganSystem = OrganSystem;
    window.EventLogSystem = EventLogSystem;
}
