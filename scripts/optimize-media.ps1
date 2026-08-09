$ErrorActionPreference = "Stop"

$projectRoot = (Get-Location).Path
$ffmpeg = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source

if (-not $ffmpeg) {
  $ffmpeg = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
}

if (-not $ffmpeg) {
  throw "ffmpeg is required. Install it, open a new PowerShell window, and run this script again."
}

function Invoke-Ffmpeg {
  param([string[]]$Arguments)

  & $ffmpeg @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "ffmpeg failed with exit code $LASTEXITCODE."
  }
}

$videoSource = Join-Path $projectRoot "shorted_video.mp4"
$videoDirectory = Join-Path $projectRoot "public\videos\scroll-film"

# The film is scrubbed frame-by-frame, so keep keyframes frequent while using
# inter-frame compression. The muted background does not need an audio stream.
Invoke-Ffmpeg @(
  "-y", "-hide_banner", "-loglevel", "warning",
  "-i", $videoSource,
  "-vf", "scale=1280:-2:force_original_aspect_ratio=decrease",
  "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "23",
  "-pix_fmt", "yuv420p", "-profile:v", "main", "-g", "15",
  "-keyint_min", "15", "-sc_threshold", "0", "-bf", "0",
  "-movflags", "+faststart",
  (Join-Path $videoDirectory "fullvideo-web-v2.mp4")
)

Invoke-Ffmpeg @(
  "-y", "-hide_banner", "-loglevel", "warning",
  "-i", $videoSource,
  "-vf", "scale=704:396",
  "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "25",
  "-pix_fmt", "yuv420p", "-profile:v", "main", "-g", "15",
  "-keyint_min", "15", "-sc_threshold", "0", "-bf", "0",
  "-movflags", "+faststart",
  (Join-Path $videoDirectory "fullvideo-mobile-v2.mp4")
)

Invoke-Ffmpeg @(
  "-y", "-hide_banner", "-loglevel", "warning",
  "-i", $videoSource,
  "-vf", "scale=1280:-2:force_original_aspect_ratio=decrease",
  "-frames:v", "1", "-q:v", "2", "-an", "-map_metadata", "-1",
  (Join-Path $videoDirectory "fullvideo-poster-v2.jpg")
)

$previewDirectory = Join-Path $projectRoot "public\music\previews"
New-Item -ItemType Directory -Force -Path $previewDirectory | Out-Null

$songs = @(
  @{ Source = "2 Bhai.mp3"; Destination = "2-bhai-preview.mp3" },
  @{ Source = "Bau Ji.mp3"; Destination = "bau-ji-preview.mp3" },
  @{ Source = "Dad Of Town.mp3"; Destination = "dad-of-town-preview.mp3" },
  @{ Source = "Jigar Ke Challe.mp3"; Destination = "jigar-ke-challe-preview.mp3" },
  @{ Source = "Bhaagwan.mp3"; Destination = "bhaagwan-preview.mp3" },
  @{ Source = "Shiv Parvati.mp3"; Destination = "shiv-parvati-preview.mp3" }
)

foreach ($song in $songs) {
  Invoke-Ffmpeg @(
    "-y", "-hide_banner", "-loglevel", "warning",
    "-i", (Join-Path $projectRoot ("music\" + $song.Source)),
    "-map", "0:a:0", "-t", "30", "-vn",
    "-c:a", "libmp3lame", "-b:a", "128k", "-ar", "44100", "-ac", "2",
    "-map_metadata", "-1",
    (Join-Path $previewDirectory $song.Destination)
  )
}

Get-ChildItem $videoDirectory -Filter "fullvideo-*.mp4" | Select-Object Name, Length
Get-ChildItem $previewDirectory -File | Select-Object Name, Length
