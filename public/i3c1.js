
class BLC4LittlefluteAPI {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.isDragging = false;
        this.lastPosition = { x: 0, y: 0 };
        this.init();
        this.log('系统初始化完成');
    }

    init() {
        this.injectStyles();
        this.createWindow();
        this.bindEvents();
        this.setInitialPosition();
    }

    injectStyles() {
        if (!document.getElementById('BLC4LF-styles')) {
            const style = document.createElement('style');
            style.id = 'BLC4LF-styles';
            style.textContent = `
                .blc-lf-window {
                    position: fixed;
                    border: 1px solid #ebeef5;
                    background: #ffffff;
                    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
                    min-width: 320px;
                    min-height: 240px;
                    resize: both;
                    overflow: hidden;
                    visibility: hidden;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 8px;
                    z-index: 2000;
                }

                .blc-lf-titlebar {
                    padding: 14px 20px;
                    background: #f8f9fa;
                    cursor: move;
                    user-select: none;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #ebeef5;
                    touch-action: none;
                }

                .blc-lf-content {
                    padding: 20px;
                    height: calc(100% - 56px);
                    overflow: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .blc-lf-close {
                    cursor: pointer;
                    padding: 6px 12px;
                    background: #ff4d4f;
                    color: white;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .blc-lf-close:hover {
                    background: #ff7875;
                }

                @media (max-width: 768px) {
                    .blc-lf-window {
                        width: 92vw !important;
                        height: 70vh !important;
                        min-width: unset !important;
                    }
                    .blc-lf-titlebar {
                        padding: 16px;
                    }
                }

                /* 暗黑模式支持 */
                .dark-mode .blc-lf-window {
                    background: #1f1f1f;
                    border-color: #434343;
                }
                .dark-mode .blc-lf-titlebar {
                    background: #262626;
                    border-color: #434343;
                }
            `;
            document.head.appendChild(style);
        }
    }

    createWindow() {
        this.window = document.createElement('div');
        this.window.className = 'blc-lf-window';
        this.window.innerHTML = `
            <div class="blc-lf-titlebar">
                <span>📦 测试窗口</span>
                <div class="blc-lf-close" title="关闭">×</div>
            </div>
            <div class="blc-lf-content">
                <h3>🚀 功能测试</h3>
                <p>窗口状态：<span id="windowHealth">健康</span></p>
                <p>最后操作：<span id="lastOp">无</span></p>
            </div>
        `;
        this.container.appendChild(this.window);
    }

    setInitialPosition() {
        const centerX = window.innerWidth / 2 - 160;
        const centerY = window.innerHeight / 2 - 120;
        this.updatePosition(centerX, centerY);
        this.window.style.visibility = 'visible';
        this.window.style.opacity = '1';
    }

    updatePosition(x, y) {
        const safeX = Math.max(0, Math.min(x, window.innerWidth - this.window.offsetWidth));
        const safeY = Math.max(0, Math.min(y, window.innerHeight - this.window.offsetHeight));
        this.window.style.left = `${safeX}px`;
        this.window.style.top = `${safeY}px`;
    }

    bindEvents() {
        const closeBtn = this.window.querySelector('.blc-lf-close');
        closeBtn.addEventListener('click', () => this.toggleVisibility());

        // 桌面端事件
        this.window.addEventListener('mousedown', (e) => this.handleStart(e));
        document.addEventListener('mousemove', (e) => this.handleMove(e));
        document.addEventListener('mouseup', () => this.handleEnd());

        // 移动端事件
        this.window.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
        document.addEventListener('touchend', () => this.handleEnd());
    }

    handleStart(e) {
        if (e.target.closest('.blc-lf-close')) return;
        this.isDragging = true;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        this.lastPosition = { x: clientX, y: clientY };
        this.window.style.transition = 'none';
    }

    handleMove(e) {
        if (!this.isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        const deltaX = clientX - this.lastPosition.x;
        const deltaY = clientY - this.lastPosition.y;
        
        const newX = parseFloat(this.window.style.left || 0) + deltaX;
        const newY = parseFloat(this.window.style.top || 0) + deltaY;
        
        this.updatePosition(newX, newY);
        this.lastPosition = { x: clientX, y: clientY };
    }

    handleEnd() {
        this.isDragging = false;
        this.window.style.transition = '';
    }

    toggleVisibility() {
        const isVisible = this.window.style.visibility === 'visible';
        this.window.style.visibility = isVisible ? 'hidden' : 'visible';
        this.window.style.opacity = isVisible ? '0' : '1';
        this.window.style.zIndex = 2000 + Date.now() % 1000;
        this.log(`窗口${isVisible ? '隐藏' : '显示'}`);
        this.updateMetrics();
    }

    log(message) {
        const logElement = document.getElementById('statusLog');
        logElement.innerHTML += `<div>🕒 ${new Date().toLocaleTimeString()} - ${message}</div>`;
        logElement.scrollTop = logElement.scrollHeight;
    }

    updateMetrics() {
        const rect = this.window.getBoundingClientRect();
        document.getElementById('windowMetrics').innerHTML = `
            📐 尺寸: ${rect.width.toFixed(0)}x${rect.height.toFixed(0)}px<br>
            🧭 位置: (${rect.left.toFixed(0)}, ${rect.top.toFixed(0)})<br>
            👀 可见性: ${this.window.style.visibility}<br>
            🔮 透明度: ${this.window.style.opacity}<br>
            🎚️ Z-Index: ${this.window.style.zIndex}
        `;
    }
}
