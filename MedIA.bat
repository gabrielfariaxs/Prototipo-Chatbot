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

:: Verifica e instala dependencias se necessario
echo Verificando componentes...
pip install requests pywebview Pillow numpy >nul 2>&1

:: Inicia o assistente desktop
echo Iniciando assistente...
python desktop_app.py
pause
