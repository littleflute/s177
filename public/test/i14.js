class C4XDR177I14 {
    constructor() {
        // 在构造函数中添加窗口管理对象
        this.windows = {}; // 存储窗口实例
        // ...其他原有代码不变...
    }

    // 创建可移动窗口方法
    createMoveableWnd(id, title = 'Window', content = '', options = {}) {
        // 如果窗口已存在则不再创建
        if (this.windows[id]) return;
        
        // 创建窗口元素
        const windowDiv = document.createElement('div');
        windowDiv.className = 'movable-window';
        windowDiv.id = id;
        windowDiv.innerHTML = `
            <div class="movable-header">
                <h3>${title}</h3>
                <span class="window-close">×</span>
            </div>
            <div class="window-content">${content}</div>
        `;

        // 应用自定义样式
        Object.assign(windowDiv.style, {
            width: options.width || '300px',
            height: options.height || '400px',
            left: options.x ? `${options.x}px` : '50%',
            top: options.y ? `${options.y}px` : '50%',
            display: 'none'
        });

        // 添加到DOM
        document.body.appendChild(windowDiv);
        
        // 初始化窗口功能
        this.#initWindowBehavior(windowDiv);
        
        // 存储窗口引用
        this.windows[id] = {
            element: windowDiv,
            visible: false,
            x: 0,
            y: 0
        };
    }

    // 初始化窗口行为（拖动和关闭）
    #initWindowBehavior(windowElement) {
        const header = windowElement.querySelector('.movable-header');
        const closeBtn = windowElement.querySelector('.window-close');

        // 关闭按钮事件
        closeBtn.addEventListener('click', () => {
            this.toggleWnd(windowElement.id, false);
        });

        // 拖动处理逻辑（复用属性面板的拖动逻辑）
        const startDrag = (clientX, clientY) => {
            const rect = windowElement.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const offsetY = clientY - rect.top;

            const moveHandler = (e) => {
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                
                // 计算新位置并限制边界
                const newX = clientX - offsetX;
                const newY = clientY - offsetY;

                windowElement.style.left = `${newX}px`;
                windowElement.style.top = `${newY}px`;
                this.windows[windowElement.id].x = newX;
                this.windows[windowElement.id].y = newY;
            };

            const endHandler = () => {
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('touchmove', moveHandler);
                document.removeEventListener('mouseup', endHandler);
                document.removeEventListener('touchend', endHandler);
            };

            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('touchmove', moveHandler);
            document.addEventListener('mouseup', endHandler);
            document.addEventListener('touchend', endHandler);
        };

        // 桌面端事件
        header.addEventListener('mousedown', (e) => {
            startDrag(e.clientX, e.clientY);
        });

        // 移动端事件
        header.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startDrag(touch.clientX, touch.clientY);
        });
    }

    // 切换窗口显示状态
    toggleWnd(id, forceState) {
        const wnd = this.windows[id];
        if (!wnd) return;

        // 确定新的显示状态
        const newState = typeof forceState === 'boolean' ? 
            forceState : 
            !wnd.visible;

        // 更新状态
        wnd.element.style.display = newState ? 'block' : 'none';
        wnd.visible = newState;

        // 如果是首次显示且没有位置信息，则居中
        if (newState && !wnd.x && !wnd.y) {
            const rect = wnd.element.getBoundingClientRect();
            wnd.element.style.left = `${window.innerWidth/2 - rect.width/2}px`;
            wnd.element.style.top = `${window.innerHeight/2 - rect.height/2}px`;
        }
    }

    
    // ...其他原有代码保持不变...
}

// 添加样式到头部
const style = document.createElement('style');
style.textContent = `
.movable-window {
    position: fixed;
    background: #333;
    color: white;
    border: 1px solid #4CAF50;
    border-radius: 5px;
    z-index: 1005;
    min-width: 250px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    transform: translate(-50%, -50%);
}

.movable-header {
    padding: 10px;
    cursor: move;
    background: #4CAF50;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 5px 5px 0 0;
}

.window-close {
    cursor: pointer;
    font-size: 20px;
    padding: 0 5px;
}

.window-close:hover {
    color: #ff4444;
}

.window-content {
    padding: 15px;
    max-height: 80vh;
    overflow-y: auto;
}
`;
document.head.appendChild(style);