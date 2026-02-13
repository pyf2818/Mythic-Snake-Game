/**
 * 玩家子弹类 - 玩家蛇发射的子弹
 */
class PlayerBullet {
    constructor(gameManager, x, y, dx, dy, config = {}) {
        this.gameManager = gameManager;
        this.x = x;
        this.y = y;
        this.width = config.size || 16;
        this.height = config.size || 16;
        this.type = 'player_bullet';
        this.speed = config.speed || 10;
        this.direction = { x: dx, y: dy };
        this.color = config.color || '#00ffff';
        this.collider = true;
        this.lifetime = config.lifetime || 5;
        this.damage = config.damage || 9999;
        this.id = Math.random().toString(36).substr(2, 9);
        this.ownerId = config.ownerId || null;
        
        this.trail = [];
        this.maxTrailLength = 15;
        this.glowIntensity = 1;
        this.pulsePhase = 0;
        this.rotationAngle = 0;
    }
    
    update(deltaTime) {
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.gameManager.removeGameObject(this);
            return;
        }
        
        this.trail.unshift({ x: this.x, y: this.y, time: Date.now() });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
        
        // 移动子弹
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;
        
        // 更新脉冲效果
        this.pulsePhase += deltaTime * 15;
        this.glowIntensity = 0.6 + Math.sin(this.pulsePhase) * 0.4;
        
        // 更新旋转角度
        this.rotationAngle += deltaTime * 5;
        
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
        
