/**
 * UI动画增强系统
 * 提供平滑过渡、加载动画、微交互效果
 */

// UI动画配置
const UIAnimationConfig = {
    // 过渡动画
    transitions: {
        fast: { duration: 0.15, easing: 'ease-out' },
        normal: { duration: 0.3, easing: 'ease-in-out' },
        slow: { duration: 0.5, easing: 'ease-in-out' },
        bounce: { duration: 0.6, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }
    },
    
    // 加载动画
    loading: {
        spinnerSize: 40,
        spinnerColor: '#9b59b6',
        pulseColor: 'rgba(155, 89, 182, 0.3)',
        dotCount: 8,
        animationDuration: 1.2
    },
    
    // 微交互
    microInteractions: {
        hoverScale: 1.05,
        activeScale: 0.95,
        rippleDuration: 0.6,
        glowDuration: 0.3
    },
    
    // 颜色主题
    colors: {
        primary: '#9b59b6',
        secondary: '#3498db',
        success: '#27ae60',
        warning: '#f39c12',
        danger: '#e74c3c',
        info: '#3498db',
        dark: '#2c3e50',
        light: '#ecf0f1'
    }
};

// 动画工具类
class UIAnimator {
    constructor() {
        this.animations = new Map();
        this.frameId = null;
        this.lastTime = 0;
        this.startAnimationLoop();
    }
    
    startAnimationLoop() {
        const loop = (currentTime) => {
            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;
            
            this.updateAnimations(deltaTime);
            this.frameId = requestAnimationFrame(loop);
        };
        
        this.frameId = requestAnimationFrame(loop);
    }
    
    updateAnimations(deltaTime) {
        this.animations.forEach((animation, id) => {
            animation.elapsed += deltaTime;
            const progress = Math.min(animation.elapsed / animation.duration, 1);
            const easedProgress = this.applyEasing(progress, animation.easing);
            
            animation.callback(easedProgress, animation.elapsed);
            
            if (progress >= 1) {
                if (animation.onComplete) animation.onComplete();
                this.animations.delete(id);
            }
        });
    }
    
    applyEasing(progress, easing) {
        const easings = {
            'linear': progress,
            'ease-in': progress * progress,
            'ease-out': 1 - (1 - progress) * (1 - progress),
            'ease-in-out': progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2,
            'bounce': this.bounceEasing(progress),
            'elastic': this.elasticEasing(progress),
            'cubic-bezier(0.68, -0.55, 0.265, 1.55)': this.bounceEasing(progress)
        };
        
        return easings[easing] || easings['ease-out'];
    }
    
    bounceEasing(progress) {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (progress < 1 / d1) {
            return n1 * progress * progress;
        } else if (progress < 2 / d1) {
            return n1 * (progress -= 1.5 / d1) * progress + 0.75;
        } else if (progress < 2.5 / d1) {
            return n1 * (progress -= 2.25 / d1) * progress + 0.9375;
        } else {
            return n1 * (progress -= 2.625 / d1) * progress + 0.984375;
        }
    }
    
    elasticEasing(progress) {
        if (progress === 0 || progress === 1) return progress;
        return Math.pow(2, -10 * progress) * Math.sin((progress - 0.075) * (2 * Math.PI) / 0.3) + 1;
    }
    
    animate(id, duration, callback, easing = 'ease-out', onComplete = null) {
        this.animations.set(id, {
            duration,
            callback,
            easing,
            onComplete,
            elapsed: 0
        });
    }
    
    stop(id) {
        this.animations.delete(id);
    }
    
    stopAll() {
        this.animations.clear();
    }
}

// 加载动画类
class LoadingAnimation {
    constructor(container, options = {}) {
        this.container = container;
        this.options = { ...UIAnimationConfig.loading, ...options };
        this.element = null;
        this.isActive = false;
    }
    
    start() {
        if (this.isActive) return;
        
        this.element = document.createElement('div');
        this.element.className = 'loading-animation';
        this.element.innerHTML = this.createSpinnerHTML();
        
        Object.assign(this.element.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: '1000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
        });
        
        this.container.appendChild(this.element);
        this.isActive = true;
        
