// 游戏对象类
class Food {
    constructor(gameManager, x, y, foodType = 'normal') {
        this.gameManager = gameManager;
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = 'food';
        this.foodType = foodType;
        this.nutrition = 1;
        this.energyValue = 10;
        this.scoreValue = 10;
        this.coinValue = 5;
        this.collider = true;
        this.lifetime = 30;
        
        // 动态效果参数
        this.spawnTime = Date.now();
        this.floatOffset = Math.random() * Math.PI * 2;
        this.rotationAngle = 0;
        this.pulsePhase = 0;
        this.glowIntensity = 1;
        this.attractParticles = [];
        
        // 根据食物类型设置颜色和属性
        this.setupFoodType(foodType);
    }
    
    setupFoodType(type) {
        const types = {
            normal: {
                color: '#ff6b6b',
                glowColor: '#ff9999',
                nutrition: 1,
                energyValue: 10,
                scoreValue: 10,
                coinValue: 5
            },
            golden: {
                color: '#ffd700',
                glowColor: '#ffed4a',
                nutrition: 2,
                energyValue: 25,
                scoreValue: 50,
                coinValue: 25
            },
            energy: {
                color: '#00ff88',
                glowColor: '#66ffaa',
                nutrition: 1,
                energyValue: 30,
                scoreValue: 15,
                coinValue: 10
            },
            power: {
                color: '#ff00ff',
                glowColor: '#ff66ff',
                nutrition: 1,
                energyValue: 15,
                scoreValue: 30,
                coinValue: 15
            }
        };
        
        const config = types[type] || types.normal;
        this.color = config.color;
        this.glowColor = config.glowColor;
        this.nutrition = config.nutrition;
        this.energyValue = config.energyValue;
        this.scoreValue = config.scoreValue;
        this.coinValue = config.coinValue;
    }
    
    update(deltaTime) {
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.gameManager.removeGameObject(this);
            return;
        }
        
        // 更新动画参数
        this.rotationAngle += deltaTime * 2;
        this.pulsePhase += deltaTime * 4;
        this.glowIntensity = 0.7 + Math.sin(this.pulsePhase) * 0.3;
        
        // 生成吸引粒子
        if (Math.random() < 0.1) {
            this.attractParticles.push({
                x: this.x + (Math.random() - 0.5) * 40,
                y: this.y + (Math.random() - 0.5) * 40,
                targetX: this.x,
                targetY: this.y,
                size: 2 + Math.random() * 3,
                alpha: 1,
                speed: 0.5 + Math.random() * 0.5
            });
        }
        
