$downloads = "$env:USERPROFILE\Downloads"
Write-Output "=== Downloads Folder Check ==="
if (Test-Path $downloads) {
    Get-ChildItem -Path $downloads | Sort-Object LastWriteTime -Descending | Select-Object -First 10 | Format-Table Name, LastWriteTime, Length
}

Write-Output "=== Recently modified in AppData / Program Files ==="
Get-ChildItem -Path "C:\Program Files", "$env:LOCALAPPDATA" -Directory -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 15 | Format-Table FullName, LastWriteTime
