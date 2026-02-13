/**
 * Mythic Snake - Boss Entity
 * Copyright (C) 2024 Mythic Snake Team
 * All rights reserved.
 *
 * This software is proprietary. Unauthorized commercial use is strictly prohibited.
 * See LICENSE file for full terms.
 */

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
        
        // 增强的视觉效果参数
        this.animationTime = 0;
        this.breathPhase = 0;
        this.floatOffset = 0;
        this.energyPulse = 0;
        this.particles = [];
        this.energyRings = [];
        this.ambientParticles = [];
        this.glowIntensity = 1;
        this.shadowOffset = { x: 0, y: 0 };

        // 凶狠感视觉参数
        this.eyeGlowIntensity = 0;
        this.eyeLockIntensity = 0;
        this.breathIntensity = 0;
        this.intimidationPulse = 0;
        this.muscleFlexPhase = 0;
        this.scarGlowPhase = 0;
        this.hornGlowPhase = 0;
        this.runeRotation = 0;
        this.chainWavePhase = 0;

        // 战斗痕迹数据
        this.scars = [];
        this.cracks = [];
        this.energyLeaks = [];

        // 初始化粒子系统
        this.initParticleSystem();

        // 初始化凶狠特征
        this.initIntimidatingFeatures();
        
        this.setupBossType(bossType);
        
        if (window.SpriteRenderer) {
            this.spriteRenderer = new window.SpriteRenderer(gameManager.systems.renderer.ctx);
        }
    }
    
    initParticleSystem() {
        // 创建环境粒子
        for (let i = 0; i < 20; i++) {
            this.ambientParticles.push({
                angle: Math.random() * Math.PI * 2,
                distance: 30 + Math.random() * 40,
                speed: 0.5 + Math.random() * 1,
                size: 2 + Math.random() * 4,
                opacity: 0.3 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
        
        // 创建能量环
        for (let i = 0; i < 3; i++) {
            this.energyRings.push({
                radius: 40 + i * 25,
                rotation: 0,
                speed: (0.5 - i * 0.15) * (i % 2 === 0 ? 1 : -1),
                opacity: 0.3 - i * 0.08
            });
        }
    }

    initIntimidatingFeatures() {
        // 生成随机伤疤
        const numScars = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numScars; i++) {
            this.scars.push({
                x: 0.2 + Math.random() * 0.6, // 相对位置 (0-1)
                y: 0.2 + Math.random() * 0.6,
                angle: Math.random() * Math.PI,
                length: 0.1 + Math.random() * 0.15,
                width: 2 + Math.random() * 3,
                depth: Math.random() // 伤疤深度影响发光强度
            });
        }

        // 生成战损裂纹（血量低时显示）
        const numCracks = 3 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numCracks; i++) {
            this.cracks.push({
                startX: Math.random(),
                startY: Math.random(),
                segments: this.generateCrackSegments(),
                glowIntensity: 0.3 + Math.random() * 0.7
            });
        }

        // 能量泄漏点
        const numLeaks = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < numLeaks; i++) {
            this.energyLeaks.push({
                x: Math.random(),
                y: Math.random(),
                intensity: 0.5 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    generateCrackSegments() {
        const segments = [];
        let x = 0, y = 0;
        const numSegments = 3 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < numSegments; i++) {
            const angle = Math.random() * Math.PI * 2;
            const length = 0.05 + Math.random() * 0.1;
            segments.push({
                dx: Math.cos(angle) * length,
                dy: Math.sin(angle) * length,
                width: 1 + (numSegments - i) * 0.5
            });
            x += segments[segments.length - 1].dx;
            y += segments[segments.length - 1].dy;
        }
        return segments;
    }
    
    hexToRgba(hex, alpha) {
        alpha = Math.max(0, Math.min(1, alpha));
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
        }
        return `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
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
                color: '#1a472a',
                colorScheme: {
                    primary: '#1a472a',      // 深绿主体
                    secondary: '#0d2818',    // 暗绿阴影
                    highlight: '#4a7c23',    // 亮绿高光
                    accent: '#7fff00',       // 毒绿强调
                    eye: '#ff0000',          // 血红眼睛
                    scar: '#8b0000',         // 暗红伤疤
                    energy: '#00ff00',       // 能量绿
                    dark: '#0a1a0a'          // 最暗色
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
                color: '#8b0000',
                colorScheme: {
                    primary: '#8b0000',      // 暗红主体
                    secondary: '#5c0000',    // 深红阴影
                    highlight: '#ff4500',    // 橙红高光
                    accent: '#ffd700',       // 金焰强调
                    eye: '#ffff00',          // 黄色眼睛
                    scar: '#ff6600',         // 熔岩伤疤
                    energy: '#ff0000',       // 能量红
                    dark: '#2a0000'          // 最暗色
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
                color: '#1c2833',
                colorScheme: {
                    primary: '#1c2833',      // 暗蓝主体
                    secondary: '#0d1318',    // 深蓝阴影
                    highlight: '#5d6d7e',    // 钢灰高光
                    accent: '#3498db',       // 电蓝强调
                    eye: '#00ffff',          // 冰霜眼睛
                    scar: '#4a6572',         // 石灰伤疤
                    energy: '#00bfff',       // 能量蓝
                    dark: '#0a0f12'          // 最暗色
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
                color: '#1a1a2e',
                colorScheme: {
                    primary: '#1a1a2e',      // 深紫主体
                    secondary: '#0f0f1a',    // 暗紫阴影
                    highlight: '#e94560',    // 闪电红高光
                    accent: '#f1c40f',       // 金黄强调
                    eye: '#ffffff',          // 纯白眼睛
                    scar: '#9b59b6',         // 紫色伤疤
                    energy: '#ffff00',       // 能量黄
                    dark: '#0a0a12'          // 最暗色
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
                color: '#2c003e',
                colorScheme: {
                    primary: '#2c003e',      // 深紫主体
                    secondary: '#1a0026',    // 暗紫阴影
                    highlight: '#8b5cf6',    // 亮紫高光
                    accent: '#ff0080',       // 粉紫强调
                    eye: '#ff0000',          // 混沌红眼睛
                    scar: '#9b00ff',         // 紫红伤疤
                    energy: '#ff00ff',       // 能量紫
                    dark: '#0f001a'          // 最暗色
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
        
        // 更新动画参数
        this.animationTime += deltaTime;
        this.breathPhase += deltaTime * 2;
        this.floatOffset = Math.sin(this.animationTime * 1.5) * 3;
        this.energyPulse = (Math.sin(this.animationTime * 3) + 1) / 2;
        this.glowIntensity = 0.8 + Math.sin(this.animationTime * 4) * 0.2;

        // 更新凶狠感动画参数
        this.eyeGlowIntensity = 0.5 + Math.sin(this.animationTime * 5) * 0.5;
        this.eyeLockIntensity = Math.min(1, this.eyeLockIntensity + deltaTime * 2);
        this.breathIntensity = (Math.sin(this.breathPhase) + 1) / 2;
        this.intimidationPulse = (Math.sin(this.animationTime * 2) + 1) / 2;
        this.muscleFlexPhase += deltaTime * 1.5;
        this.scarGlowPhase += deltaTime * 3;
        this.hornGlowPhase += deltaTime * 2;
        this.runeRotation += deltaTime * 0.5;
        this.chainWavePhase += deltaTime * 2;
        
        // 更新阴影偏移
        this.shadowOffset = {
            x: Math.sin(this.animationTime * 0.5) * 2,
            y: 5 + Math.cos(this.animationTime * 0.3) * 2
        };
        
        // 更新环境粒子
        this.ambientParticles.forEach(p => {
            p.angle += p.speed * deltaTime;
            p.phase += deltaTime * 2;
        });
        
        // 更新能量环
        this.energyRings.forEach(ring => {
            ring.rotation += ring.speed * deltaTime;
        });
        
        // 更新粒子系统
        this.updateParticles(deltaTime);

        // 更新能量泄漏点相位
        this.energyLeaks.forEach(leak => {
            leak.phase += deltaTime * 4;
        });
        
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
    
    updateParticles(deltaTime) {
        // 生成新粒子
        if (Math.random() < 0.3) {
            this.particles.push({
                x: this.x + (Math.random() - 0.5) * this.width,
                y: this.y + (Math.random() - 0.5) * this.height,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2 - 1,
                size: 3 + Math.random() * 5,
                life: 1,
                maxLife: 1,
                color: this.colorScheme.highlight
            });
        }
        
        // 更新粒子
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= deltaTime * 0.5;
            p.size *= 0.98;
            return p.life > 0;
        });
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
        
        renderCtx.save();
        
        // 应用浮动偏移
        const renderY = this.y + this.floatOffset;
        
        // 渲染阴影（最底层）
        this.renderShadow(renderCtx, renderY);
        
        // 渲染能量环
        this.renderEnergyRings(renderCtx, renderY);
        
        // 渲染环境粒子
        this.renderAmbientParticles(renderCtx, renderY);
        
        // 渲染粒子系统
        this.renderParticles(renderCtx);
        
        if (this.invincible) {
            renderCtx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.02) * 0.3;
        }
        
        // 渲染主体（带3D效果）
        this.renderBody3D(renderCtx, renderY);
        
        // 渲染头部
        this.renderHead3D(renderCtx, renderY);
        
        // 渲染护盾
        this.renderShield(renderCtx, renderY);
        
        // 渲染光环效果
        this.renderAura(renderCtx, renderY);
        
        renderCtx.globalAlpha = 1;
        
        // 渲染血条
        this.renderHealthBar(renderCtx, renderY);
        
        // 渲染阶段指示器
        this.renderPhaseIndicator(renderCtx, renderY);
        
        renderCtx.restore();
    }
    
    renderSpawnWarning(ctx) {
        ctx.save();

        const time = Date.now() * 0.001;
        const pulse = Math.sin(time * 5) * 0.3 + 0.7;
        const expandProgress = Math.min(1, this.warningTime);

        // 外层能量波 - 更强烈的脉冲
        for (let i = 0; i < 5; i++) {
            const waveRadius = this.width * (0.3 + expandProgress * (1 + i * 0.4));
            const waveAlpha = (1 - expandProgress) * (0.4 - i * 0.08) * pulse;

            ctx.strokeStyle = this.colorScheme.energy;
            ctx.globalAlpha = waveAlpha;
            ctx.lineWidth = 4 - i * 0.5;
            ctx.shadowColor = this.colorScheme.energy;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(this.x, this.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // 中心能量聚集 - 更强烈的发光
        const coreGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.width * expandProgress
        );
        coreGradient.addColorStop(0, `${this.colorScheme.energy}cc`);
        coreGradient.addColorStop(0.3, `${this.colorScheme.accent}88`);
        coreGradient.addColorStop(0.6, `${this.colorScheme.primary}44`);
        coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.globalAlpha = pulse;
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width * expandProgress, 0, Math.PI * 2);
        ctx.fill();

        // 能量粒子 - 更多且更密集
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2 + time * 3;
            const dist = this.width * (0.5 + expandProgress * 0.5);
            const px = this.x + Math.cos(angle) * dist;
            const py = this.y + Math.sin(angle) * dist;

            ctx.fillStyle = this.colorScheme.energy;
            ctx.globalAlpha = 0.9 * pulse;
            ctx.shadowColor = this.colorScheme.energy;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();

            // 粒子拖尾
            const trailLength = 3;
            for (let j = 1; j <= trailLength; j++) {
                const trailAngle = angle - j * 0.1;
                const trailX = this.x + Math.cos(trailAngle) * dist;
                const trailY = this.y + Math.sin(trailAngle) * dist;
                ctx.globalAlpha = 0.9 * pulse * (1 - j / trailLength) * 0.5;
                ctx.beginPath();
                ctx.arc(trailX, trailY, 5 - j, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.shadowBlur = 0;

        // BOSS名称和警告文字 - 更具威胁感
        ctx.globalAlpha = 1;

        // 名称背景光晕
        const nameGlow = ctx.createRadialGradient(this.x, this.y - 60, 0, this.x, this.y - 60, 100);
        nameGlow.addColorStop(0, `${this.colorScheme.energy}44`);
        nameGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = nameGlow;
        ctx.beginPath();
        ctx.arc(this.x, this.y - 60, 100, 0, Math.PI * 2);
        ctx.fill();

        // BOSS名称
        ctx.fillStyle = this.colorScheme.energy;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = this.colorScheme.dark;
        ctx.shadowBlur = 15;
        ctx.fillText(`${this.emoji} ${this.name}`, this.x, this.y - 60);

        // 警告文字 - 闪烁效果
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + Math.sin(time * 8) * 0.3})`;
        ctx.font = 'bold 20px Arial';
        ctx.fillText('BOSS 出现！', this.x, this.y - 25);

        // 威胁等级指示
        ctx.fillStyle = this.colorScheme.accent;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`威胁等级: ${this.getThreatLevel()}`, this.x, this.y);

        ctx.shadowBlur = 0;

        ctx.restore();
    }

    getThreatLevel() {
        const healthPercent = this.maxHealth / 3000;
        if (healthPercent > 1.5) return 'SSS';
        if (healthPercent > 1.2) return 'SS';
        if (healthPercent > 1) return 'S';
        if (healthPercent > 0.7) return 'A';
        if (healthPercent > 0.5) return 'B';
        return 'C';
    }
    
    renderShadow(ctx, renderY) {
        ctx.save();
        
        // 动态阴影
        const shadowScale = 1 + Math.sin(this.animationTime * 2) * 0.05;
        const shadowAlpha = 0.3 + this.floatOffset * 0.02;
        
        ctx.globalAlpha = Math.max(0.1, Math.min(0.5, shadowAlpha));
        ctx.fillStyle = '#000';
        
        // 椭圆形阴影
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.shadowOffset.x,
            renderY + this.height / 2 + 10,
            this.width * 0.6 * shadowScale,
            this.height * 0.2 * shadowScale,
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        // 模糊阴影边缘
        const gradient = ctx.createRadialGradient(
            this.x + this.shadowOffset.x,
            renderY + this.height / 2 + 10,
            0,
            this.x + this.shadowOffset.x,
            renderY + this.height / 2 + 10,
            this.width * 0.6
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(
            this.x + this.shadowOffset.x,
            renderY + this.height / 2 + 10,
            this.width * 0.7 * shadowScale,
            this.height * 0.25 * shadowScale,
            0, 0, Math.PI * 2
        );
        ctx.fill();
        
        ctx.restore();
    }
    
    renderEnergyRings(ctx, renderY) {
        ctx.save();

        this.energyRings.forEach((ring, index) => {
            ctx.save();
            ctx.translate(this.x, renderY);
            ctx.rotate(ring.rotation);

            const pulseAlpha = ring.opacity * (0.8 + this.energyPulse * 0.2);
            ctx.strokeStyle = this.colorScheme.energy;
            ctx.globalAlpha = pulseAlpha;
            ctx.lineWidth = 2 - index * 0.5;

            // 虚线能量环
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, ring.radius, 0, Math.PI * 2);
            ctx.stroke();

            // 能量节点
            ctx.setLineDash([]);
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const nodeX = Math.cos(angle) * ring.radius;
                const nodeY = Math.sin(angle) * ring.radius;

                ctx.fillStyle = this.colorScheme.energy;
                ctx.globalAlpha = pulseAlpha * 1.5;
                ctx.beginPath();
                ctx.arc(nodeX, nodeY, 3 - index * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });

        // 渲染符文光环
        this.renderRuneAura(ctx, renderY);

        // 渲染能量锁链
        this.renderEnergyChains(ctx, renderY);

        ctx.restore();
    }

    renderRuneAura(ctx, renderY) {
        ctx.save();

        const runeRadius = this.width * 0.9;
        const numRunes = 8;

        ctx.translate(this.x, renderY);
        ctx.rotate(this.runeRotation);

        // 符文光环背景
        const runeGlow = ctx.createRadialGradient(0, 0, runeRadius * 0.8, 0, 0, runeRadius * 1.2);
        runeGlow.addColorStop(0, 'rgba(0, 0, 0, 0)');
        runeGlow.addColorStop(0.5, `${this.colorScheme.energy}15`);
        runeGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = runeGlow;
        ctx.beginPath();
        ctx.arc(0, 0, runeRadius * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // 绘制符文
        for (let i = 0; i < numRunes; i++) {
            const angle = (i / numRunes) * Math.PI * 2;
            const runeX = Math.cos(angle) * runeRadius;
            const runeY = Math.sin(angle) * runeRadius;

            ctx.save();
            ctx.translate(runeX, runeY);
            ctx.rotate(angle + Math.PI / 2);

            // 符文发光
            ctx.strokeStyle = this.colorScheme.energy;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6 + Math.sin(this.animationTime * 3 + i) * 0.3;
            ctx.shadowColor = this.colorScheme.energy;
            ctx.shadowBlur = 10;

            // 绘制符文图案
            this.drawRuneSymbol(ctx, i);

            ctx.restore();
        }

        ctx.restore();
    }

    drawRuneSymbol(ctx, index) {
        // 不同的符文图案
        const runePatterns = [
            // 三角形符文
            () => {
                ctx.beginPath();
                ctx.moveTo(0, -8);
                ctx.lineTo(6, 6);
                ctx.lineTo(-6, 6);
                ctx.closePath();
                ctx.stroke();
            },
            // 菱形符文
            () => {
                ctx.beginPath();
                ctx.moveTo(0, -7);
                ctx.lineTo(5, 0);
                ctx.lineTo(0, 7);
                ctx.lineTo(-5, 0);
                ctx.closePath();
                ctx.stroke();
            },
            // 十字符文
            () => {
                ctx.beginPath();
                ctx.moveTo(0, -7);
                ctx.lineTo(0, 7);
                ctx.moveTo(-5, 0);
                ctx.lineTo(5, 0);
                ctx.stroke();
            },
            // 闪电符文
            () => {
                ctx.beginPath();
                ctx.moveTo(-3, -7);
                ctx.lineTo(3, -2);
                ctx.lineTo(-2, 0);
                ctx.lineTo(4, 7);
                ctx.stroke();
            },
            // 圆形符文
            () => {
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.stroke();
            },
            // 箭头符文
            () => {
                ctx.beginPath();
                ctx.moveTo(0, -7);
                ctx.lineTo(5, 3);
                ctx.lineTo(0, 0);
                ctx.lineTo(-5, 3);
                ctx.closePath();
                ctx.stroke();
            },
            // 星形符文
            () => {
                ctx.beginPath();
                for (let j = 0; j < 5; j++) {
                    const a = (j / 5) * Math.PI * 2 - Math.PI / 2;
                    const x = Math.cos(a) * 6;
                    const y = Math.sin(a) * 6;
                    if (j === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
            },
            // 波浪符文
            () => {
                ctx.beginPath();
                ctx.moveTo(-5, -5);
                ctx.bezierCurveTo(-2, -8, 2, -2, 5, -5);
                ctx.bezierCurveTo(2, -2, -2, 8, -5, 5);
                ctx.stroke();
            }
        ];

        const patternIndex = index % runePatterns.length;
        runePatterns[patternIndex]();
    }

    renderEnergyChains(ctx, renderY) {
        ctx.save();

        const numChains = 4;
        const chainRadius = this.width * 0.7;

        for (let i = 0; i < numChains; i++) {
            const baseAngle = (i / numChains) * Math.PI * 2;
            const waveOffset = Math.sin(this.chainWavePhase + i * 0.5) * 10;

            ctx.save();
            ctx.translate(this.x, renderY);

            // 能量锁链
            ctx.strokeStyle = this.colorScheme.energy;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4 + Math.sin(this.animationTime * 2 + i) * 0.2;
            ctx.shadowColor = this.colorScheme.energy;
            ctx.shadowBlur = 8;

            // 绘制锁链段
            const chainLength = 30 + waveOffset;
            const segments = 6;
            const startX = Math.cos(baseAngle) * chainRadius;
            const startY = Math.sin(baseAngle) * chainRadius * 0.6;
            const endX = Math.cos(baseAngle) * (chainRadius + chainLength);
            const endY = Math.sin(baseAngle) * (chainRadius + chainLength) * 0.6;

            ctx.beginPath();
            ctx.moveTo(startX, startY);

            for (let j = 1; j <= segments; j++) {
                const t = j / segments;
                const x = startX + (endX - startX) * t;
                const y = startY + (endY - startY) * t + Math.sin(t * Math.PI * 3 + this.chainWavePhase) * 5;
                ctx.lineTo(x, y);
            }

            ctx.stroke();

            // 锁链末端能量球
            ctx.fillStyle = this.colorScheme.energy;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(endX, endY, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        ctx.restore();
    }
    
    renderAmbientParticles(ctx, renderY) {
        ctx.save();
        
        this.ambientParticles.forEach(p => {
            const x = this.x + Math.cos(p.angle) * p.distance;
            const y = renderY + Math.sin(p.angle) * p.distance * 0.5;
            const pulseOpacity = p.opacity * (0.5 + Math.sin(p.phase) * 0.5);
            
            ctx.fillStyle = this.colorScheme.highlight;
            ctx.globalAlpha = pulseOpacity;
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fill();
            
            // 粒子光晕
            ctx.fillStyle = this.colorScheme.primary;
            ctx.globalAlpha = pulseOpacity * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, p.size * 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    renderParticles(ctx) {
        ctx.save();
        
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            
            // 粒子拖尾
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(p.x - p.vx * 2, p.y - p.vy * 2, p.size * alpha * 0.7, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    renderBody3D(ctx, renderY) {
        ctx.save();

        const bodyX = this.x - this.width / 2;
        const bodyY = renderY - this.height / 2;

        // 外发光效果
        const glowSize = 10 + this.energyPulse * 5;
        const outerGlow = ctx.createRadialGradient(
            this.x, renderY, this.width * 0.3,
            this.x, renderY, this.width * 0.8 + glowSize
        );
        outerGlow.addColorStop(0, 'rgba(0, 0, 0, 0)');
        outerGlow.addColorStop(0.7, `${this.colorScheme.energy}22`);
        outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = outerGlow;
        ctx.fillRect(bodyX - glowSize, bodyY - glowSize, this.width + glowSize * 2, this.height + glowSize * 2);

        // 3D渐变主体
        const bodyGradient = ctx.createLinearGradient(bodyX, bodyY, bodyX + this.width, bodyY + this.height);
        bodyGradient.addColorStop(0, this.colorScheme.primary);
        bodyGradient.addColorStop(0.3, this.colorScheme.secondary);
        bodyGradient.addColorStop(0.7, this.colorScheme.primary);
        bodyGradient.addColorStop(1, this.colorScheme.dark);

        // 主体阴影层
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(bodyX + 4, bodyY + 4, this.width, this.height);

        // 主体
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(bodyX, bodyY, this.width, this.height);

        // 高光层
        const highlightGradient = ctx.createLinearGradient(bodyX, bodyY, bodyX, bodyY + this.height * 0.5);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
        highlightGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = highlightGradient;
        ctx.fillRect(bodyX, bodyY, this.width, this.height * 0.6);

        // 渲染肌肉纹理
        this.renderMuscleTexture(ctx, bodyX, bodyY);

        // 渲染脊柱刺突
        this.renderSpineSpikes(ctx, bodyX, bodyY, renderY);

        // 渲染战斗痕迹（伤疤、裂纹、能量泄漏）
        this.renderBattleScars(ctx, bodyX, bodyY);
        this.renderCracks(ctx, bodyX, bodyY);
        this.renderEnergyLeaks(ctx, bodyX, bodyY);

        // 边框光效
        ctx.strokeStyle = this.colorScheme.highlight;
        ctx.lineWidth = 3;
        ctx.shadowColor = this.colorScheme.energy;
        ctx.shadowBlur = 10 * this.glowIntensity;
        ctx.strokeRect(bodyX, bodyY, this.width, this.height);
        ctx.shadowBlur = 0;

        // 狂暴状态效果
        if (this.isEnraged) {
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#e74c3c';
            ctx.shadowBlur = 15;
            ctx.strokeRect(bodyX - 5, bodyY - 5, this.width + 10, this.height + 10);
            ctx.shadowBlur = 0;

            // 狂暴粒子
            for (let i = 0; i < 3; i++) {
                const angle = this.animationTime * 3 + (i / 3) * Math.PI * 2;
                const dist = this.width * 0.7;
                const px = this.x + Math.cos(angle) * dist;
                const py = renderY + Math.sin(angle) * dist * 0.5;

                ctx.fillStyle = '#e74c3c';
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(px, py, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    renderMuscleTexture(ctx, bodyX, bodyY) {
        ctx.save();

        const muscleFlex = Math.sin(this.muscleFlexPhase) * 0.3 + 0.7;

        // 肌肉线条
        ctx.strokeStyle = this.colorScheme.highlight;
        ctx.globalAlpha = 0.4 * muscleFlex;
        ctx.lineWidth = 1.5;

        // 水平肌肉纹理
        for (let i = 0; i < 6; i++) {
            const y = bodyY + (this.height / 7) * (i + 1);
            const wave = Math.sin(this.animationTime * 2 + i * 0.5) * 2;

            ctx.beginPath();
            ctx.moveTo(bodyX + 5, y + wave);
            ctx.bezierCurveTo(
                bodyX + this.width * 0.3, y - 3 + wave,
                bodyX + this.width * 0.7, y + 3 + wave,
                bodyX + this.width - 5, y + wave
            );
            ctx.stroke();
        }

        // 垂直肌肉分隔线
        const verticalLines = [
            { x: 0.3, curve: 5 },
            { x: 0.5, curve: 8 },
            { x: 0.7, curve: 5 }
        ];

        verticalLines.forEach(line => {
            const x = bodyX + this.width * line.x;
            const curveOffset = Math.sin(this.animationTime * 1.5) * line.curve;

            ctx.beginPath();
            ctx.moveTo(x + curveOffset, bodyY + 5);
            ctx.bezierCurveTo(
                x - line.curve, bodyY + this.height * 0.3,
                x + line.curve, bodyY + this.height * 0.7,
                x - curveOffset, bodyY + this.height - 5
            );
            ctx.stroke();
        });

        // 肌肉高光点
        const highlightPoints = [
            { x: 0.2, y: 0.3 },
            { x: 0.8, y: 0.3 },
            { x: 0.3, y: 0.6 },
            { x: 0.7, y: 0.6 }
        ];

        ctx.globalAlpha = 0.3 * muscleFlex;
        highlightPoints.forEach(point => {
            const px = bodyX + this.width * point.x;
            const py = bodyY + this.height * point.y;

            const highlightGlow = ctx.createRadialGradient(px, py, 0, px, py, 10);
            highlightGlow.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            highlightGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = highlightGlow;
            ctx.beginPath();
            ctx.arc(px, py, 10, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    renderSpineSpikes(ctx, bodyX, bodyY, renderY) {
        ctx.save();

        const numSpikes = 5;
        const spikeSpacing = this.height / (numSpikes + 1);

        for (let i = 0; i < numSpikes; i++) {
            const spikeY = bodyY + spikeSpacing * (i + 1);
            const spikeLength = 8 + Math.sin(this.animationTime * 3 + i) * 2;
            const spikeWidth = 4 + i * 0.3;

            // 脊柱刺突渐变
            const spikeGradient = ctx.createLinearGradient(
                bodyX + this.width, spikeY,
                bodyX + this.width + spikeLength, spikeY
            );
            spikeGradient.addColorStop(0, this.colorScheme.primary);
            spikeGradient.addColorStop(0.5, this.colorScheme.highlight);
            spikeGradient.addColorStop(1, this.colorScheme.energy);

            ctx.fillStyle = spikeGradient;
            ctx.beginPath();
            ctx.moveTo(bodyX + this.width, spikeY - spikeWidth);
            ctx.lineTo(bodyX + this.width + spikeLength, spikeY);
            ctx.lineTo(bodyX + this.width, spikeY + spikeWidth);
            ctx.closePath();
            ctx.fill();

            // 刺突发光
            ctx.strokeStyle = this.colorScheme.energy;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5 + Math.sin(this.animationTime * 4 + i) * 0.3;
            ctx.shadowColor = this.colorScheme.energy;
            ctx.shadowBlur = 5;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    renderBattleScars(ctx, bodyX, bodyY) {
        ctx.save();

        const scarGlow = 0.5 + Math.sin(this.scarGlowPhase) * 0.3;

        this.scars.forEach(scar => {
            const scarX = bodyX + scar.x * this.width;
            const scarY = bodyY + scar.y * this.height;
            const scarLength = scar.length * this.width;

            ctx.save();
            ctx.translate(scarX, scarY);
            ctx.rotate(scar.angle);

            // 伤疤阴影
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.moveTo(-scarLength / 2, -scar.width / 2);
            ctx.lineTo(scarLength / 2, -scar.width / 2);
            ctx.lineTo(scarLength / 2, scar.width / 2);
            ctx.lineTo(-scarLength / 2, scar.width / 2);
            ctx.closePath();
            ctx.fill();

            // 伤疤主体
            const scarGradient = ctx.createLinearGradient(-scarLength / 2, 0, scarLength / 2, 0);
            scarGradient.addColorStop(0, this.colorScheme.dark);
            scarGradient.addColorStop(0.5, this.colorScheme.scar);
            scarGradient.addColorStop(1, this.colorScheme.dark);

            ctx.fillStyle = scarGradient;
            ctx.beginPath();
            ctx.moveTo(-scarLength / 2, -scar.width / 2 + 1);
            ctx.lineTo(scarLength / 2, -scar.width / 2 + 1);
            ctx.lineTo(scarLength / 2, scar.width / 2 - 1);
            ctx.lineTo(-scarLength / 2, scar.width / 2 - 1);
            ctx.closePath();
            ctx.fill();

            // 伤疤发光（深度越大发光越强）
            if (scar.depth > 0.5) {
                ctx.strokeStyle = this.colorScheme.energy;
                ctx.lineWidth = 1;
                ctx.globalAlpha = scarGlow * scar.depth;
                ctx.shadowColor = this.colorScheme.energy;
                ctx.shadowBlur = 8;
                ctx.stroke();
            }

            ctx.restore();
        });

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    renderCracks(ctx, bodyX, bodyY) {
        ctx.save();

        // 裂纹只在血量低于70%时显示
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent > 0.7) {
            ctx.restore();
            return;
        }

        const crackIntensity = 1 - healthPercent / 0.7; // 0-1, 血量越低越明显

        this.cracks.forEach(crack => {
            let currentX = bodyX + crack.startX * this.width;
            let currentY = bodyY + crack.startY * this.height;

            ctx.strokeStyle = this.colorScheme.energy;
            ctx.globalAlpha = crackIntensity * crack.glowIntensity * 0.8;
            ctx.shadowColor = this.colorScheme.energy;
            ctx.shadowBlur = 5;

            crack.segments.forEach((segment, index) => {
                const nextX = currentX + segment.dx * this.width;
                const nextY = currentY + segment.dy * this.height;

                ctx.lineWidth = segment.width * crackIntensity;
                ctx.beginPath();
                ctx.moveTo(currentX, currentY);
                ctx.lineTo(nextX, nextY);
                ctx.stroke();

                currentX = nextX;
                currentY = nextY;
            });

            ctx.shadowBlur = 0;
        });

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    renderEnergyLeaks(ctx, bodyX, bodyY) {
        ctx.save();

        // 能量泄漏在血量低于50%时更明显
        const healthPercent = this.health / this.maxHealth;
        const leakIntensity = healthPercent < 0.5 ? (1 - healthPercent / 0.5) * 2 : 0.3;

        this.energyLeaks.forEach(leak => {
            const leakX = bodyX + leak.x * this.width;
            const leakY = bodyY + leak.y * this.height;
            const pulse = Math.sin(leak.phase) * 0.5 + 0.5;

            // 能量泄漏光晕
            const leakGlow = ctx.createRadialGradient(
                leakX, leakY, 0,
                leakX, leakY, 15 * leak.intensity
            );
            const alpha1 = Math.min(1, pulse * leakIntensity * 0.8);
            const alpha2 = Math.min(1, pulse * leakIntensity * 0.4);
            leakGlow.addColorStop(0, this.hexToRgba(this.colorScheme.energy, alpha1));
            leakGlow.addColorStop(0.5, this.hexToRgba(this.colorScheme.energy, alpha2));
            leakGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = leakGlow;
            ctx.beginPath();
            ctx.arc(leakX, leakY, 15 * leak.intensity, 0, Math.PI * 2);
            ctx.fill();

            // 能量粒子
            for (let i = 0; i < 3; i++) {
                const angle = leak.phase + (i / 3) * Math.PI * 2;
                const dist = 5 + pulse * 10;
                const px = leakX + Math.cos(angle) * dist;
                const py = leakY + Math.sin(angle) * dist;

                ctx.fillStyle = this.colorScheme.energy;
                ctx.globalAlpha = pulse * leakIntensity * 0.8;
                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        ctx.globalAlpha = 1;
        ctx.restore();
    }
    
    renderHead3D(ctx, renderY) {
        ctx.save();

        const headX = this.x + this.direction.x * (this.width / 2 + 15);
        const headY = renderY + this.direction.y * (this.height / 2 + 15) + Math.sin(this.breathPhase) * 2;
        const headSize = 22 + Math.sin(this.animationTime * 2) * 1;

        // 头部阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(headX + 3, headY + 3, headSize, headSize * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        // 头部外发光
        const headGlow = ctx.createRadialGradient(headX, headY, headSize * 0.3, headX, headY, headSize * 1.8);
        headGlow.addColorStop(0, `${this.colorScheme.energy}44`);
        headGlow.addColorStop(0.5, `${this.colorScheme.accent}22`);
        headGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.arc(headX, headY, headSize * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // 绘制锋利的头部轮廓（菱形/三角形）
        ctx.save();
        ctx.translate(headX, headY);
        
        // 头部主体渐变
        const headGradient = ctx.createRadialGradient(-headSize * 0.2, -headSize * 0.2, 0, 0, 0, headSize);
        headGradient.addColorStop(0, this.colorScheme.highlight);
        headGradient.addColorStop(0.4, this.colorScheme.primary);
        headGradient.addColorStop(1, this.colorScheme.secondary);

        // 锋利的头部形状
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        // 上部尖锐
        ctx.moveTo(0, -headSize);
        // 右侧轮廓
        ctx.lineTo(headSize * 0.7, -headSize * 0.3);
        ctx.lineTo(headSize * 0.8, headSize * 0.2);
        // 下颚
        ctx.lineTo(headSize * 0.3, headSize * 0.6);
        ctx.lineTo(0, headSize * 0.8);
        ctx.lineTo(-headSize * 0.3, headSize * 0.6);
        // 左侧轮廓
        ctx.lineTo(-headSize * 0.8, headSize * 0.2);
        ctx.lineTo(-headSize * 0.7, -headSize * 0.3);
        ctx.closePath();
        ctx.fill();

        // 头部高光
        const highlightGradient = ctx.createLinearGradient(-headSize, -headSize, headSize, headSize);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
        highlightGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        ctx.fillStyle = highlightGradient;
        ctx.fill();

        // 头部边框
        ctx.strokeStyle = this.colorScheme.highlight;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.colorScheme.energy;
        ctx.shadowBlur = 8 * this.glowIntensity;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.restore();

        // 渲染双角
        this.renderHorns(ctx, headX, headY, headSize);

        // 渲染眼睛（发光竖瞳）
        this.renderIntimidatingEyes(ctx, headX, headY, headSize);

        // 渲染尖牙
        this.renderFangs(ctx, headX, headY, headSize);

        // 渲染下颚尖刺
        this.renderJawSpikes(ctx, headX, headY, headSize);

        ctx.restore();
    }

    renderHorns(ctx, headX, headY, headSize) {
        ctx.save();

        const hornLength = headSize * 1.2;
        const hornGlow = 0.5 + Math.sin(this.hornGlowPhase) * 0.3;

        // 左角
        ctx.save();
        ctx.translate(headX - headSize * 0.5, headY - headSize * 0.6);
        ctx.rotate(-Math.PI / 6);

        const leftHornGradient = ctx.createLinearGradient(0, 0, 0, -hornLength);
        leftHornGradient.addColorStop(0, this.colorScheme.secondary);
        leftHornGradient.addColorStop(0.5, this.colorScheme.primary);
        leftHornGradient.addColorStop(1, this.colorScheme.highlight);

        ctx.fillStyle = leftHornGradient;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(0, -hornLength);
        ctx.lineTo(4, 0);
        ctx.closePath();
        ctx.fill();

        // 角的发光效果
        ctx.strokeStyle = this.colorScheme.energy;
        ctx.lineWidth = 1;
        ctx.globalAlpha = hornGlow;
        ctx.shadowColor = this.colorScheme.energy;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        // 右角
        ctx.save();
        ctx.translate(headX + headSize * 0.5, headY - headSize * 0.6);
        ctx.rotate(Math.PI / 6);

        const rightHornGradient = ctx.createLinearGradient(0, 0, 0, -hornLength);
        rightHornGradient.addColorStop(0, this.colorScheme.secondary);
        rightHornGradient.addColorStop(0.5, this.colorScheme.primary);
        rightHornGradient.addColorStop(1, this.colorScheme.highlight);

        ctx.fillStyle = rightHornGradient;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(0, -hornLength);
        ctx.lineTo(4, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = this.colorScheme.energy;
        ctx.lineWidth = 1;
        ctx.globalAlpha = hornGlow;
        ctx.shadowColor = this.colorScheme.energy;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }

    renderIntimidatingEyes(ctx, headX, headY, headSize) {
        ctx.save();

        const eyeOffset = headSize * 0.35;
        const eyeY = headY - headSize * 0.15;
        const eyeGlow = this.eyeGlowIntensity * (this.isEnraged ? 1.5 : 1);

        // 眉骨阴影（愤怒表情）
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.moveTo(headX - headSize * 0.6, eyeY - headSize * 0.3);
        ctx.lineTo(headX - headSize * 0.2, eyeY - headSize * 0.5);
        ctx.lineTo(headX + headSize * 0.2, eyeY - headSize * 0.5);
        ctx.lineTo(headX + headSize * 0.6, eyeY - headSize * 0.3);
        ctx.lineTo(headX + headSize * 0.5, eyeY - headSize * 0.2);
        ctx.lineTo(headX - headSize * 0.5, eyeY - headSize * 0.2);
        ctx.closePath();
        ctx.fill();

        // 左眼
        this.renderSingleEye(ctx, headX - eyeOffset, eyeY, eyeGlow, -1);
        // 右眼
        this.renderSingleEye(ctx, headX + eyeOffset, eyeY, eyeGlow, 1);

        ctx.restore();
    }

    renderSingleEye(ctx, x, y, glowIntensity, direction) {
        ctx.save();

        const eyeWidth = 8;
        const eyeHeight = 6;

        // 眼眶阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(x, y, eyeWidth + 2, eyeHeight + 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼白（略带颜色）
        const eyeWhiteGradient = ctx.createRadialGradient(x, y, 0, x, y, eyeWidth);
        eyeWhiteGradient.addColorStop(0, '#ffffff');
        eyeWhiteGradient.addColorStop(0.7, '#f0f0f0');
        eyeWhiteGradient.addColorStop(1, '#d0d0d0');
        ctx.fillStyle = eyeWhiteGradient;
        ctx.beginPath();
        ctx.ellipse(x, y, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        // 发光的竖瞳
        const pupilWidth = 3;
        const pupilHeight = eyeHeight * 1.4;
        const pupilOffsetX = this.direction.x * 2 * direction;
        const pupilOffsetY = this.direction.y * 1.5;

        // 瞳孔外发光
        ctx.shadowColor = this.colorScheme.eye;
        ctx.shadowBlur = 15 * glowIntensity;
        
        // 竖瞳
        const pupilGradient = ctx.createLinearGradient(x + pupilOffsetX, y + pupilOffsetY - pupilHeight, 
                                                        x + pupilOffsetX, y + pupilOffsetY + pupilHeight);
        pupilGradient.addColorStop(0, this.colorScheme.eye);
        pupilGradient.addColorStop(0.5, this.colorScheme.energy);
        pupilGradient.addColorStop(1, this.colorScheme.eye);
        
        ctx.fillStyle = pupilGradient;
        ctx.beginPath();
        ctx.ellipse(x + pupilOffsetX, y + pupilOffsetY, pupilWidth, pupilHeight, 0, 0, Math.PI * 2);
        ctx.fill();

        // 瞳孔中心高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.ellipse(x + pupilOffsetX - 1, y + pupilOffsetY - pupilHeight * 0.3, 1.5, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 眼睛锁定效果（追踪线）
        if (this.gameManager.player && this.eyeLockIntensity > 0.5) {
            const player = this.gameManager.player;
            const dx = player.x - x;
            const dy = player.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            ctx.strokeStyle = this.colorScheme.eye;
            ctx.globalAlpha = 0.3 * this.eyeLockIntensity;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(x + pupilOffsetX, y + pupilOffsetY);
            ctx.lineTo(x + (dx / dist) * 30, y + (dy / dist) * 30);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    renderFangs(ctx, headX, headY, headSize) {
        ctx.save();

        const fangY = headY + headSize * 0.4;
        const mouthOpen = Math.sin(this.breathPhase * 0.5) * 2 + 2;

        // 上排尖牙
        const upperFangs = [
            { x: headX - headSize * 0.3, size: 6 + Math.random() * 2 },
            { x: headX - headSize * 0.1, size: 8 + Math.random() * 2 },
            { x: headX + headSize * 0.1, size: 8 + Math.random() * 2 },
            { x: headX + headSize * 0.3, size: 6 + Math.random() * 2 }
        ];

        upperFangs.forEach(fang => {
            const fangGradient = ctx.createLinearGradient(fang.x, fangY, fang.x, fangY + fang.size + mouthOpen);
            fangGradient.addColorStop(0, '#ffffff');
            fangGradient.addColorStop(0.5, '#f0f0f0');
            fangGradient.addColorStop(1, '#cccccc');

            ctx.fillStyle = fangGradient;
            ctx.beginPath();
            ctx.moveTo(fang.x - 2, fangY);
            ctx.lineTo(fang.x, fangY + fang.size + mouthOpen);
            ctx.lineTo(fang.x + 2, fangY);
            ctx.closePath();
            ctx.fill();

            // 尖牙高光
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // 下排尖牙（较小）
        const lowerFangs = [
            { x: headX - headSize * 0.2, size: 4 },
            { x: headX, size: 5 },
            { x: headX + headSize * 0.2, size: 4 }
        ];

        lowerFangs.forEach(fang => {
            const fangGradient = ctx.createLinearGradient(fang.x, fangY + mouthOpen, fang.x, fangY + mouthOpen - fang.size);
            fangGradient.addColorStop(0, '#ffffff');
            fangGradient.addColorStop(1, '#dddddd');

            ctx.fillStyle = fangGradient;
            ctx.beginPath();
            ctx.moveTo(fang.x - 1.5, fangY + mouthOpen);
            ctx.lineTo(fang.x, fangY + mouthOpen - fang.size);
            ctx.lineTo(fang.x + 1.5, fangY + mouthOpen);
            ctx.closePath();
            ctx.fill();
        });

        ctx.restore();
    }

    renderJawSpikes(ctx, headX, headY, headSize) {
        ctx.save();

        const jawY = headY + headSize * 0.5;

        // 下颚两侧的尖刺
        const jawSpikes = [
            { x: headX - headSize * 0.7, angle: -Math.PI / 4, size: 8 },
            { x: headX + headSize * 0.7, angle: Math.PI / 4, size: 8 }
        ];

        jawSpikes.forEach(spike => {
            ctx.save();
            ctx.translate(spike.x, jawY);
            ctx.rotate(spike.angle);

            const spikeGradient = ctx.createLinearGradient(0, 0, 0, -spike.size);
            spikeGradient.addColorStop(0, this.colorScheme.secondary);
            spikeGradient.addColorStop(1, this.colorScheme.highlight);

            ctx.fillStyle = spikeGradient;
            ctx.beginPath();
            ctx.moveTo(-2, 0);
            ctx.lineTo(0, -spike.size);
            ctx.lineTo(2, 0);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = this.colorScheme.energy;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            ctx.stroke();

            ctx.restore();
        });

        ctx.restore();
    }
    
    renderAura(ctx, renderY) {
        ctx.save();

        // 威慑性光环 - 多层脉冲
        const numAuraLayers = 3;
        for (let layer = 0; layer < numAuraLayers; layer++) {
            const layerDelay = layer * 0.3;
            const layerPulse = (Math.sin(this.animationTime * 2 + layerDelay) + 1) / 2;
            const auraSize = this.width * (0.7 + layer * 0.15) + layerPulse * 15;

            const auraGradient = ctx.createRadialGradient(
                this.x, renderY, auraSize * 0.3,
                this.x, renderY, auraSize
            );

            const alpha = (0.15 - layer * 0.03) * this.intimidationPulse;
            const clampedAlpha = Math.max(0, Math.min(1, alpha));
            const clampedAlpha2 = Math.max(0, Math.min(1, alpha * 0.5));
            auraGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            auraGradient.addColorStop(0.6, this.hexToRgba(this.colorScheme.energy, clampedAlpha));
            auraGradient.addColorStop(0.8, this.hexToRgba(this.colorScheme.accent, clampedAlpha2));
            auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = auraGradient;
            ctx.beginPath();
            ctx.arc(this.x, renderY, auraSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // 威慑波纹
        if (this.isEnraged) {
            const waveCount = 2;
            for (let i = 0; i < waveCount; i++) {
                const waveProgress = ((this.animationTime * 0.5 + i / waveCount) % 1);
                const waveRadius = this.width * 0.5 + waveProgress * this.width;
                const waveAlpha = (1 - waveProgress) * 0.3;

                ctx.strokeStyle = this.colorScheme.energy;
                ctx.globalAlpha = waveAlpha;
                ctx.lineWidth = 3 - waveProgress * 2;
                ctx.shadowColor = this.colorScheme.energy;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(this.x, renderY, waveRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }
    
    renderShield(ctx, renderY) {
        if (this.shield && this.shield.health > 0) {
            ctx.save();
            
            const shieldPercent = this.shield.health / this.shield.maxHealth;
            const shieldRadius = this.width * 0.8;
            
            // 护盾外发光
            ctx.strokeStyle = `rgba(52, 152, 219, ${0.3 + shieldPercent * 0.3})`;
            ctx.lineWidth = 8;
            ctx.shadowColor = '#3498db';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(this.x, renderY, shieldRadius + 5, 0, Math.PI * 2);
            ctx.stroke();
            
            // 护盾主体
            ctx.strokeStyle = `rgba(52, 152, 219, ${0.5 + shieldPercent * 0.5})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x, renderY, shieldRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // 护盾能量线
            const energyLines = 8;
            ctx.strokeStyle = `rgba(52, 152, 219, ${shieldPercent * 0.8})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < energyLines; i++) {
                const angle = (i / energyLines) * Math.PI * 2 + this.animationTime;
                const innerRadius = shieldRadius * 0.7;
                const outerRadius = shieldRadius;
                
                ctx.beginPath();
                ctx.moveTo(
                    this.x + Math.cos(angle) * innerRadius,
                    renderY + Math.sin(angle) * innerRadius
                );
                ctx.lineTo(
                    this.x + Math.cos(angle) * outerRadius,
                    renderY + Math.sin(angle) * outerRadius
                );
                ctx.stroke();
            }
            
            ctx.shadowBlur = 0;
            ctx.restore();
        }
    }
    
    renderHealthBar(ctx, renderY) {
        ctx.save();

        const barWidth = 240;
        const barHeight = 28;
        const barX = this.x - barWidth / 2;
        const barY = renderY - this.height / 2 - 55;

        // 血条背景阴影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(barX - 5, barY - 5, barWidth + 10, barHeight + 10);

        // 血条背景 - 更暗的底色
        const bgGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
        bgGradient.addColorStop(0, '#1a1a1a');
        bgGradient.addColorStop(0.5, '#0d0d0d');
        bgGradient.addColorStop(1, '#1a1a1a');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // 血量渐变 - 更鲜艳的颜色
        const healthPercent = this.health / this.maxHealth;
        const healthGradient = ctx.createLinearGradient(barX, barY, barX + barWidth * healthPercent, barY);

        if (healthPercent > 0.5) {
            healthGradient.addColorStop(0, '#00ff00');
            healthGradient.addColorStop(0.3, '#00cc00');
            healthGradient.addColorStop(0.7, '#009900');
            healthGradient.addColorStop(1, '#006600');
        } else if (healthPercent > 0.25) {
            healthGradient.addColorStop(0, '#ffaa00');
            healthGradient.addColorStop(0.3, '#ff8800');
            healthGradient.addColorStop(0.7, '#ff6600');
            healthGradient.addColorStop(1, '#cc4400');
        } else {
            healthGradient.addColorStop(0, '#ff0000');
            healthGradient.addColorStop(0.3, '#cc0000');
            healthGradient.addColorStop(0.7, '#990000');
            healthGradient.addColorStop(1, '#660000');
        }

        ctx.fillStyle = healthGradient;
        ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * healthPercent, barHeight - 4);

        // 血条脉动效果（低血量时）
        if (healthPercent < 0.3) {
            const pulseAlpha = Math.sin(this.animationTime * 8) * 0.3 + 0.3;
            ctx.fillStyle = `rgba(255, 0, 0, ${pulseAlpha})`;
            ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * healthPercent, barHeight - 4);
        }

        // 血条高光
        const highlightGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight * 0.5);
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlightGradient;
        ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * healthPercent, (barHeight - 4) * 0.5);

        // 血条边框 - 发光效果
        ctx.strokeStyle = this.colorScheme.energy;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.colorScheme.energy;
        ctx.shadowBlur = 10;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        ctx.shadowBlur = 0;

        // BOSS名称 - 更大更醒目
        ctx.fillStyle = this.colorScheme.energy;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = this.colorScheme.dark;
        ctx.shadowBlur = 5;
        ctx.fillText(`${this.emoji} ${this.name}`, this.x, barY - 10);
        ctx.shadowBlur = 0;

        // 血量数字 - 带发光效果
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Arial';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.fillText(`${Math.ceil(this.health)} / ${this.maxHealth}`, this.x, barY + 18);
        ctx.shadowBlur = 0;

        // 狂暴状态指示
        if (this.isEnraged) {
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 12px Arial';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 8;
            ctx.fillText('ENRAGED!', this.x, barY + barHeight + 15);
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }
    
    renderPhaseIndicator(ctx, renderY) {
        ctx.save();

        const indicatorX = this.x - 40;
        const indicatorY = renderY - this.height / 2 - 80;

        // 阶段背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.roundRect(indicatorX - 10, indicatorY - 12, 90, 24, 5);
        ctx.fill();

        for (let i = 1; i <= this.maxPhase; i++) {
            const isActive = i <= this.phase;
            const isCurrent = i === this.phase;
            const pulse = isActive ? 0.8 + Math.sin(this.animationTime * 3 + i) * 0.2 : 0.4;

            // 阶段指示器外发光
            if (isActive) {
                const glowColor = isCurrent ? this.colorScheme.energy : this.colorScheme.accent;
                ctx.fillStyle = glowColor;
                ctx.globalAlpha = 0.4 * pulse;
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(indicatorX + (i - 1) * 28, indicatorY, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // 阶段指示器主体
            ctx.globalAlpha = pulse;
            
            if (isActive) {
                // 激活状态 - 渐变填充
                const phaseGradient = ctx.createRadialGradient(
                    indicatorX + (i - 1) * 28, indicatorY, 0,
                    indicatorX + (i - 1) * 28, indicatorY, 8
                );
                phaseGradient.addColorStop(0, this.colorScheme.energy);
                phaseGradient.addColorStop(0.7, this.colorScheme.accent);
                phaseGradient.addColorStop(1, this.colorScheme.primary);
                ctx.fillStyle = phaseGradient;
            } else {
                ctx.fillStyle = '#333';
            }

            ctx.strokeStyle = isActive ? this.colorScheme.energy : '#555';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(indicatorX + (i - 1) * 28, indicatorY, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 阶段数字
            ctx.fillStyle = isActive ? '#fff' : '#666';
            ctx.globalAlpha = 1;
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i.toString(), indicatorX + (i - 1) * 28, indicatorY);
        }

        ctx.restore();
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
