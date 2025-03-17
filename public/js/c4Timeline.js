 
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
        this.isResizing = false;
        this.currentMarker = null;
        this.dragStartY = 0;
        this.originalStart = 0;
        this.originalEnd = 0;
        this.resizeThreshold = 8;
        this.deleteButtonSize = 16;  // 增大删除按钮尺寸
        this.lastDeleteTime = 0;

        // 触摸状态
        this.touchStartX = 0;
        this.touchStartY = 0;
    }


    #createUI() {
        const uiDiv = document.createElement('div');
        uiDiv.style.position = 'fixed';
        uiDiv.style.left = '0';
        uiDiv.style.top = '0';
        uiDiv.style.width = '50%';
        uiDiv.style.height = '100%';
        uiDiv.style.overflow = 'hidden';
        uiDiv.style.touchAction = 'none';  // 禁用默认触摸行为
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
        const handleMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (event.clientX || event.touches[0].clientX) - rect.left,
                y: (event.clientY || event.touches[0].clientY) - rect.top
            };
        };

        // 鼠标事件
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
            // 检测点击事件（移动距离小于5px）
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
    }

    #handleClick(event) {
        if (this.isDragging || this.isResizing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const clientX = event.clientX || event.x;
        const clientY = event.clientY || event.y;
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        if (this.#isClickOnExistingMarker(mouseX, mouseY)) return;

        const paddingTop = 20;
        const effectiveHeight = this.canvas.height - paddingTop - 20;
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


    #handleMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseY = event.clientY - rect.top;
        const mouseX = event.clientX - rect.left;
        const clickTime = this.#convertYToTime(mouseY);

        // 防止快速双击误操作
        const now = Date.now();
        if (now - this.lastDeleteTime < 200) {
            event.preventDefault();
            return;
        }
        
        // 检查删除按钮点击
        const clickedDeleteButton = this.#checkDeleteButtonClick(mouseX, mouseY);
        if (clickedDeleteButton) {
            this.timeMarkers = this.timeMarkers.filter(marker => marker !== clickedDeleteButton);
            this.lastDeleteTime = now;
            event.stopPropagation();
            event.preventDefault();
            return;
        }

        
        // 检查底部调整
        const currentWindowStart = Math.floor((this.audio?.currentTime || 0) / 10) * 10;
        this.timeMarkers.forEach(marker => {
            if (this.#isNearMarkerBottom(marker, mouseY)) {
                this.isResizing = true;
                this.currentMarker = marker;
                this.dragStartY = mouseY;
                this.originalEnd = marker.end;
                return;
            }
        });

        // 常规拖动检查
        if (!this.isResizing) {
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


    #checkDeleteButtonClick(mouseX, mouseY) {
        const currentWindowStart = Math.floor((this.audio?.currentTime || 0) / 10) * 10;
        const paddingTop = 20;
        const effectiveHeight = this.canvas.height - paddingTop - 20;
        const perSecondHeight = effectiveHeight / 10;

        for (const marker of this.timeMarkers) {
            if (marker.end <= currentWindowStart || marker.start >= currentWindowStart + 10) continue;

            const visibleStart = Math.max(marker.start, currentWindowStart);
            const visibleEnd = Math.min(marker.end, currentWindowStart + 10);
            const startY = paddingTop + (visibleStart - currentWindowStart) * perSecondHeight;

            // 修正：使用更精确的按钮位置计算
            const deleteButtonX = this.canvas.width * 0.8 - this.deleteButtonSize - 2; // 添加边距
            const deleteButtonY = startY + 2; // 添加边距

            if (mouseX >= deleteButtonX && 
                mouseX <= deleteButtonX + this.deleteButtonSize &&
                mouseY >= deleteButtonY &&
                mouseY <= deleteButtonY + this.deleteButtonSize) {
                return marker;
            }
        }
        return null;
    }

    #handleMouseMove(event) {
        if (this.isResizing) {
            this.#handleResize(event);
        } else if (this.isDragging) {
            this.#handleDrag(event);
        }
    }

    #handleResize(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseY = event.clientY - rect.top;
        const deltaY = mouseY - this.dragStartY;
        
        // 计算时间变化量
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = this.canvas.height - paddingTop - paddingBottom;
        const deltaTime = (deltaY / effectiveHeight) * 10;

        // 计算新结束时间
        const newEnd = this.originalEnd + deltaTime;

        // 边界检查
        if (newEnd <= this.currentMarker.start) return;
        if (newEnd > this.currentMarker.start + 10) return; // 最大跨度10秒

        // 重叠检查（排除自己）
        const hasOverlap = this.timeMarkers.some(marker => {
            return marker !== this.currentMarker && 
                   this.currentMarker.start < marker.end && 
                   newEnd > marker.start;
        });

        if (!hasOverlap) {
            this.currentMarker.end = newEnd;
        }
    }

