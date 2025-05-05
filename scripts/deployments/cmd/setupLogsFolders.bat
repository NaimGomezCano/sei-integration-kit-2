@echo off
REM Get the current path
set "current_path=%cd%"

REM Create the directories if they do not already exist
if not exist "%current_path%\bin\test\logs\service\errors" (
    echo Creating the errors folder for the test logs
    mkdir "%current_path%\bin\test\logs\service\errors"

if not exist "%current_path%\bin\test\logs\service\outputs" (
    echo Creating the outputs folder for the test logs
    mkdir "%current_path%\bin\test\logs\service\outputs"
))

if not exist "%current_path%\bin\production\logs\service\outputs" (
    echo Creating the outputs folder for the production logs
    mkdir "%current_path%\bin\production\logs\service\outputs"
)

if not exist "%current_path%\bin\production\logs\service\errors" (
    echo Creating the errors folder for the production logs
    mkdir "%current_path%\bin\production\logs\service\errors"
)

echo Logs folders are set up successfully
