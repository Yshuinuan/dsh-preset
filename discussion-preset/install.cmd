@echo off
setlocal
set "NODE=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE%" (
  echo Cannot find the DSH bundled Node runtime:
  echo   %NODE%
  echo Install DSH first, or run install.mjs with another Node 20+.
  pause
  exit /b 1
)
"%NODE%" "%~dp0install.mjs" %*
set "CODE=%ERRORLEVEL%"
if not "%CODE%"=="0" pause
exit /b %CODE%