        // 更新粒子
        this.attractParticles = this.attractParticles.filter(p => {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                p.x += (dx / dist) * p.speed;
                p.y += (dy / dist) * p.speed;
            }
            p.alpha -= 0.02;
            p.size *= 0.98;
            return p.alpha > 0;
        });
    }
    
    render(ctx) {
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        const time = (Date.now() - this.spawnTime) / 1000;
        
        // 悬浮动画
        const floatY = Math.sin(time * 2 + this.floatOffset) * 3;
        const drawY = this.y + floatY;
        
        // 绘制吸引粒子
        this.attractParticles.forEach(p => {
            renderCtx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.5})`;
            renderCtx.beginPath();
            renderCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            renderCtx.fill();
        });
        
        // 外层光晕（呼吸效果）
        const glowSize = this.width * 2.5 * this.glowIntensity;
        const outerGlow = renderCtx.createRadialGradient(
            this.x, drawY, 0,
            this.x, drawY, glowSize
        );
        outerGlow.addColorStop(0, this.glowColor + '60');
        outerGlow.addColorStop(0.5, this.glowColor + '20');
        outerGlow.addColorStop(1, this.glowColor + '00');
        
        renderCtx.fillStyle = outerGlow;
        renderCtx.beginPath();
        renderCtx.arc(this.x, drawY, glowSize, 0, Math.PI * 2);
        renderCtx.fill();
        
        // 旋转光芒
        renderCtx.save();
        renderCtx.translate(this.x, drawY);
        renderCtx.rotate(this.rotationAngle);
        
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const rayLength = this.width * 1.5 * this.glowIntensity;
            
            renderCtx.strokeStyle = this.glowColor + '40';
            renderCtx.lineWidth = 2;
            renderCtx.beginPath();
            renderCtx.moveTo(Math.cos(angle) * this.width * 0.7, Math.sin(angle) * this.width * 0.7);
            renderCtx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
            renderCtx.stroke();
        }
        
        renderCtx.restore();
        
        // 食物主体（3D效果）
        const mainGradient = renderCtx.createRadialGradient(
            this.x - 3, drawY - 3, 0,
            this.x, drawY, this.width / 2
        );
        mainGradient.addColorStop(0, '#ffffff');
        mainGradient.addColorStop(0.2, this.glowColor);
        mainGradient.addColorStop(0.6, this.color);
        mainGradient.addColorStop(1, this.darkenColor(this.color, 30));
        
        renderCtx.fillStyle = mainGradient;
        renderCtx.beginPath();
        renderCtx.arc(this.x, drawY, this.width / 2, 0, Math.PI * 2);
        renderCtx.fill();
        
        // 高光效果
        renderCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        renderCtx.beginPath();
        renderCtx.ellipse(this.x - 3, drawY - 3, this.width / 5, this.width / 7, -Math.PI / 4, 0, Math.PI * 2);
        renderCtx.fill();
        
        // 边缘发光
        renderCtx.strokeStyle = this.glowColor + '80';
        renderCtx.lineWidth = 2;
        renderCtx.beginPath();
        renderCtx.arc(this.x, drawY, this.width / 2 + 2, 0, Math.PI * 2);
        renderCtx.stroke();
        
        // 食物类型标识
        if (this.foodType !== 'normal') {
            renderCtx.fillStyle = '#ffffff';
            renderCtx.font = 'bold 10px Arial';
            renderCtx.textAlign = 'center';
            renderCtx.textBaseline = 'middle';
            
            const icons = {
                golden: '★',
                energy: '⚡',
                power: '◆'
            };
            renderCtx.fillText(icons[this.foodType] || '', this.x, drawY);
        }
    }
    
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    serialize() {
        return {
            x: this.x,
            y: this.y,
            type: this.type,
            nutrition: this.nutrition,
            energyValue: this.energyValue,
            scoreValue: this.scoreValue,
            coinValue: this.coinValue,
            color: this.color,
            lifetime: this.lifetime
        };
    }
    
    deserialize(data) {
        this.x = data.x;
        this.y = data.y;
        this.type = data.type;
        this.nutrition = data.nutrition;
        this.energyValue = data.energyValue;
        this.scoreValue = data.scoreValue;
        this.coinValue = data.coinValue || 5;
        this.color = data.color;
        this.lifetime = data.lifetime;
    }
    
    getActualEnergyValue() {
        // 获取食物的实际能量值，考虑天气灾害的影响
        let actualEnergy = this.energyValue;
        
        // 检查是否有活跃的天气灾害
        if (this.gameManager && this.gameManager.systems && this.gameManager.systems.weatherDisaster) {
            const weatherEffects = this.gameManager.systems.weatherDisaster.getDisasterEffects();
            
            // 应用天气灾害对食物能量的影响
            if (weatherEffects.foodSpawnRateMultiplier) {
                // 食物生成率的变化会影响食物的质量
                if (weatherEffects.foodSpawnRateMultiplier > 1) {
                    // 食物更丰富时，单个食物的能量可能会稍微降低
                    actualEnergy *= 0.9;
                } else if (weatherEffects.foodSpawnRateMultiplier < 1) {
                    // 食物稀缺时，单个食物的能量可能会稍微增加
                    actualEnergy *= 1.1;
                }
            }
        }
        
        return Math.round(actualEnergy);
    }
}

/**
 * 敌人类 - 游戏中的敌对单位
 * 支持5种原型：melee（近战）、ranged（远程）、tank（坦克）、agile（敏捷）、support（辅助）
 * 兼容旧类型：normal、fast、tank、shooter
 */
class Enemy {
    /**
     * 构造函数
     * @param {GameManager} gameManager - 游戏管理器实例
     * @param {number} x - 敌人初始X坐标
     * @param {number} y - 敌人初始Y坐标
     * @param {string} enemyType - 敌人类型，默认为'normal'
     * @param {number} waveNumber - 当前波次，影响变体属性
     */
    constructor(gameManager, x, y, enemyType = 'normal', waveNumber = 1) {
        this.gameManager = gameManager;
        this.x = x;
        this.y = y;
        this.type = 'enemy';
        this.collider = true;
        this.lifetime = 60;
        this.waveNumber = waveNumber;
        
        // 状态系统
        this.state = 'idle';
        this.stateTimer = 0;
        
        // 精灵渲染器
        if (window.SpriteRenderer) {
            this.spriteRenderer = new window.SpriteRenderer(gameManager.systems.renderer.ctx);
        }
        
        // 根据敌人类型设置属性
        this.setupEnemyType(enemyType);
    }
    
    /**
     * 根据敌人类型设置属性
     * @param {string} type - 敌人类型
     */
    setupEnemyType(type) {
        // 类型映射：旧类型 -> 新原型
        const typeMapping = {
            'normal': 'melee',
            'fast': 'agile',
            'tank': 'tank',
            'shooter': 'ranged'
        };
        
        // 如果是新原型类型
        const newArchetypes = ['melee', 'ranged', 'tank', 'agile', 'support'];
        
        if (newArchetypes.includes(type)) {
            this.setupNewArchetype(type);
        } else {
            // 使用旧类型或映射到新原型
            const archetype = typeMapping[type] || 'melee';
            this.setupNewArchetype(archetype);
        }
        
        this.direction = { x: 1, y: 0 };
        this.movePattern = Math.floor(Math.random() * 3);
        this.moveTimer = 0;
        this.moveChangeInterval = 2 + Math.random() * 3;
    }
    
    /**
     * 设置新原型敌人
     * @param {string} archetype - 原型类型
     */
    setupNewArchetype(archetype) {
        // 生成变体
        if (window.EnemyVariantGenerator) {
            const variant = window.EnemyVariantGenerator.generate(archetype, this.waveNumber);
            if (variant) {
                this.archetype = variant.archetype;
                this.colorScheme = variant.colorScheme;
                this.weaponType = variant.weaponType;
                this.variantIndex = variant.variantIndex;
                
                const stats = variant.stats;
                this.width = stats.width;
                this.height = stats.height;
                this.speed = stats.speed;
                this.health = stats.health;
                this.maxHealth = stats.health;
                this.damage = stats.damage;
                this.attackRange = stats.attackRange;
                this.attackCooldown = stats.attackCooldown;
                
                // 设置颜色（兼容旧系统）
                this.color = variant.colorScheme.primary;
                this.enemyType = archetype;
                
                // 特殊属性
                const config = window.EnemyConfigs ? window.EnemyConfigs[archetype] : null;
                if (config) {
                    if (config.armor) this.armor = config.armor;
                    if (config.dodgeChance) this.dodgeChance = config.dodgeChance;
                    if (config.healAmount) this.healAmount = config.healAmount;
                    if (config.buffRange) this.buffRange = config.buffRange;
                    if (config.bulletSpeed) this.bulletSpeed = config.bulletSpeed;
                }
                
                this.canShoot = true;
                this.shootTimer = 0;
                return;
            }
        }
        
        // 回退到默认设置
        this.setupDefaultEnemy(archetype);
    }
    
    /**
     * 默认敌人设置
     */
    setupDefaultEnemy(archetype) {
        this.archetype = archetype;
        this.enemyType = archetype;
        this.width = 30;
        this.height = 30;
        this.speed = 2;
        this.health = 100;
        this.maxHealth = 100;
        this.damage = 20;
        this.color = '#e74c3c';
        this.colorScheme = {
            primary: '#e74c3c',
            secondary: '#c0392b',
            highlight: '#f5b7b1',
            accent: '#ff6b6b'
        };
        this.weaponType = 'sword';
        this.canShoot = true;
        this.shootTimer = 0;
        this.attackRange = 50;
        this.attackCooldown = 2;
    }
    
    /**
     * 更新敌人状态
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.gameManager.removeGameObject(this);
            return;
        }
        
        // 更新状态计时器
        this.stateTimer += deltaTime;
        
        // 更新移动计时器
        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.moveChangeInterval) {
            this.moveTimer = 0;
            this.changeMovePattern();
        }
        
        // 根据移动模式更新移动（增强AI）
        this.updateMovementEnhanced(deltaTime);
        
        // 边界检查
        if (this.x < 0 || this.x > 1000) {
            this.direction.x *= -1;
            this.x = Math.max(0, Math.min(1000, this.x));
        }
        if (this.y < 0 || this.y > 800) {
            this.direction.y *= -1;
            this.y = Math.max(0, Math.min(800, this.y));
        }
        
        // 增强的射击逻辑
        if (this.canShoot) {
            this.shootTimer += deltaTime;
            // 动态调整射击冷却（根据距离玩家远近）
            const dynamicCooldown = this.calculateDynamicCooldown();
            if (this.shootTimer >= dynamicCooldown) {
                this.shootTimer = 0;
                this.shootEnhanced();
            }
        }
    }
    
    /**
     * 计算动态射击冷却
     */
    calculateDynamicCooldown() {
        if (!this.gameManager.player) return this.shootCooldown;
        
        const player = this.gameManager.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 距离越近，射击越频繁（最多减少50%冷却时间）
        const distanceFactor = Math.min(distance / 400, 1);
        return this.shootCooldown * (0.5 + distanceFactor * 0.5);
    }
    
    /**
     * 根据移动模式更新移动（增强AI）
     * @param {number} deltaTime - 时间增量（秒）
     */
    updateMovementEnhanced(deltaTime) {
        // 扩大检测范围
        const detectionRange = 600; // 原来约400
        
        if (this.gameManager.player) {
            const player = this.gameManager.player;
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 更新状态
            if (distance < this.attackRange) {
                this.state = 'attack';
            } else if (distance < detectionRange) {
                this.state = 'chase';
            } else {
                this.state = 'patrol';
            }
            
            switch(this.state) {
                case 'chase':
                    // 智能追踪：预测玩家移动方向
                    const predictX = player.x + (player.velocity?.x || 0) * 10;
                    const predictY = player.y + (player.velocity?.y || 0) * 10;
                    const pdx = predictX - this.x;
                    const pdy = predictY - this.y;
                    const pdistance = Math.sqrt(pdx * pdx + pdy * pdy);
                    
                    if (pdistance > 0) {
                        // 远程敌人保持距离
                        if (this.archetype === 'ranged' && distance < 200) {
                            // 后退保持距离
                            this.x -= (pdx / pdistance) * this.speed * deltaTime * 40;
                            this.y -= (pdy / pdistance) * this.speed * deltaTime * 40;
                        } else {
                            // 追踪预测位置
                            this.x += (pdx / pdistance) * this.speed * deltaTime * 60;
                            this.y += (pdy / pdistance) * this.speed * deltaTime * 60;
                        }
                    }
                    break;
                    
                case 'attack':
                    // 攻击状态：保持距离或绕圈
                    if (this.archetype === 'ranged') {
                        // 远程敌人绕圈移动
                        const circleAngle = Date.now() * 0.002;
                        this.x += Math.cos(circleAngle) * this.speed * deltaTime * 30;
                        this.y += Math.sin(circleAngle) * this.speed * deltaTime * 30;
                    }
                    break;
                    
                default:
                    // 巡逻模式
                    this.updateMovement(deltaTime);
            }
        } else {
            this.updateMovement(deltaTime);
        }
    }
    
    /**
     * 原始移动更新方法
     */
    updateMovement(deltaTime) {
        switch(this.movePattern) {
            case 0: // 直线移动，随机改变方向
                this.x += this.direction.x * this.speed * deltaTime * 60;
                this.y += this.direction.y * this.speed * deltaTime * 60;
                break;
            case 1: // 环形移动
                const angle = Date.now() * 0.001;
                this.x += Math.cos(angle) * this.speed * deltaTime * 60;
                this.y += Math.sin(angle) * this.speed * deltaTime * 60;
                break;
            case 2: // 追踪玩家移动
                if (this.gameManager.player) {
                    const player = this.gameManager.player;
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 100) {
                        const moveX = (dx / distance) * this.speed * deltaTime * 60 * 0.7;
                        const moveY = (dy / distance) * this.speed * deltaTime * 60 * 0.7;
                        this.x += moveX;
                        this.y += moveY;
                    } else {
                        this.x += this.direction.x * this.speed * deltaTime * 60;
                        this.y += this.direction.y * this.speed * deltaTime * 60;
                    }
                } else {
                    this.x += this.direction.x * this.speed * deltaTime * 60;
                    this.y += this.direction.y * this.speed * deltaTime * 60;
                }
                break;
        }
    }
    
    /**
     * 改变移动模式
     */
    changeMovePattern() {
        this.movePattern = Math.floor(Math.random() * 3);
        this.moveChangeInterval = 2 + Math.random() * 3;
    }
    
    /**
     * 增强的射击方法
     */
    shootEnhanced() {
        if (!this.gameManager.player) return;
        
        const player = this.gameManager.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 扩大射击范围
        const shootRange = 600; // 原400
        
        if (distance < shootRange) {
            // 根据敌人类型调整射击方式
            if (this.archetype === 'ranged') {
                // 远程敌人：预测射击
                const predictX = player.x + (player.velocity?.x || 0) * 15;
                const predictY = player.y + (player.velocity?.y || 0) * 15;
                const pdx = predictX - this.x;
                const pdy = predictY - this.y;
                const pdistance = Math.sqrt(pdx * pdx + pdy * pdy);
                
                if (pdistance > 0) {
                    const bullet = new EnemyBullet(
                        this.gameManager, 
                        this.x, 
                        this.y, 
                        pdx / pdistance, 
                        pdy / pdistance,
                        {
                            size: 28,
                            speed: 0.7,
                            color: this.colorScheme?.accent || '#ff6b6b',
                            damage: this.damage
                        }
                    );
                    this.gameManager.addGameObject(bullet);
                }
            } else {
                // 其他敌人：普通射击
                const bullet = new EnemyBullet(
                    this.gameManager, 
                    this.x, 
                    this.y, 
                    dx / distance, 
                    dy / distance,
                    {
                        size: 24,
                        speed: 0.8,
                        color: '#ff6b6b',
                        damage: this.damage
                    }
                );
                this.gameManager.addGameObject(bullet);
            }
        }
    }
    
    /**
     * 原始射击方法（保留兼容）
     */
    shoot() {
        this.shootEnhanced();
    }
    
    /**
     * 渲染敌人
     */
    render(ctx) {
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        
        // 使用新的精灵渲染器
        if (this.spriteRenderer && this.archetype) {
            this.spriteRenderer.drawEnemy(this, this.x, this.y, 1);
        } else {
            // 回退到基础渲染
            renderCtx.fillStyle = this.color;
            renderCtx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // 绘制敌人生命值条
        if (this.health > 0 && this.maxHealth) {
            const healthPercentage = this.health / this.maxHealth;
            const barWidth = this.width;
            const barHeight = 5;
            
            // 背景条
            renderCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            renderCtx.fillRect(this.x, this.y - 10, barWidth, barHeight);
            
            // 生命值条
            renderCtx.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : healthPercentage > 0.2 ? '#ffcc5c' : '#ff6b6b';
            renderCtx.fillRect(this.x, this.y - 10, barWidth * healthPercentage, barHeight);
        }
    }
    
    /**
     * 敌人受到伤害
     * @param {number} damage - 伤害值
     */
    takeDamage(damage) {
        this.health -= damage;
        
        // 显示敌人受伤的视觉反馈
        if (this.health > 0) {
            if (this.gameManager.systems.notificationManager) {
                this.gameManager.systems.notificationManager.showNotification(
                    `💢 ${this.getEnemyTypeName()} 受到 ${damage} 点伤害！`,
                    this.color,
                    'info',
                    0.5
                );
            }
        } else {
            // 敌人被击败
            this.die();
        }
    }
    
    /**
     * 敌人死亡
     */
    die() {
        // 显示敌人被击败的视觉反馈
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `🏆 ${this.getEnemyTypeName()} 被击败！`,
                '#4CAF50',
                'success',
                1
            );
        }
        
        // 从游戏中移除
        this.gameManager.removeGameObject(this);
    }
    
    /**
     * 获取敌人类型的中文名称
     * @returns {string} 敌人类型的中文名称
     */
    getEnemyTypeName() {
        switch(this.enemyType) {
            case 'fast': return '快速敌人';
            case 'tank': return '坦克敌人';
            case 'shooter': return '射手敌人';
            default: return '普通敌人';
        }
    }
    
    serialize() {
        return {
            x: this.x,
            y: this.y,
            type: this.type,
            enemyType: this.enemyType,
            speed: this.speed,
            direction: this.direction,
            color: this.color,
            lifetime: this.lifetime,
            health: this.health,
            damage: this.damage
        };
    }
    
    deserialize(data) {
        this.x = data.x;
        this.y = data.y;
        this.type = data.type;
        this.enemyType = data.enemyType || 'normal';
        this.speed = data.speed;
        this.direction = data.direction;
        this.color = data.color;
        this.lifetime = data.lifetime;
        this.health = data.health;
        this.damage = data.damage;
        
        // 重新设置敌人类型属性
        this.setupEnemyType(this.enemyType);
    }
}

/**
 * 敌人子弹类 - 射手敌人发射的子弹
 */
class EnemyBullet {
    /**
     * 构造函数
     * @param {GameManager} gameManager - 游戏管理器实例
     * @param {number} x - 子弹初始X坐标
     * @param {number} y - 子弹初始Y坐标
     * @param {number} dx - X方向速度分量
     * @param {number} dy - Y方向速度分量
     * @param {Object} config - 子弹配置参数
     */
    constructor(gameManager, x, y, dx, dy, config = {}) {
        this.gameManager = gameManager;
        this.x = x;
        this.y = y;
        this.width = config.size || 28; // 增大尺寸（原18）
        this.height = config.size || 28;
        this.type = 'enemy_bullet';
        this.speed = config.speed || 0.7; // 降低速度至原速度的70%（原1）
        this.direction = { x: dx, y: dy };
        this.color = config.color || '#ff6b6b';
        this.collider = true;
        this.lifetime = 15;
        this.damage = config.damage || 10;
        
        // 视觉效果增强
        this.trail = [];
        this.maxTrailLength = 25; // 增加轨迹长度
        this.glowIntensity = 1;
        this.pulsePhase = 0;
        this.particles = []; // 粒子效果
        this.rotationAngle = 0;
    }
    
    /**
     * 更新子弹状态
     * @param {number} deltaTime - 时间增量（秒）
     */
    update(deltaTime) {
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.gameManager.removeGameObject(this);
            return;
        }
        
        // 保存轨迹点
        this.trail.unshift({ x: this.x, y: this.y, time: Date.now() });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
        
        // 移动子弹
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;
        
        // 更新脉冲效果
        this.pulsePhase += deltaTime * 8;
        this.glowIntensity = 0.7 + Math.sin(this.pulsePhase) * 0.3;
        
        // 更新旋转角度
        this.rotationAngle += deltaTime * 3;
        
        // 生成粒子效果
        if (Math.random() < 0.3) {
            this.particles.push({
                x: this.x + (Math.random() - 0.5) * 10,
                y: this.y + (Math.random() - 0.5) * 10,
                size: 3 + Math.random() * 4,
                alpha: 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }
        
        // 更新粒子
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.05;
            p.size *= 0.95;
            return p.alpha > 0;
        });
        
        // 边界检查
        if (this.x < -50 || this.x > 1050 || this.y < -50 || this.y > 850) {
            this.gameManager.removeGameObject(this);
        }
    }
    
    /**
     * 渲染子弹
     */
    render(ctx) {
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        
        // 绘制粒子效果
        this.particles.forEach(p => {
            renderCtx.fillStyle = `rgba(255, 150, 100, ${p.alpha})`;
            renderCtx.beginPath();
            renderCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            renderCtx.fill();
        });
        
        // 绘制长轨迹线（增强可见度）
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length - 1; i++) {
                const point = this.trail[i];
                const nextPoint = this.trail[i + 1];
                const progress = i / this.trail.length;
                const alpha = (1 - progress) * 0.6;
                const size = this.width * (1 - progress * 0.5);
                
                renderCtx.strokeStyle = `rgba(255, 107, 107, ${alpha})`;
                renderCtx.lineWidth = size * 0.4;
                renderCtx.lineCap = 'round';
                renderCtx.beginPath();
                renderCtx.moveTo(point.x, point.y);
                renderCtx.lineTo(nextPoint.x, nextPoint.y);
                renderCtx.stroke();
            }
        }
        
        // 绘制超长弹道轨迹（新增）
        const trailLength = 80; // 增加轨迹长度
        const trailX = this.x - this.direction.x * trailLength;
        const trailY = this.y - this.direction.y * trailLength;
        
        const trailGradient = renderCtx.createLinearGradient(this.x, this.y, trailX, trailY);
        trailGradient.addColorStop(0, 'rgba(255, 107, 107, 0.8)');
        trailGradient.addColorStop(0.3, 'rgba(255, 150, 100, 0.5)');
        trailGradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
        
        renderCtx.strokeStyle = trailGradient;
        renderCtx.lineWidth = 10;
        renderCtx.lineCap = 'round';
        renderCtx.beginPath();
        renderCtx.moveTo(this.x, this.y);
        renderCtx.lineTo(trailX, trailY);
        renderCtx.stroke();
        
        // 绘制外层大发光效果（增强）
        const outerGlowSize = this.width * 2 * this.glowIntensity;
        const outerGlowGradient = renderCtx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, outerGlowSize
        );
        outerGlowGradient.addColorStop(0, 'rgba(255, 107, 107, 0.8)');
        outerGlowGradient.addColorStop(0.5, 'rgba(255, 150, 100, 0.4)');
        outerGlowGradient.addColorStop(1, 'rgba(255, 107, 107, 0)');
        
        renderCtx.fillStyle = outerGlowGradient;
        renderCtx.beginPath();
        renderCtx.arc(this.x, this.y, outerGlowSize, 0, Math.PI * 2);
        renderCtx.fill();
        
        // 绘制子弹主体（增大）
        const mainGradient = renderCtx.createRadialGradient(
            this.x - 3, this.y - 3, 0,
            this.x, this.y, this.width / 2
        );
        mainGradient.addColorStop(0, '#ffffff');
        mainGradient.addColorStop(0.3, '#ffaaaa');
        mainGradient.addColorStop(0.7, this.color);
        mainGradient.addColorStop(1, '#cc4444');
        
        renderCtx.fillStyle = mainGradient;
        renderCtx.beginPath();
        renderCtx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        renderCtx.fill();
        
        // 绘制子弹边框（加粗）
        renderCtx.strokeStyle = '#ffffff';
        renderCtx.lineWidth = 4;
        renderCtx.beginPath();
        renderCtx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        renderCtx.stroke();
        
        // 绘制子弹中心亮点
        renderCtx.fillStyle = '#ffffff';
        renderCtx.beginPath();
        renderCtx.arc(this.x, this.y, this.width / 3, 0, Math.PI * 2);
        renderCtx.fill();
        
        // 绘制旋转光芒效果
        renderCtx.save();
        renderCtx.translate(this.x, this.y);
        renderCtx.rotate(this.rotationAngle);
        
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            renderCtx.strokeStyle = `rgba(255, 200, 150, ${0.5 * this.glowIntensity})`;
            renderCtx.lineWidth = 2;
            renderCtx.beginPath();
            renderCtx.moveTo(Math.cos(angle) * this.width * 0.6, Math.sin(angle) * this.width * 0.6);
            renderCtx.lineTo(Math.cos(angle) * this.width * 1.2, Math.sin(angle) * this.width * 1.2);
            renderCtx.stroke();
        }
        renderCtx.restore();
        
        // 绘制子弹闪烁效果
        if (Math.sin(Date.now() * 0.015) > 0) {
            renderCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            renderCtx.beginPath();
            renderCtx.arc(this.x, this.y, this.width / 4, 0, Math.PI * 2);
            renderCtx.fill();
        }
    }
    
    /**
     * 处理碰撞
     * @param {Object} other - 碰撞的对象
     */
    onCollision(other) {
        if (other.type === 'snake' && other.isPlayer) {
            // 击中玩家
            if (!other.invincible) {
                other.energySystem.consume(this.damage);
                this.gameManager.removeGameObject(this);
            }
        }
    }
}

// 游戏数据管理
class GameDataManager {
    constructor() {
        this.coins = 0;
        this.skins = [];
        this.items = [];
        this.achievements = [];
        this.purchaseCounts = {}; // 跟踪商品购买次数
        this.loadData();
    }
    
    loadData() {
        // 从本地存储加载数据
        try {
            const savedData = localStorage.getItem('mythicSnakeData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.coins = data.coins || 0;
                this.skins = data.skins || [];
                this.items = data.items || [];
                this.achievements = data.achievements || [];
                this.purchaseCounts = data.purchaseCounts || {};
            }
        } catch (error) {
            console.error('Error loading game data:', error);
        }
    }
    
    saveData() {
        // 保存数据到本地存储
        try {
            const data = {
                coins: this.coins,
                skins: this.skins,
                items: this.items,
                achievements: this.achievements,
                purchaseCounts: this.purchaseCounts
            };
            localStorage.setItem('mythicSnakeData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving game data:', error);
        }
    }
    
    getPurchaseCount(itemId) {
        return this.purchaseCounts[itemId] || 0;
    }
    
    incrementPurchaseCount(itemId) {
        if (!this.purchaseCounts[itemId]) {
            this.purchaseCounts[itemId] = 0;
        }
        this.purchaseCounts[itemId]++;
        this.saveData();
        return this.purchaseCounts[itemId];
    }
    
    addCoins(amount) {
        this.coins += amount;
        this.saveData();
    }
    
    removeCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.saveData();
            return true;
        }
        return false;
    }
    
    addSkin(skinId) {
        if (!this.skins.includes(skinId)) {
            this.skins.push(skinId);
            this.saveData();
        }
    }
    
    addItem(itemId) {
        if (!this.items.includes(itemId)) {
            this.items.push(itemId);
            this.saveData();
        }
    }
    
    updateAchievement(achievementId, progress) {
        let achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) {
            achievement = {
                id: achievementId,
                progress: 0,
                completed: false
            };
            this.achievements.push(achievement);
        }
        
        const wasCompleted = achievement.completed;
        const oldProgress = achievement.progress;
        
        achievement.progress = Math.min(progress, 100);
        if (achievement.progress === 100 && !wasCompleted) {
            achievement.completed = true;
            
            // 显示成就解锁通知
            this.showAchievementNotification(achievementId);
        }
        
        this.saveData();
        
        // 实时更新成就界面
        if (typeof loadAchievements === 'function') {
            const achievementsContainer = document.getElementById('achievements-container');
            if (achievementsContainer && achievementsContainer.parentElement && !achievementsContainer.parentElement.classList.contains('hidden')) {
                loadAchievements();
            }
        }
    }
    
    showAchievementNotification(achievementId) {
        // 显示成就解锁通知
        const achievementData = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievementData) return;
        
        if (window.gameManager && window.gameManager.systems.notificationManager) {
            window.gameManager.systems.notificationManager.showNotification(
                `🏆 成就解锁: ${achievementData.title}`,
                '#ffd700',
                'achievement',
                2,
                'achievement'
            );
        } else if (window.gameManager) {
            window.gameManager.showNotification(
                `🏆 成就解锁: ${achievementData.title}`,
                '#ffd700',
                'achievement'
            );
        }
        
        console.log(`成就解锁: ${achievementData.title}`);
    }
    
    getCoins() {
        return this.coins;
    }
    
    hasSkin(skinId) {
        return this.skins.includes(skinId);
    }
    
    hasItem(itemId) {
        return this.items.includes(itemId);
    }
    
    getAchievement(achievementId) {
        return this.achievements.find(a => a.id === achievementId) || { id: achievementId, progress: 0, completed: false };
    }
}

// 成就系统数据
const ACHIEVEMENTS = [
    {
        id: 'first_game',
        title: '初次尝试',
        description: '完成你的第一场游戏',
        icon: '🎮',
        target: 1
    },
    {
        id: 'snake_master',
        title: '蛇王',
        description: '让蛇的长度达到20节',
        icon: '🐍',
        target: 20
    },
    {
        id: 'wormhole_traveler',
        title: '虫洞旅行者',
        description: '使用虫洞穿梭10次',
        icon: '🚪',
        target: 10
    },
    {
        id: 'zone_master',
        title: '区域大师',
        description: '进入所有类型的场地区域',
        icon: '🌍',
        target: 4
    },
    {
        id: 'high_score',
        title: '高分达人',
        description: '获得1000分以上',
        icon: '🏆',
        target: 1000
    }
];

// 商城商品数据
const SHOP_ITEMS = {
    skins: [
        {
            id: 'skin_green',
            name: '绿宝石',
            price: 100,
            icon: '💚',
            description: '绿色皮肤，经典选择',
            maxPurchases: 1 // 皮肤只能购买一次
        },
        {
            id: 'skin_blue',
            name: '蓝宝石',
            price: 200,
            icon: '💙',
            description: '蓝色皮肤，冷静优雅',
            maxPurchases: 1 // 皮肤只能购买一次
        },
        {
            id: 'skin_gold',
            name: '黄金',
            price: 500,
            icon: '💛',
            description: '金色皮肤，尊贵华丽',
            maxPurchases: 1 // 皮肤只能购买一次
        },
        {
            id: 'skin_rainbow',
            name: '彩虹',
            price: 1000,
            icon: '🌈',
            description: '彩虹皮肤，绚丽多彩',
            maxPurchases: 1 // 皮肤只能购买一次
        }
    ],
    items: [
        {
            id: 'item_backtrack',
            name: '回溯次数+1',
            price: 150,
            icon: '⏪',
            description: '增加一次时间回溯机会',
            maxPurchases: 5 // 最多购买5次
        },
        {
            id: 'item_energy',
            name: '能量上限+20',
            price: 250,
            icon: '⚡',
            description: '增加20点能量上限',
            maxPurchases: 3 // 最多购买3次
        },
        {
            id: 'item_speed',
            name: '速度提升',
            price: 300,
            icon: '🚀',
            description: '永久提升移动速度',
            maxPurchases: 2 // 最多购买2次
        }
    ],
    weather: [
        {
            id: 'weather_umbrella',
            name: '雨伞',
            price: 200,
            icon: '☂️',
            description: '减少暴雨和雷暴的负面影响，提高能见度',
            maxPurchases: 1 // 只能购买一次
        },
        {
            id: 'weather_warm_clothes',
            name: '保暖衣物',
            price: 250,
            icon: '🧥',
            description: '减少暴风雪和热浪的负面影响，降低能量消耗',
            maxPurchases: 1 // 只能购买一次
        },
        {
            id: 'weather_goggles',
            name: '护目镜',
            price: 180,
            icon: '🥽',
            description: '减少沙尘暴的能见度影响，提高移动速度',
            maxPurchases: 1 // 只能购买一次
        },
        {
            id: 'weather_detector',
            name: '天气预测装置',
            price: 400,
            icon: '🔍',
            description: '提前30秒预测天气灾害，给予准备时间',
            maxPurchases: 1 // 只能购买一次
        },
        {
            id: 'weather_energy_pack',
            name: '应急能量包',
            price: 100,
            icon: '💊',
            description: '在天气灾害中快速恢复20点能量',
            maxPurchases: 10 // 最多购买10次
        }
    ]
};

// 主游戏文件
window.addEventListener('DOMContentLoaded', function() {
    // 初始化游戏
    console.log('初始化Mythic Snake游戏...');
    
    // 创建游戏数据管理器
    window.gameDataManager = new GameDataManager();
    console.log('Game data manager created:', window.gameDataManager);
    
    // 确保所有系统都已加载
    setTimeout(function() {
        try {
            // 创建游戏实例
            console.log('Creating game manager...');
            window.gameManager = new GameManager();
            console.log('Game manager created:', window.gameManager);
            
            // 初始化UI事件
            initUIEvents();
            console.log('UI events initialized');
            
            // 更新金币显示
            updateCoinsDisplay();
            
            // 显示主菜单
            showMainMenu();
            console.log('Main menu displayed');
        } catch (error) {
            console.error('Error creating game manager:', error);
        }
    }, 1000);
});

function initUIEvents() {
    function playClickSound() {
        if (window.gameManager && window.gameManager.systems && window.gameManager.systems.audioManager) {
            window.gameManager.systems.audioManager.playButtonClickSound();
        }
    }
    
    // 开始游戏按钮
    document.getElementById('start-btn').addEventListener('click', function() {
        playClickSound();
        startGame();
    });
    
    // 仓库按钮
    const inventoryBtn = document.getElementById('inventory-btn');
    if (inventoryBtn) {
        inventoryBtn.addEventListener('click', function() {
            playClickSound();
            if (window.gameManager && window.gameManager.systems.inventorySystem) {
                window.gameManager.systems.inventorySystem.showInventory();
            }
        });
    }
    
    // 继续游戏按钮（主菜单）
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            playClickSound();
            showContinueGameMenu();
        });
    }
    
    // 排行榜按钮（主菜单）
    const leaderboardMenuBtn = document.getElementById('leaderboard-menu-btn');
    if (leaderboardMenuBtn) {
        leaderboardMenuBtn.addEventListener('click', function() {
            playClickSound();
            if (window.leaderboardUI) {
                window.leaderboardUI.show();
            }
        });
    }
    
    // 排行榜按钮（游戏中）
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    if (leaderboardBtn) {
        leaderboardBtn.addEventListener('click', function() {
            playClickSound();
            if (window.leaderboardUI) {
                window.leaderboardUI.toggle();
            }
        });
    }
    
    // 玩法说明按钮
    const guideBtn = document.getElementById('guide-btn');
    if (guideBtn) {
        guideBtn.addEventListener('click', function() {
            playClickSound();
            showGuideMenu();
        });
    }
    
    // 成就系统按钮
    document.getElementById('achievements-btn').addEventListener('click', function() {
        playClickSound();
        showAchievementsMenu();
    });
    
    // 商城按钮
    document.getElementById('shop-btn').addEventListener('click', function() {
        playClickSound();
        showShopMenu();
    });
    
    // 返回按钮
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            playClickSound();
            showMainMenu();
        });
    });
    
    // 商城分类按钮
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            playClickSound();
            // 移除所有active类
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            // 添加active类到当前按钮
            this.classList.add('active');
            // 更新商品显示
            updateShopItems(this.textContent.trim());
        });
    });
    
    // 游戏内菜单按钮
    document.getElementById('menu-btn').addEventListener('click', function() {
        playClickSound();
        showPauseMenu();
    });
    
    // 继续游戏按钮
    document.getElementById('resume-btn').addEventListener('click', function() {
        playClickSound();
        hidePauseMenu();
    });
    
    // 保存游戏按钮
    document.getElementById('save-btn').addEventListener('click', function() {
        playClickSound();
        showSaveMenu('save');
    });
    
    // 加载游戏按钮
    document.getElementById('load-btn').addEventListener('click', function() {
        playClickSound();
        showSaveMenu('load');
    });
    
    // 存档管理返回按钮
    const saveBackBtn = document.getElementById('save-back-btn');
    if (saveBackBtn) {
        saveBackBtn.addEventListener('click', function() {
            playClickSound();
            hideSaveMenu();
        });
    }
    
    // 存档标签切换
    document.querySelectorAll('.save-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            playClickSound();
            const tabName = this.getAttribute('data-tab');
            switchSaveTab(tabName);
        });
    });
    
    // 退出游戏按钮
    document.getElementById('quit-btn').addEventListener('click', function() {
        playClickSound();
        showMainMenu();
    });
    
    // 重新开始按钮
    document.getElementById('restart-btn').addEventListener('click', function() {
        playClickSound();
        startGame();
    });
    
    // 游戏结束界面的返回菜单按钮
    document.getElementById('game-over-menu-btn').addEventListener('click', function() {
        playClickSound();
        showMainMenu();
    });
    
    // 快捷键监听
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F3') {
            e.preventDefault();
            toggleDebugPanel();
        }
        
        if (e.key === 'F5') {
            e.preventDefault();
            quickSave();
        }
        
        if (e.key === 'F9') {
            e.preventDefault();
            quickLoad();
        }
    });
    
    // 调试面板关闭按钮
    const closeDebugBtn = document.getElementById('close-debug-btn');
    if (closeDebugBtn) {
        closeDebugBtn.addEventListener('click', function() {
            const debugPanel = document.getElementById('debug-panel');
            if (debugPanel) {
                debugPanel.classList.add('hidden');
            }
        });
    }
}

function toggleDebugPanel() {
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
        debugPanel.classList.toggle('hidden');
    }
}

function quickSave() {
    const saveManager = window.gameManager?.systems?.saveManager;
    const notificationManager = window.gameManager?.systems?.notificationManager;
    
    if (!saveManager) {
        showQuickSaveHint('存档系统未初始化', 'error');
        return;
    }
    
    if (!window.gameManager || !window.gameManager.player) {
        showQuickSaveHint('无法保存：游戏未开始', 'error');
        return;
    }
    
    if (window.gameManager.gameState !== 'playing') {
        showQuickSaveHint('只能在游戏进行中快速存档', 'warning');
        return;
    }
    
    const result = saveManager.quickSave();
    
    if (result.success) {
        showQuickSaveHint(`💾 已保存到存档 ${result.slot + 1}`, 'success');
    } else {
        showQuickSaveHint(`❌ ${result.error}`, 'error');
    }
}

function quickLoad() {
    const saveManager = window.gameManager?.systems?.saveManager;
    
    if (!saveManager) {
        showQuickSaveHint('存档系统未初始化', 'error');
        return;
    }
    
    if (!saveManager.hasAnySave()) {
        showQuickSaveHint('没有找到存档', 'warning');
        return;
    }
    
    const latestSlot = saveManager.getLatestSaveSlot();
    if (latestSlot >= 0) {
        const result = saveManager.load(latestSlot);
        
        if (result.success) {
            showQuickSaveHint(`📂 已加载存档 ${latestSlot + 1}`, 'success');
            
            if (window.gameManager.gameState !== 'playing') {
                document.querySelectorAll('.menu-screen').forEach(menu => {
                    menu.classList.add('hidden');
                });
                
                const gameUI = document.getElementById('game-ui');
                if (gameUI) gameUI.classList.remove('hidden');
                
                const organSystem = document.getElementById('organ-system');
                const eventLog = document.getElementById('event-log');
                if (organSystem) organSystem.classList.add('show');
                if (eventLog) eventLog.classList.add('show');
                
                document.querySelectorAll('.floating-orb').forEach(orb => {
                    orb.style.display = 'none';
                });
                
                window.gameManager.startGameLoop();
            }
        } else {
            showQuickSaveHint(`❌ ${result.error}`, 'error');
        }
    }
}

function showQuickSaveHint(message, type = 'info') {
    const existing = document.querySelector('.quick-save-hint');
    if (existing) existing.remove();
    
    const hint = document.createElement('div');
    hint.className = 'quick-save-hint';
    
    const colors = {
        success: 'rgba(78, 205, 196, 0.9)',
        error: 'rgba(231, 76, 60, 0.9)',
        warning: 'rgba(255, 204, 92, 0.9)',
        info: 'rgba(52, 152, 219, 0.9)'
    };
    
    hint.style.background = colors[type] || colors.info;
    hint.textContent = message;
    
    document.body.appendChild(hint);
    
    setTimeout(() => {
        hint.classList.add('fade-out');
        setTimeout(() => hint.remove(), 300);
    }, 2000);
}

function startGame() {
    // 隐藏主菜单
    document.getElementById('main-menu').classList.add('hidden');
    
    // 获取游戏实例
    const gameManager = window.gameManager;
    
    // 强制显示开场故事 - 任何情况下都必须显示
    try {
        if (window.IntroStory) {
            // 创建并显示开场故事
            const introStory = new IntroStory(gameManager);
            gameManager.introStory = introStory;
            
            // 启动游戏循环（用于更新开场故事的跳过功能）
            gameManager.startGameLoop();
            
            // 显示开场故事
            introStory.show();
        } else {
            // IntroStory 类未加载，动态创建简单的开场故事显示
            console.warn('IntroStory class not found, creating fallback story display');
            createFallbackIntroStory(gameManager);
        }
    } catch (error) {
        console.error('Error showing intro story:', error);
        // 即使出错也尝试显示备用开场故事
        createFallbackIntroStory(gameManager);
    }
}

function createFallbackIntroStory(gameManager) {
    // 创建一个简单的开场故事容器
    const container = document.createElement('div');
    container.id = 'fallback-intro-story';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 20000;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f1a 100%);
        opacity: 0;
        transition: opacity 1s ease;
    `;
    
    // 故事内容
    const storyTexts = [
        { title: "混沌初开", content: "在时间尚未被命名的纪元，虚空之中唯有混沌。混沌无形无相，却蕴含万物之种。它在永恒的黑暗中沉睡，呼吸间便是万古的轮回。" },
        { title: "神祇诞生", content: "混沌的意识分裂为二，化作五大原初神祇：泰坦、炎魔、九首海德拉、雷神与混沌·努恩。他们联手开辟天地，将混沌本源封印于世界极渊。" },
        { title: "始祖之蛇", content: "创世完成之际，始祖之蛇诞生于余烬之中。它拥有吞噬一切、转化一切的神奇力量，游走于天地之间，净化世界，被称为「世界之环」。" },
        { title: "诸神黄昏", content: "万年之后，混沌的低语唤醒了炎魔。诸神之战持续三百载，世界破碎，神祇陨落。始祖之蛇吞噬过多混沌之力，陷入永恒沉睡。" },
        { title: "命运之始", content: "如今，封印松动，神话遗物散落各地。你，作为蛇之眷属的一员，从混沌中苏醒。吞噬吧，进化吧，成为新世界之环——或者让混沌吞噬一切。" }
    ];
    
    let currentIndex = 0;
    
    // 标题元素
    const titleEl = document.createElement('div');
    titleEl.style.cssText = `
        font-size: 2.5em;
        color: #ffd700;
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
        margin-bottom: 40px;
        text-align: center;
        font-weight: 300;
        letter-spacing: 8px;
    `;
    
    // 内容容器
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
        width: 90%;
        max-width: 800px;
        padding: 30px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 215, 0, 0.2);
        border-radius: 16px;
        backdrop-filter: blur(10px);
    `;
    
    // 内容元素
    const textEl = document.createElement('div');
    textEl.style.cssText = `
        font-size: 1.2em;
        color: rgba(255, 255, 255, 0.9);
        line-height: 2;
        text-align: justify;
        font-family: 'Georgia', 'Noto Serif SC', serif;
        letter-spacing: 1px;
    `;
    
    // 进度指示器
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
        margin-top: 40px;
        display: flex;
        gap: 12px;
    `;
    
    storyTexts.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.style.cssText = `
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: ${index === 0 ? '#ffd700' : 'rgba(255, 255, 255, 0.2)'};
            border: 1px solid rgba(255, 215, 0, 0.3);
            transition: all 0.3s ease;
        `;
        progressContainer.appendChild(dot);
    });
    
    // 跳过提示
    const skipHint = document.createElement('div');
    skipHint.style.cssText = `
        position: fixed;
        bottom: 40px;
        color: rgba(255, 255, 255, 0.5);
        font-size: 0.9em;
    `;
    skipHint.textContent = '点击任意位置继续 | 长按跳过';
    
    contentWrapper.appendChild(textEl);
    container.appendChild(titleEl);
    container.appendChild(contentWrapper);
    container.appendChild(progressContainer);
    container.appendChild(skipHint);
    document.body.appendChild(container);
    
    // 显示容器
    setTimeout(() => {
        container.style.opacity = '1';
    }, 100);
    
    // 显示当前故事（带打字机效果）
    async function showStory(index) {
        if (index >= storyTexts.length) {
            // 故事结束，开始游戏
            container.style.opacity = '0';
            setTimeout(() => {
                container.remove();
                proceedToGame();
            }, 1000);
            return;
        }
        
        currentIndex = index;
        const story = storyTexts[index];
        titleEl.textContent = story.title;
        
        // 打字机效果显示内容
        textEl.textContent = '';
        const chars = story.content.split('');
        
        for (let i = 0; i < chars.length; i++) {
            if (!container.parentNode) break; // 容器已被移除
            
            textEl.textContent += chars[i];
            await new Promise(resolve => setTimeout(resolve, 30)); // 30ms 每字符
        }
        
        // 更新进度指示器
        const dots = progressContainer.children;
        for (let i = 0; i < dots.length; i++) {
            dots[i].style.background = i === index ? '#ffd700' : 
                                       i < index ? 'rgba(255, 215, 0, 0.5)' : 
                                       'rgba(255, 255, 255, 0.2)';
        }
    }
    
    // 初始显示第一个故事
    showStory(0);
    
    // 点击继续
    let skipHoldTime = 0;
    let isHolding = false;
    let isShowingStory = false;
    
    async function handleContinue() {
        if (isShowingStory) return; // 正在显示故事时忽略点击
        isShowingStory = true;
        await showStory(currentIndex + 1);
        isShowingStory = false;
    }
    
    container.addEventListener('click', handleContinue);
    
    container.addEventListener('mousedown', () => {
        isHolding = true;
        skipHoldTime = 0;
    });
    
    container.addEventListener('mouseup', () => {
        isHolding = false;
        skipHoldTime = 0;
    });
    
    container.addEventListener('touchstart', (e) => {
        isHolding = true;
        skipHoldTime = 0;
    });
    
    container.addEventListener('touchend', () => {
        isHolding = false;
        skipHoldTime = 0;
    });
    
    // 更新循环
    const updateInterval = setInterval(() => {
        if (isHolding) {
            skipHoldTime += 0.05;
            if (skipHoldTime >= 0.5) {
                // 长按跳过
                clearInterval(updateInterval);
                container.style.opacity = '0';
                setTimeout(() => {
                    container.remove();
                    proceedToGame();
                }, 1000);
            }
        }
    }, 50);
    
    // 启动游戏循环
    gameManager.startGameLoop();
}

