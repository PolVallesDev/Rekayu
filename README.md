# Rekayu · Calma y Foco

Rekayu es una aplicación web diseñada y pensada especialmente para satisfacer las necesidades personales de su creador, y de todas aquellas personas estudiantes y emprendedoras (especialmente aquellas que son ambas cosas a la vez, como es el caso del creador de esta web). 

Como bien se sabe, los jóvenes estudiantes y emprendedores tienen diversas tareas, entregas y exámenes que recordar, además de ideas, proyectos y notas que deben apuntar de forma simple y rápida para no olvidarse. Rekayu soluciona esos detalles centralizándolo todo en un único espacio sereno, limpio y sin distracciones.

---

## 🌿 Experiencia Visual: Calma
Rekayu adopta un sistema visual basado en la maqueta **Calma**:
* **Tipografía editorial**: Encabezados y contadores en *Instrument Serif*; interfaz y controles en *Instrument Sans*.
* **Paleta descansada**: Fondo piedra suave (`#F2F4F3`), tinta profunda (`#1E2A2D`) y toques de verde salvia (`#5F8F80`).
* **Modo Oscuro completo**: Conmutación instantánea a tonos oscuros (`#121819`) sin fatiga visual.
* **Flujo natural**:
  * **Barra inferior rápida**: Añade tareas al instante con `Enter`.
  * **Fechas clave / Exámenes**: Cuenta regresiva en días con alerta visual para entregas urgentes (<= 3 días).
  * **Panel de detalle lateral**: Edición en vivo de títulos, notas, subtareas interactivas y enlaces con vista previa de dominio.
  * **Secciones complementarias**: Acceso fluido a *Recordatorios rápidos* y *Notas & Anotaciones*.

---

## 🛠️ Tecnologías
* **Frontend**: React 18 + TypeScript + Vite.
* **Estilos**: Tailwind CSS + CSS Custom Properties.
* **Iconografía**: Lucide React.
* **Persistencia**: Capa unificada en `src/lib/storage.ts` con respaldo y restauración JSON (preparado para futura migración a Supabase).

---

## 🚀 Puesta en Marcha

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## 📌 Contexto y Memoria para Asistentes AI
Para consultar la arquitectura técnica completa, tokens de diseño y reglas de desarrollo del proyecto, consulta [CONTEXT.md](CONTEXT.md) y [AGENTS.md](AGENTS.md).

---

#### Contacto
* Email: [polvallesss@gmail.com](mailto:polvallesss@gmail.com)