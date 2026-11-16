@echo off
set "JAVA_HOME=C:\Users\HarishRuler\android-tools\jdk-17"
set "ANDROID_HOME=C:\Users\HarishRuler\android-tools\android-sdk"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo =======================================================
echo [BUILD] BOOKNIQUE Android APK Generator (Debug + Release)
echo [BUILD] JAVA_HOME: %JAVA_HOME%
echo [BUILD] ANDROID_HOME: %ANDROID_HOME%
echo =======================================================

call "%JAVA_HOME%\bin\java.exe" -version

cd /d "C:\Users\HarishRuler\Downloads\rsr-books-toys-rental\frontend"
echo [BUILD] 1/3 Syncing Capacitor web assets...
call node node_modules\@capacitor\cli\bin\capacitor sync android

cd /d "C:\Users\HarishRuler\Downloads\rsr-books-toys-rental\frontend\android"
echo [BUILD] 2/3 Compiling Gradle assembleDebug...
call gradlew.bat assembleDebug --no-daemon

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gradle assembleDebug failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo [BUILD] 3/3 Compiling Gradle assembleRelease (Signed)...
call gradlew.bat assembleRelease --no-daemon

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gradle assembleRelease failed with exit code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo =======================================================
echo [SUCCESS] BOOKNIQUE Debug and Release APKs Generated!
echo =======================================================
dir /s /b app\build\outputs\apk\debug\*.apk
dir /s /b app\build\outputs\apk\release\*.apk
