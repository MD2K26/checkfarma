@echo off
echo ==========================================
echo   UPLOAD PARA NOVO REPO (MD2K26)
echo ==========================================

REM Definindo o caminho do Git manualmente
set GIT_CMD="C:\Program Files\Git\cmd\git.exe"

echo Usando Git em: %GIT_CMD%

echo.
echo 1. Resetando configuracoes antigas...
rmdir /s /q .git

echo.
echo 2. Iniciando novo repositorio...
%GIT_CMD% init

echo.
echo 3. Configurando Usuario...
%GIT_CMD% config user.email "admin@drogaria.com"
%GIT_CMD% config user.name "Drogaria Admin"

echo.
echo 4. Adicionando arquivos (Isso inclui as correcoes)...
%GIT_CMD% add .

echo.
echo 5. Salvando Versao (Commit)...
%GIT_CMD% commit -m "Migracao para MD2K26 com Correcoes"

echo.
echo 6. Configurando Conexao com MD2K26...
%GIT_CMD% branch -M main
%GIT_CMD% remote add origin https://github.com/MD2K26/checkfarma.git

echo.
echo 7. ENVIANDO AGORA...
%GIT_CMD% push -u origin main --force

echo.
echo ==========================================
echo CONCLUIDO!
echo Se pedir senha, use suas credenciais do GitHub.
echo ==========================================
pause
