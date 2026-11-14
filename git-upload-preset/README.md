# Git 总管（git-upload）Agent 预设

把一个本地项目 / 文件夹推到指定的 Git 仓库，并把「哪个项目在本地哪儿、传到哪个仓库」记进当前工作区里的一份台账。
以后说「更新」，它就照台账把该更新的项目再传一遍。

## 安装状态

| 内容 | 状态 | 位置 |
|---|---|---|
| Agent 预设声明（bundle） | ✅ 已安装并启用 | 本目录，profile 依赖 `@local/dsh-git-upload-preset` |
| 预设 id / 显示名 | ✅ 已注册 | `git-upload` / **Git 总管**（预设列表 order 14） |
| 上传台账 | ✅ 随工作区 | `<当前工作区>\git-uploads.md`（开会话时选哪个工作区就落在哪个工作区，没有就第一次登记时新建） |

安装方式：本目录作为本地目录依赖装进桌面版 profile（`C:\Users\87463\.dsh\profiles\desktop`），依赖写法为
`"@local/dsh-git-upload-preset": "link:C:/Users/87463/Documents/deepseek-harness/default-workspace/dsh-preset/git-upload-preset"`，并把
`@local/dsh-git-upload-preset` 追加到 `dsh.profile.bundles` 列表末尾。

## 怎么跟它说话

| 你说 | 它做 |
|---|---|
| 「把 `D:\xxx\my-proj` 传到 https://github.com/…/my-proj.git」 | 直接检查、提交、推送，然后登记台账，不再追问 |
| 「把 cookie-clean 那个项目传上去」 | 先在磁盘上找同名文件/文件夹，挑 1–3 个候选 + 判断依据给你确认，点头后才推 |
| 「更新」 | 按台账逐条重推全部项目，最后给一张汇总表（项目 / 结果 / 提交） |
| 「更新 my-proj」 | 只处理 my-proj |
| 「把 `docs/readme.md` 传上去」 | 只提交这一个文件，同目录其他改动不动 |

## 预设包含什么

| 能力 | 插件 | 说明 |
|---|---|---|
| 身份与流程 | `dsh-persona` | 只做上传：识别意图、推送前检查、身份/代理、提交规范、汇报格式 |
| 工作区指令 | `dsh-agent-instructions` | 读取项目里的 `AGENTS.md` / `CLAUDE.md` |
| 时间上下文 | `dsh-time-context` | 台账里的「最后上传」时间 |
| 找项目 | `dsh-tool-fs-search` | `glob` / `grep` 按名字、`package.json` 定位候选 |
| 读写文件 | `dsh-tool-fs` | 读配置、写 `.gitignore`、按行改台账 |
| Shell | `dsh-tool-pwsh`（Windows）/ `dsh-tool-bash`（其他平台） | `git` 全流程 |
| 后台任务 | `dsh-tool-jobs` | 推送慢、要等授权时后台跑 |
| 批量进度 | `dsh-tool-todo` | 「更新」多个项目时逐条跟踪 |
| 澄清确认 | `dsh-tool-ask-user` | 候选目录、密钥文件、force push 等都要你点 |
| 上下文管理 | compaction / tool-result-pruner | 长会话不撑爆上下文 |

> 刻意没有装：文件写入以外的编辑套件、子代理 / workflow、present、技能加载。上传是线性短任务，不需要。

## 台账格式

`<当前工作区>\git-uploads.md`，一行一个项目：

```markdown
| 项目 | 本地路径 | 仓库网址 | 分支 | 最后上传 | 提交 |
|---|---|---|---|---|---|
| dsh-cookie-clean | D:\DSHworkspace\dsh-cookie-clean | https://github.com/Yshuinuan/dsh-cookie-clean-script.git | main | 2026-11-14 15:20 | a1b2c3d |
```

- 同一个工作区里的会话共用这一份；换个工作区就是另一份台账。台账只记录从本工作区推过的项目，所以「更新」也只覆盖这些。
- 预设被要求只改「自己那一行」（`edit` 按行替换，禁止 `write` 整份重写）。
- 台账不上传、不提交到任何仓库。
- 想从「更新」范围里去掉某个项目，直接删掉那一行即可。

## 环境前提（预设里已写死，换机器要改）

| 事项 | 现值 | 说明 |
|---|---|---|
| GitHub 账号 | `Yshuinuan` | 首次推送会弹浏览器授权，登录这个账号 |
| 提交身份 | `Yshuinuan` / `202403370+Yshuinuan@users.noreply.github.com` | 本机**没有全局** `user.name` / `user.email`，预设写进各仓库的本地配置 |
| 代理 | `http://127.0.0.1:7890` | 推送连不上时给该仓库配 `http.proxy` 重试一次 |
| `gh` CLI | 未安装 | 不能自动建仓库；新仓库要你先在网页建好，再把网址给它 |

## 校验

- 预设列表里出现 **Git 总管**，`Config.listConfigs` 能看到 `preset-git-upload`（`config.id: git-upload`、`order: 14`）。
- 新会话里说「更新」时，它会先读当前工作区的 `git-uploads.md` 再动手。
- 若预设没出现：确认本目录仍在、profile `package.json` 的 `dependencies` 与 `dsh.profile.bundles` 都有这条，然后刷新页面或重启应用。

## 修改与卸载

- **改行为**：编辑 `cordis.patch.yml` 的 persona 文案或工具清单，保存后文件监听会重组，无需重装。
- **卸载**：在插件管理器里移除 `@local/dsh-git-upload-preset`，再从 profile `package.json` 的 `dsh.profile.bundles` 删掉该条目。

## 注意

- 本目录是安装源（profile 用 `link:` 引用），**不要删除、移动或改名**，移动后预设会从列表里消失。
- 台账就在工作区里，「仅工作区写入」权限足够；但如果会话选的是「只读」，台账同样写不进去，需要给会话放行到完全访问。台账本身不进任何仓库提交。
- 默认绝不 `force push`；要覆盖远端历史必须你明确要求，且只用 `--force-with-lease`。
- `.env`、`*.pem`、`*.key`、token / credential 文件一律先问，确认前不提交。
