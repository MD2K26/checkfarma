@echo off
echo ==========================================
echo   CORRECAO DE PERMISSAO (Erro 403)
echo ==========================================

REM Caminho absoluto do Git
set GIT_CMD="C:\Program Files\Git\cmd\git.exe"

echo.
echo 1. Limpando senhas salvas do Windows (Deslogando)...
cmdkey /delete:git:https://github.com
cmdkey /delete:legacygeneric:target=git:https://github.com

echo.
echo 2. Resetando configuracao local...
%GIT_CMD% config --local --unset credential.helper
%GIT_CMD% config --global --unset credential.helper

echo.
echo 3. Preparando envio para MD2K26...
%GIT_CMD% remote remove origin
%GIT_CMD% remote add origin https://github.com/MD2K26/checkfarma.git

echo.
echo 4. TENTANDO ENVIAR AGORA...
echo ATENCAO: Uma janela de login deve abrir no navegador ou pedir senha aqui.
echo FACA O LOGIN COM A CONTA QUE TEM ACESSO AO REPOSITORIO MD2K26!
echo.
%GIT_CMD% push -u origin main --force

echo.
echo ==========================================
echo FIM
echo ==========================================
pause