        // 添加淡入效果
        requestAnimationFrame(() => {
            this.element.style.opacity = '1';
        });
    }
    
    stop() {
        if (!this.isActive || !this.element) return;
        
        this.element.style.opacity = '0';
        this.element.style.transition = 'opacity 0.3s ease-out';
        
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            this.element = null;
            this.isActive = false;
        }, 300);
    }
    
    createSpinnerHTML() {
        return `
            <div class="spinner-container" style="
                width: ${this.options.spinnerSize}px;
                height: ${this.options.spinnerSize}px;
                position: relative;
            ">
                ${this.createSpinnerDots()}
            </div>
            <div class="loading-text" style="
                color: ${this.options.spinnerColor};
                font-size: 14px;
                font-weight: 500;
                animation: loadingPulse 1.5s ease-in-out infinite;
            ">加载中...</div>
        `;
    }
    
    createSpinnerDots() {
        let dots = '';
        for (let i = 0; i < this.options.dotCount; i++) {
            const angle = (i / this.options.dotCount) * 360;
            const delay = (i / this.options.dotCount) * this.options.animationDuration;
            
            dots += `
                <div class="spinner-dot" style="
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: ${this.options.spinnerColor};
                    border-radius: 50%;
                    top: 50%;
                    left: 50%;
                    transform: rotate(${angle}deg) translate(0, -${this.options.spinnerSize / 2 - 4}px);
                    animation: spinnerDotFade ${this.options.animationDuration}s ease-in-out ${delay}s infinite;
                "></div>
            `;
        }
        return dots;
    }
    
    setText(text) {
        if (this.element) {
            const textElement = this.element.querySelector('.loading-text');
            if (textElement) textElement.textContent = text;
        }
    }
}

// 微交互效果类
class MicroInteractions {
    constructor() {
        this.ripples = [];
        this.glows = [];
        this.init();
    }
    
    init() {
        this.injectStyles();
    }
    
