# Préstamos Lab — 0902-23-2280

Aplicación para controlar el inventario y los préstamos del laboratorio universitario. Desarrollada con React, TypeScript, Vite y json-server.

## Variante asignada

- Carné terminado en **0**.
- Categorías: **Laptop, Proyector y Router**.
- Duración máxima: **3 días**.
- Regla adicional: un carné puede tener como máximo **un préstamo activo**.

La regla adicional se valida antes de guardar: se comparan los dígitos del carné y se rechaza el registro si ya existe un préstamo activo para ese carné. Al devolver el equipo, el préstamo deja de contar como activo y el usuario puede solicitar otro.

## Requisitos

- Node.js 20.19+ o 22.12+.
- npm.

## Instalación y ejecución

1. Instala las dependencias:

   ```powershell
   npm install
   ```

2. Crea `.env` a partir del ejemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

   La URL por defecto es `VITE_API_URL=http://localhost:3000`.

3. Abre una terminal en la carpeta del proyecto e inicia la API:

   ```powershell
   npm run api
   ```

   json-server lee y persiste los datos en `db.json`.

4. Abre una segunda terminal en la carpeta del proyecto e inicia el frontend:

   ```powershell
   npm run dev
   ```

5. Visita <http://localhost:5173>.

Para comprobar el proyecto antes de entregarlo:

```powershell
npm run build
npm run lint
```

## Estructura

```text
src/
  components/   Componentes de presentación y formulario
  hooks/        Hook useEquipos para cargar el inventario
  services/     Funciones tipadas para la API REST
  types/        Interfaces y tipos de Equipo y Prestamo
  App.tsx       Vistas, filtros y coordinación de acciones
db.json         Datos iniciales de json-server
```

## Capturas para el PDF

Guarda las imágenes en una carpeta `evidencias/` o insértalas directamente en el documento:

1. **Inventario:** navegador en la página principal, con las tarjetas y el contador visibles.
2. **Validación:** pulsa **Prestar equipo**, deja los campos vacíos y **Confirmar préstamo**; captura los mensajes junto a los campos.
3. **Préstamo vencido:** abre **Préstamos activos**. `db.json` trae una fila de demostración vencida para facilitar esta captura.
4. **Error de API:** deja Vite abierto, detén json-server con `Ctrl+C` en su terminal y pulsa **Reintentar** en la aplicación. Captura el error y el botón. Luego vuelve a iniciar la API y reintenta.
5. **Commits:** después de subir el repositorio a GitHub, abre la pestaña **Commits** y captura el historial con al menos seis commits visibles.

## Reflexiones

**¿Por qué no conviene usar el índice del arreglo como `key`?**  
Si se insertan, eliminan o reordenan elementos, el índice cambia y React puede asociar el estado de una fila con otro equipo. Un ID estable identifica cada elemento.

**¿Qué problema aparece al modificar directamente el arreglo del estado?**  
Se conserva la referencia anterior y React puede no detectar el cambio correctamente. Crear un arreglo nuevo permite una actualización predecible e inmutable.

**¿Qué ocurre si se omite el arreglo de dependencias en un `useEffect` que hace `fetch` y actualiza el estado?**  
El efecto se ejecuta después de cada renderizado. Como el `fetch` actualiza el estado y provoca otro render, puede iniciar solicitudes repetidas y generar un ciclo.

## Entrega

El PDF debe incluir portada con nombre, carné y variante; enlace al repositorio público; las capturas anteriores; las reflexiones; y una explicación breve de la regla adicional. El título de la aplicación y de la pestaña es **Préstamos Lab — 0902-23-2280**.
