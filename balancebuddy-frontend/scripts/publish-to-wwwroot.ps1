param(
    [string]$SourceDir = ".\build",
    [string]$TargetDir = "..\wwwroot"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SourceDir)) {
    throw "Build output not found at '$SourceDir'. Run 'npm run build' first."
}

$sourcePath = Resolve-Path $SourceDir
$targetPath = Resolve-Path "..\wwwroot" -ErrorAction SilentlyContinue

if (-not $targetPath) {
    $targetPath = Join-Path (Resolve-Path "..") "wwwroot"
    New-Item -ItemType Directory -Path $targetPath | Out-Null
}

Copy-Item -Recurse -Force (Join-Path $sourcePath "*") $targetPath

Write-Host "Published frontend build to $targetPath"
