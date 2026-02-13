class Boss {
    constructor(gameManager, x, y, bossType = 'hydra') {
        this.gameManager = gameManager;
        this.x = x;
        this.y = y;
        this.type = 'boss';
        this.bossType = bossType;
        this.collider = true;
        
        this.isBoss = true;
        this.phase = 1;
        this.maxPhase = 3;
        this.phaseHealthThresholds = [0.7, 0.4, 0];
        
        this.skills = [];
        this.skillCooldowns = {};
        this.currentSkill = null;
        this.skillTimer = 0;
        
        this.rage = 0;
        this.enrageThreshold = 50;
        this.isEnraged = false;
        
        this.warningTime = 0;
        this.hasSpawned = false;
        this.spawnAnimationComplete = false;
        
        this.invincible = false;
        this.invincibleTimer = 0;
        
        this.setupBossType(bossType);
        
        if (window.SpriteRenderer) {
            this.spriteRenderer = new window.SpriteRenderer(gameManager.systems.renderer.ctx);
        }
    }
    
    setupBossType(type) {
        const bossConfigs = {
            hydra: {
                name: '九头蛇',
                emoji: '🐍',
                width: 60,
                height: 60,
                speed: 1.0,
                health: 1500,
                damage: 22,
                attackRange: 150,
                attackCooldown: 3,
                color: '#2ecc71',
                colorScheme: {
                    primary: '#2ecc71',
                    secondary: '#27ae60',
                    highlight: '#58d68d',
                    accent: '#1abc9c'
                },
                skills: ['multiHead', 'poisonSpray', 'summonMinions'],
                scoreReward: 1000
            },
            flame: {
                name: '炎魔',
                emoji: '🔥',
                width: 55,
                height: 55,
                speed: 1.2,
                health: 1200,
                damage: 28,
                attackRange: 200,
                attackCooldown: 2.2,
                color: '#e74c3c',
                colorScheme: {
                    primary: '#e74c3c',
                    secondary: '#c0392b',
                    highlight: '#f39c12',
                    accent: '#d35400'
                },
                skills: ['flameBurst', 'fireTrail', 'meteorStrike'],
                scoreReward: 1200
            },
            titan: {
                name: '泰坦',
                emoji: '🛡️',
                width: 80,
                height: 80,
                speed: 0.65,
                health: 3000,
                damage: 18,
                attackRange: 120,
                attackCooldown: 4.5,
                color: '#3498db',
                colorScheme: {
                    primary: '#3498db',
                    secondary: '#2980b9',
                    highlight: '#5dade2',
                    accent: '#1a5276'
                },
                skills: ['shield', 'earthquake', 'fortify'],
                scoreReward: 1500
            },
            thunder: {
                name: '雷神',
                emoji: '⚡',
                width: 50,
                height: 50,
                speed: 1.6,
                health: 1000,
                damage: 25,
                attackRange: 180,
                attackCooldown: 1.8,
                color: '#f1c40f',
                colorScheme: {
                    primary: '#f1c40f',
                    secondary: '#f39c12',
                    highlight: '#fff59d',
                    accent: '#ffeb3b'
                },
                skills: ['lightningChain', 'teleport', 'thunderStorm'],
                scoreReward: 1300
            },
            chaos: {
                name: '混沌之王',
                emoji: '👑',
                width: 70,
                height: 70,
                speed: 1.3,
                health: 2500,
                damage: 30,
                attackRange: 200,
                attackCooldown: 2.7,
                color: '#9b59b6',
                colorScheme: {
                    primary: '#9b59b6',
                    secondary: '#8e44ad',
                    highlight: '#d7bde2',
                    accent: '#6c3483'
                },
                skills: ['chaosBlast', 'phaseShift', 'domainOfChaos'],
                scoreReward: 2000
            }
        };
        
        const config = bossConfigs[type] || bossConfigs.hydra;
        
        this.name = config.name;
        this.emoji = config.emoji;
        this.width = config.width;
        this.height = config.height;
        this.speed = config.speed;
        this.health = config.health;
        this.maxHealth = config.health;
        this.damage = config.damage;
        this.attackRange = config.attackRange;
        this.attackCooldown = config.attackCooldown;
        this.color = config.color;
        this.colorScheme = config.colorScheme;
        this.skills = config.skills;
        this.scoreReward = config.scoreReward;
        
        this.skills.forEach(skill => {
            this.skillCooldowns[skill] = 0;
        });
        
        this.direction = { x: 1, y: 0 };
        this.moveTimer = 0;
        this.moveChangeInterval = 3;
        this.attackTimer = 0;
        
        this.alive = true;
    }
    
    update(deltaTime) {
        if (!this.alive) return;
        
        if (!this.spawnAnimationComplete) {
            this.warningTime += deltaTime;
            if (this.warningTime >= 1) {
                this.spawnAnimationComplete = true;
                this.hasSpawned = true;
            }
            return;
        }
        
        if (this.invincible) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
        
        this.updatePhase();
        
        this.updateSkills(deltaTime);
        
        this.updateMovement(deltaTime);
        
        this.attackTimer += deltaTime;
        if (this.attackTimer >= this.attackCooldown) {
            this.attackTimer = 0;
            this.performAttack();
        }
        
        this.updateRage(deltaTime);
    }
    
    updatePhase() {
        const healthPercent = this.health / this.maxHealth;
        
        for (let i = 0; i < this.phaseHealthThresholds.length; i++) {
            if (healthPercent <= this.phaseHealthThresholds[i] && this.phase <= i + 1) {
                this.phase = i + 2;
                this.onPhaseChange();
                break;
            }
        }
    }
    
    onPhaseChange() {
        this.invincible = true;
        this.invincibleTimer = 1.5;
        
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `⚠️ ${this.name} 进入第 ${this.phase} 阶段！`,
                '#e74c3c',
                'warning',
                3
            );
        }
        
        this.speed *= 1.1;
        this.attackCooldown *= 0.85;
        
        this.gameManager.systems.renderer.addScreenShake(10, 0.5);
    }
    
    updateSkills(deltaTime) {
        for (let skill in this.skillCooldowns) {
            if (this.skillCooldowns[skill] > 0) {
                this.skillCooldowns[skill] -= deltaTime;
            }
        }
        
        this.skillTimer += deltaTime;
        if (this.skillTimer >= 5) {
            this.skillTimer = 0;
            this.useRandomSkill();
        }
    }
    
    useRandomSkill() {
        const availableSkills = this.skills.filter(skill => this.skillCooldowns[skill] <= 0);
        if (availableSkills.length === 0) return;
        
        const skill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        this.useSkill(skill);
    }
    
    useSkill(skillName) {
        this.skillCooldowns[skillName] = 10;
        this.currentSkill = skillName;
        
        switch (skillName) {
            case 'multiHead':
                this.skillMultiHead();
                break;
            case 'poisonSpray':
                this.skillPoisonSpray();
                break;
            case 'summonMinions':
                this.skillSummonMinions();
                break;
            case 'flameBurst':
                this.skillFlameBurst();
                break;
            case 'fireTrail':
                this.skillFireTrail();
                break;
            case 'meteorStrike':
                this.skillMeteorStrike();
                break;
            case 'shield':
                this.skillShield();
                break;
            case 'earthquake':
                this.skillEarthquake();
                break;
            case 'fortify':
                this.skillFortify();
                break;
            case 'lightningChain':
                this.skillLightningChain();
                break;
            case 'teleport':
                this.skillTeleport();
                break;
            case 'thunderStorm':
                this.skillThunderStorm();
                break;
            case 'chaosBlast':
                this.skillChaosBlast();
                break;
            case 'phaseShift':
                this.skillPhaseShift();
                break;
            case 'domainOfChaos':
                this.skillDomainOfChaos();
                break;
        }
    }
    
    skillMultiHead() {
        if (!this.gameManager.player) return;
        
        const player = this.gameManager.player;
        const angles = [-30, 0, 30];
        
        angles.forEach(angleOffset => {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const baseAngle = Math.atan2(dy, dx);
            const angle = baseAngle + (angleOffset * Math.PI / 180);
            
            const bulletSpeed = 5;
            const bulletDx = Math.cos(angle) * bulletSpeed;
            const bulletDy = Math.sin(angle) * bulletSpeed;
            
            if (typeof EnemyBullet !== 'undefined') {
                const bullet = new EnemyBullet(
                    this.gameManager,
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    bulletDx,
                    bulletDy,
                    { damage: this.damage * 0.5, color: this.colorScheme.accent }
                );
                this.gameManager.gameObjects.push(bullet);
            }
        });
        
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `🐍 ${this.name} 使用多头攻击！`,
                this.color,
                'warning',
                1
            );
        }
    }
    
    skillPoisonSpray() {
        const numDrops = 8;
        for (let i = 0; i < numDrops; i++) {
            const angle = (i / numDrops) * Math.PI * 2;
            const distance = 100 + Math.random() * 100;
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;
            
            const poisonZone = {
                x: x,
                y: y,
                radius: 30,
                damage: 5,
                duration: 5,
                timer: 0,
                type: 'poisonZone',
                color: 'rgba(46, 204, 113, 0.3)',
                update: function(deltaTime) {
                    this.timer += deltaTime;
                    if (this.timer >= this.duration) {
                        this.gameManager.removeGameObject(this);
                    }
                },
                render: function(ctx) {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fill();
                },
                gameManager: this.gameManager
            };
            this.gameManager.gameObjects.push(poisonZone);
        }
    }
    
    skillSummonMinions() {
        const numMinions = 3;
        for (let i = 0; i < numMinions; i++) {
            const angle = (i / numMinions) * Math.PI * 2;
            const distance = 100;
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;
            
            if (typeof Enemy !== 'undefined') {
                const minion = new Enemy(this.gameManager, x, y, 'fast', this.gameManager.waveSystem?.currentWave || 1);
                minion.health *= 0.5;
                minion.maxHealth *= 0.5;
                this.gameManager.gameObjects.push(minion);
            }
        }
        
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `🐍 ${this.name} 召唤了小怪！`,
                this.color,
                'warning',
                1
            );
        }
    }
    
    skillFlameBurst() {
        if (!this.gameManager.player) return;
        
        const player = this.gameManager.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);
        
        const numBullets = 12;
        const spreadAngle = Math.PI / 3;
        
        for (let i = 0; i < numBullets; i++) {
            const bulletAngle = angle - spreadAngle / 2 + (i / (numBullets - 1)) * spreadAngle;
            const bulletSpeed = 6;
            const bulletDx = Math.cos(bulletAngle) * bulletSpeed;
            const bulletDy = Math.sin(bulletAngle) * bulletSpeed;
            
            if (typeof EnemyBullet !== 'undefined') {
                const bullet = new EnemyBullet(
                    this.gameManager,
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    bulletDx,
                    bulletDy,
                    { damage: this.damage * 0.4, color: '#f39c12' }
                );
                this.gameManager.gameObjects.push(bullet);
            }
        }
    }
    
    skillFireTrail() {
        const trailDuration = 3;
        const fireTrail = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            duration: trailDuration,
            timer: 0,
            type: 'fireTrail',
            damage: 10,
            color: 'rgba(231, 76, 60, 0.5)',
            update: function(deltaTime) {
                this.timer += deltaTime;
                if (this.timer >= this.duration) {
                    this.gameManager.removeGameObject(this);
                }
            },
            render: function(ctx) {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);
            },
            gameManager: this.gameManager,
            collider: true
        };
        this.gameManager.gameObjects.push(fireTrail);
    }
    
    skillMeteorStrike() {
        if (!this.gameManager.player) return;
        
        const player = this.gameManager.player;
        const meteor = {
            x: player.x,
            y: player.y,
            radius: 50,
            damage: this.damage * 2,
            warningTime: 1.5,
            timer: 0,
            type: 'meteor',
            update: function(deltaTime) {
                this.timer += deltaTime;
                if (this.timer >= this.warningTime) {
                    this.explode();
                    this.gameManager.removeGameObject(this);
                }
            },
            explode: function() {
                if (this.gameManager.player) {
                    const dx = this.gameManager.player.x - this.x;
                    const dy = this.gameManager.player.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < this.radius) {
                        this.gameManager.player.takeDamage(this.damage);
                    }
                }
                this.gameManager.systems.renderer.addScreenShake(15, 0.3);
            },
            render: function(ctx) {
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.fillStyle = 'rgba(231, 76, 60, 0.2)';
                ctx.fill();
            },
            gameManager: this.gameManager
        };
        this.gameManager.gameObjects.push(meteor);
        
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `🔥 陨石即将坠落！`,
                '#e74c3c',
                'warning',
                1
            );
        }
    }
    
    skillShield() {
        this.shield = {
            health: this.maxHealth * 0.3,
            maxHealth: this.maxHealth * 0.3
        };
        
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `🛡️ ${this.name} 激活了护盾！`,
                '#3498db',
                'warning',
                1
            );
        }
    }
    
    skillEarthquake() {
        this.gameManager.systems.renderer.addScreenShake(20, 1);
        
        if (this.gameManager.player) {
            const dx = this.gameManager.player.x - this.x;
            const dy = this.gameManager.player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
                this.gameManager.player.takeDamage(this.damage * 0.5);
                
                const knockbackForce = 50;
                const angle = Math.atan2(dy, dx);
                this.gameManager.player.x += Math.cos(angle) * knockbackForce;
                this.gameManager.player.y += Math.sin(angle) * knockbackForce;
            }
        }
    }
    
    skillFortify() {
        this.damageReduction = 0.3;
        this.fortifyDuration = 10;
        
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `🛡️ ${this.name} 进入防御姿态！`,
                '#3498db',
                'warning',
                1
            );
        }
    }
    
    skillLightningChain() {
        if (!this.gameManager.player) return;
        
        let targets = [this.gameManager.player];
        let currentX = this.x;
        let currentY = this.y;
        
        targets.forEach(target => {
            const dx = target.x - currentX;
            const dy = target.y - currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 300) {
                target.takeDamage(this.damage * 0.6);
                
                const lightning = {
                    startX: currentX,
                    startY: currentY,
                    endX: target.x,
                    endY: target.y,
                    duration: 0.3,
                    timer: 0,
                    update: function(deltaTime) {
                        this.timer += deltaTime;
                        if (this.timer >= this.duration) {
                            this.gameManager.removeGameObject(this);
                        }
                    },
                    render: function(ctx) {
                        ctx.strokeStyle = '#f1c40f';
                        ctx.lineWidth = 3;
                        ctx.beginPath();
                        ctx.moveTo(this.startX, this.startY);
                        ctx.lineTo(this.endX, this.endY);
                        ctx.stroke();
                    },
                    gameManager: this.gameManager
                };
                this.gameManager.gameObjects.push(lightning);
            }
            
            currentX = target.x;
            currentY = target.y;
        });
    }
    
    skillTeleport() {
        if (!this.gameManager.player) return;
        
        const player = this.gameManager.player;
        const angle = Math.random() * Math.PI * 2;
        const distance = 100 + Math.random() * 50;
        
        this.x = player.x + Math.cos(angle) * distance;
        this.y = player.y + Math.sin(angle) * distance;
        
        this.x = Math.max(this.width, Math.min(1000 - this.width, this.x));
        this.y = Math.max(this.height, Math.min(800 - this.height, this.y));
        
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `⚡ ${this.name} 瞬移了！`,
                '#f1c40f',
                'warning',
                1
            );
        }
    }
    
    skillThunderStorm() {
        const numStrikes = 5;
        for (let i = 0; i < numStrikes; i++) {
            setTimeout(() => {
                if (!this.alive) return;
                
                const x = Math.random() * 900 + 50;
                const y = Math.random() * 700 + 50;
                
                const strike = {
                    x: x,
                    y: y,
                    radius: 40,
                    damage: this.damage * 0.4,
                    duration: 0.5,
                    timer: 0,
                    update: function(deltaTime) {
                        this.timer += deltaTime;
                        if (this.timer >= this.duration) {
                            if (this.gameManager.player) {
                                const dx = this.gameManager.player.x - this.x;
                                const dy = this.gameManager.player.y - this.y;
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                if (distance < this.radius) {
                                    this.gameManager.player.takeDamage(this.damage);
                                }
                            }
                            this.gameManager.removeGameObject(this);
                        }
                    },
                    render: function(ctx) {
                        ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                        ctx.fill();
                    },
                    gameManager: this.gameManager
                };
                this.gameManager.gameObjects.push(strike);
            }, i * 300);
        }
    }
    
    skillChaosBlast() {
        const numBullets = 16;
        for (let i = 0; i < numBullets; i++) {
            const angle = (i / numBullets) * Math.PI * 2;
            const bulletSpeed = 4;
            const bulletDx = Math.cos(angle) * bulletSpeed;
            const bulletDy = Math.sin(angle) * bulletSpeed;
            
            if (typeof EnemyBullet !== 'undefined') {
                const bullet = new EnemyBullet(
                    this.gameManager,
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    bulletDx,
                    bulletDy,
                    { damage: this.damage * 0.3, color: '#9b59b6' }
                );
                this.gameManager.gameObjects.push(bullet);
            }
        }
    }
    
    skillPhaseShift() {
        this.invincible = true;
        this.invincibleTimer = 2;
        this.x = Math.random() * 800 + 100;
        this.y = Math.random() * 600 + 100;
        
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `👑 ${this.name} 进行了相位转移！`,
                '#9b59b6',
                'warning',
                1
            );
        }
    }
    
    skillDomainOfChaos() {
        const domain = {
            x: this.x - 100,
            y: this.y - 100,
            width: 200,
            height: 200,
            duration: 8,
            timer: 0,
            damage: 3,
            slowEffect: 0.5,
            update: function(deltaTime) {
                this.timer += deltaTime;
                if (this.timer >= this.duration) {
                    this.gameManager.removeGameObject(this);
                }
                
                if (this.gameManager.player) {
                    const player = this.gameManager.player;
                    if (player.x > this.x && player.x < this.x + this.width &&
                        player.y > this.y && player.y < this.y + this.height) {
                        player.takeDamage(this.damage * deltaTime);
                        player.speed *= this.slowEffect;
                    }
                }
            },
            render: function(ctx) {
                ctx.fillStyle = 'rgba(155, 89, 182, 0.2)';
                ctx.fillRect(this.x, this.y, this.width, this.height);
                ctx.strokeStyle = '#9b59b6';
                ctx.lineWidth = 2;
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            },
            gameManager: this.gameManager
        };
        this.gameManager.gameObjects.push(domain);
    }
    
    updateMovement(deltaTime) {
        if (!this.gameManager.player) return;
        
        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.moveChangeInterval) {
            this.moveTimer = 0;
            this.changeMovePattern();
        }
        
        const player = this.gameManager.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.attackRange) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        } else if (distance < this.attackRange * 0.5) {
            this.x -= (dx / distance) * this.speed * 0.5;
            this.y -= (dy / distance) * this.speed * 0.5;
        }
        
        this.x = Math.max(this.width / 2, Math.min(1000 - this.width / 2, this.x));
        this.y = Math.max(this.height / 2, Math.min(800 - this.height / 2, this.y));
        
        this.direction = { x: dx / distance || 0, y: dy / distance || 0 };
    }
    
    changeMovePattern() {
        this.moveChangeInterval = 2 + Math.random() * 3;
    }
    
    performAttack() {
        if (!this.gameManager.player || !this.spawnAnimationComplete) return;
        
        const player = this.gameManager.player;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.attackRange) {
            player.takeDamage(this.damage);
        }
    }
    
    updateRage(deltaTime) {
        if (this.health < this.maxHealth * 0.3 && !this.isEnraged) {
            this.isEnraged = true;
            this.speed *= 1.3;
            this.attackCooldown *= 0.7;
            
            if (this.gameManager.systems.notificationManager) {
                this.gameManager.systems.notificationManager.showNotification(
                    `🔥 ${this.name} 进入狂暴状态！`,
                    '#e74c3c',
                    'warning',
                    2
                );
            }
        }
    }
    
    takeDamage(amount) {
        if (this.invincible) return;
        
        let actualDamage = amount;
        
        if (this.shield && this.shield.health > 0) {
            if (this.shield.health >= actualDamage) {
                this.shield.health -= actualDamage;
                return;
            } else {
                actualDamage -= this.shield.health;
                this.shield.health = 0;
            }
        }
        
        if (this.damageReduction && this.fortifyDuration > 0) {
            actualDamage *= (1 - this.damageReduction);
        }
        
        this.health -= actualDamage;
        this.rage += actualDamage * 0.5;
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        this.alive = false;
        
        // 通知BossManager处理首领击败
        if (this.gameManager.bossManager) {
            this.gameManager.bossManager.onBossDefeated(this);
        }
        
        this.gameManager.score += this.scoreReward;
        this.gameManager.updateUI();
        
        this.dropRewards();
        
        this.gameManager.systems.renderer.addScreenShake(15, 0.5);
        
        this.gameManager.removeGameObject(this);
    }
    
    dropRewards() {
        if (this.gameManager.player && this.gameManager.player.energySystem) {
            this.gameManager.player.energySystem.energy = Math.min(
                100,
                this.gameManager.player.energySystem.energy + 50
            );
        }
        
        const organTypes = ['heart', 'liver', 'lung', 'stomach', 'kidney'];
        const organType = organTypes[Math.floor(Math.random() * organTypes.length)];
        
        if (typeof Organ !== 'undefined') {
            const organ = new Organ(
                this.gameManager,
                this.x + Math.random() * 50 - 25,
                this.y + Math.random() * 50 - 25,
                organType
            );
            organ.isRare = true;
            this.gameManager.gameObjects.push(organ);
        }
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        
        if (!this.spawnAnimationComplete) {
            this.renderSpawnWarning(renderCtx);
            return;
        }
        
        if (this.invincible) {
            renderCtx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
        }
        
        this.renderBody(renderCtx);
        
        this.renderHead(renderCtx);
        
        this.renderShield(renderCtx);
        
        renderCtx.globalAlpha = 1;
        
        this.renderHealthBar(renderCtx);
        
        this.renderPhaseIndicator(renderCtx);
    }
    
    renderSpawnWarning(ctx) {
        ctx.save();
        
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width * (1 + this.warningTime), 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.emoji} ${this.name}`, this.x, this.y - 50);
        ctx.font = '16px Arial';
        ctx.fillText('BOSS 出现！', this.x, this.y - 25);
        
        ctx.restore();
    }
    
    renderBody(ctx) {
        ctx.fillStyle = this.colorScheme.primary;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        
        ctx.fillStyle = this.colorScheme.secondary;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width * 0.8, this.height * 0.3);
        
        ctx.strokeStyle = this.colorScheme.highlight;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        
        if (this.isEnraged) {
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - this.width / 2 - 5, this.y - this.height / 2 - 5, this.width + 10, this.height + 10);
        }
    }
    
    renderHead(ctx) {
        const headX = this.x + this.direction.x * (this.width / 2 + 10);
        const headY = this.y + this.direction.y * (this.height / 2 + 10);
        
        ctx.fillStyle = this.colorScheme.accent;
        ctx.beginPath();
        ctx.arc(headX, headY, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        const eyeOffset = 5;
        ctx.beginPath();
        ctx.arc(headX + this.direction.x * eyeOffset - 3, headY - 3, 3, 0, Math.PI * 2);
        ctx.arc(headX + this.direction.x * eyeOffset + 3, headY - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(headX + this.direction.x * eyeOffset - 3, headY - 3, 1.5, 0, Math.PI * 2);
        ctx.arc(headX + this.direction.x * eyeOffset + 3, headY - 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderShield(ctx) {
        if (this.shield && this.shield.health > 0) {
            const shieldPercent = this.shield.health / this.shield.maxHealth;
            ctx.strokeStyle = `rgba(52, 152, 219, ${0.5 + shieldPercent * 0.5})`;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width * 0.8, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    renderHealthBar(ctx) {
        const barWidth = 200;
        const barHeight = 20;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.height / 2 - 40;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const healthPercent = this.health / this.maxHealth;
        const healthColor = healthPercent > 0.5 ? '#2ecc71' : healthPercent > 0.25 ? '#f39c12' : '#e74c3c';
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${this.emoji} ${this.name}`, this.x, barY - 5);
        ctx.fillText(`${Math.ceil(this.health)} / ${this.maxHealth}`, this.x, barY + 14);
    }
    
    renderPhaseIndicator(ctx) {
        const indicatorX = this.x - 30;
        const indicatorY = this.y - this.height / 2 - 55;
        
        for (let i = 1; i <= this.maxPhase; i++) {
            ctx.fillStyle = i <= this.phase ? '#e74c3c' : '#333';
            ctx.beginPath();
            ctx.arc(indicatorX + (i - 1) * 20, indicatorY, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    serialize() {
        return {
            x: this.x,
            y: this.y,
            type: this.type,
            bossType: this.bossType,
            health: this.health,
            maxHealth: this.maxHealth,
            phase: this.phase,
            isEnraged: this.isEnraged,
            skillCooldowns: { ...this.skillCooldowns }
        };
    }
    
    deserialize(data) {
        this.x = data.x;
        this.y = data.y;
        this.health = data.health;
        this.phase = data.phase || 1;
        this.isEnraged = data.isEnraged || false;
        this.skillCooldowns = data.skillCooldowns || {};
        this.spawnAnimationComplete = true;
        this.hasSpawned = true;
    }
}

try {
    module.exports = Boss;
} catch (e) {
    window.Boss = Boss;
}
