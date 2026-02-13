/**
 * 掉落物实体 - 首领死亡后掉落的物品
 */
class DroppedItem {
    constructor(gameManager, itemData, x, y) {
        this.gameManager = gameManager;
        this.itemData = itemData;
        
        this.id = `drop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.type = 'droppedItem';
        
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        
        this.alive = true;
        this.collider = true;
        
        this.lifetime = 30;
        this.elapsedTime = 0;
        
        this.bobOffset = 0;
        this.rotationAngle = 0;
        
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.glowIntensity = 0;
        
        console.log(`DroppedItem created: ${itemData.name} at (${x}, ${y})`);
    }
    
    update(deltaTime) {
        if (!this.alive) return;
        
        this.elapsedTime += deltaTime;
        
        if (this.elapsedTime >= this.lifetime) {
            console.log(`DroppedItem ${this.itemData.name} expired`);
            this.alive = false;
            return;
        }
        
        this.bobOffset = Math.sin(this.elapsedTime * 3) * 5;
        this.rotationAngle += deltaTime * 2;
        
        this.pulsePhase += deltaTime * 4;
        this.glowIntensity = 0.5 + Math.sin(this.pulsePhase) * 0.3;
        
        this.checkPlayerCollision();
    }
    
    checkPlayerCollision() {
        const player = this.gameManager.player;
        if (!player || !player.alive) return;
        
        const dx = (this.x + this.width / 2) - (player.x + player.width / 2);
        const dy = (this.y + this.height / 2) - (player.y + player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 50) {
            console.log(`Player near drop: ${this.itemData.name}, distance: ${distance}`);
            this.pickup(player);
        }
    }
    
    pickup(player) {
        if (!this.alive) return;
        
        console.log(`Pickup called for: ${this.itemData.name}`);
        this.alive = false;
        
        if (this.gameManager.systems.inventorySystem) {
            console.log('Adding item to inventory...');
            this.gameManager.systems.inventorySystem.addItem(this.itemData);
            console.log('Item added successfully');
        } else {
            console.log('inventorySystem not found!');
        }
        
        if (this.gameManager.systems.audioManager) {
            this.gameManager.systems.audioManager.playSound('pickup');
        }
        
        this.createPickupEffect();
    }
    
    createPickupEffect() {
        // 简单的拾取效果通知
        if (this.gameManager.systems.notificationManager) {
            this.gameManager.systems.notificationManager.showNotification(
                `${this.itemData.icon} 获得物品: ${this.itemData.name}`,
                this.itemData.rarity.color,
                'success',
                3
            );
        }
    }
    
    render(ctx) {
        if (!this.alive) return;
        
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2 + this.bobOffset;
        
        const glowRadius = 30 + this.glowIntensity * 10;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
        gradient.addColorStop(0, this.itemData.rarity.color + '60');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.itemData.rarity.color + '40';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = this.itemData.rarity.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.itemData.icon, centerX, centerY);
        
        const remainingTime = this.lifetime - this.elapsedTime;
        if (remainingTime < 10) {
            ctx.globalAlpha = Math.sin(this.elapsedTime * 10) * 0.3 + 0.7;
        }
        
        ctx.restore();
    }
    
    serialize() {
        return {
            id: this.id,
            itemDataId: this.itemData.id,
            x: this.x,
            y: this.y,
            elapsedTime: this.elapsedTime
        };
    }
}

try {
    module.exports = { DroppedItem };
} catch (e) {
    window.DroppedItem = DroppedItem;
}
