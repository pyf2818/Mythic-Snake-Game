class SaveManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.maxSlots = 5;
        this.autoSaveInterval = 60;
        this.autoSaveTimer = null;
        this.currentSlot = 0;
        this.saveVersion = '1.0.0';
        
        this.storageKey = 'mythicSnake_saves';
        this.settingsKey = 'mythicSnake_settings';
    }
    
    init() {
        this.loadSettings();
        this.startAutoSave();
    }
    
    loadSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            if (settings) {
                const data = JSON.parse(settings);
                this.currentSlot = data.currentSlot || 0;
                this.autoSaveInterval = data.autoSaveInterval || 60;
            }
        } catch (e) {
            console.warn('加载设置失败:', e);
        }
    }
    
    saveSettings() {
        try {
            const settings = {
                currentSlot: this.currentSlot,
                autoSaveInterval: this.autoSaveInterval,
                lastPlayed: Date.now()
            };
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
        } catch (e) {
            console.warn('保存设置失败:', e);
        }
    }
    
    getSaveSlots() {
        const slots = [];
        for (let i = 0; i < this.maxSlots; i++) {
            const saveData = this.getSlotData(i);
            console.log(`槽位 ${i} 数据:`, saveData ? '存在' : '空');
            slots.push({
                index: i,
                exists: saveData !== null,
                data: saveData
            });
        }
        return slots;
    }
    
    getSlotData(slotIndex) {
        try {
            const key = `${this.storageKey}_slot_${slotIndex}`;
            const data = localStorage.getItem(key);
            console.log(`读取槽位 ${slotIndex}, 键: ${key}, 数据:`, data ? `存在(${data.length}字符)` : '不存在');
            
            if (data) {
                const parsed = JSON.parse(data);
                console.log(`解析后的数据:`, parsed);
                
                if (this.validateSaveData(parsed)) {
                    console.log(`槽位 ${slotIndex} 验证通过`);
                    return parsed;
                } else {
                    console.warn(`存档槽 ${slotIndex} 数据验证失败:`, parsed);
                }
            }
        } catch (e) {
            console.warn(`读取存档槽 ${slotIndex} 失败:`, e);
        }
        return null;
    }
    
    validateSaveData(data) {
        if (!data || typeof data !== 'object') return false;
        
        if (data.compressed === false && data.data) {
            if (!data.version || !data.timestamp) return false;
            if (data.data.game && data.data.game.score !== undefined) return true;
            if (data.data.score !== undefined) return true;
            return false;
        }
        
        if (!data.version || !data.timestamp) return false;
        if (data.game && data.game.score !== undefined) return true;
        if (data.score !== undefined) return true;
        return false;
    }
    
    save(slotIndex = this.currentSlot) {
        try {
            console.log('SaveManager.save() 被调用, 槽位:', slotIndex);
            console.log('gameManager.player:', this.gameManager?.player);
            
            if (!this.gameManager.player) {
                return { success: false, error: '无法保存：游戏未开始' };
            }
            
            const saveData = this.createSaveData();
            console.log('创建的存档数据:', saveData);
            
            const compressed = this.compressData(saveData);
            console.log('压缩后的数据:', compressed);
            
            const key = `${this.storageKey}_slot_${slotIndex}`;
            const jsonStr = JSON.stringify(compressed);
            console.log('存档键:', key, '数据长度:', jsonStr.length);
            
            localStorage.setItem(key, jsonStr);
            
            // 验证保存是否成功
            const savedData = localStorage.getItem(key);
            console.log('验证保存的数据:', savedData ? '成功' : '失败');
            
            this.currentSlot = slotIndex;
            this.saveSettings();
            
            console.log(`游戏已保存到槽位 ${slotIndex}`);
            return { success: true, slot: slotIndex, timestamp: saveData.timestamp };
        } catch (e) {
            console.error('保存失败:', e);
            
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                return { success: false, error: '存储空间不足，请删除部分存档后重试' };
            }
            return { success: false, error: `保存失败: ${e.message}` };
        }
    }
    
    createSaveData() {
        const gm = this.gameManager;
        
        const playTime = gm.playTime || (gm.timeManager ? gm.timeManager.playTime : 0) || 0;
        
        const saveData = {
            version: this.saveVersion,
            timestamp: Date.now(),
            playTime: playTime,
            
            game: {
                score: gm.score || 0,
                gameState: gm.gameState || 'playing',
                enemyDifficulty: gm.enemyDifficulty || 1,
                difficultyTimer: gm.difficultyTimer || 0,
                enemySpawnInterval: gm.enemySpawnInterval || 20,
                enemySpawnCount: gm.enemySpawnCount || 1
            },
            
            player: gm.player ? gm.player.serialize() : null,
            
            gameObjects: (gm.gameObjects || [])
                .filter(obj => !obj.isPlayer)
                .map(obj => obj.serialize ? obj.serialize() : null)
                .filter(obj => obj !== null),
            
            systems: {},
            
            waveSystem: gm.waveSystem ? { ...gm.waveSystem } : null,
            
            coordinatedAttack: gm.coordinatedAttack ? { ...gm.coordinatedAttack } : null
        };
        
        for (let system in gm.systems) {
            if (gm.systems[system] && typeof gm.systems[system].serialize === 'function') {
                try {
                    saveData.systems[system] = gm.systems[system].serialize();
                } catch (e) {
                    console.warn(`序列化系统 ${system} 失败:`, e);
                }
            }
        }
        
        return saveData;
    }
    
    compressData(data) {
        return {
            compressed: false,
            version: data.version,
            timestamp: data.timestamp,
            data: data
        };
    }
    
    decompressData(compressed) {
        if (compressed.compressed === false) {
            return compressed.data;
        }
        return compressed;
    }
    
    load(slotIndex) {
        try {
            console.log('SaveManager.load() 被调用, 槽位:', slotIndex);
            const saveData = this.getSlotData(slotIndex);
            console.log('获取到的存档数据:', saveData);
            
            if (!saveData) {
                return { success: false, error: '存档不存在或已损坏' };
            }
            
            const data = this.decompressData(saveData);
            console.log('解压后的数据:', data);
            
            if (!data || !data.game) {
                return { success: false, error: '存档数据格式错误' };
            }
            
            this.applySaveData(data);
            
            this.currentSlot = slotIndex;
            this.saveSettings();
            
            console.log(`已从槽位 ${slotIndex} 加载游戏`);
            return { success: true, slot: slotIndex };
        } catch (e) {
            console.error('加载失败:', e);
            return { success: false, error: `加载失败: ${e.message}` };
        }
    }
    
    applySaveData(data) {
        const gm = this.gameManager;
        console.log('applySaveData 开始, 数据:', data);
        
        // 先停止当前游戏循环
        gm.stopGameLoop();
        
        if (data.game) {
            gm.score = data.game.score || 0;
            gm.gameState = 'playing';
            gm.enemyDifficulty = data.game.enemyDifficulty || 1;
            gm.difficultyTimer = data.game.difficultyTimer || 0;
            gm.enemySpawnInterval = data.game.enemySpawnInterval || 20;
            gm.enemySpawnCount = data.game.enemySpawnCount || 1;
        }
        
        // 重置计时器
        gm.foodSpawnTimer = 0;
        gm.enemySpawnTimer = 0;
        
        // 清空游戏对象
        gm.gameObjects = [];
        gm.player = null;
        
        // 先反序列化系统数据
        if (data.systems) {
            for (let system in data.systems) {
                if (gm.systems[system] && typeof gm.systems[system].deserialize === 'function') {
                    try {
                        console.log(`反序列化系统: ${system}`);
                        gm.systems[system].deserialize(data.systems[system]);
                    } catch (e) {
                        console.warn(`反序列化系统 ${system} 失败:`, e);
                    }
                }
            }
        }
        
        // 创建玩家
        if (data.player) {
            console.log('创建玩家蛇, 数据:', data.player);
            gm.player = new Snake(gm, true);
            if (typeof gm.player.deserialize === 'function') {
                gm.player.deserialize(data.player);
            }
            gm.gameObjects.push(gm.player);
            console.log('玩家蛇创建完成');
        }
        
        // 创建其他游戏对象
        if (data.gameObjects) {
            console.log('创建其他游戏对象, 数量:', data.gameObjects.length);
            data.gameObjects.forEach(objData => {
                if (objData && objData.isPlayer === false) {
                    try {
                        const aiSnake = new Snake(gm, false);
                        if (typeof aiSnake.deserialize === 'function') {
                            aiSnake.deserialize(objData);
                        }
                        gm.gameObjects.push(aiSnake);
                    } catch (e) {
                        console.warn('创建AI蛇失败:', e);
                    }
                }
            });
        }
        
        if (data.waveSystem) {
            gm.waveSystem = { ...gm.waveSystem, ...data.waveSystem };
        }
        
        if (data.coordinatedAttack) {
            gm.coordinatedAttack = { ...gm.coordinatedAttack, ...data.coordinatedAttack };
        }
        
        // 更新UI
        gm.updateUI();
        console.log('applySaveData 完成, 游戏对象数量:', gm.gameObjects.length);
    }
    
    deleteSlot(slotIndex) {
        try {
            const key = `${this.storageKey}_slot_${slotIndex}`;
            localStorage.removeItem(key);
            
            if (this.currentSlot === slotIndex) {
                this.currentSlot = 0;
                this.saveSettings();
            }
            
            console.log(`已删除槽位 ${slotIndex} 的存档`);
            return { success: true };
        } catch (e) {
            console.error('删除存档失败:', e);
            return { success: false, error: `删除失败: ${e.message}` };
        }
    }
    
    getSlotInfo(slotIndex) {
        const data = this.getSlotData(slotIndex);
        
        if (!data) {
            return {
                exists: false,
                index: slotIndex
            };
        }
        
        const decompressed = this.decompressData(data);
        console.log('getSlotInfo - 解压后的数据:', decompressed);
        
        const gameData = decompressed.game || (decompressed.data && decompressed.data.game) || {};
        const playerData = decompressed.player || (decompressed.data && decompressed.data.player);
        const playTime = decompressed.playTime || (decompressed.data && decompressed.data.playTime) || 0;
        
        return {
            exists: true,
            index: slotIndex,
            timestamp: decompressed.timestamp,
            score: gameData.score || 0,
            playTime: playTime,
            version: decompressed.version,
            playerName: playerData?.name || '未知',
            bodyLength: playerData?.body?.length || 1
        };
    }
    
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
    
    formatPlayTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}时${minutes}分${secs}秒`;
        } else if (minutes > 0) {
            return `${minutes}分${secs}秒`;
        }
        return `${secs}秒`;
    }
    
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            if (this.gameManager.gameState === 'playing' && this.gameManager.player) {
                const result = this.save(this.currentSlot);
                if (result.success) {
                    console.log('自动保存成功');
                    if (this.gameManager.systems.notificationManager) {
                        this.gameManager.systems.notificationManager.showNotification(
                            '💾 游戏已自动保存',
                            '#4ecdc4',
                            'success',
                            1
                        );
                    }
                }
            }
        }, this.autoSaveInterval * 1000);
    }
    
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
    
    setAutoSaveInterval(seconds) {
        this.autoSaveInterval = Math.max(30, Math.min(300, seconds));
        this.saveSettings();
        this.startAutoSave();
    }
    
    getStorageUsage() {
        let total = 0;
        for (let i = 0; i < this.maxSlots; i++) {
            const key = `${this.storageKey}_slot_${i}`;
            const data = localStorage.getItem(key);
            if (data) {
                total += data.length * 2;
            }
        }
        
        return {
            used: total,
            usedKB: (total / 1024).toFixed(2),
            usedMB: (total / (1024 * 1024)).toFixed(2)
        };
    }
    
    exportSave(slotIndex) {
        const data = this.getSlotData(slotIndex);
        if (!data) {
            return { success: false, error: '存档不存在' };
        }
        
        try {
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `mythicSnake_save_${slotIndex}_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return { success: true };
        } catch (e) {
            return { success: false, error: `导出失败: ${e.message}` };
        }
    }
    
    importSave(slotIndex, jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!this.validateSaveData(data)) {
                return { success: false, error: '无效的存档文件' };
            }
            
            const key = `${this.storageKey}_slot_${slotIndex}`;
            localStorage.setItem(key, JSON.stringify(data));
            
            return { success: true };
        } catch (e) {
            return { success: false, error: `导入失败: ${e.message}` };
        }
    }
    
    quickSave() {
        return this.save(this.currentSlot);
    }
    
    quickLoad() {
        return this.load(this.currentSlot);
    }
    
    hasAnySave() {
        for (let i = 0; i < this.maxSlots; i++) {
            if (this.getSlotData(i)) {
                return true;
            }
        }
        return false;
    }
    
    getLatestSaveSlot() {
        let latestSlot = -1;
        let latestTime = 0;
        
        for (let i = 0; i < this.maxSlots; i++) {
            const info = this.getSlotInfo(i);
            if (info.exists && info.timestamp > latestTime) {
                latestTime = info.timestamp;
                latestSlot = i;
            }
        }
        
        return latestSlot;
    }
}

try {
    module.exports = SaveManager;
} catch (e) {
    window.SaveManager = SaveManager;
}
