Add-Type -AssemblyName System.Drawing

$size = 128
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Fundo escuro com cantos arredondados
$brushBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(15, 23, 42))
$rect = New-Object System.Drawing.Rectangle(4, 4, ($size - 8), ($size - 8))
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$radius = 24
$path.AddArc(4, 4, $radius, $radius, 180, 90)
$path.AddArc(($size - 4 - $radius), 4, $radius, $radius, 270, 90)
$path.AddArc(($size - 4 - $radius), ($size - 4 - $radius), $radius, $radius, 0, 90)
$path.AddArc(4, ($size - 4 - $radius), $radius, $radius, 90, 90)
$path.CloseFigure()
$g.FillPath($brushBg, $path)

# Borda gradiente violeta/azul
$penBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(139, 92, 246), 4)
$g.DrawPath($penBorder, $path)

# Desenha simbolo de Prompt "> _" e faisca
$fontPrompt = New-Object System.Drawing.Font("Consolas", 38, [System.Drawing.FontStyle]::Bold)
$brushText = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(56, 189, 248))
$g.DrawString(">_", $fontPrompt, $brushText, 32, 34)

# Desenha estrela/faisca no topo
$brushStar = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 158, 11))
$starPoints = @(
    (New-Object System.Drawing.Point(96, 20)),
    (New-Object System.Drawing.Point(100, 32)),
    (New-Object System.Drawing.Point(112, 36)),
    (New-Object System.Drawing.Point(100, 40)),
    (New-Object System.Drawing.Point(96, 52)),
    (New-Object System.Drawing.Point(92, 40)),
    (New-Object System.Drawing.Point(80, 36)),
    (New-Object System.Drawing.Point(92, 32))
)
$g.FillPolygon($brushStar, $starPoints)

$g.Dispose()

# Salva como ICO
$iconPath = "C:\Users\Matheus Izaias\.gemini\antigravity\scratch\PromptForge\assets\icon.ico"
$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fileStream = New-Object System.IO.FileStream($iconPath, [System.IO.FileMode]::Create)
$icon.Save($fileStream)
$fileStream.Close()
$icon.Dispose()
$bmp.Dispose()

# Atualiza atalho no Desktop com o icone
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$wshShell = New-Object -ComObject WScript.Shell
$shortcutPath = Join-Path $desktopPath "PromptForge.lnk"
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.IconLocation = "$iconPath,0"
$shortcut.Save()

Write-Output "Icone gerado e associado com sucesso ao atalho da Area de Trabalho!"
