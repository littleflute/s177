// 在C4MainApp类中添加以下方法
#updateClassInfoDisplay(classInfo) {
    const classElement = document.getElementById('id_parse_body_as_class');
    const memberFunctionsElement = document.getElementById('id_parse_member_functions');
    
    // 清空现有内容
    classElement.innerHTML = '';
    memberFunctionsElement.innerHTML = '';

    if (classInfo && classInfo.className) {
        // 显示类名
        classElement.innerHTML = `解析到的类名: <strong>${classInfo.className}</strong>`;
        
        // 显示成员函数
        classInfo.methods.forEach(method => {
            const li = document.createElement('li');
            
            // 创建执行按钮
            const button = document.createElement('button');
            button.className = 'issue_btn';
            button.textContent = method;
            button.onclick = async () => {
                try {
                    // 动态执行类方法
                    const instance = new Function(
                        'return new ' + classInfo.className + '()'
                    )();
                    
                    if (typeof instance[method] === 'function') {
                        await instance[method]();
                    }
                } catch (e) {
                    alert(`执行 ${method} 失败: ${e.message}`);
                }
            };

            // 创建查看源码按钮
            const codeBtn = document.createElement('button');
            codeBtn.className = 'issue_btn';
            codeBtn.textContent = '查看源码';
            codeBtn.style.marginLeft = '8px';
            codeBtn.onclick = () => {
                const code = this.#findMethodCode(method);
                alert(`方法源码:\n\n${code}`);
            };

            li.appendChild(button);
            li.appendChild(codeBtn);
            memberFunctionsElement.appendChild(li);
        });
    } else {
        classElement.textContent = '在issue内容中未找到JavaScript类定义';
        memberFunctionsElement.innerHTML = '<li>未找到成员函数</li>';
    }
}

// 辅助方法：从issue body中提取方法源码
#findMethodCode(methodName) {
    const body = this.currentIssue.body;
    const regex = new RegExp(
        `(?:async\\s+)?(?:static\\s+)?${methodName}\\s*\\([^)]*\\)\\s*{[\\s\\S]*?}`, 
        'gm'
    );
    const match = regex.exec(body);
    return match ? match[0] : '未找到源码';
}