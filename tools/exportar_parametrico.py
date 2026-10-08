"""
exportar_parametrico.py — Regenera parametric-data.js a partir de la
exportación de GasTurb (data/DatosExportados.xlsx).

La hoja contiene un bloque por cada relación de compresión del HPC:
    * Input *   → HP Compressor Pressure Ratio / Burner Exit Temperature
    * Output *  → Sp. Fuel Consumption / Net Thrust
Las combinaciones que GasTurb no llegó a converger no aparecen en la
exportación y se guardan como null.

Uso:  python3 tools/exportar_parametrico.py
"""

import json
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
XLSX = ROOT / "data" / "DatosExportados.xlsx"
OUT = ROOT / "parametric-data.js"


def leer():
    rows = list(openpyxl.load_workbook(XLSX, data_only=True).worksheets[0].iter_rows(values_only=True))
    casos = {}
    for i, r in enumerate(rows):
        if r[0] != "HP Compressor Pressure Ratio":
            continue
        tet, sfc, fn = rows[i + 1], rows[i + 4], rows[i + 5]
        assert tet[0] == "Burner Exit Temperature" and sfc[0] == "Sp. Fuel Consumption" and fn[0] == "Net Thrust"
        for k in range(2, len(r)):
            if r[k] is not None:
                casos[(r[k], round(tet[k], 2))] = (sfc[k], fn[k])
    return casos


def main():
    casos = leer()
    PR = sorted({k[0] for k in casos})
    TET = sorted({k[1] for k in casos})
    tsfc = [[round(casos[(p, t)][0], 3) if (p, t) in casos else None for t in TET] for p in PR]
    fn = [[round(casos[(p, t)][1], 3) if (p, t) in casos else None for t in TET] for p in PR]

    js = f"""/**
 * parametric-data.js — Datos del estudio paramétrico exportados de GasTurb
 * Motor: Williams F107-WR-402 (2-Spool Mixed Flow Turbofan)
 * Fuente: data/DatosExportados.xlsx (generado con tools/exportar_parametrico.py)
 * Variables de entrada:
 *   - Burner Exit Temperature [K]: {TET[0]} ... {TET[-1]} ({len(TET)} valores)
 *   - HP Compressor Pressure Ratio: {PR[0]} ... {PR[-1]} ({len(PR)} valores)
 * Variables de salida:
 *   - Sp. Fuel Consumption [g/(kN*s)]
 *   - Net Thrust [kN]
 * {len(casos)} casos convergidos; las combinaciones sin solución son null.
 */

const PARAMETRIC_DATA = {{
  // Valores únicos de HP Compressor Pressure Ratio (eje Y)
  PR: {json.dumps(PR)},

  // Valores únicos de Burner Exit Temperature [K] (eje X)
  TET: {json.dumps(TET)},

  // Matriz TSFC[PR_index][TET_index] en g/(kN*s)
  TSFC: [
{",\n".join("    " + json.dumps(r) for r in tsfc)}
  ],

  // Matriz Thrust[PR_index][TET_index] en kN
  Thrust: [
{",\n".join("    " + json.dumps(r) for r in fn)}
  ],

  // Punto de diseño del motor F107-WR-402 (cálculo de punto de diseño en GasTurb)
  designPoint: {{
    TET: 1227,
    PR: 6.06,
    TSFC: 22.83,
    Thrust: 2.90
  }}
}};
"""
    OUT.write_text(js, encoding="utf-8")

    # Resumen numérico para los textos
    best = min(casos.items(), key=lambda kv: kv[1][0])
    print(f"{len(casos)} casos ({len(PR)} PR × {len(TET)} TET, {len(PR) * len(TET) - len(casos)} sin converger)")
    print("Mínimo TSFC:", best)
    for p in [4, 5, 6, 7, 8, 9, 10]:
        row = {t: v for (pp, t), v in casos.items() if pp == p}
        tmin = min(row, key=lambda t: row[t][0])
        t0 = min(row)
        print(f"PR {p}: TET {t0}–{max(row)}  TSFCmin {row[tmin][0]:.2f} @ {tmin}  "
              f"FN {row[t0][1]:.3f}→{row[max(row)][1]:.3f}  TSFC@1500 {row[max(row)][0]:.2f}")


if __name__ == "__main__":
    main()
