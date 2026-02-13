class LeaderboardManager {
    constructor() {
        this.personalKey = 'mythicSnakePersonalHistory';
        this.personalHistory = [];
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
    }
    
    loadFromStorage() {
        const personalData = localStorage.getItem(this.personalKey);
        this.personalHistory = personalData ? JSON.parse(personalData) : [];
    }
    
    getPersonalHistory(sortBy = 'score') {
        const sorted = [...this.personalHistory];
        
        if (sortBy === 'score') {
            sorted.sort((a, b) => b.score - a.score);
        } else if (sortBy === 'survivalTime') {
            sorted.sort((a, b) => b.survivalTime - a.survivalTime);
        } else if (sortBy === 'date') {
            sorted.sort((a, b) => b.timestamp - a.timestamp);
        }
        
        return sorted;
    }
    
    getBestScore() {
        if (this.personalHistory.length === 0) {
            return { score: 0, survivalTime: 0 };
        }
        
        const best = this.personalHistory.reduce((best, record) => {
            return record.score > best.score ? record : best;
        }, this.personalHistory[0]);
        
        return { score: best.score, survivalTime: best.survivalTime };
    }
    
    recordGameResult(score, survivalTime) {
        const record = {
            id: 'game_' + Date.now(),
            score: score,
            survivalTime: survivalTime,
            timestamp: Date.now(),
            date: new Date().toLocaleDateString('zh-CN'),
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        };
        
        this.personalHistory.unshift(record);
        
        if (this.personalHistory.length > 100) {
            this.personalHistory = this.personalHistory.slice(0, 100);
        }
        
        localStorage.setItem(this.personalKey, JSON.stringify(this.personalHistory));
        
        const highScore = parseInt(localStorage.getItem('highScore')) || 0;
        if (score > highScore) {
            localStorage.setItem('highScore', score.toString());
        }
        
        const bestTime = parseInt(localStorage.getItem('bestSurvivalTime')) || 0;
        if (survivalTime > bestTime) {
            localStorage.setItem('bestSurvivalTime', survivalTime.toString());
        }
    }
    
    formatSurvivalTime(seconds) {
        if (!seconds || seconds < 0) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
    
    formatScore(score) {
        if (!score || score < 0) return '0';
        
        if (score >= 10000) {
            return (score / 10000).toFixed(1) + '万';
        }
        return score.toLocaleString();
    }
    
    getTotalGames() {
        return this.personalHistory.length;
    }
    
    getAverageScore() {
        if (this.personalHistory.length === 0) return 0;
        
        const total = this.personalHistory.reduce((sum, record) => sum + record.score, 0);
        return Math.round(total / this.personalHistory.length);
    }
    
    clearAllData() {
        this.personalHistory = [];
        localStorage.removeItem(this.personalKey);
        localStorage.removeItem('highScore');
        localStorage.removeItem('bestSurvivalTime');
    }
}

window.leaderboardManager = new LeaderboardManager();
