
class c4MusicScript {
    constructor() {
        this.xAOI = 50;
        this.yAOI = 50;
        this.wAOI = 200;
        this.hAOI = 200;
        this.lsCircle = [];
        this.selectedCircle = null;
        this.isDragging = false;
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
        ctx.fillStyle = "lightgray";
        ctx.fillRect(this.xAOI, this.yAOI, this.wAOI, this.hAOI);
        ctx.fillStyle = "red";
        ctx.font = "14px Arial";
        ctx.fillText(currentTime.toFixed(2), x, y);
        this.#drawCircles(ctx, currentTime, x, y);
    }

    onMouseDown(x, y) { 
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

        if (this.isPointInsideAOI(x, y)) { 
            const r = 20;
            const minX = this.xAOI + r;
            const maxX = this.xAOI + this.wAOI - r;
            const minY = this.yAOI + r;
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
        if (this.isDragging && this.selectedCircle) {
            let newX = x - this.dragOffset.x;
            let newY = y - this.dragOffset.y;
            const r = this.selectedCircle.r;
            newX = Math.max(newX, this.xAOI + r);
            newX = Math.min(newX, this.xAOI + this.wAOI - r);
            newY = Math.max(newY, this.yAOI + r);
            newY = Math.min(newY, this.yAOI + this.hAOI - r);
            this.selectedCircle.x = newX;
            this.selectedCircle.y = newY;
        }
    }

    onMouseUp(x, y) {
        this.isDragging = false;
        this.selectedCircle = null;
    }

    onDoubleClick(x, y) {
        if (!this.isPointInsideAOI(x, y)) return;
        for (let i = this.lsCircle.length - 1; i >= 0; i--) {
            const circle = this.lsCircle[i];
            const dx = x - circle.x;
            const dy = y - circle.y;
            if (dx * dx + dy * dy <= circle.r * circle.r) {
                this.lsCircle.splice(i, 1);
                return;
            }
        }
    }
}