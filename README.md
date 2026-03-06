# AnimeDB - Otaku Discovery

AnimeDB es una aplicación web interactiva dedicada a los amantes del anime, creada por FeryaelJustice. Esta plataforma permite explorar y descubrir animes a través de rankings interactivos, recomendaciones inteligentes y análisis detallados.

## 🚀 Características Principales

- **Rankings Interactivos**: Explora los top 100 animes por popularidad, calificaciones y emisiones actuales.
- **Senpai AI**: Chatbot inteligente que proporciona recomendaciones personalizadas basadas en consultas de usuarios.
- **Análisis Técnico**: Genera informes detallados sobre animes, incluyendo estudios, géneros y estadísticas.
- **Búsqueda y Filtrado**: Encuentra animes rápidamente con el sistema de búsqueda integrado.
- **Interfaz Moderna**: Diseño con efectos neón, fondos borrosos y animaciones suaves.
- **Audio Integrado**: Reproducción de voz para las respuestas del chatbot.
- **Responsive**: Optimizado para dispositivos móviles y de escritorio.

## 🛠 Tecnologías Utilizadas

### Frontend
- **React 19**: Framework principal para la construcción de la interfaz de usuario.
- **Vite**: Herramienta de construcción rápida y eficiente para desarrollo moderno.
- **Tailwind CSS v4**: Framework de CSS utilitario para estilos rápidos y consistentes.
- **Lucide React**: Biblioteca de iconos SVG para una interfaz visual atractiva.

### APIs y Servicios
- **Jikan API**: API de MyAnimeList para obtener datos de animes, rankings y información detallada.
- **Web Speech API**: Para la síntesis de voz en las respuestas del chatbot.

### Herramientas de Desarrollo
- **ESLint**: Linting para mantener la calidad del código.
- **Autoprefixer**: Para compatibilidad automática de CSS en diferentes navegadores.
- **Vite Plugins**: Plugins de React para desarrollo y construcción.

## 📁 Estructura del Proyecto

```
web-animes-otaku/
├── public/
│   └── vite.svg          # Icono de la aplicación
├── src/
│   ├── App.jsx           # Componente principal de la aplicación
│   ├── index.css         # Estilos globales con Tailwind
│   └── main.jsx          # Punto de entrada de React
├── index.html            # HTML base
├── package.json          # Dependencias y scripts
├── vite.config.js        # Configuración de Vite
├── eslint.config.js      # Configuración de ESLint
└── README.md             # Este archivo
```

## 🔧 Instalación y Configuración

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/FeryaelJustice/anime-db-otaku.git
   cd anime-db-otaku
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Construye para producción**:
   ```bash
   npm run build
   ```

5. **Vista previa de la build**:
   ```bash
   npm run preview
   ```

## 🎯 Cómo Funciona

### Arquitectura General
La aplicación sigue una arquitectura de componente único en React, con estado gestionado mediante hooks nativos. Los datos se obtienen de la API de Jikan (MyAnimeList) y se almacenan localmente en el estado de la aplicación.

### Secciones Principales

#### 1. Header
- Título principal "ANIMEDB" con efectos visuales.
- Descripción del proyecto y autor.
- Indicador de versión "Otaku Discovery v8.0".

#### 2. Senpai AI (Chatbot)
- **Funcionalidad**: Permite a los usuarios hacer consultas sobre animes.
- **Cómo funciona**: Envía la consulta a la API de Jikan, filtra resultados por puntuación y devuelve recomendaciones.
- **Características**: Soporte para audio (lectura de respuestas), formato de texto enriquecido.
- **Límite**: Máximo 3 resultados por consulta para evitar sobrecarga.

#### 3. Navegación por Categorías
- **Pestañas disponibles**:
  - **Popularidad**: Animes ordenados por popularidad.
  - **Top Ratings**: Animes con mejores calificaciones.
  - **En Emisión**: Animes actualmente en emisión.
- **Navegación**: Sticky header que permanece visible al hacer scroll.

#### 4. Grid de Animes
- **Visualización**: Tarjetas con imagen, título, géneros, sinopsis y puntuación.
- **Interacciones**:
  - **Análisis Pro**: Genera un informe técnico simulado del anime.
  - **Enlace externo**: Redirige a la página de MyAnimeList.
- **Paginación**: Carga más contenido al hacer clic en "Cargar Más" (hasta 4 páginas).

#### 5. Sistema de Búsqueda
- **Filtro rápido**: Busca en tiempo real dentro de la categoría activa.
- **Case insensitive**: No distingue mayúsculas/minúsculas.

#### 6. Footer
- Información de copyright con año dinámico.
- Branding "OTAKU SYSTEM • FeryaelJustice".

### Gestión de Estado
- **Estados principales**: `animeData` (datos por categoría), `pages` (paginación), `activeTab` (pestaña activa).
- **Estados del chat**: `chatInput`, `chatResponse`, `isChatting`.
- **Estados de análisis**: `analysisTarget`, `analysisText`, `isAnalyzing`.
- **Estados de UI**: `loading`, `error`, `showScrollTop`.

### API Integration
- **Endpoint principal**: `https://api.jikan.moe/v4/top/anime`
- **Parámetros**: `filter` (categoría), `page` (paginación).
- **Manejo de errores**: Reintentos automáticos para rate limits, mensajes de error amigables.
- **Rate limiting**: Implementa backoff exponencial para evitar bloqueos.

### Características Técnicas
- **Lazy loading**: Imágenes cargadas de forma diferida para mejor rendimiento.
- **Responsive design**: Adaptable a diferentes tamaños de pantalla.
- **Animaciones**: Transiciones suaves con CSS y efectos hover.
- **Accesibilidad**: Navegación por teclado, contraste adecuado.
- **Performance**: Optimización con Vite, tree-shaking automático.

## 🎨 Diseño y UX

- **Tema**: Oscuro con acentos en rosa y azul neón.
- **Tipografía**: Sans-serif moderna con énfasis en negritas.
- **Efectos visuales**: Fondos borrosos, sombras, gradientes.
- **Interactividad**: Animaciones al hover, escalado, rotación de iconos.

## 🤝 Contribución

Este proyecto es mantenido por FeryaelJustice. Para contribuciones:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

© 2025 OTAKU SYSTEM • FeryaelJustice. Todos los derechos reservados.

## 🙏 Agradecimientos

- **Jikan API**: Por proporcionar acceso gratuito a datos de MyAnimeList.
- **MyAnimeList**: Base de datos principal de animes.
- **Comunidad Otaku**: Inspiración para crear esta herramienta.

---

*Desarrollado con ❤️ para la comunidad anime*
