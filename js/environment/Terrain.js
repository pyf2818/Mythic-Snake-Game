class Terrain {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.width = 1000;
        this.height = 800;
        this.cellSize = 20;
        this.gridWidth = Math.ceil(this.width / this.cellSize);
        this.gridHeight = Math.ceil(this.height / this.cellSize);
        
        this.terrainData = [];
        this.noiseScale = 0.02;
        this.octaves = 4;
        this.persistence = 0.5;
        this.lacunarity = 2;
        
        this.regenerateTimer = 0;
        this.regenerateInterval = 10; // 每10秒更新一次地形
        this.updateTimer = 0;
        this.updateInterval = 0.5; // 每0.5秒进行一次渐进式更新
        
        // 初始化Perlin噪声
        this.perlin = new Perlin();
        this.baseSeed = Math.random() * 1000000;
        this.perlin.seed(this.baseSeed);
        
        // 生成初始地形
        this.generateTerrain();
    }
    
    update(deltaTime) {
        // 更新地形生成计时器
        this.regenerateTimer += deltaTime;
        this.updateTimer += deltaTime;
        
        // 每10秒完全重新生成一次地形
        if (this.regenerateTimer >= this.regenerateInterval) {
            this.regenerateTimer = 0;
            this.baseSeed = Math.random() * 1000000;
            this.perlin.seed(this.baseSeed);
            this.generateTerrain();
        }
        
        // 每0.5秒进行一次渐进式地形更新
        if (this.updateTimer >= this.updateInterval) {
            this.updateTimer = 0;
            this.progressiveUpdate(deltaTime);
        }
    }
    
    generateTerrain() {
        // 生成地形数据
        this.terrainData = [];
        for (let y = 0; y < this.gridHeight; y++) {
            const row = [];
            for (let x = 0; x < this.gridWidth; x++) {
                // 使用Perlin噪声生成高度值
                const height = this.noise(x, y);
                row.push(height);
            }
            this.terrainData.push(row);
        }
        
        console.log('地形已重新生成');
    }
    
    progressiveUpdate(deltaTime) {
        // 渐进式地形更新
        const updateAreaSize = 5; // 更新区域大小
        const centerX = Math.floor(this.gridWidth / 2);
        const centerY = Math.floor(this.gridHeight / 2);
        
        // 围绕中心区域进行局部更新
        for (let y = centerY - updateAreaSize; y < centerY + updateAreaSize; y++) {
            for (let x = centerX - updateAreaSize; x < centerX + updateAreaSize; x++) {
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    // 使用时间作为偏移量，创建动态变化的地形
                    const timeOffset = Date.now() * 0.0001;
                    const noiseValue = this.perlin.noise(
                        x * this.noiseScale + timeOffset,
                        y * this.noiseScale + timeOffset
                    );
                    
                    // 只进行小幅度的地形变化
                    const currentHeight = this.terrainData[y][x];
                    const newHeight = Math.max(0, Math.min(1, currentHeight + (noiseValue * 0.02)));
                    this.terrainData[y][x] = newHeight;
                }
            }
        }
    }
    
    noise(x, y) {
        // 多八度Perlin噪声
        let total = 0;
        let frequency = 1;
        let amplitude = 1;
        let maxValue = 0;
        
        for (let i = 0; i < this.octaves; i++) {
            const noiseValue = this.perlin.noise(x * this.noiseScale * frequency, y * this.noiseScale * frequency);
            total += noiseValue * amplitude;
            maxValue += amplitude;
            amplitude *= this.persistence;
            frequency *= this.lacunarity;
        }
        
        // 归一化到0-1范围
        return (total / maxValue + 1) / 2;
    }
    
    getTerrainType(x, y) {
        // 根据坐标获取地形类型
        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);
        
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            const height = this.terrainData[gridY][gridX];
            
            if (height < 0.3) {
                return 'water';
            } else if (height < 0.5) {
                return 'sand';
            } else if (height < 0.7) {
                return 'grass';
            } else if (height < 0.9) {
                return 'forest';
            } else {
                return 'mountain';
            }
        }
        
        return 'grass'; // 默认地形
    }
    
    getHeight(x, y) {
        // 根据坐标获取地形高度
        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);
        
        if (gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight) {
            return this.terrainData[gridY][gridX];
        }
        
        return 0.5; // 默认高度
    }
    
    isWalkable(x, y) {
        // 检查地形是否可行走
        const terrainType = this.getTerrainType(x, y);
        return terrainType !== 'water'; // 水域不可行走
    }
    
    isSwimmable(x, y) {
        // 检查地形是否可游泳
        const terrainType = this.getTerrainType(x, y);
        return terrainType === 'water'; // 只有水域可游泳
    }
    
    getMovementSpeed(x, y) {
        // 根据地形类型获取移动速度修正
        const terrainType = this.getTerrainType(x, y);
        
        switch (terrainType) {
            case 'water':
                return 0.5; // 水中移动速度慢
            case 'sand':
                return 0.8; // 沙滩移动速度较慢
            case 'grass':
                return 1.0; // 草地正常速度
            case 'forest':
                return 0.9; // 森林移动速度稍慢
            case 'mountain':
                return 0.7; // 山地移动速度慢
            default:
                return 1.0;
        }
    }
    
    reset() {
        // 重置地形系统
        this.regenerateTimer = 0;
        this.generateTerrain();
    }
    
    serialize() {
        // 序列化地形状态
        return {
            regenerateTimer: this.regenerateTimer,
            terrainData: this.terrainData
        };
    }
    
    deserialize(data) {
        // 反序列化地形状态
        this.regenerateTimer = data.regenerateTimer;
        if (data.terrainData) {
            this.terrainData = data.terrainData;
        }
    }
}

// Perlin噪声实现
class Perlin {
    constructor() {
        this.p = new Array(256);
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }
        // 重复数组以避免边界检查
        this.permutation = new Array(512);
        for (let i = 0; i < 512; i++) {
            this.permutation[i] = this.p[i & 255];
        }
    }
    
    seed(seed) {
        // 使用种子初始化噪声
        this.p = new Array(256);
        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }
        
        // Fisher-Yates 洗牌算法
        for (let i = 255; i > 0; i--) {
            const j = Math.floor((seed * i) % (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
            seed = (seed * 9301 + 49297) % 233280;
        }
        
        // 重复数组
        this.permutation = new Array(512);
        for (let i = 0; i < 512; i++) {
            this.permutation[i] = this.p[i & 255];
        }
    }
    
    noise(x, y) {
        // 2D Perlin噪声
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const A = this.permutation[X] + Y;
        const AA = this.permutation[A];
        const AB = this.permutation[A + 1];
        const B = this.permutation[X + 1] + Y;
        const BA = this.permutation[B];
        const BB = this.permutation[B + 1];
        
        return this.lerp(v, this.lerp(u, this.grad(this.permutation[AA], x, y),
                               this.grad(this.permutation[BA], x - 1, y)),
                       this.lerp(u, this.grad(this.permutation[AB], x, y - 1),
                               this.grad(this.permutation[BB], x - 1, y - 1)));
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    
    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
}

// 导出地形系统
try {
    module.exports = Terrain;
} catch (e) {
    // 浏览器环境
    window.Terrain = Terrain;
    window.Perlin = Perlin;
}