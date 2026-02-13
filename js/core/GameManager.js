/**
 * Mythic Snake - A Roguelike Snake Game
 * Copyright (C) 2024 Mythic Snake Team
 * All rights reserved.
 *
 * This software is proprietary. Unauthorized commercial use is strictly prohibited.
 * See LICENSE file for full terms.
 */

class GameManager {
    constructor() {
        this.gameState = 'menu';
        this.gameObjects = [];
        this.systems = {};
        this.input = {
            keys: {},
            mouse: { x: 0, y: 0 }
        };
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.saveSlots = 3;
        this.currentSaveSlot = 0;
        this.foodSpawnTimer = 0;
        this.foodSpawnInterval = 1.5;
        
        // 敌对单位系统（降低难度）
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 20;
        this.enemySpawnCount = 1;
        this.maxEnemies = 8;
        this.enemyDifficulty = 1;
        this.difficultyIncreaseInterval = 45;
        this.difficultyTimer = 0;
        
        // 敌人协同攻击系统（降低难度）
        this.coordinatedAttack = {
            enabled: true,
            cooldown: 8,
            timer: 0,
            minEnemiesForCoordination: 3,
            maxTargets: 2,
            lastCoordinationTime: 0
        };
        
        // 肉鸽元素：敌人波次系统
        this.waveSystem = {
            currentWave: 0,
            waveTimer: 0,
            waveInterval: 25,
            enemiesPerWave: 3, // 初始每波敌人数量
            maxEnemiesPerWave: 10, // 每波最大敌人数量
            waveDifficultyMultiplier: 1.0, // 波次难度乘数
            enemyTypes: ['normal', 'fast', 'tank', 'shooter'], // 敌人类型
            active: false // 波次系统是否激活
        };
        
        // 游戏循环控制
        this.gameLoopId = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initSystems();
        this.initUI();
    }
    
    setupEventListeners() {
        // 键盘输入
        window.addEventListener('keydown', (e) => {
            // 检测Shift键的状态变化（从未按下到按下）
            const isShiftKey = e.code === 'ShiftLeft' || e.code === 'ShiftRight';
            const wasShiftPressed = this.input.keys['ShiftLeft'] || this.input.keys['ShiftRight'];
            
            this.input.keys[e.code] = true;
            
            // Shift键按下瞬间通知FlashSkill
            if (isShiftKey && !wasShiftPressed && this.player && this.player.flashSkill) {
                this.player.flashSkill.handleShiftKeyDown();
            }
            
            if (e.code === 'Escape') {
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
            }
            
            // Spacebar pause functionality
            if (e.code === 'Space') {
                e.preventDefault(); // Prevent spacebar from scrolling the page
                if (this.gameState === 'playing') {
                    this.pauseGame();
                } else if (this.gameState === 'paused') {
                    this.resumeGame();
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            // 检测Shift键释放
            const isShiftKey = e.code === 'ShiftLeft' || e.code === 'ShiftRight';
            
            this.input.keys[e.code] = false;
            
            // Shift键释放瞬间通知FlashSkill
            if (isShiftKey && this.player && this.player.flashSkill) {
                this.player.flashSkill.handleShiftKeyUp();
            }
        });
        
        // 鼠标输入
        window.addEventListener('mousemove', (e) => {
            this.input.mouse.x = e.clientX;
            this.input.mouse.y = e.clientY;
        });
        
        // UI按钮事件
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 为游戏结束界面的返回菜单按钮添加事件监听器
        document.getElementById('game-over-menu-btn').addEventListener('click', () => {
            this.gameState = 'menu';
            this.hideGameOver();
            this.hidePauseMenu();
            // 显示主菜单界面
            document.getElementById('main-menu').classList.remove('hidden');
            // 隐藏游戏UI
            document.getElementById('game-ui').classList.add('hidden');
        });
        
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveGame();
        });
        
        document.getElementById('load-btn').addEventListener('click', () => {
            this.loadGame();
        });
        
        document.getElementById('quit-btn').addEventListener('click', () => {
            this.gameState = 'menu';
            this.stopGameLoop();
            this.hidePauseMenu();
            // 隐藏游戏UI
            document.getElementById('game-ui').classList.add('hidden');
            // 显示主菜单
            document.getElementById('main-menu').classList.remove('hidden');
        });
    }
    
    initSystems() {
        // 初始化各个系统
        console.log('Initializing systems...');
        this.systems.timeManager = new TimeManager(this);
        this.systems.organSystem = new OrganEvolution(this);
        this.systems.terrain = new Terrain(this);
        this.systems.dayNight = new DayNight(this);
        this.systems.season = new Season(this);
        this.systems.liquidPhysics = new LiquidPhysics(this);
        this.systems.wormhole = new WormholeSystem(this);
        this.systems.environmentalZones = new EnvironmentalZones(this);
        this.systems.jetEffectManager = new JetEffectManager(this);
        this.systems.audioManager = new AudioManager(this);
        this.systems.notificationManager = new NotificationManager(this);
        this.systems.notificationManager.init();
        this.systems.saveManager = new SaveManager(this);
        this.systems.saveManager.init();
        this.systems.environmentalObjects = new EnvironmentalObjectsManager(this);
        this.systems.seasonalFallingObjects = new SeasonalFallingObjectsManager(this);
        console.log('Creating WeatherDisasterManager...');
        this.systems.weatherDisaster = new WeatherDisasterManager(this);
        console.log('WeatherDisasterManager created:', this.systems.weatherDisaster);
        this.systems.renderer = new Renderer(this);
        this.systems.uiSystems = new UISystems(this);
        this.systems.bulletSystem = new BulletSystem(this);
        this.systems.cardSystem = new CardSystem(this);
        this.systems.inventorySystem = new InventorySystem(this);
        
        // 初始化BOSS管理系统
        if (window.BossManager) {
            this.bossManager = new BossManager(this);
            console.log('BossManager initialized');
        }
        
        // 初始化游戏UI管理器
        if (window.GameUIManager) {
            this.systems.gameUIManager = new GameUIManager(this);
        }
        
        console.log('All systems initialized:', Object.keys(this.systems));
    }
    
