$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$appDir = "C:\Users\Matheus Izaias\.gemini\antigravity\scratch\PromptForge"
$htmlPath = "$appDir\index.html"
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"

$wshShell = New-Object -ComObject WScript.Shell
$shortcutPath = Join-Path $desktopPath "PromptForge.lnk"
$shortcut = $wshShell.CreateShortcut($shortcutPath)

if (Test-Path $chromePath) {
    $shortcut.TargetPath = $chromePath
    $shortcut.Arguments = "--app=`"file:///$($htmlPath.Replace('\', '/'))`""
} else {
    $shortcut.TargetPath = "$appDir\launch.bat"
}

$shortcut.WorkingDirectory = $appDir
$shortcut.Description = "PromptForge - Otimizador de Prompts com IA"
$shortcut.Save()

Write-Output "Atalho PromptForge.lnk criado com sucesso!"
