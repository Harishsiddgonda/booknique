$toolsDir = "C:\Users\HarishRuler\android-tools"
New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null

$jdkDest = Join-Path $toolsDir "jdk-17"
if (-not (Test-Path "$jdkDest\bin\java.exe")) {
    Write-Output "Downloading OpenJDK 17 via curl.exe..."
    $jdkZip = Join-Path $toolsDir "jdk17.zip"
    $url = "https://download.visualstudio.microsoft.com/download/pr/e923d809-9553-4b01-87d4-b201c682b08d/c60353c18a0659148df842ecbf1710f1/microsoft-jdk-17.0.10-windows-x64.zip"
    & curl.exe -L --retry 3 -o $jdkZip $url
    
    Write-Output "Extracting OpenJDK 17..."
    Expand-Archive -Path $jdkZip -DestinationPath $toolsDir -Force
    Remove-Item -Path $jdkZip -Force -ErrorAction SilentlyContinue
    
    $extracted = Get-ChildItem -Path $toolsDir -Directory | Where-Object { $_.Name -match "jdk-17" } | Select-Object -First 1
    if ($extracted -and $extracted.FullName -ne $jdkDest) {
        Rename-Item -Path $extracted.FullName -NewName "jdk-17" -Force
    }
}

$javaExe = "$jdkDest\bin\java.exe"
if (Test-Path $javaExe) {
    & $javaExe -version
    Write-Output "JDK 17 Ready at: $jdkDest"
}

# Android SDK Command-line Tools
$sdkDir = Join-Path $toolsDir "android-sdk"
$cmdlineDir = Join-Path $sdkDir "cmdline-tools\latest"
if (-not (Test-Path "$cmdlineDir\bin\sdkmanager.bat")) {
    Write-Output "Downloading Android command-line tools via curl.exe..."
    New-Item -ItemType Directory -Force -Path "$sdkDir\cmdline-tools" | Out-Null
    $cmdlineZip = Join-Path $toolsDir "cmdline-tools.zip"
    $cmdlineUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"
    & curl.exe -L --retry 3 -o $cmdlineZip $cmdlineUrl
    
    Write-Output "Extracting Android command-line tools..."
    $tempExtract = Join-Path $toolsDir "cmdline-temp"
    Expand-Archive -Path $cmdlineZip -DestinationPath $tempExtract -Force
    Remove-Item -Path $cmdlineZip -Force -ErrorAction SilentlyContinue
    
    # Structure must be cmdline-tools\latest\bin
    if (Test-Path "$tempExtract\cmdline-tools") {
        Move-Item -Path "$tempExtract\cmdline-tools" -Destination $cmdlineDir -Force
    }
    Remove-Item -Path $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
}

$sdkmanager = "$cmdlineDir\bin\sdkmanager.bat"
if (Test-Path $sdkmanager) {
    Write-Output "Android SDK Manager ready at: $sdkmanager"
    $env:JAVA_HOME = $jdkDest
    $env:ANDROID_HOME = $sdkDir
    $env:PATH = "$jdkDest\bin;$cmdlineDir\bin;$sdkDir\platform-tools;$env:PATH"

    Write-Output "Accepting licenses..."
    cmd.exe /c "echo y | `"$sdkmanager`" --licenses"

    Write-Output "Installing build-tools 34.0.0 and platforms android-34..."
    cmd.exe /c "echo y | `"$sdkmanager`" ""platforms;android-34"" ""build-tools;34.0.0"" ""platform-tools"""
    Write-Output "Android SDK setup complete!"
}
