@echo off
title ManaiDekhi Manager
echo Starting ManaiDekhi Scented Candles Manager...
echo.
echo Launching Flask Backend...
start "Flask Backend" cmd /c "python app.py"
echo.
echo Waiting for backend to initialize...
timeout /t 3 >nul
echo.
echo Opening Admin Dashboard and Main Website...
start http://127.0.0.1:5090/admin
start http://127.0.0.1:5090/
echo.
echo Manager started successfully! Keep this window open or the Flask console open.
pause
