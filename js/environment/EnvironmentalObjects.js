class EnvironmentalObject {
    constructor(gameManager, x, y, width, height) {
        this.gameManager = gameManager;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = 'environmental';
        this.id = Math.random().toString(36).substr(2, 9);
        this.collider = false; // Environmental objects don't collide
    }
    
    update(deltaTime) {
        // Base update method - can be overridden by subclasses
    }
    
    render(ctx) {
        // Base render method - should be overridden by subclasses
    }
    
    serialize() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            type: this.type,
            id: this.id
        };
    }
    
    deserialize(data) {
        this.x = data.x;
        this.y = data.y;
        this.width = data.width;
        this.height = data.height;
        this.type = data.type;
        this.id = data.id;
    }
}

class Tree extends EnvironmentalObject {
    constructor(gameManager, x, y) {
        super(gameManager, x, y, 20, 30); // 原始尺寸
        this.type = 'tree';
        this.variation = Math.floor(Math.random() * 3);
        this.trunkColor = '#8B4513';
        this.leafColors = ['#228B22', '#2E8B57', '#3CB371'];
        this.leafColor = this.leafColors[Math.floor(Math.random() * this.leafColors.length)];
        this.scale = 1; // 缩放因子（原10，现1，缩小10倍）
    }
    
    render(ctx) {
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        const s = this.scale; // 缩放因子
        
        // Draw trunk (pixel style)
        renderCtx.fillStyle = this.trunkColor;
        renderCtx.fillRect(this.x + 8*s, this.y + 20*s, 4*s, 10*s);
        
        // Draw leaves (pixel style)
        renderCtx.fillStyle = this.leafColor;
        
        switch (this.variation) {
            case 0:
                // Round tree top
                renderCtx.fillRect(this.x + 3*s, this.y + 5*s, 14*s, 15*s);
                renderCtx.fillRect(this.x + 5*s, this.y, 10*s, 10*s);
                break;
            case 1:
                // Triangular tree top
                for (let i = 0; i < 5; i++) {
                    const width = (18 - i * 4) * s;
                    const offset = (1 + i * 2) * s;
                    renderCtx.fillRect(this.x + offset, this.y + i * 5 * s, width, 5*s);
                }
                break;
            case 2:
                // Bushy tree top
                renderCtx.fillRect(this.x + 2*s, this.y + 10*s, 16*s, 10*s);
                renderCtx.fillRect(this.x + 4*s, this.y + 5*s, 12*s, 10*s);
                renderCtx.fillRect(this.x + 6*s, this.y, 8*s, 10*s);
                break;
        }
    }
}

class Rock extends EnvironmentalObject {
    constructor(gameManager, x, y) {
        super(gameManager, x, y, 15, 15); // 原始尺寸
        this.type = 'rock';
        this.variation = Math.floor(Math.random() * 3);
        this.rockColors = ['#808080', '#A9A9A9', '#708090'];
        this.rockColor = this.rockColors[Math.floor(Math.random() * this.rockColors.length)];
        this.scale = 1; // 缩放因子（原10，现1，缩小10倍）
    }
    
    render(ctx) {
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        renderCtx.fillStyle = this.rockColor;
        const s = this.scale; // 缩放因子
        
        switch (this.variation) {
            case 0:
                // Round rock
                renderCtx.fillRect(this.x + 3*s, this.y + 3*s, 9*s, 9*s);
                renderCtx.fillRect(this.x + 1*s, this.y + 5*s, 13*s, 5*s);
                renderCtx.fillRect(this.x + 5*s, this.y + 1*s, 5*s, 13*s);
                break;
            case 1:
                // Jagged rock
                renderCtx.fillRect(this.x + 5*s, this.y, 5*s, 5*s);
                renderCtx.fillRect(this.x + 2*s, this.y + 3*s, 11*s, 9*s);
                renderCtx.fillRect(this.x + 7*s, this.y + 10*s, 3*s, 5*s);
                break;
            case 2:
                // Flat rock
                renderCtx.fillRect(this.x, this.y + 5*s, 15*s, 10*s);
                renderCtx.fillRect(this.x + 3*s, this.y + 3*s, 9*s, 7*s);
                renderCtx.fillRect(this.x + 5*s, this.y, 5*s, 5*s);
                break;
        }
    }
}

