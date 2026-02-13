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
                renderCtx.strokeStyle = this.hexToRgba(this.color, alpha);
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
            console.log(`=== Firing special weapon: ${this.specialWeapon.name} ===`);
            console.log(`Timer: ${this.specialWeaponTimer}, Cooldown: ${this.specialWeaponCooldown}`);
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
        console.log(`fireLightningWeapon called - 召唤闪电从天而降`);
        
        // 找范围内的所有敌人
        let targets = [];
        const range = stats.range || 200;
        
        this.gameManager.gameObjects.forEach(obj => {
            if (obj.type === 'enemy' || obj.type === 'boss' || obj.type === 'ai_snake') {
                const dist = Math.sqrt((obj.x - x) ** 2 + (obj.y - y) ** 2);
                if (dist < range) {
                    targets.push({ target: obj, dist: dist });
                }
            }
        });
        
        // 按距离排序，优先攻击最近的敌人
        targets.sort((a, b) => a.dist - b.dist);
        
        // 限制目标数量为链式攻击数量
        const chainCount = stats.chainCount || 4;
        targets = targets.slice(0, chainCount);
        
        console.log(`找到 ${targets.length} 个目标进行闪电攻击`);
        
        if (targets.length > 0) {
            // 播放闪电音效
            this.playLightningSound();
            
            // 对每个目标召唤闪电从天而降
            targets.forEach((targetInfo, index) => {
                const target = targetInfo.target;
                
                // 延迟每个闪电，形成连续效果
                setTimeout(() => {
                    // 从天空召唤闪电（Y=0 开始，到敌人位置）
                    this.createLightningFromSky(target.x, target.y, stats.damage, weapon.rarity.color);
                }, index * 100); // 每个闪电间隔100ms
            });
        } else {
            // 没有敌人时也显示天空闪电特效
            this.createSkyLightningEffect(x);
            console.log('No enemy in range for lightning weapon');
        }
    }
    
    playLightningSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const now = audioContext.currentTime;
            
            // 主音
            const osc1 = audioContext.createOscillator();
            const gain1 = audioContext.createGain();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(150, now);
            osc1.frequency.exponentialRampToValueAtTime(50, now + 0.3);
            gain1.gain.setValueAtTime(0.3, now);
            gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc1.connect(gain1);
            gain1.connect(audioContext.destination);
            osc1.start(now);
            osc1.stop(now + 0.3);
            
            // 高频嘶嘶声
            const osc2 = audioContext.createOscillator();
            const gain2 = audioContext.createGain();
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(2000, now);
            osc2.frequency.exponentialRampToValueAtTime(100, now + 0.2);
            gain2.gain.setValueAtTime(0.1, now);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc2.connect(gain2);
            gain2.connect(audioContext.destination);
            osc2.start(now);
            osc2.stop(now + 0.2);
            
            // 雷声低频
            const osc3 = audioContext.createOscillator();
            const gain3 = audioContext.createGain();
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(80, now);
            osc3.frequency.exponentialRampToValueAtTime(30, now + 0.5);
            gain3.gain.setValueAtTime(0.4, now);
            gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc3.connect(gain3);
            gain3.connect(audioContext.destination);
            osc3.start(now);
            osc3.stop(now + 0.5);
            
            setTimeout(() => audioContext.close(), 600);
        } catch (e) {
            // 音频不可用时静默失败
        }
    }
    
    createLightningFromSky(targetX, targetY, damage, color) {
        if (!this.gameManager.systems.renderer) return;
        
        const renderer = this.gameManager.systems.renderer;
        
        // 金黄色调配色方案
        const goldCore = '#ffffff';
        const goldInner = '#ffd700';
        const goldMiddle = '#ffb300';
        const goldOuter = '#ff8c00';
        const goldGlow = '#ff6600';
        
        // 从天空（Y=0）到目标位置的闪电
        const skyY = -50;
        const steps = 25;
        
        // 第一阶段：天空聚集能量效果
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 50;
            renderer.addParticle({
                x: targetX + Math.cos(angle) * dist,
                y: skyY + Math.sin(angle) * dist * 0.3,
                size: 8 + Math.random() * 6,
                color: goldInner,
                velocity: {
                    x: -Math.cos(angle) * 3,
                    y: 5 + Math.random() * 3
                },
                lifetime: 0.4,
                opacity: 0.9
            });
        }
        
        // 第二阶段：主闪电束（从天而降）- 多层渲染
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const baseX = targetX + (Math.random() - 0.5) * 30;
            const baseY = skyY + (targetY - skyY) * t;
            
            // 外层光晕（最大）
            renderer.addParticle({
                x: baseX + (Math.random() - 0.5) * 60,
                y: baseY + (Math.random() - 0.5) * 20,
                size: 45 + Math.random() * 20,
                color: goldGlow,
                velocity: { x: 0, y: 0 },
                lifetime: 0.35,
                opacity: 0.4
            });
            
            // 中层光晕
            renderer.addParticle({
                x: baseX + (Math.random() - 0.5) * 35,
                y: baseY + (Math.random() - 0.5) * 15,
                size: 30 + Math.random() * 15,
                color: goldOuter,
                velocity: { x: 0, y: 0 },
                lifetime: 0.3,
                opacity: 0.6
            });
            
            // 内层光晕
            renderer.addParticle({
                x: baseX + (Math.random() - 0.5) * 20,
                y: baseY + (Math.random() - 0.5) * 10,
                size: 20 + Math.random() * 10,
                color: goldMiddle,
                velocity: { x: 0, y: 0 },
                lifetime: 0.25,
                opacity: 0.8
            });
            
            // 核心闪电（最亮）
            renderer.addParticle({
                x: baseX,
                y: baseY,
                size: 12 + Math.random() * 8,
                color: goldCore,
                velocity: { x: 0, y: 0 },
                lifetime: 0.2,
                opacity: 1
            });
        }
        
        // 第三阶段：闪电分支（更精细）
        for (let branch = 0; branch < 6; branch++) {
            const branchStart = 0.1 + Math.random() * 0.6;
            const bx = targetX + (Math.random() - 0.5) * 50;
            const by = skyY + (targetY - skyY) * branchStart;
            const branchAngle = (Math.random() - 0.5) * Math.PI * 0.6;
            const branchLength = 50 + Math.random() * 80;
            
            for (let i = 0; i < 12; i++) {
                const t = i / 12;
                const px = bx + Math.cos(branchAngle) * branchLength * t + (Math.random() - 0.5) * 25;
                const py = by + Math.abs(Math.sin(branchAngle)) * branchLength * t + (Math.random() - 0.5) * 15;
                
                // 分支光晕
                renderer.addParticle({
                    x: px,
                    y: py,
                    size: 15 + Math.random() * 8,
                    color: goldOuter,
                    velocity: { x: 0, y: 0 },
                    lifetime: 0.28,
                    opacity: 0.5
                });
                
                // 分支核心
                renderer.addParticle({
                    x: px,
                    y: py,
                    size: 8 + Math.random() * 5,
                    color: goldInner,
                    velocity: { x: 0, y: 0 },
                    lifetime: 0.22,
                    opacity: 0.8
                });
            }
        }
        
        // 第四阶段：击中点爆炸效果（增强）
        // 爆炸核心
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 2;
            const speed = 5 + Math.random() * 12;
            
            renderer.addParticle({
                x: targetX,
                y: targetY,
                size: 10 + Math.random() * 10,
                color: goldCore,
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                lifetime: 0.6,
                opacity: 1
            });
        }
        
        // 爆炸外层
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            
            renderer.addParticle({
                x: targetX,
                y: targetY,
                size: 15 + Math.random() * 12,
                color: goldInner,
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed
                },
                lifetime: 0.5,
                opacity: 0.8
            });
        }
        
        // 火花粒子
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 8 + Math.random() * 15;
            
            renderer.addParticle({
                x: targetX,
                y: targetY,
                size: 4 + Math.random() * 4,
                color: goldMiddle,
                velocity: {
                    x: Math.cos(angle) * speed,
                    y: Math.sin(angle) * speed - 3
                },
                lifetime: 0.8,
                opacity: 0.9
            });
        }
        
        // 第五阶段：击中点光环（多层）
        for (let i = 0; i < 5; i++) {
            renderer.addParticle({
                x: targetX,
                y: targetY,
                size: 60 + i * 30,
                color: i < 2 ? goldInner : goldOuter,
                velocity: { x: 0, y: 0 },
                lifetime: 0.5 + i * 0.1,
                opacity: 0.8 - i * 0.12
            });
        }
        
        // 地面冲击波
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                for (let j = 0; j < 30; j++) {
                    const angle = (j / 30) * Math.PI * 2;
                    const dist = 30 + i * 40;
                    renderer.addParticle({
                        x: targetX + Math.cos(angle) * dist,
                        y: targetY + Math.sin(angle) * dist * 0.3,
                        size: 6 + Math.random() * 4,
                        color: goldMiddle,
                        velocity: {
                            x: Math.cos(angle) * (3 + i * 2),
                            y: Math.sin(angle) * (1 + i)
                        },
                        lifetime: 0.4,
                        opacity: 0.7
                    });
                }
            }, i * 50);
        }
        
        // 对目标造成伤害
        this.gameManager.gameObjects.forEach(obj => {
            if ((obj.type === 'enemy' || obj.type === 'boss' || obj.type === 'ai_snake')) {
                const dist = Math.sqrt((obj.x - targetX) ** 2 + (obj.y - targetY) ** 2);
                if (dist < 40 && obj.takeDamage) {
                    obj.takeDamage(damage);
                }
            }
        });
        
        // 屏幕闪烁效果（金黄色）
        if (this.gameManager.canvas) {
            const ctx = this.gameManager.canvas.getContext('2d');
            if (ctx) {
                ctx.save();
                ctx.globalAlpha = 0.35;
                ctx.fillStyle = goldInner;
                ctx.fillRect(0, 0, this.gameManager.canvas.width, this.gameManager.canvas.height);
                ctx.restore();
            }
        }
    }
    
    createSkyLightningEffect(x) {
        if (!this.gameManager.systems.renderer) return;
        
        const renderer = this.gameManager.systems.renderer;
        
        // 金黄色调配色
        const goldInner = '#ffd700';
        const goldMiddle = '#ffb300';
        const goldOuter = '#ff8c00';
        
        // 没有敌人时，在玩家附近显示天空闪电
        const skyY = -50;
        const groundY = 400;
        
        // 天空能量聚集
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 20 + Math.random() * 40;
            renderer.addParticle({
                x: x + Math.cos(angle) * dist,
                y: skyY + Math.sin(angle) * dist * 0.3,
                size: 6 + Math.random() * 4,
                color: goldInner,
                velocity: {
                    x: -Math.cos(angle) * 2,
                    y: 3 + Math.random() * 2
                },
                lifetime: 0.35,
                opacity: 0.8
            });
        }
        
        // 主闪电束
        for (let i = 0; i < 20; i++) {
            const t = i / 20;
            const px = x + (Math.random() - 0.5) * 40;
            const py = skyY + (groundY - skyY) * t + (Math.random() - 0.5) * 20;
            
            renderer.addParticle({
                x: px,
                y: py,
                size: 20 + Math.random() * 12,
                color: goldOuter,
                velocity: { x: 0, y: 0 },
                lifetime: 0.25,
                opacity: 0.6
            });
            
            renderer.addParticle({
                x: px,
                y: py,
                size: 12 + Math.random() * 8,
                color: goldMiddle,
                velocity: { x: 0, y: 0 },
                lifetime: 0.2,
                opacity: 0.8
            });
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
