const gh = new GitHubManager('littleflute/s177', 'ghp_yourtoken');

// 获取所有 issues
const allIssues = await gh.getAllIssues();

// 创建新 issue
const newIssue = await gh.createIssue('New Feature', 'Implement new feature', ['enhancement']);

// 添加评论
await gh.createComment(1, 'This is a comment');

// 解析 issue 内容
const issue = await gh.getIssue(1);
const parsed = gh.parseIssueBody(issue.body);
console.log(parsed.classInfo); // { className: 'MyClass' }

// 处理 webhook
const webhookData = await gh.parseWebhook(payload);
if (webhookData.type === 'comment') {
    console.log('New comment:', webhookData.comment);
}