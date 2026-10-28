Add-Type -AssemblyName System.Drawing

$src = "c:\Users\Shubh\Desktop\featherstown-admin-shop\featherstown-main\frontend\src\assets\logo.png"
$img = [System.Drawing.Image]::FromFile($src)

function Resize-Image($orig, $w, $h, $dest) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($orig, 0, 0, $w, $h)
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Resize-Image $img 512 512 "c:\Users\Shubh\Desktop\featherstown-admin-shop\featherstown-main\frontend\src\assets\logo-optimized.png"
Resize-Image $img 512 512 "c:\Users\Shubh\Desktop\featherstown-admin-shop\featherstown-main\frontend\public\logo.png"
Resize-Image $img 180 180 "c:\Users\Shubh\Desktop\featherstown-admin-shop\featherstown-main\frontend\public\apple-touch-icon.png"
Resize-Image $img 32 32 "c:\Users\Shubh\Desktop\featherstown-admin-shop\featherstown-main\frontend\public\favicon-32x32.png"
Resize-Image $img 16 16 "c:\Users\Shubh\Desktop\featherstown-admin-shop\featherstown-main\frontend\public\favicon-16x16.png"

# Also create an OG 1200x630 social preview image with a nice white/warm card and logo centered
$ogBmp = New-Object System.Drawing.Bitmap(1200, 630)
$ogG = [System.Drawing.Graphics]::FromImage($ogBmp)
$ogG.Clear([System.Drawing.ColorTranslator]::FromHtml("#FBF8F2"))

# Draw soft green decorative accent bar at top
$brushGreen = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#16A34A"))
$ogG.FillRectangle($brushGreen, 0, 0, 1200, 16)
$brushGreen.Dispose()

# Draw the logo centered
$logoW = 440
$logoH = 440
$logoX = [int]((1200 - $logoW) / 2)
$logoY = [int]((630 - $logoH) / 2 - 20)
$ogG.DrawImage($img, $logoX, $logoY, $logoW, $logoH)

$ogBmp.Save("c:\Users\Shubh\Desktop\featherstown-admin-shop\featherstown-main\frontend\public\og-image.png", [System.Drawing.Imaging.ImageFormat]::Png)
$ogG.Dispose()
$ogBmp.Dispose()

$img.Dispose()
Write-Host "Images optimized successfully!"
