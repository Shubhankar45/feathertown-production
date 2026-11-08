Add-Type -AssemblyName System.Drawing

function Save-CroppedJpeg($srcPath, $cropX, $cropY, $cropW, $cropH, $outW, $outH, $destPath) {
    $src = [System.Drawing.Image]::FromFile($srcPath)
    $destBmp = New-Object System.Drawing.Bitmap($outW, $outH)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $outW, $outH)

    $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    # Save as high-quality JPEG
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90)

    $destBmp.Save($destPath, $codec, $encoderParams)

    $g.Dispose()
    $destBmp.Dispose()
    $src.Dispose()
    Write-Host "Created: $destPath ($outW x $outH)"
}

$dir = "c:\Users\Shubh\Desktop\featherstown-admin-shop\featherstown-main\frontend\src\assets\birds"

# 1. African Grey: 2848x4288 -> Crop 4:3 from y=350 to capture whole bird with red tail
Save-CroppedJpeg "$dir\african-grey.jpg" 0 350 2848 2136 960 720 "$dir\crop-african-grey.jpg"
Save-CroppedJpeg "$dir\african-grey.jpg" 400 350 1800 1800 160 160 "$dir\thumb-african-grey.jpg"

# 2. Cockatiel: 2108x1588
Save-CroppedJpeg "$dir\cockatiel.jpg" 0 0 2108 1581 960 720 "$dir\crop-cockatiel.jpg"
Save-CroppedJpeg "$dir\cockatiel.jpg" 260 0 1580 1580 160 160 "$dir\thumb-cockatiel.jpg"

# 3. Green Cheek: 4928x3264
Save-CroppedJpeg "$dir\green-cheek.jpg" 288 0 4352 3264 960 720 "$dir\crop-green-cheek.jpg"
Save-CroppedJpeg "$dir\green-cheek.jpg" 800 0 3200 3200 160 160 "$dir\thumb-green-cheek.jpg"

# 4. Macaw: 2936x2267
Save-CroppedJpeg "$dir\macaw.jpg" 0 32 2936 2202 960 720 "$dir\crop-macaw.jpg"
Save-CroppedJpeg "$dir\macaw.jpg" 360 32 2200 2200 160 160 "$dir\thumb-macaw.jpg"

# 5. Pineapple Conure: 2448x2448
Save-CroppedJpeg "$dir\pineapple-conure.jpg" 0 200 2448 1836 960 720 "$dir\crop-pineapple-conure.jpg"
Save-CroppedJpeg "$dir\pineapple-conure.jpg" 300 200 1800 1800 160 160 "$dir\thumb-pineapple-conure.jpg"

# 6. Sun Conure: 4608x3456
Save-CroppedJpeg "$dir\sun-conure.jpg" 0 0 4608 3456 960 720 "$dir\crop-sun-conure.jpg"
Save-CroppedJpeg "$dir\sun-conure.jpg" 570 0 3450 3450 160 160 "$dir\thumb-sun-conure.jpg"

Write-Host "All bird images successfully cropped to uniform 4:3 (960x720) and thumbnails (160x160)!"
