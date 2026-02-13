class BossManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        this.bossSpawnInterval = 3;
        this.currentBoss = null;
        this.bossWarningTime = 5;
        this.isWarningActive = false;
        this.warningTimer = 0;
        this.pendingBossType = null;
        
        this.defeatedBosses = [];
        this.totalBossesSpawned = 0;
        
        this.bossTypes = ['hydra', 'flame', 'titan', 'thunder', 'chaos'];
        this.bossQueue = [];
        
        this.initBossQueue();
    }
    
    initBossQueue() {
        this.bossQueue = [...this.bossTypes];
        this.shuffleArray(this.bossQueue);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    update(deltaTime) {
        if (this.isWarningActive) {
            this.warningTimer += deltaTime;
            console.log(`[BossManager] Warning timer: ${this.warningTimer.toFixed(2)}s / ${this.bossWarningTime}s`);
            
            if (this.warningTimer >= this.bossWarningTime) {
                console.log('[BossManager] Warning complete, spawning boss');
                this.spawnPendingBoss();
            }
            return;
        }
        
        if (this.currentBoss && this.currentBoss.alive) {
            this.currentBoss.update(deltaTime);
        }
    }
    
    checkBossSpawn(currentWave) {
        console.log(`[BossManager] checkBossSpawn called: wave=${currentWave}, currentBoss=${!!this.currentBoss}, isWarningActive=${this.isWarningActive}`);
        
        if (this.currentBoss && this.currentBoss.alive) {
            console.log('[BossManager] Boss already alive, skipping');
            return false;
        }
        
        if (this.isWarningActive) {
            console.log('[BossManager] Warning already active, skipping');
            return false;
        }
        
        if (currentWave > 0 && currentWave % this.bossSpawnInterval === 0) {
            if (!this.defeatedBosses.includes(currentWave)) {
                console.log(`[BossManager] Starting boss warning for wave ${currentWave}`);
                this.startBossWarning(currentWave);
                return true;
            }
        }
        
        return false;
    }
    
    startBossWarning(waveNumber) {
        console.log(`[BossManager] startBossWarning called for wave ${waveNumber}`);
        this.isWarningActive = true;
        this.warningTimer = 0;
        
        if (this.bossQueue.length === 0) {
            this.initBossQueue();
        }
        
        this.pendingBossType = this.bossQueue.shift();
        this.pendingWaveNumber = waveNumber;
        
        const bossNames = {
            hydra: { name: '九头蛇', emoji: '🐍' },
            flame: { name: '炎魔', emoji: '🔥' },
            titan: { name: '泰坦', emoji: '🛡️' },
            thunder: { name: '雷神', emoji: '⚡' },
            chaos: { name: '混沌之王', emoji: '👑' }
        };
        
        const bossInfo = bossNames[this.pendingBossType];
        
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `⚠️ BOSS即将出现！`,
                '#e74c3c',
                'warning',
                this.bossWarningTime
            );
        }
        
        this.showBossWarningUI(bossInfo);
    }
    
    showBossWarningUI(bossInfo) {
        const warningOverlay = document.createElement('div');
        warningOverlay.id = 'boss-warning-overlay';
        warningOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        warningOverlay.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">${bossInfo.emoji}</div>
            <div style="font-size: 32px; color: #e74c3c; font-weight: bold; text-shadow: 0 0 10px #e74c3c;">
                ⚠️ BOSS 警告 ⚠️
            </div>
            <div style="font-size: 24px; color: #fff; margin-top: 10px;">
                ${bossInfo.name} 正在逼近...
            </div>
            <div id="boss-countdown" style="font-size: 20px; color: #f39c12; margin-top: 20px;">
                倒计时: ${this.bossWarningTime}秒
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                from { opacity: 0.7; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(warningOverlay);
        
        this.warningInterval = setInterval(() => {
            const remaining = Math.max(0, this.bossWarningTime - this.warningTimer);
            const countdownEl = document.getElementById('boss-countdown');
            if (countdownEl) {
                countdownEl.textContent = `倒计时: ${Math.ceil(remaining)}秒`;
            }
        }, 100);
    }
    
    hideBossWarningUI() {
        const overlay = document.getElementById('boss-warning-overlay');
        if (overlay) {
            overlay.remove();
        }
        if (this.warningInterval) {
            clearInterval(this.warningInterval);
            this.warningInterval = null;
        }
    }
    
    pauseWarningForCardSelection() {
        this.hideBossWarningUI();
    }
    
    spawnPendingBoss() {
        console.log('[BossManager] spawnPendingBoss called');
        this.hideBossWarningUI();
        this.isWarningActive = false;
        
        this.spawnBoss(this.pendingBossType);
    }
    
    spawnBoss(bossType) {
        console.log(`[BossManager] spawnBoss called with type: ${bossType}`);
        const spawnPos = this.getSpawnPosition();
        
        if (typeof Boss !== 'undefined') {
            this.currentBoss = new Boss(this.gameManager, spawnPos.x, spawnPos.y, bossType);
            
            const waveMultiplier = 1 + (this.gameManager.waveSystem?.currentWave || 1) * 0.1;
            this.currentBoss.health *= waveMultiplier;
            this.currentBoss.maxHealth *= waveMultiplier;
            this.currentBoss.damage *= (1 + (this.gameManager.waveSystem?.currentWave || 1) * 0.05);
            
            this.gameManager.gameObjects.push(this.currentBoss);
            this.totalBossesSpawned++;
        } else {
            console.error('Boss class not found! Make sure Boss.js is loaded.');
        }
    }
    
    getSpawnPosition() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch (side) {
            case 0:
                x = Math.random() * 800 + 100;
                y = 50;
                break;
            case 1:
                x = 950;
                y = Math.random() * 600 + 100;
                break;
            case 2:
                x = Math.random() * 800 + 100;
                y = 750;
                break;
            case 3:
                x = 50;
                y = Math.random() * 600 + 100;
                break;
        }
        
        return { x, y };
    }
    
    onBossDefeated(boss) {
        this.defeatedBosses.push(this.pendingWaveNumber || this.gameManager.waveSystem?.currentWave || 0);
        
        this.showBossDefeatedMessage(boss);
        
        if (this.gameManager.systems.achievementManager) {
            this.gameManager.systems.achievementManager.unlock('boss_slayer');
        }
        
        if (this.gameManager.systems.inventorySystem) {
            this.gameManager.systems.inventorySystem.onBossKilled(boss);
        }
        
        this.currentBoss = null;
    }
    
    /**
     * 显示击败首领消息框
     */
    showBossDefeatedMessage(boss) {
        const messageBox = document.createElement('div');
        messageBox.className = 'boss-defeated-message';
        messageBox.innerHTML = `
            <div class="boss-defeated-content">
                <div class="boss-defeated-icon">🏆</div>
                <div class="boss-defeated-title">首领击败!</div>
                <div class="boss-defeated-name">${boss.name}</div>
                <div class="boss-defeated-divider"></div>
                <div class="boss-defeated-achievement">
                    <span class="achievement-icon">⭐</span>
                    <span class="achievement-text">成就解锁</span>
                </div>
                <div class="boss-defeated-drops">
                    <span class="drops-icon">🎁</span>
                    <span class="drops-text">掉落物已生成</span>
                </div>
            </div>
            <div class="boss-defeated-rings">
                <div class="ring ring-1"></div>
                <div class="ring ring-2"></div>
                <div class="ring ring-3"></div>
            </div>
        `;
        
        document.getElementById('game-container').appendChild(messageBox);
        
        if (!document.getElementById('boss-defeated-styles')) {
            const style = document.createElement('style');
            style.id = 'boss-defeated-styles';
            style.textContent = `
                .boss-defeated-message {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    pointer-events: none;
                    animation: fadeIn 0.3s ease-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                
                @keyframes scaleIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                
                @keyframes iconBounce {
                    0%, 100% { transform: translateY(0) scale(1); }
                    25% { transform: translateY(-8px) scale(1.1); }
                    50% { transform: translateY(0) scale(1); }
                    75% { transform: translateY(-4px) scale(1.05); }
                }
                
                .boss-defeated-content {
                    position: relative;
                    background: linear-gradient(145deg, rgba(26, 26, 46, 0.85), rgba(15, 15, 26, 0.9));
                    border: 2px solid rgba(255, 215, 0, 0.6);
                    border-radius: 16px;
                    padding: 20px 35px;
                    text-align: center;
                    animation: scaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
                    backdrop-filter: blur(8px);
                    box-shadow: 
                        0 0 20px rgba(255, 215, 0, 0.3),
                        0 4px 20px rgba(0, 0, 0, 0.4),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    z-index: 2;
                }
                
                .boss-defeated-rings {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1;
                }
                
                .ring {
                    position: absolute;
                    border: 2px solid rgba(255, 215, 0, 0.5);
                    border-radius: 50%;
                    animation: ringExpand 2s ease-out infinite;
                }
                
                .ring-1 {
                    width: 120px;
                    height: 120px;
                    top: -60px;
                    left: -60px;
                    animation-delay: 0s;
                }
                
                .ring-2 {
                    width: 160px;
                    height: 160px;
                    top: -80px;
                    left: -80px;
                    animation-delay: 0.4s;
                }
                
                .ring-3 {
                    width: 200px;
                    height: 200px;
                    top: -100px;
                    left: -100px;
                    animation-delay: 0.8s;
                }
                
                @keyframes ringExpand {
                    0% {
                        transform: scale(0.8);
                        opacity: 0.8;
                        border-color: rgba(255, 215, 0, 0.8);
                    }
                    50% {
                        opacity: 0.4;
                        border-color: rgba(255, 215, 0, 0.4);
                    }
                    100% {
                        transform: scale(1.5);
                        opacity: 0;
                        border-color: rgba(255, 215, 0, 0);
                    }
                }
                
                .boss-defeated-icon {
                    font-size: 2.5em;
                    margin-bottom: 6px;
                    animation: iconBounce 0.8s ease-out;
                    filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6));
                }
                
                .boss-defeated-title {
                    font-size: 1.4em;
                    color: #ffd700;
                    font-weight: bold;
                    text-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
                    margin-bottom: 4px;
                    letter-spacing: 2px;
                }
                
                .boss-defeated-name {
                    font-size: 1.1em;
                    color: rgba(255, 255, 255, 0.95);
                    margin-bottom: 10px;
                    font-weight: 500;
                }
                
                .boss-defeated-divider {
                    width: 60%;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), transparent);
                    margin: 10px auto;
                }
                
                .boss-defeated-achievement {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    margin-bottom: 6px;
                    padding: 6px 14px;
                    background: rgba(255, 215, 0, 0.12);
                    border-radius: 8px;
                    border: 1px solid rgba(255, 215, 0, 0.2);
                }
                
                .achievement-icon {
                    font-size: 1em;
                }
                
                .achievement-text {
                    color: rgba(255, 215, 0, 0.9);
                    font-size: 0.85em;
                }
                
                .boss-defeated-drops {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 6px 14px;
                    background: rgba(0, 212, 255, 0.1);
                    border-radius: 8px;
                    border: 1px solid rgba(0, 212, 255, 0.2);
                }
                
                .drops-icon {
                    font-size: 1em;
                }
                
                .drops-text {
                    color: rgba(0, 212, 255, 0.9);
                    font-size: 0.85em;
                }
                
                @media (max-width: 600px) {
                    .boss-defeated-content {
                        padding: 15px 25px;
                        margin: 0 20px;
                    }
                    
                    .boss-defeated-icon { font-size: 2em; }
                    .boss-defeated-title { font-size: 1.2em; }
                    .boss-defeated-name { font-size: 1em; }
                    
                    .ring-1 { width: 100px; height: 100px; top: -50px; left: -50px; }
                    .ring-2 { width: 130px; height: 130px; top: -65px; left: -65px; }
                    .ring-3 { width: 160px; height: 160px; top: -80px; left: -80px; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            messageBox.style.animation = 'fadeOut 0.25s ease-out forwards';
            setTimeout(() => {
                messageBox.remove();
            }, 250);
        }, 3000);
    }
    
    getCurrentBoss() {
        return this.currentBoss;
    }
    
    hasActiveBoss() {
        return this.currentBoss && this.currentBoss.alive;
    }
    
    getBossHealthPercent() {
        if (!this.currentBoss || !this.currentBoss.alive) {
            return 0;
        }
        return this.currentBoss.health / this.currentBoss.maxHealth;
    }
    
    reset() {
        if (this.currentBoss) {
            this.gameManager.removeGameObject(this.currentBoss);
            this.currentBoss = null;
        }
        
        this.isWarningActive = false;
        this.warningTimer = 0;
        this.pendingBossType = null;
        this.hideBossWarningUI();
    }
    
    serialize() {
        return {
            defeatedBosses: this.defeatedBosses,
            totalBossesSpawned: this.totalBossesSpawned,
            currentBoss: this.currentBoss ? this.currentBoss.serialize() : null
        };
    }
    
    deserialize(data) {
        if (data) {
            this.defeatedBosses = data.defeatedBosses || [];
            this.totalBossesSpawned = data.totalBossesSpawned || 0;
            
            if (data.currentBoss) {
                this.currentBoss = new Boss(this.gameManager, data.currentBoss.x, data.currentBoss.y, data.currentBoss.bossType);
                this.currentBoss.deserialize(data.currentBoss);
                this.gameManager.gameObjects.push(this.currentBoss);
            }
        }
    }
}

try {
    module.exports = BossManager;
} catch (e) {
    window.BossManager = BossManager;
}
