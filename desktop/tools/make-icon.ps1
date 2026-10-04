# Малює піксельну мордочку Капі 16x16 і збирає з неї іконку build\icon.ico (розміри 16–256) та build\icon.png.
# Запуск (з папки desktop):  powershell -ExecutionPolicy Bypass -File tools\make-icon.ps1
Add-Type -AssemblyName System.Drawing

$S = 16
$pal = @{
  'm' = '#8ed4a6'; 'g' = '#4f9a63'; 'l' = '#a8703f'; 'd' = '#4a3228'; 'c' = '#dba46a'
  'k' = '#2a1d1a'; 'p' = '#ef8fa3'; 'y' = '#ffe08a'; 'w' = '#fff4dc'; 'b' = '#7a4f35'
}
$grid = New-Object 'string[]' $S
for ($i = 0; $i -lt $S; $i++) { $grid[$i] = ('.' * $S) }

function SetPx($x, $y, $ch) {
  if ($x -lt 0 -or $y -lt 0 -or $x -ge $S -or $y -ge $S) { return }
  $row = $script:grid[$y].ToCharArray(); $row[$x] = $ch; $script:grid[$y] = -join $row
}
function Ellipse($cx, $cy, $rx, $ry, $ch) {
  for ($y = 0; $y -lt $S; $y++) { for ($x = 0; $x -lt $S; $x++) {
    $dx = ($x + 0.5 - $cx) / $rx; $dy = ($y + 0.5 - $cy) / $ry
    if (($dx * $dx + $dy * $dy) -le 1) { SetPx $x $y $ch }
  } }
}

# фон — м'ятна плитка з заокругленими кутами
for ($y = 0; $y -lt $S; $y++) { for ($x = 0; $x -lt $S; $x++) {
  $corner = (($x -lt 2 -or $x -gt 13) -and ($y -lt 2 -or $y -gt 13) -and -not (($x -eq 1 -or $x -eq 14) -and ($y -eq 1 -or $y -eq 14)))
  if (-not $corner) { SetPx $x $y 'm' }
} }
# вуха, голова, мордочка
Ellipse 3.2 5 1.8 1.8 'd'; Ellipse 12.8 5 1.8 1.8 'd'
Ellipse 3.2 5.3 0.9 0.9 'b'; Ellipse 12.8 5.3 0.9 0.9 'b'
Ellipse 8 9 6.4 5.6 'd'
Ellipse 8 9 5.6 4.8 'l'
Ellipse 8 11.2 3.6 2.6 'c'
# очі, ніс, рот
SetPx 4 7 'k'; SetPx 4 8 'k'; SetPx 11 7 'k'; SetPx 11 8 'k'
SetPx 4 7 'w'
SetPx 11 7 'w'
SetPx 6 10 'k'; SetPx 9 10 'k'
SetPx 7 12 'd'; SetPx 8 12 'd'
# квіточка на голові
SetPx 8 2 'p'; SetPx 7 3 'p'; SetPx 9 3 'p'; SetPx 8 4 'p'; SetPx 8 3 'y'

function Render($size) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $g.Clear([System.Drawing.Color]::Transparent)
  $cell = $size / $script:S
  for ($y = 0; $y -lt $script:S; $y++) { for ($x = 0; $x -lt $script:S; $x++) {
    $ch = $script:grid[$y][$x]
    if ($ch -eq '.') { continue }
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($script:pal[[string]$ch]))
    $x0 = [math]::Floor($x * $cell); $x1 = [math]::Floor(($x + 1) * $cell)
    $y0 = [math]::Floor($y * $cell); $y1 = [math]::Floor(($y + 1) * $cell)
    $g.FillRectangle($brush, $x0, $y0, ($x1 - $x0), ($y1 - $y0))
    $brush.Dispose()
  } }
  $g.Dispose()
  return $bmp
}

$out = Join-Path $PSScriptRoot '..\build'
New-Item -ItemType Directory -Force $out | Out-Null
$sizes = 16, 32, 48, 64, 128, 256
$pngs = @()
foreach ($sz in $sizes) {
  $bmp = Render $sz
  $ms = New-Object System.IO.MemoryStream
  $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $pngs += , ($ms.ToArray())
  if ($sz -eq 256) { $bmp.Save((Join-Path $out 'icon.png'), [System.Drawing.Imaging.ImageFormat]::Png) }
  $bmp.Dispose(); $ms.Dispose()
}
# ICO: заголовок + каталог + PNG-картинки
$fs = [System.IO.File]::Create((Join-Path $out 'icon.ico'))
$bw = New-Object System.IO.BinaryWriter $fs
$bw.Write([uint16]0); $bw.Write([uint16]1); $bw.Write([uint16]$sizes.Count)
$offset = 6 + 16 * $sizes.Count
for ($i = 0; $i -lt $sizes.Count; $i++) {
  $sz = $sizes[$i]
  $bw.Write([byte]($(if ($sz -ge 256) { 0 } else { $sz })))
  $bw.Write([byte]($(if ($sz -ge 256) { 0 } else { $sz })))
  $bw.Write([byte]0); $bw.Write([byte]0)
  $bw.Write([uint16]1); $bw.Write([uint16]32)
  $bw.Write([uint32]$pngs[$i].Length); $bw.Write([uint32]$offset)
  $offset += $pngs[$i].Length
}
foreach ($p in $pngs) { $bw.Write($p) }
$bw.Close(); $fs.Close()
Write-Output "Готово: $out\icon.ico та icon.png"
