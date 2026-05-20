@echo off
cd /d "%~dp0"

:: Inicia o assistente desktop em segundo plano (sem abrir terminal)
start /b "" pythonw desktop_app.py
exit
