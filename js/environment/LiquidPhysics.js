class LiquidPhysics {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.liquids = [];
        this.gridSize = 10;
        this.gridWidth = Math.ceil(1000 / this.gridSize);
        this.gridHeight = Math.ceil(800 / this.gridSize);
        
        // 初始化网格
        this.grid = [];
        for (let y = 0; y < this.gridHeight; y++) {
            const row = [];
            for (let x = 0; x < this.gridWidth; x++) {
                row.push(null);
            }
            this.grid.push(row);
        }
        
        // 液体类型定义
        this.liquidTypes = {
            water: {
                name: '水',
                color: '#45b7d1',
                density: 1.0,
                viscosity: 0.5,
                temperature: 20,
                effect: 'slow'
            },
            lava: {
                name: '岩浆',
                color: '#ff6b6b',
                density: 3.0,
                viscosity: 0.8,
                temperature: 1000,
                effect: 'damage'
            },
            poison: {
                name: '毒液',
                color: '#96ceb4',
                density: 1.2,
                viscosity: 0.6,
                temperature: 25,
                effect: 'poison'
            }
        };
    }
    
    update(deltaTime) {
        // 更新液体流动
        this.updateLiquidFlow(deltaTime);
        
        // 更新液体效果
        this.updateLiquidEffects(deltaTime);
    }
    
    updateLiquidFlow(deltaTime) {
        // 简化的液体流动模拟
        // 1. 检查每个液体网格
        // 2. 根据密度和重力计算流动方向
        // 3. 应用流动效果
        
        // 这里使用简化的实现，实际项目中可以使用更复杂的流体力学算法
        for (let y = this.gridHeight - 1; y >= 0; y--) {
            for (let x = 0; x < this.gridWidth; x++) {
                const liquid = this.grid[y][x];
                if (liquid) {
                    // 尝试向下流动
                    if (y < this.gridHeight - 1 && !this.grid[y + 1][x]) {
                        this.grid[y + 1][x] = liquid;
                        this.grid[y][x] = null;
                    } else {
                        // 尝试向左右流动
                        const left = x > 0 && !this.grid[y][x - 1];
                        const right = x < this.gridWidth - 1 && !this.grid[y][x + 1];
                        
                        if (left && right) {
                            // 随机选择左右
                            if (Math.random() > 0.5) {
                                this.grid[y][x - 1] = liquid;
                            } else {
                                this.grid[y][x + 1] = liquid;
                            }
                            this.grid[y][x] = null;
                        } else if (left) {
                            this.grid[y][x - 1] = liquid;
                            this.grid[y][x] = null;
                        } else if (right) {
                            this.grid[y][x + 1] = liquid;
                            this.grid[y][x] = null;
                        }
                    }
                }
            }
        }
    }
    
    updateLiquidEffects(deltaTime) {
        // 更新液体效果
        // 检查游戏对象与液体的交互
        this.gameManager.gameObjects.forEach(obj => {
            if (obj.collider) {
                const liquid = this.getLiquidAt(obj.x + obj.width / 2, obj.y + obj.height / 2);
                if (liquid) {
                    this.applyLiquidEffect(obj, liquid);
                }
            }
        });
    }
    
    addLiquid(type, x, y, amount = 1) {
        // 添加液体
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);
        
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            if (!this.grid[gridY][gridX]) {
                this.grid[gridY][gridX] = {
                    type: type,
                    properties: this.liquidTypes[type],
                    amount: amount
                };
            } else {
                // 液体混合
                this.mixLiquids(this.grid[gridY][gridX], type, amount);
            }
        }
    }
    
    removeLiquid(x, y) {
        // 移除液体
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);
        
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            this.grid[gridY][gridX] = null;
        }
    }
    
    getLiquidAt(x, y) {
        // 获取指定位置的液体
        const gridX = Math.floor(x / this.gridSize);
        const gridY = Math.floor(y / this.gridSize);
        
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            return this.grid[gridY][gridX];
        }
        
        return null;
    }
    
    mixLiquids(existingLiquid, newType, newAmount) {
        // 液体混合逻辑
        // 这里使用简化的实现，实际项目中可以使用更复杂的混合算法
        if (existingLiquid.type === newType) {
            // 同类型液体，增加量
            existingLiquid.amount += newAmount;
        } else {
            // 不同类型液体，根据密度决定哪种液体替换哪种
            const existingDensity = existingLiquid.properties.density;
            const newDensity = this.liquidTypes[newType].density;
            
            if (newDensity > existingDensity) {
                // 新液体密度更大，替换现有液体
                existingLiquid.type = newType;
                existingLiquid.properties = this.liquidTypes[newType];
                existingLiquid.amount = newAmount;
            }
        }
    }
    
    applyLiquidEffect(obj, liquid) {
        // 应用液体效果
        switch (liquid.properties.effect) {
            case 'slow':
                // 水：减慢移动速度
                if (obj.speed) {
                    obj.speed *= 0.7;
                }
                break;
            case 'damage':
                // 岩浆：造成伤害
                if (obj.energySystem) {
                    obj.energySystem.consume(5);
                }
                break;
            case 'poison':
                // 毒液：中毒效果
                if (obj.energySystem) {
                    obj.energySystem.consume(2);
                }
                break;
        }
    }
    
    render(ctx) {
        // 渲染液体
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const liquid = this.grid[y][x];
                if (liquid) {
                    renderCtx.fillStyle = liquid.properties.color;
                    renderCtx.globalAlpha = 0.7;
                    renderCtx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
                    renderCtx.globalAlpha = 1;
                }
            }
        }
    }
    
    reset() {
        // 重置液体物理系统
        this.liquids = [];
        
        // 清空网格
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                this.grid[y][x] = null;
            }
        }
    }
    
    serialize() {
        // 序列化液体物理系统状态
        return {
            grid: this.grid
        };
    }
    
    deserialize(data) {
        // 反序列化液体物理系统状态
        if (data.grid) {
            this.grid = data.grid;
        }
    }
}

// 导出液体物理系统
try {
    module.exports = LiquidPhysics;
} catch (e) {
    // 浏览器环境
    window.LiquidPhysics = LiquidPhysics;
}