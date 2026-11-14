# 讨论（discussion）Agent 预设

一个陪你日常讨论问题的 agent。它先听懂你在问什么，需要事实就去网上查，想清楚后用大白话回答；拿不准会反问你；**默认不碰任何文件**，只有你明确要它写某份文件时才动。

它跟「策划」预设的分工：策划是来产出文档的，讨论是来把问题聊明白的。

## 安装状态

| 内容 | 状态 |
|---|---|
| 预设文件（bundle） | ✅ `package.json` + `cordis.patch.yml` |
| 结构校验 | ✅ 与自带「标准」预设同源；插件名、配置项都在当前应用里有效，装入后 `preset-discussion` 行 active |
| 装入 desktop profile | ✅ 已装入：`link:E:/⭐模板库/预设库/discussion-preset`，已在 `dsh.profile.bundles` 里；刷新页面后新建会话即可选「讨论」 |

> 2026-11-12：本目录从 `D:\DSHworkspace\discussion-preset` 迁到预设库工作区（`E:\⭐模板库\预设库\discussion-preset`），
> profile 依赖、`node_modules` 软链接与 `pnpm-lock.yaml` 已同步指向新路径。

## 它被设定成什么样

核心规则写在 `cordis.patch.yml` 的 persona 里：

1. **先听懂**：先判断你是问事实、要建议、做选择还是吐槽；问题含糊就先确认理解，影响大的歧义才用 `ask_user_question` 问。
2. **该查就查**：涉及事实、数据、时间、价格、版本、人物、新闻、政策，或它没把握的知识，先用 `web_search`，需要原文再 `web_fetch`。资料要交叉核对、优先官方来源；冲突就摆分歧，不挑一个当定论；用了就贴链接，不编来源和数字。
3. **想清楚再答**：先结论后理由；不确定的地方明确标出来；你的想法有漏洞会直接但客气地指出。
4. **说人话、别啰嗦**：简单问题一两句，一般问题几段话，复杂问题先给结论和要点，你要细节再展开；少术语，能举例就举例，不写八股。
5. **不确定就问**：该你拍板的事（选哪个、要不要做、范围多大）用 `ask_user_question` 问，一次问最关键的 1~3 个，给选项、说清代价，推荐项排第一。
6. **文件红线**：默认只讨论，不创建、不修改、不改名、不删除、不移动任何文件，也不「顺手记一下」「先写个草稿」。只有你在当前消息里明确点名要写、要保存或要改某个文件时，它才动，而且只动那一个。

另外它不接实现类任务（写代码、改代码、跑命令、装东西），但可以看代码、讲报错、贴几行片段解释——只讲不改。

## 预设包含什么

| 能力 | 插件 | 说明 |
|---|---|---|
| 身份与说话方式 | `dsh-persona` | 上面那套规则，作为该会话的系统提示词 |
| 工作区指令 | `dsh-agent-instructions` | 读项目里的 `AGENTS.md` / `CLAUDE.md` |
| 时间上下文 | `dsh-time-context` | 回答里能写准日期 |
| 文件读写 | `dsh-tool-fs` | `read` / `read_image` / `write` / `edit`，写入受 persona 红线约束 |
| 目录与内容检索 | `dsh-tool-fs-search` | `glob` / `grep`，用来读你点名的本地资料 |
| 澄清问题 | `dsh-tool-ask-user` | 讨论时向你提问 |
| 联网 | `dsh-tool-web` | `web_search` + `web_fetch` |
| 交付 | `dsh-tool-present` | 你让它写文件时，把文件作为卡片展示 |
| 上下文管理 | compaction / tool-result-pruner | 长会话不被上下文撑爆 |

刻意**没有**给：shell / pwsh、subagent、workflow、todo、skill、schedule、goal、plan mode。讨论用不上这些，少一套工具也少一份乱动文件或跑命令的可能。

## 安装

已经装好了。换机器或重装时，两条路等价：

**方式一：交给 agent（推荐）**。对当前 profile 跑一次 `plugin_manager install_bundle`，目标写本目录的绝对路径。它会写 `link:` 依赖、跑 DSH 自带的 pnpm、把 bundle 加进 `dsh.profile.bundles`，并热加载。

**方式二：脚本**。双击 `install.cmd`（内部调 `install.mjs`），同一件事的手工版：

1. 备份 `~/.dsh/profiles/desktop/package.json`；
2. 写入依赖 `link:E:/⭐模板库/预设库/discussion-preset` 和 bundle 条目；
3. 用 DSH 自带的 pnpm 建链接。

重复运行是安全的，配置会写成同样的值。

装完不用重启：`dsh-hmr` 会热加载新 bundle，新建会话的预设选择器里就有「讨论」。没出现就刷新页面（Ctrl+R），还不出现再重启应用。

## 使用

1. 打开 DSH 的 Web 界面。
2. 新建会话，在预设选择器里选 **讨论**。
3. 直接问，比如：

   ```text
   最近想换个扫地机器人，2000 块以内有什么值得看的？
   ```

   ```text
   我一直在纠结要不要把家里的旧笔记本装成 Linux，你帮我理一下利弊。
   ```

   它会先查、再答；如果「你家旧笔记本什么型号、用来干嘛」这类前提缺失，它会先问你。

4. 想让它落盘时再明确说，比如：

   ```text
   把刚才的结论整理成一份 Markdown，写到 docs/扫地机器人选购.md。
   ```

   它只写这一个文件，写完会告诉你写了什么、还有什么没定。

## 调整

- **改说话风格 / 长短**：编辑 `cordis.patch.yml` 里 persona 的「说人话，别啰嗦」一节。这个目录是 `link:` 依赖，改完把 bundle 关开一次（或重装一次）才生效；再不行就重启应用。
- **彻底禁止写文件**：给 `tool-fs` 加配置，`write` / `edit` 工具就不会注册，模型想写也没工具可用：

  ```yaml
  - id: tool-fs
    name: '@deepseek-ai/dsh-tool-fs'
    config:
      write: false
      edit: false
  ```

- **换搜索源**：联网走的是全局 `dsh-web` 服务，搜索/抓取提供方在 profile 或设置页里配，不在这个预设里。
- **加/减工具**：直接改 `plugins` 列表。删掉 `tool-web` 它就彻底不能上网；加上 `tool-todo` 可以让复杂讨论列清单。

## 卸载

1. 只想先停用：`plugin_manager` 里把 `@local/dsh-discussion-preset` 设为不启用（`set_bundle` enabled=false），文件都还在，随时再开。
2. 彻底移除：`remove_bundle`，或者 `node install.mjs --uninstall` 清掉 profile 里的依赖和 bundle 条目，再在 profile 目录跑一次 `pnpm install`。
3. 重启应用。

## 注意

- 本目录是安装源（profile 用 `link:` 引用它），**不要删除、移动或改名**，否则预设会从列表里消失。
- 本目录现在位于预设库工作区 `E:\⭐模板库\预设库\discussion-preset`：该盘未挂载时，桌面版启动会跳过这个 bundle，预设从列表中消失。
- 「不碰文件」靠 persona 约束，不是沙箱。真要物理隔离，把会话权限切到**只读**：那时它还能读资料，但写会被沙箱直接拒绝。
- 联网能力依赖你登录的 DeepSeek 账号或配置的 `DEEPSEEK_API_KEY`；搜索失败它会如实说，不会假装查过。
- 预设只影响**新建**会话；已经开着的会话保持原来的预设。