function proceedToGame() {
    // 显示游戏UI
    document.getElementById('game-ui').classList.remove('hidden');
    
    // 显示侧边栏
    const organSystem = document.getElementById('organ-system');
    const eventLog = document.getElementById('event-log');
    if (organSystem) organSystem.classList.add('show');
    if (eventLog) eventLog.classList.add('show');
    
    // 隐藏动态光斑
    document.querySelectorAll('.floating-orb').forEach(orb => {
        orb.style.display = 'none';
    });
    
    // 获取游戏实例
    const gameManager = window.gameManager;
    
    // 启动游戏
    gameManager.startGame();
    
    console.log('Mythic Snake游戏已启动！');
}

function showMainMenu() {
    // 停止游戏循环
    if (window.gameManager) {
        window.gameManager.stopGameLoop();
        window.gameManager.gameState = 'menu';
        
        // 清除Canvas画布
        if (window.gameManager.canvas) {
            const ctx = window.gameManager.canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#0a0a1a';
                ctx.fillRect(0, 0, window.gameManager.canvas.width, window.gameManager.canvas.height);
            }
        }
        
        // 清理开场故事实例
        if (window.gameManager.introStory) {
            window.gameManager.introStory.hide();
            window.gameManager.introStory = null;
        }
    }
    
    // 隐藏所有菜单
    document.querySelectorAll('.menu-screen').forEach(menu => {
        if (menu) {
            menu.classList.add('hidden');
        }
    });
    // 隐藏游戏UI
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
        gameUI.classList.add('hidden');
    }
    // 隐藏侧边栏
    const organSystem = document.getElementById('organ-system');
    const eventLog = document.getElementById('event-log');
    if (organSystem) organSystem.classList.remove('show');
    if (eventLog) eventLog.classList.remove('show');
    // 隐藏暂停菜单
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) pauseMenu.classList.add('hidden');
    // 隐藏游戏结束界面
    const gameOver = document.getElementById('game-over');
    if (gameOver) gameOver.classList.add('hidden');
    // 显示动态光斑
    document.querySelectorAll('.floating-orb').forEach(orb => {
        orb.style.display = 'block';
    });
    // 显示主菜单
    const mainMenu = document.getElementById('main-menu');
    if (mainMenu) {
        mainMenu.classList.remove('hidden');
    }
}

