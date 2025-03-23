 //升级：btn2SaveLog2LocalStorage btn2LoadLogFromLocalStorage
// c4LogWnd.js
class C4LogWnd {
    constructor() {
        this.toggleBtn = document.getElementById('btn2ToggleLogWnd');
        this.logWindow = new MovableWindow('Log', `
            <div class="log-toolbar">
                <button id="clearLogBtn" class="toolbar-btn">Clear</button>
                <button id="btn2SaveLog2LocalStorage" class="toolbar-btn">save</button>
                <button id="btn2LoadLogFromLocalStorage" class="toolbar-btn">load</button>
            </div>
            <div class="log-content"></div>
        `);
        
        this.addStyles();
        this.bindEvents();
        this.logCount = 0;
        this.maxLogs = 100;
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .log-content {
                height: calc(100% - 45px);
                overflow-y: auto;
                padding: 10px;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                color: #333;
                background: #f8f9fa;
            }

            .log-entry {
                margin: 2px 0;
                padding: 4px;
                border-radius: 3px;
                word-break: break-word;
            }

            .log-entry:nth-child(odd) {
                background: #fff;
            }

            .log-entry:nth-child(even) {
                background: #f1f1f1;
            }

            .log-timestamp {
                color: #666;
                margin-right: 10px;
            }

            .log-error {
                color: #dc3545;
                font-weight: bold;
            }

            .log-warn {
                color: #ffc107;
            }

            .log-info {
                color: #17a2b8;
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        this.logWindow.getContentContainer().querySelector('#clearLogBtn').addEventListener('click', () => {
            this.clear();
        });
        // 绑定保存和加载按钮事件
        this.logWindow.getContentContainer().querySelector('#btn2SaveLog2LocalStorage').addEventListener('click', () => {
            this.saveToLocalStorage();
        });
        this.logWindow.getContentContainer().querySelector('#btn2LoadLogFromLocalStorage').addEventListener('click', () => {
            this.loadFromLocalStorage();
        });
    }

    log(message, level = 'info', timestamp = null) {
        const ts = timestamp !== null ? timestamp : new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${level}`;
        logEntry.innerHTML = `
            <span class="log-timestamp">[${ts}]</span>
            ${message}
        `;

        const logContent = this.logWindow.getContentContainer().querySelector('.log-content');
        logContent.appendChild(logEntry);

        // 保持最多maxLogs条日志
        if (++this.logCount > this.maxLogs) {
            logContent.removeChild(logContent.firstChild);
            this.logCount--;
        }

        // 自动滚动到底部
        const isNearBottom = logContent.scrollHeight - logContent.clientHeight <= logContent.scrollTop + 50;
        if (isNearBottom) {
            logContent.scrollTop = logContent.scrollHeight;
        }
    }

    error(message) {
        this.log(message, 'error');
    }

    warn(message) {
        this.log(message, 'warn');
    }

    info(message) {
        this.log(message, 'info');
    }

    clear() {
        const logContent = this.logWindow.getContentContainer().querySelector('.log-content');
        logContent.innerHTML = '';
        this.logCount = 0;
    }
    saveToLocalStorage() {
        const logEntries = [];
        const logContent = this.logWindow.getContentContainer().querySelector('.log-content');
        const entries = logContent.querySelectorAll('.log-entry');
        entries.forEach(entry => {
            const levelClass = Array.from(entry.classList).find(c => c.startsWith('log-'));
            const level = levelClass ? levelClass.substring(4) : 'info'; // 提取日志级别
            const timestampSpan = entry.querySelector('.log-timestamp');
            const timestamp = timestampSpan ? timestampSpan.textContent.replace(/\[|\]/g, '').trim() : new Date().toLocaleTimeString();
            // 克隆并移除时间戳以获取纯消息内容
            const clone = entry.cloneNode(true);
            const tsSpanClone = clone.querySelector('.log-timestamp');
            if (tsSpanClone) tsSpanClone.remove();
            const message = clone.innerHTML.trim();
            logEntries.push({ level, timestamp, message });
        });
        localStorage.setItem('logEntries', JSON.stringify(logEntries));
        console.log('日志已保存至本地存储');
    }

    loadFromLocalStorage() {
        const savedLogs = localStorage.getItem('logEntries');
        if (!savedLogs) {
            console.log('无保存的日志');
            return;
        }
        try {
            const logEntries = JSON.parse(savedLogs);
            this.clear(); // 加载前清空当前日志
            logEntries.forEach(entry => {
                this.log(entry.message, entry.level, entry.timestamp); // 使用保存的时间戳
            });
            console.log('日志从本地存储加载成功');
        } catch (e) {
            console.error('日志加载失败:', e);
        }
    }


    toggleWnd() {
        if (this.logWindow.modal.style.display === 'block') {
            this.logWindow.hide();
            this.toggleBtn.classList.remove('logwnd-active');  // 移除激活状态
        } else {
            this.logWindow.show();
            this.toggleBtn.classList.add('logwnd-active');    // 添加激活状态
        }
    }
}