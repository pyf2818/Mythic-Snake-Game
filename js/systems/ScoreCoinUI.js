class ScoreCoinUI {
    constructor() {
        this.coins = 0;
        this.score = 0;
        this.targetCoins = 0;
        this.targetScore = 0;
        this.animationFrame = null;
        this.lastUpdateTime = 0;
        this.updateInterval = 16;
        this.lastMilestoneCheck = 0;
        this.initialized = false;
        
        this.elements = {};
    }
    
    init() {
        if (this.initialized) return;
        
        this.elements = {
            coinsDisplay: document.getElementById('coins-display'),
            coinsCount: document.getElementById('coins-count'),
            scoreDisplay: document.getElementById('score-display'),
            scoreCount: document.getElementById('score-count')
        };
        
        this.loadSavedData();
        this.updateDisplay(true);
        this.setupEventListeners();
        this.initialized = true;
    }
    
    loadSavedData() {
        if (window.gameDataManager) {
            this.coins = window.gameDataManager.getCoins() || 0;
        }
        const savedScore = parseInt(localStorage.getItem('currentScore')) || 0;
        this.score = savedScore;
    }
    
    setupEventListeners() {
        document.addEventListener('coinsChanged', (e) => {
            this.animateCoins(e.detail.amount, e.detail.change);
        });
        
        document.addEventListener('scoreChanged', (e) => {
            this.animateScore(e.detail.amount, e.detail.change);
        });
    }
    
    updateCoins(amount, animate = true) {
        const oldAmount = this.coins;
        this.coins = amount;
        
        if (animate && oldAmount !== amount) {
            this.animateCoins(amount, amount - oldAmount);
        } else {
            this.updateDisplay(true);
        }
        
        this.saveCoins();
    }
    
    updateScore(amount, animate = true) {
        const oldAmount = this.score;
        this.score = amount;
        
        if (animate && oldAmount !== amount) {
            this.animateScore(amount, amount - oldAmount);
        } else {
            this.updateDisplay(true);
        }
        
        this.saveScore();
    }
    
    addCoins(amount) {
        this.updateCoins(this.coins + amount, true);
        this.showCoinPopup(amount);
    }
    
    addScore(amount) {
        this.updateScore(this.score + amount, true);
        this.checkScoreMilestone();
    }
    
    animateCoins(targetValue, change) {
        this.targetCoins = targetValue;
        const startValue = this.coins;
        const startTime = performance.now();
        const duration = 300;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.coins = Math.round(startValue + (targetValue - startValue) * easeProgress);
            this.updateCoinsDisplay();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.coins = targetValue;
                this.updateCoinsDisplay();
                if (change > 0) {
                    this.pulseElement(this.elements.coinsDisplay);
                }
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    animateScore(targetValue, change) {
        this.targetScore = targetValue;
        const startValue = this.score;
        const startTime = performance.now();
        const duration = 300;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.score = Math.round(startValue + (targetValue - startValue) * easeProgress);
            this.updateScoreDisplay();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.score = targetValue;
                this.updateScoreDisplay();
                if (change > 0) {
                    this.pulseElement(this.elements.scoreDisplay);
                }
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    updateDisplay(immediate = false) {
        this.updateCoinsDisplay();
        this.updateScoreDisplay();
    }
    
    updateCoinsDisplay() {
        if (this.elements.coinsCount) {
            this.elements.coinsCount.textContent = this.formatNumber(this.coins);
        }
    }
    
    updateScoreDisplay() {
        if (this.elements.scoreCount) {
            this.elements.scoreCount.textContent = this.formatNumber(this.score);
        }
    }
    
    formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toLocaleString();
    }
    
    pulseElement(element) {
        if (!element) return;
        
        element.classList.remove('pulse-animation');
        void element.offsetWidth;
        element.classList.add('pulse-animation');
        
        setTimeout(() => {
            element.classList.remove('pulse-animation');
        }, 500);
    }
    
    showCoinPopup(amount) {
        const popup = document.createElement('div');
        popup.className = 'coin-popup';
        popup.textContent = '+' + amount;
        
        if (this.elements.coinsDisplay) {
            const rect = this.elements.coinsDisplay.getBoundingClientRect();
            popup.style.left = rect.left + rect.width / 2 + 'px';
            popup.style.top = rect.top + 'px';
        }
        
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.classList.add('fade-out');
            setTimeout(() => popup.remove(), 300);
        }, 500);
    }
    
    checkScoreMilestone() {
        const milestones = [100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
        
        for (const milestone of milestones) {
            if (this.score >= milestone && this.score - this.lastMilestoneCheck < milestone) {
                this.showMilestoneNotification(milestone);
                break;
            }
        }
        
        this.lastMilestoneCheck = this.score;
    }
    
    showMilestoneNotification(milestone) {
        const notification = document.createElement('div');
        notification.className = 'milestone-notification';
        notification.innerHTML = `
            <div class="milestone-icon">🏆</div>
            <div class="milestone-text">达成 ${milestone.toLocaleString()} 分!</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
    
    saveCoins() {
        if (window.gameDataManager) {
            window.gameDataManager.coins = this.coins;
            window.gameDataManager.saveData();
        }
    }
    
    saveScore() {
        localStorage.setItem('currentScore', this.score.toString());
        
        const highScore = parseInt(localStorage.getItem('highScore')) || 0;
        if (this.score > highScore) {
            localStorage.setItem('highScore', this.score.toString());
        }
    }
    
    getCoins() {
        return this.coins;
    }
    
    getScore() {
        return this.score;
    }
    
    reset() {
        this.coins = 0;
        this.score = 0;
        this.updateDisplay(true);
        localStorage.removeItem('currentScore');
    }
}

class LeaderboardUI {
    constructor() {
        this.container = null;
        this.currentSort = 'score';
        this.isLoading = false;
        this.refreshInterval = null;
        this.initialized = false;
        this.lastData = null;
    }
    
    init() {
        if (this.initialized) return;
        this.createContainer();
        this.setupEventListeners();
        this.setupGameListeners();
        this.initialized = true;
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'leaderboard-container';
        this.container.className = 'leaderboard-container hidden';
        this.container.innerHTML = this.getTemplate();
        
        document.body.appendChild(this.container);
    }
    
    getTemplate() {
        return `
            <div class="leaderboard-overlay"></div>
            <div class="leaderboard-panel">
                <div class="leaderboard-header">
                    <h2 class="leaderboard-title">📊 个人记录</h2>
                    <button class="leaderboard-close" id="leaderboard-close">✕</button>
                </div>
                
                <div class="leaderboard-sort">
                    <button class="sort-btn active" data-sort="score">按分数</button>
                    <button class="sort-btn" data-sort="survivalTime">按时长</button>
                    <button class="sort-btn" data-sort="date">按日期</button>
                </div>
                
                <div class="leaderboard-content">
                    <div class="leaderboard-list" id="leaderboard-list">
                        <div class="loading-spinner">加载中...</div>
                    </div>
                </div>
                
                <div class="leaderboard-footer">
                    <div class="player-rank" id="player-rank">
                        <span class="rank-label">最高分:</span>
                        <span class="rank-value" id="my-rank">--</span>
                    </div>
                    <div class="player-stats">
                        <span class="stats-label">总场次:</span>
                        <span class="stats-value" id="total-games">0</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        const closeBtn = this.container.querySelector('#leaderboard-close');
        const overlay = this.container.querySelector('.leaderboard-overlay');
        const sortBtns = this.container.querySelectorAll('.sort-btn');
        
        closeBtn.addEventListener('click', () => this.hide());
        overlay.addEventListener('click', () => this.hide());
        
        sortBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sortBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSort = btn.dataset.sort;
                this.loadLeaderboard();
            });
        });
    }
    
    setupGameListeners() {
        document.addEventListener('gameOver', (e) => {
            if (e.detail) {
                this.onGameEnd(e.detail.score, e.detail.survivalTime);
            }
        });
        
        document.addEventListener('scoreChanged', (e) => {
            if (this.container && !this.container.classList.contains('hidden')) {
                this.updatePlayerStats();
            }
        });
    }
    
    onGameEnd(score, survivalTime) {
        if (window.leaderboardManager) {
            window.leaderboardManager.recordGameResult(score, survivalTime);
            
            if (this.container && !this.container.classList.contains('hidden')) {
                this.loadLeaderboard();
            }
        }
    }
    
    show() {
        this.container.classList.remove('hidden');
        this.loadLeaderboard();
    }
    
    hide() {
        this.container.classList.add('hidden');
    }
    
    toggle() {
        if (this.container.classList.contains('hidden')) {
            this.show();
        } else {
            this.hide();
        }
    }
    
    async loadLeaderboard() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            const data = window.leaderboardManager.getPersonalHistory(this.currentSort);
            this.lastData = data;
            this.renderList(data);
            this.updatePlayerStats();
        } catch (error) {
            console.error('加载记录失败:', error);
            this.showError('加载失败，请重试');
        } finally {
            this.isLoading = false;
        }
    }
    
    renderList(data) {
        const list = this.container.querySelector('#leaderboard-list');
        
        if (!data || data.length === 0) {
            list.innerHTML = '<div class="empty-message">暂无游戏记录<br><small>开始游戏创建你的第一个记录吧！</small></div>';
            return;
        }
        
        list.innerHTML = data.map((item, index) => {
            const rank = index + 1;
            const rankClass = this.getRankClass(rank);
            const isBest = index === 0;
            
            return `
                <div class="leaderboard-item ${rankClass} ${isBest ? 'current-player' : ''}">
                    <div class="item-rank">
                        ${this.getRankIcon(rank)}
                    </div>
                    <div class="item-info">
                        <div class="item-name">${isBest ? '🏆 最佳记录' : '第 ' + rank + ' 次'}${isBest ? ' ⭐' : ''}</div>
                        <div class="item-details">
                            <span class="item-score">🏆 ${window.leaderboardManager.formatScore(item.score)}</span>
                            <span class="item-time">⏱️ ${window.leaderboardManager.formatSurvivalTime(item.survivalTime)}</span>
                            <span class="item-date">📅 ${item.date || new Date(item.timestamp).toLocaleDateString('zh-CN')}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    getRankClass(rank) {
        if (rank === 1) return 'rank-gold';
        if (rank === 2) return 'rank-silver';
        if (rank === 3) return 'rank-bronze';
        return '';
    }
    
    getRankIcon(rank) {
        if (rank === 1) return '<span class="rank-icon gold">🥇</span>';
        if (rank === 2) return '<span class="rank-icon silver">🥈</span>';
        if (rank === 3) return '<span class="rank-icon bronze">🥉</span>';
        return `<span class="rank-number">${rank}</span>`;
    }
    
    updatePlayerStats() {
        const rankElement = this.container.querySelector('#my-rank');
        const totalGamesElement = this.container.querySelector('#total-games');
        
        if (rankElement) {
            const best = window.leaderboardManager.getBestScore();
            if (best.score > 0) {
                rankElement.textContent = best.score.toLocaleString() + ' 分';
            } else {
                rankElement.textContent = '暂无记录';
            }
        }
        
        if (totalGamesElement) {
            const history = window.leaderboardManager.getPersonalHistory('date');
            totalGamesElement.textContent = history.length + ' 场';
        }
    }
    
    showLoading() {
        const list = this.container.querySelector('#leaderboard-list');
        list.innerHTML = '<div class="loading-spinner">加载中...</div>';
    }
    
    showError(message) {
        const list = this.container.querySelector('#leaderboard-list');
        list.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

window.scoreCoinUI = new ScoreCoinUI();
window.leaderboardUI = new LeaderboardUI();

document.addEventListener('DOMContentLoaded', () => {
    if (window.scoreCoinUI) {
        window.scoreCoinUI.init();
    }
    if (window.leaderboardUI) {
        window.leaderboardUI.init();
    }
});
