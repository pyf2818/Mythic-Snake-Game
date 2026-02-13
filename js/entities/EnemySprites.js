/**
 * 敌人精灵图系统
 * 包含精灵动画、状态机、变体系统
 */

// 精灵动画类
class SpriteAnimation {
    constructor(config) {
        this.frames = config.frames || [];
        this.frameDuration = config.frameDuration || 1 / 12;
        this.loop = config.loop !== false;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.playing = true;
        this.onComplete = config.onComplete || null;
    }
    
    update(deltaTime) {
        if (!this.playing || this.frames.length === 0) return;
        
        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameDuration) {
            this.frameTimer = 0;
            this.advanceFrame();
        }
    }
    
    advanceFrame() {
        this.currentFrame++;
        if (this.currentFrame >= this.frames.length) {
            if (this.loop) {
                this.currentFrame = 0;
            } else {
                this.currentFrame = this.frames.length - 1;
                this.playing = false;
                if (this.onComplete) this.onComplete();
            }
        }
    }
    
    reset() {
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.playing = true;
    }
    
    getCurrentFrame() {
        return this.frames[this.currentFrame] || null;
    }
}

// 精灵渲染器类
class SpriteRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }
    
    drawEnemy(enemy, x, y, scale = 1) {
        const ctx = this.ctx;
        ctx.save();
        
        const centerX = x + enemy.width * scale / 2;
        const centerY = y + enemy.height * scale / 2;
        
        // 根据敌人类型和状态绘制
        switch(enemy.archetype) {
            case 'melee':
                this.drawMeleeEnemy(enemy, centerX, centerY, scale);
                break;
            case 'ranged':
                this.drawRangedEnemy(enemy, centerX, centerY, scale);
                break;
            case 'tank':
                this.drawTankEnemy(enemy, centerX, centerY, scale);
                break;
            case 'agile':
                this.drawAgileEnemy(enemy, centerX, centerY, scale);
                break;
            case 'support':
                this.drawSupportEnemy(enemy, centerX, centerY, scale);
                break;
            default:
                this.drawBasicEnemy(enemy, x, y, scale);
        }
        
        ctx.restore();
    }
    
    drawMeleeEnemy(enemy, cx, cy, scale) {
        const ctx = this.ctx;
        const time = Date.now() * 0.005;
        const bobOffset = Math.sin(time * 3) * 2;
        
        // 身体
        const bodyGradient = ctx.createRadialGradient(cx, cy + bobOffset, 0, cx, cy + bobOffset, 16 * scale);
        bodyGradient.addColorStop(0, enemy.colorScheme.highlight);
        bodyGradient.addColorStop(0.5, enemy.colorScheme.primary);
        bodyGradient.addColorStop(1, enemy.colorScheme.secondary);
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.arc(cx, cy + bobOffset, 14 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // 武器（根据变体）
        ctx.fillStyle = '#4a4a4a';
        const weaponAngle = Math.sin(time * 2) * 0.2;
        ctx.save();
        ctx.translate(cx + 12 * scale, cy + bobOffset);
        ctx.rotate(weaponAngle);
        
        switch(enemy.weaponType) {
            case 'sword':
                ctx.fillRect(-2 * scale, -12 * scale, 4 * scale, 20 * scale);
                ctx.fillStyle = '#c0c0c0';
                ctx.fillRect(-1 * scale, -10 * scale, 2 * scale, 16 * scale);
                break;
            case 'axe':
                ctx.fillRect(-2 * scale, -10 * scale, 4 * scale, 16 * scale);
                ctx.fillStyle = '#8b4513';
                ctx.beginPath();
                ctx.arc(0, -10 * scale, 8 * scale, -Math.PI * 0.5, Math.PI * 0.5);
                ctx.fill();
                break;
            case 'hammer':
                ctx.fillRect(-3 * scale, -8 * scale, 6 * scale, 14 * scale);
                ctx.fillStyle = '#696969';
                ctx.fillRect(-5 * scale, -12 * scale, 10 * scale, 6 * scale);
                break;
            default:
                ctx.fillRect(-2 * scale, -10 * scale, 4 * scale, 16 * scale);
        }
        ctx.restore();
        
        // 眼睛
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 4 * scale, cy - 3 * scale + bobOffset, 3 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, cy - 3 * scale + bobOffset, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx - 4 * scale, cy - 3 * scale + bobOffset, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, cy - 3 * scale + bobOffset, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // 攻击状态特效
        if (enemy.state === 'attack') {
            ctx.strokeStyle = enemy.colorScheme.primary;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(cx, cy, 20 * scale, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawRangedEnemy(enemy, cx, cy, scale) {
        const ctx = this.ctx;
        const time = Date.now() * 0.004;
        const floatOffset = Math.sin(time * 2) * 3;
        
        // 身体（更纤细）
        const bodyGradient = ctx.createRadialGradient(cx, cy + floatOffset, 0, cx, cy + floatOffset, 14 * scale);
        bodyGradient.addColorStop(0, enemy.colorScheme.highlight);
        bodyGradient.addColorStop(0.6, enemy.colorScheme.primary);
        bodyGradient.addColorStop(1, enemy.colorScheme.secondary);
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.ellipse(cx, cy + floatOffset, 12 * scale, 14 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 魔法光环
        ctx.strokeStyle = enemy.colorScheme.accent;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5 + Math.sin(time * 4) * 0.3;
        ctx.beginPath();
        ctx.arc(cx, cy + floatOffset, 18 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // 武器
        ctx.fillStyle = '#4a3728';
        ctx.save();
        ctx.translate(cx - 10 * scale, cy + floatOffset);
        ctx.rotate(-0.3);
        
        switch(enemy.weaponType) {
            case 'bow':
                ctx.strokeStyle = '#8b4513';
                ctx.lineWidth = 3 * scale;
                ctx.beginPath();
                ctx.arc(0, 0, 12 * scale, -Math.PI * 0.7, Math.PI * 0.7);
                ctx.stroke();
                ctx.strokeStyle = '#d4d4d4';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, -10 * scale);
                ctx.lineTo(0, 10 * scale);
                ctx.stroke();
                break;
            case 'staff':
                ctx.fillRect(-2 * scale, -15 * scale, 4 * scale, 30 * scale);
                ctx.fillStyle = enemy.colorScheme.accent;
                ctx.beginPath();
                ctx.arc(0, -15 * scale, 5 * scale, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'gun':
                ctx.fillStyle = '#2c2c2c';
                ctx.fillRect(-3 * scale, -4 * scale, 15 * scale, 8 * scale);
                ctx.fillRect(8 * scale, -6 * scale, 5 * scale, 12 * scale);
                break;
            default:
                ctx.fillRect(-2 * scale, -12 * scale, 4 * scale, 24 * scale);
        }
        ctx.restore();
        
        // 眼睛（发光效果）
        ctx.fillStyle = enemy.colorScheme.accent;
        ctx.shadowColor = enemy.colorScheme.accent;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 2 * scale + floatOffset, 2.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 2 * scale + floatOffset, 2.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    drawTankEnemy(enemy, cx, cy, scale) {
        const ctx = this.ctx;
        const time = Date.now() * 0.003;
        const breathe = Math.sin(time * 2) * 1.5;
        
        // 身体（大型）
        const bodyGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 24 * scale);
        bodyGradient.addColorStop(0, enemy.colorScheme.highlight);
        bodyGradient.addColorStop(0.4, enemy.colorScheme.primary);
        bodyGradient.addColorStop(1, enemy.colorScheme.secondary);
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, (20 + breathe) * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // 装甲
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, 22 * scale, 0, Math.PI * 2);
        ctx.stroke();
        
        // 装甲细节
        ctx.fillStyle = '#3a3a3a';
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 0.5;
            const px = cx + Math.cos(angle) * 18 * scale;
            const py = cy + Math.sin(angle) * 18 * scale;
            ctx.beginPath();
            ctx.arc(px, py, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 武器
        ctx.fillStyle = '#5a5a5a';
        ctx.save();
        ctx.translate(cx + 18 * scale, cy);
        
        switch(enemy.weaponType) {
            case 'shield_hammer':
                // 盾牌
                ctx.fillStyle = '#696969';
                ctx.fillRect(-8 * scale, -10 * scale, 6 * scale, 20 * scale);
                // 锤子
                ctx.fillStyle = '#4a4a4a';
                ctx.fillRect(0, -12 * scale, 8 * scale, 6 * scale);
                ctx.fillRect(2 * scale, -6 * scale, 4 * scale, 16 * scale);
                break;
            case 'shield_spear':
                ctx.fillStyle = '#696969';
                ctx.fillRect(-8 * scale, -10 * scale, 6 * scale, 20 * scale);
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(0, -20 * scale, 3 * scale, 35 * scale);
                ctx.fillStyle = '#c0c0c0';
                ctx.beginPath();
                ctx.moveTo(1.5 * scale, -20 * scale);
                ctx.lineTo(-3 * scale, -28 * scale);
                ctx.lineTo(6 * scale, -28 * scale);
                ctx.closePath();
                ctx.fill();
                break;
            case 'dual_shield':
                ctx.fillStyle = '#696969';
                ctx.fillRect(-6 * scale, -12 * scale, 12 * scale, 24 * scale);
                ctx.fillStyle = '#505050';
                ctx.beginPath();
                ctx.arc(0, 0, 8 * scale, 0, Math.PI * 2);
                ctx.fill();
                break;
            default:
                ctx.fillRect(-4 * scale, -10 * scale, 8 * scale, 20 * scale);
        }
        ctx.restore();
        
        // 眼睛（小而凶狠）
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(cx - 6 * scale, cy - 4 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 6 * scale, cy - 4 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx - 6 * scale, cy - 4 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 6 * scale, cy - 4 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawAgileEnemy(enemy, cx, cy, scale) {
        const ctx = this.ctx;
        const time = Date.now() * 0.006;
        const dash = Math.sin(time * 5) * 2;
        
        // 残影效果
        if (enemy.state === 'move') {
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = enemy.colorScheme.primary;
            ctx.beginPath();
            ctx.ellipse(cx - 8 * scale, cy, 8 * scale, 10 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        
        // 身体（小型流线型）
        const bodyGradient = ctx.createRadialGradient(cx, cy + dash, 0, cx, cy + dash, 12 * scale);
        bodyGradient.addColorStop(0, enemy.colorScheme.highlight);
        bodyGradient.addColorStop(0.5, enemy.colorScheme.primary);
        bodyGradient.addColorStop(1, enemy.colorScheme.secondary);
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.ellipse(cx, cy + dash, 10 * scale, 12 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 速度线
        ctx.strokeStyle = enemy.colorScheme.accent;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        for (let i = 0; i < 3; i++) {
            const offsetY = (i - 1) * 6 * scale;
            ctx.beginPath();
            ctx.moveTo(cx - 15 * scale, cy + offsetY);
            ctx.lineTo(cx - 25 * scale, cy + offsetY);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        
        // 武器
        ctx.save();
        ctx.translate(cx + 8 * scale, cy + dash);
        
        switch(enemy.weaponType) {
            case 'dagger':
                ctx.fillStyle = '#c0c0c0';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(12 * scale, -3 * scale);
                ctx.lineTo(15 * scale, 0);
                ctx.lineTo(12 * scale, 3 * scale);
                ctx.closePath();
                ctx.fill();
                break;
            case 'shuriken':
                ctx.fillStyle = '#808080';
                for (let i = 0; i < 4; i++) {
                    ctx.save();
                    ctx.rotate(i * Math.PI / 2 + time * 3);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(10 * scale, -2 * scale);
                    ctx.lineTo(12 * scale, 0);
                    ctx.lineTo(10 * scale, 2 * scale);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                }
                break;
            case 'claw':
                ctx.fillStyle = '#4a4a4a';
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(i * 4 * scale, 0);
                    ctx.lineTo(i * 4 * scale + 8 * scale, -2 * scale);
                    ctx.lineTo(i * 4 * scale + 10 * scale, 0);
                    ctx.lineTo(i * 4 * scale + 8 * scale, 2 * scale);
                    ctx.closePath();
                    ctx.fill();
                }
                break;
            default:
                ctx.fillStyle = '#c0c0c0';
                ctx.fillRect(0, -2 * scale, 12 * scale, 4 * scale);
        }
        ctx.restore();
        
        // 眼睛
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(cx - 3 * scale, cy - 3 * scale + dash, 2 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + 3 * scale, cy - 3 * scale + dash, 2 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx - 3 * scale, cy - 3 * scale + dash, 1 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 3 * scale, cy - 3 * scale + dash, 1 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawSupportEnemy(enemy, cx, cy, scale) {
        const ctx = this.ctx;
        const time = Date.now() * 0.004;
        const pulse = Math.sin(time * 3) * 2;
        
        // 光环效果
        ctx.strokeStyle = enemy.colorScheme.accent;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3 + Math.sin(time * 4) * 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy, (25 + pulse) * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, (30 + pulse) * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        // 身体
        const bodyGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14 * scale);
        bodyGradient.addColorStop(0, enemy.colorScheme.highlight);
        bodyGradient.addColorStop(0.5, enemy.colorScheme.primary);
        bodyGradient.addColorStop(1, enemy.colorScheme.secondary);
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // 符文装饰
        ctx.fillStyle = enemy.colorScheme.accent;
        ctx.globalAlpha = 0.8;
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2 + time;
            const rx = cx + Math.cos(angle) * 8 * scale;
            const ry = cy + Math.sin(angle) * 8 * scale;
            ctx.beginPath();
            ctx.arc(rx, ry, 2 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // 武器（法杖）
        ctx.save();
        ctx.translate(cx - 10 * scale, cy);
        ctx.rotate(-0.2);
        
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-1.5 * scale, -18 * scale, 3 * scale, 36 * scale);
        
        // 法杖顶部
        ctx.fillStyle = enemy.colorScheme.accent;
        ctx.shadowColor = enemy.colorScheme.accent;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, -18 * scale, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // 内部光芒
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -18 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
        
        // 眼睛（温和）
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 4 * scale, cy - 2 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, cy - 2 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = enemy.colorScheme.accent;
        ctx.beginPath();
        ctx.arc(cx - 4 * scale, cy - 2 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.arc(cx + 4 * scale, cy - 2 * scale, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawBasicEnemy(enemy, x, y, scale) {
        const ctx = this.ctx;
        
        ctx.fillStyle = enemy.color || '#e74c3c';
        ctx.fillRect(x, y, enemy.width * scale, enemy.height * scale);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 4 * scale, y + 6 * scale, 4 * scale, 4 * scale);
        ctx.fillRect(x + 12 * scale, y + 6 * scale, 4 * scale, 4 * scale);
    }
}

// 敌人配置
const EnemyConfigs = {
    melee: {
        name: '近战型',
        width: 32,
        height: 32,
        speed: 1.8,
        health: 100,
        damage: 8,
        attackRange: 50,
        attackCooldown: 2.0,
        colorSchemes: [
            { primary: '#e74c3c', secondary: '#c0392b', highlight: '#f5b7b1', accent: '#ff6b6b' },
            { primary: '#e67e22', secondary: '#d35400', highlight: '#fdebd0', accent: '#ffa502' },
            { primary: '#cb4335', secondary: '#922b21', highlight: '#f2d7d5', accent: '#ff4757' }
        ],
        weapons: ['sword', 'axe', 'hammer', 'spear']
    },
    ranged: {
        name: '远程型',
        width: 28,
        height: 28,
        speed: 1.5,
        health: 70,
        damage: 5,
        attackRange: 300,
        attackCooldown: 2.5,
        bulletSpeed: 4,
        colorSchemes: [
            { primary: '#9b59b6', secondary: '#8e44ad', highlight: '#d7bde2', accent: '#a29bfe' },
            { primary: '#6c3483', secondary: '#5b2c6f', highlight: '#ebdef0', accent: '#6c5ce7' },
            { primary: '#af7ac5', secondary: '#884ea0', highlight: '#f5eef8', accent: '#fd79a8' }
        ],
        weapons: ['bow', 'staff', 'gun', 'crossbow']
    },
    tank: {
        name: '坦克型',
        width: 48,
        height: 48,
        speed: 1.0,
        health: 200,
        damage: 12,
        armor: 0.3,
        attackRange: 60,
        attackCooldown: 3.0,
        colorSchemes: [
            { primary: '#27ae60', secondary: '#1e8449', highlight: '#abebc6', accent: '#2ecc71' },
            { primary: '#1abc9c', secondary: '#16a085', highlight: '#a3e4d7', accent: '#00d2d3' },
            { primary: '#2ecc71', secondary: '#27ae60', highlight: '#d5f5e3', accent: '#55efc4' }
        ],
        weapons: ['shield_hammer', 'shield_spear', 'dual_shield', 'heavy_axe']
    },
    agile: {
        name: '敏捷型',
        width: 24,
        height: 24,
        speed: 3.0,
        health: 50,
        damage: 6,
        dodgeChance: 0.25,
        attackRange: 40,
        attackCooldown: 1.5,
        colorSchemes: [
            { primary: '#3498db', secondary: '#2980b9', highlight: '#aed6f1', accent: '#74b9ff' },
            { primary: '#5dade2', secondary: '#3498db', highlight: '#d4e6f1', accent: '#0984e3' },
            { primary: '#1a5276', secondary: '#154360', highlight: '#d6eaf8', accent: '#00cec9' }
        ],
        weapons: ['dagger', 'shuriken', 'claw', 'whip']
    },
    support: {
        name: '辅助型',
        width: 30,
        height: 30,
        speed: 1.3,
        health: 80,
        damage: 3,
        healAmount: 15,
        buffRange: 150,
        supportCooldown: 3.5,
        colorSchemes: [
            { primary: '#f1c40f', secondary: '#d4ac0d', highlight: '#fcf3cf', accent: '#ffeaa7' },
            { primary: '#f39c12', secondary: '#e67e22', highlight: '#fdebd0', accent: '#fdcb6e' },
            { primary: '#ffd700', secondary: '#daa520', highlight: '#fffacd', accent: '#ffeaa7' }
        ],
        weapons: ['heal_staff', 'buff_staff', 'curse_staff', 'barrier_staff']
    }
};

// 变体生成器
class EnemyVariantGenerator {
    static generate(archetype, waveNumber = 1) {
        const config = EnemyConfigs[archetype];
        if (!config) return null;
        
        const colorIndex = Math.floor(Math.random() * config.colorSchemes.length);
        const weaponIndex = Math.floor(Math.random() * config.weapons.length);
        
        // 波次影响属性
        const waveBonus = Math.min(waveNumber * 0.05, 0.5);
        
        return {
            archetype: archetype,
            colorScheme: config.colorSchemes[colorIndex],
            weaponType: config.weapons[weaponIndex],
            variantIndex: colorIndex,
            stats: {
                width: config.width,
                height: config.height,
                speed: config.speed * (1 + waveBonus * 0.2),
                health: config.health * (1 + waveBonus),
                damage: config.damage * (1 + waveBonus * 0.5),
                attackRange: config.attackRange,
                attackCooldown: config.attackCooldown * (1 - waveBonus * 0.1)
            }
        };
    }
}

// 导出
try {
    module.exports = { SpriteAnimation, SpriteRenderer, EnemyConfigs, EnemyVariantGenerator };
} catch (e) {
    window.SpriteAnimation = SpriteAnimation;
    window.SpriteRenderer = SpriteRenderer;
    window.EnemyConfigs = EnemyConfigs;
    window.EnemyVariantGenerator = EnemyVariantGenerator;
}
