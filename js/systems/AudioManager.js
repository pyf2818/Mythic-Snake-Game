class AudioManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.muted = false;
        this.volume = 0.7;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.7;
        this.currentWeatherSound = null;
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        
        if (window.soundEngine) {
            window.soundEngine.init();
            window.soundEngine.setMasterVolume(this.volume);
            window.soundEngine.setSFXVolume(this.sfxVolume);
            window.soundEngine.setMusicVolume(this.musicVolume);
        }
        
        this.initialized = true;
    }
    
    resume() {
        if (window.soundEngine) {
            window.soundEngine.resume();
        }
    }
    
    playEatFoodSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playEatFood();
        }
    }
    
    playGameOverSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playGameOver();
        }
    }
    
    playBacktrackSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playBacktrack();
        }
    }
    
    playWormholeSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playWormhole();
        }
    }
    
    playZoneEnterSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playZoneEnter();
        }
    }
    
    playBulletFireSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playBulletFire();
        }
    }
    
    playBulletHitSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playBulletHit();
        }
    }
    
    playSkillUnlockSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playSkillUnlock();
        }
    }
    
    playAchievementSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playAchievement();
        }
    }
    
    playButtonClickSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playButtonClick();
        }
    }
    
    playSound(soundType) {
        if (this.muted) return;
        this.init();
        
        const soundMap = {
            'eat': () => window.soundEngine && window.soundEngine.playEatFood(),
            'eatFood': () => window.soundEngine && window.soundEngine.playEatFood(),
            'gameOver': () => window.soundEngine && window.soundEngine.playGameOver(),
            'backtrack': () => window.soundEngine && window.soundEngine.playBacktrack(),
            'wormhole': () => window.soundEngine && window.soundEngine.playWormhole(),
            'zoneEnter': () => window.soundEngine && window.soundEngine.playZoneEnter(),
            'bulletFire': () => window.soundEngine && window.soundEngine.playBulletFire(),
            'bulletHit': () => window.soundEngine && window.soundEngine.playBulletHit(),
            'skillUnlock': () => window.soundEngine && window.soundEngine.playSkillUnlock(),
            'achievement': () => window.soundEngine && window.soundEngine.playAchievement(),
            'buttonClick': () => window.soundEngine && window.soundEngine.playButtonClick(),
            'thunder': () => window.soundEngine && window.soundEngine.playThunder(),
            'freeze': () => window.soundEngine && window.soundEngine.playFreeze(),
            'eruption': () => window.soundEngine && window.soundEngine.playEruption(),
            'flash': () => window.soundEngine && window.soundEngine.playFlash(),
            'boost': () => window.soundEngine && window.soundEngine.playBoost()
        };
        
        if (soundMap[soundType]) {
            soundMap[soundType]();
        }
    }
    
    startRainSound() {
        if (this.muted) return;
        this.init();
        this.stopWeatherSounds();
        if (window.soundEngine) {
            this.currentWeatherSound = window.soundEngine.playRain();
        }
    }
    
    startWindSound() {
        if (this.muted) return;
        this.init();
        this.stopWeatherSounds();
        if (window.soundEngine) {
            this.currentWeatherSound = window.soundEngine.playWind();
        }
    }
    
    startSnowSound() {
        if (this.muted) return;
        this.init();
        this.stopWeatherSounds();
        if (window.soundEngine) {
            this.currentWeatherSound = window.soundEngine.playSnow();
        }
    }
    
    startSandSound() {
        if (this.muted) return;
        this.init();
        this.stopWeatherSounds();
        if (window.soundEngine) {
            this.currentWeatherSound = window.soundEngine.playSand();
        }
    }
    
    startHeatHazeSound() {
        if (this.muted) return;
        this.init();
        this.stopWeatherSounds();
        if (window.soundEngine) {
            this.currentWeatherSound = window.soundEngine.playHeatHaze();
        }
    }
    
    startTornadoSound() {
        if (this.muted) return;
        this.init();
        this.stopWeatherSounds();
        if (window.soundEngine) {
            this.currentWeatherSound = window.soundEngine.playTornado();
        }
    }
    
    playThunderSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playThunder();
        }
    }
    
    playFreezeSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playFreeze();
        }
    }
    
    playEruptionSound() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.playEruption();
        }
    }
    
    stopWeatherSounds() {
        console.log('stopWeatherSounds 被调用, currentWeatherSound:', this.currentWeatherSound);
        
        if (this.currentWeatherSound) {
            if (Array.isArray(this.currentWeatherSound)) {
                this.currentWeatherSound.forEach(node => {
                    if (node && node.stop) {
                        try { node.stop(); } catch (e) {}
                    }
                });
            } else if (typeof this.currentWeatherSound === 'object') {
                // 处理对象形式的音效节点（如 { source, lfo } 或 { osc, lfo }）
                Object.values(this.currentWeatherSound).forEach(node => {
                    if (node && node.stop) {
                        try { node.stop(); console.log('停止音效节点:', node); } catch (e) {}
                    }
                });
            } else if (this.currentWeatherSound.stop) {
                try { this.currentWeatherSound.stop(); } catch (e) {}
            }
            this.currentWeatherSound = null;
        }
    }
    
    startBackgroundMusic() {
        if (this.muted) return;
        this.init();
        if (window.soundEngine) {
            window.soundEngine.startBackgroundMusic();
        }
    }
    
    stopBackgroundMusic() {
        if (window.soundEngine) {
            window.soundEngine.stopBackgroundMusic();
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (window.soundEngine) {
            window.soundEngine.setMasterVolume(this.volume);
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (window.soundEngine) {
            window.soundEngine.setSFXVolume(this.sfxVolume);
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (window.soundEngine) {
            window.soundEngine.setMusicVolume(this.musicVolume);
        }
    }
    
    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopWeatherSounds();
            this.stopBackgroundMusic();
        }
    }
    
    isMuted() {
        return this.muted;
    }
    
    getVolume() {
        return this.volume;
    }
    
    stopAllSounds() {
        this.stopWeatherSounds();
        this.stopBackgroundMusic();
        if (window.soundEngine) {
            window.soundEngine.stopAll();
        }
    }
    
    reset() {
        this.stopAllSounds();
    }
    
    serialize() {
        return {
            muted: this.muted,
            volume: this.volume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume
        };
    }
    
    deserialize(data) {
        if (data.muted !== undefined) {
            this.muted = data.muted;
        }
        if (data.volume !== undefined) {
            this.setVolume(data.volume);
        }
        if (data.sfxVolume !== undefined) {
            this.sfxVolume = data.sfxVolume;
        }
        if (data.musicVolume !== undefined) {
            this.musicVolume = data.musicVolume;
        }
    }
}

try {
    module.exports = AudioManager;
} catch (e) {
    window.AudioManager = AudioManager;
}
