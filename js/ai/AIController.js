class AIController {
    constructor(snake) {
        this.snake = snake;
        this.gameManager = snake.gameManager;
        this.decisionTimer = 0;
        this.decisionInterval = 1.0; // 每1秒做一次决策，增加反应时间
        this.currentGoal = null;
        this.path = [];
        this.behavior = this.getRandomBehavior();
    }
    
    getRandomBehavior() {
        // 随机选择AI行为模式
        const behaviors = ['aggressive', 'conservative', 'cooperative'];
        return behaviors[Math.floor(Math.random() * behaviors.length)];
    }
    
    update(deltaTime) {
        // 更新AI决策
        this.decisionTimer += deltaTime;
        if (this.decisionTimer >= this.decisionInterval) {
            this.decisionTimer = 0;
            this.makeDecision();
        }
        
        // 执行移动
        this.executeMovement();
    }
    
    makeDecision() {
        // 根据行为模式做出决策
        switch (this.behavior) {
            case 'aggressive':
                this.makeAggressiveDecision();
                break;
            case 'conservative':
                this.makeConservativeDecision();
                break;
            case 'cooperative':
                this.makeCooperativeDecision();
                break;
        }
    }
    
    makeAggressiveDecision() {
        // 激进型决策：优先攻击
        const enemies = this.gameManager.getObjectsByType('snake').filter(s => s !== this.snake);
        const food = this.gameManager.getObjectsByType('food');
        
        if (enemies.length > 0) {
            // 优先攻击其他蛇
            this.currentGoal = enemies[0];
        } else if (food.length > 0) {
            // 其次寻找食物
            this.currentGoal = this.findClosestFood(food);
        } else {
            // 随机移动
            this.currentGoal = null;
        }
    }
    
    makeConservativeDecision() {
        // 保守型决策：优先寻找食物
        const food = this.gameManager.getObjectsByType('food');
        const enemies = this.gameManager.getObjectsByType('snake').filter(s => s !== this.snake);
        
        if (food.length > 0) {
            // 优先寻找食物
            this.currentGoal = this.findClosestFood(food);
        } else if (enemies.length > 0) {
            // 避开其他蛇
            this.currentGoal = this.findSafeLocation(enemies);
        } else {
            // 随机移动
            this.currentGoal = null;
        }
    }
    
    makeCooperativeDecision() {
        // 合作型决策：尝试与其他AI蛇合作
        const allies = this.gameManager.getObjectsByType('snake').filter(s => s !== this.snake && s.isPlayer === false);
        const food = this.gameManager.getObjectsByType('food');
        const enemies = this.gameManager.getObjectsByType('snake').filter(s => s.isPlayer === true);
        
        if (enemies.length > 0 && allies.length > 0) {
            // 与其他AI蛇合作攻击玩家
            this.currentGoal = enemies[0];
        } else if (food.length > 0) {
            // 寻找食物
            this.currentGoal = this.findClosestFood(food);
        } else {
            // 随机移动
            this.currentGoal = null;
        }
    }
    
    findClosestFood(foodList) {
        // 找到最近的食物
        let closestFood = null;
        let closestDistance = Infinity;
        
        foodList.forEach(food => {
            const distance = this.getDistance(this.snake, food);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestFood = food;
            }
        });
        
        return closestFood;
    }
    
    findSafeLocation(enemies) {
        // 找到安全位置
        // 这里使用简化的实现，实际项目中可以使用更复杂的算法
        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        
        const safeDirection = directions[Math.floor(Math.random() * directions.length)];
        return {
            x: this.snake.x + safeDirection.x * 100,
            y: this.snake.y + safeDirection.y * 100
        };
    }
    
    executeMovement() {
        // 执行移动
        if (this.currentGoal) {
            this.moveTowardsGoal();
        } else {
            this.moveRandomly();
        }
        
        // 应用加速度/减速度，实现自然的移动过渡
        this.applyAcceleration();
    }
    
    applyAcceleration() {
        // 应用加速度/减速度
        if (this.currentGoal) {
            // 向目标移动时加速
            if (this.snake.speed < this.snake.maxSpeed) {
                this.snake.speed += this.snake.acceleration;
                if (this.snake.speed > this.snake.maxSpeed) {
                    this.snake.speed = this.snake.maxSpeed;
                }
            }
        } else {
            // 随机移动时减速
            if (this.snake.speed > this.snake.minSpeed) {
                this.snake.speed -= this.snake.acceleration * 0.5;
                if (this.snake.speed < this.snake.minSpeed) {
                    this.snake.speed = this.snake.minSpeed;
                }
            }
        }
    }
    
    moveTowardsGoal() {
        // 向目标移动
        
        // 检查是否有可用的虫洞作为捷径
        const wormholeShortcut = this.findWormholeShortcut();
        if (wormholeShortcut) {
            // 向虫洞移动
            const dx = wormholeShortcut.x - this.snake.x;
            const dy = wormholeShortcut.y - this.snake.y;
            
            // 计算移动方向
            if (Math.abs(dx) > Math.abs(dy)) {
                // 横向移动
                this.snake.nextDirection = { x: dx > 0 ? 1 : -1, y: 0 };
            } else {
                // 纵向移动
                this.snake.nextDirection = { x: 0, y: dy > 0 ? 1 : -1 };
            }
        } else {
            // 没有虫洞捷径，直接向目标移动
            const dx = this.currentGoal.x - this.snake.x;
            const dy = this.currentGoal.y - this.snake.y;
            
            // 添加一些随机性，让AI蛇的追踪不那么直接
            const randomFactor = 0.3; // 随机性因子
            if (Math.random() < randomFactor) {
                // 随机改变方向，增加游戏的不可预测性
                const directions = [
                    { x: 1, y: 0 },
                    { x: -1, y: 0 },
                    { x: 0, y: 1 },
                    { x: 0, y: -1 }
                ];
                this.snake.nextDirection = directions[Math.floor(Math.random() * directions.length)];
            } else {
                // 计算移动方向
                if (Math.abs(dx) > Math.abs(dy)) {
                    // 横向移动
                    this.snake.nextDirection = { x: dx > 0 ? 1 : -1, y: 0 };
                } else {
                    // 纵向移动
                    this.snake.nextDirection = { x: 0, y: dy > 0 ? 1 : -1 };
                }
            }
        }
        
        this.snake.isMoving = true;
    }
    
    findWormholeShortcut() {
        // 查找可用的虫洞作为捷径
        const wormholes = this.gameManager.getObjectsByType('wormhole').filter(w => w.active && w.target && w.target.active);
        
        for (let wormhole of wormholes) {
            // 计算从当前位置到虫洞的距离
            const distanceToWormhole = this.getDistance(this.snake, wormhole);
            
            // 计算从虫洞的目标到目标的距离
            const distanceFromWormhole = this.getDistance(wormhole.target, this.currentGoal);
            
            // 计算直接到目标的距离
            const directDistance = this.getDistance(this.snake, this.currentGoal);
            
            // 如果通过虫洞的距离更短，且虫洞在合理范围内，则使用虫洞作为捷径
            if (distanceToWormhole + distanceFromWormhole < directDistance * 0.8 && distanceToWormhole < 300) {
                return wormhole;
            }
        }
        
        return null; // 没有找到合适的虫洞捷径
    }
    
    moveRandomly() {
        // 随机移动
        const directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
        ];
        
        // 偶尔改变方向
        if (Math.random() < 0.1) {
            this.snake.nextDirection = directions[Math.floor(Math.random() * directions.length)];
        }
        
        this.snake.isMoving = true;
    }
    
    getDistance(obj1, obj2) {
        // 计算两点之间的距离
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// 导出AI控制器
try {
    module.exports = AIController;
} catch (e) {
    // 浏览器环境
    window.AIController = AIController;
}