    initUI() {
        // 初始化UI元素
        this.energyBar = document.getElementById('energy-fill');
        this.energyText = document.getElementById('energy-text');
        this.timeBackCount = document.getElementById('time-back-count');
        this.organDisplay = document.getElementById('organ-display');
        this.seasonText = document.getElementById('season-text');
        this.timeText = document.getElementById('time-text');
        
        this.gameOverScreen = document.getElementById('game-over');
        this.pauseMenu = document.getElementById('pause-menu');
    }
    
    startGame() {
        // 停止之前的游戏循环，防止多个循环同时运行
        this.stopGameLoop();
        
        this.gameState = 'playing';
        this.score = 0;
        this.gameStartTime = Date.now();
        
        // 重置所有系统
        for (let system in this.systems) {
            if (this.systems[system].reset) {
                this.systems[system].reset();
            }
        }
        
        // 重置波次系统
        this.waveSystem.currentWave = 0;
        this.waveSystem.waveTimer = 0;
        this.waveSystem.enemiesPerWave = 3;
        this.waveSystem.waveDifficultyMultiplier = 1.0;
        this.waveSystem.active = true;
        
        // 重置BOSS系统
        if (this.bossManager) {
            this.bossManager.reset();
        }
        
        // 重置卡牌系统
        if (this.systems.cardSystem) {
            this.systems.cardSystem.reset();
        }
        
        // 重置计时器
        this.foodSpawnTimer = 0;
        this.enemySpawnTimer = 0;
        this.difficultyTimer = 0;
        
        // 重置难度
        this.enemyDifficulty = 1;
        this.enemySpawnInterval = 15;
        this.enemySpawnCount = 1;
        
        // 清空游戏对象
        this.gameObjects = [];
        
        // 创建玩家蛇
        console.log('Creating player snake...');
        this.player = new Snake(this, true);
        console.log('Player snake created:', this.player);
        this.gameObjects.push(this.player);
        console.log('Player snake added to gameObjects. gameObjects length:', this.gameObjects.length);
        
        // 初始化回溯保护计数的视觉指示器
        this.player.updateBacktrackProtectionIndicator();
        
        // 应用战前准备的装备效果
        if (this.systems.inventorySystem) {
            this.systems.inventorySystem.applyEquippedEffects();
        }
        
        // 创建AI蛇
        for (let i = 0; i < 3; i++) {
            let aiSnake = new Snake(this, false);
            this.gameObjects.push(aiSnake);
        }
        console.log('AI snakes created. Total gameObjects:', this.gameObjects.length);
        
        // 生成初始食物
        this.generateInitialFood();
        console.log('Initial food generated. Total gameObjects:', this.gameObjects.length);
        
        this.hideGameOver();
        this.hidePauseMenu();
        this.startGameLoop();
        console.log('Game loop started');
    }
    
