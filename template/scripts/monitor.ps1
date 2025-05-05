# 🖥️ Script de monitoreo en vivo de procesos Node, MongoDB, Postgres, Grafana, Loki

# Bucle infinito para refrescar cada 5 segundos
while ($true) {
    Clear-Host

    # Procesos a monitorear
    $processes = 'node','mongod','postgres','grafana','loki'

    # Obtener procesos activos
    $targetProcs = Get-Process | Where-Object { $processes -contains $_.ProcessName }

    # Obtener memoria total del sistema de forma compatible
    try {
        $sysMemKB = (Get-WmiObject -Class Win32_OperatingSystem).TotalVisibleMemorySize
        if (-not $sysMemKB) { throw "No se pudo obtener la memoria del sistema." }
        $sysMem = $sysMemKB * 1KB
    }
    catch {
        Write-Host "⚠️ No se pudo obtener la memoria total del sistema."
        $sysMem = $null
    }

    # Calcular uso combinado de RAM
    $totalRAM = ($targetProcs | Measure-Object -Property WorkingSet -Sum).Sum
    $totalRAM_MB = [math]::Round($totalRAM / 1MB, 2)

    # Calcular % RAM solo si la total es válida
    if ($sysMem) {
        $ramPercent = [math]::Round(($totalRAM / $sysMem) * 100, 2)
    } else {
        $ramPercent = "N/A"
    }

    # Mostrar tabla de procesos monitorizados
    Write-Host "`n📦 Procesos monitorizados:"
    $targetProcs | Select-Object ProcessName, Id, CPU, @{Name='RAM_MB'; Expression = {[math]::Round($_.WorkingSet / 1MB, 2)}} | Format-Table

    # Mostrar resumen combinado
    Write-Host "`n📊 Uso combinado:"
    Write-Host "🔸 RAM total: $totalRAM_MB MB ($ramPercent%)"

    # Esperar 5 segundos antes de refrescar
    Start-Sleep -Seconds 5
}
