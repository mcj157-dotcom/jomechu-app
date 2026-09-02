$userPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$machinePath = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
$env:Path = "$userPath;$machinePath"

Write-Output "=== Checking Git / GitHub Commands ==="
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if ($gitCmd) {
    Write-Output "Found git: $($gitCmd.Source)"
    & git init
    & git config user.name "jomechu"
    & git config user.email "jomechu@example.com"
    & git add -A
    & git commit -m "feat: complete toss-style dinner recommendation app with android apk build workflow"
    Write-Output "Git commit success!"
    & git status
} else {
    Write-Output "git not found in refreshed PATH"
}

$ghCmd = Get-Command gh -ErrorAction SilentlyContinue
if ($ghCmd) {
    Write-Output "Found gh: $($ghCmd.Source)"
}