        // 绘制轨迹 - 渐变拖尾效果
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length - 1; i++) {
                const point = this.trail[i];
                const nextPoint = this.trail[i + 1];
                const progress = i / this.trail.length;
                const alpha = (1 - progress) * 0.8;
                const size = this.width * (1 - progress * 0.7);
                
                // 绘制轨迹线段
                renderCtx.strokeStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
                renderCtx.lineWidth = size * 0.6;
                renderCtx.lineCap = 'round';
                renderCtx.beginPath();
                renderCtx.moveTo(point.x, point.y);
                renderCtx.lineTo(nextPoint.x, nextPoint.y);
                renderCtx.stroke();
            }
        }
        
        // 绘制外层大发光效果
        const outerGlowSize = this.width * 2.5 * this.glowIntensity;
        const outerGlowGradient = renderCtx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, outerGlowSize
        );
        outerGlowGradient.addColorStop(0, this.color + 'cc');
        outerGlowGradient.addColorStop(0.3, this.color + '66');
        outerGlowGradient.addColorStop(0.6, this.color + '33');
        outerGlowGradient.addColorStop(1, this.color + '00');
        
        renderCtx.fillStyle = outerGlowGradient;
        renderCtx.beginPath();
        renderCtx.arc(this.x, this.y, outerGlowSize, 0, Math.PI * 2);
        renderCtx.fill();
        
        // 绘制内层发光效果
        const innerGlowSize = this.width * 1.5;
        const innerGlowGradient = renderCtx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, innerGlowSize
        );
        innerGlowGradient.addColorStop(0, '#ffffff');
        innerGlowGradient.addColorStop(0.3, this.color + 'ee');
        innerGlowGradient.addColorStop(1, this.color + '00');
        
        renderCtx.fillStyle = innerGlowGradient;
        renderCtx.beginPath();
        renderCtx.arc(this.x, this.y, innerGlowSize, 0, Math.PI * 2);
        renderCtx.fill();
        
        // 绘制子弹主体 - 带旋转效果
        renderCtx.save();
        renderCtx.translate(this.x, this.y);
        renderCtx.rotate(this.rotationAngle);
        
        // 绘制星形子弹
        renderCtx.fillStyle = this.color;
        renderCtx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const radius = this.width / 2;
            const innerRadius = radius * 0.5;
            
            if (i === 0) {
                renderCtx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            } else {
                renderCtx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }
            
            const innerAngle = angle + Math.PI / 6;
            renderCtx.lineTo(Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius);
        }
        renderCtx.closePath();
        renderCtx.fill();
        
        renderCtx.restore();
        
        // 绘制边框
        renderCtx.strokeStyle = '#ffffff';
        renderCtx.lineWidth = 2;
        renderCtx.beginPath();
        renderCtx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        renderCtx.stroke();
        
        // 绘制中心亮点
        renderCtx.fillStyle = '#ffffff';
        renderCtx.beginPath();
        renderCtx.arc(this.x, this.y, this.width / 4, 0, Math.PI * 2);
        renderCtx.fill();
        
        // 绘制闪烁效果
        if (Math.sin(Date.now() * 0.02) > 0) {
            renderCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            renderCtx.beginPath();
            renderCtx.arc(this.x, this.y, this.width / 6, 0, Math.PI * 2);
            renderCtx.fill();
        }
    }
    
    /**
     * 处理碰撞
     * @param {Object} other - 碰撞的对象
     */
    onCollision(other) {
        // 不对自己造成伤害
        if (other.type === 'snake' && other.isPlayer) {
            return;
        }
        
        // 击中BOSS - 造成适中伤害
        if (other.type === 'boss' || other.isBoss) {
            this.damageBoss(other);
            return;
        }
        
        // 击中敌人 - 一击毙命
        if (other.type === 'enemy') {
            this.killTarget(other);
        }
        
        // 击中敌对蛇 - 一击毙命
        if (other.type === 'snake' && !other.isPlayer) {
            this.killTarget(other);
        }
    }
    
    /**
     * 对BOSS造成伤害
     * @param {Object} boss - BOSS对象
     */
    damageBoss(boss) {
        // 移除子弹
        this.gameManager.removeGameObject(this);
        
        // 播放命中音效
        if (this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playSound('bulletHit');
        }
        
        // 创建命中特效
        this.createHitEffect();
        
        // 计算伤害：BOSS最大生命值的20%
        const damagePercent = 0.20;
        const damage = Math.floor(boss.maxHealth * damagePercent);
        
        // 对BOSS造成伤害
        boss.takeDamage(damage);
        
        // 显示伤害通知
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `💥 对 ${boss.name} 造成 ${damage} 点伤害！`,
                '#f39c12',
                'warning',
                1
            );
        }
        
        // 屏幕震动效果
        if (this.gameManager.systems.renderer) {
            this.gameManager.systems.renderer.addScreenShake(5, 0.2);
        }
    }
    
    /**
     * 一击毙命目标
     * @param {Object} target - 目标对象
     */
    killTarget(target) {
        // 移除子弹
        this.gameManager.removeGameObject(this);
        
        // 播放命中音效
        if (this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playSound('bulletHit');
        }
        
        // 创建命中特效
        this.createHitEffect();
        
        // 一击毙命 - 直接杀死目标
        if (target.type === 'enemy') {
            // 敌人直接死亡
            target.health = 0;
            target.die();
            
            // 显示击杀通知
            if (this.gameManager.systems.notificationManager) {
                this.gameManager.systems.notificationManager.showNotification(
                    `💀 一击毙命！击杀 ${target.getEnemyTypeName()}`,
                    '#ff0000',
                    'success',
                    1
                );
            }
        } else if (target.type === 'snake' && !target.isPlayer) {
            // 敌对蛇直接死亡
            target.alive = false;
            this.gameManager.removeGameObject(target);
            
            // 显示击杀通知
            if (this.gameManager.systems.notificationManager) {
                this.gameManager.systems.notificationManager.showNotification(
                    `💀 一击毙命！击杀敌对蛇`,
                    '#ff0000',
                    'success',
                    1
                );
            }
        }
        
        // 更新统计
        if (this.gameManager.systems.bulletSystem) {
            this.gameManager.systems.bulletSystem.totalHits++;
        }
    }
    
    /**
     * 创建命中特效 - 增强版
     */
    createHitEffect() {
        // 添加大量粒子特效
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2 + Math.random() * 0.5;
            const speed = Math.random() * 6 + 3;
            
            if (this.gameManager.systems.renderer) {
                this.gameManager.systems.renderer.addParticle({
                    x: this.x,
                    y: this.y,
                    size: Math.random() * 6 + 3,
                    color: this.color,
                    velocity: {
                        x: Math.cos(angle) * speed,
                        y: Math.sin(angle) * speed
                    },
                    lifetime: 0.8,
                    opacity: 1
                });
            }
        }
        
        // 添加白色闪光粒子
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            
            if (this.gameManager.systems.renderer) {
                this.gameManager.systems.renderer.addParticle({
                    x: this.x,
                    y: this.y,
                    size: Math.random() * 4 + 2,
                    color: '#ffffff',
                    velocity: {
                        x: Math.cos(angle) * speed,
                        y: Math.sin(angle) * speed
                    },
                    lifetime: 0.5,
                    opacity: 1
                });
            }
        }
    }
    
    /**
     * 序列化子弹状态
     * @returns {Object} 序列化数据
     */
    serialize() {
        return {
            x: this.x,
            y: this.y,
            type: this.type,
            speed: this.speed,
            direction: this.direction,
            color: this.color,
            lifetime: this.lifetime,
            damage: this.damage
        };
    }
}

