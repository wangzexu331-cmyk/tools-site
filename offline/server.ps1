param(
  [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
$Root = Join-Path $PSScriptRoot "app"
$Url = "http://127.0.0.1:$Port/"

function Get-MimeType {
  param([string]$Path)
  $ext = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
  switch ($ext) {
    ".html" { "text/html; charset=utf-8" }
    ".htm" { "text/html; charset=utf-8" }
    ".js" { "text/javascript; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".txt" { "text/plain; charset=utf-8" }
    ".svg" { "image/svg+xml" }
    ".png" { "image/png" }
    ".jpg" { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".gif" { "image/gif" }
    ".ico" { "image/x-icon" }
    ".webp" { "image/webp" }
    ".woff" { "font/woff" }
    ".woff2" { "font/woff2" }
    ".xlsx" { "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    default { "application/octet-stream" }
  }
}

function Send-Response {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [byte[]]$Body,
    [string]$ContentType = "text/plain; charset=utf-8"
  )

  $headers = "HTTP/1.1 $StatusCode $StatusText`r`n" +
    "Content-Type: $ContentType`r`n" +
    "Content-Length: $($Body.Length)`r`n" +
    "Cache-Control: no-store`r`n" +
    "Connection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

function Send-Text {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [string]$Text
  )
  $body = [System.Text.Encoding]::UTF8.GetBytes($Text)
  Send-Response -Stream $Stream -StatusCode $StatusCode -StatusText $StatusText -Body $body
}

if (-not (Test-Path (Join-Path $Root "index.html"))) {
  Write-Host "未找到 app\index.html，请确认离线包完整。"
  exit 1
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse("127.0.0.1"), $Port)

try {
  $listener.Start()
} catch {
  Write-Host "端口 $Port 启动失败，可能已经被占用。"
  Write-Host "你可以先在浏览器打开：$Url"
  Write-Host $_.Exception.Message
  exit 1
}

Write-Host ""
Write-Host "隐患整改报告生成系统已启动。"
Write-Host "访问地址：$Url"
Write-Host "请不要关闭本窗口。关闭窗口后系统会停止。"
Write-Host ""

Start-Process $Url

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $buffer = New-Object byte[] 8192
      $read = $stream.Read($buffer, 0, $buffer.Length)
      if ($read -le 0) {
        $client.Close()
        continue
      }

      $requestText = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $read)
      $firstLine = ($requestText -split "`r`n")[0]
      $parts = $firstLine -split " "
      if ($parts.Length -lt 2) {
        Send-Text -Stream $stream -StatusCode 400 -StatusText "Bad Request" -Text "Bad Request"
        $client.Close()
        continue
      }

      $urlPath = ($parts[1] -split "\?")[0]
      $urlPath = [System.Uri]::UnescapeDataString($urlPath)
      if ($urlPath -eq "/" -or [string]::IsNullOrWhiteSpace($urlPath)) {
        $urlPath = "/index.html"
      }

      $relative = $urlPath.TrimStart("/").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
      $fullPath = [System.IO.Path]::GetFullPath((Join-Path $Root $relative))
      $rootFullPath = [System.IO.Path]::GetFullPath($Root)

      if (-not $fullPath.StartsWith($rootFullPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        Send-Text -Stream $stream -StatusCode 403 -StatusText "Forbidden" -Text "Forbidden"
        $client.Close()
        continue
      }

      if (Test-Path $fullPath -PathType Container) {
        $fullPath = Join-Path $fullPath "index.html"
      }

      if (-not (Test-Path $fullPath -PathType Leaf)) {
        Send-Text -Stream $stream -StatusCode 404 -StatusText "Not Found" -Text "Not Found"
        $client.Close()
        continue
      }

      $bytes = [System.IO.File]::ReadAllBytes($fullPath)
      Send-Response -Stream $stream -StatusCode 200 -StatusText "OK" -Body $bytes -ContentType (Get-MimeType $fullPath)
      $client.Close()
    } catch {
      try {
        Send-Text -Stream $stream -StatusCode 500 -StatusText "Internal Server Error" -Text $_.Exception.Message
      } catch {}
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
