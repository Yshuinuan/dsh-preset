#!/usr/bin/env node
// 把「讨论」预设注册到 DSH 的 desktop profile。
//
//   node install.mjs                安装
//   node install.mjs --dry-run      只打印将要做的事，不写文件、不跑 pnpm
//   node install.mjs --uninstall    卸载
//   node install.mjs --profile <dir>  指定 profile 目录（默认 desktop）
//
// 直接双击 install.cmd 即可，它会用 DSH 自带的 Node 调这个脚本。

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PRESET_NAME = "@local/dsh-discussion-preset";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const HOME = process.env.USERPROFILE || process.env.HOME || "";
const DEFAULT_PROFILE = path.join(HOME, ".dsh", "profiles", "desktop");

function parseArgs(argv) {
  const out = { dryRun: false, uninstall: false, profile: DEFAULT_PROFILE };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--uninstall") out.uninstall = true;
    else if (a === "--profile") out.profile = path.resolve(argv[++i] || "");
    else if (a === "--help" || a === "-h") {
      console.log("用法: node install.mjs [--dry-run] [--uninstall] [--profile <dir>]");
      process.exit(0);
    } else {
      console.error(`未知参数: ${a}`);
      process.exit(2);
    }
  }
  return out;
}

function backup(file) {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+$/, "")
    .replace("T", "-");
  const dest = `${file}.bak-discussion-${stamp}`;
  fs.copyFileSync(file, dest);
  return dest;
}

function findPnpm() {
  const candidates = [
    path.resolve(path.dirname(process.execPath), "..", "..", "pnpm", "bin", "pnpm.mjs"),
    path.join(HOME, ".dsh", "dsh-runtimes", "dsh-primary-runtime", "dependencies", "pnpm", "bin", "pnpm.mjs"),
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const pkgPath = path.join(args.profile, "package.json");

  if (!fs.existsSync(pkgPath)) {
    console.error(`找不到 profile：${pkgPath}`);
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.dependencies = pkg.dependencies || {};
  pkg.dsh = pkg.dsh || {};
  pkg.dsh.profile = pkg.dsh.profile || {};
  const bundles = (pkg.dsh.profile.bundles = pkg.dsh.profile.bundles || []);

  const hasDep = Object.prototype.hasOwnProperty.call(pkg.dependencies, PRESET_NAME);
  const hasBundle = bundles.includes(PRESET_NAME);

  if (args.uninstall) {
    if (!hasDep && !hasBundle) {
      console.log("没有安装，无需卸载。");
      return;
    }
    delete pkg.dependencies[PRESET_NAME];
    pkg.dsh.profile.bundles = bundles.filter((b) => b !== PRESET_NAME);
    console.log(`将移除依赖：${PRESET_NAME}`);
    console.log("将从 bundles 移除：", PRESET_NAME);
  } else {
    const linkTarget = "link:" + HERE.replace(/\\/g, "/");
    pkg.dependencies[PRESET_NAME] = linkTarget;
    if (!hasBundle) bundles.push(PRESET_NAME);
    console.log(`将添加依赖：${PRESET_NAME} -> ${linkTarget}`);
    console.log(`将添加 bundle：${PRESET_NAME}`);
  }

  if (args.dryRun) {
    console.log("\n[dry-run] 未写入文件、未执行 pnpm。");
    console.log(JSON.stringify(pkg, null, 2));
    return;
  }

  const bak = backup(pkgPath);
  console.log(`已备份原配置：${bak}`);
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  console.log(`已更新：${pkgPath}`);

  const pnpm = findPnpm();
  if (!pnpm) {
    console.error("找不到 DSH 自带的 pnpm，请手动在 profile 目录执行 pnpm install。");
    process.exit(1);
  }

  console.log("\n正在安装依赖（pnpm install）...\n");
  const result = spawnSync(
    process.execPath,
    [pnpm, "--dir", args.profile, "install"],
    { stdio: "inherit", windowsHide: true },
  );
  if (result.status !== 0) {
    console.error("\npnpm install 失败，请查看上面的输出。配置已备份，可手动回滚。");
    process.exit(result.status || 1);
  }

  const linked = path.join(args.profile, "node_modules", "@local", "dsh-discussion-preset");
  console.log(`\n完成。${fs.existsSync(linked) ? "链接已建立：" + linked : "警告：没有找到链接，请检查 pnpm 输出。"}`);
  console.log("请重启 DSH 应用，新会话的预设选择器里就会出现「讨论」。");
}

main();
