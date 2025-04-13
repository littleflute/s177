
// 在JianpuRenderer类的构造函数中添加：


// 修改JianpuRenderer类的_selectBar方法：
_selectBar(bar) {
  // ...原有代码...
  
  // 显示编辑器
  if (this.barEditor) {
      this.barEditor.currentNotes = []; // 重置当前正在编辑的音符
  }
}

// 在JianpuRenderer类的_createSettingsWindow方法中，找到bar-properties部分：
// 修改后的HTML结构：
`
<div class="bar-properties">
  <h4>选中小节属性</h4>
  <div id="id4BarEditor"></div>
  <div class="property-row">
      <span class="property-label">索引:</span>
      <span class="property-value" id="barIndex">无</span>
  </div>
  <div class="property-row">
      <span class="property-label">位置:</span>
      <span class="property-value" id="barPosition">无</span>
  </div>
</div>
`