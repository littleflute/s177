class c4MusicScript {
    constructor() {
        this.xAOI = 50;
        this.yAOI = 50;
        this.wAOI = 200;
        this.hAOI = 200;
        this.hHeader = 20; // 新增：标题栏高度
        this.lsCircle = [];
        this.selectedCircle = null;
        this.isDragging = false;
        this.isHeaderDragging = false; // 新增：标题栏拖动状态
        this.initialXAOI = null; // 新增：拖动初始AOI位置
        this.initialYAOI = null;
        this.initialMouseX = null; // 新增：拖动初始鼠标位置
        this.initialMouseY = null;
        this.initialCircles = null; // 新增：拖动初始圆形位置
    }

    // 新增：检测是否点击标题栏
    isPointInsideHeader(x, y) {
        return x >= this.xAOI && x <= this.xAOI + this.wAOI &&
               y >= this.yAOI && y <= this.yAOI + this.hHeader;
    }

    isPointInsideAOI(x, y) {
        return x >= this.xAOI && x <= this.xAOI + this.wAOI &&
               y >= this.yAOI && y <= this.yAOI + this.hAOI;
    }

    #drawCircles(ctx, currentTime, x, y) {
        this.lsCircle.forEach(circle => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
            ctx.fillStyle = circle.color;
            ctx.fill();
            if (circle === this.selectedCircle) {
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });
    }

    onDraw(ctx, currentTime, x, y) {
        // 绘制AOI背景
        ctx.fillStyle = "lightgray";
        ctx.fillRect(this.xAOI, this.yAOI, this.wAOI, this.hAOI);
        
        // 新增：绘制标题栏
        ctx.fillStyle = "darkgray";
        ctx.fillRect(this.xAOI, this.yAOI, this.wAOI, this.hHeader);
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText("AOI Header", this.xAOI + 5, this.yAOI + this.hHeader - 5);
        
        ctx.fillStyle = "red";
        ctx.font = "14px Arial";
        ctx.fillText(currentTime.toFixed(2), x, y);
        this.#drawCircles(ctx, currentTime, x, y);
    }

    onMouseDown(x, y) { 
        // 新增：处理标题栏点击
        if (this.isPointInsideHeader(x, y)) {
            this.isHeaderDragging = true;
            this.initialXAOI = this.xAOI;
            this.initialYAOI = this.yAOI;
            this.initialMouseX = x;
            this.initialMouseY = y;
            this.initialCircles = this.lsCircle.map(c => ({x: c.x, y: c.y}));
            return;
        }

        // 原有圆形选择逻辑
        for (let i = this.lsCircle.length - 1; i >= 0; i--) {
            const circle = this.lsCircle[i];
            const dx = x - circle.x;
            const dy = y - circle.y;
            if (dx * dx + dy * dy <= circle.r * circle.r) {
                this.selectedCircle = circle;
                this.isDragging = true;
                this.dragOffset = { x: x - circle.x, y: y - circle.y };
                return;
            }
        }

        // 调整圆形创建区域（避开标题栏）
        if (this.isPointInsideAOI(x, y)) { 
            const r = 20;
            const minX = this.xAOI + r;
            const maxX = this.xAOI + this.wAOI - r;
            const minY = this.yAOI + this.hHeader + r; // 新增：y起点下移
            const maxY = this.yAOI + this.hAOI - r;
            if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
                this.lsCircle.push({
                    x: x,
                    y: y,
                    r: r,
                    color: "#" + Math.floor(Math.random() * 16777215).toString(16)
                });
            }
        } 
    }

    onMouseMove(x, y) {
        // 新增：处理标题栏拖动
        if (this.isHeaderDragging) {
            const deltaX = x - this.initialMouseX;
            const deltaY = y - this.initialMouseY;
            this.xAOI = this.initialXAOI + deltaX;
            this.yAOI = this.initialYAOI + deltaY;
            
            // 同步更新所有圆形位置
            this.lsCircle.forEach((circle, index) => {
                circle.x = this.initialCircles[index].x + deltaX;
                circle.y = this.initialCircles[index].y + deltaY;
            });
        } 
        // 原有圆形拖动逻辑（调整y边界）
        else if (this.isDragging && this.selectedCircle) {
            let newX = x - this.dragOffset.x;
            let newY = y - this.dragOffset.y;
            const r = this.selectedCircle.r;
            
            // x边界保持不变
            newX = Math.max(newX, this.xAOI + r);
            newX = Math.min(newX, this.xAOI + this.wAOI - r);
            
            // 调整y边界（避开标题栏）
            newY = Math.max(newY, this.yAOI + this.hHeader + r);
            newY = Math.min(newY, this.yAOI + this.hAOI - r);
            
            this.selectedCircle.x = newX;
            this.selectedCircle.y = newY;
        }
    }

    onMouseUp(x, y) {
        this.isDragging = false;
        this.selectedCircle = null;
        this.isHeaderDragging = false; // 新增：重置标题栏拖动
        this.initialXAOI = null;       // 清除初始状态
        this.initialYAOI = null;
        this.initialMouseX = null;
        this.initialMouseY = null;
        this.initialCircles = null;
    }

    onDoubleClick(x, y) {
        if (!this.isPointInsideAOI(x, y)) return;
        
        for (let i = this.lsCircle.length - 1; i >= 0; i--) {
            const circle = this.lsCircle[i];
            const dx = x - circle.x;
            const dy = y - circle.y;
            if (dx*dx + dy*dy <= circle.r * circle.r) {
                this.lsCircle.splice(i, 1);
                return;
            }
        }
    }
}