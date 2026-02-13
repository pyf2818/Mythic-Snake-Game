class SoundEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.initialized = false;
        this.currentMusic = null;
        this.musicNodes = [];
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.audioContext.destination);
            
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = 0.7;
            this.sfxGain.connect(this.masterGain);
            
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.masterGain);
            
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }
    
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    playEatFood() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.1);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    playGameOver() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const frequencies = [440, 392, 349, 330];
        frequencies.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, now + i * 0.15);
            
            gain.gain.setValueAtTime(0.2, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.2);
            
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.25);
        });
    }
    
    playBacktrack() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600 + i * 200, now + i * 0.08);
            
            gain.gain.setValueAtTime(0.15, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
            
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.25);
        }
    }
    
    playWormhole() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);
        
        osc1.type = 'sine';
        osc2.type = 'sine';
        
        osc1.frequency.setValueAtTime(200, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        osc1.frequency.exponentialRampToValueAtTime(200, now + 0.6);
        
        osc2.frequency.setValueAtTime(300, now);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
        osc2.frequency.exponentialRampToValueAtTime(300, now + 0.6);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.setValueAtTime(0.2, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.7);
        osc2.stop(now + 0.7);
    }
    
    playZoneEnter() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }
    
    playBulletFire() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const noise = this.createNoiseBuffer(0.1);
        const source = this.audioContext.createBufferSource();
        source.buffer = noise;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        source.start(now);
    }
    
    playBulletHit() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.start(now);
        osc.stop(now + 0.15);
    }
    
    playSkillUnlock() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const notes = [523, 659, 784, 1047];
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.15, now + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
            
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.25);
        });
    }
    
    playAchievement() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        const notes = [784, 988, 1175, 1568];
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.02);
            gain.gain.setValueAtTime(0.2, now + i * 0.1 + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.35);
        });
    }
    
    playButtonClick() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.value = 800;
        
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        osc.start(now);
        osc.stop(now + 0.05);
    }
    
    playFlash() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);
        
        osc1.type = 'sine';
        osc2.type = 'triangle';
        
        osc1.frequency.setValueAtTime(400, now);
        osc1.frequency.exponentialRampToValueAtTime(1600, now + 0.1);
        osc1.frequency.exponentialRampToValueAtTime(100, now + 0.25);
        
        osc2.frequency.setValueAtTime(600, now);
        osc2.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
        osc2.frequency.exponentialRampToValueAtTime(150, now + 0.25);
        
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.setValueAtTime(0.25, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.3);
    }
    
    playBoost() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.15);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.setValueAtTime(0.08, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }
    
    playRain() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const noise = this.createNoiseBuffer(2);
        const source = this.audioContext.createBufferSource();
        source.buffer = noise;
        source.loop = true;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.08;
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        source.start(now);
        
        return source;
    }
    
    playThunder() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const noise = this.createNoiseBuffer(1);
        const source = this.audioContext.createBufferSource();
        source.buffer = noise;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        source.start(now);
    }
    
    playWind() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const noise = this.createNoiseBuffer(3);
        const source = this.audioContext.createBufferSource();
        source.buffer = noise;
        source.loop = true;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.5;
        
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.frequency.value = 0.3;
        lfoGain.gain.value = 200;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.1;
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        lfo.start(now);
        source.start(now);
        
        return { source, lfo };
    }
    
    playSnow() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const noise = this.createNoiseBuffer(2);
        const source = this.audioContext.createBufferSource();
        source.buffer = noise;
        source.loop = true;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.03;
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        source.start(now);
        
        return source;
    }
    
    playSand() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const noise = this.createNoiseBuffer(2);
        const source = this.audioContext.createBufferSource();
        source.buffer = noise;
        source.loop = true;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 1;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.08;
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        source.start(now);
        
        return source;
    }
    
    playHeatHaze() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.type = 'sine';
        osc.frequency.value = 80;
        
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.frequency.value = 2;
        lfoGain.gain.value = 20;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        
        gain.gain.value = 0.1;
        
        lfo.start(now);
        osc.start(now);
        
        return { osc, lfo };
    }
    
    playTornado() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const noise = this.createNoiseBuffer(3);
        const source = this.audioContext.createBufferSource();
        source.buffer = noise;
        source.loop = true;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 2;
        
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        lfo.frequency.value = 3;
        lfoGain.gain.value = 500;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.15;
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        lfo.start(now);
        source.start(now);
        
        return { source, lfo };
    }
    
    playFreeze() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const noise = this.createNoiseBuffer(0.5);
        const source = this.audioContext.createBufferSource();
        source.buffer = noise;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 4000;
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        source.start(now);
    }
    
    playEruption() {
        if (!this.initialized) this.init();
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        const noise = this.createNoiseBuffer(1);
        const source = this.audioContext.createBufferSource();
        source.buffer = noise;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.8);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        source.start(now);
    }
    
    createNoiseBuffer(duration) {
        const sampleRate = this.audioContext.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }
    
    startBackgroundMusic() {
        if (!this.initialized) this.init();
        if (!this.audioContext || this.currentMusic) return;
        
        this.currentMusic = this.createAmbientMusic();
    }
    
    stopBackgroundMusic() {
        if (this.currentMusic) {
            this.currentMusic.forEach(node => {
                if (node.stop) node.stop();
            });
            this.currentMusic = null;
        }
    }
    
    createAmbientMusic() {
        const now = this.audioContext.currentTime;
        const nodes = [];
        
        const baseFreqs = [65.41, 82.41, 98, 130.81];
        
        baseFreqs.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            filter.type = 'lowpass';
            filter.frequency.value = 500;
            
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();
            lfo.frequency.value = 0.1 + i * 0.05;
            lfoGain.gain.value = 0.3;
            lfo.connect(lfoGain);
            lfoGain.connect(gain.gain);
            
            gain.gain.value = 0.08;
            
            osc.start(now);
            lfo.start(now);
            
            nodes.push(osc, lfo);
        });
        
        const padOsc = this.audioContext.createOscillator();
        const padGain = this.audioContext.createGain();
        const padFilter = this.audioContext.createBiquadFilter();
        
        padOsc.connect(padFilter);
        padFilter.connect(padGain);
        padGain.connect(this.musicGain);
        
        padOsc.type = 'triangle';
        padOsc.frequency.value = 130.81;
        
        padFilter.type = 'lowpass';
        padFilter.frequency.value = 300;
        
        const padLfo = this.audioContext.createOscillator();
        const padLfoGain = this.audioContext.createGain();
        padLfo.frequency.value = 0.05;
        padLfoGain.gain.value = 50;
        padLfo.connect(padLfoGain);
        padLfoGain.connect(padFilter.frequency);
        
        padGain.gain.value = 0.05;
        
        padOsc.start(now);
        padLfo.start(now);
        
        nodes.push(padOsc, padLfo);
        
        return nodes;
    }
    
    setMasterVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }
    
    setSFXVolume(value) {
        if (this.sfxGain) {
            this.sfxGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }
    
    setMusicVolume(value) {
        if (this.musicGain) {
            this.musicGain.gain.value = Math.max(0, Math.min(1, value));
        }
    }
    
    stopAll() {
        this.stopBackgroundMusic();
    }
}

window.soundEngine = new SoundEngine();
