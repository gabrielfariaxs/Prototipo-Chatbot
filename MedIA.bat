@echo off
cd /d "%~dp0"
title MedIA - Sistema de Inteligencia
title MedIA - Assistente Virtual
cls

echo ==========================================
echo    MedIA - Assistente Virtual (Online)
echo ==========================================
echo.

:: Fecha processos antigos do Python se existirem
taskkill /f /im python.exe /t >nul 2>&1

:: Verifica e instala dependencias uma por uma (evita que um erro trave tudo)
echo Verificando componentes...
python -m pip install --user --no-cache-dir requests
python -m pip install --user --no-cache-dir Pillow
python -m pip install --user --no-cache-dir numpy
python -m pip install --user --no-cache-dir pywebview

:: Inicia o assistente desktop
echo Iniciando assistente...
python desktop_app.py
pause
