Add-Type -AssemblyName System.Drawing

$root = (Get-Location).Path
$sourceRoot = Join-Path $root 'Pictures'
$publicRoot = Join-Path $root 'public\pictures'

function Get-JpegEncoder {
  return [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
}

function Save-ResizedImage {
  param(
    [string]$Source,
    [string]$Destination,
    [int]$MaxWidth,
    [int]$MaxHeight,
    [ValidateRange(1, 100)][int]$Quality = 84,
    [ValidateSet('jpeg', 'png')][string]$Format = 'jpeg'
  )

  $sourceImage = [System.Drawing.Image]::FromFile($Source)
  $scale = [math]::Min([double]1, [math]::Min([double]$MaxWidth / [double]$sourceImage.Width, [double]$MaxHeight / [double]$sourceImage.Height))
  $width = [int][math]::Max(1, [math]::Round($sourceImage.Width * $scale))
  $height = [int][math]::Max(1, [math]::Round($sourceImage.Height * $scale))

  $bitmap = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  if ($Format -eq 'png') {
    $bitmap.Dispose()
    $bitmap = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics.Dispose()
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  }

  $graphics.DrawImage($sourceImage, 0, 0, $width, $height)
  $directory = Split-Path -Parent $Destination
  New-Item -ItemType Directory -Force -Path $directory | Out-Null

  if ($Format -eq 'png') {
    $bitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  } else {
    $encoder = Get-JpegEncoder
    $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
    $bitmap.Save($Destination, $encoder, $parameters)
    $parameters.Dispose()
  }

  $graphics.Dispose()
  $bitmap.Dispose()
  $sourceImage.Dispose()
}

New-Item -ItemType Directory -Force -Path (Join-Path $publicRoot 'thumbnail') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $publicRoot 'gallery') | Out-Null

Save-ResizedImage (Join-Path $sourceRoot 'heroimage.png') (Join-Path $publicRoot 'hero.png') 1600 2400 88 'png'
Save-ResizedImage (Join-Path $sourceRoot 'heroimage.png') (Join-Path $publicRoot 'hero-poster.jpg') 1400 2200 82 'jpeg'
Save-ResizedImage (Join-Path $sourceRoot 'aboutsectionimage.png') (Join-Path $publicRoot 'about-section-image.jpg') 1400 2200 84 'jpeg'

$thumbnailMap = @(
  @{ Source = '1_release.jpg'; Destination = 'song-cover-1.jpg'; Width = 1600; Height = 1000 },
  @{ Source = '2_release.png'; Destination = 'song-cover-2.jpg'; Width = 1400; Height = 1400 },
  @{ Source = '3_release.png'; Destination = 'song-cover-3.jpg'; Width = 1100; Height = 1500 },
  @{ Source = '4_release.jpg'; Destination = 'song-cover-4.jpg'; Width = 1600; Height = 1000 },
  @{ Source = '5_release.png'; Destination = 'song-cover-5.jpg'; Width = 1400; Height = 1400 },
  @{ Source = '6_release.jpg'; Destination = 'song-cover-6.jpg'; Width = 1200; Height = 1600 }
)

foreach ($item in $thumbnailMap) {
  Save-ResizedImage (Join-Path $sourceRoot ('Thumbnail\' + $item.Source)) (Join-Path $publicRoot ('thumbnail\' + $item.Destination)) $item.Width $item.Height 82 'jpeg'
}

Save-ResizedImage (Join-Path $sourceRoot 'Gallery\1_gallery.png') (Join-Path $publicRoot 'gallery\gallery-image-1.jpg') 1000 1400 84 'jpeg'
Save-ResizedImage (Join-Path $sourceRoot 'Gallery\2_gallery.jpg') (Join-Path $publicRoot 'gallery\gallery-image-2.jpg') 1400 2200 84 'jpeg'

Get-ChildItem -LiteralPath $publicRoot -Recurse -File |
  Select-Object FullName, Length, Extension
