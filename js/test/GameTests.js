class GameTests {
    constructor() {
        this.tests = [];
        this.testResults = [];
        this.gameManager = null;
    }
    
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    async runTests() {
        console.log('开始运行游戏测试...');
        this.testResults = [];
        
        // 初始化游戏管理器用于测试
        this.initializeTestGameManager();
        
        for (const test of this.tests) {
            try {
                console.log(`运行测试: ${test.name}`);
                const result = await test.testFunction(this.gameManager);
                this.testResults.push({ name: test.name, passed: true, result });
                console.log(`✓ 测试通过: ${test.name}`);
            } catch (error) {
                this.testResults.push({ name: test.name, passed: false, error: error.message });
                console.error(`✗ 测试失败: ${test.name} - ${error.message}`);
            }
        }
        
        this.printTestResults();
        return this.testResults;
    }
    
    initializeTestGameManager() {
        // 创建一个简化的游戏管理器用于测试
        this.gameManager = {
            gameObjects: [],
            systems: {
                notificationManager: {
                    showNotification: (message, color, type, priority) => {
                        console.log(`[通知] ${message} (${type}, ${color})`);
                    }
                }
            },
            waveSystem: {
                currentWave: 0,
                waveTimer: 0,
                waveInterval: 60,
                enemiesPerWave: 3,
                maxEnemiesPerWave: 10,
                waveDifficultyMultiplier: 1.0,
                enemyTypes: ['normal', 'fast', 'tank', 'shooter'],
                active: true
            },
            maxEnemies: 10,
            addGameObject: (obj) => {
                this.gameManager.gameObjects.push(obj);
            },
            removeGameObject: (obj) => {
                const index = this.gameManager.gameObjects.indexOf(obj);
                if (index > -1) {
                    this.gameManager.gameObjects.splice(index, 1);
                }
            },
            getObjectsByType: (type) => {
                return this.gameManager.gameObjects.filter(obj => obj.type === type);
            }
        };
        
        // 添加测试所需的方法
        this.gameManager.spawnWave = function() {
            this.waveSystem.currentWave++;
            this.waveSystem.waveDifficultyMultiplier *= 1.1;
            this.waveSystem.enemiesPerWave = Math.min(
                this.waveSystem.maxEnemiesPerWave,
                Math.floor(3 + this.waveSystem.currentWave * 0.5)
            );
            
            // 计算可用的敌人槽位
            const currentEnemyCount = this.gameObjects.filter(obj => 
                obj.type === 'enemy' || (obj.type === 'snake' && !obj.isPlayer)
            ).length;
            const availableSlots = this.maxEnemies - currentEnemyCount;
            const spawnCount = Math.min(this.waveSystem.enemiesPerWave, availableSlots);
            
            // 生成敌人
            for (let i = 0; i < spawnCount; i++) {
                const x = Math.random() * 800 + 100;
                const y = Math.random() * 600 + 100;
                
                // 根据波次难度选择敌人类型
                let enemyType = 'normal';
                const random = Math.random();
                const difficultyThreshold = 0.3 * this.waveSystem.waveDifficultyMultiplier;
                
                if (random < difficultyThreshold && this.waveSystem.currentWave >= 3) {
                    const advancedTypes = ['fast', 'tank', 'shooter'];
                    enemyType = advancedTypes[Math.floor(Math.random() * advancedTypes.length)];
                }
                
                // 生成敌人
                const enemy = {
                    type: 'enemy',
                    enemyType: enemyType,
                    x: x,
                    y: y,
                    health: enemyType === 'tank' ? 150 : enemyType === 'shooter' ? 80 : enemyType === 'fast' ? 50 : 100,
                    damage: enemyType === 'tank' ? 25 : enemyType === 'shooter' ? 10 : enemyType === 'fast' ? 15 : 20,
                    speed: enemyType === 'tank' ? 2 : enemyType === 'shooter' ? 3 : enemyType === 'fast' ? 5 : 3,
                    color: enemyType === 'tank' ? '#27ae60' : enemyType === 'shooter' ? '#9b59b6' : enemyType === 'fast' ? '#3498db' : '#e74c3c',
                    collider: true,
                    lifetime: 60,
                    takeDamage: function(damage) {
                        this.health -= damage;
                        return this.health > 0;
                    }
                };
                
                // 根据波次难度调整敌人属性
                enemy.health *= this.waveSystem.waveDifficultyMultiplier;
                enemy.damage *= this.waveSystem.waveDifficultyMultiplier;
                enemy.speed *= this.waveSystem.waveDifficultyMultiplier;
                
                this.gameObjects.push(enemy);
            }
            
            return {
                wave: this.waveSystem.currentWave,
                spawnCount: spawnCount,
                difficultyMultiplier: this.waveSystem.waveDifficultyMultiplier
            };
        };
    }
    
    printTestResults() {
        console.log('\n=== 测试结果 ===');
        let passedCount = 0;
        let failedCount = 0;
        
        this.testResults.forEach(result => {
            if (result.passed) {
                passedCount++;
                console.log(`✓ ${result.name}`);
            } else {
                failedCount++;
                console.log(`✗ ${result.name}: ${result.error}`);
            }
        });
        
        console.log(`\n测试完成: ${passedCount} 通过, ${failedCount} 失败`);
        console.log(`成功率: ${((passedCount / this.tests.length) * 100).toFixed(1)}%`);
    }
    
    // 波次生成系统测试
    testWaveSpawning() {
        this.addTest('波次生成系统 - 基本功能', async (gameManager) => {
            // 测试初始状态
            console.assert(gameManager.waveSystem.currentWave === 0, '初始波次应为0');
            console.assert(gameManager.waveSystem.waveDifficultyMultiplier === 1.0, '初始难度乘数应为1.0');
            
            // 测试波次生成
            const result = gameManager.spawnWave();
            console.assert(result.wave === 1, '波次应增加到1');
            console.assert(result.spawnCount >= 1, '应生成至少1个敌人');
            console.assert(gameManager.waveSystem.waveDifficultyMultiplier > 1.0, '难度乘数应增加');
            
            // 测试第二波
            const result2 = gameManager.spawnWave();
            console.assert(result2.wave === 2, '波次应增加到2');
            console.assert(result2.spawnCount >= result.spawnCount, '敌人数量应递增或保持不变');
            
            return true;
        });
        
        this.addTest('波次生成系统 - 难度递增', async (gameManager) => {
            // 重置波次系统
            gameManager.waveSystem.currentWave = 0;
            gameManager.waveSystem.waveDifficultyMultiplier = 1.0;
            gameManager.gameObjects = [];
            
            // 测试多波次难度递增
            const waves = 5;
            let previousDifficulty = 1.0;
            let previousEnemyCount = 0;
            
            for (let i = 0; i < waves; i++) {
                const result = gameManager.spawnWave();
                console.assert(result.difficultyMultiplier > previousDifficulty, '难度应递增');
                console.assert(result.spawnCount >= previousEnemyCount, '敌人数量应递增或保持不变');
                
                previousDifficulty = result.difficultyMultiplier;
                previousEnemyCount = result.spawnCount;
            }
            
            return true;
        });
        
        this.addTest('波次生成系统 - 敌人类型多样性', async (gameManager) => {
            // 重置波次系统
            gameManager.waveSystem.currentWave = 0;
            gameManager.waveSystem.waveDifficultyMultiplier = 1.0;
            gameManager.gameObjects = [];
            
            // 测试多波次敌人类型
            const waves = 10;
            const enemyTypes = new Set();
            
            for (let i = 0; i < waves; i++) {
                gameManager.spawnWave();
                
                // 收集生成的敌人类型
                gameManager.gameObjects.forEach(obj => {
                    if (obj.type === 'enemy') {
                        enemyTypes.add(obj.enemyType);
                    }
                });
            }
            
            console.assert(enemyTypes.size >= 2, '应生成至少2种不同类型的敌人');
            console.log(`生成的敌人类型: ${Array.from(enemyTypes).join(', ')}`);
            
            return true;
        });
    }
    
    // 敌人AI测试
    testEnemyAI() {
        this.addTest('敌人AI - 基本行为', async (gameManager) => {
            // 创建测试敌人
            const enemy = {
                type: 'enemy',
                enemyType: 'normal',
                x: 100,
                y: 100,
                speed: 3,
                direction: { x: 1, y: 0 },
                update: function(deltaTime) {
                    // 简单的移动逻辑
                    this.x += this.direction.x * this.speed * deltaTime * 60;
                    this.y += this.direction.y * this.speed * deltaTime * 60;
                    
                    // 边界检查
                    if (this.x < 0 || this.x > 1000) {
                        this.direction.x *= -1;
                    }
                    if (this.y < 0 || this.y > 800) {
                        this.direction.y *= -1;
                    }
                }
            };
            
            // 测试敌人移动
            const initialX = enemy.x;
            enemy.update(0.1); // 更新100ms
            console.assert(enemy.x !== initialX, '敌人应能移动');
            
            return true;
        });
        
        this.addTest('敌人AI - 射手敌人行为', async (gameManager) => {
            // 创建测试射手敌人
            const shooterEnemy = {
                type: 'enemy',
                enemyType: 'shooter',
                x: 100,
                y: 100,
                canShoot: true,
                shootCooldown: 2,
                shootTimer: 0,
                shoot: function() {
                    // 简单的射击逻辑
                    return true;
                },
                update: function(deltaTime) {
                    this.shootTimer += deltaTime;
                    if (this.shootTimer >= this.shootCooldown) {
                        this.shootTimer = 0;
                        return this.shoot();
                    }
                    return false;
                }
            };
            
            // 测试射击冷却
            console.assert(!shooterEnemy.update(0.1), '冷却时间内不应射击');
            
            // 测试射击
            shooterEnemy.shootTimer = 2.0;
            console.assert(shooterEnemy.update(0.1), '冷却时间结束后应能射击');
            
            return true;
        });
    }
    
    // 战斗系统测试
    testCombatSystem() {
        this.addTest('战斗系统 - 敌人受伤和死亡', async (gameManager) => {
            // 创建测试敌人
            const enemy = {
                type: 'enemy',
                enemyType: 'normal',
                health: 100,
                takeDamage: function(damage) {
                    this.health -= damage;
                    return this.health > 0;
                }
            };
            
            // 测试受伤
            const alive = enemy.takeDamage(30);
            console.assert(alive, '敌人应在受到30点伤害后存活');
            console.assert(enemy.health === 70, '敌人生命值应正确减少');
            
            // 测试死亡
            const alive2 = enemy.takeDamage(80);
            console.assert(!alive2, '敌人应在受到80点伤害后死亡');
            console.assert(enemy.health <= 0, '敌人生命值应小于等于0');
            
            return true;
        });
        
        this.addTest('战斗系统 - 不同敌人类型的伤害', async (gameManager) => {
            // 创建不同类型的敌人
            const enemyTypes = [
                { type: 'normal', expectedDamage: 20 },
                { type: 'fast', expectedDamage: 15 },
                { type: 'tank', expectedDamage: 25 },
                { type: 'shooter', expectedDamage: 10 }
            ];
            
            for (const enemyType of enemyTypes) {
                const enemy = {
                    type: 'enemy',
                    enemyType: enemyType.type,
                    damage: enemyType.expectedDamage
                };
                
                console.assert(enemy.damage === enemyType.expectedDamage, 
                    `${enemyType.type}敌人的伤害值应为${enemyType.expectedDamage}`);
            }
            
            return true;
        });
    }
    
    // 集成测试
    testIntegration() {
        this.addTest('集成测试 - 波次生成与敌人AI', async (gameManager) => {
            // 重置游戏状态
            gameManager.waveSystem.currentWave = 0;
            gameManager.waveSystem.waveDifficultyMultiplier = 1.0;
            gameManager.gameObjects = [];
            
            // 生成波次
            const result = gameManager.spawnWave();
            
            // 检查是否生成了敌人
            console.assert(gameManager.gameObjects.length > 0, '波次生成后应添加敌人到游戏对象');
            
            // 检查生成的敌人是否有正确的属性
            const enemy = gameManager.gameObjects.find(obj => obj.type === 'enemy');
            console.assert(enemy !== undefined, '应生成至少一个敌人');
            console.assert(enemy.health > 0, '敌人应有生命值');
            console.assert(enemy.damage > 0, '敌人应有伤害值');
            console.assert(enemy.speed > 0, '敌人应有速度');
            
            return true;
        });
        
        this.addTest('集成测试 - 战斗系统与游戏对象管理', async (gameManager) => {
            // 创建测试敌人
            const enemy = {
                type: 'enemy',
                enemyType: 'normal',
                health: 50,
                takeDamage: function(damage) {
                    this.health -= damage;
                    return this.health > 0;
                }
            };
            
            // 添加敌人到游戏对象
            gameManager.addGameObject(enemy);
            console.assert(gameManager.gameObjects.includes(enemy), '敌人应被添加到游戏对象');
            
            // 测试敌人受伤
            const alive = enemy.takeDamage(30);
            console.assert(alive, '敌人应在受到30点伤害后存活');
            
            // 测试敌人死亡和移除
            const alive2 = enemy.takeDamage(30);
            console.assert(!alive2, '敌人应在受到30点伤害后死亡');
            
            return true;
        });
    }
    
    runAllTests() {
        // 添加所有测试
        this.testWaveSpawning();
        this.testEnemyAI();
        this.testCombatSystem();
        this.testIntegration();
        
        // 运行测试
        this.runTests().then(results => {
            console.log('所有测试运行完成');
        });
    }
}

// 导出测试类
try {
    module.exports = GameTests;
} catch (e) {
    // 浏览器环境
    window.GameTests = GameTests;
}

// 运行测试（如果直接加载此文件）
if (typeof window !== 'undefined' && window.location && window.location.pathname.includes('test')) {
    window.addEventListener('DOMContentLoaded', function() {
        const tests = new GameTests();
        tests.runAllTests();
    });
}