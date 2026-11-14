# 项目调查（project-analyst）Agent 预设

调查一个项目或文件夹，输出两份面向读者的中文文档：`ARCHITECTURE.md`（架构解释）和 `USAGE.md`（使用规范）。

## 安装状态

| 内容 | 状态 | 位置 |
|---|---|---|
| Agent 预设声明（bundle） | ✅ 已安装并启用 | 本目录，profile 依赖 `@local/dsh-project-analyst-preset` |
| 预设 id / 显示名 | ✅ 已注册 | `project-analyst` / **项目调查**（预设列表 order 10） |
| 配套技能 `project-atlas` | ✅ 已创建 | `C:\Users\87463\.dsh\skills\project-atlas\SKILL.md`（含 `references/` 两份模板） |

安装方式：本目录作为本地目录依赖装进桌面版 profile（`C:\Users\87463\.dsh\profiles\desktop`），依赖写法为
`"@local/dsh-project-analyst-preset": "link:E:/⭐模板库/预设库/project-analyst-preset"`，
并把 `@local/dsh-project-analyst-preset` 追加到 `dsh.profile.bundles` 列表末尾。

> 2026-11-12：本目录从 `E:\Draw 绘画\DSH\project-analyst-preset` 迁到当前工作区（`E:\⭐模板库\预设库`），
> profile 依赖、`node_modules` 软链接与 `pnpm-lock.yaml` 已同步指向新路径。

## 预设包含什么

| 能力 | 插件 | 说明 |
|---|---|---|
| 身份与方法论 | `dsh-persona` | 证据优先、先普查后深读、诚实覆盖、规模控制 |
| 工作区指令 | `dsh-agent-instructions` | 读取项目 `AGENTS.md` / `CLAUDE.md` |
| 时间上下文 | `dsh-time-context` | 调查时间写入文档 |
| 目录与内容检索 | `dsh-tool-fs-search` | `glob` / `grep` |
| 文件读写 | `dsh-tool-fs` | `read` / `write` / `edit` / `read_image` |
| Shell | `dsh-tool-pwsh`（Windows）/ `dsh-tool-bash`（其他平台） | 统计、`git`、只读检查命令 |
| 后台任务 | `dsh-tool-jobs` | 长命令后台运行并读取输出 |
| 技能 | `dsh-skill-filesystem` + `dsh-tool-skill` | 按需加载 `project-atlas` 完整流程与模板 |
| 进度跟踪 | `dsh-tool-todo` | 多阶段调查的任务清单 |
| 澄清问题 | `dsh-tool-ask-user` | 范围、输出位置等用户决策 |
| 大项目分片 | `subagent` / `workflow` | 按目录并行调查，再汇总 |
| 上下文管理 | compaction / tool-result-pruner | 长调查不撑爆上下文 |
| 交付 | `dsh-tool-present` | 文档作为交付物卡片展示 |

## 使用方法

1. 刷新 Web 界面（新预设需要刷新页面才会出现在列表里）。
2. 新建会话，在预设选择器里选择 **项目调查**。
3. 直接说明目标，例如：

   ```text
   调查 E:\some-project，在项目根目录写出 ARCHITECTURE.md 和 USAGE.md。
   ```

   也可以只给路径，预设会先确认范围与输出位置。

4. 文档默认写到目标项目根目录；目标只读或位于工作区外时，会先询问或改写到工作区。

## 配套技能 project-atlas

- 位置：`C:\Users\87463\.dsh\skills\project-atlas\`
  - `SKILL.md` — 调查流程（预检 → 普查 → 读元数据 → 深读 → 写文档 → 自检）
  - `references/architecture-template.md` — ARCHITECTURE.md 章节模板
  - `references/usage-template.md` — USAGE.md 章节模板
- 属于用户级技能目录，文件监听会在保存后自动刷新，无需重装或重启。
- 修改技能时保持 frontmatter 的 `name`（必须 kebab-case）与 `description` 不变，否则会从目录里掉出去。

## 校验

- 组合配置里应能看到插入条目 `preset-project-analyst`（`config.id: project-analyst`、`order: 10`）。
- 会话中应以「项目调查」出现在预设选择器里，且该会话的技能目录里有 `project-atlas`。
- 若预设没出现：确认本目录仍存在、`C:\Users\87463\.dsh\profiles\desktop\package.json` 里 `dependencies` 与 `dsh.profile.bundles` 都有这条记录，然后刷新页面或重启应用。

## 修改与卸载

- **改预设**：编辑 `cordis.patch.yml`（persona 文案、工具清单、插件配置），保存后文件监听会重新组合，无需重装。
- **改技能**：直接编辑 `SKILL.md` 或 `references/`，保存即生效。
- **卸载**：在插件管理器里移除 `@local/dsh-project-analyst-preset`；或先重启应用后执行
  `dsh plugin --profile desktop remove @local/dsh-project-analyst-preset`，
  再从 `package.json` 的 `dsh.profile.bundles` 中删掉该条目。

## 注意

- 本目录是安装源（profile 通过本地路径 `link:` 引用它），**不要删除、移动或改名**，否则预设安装会失效。
- 本目录现在位于预设库工作区 `E:\⭐模板库\预设库\project-analyst-preset`：该盘未挂载时，桌面版启动会跳过这个 bundle，预设从列表中消失。
- **0.2.2-rc.1 起**：`@deepseek-ai/dsh-tool-subagent-control` 主入口一次注册 `send_message` / `interrupt_agent` / `list_agents`，没有 `/list-agents` 子路径。
  2026-11-12 前这里多写了一个 `dsh-tool-subagent-control/list-agents` 条目，导致预设整体「加载失败」；已删除，改预设时不要再加回来。
- 目标项目中的写入受会话沙箱限制：项目需位于当前工作区内，否则需要用户批准。
- 调查默认只读：安装依赖、运行构建、启动服务都会先征得同意。
