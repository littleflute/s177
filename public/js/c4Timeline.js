 
//c4Timeline.js
class C4Timeline {
    constructor(document, player) {
        this.body = document.body;
        this.audio = player.audio;
        this.timeMarkers = [];  // 存储时间标记
        this.#createUI();
        this.#animate();

        // 拖动状态
        this.isDragging = false;
        this.currentMarker = null;
        this.dragStartY = 0;
        this.originalStart = 0;
        this.originalEnd = 0;
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
    
        // 事件监听
        canvas.addEventListener('click', (event) => this.#handleCanvasClick(event));
        canvas.addEventListener('mousedown', (event) => this.#handleMouseDown(event));
        canvas.addEventListener('mousemove', (event) => this.#handleMouseMove(event));
        canvas.addEventListener('mouseup', (event) => this.#handleMouseUp(event));
    
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    #handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseY = event.clientY - rect.top;
        const clickTime = this.#convertYToTime(mouseY);
        
        // 查找点击的矩形
        const currentWindowStart = Math.floor((this.audio?.currentTime || 0) / 10) * 10;
        this.timeMarkers.forEach(marker => {
            if (clickTime >= marker.start && clickTime <= marker.end && 
                marker.start < currentWindowStart + 10 && 
                marker.end > currentWindowStart) {
                this.isDragging = true;
                this.currentMarker = marker;
                this.dragStartY = mouseY;
                this.originalStart = marker.start;
                this.originalEnd = marker.end;
            }
        });
    }

    #handleMouseMove(event) {
        if (!this.isDragging || !this.currentMarker) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseY = event.clientY - rect.top;
        const deltaY = mouseY - this.dragStartY;
        
        // 计算时间变化量
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = this.canvas.height - paddingTop - paddingBottom;
        const deltaTime = (deltaY / effectiveHeight) * 10;

        // 计算新位置
        const newStart = this.originalStart + deltaTime;
        const newEnd = this.originalEnd + deltaTime;

        // 边界检查
        if (newStart >= newEnd) return;
        if (newStart < 0) return;

        // 重叠检查（排除自己）
        const hasOverlap = this.timeMarkers.some(marker => {
            return marker !== this.currentMarker && 
                   newStart < marker.end && 
                   newEnd > marker.start;
        });

        if (!hasOverlap) {
            this.currentMarker.start = newStart;
            this.currentMarker.end = newEnd;
        }
    }

    #handleMouseUp() {
        this.isDragging = false;
        this.currentMarker = null;
        this.dragStartY = 0;
        this.originalStart = 0;
        this.originalEnd = 0;
    }

    #convertYToTime(y) {
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = this.canvas.height - paddingTop - paddingBottom;
        let relativeY = y - paddingTop;
        
        relativeY = Math.max(0, Math.min(relativeY, effectiveHeight));
        
        const currentTime = this.audio?.currentTime || 0;
        const timeWindowStart = Math.floor(currentTime / 10) * 10;
        return timeWindowStart + (relativeY / effectiveHeight) * 10;
    }


    #hasOverlap(newStart, newEnd) {
        return this.timeMarkers.some(marker => {
            return marker.start < newEnd && marker.end > newStart;
        });
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
    
        const newStart = absoluteTime;
        const newEnd = newStart + 1;
    
        // 检查时间重叠
        if (!this.#hasOverlap(newStart, newEnd)) {
            this.timeMarkers.push({
                start: newStart,
                end: newEnd
            });
        }
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
//    升级: 
// 已经加上的矩形可以移动底部改变时间跨度
// give me all new code，