/**
 * 爆炸子弹类 - 造成范围伤害
 */
class ExplosiveBullet extends PlayerBullet {
    constructor(gameManager, x, y, dx, dy, config = {}) {
        super(gameManager, x, y, dx, dy, config);
        this.radius = config.radius || 60;
        this.type = 'explosive_bullet';
    }
    
    update(deltaTime) {
        super.update(deltaTime);
    }
    
    onHit(target) {
        this.explode();
        this.gameManager.removeGameObject(this);
    }
    
    explode() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // 对范围内敌人造成伤害
        this.gameManager.gameObjects.forEach(obj => {
            if (obj.type === 'enemy' || obj.type === 'boss' || obj.type === 'ai_snake') {
                const dist = Math.sqrt((obj.x - centerX) ** 2 + (obj.y - centerY) ** 2);
                if (dist < this.radius) {
                    if (obj.takeDamage) {
                        obj.takeDamage(this.damage);
                    }
                }
            }
        });
        
        // 创建爆炸特效
        this.createExplosionEffect(centerX, centerY);
    }
    
    createExplosionEffect(x, y) {
        if (this.gameManager.systems.renderer) {
            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2;
                const speed = 3 + Math.random() * 5;
                this.gameManager.systems.renderer.addParticle({
                    x: x,
                    y: y,
                    size: 5 + Math.random() * 8,
                    color: '#ff6600',
                    velocity: {
                        x: Math.cos(angle) * speed,
                        y: Math.sin(angle) * speed
                    },
                    lifetime: 0.5,
                    opacity: 1
                });
            }
        }
    }
    
    render(ctx) {
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        
        // 绘制爆炸范围指示
        renderCtx.strokeStyle = '#ff6600';
        renderCtx.lineWidth = 2;
        renderCtx.beginPath();
        renderCtx.arc(this.x + this.width/2, this.y + this.height/2, this.radius * 0.3, 0, Math.PI * 2);
        renderCtx.stroke();
        
        super.render(renderCtx);
    }
}

/**
 * 穿透子弹类 - 可穿透多个敌人
 */
class PierceBullet extends PlayerBullet {
    constructor(gameManager, x, y, dx, dy, config = {}) {
        super(gameManager, x, y, dx, dy, config);
        this.pierceCount = config.pierceCount || 3;
        this.piercedTargets = [];
        this.type = 'pierce_bullet';
    }
    
    canHit(target) {
        return !this.piercedTargets.includes(target.id) && this.piercedTargets.length < this.pierceCount;
    }
    
    onHit(target) {
        this.piercedTargets.push(target.id);
        if (this.piercedTargets.length >= this.pierceCount) {
            this.gameManager.removeGameObject(this);
        }
    }
    
    render(ctx) {
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        
        // 穿透子弹有特殊颜色
        const gradient = renderCtx.createRadialGradient(
            this.x + this.width/2, this.y + this.height/2, 0,
            this.x + this.width/2, this.y + this.height/2, this.width
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, 'transparent');
        
        renderCtx.fillStyle = gradient;
        renderCtx.beginPath();
        renderCtx.arc(this.x + this.width/2, this.y + this.height/2, this.width, 0, Math.PI * 2);
        renderCtx.fill();
        
        super.render(renderCtx);
    }
}

/**
 * 追踪子弹类 - 自动追踪敌人
 */
class HomingBullet extends PlayerBullet {
    constructor(gameManager, x, y, config = {}) {
        super(gameManager, x, y, 0, 0, config);
        this.homingStrength = config.homingStrength || 0.05;
        this.target = null;
        this.type = 'homing_bullet';
        this.direction = { x: 1, y: 0 };
    }
    
