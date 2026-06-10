# evidence-poet-design-system · installer
#
# Usage (from a local clone):
#   .\install.ps1                    # install all 3 skills (default)
#   .\install.ps1 installer          # install just one
#   .\install.ps1 installer builder  # install a subset
#
# Available skills (the Evidence Poet Design System lifecycle triad: install -> build -> verify):
#   installer · builder · auditor
#
# Two depth-specialist skills moved to separate repos with pluggable-spec support:
#   - SVG diagram surface     ->  https://github.com/mengzhou0125/svg-diagram-skill
#   - Content-review HTML     ->  https://github.com/mengzhou0125/html-review-skill
#
# Each name can be given with or without the "evidence-poet-" prefix.
# Idempotent — re-run to update.

$ErrorActionPreference = 'Stop'

$skillDir = Join-Path $env:USERPROFILE '.claude\skills'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$allSkills = @('evidence-poet-installer', 'evidence-poet-builder', 'evidence-poet-auditor')

if (-not (Test-Path $skillDir)) {
  New-Item -ItemType Directory -Force -Path $skillDir | Out-Null
}

if ($args.Count -eq 0) {
  $toInstall = $allSkills
} else {
  $toInstall = @()
  foreach ($arg in $args) {
    $name = if ($arg -like 'evidence-poet-*') { $arg } else { "evidence-poet-$arg" }
    if ($allSkills -notcontains $name) {
      Write-Host "Unknown skill: $arg"
      Write-Host "  Available: installer · builder · auditor"
      Write-Host "  For diagram / review skills, see:"
      Write-Host "    https://github.com/mengzhou0125/svg-diagram-skill"
      Write-Host "    https://github.com/mengzhou0125/html-review-skill"
      exit 1
    }
    $toInstall += $name
  }
}

foreach ($skill in $toInstall) {
  $target = Join-Path $skillDir $skill
  $source = Join-Path $scriptDir (Join-Path 'skills' $skill)

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
Write-Host "  - install Evidence Poet into a project ->  /install-epds   (or  install Evidence Poet into this project)"
Write-Host "  - build something in Evidence Poet     ->  /build-epds     (or  build an Evidence Poet component / page / etc.)"
Write-Host "  - audit a build for Evidence Poet drift -> node `$env:USERPROFILE\.claude\skills\evidence-poet-auditor\audit.mjs <path> --spec=<your-design.md>"
Write-Host ""
Write-Host "For SVG diagrams or content-review HTMLs (pluggable specs · Evidence Poet default):"
Write-Host "  - SVG:    git clone https://github.com/mengzhou0125/svg-diagram-skill   && cd svg-diagram-skill   && .\install.ps1"
Write-Host "  - Review: git clone https://github.com/mengzhou0125/html-review-skill && cd html-review-skill && .\install.ps1"
