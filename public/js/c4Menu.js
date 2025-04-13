//c4Menu.js
class C4Menu {
    constructor() {
        this.menuItems = [];
        this.window = new MovableWindow('导航菜单', '<ul class="c4-menu-container"></ul>');
        this.window.getContentContainer().classList.add('c4-menu-wrapper');
        this.addStyles();
        this.currentSubMenu = null;
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .c4-menu-wrapper {
                padding: 8px 0 !important;
                min-width: 200px;
            }

            .c4-menu-container {
                list-style: none;
                padding: 0;
                margin: 0;
                font-size: 16px;
            }

            .c4-menu-item {
                position: relative;
                padding: 12px 20px;
                display: flex;
                align-items: center;
                transition: background 0.2s;
                -webkit-tap-highlight-color: transparent;
            }

            .c4-menu-item:hover,
            .c4-menu-item:active {
                background: rgba(0,0,0,0.05);
            }

            .menu-icon {
                width: 24px;
                height: 24px;
                margin-right: 12px;
            }

            .menu-text {
                flex: 1;
            }

            .submenu-indicator {
                width: 16px;
                height: 16px;
                margin-left: 8px;
                opacity: 0.6;
            }

            .c4-submenu {
                position: absolute;
                left: 100%;
                top: 0;
                background: #fff;
                box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
                border-radius: 8px;
                min-width: 180px;
                display: none;
                z-index: 2000;
            }

            .show-submenu {
                display: block;
                animation: slideIn 0.2s ease;
            }

            @keyframes slideIn {
                from { opacity: 0; transform: translateX(-10px); }
                to { opacity: 1; transform: translateX(0); }
            }

            .menu-divider {
                height: 1px;
                background: #ddd;
                margin: 6px 0;
            }
        `;
        document.head.appendChild(style);
    }

    addMenuItem(config) {
        const menuContainer = this.window.getContentContainer().querySelector('ul');
        const li = document.createElement('li');
        li.className = 'c4-menu-item';
        
        if (config.type === 'divider') {
            const divider = document.createElement('div');
            divider.className = 'menu-divider';
            li.appendChild(divider);
            this.menuItems.push(li);
            menuContainer.appendChild(li);
            return;
        }

        li.innerHTML = `
            ${config.icon ? `<img src="${config.icon}" class="menu-icon">` : ''}
            <span class="menu-text">${config.label}</span>
            ${config.submenu ? '<img src="arrow-right.svg" class="submenu-indicator">' : ''}
        `;

        if (config.action) {
            li.addEventListener('click', (e) => {
                if (!config.submenu) {
                    config.action(e);
                    this.window.hide();
                }
            });
        }

        if (config.submenu) {
            const submenu = this.createSubMenu(config.submenu);
            li.appendChild(submenu);
            this.setupSubMenuHover(li, submenu);
        }

        this.setupTouchEvents(li);
        this.menuItems.push(li);
        menuContainer.appendChild(li);
    }

    createSubMenu(items) {
        const submenu = document.createElement('ul');
        submenu.className = 'c4-submenu';
        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'c4-menu-item';
            li.innerHTML = `
                ${item.icon ? `<img src="${item.icon}" class="menu-icon">` : ''}
                <span class="menu-text">${item.label}</span>
            `;
            if (item.action) {
                li.addEventListener('click', (e) => {
                    item.action(e);
                    this.window.hide();
                });
            }
            submenu.appendChild(li);
        });
        return submenu;
    }

    setupSubMenuHover(menuItem, submenu) {
        let showTimeout;
        let hideTimeout;

        const showSubMenu = () => {
            clearTimeout(hideTimeout);
            showTimeout = setTimeout(() => {
                this.closeCurrentSubMenu();
                submenu.classList.add('show-submenu');
                this.currentSubMenu = submenu;
            }, 200);
        };

        const hideSubMenu = () => {
            clearTimeout(showTimeout);
            hideTimeout = setTimeout(() => {
                submenu.classList.remove('show-submenu');
            }, 300);
        };

        // 鼠标交互
        menuItem.addEventListener('mouseenter', showSubMenu);
        menuItem.addEventListener('mouseleave', hideSubMenu);
        submenu.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
        submenu.addEventListener('mouseleave', hideSubMenu);

        // 触摸交互
        menuItem.addEventListener('touchstart', (e) => {
            e.preventDefault();
            showSubMenu();
        });

        document.addEventListener('touchstart', (e) => {
            if (!submenu.contains(e.target)) {
                hideSubMenu();
            }
        });
    }

    setupTouchEvents(element) {
        let tapTimer;
        let startX;
        let startY;

        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            tapTimer = setTimeout(() => {
                element.classList.add('active');
            }, 100);
        });

        element.addEventListener('touchmove', (e) => {
            const deltaX = Math.abs(e.touches[0].clientX - startX);
            const deltaY = Math.abs(e.touches[0].clientY - startY);
            if (deltaX > 10 || deltaY > 10) {
                clearTimeout(tapTimer);
                element.classList.remove('active');
            }
        });

        element.addEventListener('touchend', () => {
            clearTimeout(tapTimer);
            element.classList.remove('active');
        });
    }

    closeCurrentSubMenu() {
        if (this.currentSubMenu) {
            this.currentSubMenu.classList.remove('show-submenu');
            this.currentSubMenu = null;
        }
    }

    toggleWnd() {
        if (this.window.modal.style.display === 'block') {
            this.window.hide();
        } else {
            this.window.show();
            this.closeCurrentSubMenu();
        }
    }
}