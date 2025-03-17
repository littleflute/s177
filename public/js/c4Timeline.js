//c4Timeline.js

class C4Timeline {
    constructor(document, player) {
        this.body = document.body;
        this.#createUI();
    }

    #createUI() {
        const uiDiv = document.createElement('div');
        // 设置容器样式
        uiDiv.style.position = 'fixed';
        uiDiv.style.left = '0';
        uiDiv.style.top = '0';
        uiDiv.style.width = '50%';
        uiDiv.style.height = '100%';
        uiDiv.style.overflow = 'hidden';
        this.body.appendChild(uiDiv);

        // 创建画布元素
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.backgroundColor = 'black'; // 新增背景色设置
        uiDiv.appendChild(canvas);

        // 尺寸更新函数
        const updateCanvasSize = () => {
            canvas.width = uiDiv.clientWidth;
            canvas.height = uiDiv.clientHeight;
        };

        // 初始化尺寸
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        this.canvas = canvas;
    }
}
//升级：让 画布初始为黑色背景