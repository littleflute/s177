 
//c4Timeline.js
class C4Timeline {
    constructor(document, player) {
        this.body = document.body;
        this.audio = player.audio;
        this.timeMarkers = [];  
        this.#createUI();
        this.#animate();

        // 拖动状态
        this.isDragging = false;
        this.isResizing = false;
        this.currentMarker = null;
        this.dragStartY = 0;
        this.originalStart = 0;
        this.originalEnd = 0;
        this.resizeThreshold = 8;
        this.deleteButtonSize = 16;
        this.lastDeleteTime = 0;

        // 固定时间窗口
        this.fixedTimeWindowStart = null;

        // 触摸状态
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    loadLyricsMarkers(lyrics) {
        // 清除现有标记
        this.timeMarkers = [];
        
        // 添加新的歌词标记（带重叠检查）
        lyrics.forEach(l => {
            if (!this.#hasOverlap(l.start, l.end)) {
                this.timeMarkers.push({
                    start: l.start,
                    end: l.end,
                    text: l.text // 新增保存歌词文本
                });
            }
        });
        
        // 对标记按开始时间排序
        this.timeMarkers.sort((a, b) => a.start - b.start);
        
        // 合并连续的时间段
        for (let i = this.timeMarkers.length - 1; i > 0; i--) {
            const prev = this.timeMarkers[i - 1];
            const current = this.timeMarkers[i];
            if (prev.end >= current.start) {
                prev.end = Math.max(prev.end, current.end);
                this.timeMarkers.splice(i, 1);
            }
        }
    }
    
    #createUI() {
        const uiDiv = document.createElement('div');
        uiDiv.style.position = 'fixed';
        uiDiv.style.left = '0';
        uiDiv.style.top = '0';
        uiDiv.style.width = '50%';
        uiDiv.style.height = '100%';
        uiDiv.style.overflow = 'hidden';
        uiDiv.style.touchAction = 'none';
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

        const handleMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (event.clientX || event.touches[0].clientX) - rect.left,
                y: (event.clientY || event.touches[0].clientY) - rect.top
            };
        };

        // 事件监听
        canvas.addEventListener('mousedown', (e) => this.#handleStart(e.clientX, e.clientY));
        canvas.addEventListener('mousemove', (e) => this.#handleMove(e.clientX, e.clientY));
        canvas.addEventListener('mouseup', () => this.#handleEnd());
        canvas.addEventListener('click', (e) => this.#handleClick(e));

        // 触摸事件
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
            this.#handleStart(touch.clientX, touch.clientY);
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.#handleMove(touch.clientX, touch.clientY);
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            const dx = touch.clientX - this.touchStartX;
            const dy = touch.clientY - this.touchStartY;
            if (Math.sqrt(dx*dx + dy*dy) < 5) {
                this.#handleClick(touch);
            }
            this.#handleEnd();
        }, { passive: false });

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    #handleStart(clientX, clientY) {
        this.fixedTimeWindowStart = Math.floor((this.audio?.currentTime || 0) / 10) * 10;
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        const clickTime = this.#convertYToTime(mouseY);

        if (Date.now() - this.lastDeleteTime < 200) return;

        // 检查删除按钮
        const clickedDelete = this.#checkDeleteButtonClick(mouseX, mouseY);
        if (clickedDelete) {
            this.timeMarkers = this.timeMarkers.filter(m => m !== clickedDelete);
            this.lastDeleteTime = Date.now();
            return;
        }

        // 检查调整大小
        this.timeMarkers.forEach(marker => {
            if (this.#isNearMarkerBottom(marker, mouseY)) {
                this.isResizing = true;
                this.currentMarker = marker;
                this.dragStartY = mouseY;
                this.originalEnd = marker.end;
                return;
            }
        });

        // 检查拖动
        if (!this.isResizing) {
            const currentWindowStart = this.fixedTimeWindowStart;
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
    }

    #handleMove(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        
        if (this.isResizing) {
            this.#handleResize(mouseY);
        } else if (this.isDragging) {
            this.#handleDrag(mouseY);
        }
    }

    #handleEnd() {
        this.isDragging = false;
        this.isResizing = false;
        this.currentMarker = null;
        this.fixedTimeWindowStart = null;
    }

    #handleClick(event) {
        if (this.isDragging || this.isResizing) return;
        if (Date.now() - this.lastDeleteTime < 200) return; // 新增防误触检查
        
        const rect = this.canvas.getBoundingClientRect();
        const clientX = event.clientX || event.x;
        const clientY = event.clientY || event.y;
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        if (this.#isClickOnExistingMarker(mouseX, mouseY)) return;

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

        if (!this.#hasOverlap(newStart, newEnd)) {
            this.timeMarkers.push({ start: newStart, end: newEnd });
        }
    }

    #checkDeleteButtonClick(mouseX, mouseY) {
        const currentWindowStart = this.fixedTimeWindowStart ?? Math.floor((this.audio?.currentTime || 0) / 10) * 10;
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = this.canvas.height - paddingTop - paddingBottom;
        const perSecondHeight = effectiveHeight / 10;

        for (const marker of this.timeMarkers) {
            if (marker.end <= currentWindowStart || marker.start >= currentWindowStart + 10) continue;

            const visibleStart = Math.max(marker.start, currentWindowStart);
            const visibleEnd = Math.min(marker.end, currentWindowStart + 10);
            const startY = paddingTop + (visibleStart - currentWindowStart) * perSecondHeight;

            const deleteButtonX = this.canvas.width * 0.8 - this.deleteButtonSize - 2;
            const deleteButtonY = startY + 2;

            if (mouseX >= deleteButtonX && 
                mouseX <= deleteButtonX + this.deleteButtonSize &&
                mouseY >= deleteButtonY &&
                mouseY <= deleteButtonY + this.deleteButtonSize) {
                return marker;
            }
        }
        return null;
    }

    #handleResize(mouseY) {
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = this.canvas.height - paddingTop - paddingBottom;
        const deltaY = mouseY - this.dragStartY;
        const deltaTime = (deltaY / effectiveHeight) * 10;

        const newEnd = this.originalEnd + deltaTime;

        // 边界检查
        if (newEnd <= this.currentMarker.start) return;
        if (newEnd > this.currentMarker.start + 10) return;

        const hasOverlap = this.timeMarkers.some(marker => {
            return marker !== this.currentMarker && 
                   this.currentMarker.start < marker.end && 
                   newEnd > marker.start;
        });

        if (!hasOverlap) {
            this.currentMarker.end = newEnd;
        }
    }

    #handleDrag(mouseY) {
        if (!this.isDragging || !this.currentMarker) return;
        
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = this.canvas.height - paddingTop - paddingBottom;
        const deltaY = mouseY - this.dragStartY;
        const deltaTime = (deltaY / effectiveHeight) * 10;

        const newStart = this.originalStart + deltaTime;
        const newEnd = this.originalEnd + deltaTime;

        // 边界检查
        if (newStart >= newEnd) return;
        if (newStart < 0) return;

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

    #isNearMarkerBottom(marker, mouseY) {
        const currentWindowStart = this.fixedTimeWindowStart ?? Math.floor((this.audio?.currentTime || 0) / 10) * 10;
        if (marker.end <= currentWindowStart || marker.start >= currentWindowStart + 10) return false;

        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = this.canvas.height - paddingTop - paddingBottom;
        const perSecondHeight = effectiveHeight / 10;

        const visibleEnd = Math.min(marker.end, currentWindowStart + 10);
        const endY = paddingTop + (visibleEnd - currentWindowStart) * perSecondHeight;

        return Math.abs(mouseY - endY) < this.resizeThreshold;
    }

    #convertYToTime(y) {
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = this.canvas.height - paddingTop - paddingBottom;
        let relativeY = y - paddingTop;
        
        relativeY = Math.max(0, Math.min(relativeY, effectiveHeight));
        
        const timeWindowStart = this.fixedTimeWindowStart !== null 
            ? this.fixedTimeWindowStart 
            : Math.floor((this.audio?.currentTime || 0) / 10) * 10;
        
        return timeWindowStart + (relativeY / effectiveHeight) * 10;
    }

    #hasOverlap(newStart, newEnd) {
        return this.timeMarkers.some(marker => {
            return marker.start < newEnd && marker.end > newStart;
        });
    }

    #isClickOnExistingMarker(mouseX, mouseY) {
        const currentWindowStart = this.fixedTimeWindowStart ?? Math.floor((this.audio?.currentTime || 0) / 10) * 10;
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = this.canvas.height - paddingTop - paddingBottom;
        const perSecondHeight = effectiveHeight / 10;

        for (const marker of this.timeMarkers) {
            if (marker.end <= currentWindowStart || marker.start >= currentWindowStart + 10) continue;

            const visibleStart = Math.max(marker.start, currentWindowStart);
            const visibleEnd = Math.min(marker.end, currentWindowStart + 10);
            const startY = paddingTop + (visibleStart - currentWindowStart) * perSecondHeight;
            const endY = paddingTop + (visibleEnd - currentWindowStart) * perSecondHeight;

            if (mouseY >= startY && mouseY <= endY && mouseX <= this.canvas.width * 0.8) {
                return true;
            }
        }
        return false;
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

        const timeWindowStart = this.fixedTimeWindowStart ?? Math.floor((this.audio?.currentTime || 0) / 10) * 10;

        for (let i = 0; i <= 10; i++) {
            const absoluteTime = timeWindowStart + i;
            const y = paddingTop + (i / 10) * effectiveHeight;

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width * 0.1, y);
            ctx.stroke();

            ctx.textBaseline = i === 0 ? 'top' : i === 10 ? 'bottom' : 'middle';
            ctx.fillText(`${absoluteTime}s`, width * 0.1 + 5, y);
        }
    }

    #drawTimeMarkersRectangles() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const timeWindowStart = this.fixedTimeWindowStart ?? Math.floor((this.audio?.currentTime || 0) / 10) * 10;
        const timeWindowEnd = timeWindowStart + 10;

        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = canvas.height - paddingTop - paddingBottom;
        const perSecondHeight = effectiveHeight / 10;

        this.timeMarkers.forEach(marker => {
            if (marker.end <= timeWindowStart || marker.start >= timeWindowEnd) return;

            const visibleStart = Math.max(marker.start, timeWindowStart);
            const visibleEnd = Math.min(marker.end, timeWindowEnd);
            const startOffset = visibleStart - timeWindowStart;
            const endOffset = visibleEnd - timeWindowStart;

            const yStart = paddingTop + startOffset * perSecondHeight;
            const yEnd = paddingTop + endOffset * perSecondHeight;
            
            // 绘制主矩形
            ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
            ctx.fillRect(0, yStart, canvas.width, yEnd - yStart);
            
            // 删除按钮
            ctx.fillStyle = '#ff0000';
            const deleteButtonX = canvas.width * 0.8 - this.deleteButtonSize;
            ctx.fillRect(deleteButtonX, yStart, this.deleteButtonSize, this.deleteButtonSize);
            
            // 删除按钮X
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(deleteButtonX + 2, yStart + 2);
            ctx.lineTo(deleteButtonX + this.deleteButtonSize - 2, yStart + this.deleteButtonSize - 2);
            ctx.moveTo(deleteButtonX + this.deleteButtonSize - 2, yStart + 2);
            ctx.lineTo(deleteButtonX + 2, yStart + this.deleteButtonSize - 2);
            ctx.stroke();

            // 调整句柄
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(canvas.width * 0.8, yEnd - 2, canvas.width * 0.2, 4);

            // 新增：绘制歌词文本
            if (marker.text) {
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textBaseline = 'top';
                
                // 计算可用文本区域（避开删除按钮）
                const textMaxWidth = canvas.width * 0.7;
                const textX = 5;
                const textY = yStart + 2;
                
                // 自动调整字体大小
                let fontSize = 12;
                let text = marker.text;
                while (ctx.measureText(text).width > textMaxWidth && fontSize > 8) {
                    fontSize -= 1;
                    ctx.font = `${fontSize}px Arial`;
                }
                
                // 如果仍然过长则截断
                if (ctx.measureText(text).width > textMaxWidth) {
                    const ellipsis = '...';
                    let maxLength = Math.floor(text.length * textMaxWidth / ctx.measureText(text).width);
                    while (ctx.measureText(text.slice(0, maxLength) + ellipsis).width > textMaxWidth && maxLength > 0) {
                        maxLength--;
                    }
                    text = text.slice(0, maxLength) + ellipsis;
                }
                
                ctx.fillText(text, textX, textY);
            }
        });
    }

    #drawProgressLine() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const currentTime = this.audio?.currentTime || 0;
        const baseTime = this.fixedTimeWindowStart ?? Math.floor(currentTime / 10) * 10;
        
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = canvas.height - paddingTop - paddingBottom;
        const y = paddingTop + ((currentTime - baseTime) / 10) * effectiveHeight;

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
 