/**
 * 灾害视觉效果系统 - 三维建模与动态展示
 * 支持五种自然灾害：龙卷风、岩浆、闪电、沙尘暴、暴风雪
 */

// 灾害分级配置
const DisasterLevelConfig = {
    levels: {
        1: { name: '轻微', detailMultiplier: 0.5, effectIntensity: 0.4, particleCount: 0.5 },
        2: { name: '中等', detailMultiplier: 0.75, effectIntensity: 0.7, particleCount: 0.75 },
        3: { name: '强烈', detailMultiplier: 1.0, effectIntensity: 1.0, particleCount: 1.0 },
        4: { name: '严重', detailMultiplier: 1.25, effectIntensity: 1.3, particleCount: 1.25 },
        5: { name: '灾难', detailMultiplier: 1.5, effectIntensity: 1.6, particleCount: 1.5 }
    },
    
    getLevel(intensity) {
        if (!isFinite(intensity) || intensity < 1) return this.levels[1];
        if (intensity < 2) return this.levels[2];
        if (intensity < 3) return this.levels[3];
        if (intensity < 4) return this.levels[4];
        return this.levels[5];
    }
};

// 安全工具函数
function safeNumber(value, defaultValue = 0) {
    return isFinite(value) ? value : defaultValue;
}

function safeRadius(value, minRadius = 1) {
    const r = safeNumber(value, minRadius);
    return Math.max(minRadius, r);
}

// 三维渲染器基类
class Disaster3DRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.time = 0;
    }
    
    updateTime(deltaTime) {
        this.time += safeNumber(deltaTime, 0);
    }
    
    applyPerspective(x, y, z, centerX, centerY) {
        const scale = 1 + safeNumber(z, 0) * 0.001;
        return {
            x: safeNumber(centerX, 0) + (safeNumber(x, 0) - safeNumber(centerX, 0)) * scale,
            y: safeNumber(centerY, 0) + (safeNumber(y, 0) - safeNumber(centerY, 0)) * scale,
            scale: scale
        };
    }
    
    /**
     * 安全创建径向渐变
     */
    createSafeRadialGradient(x0, y0, r0, x1, y1, r1) {
        const ctx = this.ctx;
        x0 = safeNumber(x0, 0);
        y0 = safeNumber(y0, 0);
        r0 = safeRadius(r0, 1);
        x1 = safeNumber(x1, 0);
        y1 = safeNumber(y1, 0);
        r1 = safeRadius(r1, 1);
        
        try {
            return ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
        } catch (e) {
            console.warn('Failed to create radial gradient:', e);
            return null;
        }
    }
}

// 龙卷风渲染器
class TornadoRenderer extends Disaster3DRenderer {
    render(disaster, centerX, centerY, deltaTime) {
        const ctx = this.ctx;
        const level = DisasterLevelConfig.getLevel(safeNumber(disaster.intensity, 1));
        const intensity = safeNumber(disaster.intensity, 1) * level.effectIntensity;
        
        this.updateTime(deltaTime);
        
        // 龙卷风参数
        const baseRadius = 80 * level.detailMultiplier;
        const height = 300 * level.detailMultiplier;
        const layers = Math.floor(15 * level.detailMultiplier);
        
        // 安全化中心坐标
        const cx = safeNumber(centerX, 500);
        const cy = safeNumber(centerY, 400);
        
        ctx.save();
        
        // 1. 外部尘埃云
        this.renderDustCloud(ctx, cx, cy, baseRadius, intensity);
        
        // 2. 龙卷风主体 - 螺旋漏斗
        this.renderFunnel(ctx, cx, cy, baseRadius, height, layers, intensity);
        
        // 3. 内部涡流
        this.renderInnerVortex(ctx, cx, cy, baseRadius, intensity);
        
        // 4. 地面碎片
        this.renderDebris(ctx, cx, cy, baseRadius, intensity);
        
        // 5. 顶部云层
        this.renderTopCloud(ctx, cx, cy - height, baseRadius * 2, intensity);
        
        ctx.restore();
    }
    
