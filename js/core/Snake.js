class Snake {
    constructor(gameManager, isPlayer = false) {
        this.gameManager = gameManager;
        this.isPlayer = isPlayer;
        this.id = Math.random().toString(36).substr(2, 9);
        this.type = 'snake';
        
        // 基础属性
        this.x = isPlayer ? 500 : Math.random() * 800 + 100;
        this.y = isPlayer ? 400 : Math.random() * 600 + 100;
        this.width = 20;
        this.height = 20;
        this.speed = isPlayer ? 10 : 5.75; // 玩家基础速度10，AI蛇速度5.75
        this.acceleration = 0.1; // 加速度
        this.maxSpeed = isPlayer ? 15 : 5.75; // 玩家最大速度15，AI蛇速度5.75
        this.minSpeed = 2; // 最小速度
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.aimAngle = 0; // 子弹发射角度（跟随鼠标）
        
        // 身体分段
        this.body = [];
        this.bodyLength = 3;
        this.initBody();
        
        // 仅在开发模式下输出日志
        const isDevMode = false;
        if (isDevMode) {
            console.log('Snake body initialized:', this.body);
        }
        
        // 能量系统
        this.energySystem = new EnergySystem(this);
        
        // 器官系统
        this.organs = [];
        
        // AI相关
        if (!isPlayer) {
            this.aiController = new AIController(this);
        }
        
        // 碰撞检测
        this.collider = true;
        
        // 视觉效果
        this.skinColor = this.isPlayer ? '#FF0000' : this.getRandomColor();
        
        // 仅在开发模式下输出日志
        if (isDevMode) {
            console.log('Snake created:', this.isPlayer ? 'Player' : 'AI', 'at', this.x, this.y, 'color:', this.skinColor);
        }
        
        this.skinPattern = 0;
        this.trailEffects = [];
        
        // 状态
        this.alive = true;
        this.isMoving = true;
        this.moveTimer = 0;
        this.moveInterval = 0.1;
        this.invincible = false; // 无敌状态
        this.invincibleTime = 0; // 无敌时间
        this.maxInvincibleTime = 2; // 最大无敌时间（秒）
        this.reverseControls = false; // 控制反转状态
        this.zoneEffect = null; // 当前区域效果
        this.zoneEffectDuration = 0; // 区域效果持续时间
        this.zoneEffectType = null; // 区域效果类型
        
        // 生命值系统（仅玩家）
        if (isPlayer) {
            this.maxHealth = 100;
            this.health = this.maxHealth;
            this.healthRegenRate = 5; // 每秒回复5点生命值
        }
        
        // 加速系统
        this.baseSpeed = isPlayer ? 5 : 5.75;
        this.currentSpeed = this.baseSpeed;
        this.targetSpeed = this.baseSpeed;
        this.maxBoostSpeed = isPlayer ? 15 : 5.75;
        this.accelerationRate = 20;
        this.decelerationRate = 15;
        this.isBoosting = false;
        this.boostEnergyCost = 3;
        
        // 闪现技能
        if (isPlayer) {
            this.flashSkill = new FlashSkill(this);
        }
    }
    
    initBody() {
        this.body = [];
        for (let i = 0; i < this.bodyLength; i++) {
            this.body.push({
                x: this.x - i * this.width,
                y: this.y,
                width: this.width,
                height: this.height
            });
        }
    }
    
    update(deltaTime) {
        if (!this.alive) return;
        
        // 检查是否被定身
        if (this.frozen) {
            this.freezeTimer += deltaTime;
            if (this.freezeTimer >= this.freezeDuration) {
                this.frozen = false;
                this.freezeTimer = 0;
                delete this.freezeDuration;
                
                // 显示解冻通知
                if (this.gameManager.systems.notificationManager) {
                    this.gameManager.systems.notificationManager.showNotification(
                        `🌡️ 你解冻了！`,
                        '#27ae60',
                        'info'
                    );
                }
            }
            return; // 定身期间不执行其他更新
        }
        
        // 能量系统由EnergySystem统一管理
        // 更新能量系统
        if (this.energySystem) {
            this.energySystem.update(deltaTime);
        }
        
        // 更新速度（平滑加速/减速）
        this.updateSpeed(deltaTime);
        
        // 能量耗尽状态处理
        if (this.energySystem && this.energySystem.energy <= 0) {
            this.energySystem.energy = 0;
            if (this.isBoosting) {
                this.stopBoost();
            }
            this.currentSpeed = this.baseSpeed;
            this.targetSpeed = this.baseSpeed;
        }
        
        // 更新无敌时间
        if (this.invincible) {
            this.invincibleTime += deltaTime;
            if (this.invincibleTime >= this.maxInvincibleTime) {
                this.invincible = false;
                this.invincibleTime = 0;
            }
        }
        
        // 生命值回复（仅玩家）
        if (this.isPlayer && this.health !== undefined && this.healthRegenRate) {
            if (this.health < this.maxHealth) {
                this.health += this.healthRegenRate * deltaTime;
                this.health = Math.min(this.health, this.maxHealth);
            }
        }
        
        // 玩家控制
        if (this.isPlayer) {
            this.handlePlayerInput();
        } else {
            // AI控制
            this.aiController.update(deltaTime);
        }
        
        // 移动
        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.move();
        }
        
        // 更新身体分段
        this.updateBody();
        
        // 更新器官
        this.updateOrgans(deltaTime);
        
        // 更新视觉效果
        this.updateTrailEffects(deltaTime);
        
        // 更新闪现技能
        if (this.flashSkill) {
            this.flashSkill.update(deltaTime);
        }
    }
    
    handlePlayerInput() {
        const input = this.gameManager.input;
        
        // 更新瞄准角度（跟随鼠标）
        if (this.gameManager.systems.renderer && this.gameManager.systems.renderer.canvas && input.mouse) {
            const canvas = this.gameManager.systems.renderer.canvas;
            const rect = canvas.getBoundingClientRect();
            const mouseX = input.mouse.x - rect.left;
            const mouseY = input.mouse.y - rect.top;
            
            const playerCenterX = this.x + this.width / 2;
            const playerCenterY = this.y + this.height / 2;
            
            this.aimAngle = Math.atan2(mouseY - playerCenterY, mouseX - playerCenterX);
        }
        
        // 方向控制（键盘）
        if (input.keys['ArrowUp'] && this.direction.y === 0) {
            if (this.reverseControls) {
                this.nextDirection = { x: 0, y: 1 };
            } else {
                this.nextDirection = { x: 0, y: -1 };
            }
        } else if (input.keys['ArrowDown'] && this.direction.y === 0) {
            if (this.reverseControls) {
                this.nextDirection = { x: 0, y: -1 };
            } else {
                this.nextDirection = { x: 0, y: 1 };
            }
        } else if (input.keys['ArrowLeft'] && this.direction.x === 0) {
            if (this.reverseControls) {
                this.nextDirection = { x: 1, y: 0 };
            } else {
                this.nextDirection = { x: -1, y: 0 };
            }
        } else if (input.keys['ArrowRight'] && this.direction.x === 0) {
            if (this.reverseControls) {
                this.nextDirection = { x: -1, y: 0 };
            } else {
                this.nextDirection = { x: 1, y: 0 };
            }
        }
        
        // Shift键处理：长按加速（双击闪现由事件驱动处理）
        const shiftPressed = input.keys['ShiftLeft'] || input.keys['ShiftRight'];
        
        if (shiftPressed) {
            if (!this.isBoosting && !this.flashSkill?.isFlashing) {
                this.startBoost();
            }
        } else {
            if (this.isBoosting) {
                this.stopBoost();
            }
        }
        
        // 时间回溯
        if (input.keys['KeyZ']) {
            this.gameManager.systems.timeManager.backtrack();
        }
        
        this.isMoving = true;
    }
    
    startBoost() {
        // 边界条件：能量不足时无法加速
        if (this.energySystem && this.energySystem.energy < 10) {
            if (this.gameManager && this.gameManager.systems && this.gameManager.systems.notificationManager) {
                this.gameManager.systems.notificationManager.showNotification(
                    '⚠️ 能量不足，无法加速！',
                    '#ffcc5c',
                    'warning',
                    1
                );
            }
            return;
        }
        
        // 能量耗尽时无法加速
        if (this.energySystem && this.energySystem.energy <= 0) {
            return;
        }
        
        this.isBoosting = true;
        this.targetSpeed = this.maxBoostSpeed;
        
        if (this.gameManager && this.gameManager.systems && this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playSound('boost');
        }
    }
    
    stopBoost() {
        this.isBoosting = false;
        this.targetSpeed = this.baseSpeed;
    }
    
    updateSpeed(deltaTime) {
        if (this.currentSpeed < this.targetSpeed) {
            this.currentSpeed += this.accelerationRate * deltaTime;
            if (this.currentSpeed > this.targetSpeed) {
                this.currentSpeed = this.targetSpeed;
            }
        } else if (this.currentSpeed > this.targetSpeed) {
            this.currentSpeed -= this.decelerationRate * deltaTime;
            if (this.currentSpeed < this.targetSpeed) {
                this.currentSpeed = this.targetSpeed;
            }
        }
        
        this.speed = this.currentSpeed;
    }
    
    move() {
        // 更新方向
        this.direction = this.nextDirection;
        
        // 移动头部
        const newX = this.x + this.direction.x * this.speed;
        const newY = this.y + this.direction.y * this.speed;
        
        // 边界检查
        if (newX < 0) this.x = 1000;
        else if (newX > 1000) this.x = 0;
        else this.x = newX;
        
        if (newY < 0) this.y = 800;
        else if (newY > 800) this.y = 0;
        else this.y = newY;
        
        // 创建轨迹效果
        this.createTrailEffect();
    }
    
    updateBody() {
        // 更新身体分段位置
        for (let i = this.body.length - 1; i > 0; i--) {
            // 使用平滑过渡，避免身体节段突然移动
            const dx = this.body[i - 1].x - this.body[i].x;
            const dy = this.body[i - 1].y - this.body[i].y;
            this.body[i].x += dx * 0.8;
            this.body[i].y += dy * 0.8;
        }
        
        // 更新头部位置
        if (this.body.length > 0) {
            this.body[0].x = this.x;
            this.body[0].y = this.y;
        }
        
        // 确保身体长度正确
        while (this.body.length < this.bodyLength) {
            const lastSegment = this.body[this.body.length - 1] || { x: this.x, y: this.y };
            // 计算新节段的位置，确保与前一节段保持正确距离
            const newX = lastSegment.x - this.direction.x * this.width;
            const newY = lastSegment.y - this.direction.y * this.height;
            
            this.body.push({
                x: newX,
                y: newY,
                width: this.width,
                height: this.height
            });
        }
        
        while (this.body.length > this.bodyLength) {
            this.body.pop();
        }
    }
    
    updateOrgans(deltaTime) {
        // 更新器官效果
        this.organs.forEach(organ => {
            if (organ.update) {
                organ.update(deltaTime);
            }
        });
    }
    
    updateTrailEffects(deltaTime) {
        // 更新轨迹效果
        this.trailEffects.forEach((effect, index) => {
            effect.lifetime -= deltaTime;
            effect.opacity -= deltaTime * 2;
            
            if (effect.lifetime <= 0) {
                this.trailEffects.splice(index, 1);
            }
        });
    }
    
    createTrailEffect() {
        // 创建轨迹粒子效果
        this.trailEffects.push({
            x: this.x,
            y: this.y,
            size: Math.random() * 5 + 3,
            color: this.skinColor,
            lifetime: 0.5,
            opacity: 1
        });
    }
    
    grow(amount = 2) {
        // 增加增长幅度，使视觉效果更明显
        const oldLength = this.bodyLength;
        this.bodyLength += amount;
        
        // 每增长5节变化一次皮肤
        if (this.bodyLength % 5 === 0) {
            this.skinPattern = (this.skinPattern + 1) % 4;
        }
        
        // 添加增长的视觉反馈
        this.createGrowthEffect(oldLength);
    }
    
    createGrowthEffect(oldLength) {
        // 创建增长的视觉反馈效果
        const segmentsAdded = this.bodyLength - oldLength;
        
        // 添加粒子特效
        for (let i = 0; i < segmentsAdded * 3; i++) {
            const lastSegment = this.body[this.body.length - 1] || { x: this.x, y: this.y };
            this.gameManager.systems.renderer.addParticle({
                x: lastSegment.x,
                y: lastSegment.y,
                size: Math.random() * 6 + 3,
                color: this.skinColor,
                velocity: {
                    x: (Math.random() - 0.5) * 8,
                    y: (Math.random() - 0.5) * 8
                },
                lifetime: 0.8,
                opacity: 1
            });
        }
        
        // 添加尺寸渐变动画效果
        for (let i = 0; i < segmentsAdded; i++) {
            setTimeout(() => {
                if (this.body[this.body.length - 1 - i]) {
                    const segment = this.body[this.body.length - 1 - i];
                    segment.width = this.width * 1.2;
                    segment.height = this.height * 1.2;
                    
                    // 恢复原始尺寸
                    setTimeout(() => {
                        if (segment) {
                            segment.width = this.width;
                            segment.height = this.height;
                        }
                    }, 200);
                }
            }, i * 100);
        }
    }
    
    eat(food) {
        // 吃食物
        this.grow(food.nutrition);
        
        // 获取食物的实际能量值，考虑天气灾害的影响
        const actualEnergy = food.getActualEnergyValue ? food.getActualEnergyValue() : food.energyValue;
        this.energySystem.recover(actualEnergy);
        
        // 将分数改为技能点（进化点）
        const evolutionPoints = food.scoreValue;
        if (this.gameManager.systems.uiSystems && this.gameManager.systems.uiSystems.organSystem) {
            this.gameManager.systems.uiSystems.organSystem.addEvolutionPoints(evolutionPoints);
        }
        
        // 更新游戏分数
        const scoreValue = food.scoreValue || 10;
        const oldScore = this.gameManager.score;
        this.gameManager.score += scoreValue;
        
        // 触发分数变化事件
        document.dispatchEvent(new CustomEvent('scoreChanged', {
            detail: {
                amount: this.gameManager.score,
                change: scoreValue
            }
        }));
        
        // 添加金币奖励
        const coinValue = food.coinValue || 5;
        if (window.gameDataManager) {
            const oldCoins = window.gameDataManager.getCoins();
            window.gameDataManager.addCoins(coinValue);
            
            // 触发金币变化事件
            document.dispatchEvent(new CustomEvent('coinsChanged', {
                detail: {
                    amount: window.gameDataManager.getCoins(),
                    change: coinValue
                }
            }));
            
            // 更新成就系统
            // 蛇王成就：身体长度达到20节
            window.gameDataManager.updateAchievement('snake_master', this.bodyLength);
            // 高分达人成就：获得1000分以上
            window.gameDataManager.updateAchievement('high_score', this.gameManager.score);
        }
        
        // 播放吃食物音效
        if (this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playEatFoodSound();
        }
        
        // 显示吃食物通知
        let notificationMessage = `获得 ${evolutionPoints} 技能点、${actualEnergy} 能量 和 ${coinValue} 金币`;
        
        // 如果实际能量值与基础能量值不同，添加天气影响的说明
        if (food.getActualEnergyValue && actualEnergy !== food.energyValue) {
            if (actualEnergy > food.energyValue) {
                notificationMessage += ' (天气使食物更加营养)';
            } else {
                notificationMessage += ' (天气影响了食物质量)';
            }
        }
        
        this.gameManager.showNotification(notificationMessage, '#ffcc5c', 'eatFood');
        
        // 记录到事件日志
        if (this.gameManager.systems.uiSystems && this.gameManager.systems.uiSystems.eventLogSystem) {
            this.gameManager.systems.uiSystems.eventLogSystem.addEvent(
                `🍎 吃了食物！获得 ${evolutionPoints} 技能点、${actualEnergy} 能量 和 ${coinValue} 金币`,
                'player'
            );
        }
    }
    
    addOrgan(organ) {
        // 添加器官
        this.organs.push(organ);
    }
    
    removeOrgan(organId) {
        // 移除器官
        const index = this.organs.findIndex(organ => organ.id === organId);
        if (index > -1) {
            this.organs.splice(index, 1);
        }
    }
    
    onCollision(other) {
        if (other.type === 'food') {
            this.eat(other);
            this.gameManager.removeGameObject(other);
        } else if (other.type === 'snake' && other !== this) {
            // 蛇之间的碰撞
            if (this.isPlayer) {
                if (!this.invincible) {
                    // 非无敌状态时，进入无敌状态并消耗回溯次数
                    if (this.gameManager.systems.timeManager.backtrackCount > 0) {
                        this.gameManager.systems.timeManager.backtrackCount--;
                        this.invincible = true;
                        this.invincibleTime = 0;
                        console.log('玩家进入无敌状态，持续2秒，剩余回溯保护次数：', this.gameManager.systems.timeManager.backtrackCount);
                        
                        // 更新回溯保护计数的视觉指示器
                        this.updateBacktrackProtectionIndicator();
                        
                        // 显示无敌状态通知
                        if (this.gameManager.systems.notificationManager) {
                            this.gameManager.systems.notificationManager.showNotification(
                                '⚠️  进入无敌状态！',
                                '#ffcc5c',
                                'warning',
                                2
                            );
                        }
                    } else {
                        // 回溯保护次数为0，直接死亡
                        this.die();
                    }
                }
            }
        } else if (other.type === 'enemy' || other.type === 'boss') {
            // 与敌人或BOSS碰撞
            if (!this.invincible) {
                const damage = other.damage || 20;
                this.takeDamage(damage);
            }
        } else if (other.type === 'enemy_bullet') {
            // 被敌人子弹击中
            if (!this.invincible) {
                const damage = other.damage || 10;
                this.takeDamage(damage);
                this.gameManager.removeGameObject(other);
            }
        } else if (other.type === 'organ') {
            // 拾取器官
            this.collectOrgan(other);
            this.gameManager.removeGameObject(other);
        } else if (other.type === 'wormhole') {
            // 进入虫洞
            other.teleport(this);
        }
    }
    
    takeDamage(amount) {
        if (this.invincible) return;
        
        const backtrackCount = this.gameManager.systems.timeManager?.backtrackCount || 0;
        
        // 如果有回溯保护，消耗回溯次数
        if (backtrackCount > 0) {
            this.gameManager.systems.timeManager.backtrackCount--;
            this.invincible = true;
            this.invincibleTime = 0;
            
            this.updateBacktrackProtectionIndicator();
            
            if (this.gameManager.systems.notificationManager) {
                this.gameManager.systems.notificationManager.showNotification(
                    `🛡️ 回溯保护！剩余 ${this.gameManager.systems.timeManager.backtrackCount} 次`,
                    '#3498db',
                    'warning',
                    1.5
                );
            }
            return;
        }
        
        // 没有回溯保护时，扣除生命值
        if (this.isPlayer && this.health !== undefined) {
            this.health -= amount;
            this.health = Math.max(0, this.health);
            
            if (this.gameManager.systems.notificationManager) {
                this.gameManager.systems.notificationManager.showNotification(
                    `💔 受到 ${amount} 点伤害！生命值: ${Math.ceil(this.health)}/${this.maxHealth}`,
                    '#ff6b6b',
                    'error',
                    1.5
                );
            }
            
            // 记录到事件日志
            if (this.gameManager.systems.uiSystems && this.gameManager.systems.uiSystems.eventLogSystem) {
                this.gameManager.systems.uiSystems.eventLogSystem.addEvent(
                    `💔 受到 ${amount} 点伤害！`,
                    'player'
                );
            }
            
            // 生命值为0时死亡
            if (this.health <= 0) {
                this.die();
            } else if (this.health < 30) {
                // 生命值过低警告
                if (this.gameManager.systems.notificationManager) {
                    this.gameManager.systems.notificationManager.showNotification(
                        '⚠️ 生命值过低！',
                        '#ffcc5c',
                        'warning',
                        2
                    );
                }
            }
        } else {
            // 非玩家或没有生命值系统时，使用能量系统
            if (this.energySystem) {
                this.energySystem.consume(amount);
            }
            
            if (this.gameManager.systems.notificationManager) {
                this.gameManager.systems.notificationManager.showNotification(
                    `💥 受到 ${amount} 点伤害！`,
                    '#ff6b6b',
                    'error',
                    1
                );
            }
            
            if (this.energySystem && this.energySystem.energy <= 0) {
                this.die();
            }
        }
    }
    
    updateBacktrackProtectionIndicator() {
        // 更新回溯保护计数的视觉指示器
        const backtrackCount = this.gameManager.systems.timeManager.backtrackCount;
        const timeBackElement = document.getElementById('time-back-count');
        if (timeBackElement) {
            timeBackElement.textContent = backtrackCount;
            
            // 当回溯保护次数为0时，更改视觉样式
            if (backtrackCount === 0) {
                timeBackElement.style.color = '#ff6b6b';
                timeBackElement.style.fontWeight = 'bold';
            }
        }
    }
    
    die() {
        this.alive = false;
        
        if (this.isPlayer) {
            // 记录到事件日志
            if (this.gameManager.systems.uiSystems && this.gameManager.systems.uiSystems.eventLogSystem) {
                this.gameManager.systems.uiSystems.eventLogSystem.addEvent(
                    '💀 游戏结束！玩家死亡！',
                    'player'
                );
            }
            
            this.gameManager.gameOver();
        } else {
            this.gameManager.removeGameObject(this);
        }
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        // 使用传入的ctx或从gameManager获取
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        
        // 仅在开发模式下输出日志
        const isDevMode = false;
        if (isDevMode) {
            console.log('Rendering snake:', this.isPlayer ? 'Player' : 'AI', 'at', this.x, this.y, 'body length:', this.body.length);
        }
        
        // 渲染轨迹效果
        this.trailEffects.forEach(effect => {
            renderCtx.globalAlpha = effect.opacity;
            renderCtx.fillStyle = effect.color;
            renderCtx.beginPath();
            renderCtx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
            renderCtx.fill();
        });
        renderCtx.globalAlpha = 1;
        
        // 渲染无敌状态效果
        if (this.invincible) {
            // 渲染无敌状态的闪烁效果
            if (Math.sin(Date.now() * 0.01) > 0) {
                renderCtx.globalAlpha = 0.7;
            }
            
            // 渲染无敌状态的光环
            renderCtx.beginPath();
            renderCtx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width + 10, 0, Math.PI * 2);
            renderCtx.strokeStyle = '#ffff00';
            renderCtx.lineWidth = 3;
            renderCtx.stroke();
        }
        
        // 渲染身体分段
        this.body.forEach((segment, index) => {
            // 根据位置调整颜色
            let color = this.getSegmentColor(index);
            
            // 无敌状态时改变颜色
            if (this.invincible) {
                color = this.lightenColor(color, 30);
            }
            
            renderCtx.fillStyle = color;
            renderCtx.fillRect(segment.x, segment.y, segment.width, segment.height);
            
            // 渲染身体分段边框
            renderCtx.strokeStyle = '#000';
            renderCtx.lineWidth = 2;
            renderCtx.strokeRect(segment.x, segment.y, segment.width, segment.height);
        });
        
        // 渲染头部
        let headColor = this.getHeadColor();
        if (this.invincible) {
            headColor = this.lightenColor(headColor, 30);
        }
        renderCtx.fillStyle = headColor;
        renderCtx.fillRect(this.x, this.y, this.width, this.height);
        
        // 渲染头部边框
        renderCtx.strokeStyle = '#000';
        renderCtx.lineWidth = 2;
        renderCtx.strokeRect(this.x, this.y, this.width, this.height);
        
        // 渲染眼睛
        this.renderEyes(renderCtx);
        
        // 渲染器官
        this.renderOrgans(renderCtx);
        
        // 渲染闪现技能效果
        if (this.flashSkill) {
            this.flashSkill.render(renderCtx);
        }
        
        // 恢复透明度
        renderCtx.globalAlpha = 1;
    }
    
    renderEyes(ctx) {
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        const eyeSize = 4;
        
        // 根据方向渲染眼睛
        if (this.direction.x === 1) {
            // 向右
            renderCtx.fillStyle = '#000';
            renderCtx.beginPath();
            renderCtx.arc(this.x + this.width - 5, this.y + 5, eyeSize, 0, Math.PI * 2);
            renderCtx.arc(this.x + this.width - 5, this.y + this.height - 5, eyeSize, 0, Math.PI * 2);
            renderCtx.fill();
        } else if (this.direction.x === -1) {
            // 向左
            renderCtx.fillStyle = '#000';
            renderCtx.beginPath();
            renderCtx.arc(this.x + 5, this.y + 5, eyeSize, 0, Math.PI * 2);
            renderCtx.arc(this.x + 5, this.y + this.height - 5, eyeSize, 0, Math.PI * 2);
            renderCtx.fill();
        } else if (this.direction.y === 1) {
            // 向下
            renderCtx.fillStyle = '#000';
            renderCtx.beginPath();
            renderCtx.arc(this.x + 5, this.y + this.height - 5, eyeSize, 0, Math.PI * 2);
            renderCtx.arc(this.x + this.width - 5, this.y + this.height - 5, eyeSize, 0, Math.PI * 2);
            renderCtx.fill();
        } else if (this.direction.y === -1) {
            // 向上
            renderCtx.fillStyle = '#000';
            renderCtx.beginPath();
            renderCtx.arc(this.x + 5, this.y + 5, eyeSize, 0, Math.PI * 2);
            renderCtx.arc(this.x + this.width - 5, this.y + 5, eyeSize, 0, Math.PI * 2);
            renderCtx.fill();
        }
    }
    
    renderOrgans(ctx) {
        // 渲染器官
        this.organs.forEach(organ => {
            if (organ.render) {
                organ.render(this);
            }
        });
    }
    
    getSegmentColor(index) {
        // 根据位置和皮肤模式获取颜色
        let baseColor = this.skinColor;
        
        switch (this.skinPattern) {
            case 0: // 纯色
                return baseColor;
            case 1: // 条纹
                return index % 2 === 0 ? baseColor : this.lightenColor(baseColor, 20);
            case 2: // 渐变
                const lightness = 100 - (index / this.body.length) * 30;
                return this.lightenColor(baseColor, lightness);
            case 3: // 斑点
                return Math.random() > 0.7 ? this.lightenColor(baseColor, 30) : baseColor;
            default:
                return baseColor;
        }
    }
    
    getHeadColor() {
        // 头部颜色比身体深
        return this.darkenColor(this.skinColor, 20);
    }
    
    getRandomColor() {
        // 生成随机颜色
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffcc5c', '#ff9f43'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    lightenColor(color, percent) {
        // 提亮颜色
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
    }
    
    darkenColor(color, percent) {
        // 变暗颜色
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R>255?255:R<0?0:R)*0x10000 + (G>255?255:G<0?0:G)*0x100 + (B>255?255:B<0?0:B)).toString(16).slice(1);
    }
    
    serialize() {
        // 序列化蛇的状态
        return {
            id: this.id,
            isPlayer: this.isPlayer,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            speed: this.speed,
            baseSpeed: this.baseSpeed,
            currentSpeed: this.currentSpeed,
            targetSpeed: this.targetSpeed,
            direction: this.direction,
            nextDirection: this.nextDirection,
            bodyLength: this.bodyLength,
            body: this.body,
            organs: this.organs.map(organ => organ.serialize ? organ.serialize() : organ),
            skinColor: this.skinColor,
            skinPattern: this.skinPattern,
            alive: this.alive,
            energySystem: this.energySystem ? this.energySystem.serialize() : null
        };
    }
    
    deserialize(data) {
        // 反序列化蛇的状态
        this.id = data.id || this.id;
        this.isPlayer = data.isPlayer;
        this.x = data.x;
        this.y = data.y;
        this.width = data.width || 20;
        this.height = data.height || 20;
        this.speed = data.speed || (this.isPlayer ? 10 : 5.75);
        this.direction = data.direction || { x: 1, y: 0 };
        this.nextDirection = data.nextDirection || { x: 1, y: 0 };
        this.bodyLength = data.bodyLength || 3;
        this.body = data.body || [];
        this.organs = data.organs || [];
        this.skinColor = data.skinColor || (this.isPlayer ? '#FF0000' : this.getRandomColor());
        this.skinPattern = data.skinPattern || 0;
        this.alive = data.alive !== undefined ? data.alive : true;
        
        // 恢复速度相关属性
        this.baseSpeed = data.baseSpeed || (this.isPlayer ? 5 : 5.75);
        this.currentSpeed = data.currentSpeed || this.baseSpeed;
        this.targetSpeed = data.targetSpeed || this.baseSpeed;
        
        // 恢复能量系统
        if (data.energySystem && this.energySystem) {
            this.energySystem.deserialize(data.energySystem);
        }
        
        // 如果身体数据为空，重新初始化
        if (this.body.length === 0) {
            this.initBody();
        }
        
        console.log('Snake deserialize 完成, isPlayer:', this.isPlayer, 'bodyLength:', this.bodyLength);
    }
}

// 导出蛇类
try {
    module.exports = Snake;
} catch (e) {
    // 浏览器环境
    window.Snake = Snake;
}