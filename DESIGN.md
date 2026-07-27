---
name: 2 Free
description: Un registro financiero doméstico cálido, claro y bajo control de quien lo usa.
colors:
  paper: "#fffdf8"
  paper-deep: "#f9edde"
  ink: "#29231f"
  ink-muted: "#655b53"
  line: "#e6ded4"
  terracotta: "#b73322"
  terracotta-soft: "#f3ae9f"
  olive: "#617142"
  mint: "#b2c693"
  danger: "#a12d20"
typography:
  display:
    fontFamily: "Urbanist, Avenir Next, Segoe UI, sans-serif"
    fontSize: "clamp(2.55rem, 7vw, 5.4rem)"
    fontWeight: 750
    lineHeight: 0.94
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Urbanist, Avenir Next, Segoe UI, sans-serif"
    fontSize: "clamp(1.8rem, 5vw, 3.4rem)"
    fontWeight: 750
    lineHeight: 1
  body:
    fontFamily: "Open Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Urbanist, Avenir Next, Segoe UI, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.12em"
rounded:
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  pill: "999rem"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
  3xl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0.8rem 1.1rem"
    height: "3.125rem"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.25rem"
    height: "3.125rem"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "1.5rem"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 0.8rem"
    height: "2.8rem"
---

# Design System: 2 Free

## Overview

**Creative North Star: "The Household Ledger"**

2 Free se siente como un registro doméstico bien cuidado: cálido, tangible y sereno, pero lo bastante preciso para sostener decisiones financieras reales. La composición editorial da contexto antes de mostrar controles; los datos importantes tienen peso tipográfico y los detalles técnicos aparecen solo cuando ayudan a actuar.

La identidad evita tanto la frialdad bancaria como la decoración infantil. El color comunica estado, la profundidad separa niveles de trabajo y las formas suaves hacen que las tareas densas se sientan accesibles sin perder rigor.

**Key Characteristics:**

- Superficies de papel cálido con tinta oscura y contraste claro.
- Titulares editoriales amplios junto a texto funcional y legible.
- Terracota para acción y énfasis; oliva y menta para progreso y estabilidad.
- Controles táctiles redondeados y tarjetas suavemente elevadas.
- Densidad progresiva: primero comprensión, después detalle.

## Colors

La paleta combina materiales domésticos cálidos con señales financieras sobrias.

### Primary

- **Terracota de acción:** identifica acciones, enlaces destacados y énfasis editorial; su rareza conserva jerarquía.
- **Tinta de libro mayor:** sostiene texto principal, controles de máxima prioridad y superficies inversas.

### Secondary

- **Oliva estable:** representa avance, confirmación y estados saludables sin recurrir al verde bancario saturado.
- **Menta de apoyo:** crea fondos de estado, progreso y zonas de calma.

### Tertiary

- **Durazno de papel:** separa superficies y aporta calidez sin competir con los datos.
- **Terracota suave:** conserva la identidad en temas oscuros y estados de menor énfasis.

### Neutral

- **Papel claro:** lienzo principal de lectura.
- **Papel profundo:** fondo de secciones y contenedores secundarios.
- **Tinta atenuada:** texto explicativo y metadatos.
- **Línea cálida:** divisores estructurales de bajo contraste.

### Named Rules

**The Meaningful Color Rule.** El color siempre debe indicar acción, estado o agrupación; nunca sustituye una etiqueta ni se usa como relleno decorativo indiscriminado.

**The Warm Contrast Rule.** Las superficies claras mantienen el carácter de papel y las oscuras el de tinta; no se introducen grises azulados como base neutral.

## Typography

**Display Font:** Urbanist (con Avenir Next, Segoe UI y sans-serif como respaldo)  
**Body Font:** Open Sans (con Segoe UI, system-ui y sans-serif como respaldo)  
**Label/Mono Font:** SFMono-Regular, Consolas o Liberation Mono solo para datos técnicos y código.

**Character:** Urbanist aporta una voz editorial contemporánea y amable; Open Sans mantiene legibles las instrucciones, los formularios y las tablas. La diferencia entre ambas familias debe aclarar jerarquía, no crear ornamentación.

### Hierarchy

- **Display:** peso alto, escala fluida y altura compacta para una sola idea dominante por superficie.
- **Headline:** peso alto y ritmo cerrado para títulos de sección y cifras principales.
- **Title:** peso medio-alto para tarjetas, pasos y agrupaciones funcionales.
- **Body:** peso regular, interlineado cómodo y líneas de hasta 65–70 caracteres cuando sea posible.
- **Label:** peso alto, espaciado amplio y mayúsculas solo para índices, estados breves y encabezados editoriales.