    renderDustCloud(ctx, cx, cy, radius, intensity) {
        const time = this.time;
        
        // 外围旋转尘埃
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 0.5;
            const dist = radius * 1.5 + Math.sin(time * 2 + i) * 20;
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist * 0.3;
            
            const gradient = this.createSafeRadialGradient(x, y, 0, x, y, 40);
            if (gradient) {
                gradient.addColorStop(0, `rgba(149, 165, 166, ${0.3 * intensity})`);
                gradient.addColorStop(1, 'rgba(149, 165, 166, 0)');
                ctx.fillStyle = gradient;
            }
            
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderFunnel(ctx, cx, cy, baseRadius, height, layers, intensity) {
        const time = this.time;
        
        for (let i = layers; i >= 0; i--) {
            const progress = i / Math.max(layers, 1);
            const y = cy - progress * height;
            const radius = baseRadius * (1 - progress * 0.8);
            const rotation = time * 3 + progress * Math.PI * 4;
            
            // 螺旋线条
            ctx.strokeStyle = `rgba(100, 100, 100, ${0.6 * intensity * (1 - progress * 0.5)})`;
            ctx.lineWidth = 3 - progress * 2;
            
            ctx.beginPath();
            for (let j = 0; j <= 20; j++) {
                const angle = (j / 20) * Math.PI * 2 + rotation;
                const wobble = Math.sin(angle * 3 + time * 5) * 5 * (1 - progress);
                const x = cx + Math.cos(angle) * (radius + wobble);
                const py = y + Math.sin(angle) * radius * 0.3;
                
                if (j === 0) ctx.moveTo(x, py);
                else ctx.lineTo(x, py);
            }
            ctx.closePath();
            ctx.stroke();
            
            // 内部填充
            const gradient = this.createSafeRadialGradient(cx, y, 0, cx, y, radius);
            if (gradient) {
                gradient.addColorStop(0, `rgba(50, 50, 50, ${0.3 * intensity})`);
                gradient.addColorStop(0.5, `rgba(80, 80, 80, ${0.2 * intensity})`);
                gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
                ctx.fillStyle = gradient;
            }
            ctx.fill();
        }
    }
    
    renderInnerVortex(ctx, cx, cy, radius, intensity) {
        const time = this.time;
        
        // 核心涡流
        ctx.strokeStyle = `rgba(200, 200, 200, ${0.8 * intensity})`;
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            for (let j = 0; j <= 50; j++) {
                const progress = j / 50;
                const angle = progress * Math.PI * 6 + time * 5 + i * Math.PI * 2 / 3;
                const r = radius * 0.3 * (1 - progress * 0.9);
                const x = cx + Math.cos(angle) * r;
                const y = cy - progress * 200 + Math.sin(angle) * r * 0.3;
                
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    
    renderDebris(ctx, cx, cy, radius, intensity) {
        const time = this.time;
        
        // 地面碎片旋转
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2 + time * 2;
            const dist = radius * (0.5 + Math.sin(time + i) * 0.3);
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist * 0.3 + Math.sin(time * 3 + i) * 10;
            
            ctx.fillStyle = `rgba(80, 80, 80, ${0.6 * intensity})`;
            ctx.fillRect(x - 2, y - 2, 4, 4);
        }
    }
    
    renderTopCloud(ctx, cx, cy, radius, intensity) {
        const time = this.time;
        
        // 顶部旋转云层
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + time * 0.3;
            const dist = radius * 0.6;
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist * 0.3;
            
            const gradient = this.createSafeRadialGradient(x, y, 0, x, y, radius * 0.4);
            if (gradient) {
                gradient.addColorStop(0, `rgba(100, 100, 100, ${0.5 * intensity})`);
                gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
                ctx.fillStyle = gradient;
            }
            ctx.beginPath();
            ctx.ellipse(x, y, radius * 0.4, radius * 0.15, angle, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// 岩浆渲染器
class MagmaRenderer extends Disaster3DRenderer {
    render(disaster, magmaAreas, centerX, centerY, deltaTime) {
        const ctx = this.ctx;
        const level = DisasterLevelConfig.getLevel(safeNumber(disaster.intensity, 1));
        const intensity = safeNumber(disaster.intensity, 1) * level.effectIntensity;
        
        this.updateTime(deltaTime);
        
        // 安全化中心坐标
        const cx = safeNumber(centerX, 500);
        const cy = safeNumber(centerY, 400);
        
        ctx.save();
        
        // 渲染每个岩浆区域
        if (magmaAreas && magmaAreas.length > 0) {
            magmaAreas.forEach((area, index) => {
                this.renderMagmaArea(ctx, area, intensity, index);
            });
        } else {
            // 默认中心区域
            this.renderMagmaArea(ctx, { x: cx, y: cy, radius: 100 }, intensity, 0);
        }
        
        // 全局热浪效果
        this.renderHeatWave(ctx, centerX, centerY, intensity);
        
        ctx.restore();
    }
    
    renderMagmaArea(ctx, area, intensity, index) {
        const time = this.time + index;
        const cx = safeNumber(area.x, 500);
        const cy = safeNumber(area.y, 400);
        const radius = safeRadius(area.radius, 80);
        
        // 1. 外部热气
        this.renderHeatAura(ctx, cx, cy, radius, intensity);
        
        // 2. 岩浆池主体
        this.renderMagmaPool(ctx, cx, cy, radius, intensity, time);
        
        // 3. 岩浆流动纹理
        this.renderMagmaFlow(ctx, cx, cy, radius, intensity, time);
        
        // 4. 气泡和喷发
        this.renderBubbles(ctx, cx, cy, radius, intensity, time);
        
        // 5. 火星飞溅
        this.renderSparks(ctx, cx, cy, radius, intensity, time);
    }
    
    renderHeatAura(ctx, cx, cy, radius, intensity) {
        const gradient = this.createSafeRadialGradient(cx, cy, radius, cx, cy, radius * 2);
        if (gradient) {
            gradient.addColorStop(0, `rgba(255, 100, 0, ${0.3 * intensity})`);
            gradient.addColorStop(0.5, `rgba(255, 50, 0, ${0.15 * intensity})`);
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            ctx.fillStyle = gradient;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, radius * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderMagmaPool(ctx, cx, cy, radius, intensity, time) {
        // 岩浆池渐变
        const gradient = this.createSafeRadialGradient(cx, cy, 0, cx, cy, radius);
        if (gradient) {
            gradient.addColorStop(0, `rgba(255, 255, 200, ${0.9 * intensity})`);
            gradient.addColorStop(0.2, `rgba(255, 200, 50, ${0.8 * intensity})`);
            gradient.addColorStop(0.5, `rgba(255, 100, 0, ${0.7 * intensity})`);
            gradient.addColorStop(0.8, `rgba(200, 50, 0, ${0.6 * intensity})`);
            gradient.addColorStop(1, `rgba(100, 20, 0, ${0.5 * intensity})`);
            ctx.fillStyle = gradient;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 边缘发光
        ctx.strokeStyle = `rgba(255, 150, 0, ${0.8 * intensity})`;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    renderMagmaFlow(ctx, cx, cy, radius, intensity, time) {
        // 流动的岩浆纹理
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + time * 0.5;
            const flowRadius = radius * 0.7;
            
            ctx.strokeStyle = `rgba(255, 200, 100, ${0.5 * intensity})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            
            for (let j = 0; j <= 20; j++) {
                const progress = j / 20;
                const r = flowRadius * progress;
                const wobble = Math.sin(progress * Math.PI * 4 + time * 3 + i) * 10;
                const x = cx + Math.cos(angle + progress * 0.5) * (r + wobble);
                const y = cy + Math.sin(angle + progress * 0.5) * (r + wobble);
                
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    }
    
    renderBubbles(ctx, cx, cy, radius, intensity, time) {
        // 岩浆气泡
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time;
            const dist = radius * 0.5 * (0.5 + Math.sin(time * 2 + i) * 0.3);
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist;
            const bubbleSize = safeRadius(5 + Math.sin(time * 4 + i * 2) * 3, 2);
            
            // 气泡
            const gradient = this.createSafeRadialGradient(x, y, 0, x, y, bubbleSize);
            if (gradient) {
                gradient.addColorStop(0, `rgba(255, 255, 200, ${0.9 * intensity})`);
                gradient.addColorStop(0.5, `rgba(255, 150, 50, ${0.7 * intensity})`);
                gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
                ctx.fillStyle = gradient;
            }
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, bubbleSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderSparks(ctx, cx, cy, radius, intensity, time) {
        // 火星飞溅
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = radius * (0.3 + Math.random() * 0.7);
            const height = Math.sin(time * 5 + i) * 30 + Math.random() * 20;
            const x = cx + Math.cos(angle) * dist;
            const y = cy - height + Math.sin(angle) * dist * 0.2;
            
            ctx.fillStyle = `rgba(255, ${200 + Math.random() * 55}, 0, ${0.8 * intensity})`;
            ctx.beginPath();
            ctx.arc(x, y, 2 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderHeatWave(ctx, cx, cy, intensity) {
        const time = this.time;
        
        // 热浪扭曲效果
        ctx.strokeStyle = `rgba(255, 200, 100, ${0.1 * intensity})`;
        ctx.lineWidth = 20;
        
        ctx.beginPath();
        for (let i = 0; i <= 20; i++) {
            const x = cx - 100 + i * 10;
            const y = cy + Math.sin(time * 2 + i * 0.5) * 10;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

// 闪电渲染器
class LightningRenderer extends Disaster3DRenderer {
    render(disaster, centerX, centerY, deltaTime) {
        const ctx = this.ctx;
        const level = DisasterLevelConfig.getLevel(safeNumber(disaster.intensity, 1));
        const intensity = safeNumber(disaster.intensity, 1) * level.effectIntensity;
        
        this.updateTime(deltaTime);
        
        // 安全化中心坐标
        const cx = safeNumber(centerX, 500);
        const cy = safeNumber(centerY, 400);
        
        ctx.save();
        
        // 1. 云层
        this.renderStormClouds(ctx, cx, cy, intensity);
        
        // 2. 闪电主体
        this.renderLightningBolt(ctx, cx, cy, intensity);
        
        // 3. 光晕效果
        this.renderGlow(ctx, cx, cy, intensity);
        
        // 4. 电弧
        this.renderArcs(ctx, cx, cy, intensity);
        
        ctx.restore();
    }
    
    renderStormClouds(ctx, cx, cy, intensity) {
        const time = this.time;
        
        // 暴风云层
        for (let i = 0; i < 5; i++) {
            const x = cx + (i - 2) * 80;
            const y = cy - 200 + Math.sin(time + i) * 10;
            const radius = safeRadius(60 + Math.sin(time * 2 + i) * 10, 30);
            
            const gradient = this.createSafeRadialGradient(x, y, 0, x, y, radius);
            if (gradient) {
                gradient.addColorStop(0, `rgba(50, 50, 70, ${0.9 * intensity})`);
                gradient.addColorStop(0.5, `rgba(30, 30, 50, ${0.7 * intensity})`);
                gradient.addColorStop(1, 'rgba(20, 20, 40, 0)');
                ctx.fillStyle = gradient;
            }
            ctx.beginPath();
            ctx.ellipse(x, y, radius, radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderLightningBolt(ctx, cx, cy, intensity) {
        const time = this.time;
        
        // 主闪电
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * intensity})`;
        ctx.lineWidth = 4;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 20;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - 180);
        
        let x = cx;
        let y = cy - 180;
        const segments = 12;
        
        for (let i = 0; i < segments; i++) {
            const progress = i / segments;
            x += (Math.random() - 0.5) * 40;
            y += 20;
            ctx.lineTo(x, y);
            
            // 分支
            if (Math.random() < 0.3) {
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);
                
                let bx = x;
                let by = y;
                for (let j = 0; j < 3; j++) {
                    bx += (Math.random() - 0.5) * 30;
                    by += 15;
                    ctx.lineTo(bx, by);
                }
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    
    renderGlow(ctx, cx, cy, intensity) {
        // 中心光晕
        const gradient = this.createSafeRadialGradient(cx, cy, 0, cx, cy, 100);
        if (gradient) {
            gradient.addColorStop(0, `rgba(200, 200, 255, ${0.5 * intensity})`);
            gradient.addColorStop(0.5, `rgba(150, 150, 255, ${0.2 * intensity})`);
            gradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
            ctx.fillStyle = gradient;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, 100, 0, Math.PI * 2);
        ctx.fill();
    }
    
    renderArcs(ctx, cx, cy, intensity) {
        const time = this.time;
        
        // 电弧效果
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + time * 2;
            const radius = 50 + Math.sin(time * 3 + i) * 20;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;
            
            ctx.strokeStyle = `rgba(150, 150, 255, ${0.5 * intensity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

// 沙尘暴渲染器
class SandstormRenderer extends Disaster3DRenderer {
    render(disaster, centerX, centerY, deltaTime) {
        const ctx = this.ctx;
        const level = DisasterLevelConfig.getLevel(safeNumber(disaster.intensity, 1));
        const intensity = safeNumber(disaster.intensity, 1) * level.effectIntensity;
        
        this.updateTime(deltaTime);
        
        // 安全化中心坐标
        const cx = safeNumber(centerX, 500);
        const cy = safeNumber(centerY, 400);
        
        ctx.save();
        
        // 1. 沙尘墙
        this.renderSandWall(ctx, cx, cy, intensity);
        
        // 2. 飞沙粒子
        this.renderSandParticles(ctx, cx, cy, intensity);
        
        // 3. 沙丘
        this.renderSandDunes(ctx, cx, cy, intensity);
        
        // 4. 风带
        this.renderWindBands(ctx, cx, cy, intensity);
        
        ctx.restore();
    }
    
    renderSandWall(ctx, cx, cy, intensity) {
        const time = this.time;
        
        // 沙尘墙
        const gradient = ctx.createLinearGradient(cx - 200, cy, cx + 200, cy);
        gradient.addColorStop(0, 'rgba(243, 156, 18, 0)');
        gradient.addColorStop(0.3, `rgba(243, 156, 18, ${0.4 * intensity})`);
        gradient.addColorStop(0.5, `rgba(211, 84, 0, ${0.6 * intensity})`);
        gradient.addColorStop(0.7, `rgba(243, 156, 18, ${0.4 * intensity})`);
        gradient.addColorStop(1, 'rgba(243, 156, 18, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(cx - 300, cy - 200, 600, 400);
        
        // 沙尘波浪
        for (let i = 0; i < 10; i++) {
            const y = cy - 150 + i * 30;
            const wave = Math.sin(time * 2 + i * 0.5) * 20;
            
            ctx.strokeStyle = `rgba(211, 84, 0, ${0.3 * intensity})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx - 250, y + wave);
            ctx.quadraticCurveTo(cx, y - wave, cx + 250, y + wave);
            ctx.stroke();
        }
    }
    
    renderSandParticles(ctx, cx, cy, intensity) {
        const time = this.time;
        
        for (let i = 0; i < 100; i++) {
            const x = cx + (Math.random() - 0.5) * 400 + time * 100 % 400;
            const y = cy + (Math.random() - 0.5) * 300;
            const size = 1 + Math.random() * 3;
            
            ctx.fillStyle = `rgba(243, 156, 18, ${0.3 * intensity * Math.random()})`;
            ctx.fillRect(x, y, size, size);
        }
    }
    
    renderSandDunes(ctx, cx, cy, intensity) {
        const time = this.time;
        
        // 地面沙丘
        ctx.fillStyle = `rgba(211, 84, 0, ${0.4 * intensity})`;
        ctx.beginPath();
        ctx.moveTo(cx - 300, cy + 150);
        
        for (let i = 0; i <= 10; i++) {
            const x = cx - 300 + i * 60;
            const y = cy + 150 + Math.sin(time + i) * 10;
            ctx.lineTo(x, y);
        }
        
        ctx.lineTo(cx + 300, cy + 200);
        ctx.lineTo(cx - 300, cy + 200);
        ctx.closePath();
        ctx.fill();
    }
    
    renderWindBands(ctx, cx, cy, intensity) {
        const time = this.time;
        
        // 风带
        for (let i = 0; i < 5; i++) {
            const y = cy - 100 + i * 50;
            const offset = time * 50 % 200;
            
            ctx.strokeStyle = `rgba(255, 200, 100, ${0.2 * intensity})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([10, 20]);
            ctx.lineDashOffset = -offset;
            
            ctx.beginPath();
            ctx.moveTo(cx - 250, y);
            ctx.lineTo(cx + 250, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }
}

// 暴风雪渲染器
class BlizzardRenderer extends Disaster3DRenderer {
    render(disaster, centerX, centerY, deltaTime) {
        const ctx = this.ctx;
        const level = DisasterLevelConfig.getLevel(safeNumber(disaster.intensity, 1));
        const intensity = safeNumber(disaster.intensity, 1) * level.effectIntensity;
        
        this.updateTime(deltaTime);
        
        // 安全化中心坐标
        const cx = safeNumber(centerX, 500);
        const cy = safeNumber(centerY, 400);
        
        ctx.save();
        
        // 1. 雪云
        this.renderSnowClouds(ctx, cx, cy, intensity);
        
        // 2. 暴雪粒子
        this.renderSnowflakes(ctx, cx, cy, intensity);
        
        // 3. 风雪带
        this.renderSnowBands(ctx, cx, cy, intensity);
        
        // 4. 地面积雪
        this.renderSnowGround(ctx, cx, cy, intensity);
        
        // 5. 冰晶效果
        this.renderIceCrystals(ctx, cx, cy, intensity);
        
        ctx.restore();
    }
    
    renderSnowClouds(ctx, cx, cy, intensity) {
        const time = this.time;
        
        // 雪云
        for (let i = 0; i < 6; i++) {
            const x = cx + (i - 2.5) * 100 + Math.sin(time + i) * 20;
            const y = cy - 180 + Math.cos(time * 0.5 + i) * 10;
            const radius = safeRadius(70 + Math.sin(time + i) * 10, 30);
            
            const gradient = this.createSafeRadialGradient(x, y, 0, x, y, radius);
            if (gradient) {
                gradient.addColorStop(0, `rgba(236, 240, 241, ${0.9 * intensity})`);
                gradient.addColorStop(0.5, `rgba(189, 195, 199, ${0.7 * intensity})`);
                gradient.addColorStop(1, 'rgba(149, 165, 166, 0)');
                ctx.fillStyle = gradient;
            }
            ctx.beginPath();
            ctx.ellipse(x, y, radius, radius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderSnowflakes(ctx, cx, cy, intensity) {
        const time = this.time;
        
        // 雪花粒子
        for (let i = 0; i < 150; i++) {
            const baseX = (i * 17) % 500 - 250;
            const baseY = (i * 23) % 400 - 200;
            const x = cx + baseX + Math.sin(time * 2 + i) * 30;
            const y = cy + baseY + (time * 50 + i * 10) % 400 - 200;
            const size = 2 + Math.random() * 4;
            
            // 雪花形状
            ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * intensity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // 雪花光晕
            ctx.fillStyle = `rgba(236, 240, 241, ${0.3 * intensity})`;
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    renderSnowBands(ctx, cx, cy, intensity) {
        const time = this.time;
        
        // 风雪带
        for (let i = 0; i < 8; i++) {
            const y = cy - 150 + i * 40;
            const offset = time * 80 % 300;
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * intensity})`;
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 15]);
            ctx.lineDashOffset = -offset;
            
            ctx.beginPath();
            ctx.moveTo(cx - 280, y + Math.sin(time + i) * 10);
            ctx.quadraticCurveTo(cx, y - 20, cx + 280, y + Math.sin(time + i + 1) * 10);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }
    
    renderSnowGround(ctx, cx, cy, intensity) {
        // 地面积雪
        const gradient = ctx.createLinearGradient(cx, cy + 100, cx, cy + 200);
        gradient.addColorStop(0, `rgba(236, 240, 241, ${0.6 * intensity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${0.3 * intensity})`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(cx - 300, cy + 150);
        ctx.quadraticCurveTo(cx, cy + 130, cx + 300, cy + 150);
        ctx.lineTo(cx + 300, cy + 200);
        ctx.lineTo(cx - 300, cy + 200);
        ctx.closePath();
        ctx.fill();
    }
    
    renderIceCrystals(ctx, cx, cy, intensity) {
        const time = this.time;
        
        // 冰晶闪烁
        for (let i = 0; i < 20; i++) {
            const x = cx + (Math.random() - 0.5) * 400;
            const y = cy + (Math.random() - 0.5) * 300;
            const sparkle = Math.sin(time * 5 + i * 2) > 0.8;
            
            if (sparkle) {
                ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// 灾害视觉效果管理器
class DisasterVisualManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.renderers = {
            tornado: new TornadoRenderer(ctx),
            magmaEruption: new MagmaRenderer(ctx),
            thunderstorm: new LightningRenderer(ctx),
            sandstorm: new SandstormRenderer(ctx),
            blizzard: new BlizzardRenderer(ctx)
        };
        this.activeDisasters = new Map();
    }
    
    /**
     * 注册灾害
     */
    registerDisaster(disaster) {
        const id = disaster.id || Date.now();
        this.activeDisasters.set(id, {
            ...disaster,
            startTime: Date.now(),
            lastUpdate: Date.now()
        });
        return id;
    }
    
    /**
     * 更新灾害
     */
    updateDisaster(id, updates) {
        const disaster = this.activeDisasters.get(id);
        if (disaster) {
            Object.assign(disaster, updates);
            disaster.lastUpdate = Date.now();
        }
    }
    
    /**
     * 移除灾害
     */
    removeDisaster(id) {
        this.activeDisasters.delete(id);
    }
    
    /**
     * 渲染所有活跃灾害
     */
    renderAll(deltaTime) {
        this.activeDisasters.forEach((disaster, id) => {
            this.renderDisaster(disaster, deltaTime);
        });
    }
    
    /**
     * 渲染单个灾害
     */
    renderDisaster(disaster, deltaTime) {
        const renderer = this.renderers[disaster.type];
        if (!renderer) return;
        
        const centerX = disaster.centerX || disaster.tornadoCenter?.x || disaster.eruptionCenter?.x || 500;
        const centerY = disaster.centerY || disaster.tornadoCenter?.y || disaster.eruptionCenter?.y || 400;
        
        renderer.render(disaster, disaster.magmaAreas, centerX, centerY, deltaTime);
    }
    
    /**
     * 获取灾害等级信息
     */
    getDisasterLevel(intensity) {
        return DisasterLevelConfig.getLevel(intensity);
    }
}

// 导出
try {
    module.exports = {
        DisasterLevelConfig,
        Disaster3DRenderer,
        TornadoRenderer,
        MagmaRenderer,
        LightningRenderer,
        SandstormRenderer,
        BlizzardRenderer,
        DisasterVisualManager
    };
} catch (e) {
    window.DisasterLevelConfig = DisasterLevelConfig;
    window.Disaster3DRenderer = Disaster3DRenderer;
    window.TornadoRenderer = TornadoRenderer;
    window.MagmaRenderer = MagmaRenderer;
    window.LightningRenderer = LightningRenderer;
    window.SandstormRenderer = SandstormRenderer;
    window.BlizzardRenderer = BlizzardRenderer;
    window.DisasterVisualManager = DisasterVisualManager;
}
