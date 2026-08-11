# Unblock Expo browser login on Windows when `npx expo login -b` crashes on `cmd start`.
# Usage:
#   1. Create a token at https://expo.dev/settings/access-tokens
#   2. $env:EXPO_TOKEN = "your-token"
#   3. npx expo whoami
#
# Or try browser login with Chrome as the opener:
#   .\scripts\expo-login-windows.ps1

$chrome = @(
  "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($chrome) {
  $env:BROWSER = $chrome
  Write-Host "Using BROWSER=$chrome"
} else {
  Write-Host "Chrome not found. Prefer EXPO_TOKEN from https://expo.dev/settings/access-tokens"
}

Write-Host "Starting expo login -b ..."
Write-Host "If a URL prints, open it in Chrome immediately before the process exits."
npx expo login -b
