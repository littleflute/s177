 
//c4Timeline.js

class C4Timeline {
    constructor(document, player) {
        this.body = document.body;
        this.audio = player.audio;
        this.#createUI();
        this.#animate(); // 启动动画循环
    }

    #createUI() {
        const uiDiv = document.createElement('div');
        // 容器样式设置
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
        canvas.style.backgroundColor = 'black';
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
        this.ctx = canvas.getContext('2d');
    }

    #drawTimeMarkers() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        // 新增：定义上下边距
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = height - paddingTop - paddingBottom;

        // 样式设置
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 1;

        // 绘制秒刻度
        for (let i = 0; i <= 10; i++) {
            // 计算带边距的Y坐标
            const y = paddingTop + (i / 10) * effectiveHeight;
            
            // 刻度线（左侧10%宽度）
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width * 0.1, y);
            ctx.stroke();

            // 时间文本（带边距保护）
            let text = `${i}s`;
            // 顶部文字向下偏移，底部文字向上偏移
            if (i === 0) ctx.textBaseline = 'top';
            else if (i === 10) ctx.textBaseline = 'bottom';
            else ctx.textBaseline = 'middle';
            
            ctx.fillText(text, width * 0.1 + 5, y);
        }
    }

    #drawProgressLine() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const currentTime = this.audio?.currentTime || 0;
        const relativeTime = currentTime % 10; // 10秒循环
        
        // 新增：使用带边距的高度计算
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = canvas.height - paddingTop - paddingBottom;
        const y = paddingTop + (relativeTime / 10) * effectiveHeight;

        // 绘制绿色进度线
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    #draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        if (!canvas || !ctx) return;

        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制时间刻度
        this.#drawTimeMarkers();
        
        // 绘制进度线
        this.#drawProgressLine();
    }

    #animate() {
        const loop = () => {
            this.#draw();
            requestAnimationFrame(loop);
        };
        loop();
    }
}
// 升级: 
// 在画布上画时间线刻度是，顶部和底部留一些空间，让刻度数字可以完整显示
// give me all new code，