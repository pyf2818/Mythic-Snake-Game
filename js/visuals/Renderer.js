class Renderer {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1000;
        this.canvas.height = 800;
        
        console.log('Creating canvas:', this.canvas.width, 'x', this.canvas.height);
        
        // 添加到DOM
        const canvasContainer = document.getElementById('game-canvas');
        console.log('Canvas container:', canvasContainer);
        if (canvasContainer) {
            canvasContainer.appendChild(this.canvas);
            console.log('Canvas added to container');
        } else {
            document.body.appendChild(this.canvas);
            console.log('Canvas added to body');
        }
        console.log('Canvas created and added to DOM');

        
        // 相机系统
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1
        };
        
        // 图层管理
        this.layers = {
            background: [],
            terrain: [],
            objects: [],
            effects: [],
            ui: []
        };
        
        // 特效管理
        this.particles = [];
        this.particlePool = [];
        this.maxParticles = 100;
        
        // 屏幕震动效果
        this.screenShake = {
            intensity: 0,
            duration: 0,
            timer: 0
        };
    }
    
    addScreenShake(intensity, duration) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
        this.screenShake.timer = 0;
    }
    
    update(deltaTime) {
        // 更新粒子效果
        this.updateParticles(deltaTime);
        
        // 更新屏幕震动
        if (this.screenShake.timer < this.screenShake.duration) {
            this.screenShake.timer += deltaTime;
        }
    }
    
    render() {
        // 仅在开发模式下输出日志
        const isDevMode = false;
        if (isDevMode) {
            console.log('Renderer.render() called');
        }
        
        // 应用屏幕震动
        this.ctx.save();
        if (this.screenShake.timer < this.screenShake.duration) {
            const progress = this.screenShake.timer / this.screenShake.duration;
            const currentIntensity = this.screenShake.intensity * (1 - progress);
            const shakeX = (Math.random() - 0.5) * currentIntensity * 2;
            const shakeY = (Math.random() - 0.5) * currentIntensity * 2;
            this.ctx.translate(shakeX, shakeY);
        }
        
        // 清空画布
        this.clear();
        
        // 渲染背景
        this.renderBackground();
        
        // 渲染地形
        this.renderTerrain();
        
        // 渲染游戏对象
        if (isDevMode) {
            console.log('Rendering game objects:', this.gameManager.gameObjects.length);
        }
        this.renderObjects();
        
        // 渲染特效
        this.renderEffects();
        
        // 渲染UI
        this.renderUI();
        
        this.ctx.restore();
    }
    
    clear() {
        // 清空画布
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderBackground() {
        // 渲染背景
        const dayNight = this.gameManager.systems.dayNight;
        if (dayNight) {
            // 使用DayNight系统的getAmbientColor方法获取背景颜色（支持平滑过渡）
            const bgColor = dayNight.getAmbientColor();
            
            this.ctx.fillStyle = bgColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // 渲染星星（夜晚）
        if (dayNight && dayNight.isNight()) {
            this.renderStars();
        }
    }
    
    renderStars() {
        // 渲染星星
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2 + 1;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    renderTerrain() {
        // 渲染地形
        const terrain = this.gameManager.systems.terrain;
        if (terrain && terrain.terrainData) {
            const data = terrain.terrainData;
            const cellSize = terrain.cellSize;
            
            for (let y = 0; y < data.length; y++) {
                for (let x = 0; x < data[y].length; x++) {
                    const height = data[y][x];
                    let color;
                    
                    // 根据高度设置颜色
                    if (height < 0.3) {
                        // 水域
                        color = '#45b7d1';
                    } else if (height < 0.5) {
                        // 沙滩
                        color = '#ffcc5c';
                    } else if (height < 0.7) {
                        // 草地
                        color = '#96ceb4';
                    } else if (height < 0.9) {
                        // 森林
                        color = '#4caa88';
                    } else {
                        // 山地
                        color = '#6c757d';
                    }
                    
                    // 应用季节颜色变化
                    const season = this.gameManager.systems.season;
                    if (season) {
                        color = this.applySeasonColor(color, season);
                    }
                    
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
    }
    
    renderObjects() {
        // 渲染游戏对象
        this.gameManager.gameObjects.forEach(obj => {
            if (obj.render) {
                // 统一传递ctx参数，让对象自己决定是否使用
                obj.render(this.ctx);
            } else {
                // 默认渲染
                this.renderDefaultObject(obj);
            }
        });
    }
    
    renderDefaultObject(obj) {
        // 默认渲染方法
        this.ctx.fillStyle = obj.color || '#ffffff';
        this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        
        // 渲染边框
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    }
    
    renderEffects() {
        // 渲染粒子效果
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    renderUI() {
        // UI由HTML/CSS处理，这里可以添加一些游戏内的UI元素
    }
    
    updateParticles(deltaTime) {
        // 更新粒子效果
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // 更新位置
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            
            // 更新生命周期
            particle.lifetime -= deltaTime;
            particle.opacity -= deltaTime * 2;
            
            // 更新大小
            particle.size -= deltaTime * 0.5;
            
            // 移除死亡粒子
            if (particle.lifetime <= 0 || particle.opacity <= 0 || particle.size <= 0 || 
                particle.x < -50 || particle.x > 1050 || particle.y < -50 || particle.y > 850) {
                // 将粒子放回对象池
                this.recycleParticle(particle);
                this.particles.splice(i, 1);
            }
        }
    }
    
    recycleParticle(particle) {
        // 重置粒子属性
        particle.x = 0;
        particle.y = 0;
        particle.size = 0;
        particle.color = '#ffffff';
        particle.velocity = { x: 0, y: 0 };
        particle.lifetime = 0;
        particle.opacity = 0;
        
        // 将粒子添加到对象池
        if (this.particlePool.length < 50) {
            this.particlePool.push(particle);
        }
    }
    
    addParticle(particle) {
        // 添加粒子效果
        // 检查粒子数量限制
        if (this.particles.length >= this.maxParticles) {
            return;
        }
        
        let newParticle;
        
        // 从对象池获取粒子
        if (this.particlePool.length > 0) {
            newParticle = this.particlePool.pop();
        } else {
            // 创建新粒子
            newParticle = {};
        }
        
        // 设置粒子属性
        newParticle.x = particle.x;
        newParticle.y = particle.y;
        newParticle.size = particle.size || 5;
        newParticle.color = particle.color || '#ffffff';
        newParticle.velocity = particle.velocity || { x: 0, y: 0 };
        newParticle.lifetime = particle.lifetime || 1;
        newParticle.opacity = particle.opacity || 1;
        
        // 添加到粒子列表
        this.particles.push(newParticle);
    }
    
    applySeasonColor(color, season) {
        // 根据季节调整颜色
        if (!season) return color;
        
        const tint = season.getSeasonColorTint();
        return this.applyColorTint(color, tint);
    }
    
    applyColorTint(color, tint) {
        // 应用颜色 tint
        const rgb = this.hexToRgb(color);
        const tintedRgb = {
            r: Math.round(rgb.r * tint.r),
            g: Math.round(rgb.g * tint.g),
            b: Math.round(rgb.b * tint.b)
        };
        return this.rgbToHex(tintedRgb.r, tintedRgb.g, tintedRgb.b);
    }
    
    hexToRgb(hex) {
        // 十六进制颜色转RGB
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    rgbToHex(r, g, b) {
        // RGB转十六进制颜色
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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
    
    saturateColor(color, percent) {
        // 增加饱和度
        // 这里使用简化的实现，实际项目中可以使用HSL颜色空间
        return color;
    }
    
    changeHue(color, degrees) {
        // 改变色相
        // 这里使用简化的实现，实际项目中可以使用HSL颜色空间
        return color;
    }
    
    setCameraPosition(x, y) {
        // 设置相机位置
        this.camera.x = x;
        this.camera.y = y;
    }
    
    setCameraZoom(zoom) {
        // 设置相机缩放
        this.camera.zoom = Math.max(0.5, Math.min(2, zoom));
    }
    
    getScreenPosition(worldX, worldY) {
        // 世界坐标转屏幕坐标
        return {
            x: (worldX - this.camera.x) * this.camera.zoom,
            y: (worldY - this.camera.y) * this.camera.zoom
        };
    }
    
    getWorldPosition(screenX, screenY) {
        // 屏幕坐标转世界坐标
        return {
            x: screenX / this.camera.zoom + this.camera.x,
            y: screenY / this.camera.zoom + this.camera.y
        };
    }
    
    reset() {
        // 重置渲染器
        this.particles = [];
        this.layers = {
            background: [],
            terrain: [],
            objects: [],
            effects: [],
            ui: []
        };
    }
}

// 导出渲染器
try {
    module.exports = Renderer;
} catch (e) {
    // 浏览器环境
    window.Renderer = Renderer;
}