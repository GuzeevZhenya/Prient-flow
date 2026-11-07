# TTS: русский голос Irina, WAV 16-bit. Вход — текст, выход — путь .wav
param(
  [Parameter(Mandatory = $true)][string]$Text,
  [Parameter(Mandatory = $true)][string]$OutFile,
  [int]$Rate = -1
)

Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $synth.SelectVoice("Microsoft Irina Desktop")
  $synth.Rate = $Rate
  $synth.Volume = 100
  $dir = Split-Path -Parent $OutFile
  if ($dir -and -not (Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }
  $synth.SetOutputToWaveFile($OutFile)
  $synth.Speak($Text)
}
finally {
  $synth.Dispose()
}