    update(deltaTime) {
        // 找最近的敌人
        if (!this.target || !this.target.alive) {
            this.findTarget();
        }
        
        // 追踪目标
        if (this.target) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                const targetDirX = dx / dist;
                const targetDirY = dy / dist;
                
                this.direction.x += (targetDirX - this.direction.x) * this.homingStrength;
                this.direction.y += (targetDirY - this.direction.y) * this.homingStrength;
                
                // 归一化
                const len = Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2);
                this.direction.x /= len;
                this.direction.y /= len;
            }
        }
        
        super.update(deltaTime);
    }
    
    findTarget() {
        let nearestDist = 300;
        this.target = null;
        
        this.gameManager.gameObjects.forEach(obj => {
            if (obj.type === 'enemy' || obj.type === 'boss' || obj.type === 'ai_snake') {
                const dist = Math.sqrt((obj.x - this.x) ** 2 + (obj.y - this.y) ** 2);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    this.target = obj;
                }
            }
        });
    }
    
    render(ctx) {
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        
        // 追踪子弹有特殊轨迹
        renderCtx.strokeStyle = this.color;
        renderCtx.lineWidth = 3;
        renderCtx.beginPath();
        renderCtx.arc(this.x + this.width/2, this.y + this.height/2, this.width * 0.8, 0, Math.PI * 2);
        renderCtx.stroke();
        
        super.render(renderCtx);
    }
}

/**
 * 子弹系统类 - 管理玩家子弹的发射和更新
 */
class BulletSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        
        this.config = {
            fireRate: 2,
            bulletSpeed: 10,
            bulletDamage: 9999,
            bulletSize: 16,
            bulletColor: '#00ffff',
            bulletLifetime: 5,
            maxBullets: 50,
            autoFire: true,
            energyCost: 0.25
        };
        
        this.fireTimer = 0;
        this.fireInterval = 1 / this.config.fireRate;
        
        this.totalBulletsFired = 0;
        this.totalHits = 0;
        
        this.fireRateEnhancer = null;
        this.initFireRateEnhancer();
        
        // 特殊武器系统
        this.specialWeapon = null;
        this.specialWeaponCooldown = 0;
        this.specialWeaponTimer = 0;
    }
    
    initFireRateEnhancer() {
        if (window.FireRateEnhancer) {
            this.fireRateEnhancer = new FireRateEnhancer(this);
        }
    }
    
    setDifficultyMode(mode) {
        if (this.fireRateEnhancer) {
            this.fireRateEnhancer.setDifficultyMode(mode);
        }
    }
    
    setSpecialWeapon(weapon) {
        console.log(`=== setSpecialWeapon ===`);
        console.log(`Weapon: ${weapon ? weapon.name : 'null'}`);
        this.specialWeapon = weapon;
        this.specialWeaponCooldown = weapon ? weapon.weaponStats.cooldown : 0;
        this.specialWeaponTimer = 0;
        
        if (weapon) {
            this.showWeaponEquipEffect(weapon);
        }
    }
    
    showWeaponEquipEffect(weapon) {
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `${weapon.icon} 装备武器: ${weapon.name}`,
                weapon.rarity.color,
                'success',
                3
            );
        }
        
        if (this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playSound('equip');
        }
    }
    
    /**
     * 提升射速
     */
    increaseFireRate(amount, instant = false) {
        if (this.fireRateEnhancer) {
            this.fireRateEnhancer.increaseFireRate(amount, instant);
        }
    }
    
    update(deltaTime) {
        if (!this.config.autoFire) return;
        
        if (!this.gameManager.player || !this.gameManager.player.alive) return;
        
        if (this.fireRateEnhancer) {
            this.fireRateEnhancer.update(deltaTime);
        }
        
        // 更新特殊武器冷却
        if (this.specialWeapon) {
            this.specialWeaponTimer += deltaTime;
        }
        
        this.fireTimer += deltaTime;
        
        if (this.fireTimer >= this.fireInterval) {
            this.fireTimer = 0;
            this.fire();
        }
    }
    
    fire() {
        const player = this.gameManager.player;
        if (!player || !player.alive) return;
        
        // 检查是否使用特殊武器
        if (this.specialWeapon && this.specialWeaponTimer >= this.specialWeaponCooldown) {
            this.fireSpecialWeapon();
            this.specialWeaponTimer = 0;
            return;
        }
        
        if (player.energySystem && player.energySystem.energy < this.config.energyCost) {
            return;
        }
        
        if (player.energySystem) {
            player.energySystem.consume(this.config.energyCost);
        }
        
        const headX = player.x + player.width / 2;
        const headY = player.y + player.height / 2;
        
        const direction = player.direction;
        
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        const dx = length > 0 ? direction.x / length : 1;
        const dy = length > 0 ? direction.y / length : 0;
        
        let bulletColor = this.config.bulletColor;
        let bulletSize = this.config.bulletSize;
        let particleCount = 10;
        
        if (this.fireRateEnhancer) {
            const enhancerConfig = this.fireRateEnhancer.getBulletConfig();
            bulletColor = enhancerConfig.color;
            bulletSize = this.config.bulletSize * enhancerConfig.sizeMultiplier;
            particleCount = this.fireRateEnhancer.getParticleCount();
            this.fireRateEnhancer.onFire();
        }
        
        const spreadShot = this.config.spreadShot || 0;
        const multiShot = this.config.multiShot || 1;
        
        let bulletsToFire = [];
        
        if (spreadShot > 0) {
            const baseAngle = Math.atan2(dy, dx);
            const spreadAngle = Math.PI / 6;
            const startAngle = baseAngle - (spreadAngle * (spreadShot - 1) / 2);
            
            for (let i = 0; i < spreadShot; i++) {
                const angle = startAngle + spreadAngle * i;
                bulletsToFire.push({
                    dx: Math.cos(angle),
                    dy: Math.sin(angle)
                });
            }
        } else {
            for (let i = 0; i < multiShot; i++) {
                bulletsToFire.push({ dx, dy });
            }
        }
        
        bulletsToFire.forEach((bulletDir, index) => {
            let offsetX = 0;
            let offsetY = 0;
            if (multiShot > 1 && spreadShot === 0) {
                const offset = (index - (multiShot - 1) / 2) * 10;
                offsetX = -bulletDir.dy * offset;
                offsetY = bulletDir.dx * offset;
            }
            
            const bullet = new PlayerBullet(
                this.gameManager,
                headX + offsetX,
                headY + offsetY,
                bulletDir.dx,
                bulletDir.dy,
                {
                    speed: this.config.bulletSpeed,
                    damage: this.config.bulletDamage,
                    size: bulletSize,
                    color: bulletColor,
                    lifetime: this.config.bulletLifetime,
                    ownerId: player.id
                }
            );
            
            this.gameManager.addGameObject(bullet);
        });
        
        this.totalBulletsFired += bulletsToFire.length;
        
        if (this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playSound('bulletFire');
        }
        
        this.createFireEffect(headX, headY, dx, dy, bulletColor, particleCount);
    }
    
    fireSpecialWeapon() {
        const player = this.gameManager.player;
        if (!player || !player.alive) return;
        
        const weapon = this.specialWeapon;
        const stats = weapon.weaponStats;
        
        console.log(`Firing special weapon: ${weapon.name}, mode: ${stats.fireMode}`);
        
        const headX = player.x + player.width / 2;
        const headY = player.y + player.height / 2;
        const direction = player.direction;
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        const dx = length > 0 ? direction.x / length : 1;
        const dy = length > 0 ? direction.y / length : 0;
        
        switch (stats.fireMode) {
            case 'spread':
                this.fireSpreadWeapon(headX, headY, dx, dy, stats, weapon);
                break;
            case 'explosive':
                this.fireExplosiveWeapon(headX, headY, dx, dy, stats, weapon);
                break;
            case 'pierce':
                this.firePierceWeapon(headX, headY, dx, dy, stats, weapon);
                break;
            case 'homing':
                this.fireHomingWeapon(headX, headY, stats, weapon);
                break;
            case 'lightning':
                this.fireLightningWeapon(headX, headY, stats, weapon);
                break;
            default:
                this.fireSpreadWeapon(headX, headY, dx, dy, stats, weapon);
        }
        
        // 播放音效和特效
        if (this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playSound('specialWeapon');
        }
        
        // 显示武器名称
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `${weapon.icon} ${weapon.name}`,
                weapon.rarity.color,
                'success',
                1
            );
        }
    }
    
    fireSpreadWeapon(x, y, dx, dy, stats, weapon) {
        const projectileCount = stats.projectileCount || 5;
        const spreadAngle = stats.spreadAngle || Math.PI / 4;
        const baseAngle = Math.atan2(dy, dx);
        const startAngle = baseAngle - spreadAngle / 2;
        const angleStep = spreadAngle / (projectileCount - 1);
        
        for (let i = 0; i < projectileCount; i++) {
            const angle = startAngle + angleStep * i;
            const bullet = new PlayerBullet(
                this.gameManager,
                x, y,
                Math.cos(angle),
                Math.sin(angle),
                {
                    speed: stats.speed || 10,
                    damage: stats.damage,
                    size: 12,
                    color: weapon.rarity.color,
                    lifetime: 3,
                    ownerId: this.gameManager.player.id
                }
            );
            this.gameManager.addGameObject(bullet);
        }
        
        this.createFireEffect(x, y, dx, dy, weapon.rarity.color, 20);
    }
    
    fireExplosiveWeapon(x, y, dx, dy, stats, weapon) {
        const bullet = new ExplosiveBullet(
            this.gameManager,
            x, y,
            dx, dy,
            {
                speed: stats.speed || 8,
                damage: stats.damage,
                radius: stats.radius || 60,
                size: 20,
                color: '#ff6600',
                lifetime: 5,
                ownerId: this.gameManager.player.id
            }
        );
        this.gameManager.addGameObject(bullet);
        this.createFireEffect(x, y, dx, dy, '#ff6600', 15);
    }
    
    firePierceWeapon(x, y, dx, dy, stats, weapon) {
        const bullet = new PierceBullet(
            this.gameManager,
            x, y,
            dx, dy,
            {
                speed: stats.speed || 15,
                damage: stats.damage,
                pierceCount: stats.pierceCount || 3,
                size: 14,
                color: weapon.rarity.color,
                lifetime: 4,
                ownerId: this.gameManager.player.id
            }
        );
        this.gameManager.addGameObject(bullet);
        this.createFireEffect(x, y, dx, dy, weapon.rarity.color, 12);
    }
    
    fireHomingWeapon(x, y, stats, weapon) {
        const bullet = new HomingBullet(
            this.gameManager,
            x, y,
            {
                speed: stats.speed || 6,
                damage: stats.damage,
                homingStrength: stats.homingStrength || 0.05,
                size: 16,
                color: weapon.rarity.color,
                lifetime: 6,
                ownerId: this.gameManager.player.id
            }
        );
        this.gameManager.addGameObject(bullet);
        this.createFireEffect(x, y, 0, 0, weapon.rarity.color, 10);
    }
    
    fireLightningWeapon(x, y, stats, weapon) {
        // 找最近的敌人
        let nearestEnemy = null;
        let nearestDist = stats.range || 200;
        
        this.gameManager.gameObjects.forEach(obj => {
            if (obj.type === 'enemy' || obj.type === 'boss' || obj.type === 'ai_snake') {
                const dist = Math.sqrt((obj.x - x) ** 2 + (obj.y - y) ** 2);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestEnemy = obj;
                }
            }
        });
        
        if (nearestEnemy) {
            this.createLightningChain(x, y, nearestEnemy, stats.chainCount || 3, stats.damage, weapon.rarity.color);
        }
    }
    
    createLightningChain(x, y, target, chainCount, damage, color) {
        let currentTarget = target;
        let currentX = x;
        let currentY = y;
        let hitTargets = [];
        
        for (let i = 0; i < chainCount && currentTarget; i++) {
            // 对目标造成伤害
            if (currentTarget.takeDamage) {
                currentTarget.takeDamage(damage);
            }
            
            // 创建闪电效果
            this.createLightningEffect(currentX, currentY, currentTarget.x, currentTarget.y, color);
            
            hitTargets.push(currentTarget);
            currentX = currentTarget.x;
            currentY = currentTarget.y;
            
            // 找下一个目标
            currentTarget = null;
            let minDist = 150;
            
            this.gameManager.gameObjects.forEach(obj => {
                if ((obj.type === 'enemy' || obj.type === 'boss' || obj.type === 'ai_snake') && 
                    !hitTargets.includes(obj)) {
                    const dist = Math.sqrt((obj.x - currentX) ** 2 + (obj.y - currentY) ** 2);
                    if (dist < minDist) {
                        minDist = dist;
                        currentTarget = obj;
                    }
                }
            });
        }
    }
    
    createLightningEffect(x1, y1, x2, y2, color) {
        // 创建闪电粒子效果
        const steps = 10;
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const px = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
            const py = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
            
            if (this.gameManager.systems.renderer) {
                this.gameManager.systems.renderer.addParticle({
                    x: px,
                    y: py,
                    size: 8,
                    color: color,
                    velocity: { x: 0, y: 0 },
                    lifetime: 0.3,
                    opacity: 1
                });
            }
        }
    }
    
    /**
     * 创建发射特效
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} dx - X方向
     * @param {number} dy - Y方向
     * @param {string} color - 粒子颜色
     * @param {number} particleCount - 粒子数量
     */
    createFireEffect(x, y, dx, dy, color = this.config.bulletColor, particleCount = 10) {
        // 添加发射粒子特效
        for (let i = 0; i < particleCount; i++) {
            const spreadAngle = (Math.random() - 0.5) * 0.8;
            const angle = Math.atan2(dy, dx) + spreadAngle;
            const speed = Math.random() * 4 + 2;
            
            if (this.gameManager.systems.renderer) {
                this.gameManager.systems.renderer.addParticle({
                    x: x,
                    y: y,
                    size: Math.random() * 5 + 2,
                    color: color,
                    velocity: {
                        x: Math.cos(angle) * speed,
                        y: Math.sin(angle) * speed
                    },
                    lifetime: 0.4,
                    opacity: 1
                });
            }
        }
    }
    
    /**
     * 渲染射速UI
     */
    renderFireRateUI(ctx) {
        if (this.fireRateEnhancer && this.gameManager.player) {
            this.fireRateEnhancer.renderFireRateUI(
                ctx, 
                this.gameManager.player.x, 
                this.gameManager.player.y
            );
        }
    }
    
    /**
     * 设置发射频率
     * @param {number} rate - 每秒发射次数
     */
    setFireRate(rate) {
        this.config.fireRate = Math.max(0.1, Math.min(10, rate));
        this.fireInterval = 1 / this.config.fireRate;
    }
    
    /**
     * 设置子弹速度
     * @param {number} speed - 子弹速度
     */
    setBulletSpeed(speed) {
        this.config.bulletSpeed = Math.max(1, Math.min(20, speed));
    }
    
    /**
     * 设置子弹伤害
     * @param {number} damage - 子弹伤害
     */
    setBulletDamage(damage) {
        this.config.bulletDamage = Math.max(1, Math.min(9999, damage));
    }
    
    /**
     * 设置子弹大小
     * @param {number} size - 子弹大小
     */
    setBulletSize(size) {
        this.config.bulletSize = Math.max(5, Math.min(30, size));
    }
    
    /**
     * 设置子弹颜色
     * @param {string} color - 子弹颜色（十六进制）
     */
    setBulletColor(color) {
        this.config.bulletColor = color;
    }
    
    /**
     * 设置自动发射
     * @param {boolean} auto - 是否自动发射
     */
    setAutoFire(auto) {
        this.config.autoFire = auto;
    }
    
    /**
     * 获取当前配置
     * @returns {Object} 配置对象
     */
    getConfig() {
        return { ...this.config };
    }
    
    /**
     * 获取射速状态
     */
    getFireRateStatus() {
        if (this.fireRateEnhancer) {
            return this.fireRateEnhancer.getStatus();
        }
        return {
            currentRate: this.config.fireRate,
            boostLevel: 0,
            boostMultiplier: 1.0,
            difficulty: 'normal'
        };
    }
    
    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            totalBulletsFired: this.totalBulletsFired,
            totalHits: this.totalHits,
            accuracy: this.totalBulletsFired > 0 ? 
                (this.totalHits / this.totalBulletsFired * 100).toFixed(1) + '%' : '0%',
            fireRate: this.config.fireRate.toFixed(1) + '/s'
        };
    }
    
    /**
     * 重置系统
     */
    reset() {
        this.config.fireRate = 2;
        this.fireInterval = 1 / this.config.fireRate;
        this.fireTimer = 0;
        this.totalBulletsFired = 0;
        this.totalHits = 0;
        
        if (this.fireRateEnhancer) {
            this.fireRateEnhancer.reset();
        }
    }
}

// 导出子弹系统
try {
    module.exports = { PlayerBullet, BulletSystem };
} catch (e) {
    // 浏览器环境
    window.PlayerBullet = PlayerBullet;
    window.BulletSystem = BulletSystem;
}
