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
        this.BPM = 114;//每分钟 114 拍
        this.beatType = "4/4";//4分音符为一拍，每小节4拍
        this.currentBar = 0;//当前小节
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

    #drawCurrentBar(ctx, currentTime, x, y) {
        // 解析节拍类型（如"4/4"）
        const beatsPerBar = parseInt(this.beatType.split('/')[0]);
        
        // 计算音乐时间相关参数
        const secondsPerBeat = 60 / this.BPM;          // 每拍持续时间（秒）
        const secondsPerBar = beatsPerBar * secondsPerBeat; // 每小节持续时间
        
        // 计算当前小节编号
        this.currentBar = Math.floor(currentTime / secondsPerBar);
        
        // 绘制当前小节指示条背景
        ctx.fillStyle = "rgba(0, 128, 255, 0.7)";     // 半透明蓝色背景
        ctx.strokeStyle = "navy";                      // 深蓝色边框
        ctx.lineWidth = 2;
        
        // 绘制圆角矩形（宽度120px，高度30px）
        const width = 120;
        const height = 30;
        const radius = 5;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        
        // 填充并描边
        ctx.fill();
        ctx.stroke();
    
        // 绘制当前小节文本
        ctx.fillStyle = "white";                      // 白色文字
        ctx.font = "bold 16px Arial";                 // 加粗字体
        ctx.textBaseline = "middle";                  // 垂直居中
        ctx.fillText(
            `Bar: ${this.currentBar + 1}`,            // 显示从1开始的小节编号
            x + 15,                                   // 水平偏移15px
            y + height/2                             // 垂直居中
        );
    
        // 绘制小节持续时间进度条
        const barProgress = (currentTime % secondsPerBar) / secondsPerBar;
        ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
        ctx.fillRect(x, y, width * barProgress, height);
    
        // 在小节下方绘制拍子指示“V”
        ctx.save(); // 保存画布状态
        const vSize = 10; // V形的高度
        const vSpacing = 15; // 每个V之间的间距
        const totalVWidth = beatsPerBar * vSize + (beatsPerBar - 1) * vSpacing;
        const startX = x + (width - totalVWidth) / 2; // 水平居中
        const startY = y + height + 15; // 矩形下方15px
    
        const currentBarTime = currentTime % secondsPerBar;
        const currentBeat = Math.floor(currentBarTime / secondsPerBeat);
    
        ctx.lineWidth = 2; // 设置V形的边框宽度
    
        for (let i = 0; i < beatsPerBar; i++) {
            const vX = startX + i * (vSize + vSpacing);
            const vCenterX = vX + vSize / 2;
    
            // 绘制V形路径
            ctx.beginPath();
            ctx.moveTo(vCenterX - vSize/2, startY);
            ctx.lineTo(vCenterX, startY + vSize);
            ctx.lineTo(vCenterX + vSize/2, startY);
            ctx.closePath();
    
            // 根据拍子状态设置样式
            if (i < currentBeat) {
                ctx.fillStyle = "rgba(255, 255, 0, 0.8)"; // 已完成的拍子填充黄色
                ctx.fill();
            } else {
                ctx.strokeStyle = i === currentBeat ? "rgba(255, 255, 0, 0.8)" : "rgba(128, 128, 128, 0.8)"; // 当前拍子高亮，未完成的灰色
                ctx.stroke();
            }
        }
        ctx.restore(); // 恢复画布状态
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
        this.#drawCurrentBar(ctx,currentTime,this.xAOI+20,this.yAOI+20);
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