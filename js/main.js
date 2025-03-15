// main.js
const style = document.createElement('style');
style.textContent = `
    #movableWindow {
        display: none;
        position: fixed;
        width: 300px;
        height: 200px;
        background: white;
        border: 1px solid #ccc;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
    }

    .window-header {
        padding: 10px;
        background: #f0f0f0;
        border-bottom: 1px solid #ddd;
        cursor: move;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 1.2em;
        cursor: pointer;
        padding: 0 5px;
    }

    .close-btn:hover {
        color: #ff4444;
    }

    .window-content {
        padding: 15px;
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.createElement('div');
    modal.id = 'movableWindow';
    modal.innerHTML = `
        <div class="window-header">
            <span>可移动窗口</span>
            <button class="close-btn">&times;</button>
        </div>
        <div class="window-content">
            <p>这是一个可移动的窗口！</p>
            <p>可以拖拽标题栏移动位置</p>
        </div>
    `;

    document.body.appendChild(modal);
    
    const openBtn = document.getElementById('openWindowBtn');
    const closeBtn = modal.querySelector('.close-btn');
    const header = modal.querySelector('.window-header');
    
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    
    openBtn.addEventListener('click', () => {
        const isVisible = modal.style.display === 'block';
        
        if (!isVisible) {
            modal.style.display = 'block';
            if (!modal.dataset.positioned) {
                modal.style.left = '50%';
                modal.style.top = '50%';
                modal.style.transform = 'translate(-50%, -50%)';
                modal.dataset.positioned = true;
            }
        } else {
            modal.style.display = 'none';
        }
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    header.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);

    function startDragging(e) {
        isDragging = true;
        const rect = modal.getBoundingClientRect();
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            const maxX = window.innerWidth - modal.offsetWidth;
            const maxY = window.innerHeight - modal.offsetHeight;
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            
            currentX = Math.min(Math.max(0, currentX), maxX);
            currentY = Math.min(Math.max(0, currentY), maxY);
            
            modal.style.transform = 'none';
            modal.style.left = `${currentX}px`;
            modal.style.top = `${currentY}px`;
        }
    }

    function stopDragging() {
        isDragging = false;
    }
});

const mp3s = ["p3.mp3","p6.mp3","p6c.mp3"];
class C4Player{
}

//实现 C4Player, 在 移动窗口中实现mp3播放器，播放列表初始为 mp3s