class Beach extends EnvironmentalObject {
    constructor(gameManager, x, y) {
        super(gameManager, x, y, 15, 10); // 原始尺寸
        this.type = 'beach';
        this.variation = Math.floor(Math.random() * 3);
        this.sandColor = '#F5DEB3';
        this.detailColor = '#DEB887';
        this.scale = 1; // 缩放因子（原10，现1，缩小10倍）
    }
    
    render(ctx) {
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        const s = this.scale; // 缩放因子
        
        // Draw sand base
        renderCtx.fillStyle = this.sandColor;
        renderCtx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw beach details
        renderCtx.fillStyle = this.detailColor;
        
        switch (this.variation) {
            case 0:
                // Seashell
                renderCtx.fillRect(this.x + 5*s, this.y + 3*s, 5*s, 4*s);
                renderCtx.fillRect(this.x + 3*s, this.y + 4*s, 9*s, 2*s);
                break;
            case 1:
                // Driftwood
                renderCtx.fillRect(this.x + 2*s, this.y + 4*s, 11*s, 2*s);
                renderCtx.fillRect(this.x + 4*s, this.y + 2*s, 7*s, 6*s);
                break;
            case 2:
                // Sandcastle base
                renderCtx.fillRect(this.x + 3*s, this.y + 6*s, 9*s, 4*s);
                renderCtx.fillRect(this.x + 5*s, this.y + 3*s, 5*s, 7*s);
                renderCtx.fillRect(this.x + 6*s, this.y, 3*s, 6*s);
                break;
        }
    }
}

class Grass extends EnvironmentalObject {
    constructor(gameManager, x, y) {
        super(gameManager, x, y, 10, 10); // 原始尺寸
        this.type = 'grass';
        this.variation = Math.floor(Math.random() * 3);
        this.grassColors = ['#32CD32', '#98FB98', '#90EE90'];
        this.grassColor = this.grassColors[Math.floor(Math.random() * this.grassColors.length)];
        this.scale = 1; // 缩放因子（原10，现1，缩小10倍）
    }
    
    render(ctx) {
        const renderCtx = ctx || this.gameManager.systems.renderer.ctx;
        renderCtx.fillStyle = this.grassColor;
        const s = this.scale; // 缩放因子
        
        switch (this.variation) {
            case 0:
                // Single grass blade
                renderCtx.fillRect(this.x + 4*s, this.y + 3*s, 2*s, 7*s);
                renderCtx.fillRect(this.x + 3*s, this.y + 5*s, 4*s, 5*s);
                break;
            case 1:
                // Multiple grass blades
                renderCtx.fillRect(this.x + 2*s, this.y + 4*s, 2*s, 6*s);
                renderCtx.fillRect(this.x + 5*s, this.y + 2*s, 2*s, 8*s);
                renderCtx.fillRect(this.x + 8*s, this.y + 4*s, 2*s, 6*s);
                break;
            case 2:
                // Bushy grass
                renderCtx.fillRect(this.x + 1*s, this.y + 5*s, 8*s, 5*s);
                renderCtx.fillRect(this.x + 3*s, this.y + 3*s, 4*s, 7*s);
                break;
        }
    }
}

