class NotificationManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.notifications = [];
        this.maxNotifications = 5;
        this.notificationDuration = 3000; // 默认通知持续时间（毫秒）
        this.messageCooldown = 500; // 消息冷却时间（毫秒）
        this.lastMessageTime = 0;
        this.notificationContainer = null;
        this.audioManager = gameManager.systems.audioManager;
        
        // 通知类型配置
        this.typeConfig = {
            warning: {
                icon: '⚠️',
                borderColor: '#ffcc5c',
                bgColor: 'rgba(255, 204, 92, 0.15)',
                defaultDuration: 4000,
                priority: 3
            },
            error: {
                icon: '❌',
                borderColor: '#ff6b6b',
                bgColor: 'rgba(255, 107, 107, 0.15)',
                defaultDuration: 5000,
                priority: 4
            },
            success: {
                icon: '✅',
                borderColor: '#4ecdc4',
                bgColor: 'rgba(78, 205, 196, 0.15)',
                defaultDuration: 3000,
                priority: 2
            },
            info: {
                icon: 'ℹ️',
                borderColor: '#3498db',
                bgColor: 'rgba(52, 152, 219, 0.15)',
                defaultDuration: 2500,
                priority: 1
            },
            disaster: {
                icon: '🌋',
                borderColor: '#e74c3c',
                bgColor: 'rgba(231, 76, 60, 0.2)',
                defaultDuration: 5000,
                priority: 4
            },
            wormhole: {
                icon: '🌀',
                borderColor: '#9b59b6',
                bgColor: 'rgba(155, 89, 182, 0.15)',
                defaultDuration: 4000,
                priority: 3
            },
            enemy: {
                icon: '👾',
                borderColor: '#e74c3c',
                bgColor: 'rgba(231, 76, 60, 0.15)',
                defaultDuration: 3000,
                priority: 2
            }
        };
    }
    
    init() {
        this.createNotificationContainer();
        this.injectStyles();
    }
    
    injectStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes notificationFadeIn {
                    from {
                        opacity: 0;
                        transform: translateX(30px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
                
                @keyframes notificationFadeOut {
                    from {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(20px) scale(0.95);
                    }
                }
                
                @keyframes notificationPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                
                .notification-enter {
                    animation: notificationFadeIn 0.3s ease-out forwards;
                }
                
                .notification-exit {
                    animation: notificationFadeOut 0.25s ease-in forwards;
                }
                
                .notification-pulse {
                    animation: notificationPulse 1s ease-in-out infinite;
                }
                
                @media (max-width: 768px) {
                    #notification-container {
                        right: 10px !important;
                        bottom: 10px !important;
                        max-width: 280px !important;
                    }
                }
                
                @media (max-width: 480px) {
                    #notification-container {
                        right: 5px !important;
                        bottom: 5px !important;
                        max-width: 250px !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createNotificationContainer() {
        this.notificationContainer = document.getElementById('notification-container');
        if (!this.notificationContainer) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.position = 'absolute';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '1000';
            container.style.display = 'flex';
            container.style.flexDirection = 'column-reverse';
            container.style.alignItems = 'flex-end';
            container.style.gap = '8px';
            container.style.pointerEvents = 'none';
            container.style.maxWidth = '320px';
            container.style.maxHeight = '40vh';
            container.style.overflow = 'hidden';
            
            const gameCanvas = document.getElementById('game-canvas');
            if (gameCanvas) {
                gameCanvas.appendChild(container);
            } else {
                document.getElementById('game-container').appendChild(container);
            }
            this.notificationContainer = container;
        }
    }
    
    showNotification(message, color = '#ffffff', type = 'info', priority = 0, soundType = null, duration = null) {
        const currentTime = Date.now();
        
        // 检查消息冷却
        if (currentTime - this.lastMessageTime < this.messageCooldown) {
            return;
        }
        
        // 获取类型配置
        const typeCfg = this.typeConfig[type] || this.typeConfig.info;
        const effectivePriority = priority || typeCfg.priority;
        const effectiveDuration = duration || typeCfg.defaultDuration;
        
        // 检查是否有类似的通知正在显示
        const similarNotification = this.notifications.find(n => 
            n.message === message && n.type === type
        );
        
        if (similarNotification) {
            similarNotification.timestamp = currentTime;
            similarNotification.duration = effectiveDuration;
            this.updateNotificationDisplay();
            return;
        }
        
        // 创建新通知
        const notification = {
            id: Math.random().toString(36).substr(2, 9),
            message: message,
            color: color,
            type: type,
            priority: effectivePriority,
            timestamp: currentTime,
            duration: effectiveDuration,
            icon: typeCfg.icon,
            borderColor: typeCfg.borderColor,
            bgColor: typeCfg.bgColor,
            element: null,
            isExiting: false
        };
        
        // 添加到通知列表
        this.notifications.push(notification);
        
        // 按优先级排序
        this.notifications.sort((a, b) => b.priority - a.priority);
        
        // 限制通知数量
        while (this.notifications.length > this.maxNotifications) {
            this.removeLowestPriorityNotification();
        }
        
        // 播放音效
        if (soundType && this.audioManager) {
            this.playSound(soundType);
        }
        
        // 更新显示
        this.updateNotificationDisplay();
        
        // 更新最后消息时间
        this.lastMessageTime = currentTime;
    }
    
    playSound(soundType) {
        if (!this.audioManager) return;
        
        switch (soundType) {
            case 'wormhole':
                this.audioManager.playWormholeSound();
                break;
            case 'zoneEnter':
                this.audioManager.playZoneEnterSound();
                break;
            case 'backtrack':
                this.audioManager.playBacktrackSound();
                break;
            case 'gameOver':
                this.audioManager.playGameOverSound();
                break;
            case 'eatFood':
                this.audioManager.playEatFoodSound();
                break;
        }
    }
    
    updateNotificationDisplay() {
        if (!this.notificationContainer) {
            this.createNotificationContainer();
        }
        
        // 清空容器
        this.notificationContainer.innerHTML = '';
        
        // 添加通知元素
        this.notifications.forEach(notification => {
            const element = this.createNotificationElement(notification);
            this.notificationContainer.appendChild(element);
            notification.element = element;
        });
        
        // 设置通知自动移除
        this.scheduleAutoRemove();
    }
    
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.id = `notification-${notification.id}`;
        element.className = 'notification-enter';
        element.style.cssText = `
            background: linear-gradient(135deg, ${notification.bgColor}, rgba(0, 0, 0, 0.85));
            color: ${notification.color};
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            text-align: left;
            width: 100%;
            max-width: 300px;
            min-width: 180px;
            word-wrap: break-word;
            position: relative;
            display: flex;
            align-items: center;
            gap: 8px;
            border-left: 3px solid ${notification.borderColor};
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.3), 0 0 15px ${notification.borderColor}33;
            pointer-events: auto;
            backdrop-filter: blur(5px);
            transition: all 0.2s ease;
        `;
        
        // 鼠标悬停效果
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'scale(1.02)';
            element.style.boxShadow = `0 6px 20px rgba(0, 0, 0, 0.4), 0 0 25px ${notification.borderColor}55`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
            element.style.boxShadow = `0 4px 15px rgba(0, 0, 0, 0.3), 0 0 20px ${notification.borderColor}33`;
        });
        
        // 图标
        const iconElement = document.createElement('span');
        iconElement.style.cssText = `
            font-size: 20px;
            min-width: 24px;
            text-align: center;
        `;
        iconElement.textContent = notification.icon;
        element.appendChild(iconElement);
        
        // 消息内容
        const messageContent = document.createElement('div');
        messageContent.style.cssText = `
            flex: 1;
            white-space: pre-line;
            line-height: 1.4;
        `;
        messageContent.textContent = notification.message;
        element.appendChild(messageContent);
        
        // 关闭按钮
        const closeButton = document.createElement('span');
        closeButton.style.cssText = `
            cursor: pointer;
            font-size: 16px;
            color: rgba(255, 255, 255, 0.6);
            padding: 2px 6px;
            border-radius: 4px;
            transition: all 0.2s ease;
            user-select: none;
        `;
        closeButton.textContent = '×';
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.color = '#ffffff';
            closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.color = 'rgba(255, 255, 255, 0.6)';
            closeButton.style.backgroundColor = 'transparent';
        });
        closeButton.addEventListener('click', () => {
            this.removeNotificationWithAnimation(notification.id);
        });
        element.appendChild(closeButton);
        
        // 进度条
        const progressBar = document.createElement('div');
        const duration = notification.duration || this.notificationDuration;
        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            height: 2px;
            background: linear-gradient(90deg, ${notification.borderColor}, ${notification.color});
            border-radius: 0 0 8px 8px;
            animation: progressShrink ${duration}ms linear forwards;
        `;
        
        // 添加进度条动画
        const progressStyle = document.createElement('style');
        progressStyle.textContent = `
            @keyframes progressShrink {
                from { width: 100%; }
                to { width: 0%; }
            }
        `;
        if (!document.getElementById('progress-style')) {
            progressStyle.id = 'progress-style';
            document.head.appendChild(progressStyle);
        }
        
        element.appendChild(progressBar);
        
        return element;
    }
    
    scheduleAutoRemove() {
        this.notifications.forEach(notification => {
            if (notification.timeoutId) {
                clearTimeout(notification.timeoutId);
            }
            
            notification.timeoutId = setTimeout(() => {
                this.removeNotificationWithAnimation(notification.id);
            }, notification.duration || this.notificationDuration);
        });
    }
    
    removeNotificationWithAnimation(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification || notification.isExiting) return;
        
        notification.isExiting = true;
        
        if (notification.element) {
            notification.element.classList.remove('notification-enter');
            notification.element.classList.add('notification-exit');
            
            setTimeout(() => {
                this.notifications = this.notifications.filter(n => n.id !== notificationId);
                this.updateNotificationDisplay();
            }, 250);
        }
    }
    
    removeOldNotifications() {
        const currentTime = Date.now();
        const expired = this.notifications.filter(notification => {
            const duration = notification.duration || this.notificationDuration;
            return currentTime - notification.timestamp >= duration && !notification.isExiting;
        });
        
        expired.forEach(notification => {
            this.removeNotificationWithAnimation(notification.id);
        });
    }
    
    removeNotification(notificationId) {
        this.removeNotificationWithAnimation(notificationId);
    }
    
    removeOldestNotification() {
        if (this.notifications.length > 0) {
            const oldest = this.notifications.reduce((oldest, current) => 
                current.timestamp < oldest.timestamp ? current : oldest
            );
            this.removeNotificationWithAnimation(oldest.id);
        }
    }
    
    removeLowestPriorityNotification() {
        if (this.notifications.length > 0) {
            const lowest = this.notifications.reduce((lowest, current) => 
                current.priority < lowest.priority ? current : lowest
            );
            const index = this.notifications.indexOf(lowest);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }
    }
    
    clearAllNotifications() {
        this.notifications.forEach(notification => {
            if (notification.element) {
                notification.element.classList.add('notification-exit');
            }
        });
        
        setTimeout(() => {
            this.notifications = [];
            if (this.notificationContainer) {
                this.notificationContainer.innerHTML = '';
            }
        }, 250);
    }
    
    showWormholeNotification(message, wormholeType, priority = 1) {
        this.showNotification(message, wormholeType.color, 'wormhole', priority, 'wormhole');
    }
    
    showZoneNotification(message, zoneType, priority = 1) {
        // 显示区域相关通知
        this.showNotification(message, zoneType.color, 'zone', priority, 'zoneEnter');
    }
    
    update(deltaTime) {
        // 更新通知系统
        this.removeOldNotifications();
    }
    
    reset() {
        // 重置通知系统
        this.clearAllNotifications();
        this.lastMessageTime = 0;
    }
    
    getNotificationCount() {
        // 获取当前通知数量
        return this.notifications.length;
    }
    
    isNotificationActive(message) {
        // 检查指定消息是否有活跃的通知
        return this.notifications.some(n => n.message.includes(message));
    }
}

// 导出通知管理器
try {
    module.exports = NotificationManager;
} catch (e) {
    // 浏览器环境
    window.NotificationManager = NotificationManager;
}
