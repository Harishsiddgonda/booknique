$sdkDir = "C:\Users\HarishRuler\android-tools\android-sdk"
$licensesDir = Join-Path $sdkDir "licenses"
New-Item -ItemType Directory -Force -Path $licensesDir | Out-Null

# Write well-known Android SDK license hashes
Set-Content -Path "$licensesDir\android-sdk-license" -Value @"
8933bad161af4178b1185d1a37fbf41ea5269c55
d56f5187479451eabf01fb78af6dfcb131a6481e
24333f8a63b68b00a494157b24c04f147e2e69e7
"@ -Force

Set-Content -Path "$licensesDir\android-sdk-preview-license" -Value @"
84831b9409646a918e30573bab4c9c91346d8abd
"@ -Force

Set-Content -Path "$licensesDir\android-googletv-license" -Value @"
601085b94c27346db8026845cb049138d69f3a66
"@ -Force

Write-Output "Licenses written to $licensesDir"

$jdkDest = "C:\Users\HarishRuler\android-tools\jdk-17"
$cmdlineDir = "$sdkDir\cmdline-tools\latest"
$sdkmanager = "$cmdlineDir\bin\sdkmanager.bat"

$env:JAVA_HOME = $jdkDest
$env:ANDROID_HOME = $sdkDir
$env:PATH = "$jdkDest\bin;$cmdlineDir\bin;$sdkDir\platform-tools;$env:PATH"

Write-Output "Installing Android 34 platforms, build-tools 34.0.0, and platform-tools..."
& $sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools"
Write-Output "Done installing Android components!"