function showContinueGameMenu() {
    const saveManager = window.gameManager?.systems?.saveManager;
    
    if (!saveManager) {
        alert('存档系统未初始化，请刷新页面后重试');
        return;
    }
    
    document.querySelectorAll('.menu-screen').forEach(menu => {
        menu.classList.add('hidden');
    });
    
    const saveMenu = document.getElementById('save-menu');
    if (saveMenu) {
        saveMenu.classList.remove('hidden');
    }
    switchSaveTab('load');
    updateSaveSlots();
    updateSaveInfo();
}

function showAchievementsMenu() {
    // 隐藏所有菜单
    document.querySelectorAll('.menu-screen').forEach(menu => {
        if (menu) {
            menu.classList.add('hidden');
        }
    });
    // 显示成就菜单
    const achievementsMenu = document.getElementById('achievements-menu');
    if (achievementsMenu) {
        achievementsMenu.classList.remove('hidden');
    }
    // 加载成就数据
    loadAchievements();
}

function showShopMenu() {
    // 隐藏所有菜单
    document.querySelectorAll('.menu-screen').forEach(menu => {
        if (menu) {
            menu.classList.add('hidden');
        }
    });
    // 显示商城菜单
    const shopMenu = document.getElementById('shop-menu');
    if (shopMenu) {
        shopMenu.classList.remove('hidden');
    }
    // 更新商品显示
    updateShopItems('皮肤');
}

