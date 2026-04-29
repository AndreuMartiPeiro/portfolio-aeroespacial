/**
 * projects.js — Base de datos de proyectos
 * Para añadir un nuevo proyecto, añade un objeto al array PROJECTS.
 */
const PROJECTS = [
  {
    id: "misil",
    title: "Diseño y Análisis de un Misil",
    subtitle: "Diseño CAD, propulsión y aerodinámica",
    description: "Proyecto integral: diseño en SolidWorks de un misil táctico, análisis termodinámico de su motor cohete, y simulación CFD de su aerodinámica.",
    tags: ["SolidWorks", "CFD", "Propulsión", "MATLAB"],
    image: "img/misil_hero.webp",
    status: "En progreso",
    date: "2026",
    sections: [
      {
        id: "diseno",
        title: "Diseño CAD",
        icon: "",
        software: ["SolidWorks 2024", "KeyShot"],
        summary: "Diseño 3D completo del misil: fuselaje, aletas, ojiva y compartimentos internos.",
        steps: [
          { title: "Investigación y referencias", description: "Estudio de geometrías de misiles existentes (AIM-9, AIM-120). Definición de requisitos: longitud ~3 m, diámetro ~150 mm.", image: "img/misil_ref.webp" },
          { title: "Diseño de la ojiva", description: "Ojiva tangente-ogival con relación L/D de 3:1 optimizada para baja resistencia aerodinámica supersónica. Perfil basado en Haack series.", image: "img/misil_ojiva.webp" },
          { title: "Fuselaje y compartimentos", description: "Cuerpo cilíndrico en Al 7075-T6 (espesor 2 mm). Compartimentos: guiado, carga útil y motor con uniones roscadas.", image: "img/misil_fuselaje.webp" },
          { title: "Aletas estabilizadoras", description: "4 aletas cruciformes con perfil doble cuña, ángulo de flecha 45°. Verificación de estabilidad estática (CP detrás de CG).", image: "img/misil_aletas.webp" },
          { title: "Ensamblaje y renderizado", description: "Integración paramétrica de componentes. Verificación de interferencias. Render fotorrealista en KeyShot.", image: "img/misil_render.webp" }
        ]
      },
      {
        id: "motor",
        title: "Análisis del Motor",
        icon: "",
        software: ["MATLAB R2024b", "CEA (NASA)", "Excel"],
        summary: "Análisis termodinámico de motor cohete de propelente sólido. Empuje, Isp y diseño de tobera.",
        steps: [
          { title: "Selección del propelente", description: "Composición AP/HTPB/Al (68/14/18). Isp teórico ~260 s. Estudio comparativo de propelentes sólidos.", image: "img/motor_propelente.webp" },
          { title: "Termodinámica de combustión", description: "Software CEA de NASA: T cámara ~3300 K, γ ≈ 1.17. Cálculo de propiedades de gases de combustión.", image: "img/motor_cea.webp" },
          { title: "Diseño de la tobera", description: "Tobera convergente-divergente De Laval. Garganta 25 mm, salida 45 mm. Contorno por método de características.", image: "img/motor_tobera.webp" },
          { title: "Curva de empuje", description: "Simulación MATLAB: empuje medio 2500 N, tiempo de combustión 4.5 s. Grano en geometría estrella de 5 puntas.", image: "img/motor_empuje.webp" },
          { title: "Integridad estructural", description: "Presión de cámara 6.5 MPa, casing AISI 4130 con FS=2.5. Aislamiento ablativo de sílice fenólica.", image: "img/motor_estructura.webp" }
        ]
      },
      {
        id: "aerodinamica",
        title: "Análisis Aerodinámico",
        icon: "",
        software: ["ANSYS Fluent 2024", "MATLAB", "Pointwise"],
        summary: "CFD del flujo externo a diferentes Mach. Coeficientes CD, CL, CM y visualización del campo de flujo.",
        steps: [
          { title: "Preparación de geometría", description: "Simplificación CAD para CFD. Dominio: cono de 20×10 diámetros. Exportación STEP.", image: "img/aero_geometria.webp" },
          { title: "Generación de malla", description: "Malla estructurada en Pointwise, y+≈1, ~4.2M celdas. Estudio de independencia de malla (3 niveles).", image: "img/aero_malla.webp" },
          { title: "Configuración del solver", description: "Solver density-based, modelo SST k-ω. Simulaciones a Mach 0.8, 1.2, 2.0 y 3.0.", image: "img/aero_solver.webp" },
          { title: "Campo de flujo", description: "Contornos de presión, temperatura y Mach. Ondas de choque oblicuas y expansión visibles en régimen supersónico.", image: "img/aero_contornos.webp" },
          { title: "Coeficientes aerodinámicos", description: "CD, CL, CM vs. α (0°-15°). CD=0.42 a Mach 2.0 α=0°. Concordancia del 8% con método de Barrowman.", image: "img/aero_coeficientes.webp" }
        ]
      },
      {
        id: "conclusiones",
        title: "Conclusiones",
        icon: "",
        software: [],
        summary: "Resumen de resultados, lecciones aprendidas y trabajo futuro.",
        steps: [
          { title: "Resultados principales", description: "Misil de 2.95 m, 85 kg, empuje 2500 N, Mach máx 2.8, alcance ~15 km. Estabilidad verificada (margen >1.5 calibres).", image: null },
          { title: "Lecciones aprendidas", description: "La integración multidisciplinar reveló acoplimientos importantes entre geometría, propulsión y aerodinámica. Experiencia adquirida en SolidWorks, ANSYS Fluent y CEA.", image: null },
          { title: "Trabajo futuro", description: "Extensiones: análisis FEA estructural, trayectoria 6-DOF en Simulink, optimización MDO, y estudio de firma radar (RCS).", image: null }
        ]
      }
    ]
  }
];
