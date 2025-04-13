//c4MovableWnd.js

class MovableWindow {
    constructor(title, contentHTML) {
        this.isDragging = false;
        this.initialized = false;
        this.createWindowElement(title, contentHTML);
        this.addStyles();
        this.bindEvents();
    }

    createWindowElement(title, contentHTML) {
        this.modal = document.createElement('div');
        this.modal.className = 'movable-window';
        this.modal.innerHTML = `
            <div class="window-header">
                <span>${title}</span>
                <button class="close-btn">&times;</button>
            </div>
            <div class="window-content">
                ${contentHTML}
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    addStyles() {
        if (document.getElementById('movable-window-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'movable-window-styles';
        style.textContent = ` 
        #openWindowBtn {
            transition: transform 0.1s;
        }
        #openWindowBtn:active {
            transform: scale(0.95);
        }
        .lyrics-toolbar {
            padding: 12px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            gap: 10px;
        }

        .toolbar-btn {
            padding: 8px 16px;
            background: #17a2b8;
            color: white;
            border: none;
            border-radius: 20px;
            font-size: 0.9rem;
            touch-action: manipulation;
            transition: transform 0.1s;
        }
        .toolbar-btn:active {
            transform: scale(0.95);
        }
            #toggleLyricsBtn {
                background: #007bff;  /* 默认蓝色 */
                width: auto;
                padding: 0 20px;
                border-radius: 30px;
                font-size: 1rem;
                transition: background 0.2s, transform 0.1s;  /* 增加transform过渡 */
            }

            #toggleLyricsBtn:active {
                background: #0056b3;  /* 更深的品牌蓝色 */
                transform: scale(0.95); 
            }

            #toggleLyricsBtn.active {
                background: #6610f2;  /* 激活状态紫色 */
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);  /* 增加层次感 */
            }
            .movable-window {
                display: none;
                position: fixed;
                width: 90%;
                max-width: 400px;
                height: 70vh;
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
                z-index: 1000;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                touch-action: none;
                overflow: hidden;
            }

            .window-header {
                padding: 16px;
                background: #f8f9fa;
                border-bottom: 1px solid #dee2e6;
                display: flex;
                justify-content: space-between;
                align-items: center;
                -webkit-tap-highlight-color: transparent;
            }

            .close-btn {
                background: none;
                border: none;
                font-size: 1.8rem;
                width: 44px;
                height: 44px;
                line-height: 44px;
            }

            .window-content {
                padding: 16px;
                height: calc(100% - 62px);
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            }

            /* 进度条样式 */
            .progress-container {
                height: 8px;
                background: #e9ecef;
                border-radius: 4px;
                margin: 20px 0;
                touch-action: none;
            }

            .progress-bar {
                height: 100%;
                background: #007bff;
                border-radius: 4px;
                transition: width 0.1s linear;
            }

            /* 播放控制 */
            .player-controls {
                gap: 10px;
                margin: 15px 0;
            }

            .player-controls button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: none;
                background: #007bff;
                color: white;
                font-size: 1.4rem;
                touch-action: manipulation;
                transition: transform 0.1s;
            }

            .player-controls button:active {
                transform: scale(0.95);
            }

            /* 播放列表 */
            .playlist-container {
                flex-grow: 1;
                max-height: 40vh;
                overflow-y: auto;
            }

            #playlist {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            #playlist li {
                padding: 12px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: background 0.2s;
            }

            #playlist li.current-track {
                background: #e3f2fd;
            }

            /* 歌词样式 */
            .lyrics-container {
                height: 50vh;
                padding: 16px;
                font-size: 1.1rem;
                line-height: 1.8;
                text-align: center;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            }

            .current-lyric {
                color: #007bff;
                font-weight: bold;
                transform: scale(1.05);
            }

            /* 移动端优化 */
            @media (max-width: 480px) {
                .movable-window {
                    width: 95%;
                    height: 80vh;
                }
                
                .player-controls button {
                    width: 55px;
                    height: 55px;
                }
            }

            /* 文件上传按钮 */
            .file-upload-wrapper {
                margin-top: 15px;
                text-align: center;
            }

            .file-upload-btn {
                display: inline-block;
                padding: 12px 24px;
                background: #28a745;
                color: white;
                border-radius: 25px;
                cursor: pointer;
                transition: background 0.2s;
            }

            .file-upload-btn:active {
                background: #218838;
            }

            #currentSong {
                display: block;
                text-align: center;
                font-size: 1.1rem;
                margin: 15px 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
                canvas {
                    cursor: pointer;
                }
                canvas.resize-vertical {
                    cursor: ns-resize;
                }

                .movable-window .setting-item {
                    margin: 10px 0;
                    display: flex;
                    align-items: center;
                }

                .movable-window .setting-item label {
                    width: 80px;
                    margin-right: 10px;
                }

                .movable-window select {
                    padding: 4px;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                }
                #btn2ToggleLogWnd.logwnd-active {
                    background: #6610f2 !important;  /* 使用与歌词按钮相同的紫色 */
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                #btn2ToggleLogWnd {
                    transition: background 0.2s, transform 0.1s;
                }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        const header = this.modal.querySelector('.window-header');
        
        // 触摸事件
        header.addEventListener('touchstart', (e) => this.handleStart(e.touches[0]));
        document.addEventListener('touchmove', (e) => this.handleMove(e.touches[0]), { passive: false });
        document.addEventListener('touchend', () => this.handleEnd());

        // 鼠标事件
        header.addEventListener('mousedown', (e) => this.handleStart(e));
        document.addEventListener('mousemove', (e) => this.handleMove(e));
        document.addEventListener('mouseup', () => this.handleEnd());

        this.modal.querySelector('.close-btn').addEventListener('click', () => this.hide());
    }

    handleStart(e) {
        this.isDragging = true;
        const rect = this.modal.getBoundingClientRect();
        // 计算鼠标点击位置相对于窗口左上角的偏移
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
        this.modal.style.transition = 'none';
    }

    handleMove(e) {
        if (!this.isDragging) return;
        
        // 根据偏移量计算新位置
        const newX = e.clientX - this.offsetX;
        const newY = e.clientY - this.offsetY;
        
        // 边界限制
        const maxX = window.innerWidth - this.modal.offsetWidth;
        const maxY = window.innerHeight - this.modal.offsetHeight;
        
        this.modal.style.left = `${Math.min(Math.max(0, newX), maxX)}px`;
        this.modal.style.top = `${Math.min(Math.max(0, newY), maxY)}px`;
    }

    handleEnd() {
        this.isDragging = false;
        this.modal.style.transition = 'all 0.3s ease';
    }

    show() {
        if (!this.initialized) {
            this.centerPosition();
            this.initialized = true;
        }
        this.modal.style.display = 'block';
    }

    hide() {
        this.modal.style.display = 'none';
    }

    centerPosition() {
        // 设置距左上角的固定偏移量
        const leftMargin = 20;
        const topMargin = 20;
        
        // 计算最大允许位置
        const maxLeft = window.innerWidth - this.modal.offsetWidth;
        const maxTop = window.innerHeight - this.modal.offsetHeight;
        
        // 应用偏移并确保不超出边界
        this.modal.style.left = `${Math.min(leftMargin, maxLeft)}px`;
        this.modal.style.top = `${Math.min(topMargin, maxTop)}px`;
        this.modal.style.transform = 'none';
    }
    getContentContainer() {
        return this.modal.querySelector('.window-content');
    }
}
