@echo off
set "JAVA_HOME=C:\Users\HarishRuler\android-tools\jdk-17"
set "ANDROID_HOME=C:\Users\HarishRuler\android-tools\android-sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo =======================================================
echo [BUILD] BOOKNIQUE Android APK Generator
echo [BUILD] JAVA_HOME: %JAVA_HOME%
echo [BUILD] ANDROID_HOME: %ANDROID_HOME%
echo =======================================================

call "%JAVA_HOME%\bin\java.exe" -version

cd /d "C:\Users\HarishRuler\Downloads\rsr-books-toys-rental\frontend\android"
echo [BUILD] Executing Gradle assembleDebug...
call gradlew.bat assembleDebug --no-daemon

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gradle build failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo =======================================================
echo [SUCCESS] BOOKNIQUE Debug APK Generated Successfully!
echo =======================================================
dir /s /b app\build\outputs\apk\debug\*.apk