// EnvironmentalObjectsManager class to handle generation and management
class EnvironmentalObjectsManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.objects = [];
        this.maxObjects = 100; // 原50，提升最大对象数量
        this.spawnTimer = 0;
        this.spawnInterval = 5; // 原10秒，缩短生成间隔
        this.minDistance = 20; // 最小间距（原150，配合缩小的植物尺寸）
    }
    
    update(deltaTime) {
        // Update all environmental objects
        this.objects.forEach(obj => {
            if (obj.update) {
                obj.update(deltaTime);
            }
        });
        
        // Spawn new objects periodically
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnEnvironmentalObjects();
        }
    }
    
    spawnEnvironmentalObjects() {
        // Spawn environmental objects based on terrain type
        if (this.objects.length >= this.maxObjects) {
            return;
        }
        
        const terrain = this.gameManager.systems.terrain;
        if (!terrain) return;
        
        // Try to spawn 8 objects at a time (原5)
        for (let i = 0; i < 8; i++) {
            if (this.objects.length >= this.maxObjects) {
                break;
            }
            
            // Generate random position
            const x = Math.random() * (1000 - 100) + 50;
            const y = Math.random() * (800 - 100) + 50;
            
            // Check minimum distance from other objects
            if (!this.checkMinDistance(x, y)) {
                continue; // 太近，跳过
            }
            
            // Get terrain type at position
            const terrainType = terrain.getTerrainType(x, y);
            
            // Spawn appropriate object based on terrain type
            // 生成频率100%
            let newObject;
            switch (terrainType) {
                case 'forest':
                    newObject = new Tree(this.gameManager, x, y);
                    break;
                case 'mountain':
                    newObject = new Rock(this.gameManager, x, y);
                    break;
                case 'sand':
                    newObject = new Beach(this.gameManager, x, y);
                    break;
                case 'grass':
                    newObject = new Grass(this.gameManager, x, y);
                    break;
            }
            
            if (newObject) {
                this.objects.push(newObject);
                this.gameManager.addGameObject(newObject);
            }
        }
    }
    
    /**
     * 检查新位置与现有对象的最小距离
     * @param {number} x - 新位置X坐标
     * @param {number} y - 新位置Y坐标
     * @returns {boolean} 是否满足最小距离要求
     */
    checkMinDistance(x, y) {
        for (const obj of this.objects) {
            const dx = obj.x - x;
            const dy = obj.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.minDistance) {
                return false;
            }
        }
        return true;
    }
    
    render(ctx) {
        // Render all environmental objects
        this.objects.forEach(obj => {
            if (obj.render) {
                obj.render(ctx);
            }
        });
    }
    
    reset() {
        // Clear all environmental objects
        this.objects.forEach(obj => {
            this.gameManager.removeGameObject(obj);
        });
        this.objects = [];
        this.spawnTimer = 0;
    }
    
    serialize() {
        return {
            objects: this.objects.map(obj => obj.serialize()),
            spawnTimer: this.spawnTimer
        };
    }
    
    deserialize(data) {
        this.objects = [];
        if (data.objects) {
            data.objects.forEach(objData => {
                let newObject;
                switch (objData.type) {
                    case 'tree':
                        newObject = new Tree(this.gameManager, objData.x, objData.y);
                        break;
                    case 'rock':
                        newObject = new Rock(this.gameManager, objData.x, objData.y);
                        break;
                    case 'beach':
                        newObject = new Beach(this.gameManager, objData.x, objData.y);
                        break;
                    case 'grass':
                        newObject = new Grass(this.gameManager, objData.x, objData.y);
                        break;
                }
                if (newObject) {
                    newObject.deserialize(objData);
                    this.objects.push(newObject);
                    this.gameManager.addGameObject(newObject);
                }
            });
        }
        this.spawnTimer = data.spawnTimer || 0;
    }
}

// Export the classes
try {
    module.exports = { EnvironmentalObject, Tree, Rock, Beach, Grass, EnvironmentalObjectsManager };
} catch (e) {
    // Browser environment
    window.EnvironmentalObject = EnvironmentalObject;
    window.Tree = Tree;
    window.Rock = Rock;
    window.Beach = Beach;
    window.Grass = Grass;
    window.EnvironmentalObjectsManager = EnvironmentalObjectsManager;
}
