class c4MusicScript {
    constructor(document) {
        this.body = document.body;
        this.xAOI = 50;
        this.yAOI = 50;
        this.wAOI = this.body.clientWidth * 0.8;  
        this.hAOI = 200;
        this.hHeader = 20;   
        this.isDragging = false;
        this.isHeaderDragging = false;  
        this.initialXAOI = null; // 新增：拖动初始AOI位置
        this.initialYAOI = null;
        this.initialMouseX = null; // 新增：拖动初始鼠标位置
        this.initialMouseY = null; 
        this.BPM = 114; //每分钟 114 拍
        this.beatType = "4/4";//4分音符为一拍，每小节4拍
        this.currentBar = 0;//当前小节
        this.settingsWindow = null; // 新增设置窗口
        this.isSettingsWindowVisible = false;
        this.timeOffset = 0.5263; // 新增时间偏移属性
        this.barsPerLine = 2; // 新增：每行显示的小节数
        
        this.lyrics = []; // 存储歌词数据
        this.currentLyricIndex = -1; // 当前歌词索引
        this.lyricFontSize = 34; // 初始歌词字号
    }

    updateLyrics(lyrics) {
        this.lyrics = lyrics;
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

    #drawCurrentLine(ctx, currentTime, xPos, yPos) {
        const adjustedTime = currentTime - this.timeOffset;
        const beatsPerBar = parseInt(this.beatType.split('/')[0]);
        const secondsPerBeat = 60 / this.BPM;
        const secondsPerBar = beatsPerBar * secondsPerBeat;
        
        this.currentBar = Math.floor(adjustedTime / secondsPerBar);
        const barProgress = (adjustedTime % secondsPerBar) / secondsPerBar;

        // 计算起始小节和布局参数
        const startBar = Math.floor(this.currentBar / this.barsPerLine) * this.barsPerLine;
        const margin = 20;
        const lineY = this.yAOI + 30; // 时间线垂直位置
        const lineHeight = 30;         // 时间线高度
        const availableWidth = this.wAOI - 2 * margin;
        const blockWidth = availableWidth / this.barsPerLine;

        // 绘制时间线背景
        ctx.fillStyle = "rgba(0, 128, 255, 0.2)";
        ctx.strokeStyle = "navy";
        ctx.lineWidth = 2;
        this.#drawRoundedRect(ctx, this.xAOI + margin, lineY, availableWidth, lineHeight, 5);
        ctx.fill();
        ctx.stroke();

        // 绘制每个小节块
        for (let i = 0; i < this.barsPerLine; i++) {
            const barNumber = startBar + i;
            const blockX = this.xAOI + margin + i * blockWidth;
            const isCurrent = barNumber === this.currentBar;

            // 块背景
            ctx.fillStyle = isCurrent ? "rgba(0, 128, 255, 0.5)" : "rgba(0, 128, 255, 0.2)";
            ctx.fillRect(blockX, lineY, blockWidth, lineHeight);
            ctx.strokeStyle = "navy";
            ctx.strokeRect(blockX, lineY, blockWidth, lineHeight);

            // 小节号
            ctx.fillStyle = "white";
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "center";
            ctx.fillText(`B${barNumber + 1}`, blockX + blockWidth/2, lineY + lineHeight/2);

            // 当前小节进度条
            if (isCurrent) {
                ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
                ctx.fillRect(blockX, lineY, blockWidth * barProgress, lineHeight);
            }

            // 拍子分隔线
            ctx.beginPath();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            for (let beat = 1; beat < beatsPerBar; beat++) {
                const beatX = blockX + (beat / beatsPerBar) * blockWidth;
                ctx.moveTo(beatX, lineY);
                ctx.lineTo(beatX, lineY + lineHeight);
            }
            ctx.stroke();
        }

        // 动态V形指示器
        const currentBeat = Math.floor((adjustedTime % secondsPerBar) / secondsPerBeat);
        const beatProgress = ((adjustedTime % secondsPerBar) % secondsPerBeat) / secondsPerBeat;
        const currentBlockIdx = this.currentBar - startBar;
        if (currentBlockIdx >= 0 && currentBlockIdx < this.barsPerLine) {
            const blockX = this.xAOI + margin + currentBlockIdx * blockWidth;
            const beatX = blockX + (currentBeat + beatProgress) * (blockWidth / beatsPerBar);
            
            ctx.beginPath();
            ctx.moveTo(beatX - 5, lineY + lineHeight + 5);
            ctx.lineTo(beatX, lineY + lineHeight + 15);
            ctx.lineTo(beatX + 5, lineY + lineHeight + 5);
            ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        
        this.#drawLyrics(ctx, currentTime);
    }
    #drawLyrics(ctx, currentTime) {
        if (!this.lyrics.length) return;
 
        const adjustedTime = currentTime;
        
        // 查找当前歌词
        const currentLyric = this.lyrics.find((l, index) => {
            return adjustedTime >= l.start && adjustedTime < l.end;
        });

        // 设置歌词样式
        ctx.fillStyle = "rgba(93, 7, 7, 0.9)";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 2;
        ctx.font = `${this.lyricFontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        // 计算歌词位置（时间线下方）
        const lyricY = this.yAOI + this.hAOI - 30;  
        const maxWidth = this.wAOI * 0.8;

        if (currentLyric) {
            // 动态调整字号
            let fontSize = this.lyricFontSize;
            let textWidth = ctx.measureText(currentLyric.text).width;
            
            while (textWidth > maxWidth && fontSize > 12) {
                fontSize--;
                ctx.font = `${fontSize}px Arial`;
                textWidth = ctx.measureText(currentLyric.text).width;
            }

            // 绘制文字描边
            ctx.strokeText(currentLyric.text, this.xAOI + this.wAOI/2, lyricY);
            // 绘制填充文字
            ctx.fillText(currentLyric.text, this.xAOI + this.wAOI/2, lyricY);
        }

        // 绘制歌词进度条
        if (currentLyric) {
            const progress = (adjustedTime - currentLyric.start) / 
                           (currentLyric.end - currentLyric.start);
            
            // 进度条背景
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fillRect(this.xAOI + this.wAOI/2 - maxWidth/2, lyricY + 5, 
                        maxWidth, 3);
            
            // 进度条前景
            ctx.fillStyle = "#00ff00";
            ctx.fillRect(this.xAOI + this.wAOI/2 - maxWidth/2, lyricY + 5, 
                        maxWidth * progress, 3);
        }
    }
    // 辅助函数：绘制圆角矩形
    #drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
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
        this.#drawCurrentLine(ctx, currentTime, this.xAOI + 20, this.yAOI + 20);  
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
        this.settingsWindow = new MovableWindow("MusicSetting", `
            <div style="padding:15px">
                <h3>音乐参数设置</h3>
                <div class="setting-item"> 
                    <label>歌词字体大小：</label>
                        <input type="number" id="lyricFontSizeInput" 
                            value="${this.lyricFontSize}" min="1" 
                            style="width:60px">
                    <label>BPM：</label>
                    <input type="number" id="bpmInput" value="${this.BPM}" style="width:60px">
                </div>
                <div class="setting-item">
                    <label>时间偏移（秒）：</label>
                        <input type="number" id="timeOffsetInput" 
                            value="${this.timeOffset}" step="0.1" 
                            style="width:80px">
                    <label>每行小节数：</label>
                        <input type="number" id="barsPerLineInput" 
                            value="${this.barsPerLine}" min="1" 
                            style="width:60px"> 
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
            this.barsPerLine = parseInt(document.getElementById('barsPerLineInput').value);
            this.lyricFontSize = parseInt(document.getElementById('lyricFontSizeInput').value);
        });
    }
    
    onMouseDown(x, y) {  
        const btnSize = 20;
        const btnX = this.xAOI + this.wAOI - btnSize - 5;
        const btnY = this.yAOI + 2;
        
        if (x >= btnX && x <= btnX + btnSize &&
            y >= btnY && y <= btnY + btnSize) {
            this.toggleSettingsWindow();
            return;
        } 
        if (this.isPointInsideHeader(x, y)) {
            this.isHeaderDragging = true;
            this.initialXAOI = this.xAOI;
            this.initialYAOI = this.yAOI;
            this.initialMouseX = x;
            this.initialMouseY = y; 
            return;
        } 
    }

    onMouseMove(x, y) { 
        if (this.isHeaderDragging) {
            const deltaX = x - this.initialMouseX;
            const deltaY = y - this.initialMouseY;
            this.xAOI = this.initialXAOI + deltaX;
            this.yAOI = this.initialYAOI + deltaY; 
        }  
    }

    onMouseUp(x, y) {
        this.isDragging = false; 
        this.isHeaderDragging = false;  
        this.initialXAOI = null;       
        this.initialYAOI = null;
        this.initialMouseX = null;
        this.initialMouseY = null; 
    }

    onDoubleClick(x, y) {
        if (!this.isPointInsideAOI(x, y)) return; 
    }
} 
 
