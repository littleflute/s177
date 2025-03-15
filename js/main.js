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
                    width: 350px;
                    height: 300px;
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

                .playlist-container {
                    max-height: 120px;
                    overflow-y: auto;
                    border: 1px solid #ddd;
                    margin-bottom: 10px;
                }

                #playlist {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                #playlist li {
                    padding: 5px 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #eee;
                    cursor: pointer;
                }

                #playlist li:hover {
                    background-color: #f8f8f8;
                }

                #playlist li.current-track {
                    background-color: #e0f0ff;
                }

                #playlist li button {
                    background: none;
                    border: none;
                    color: #ff4444;
                    cursor: pointer;
                    padding: 0 5px;
                }

                .add-track-form {
                    display: flex;
                    gap: 5px;
                    margin-top: 5px;
                }

                #newTrackUrl {
                    flex-grow: 1;
                    padding: 4px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                .file-upload-btn {
                    background: #28a745;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    cursor: pointer;
                }

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
            document.head.appendChild(style);
        }

        bindEvents() {
            const header = this.modal.querySelector('.window-header');
            const closeBtn = this.modal.querySelector('.close-btn');

            header.addEventListener('mousedown', this.handleMouseDown.bind(this));
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
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

    class C4Playlist {
        constructor() {
            this.tracks = [];
            this.currentIndex = 0;
            this.listeners = [];
        }

        onUpdate(callback) {
            this.listeners.push(callback);
        }

        notifyUpdate() {
            this.listeners.forEach(cb => cb());
        }

        addTrack(track) {
            this.tracks.push(track);
            this.notifyUpdate();
        }

        removeTrack(index) {
            if (index < 0 || index >= this.tracks.length) return;
            const wasCurrent = index === this.currentIndex;
            
            this.tracks.splice(index, 1);
            
            if (this.currentIndex > index) {
                this.currentIndex--;
            } else if (wasCurrent) {
                this.currentIndex = Math.min(this.currentIndex, this.tracks.length - 1);
            }
            
            this.notifyUpdate();
        }

        setCurrentIndex(index) {
            if (index >= 0 && index < this.tracks.length) {
                this.currentIndex = index;
                this.notifyUpdate();
            }
        }

        next() {
            if (this.tracks.length === 0) return;
            this.currentIndex = (this.currentIndex + 1) % this.tracks.length;
            this.notifyUpdate();
        }

        prev() {
            if (this.tracks.length === 0) return;
            this.currentIndex = (this.currentIndex - 1 + this.tracks.length) % this.tracks.length;
            this.notifyUpdate();
        }

        getCurrentTrack() {
            return this.tracks[this.currentIndex] || null;
        }

        getTracks() {
            return [...this.tracks];
        }
    }

    class C4Player {
        constructor(playlist) {
            this.playlist = playlist;
            this.audio = new Audio();
            this.isPlaying = false;
            
            this.audio.addEventListener('ended', () => this.next());
        }

        loadTrack() {
            const track = this.playlist.getCurrentTrack();
            if (track) {
                this.audio.src = track;
                document.getElementById('currentSong').textContent = this.getCurrentSongName();
            } else {
                this.audio.src = '';
                document.getElementById('currentSong').textContent = '-';
            }
        }

        getCurrentSongName() {
            const track = this.playlist.getCurrentTrack();
            return track ? track.split('/').pop().replace(/\.[^/.]+$/, "") : '-';
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
            this.playlist.next();
            this.loadTrack();
            if (this.isPlaying) this.play();
        }

        prev() {
            this.playlist.prev();
            this.loadTrack();
            if (this.isPlaying) this.play();
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const playerWindow = new MovableWindow(
            '音乐播放器',
            `
            <p>当前播放：<span id="currentSong">-</span></p>
            <div class="playlist-container">
                <ul id="playlist"></ul>
                <div class="add-track-form">
                    <input type="text" id="newTrackUrl" placeholder="输入歌曲URL">
                    <button id="addTrackBtn">添加URL</button>
                    <label for="fileInput" class="file-upload-btn">选择文件</label>
                    <input type="file" id="fileInput" accept="audio/*">
                </div>
            </div>
            <div class="player-controls">
                <button id="prevBtn">◄◄</button>
                <button id="playPauseBtn">▶</button>
                <button id="nextBtn">►►</button>
            </div>
            `
        );

        const playlist = new C4Playlist();
        ['p3.mp3', 'p6.mp3', 'p6c.mp3'].forEach(track => playlist.addTrack(track));
        const player = new C4Player(playlist);
        player.loadTrack();

        function renderPlaylist() {
            const playlistElement = document.getElementById('playlist');
            playlistElement.innerHTML = '';
            playlist.getTracks().forEach((track, index) => {
                const li = document.createElement('li');
                li.className = index === playlist.currentIndex ? 'current-track' : '';
                li.innerHTML = `
                    <span>${track.split('/').pop().replace(/\.[^/.]+$/, "")}</span>
                    <button class="delete-track" data-index="${index}">×</button>
                `;
                playlistElement.appendChild(li);
            });
        }

        playlist.onUpdate(() => {
            renderPlaylist();
            document.getElementById('currentSong').textContent = player.getCurrentSongName();
        });

        const contentContainer = playerWindow.getContentContainer();
        
        // 事件绑定
        document.getElementById('openWindowBtn').addEventListener('click', () => playerWindow.show());
        
        contentContainer.querySelector('#playPauseBtn').addEventListener('click', () => {
            player.toggle();
            contentContainer.querySelector('#playPauseBtn').textContent = player.isPlaying ? '❚❚' : '▶';
        });

        contentContainer.querySelector('#prevBtn').addEventListener('click', () => player.prev());
        contentContainer.querySelector('#nextBtn').addEventListener('click', () => player.next());

        // 播放列表点击事件
        document.getElementById('playlist').addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-track')) {
                const index = parseInt(e.target.dataset.index);
                playlist.removeTrack(index);
                if (index === playlist.currentIndex) player.loadTrack();
                return;
            }
            
            const li = e.target.closest('li');
            if (li) {
                const index = Array.from(li.parentNode.children).indexOf(li);
                playlist.setCurrentIndex(index);
                player.loadTrack();
                if (player.isPlaying) player.play();
            }
        });

        // 添加URL
        document.getElementById('addTrackBtn').addEventListener('click', () => {
            const url = document.getElementById('newTrackUrl').value.trim();
            if (url) {
                playlist.addTrack(url);
                document.getElementById('newTrackUrl').value = '';
            }
        });

        // 添加文件
        document.getElementById('fileInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                playlist.addTrack(URL.createObjectURL(file));
                e.target.value = '';
            }
        });

        // 初始化渲染
        renderPlaylist();
    }); 