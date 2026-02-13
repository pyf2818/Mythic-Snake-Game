/**
 * 虫洞视觉效果增强系统
 * 包含高级粒子特效、光影渲染、动态动画
 */

// 虫洞粒子类
class WormholeParticle {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        this.size = config.size || 3;
        this.maxSize = config.maxSize || this.size * 2;
        this.color = config.color || '#9b59b6';
        this.alpha = config.alpha || 1;
        this.life = config.life || 1;
        this.maxLife = config.life || 1;
        this.angle = config.angle || 0;
        this.angularVelocity = config.angularVelocity || 0;
        this.orbitRadius = config.orbitRadius || 0;
        this.orbitSpeed = config.orbitSpeed || 0;
        this.type = config.type || 'spiral'; // spiral, orbit, burst, trail
        this.centerX = config.centerX || 0;
        this.centerY = config.centerY || 0;
        this.gravity = config.gravity || 0;
        this.friction = config.friction || 1;
    }
    
    update(deltaTime) {
        this.life -= deltaTime;
        
        switch (this.type) {
            case 'spiral':
                this.updateSpiral(deltaTime);
                break;
            case 'orbit':
                this.updateOrbit(deltaTime);
                break;
            case 'burst':
                this.updateBurst(deltaTime);
                break;
            case 'trail':
                this.updateTrail(deltaTime);
                break;
        }
        
        this.alpha = Math.max(0, this.life / this.maxLife);
        this.size = this.maxSize * (0.5 + 0.5 * (this.life / this.maxLife));
        
        return this.life > 0;
    }
    
    updateSpiral(deltaTime) {
        this.angle += this.angularVelocity * deltaTime;
        this.orbitRadius -= this.gravity * deltaTime;
        
        this.x = this.centerX + Math.cos(this.angle) * this.orbitRadius;
        this.y = this.centerY + Math.sin(this.angle) * this.orbitRadius;
    }
    
    updateOrbit(deltaTime) {
        this.angle += this.orbitSpeed * deltaTime;
        this.x = this.centerX + Math.cos(this.angle) * this.orbitRadius;
        this.y = this.centerY + Math.sin(this.angle) * this.orbitRadius;
    }
    
    updateBurst(deltaTime) {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity * deltaTime * 60;
        
        this.x += this.vx * deltaTime * 60;
        this.y += this.vy * deltaTime * 60;
    }
    
    updateTrail(deltaTime) {
        this.x += this.vx * deltaTime * 60;
        this.y += this.vy * deltaTime * 60;
    }
    
    render(ctx) {
        if (this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // 粒子光晕
        const glowGradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );
        glowGradient.addColorStop(0, this.color);
        glowGradient.addColorStop(0.5, this.color + '80');
        glowGradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 粒子核心
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// 虫洞视觉效果渲染器
class WormholeVisualRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.time = 0;
        this.particles = [];
    }
    
    updateTime(deltaTime) {
        this.time += deltaTime;
    }
    
    render(wormhole, deltaTime) {
        const ctx = this.ctx;
        this.updateTime(deltaTime);
        
        // 更新粒子
        this.updateParticles(deltaTime);
        
        // 生成新粒子
        this.generateParticles(wormhole);
        
        ctx.save();
        ctx.translate(wormhole.x, wormhole.y);
        
        // 1. 外层能量场
        this.renderEnergyField(ctx, wormhole);
        
        // 2. 时空扭曲效果
        this.renderSpaceDistortion(ctx, wormhole);
        
        // 3. 虫洞核心
        this.renderCore(ctx, wormhole);
        
        // 4. 旋转光环
        this.renderRotatingRings(ctx, wormhole);
        
        // 5. 能量脉冲
        this.renderEnergyPulse(ctx, wormhole);
        
        // 6. 连接线（配对虫洞）
        if (wormhole.target) {
            this.renderConnectionLine(ctx, wormhole);
        }
        
        ctx.restore();
        
        // 渲染粒子
        this.renderParticles(ctx);
    }
    
    renderEnergyField(ctx, wormhole) {
        const time = this.time;
        const baseRadius = wormhole.width / 2;
        
        // 多层能量场
        for (let layer = 0; layer < 3; layer++) {
            const layerRadius = baseRadius * (1.5 + layer * 0.3);
            const layerAlpha = 0.15 - layer * 0.04;
            const pulseOffset = Math.sin(time * 2 + layer) * 5;
            
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, layerRadius + pulseOffset);
            gradient.addColorStop(0, wormhole.wormholeType.color + '00');
            gradient.addColorStop(0.3, wormhole.wormholeType.color + Math.floor(layerAlpha * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(0.6, wormhole.wormholeType.secondaryColor + Math.floor(layerAlpha * 0.5 * 255).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, wormhole.wormholeType.color + '00');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, layerRadius + pulseOffset, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderSpaceDistortion(ctx, wormhole) {
        const time = this.time;
        const baseRadius = wormhole.width / 2;
        
        // 时空扭曲波纹
        for (let i = 0; i < 5; i++) {
            const waveProgress = ((time * 0.5 + i * 0.2) % 1);
            const waveRadius = baseRadius * (0.5 + waveProgress * 1.5);
            const waveAlpha = (1 - waveProgress) * 0.3;
            
            ctx.strokeStyle = wormhole.wormholeType.color + Math.floor(waveAlpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 2 - waveProgress;
            ctx.beginPath();
            ctx.arc(0, 0, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 螺旋线
        ctx.save();
        ctx.rotate(wormhole.rotation);
        
        for (let arm = 0; arm < 4; arm++) {
            ctx.save();
            ctx.rotate(arm * Math.PI / 2);
            
            ctx.strokeStyle = wormhole.wormholeType.color + '40';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            
            for (let i = 0; i <= 50; i++) {
                const progress = i / 50;
                const angle = progress * Math.PI * 3;
                const radius = baseRadius * 0.3 + progress * baseRadius * 0.7;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    renderCore(ctx, wormhole) {
        const time = this.time;
        const coreRadius = wormhole.width / 4;
        
        // 核心黑洞效果
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 1.5);
        coreGradient.addColorStop(0, '#000000');
        coreGradient.addColorStop(0.5, '#000000cc');
        coreGradient.addColorStop(0.8, wormhole.wormholeType.secondaryColor + '80');
        coreGradient.addColorStop(1, wormhole.wormholeType.color + '00');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(0, 0, coreRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心内部漩涡
        ctx.save();
        ctx.rotate(time * 3);
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const innerRadius = coreRadius * 0.3;
            
            ctx.strokeStyle = wormhole.wormholeType.color + '60';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(
                Math.cos(angle) * innerRadius,
                Math.sin(angle) * innerRadius,
                coreRadius * 0.15,
                0, Math.PI * 2
            );
            ctx.stroke();
        }
        
        ctx.restore();
        
        // 中心亮点
        const centerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 0.5);
        centerGlow.addColorStop(0, '#ffffff80');
        centerGlow.addColorStop(0.5, wormhole.wormholeType.color + '40');
        centerGlow.addColorStop(1, 'transparent');
        
        ctx.fillStyle = centerGlow;
        ctx.beginPath();
        ctx.arc(0, 0, coreRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderRotatingRings(ctx, wormhole) {
        const time = this.time;
        const baseRadius = wormhole.width / 2;
        
        // 多层旋转光环
        for (let ring = 0; ring < 3; ring++) {
            const ringRadius = baseRadius * (0.8 + ring * 0.15);
            const ringRotation = time * (2 - ring * 0.5) * (ring % 2 === 0 ? 1 : -1);
            const ringAlpha = 0.6 - ring * 0.15;
            
            ctx.save();
            ctx.rotate(ringRotation);
            
            // 虚线环
            ctx.strokeStyle = wormhole.wormholeType.color + Math.floor(ringAlpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 2 - ring * 0.5;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // 环上的光点
            for (let dot = 0; dot < 8; dot++) {
                const dotAngle = (dot / 8) * Math.PI * 2;
                const dotX = Math.cos(dotAngle) * ringRadius;
                const dotY = Math.sin(dotAngle) * ringRadius;
                
                ctx.fillStyle = wormhole.wormholeType.color;
                ctx.beginPath();
                ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
    
    renderEnergyPulse(ctx, wormhole) {
        const time = this.time;
        const baseRadius = wormhole.width / 2;
        
        // 脉冲波
        const pulseCount = 3;
        for (let i = 0; i < pulseCount; i++) {
            const pulseProgress = ((time * 0.8 + i / pulseCount) % 1);
            const pulseRadius = baseRadius + pulseProgress * baseRadius * 1.5;
            const pulseAlpha = (1 - pulseProgress) * 0.4;
            
            ctx.strokeStyle = wormhole.wormholeType.color + Math.floor(pulseAlpha * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 3 * (1 - pulseProgress);
            ctx.beginPath();
            ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    renderConnectionLine(ctx, wormhole) {
        if (!wormhole.target) return;
        
        const time = this.time;
        const dx = wormhole.target.x - wormhole.x;
        const dy = wormhole.target.y - wormhole.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 500) return; // 太远不显示连接线
        
        ctx.restore(); // 恢复到世界坐标
        ctx.save();
        
        // 虚线连接
        ctx.strokeStyle = wormhole.wormholeType.color + '30';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 10]);
        ctx.beginPath();
        ctx.moveTo(wormhole.x, wormhole.y);
        ctx.lineTo(wormhole.target.x, wormhole.target.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // 流动粒子效果
        const particleCount = Math.floor(distance / 50);
        for (let i = 0; i < particleCount; i++) {
            const progress = ((time * 0.5 + i / particleCount) % 1);
            const px = wormhole.x + dx * progress;
            const py = wormhole.y + dy * progress;
            
            ctx.fillStyle = wormhole.wormholeType.color + '60';
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    generateParticles(wormhole) {
        const particleRate = 0.3; // 每帧生成粒子的概率
        const baseRadius = wormhole.width / 2;
        
        if (Math.random() < particleRate) {
            // 螺旋粒子
            const angle = Math.random() * Math.PI * 2;
            const startRadius = baseRadius * 1.5;
            
            this.particles.push(new WormholeParticle({
                x: wormhole.x + Math.cos(angle) * startRadius,
                y: wormhole.y + Math.sin(angle) * startRadius,
                centerX: wormhole.x,
                centerY: wormhole.y,
                angle: angle,
                orbitRadius: startRadius,
                angularVelocity: 3 + Math.random() * 2,
                gravity: 30 + Math.random() * 20,
                size: 2 + Math.random() * 2,
                maxSize: 4 + Math.random() * 3,
                color: wormhole.wormholeType.color,
                life: 1 + Math.random() * 0.5,
                type: 'spiral'
            }));
        }
        
        // 轨道粒子
        if (Math.random() < particleRate * 0.5) {
            const orbitAngle = Math.random() * Math.PI * 2;
            const orbitRadius = baseRadius * (0.8 + Math.random() * 0.4);
            
            this.particles.push(new WormholeParticle({
                centerX: wormhole.x,
                centerY: wormhole.y,
                angle: orbitAngle,
                orbitRadius: orbitRadius,
                orbitSpeed: 2 + Math.random(),
                size: 1.5 + Math.random(),
                maxSize: 3,
                color: wormhole.wormholeType.secondaryColor,
                life: 2 + Math.random(),
                type: 'orbit'
            }));
        }
    }
    
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(p => p.update(deltaTime));
        
        // 限制粒子数量
        if (this.particles.length > 200) {
            this.particles = this.particles.slice(-200);
        }
    }
    
    renderParticles(ctx) {
        this.particles.forEach(p => p.render(ctx));
    }
    
    // 传送效果
    createTeleportEffect(x, y, color, isEntry = true) {
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 5 + Math.random() * 5;
            
            this.particles.push(new WormholeParticle({
                x: x,
                y: y,
                vx: isEntry ? -Math.cos(angle) * speed : Math.cos(angle) * speed,
                vy: isEntry ? -Math.sin(angle) * speed : Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                maxSize: 6,
                color: color,
                life: 0.5 + Math.random() * 0.3,
                friction: 0.95,
                type: 'burst'
            }));
        }
    }
}

// 虫洞类型视觉配置
const WormholeVisualConfigs = {
    normal: {
        name: '普通虫洞',
        colors: {
            primary: '#9b59b6',
            secondary: '#8e44ad',
            accent: '#bb8fce',
            glow: '#d7bde2'
        },
        particleConfig: {
            count: 15,
            speed: 10,
            size: { min: 2, max: 4 },
            life: { min: 1, max: 2 }
        },
        animationConfig: {
            rotationSpeed: 0.05,
            pulseSpeed: 2,
            waveSpeed: 0.5
        }
    },
    unstable: {
        name: '不稳定虫洞',
        colors: {
            primary: '#e74c3c',
            secondary: '#c0392b',
            accent: '#f1948a',
            glow: '#f5b7b1'
        },
        particleConfig: {
            count: 25,
            speed: 15,
            size: { min: 2, max: 5 },
            life: { min: 0.5, max: 1.5 }
        },
        animationConfig: {
            rotationSpeed: 0.1,
            pulseSpeed: 3,
            waveSpeed: 0.8
        }
    },
    stable: {
        name: '稳定虫洞',
        colors: {
            primary: '#3498db',
            secondary: '#2980b9',
            accent: '#85c1e9',
            glow: '#aed6f1'
        },
        particleConfig: {
            count: 10,
            speed: 8,
            size: { min: 1.5, max: 3 },
            life: { min: 1.5, max: 2.5 }
        },
        animationConfig: {
            rotationSpeed: 0.03,
            pulseSpeed: 1.5,
            waveSpeed: 0.3
        }
    }
};

// 导出
try {
    module.exports = {
        WormholeParticle,
        WormholeVisualRenderer,
        WormholeVisualConfigs
    };
} catch (e) {
    window.WormholeParticle = WormholeParticle;
    window.WormholeVisualRenderer = WormholeVisualRenderer;
    window.WormholeVisualConfigs = WormholeVisualConfigs;
}
