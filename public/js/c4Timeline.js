 
//c4Timeline.js
class C4Timeline {
    constructor(document, player) {
        this.body = document.body;
        this.audio = player.audio;
        this.#createUI();
        this.#animate();
    }

    #createUI() {
        const uiDiv = document.createElement('div');
        uiDiv.style.position = 'fixed';
        uiDiv.style.left = '0';
        uiDiv.style.top = '0';
        uiDiv.style.width = '50%';
        uiDiv.style.height = '100%';
        uiDiv.style.overflow = 'hidden';
        this.body.appendChild(uiDiv);

        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.backgroundColor = 'black';
        uiDiv.appendChild(canvas);

        const updateCanvasSize = () => {
            canvas.width = uiDiv.clientWidth;
            canvas.height = uiDiv.clientHeight;
        };

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
        
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = height - paddingTop - paddingBottom;

        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.lineWidth = 1;

        // 获取当前时间和当前时间区间
        const currentTime = this.audio?.currentTime || 0;
        const timeWindowStart = Math.floor(currentTime / 10) * 10;

        for (let i = 0; i <= 10; i++) {
            const absoluteTime = timeWindowStart + i;
            const y = paddingTop + (i / 10) * effectiveHeight;

            // 绘制刻度线
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width * 0.1, y);
            ctx.stroke();

            // 设置文字对齐方式
            if (i === 0) {
                ctx.textBaseline = 'top';
            } else if (i === 10) {
                ctx.textBaseline = 'bottom';
            } else {
                ctx.textBaseline = 'middle';
            }

            // 绘制时间文字
            ctx.fillText(`${absoluteTime}s`, width * 0.1 + 5, y);
        }
    }

    #drawProgressLine() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const currentTime = this.audio?.currentTime || 0;
        const relativePosition = (currentTime % 10) / 10;

        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = canvas.height - paddingTop - paddingBottom;
        const y = paddingTop + relativePosition * effectiveHeight;

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

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.#drawTimeMarkers();
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
// 点击鼠标时，点击位置开始画一个与画布同宽的灰色矩形，时间跨度为一秒
// give me all new code，