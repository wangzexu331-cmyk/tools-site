const childProcess = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");

const requestedPort = Number(process.argv[2]) || 8080;
const host = "127.0.0.1";
const root = path.join(__dirname, "app");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
};

function send(res, status, body, contentType = "text/plain; charset=utf-8") {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(String(body), "utf8");
  res.writeHead(status, {
    "Content-Type": contentType,
    "Content-Length": payload.length,
    "Cache-Control": "no-store"
  });
  res.end(payload);
}

function resolveFile(urlPath) {
  let cleanPath = decodeURIComponent((urlPath || "/").split("?")[0]);
  if (cleanPath === "/" || !cleanPath.trim()) cleanPath = "/index.html";
  const filePath = path.resolve(root, cleanPath.replace(/^\/+/, ""));
  const rootPath = path.resolve(root);
  if (!filePath.startsWith(rootPath)) return null;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    return path.join(filePath, "index.html");
  }
  return filePath;
}

function openBrowser(url) {
  try {
    childProcess.spawn("cmd", ["/c", "start", "", url], {
      detached: true,
      stdio: "ignore"
    }).unref();
  } catch (error) {
    console.log(`浏览器未能自动打开，请手动访问：${url}`);
  }
}

function createServer() {
  return http.createServer((req, res) => {
    try {
      const filePath = resolveFile(req.url);
      if (!filePath) {
        send(res, 403, "Forbidden");
        return;
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        send(res, 404, "Not Found");
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      send(res, 200, fs.readFileSync(filePath), mimeTypes[ext] || "application/octet-stream");
    } catch (error) {
      send(res, 500, error.message || "Internal Server Error");
    }
  });
}

function listen(port, attemptsLeft = 10) {
  const server = createServer();
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsLeft > 0) {
      listen(port + 1, attemptsLeft - 1);
      return;
    }
    console.log("");
    console.log("本地服务启动失败。");
    console.log(error.message);
    process.exit(1);
  });
  server.listen(port, host, () => {
    const url = `http://${host}:${port}/`;
    console.log("");
    console.log("隐患整改报告生成系统已启动。");
    console.log(`访问地址：${url}`);
    console.log("请不要关闭本窗口。关闭窗口后系统会停止。");
    console.log("");
    openBrowser(url);
  });
}

if (!fs.existsSync(path.join(root, "index.html"))) {
  console.log("未找到 app\\index.html，请确认离线包完整。");
  process.exit(1);
}

listen(requestedPort);
