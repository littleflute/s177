oTest.test1 = async function() {
    // 创建容器结构
    const newContent = `
      <div style="padding:10px;">
        <h3>Repository Issues</h3>
        <div id="id4IssueList" style="margin-bottom:20px;"></div>
        <textarea id="id4TaInSandbox" 
                  style="width:100%; height:200px; background:#333; color:white;"></textarea>
        <div style="margin-top:10px;">
          <button onclick="runTestCode()" 
                  style="padding:5px 10px; background:#4CAF50; color:white; border:none; border-radius:3px;">
            Run Code
          </button>
          <button onclick="analyzeCode()" 
                  style="padding:5px 10px; background:#2196F3; color:white; border:none; border-radius:3px;">
            Analyze
          </button>
        </div>
        <div id="id4AnalysisResult" style="margin-top:10px;"></div>
      </div>
    `;
    
    appCore.updateWindowContent('id4TestWnd', newContent);
  
    // 获取并显示Issues
    try {
      const issues = await appCore._C4XDR177I14__apiRequest('GET', 'issues?per_page=100', null);
      const container = document.querySelector('#id4IssueList');
      
      // 创建表格显示
      const table = document.createElement('table');
      table.style.width = '100%';
      table.innerHTML = `
        <thead>
          <tr style="background:#444; color:#4CAF50;">
            <th style="padding:8px;">#</th>
            <th style="padding:8px;">Title</th>
            <th style="padding:8px;">Actions</th>
          </tr>
        </thead>
        <tbody id="id4IssueTbody"></tbody>
      `;
      
      const tbody = table.querySelector('#id4IssueTbody');
      issues.forEach(issue => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #666';
        
        row.innerHTML = `
          <td style="padding:6px;">${issue.number}</td>
          <td style="padding:6px;">${issue.title}</td>
          <td style="padding:6px;">
            <button class="issue-btn" data-number="${issue.number}" 
                    style="padding:3px 6px; margin:2px; background:#666;">
              Load
            </button>
          </td>
        `;
        
        // 添加点击事件
        row.querySelector('button').addEventListener('click', () => {
          appCore.getIssue2ta(issue.number, 'id4TaInSandbox');
        });
        
        tbody.appendChild(row);
      });
      
      container.innerHTML = '';
      container.appendChild(table);
      
    } catch (error) {
      console.error('Failed to load issues:', error);
      document.querySelector('#id4IssueList').innerHTML = 
        `<div style="color:#ff4444;">Error loading issues: ${error.message}</div>`;
    }
  };
  
  // 代码执行函数
  window.runTestCode = function() {
    const jsCode = document.getElementById('id4TaInSandbox').value;
    try {
      const fn = new Function(jsCode);
      const result = fn();
      if (result !== undefined) {
        alert('Execution result: ' + JSON.stringify(result));
      }
    } catch (e) {
      alert('Execution Error: ' + e.message);
    }
  };
  
  // 代码分析函数
  window.analyzeCode = function() {
    const code = document.getElementById('id4TaInSandbox').value;
    const analysisResult = document.getElementById('id4AnalysisResult');
    
    try {
      // 提取类信息
      const classMatch = code.match(/class (\w+)/);
      const classes = classMatch ? [classMatch[1]] : [];
      
      // 提取函数信息
      const functionMatches = code.matchAll(/(?:function|async)\s+(\w+)|(\w+)\s*\(/g);
      const functions = [...functionMatches]
        .map(m => m[1] || m[2])
        .filter(f => f && !['if', 'for', 'while'].includes(f));
      
      // 构建分析报告
      const report = `
        <div style="background:#222; padding:10px; border-radius:4px;">
          <h4 style="color:#4CAF50; margin:0 0 10px 0;">Code Analysis</h4>
          ${classes.length ? `
            <div>Classes Found: 
              ${classes.map(c => `<span style="color:#2196F3;">${c}</span>`).join(', ')}
            </div>
          ` : ''}
          ${functions.length ? `
            <div>Functions Found: 
              ${functions.map(f => `<span style="color:#9C27B0;">${f}()</span>`).join(', ')}
            </div>
          ` : ''}
        </div>
      `;
      
      analysisResult.innerHTML = report;
    } catch (e) {
      analysisResult.innerHTML = `
        <div style="color:#ff4444;">
          Analysis Error: ${e.message}
        </div>
      `;
    }
  };