 
//c4Timeline.js
class C4Timeline {
    constructor(document, player) {
        this.body = document.body;
        this.audio = player.audio;
        this.timeMarkers = [];  // 存储时间标记
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

        // 添加点击事件监听
        canvas.addEventListener('click', (event) => {
            this.#handleCanvasClick(event);
        });

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    #handleCanvasClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseY = event.clientY - rect.top;
        
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = this.canvas.height - paddingTop - paddingBottom;
        const relativeY = mouseY - paddingTop;

        if (relativeY < 0 || relativeY > effectiveHeight) return;

        const currentTime = this.audio?.currentTime || 0;
        const timeWindowStart = Math.floor(currentTime / 10) * 10;
        const absoluteTime = timeWindowStart + (relativeY / effectiveHeight) * 10;

        this.timeMarkers.push({
            start: absoluteTime,
            end: absoluteTime + 1
        });
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

        const currentTime = this.audio?.currentTime || 0;
        const timeWindowStart = Math.floor(currentTime / 10) * 10;

        for (let i = 0; i <= 10; i++) {
            const absoluteTime = timeWindowStart + i;
            const y = paddingTop + (i / 10) * effectiveHeight;

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width * 0.1, y);
            ctx.stroke();

            if (i === 0) {
                ctx.textBaseline = 'top';
            } else if (i === 10) {
                ctx.textBaseline = 'bottom';
            } else {
                ctx.textBaseline = 'middle';
            }

            ctx.fillText(`${absoluteTime}s`, width * 0.1 + 5, y);
        }
    }

    #drawTimeMarkersRectangles() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const currentTime = this.audio?.currentTime || 0;
        const timeWindowStart = Math.floor(currentTime / 10) * 10;
        const timeWindowEnd = timeWindowStart + 10;

        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = canvas.height - paddingTop - paddingBottom;
        const perSecondHeight = effectiveHeight / 10;

        ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';

        this.timeMarkers.forEach(marker => {
            if (marker.end <= timeWindowStart || marker.start >= timeWindowEnd) return;

            const visibleStart = Math.max(marker.start, timeWindowStart);
            const visibleEnd = Math.min(marker.end, timeWindowEnd);
            const startOffset = visibleStart - timeWindowStart;
            const endOffset = visibleEnd - timeWindowStart;

            const yStart = paddingTop + (startOffset / 10) * effectiveHeight;
            const yEnd = paddingTop + (endOffset / 10) * effectiveHeight;
            
            ctx.fillRect(0, yStart, canvas.width, yEnd - yStart);
        });
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
        this.#drawTimeMarkersRectangles();
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