

# Read logo data
# Read logo data
$logoBytes = [System.IO.File]::ReadAllBytes("assets/ikonlogo.png")
$logoBase64 = [Convert]::ToBase64String($logoBytes)
$dataUri = "data:image/png;base64,$logoBase64"

# Read hero banner data
$heroBytes = [System.IO.File]::ReadAllBytes("assets/hero_banner_optimized.png")
$heroBase64 = [Convert]::ToBase64String($heroBytes)
$heroDataUri = "data:image/png;base64,$heroBase64"

# Read certification images
$isoBytes = [System.IO.File]::ReadAllBytes("assets/cert_iso_optimized.png")
$isoBase64 = [Convert]::ToBase64String($isoBytes)
$isoDataUri = "data:image/png;base64,$isoBase64"

$msmeBytes = [System.IO.File]::ReadAllBytes("assets/cert_msme_optimized.png")
$msmeBase64 = [Convert]::ToBase64String($msmeBytes)
$msmeDataUri = "data:image/png;base64,$msmeBase64"

# Function to inline assets
function Inline-Assets {
    param (
        [string]$HtmlContent,
        [string]$CssContent,
        [string]$JsContent,
        [string]$LogoDataUri,
        [string]$HeroDataUri,
        [string]$IsoDataUri,
        [string]$MsmeDataUri
    )
    
    $HtmlContent = $HtmlContent.Replace('<link rel="stylesheet" href="style.css">', "<style>`n$CssContent`n</style>")
    $HtmlContent = $HtmlContent.Replace('<script src="app.js"></script>', "<script>`n$JsContent`n</script>")
    $HtmlContent = $HtmlContent.Replace('src="assets/ikonlogo.png"', "src=""$LogoDataUri""")
    $HtmlContent = $HtmlContent.Replace('src="assets/hero_banner_optimized.png"', "src=""$HeroDataUri""")
    $HtmlContent = $HtmlContent.Replace('src="assets/cert_iso_optimized.png"', "src=""$IsoDataUri""")
    $HtmlContent = $HtmlContent.Replace('src="assets/cert_msme_optimized.png"', "src=""$MsmeDataUri""")
    
    return $HtmlContent
}

# Ensure dist directory exists
if (-not (Test-Path "dist")) {
    New-Item -ItemType Directory -Path "dist" | Out-Null
}

# Build index.html
$indexHtml = Get-Content -Path "index.html" -Raw
$indexHtml = Inline-Assets -HtmlContent $indexHtml -CssContent $css -JsContent $js -LogoDataUri $dataUri -HeroDataUri $heroDataUri -IsoDataUri $isoDataUri -MsmeDataUri $msmeDataUri
$indexHtml | Set-Content -Path "dist/index.html" -Encoding UTF8
Write-Host "Build complete: dist/index.html"

# Build prospectus.html
if (Test-Path "prospectus.html") {
    $prospectusHtml = Get-Content -Path "prospectus.html" -Raw
    $prospectusHtml = Inline-Assets -HtmlContent $prospectusHtml -CssContent $css -JsContent $js -LogoDataUri $dataUri -HeroDataUri $heroDataUri -IsoDataUri $isoDataUri -MsmeDataUri $msmeDataUri
    $prospectusHtml | Set-Content -Path "dist/prospectus.html" -Encoding UTF8
    Write-Host "Build complete: dist/prospectus.html"
}

# Copy download files
if (Test-Path "Prospectus.pdf") {
    Copy-Item -Path "Prospectus.pdf" -Destination "dist/Prospectus.pdf" -Force
    Write-Host "Copied: Prospectus.pdf"
}
if (Test-Path "Prospectus.docx") {
    Copy-Item -Path "Prospectus.docx" -Destination "dist/Prospectus.docx" -Force
    Write-Host "Copied: Prospectus.docx"
}



