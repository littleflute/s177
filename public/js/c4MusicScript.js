class c4MusicScript {
    constructor() {
        this.lsCircle = [];
        // 新增选中状态跟踪
        this.selectedCircle = null;
        this.isDragging = false;
    }
    
    #drawCircles(ctx, currentTime,x,y) {
        // 绘制所有圆形（带选中状态反馈）
        this.lsCircle.forEach(circle => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.r, 0, Math.PI * 2);
            ctx.fillStyle = circle.color;
            ctx.fill();
            // 添加选中边框
            if (circle === this.selectedCircle) {
                ctx.strokeStyle = "yellow";
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        });
    }
    
    onDraw(ctx, currentTime,x,y){
        // 显示时间（保留2位小数）
        ctx.fillStyle = "red";
        ctx.font = "14px Arial";
        ctx.fillText(currentTime.toFixed(2), x, y);
        
        // 绘制所有圆形
        this.#drawCircles(ctx, currentTime,x,y);
    }
    
    onMouseDown(x,y){
        // 从后往前检测确保选中最上层圆形
        for (let i = this.lsCircle.length - 1; i >= 0; i--) {
            const circle = this.lsCircle[i];
            const dx = x - circle.x;
            const dy = y - circle.y;
            
            if (dx*dx + dy*dy <= circle.r*circle.r) {
                this.selectedCircle = circle;
                this.isDragging = true;
                // 添加拖动偏移量（让拖动更自然）
                this.dragOffset = {
                    x: x - circle.x,
                    y: y - circle.y
                };
                return;
            }
        }
        
        // 没有选中时创建新圆形
        this.lsCircle.push({
            x: x,
            y: y,
            r: 20,
            color: "#" + Math.floor(Math.random()*16777215).toString(16) // 随机颜色
        });
    }
    
    onMouseMove(x,y){
        if (this.isDragging && this.selectedCircle) {
            // 应用偏移量实现自然拖动
            this.selectedCircle.x = x - this.dragOffset.x;
            this.selectedCircle.y = y - this.dragOffset.y;
        }
    }
    
    onMouseUp(x,y){
        this.isDragging = false;
        this.selectedCircle = null;
    }
    
    // 新增：双击删除圆形
    onDoubleClick(x,y) {
        for (let i = this.lsCircle.length - 1; i >= 0; i--) {
            const circle = this.lsCircle[i];
            const dx = x - circle.x;
            const dy = y - circle.y;
            
            if (dx*dx + dy*dy <= circle.r*circle.r) {
                this.lsCircle.splice(i, 1);
                return;
            }
        }
    }
}