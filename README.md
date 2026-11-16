# dsh-preset · DSH Agent 预设库

一套自用的 DeepSeek Harness（DSH）Agent 预设集合。每个子目录是一个独立的预设 bundle：
`package.json` 声明 bundle 入口，`cordis.patch.yml` 写预设声明（id、显示名、顺序、persona 与工具清单），`README.md` 说明这个预设干什么、怎么用。

## 预设清单

| 目录 | 预设 id | 显示名 | 顺序 | 一句话 |
|---|---|---|---|---|
| [`discussion-preset`](./discussion-preset) | `discussion` | 讨论 | 5 | 陪你讨论问题，该查的去网上查，大白话回答；默认不碰文件 |
| [`inspiration-preset`](./inspiration-preset) | `inspiration` | 灵感 | 6 | 把随手扔来的念头补成设定或画面片段，记进灵感库 |
| [`note-transcription-preset`](./note-transcription-preset) | `note-transcription` | 笔记转录 | 7 | 手写笔记的照片照原样敲成 md：只动格式不动字，排版分层但不加内容 |
| [`project-analyst-preset`](./project-analyst-preset) | `project-analyst` | 项目调查 | 10 | 调查项目或文件夹，产出 `ARCHITECTURE.md` 与 `USAGE.md` |
| [`planner-preset`](./planner-preset) | `planner` | 策划 | 11 | 只写策划案和文档、不写代码；你说「开始写」才动笔 |
| [`acceptance-preset`](./acceptance-preset) | `acceptance` | 项目验收 | 12 | 对照文档做整体验收，只读不改，问题定位到具体文件 |
| [`project-manager-preset`](./project-manager-preset) | `project-manager` | 总控 | 13 | 多会话开发的总控：拆 P 任务、写任务书与开工语 |
| [`git-upload-preset`](./git-upload-preset) | `git-upload` | Git 总管 | 14 | 把指定项目推到 Git 仓库并记台账；说「更新」就照台账再传一遍 |

预设之间是流水线关系：讨论 → 灵感 / 策划 → 总控拆任务 → 实施 → 项目验收。
`笔记转录` 是独立的小工具，不在这条流水线里。

## 安装

预设以 `link:` 依赖挂在 DSH 的 profile 上（默认 `%USERPROFILE%\.dsh\profiles\desktop`），
所以**本仓库要放在一个固定路径**，移动或改名后预设会从列表里消失。

### 方式一：用自带的安装脚本（推荐）

只有 `discussion-preset` 目前带脚本，其它预设可直接照抄改两行：

```bat
discussion-preset\install.cmd            :: 安装
discussion-preset\install.cmd --dry-run  :: 只看将改什么
discussion-preset\install.cmd --uninstall
```

脚本会：把预设以 `link:` 依赖写进 profile 的 `package.json`、把包名加进 `dsh.profile.bundles`、
备份原配置（`package.json.bak-discussion-<时间戳>`），再跑一次 `pnpm install` 建链接。

### 方式二：手动改 profile

编辑 `<profile>\package.json`：

```json
{
  "dependencies": {
    "@local/dsh-planner-preset": "link:E:/⭐模板库/预设库/planner-preset"
  },
  "dsh": {
    "profile": {
      "bundles": ["@local/dsh-planner-preset"]
    }
  }
}
```

然后在 profile 目录执行 `pnpm install`。包名对照：`@local/dsh-<目录名>`，例如
`@local/dsh-acceptance-preset` → `acceptance-preset`。

装完重启 DSH 应用（或刷新 Web 界面），新会话的预设选择器里就会出现对应条目。

## 说明

- `cordis.patch.yml` 里的组成条目全部来自随 DSH 应用分发的插件包，没有第三方依赖，不需要联网。
- 改预设行为＝改 `cordis.patch.yml` 的 persona 文案或工具清单；bundle 是 `link:` 依赖，改完通常会被文件监听重新组合，没生效就重启应用。
- 写入范围仍受会话沙箱与权限预设约束，写到工作区外会需要你批准。
