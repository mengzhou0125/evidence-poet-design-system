# evidence-poet-design-system · installer (Windows PowerShell)
#
# Installs this skill into Claude Code's local skills directory
# (%USERPROFILE%\.claude\skills\evidence-poet-design-system\).
#
# Usage:
#   Local (after cloning):
#     .\install.ps1
#
#   Remote one-liner:
#     iex (irm https://raw.githubusercontent.com/mengzhou0125/evidence-poet-design-system/main/install.ps1)
#
# Requires: PowerShell 5+, git (only when run remotely).

$ErrorActionPreference = 'Stop'

$RepoUrl   = 'https://github.com/mengzhou0125/evidence-poet-design-system.git'
$SkillName = 'evidence-poet-design-system'
$Target    = Join-Path $env:USERPROFILE ".claude\skills\$SkillName"

# --- Resolve source: local or fetch on-the-fly ---
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { $null }
$Cleanup   = $null

if ($ScriptDir -and (Test-Path (Join-Path $ScriptDir 'SKILL.md'))) {
    $Source = $ScriptDir
} else {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error "'git' is required when running this script remotely."
        exit 1
    }
    $TmpDir = Join-Path ([System.IO.Path]::GetTempPath()) ([System.IO.Path]::GetRandomFileName())
    New-Item -ItemType Directory -Path $TmpDir | Out-Null
    $Source = Join-Path $TmpDir $SkillName
    Write-Host "→ Fetching skill from $RepoUrl ..."
    git clone --depth 1 --quiet $RepoUrl $Source
    $Cleanup = $TmpDir
}

# --- Idempotency check ---
if (Test-Path $Target) {
    Write-Host "Skill already installed at: $Target"
    $yn = Read-Host "Overwrite with latest? [y/N]"
    if ($yn -notmatch '^[Yy]') {
        Write-Host "Aborted. No changes made."
        if ($Cleanup) { Remove-Item -Recurse -Force $Cleanup }
        exit 0
    }
    Remove-Item -Recurse -Force $Target
}

# --- Install ---
New-Item -ItemType Directory -Path $Target -Force | Out-Null

Copy-Item (Join-Path $Source 'SKILL.md')   (Join-Path $Target 'SKILL.md')
Copy-Item (Join-Path $Source 'reference')  (Join-Path $Target 'reference')  -Recurse
Copy-Item (Join-Path $Source 'templates')  (Join-Path $Target 'templates')  -Recurse

# Repo-meta files (README, LICENSE, install scripts, .git, internal CLAUDE.md)
# are intentionally NOT copied — they are not part of the skill runtime.

if ($Cleanup) { Remove-Item -Recurse -Force $Cleanup }

# --- Done ---
Write-Host ""
Write-Host "✓ Installed: $Target"
Write-Host ""
Write-Host "Next: in any frontend project, tell Claude Code one of:"
Write-Host "    install DNA1 into this project"
Write-Host "    导入证据诗人设计规范"
Write-Host "    /install-dna1"
Write-Host ""
Write-Host "The skill will copy the DNA1 spec into the project's .claude/design.md"
Write-Host "and register a directive in the project's CLAUDE.md, so future Claude"
Write-Host "sessions automatically follow the design standard."