    injectStyles() {
        if (document.getElementById('micro-interaction-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'micro-interaction-styles';
        style.textContent = `
            /* 悬停效果 */
            .hover-lift {
                transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
            }
            .hover-lift:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            /* 点击效果 */
            .click-press {
                transition: transform 0.1s ease-out;
            }
            .click-press:active {
                transform: scale(0.95);
            }
            
            /* 波纹效果 */
            .ripple-container {
                position: relative;
                overflow: hidden;
            }
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.4);
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out;
                pointer-events: none;
            }
            @keyframes rippleEffect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            /* 发光效果 */
            .glow-effect {
                animation: glowPulse 0.3s ease-out;
            }
            @keyframes glowPulse {
                0% { box-shadow: 0 0 0 0 rgba(155, 89, 182, 0.4); }
                100% { box-shadow: 0 0 0 10px rgba(155, 89, 182, 0); }
            }
            
            /* 加载动画 */
            @keyframes spinnerDotFade {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 1; }
            }
            @keyframes loadingPulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }
            
            /* 滑入动画 */
            @keyframes slideInLeft {
                from { transform: translateX(-20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideInRight {
                from { transform: translateX(20px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideInUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes slideInDown {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            /* 缩放动画 */
            @keyframes scaleIn {
                from { transform: scale(0.8); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes scaleOut {
                from { transform: scale(1); opacity: 1; }
                to { transform: scale(0.8); opacity: 0; }
            }
            
            /* 脉冲动画 */
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            /* 摇晃动画 */
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            /* 闪烁动画 */
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            /* 进度条动画 */
            @keyframes progressShine {
                from { left: -100%; }
                to { left: 100%; }
            }
            .progress-bar-animated::after {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                animation: progressShine 2s infinite;
            }
            
            /* 数字变化动画 */
            .number-change {
                animation: numberPop 0.3s ease-out;
            }
            @keyframes numberPop {
                0% { transform: scale(1.3); color: #f39c12; }
                100% { transform: scale(1); }
            }
            
            /* 工具提示动画 */
            .tooltip-animated {
                animation: tooltipFadeIn 0.2s ease-out;
            }
            @keyframes tooltipFadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 添加波纹效果
    addRipple(element, event) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        Object.assign(ripple.style, {
            width: size + 'px',
            height: size + 'px',
            left: x + 'px',
            top: y + 'px'
        });
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // 添加发光效果
    addGlow(element, color = UIAnimationConfig.colors.primary) {
        element.classList.add('glow-effect');
        element.style.setProperty('--glow-color', color);
        
        setTimeout(() => {
            element.classList.remove('glow-effect');
        }, 300);
    }
    
    // 添加悬停效果
    addHoverEffect(element) {
        element.classList.add('hover-lift');
    }
    
    // 添加点击效果
    addClickEffect(element) {
        element.classList.add('click-press');
    }
    
    // 添加滑入动画
    slideIn(element, direction = 'up', duration = 0.3) {
        element.style.animation = `slideIn${this.capitalize(direction)} ${duration}s ease-out forwards`;
    }
    
    // 添加缩放动画
    scaleIn(element, duration = 0.3) {
        element.style.animation = `scaleIn ${duration}s ease-out forwards`;
    }
    
    scaleOut(element, duration = 0.3, callback = null) {
        element.style.animation = `scaleOut ${duration}s ease-out forwards`;
        if (callback) setTimeout(callback, duration * 1000);
    }
    
    // 添加脉冲动画
    pulse(element, duration = 0.5) {
        element.style.animation = `pulse ${duration}s ease-in-out`;
    }
    
    // 添加摇晃动画
    shake(element, duration = 0.5) {
        element.style.animation = `shake ${duration}s ease-in-out`;
    }
    
    // 添加闪烁动画
    blink(element, duration = 1) {
        element.style.animation = `blink ${duration}s ease-in-out infinite`;
    }
    
    // 数字变化动画
    animateNumber(element, from, to, duration = 0.5) {
        const startTime = Date.now();
        const diff = to - from;
        
        const update = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            
            const current = Math.round(from + diff * progress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.classList.add('number-change');
                setTimeout(() => element.classList.remove('number-change'), 300);
            }
        };
        
        update();
    }
    
    // 进度条动画
    animateProgress(element, from, to, duration = 0.5) {
        element.style.transition = `width ${duration}s ease-out`;
        element.style.width = from + '%';
        
        requestAnimationFrame(() => {
            element.style.width = to + '%';
        });
    }
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// UI元素增强类
class UIElementEnhancer {
    constructor() {
        this.microInteractions = new MicroInteractions();
        this.animator = new UIAnimator();
        this.enhancedElements = new Set();
    }
    
    // 增强按钮
    enhanceButton(button) {
        if (this.enhancedElements.has(button)) return;
        
        this.microInteractions.addHoverEffect(button);
        this.microInteractions.addClickEffect(button);
        
        button.classList.add('ripple-container');
        button.addEventListener('click', (e) => {
            this.microInteractions.addRipple(button, e);
        });
        
        this.enhancedElements.add(button);
    }
    
    // 增强卡片
    enhanceCard(card) {
        if (this.enhancedElements.has(card)) return;
        
        this.microInteractions.addHoverEffect(card);
        
        card.addEventListener('mouseenter', () => {
            this.microInteractions.addGlow(card);
        });
        
        this.enhancedElements.add(card);
    }
    
    // 增强进度条
    enhanceProgressBar(progressBar) {
        progressBar.classList.add('progress-bar-animated');
    }
    
    // 增强输入框
    enhanceInput(input) {
        input.addEventListener('focus', () => {
            input.style.transition = 'box-shadow 0.3s ease-out, border-color 0.3s ease-out';
            input.style.boxShadow = `0 0 0 3px ${UIAnimationConfig.colors.primary}33`;
            input.style.borderColor = UIAnimationConfig.colors.primary;
        });
        
        input.addEventListener('blur', () => {
            input.style.boxShadow = 'none';
            input.style.borderColor = '';
        });
    }
    
    // 增强所有元素
    enhanceAll() {
        // 增强所有按钮
        document.querySelectorAll('button, .btn, [role="button"]').forEach(btn => {
            this.enhanceButton(btn);
        });
        
        // 增强所有卡片
        document.querySelectorAll('.card, .panel, [class*="node"]').forEach(card => {
            this.enhanceCard(card);
        });
        
        // 增强所有进度条
        document.querySelectorAll('.progress-bar, [class*="progress"]').forEach(bar => {
            this.enhanceProgressBar(bar);
        });
        
        // 增强所有输入框
        document.querySelectorAll('input, textarea, select').forEach(input => {
            this.enhanceInput(input);
        });
    }
}

// 创建全局实例
const uiAnimator = new UIAnimator();
const microInteractions = new MicroInteractions();
const uiElementEnhancer = new UIElementEnhancer();

// 导出
try {
    module.exports = {
        UIAnimationConfig,
        UIAnimator,
        LoadingAnimation,
        MicroInteractions,
        UIElementEnhancer,
        uiAnimator,
        microInteractions,
        uiElementEnhancer
    };
} catch (e) {
    window.UIAnimationConfig = UIAnimationConfig;
    window.UIAnimator = UIAnimator;
    window.LoadingAnimation = LoadingAnimation;
    window.MicroInteractions = MicroInteractions;
    window.UIElementEnhancer = UIElementEnhancer;
    window.uiAnimator = uiAnimator;
    window.microInteractions = microInteractions;
    window.uiElementEnhancer = uiElementEnhancer;
}
