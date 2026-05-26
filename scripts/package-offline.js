import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const offlineDir = path.join(root, "offline-package");
const appDir = path.join(offlineDir, "app");
const runtimeDir = path.join(offlineDir, "runtime");

function copyRecursive(source, target) {
  if (!fs.existsSync(source)) {
    return;
  }
  const stats = fs.statSync(source);
  if (stats.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

if (!fs.existsSync(distDir)) {
  throw new Error("未找到 dist 目录，请先运行 npm run build");
}

const singleHtml = path.join(distDir, "打开系统.html");
if (!fs.existsSync(singleHtml)) {
  throw new Error("未找到 dist/打开系统.html，请先运行 node scripts/make-single-html.js");
}

fs.rmSync(offlineDir, { recursive: true, force: true });
fs.mkdirSync(appDir, { recursive: true });
copyRecursive(distDir, appDir);
copyRecursive(singleHtml, path.join(offlineDir, "打开系统.html"));
copyRecursive(path.join(root, "offline", "启动系统.bat"), path.join(offlineDir, "启动系统.bat"));
copyRecursive(path.join(root, "offline", "Start-System.cmd"), path.join(offlineDir, "Start-System.cmd"));
copyRecursive(path.join(root, "offline", "Open-Direct-HTML.cmd"), path.join(offlineDir, "Open-Direct-HTML.cmd"));
copyRecursive(path.join(root, "offline", "使用说明.txt"), path.join(offlineDir, "使用说明.txt"));
copyRecursive(path.join(root, "offline", "server.cjs"), path.join(offlineDir, "server.cjs"));
copyRecursive(path.join(root, "offline", "server.ps1"), path.join(offlineDir, "server.ps1"));
copyRecursive(path.join(distDir, "templates"), path.join(offlineDir, "templates"));

const nodeSource = process.execPath;
if (process.platform === "win32" && fs.existsSync(nodeSource)) {
  fs.mkdirSync(runtimeDir, { recursive: true });
  fs.copyFileSync(nodeSource, path.join(runtimeDir, "node.exe"));
} else {
  console.warn("未能打包内置 Node，离线包将使用 PowerShell 备用启动方式。");
}

console.log(`离线部署包已生成：${offlineDir}`);
