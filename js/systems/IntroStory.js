/**
 * 开场故事组件 - 打字机效果展示背景故事
 */

class IntroStory {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.isVisible = false;
        this.isSkipping = false;
        this.skipHoldTime = 0;
        this.skipThreshold = 0.5;
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.typewriterSpeed = 50;
        this.isComplete = false;
        this.audioContext = null;
        this.bgmPlaying = false;
        
        this.storyTexts = [
            {
                title: "混沌初开",
                content: "在时间尚未被命名的纪元，虚空之中唯有混沌。混沌无形无相，却蕴含万物之种。它在永恒的黑暗中沉睡，呼吸间便是万古的轮回。"
            },
            {
                title: "神祇诞生",
                content: "混沌的意识分裂为二，化作五大原初神祇：泰坦、炎魔、九首海德拉、雷神与混沌·努恩。他们联手开辟天地，将混沌本源封印于世界极渊。"
            },
            {
                title: "始祖之蛇",
                content: "创世完成之际，始祖之蛇诞生于余烬之中。它拥有吞噬一切、转化一切的神奇力量，游走于天地之间，净化世界，被称为「世界之环」。"
            },
            {
                title: "诸神黄昏",
                content: "万年之后，混沌的低语唤醒了炎魔。诸神之战持续三百载，世界破碎，神祇陨落。始祖之蛇吞噬过多混沌之力，陷入永恒沉睡。"
            },
            {
                title: "命运之始",
                content: "如今，封印松动，神话遗物散落各地。你，作为蛇之眷属的一员，从混沌中苏醒。吞噬吧，进化吧，成为新世界之环——或者让混沌吞噬一切。"
            }
        ];
        
        this.container = null;
        this.textElement = null;
        this.titleElement = null;
        this.progressBar = null;
        this.skipHint = null;
        