function showGuideMenu() {
    document.querySelectorAll('.menu-screen').forEach(menu => {
        if (menu) {
            menu.classList.add('hidden');
        }
    });
    const guideMenu = document.getElementById('guide-menu');
    if (guideMenu) {
        guideMenu.classList.remove('hidden');
    }
    initGuideNavigation();
}

function initGuideNavigation() {
    const navBtns = document.querySelectorAll('.guide-nav-btn');
    const sections = document.querySelectorAll('.guide-section');
    const searchInput = document.getElementById('guide-search-input');
    const backBtn = document.getElementById('guide-back-btn');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            navBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `guide-section-${sectionId}`) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            if (query.length < 2) {
                document.querySelectorAll('.search-highlight').forEach(el => {
                    el.outerHTML = el.textContent;
                });
                return;
            }
            
            sections.forEach(section => {
                const cards = section.querySelectorAll('.guide-card');
                cards.forEach(card => {
                    let text = card.innerHTML;
                    text = text.replace(/<span class="search-highlight">([^<]+)<\/span>/gi, '$1');
                    
                    const regex = new RegExp(`(${query})`, 'gi');
                    if (text.toLowerCase().includes(query)) {
                        text = text.replace(regex, '<span class="search-highlight">$1</span>');
                        card.innerHTML = text;
                        
                        navBtns.forEach(btn => {
                            if (section.id === `guide-section-${btn.getAttribute('data-section')}`) {
                                navBtns.forEach(b => b.classList.remove('active'));
                                btn.classList.add('active');
                            }
                        });
                        sections.forEach(s => s.classList.remove('active'));
                        section.classList.add('active');
                    }
                });
            });
        });
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            showMainMenu();
        });
    }
}

