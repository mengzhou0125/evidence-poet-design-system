# evidence-poet-design-system · installer for all 3 skills
# (installer · builder · auditor — the spec+distribution+verification triad)
#
# Usage (from a local clone):
#   .\install.ps1
#
# Idempotent — re-run to update.

$ErrorActionPreference = 'Stop'

$skillDir = Join-Path $env:USERPROFILE '.claude\skills'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not (Test-Path $skillDir)) {
  New-Item -ItemType Directory -Force -Path $skillDir | Out-Null
}

foreach ($skill in @('evidence-poet-installer', 'evidence-poet-builder', 'evidence-poet-auditor')) {
  $target = Join-Path $skillDir $skill
  $source = Join-Path $scriptDir $skill

  if (-not (Test-Path $source)) {
    Write-Error "Source not found: $source"
    exit 1
  }

  if (Test-Path $target) {
    Remove-Item -Recurse -Force $target
  }

  Copy-Item -Recurse -Path $source -Destination $target
  Write-Host "✓ Installed: $skill -> $target"
}

Write-Host ""
Write-Host "Next:"
Write-Host "  - install DNA1 into a project ->  /install-dna1  (or  install DNA1 into this project)"
Write-Host "  - build something in DNA1     ->  /build-dna1    (or  build a DNA1 component / SVG / etc.)"
Write-Host "  - audit a build for DNA1 drift -> node `$env:USERPROFILE\.claude\skills\evidence-poet-auditor\audit.mjs <path> --spec=<your-design.md>"
