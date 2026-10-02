# Contexto del Proyecto: Rekayu (Diseño Calma)

> Este archivo almacena el contexto completo del diseño, arquitectura y reglas de Rekayu para que cualquier interacción futura de IA mantenga total continuidad incluso tras cerrar y reabrir la terminal.

---

## 1. Visión y Propósito
**Rekayu** es la aplicación personal de organización y foco diario para su creador, diseñada específicamente para el perfil híbrido de **estudiante universitario y emprendedor**.
Su propósito es eliminar el ruido mental, permitiendo gestionar tareas críticas, entregas, exámenes, recordatorios rápidos e ideas/apuntes en una sola interfaz serena, limpia y sin fricción.

---

## 2. Sistema de Diseño e Identidad Visual (Estética Calma)
Inspirado fielmente en la maqueta **Calma · Tareas**:

### Tipografías
* **`Instrument Serif`** (Google Fonts): Utilizada para los títulos principales (ej. *«Hoy»*, *«Próximos»*, *«Hechas»*), el título editable del panel de detalle, los contadores de días en exámenes y los encabezados de estados vacíos.
* **`Instrument Sans`** (Google Fonts): Utilizada para el cuerpo de texto, etiquetas, controles interactivos, metadatos y botones.

### Paleta de Colores
| Token | Modo Claro | Modo Oscuro | Uso |
|---|---|---|---|
| `--bg` | `#F2F4F3` | `#121819` | Fondo general de la página (cálido descansado) |
| `--surface` | `#FFFFFF` | `#192123` | Tarjetas, paneles laterales, inputs y chips activos |
| `--ink` | `#1E2A2D` | `#E6ECEA` | Texto principal (tinta suave) |
| `--muted` | `#7C8B8F` | `#8C9B9E` | Textos secundarios, horas y bordes suaves |
| `--line` | `#E4E9E8` | `#263033` | Divisores y bordes sutiles |
| `--accent` | `#5F8F80` | `#7FB3A2` | Verde salvia (acciones principales, checks activos) |
| `--accent-soft`| `#E3EEEA` | `#1F302B` | Fondos de acento suave |
| `--warn` | `#B8707A` | `#D08A93` | Alertas, fechas críticas (<= 3 días) |

### Categorías por Defecto
* **Clase**: `#7E9CB8` (azul denim suave)
* **Exámenes**: `#B8707A` (terracota / rosa apagado)
* **Emprender**: `#C2A266` (bronce / ámbar cálido)
* **Personal**: `#8FAE8B` (verde salvia suave)

---

## 3. Arquitectura y Componentes Clave

```
src/
├── components/
│   ├── Header.tsx            # Cabecera con fecha en español, H1 Serif, switch de secciones y tema
│   ├── ViewTabs.tsx          # Pestañas con subrayado limpio (Hoy, Próximos, Hechas)
│   ├── CategoryFilter.tsx    # Chips deslizables tipo píldora con puntos de categoría
│   ├── ExamsBanner.tsx       # Fechas clave: tarjetas con contador de días en serif (color warn <= 3d)
│   ├── TaskList.tsx          # Lista con agrupación por fecha en Próximos y estados vacíos en serif
│   ├── TaskCard.tsx          # Fila de tarea con checkbox circular, título tachado y metadatos
│   ├── AddBar.tsx            # Barra inferior fija tipo píldora con degradado para añadir con Enter
│   ├── TaskDetailPanel.tsx   # Panel lateral de 480px (pantalla completa en móvil), edición directa
│   ├── ReminderDetailPanel.tsx # Panel lateral para detalles y notas de recordatorios
│   ├── PinnedTasksRail.tsx   # Barra lateral izquierda en escritorio para tareas fijadas (no afectada por scroll)
│   ├── RemindersSection.tsx  # Sección de recordatorios rápidos con badges de fecha/hora
│   ├── NotesSection.tsx      # Sección de notas y apuntes con soporte de fijado
│   ├── CategoryModal.tsx     # Modal para crear nuevas categorías con colores Calma
│   └── DataBackupModal.tsx   # Modal de copias de seguridad (Exportar/Importar JSON)
├── hooks/
│   ├── useDarkMode.ts        # Persistencia de tema claro/oscuro
│   ├── useTasks.ts           # Gestión de tareas con time, subtareas, enlaces y togglePinTask
│   ├── useCategories.ts      # Gestión de categorías
│   ├── useReminders.ts       # Gestión de recordatorios con updateReminder
│   └── useNotes.ts           # Gestión de notas
├── lib/
│   ├── storage.ts            # Capa única de persistencia en localStorage (preparada para Supabase)
│   └── dates.ts              # Utilidades de cálculo y formateo de fechas en español
└── types/
    └── index.ts              # Definiciones TypeScript de Task, Subtask, TaskLink, Category, Reminder, etc.
```

### Comportamiento de Scroll y Contenedores
* **Sin scroll general de página**: `html`, `body` y `#root` tienen `overflow: hidden` y `height: 100% / 100dvh`.
* **Encabezado y controles fijos**: Cabecera, pestañas y chips de categoría permanecen estáticos arriba (`flex-none`), siempre visibles y accesibles.
* **Scroll interno exclusivo**: Solo el contenedor de tareas/sección realiza scroll vertical (`overflow-y-auto no-scrollbar pb-32`), evitando saltos o dobles barras de scroll.
* **Tarjetas de tarea limpias**: Separadores inferiores rectos (`absolute bottom-0 h-[1px] bg-calma-line`), eliminando bordes superiores curvados. La selección tiene forma `rounded-2xl` completa con sombra suave sin cortes.
* **Tareas Fijadas (Pin)**: En pantallas grandes, las tareas fijadas se ubican en una barra lateral a la izquierda (`PinnedTasksRail.tsx`), fijas e independientes del scroll de la lista central. Cuando se abre el panel de detalles de una tarea o recordatorio, esta barra se oculta automáticamente para mantener el espacio visual despejado y equilibrado. En móvil, se sitúan destacadas en la cabecera del listado.
* **Recordatorios con panel interactivo**: Cada recordatorio muestra claramente su día y hora, y al pulsarlo se abre el panel lateral (`ReminderDetailPanel.tsx`) para editar su título, notas, fecha/hora y estado.


---

## 4. Reglas del Proyecto (Estrictas)
1. **Stack**: Vite + React + TypeScript + Tailwind. **No añadir librerías sin consultar y esperar confirmación del usuario**.
2. **Persistencia**: Todos los datos pasan **siempre** por `src/lib/storage.ts` (en el futuro se migrará a Supabase).
3. **Simplicidad**: Código simple, legible y directo; nada de sobreingeniería.
4. **Mobile-First con Modo Oscuro**: Toda vista debe ser completamente responsive y accesible en ambos temas.
5. **Planificación previa**: Antes de cambios grandes, presentar el plan al usuario y esperar su **OK**.
6. **Alcance acotado**: Modificar una función o componente por vez; no tocar archivos no relacionados.
7. **Explicación clara**: Explicar los errores de TypeScript en lenguaje accesible.

---

## 5. Próximos Pasos Planificados
* Migración de `src/lib/storage.ts` hacia backend Supabase con autenticación.
* Posibles integraciones en las tareas (Calendario, Google Drive, Notion).