function showPauseMenu() {
    // 显示暂停菜单
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.classList.remove('hidden');
    }
    // 暂停游戏
    if (window.gameManager) {
        window.gameManager.pauseGame();
    }
}

function hidePauseMenu() {
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.classList.add('hidden');
    }
    if (window.gameManager) {
        window.gameManager.resumeGame();
    }
}

function showSaveMenu(mode = 'save') {
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.classList.add('hidden');
    }
    
    const saveMenu = document.getElementById('save-menu');
    if (saveMenu) {
        saveMenu.classList.remove('hidden');
    }
    switchSaveTab(mode);
    updateSaveSlots();
    updateSaveInfo();
}

function hideSaveMenu() {
    const saveMenu = document.getElementById('save-menu');
    if (saveMenu) {
        saveMenu.classList.add('hidden');
    }
    
    if (window.gameManager && window.gameManager.gameState === 'playing') {
        showPauseMenu();
    } else {
        showMainMenu();
    }
}

function switchSaveTab(tabName) {
    document.querySelectorAll('.save-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });
    updateSaveSlots();
}

function updateSaveSlots() {
    const container = document.getElementById('save-slots-container');
    if (!container) {
        console.error('找不到存档槽位容器');
        return;
    }
    
    const saveManager = window.gameManager?.systems?.saveManager;
    console.log('updateSaveSlots - saveManager:', saveManager);
    
    if (!saveManager) {
        container.innerHTML = '<div class="save-empty-state"><div class="icon">⚠️</div><p>存档系统未初始化</p></div>';
        return;
    }
    
    const currentTab = document.querySelector('.save-tab.active')?.getAttribute('data-tab') || 'save';
    console.log('当前标签:', currentTab);
    console.log('游戏状态:', window.gameManager?.gameState);
    
    const slots = saveManager.getSaveSlots();
    console.log('获取到的槽位:', slots);
    
    container.innerHTML = '';
    
    slots.forEach((slot, index) => {
        console.log(`渲染槽位 ${index}:`, slot);
        const slotElement = document.createElement('div');
        slotElement.className = `save-slot ${slot.exists ? '' : 'empty'} ${index === saveManager.currentSlot ? 'current' : ''}`;
        
        const gameState = window.gameManager?.gameState;
        const isFromMainMenu = !window.gameManager || gameState === 'menu';
        const canSave = gameState === 'playing' || gameState === 'paused';
        
        console.log(`槽位 ${index} - isFromMainMenu: ${isFromMainMenu}, canSave: ${canSave}, currentTab: ${currentTab}`);
        
        if (slot.exists) {
            const info = saveManager.getSlotInfo(index);
            console.log(`槽位 ${index} 信息:`, info);
            slotElement.innerHTML = `
                <div class="save-slot-icon">🐍</div>
                <div class="save-slot-info">
                    <div class="save-slot-title">存档 ${index + 1} ${index === saveManager.currentSlot ? '(当前)' : ''}</div>
                    <div class="save-slot-details">
                        <div class="save-slot-detail">分数: <span>${info.score}</span></div>
                        <div class="save-slot-detail">长度: <span>${info.bodyLength}</span></div>
                        <div class="save-slot-detail">时间: <span>${saveManager.formatPlayTime(info.playTime)}</span></div>
                        <div class="save-slot-detail">保存于: <span>${saveManager.formatTimestamp(info.timestamp)}</span></div>
                    </div>
                </div>
                <div class="save-slot-actions">
                    ${currentTab === 'save' && canSave ? `
                        <button class="save-slot-btn save" onclick="handleSave(${index})">保存</button>
                    ` : `
                        <button class="save-slot-btn load" onclick="handleLoad(${index})">加载</button>
                    `}
                    <button class="save-slot-btn delete" onclick="handleDelete(${index})">删除</button>
                </div>
            `;
        } else {
            slotElement.innerHTML = `
                <div class="save-slot-icon">📁</div>
                <div class="save-slot-info">
                    <div class="save-slot-title">存档 ${index + 1} - 空</div>
                    <div class="save-slot-details">
                        <div class="save-slot-detail">${currentTab === 'save' && canSave ? '点击保存创建新存档' : '暂无存档'}</div>
                    </div>
                </div>
                <div class="save-slot-actions">
                    ${currentTab === 'save' && canSave ? `
                        <button class="save-slot-btn save" onclick="handleSave(${index})">保存</button>
                    ` : `
                        <button class="save-slot-btn load" disabled>加载</button>
                    `}
                </div>
            `;
        }
        
        container.appendChild(slotElement);
    });
}

function updateSaveInfo() {
    const saveManager = window.gameManager?.systems?.saveManager;
    if (!saveManager) return;
    
    const storageInfo = document.getElementById('save-storage-info');
    const autoInfo = document.getElementById('save-auto-info');
    
    if (storageInfo) {
        const usage = saveManager.getStorageUsage();
        storageInfo.textContent = `存储空间: ${usage.usedKB} KB`;
    }
    
    if (autoInfo) {
        autoInfo.textContent = `自动保存: 每${saveManager.autoSaveInterval}秒`;
    }
}

function handleSave(slotIndex) {
    console.log('handleSave 被调用, 槽位:', slotIndex);
    const saveManager = window.gameManager?.systems?.saveManager;
    console.log('saveManager:', saveManager);
    
    if (!saveManager) {
        showSaveError('存档系统未初始化');
        return;
    }
    
    const existingSave = saveManager.getSlotInfo(slotIndex);
    console.log('现有存档信息:', existingSave);
    
    if (existingSave.exists) {
        showConfirmDialog(
            '覆盖存档',
            `确定要覆盖存档 ${slotIndex + 1} 吗？此操作无法撤销。`,
            () => {
                performSave(slotIndex);
            }
        );
    } else {
        performSave(slotIndex);
    }
}

function performSave(slotIndex) {
    const saveManager = window.gameManager?.systems?.saveManager;
    const notificationManager = window.gameManager?.systems?.notificationManager;
    
    if (!saveManager) {
        showSaveError('存档系统未初始化');
        return;
    }
    
    if (!window.gameManager || !window.gameManager.player) {
        showSaveError('无法保存：游戏未开始');
        return;
    }
    
    const saveButtons = document.querySelectorAll('.save-slot-btn.save');
    saveButtons.forEach(btn => {
        btn.disabled = true;
        btn.textContent = '保存中...';
    });
    
    console.log('开始保存游戏到槽位:', slotIndex);
    console.log('当前分数:', window.gameManager.score);
    console.log('玩家存在:', !!window.gameManager.player);
    
    setTimeout(() => {
        try {
            const result = saveManager.save(slotIndex);
            console.log('保存结果:', result);
            
            if (result.success) {
                showSaveSuccess(slotIndex, result.timestamp);
                updateSaveSlots();
                updateSaveInfo();
                
                console.log('存档已更新，重新读取槽位信息:', saveManager.getSlotInfo(slotIndex));
            } else {
                showSaveError(result.error || '保存失败');
            }
        } catch (e) {
            console.error('保存异常:', e);
            showSaveError(`保存异常: ${e.message}`);
        } finally {
            saveButtons.forEach(btn => {
                btn.disabled = false;
                btn.textContent = '保存';
            });
        }
    }, 100);
}

function showSaveSuccess(slotIndex, timestamp) {
    const notificationManager = window.gameManager?.systems?.notificationManager;
    
    if (notificationManager) {
        notificationManager.showNotification(
            `💾 游戏已保存到存档 ${slotIndex + 1}`,
            '#4ecdc4',
            'success',
            2
        );
    }
    
    const slotElement = document.querySelector(`.save-slot:nth-child(${slotIndex + 1})`);
    if (slotElement) {
        slotElement.classList.add('save-success-flash');
        setTimeout(() => {
            slotElement.classList.remove('save-success-flash');
        }, 1000);
    }
}

function showSaveError(message) {
    const notificationManager = window.gameManager?.systems?.notificationManager;
    
    if (notificationManager) {
        notificationManager.showNotification(
            `❌ ${message}`,
            '#e74c3c',
            'error',
            3
        );
    }
    
    console.error('存档错误:', message);
}

function handleLoad(slotIndex) {
    const saveManager = window.gameManager?.systems?.saveManager;
    if (!saveManager) return;
    
    const info = saveManager.getSlotInfo(slotIndex);
    if (!info.exists) return;
    
    showConfirmDialog(
        '加载存档',
        `确定要加载存档 ${slotIndex + 1} 吗？当前未保存的进度将丢失。`,
        () => {
            performLoad(slotIndex);
        }
    );
}

function performLoad(slotIndex) {
    const saveManager = window.gameManager?.systems?.saveManager;
    const notificationManager = window.gameManager?.systems?.notificationManager;
    
    if (!saveManager) return;
    
    console.log('performLoad 开始, 槽位:', slotIndex);
    const result = saveManager.load(slotIndex);
    console.log('加载结果:', result);
    
    if (result.success) {
        if (notificationManager) {
            notificationManager.showNotification(
                `📂 已加载存档 ${slotIndex + 1}`,
                '#3498db',
                'success',
                2
            );
        }
        
        // 隐藏所有菜单
        const saveMenu = document.getElementById('save-menu');
        if (saveMenu) {
            saveMenu.classList.add('hidden');
        }
        
        document.querySelectorAll('.menu-screen').forEach(menu => {
            menu.classList.add('hidden');
        });
        
        // 显示游戏UI
        const gameUI = document.getElementById('game-ui');
        if (gameUI) gameUI.classList.remove('hidden');
        
        const organSystem = document.getElementById('organ-system');
        const eventLog = document.getElementById('event-log');
        if (organSystem) organSystem.classList.add('show');
        if (eventLog) eventLog.classList.add('show');
        
        // 隐藏背景装饰
        document.querySelectorAll('.floating-orb').forEach(orb => {
            orb.style.display = 'none';
        });
        
        // 确保游戏状态正确并启动游戏循环
        if (window.gameManager) {
            window.gameManager.gameState = 'playing';
            console.log('启动游戏循环...');
            window.gameManager.startGameLoop();
            console.log('游戏循环已启动');
        }
    } else {
        if (notificationManager) {
            notificationManager.showNotification(
                `❌ ${result.error}`,
                '#e74c3c',
                'error',
                3
            );
        }
    }
}

function handleDelete(slotIndex) {
    const saveManager = window.gameManager?.systems?.saveManager;
    if (!saveManager) return;
    
    const info = saveManager.getSlotInfo(slotIndex);
    if (!info.exists) return;
    
    showConfirmDialog(
        '删除存档',
        `确定要删除存档 ${slotIndex + 1} 吗？此操作无法撤销。`,
        () => {
            performDelete(slotIndex);
        }
    );
}

function performDelete(slotIndex) {
    const saveManager = window.gameManager?.systems?.saveManager;
    const notificationManager = window.gameManager?.systems?.notificationManager;
    
    if (!saveManager) return;
    
    const result = saveManager.deleteSlot(slotIndex);
    
    if (result.success) {
        if (notificationManager) {
            notificationManager.showNotification(
                `🗑️ 存档 ${slotIndex + 1} 已删除`,
                '#ffcc5c',
                'warning',
                2
            );
        }
        updateSaveSlots();
        updateSaveInfo();
    } else {
        if (notificationManager) {
            notificationManager.showNotification(
                `❌ ${result.error}`,
                '#e74c3c',
                'error',
                3
            );
        }
    }
}

function showConfirmDialog(title, message, onConfirm) {
    const existing = document.querySelector('.save-confirm-dialog');
    if (existing) existing.remove();
    
    const dialog = document.createElement('div');
    dialog.className = 'save-confirm-dialog';
    dialog.innerHTML = `
        <div class="save-confirm-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="save-confirm-buttons">
                <button class="cancel" onclick="this.closest('.save-confirm-dialog').remove()">取消</button>
                <button class="confirm" id="confirm-btn">确定</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    const confirmBtn = dialog.querySelector('#confirm-btn');
    confirmBtn.addEventListener('click', () => {
        dialog.remove();
        if (typeof onConfirm === 'function') {
            onConfirm();
        }
    });
}

function loadAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    ACHIEVEMENTS.forEach(achievement => {
        const savedAchievement = window.gameDataManager.getAchievement(achievement.id);
        const progress = savedAchievement.progress;
        const completed = savedAchievement.completed;
        
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement-item ${completed ? 'completed' : ''}`;
        
        // 计算实际进度值（对于需要具体数值的成就）
        let displayProgress = progress;
        if (achievement.id === 'snake_master') {
            displayProgress = Math.min(progress, achievement.target);
        } else if (achievement.id === 'wormhole_traveler') {
            displayProgress = Math.min(progress, achievement.target);
        } else if (achievement.id === 'high_score') {
            displayProgress = Math.min(progress, achievement.target);
        }
        
        achievementElement.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-progress">
                    <div class="achievement-progress-bar" style="width: ${(progress / achievement.target) * 100}%"></div>
                </div>
                <div class="achievement-reward">${completed ? '🎉 成就已解锁！' : '💪 继续努力'}</div>
            </div>
            <div class="achievement-status">${completed ? '已完成' : `${displayProgress}/${achievement.target}`}</div>
        `;
        
        container.appendChild(achievementElement);
    });
}

function updateShopItems(category) {
    const container = document.getElementById('shop-items');
    if (!container) return;
    
    container.innerHTML = '';
    
    let items = [];
    switch (category) {
        case '皮肤':
            items = SHOP_ITEMS.skins;
            break;
        case '道具':
            items = SHOP_ITEMS.items;
            break;
        case '天气':
            items = SHOP_ITEMS.weather;
            break;
    }
    
    items.forEach(item => {
        const gameDataManager = window.gameDataManager;
        const coins = gameDataManager.getCoins();
        const purchaseCount = gameDataManager.getPurchaseCount(item.id);
        const maxPurchases = item.maxPurchases;
        const reachedLimit = purchaseCount >= maxPurchases;
        const canBuy = coins >= item.price && !reachedLimit;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item';
        
        let buttonText = '';
        if (reachedLimit) {
            buttonText = '购买次数已达上限';
        } else if (canBuy) {
            buttonText = '购买';
        } else {
            buttonText = '金币不足';
        }
        
        itemElement.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
            <div class="item-description">${item.description}</div>
            <div class="item-price">${item.price} 金币</div>
            ${maxPurchases > 1 ? `<div class="item-limits">购买次数: ${purchaseCount}/${maxPurchases}</div>` : ''}
            <button class="buy-btn" ${!canBuy ? 'disabled' : ''} data-id="${item.id}" data-category="${category}">
                ${buttonText}
            </button>
        `;
        
        container.appendChild(itemElement);
    });
    
    // 添加购买事件监听器
    document.querySelectorAll('.buy-btn[data-id]').forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function() {
                const itemId = this.getAttribute('data-id');
                const category = this.getAttribute('data-category');
                buyItem(itemId, category);
            });
        }
    });
}

