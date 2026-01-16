@echo off
echo ==========================================
echo   SETUP GITHUB - TENTATIVA FINAL
echo ==========================================

echo.
echo 1. Limpando configuracoes antigas...
rmdir /s /q .git

echo.
echo 2. Iniciando Git...
git init

echo.
echo 3. Configurando Autor (Necessario para o Git)...
git config user.email "admin@drogaria.com"
git config user.name "Drogaria Admin"

echo.
echo 4. Adicionando arquivos...
git add .

echo.
echo 5. Criando Commit (Salvando versao)...
git commit -m "Upload Inicial Drogaria App"

echo.
echo 6. Configurando Branch...
git branch -M main

echo.
echo 7. Conectando ao GitHub...
set /p REPO_URL="Cole a URL do repositorio (ex: https://github.com/usuario/repo.git): "

git remote add origin %REPO_URL%

echo.
echo 8. Enviando arquivos...
git push -u origin main --force

echo.
echo ==========================================
echo FIM DO PROCESSO
echo Se apareceu uma mensagem de sucesso ou pediu login, funcionou!
echo ==========================================
pause
