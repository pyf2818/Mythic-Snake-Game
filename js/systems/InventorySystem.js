/**
 * 仓库系统 - 管理玩家获得的各类首领掉落物
 * 依赖：DropItemSystem.js
 */

class InventorySystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        this.items = {
            souvenirs: [],
            accessories: [],
            weapons: []
        };
        
        this.equippedItems = {
            accessories: [null, null],
            weapon: null
        };
        
        this.bossKillStats = { total: 0, byBoss: {} };
        this.unlockedAchievements = [];
        this.coins = 0;
        
        this.loadFromStorage();
        this.initUI();
    }
    
    initUI() {
        this.createInventoryUI();
        this.addStyles();
    }
    
    createInventoryUI() {
        const container = document.createElement('div');
        container.id = 'inventory-container';
        container.className = 'inventory-container hidden';
        container.innerHTML = `
            <div class="inventory-overlay"></div>
            <div class="inventory-panel">
                <div class="inventory-header">
                    <h2>📦 仓库</h2>
                    <button class="inventory-close-btn" id="inventory-close-btn">×</button>
                </div>
                <div class="inventory-coins">
                    <span class="coin-icon">💰</span>
                    <span class="coin-amount" id="inventory-coin-amount">${this.coins}</span>
                </div>
                <div class="equipment-section">
                    <h3>当前装备</h3>
                    <div class="equipment-slots-row">
                        <div class="equipped-slot" data-slot="accessory-0">
                            <span class="slot-label">饰品1</span>
                            <div class="slot-content" id="equipped-accessory-0">
                                <span class="slot-placeholder">+</span>
                            </div>
                        </div>
                        <div class="equipped-slot" data-slot="accessory-1">
                            <span class="slot-label">饰品2</span>
                            <div class="slot-content" id="equipped-accessory-1">
                                <span class="slot-placeholder">+</span>
                            </div>
                        </div>
                        <div class="equipped-slot weapon-slot" data-slot="weapon">
                            <span class="slot-label">武器</span>
                            <div class="slot-content" id="equipped-weapon">
                                <span class="slot-placeholder">+</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="inventory-tabs">
                    <button class="inventory-tab active" data-tab="all">全部</button>
                    <button class="inventory-tab" data-tab="souvenirs">纪念品</button>
                    <button class="inventory-tab" data-tab="accessories">饰品</button>
                    <button class="inventory-tab" data-tab="weapons">武器</button>
                </div>
                <div class="inventory-content" id="inventory-content"></div>
                <div class="inventory-details" id="inventory-details">
                    <div class="details-placeholder">选择一个物品查看详情</div>
                </div>
            </div>
        `;
        
        document.getElementById('game-container').appendChild(container);
        this.bindInventoryEvents();
        this.updateEquippedSlotsDisplay();
    }
    
    bindInventoryEvents() {
        const container = document.getElementById('inventory-container');
        
        document.getElementById('inventory-close-btn').addEventListener('click', () => {
            this.hideInventory();
        });
        
        container.querySelectorAll('.inventory-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.inventory-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderInventoryItems(tab.dataset.tab);
            });
        });
        
        container.querySelectorAll('.equipped-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const slotId = slot.dataset.slot;
                this.handleEquippedSlotClick(slotId);
            });
        });
    }
    
    handleEquippedSlotClick(slotId) {
        if (slotId === 'weapon') {
            this.equippedItems.weapon = null;
        } else if (slotId.startsWith('accessory-')) {
            const index = parseInt(slotId.split('-')[1]);
            this.equippedItems.accessories[index] = null;
        }
        this.saveToStorage();
        this.updateEquippedSlotsDisplay();
        this.renderInventoryItems('all');
    }
    
    updateEquippedSlotsDisplay() {
        for (let i = 0; i < 2; i++) {
            const slotElement = document.getElementById(`equipped-accessory-${i}`);
            const item = this.equippedItems.accessories[i];
            if (slotElement) {
                if (item) {
                    slotElement.innerHTML = `
                        <span class="equipped-icon">${item.icon}</span>
                        <span class="equipped-name">${item.name}</span>
                    `;
                    slotElement.classList.add('filled');
                } else {
                    slotElement.innerHTML = '<span class="slot-placeholder">+</span>';
                    slotElement.classList.remove('filled');
                }
            }
        }
        
        const weaponSlot = document.getElementById('equipped-weapon');
        const weapon = this.equippedItems.weapon;
        if (weaponSlot) {
            if (weapon) {
                weaponSlot.innerHTML = `
                    <span class="equipped-icon">${weapon.icon}</span>
                    <span class="equipped-name">${weapon.name}</span>
                `;
                weaponSlot.classList.add('filled');
            } else {
                weaponSlot.innerHTML = '<span class="slot-placeholder">+</span>';
                weaponSlot.classList.remove('filled');
            }
        }
    }
    
    addItem(item) {
        console.log(`=== addItem called ===`);
        console.log(`Item: ${item.name}, type: ${item.type}`);
        
        const itemCopy = {
            ...item,
            instanceId: `${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            obtainedAt: Date.now()
        };
        
        // 生成随机属性
        if (window.ItemStatGenerator && item.type !== DropType.SOUVENIR) {
            const randomStats = ItemStatGenerator.generateRandomStats(item.rarity, item.type);
            itemCopy.randomStats = randomStats;
            itemCopy.baseStats = item.baseStats || item.effects || {};
        }
        
        // 生成Buff效果
        if (window.BuffGenerator && item.type === DropType.ACCESSORY) {
            const buff = BuffGenerator.generateBuff(item.rarity);
            if (buff) itemCopy.buff = buff;
        }
        
        switch (item.type) {
            case DropType.SOUVENIR:
                this.items.souvenirs.push(itemCopy);
                break;
            case DropType.ACCESSORY:
                this.items.accessories.push(itemCopy);
                break;
            case DropType.WEAPON:
                this.items.weapons.push(itemCopy);
                break;
        }
        
        this.saveToStorage();
        this.showItemObtainedNotification(itemCopy);
        console.log(`Item added: ${itemCopy.name}`);
    }
    
    showItemObtainedNotification(item) {
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `${item.icon} 获得物品: ${item.name}`,
                item.rarity.color,
                'success',
                3
            );
        }
    }
    
    onBossKilled(boss) {
        console.log(`onBossKilled called for: ${boss.name}`);
        
        this.bossKillStats.total++;
        const bossId = boss.id || boss.name;
        if (!this.bossKillStats.byBoss[bossId]) {
            this.bossKillStats.byBoss[bossId] = 0;
        }
        this.bossKillStats.byBoss[bossId]++;
        
        this.generateBossDrop(boss);
        this.saveToStorage();
    }
    
    generateBossDrop(boss) {
        const bossName = boss.name;
        const bossX = boss.x + (boss.width || 100) / 2;
        const bossY = boss.y + (boss.height || 100) / 2;
        
        console.log(`=== generateBossDrop === Boss: ${bossName}`);
        
        const possibleDrops = [
            ...BossDropPool.souvenirs.filter(d => d.sourceBoss === bossName),
            ...BossDropPool.accessories.filter(d => d.sourceBoss === bossName),
            ...BossDropPool.weapons.filter(d => d.sourceBoss === bossName)
        ];
        
        console.log(`匹配掉落物: ${possibleDrops.length}`);
        
        if (possibleDrops.length === 0) {
            const allDrops = [...BossDropPool.souvenirs, ...BossDropPool.accessories, ...BossDropPool.weapons];
            if (allDrops.length > 0) {
                const randomDrop = allDrops[Math.floor(Math.random() * allDrops.length)];
                this.createDroppedItem(randomDrop, bossX, bossY);
            }
            return;
        }
        
        const dropCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < dropCount; i++) {
            const drop = this.weightedRandomDrop(possibleDrops);
            if (drop) {
                const offsetX = (Math.random() - 0.5) * 100;
                const offsetY = (Math.random() - 0.5) * 100;
                this.createDroppedItem(drop, bossX + offsetX, bossY + offsetY);
            }
        }
    }
    
    createDroppedItem(drop, x, y) {
        const droppedItem = new DroppedItem(this.gameManager, drop, x, y);
        this.gameManager.addGameObject(droppedItem);
        console.log(`掉落物已创建: ${drop.name}`);
    }
    
    weightedRandomDrop(drops) {
        const totalWeight = drops.reduce((sum, d) => sum + d.rarity.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const drop of drops) {
            random -= drop.rarity.weight;
            if (random <= 0) return drop;
        }
        return drops[0];
    }
    
    equipItem(item, slot) {
        console.log(`equipItem: ${item.name}, slot: ${slot}`);
        
        if (item.type === DropType.ACCESSORY) {
            if (slot < 2) {
                this.equippedItems.accessories[slot] = item;
            }
        } else if (item.type === DropType.WEAPON) {
            this.equippedItems.weapon = item;
        }
        
        this.saveToStorage();
        this.updateEquippedSlotsDisplay();
        this.renderInventoryItems('all');
    }
    
    unequipItem(type, slot) {
        console.log(`unequipItem: ${type}, slot: ${slot}`);
        
        if (type === DropType.ACCESSORY) {
            this.equippedItems.accessories[slot] = null;
        } else if (type === DropType.WEAPON) {
            this.equippedItems.weapon = null;
        }
        
        this.saveToStorage();
        this.updateEquippedSlotsDisplay();
        this.renderInventoryItems('all');
    }
    
    applyEquippedEffects() {
        console.log(`=== applyEquippedEffects ===`);
        const player = this.gameManager.player;
        if (!player) {
            console.log('No player found');
            return;
        }
        
        // 应用饰品效果
        this.equippedItems.accessories.forEach((item, index) => {
            if (item) {
                console.log(`Applying accessory ${index}: ${item.name}`);
                this.applyItemEffects(player, item);
            }
        });
        
        // 应用武器
        if (this.equippedItems.weapon) {
            console.log(`Equipping weapon: ${this.equippedItems.weapon.name}`);
            if (this.gameManager.systems.bulletSystem) {
                this.gameManager.systems.bulletSystem.setSpecialWeapon(this.equippedItems.weapon);
            } else {
                console.log('BulletSystem not found!');
            }
        } else {
            console.log('No weapon equipped');
        }
    }
    
    applyItemEffects(player, item) {
        const stats = { ...item.baseStats, ...item.randomStats };
        
        if (stats.maxHealth) player.maxHealth = (player.maxHealth || 100) + stats.maxHealth;
        if (stats.healthRegen) player.healthRegen = (player.healthRegen || 0) + stats.healthRegen;
        if (stats.speed) player.speedMultiplier = (player.speedMultiplier || 1) * (1 + stats.speed);
        if (stats.defense) player.defense = (player.defense || 0) + stats.defense;
        if (stats.dodgeChance) player.dodgeChance = (player.dodgeChance || 0) + stats.dodgeChance;
        if (stats.criticalChance) player.criticalChance = (player.criticalChance || 0) + stats.criticalChance;
    }
    
    renderInventoryItems(tab = 'all') {
        const content = document.getElementById('inventory-content');
        content.innerHTML = '';
        
        let items = [];
        if (tab === 'all' || tab === 'souvenirs') {
            items = items.concat(this.items.souvenirs.map(i => ({ ...i, category: 'souvenirs' })));
        }
        if (tab === 'all' || tab === 'accessories') {
            items = items.concat(this.items.accessories.map(i => ({ ...i, category: 'accessories' })));
        }
        if (tab === 'all' || tab === 'weapons') {
            items = items.concat(this.items.weapons.map(i => ({ ...i, category: 'weapons' })));
        }
        
        if (items.length === 0) {
            content.innerHTML = '<div class="empty-inventory">暂无物品</div>';
            return;
        }
        
        items.forEach(item => {
            const itemElement = this.createItemElement(item);
            content.appendChild(itemElement);
        });
    }
    
    createItemElement(item) {
        const element = document.createElement('div');
        element.className = `inventory-item rarity-${item.rarity.name.toLowerCase()}`;
        element.dataset.itemId = item.instanceId;
        
        const isEquipped = this.checkIsEquipped(item);
        
        element.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-type">${this.getTypeName(item.type)}</div>
            </div>
            <div class="item-rarity" style="color: ${item.rarity.color}">${item.rarity.name}</div>
            ${isEquipped ? '<div class="equipped-badge">已装备</div>' : ''}
        `;
        
        element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Item clicked: ${item.name}`);
            this.showItemDetails(item);
        });
        
        return element;
    }
    
    checkIsEquipped(item) {
        if (item.type === DropType.ACCESSORY) {
            return this.equippedItems.accessories.some(e => e && e.instanceId === item.instanceId);
        } else if (item.type === DropType.WEAPON) {
            return this.equippedItems.weapon && this.equippedItems.weapon.instanceId === item.instanceId;
        }
        return false;
    }
    
    getTypeName(type) {
        const names = {
            [DropType.SOUVENIR]: '纪念品',
            [DropType.ACCESSORY]: '饰品',
            [DropType.WEAPON]: '武器'
        };
        return names[type] || type;
    }
    
    showItemDetails(item) {
        console.log(`showItemDetails: ${item.name}`);
        const details = document.getElementById('inventory-details');
        
        let effectsHtml = '';
        const stats = { ...item.baseStats, ...item.randomStats };
        
        if (Object.keys(stats).length > 0) {
            effectsHtml = '<div class="detail-effects">';
            for (const [key, value] of Object.entries(stats)) {
                const effectName = this.getEffectName(key);
                const statDef = StatDefinitions[key];
                let displayValue;
                
                if (statDef && statDef.isPercent) {
                    displayValue = `${Math.round(value * 100)}%`;
                } else {
                    displayValue = value;
                }
                
                const prefix = value < 0 ? '' : '+';
                effectsHtml += `<div class="effect-item">• ${effectName}: ${prefix}${displayValue}</div>`;
            }
            effectsHtml += '</div>';
        }
        
        if (item.weaponStats) {
            effectsHtml = '<div class="detail-weapon">';
            effectsHtml += `<div class="weapon-stat">• 伤害: ${item.weaponStats.damage}</div>`;
            effectsHtml += `<div class="weapon-stat">• 冷却: ${item.weaponStats.cooldown}秒</div>`;
            effectsHtml += `<div class="weapon-stat">• 模式: ${this.getFireModeName(item.weaponStats.fireMode)}</div>`;
            effectsHtml += '</div>';
        }
        
        if (item.buff) {
            effectsHtml += `<div class="detail-buff">
                <div class="buff-title">${item.buff.icon} ${item.buff.name}</div>
                <div class="buff-desc">${item.buff.description}</div>
            </div>`;
        }
        
        const isEquipped = this.checkIsEquipped(item);
        let actionButton = '';
        
        if (item.type === DropType.ACCESSORY || item.type === DropType.WEAPON) {
            if (isEquipped) {
                actionButton = `<button class="equip-btn equipped" id="unequip-btn">已装备 (点击卸下)</button>`;
            } else {
                actionButton = `<button class="equip-btn" id="equip-btn">装备</button>`;
            }
        }
        
        details.innerHTML = `
            <div class="detail-header">
                <div class="detail-icon">${item.icon}</div>
                <div class="detail-title">
                    <div class="detail-name" style="color: ${item.rarity.color}">${item.name}</div>
                    <div class="detail-rarity">${item.rarity.name} · ${this.getTypeName(item.type)}</div>
                </div>
            </div>
            <div class="detail-description">${item.description}</div>
            ${effectsHtml}
            ${item.flavorText ? `<div class="detail-flavor">"${item.flavorText}"</div>` : ''}
            <div class="detail-source">来源: ${item.sourceBoss}</div>
            ${actionButton}
        `;
        
        // 绑定按钮事件
        this.bindDetailButtons(item, isEquipped);
    }
    
    bindDetailButtons(item, isEquipped) {
        const equipBtn = document.getElementById('equip-btn');
        const unequipBtn = document.getElementById('unequip-btn');
        
        if (equipBtn) {
            equipBtn.onclick = () => {
                console.log(`Equip button clicked for: ${item.name}`);
                if (item.type === DropType.ACCESSORY) {
                    const emptySlot = this.equippedItems.accessories.findIndex(a => a === null);
                    const slot = emptySlot !== -1 ? emptySlot : 0;
                    this.equipItem(item, slot);
                } else if (item.type === DropType.WEAPON) {
                    this.equipItem(item, 0);
                }
                this.showItemDetails(item);
            };
        }
        
        if (unequipBtn) {
            unequipBtn.onclick = () => {
                console.log(`Unequip button clicked for: ${item.name}`);
                if (item.type === DropType.ACCESSORY) {
                    const slot = this.equippedItems.accessories.findIndex(a => a && a.instanceId === item.instanceId);
                    if (slot !== -1) this.unequipItem(DropType.ACCESSORY, slot);
                } else if (item.type === DropType.WEAPON) {
                    this.unequipItem(DropType.WEAPON, 0);
                }
                this.showItemDetails(item);
            };
        }
    }
    
    getEffectName(key) {
        if (StatDefinitions[key]) {
            return StatDefinitions[key].name;
        }
        const names = {
            maxHealth: '最大生命值',
            healthRegen: '生命回复',
            speed: '移动速度',
            defense: '防御力',
            maxEnergy: '最大能量',
            energyRegen: '能量恢复',
            dodgeChance: '闪避率',
            criticalChance: '暴击率',
            lifesteal: '吸血',
            flashCooldown: '闪现冷却',
            flashDistance: '闪现距离',
            bulletDamage: '攻击力',
            bulletSize: '子弹大小',
            bulletSpeed: '子弹速度',
            fireRate: '射速',
            criticalDamage: '暴击伤害',
            expBonus: '经验加成',
            coinBonus: '金币加成'
        };
        return names[key] || key;
    }
    
    getFireModeName(mode) {
        const names = {
            single: '单发',
            spread: '散射',
            burst: '连发',
            explosive: '爆炸',
            pierce: '穿透',
            homing: '追踪',
            lightning: '闪电',
            beam: '光束',
            wave: '波浪',
            rain: '火雨'
        };
        return names[mode] || mode;
    }
    
    showInventory() {
        const container = document.getElementById('inventory-container');
        container.classList.remove('hidden');
        setTimeout(() => container.classList.add('active'), 10);
        this.renderInventoryItems('all');
        this.updateEquippedSlotsDisplay();
    }
    
    hideInventory() {
        const container = document.getElementById('inventory-container');
        container.classList.remove('active');
        setTimeout(() => container.classList.add('hidden'), 300);
    }
    
    saveToStorage() {
        const data = {
            items: this.items,
            equippedItems: this.equippedItems,
            bossKillStats: this.bossKillStats,
            unlockedAchievements: this.unlockedAchievements,
            coins: this.coins
        };
        localStorage.setItem('mythicSnake_inventory', JSON.stringify(data));
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('mythicSnake_inventory');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.items = data.items || { souvenirs: [], accessories: [], weapons: [] };
                this.equippedItems = data.equippedItems || { accessories: [null, null], weapon: null };
                this.bossKillStats = data.bossKillStats || { total: 0, byBoss: {} };
                this.unlockedAchievements = data.unlockedAchievements || [];
                this.coins = data.coins || 0;
            } catch (e) {
                console.error('Failed to load inventory data:', e);
            }
        }
    }
    
    addStyles() {
        if (document.getElementById('inventory-system-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'inventory-system-styles';
        style.textContent = `
            .inventory-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
                font-family: 'Segoe UI', sans-serif;
            }
            
            .inventory-container.active {
                opacity: 1;
                visibility: visible;
            }
            
            .inventory-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(10px);
            }
            
            .inventory-panel {
                position: relative;
                z-index: 1;
                width: 900px;
                max-width: 95%;
                max-height: 90vh;
                background: linear-gradient(145deg, #1a1a2e, #0f0f1a);
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 20px;
                padding: 30px;
                overflow-y: auto;
            }
            
            .inventory-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .inventory-header h2 {
                color: #00d4ff;
                font-size: 1.8em;
                margin: 0;
            }
            
            .inventory-close-btn {
                background: none;
                border: none;
                color: #fff;
                font-size: 2em;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            
            .inventory-close-btn:hover { opacity: 1; }
            
            .inventory-coins {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
                padding: 10px 20px;
                background: rgba(255, 215, 0, 0.1);
                border-radius: 10px;
                border: 1px solid rgba(255, 215, 0, 0.3);
            }
            
            .equipment-section {
                margin-bottom: 20px;
                padding: 15px;
                background: rgba(0, 212, 255, 0.05);
                border-radius: 10px;
                border: 1px solid rgba(0, 212, 255, 0.2);
            }
            
            .equipment-section h3 {
                color: #00d4ff;
                margin: 0 0 15px 0;
                font-size: 1em;
            }
            
            .equipment-slots-row {
                display: flex;
                gap: 15px;
                justify-content: center;
            }
            
            .equipped-slot {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 10px;
                background: rgba(255, 255, 255, 0.03);
                border: 2px dashed rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
                min-width: 100px;
            }
            
            .equipped-slot:hover {
                border-color: #00d4ff;
                background: rgba(0, 212, 255, 0.1);
            }
            
            .equipped-slot.filled {
                border-style: solid;
                border-color: rgba(0, 212, 255, 0.5);
            }
            
            .slot-label {
                color: #888;
                font-size: 0.75em;
                margin-bottom: 8px;
            }
            
            .slot-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 50px;
                justify-content: center;
            }
            
            .slot-content .slot-placeholder {
                font-size: 1.5em;
                color: #444;
            }
            
            .slot-content .equipped-icon { font-size: 1.8em; }
            
            .slot-content .equipped-name {
                font-size: 0.7em;
                margin-top: 3px;
                color: #fff;
            }
            
            .inventory-tabs {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .inventory-tab {
                padding: 10px 20px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: #888;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .inventory-tab:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }
            
            .inventory-tab.active {
                background: rgba(0, 212, 255, 0.2);
                border-color: #00d4ff;
                color: #00d4ff;
            }
            
            .inventory-content {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
                max-height: 300px;
                overflow-y: auto;
            }
            
            .inventory-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .inventory-item:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
            
            .inventory-item.rarity-稀有 { border-left: 3px solid #2196f3; }
            .inventory-item.rarity-史诗 { border-left: 3px solid #9c27b0; }
            .inventory-item.rarity-传说 { border-left: 3px solid #ff9800; }
            .inventory-item.rarity-神话 { border-left: 3px solid #e91e63; }
            
            .item-icon { font-size: 2em; }
            
            .item-info { flex: 1; }
            
            .item-name {
                color: #fff;
                font-weight: bold;
                font-size: 0.9em;
            }
            
            .item-type {
                color: #666;
                font-size: 0.75em;
            }
            
            .item-rarity {
                font-size: 0.75em;
                font-weight: bold;
            }
            
            .equipped-badge {
                background: #27ae60;
                color: #fff;
                font-size: 0.65em;
                padding: 2px 6px;
                border-radius: 4px;
            }
            
            .inventory-details {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                padding: 20px;
                min-height: 150px;
            }
            
            .details-placeholder {
                color: #666;
                text-align: center;
                padding: 50px;
            }
            
            .detail-header {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .detail-icon { font-size: 3em; }
            
            .detail-name {
                font-size: 1.3em;
                font-weight: bold;
            }
            
            .detail-rarity {
                color: #888;
                font-size: 0.9em;
            }
            
            .detail-description {
                color: #ccc;
                margin-bottom: 15px;
                line-height: 1.5;
            }
            
            .detail-effects, .detail-weapon {
                background: rgba(0, 212, 255, 0.1);
                padding: 10px 15px;
                border-radius: 8px;
                margin-bottom: 15px;
            }
            
            .effect-item, .weapon-stat {
                color: #00d4ff;
                margin: 5px 0;
            }
            
            .detail-buff {
                background: rgba(156, 39, 176, 0.2);
                padding: 10px 15px;
                border-radius: 8px;
                margin-bottom: 15px;
            }
            
            .buff-title {
                color: #b347ff;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .buff-desc {
                color: #ccc;
                font-size: 0.9em;
            }
            
            .detail-flavor {
                color: #888;
                font-style: italic;
                margin-bottom: 15px;
                padding-left: 10px;
                border-left: 2px solid #444;
            }
            
            .detail-source {
                color: #666;
                font-size: 0.85em;
                margin-bottom: 15px;
            }
            
            .equip-btn {
                padding: 12px 30px;
                background: linear-gradient(135deg, #00d4ff, #0099cc);
                border: none;
                border-radius: 8px;
                color: #fff;
                font-size: 1em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .equip-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
            }
            
            .equip-btn.equipped {
                background: linear-gradient(135deg, #27ae60, #1e8449);
            }
            
            .empty-inventory {
                grid-column: 1 / -1;
                text-align: center;
                color: #666;
                padding: 50px;
            }
        `;
        
        document.head.appendChild(style);
    }
}

try {
    module.exports = { InventorySystem };
} catch (e) {
    window.InventorySystem = InventorySystem;
}
