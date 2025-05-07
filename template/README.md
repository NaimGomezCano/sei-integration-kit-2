# Comandos

pnpm run build:release:test --deploy=true  
pnpm run deploy:service:test

Si el service da error revisa esto asi -- node app.js --env=test --deploy=true

sc stop "zzz_nssm_skintech_salesforce_integration78_test"

sc delete "zzz_nssm_skintech_salesforce_integration178_test"



# Infraestructura

## Loki 
Descargar Loki desde github
Crear carpeta C:\Loki, poner el ejecutable y agregarlo al path
.\loki.exe --config.file=loki-config.yaml

## Promtail
 promtail --config.file=promtail.yaml
## Grafana SSO






# Seidor REST API with Bun & Hono

Este repositorio es una plantilla base

Las entidades incluidas en esta integración son:

#### SAP B1 > ForceManager

- Familias
- Subfamilias
- Productos

#### ForceManager > SAP B1

- Ofertas

#### SAP B1 <> ForceManager

- Pedidos de ventas

## Index

- [Configuración]()
- [Ejecución]()
- [Gestión del Servicio]()
- [Referencias]()

## Configuración

Para configurar el proyecto para desarrollo, pruebas o producción, es necesario ejecutar los scripts de configuración respectivos.

**Desarollo**

```sh
bun setup:dev
bun import:dev
```

**Test**

```bash
bun setup:test
```

bun import:test

**Producción**

```bash
bun setup:prod
bun import:prod
```

## Ejecución

Para el desarrollo, el proyecto utiliza capacidades de recarga en caliente y depuración.

```sh
bun dev
```

Para iniciar la aplicación en modo de prueba, use el siguiente comando:

```sh
bun start:test
```

Para iniciar la aplicación en modo de producción, use el siguiente comando:

```sh
bun start:prod
```

## Gestión del Servicio

La gestión del servicio incluye instalar, eliminar, detener y editar el servicio. Los siguientes comandos ayudan a gestionar estas acciones. **Se requiere persmisos de administrador.**

### Instalar Servicio

```sh
# Instalar servicio en entorno de prueba

bun deploy-service:test

# Instalar servicio en entorno de producción

bun deploy-service:prod
```

### Eliminar Servicio

```sh
# Eliminar servicio del entorno de prueba

bun remove-service:test

# Eliminar servicio del entorno de producción

bun remove-service:prod
```

### Detener Servicio

```sh
# Detener servicio en entorno de prueba

bun stop-service:test

# Detener servicio en entorno de producción

bun stop-service:prod
```

### Editar Servicio

```sh
# Editar configuraciones del servicio para entorno de prueba (GUI)

bun edit-service:test

# Editar configuraciones del servicio para entorno de producción (GUI)

bun edit-service:prod
```

## Referencias
