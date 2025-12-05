# 🌐 Cambiar Nombre e Icono en el Navegador

## ¿Qué cambió?

Ahora el nombre e icono que aparecen en el navegador se actualizan dinámicamente usando el **logo y nombre de la tienda** que configures en el panel de administración.

## 📍 Dónde se Actualiza

### En el Navegador Web
- **Título de la pestaña**: Muestra el nombre de la tienda
- **Favicon (icono)**: Muestra el logo de la tienda

### Ejemplo
```
Antes:  [🏠 localhost:8081]
Después: [🏪 Mi Tienda Online]
```

## ⚙️ Cómo Funciona

1. **Obtiene la configuración** del contexto `AppConfigContext`
2. **Actualiza el título** de la página con `config.storeName`
3. **Actualiza el favicon** con `config.storeLogo`
4. **Se actualiza automáticamente** cuando cambias la configuración en admin

## 🔧 Cómo Configurar

### Paso 1: Inicia sesión como Admin
- Abre la app
- Inicia sesión con una cuenta ADMIN

### Paso 2: Ve a Personalización
- Toca la pestaña "Perfil"
- Presiona "Personalización de la Tienda"

### Paso 3: Configura tu Tienda
- **Nombre de la tienda**: Ingresa el nombre que quieres mostrar
- **Logo**: Sube una imagen (se usará como favicon)
- **Modo de visualización**: Elige cómo mostrar el logo y nombre

### Paso 4: Guarda los Cambios
- Presiona "Guardar cambios"
- El navegador se actualizará automáticamente

## 📝 Archivos Modificados

- `frontend/app/_layout.tsx` - Ahora actualiza dinámicamente el título y favicon

## 💡 Notas Importantes

- El favicon se actualiza en tiempo real cuando cambias la configuración
- El título de la pestaña refleja el nombre de la tienda
- Los cambios se aplican inmediatamente en el navegador web
- En dispositivos móviles, el nombre aparece en la barra de estado

## 🎨 Recomendaciones

- **Logo**: Usa una imagen cuadrada (1:1) para mejor resultado como favicon
- **Nombre**: Mantén el nombre corto para que se vea bien en la pestaña
- **Tamaño**: Imágenes de 512x512px o menores funcionan mejor

## 🐛 Solución de Problemas

### El favicon no se actualiza
1. Limpia el caché del navegador (Ctrl+Shift+Delete)
2. Recarga la página (Ctrl+R o Cmd+R)
3. Verifica que el logo esté correctamente subido

### El título no cambia
1. Verifica que hayas guardado los cambios en admin
2. Recarga la página
3. Comprueba que el nombre de la tienda no esté vacío

## 🚀 Próximas Mejoras

- Agregar más opciones de personalización
- Permitir cambiar colores del navegador
- Agregar meta tags personalizados
