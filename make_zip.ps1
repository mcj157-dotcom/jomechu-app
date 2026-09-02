$zipPath = "C:\Users\Z32311\.gemini\antigravity-ide\scratch\저메추\jomechu-app.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }

$files = @(
  "index.html",
  "styles.css",
  "data.js",
  "app.js",
  "manifest.json",
  "service-worker.js",
  "package.json",
  "capacitor.config.json",
  ".github"
)

Compress-Archive -Path $files -DestinationPath $zipPath -Force
Write-Output "ZIP Successfully Created at: $zipPath"
