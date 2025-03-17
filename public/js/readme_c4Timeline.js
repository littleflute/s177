 


// 2025/3/18 2:07am
//升级：让 画布初始为黑色背景 

// 2025/3/18 1:59am
//c4Timeline.js

class C4Timeline{
    constructor(document,player) {
        this.body = document.body;
        this.#createUI(); 
    } 
    #createUI() {
        const uiDiv = document.createElement('div'); 
        this.body.appendChild(uiDiv);
    }

}
//升级：让 uiDiv 固定在boby的左半部分，有一个画布充满整个div