function buyItem(itemId, category) {
    const gameDataManager = window.gameDataManager;
    if (!gameDataManager) return;
    
    const item = findItemById(itemId, category);
    if (!item) return;
    
    const purchaseCount = gameDataManager.getPurchaseCount(itemId);
    const maxPurchases = item.maxPurchases;
    
    if (purchaseCount >= maxPurchases) {
        alert('购买次数已达上限！');
        return;
    }
    
    if (gameDataManager.getCoins() >= item.price) {
        // 扣除金币
        gameDataManager.removeCoins(item.price);
        
        // 增加购买次数
        gameDataManager.incrementPurchaseCount(itemId);
        
        // 实时应用道具效果
        applyItemEffect(itemId, category);
        
        // 更新金币显示
        updateCoinsDisplay();
        // 更新商品显示
        updateShopItems(category);
        // 显示购买成功提示
        alert(`购买成功！获得${item.name}\n效果将在下一局游戏中应用`);
    }
}

function applyItemEffect(itemId, category) {
    // 应用物品效果
    if (category === '道具') {
        // 根据道具ID应用不同效果
        switch (itemId) {
            case 'item_backtrack':
                // 增加回溯次数
                if (window.gameManager && window.gameManager.systems && window.gameManager.systems.timeManager) {
                    window.gameManager.systems.timeManager.maxBacktracks += 1;
                    window.gameManager.systems.timeManager.backtrackCount = window.gameManager.systems.timeManager.maxBacktracks;
                    console.log('回溯次数增加到:', window.gameManager.systems.timeManager.maxBacktracks);
                }
                break;
            case 'item_energy':
                // 增加能量上限
                console.log('能量上限增加');
                // 这里可以添加能量上限增加的逻辑
                break;
            case 'item_speed':
                // 增加移动速度
                console.log('移动速度增加');
                // 这里可以添加移动速度增加的逻辑
                break;
        }
    } else if (category === '天气') {
        // 添加天气道具到玩家物品栏
        if (window.gameDataManager) {
            window.gameDataManager.addItem(itemId);
            console.log('天气道具已添加:', itemId);
            
            // 通知玩家道具已装备
            if (window.gameManager && window.gameManager.systems && window.gameManager.systems.notificationManager) {
                const item = findItemById(itemId, category);
                if (item) {
                    window.gameManager.systems.notificationManager.showNotification(
                        `🛡️ 已装备: ${item.name}`,
                        '#27ae60',
                        'info'
                    );
                }
            }
        }
    }
}

function findItemById(itemId, category) {
    if (!SHOP_ITEMS) return null;
    
    switch (category) {
        case '皮肤':
            return SHOP_ITEMS.skins && SHOP_ITEMS.skins.find(item => item.id === itemId);
        case '道具':
            return SHOP_ITEMS.items && SHOP_ITEMS.items.find(item => item.id === itemId);
        case '天气':
            return SHOP_ITEMS.weather && SHOP_ITEMS.weather.find(item => item.id === itemId);
        default:
            return null;
    }
}

function updateCoinsDisplay() {
    if (window.gameDataManager) {
        const coins = window.gameDataManager.getCoins();
        const coinsElement = document.getElementById('coins-count');
        if (coinsElement) {
            coinsElement.textContent = coins;
        }
    }
}

// 导出游戏对象
try {
    module.exports = { startGame, proceedToGame, createFallbackIntroStory, Food, Enemy, GameDataManager };
} catch (e) {
    // 浏览器环境
    window.startGame = startGame;
    window.proceedToGame = proceedToGame;
    window.createFallbackIntroStory = createFallbackIntroStory;
    window.Food = Food;
    window.Enemy = Enemy;
    window.GameDataManager = GameDataManager;
}