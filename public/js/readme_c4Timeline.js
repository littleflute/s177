// 20250318 3:15 am
//  升级: 
// 新添加矩形，如果与已经加上的矩形有重叠将不能添加
// give me all new code，


// 20250318 3:00 am
// 升级: 
// 点击鼠标时，点击位置开始画一个与画布同宽的灰色矩形，时间跨度为一秒
// give me all new code，

// 20250318 2:50 am
// 升级: 
// 滚动后，刻度数字改变以反映实际播放时间 
// give me all new code，

// 20250318 2:34 am
// 升级: 
// 在画布上画时间线刻度是，顶部和底部留一些空间，让刻度数字可以完整显示
// give me all new code，

// 20250318 2:23am
// 升级: 
// 在画布上画时间线刻度，
// 整个画布从上到下跨度为10秒
// 有一个绿色水平直线随着this.audio播放滚动。
 

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