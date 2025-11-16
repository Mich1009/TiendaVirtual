# Script para iniciar Backend y Frontend secuencialmente
# El backend se inicia primero y cuando está listo, se inicia el frontend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Iniciando Tienda Virtual" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar si el backend está listo
function Test-BackendReady {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000/v1/products" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Iniciar el backend en segundo plano
Write-Host "[1/3] Iniciando Backend..." -ForegroundColor Yellow
Write-Host ""

$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend/api
    npm run dev
}

# Esperar a que el backend esté listo
Write-Host "[2/3] Esperando a que el backend esté listo..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$backendReady = $false

while ($attempt -lt $maxAttempts -and -not $backendReady) {
    Start-Sleep -Seconds 1
    $attempt++
    
    if (Test-BackendReady) {
        $backendReady = $true
        Write-Host ""
        Write-Host "✓ Backend listo en http://localhost:4000" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $backendReady) {
    Write-Host ""
    Write-Host "✗ Error: El backend no respondió después de 30 segundos" -ForegroundColor Red
    Write-Host "  Verifica que PostgreSQL esté corriendo y que el puerto 4000 esté libre" -ForegroundColor Yellow
    Stop-Job $backendJob
    Remove-Job $backendJob
    exit 1
}

# Iniciar el frontend
Write-Host "[3/3] Iniciando Frontend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✓ Backend corriendo" -ForegroundColor Green
Write-Host "  → Iniciando Expo..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Cambiar al directorio frontend e iniciar
Set-Location frontend

# Iniciar frontend (esto bloqueará hasta que se cierre)
try {
    npm start
} finally {
    # Cuando se cierre el frontend, detener el backend
    Write-Host ""
    Write-Host "Deteniendo backend..." -ForegroundColor Yellow
    Stop-Job $backendJob
    Remove-Job $backendJob
    Write-Host "✓ Aplicación detenida" -ForegroundColor Green
}
