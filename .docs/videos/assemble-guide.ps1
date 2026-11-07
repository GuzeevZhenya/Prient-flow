# Сборка гайда: кадры + MP3 (Svetlana Neural) → MP4.
param(
  [Parameter(Mandatory = $true)][string]$Ffmpeg,
  [string]$Root = "D:\Cursor\Prient-flow\.docs\videos"
)

$ErrorActionPreference = "Stop"
$frames = Join-Path $Root "frames"
$audio = Join-Path $Root "audio"
$clips = Join-Path $Root "clips"
New-Item -ItemType Directory -Force -Path $clips | Out-Null

$map = @(
  @{ mp3 = "00-intro.mp3"; png = "guide-01-dashboard.png"; out = "00.mp4" },
  @{ mp3 = "01-dashboard.mp3"; png = "guide-01-dashboard.png"; out = "01.mp4" },
  @{ mp3 = "02-orders.mp3"; png = "guide-02-orders.png"; out = "02.mp4" },
  @{ mp3 = "03-clients.mp3"; png = "guide-03b-client-form.png"; out = "03.mp4" },
  @{ mp3 = "04-inventory.mp3"; png = "guide-04-inventory.png"; out = "04.mp4" },
  @{ mp3 = "05-printers.mp3"; png = "guide-05-printers.png"; out = "05.mp4" },
  @{ mp3 = "06-calculator.mp3"; png = "guide-06-calculator.png"; out = "06.mp4" },
  @{ mp3 = "07-settings.mp3"; png = "guide-07-settings.png"; out = "07.mp4" }
)

$vf = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p"

foreach ($item in $map) {
  $src = Join-Path $frames $item.png
  $mp3 = Join-Path $audio $item.mp3
  if (-not (Test-Path $src)) { throw "нет кадра $($item.png)" }
  if (-not (Test-Path $mp3)) { throw "нет звука $($item.mp3)" }
  $out = Join-Path $clips $item.out
  & $Ffmpeg -y -loop 1 -i $src -i $mp3 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -vf $vf -movflags +faststart $out
  if ($LASTEXITCODE -ne 0) { throw "clip $($item.out) failed" }
  Write-Output "clip $($item.out)"
}

$list = Join-Path $clips "list.txt"
Set-Content -Path $list -Value ($map | ForEach-Object { "file '$($_.out)'" }) -Encoding ascii
$guide = Join-Path $Root "prient-flow-guide.mp4"
Push-Location $clips
try {
  & $Ffmpeg -y -f concat -safe 0 -i "list.txt" -c copy $guide
  if ($LASTEXITCODE -ne 0) { throw "concat failed" }
}
finally {
  Pop-Location
}

$adSrc = "C:\Users\AMD\.cursor\projects\d-Cursor-Prient-flow\assets\prient-flow-ad.mp4"
$adVoice = Join-Path $audio "ad-voice.mp3"
$adOut = Join-Path $Root "prient-flow-ad.mp4"
if ((Test-Path $adSrc) -and (Test-Path $adVoice)) {
  Copy-Item $adSrc $adOut -Force
  $adVoiced = Join-Path $Root "prient-flow-ad-voice.mp4"
  & $Ffmpeg -y -i $adSrc -i $adVoice -filter_complex "[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=1.15,atrim=0:14.8,asetpts=PTS-STARTPTS[a]" -map 0:v:0 -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart $adVoiced
  if ($LASTEXITCODE -ne 0) { throw "ad voice mux failed" }
}

Write-Output "GUIDE=$guide"
Get-Item $guide, (Join-Path $Root "prient-flow-ad*.mp4") | Select-Object Name, Length
