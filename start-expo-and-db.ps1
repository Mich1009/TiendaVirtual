Param()
$ErrorActionPreference = "Stop"

if (Get-Command docker -ErrorAction SilentlyContinue) {
  Write-Host "==> Levantando Postgres con Docker Compose..."
  docker compose -f ./infra/docker-compose.yml up -d

  Write-Host "==> Esperando a que Postgres esté saludable..."
  $max = 30
  $status = "starting"
  for ($i=0; $i -lt $max; $i++) {
    try {
      $status = docker inspect -f '{{.State.Health.Status}}' tienda_virtual_postgres
    } catch {
      $status = "starting"
    }
    if ($status -eq 'healthy') {
      Write-Host "Postgres saludable."
      break
    }
    Start-Sleep -Seconds 2
  }
  if ($status -ne 'healthy') {
    Write-Warning "Postgres no reportó estado saludable; continúo de todos modos..."
  }
} else {
  Write-Warning "Docker CLI no encontrado en el sistema. Saltando el arranque de Postgres en contenedor. Asegúrate de tener Postgres local en puerto 5432 o instala Docker Desktop."
}

Write-Host "==> Configurando variables de entorno de desarrollo..."
$env:DATABASE_URL = "postgres://postgres:admin1009@localhost:5432/tiendavirtual"
$env:EXPO_PUBLIC_API_URL = "http://localhost:4000/v1"

Write-Host "==> Ejecutando migraciones y semillas de la API..."
npm run migrate --prefix ./backend/api
npm run seed --prefix ./backend/api

Write-Host "==> Iniciando API en segundo plano..."
Start-Job -Name "api-dev" -ScriptBlock {
  Param($dir)
  Set-Location $dir
  npm run dev
} -ArgumentList (Join-Path $PSScriptRoot "backend/api") | Out-Null

Write-Host "==> Iniciando Expo Go..."
Set-Location (Join-Path $PSScriptRoot "frontend")
Write-Host "==> Instalando dependencias de mobile (puede tardar)..."
npm install
Write-Host "==> Iniciando Expo Go..."
npm start