    generateInitialFood() {
        // 生成初始食物
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * 900 + 50;
            const y = Math.random() * 700 + 50;
            const food = new Food(this, x, y);
            this.gameObjects.push(food);
        }
    }
    
    pauseGame() {
        this.gameState = 'paused';
        this.showPauseMenu();
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.hidePauseMenu();
    }
    
    gameOver() {
        // 检查是否可以使用回溯复活
        if (this.systems.timeManager.backtrackCount > 0) {
            // 使用回溯复活
            const success = this.systems.timeManager.backtrack();
            if (success) {
                console.log('回溯复活成功，剩余次数：', this.systems.timeManager.backtrackCount);
                return; // 回溯成功，不显示游戏结束画面
            }
        }
        
        // 计算生存时间
        const survivalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        // 回溯次数用尽或回溯失败，显示游戏结束画面
        this.gameState = 'gameOver';
        this.showGameOver();
        
        // 播放游戏结束音效
        if (this.systems.audioManager) {
            this.systems.audioManager.playGameOverSound();
        }
        
        // 显示游戏结束通知
        this.showNotification('游戏结束', '#ff6b6b', 'gameOver');
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            this.showNotification(`新纪录：${this.score} 分`, '#4ecdc4');
        }
        
        // 触发游戏结束事件
        document.dispatchEvent(new CustomEvent('gameOver', {
            detail: {
                score: this.score,
                survivalTime: survivalTime
            }
        }));
        
        // 记录游戏结果到排行榜
        if (window.leaderboardManager) {
            window.leaderboardManager.recordGameResult(this.score, survivalTime);
        }
        
        // 更新成就系统 - 初次尝试成就
        if (window.gameDataManager) {
            window.gameDataManager.updateAchievement('first_game', 1);
        }
        
        // 清除卡牌效果（卡牌效果仅当局生效）
        if (this.systems.cardSystem) {
            this.systems.cardSystem.onGameEnd();
        }
    }
    
    restartGame() {
        // 停止当前游戏循环
        this.stopGameLoop();
        
        // 隐藏游戏结束界面
        if (this.gameOverScreen) {
            this.gameOverScreen.classList.add('hidden');
        }
        
        // 隐藏暂停菜单
        if (this.pauseMenu) {
            this.pauseMenu.classList.add('hidden');
        }
        
        // 隐藏游戏UI
        const gameUI = document.getElementById('game-ui');
        if (gameUI) {
            gameUI.classList.add('hidden');
        }
        
        // 侧边栏隐藏
        const organSystem = document.getElementById('organ-system');
        const eventLog = document.getElementById('event-log');
        if (organSystem) organSystem.classList.remove('show');
        if (eventLog) eventLog.classList.remove('show');
        
        // 清理开场故事实例
        if (this.introStory) {
            this.introStory.hide();
            this.introStory = null;
        }
        
        // 重置游戏状态
        this.gameState = 'menu';
        
        // 调用全局startGame函数以显示开场故事
        if (window.startGame) {
            window.startGame();
        }
    }
    
    startGameLoop() {
        // 取消之前的游戏循环，防止多个循环同时运行
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
        }
        
        let lastTime = performance.now();
        let frameCount = 0;
        
        const gameLoop = (currentTime) => {
            const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
            lastTime = currentTime;
            frameCount++;
            
            // 检查是否有开场故事在显示
            if (this.introStory && this.introStory.isVisible) {
                this.introStory.update(deltaTime);
                this.gameLoopId = requestAnimationFrame(gameLoop);
                return;
            }
            
            if (this.gameState === 'playing') {
                this.update(deltaTime);
                this.render();
            } else if (this.gameState === 'cardSelection') {
                if (this.bossManager) {
                    this.bossManager.update(deltaTime);
                }
                this.render();
            }
            
            // 保存gameLoopId以便后续取消
            this.gameLoopId = requestAnimationFrame(gameLoop);
        };
        
        // 启动新的游戏循环
        this.gameLoopId = requestAnimationFrame(gameLoop);
        // 仅在开发模式下输出日志
        const isDevMode = false;
        if (isDevMode) {
            console.log('Game loop started');
        }
    }
    
    /**
     * 停止游戏循环
     */
    stopGameLoop() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
        }
    }
    
    update(deltaTime) {
        // 更新开场故事组件
        if (this.introStory && this.introStory.isVisible) {
            this.introStory.update(deltaTime);
            return;
        }
        
        // 更新所有系统
        for (let system in this.systems) {
            if (this.systems[system].update) {
                this.systems[system].update(deltaTime);
            }
        }
        
        // 更新所有游戏对象
        // 仅在开发模式下输出日志
        const isDevMode = false;
        if (isDevMode) {
            console.log('Updating game objects. Count:', this.gameObjects.length);
        }
        for (let i = 0; i < this.gameObjects.length; i++) {
            const obj = this.gameObjects[i];
            if (obj.update) {
                obj.update(deltaTime);
            }
        }
        
        // 检查碰撞
        this.checkCollisions();
        
        // 定期生成食物
        this.foodSpawnTimer += deltaTime;
        if (this.foodSpawnTimer >= this.foodSpawnInterval) {
            this.foodSpawnTimer = 0;
            this.spawnFood();
        }
        
        // 敌对单位系统 - 随时间动态增加
        this.difficultyTimer += deltaTime;
        if (this.difficultyTimer >= this.difficultyIncreaseInterval) {
            this.difficultyTimer = 0;
            this.increaseDifficulty();
        }
        
        // 定期生成敌对蛇
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            this.spawnEnemies();
        }
        
        // 肉鸽元素：敌人波次系统
        if (this.waveSystem.active) {
            this.waveSystem.waveTimer += deltaTime;
            if (this.waveSystem.waveTimer >= this.waveSystem.waveInterval) {
                this.waveSystem.waveTimer = 0;
                this.spawnWave();
            }
        }
        
        // 敌人协同攻击系统
        this.updateCoordinatedAttack(deltaTime);
        
        // 更新BOSS系统
        if (this.bossManager) {
            this.bossManager.update(deltaTime);
        }
        
        // 更新UI
        this.updateUI();
    }
    
    increaseDifficulty() {
        this.enemyDifficulty += 0.15;
        
        this.enemySpawnInterval = Math.max(8, 20 - (this.enemyDifficulty - 1) * 1.5);
        
        this.enemySpawnCount = Math.min(2, Math.floor(this.enemyDifficulty * 0.5) + 1);
        
        console.log(`游戏难度增加: ${this.enemyDifficulty.toFixed(1)}, 生成间隔: ${this.enemySpawnInterval}秒, 生成数量: ${this.enemySpawnCount}`);
    }
    
    spawnEnemies() {
        // 生成敌对蛇
        const currentEnemyCount = this.gameObjects.filter(obj => obj.type === 'snake' && !obj.isPlayer).length;
        
        if (currentEnemyCount >= this.maxEnemies) {
            return;
        }
        
        const availableSlots = this.maxEnemies - currentEnemyCount;
        const spawnCount = Math.min(this.enemySpawnCount, availableSlots);
        
        for (let i = 0; i < spawnCount; i++) {
            const aiSnake = new Snake(this, false);
            
            aiSnake.speed *= (1 + (this.enemyDifficulty - 1) * 0.05);
            aiSnake.maxSpeed *= (1 + (this.enemyDifficulty - 1) * 0.05);
            
            this.gameObjects.push(aiSnake);
        }
        
        if (spawnCount > 0) {
            console.log(`生成了 ${spawnCount} 条敌对蛇，当前敌对蛇数量: ${currentEnemyCount + spawnCount}`);
        }
    }
    
    /**
     * 生成敌人波次
     * 每60秒自动生成一个敌人波次，随着波次数量的增加，敌人数量、种类或难度应呈现递增趋势
     * @returns {Object} 波次生成结果
     */
    spawnWave() {
        this.waveSystem.currentWave++;
        this.waveSystem.waveDifficultyMultiplier *= 1.1;
        this.waveSystem.enemiesPerWave = Math.min(
            this.waveSystem.maxEnemiesPerWave,
            Math.floor(3 + this.waveSystem.currentWave * 0.5)
        );
        
        console.log(`[GameManager] spawnWave: wave=${this.waveSystem.currentWave}, bossManager=${!!this.bossManager}`);
        
        // 先检查是否触发卡牌抽取（每3波）
        if (this.systems.cardSystem) {
            console.log(`[GameManager] Calling cardSystem.checkTrigger for wave ${this.waveSystem.currentWave}`);
            this.systems.cardSystem.checkTrigger(this.waveSystem.currentWave);
        }
        
        // 卡牌选择完成后，在 resumeGame 中检查是否应该生成BOSS
        
        // 计算可用的敌人槽位（包括Enemy和敌对蛇）
        const currentEnemyCount = this.gameObjects.filter(obj => 
            obj.type === 'enemy' || (obj.type === 'snake' && !obj.isPlayer)
        ).length;
        const availableSlots = this.maxEnemies - currentEnemyCount;
        const spawnCount = Math.min(this.waveSystem.enemiesPerWave, availableSlots);
        
        // 生成敌人（使用优化的生成系统）
        for (let i = 0; i < spawnCount; i++) {
            // 使用安全的生成位置（避免生成在玩家附近）
            const spawnPos = this.getSafeSpawnPosition(150); // 最小距离150像素
            
            // 显示生成预警效果
            this.showSpawnWarning(spawnPos.x, spawnPos.y);
            
            // 根据波次难度选择敌人类型（支持新原型系统）
            // 增加远程敌人生成概率（1.5-2倍）
            let enemyType = 'melee';
            const random = Math.random();
            const difficultyThreshold = 0.3 * this.waveSystem.waveDifficultyMultiplier;
            
            // 远程敌人权重提升：原30%概率提升至50-60%
            const rangedChance = 0.5 + (this.waveSystem.currentWave * 0.02); // 50% + 波次*2%
            const rangedThreshold = Math.min(rangedChance, 0.65); // 最高65%
            
            if (random < rangedThreshold && this.waveSystem.currentWave >= 2) {
                // 优先选择远程类型敌人
                enemyType = 'ranged';
            } else if (random < difficultyThreshold && this.waveSystem.currentWave >= 3) {
                // 随波次增加，生成更高级的敌人
                const advancedTypes = ['agile', 'tank'];
                enemyType = advancedTypes[Math.floor(Math.random() * advancedTypes.length)];
            }
            
            // 波次5以上有机会生成辅助型敌人
            if (this.waveSystem.currentWave >= 5 && Math.random() < 0.15) {
                enemyType = 'support';
            }
            
            // 延迟生成敌人（给玩家反应时间）
            setTimeout(() => {
                if (this.gameState !== 'playing') return;
                
                // 生成敌人（传入波次号）
                const enemy = new Enemy(this, spawnPos.x, spawnPos.y, enemyType, this.waveSystem.currentWave);
                
                // 根据波次难度调整敌人属性
                enemy.speed *= this.waveSystem.waveDifficultyMultiplier;
                enemy.health *= this.waveSystem.waveDifficultyMultiplier;
                enemy.maxHealth = enemy.health;
                enemy.damage *= this.waveSystem.waveDifficultyMultiplier;
                
                this.gameObjects.push(enemy);
                
                // 提供敌人出现的视觉反馈
                if (this.systems.notificationManager) {
                    this.systems.notificationManager.showNotification(
                        `⚠️  ${this.getEnemyTypeName(enemyType)} 出现！`,
                        enemy.color,
                        'info',
                        1
                    );
                }
                
                // 记录到事件日志
                if (this.systems.uiSystems && this.systems.uiSystems.eventLogSystem) {
                    this.systems.uiSystems.eventLogSystem.addEvent(
                        `⚠️  ${this.getEnemyTypeName(enemyType)} 出现！`,
                        'enemy'
                    );
                }
            }, 500); // 500毫秒延迟
        }
        
        // 提供波次生成的视觉反馈
        if (this.systems.notificationManager) {
            this.systems.notificationManager.showNotification(
                `🌊 第 ${this.waveSystem.currentWave} 波敌人来袭！`,
                '#3498db',
                'warning',
                3
            );
        } else {
            this.showNotification(`🌊 第 ${this.waveSystem.currentWave} 波敌人来袭！`, '#3498db', 'warning');
        }
        
        // 记录到事件日志
        if (this.systems.uiSystems && this.systems.uiSystems.eventLogSystem) {
            this.systems.uiSystems.eventLogSystem.addEvent(
                `🌊 第 ${this.waveSystem.currentWave} 波敌人来袭！敌人数量: ${spawnCount}`,
                'system'
            );
        }
        
        console.log(`波次生成: 第 ${this.waveSystem.currentWave} 波, 敌人数量: ${spawnCount}, 难度乘数: ${this.waveSystem.waveDifficultyMultiplier.toFixed(2)}`);
        
        return {
            wave: this.waveSystem.currentWave,
            spawnCount: spawnCount,
            difficultyMultiplier: this.waveSystem.waveDifficultyMultiplier
        };
    }
    
    /**
     * 获取敌人类型的中文名称
     * @param {string} type - 敌人类型
     * @returns {string} 敌人类型的中文名称
     */
    getEnemyTypeName(type) {
        const names = {
            // 新原型
            'melee': '近战敌人',
            'ranged': '远程敌人',
            'tank': '坦克敌人',
            'agile': '敏捷敌人',
            'support': '辅助敌人',
            // 旧类型（兼容）
            'normal': '普通敌人',
            'fast': '快速敌人',
            'shooter': '射手敌人'
        };
        return names[type] || '未知敌人';
    }
    
    /**
     * 获取安全的敌人生成位置
     * @param {number} minDistance - 与玩家的最小距离
     * @returns {Object} 包含x和y坐标的对象
     */
    getSafeSpawnPosition(minDistance = 150) {
        const maxAttempts = 20;
        let x, y;
        let attempts = 0;
        
        // 游戏边界
        const minX = 50;
        const maxX = 950;
        const minY = 50;
        const maxY = 750;
        
        while (attempts < maxAttempts) {
            // 生成随机位置
            x = Math.random() * (maxX - minX) + minX;
            y = Math.random() * (maxY - minY) + minY;
            
            // 检查与玩家的距离
            if (this.player) {
                const dx = x - this.player.x;
                const dy = y - this.player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 如果距离足够远，返回这个位置
                if (distance >= minDistance) {
                    return { x, y };
                }
            } else {
                // 没有玩家时，直接返回随机位置
                return { x, y };
            }
            
            attempts++;
        }
        
        // 如果多次尝试都失败，在地图边缘生成
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: x = minX; y = Math.random() * (maxY - minY) + minY; break;
            case 1: x = maxX; y = Math.random() * (maxY - minY) + minY; break;
            case 2: x = Math.random() * (maxX - minX) + minX; y = minY; break;
            case 3: x = Math.random() * (maxX - minX) + minX; y = maxY; break;
        }
        
        return { x, y };
    }
    
    /**
     * 显示敌人生成预警效果
     * @param {number} x - 生成位置X坐标
     * @param {number} y - 生成位置Y坐标
     */
    showSpawnWarning(x, y) {
        const self = this;
        const warning = {
            type: 'spawn_warning',
            x: x,
            y: y,
            startTime: Date.now(),
            duration: 500,
            radius: 40,
            maxRadius: 60,
            
            update(deltaTime) {
                const elapsed = Date.now() - this.startTime;
                const progress = elapsed / this.duration;
                this.radius = this.maxRadius * progress;
                return elapsed < this.duration;
            },
            
            render(ctx) {
                if (!ctx && self.systems && self.systems.renderer) {
                    ctx = self.systems.renderer.ctx;
                }
                if (!ctx) return;
                
                const elapsed = Date.now() - this.startTime;
                const progress = elapsed / this.duration;
                const alpha = 1 - progress;
                
                // 外圈脉冲
                ctx.strokeStyle = `rgba(255, 100, 100, ${alpha})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                // 内圈
                ctx.fillStyle = `rgba(255, 100, 100, ${alpha * 0.3})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
                ctx.fill();
                
                // 警告图标
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⚠', this.x, this.y);
                
                // 粒子效果
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2 + progress * Math.PI;
                    const px = this.x + Math.cos(angle) * this.radius * 0.8;
                    const py = this.y + Math.sin(angle) * this.radius * 0.8;
                    
                    ctx.fillStyle = `rgba(255, 150, 100, ${alpha * 0.8})`;
                    ctx.beginPath();
                    ctx.arc(px, py, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        };
        
        // 添加到游戏对象
        this.gameObjects.push(warning);
    }
    
    /**
     * 更新敌人协同攻击系统
     * @param {number} deltaTime - 时间增量（秒）
     */
    updateCoordinatedAttack(deltaTime) {
        if (!this.coordinatedAttack.enabled) return;
        if (!this.player) return;
        
        this.coordinatedAttack.timer += deltaTime;
        
        // 检查冷却时间
        if (this.coordinatedAttack.timer < this.coordinatedAttack.cooldown) {
            return;
        }
        
        // 获取所有活跃的敌人
        const enemies = this.gameObjects.filter(obj => 
            obj.type === 'enemy' && obj.health > 0 && obj.canShoot
        );
        
        // 检查是否有足够的敌人进行协同攻击
        if (enemies.length < this.coordinatedAttack.minEnemiesForCoordination) {
            return;
        }
        
        // 重置计时器
        this.coordinatedAttack.timer = 0;
        this.coordinatedAttack.lastCoordinationTime = Date.now();
        
        // 选择参与协同攻击的敌人
        const attackGroup = this.selectAttackGroup(enemies);
        
        // 执行协同攻击
        this.executeCoordinatedAttack(attackGroup);
    }
    
    /**
     * 选择参与协同攻击的敌人组
     * @param {Array} enemies - 所有可用敌人
     * @returns {Array} 选中的敌人组
     */
    selectAttackGroup(enemies) {
        // 按距离排序，选择距离玩家最近的敌人
        const sortedEnemies = enemies.sort((a, b) => {
            const distA = Math.sqrt(
                Math.pow(a.x - this.player.x, 2) + 
                Math.pow(a.y - this.player.y, 2)
            );
            const distB = Math.sqrt(
                Math.pow(b.x - this.player.x, 2) + 
                Math.pow(b.y - this.player.y, 2)
            );
            return distA - distB;
        });
        
        // 选择最多maxTargets个敌人
        return sortedEnemies.slice(0, this.coordinatedAttack.maxTargets);
    }
    
    /**
     * 执行协同攻击
     * @param {Array} attackGroup - 参与攻击的敌人组
     */
    executeCoordinatedAttack(attackGroup) {
        if (!this.player || attackGroup.length === 0) return;
        
        // 计算玩家位置
        const playerX = this.player.x;
        const playerY = this.player.y;
        
        // 为每个敌人计算攻击角度，形成扇形攻击
        const baseAngle = Math.atan2(playerY - attackGroup[0].y, playerX - attackGroup[0].x);
        const spreadAngle = Math.PI / 6; // 30度扩散
        
        attackGroup.forEach((enemy, index) => {
            // 计算每个敌人的攻击角度
            const offset = (index - (attackGroup.length - 1) / 2) * spreadAngle;
            const angle = baseAngle + offset;
            
            // 创建子弹
            const bullet = new EnemyBullet(
                this,
                enemy.x,
                enemy.y,
                Math.cos(angle),
                Math.sin(angle),
                {
                    size: 30,
                    speed: 0.6,
                    color: '#ff4444',
                    damage: enemy.damage || 10
                }
            );
            
            this.addGameObject(bullet);
        });
        
        // 显示协同攻击警告
        if (this.systems.notificationManager) {
            this.systems.notificationManager.showNotification(
                `⚠️ 敌人协同攻击！${attackGroup.length}个敌人同时开火！`,
                '#ff4444',
                'warning',
                2
            );
        }
        
        // 记录到事件日志
        if (this.systems.uiSystems && this.systems.uiSystems.eventLogSystem) {
            this.systems.uiSystems.eventLogSystem.addEvent(
                `⚠️ 敌人协同攻击！${attackGroup.length}个敌人同时开火！`,
                'warning'
            );
        }
    }
    
    spawnFood() {
        const foodCount = this.gameObjects.filter(obj => obj.type === 'food').length;
        if (foodCount < 15) {
            const x = Math.random() * 900 + 50;
            const y = Math.random() * 700 + 50;
            
            // 随机食物类型
            const rand = Math.random();
            let foodType = 'normal';
            
            if (rand < 0.05) { // 5% 金色食物
                foodType = 'golden';
            } else if (rand < 0.15) { // 10% 能量食物
                foodType = 'energy';
            } else if (rand < 0.25) { // 10% 能力食物
                foodType = 'power';
            }
            
            const food = new Food(this, x, y, foodType);
            this.gameObjects.push(food);
        }
    }
    
    render() {
        // 渲染所有系统
        for (let system in this.systems) {
            if (this.systems[system].render) {
                this.systems[system].render();
            }
        }
        
        // 渲染所有游戏对象
        for (let i = 0; i < this.gameObjects.length; i++) {
            if (this.gameObjects[i].render) {
                this.gameObjects[i].render(this.systems.renderer.ctx);
            }
        }
    }
    
    checkCollisions() {
        // 碰撞检测逻辑
        for (let i = 0; i < this.gameObjects.length; i++) {
            for (let j = i + 1; j < this.gameObjects.length; j++) {
                const obj1 = this.gameObjects[i];
                const obj2 = this.gameObjects[j];
                
                if (obj1.collider && obj2.collider) {
                    if (this.checkCollision(obj1, obj2)) {
                        if (obj1.onCollision) obj1.onCollision(obj2);
                        if (obj2.onCollision) obj2.onCollision(obj1);
                    }
                }
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        // 简单的矩形碰撞检测
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    updateUI() {
        // 更新游戏UI管理器
        if (this.systems.gameUIManager) {
            this.systems.gameUIManager.update(1/60);
        }
        
        // 更新能量条（兼容旧代码）
        if (this.player && this.player.energySystem) {
            const energy = this.player.energySystem.energy;
            if (this.energyBar) {
                this.energyBar.style.width = `${energy}%`;
                
                // 能量低警告效果
                if (energy <= 15 && energy > 0) {
                    this.energyBar.classList.add('low-energy');
                } else {
                    this.energyBar.classList.remove('low-energy');
                }
                
                // 能量耗尽效果
                if (energy <= 0) {
                    this.energyBar.classList.add('no-energy');
                } else {
                    this.energyBar.classList.remove('no-energy');
                }
            }
            if (this.energyText) {
                this.energyText.textContent = `${Math.round(energy)}%`;
                
                // 能量低文字警告
                if (energy <= 15) {
                    this.energyText.classList.add('low-energy-text');
                } else {
                    this.energyText.classList.remove('low-energy-text');
                }
            }
        }
        
        // 更新闪现技能冷却
        if (this.player && this.player.flashSkill) {
            const flashSkill = this.player.flashSkill;
            const cooldownFill = document.getElementById('flash-cooldown-fill');
            const cooldownText = document.getElementById('flash-cooldown-text');
            
            if (cooldownFill && cooldownText) {
                const percent = flashSkill.getCooldownPercent() * 100;
                cooldownFill.style.width = `${percent}%`;
                
                if (flashSkill.isReady) {
                    cooldownText.textContent = '就绪';
                    cooldownText.classList.add('ready');
                } else {
                    cooldownText.textContent = `${flashSkill.getCooldownRemaining().toFixed(1)}s`;
                    cooldownText.classList.remove('ready');
                }
            }
        }
        
        // 更新加速状态指示器
        if (this.player) {
            const boostIndicator = document.getElementById('boost-indicator');
            const speedValue = document.getElementById('speed-value');
            
            if (boostIndicator) {
                if (this.player.isBoosting) {
                    boostIndicator.classList.remove('hidden');
                } else {
                    boostIndicator.classList.add('hidden');
                }
            }
            
            if (speedValue) {
                speedValue.textContent = this.player.currentSpeed.toFixed(1);
            }
        }
        
        // 更新时间回溯次数
        if (this.systems.timeManager && this.timeBackCount) {
            this.timeBackCount.textContent = this.systems.timeManager.backtrackCount;
        }
        
        // 更新生命值UI
        this.updateHealthUI();
        
        // 更新季节和时间
        if (this.systems.season && this.seasonText) {
            this.seasonText.textContent = this.systems.season.currentSeason ? this.systems.season.currentSeason.name : '春季';
        }
        
        if (this.systems.dayNight) {
            const time = this.systems.dayNight.currentTime;
            const minutes = Math.floor(time);
            const seconds = Math.floor((time % 1) * 60);
            this.timeText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // 更新波次UI
        this.updateWaveUI();
        
        // 更新BOSS UI
        this.updateBossUI();
        
        // 更新调试面板
        this.updateDebugPanel();
    }
    
    updateWaveUI() {
        const waveInfo = document.getElementById('wave-info');
        const waveNumber = document.getElementById('wave-number');
        const waveTimer = document.getElementById('wave-timer');
        
        if (!waveInfo) return;
        
        // 游戏进行中显示波次信息
        if (this.gameState === 'playing' && this.waveSystem.active) {
            waveInfo.classList.remove('hidden');
            
            // 更新波次数字
            if (waveNumber) {
                const currentWave = this.waveSystem.currentWave;
                if (parseInt(waveNumber.textContent) !== currentWave) {
                    waveNumber.textContent = currentWave;
                    waveNumber.classList.add('updating');
                    setTimeout(() => waveNumber.classList.remove('updating'), 500);
                    
                    // 波次切换动画
                    waveInfo.classList.add('wave-change');
                    setTimeout(() => waveInfo.classList.remove('wave-change'), 800);
                }
            }
            
            // 更新倒计时
            if (waveTimer) {
                const remaining = Math.ceil(this.waveSystem.waveInterval - this.waveSystem.waveTimer);
                waveTimer.textContent = `下一波: ${remaining}s`;
                
                // 低于5秒时警告
                if (remaining <= 5) {
                    waveTimer.classList.add('warning');
                } else {
                    waveTimer.classList.remove('warning');
                }
            }
            
            // BOSS波次特殊样式
            if (this.waveSystem.currentWave > 0 && this.waveSystem.currentWave % 3 === 0) {
                waveInfo.classList.add('boss-wave');
            } else {
                waveInfo.classList.remove('boss-wave');
            }
        } else {
            waveInfo.classList.add('hidden');
        }
    }
    
    updateHealthUI() {
        const healthFill = document.getElementById('health-fill');
        const healthText = document.getElementById('health-text');
        
        if (!healthFill || !healthText) return;
        
        if (this.player && this.player.health !== undefined) {
            const healthPercent = this.player.health / this.player.maxHealth * 100;
            healthFill.style.width = `${healthPercent}%`;
            healthText.textContent = `${Math.ceil(this.player.health)}`;
            
            // 生命值状态样式
            healthFill.classList.remove('low-health', 'critical-health');
            if (healthPercent <= 25) {
                healthFill.classList.add('critical-health');
            } else if (healthPercent <= 50) {
                healthFill.classList.add('low-health');
            }
        }
    }
    
    updateBossUI() {
        const bossInfo = document.getElementById('boss-info');
        const bossName = document.getElementById('boss-name');
        const bossHealthFill = document.getElementById('boss-health-fill');
        const bossHealthText = document.getElementById('boss-health-text');
        const bossPhase = document.getElementById('boss-phase');
        
        if (!bossInfo) return;
        
        if (this.bossManager && this.bossManager.hasActiveBoss()) {
            const boss = this.bossManager.getCurrentBoss();
            
            bossInfo.classList.remove('hidden');
            
            if (bossName) {
                bossName.textContent = `${boss.emoji} ${boss.name}`;
            }
            
            if (bossHealthFill && bossHealthText) {
                const healthPercent = boss.health / boss.maxHealth * 100;
                bossHealthFill.style.width = `${healthPercent}%`;
                bossHealthText.textContent = `${Math.ceil(healthPercent)}%`;
                
                // 血量状态样式
                bossHealthFill.classList.remove('low', 'critical');
                if (healthPercent <= 25) {
                    bossHealthFill.classList.add('critical');
                } else if (healthPercent <= 50) {
                    bossHealthFill.classList.add('low');
                }
            }
            
            if (bossPhase) {
                bossPhase.textContent = `阶段 ${boss.phase} / ${boss.maxPhase}`;
            }
            
            // 狂暴状态
            if (boss.isEnraged) {
                bossInfo.classList.add('enraged');
            } else {
                bossInfo.classList.remove('enraged');
            }
        } else {
            bossInfo.classList.add('hidden');
        }
    }
    
    updateDebugPanel() {
        const debugPanel = document.getElementById('debug-panel');
        if (!debugPanel || debugPanel.classList.contains('hidden')) return;
        
        if (this.player) {
            // 输入状态
            const shiftStatus = document.getElementById('debug-shift-status');
            const doubleTapCount = document.getElementById('debug-double-tap-count');
            const lastPressTime = document.getElementById('debug-last-press-time');
            const holdingStatus = document.getElementById('debug-holding-status');
            
            if (shiftStatus) {
                const shiftPressed = this.input && (this.input.keys['ShiftLeft'] || this.input.keys['ShiftRight']);
                shiftStatus.textContent = shiftPressed ? '按下' : '未按下';
                shiftStatus.style.color = shiftPressed ? '#00d9a5' : '#888';
            }
            
            if (doubleTapCount && this.player.flashSkill) {
                doubleTapCount.textContent = this.player.flashSkill.tapCount;
            }
            
            if (lastPressTime && this.player.flashSkill) {
                const elapsed = Date.now() / 1000 - this.player.flashSkill.lastTapTime;
                lastPressTime.textContent = `${Math.max(0, elapsed * 1000).toFixed(0)}ms`;
            }
            
            if (holdingStatus && this.player.flashSkill) {
                holdingStatus.textContent = this.player.flashSkill.isHolding ? '是' : '否';
                holdingStatus.style.color = this.player.flashSkill.isHolding ? '#ff9500' : '#888';
            }
            
            // 能量系统
            const debugEnergy = document.getElementById('debug-energy');
            const debugFlashCost = document.getElementById('debug-flash-cost');
            
            if (debugEnergy && this.player.energySystem) {
                debugEnergy.textContent = this.player.energySystem.energy.toFixed(1);
                debugEnergy.style.color = this.player.energySystem.energy <= 15 ? '#e74c3c' : '#fff';
            }
            
            if (debugFlashCost && this.player.flashSkill) {
                debugFlashCost.textContent = this.player.flashSkill.energyCost;
            }
            
            // 能量恢复速率
            const debugRecoveryRate = document.getElementById('debug-recovery-rate');
            if (debugRecoveryRate && this.player.energySystem) {
                const baseRate = this.player.energySystem.passiveRecovery.baseRate;
                const movingRate = this.player.energySystem.passiveRecovery.movingRate;
                const currentRate = this.player.isMoving ? movingRate + baseRate : this.player.energySystem.passiveRecovery.stationaryRate + baseRate;
                debugRecoveryRate.textContent = `${currentRate}/秒`;
            }
            
            // 技能状态
            const debugFlashReady = document.getElementById('debug-flash-ready');
            const debugFlashCooldown = document.getElementById('debug-flash-cooldown');
            const debugBoostStatus = document.getElementById('debug-boost-status');
            const debugCurrentSpeed = document.getElementById('debug-current-speed');
            
            if (debugFlashReady && this.player.flashSkill) {
                debugFlashReady.textContent = this.player.flashSkill.isReady ? '是' : '否';
                debugFlashReady.style.color = this.player.flashSkill.isReady ? '#00d9a5' : '#ff6b6b';
            }
            
            if (debugFlashCooldown && this.player.flashSkill) {
                debugFlashCooldown.textContent = `${this.player.flashSkill.getCooldownRemaining().toFixed(1)}s`;
            }
            
            if (debugBoostStatus) {
                debugBoostStatus.textContent = this.player.isBoosting ? '是' : '否';
                debugBoostStatus.style.color = this.player.isBoosting ? '#ff9500' : '#888';
            }
            
            if (debugCurrentSpeed) {
                debugCurrentSpeed.textContent = this.player.currentSpeed.toFixed(1);
            }
        }
    }
    
    saveGame() {
        const saveData = {
            score: this.score,
            player: this.player ? this.player.serialize() : null,
            gameObjects: this.gameObjects.map(obj => obj.serialize ? obj.serialize() : null),
            systems: {},
            waveSystem: {
                currentWave: this.waveSystem.currentWave,
                waveDifficultyMultiplier: this.waveSystem.waveDifficultyMultiplier
            },
            timestamp: Date.now()
        };
        
        // 保存各个系统的状态
        for (let system in this.systems) {
            if (this.systems[system].serialize) {
                saveData.systems[system] = this.systems[system].serialize();
            }
        }
        
        localStorage.setItem(`save_${this.currentSaveSlot}`, JSON.stringify(saveData));
        console.log('游戏已保存');
    }
    
    loadGame() {
        const saveData = localStorage.getItem(`save_${this.currentSaveSlot}`);
        
        if (saveData) {
            const data = JSON.parse(saveData);
            this.score = data.score;
            
            // 加载波次系统状态
            if (data.waveSystem) {
                this.waveSystem.currentWave = data.waveSystem.currentWave;
                this.waveSystem.waveDifficultyMultiplier = data.waveSystem.waveDifficultyMultiplier;
            }
            
            // 加载各个系统的状态
            for (let system in data.systems) {
                if (this.systems[system] && this.systems[system].deserialize) {
                    this.systems[system].deserialize(data.systems[system]);
                }
            }
            
            // 加载游戏对象
            this.gameObjects = [];
            if (data.player) {
                this.player = new Snake(this, true);
                this.player.deserialize(data.player);
                this.gameObjects.push(this.player);
            }
            
            if (data.gameObjects) {
                data.gameObjects.forEach(objData => {
                    if (objData && objData.isPlayer === false) {
                        const aiSnake = new Snake(this, false);
                        aiSnake.deserialize(objData);
                        this.gameObjects.push(aiSnake);
                    }
                });
            }
            
            this.gameState = 'playing';
            this.hidePauseMenu();
            console.log('游戏已加载');
        } else {
            console.log('没有找到存档');
        }
    }
    
    showGameOver() {
        this.gameOverScreen.classList.remove('hidden');
    }
    
    hideGameOver() {
        this.gameOverScreen.classList.add('hidden');
    }
    
    showPauseMenu() {
        this.pauseMenu.classList.remove('hidden');
    }
    
    hidePauseMenu() {
        this.pauseMenu.classList.add('hidden');
    }
    
    addGameObject(obj) {
        this.gameObjects.push(obj);
    }
    
    removeGameObject(obj) {
        const index = this.gameObjects.indexOf(obj);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
        }
    }
    
    getGameObjectById(id) {
        return this.gameObjects.find(obj => obj.id === id);
    }
    
    getObjectsByType(type) {
        return this.gameObjects.filter(obj => obj.type === type);
    }
    
    showNotification(message, color = '#ffffff', type = 'info', priority = 0, soundType = null) {
        // 使用通知管理器显示通知
        if (this.systems.notificationManager) {
            this.systems.notificationManager.showNotification(message, color, type, priority, soundType);
        }
    }
}

// 导出游戏管理器
try {
    module.exports = { GameManager };
} catch (e) {
    // 浏览器环境
    window.GameManager = GameManager;
}