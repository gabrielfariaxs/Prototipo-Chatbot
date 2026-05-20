@echo off
cd /d "%~dp0"
title Instalador MedIA - Configurando seu Assistente
setlocal enabledelayedexpansion

echo ==================================================
echo      INSTALADOR AUTOMATICO DO MEDIA
echo ==================================================
echo.
echo Este script vai configurar tudo para voce automaticamente.
echo Por favor, aguarde alguns instantes...
echo.

:: 1. Verifica Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado! 
    echo Por favor, instale o Python em https://www.python.org/
    pause
    exit
)

:: 2. Verifica Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale o Node.js em https://nodejs.org/
    pause
    exit
)

echo [*] Instalando bibliotecas do sistema (Python)...
pip install requests pywebview pillow numpy pypdf >nul 2>&1

echo [*] Instalando dependencias da interface (Web)...
cd web
call npm install --quiet
cd ..

echo [*] Criando atalho na Area de Trabalho...
set SCRIPT_PATH=%~dp0MedIA.bat
set ICON_PATH=%~dp0web\public\logo.png
set SHORTCUT_NAME=MedIA - Assistente Virtual.lnk

:: Cria o atalho usando VBScript temporario
set VBS_SCRIPT=%TEMP%\create_shortcut.vbs
echo Set oWS = CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\%SHORTCUT_NAME%" >> "%VBS_SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_SCRIPT%"
echo oLink.TargetPath = "%SCRIPT_PATH%" >> "%VBS_SCRIPT%"
echo oLink.WorkingDirectory = "%~dp0" >> "%VBS_SCRIPT%"
echo oLink.Description = "MedIA - Assistente Inteligente Arthromed + Medic" >> "%VBS_SCRIPT%"
echo oLink.Save >> "%VBS_SCRIPT%"

cscript /nologo "%VBS_SCRIPT%"
del "%VBS_SCRIPT%"

echo.
echo ==================================================
echo      CONFIGURACAO CONCLUIDA COM SUCESSO!
echo ==================================================
echo.
echo Um atalho chamado "MedIA - Assistente Virtual" foi criado 
echo na sua Area de Trabalho. 
echo.
echo AGORA BASTA CLICAR DUAS VEZES NO ATALHO PARA USAR!
echo.
pause
