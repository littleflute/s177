class BLC4ObjsInWindow {
    constructor(id) {
        if (!window.blos) window.blos = [];
        const existing = window.blos.find(obj => obj.id === id);
        if (existing) return existing;

        this.id = id;
        this.currentColor = 'red';
        this.isVisible = false;
        this.dragData = { isDragging: false, startX: 0, startY: 0 };
        this.activeButton = null;
        this.objectToolbar = null; // 新增对象工具栏引用

        // UI初始化
        this.createWindow();
        this.createToolbars();
        this.createCanvas();
        this.assembleUI();
        this.bindEvents();
        
        // 默认高亮红色按钮
        this.highlightButton(this.btnRed);
        window.blos.push(this);
    }

    createWindow() {
        this.window = document.createElement('div');
        Object.assign(this.window.style, {
            position: 'absolute',
            border: '1px solid #666',
            background: '#f0f0f0',
            minWidth: '300px',
            minHeight: '200px',
            left: '100px',
            top: '100px'
        });
    }

    createToolbars() {
        const toolbarStyle = {
            padding: '4px',
            background: '#ddd',
            cursor: 'move',
            display: 'flex',
            gap: '8px'
        };

        // 顶部工具栏（新增管理对象按钮）
        this.topToolbar = document.createElement('div');
        Object.assign(this.topToolbar.style, toolbarStyle);
        this.btnCount = this.createButton('显示数量');
        this.btnHelp = this.createButton('功能说明');
        this.btnManage = this.createButton('管理对象'); // 新增按钮
        this.topToolbar.append(this.btnCount, this.btnHelp, this.btnManage);

        // 底部工具栏
        this.bottomToolbar = document.createElement('div');
        Object.assign(this.bottomToolbar.style, toolbarStyle);
        this.btnRed = this.createButton('红');
        this.btnGreen = this.createButton('绿');
        this.bottomToolbar.append(this.btnRed, this.btnGreen);
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        Object.assign(this.canvas.style, {
            width: '100%',
            height: 'calc(100% - 60px)',
            background: 'white'
        });
        this.ctx = this.canvas.getContext('2d');
    }

    assembleUI() {
        this.window.append(this.topToolbar, this.canvas, this.bottomToolbar);
        document.body.appendChild(this.window);
        this.resizeCanvas();
    }

    createButton(text) {
        const btn = document.createElement('button');
        btn.textContent = text;
        Object.assign(btn.style, {
            padding: '4px 8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: '1px solid transparent',
            background: 'none'
        });
        return btn;
    }

    bindEvents() {
        // 拖动处理
        const handleDrag = {
            start: e => {
                this.dragData.isDragging = true;
                this.dragData.startX = e.clientX - this.window.offsetLeft;
                this.dragData.startY = e.clientY - this.window.offsetTop;
            },
            move: e => {
                if (!this.dragData.isDragging) return;
                this.window.style.left = `${e.clientX - this.dragData.startX}px`;
                this.window.style.top = `${e.clientY - this.dragData.startY}px`;
            },
            end: () => this.dragData.isDragging = false
        };

        this.topToolbar.addEventListener('mousedown', handleDrag.start);
        document.addEventListener('mousemove', handleDrag.move);
        document.addEventListener('mouseup', handleDrag.end);

        // 按钮事件处理函数
        const bindAction = (btn, action) => {
            btn.addEventListener('click', () => {
                action();
                this.highlightButton(btn);
            });
        };

        // 绑定按钮动作
        bindAction(this.btnCount, () => this.showCount());
        bindAction(this.btnHelp, () => this.showHelp());
        bindAction(this.btnRed, () => this.currentColor = 'red');
        bindAction(this.btnGreen, () => this.currentColor = 'green');
        bindAction(this.btnManage, () => this.createObjectToolbar()); // 新增绑定

        // 画布响应式
        new ResizeObserver(() => this.resizeCanvas()).observe(this.window);
    }

    highlightButton(button) {
        [this.btnCount, this.btnHelp, this.btnRed, this.btnGreen, this.btnManage].forEach(btn => {
            const isActive = btn === button;
            btn.style.background = isActive ? '#c0c0c0' : '';
            btn.style.boxShadow = isActive ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : '';
            btn.style.border = isActive ? '1px solid #808080' : '1px solid transparent';
        });
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    showCount() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.currentColor;
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`对象数量: ${window.blos.length}`, 10, 20);
    }

    showHelp() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.currentColor;
        this.ctx.font = '14px Arial';
        [
            '功能说明：',
            '1. 拖动顶部栏移动窗口',
            '2. 底部按钮切换文本颜色',
            '3. 显示当前管理对象数量',
            '4. 最近点击的按钮会保持高亮'
        ].forEach((line, i) => this.ctx.fillText(line, 10, 20 + i * 20));
    }

    toggleUI() {
        this.isVisible = !this.isVisible;
        this.window.style.display = this.isVisible ? 'block' : 'none';
    }

    // 新增方法：创建对象管理工具栏
    createObjectToolbar() {
        // 移除旧工具栏
        if (this.objectToolbar) {
            this.objectToolbar.remove();
        }

        // 创建新工具栏
        this.objectToolbar = document.createElement('div');
        Object.assign(this.objectToolbar.style, {
            padding: '4px',
            background: '#eee',
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap'
        });

        // 为每个对象创建按钮
        window.blos.forEach(obj => {
            const btn = this.createButton(obj.id);
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => this.showObjectInfo(obj.id));
            this.objectToolbar.appendChild(btn);
        });

        // 插入到画布上方
        this.window.insertBefore(this.objectToolbar, this.canvas);
    }

    // 新增方法：显示对象信息
    showObjectInfo(id) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.currentColor;
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`当前对象ID: ${id}`, 10, 20);
        this.highlightButton(this.btnManage);
    }

    static getInstance(id) {
        return window.blos?.find(obj => obj.id === id) || new this(id);
    }
}

/*/ 初始化实例
const objManager = BLC4ObjsInWindow.getInstance('id_s177_i2 _BLC4ObjsInWindow');
objManager.toggleUI();
*/