#handleDrag(event) { // 将原来的拖动逻辑提取到单独方法
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

    #isNearMarkerBottom(marker, mouseY) {
        const currentWindowStart = Math.floor((this.audio?.currentTime || 0) / 10) * 10;
        if (marker.end <= currentWindowStart || marker.start >= currentWindowStart + 10) return false;

        // 转换时间到Y坐标
        const paddingTop = 20;
        const paddingBottom = 20;
        const effectiveHeight = this.canvas.height - paddingTop - paddingBottom;
        const perSecondHeight = effectiveHeight / 10;

        const visibleEnd = Math.min(marker.end, currentWindowStart + 10);
        const endY = paddingTop + (visibleEnd - currentWindowStart) * perSecondHeight;

        // 检查鼠标是否在底部边缘附近
        return Math.abs(mouseY - endY) < this.resizeThreshold;
    }


   #handleMouseUp() {
        this.isDragging = false;
        this.isResizing = false;
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
        if (this.isDragging || this.isResizing || Date.now() - this.lastDeleteTime < 200) return;
        
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseY = event.clientY - rect.top;
        const mouseX = event.clientX - rect.left;
        // 新增：检查是否点击在现有标记区域
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
            this.timeMarkers.push({
                start: newStart,
                end: newEnd
            });
        }
    }

    #isClickOnExistingMarker(mouseX, mouseY) {
        const currentWindowStart = Math.floor((this.audio?.currentTime || 0) / 10) * 10;
        const paddingTop = 20;
        const effectiveHeight = this.canvas.height - paddingTop - 20;
        const perSecondHeight = effectiveHeight / 10;

        for (const marker of this.timeMarkers) {
            if (marker.end <= currentWindowStart || marker.start >= currentWindowStart + 10) continue;

            const visibleStart = Math.max(marker.start, currentWindowStart);
            const visibleEnd = Math.min(marker.end, currentWindowStart + 10);
            const startY = paddingTop + (visibleStart - currentWindowStart) * perSecondHeight;
            const endY = paddingTop + (visibleEnd - currentWindowStart) * perSecondHeight;

            // 检查点击是否在标记区域内
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
        const effectiveHeight = canvas.height - paddingTop - 20;
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
            
            // 绘制删除按钮
            ctx.fillStyle = '#ff0000';
            const deleteButtonX = canvas.width * 0.8 - this.deleteButtonSize;
            ctx.fillRect(
                deleteButtonX,
                yStart,
                this.deleteButtonSize,
                this.deleteButtonSize
            );
            
            // 绘制删除按钮的X
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(deleteButtonX + 2, yStart + 2);
            ctx.lineTo(deleteButtonX + this.deleteButtonSize - 2, yStart + this.deleteButtonSize - 2);
            ctx.moveTo(deleteButtonX + this.deleteButtonSize - 2, yStart + 2);
            ctx.lineTo(deleteButtonX + 2, yStart + this.deleteButtonSize - 2);
            ctx.stroke();

            // 绘制底部调整句柄（保持原有代码）
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(
                canvas.width * 0.8, 
                yEnd - 2,
                canvas.width * 0.2, 
                4
            );
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
//    修正: 
// 让手机运行时，可以移动矩形
// give me all new code，
