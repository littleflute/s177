class C4Editor {
  constructor(targetElementId, renderer) {
    this.previewBeat = new C4Beat(); // 新增预览节拍
    this.targetElement = document.getElementById(targetElementId);
    this.renderer = renderer;
    this._injectStyles();
    this._createUI(); // 调用_createUI生成包含按钮的HTML

    // 获取按钮元素
    this.updateBtn = this.targetElement.querySelector('#updateBeatBtn');
    this.addBeatBtn = this.targetElement.querySelector('#addBeatBtn');

    // 绑定事件监听器
    this.updateBtn.addEventListener('click', () => {
      if (this.editingBeat) {
        this.editingBeat.notes = [...this.currentNotes];
        this.renderer.resetAllBars();
        this.renderer.render();
        this.currentNotes = [];
        this.editingBeat = null;
        this.updateBtn.style.display = 'none';
        this.addBeatBtn.style.display = 'inline';
      }
    });
  }

  _createUI() {
    this.targetElement.innerHTML = `
      <div class="c4-editor">
        <h3>添加节拍</h3>
        <div class="editor-row">
          <label>音高(1-7):</label>
          <input type="number" id="notePitch" min="1" max="7" value="1">
        </div>
        <!-- 其他表单元素 -->
        <div class="editor-row">
          <button id="addNoteBtn">添加音符</button>
          <button id="addBeatBtn">完成节拍</button>
          <button id="updateBeatBtn" style="display:none;">更新节拍</button>
        </div>
      </div>
    `;
    // 其余代码保持不变
  }
  // ... 其余方法保持不变
}