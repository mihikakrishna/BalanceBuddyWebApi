param(
    [string]$SourceDir = ".\build",
    [string]$TargetDir = "..\wwwroot"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $SourceDir)) {
    throw "Build output not found at '$SourceDir'. Run 'npm run build' first."
}

$sourcePath = (Resolve-Path $SourceDir).Path
$targetPath = Join-Path (Resolve-Path "..").Path "wwwroot"

# Recreate target directory to avoid stale hashed assets between publishes.
if (Test-Path $targetPath) {
    try {
        Remove-Item -LiteralPath $targetPath -Recurse -Force -ErrorAction Stop
    }
    catch {
        throw "Failed to clean '$targetPath'. Close any process locking wwwroot files and try again. $($_.Exception.Message)"
    }
}

New-Item -ItemType Directory -Path $targetPath -Force | Out-Null

Copy-Item -Recurse -Force (Join-Path $sourcePath "*") $targetPath

Write-Host "Published frontend build to $targetPath"