        this.init();
    }
    
    init() {
        this.createStyles();
        this.createContainer();
        this.bindEvents();
    }
    
    createStyles() {
        if (document.getElementById('intro-story-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'intro-story-styles';
        style.textContent = `
            .intro-story-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 20000;
                display: none;
                opacity: 0;
                transition: opacity 1s ease;
            }
            
            .intro-story-container.active {
                display: flex;
                opacity: 1;
            }
            
            .intro-story-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0f0f1a 100%);
                overflow: hidden;
            }
            
            .intro-story-bg::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: 
                    radial-gradient(ellipse at 20% 80%, rgba(139, 69, 255, 0.15) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
                    radial-gradient(ellipse at 50% 50%, rgba(255, 107, 107, 0.05) 0%, transparent 70%);
                animation: bgPulse 8s ease-in-out infinite;
            }
            
            @keyframes bgPulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }
            
            .intro-stars {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            
            .intro-star {
                position: absolute;
                width: 2px;
                height: 2px;
                background: #fff;
                border-radius: 50%;
                animation: twinkle 3s ease-in-out infinite;
            }
            
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.5); }
            }
            
            .intro-story-content {
                position: relative;
                z-index: 1;
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
            }
            
            .intro-story-title {
                font-size: 2.5em;
                color: #ffd700;
                text-shadow: 
                    0 0 20px rgba(255, 215, 0, 0.5),
                    0 0 40px rgba(255, 215, 0, 0.3),
                    0 0 60px rgba(255, 215, 0, 0.2);
                margin-bottom: 40px;
                text-align: center;
                font-weight: 300;
                letter-spacing: 8px;
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.8s ease;
            }
            
            .intro-story-title.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .intro-story-text-wrapper {
                position: relative;
                width: 100%;
                min-height: 200px;
                padding: 30px;
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255, 215, 0, 0.2);
                border-radius: 16px;
                backdrop-filter: blur(10px);
                box-shadow: 
                    0 0 30px rgba(0, 0, 0, 0.5),
                    inset 0 0 30px rgba(255, 215, 0, 0.05);
            }
            
            .intro-story-text-wrapper::before {
                content: '"';
                position: absolute;
                top: -20px;
                left: 20px;
                font-size: 80px;
                color: rgba(255, 215, 0, 0.2);
                font-family: Georgia, serif;
                line-height: 1;
            }
            
            .intro-story-text {
                font-size: 1.2em;
                color: rgba(255, 255, 255, 0.9);
                line-height: 2;
                text-align: justify;
                font-family: 'Georgia', 'Noto Serif SC', serif;
                letter-spacing: 1px;
            }
            
            .intro-story-text .char {
                display: inline;
            }
            
            .intro-story-text .cursor {
                display: inline-block;
                width: 2px;
                height: 1.2em;
                background: #ffd700;
                margin-left: 2px;
                animation: cursorBlink 0.8s ease-in-out infinite;
                vertical-align: middle;
            }
            
            @keyframes cursorBlink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
            .intro-progress-container {
                width: 100%;
                margin-top: 40px;
                display: flex;
                justify-content: center;
                gap: 12px;
            }
            
            .intro-progress-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 215, 0, 0.3);
                transition: all 0.3s ease;
            }
            
            .intro-progress-dot.active {
                background: #ffd700;
                box-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
                transform: scale(1.2);
            }
            
            .intro-progress-dot.completed {
                background: rgba(255, 215, 0, 0.5);
            }
            
            .intro-skip-hint {
                position: fixed;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.9em;
            }
            
            .intro-skip-bar {
                width: 200px;
                height: 4px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 2px;
                overflow: hidden;
            }
            
            .intro-skip-bar-fill {
                width: 0%;
                height: 100%;
                background: linear-gradient(90deg, #ffd700, #ff6b6b);
                border-radius: 2px;
                transition: width 0.1s linear;
            }
            
            .intro-skip-keys {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            .intro-key-hint {
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                font-size: 0.85em;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .intro-fade-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000;
                opacity: 0;
                pointer-events: none;
                transition: opacity 1s ease;
                z-index: 10;
            }
            
            .intro-fade-overlay.active {
                opacity: 1;
            }
            
            .intro-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            }
            
            .intro-particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, rgba(255, 215, 0, 0.8), transparent);
                border-radius: 50%;
                animation: floatUp 10s linear infinite;
            }
            
            @keyframes floatUp {
                0% {
                    transform: translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% {
                    transform: translateY(-100px) rotate(720deg);
                    opacity: 0;
                }
            }
            
            @media (max-width: 768px) {
                .intro-story-content {
                    padding: 20px;
                }
                
                .intro-story-title {
                    font-size: 1.8em;
                    letter-spacing: 4px;
                    margin-bottom: 30px;
                }
                
                .intro-story-text-wrapper {
                    padding: 20px;
                    min-height: 150px;
                }
                
                .intro-story-text {
                    font-size: 1em;
                    line-height: 1.8;
                }
                
                .intro-skip-hint {
                    bottom: 20px;
                }
                
                .intro-skip-bar {
                    width: 150px;
                }
            }
            
            @media (max-width: 480px) {
                .intro-story-title {
                    font-size: 1.5em;
                }
                
                .intro-story-text {
                    font-size: 0.9em;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'intro-story-container';
        this.container.innerHTML = `
            <div class="intro-story-bg">
                <div class="intro-stars" id="intro-stars"></div>
                <div class="intro-particles" id="intro-particles"></div>
            </div>
            <div class="intro-story-content">
                <div class="intro-story-title" id="intro-title"></div>
                <div class="intro-story-text-wrapper">
                    <div class="intro-story-text" id="intro-text"></div>
                </div>
                <div class="intro-progress-container" id="intro-progress"></div>
            </div>
            <div class="intro-skip-hint">
                <div class="intro-skip-keys">
                    <span class="intro-key-hint">长按 SPACE</span>
                    <span>跳过</span>
                </div>
                <div class="intro-skip-bar">
                    <div class="intro-skip-bar-fill" id="intro-skip-fill"></div>
                </div>
            </div>
            <div class="intro-fade-overlay" id="intro-fade"></div>
        `;
        
        document.body.appendChild(this.container);
        
        this.titleElement = document.getElementById('intro-title');
        this.textElement = document.getElementById('intro-text');
        this.progressContainer = document.getElementById('intro-progress');
        this.skipFill = document.getElementById('intro-skip-fill');
        this.fadeOverlay = document.getElementById('intro-fade');
        
        this.createStars();
        this.createParticles();
        this.createProgressDots();
    }
    
    createStars() {
        const starsContainer = document.getElementById('intro-stars');
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'intro-star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.animationDuration = (2 + Math.random() * 2) + 's';
            starsContainer.appendChild(star);
        }
    }
    
    createParticles() {
        const particlesContainer = document.getElementById('intro-particles');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'intro-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.animationDuration = (8 + Math.random() * 4) + 's';
            particlesContainer.appendChild(particle);
        }
    }
    
    createProgressDots() {
        this.progressContainer.innerHTML = '';
        for (let i = 0; i < this.storyTexts.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'intro-progress-dot';
            if (i === 0) dot.classList.add('active');
            this.progressContainer.appendChild(dot);
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isVisible && !this.isSkipping) {
                e.preventDefault();
                this.isSkipping = true;
                this.skipHoldTime = 0;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                this.isSkipping = false;
                this.skipHoldTime = 0;
                if (this.skipFill) {
                    this.skipFill.style.width = '0%';
                }
            }
        });
        
        if ('ontouchstart' in window) {
            const skipHint = this.container.querySelector('.intro-skip-hint');
            skipHint.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.isSkipping = true;
                this.skipHoldTime = 0;
            });
            
            skipHint.addEventListener('touchend', () => {
                this.isSkipping = false;
                this.skipHoldTime = 0;
                if (this.skipFill) {
                    this.skipFill.style.width = '0%';
                }
            });
        }
    }
    
    async show() {
        // 确保 DOM 元素已创建
        if (!this.container || !this.titleElement || !this.textElement) {
            console.error('IntroStory: DOM elements not ready, recreating...');
            this.createContainer();
        }
        
        this.isVisible = true;
        this.container.classList.add('active');
        
        this.playBackgroundMusic();
        
        await this.delay(500);
        
        for (let i = 0; i < this.storyTexts.length; i++) {
            if (!this.isVisible) break;
            
            this.currentTextIndex = i;
            this.updateProgressDots();
            await this.showStory(this.storyTexts[i]);
            
            if (i < this.storyTexts.length - 1) {
                await this.delay(1500);
            }
        }
        
        if (this.isVisible) {
            await this.completeStory();
        }
    }
    
    async showStory(story) {
        return new Promise(async (resolve) => {
            if (!this.titleElement || !this.textElement) {
                console.error('IntroStory: DOM elements not initialized');
                resolve();
                return;
            }
            
            this.titleElement.textContent = story.title;
            this.titleElement.classList.remove('visible');
            
            await this.delay(100);
            this.titleElement.classList.add('visible');
            
            await this.delay(500);
            
            this.textElement.innerHTML = '';
            const chars = story.content.split('');
            
            for (let i = 0; i < chars.length; i++) {
                if (!this.isVisible) {
                    console.log('IntroStory: isVisible is false, breaking');
                    break;
                }
                
                this.currentCharIndex = i;
                const char = chars[i];
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char;
                span.style.opacity = '1';
                span.style.display = 'inline';
                
                this.textElement.appendChild(span);
                
                const cursor = document.createElement('span');
                cursor.className = 'cursor';
                this.textElement.appendChild(cursor);
                
                await this.delay(this.typewriterSpeed);
                
                if (cursor.parentNode) {
                    cursor.remove();
                }
            }
            
            resolve();
        });
    }
    
    updateProgressDots() {
        const dots = this.progressContainer.querySelectorAll('.intro-progress-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index < this.currentTextIndex) {
                dot.classList.add('completed');
            } else if (index === this.currentTextIndex) {
                dot.classList.add('active');
            }
        });
    }
    
    update(deltaTime) {
        if (!this.isVisible) return;
        
        if (this.isSkipping) {
            this.skipHoldTime += deltaTime;
            const progress = Math.min(this.skipHoldTime / this.skipThreshold, 1);
            if (this.skipFill) {
                this.skipFill.style.width = (progress * 100) + '%';
            }
            
            if (progress >= 1) {
                this.skipToGame();
            }
        }
    }
    
    skipToGame() {
        this.isSkipping = false;
        this.completeStory();
    }
    
    async completeStory() {
        this.isComplete = true;
        this.fadeOverlay.classList.add('active');
        
        await this.delay(1000);
        
        this.stopBackgroundMusic();
        this.hide();
        
        if (window.proceedToGame) {
            window.proceedToGame();
        } else if (this.gameManager) {
            this.gameManager.startGame();
        }
    }
    
    hide() {
        this.isVisible = false;
        this.container.classList.remove('active');
        this.fadeOverlay.classList.remove('active');
        this.titleElement.classList.remove('visible');
        this.textElement.innerHTML = '';
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.createProgressDots();
    }
    
    playBackgroundMusic() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            const playEpicMusic = () => {
                if (!this.audioContext || !this.bgmPlaying) return;
                
                const now = this.audioContext.currentTime;
                
                const masterGain = this.audioContext.createGain();
                masterGain.gain.setValueAtTime(0.15, now);
                masterGain.connect(this.audioContext.destination);
                
                const bassGain = this.audioContext.createGain();
                bassGain.gain.setValueAtTime(0.3, now);
                bassGain.connect(masterGain);
                
                const padGain = this.audioContext.createGain();
                padGain.gain.setValueAtTime(0.2, now);
                padGain.connect(masterGain);
                
                const baseFreq = 55;
                const chordNotes = [1, 1.5, 2, 2.5];
                
                for (let i = 0; i < 4; i++) {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(baseFreq * chordNotes[i], now);
                    
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(0.1, now + 2);
                    gain.gain.linearRampToValueAtTime(0.08, now + 6);
                    gain.gain.linearRampToValueAtTime(0, now + 8);
                    
                    osc.connect(gain);
                    gain.connect(padGain);
                    
                    osc.start(now);
                    osc.stop(now + 8);
                }
                
                const drumPattern = () => {
                    if (!this.bgmPlaying) return;
                    
                    const drumNow = this.audioContext.currentTime;
                    
                    const kick = this.audioContext.createOscillator();
                    const kickGain = this.audioContext.createGain();
                    kick.type = 'sine';
                    kick.frequency.setValueAtTime(150, drumNow);
                    kick.frequency.exponentialRampToValueAtTime(30, drumNow + 0.1);
                    kickGain.gain.setValueAtTime(0.5, drumNow);
                    kickGain.gain.exponentialRampToValueAtTime(0.01, drumNow + 0.2);
                    kick.connect(kickGain);
                    kickGain.connect(bassGain);
                    kick.start(drumNow);
                    kick.stop(drumNow + 0.2);
                    
                    setTimeout(drumPattern, 2000);
                };
                
                drumPattern();
                
                const playMelody = () => {
                    if (!this.bgmPlaying || !this.audioContext) return;
                    
                    const melodyNow = this.audioContext.currentTime;
                    const melodyNotes = [220, 261.63, 293.66, 329.63, 392, 440];
                    const noteIndex = Math.floor(Math.random() * melodyNotes.length);
                    
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(melodyNotes[noteIndex], melodyNow);
                    
                    gain.gain.setValueAtTime(0.08, melodyNow);
                    gain.gain.exponentialRampToValueAtTime(0.01, melodyNow + 1.5);
                    
                    osc.connect(gain);
                    gain.connect(masterGain);
                    
                    osc.start(melodyNow);
                    osc.stop(melodyNow + 1.5);
                    
                    setTimeout(playMelody, 800 + Math.random() * 1200);
                };
                
                setTimeout(playMelody, 1000);
                
                const playChord = () => {
                    if (!this.bgmPlaying || !this.audioContext) return;
                    
                    const chordNow = this.audioContext.currentTime;
                    const chords = [
                        [130.81, 164.81, 196],
                        [146.83, 185, 220],
                        [164.81, 207.65, 246.94],
                        [146.83, 185, 220]
                    ];
                    const chordIndex = Math.floor(Math.random() * chords.length);
                    
                    chords[chordIndex].forEach(freq => {
                        const osc = this.audioContext.createOscillator();
                        const gain = this.audioContext.createGain();
                        
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, chordNow);
                        
                        gain.gain.setValueAtTime(0.05, chordNow);
                        gain.gain.linearRampToValueAtTime(0.08, chordNow + 1);
                        gain.gain.exponentialRampToValueAtTime(0.01, chordNow + 4);
                        
                        osc.connect(gain);
                        gain.connect(padGain);
                        
                        osc.start(chordNow);
                        osc.stop(chordNow + 4);
                    });
                    
                    setTimeout(playChord, 4000);
                };
                
                playChord();
            };
            
            this.bgmPlaying = true;
            playEpicMusic();
            
        } catch (e) {
            console.log('Audio not supported:', e);
        }
    }
    
    stopBackgroundMusic() {
        this.bgmPlaying = false;
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

try {
    module.exports = { IntroStory };
} catch (e) {
    window.IntroStory = IntroStory;
}
