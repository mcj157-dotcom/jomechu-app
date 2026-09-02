$searchPaths = @(
  'C:\Program Files\Git',
  'C:\Program Files (x86)\Git',
  'C:\Program Files\GitHub CLI',
  'C:\Program Files\PowerShell',
  "$env:LOCALAPPDATA\Programs\Git",
  "$env:LOCALAPPDATA\GitHubDesktop",
  "$env:USERPROFILE\AppData\Local\Programs\Git",
  "$env:ProgramData\chocolatey\bin",
  "$env:USERPROFILE\scoop\shims"
)

foreach ($p in $searchPaths) {
  if (Test-Path $p) {
    Write-Output "[FOUND DIR] $p"
    Get-ChildItem -Path $p -Filter '*.exe' -Recurse -Depth 3 | Select-Object -ExpandProperty FullName
  }
}
