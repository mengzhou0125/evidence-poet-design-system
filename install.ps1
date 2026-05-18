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

# --- Version comparison · silent update if newer ---
function Get-DesignVersion {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return $null }
    $line = Select-String -Path $Path -Pattern '^\s*"version"\s*:\s*"([^"]+)"' -List
    if ($line) { return $line.Matches[0].Groups[1].Value }
    return $null
}

# Returns -1 if A<B · 0 if A==B · 1 if A>B · $null if either is not a parseable semver (X.Y.Z)
function Compare-Semver {
    param([string]$A, [string]$B)
    $pattern = '^\d+\.\d+\.\d+$'
    if (-not ($A -match $pattern) -or -not ($B -match $pattern)) { return $null }
    $va = [System.Version]"$A"
    $vb = [System.Version]"$B"
    if ($va -lt $vb) { return -1 }
    if ($va -gt $vb) { return 1 }
    return 0
}

$SourceVersion = Get-DesignVersion (Join-Path $Source 'reference\design.md')

if (Test-Path $Target) {
    $TargetVersion = Get-DesignVersion (Join-Path $Target 'reference\design.md')
    $cmp = Compare-Semver $SourceVersion $TargetVersion

    if ($null -eq $cmp) {
        Write-Host "Skill already installed at: $Target (cannot determine version)"
        $yn = Read-Host "Overwrite with latest? [y/N]"
        if ($yn -notmatch '^[Yy]') {
            Write-Host "Aborted. No changes made."
            if ($Cleanup) { Remove-Item -Recurse -Force $Cleanup }
            exit 0
        }
        Remove-Item -Recurse -Force $Target
    }
    elseif ($cmp -eq 0) {
        Write-Host "✓ Skill already at v$TargetVersion · no update needed."
        if ($Cleanup) { Remove-Item -Recurse -Force $Cleanup }
        exit 0
    }
    elseif ($cmp -gt 0) {
        Write-Host "→ Updating skill: v$TargetVersion → v$SourceVersion"
        Remove-Item -Recurse -Force $Target
    }
    else {
        Write-Host "⚠ Local skill (v$TargetVersion) is newer than source (v$SourceVersion)."
        $yn = Read-Host "Downgrade? [y/N]"
        if ($yn -notmatch '^[Yy]') {
            Write-Host "Aborted. No changes made."
            if ($Cleanup) { Remove-Item -Recurse -Force $Cleanup }
            exit 0
        }
        Remove-Item -Recurse -Force $Target
    }
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
Write-Host "✓ Installed: $Target (v$SourceVersion)"
Write-Host ""
Write-Host "Next: in any frontend project, tell Claude Code one of:"
Write-Host "    install DNA1 into this project"
Write-Host "    导入证据诗人设计规范"
Write-Host "    /install-dna1"
Write-Host ""
Write-Host "The skill will copy the DNA1 spec into the project's .claude/design.md"
Write-Host "and register a directive in the project's CLAUDE.md, so future Claude"
Write-Host "sessions automatically follow the design standard."
