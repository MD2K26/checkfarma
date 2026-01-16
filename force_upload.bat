@echo off
echo ==========================================
echo   FORCAR UPLOAD - TENTATIVA NUCLEAR
echo ==========================================

echo.
echo 1. Removendo pasta .git antiga (Resetando tudo)...
rmdir /s /q .git

echo.
echo 2. Iniciando Git zero...
git init

echo.
echo 3. Configurando Usuario...
git config user.email "admin@drogaria.com"
git config user.name "Drogaria Admin"

echo.
echo 4. Adicionando arquivos...
git add .

echo.
echo 5. Fazendo Commit...
git commit -m "Upload Final e Completo"

echo.
echo 6. Configurando Repositorio...
git branch -M main
git remote add origin https://github.com/Luizob32/Check-Famra.git

echo.
echo 7. ENVIANDO AGORA...
git push -u origin main --force

echo.
echo ==========================================
echo FIM (Se pedir senha/login, faca no navegador)
echo ==========================================
pause
