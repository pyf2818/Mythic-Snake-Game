class MobileControls {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.enabled = this.detectMobile();
        this.activeDirections = new Set();
        this.touchStartTime = 0;
        this.lastDirection = null;
        
        if (this.enabled) {
            this.init();
        }
    }
    
    detectMobile() {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;
        const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
        
        return isTouchDevice && (isSmallScreen || isCoarsePointer);
    }
    
    init() {
        const controls = document.getElementById('mobile-controls');
        if (!controls) return;
        
        controls.style.display = 'block';
        
        this.initDPad();
        this.initActionButtons();
        this.initSwipeControls();
        this.initPinchZoom();
        
        console.log('Mobile controls initialized');
    }
    
    initDPad() {
        const dpadBtns = document.querySelectorAll('.mobile-dpad-btn');
        
        dpadBtns.forEach(btn => {
            const direction = btn.dataset.direction;
            
            const handleStart = (e) => {
                e.preventDefault();
                this.activeDirections.add(direction);
                this.lastDirection = direction;
                this.emitDirection();
            };
            
            const handleEnd = (e) => {
                e.preventDefault();
                this.activeDirections.delete(direction);
                this.emitDirection();
            };
            
            btn.addEventListener('touchstart', handleStart, { passive: false });
            btn.addEventListener('touchend', handleEnd, { passive: false });
            btn.addEventListener('touchcancel', handleEnd, { passive: false });
            
            btn.addEventListener('mousedown', handleStart);
            btn.addEventListener('mouseup', handleEnd);
            btn.addEventListener('mouseleave', handleEnd);
        });
    }
    
    initActionButtons() {
        const flashBtn = document.getElementById('mobile-flash');
        const boostBtn = document.getElementById('mobile-boost');
        
        if (flashBtn) {
            flashBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.triggerFlash();
            }, { passive: false });
            
            flashBtn.addEventListener('click', () => this.triggerFlash());
        }
        
        if (boostBtn) {
            const handleBoostStart = (e) => {
                e.preventDefault();
                this.startBoost();
            };
            
            const handleBoostEnd = (e) => {
                e.preventDefault();
                this.endBoost();
            };
            
            boostBtn.addEventListener('touchstart', handleBoostStart, { passive: false });
            boostBtn.addEventListener('touchend', handleBoostEnd, { passive: false });
            boostBtn.addEventListener('touchcancel', handleBoostEnd, { passive: false });
            
            boostBtn.addEventListener('mousedown', handleBoostStart);
            boostBtn.addEventListener('mouseup', handleBoostEnd);
            boostBtn.addEventListener('mouseleave', handleBoostEnd);
        }
    }
    
    initSwipeControls() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        let startX, startY;
        let isSwiping = false;
        const swipeThreshold = 30;
        
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isSwiping = true;
            }
        }, { passive: true });
        
        canvas.addEventListener('touchmove', (e) => {
            if (!isSwiping || e.touches.length !== 1) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
                const direction = this.getSwipeDirection(deltaX, deltaY);
                if (direction && direction !== this.lastDirection) {
                    this.activeDirections.clear();
                    this.activeDirections.add(direction);
                    this.lastDirection = direction;
                    this.emitDirection();
                }
            }
        }, { passive: true });
        
        canvas.addEventListener('touchend', () => {
            isSwiping = false;
            this.activeDirections.clear();
            this.emitDirection();
        }, { passive: true });
    }
    
    initPinchZoom() {
        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;
        
        let initialDistance = 0;
        let initialZoom = 1;
        
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getTouchDistance(e.touches);
                initialZoom = this.gameManager.systems.renderer?.camera?.zoom || 1;
            }
        }, { passive: true });
        
        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentDistance = this.getTouchDistance(e.touches);
                const scale = currentDistance / initialDistance;
                const newZoom = Math.max(0.5, Math.min(2, initialZoom * scale));
                
                if (this.gameManager.systems.renderer?.camera) {
                    this.gameManager.systems.renderer.camera.zoom = newZoom;
                }
            }
        }, { passive: true });
    }
    
    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    getSwipeDirection(deltaX, deltaY) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }
    
    emitDirection() {
        if (!this.gameManager.player) return;
        
        let dx = 0, dy = 0;
        
        if (this.activeDirections.has('up')) dy -= 1;
        if (this.activeDirections.has('down')) dy += 1;
        if (this.activeDirections.has('left')) dx -= 1;
        if (this.activeDirections.has('right')) dx += 1;
        
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }
        
        if (this.gameManager.player.setDirection) {
            this.gameManager.player.setDirection(dx, dy);
        } else if (this.gameManager.player.direction) {
            this.gameManager.player.direction.x = dx;
            this.gameManager.player.direction.y = dy;
        }
    }
    
    triggerFlash() {
        const player = this.gameManager.player;
        if (player && player.useSkill) {
            player.useSkill('flash');
        } else if (player && player.flash) {
            player.flash();
        }
    }
    
    startBoost() {
        const player = this.gameManager.player;
        if (player) {
            player.boosting = true;
            if (player.startBoost) {
                player.startBoost();
            }
        }
    }
    
    endBoost() {
        const player = this.gameManager.player;
        if (player) {
            player.boosting = false;
            if (player.endBoost) {
                player.endBoost();
            }
        }
    }
    
    show() {
        const controls = document.getElementById('mobile-controls');
        if (controls && this.enabled) {
            controls.style.display = 'block';
        }
    }
    
    hide() {
        const controls = document.getElementById('mobile-controls');
        if (controls) {
            controls.style.display = 'none';
        }
    }
    
    updateEnabled() {
        this.enabled = this.detectMobile();
        if (this.enabled) {
            this.show();
        } else {
            this.hide();
        }
    }
}

window.MobileControls = MobileControls;
