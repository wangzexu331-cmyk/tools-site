import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const htmlPath = path.join(distDir, "index.html");
const outputPath = path.join(distDir, "打开系统.html");

if (!fs.existsSync(htmlPath)) {
  throw new Error("未找到 dist/index.html，请先运行 npm run build");
}

let html = fs.readFileSync(htmlPath, "utf8");

html = html.replace(/<link rel="stylesheet"[^>]+href="\.\/([^"]+\.css)"[^>]*>/g, (_match, assetPath) => {
  const css = fs.readFileSync(path.join(distDir, assetPath), "utf8");
  return `<style>\n${css}\n</style>`;
});

html = html.replace(/<script type="module"[^>]+src="\.\/([^"]+\.js)"[^>]*><\/script>/g, (_match, assetPath) => {
  const js = fs.readFileSync(path.join(distDir, assetPath), "utf8");
  return `<script type="module">\n${js}\n</script>`;
});

const help = `
<!--
  离线单文件版：
  直接双击本文件即可打开。无需 Python、Node、PowerShell、本地服务或互联网。
  如果浏览器安全策略影响个别导出功能，请改用同目录“启动系统.bat”。
-->
`;

html = html.replace("<head>", `<head>${help}`);
fs.writeFileSync(outputPath, html, "utf8");
console.log(`单文件离线入口已生成：${outputPath}`);