### Named Rules

**The One Dominant Figure Rule.** Cada vista puede tener una cifra o un título de escala protagonista; el resto de la jerarquía debe apoyarlo, no competir con él.

## Layout

El contenido vive en un contenedor central de hasta 75rem con canaletas fluidas. Las superficies de producto usan una cuadrícula de doce columnas en escritorio y un flujo de una columna en pantallas compactas. El espacio sigue pasos de 0.25rem a 4rem, con mayor separación entre grupos que dentro de ellos.

En móvil, la navegación principal se adapta a una barra inferior segura y los flujos complejos pasan a hojas o diálogos enfocados. En escritorio, la navegación debe ocupar una sola zona coherente; no se apilan barras que repiten destinos o iconos. Los controles táctiles respetan al menos 44px en iOS y 48dp en Android.

## Elevation & Depth

El sistema combina capas tonales con sombras cálidas y difusas. Las superficies permanecen casi planas durante la lectura; la elevación aparece en tarjetas accionables, diálogos, navegación móvil y elementos flotantes.

### Shadow Vocabulary

- **Soft:** separación ligera para controles o tarjetas pequeñas.
- **Card:** profundidad estructural para grupos de trabajo y paneles.
- **Floating:** reserva para diálogos, hojas y navegación móvil.

### Named Rules

**The Earned Elevation Rule.** Una sombra indica interacción, superposición o jerarquía real; los contenedores puramente decorativos se separan con tono, espacio o borde.

## Shapes

Las esquinas son suaves y táctiles: radios pequeños para campos, medios para contenedores, grandes para tarjetas expresivas y píldoras para acciones compactas. Las formas circulares se reservan para iconos, indicadores o ilustraciones de marca. Los bordes son cálidos y sutiles; nunca forman una retícula pesada alrededor de cada dato.

## Components

### Buttons

- **Shape:** píldora táctil con altura mínima de 3.125rem.
- **Primary:** tinta sobre papel inverso; una acción principal por contexto.
- **Hover / Focus:** desplazamiento mínimo en web y anillo de foco visible con contraste suficiente; sin movimiento cuando se solicita reducción.
- **Secondary:** fondo transparente, borde de tinta y el mismo peso táctil que la acción primaria.

### Chips

- **Style:** fondos tonales suaves, texto de alto contraste y forma de píldora.
- **State:** el estado seleccionado cambia fondo, texto y atributo semántico; el color nunca actúa solo.

### Cards / Containers

- **Corner Style:** radios de 1.5rem a 2rem según escala.
- **Background:** papel claro, papel profundo o menta atenuada según función.
- **Shadow Strategy:** suave en reposo; flotante solo cuando la tarjeta se superpone al flujo.
- **Border:** línea cálida de bajo contraste cuando el tono no basta.
- **Internal Padding:** entre 1rem y 2rem, proporcional a la densidad.

### Inputs / Fields

- **Style:** fondo transparente o de papel, borde visible y radio pequeño.
- **Focus:** anillo terracota claramente separado del borde.
- **Error / Disabled:** mensaje textual junto al campo; el estado no depende solo de rojo u opacidad.

### Navigation

- **Style:** una sola arquitectura por tamaño. En escritorio, destinos legibles con estado activo de tinta; en móvil, barra inferior de cuatro o cinco destinos y zonas táctiles nativas. Las secciones secundarias aparecen bajo demanda o en una fila desplazable, nunca como duplicación permanente de la navegación principal.

## Do's and Don'ts

### Do:

- **Do** mostrar datos financieros con etiquetas, periodos y unidades que expliquen qué significan.
- **Do** abrir formularios complejos desde una acción explícita y dividirlos en pasos reversibles.
- **Do** usar espacio, tono y tipografía antes de añadir bordes o sombras.
- **Do** mantener texto, foco y objetivos táctiles accesibles en cada tamaño.

### Don't:

- **Don't** usar gráficas decorativas sin escala, periodo, valor o consecuencia comprensible.
- **Don't** repetir la misma navegación en cabecera, fila secundaria y barra inferior.
- **Don't** exponer configuración técnica en modos administrados por el producto.
- **Don't** presentar todos los campos de una tarea compleja abiertos de forma permanente.
