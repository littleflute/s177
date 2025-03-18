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
        this.settingsWindow = null; // 新增设置窗口
        this.isSettingsWindowVisible = false;
        this.timeOffset = 0.5263; // 新增时间偏移属性
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
        const adjustedTime = currentTime - this.timeOffset; // 使用调整后时间
        // 解析节拍类型（如"4/4"）
        const beatsPerBar = parseInt(this.beatType.split('/')[0]);
        
        // 计算音乐时间相关参数
        const secondsPerBeat = 60 / this.BPM;          // 每拍持续时间（秒）
        const secondsPerBar = beatsPerBar * secondsPerBeat; // 每小节持续时间
        
        // 当前小节计算应用偏移
        this.currentBar = Math.floor(adjustedTime / secondsPerBar);
        
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
        const barProgress = (adjustedTime % secondsPerBar) / secondsPerBar;
        ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
        ctx.fillRect(x, y, width * barProgress, height);
    
        // 在小节下方绘制拍子指示“V”
        ctx.save(); // 保存画布状态
        const vSize = 10; // V形的高度
        const vSpacing = 15; // 每个V之间的间距
        const totalVWidth = beatsPerBar * vSize + (beatsPerBar - 1) * vSpacing;
        const startX = x + (width - totalVWidth) / 2; // 水平居中
        const startY = y + height + 15; // 矩形下方15px
    
        // 拍子计算应用偏移
        const currentBarTime = adjustedTime % secondsPerBar;
        const currentBeat = Math.floor(currentBarTime / secondsPerBeat);
    
        ctx.lineWidth = 2; // 设置V形的边框宽度
    
        for (let i = 0; i < beatsPerBar; i++) {
            const vX = startX + i * (vSize + vSpacing);
            const vCenterX = vX + vSize / 2;
    
            // 绘制V形路径（移除closePath避免闭合）
            ctx.beginPath();
            ctx.moveTo(vCenterX - vSize/2, startY);
            ctx.lineTo(vCenterX, startY + vSize);
            ctx.lineTo(vCenterX + vSize/2, startY);
    
            // 根据拍子状态设置样式
            if (i < currentBeat) {
                ctx.strokeStyle = "rgba(255, 255, 0, 0.8)"; // 已完成的拍子黄色
            } else if (i === currentBeat) {
                ctx.strokeStyle = "rgba(255, 255, 0, 0.8)"; // 当前拍子高亮
            } else {
                ctx.strokeStyle = "rgba(128, 128, 128, 0.8)"; // 未完成灰色
            }
            ctx.stroke();
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
        ctx.fillText("MusicScript", this.xAOI + 5, this.yAOI + this.hHeader - 5);
        // 新增设置按钮
        const btnSize = 20;
        const btnX = this.xAOI + this.wAOI - btnSize - 5;
        const btnY = this.yAOI + 2;
        
        // 按钮背景
        ctx.fillStyle = this.isSettingsWindowVisible ? "#007bff" : "#6c757d";
        ctx.beginPath();
        ctx.arc(btnX + btnSize/2, btnY + btnSize/2, btnSize/2, 0, Math.PI*2);
        ctx.fill();
        
        // 按钮图标
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚙", btnX + btnSize/2, btnY + btnSize/2);

        ctx.fillStyle = "red";
        ctx.font = "14px Arial";
        ctx.fillText(currentTime.toFixed(2), x, y);
        this.#drawCurrentBar(ctx,currentTime,this.xAOI+20,this.yAOI+20);
        this.#drawCircles(ctx, currentTime, x, y);
    }
    toggleSettingsWindow() {
        if (!this.settingsWindow) {
            this.createSettingsWindow();
        }
        
        this.isSettingsWindowVisible = !this.isSettingsWindowVisible;
        if (this.isSettingsWindowVisible) {
            this.settingsWindow.show();
        } else {
            this.settingsWindow.hide();
        }
    }
    createSettingsWindow() {
        this.settingsWindow = new MovableWindow("音乐设置", `
            <div style="padding:15px">
                <h3>音乐参数设置</h3>
                <div class="setting-item">
                    <label>时间偏移（秒）：</label>
                        <input type="number" id="timeOffsetInput" 
                            value="${this.timeOffset}" step="0.1" 
                            style="width:80px">
                    <label>BPM：</label>
                    <input type="number" id="bpmInput" value="${this.BPM}" style="width:60px">
                </div>
                <div class="setting-item" style="margin-top:10px">
                    <label>节拍类型：</label>
                    <select id="beatTypeSelect">
                        <option ${this.beatType === '4/4' ? 'selected' : ''}>4/4</option>
                        <option ${this.beatType === '3/4' ? 'selected' : ''}>3/4</option>
                        <option ${this.beatType === '6/8' ? 'selected' : ''}>6/8</option>
                    </select>
                </div>
                <button id="applySettings" 
                        style="margin-top:15px; padding:8px 20px;
                               background:#28a745; color:white; border:none;
                               border-radius:5px">
                    应用设置
                </button>
            </div>
        `);

        // 应用设置事件
        this.settingsWindow.getContentContainer().querySelector('#applySettings').addEventListener('click', () => {
            this.timeOffset = parseFloat(document.getElementById('timeOffsetInput').value);
            this.BPM = parseInt(document.getElementById('bpmInput').value);
            this.beatType = document.getElementById('beatTypeSelect').value;
        });
    }
    
    onMouseDown(x, y) { 

        // 检查是否点击设置按钮
        const btnSize = 20;
        const btnX = this.xAOI + this.wAOI - btnSize - 5;
        const btnY = this.yAOI + 2;
        
        if (x >= btnX && x <= btnX + btnSize &&
            y >= btnY && y <= btnY + btnSize) {
            this.toggleSettingsWindow();
            return;
        }

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