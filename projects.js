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
    image: "img/misil_hero.png",
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
          { title: "Investigación y referencias", description: "Estudio de geometrías de misiles existentes (AIM-9, AIM-120). Definición de requisitos: longitud ~3 m, diámetro ~150 mm.", image: "img/misil_ref.png" },
          { title: "Diseño de la ojiva", description: "Ojiva tangente-ogival con relación L/D de 3:1 optimizada para baja resistencia aerodinámica supersónica. Perfil basado en Haack series.", image: "img/misil_ojiva.png" },
          { title: "Fuselaje y compartimentos", description: "Cuerpo cilíndrico en Al 7075-T6 (espesor 2 mm). Compartimentos: guiado, carga útil y motor con uniones roscadas.", image: "img/misil_fuselaje.png" },
          { title: "Aletas estabilizadoras", description: "4 aletas cruciformes con perfil doble cuña, ángulo de flecha 45°. Verificación de estabilidad estática (CP detrás de CG).", image: "img/misil_aletas.png" },
          { title: "Ensamblaje y renderizado", description: "Integración paramétrica de componentes. Verificación de interferencias. Render fotorrealista en KeyShot.", image: "img/misil_render.png" }
        ]
      },
      {
        id: "motor",
        title: "Análisis del Motor",
        icon: "",
        software: ["GasTurb 15", "MATLAB R2024b", "Excel"],
        summary: "Análisis termodinámico del turbofán Williams F107-WR-402. Estudio de punto de diseño, paramétrico y off-design.",
        steps: [
          {
            title: "Datos de Partida",
            description: "Condiciones ambientales y diseño termodinámico inicial para simular el motor (Williams F107-WR-402) en GasTurb.",
            contentHTML: `<div class="table-responsive">
              <table>
                <thead><tr><th>Property</th><th>Unit</th><th>Value</th><th>Fuente</th></tr></thead>
                <tbody>
                  <tr class="table-group-header"><td colspan="4">Basic Data</td></tr>
                  <tr><td>Intake Pressure Ratio</td><td>—</td><td>0.97</td><td>Estimado (inlet anular, vuelo subsónico)</td></tr>
                  <tr><td>No (0) or Average (1) Core dP/P</td><td>—</td><td>0</td><td>Estándar para este tipo</td></tr>
                  <tr><td>Inner Fan Pressure Ratio</td><td>—</td><td>2.30</td><td>Estimado (fan 2 etapas + booster 2 etapas, 4 etapas LP total → OPR=13.8)</td></tr>
                  <tr><td>Booster Map Type (0/1/2)</td><td>—</td><td>0</td><td>Off-design, estándar</td></tr>
                  <tr><td>Outer Fan Pressure Ratio</td><td>—</td><td>2.30</td><td>Igual al inner (fan sin dividir en GasTurb, BPR=1)</td></tr>
                  <tr><td>Compr. Interduct Press. Ratio</td><td>—</td><td>0.99</td><td>Estimado (pérdidas mínimas)</td></tr>
                  <tr><td>HP Compressor Pressure Ratio</td><td>—</td><td>6.06</td><td>Estimado → OPR total ≈ 13.8 (OFICIAL)</td></tr>
                  <tr><td>Bypass Duct Pressure Ratio</td><td>—</td><td>0.99</td><td>Estimado (ducto corto, motor compacto)</td></tr>
                  <tr><td>Turb. Interd. Ref. Press. Ratio</td><td>—</td><td>0.99</td><td>Estimado estándar</td></tr>
                  <tr><td>Design Bypass Ratio</td><td>—</td><td>1.0</td><td>OFICIAL</td></tr>
                  <tr><td>Burner Exit Temperature</td><td>K</td><td>1227</td><td>OFICIAL (954°C = 1227 K)</td></tr>
                  <tr><td>Burner Design Efficiency</td><td>—</td><td>0.99</td><td>Estimado estándar</td></tr>
                  <tr><td>Burner Partload Constant</td><td>—</td><td>1.5</td><td>Estimado, off-design only</td></tr>
                  <tr><td>Fuel Heating Value</td><td>MJ/kg</td><td>43.5</td><td>JP-10 / high-density fuel del Tomahawk</td></tr>
                  <tr><td>Overboard Bleed</td><td>kg/s</td><td>0.0</td><td>Motor de misil, sin sangrado externo</td></tr>
                  <tr><td>Power Offtake</td><td>kW</td><td>0.5</td><td>Mínimo (solo alternador del gearbox)</td></tr>
                  <tr><td>HP Spool Mechanical Efficiency</td><td>—</td><td>0.995</td><td>Estimado estándar small engine</td></tr>
                  <tr><td>LP Spool Mechanical Efficiency</td><td>—</td><td>0.995</td><td>Estimado estándar small engine</td></tr>
                  <tr><td>Burner Pressure Ratio</td><td>—</td><td>0.96</td><td>Estimado (combustor anular compacto, 4% pérdida)</td></tr>
                  <tr><td>Turbine Exit Duct Press Ratio</td><td>—</td><td>0.99</td><td>Estimado</td></tr>
                  <tr><td>Hot Stream Mixer Press Ratio</td><td>—</td><td>0.99</td><td>Estimado</td></tr>
                  <tr><td>Cold Stream Mixer Press Ratio</td><td>—</td><td>0.99</td><td>Estimado</td></tr>
                  <tr><td>Mixed Stream Pressure Ratio</td><td>—</td><td>0.99</td><td>Estimado (motor compacto, ducto corto post-mixer)</td></tr>
                  <tr><td>Mixer Efficiency</td><td>—</td><td>0.95</td><td>Estimado estándar mixed exhaust</td></tr>
                  <tr><td>Design Mixer Mach Number</td><td>—</td><td>0</td><td>Estimado</td></tr>
                  <tr><td>Design Mixer Area</td><td>m²</td><td>0.4</td><td>Estimado para empuje de 2.67 kN</td></tr>
                  <tr class="table-group-header"><td colspan="4">Secondary Air System</td></tr>
                  <tr><td>Booster(0) or HPC(1) Handl.Bleed</td><td>—</td><td>0</td><td>LPC (booster)</td></tr>
                  <tr><td>Rel. Handling Bleed to Bypass</td><td>—</td><td>0.0</td><td>Sin handling bleed</td></tr>
                  <tr><td>Rel. Enthalpy of HP Handl.Bleed</td><td>—</td><td>0.5</td><td>Estándar</td></tr>
                  <tr><td>Rel. HP Leakage to Bypass</td><td>—</td><td>0.005</td><td>Fugas mínimas estimadas</td></tr>
                  <tr><td>Rel. Overboard Bleed W_Bld/W25</td><td>—</td><td>0.0</td><td>Sin sangrado</td></tr>
                  <tr><td>Rel. Enthalpy of Overb. Bleed</td><td>—</td><td>0.5</td><td>Estándar</td></tr>
                  <tr><td>Recirculating Bleed W_reci/W25</td><td>—</td><td>0.0</td><td>Off-design only, sin recirculación</td></tr>
                  <tr><td>Rel. Enthalpy of Recirc Bleed</td><td>—</td><td>0.5</td><td>Estándar</td></tr>
                  <tr><td>Number of HP Turbine Stages</td><td>—</td><td>1</td><td>OFICIAL</td></tr>
                  <tr><td>HPT NGV 1 Cooling Air / W25</td><td>—</td><td>0.0</td><td>OFICIAL (turbina uncooled)</td></tr>
                  <tr><td>HPT Rotor 1 Cooling Air / W25</td><td>—</td><td>0.0</td><td>OFICIAL (turbina uncooled)</td></tr>
                  <tr><td>HPT Cooling Air Pumping Dia</td><td>m</td><td>0.08</td><td>Estimado geométrico</td></tr>
                  <tr><td>Number of LP Turbine Stages</td><td>—</td><td>2</td><td>OFICIAL</td></tr>
                  <tr><td>LPT NGV 1 Cooling Air / W25</td><td>—</td><td>0.0</td><td>Sin refrigeración</td></tr>
                  <tr><td>LPT Rotor 1 Cooling Air / W25</td><td>—</td><td>0.0</td><td>Sin refrigeración</td></tr>
                  <tr><td>Rel. Enth. LPT NGV Cooling Air</td><td>—</td><td>0.5</td><td>Estándar</td></tr>
                  <tr><td>Rel. Enth. of LPT Cooling Air</td><td>—</td><td>0.5</td><td>Estándar</td></tr>
                  <tr><td>Rel. HP Leakage to LPT exit</td><td>—</td><td>0.003</td><td>Fugas mínimas estimadas</td></tr>
                  <tr><td>Rel. Fan Overb. Bleed W_Bld/W13</td><td>—</td><td>0.0</td><td>Sin sangrado de fan</td></tr>
                  <tr><td>Core-Byp Heat Transf Effectiven</td><td>—</td><td>0.0</td><td>Sin transferencia de calor</td></tr>
                  <tr><td>Coolg Air Cooling Effectiveness</td><td>—</td><td>0.7</td><td>Estándar (aunque no hay cooling)</td></tr>
                  <tr><td>Bleed Air Cooling Effectiveness</td><td>—</td><td>0.7</td><td>Estándar</td></tr>
                  <tr class="table-group-header"><td colspan="4">Ambient Conditions</td></tr>
                  <tr><td>Total Temperature T1</td><td>K</td><td>291.5</td><td>Mach 0.72 a baja altitud</td></tr>
                  <tr><td>Total Pressure P1</td><td>kPa</td><td>116.5</td><td>Mach 0.72 a baja altitud</td></tr>
                  <tr><td>Ambient Pressure Pamb</td><td>kPa</td><td>101.0</td><td>Mach 0.72 a baja altitud</td></tr>
                  <tr><td>Relative Humidity [%]</td><td>—</td><td>0</td><td>Mach 0.72 a baja altitud</td></tr>
                  <tr class="table-group-header"><td colspan="4">Mass Flow</td></tr>
                  <tr><td>Inlet Corr. Flow W2Rstd</td><td>kg/s</td><td>8.0</td><td>Estimado para empuje ~2.9 kN con BPR=1</td></tr>
                  <tr class="table-group-header"><td colspan="4">LPC / Fan Design</td></tr>
                  <tr><td>Nominal LP Spool Speed</td><td>RPM</td><td>35500</td><td>OFICIAL</td></tr>
                  <tr class="table-group-header"><td colspan="4">LPC / Fan Efficiencies</td></tr>
                  <tr><td>Inner LPC Isentr. Efficiency</td><td>—</td><td>0.84</td><td>Estimado (4 etapas axiales LP, ajustado)</td></tr>
                  <tr><td>Outer LPC Isentr. Efficiency</td><td>—</td><td>0.88</td><td>Estimado</td></tr>
                  <tr class="table-group-header"><td colspan="4">HPC Efficiency</td></tr>
                  <tr><td>Isentr. HPC Efficiency</td><td>—</td><td>0.82</td><td>Estimado (compresor centrífugo, ajustado)</td></tr>
                  <tr class="table-group-header"><td colspan="4">HPC Design</td></tr>
                  <tr><td>Nominal HP Spool Speed</td><td>RPM</td><td>60000</td><td>Estimado (centrífugo pequeño, RPM alta típica)</td></tr>
                  <tr class="table-group-header"><td colspan="4">Nozzle</td></tr>
                  <tr><td>Nozzle Thrust Coefficient</td><td>—</td><td>0.985</td><td>Estimado estándar tobera convergente</td></tr>
                  <tr><td>Design Nozzle Petal Angle [deg]</td><td>—</td><td>12</td><td>Estimado estándar</td></tr>
                  <tr class="table-group-header"><td colspan="4">Turbine Efficiencies</td></tr>
                  <tr><td>Isentr. HPT Efficiency</td><td>—</td><td>0.87</td><td>Estimado (1 etapa axial uncooled, ajustado)</td></tr>
                  <tr><td>Isentr. LPT Efficiency</td><td>—</td><td>0.89</td><td>Estimado (2 etapas axiales, ajustado)</td></tr>
                </tbody>
              </table>
            </div>`
          },
          {
            title: "Resultados del Punto de Diseño",
            description: "Resultados numéricos de la simulación del punto de diseño en crucero a Mach 0.72. Se detalla el rendimiento general (Overall Performance), eficiencia de componentes y propiedades termodinámicas por estaciones.",
            contentHTML: `<h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">Overall Performance</h4>
<div class="table-responsive">
  <table>
    <thead><tr><th>Parameter</th><th>Value</th><th>Unit</th></tr></thead>
    <tbody>
      <tr><td>Net Thrust (FN)</td><td>2.90</td><td>kN</td></tr>
      <tr><td>Thrust Specific Fuel Consumption (TSFC)</td><td>22.8266</td><td>g/(kN*s)</td></tr>
      <tr><td>Fuel Flow (WF Burner)</td><td>0.06628</td><td>kg/s</td></tr>
      <tr><td>Bypass Ratio (BPR)</td><td>1.0000</td><td>-</td></tr>
      <tr><td>Core Efficiency</td><td>0.3750</td><td>-</td></tr>
      <tr><td>Propulsive Efficiency</td><td>0.4859</td><td>-</td></tr>
      <tr><td>Overall Pressure Ratio (P3/P2)</td><td>14.225</td><td>-</td></tr>
      <tr><td>Nozzle Area (A8)</td><td>0.02619</td><td>m²</td></tr>
      <tr><td>Nozzle Pressure Ratio (P8/Pamb)</td><td>2.11119</td><td>-</td></tr>
      <tr><td>Power Offtake (PWX)</td><td>0.5</td><td>kW</td></tr>
    </tbody>
  </table>
</div>
<h4 style="margin-bottom: 0.5rem; margin-top: 1.5rem; color: var(--text-primary);">Component Efficiencies</h4>
<div class="table-responsive">
  <table>
    <thead><tr><th>Component</th><th>Isentropic</th><th>Polytropic</th><th>Pressure Ratio (P/P)</th></tr></thead>
    <tbody>
      <tr><td>Outer LPC</td><td>0.8600</td><td>0.8753</td><td>2.300</td></tr>
      <tr><td>Inner LPC</td><td>0.8600</td><td>0.8753</td><td>2.300</td></tr>
      <tr><td>HP Compressor</td><td>0.8200</td><td>0.8576</td><td>6.060</td></tr>
      <tr><td>Burner</td><td>0.9900</td><td>-</td><td>0.960</td></tr>
      <tr><td>HP Turbine</td><td>0.8700</td><td>0.8526</td><td>3.235</td></tr>
      <tr><td>LP Turbine</td><td>0.8900</td><td>0.8793</td><td>2.274</td></tr>
      <tr><td>Mixer</td><td>0.9700</td><td>-</td><td>-</td></tr>
    </tbody>
  </table>
</div>
<h4 style="margin-bottom: 0.5rem; margin-top: 1.5rem; color: var(--text-primary);">Station Properties</h4>
<div class="table-responsive">
  <table>
    <thead><tr><th>Station</th><th>Mass Flow (kg/s)</th><th>Total Temp (K)</th><th>Total Press (kPa)</th><th>Velocity (m/s)</th><th>Mach Number</th><th>Area (m²)</th></tr></thead>
    <tbody>
      <tr><td>St 2 (Fan Inlet)</td><td>8.871</td><td>291.50</td><td>113.00</td><td>167.01</td><td>0.500</td><td>0.0444</td></tr>
      <tr><td>St 21 (Fan Exit Inner)</td><td>4.435</td><td>382.28</td><td>267.95</td><td>191.07</td><td>0.500</td><td>0.0107</td></tr>
      <tr><td>St 13 (Fan Exit Outer)</td><td>4.435</td><td>382.28</td><td>251.87</td><td>154.16</td><td>0.400</td><td>0.0136</td></tr>
      <tr><td>St 3 (HPC Exit)</td><td>4.435</td><td>684.54</td><td>1607.54</td><td>103.26</td><td>0.200</td><td>0.0054</td></tr>
      <tr><td>St 4 (Burner Exit)</td><td>4.466</td><td>1227.00</td><td>1543.24</td><td>202.62</td><td>0.300</td><td>0.0053</td></tr>
      <tr><td>St 44 (HPT Exit)</td><td>4.466</td><td>962.68</td><td>477.08</td><td>268.58</td><td>0.450</td><td>0.0106</td></tr>
      <tr><td>St 5 (LPT Exit)</td><td>4.466</td><td>802.94</td><td>207.67</td><td>272.79</td><td>0.500</td><td>0.0205</td></tr>
      <tr><td>St 6 (Mixer Core In)</td><td>4.479</td><td>802.61</td><td>205.60</td><td>120.30</td><td>0.217</td><td>0.0427</td></tr>
      <tr><td>St 16 (Mixer Byp In)</td><td>4.458</td><td>383.82</td><td>249.35</td><td>108.97</td><td>0.280</td><td>0.0188</td></tr>
      <tr><td>St 64 (Mixer Exit)</td><td>8.937</td><td>600.51</td><td>215.38</td><td>193.76</td><td>0.404</td><td>0.0400</td></tr>
      <tr><td>St 8 (Nozzle Throat)</td><td>8.937</td><td>600.51</td><td>213.23</td><td>447.58</td><td>1.000</td><td>0.0256</td></tr>
    </tbody>
  </table>
</div>`
          },
          {
            title: "Estudio Paramétrico — Design Point",
            description: "Análisis paramétrico del punto de diseño. Se han variado la Burner Exit Temperature (1062–1500 K) y el HP Compressor Pressure Ratio (4–10) para estudiar su efecto sobre el consumo específico (TSFC) y el empuje neto (Net Thrust).",
            isParametricStudy: true,
            downloadFile: "data/DatosExportados.xlsx",
            substeps: [
              {
                title: "Consumo Específico (TSFC)",
                description: "El <strong>Thrust Specific Fuel Consumption (TSFC)</strong> mide los gramos de combustible que se consumen por cada kN de empuje generado cada segundo. Es el indicador clave de eficiencia: <strong>cuanto más bajo sea el TSFC, mayor será el alcance del misil</strong>. Se estudia la variación conjunta de la temperatura de salida de la cámara de combustión (Burner Exit Temperature) y la relación de compresión del compresor HP para localizar el punto de mínimo consumo específico, donde el ciclo termodinámico Brayton opera con máxima eficiencia térmica.",
                chartId: "chart-tsfc",
                chartType: "surface3d",
                chartConfig: "tsfc"
              },
              {
                title: "Empuje Neto (Net Thrust)",
                description: "El <strong>empuje neto (Net Thrust)</strong> es la fuerza útil que genera el motor para propulsar el misil, descontando las pérdidas por entrada de aire. Su valor debe igualar la resistencia aerodinámica en crucero (~2.9 kN). Este gráfico 3D revela cómo el empuje <strong>crece drásticamente con la temperatura</strong> (más energía en los gases) pero <strong>disminuye al aumentar la compresión</strong> (la turbina roba más energía para mover un compresor mayor).",
                chartId: "chart-thrust",
                chartType: "surface3d",
                chartConfig: "thrust"
              },
              {
                title: "Carpet Plot: Trade-Off Thrust vs TSFC",
                description: "El <strong>Carpet Plot</strong> (o gráfico de alfombra) es la herramienta clásica en la industria aeroespacial para tomar decisiones de diseño. Combina el empuje y el consumo en un solo gráfico 2D, donde las líneas azules conectan diseños a la misma temperatura y las líneas negras conectan diseños a la misma compresión. El punto rojo marca el motor F107-WR-402: con TET = 1227 K y HP PR = 6.06, el diseño no está en el mínimo matemático absoluto de consumo (que requeriría un PR ≈ 10, inviable por tamaño), sino en el <strong>óptimo práctico</strong> que equilibra consumo, empuje requerido y restricciones geométricas del misil.",
                chartId: "chart-carpet",
                chartType: "carpet2d",
                chartConfig: "carpet"
              }
            ]
          },
          {
            title: "Estudio Off-Design",
            description: "Próximamente: análisis del comportamiento del motor fuera de su punto de diseño (distintos Mach, altitudes y regímenes de potencia).",
            image: null
          }
        ]
      },
      {
        id: "aerodinamica",
        title: "Análisis Aerodinámico",
        icon: "",
        software: ["ANSYS Fluent 2024", "MATLAB", "Pointwise"],
        summary: "CFD del flujo externo a diferentes Mach. Coeficientes CD, CL, CM y visualización del campo de flujo.",
        steps: [
          { title: "Preparación de geometría", description: "Simplificación CAD para CFD. Dominio: cono de 20×10 diámetros. Exportación STEP.", image: "img/aero_geometria.png" },
          { title: "Generación de malla", description: "Malla estructurada en Pointwise, y+≈1, ~4.2M celdas. Estudio de independencia de malla (3 niveles).", image: "img/aero_malla.png" },
          { title: "Configuración del solver", description: "Solver density-based, modelo SST k-ω. Simulaciones a Mach 0.8, 1.2, 2.0 y 3.0.", image: "img/aero_solver.png" },
          { title: "Campo de flujo", description: "Contornos de presión, temperatura y Mach. Ondas de choque oblicuas y expansión visibles en régimen supersónico.", image: "img/aero_contornos.png" },
          { title: "Coeficientes aerodinámicos", description: "CD, CL, CM vs. α (0°-15°). CD=0.42 a Mach 2.0 α=0°. Concordancia del 8% con método de Barrowman.", image: "img/aero_coeficientes.png" }
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
