//main.js
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
        this.modal.id = 'movableWindow';
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
            #movableWindow {
                display: none;
                position: fixed;
                width: 320px;
                height: 220px;
                background: white;
                border: 1px solid #ccc;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 1000;
                font-family: Arial, sans-serif;
            }

            .window-header {
                padding: 10px;
                background: #f0f0f0;
                border-bottom: 1px solid #ddd;
                cursor: move;
                display: flex;
                justify-content: space-between;
                align-items: center;
                user-select: none;
            }

            .close-btn {
                background: none;
                border: none;
                font-size: 1.2em;
                cursor: pointer;
                padding: 0 5px;
                transition: color 0.2s;
            }

            .close-btn:hover {
                color: #ff4444;
            }

            .window-content {
                padding: 15px;
                height: calc(100% - 45px);
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        const header = this.modal.querySelector('.window-header');
        const closeBtn = this.modal.querySelector('.close-btn');

        // 拖动处理
        header.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // 关闭按钮
        closeBtn.addEventListener('click', () => this.hide());
    }

    handleMouseDown(e) {
        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        const rect = this.modal.getBoundingClientRect();
        this.initialX = rect.left;
        this.initialY = rect.top;
        document.body.style.userSelect = 'none';
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;
        
        const newX = this.initialX + deltaX;
        const newY = this.initialY + deltaY;
        
        const maxX = window.innerWidth - this.modal.offsetWidth;
        const maxY = window.innerHeight - this.modal.offsetHeight;
        
        this.modal.style.transform = 'none';
        this.modal.style.left = `${Math.min(Math.max(0, newX), maxX)}px`;
        this.modal.style.top = `${Math.min(Math.max(0, newY), maxY)}px`;
    }

    handleMouseUp() {
        this.isDragging = false;
        document.body.style.userSelect = '';
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
        this.modal.style.left = '50%';
        this.modal.style.top = '50%';
        this.modal.style.transform = 'translate(-50%, -50%)';
    }

    getContentContainer() {
        return this.modal.querySelector('.window-content');
    }
}

// 播放器相关代码
class C4Player {
    constructor() {
        this.playlist = ["p3.mp3", "p6.mp3", "p6c.mp3"];
        this.currentIndex = 0;
        this.audio = new Audio();
        this.isPlaying = false;
        
        this.audio.addEventListener('ended', () => this.next());
    }

    loadTrack() {
        this.audio.src = this.playlist[this.currentIndex];
        document.getElementById('currentSong').textContent = 
            this.getCurrentSongName();
    }

    getCurrentSongName() {
        return this.playlist[this.currentIndex].split('/').pop().replace(/\.[^/.]+$/, "");
    }

    play() {
        return this.audio.play().then(() => {
            this.isPlaying = true;
        });
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
    }

    toggle() {
        this.isPlaying ? this.pause() : this.play();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.loadTrack();
        if (this.isPlaying) this.play();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack();
        if (this.isPlaying) this.play();
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 创建窗口实例
    const playerWindow = new MovableWindow(
        '音乐播放器',
        `
        <p>当前播放：<span id="currentSong">-</span></p>
        <div class="player-controls">
            <button id="prevBtn">◄◄</button>
            <button id="playPauseBtn">▶</button>
            <button id="nextBtn">►►</button>
        </div>
        `
    );

    // 添加播放器专用样式
    const playerStyle = document.createElement('style');
    playerStyle.textContent = `
        .player-controls {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: auto;
        }

        .player-controls button {
            padding: 8px 16px;
            cursor: pointer;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            transition: opacity 0.2s;
        }

        .player-controls button:hover {
            opacity: 0.9;
        }

        #currentSong {
            font-weight: bold;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;
    document.head.appendChild(playerStyle);

    // 初始化播放器
    const player = new C4Player();
    player.loadTrack();

    // 绑定控制按钮
    const openBtn = document.getElementById('openWindowBtn');
    const contentContainer = playerWindow.getContentContainer();
    const playPauseBtn = contentContainer.querySelector('#playPauseBtn');

    openBtn.addEventListener('click', () => playerWindow.show());

    playPauseBtn.addEventListener('click', () => {
        player.toggle();
        playPauseBtn.textContent = player.isPlaying ? '❚❚' : '▶';
    });

    contentContainer.querySelector('#prevBtn').addEventListener('click', () => {
        player.prev();
        playPauseBtn.textContent = '❚❚';
    });

    contentContainer.querySelector('#nextBtn').addEventListener('click', () => {
        player.next();
        playPauseBtn.textContent = '❚❚';
    });
}); 