@echo off
cd /d "%~dp0"
title MedIA - Sistema de Inteligencia
echo Limpando processos antigos... aguarde.

:: Mata processos que possam estar travando as portas ou widgets antigos
taskkill /f /im python.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3002') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3003') do taskkill /f /pid %%a >nul 2>&1

echo Iniciando o MedIA...
:: Inicia o servidor Web em segundo plano
cd web
start /b npm run dev -- --port 3002

:: Volta para a raiz e inicia o aplicativo Desktop
cd ..
echo Aguardando inicializacao do motor de inteligencia...
python desktop_app.py

pause
