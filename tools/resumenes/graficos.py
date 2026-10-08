"""
graficos.py — Genera las figuras (SVG) de los resúmenes en PDF, en español e inglés.

Lee los datos directamente de los ficheros del portfolio
(parametric-data.js, regenerado desde data/DatosExportados.xlsx, y
zaragoza-data.js, extraído del Excel de trabajo) para que las figuras
coincidan siempre con lo publicado en la web.

Uso:  python3 tools/resumenes/graficos.py
Salida: tools/resumenes/graficos/<figura>_<es|en>.svg
"""

import json
import subprocess
from pathlib import Path

import matplotlib

matplotlib.use("svg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.colors import LinearSegmentedColormap  # noqa: E402
from matplotlib.patches import FancyBboxPatch, Patch  # noqa: E402
from matplotlib.ticker import FuncFormatter  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent / "graficos"
OUT.mkdir(exist_ok=True)

# --- Paleta (validada: terracota del portfolio + azul, CVD ΔE 21) ---
INK = "#1f1c1a"
INK2 = "#57524d"
MUTED = "#8a847e"
GRID = "#e7e3de"
SURFACE = "#ffffff"
ACCENT = "#c75b39"
BLUE = "#256abf"
BAND = "#f1eeea"

MM = 1 / 25.4  # milímetros → pulgadas

plt.rcParams.update({
    "font.family": "Inter",
    "font.size": 7.5,
    "svg.fonttype": "none",
    "axes.edgecolor": GRID,
    "axes.linewidth": 0.8,
    "axes.labelcolor": INK2,
    "axes.labelsize": 7.5,
    "axes.titlesize": 8.5,
    "axes.titleweight": "semibold",
    "axes.titlecolor": INK,
    "axes.titlelocation": "left",
    "axes.titlepad": 8,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "xtick.labelcolor": INK2,
    "ytick.labelcolor": INK2,
    "xtick.labelsize": 7,
    "ytick.labelsize": 7,
    "xtick.major.size": 0,
    "ytick.major.size": 0,
    "xtick.major.pad": 4,
    "ytick.major.pad": 4,
    "grid.color": GRID,
    "grid.linewidth": 0.6,
    "hatch.color": "#d9d3cc",
    "legend.frameon": False,
    "legend.fontsize": 7,
    "figure.facecolor": SURFACE,
    "axes.facecolor": SURFACE,
    "savefig.facecolor": SURFACE,
})

# --- Textos de las figuras ---
TXT = {
    "es": {
        "tsfc": "TSFC  [g/(kN·s)]",
        "fn": "Empuje neto  [kN]",
        "tet_axis": "Temperatura de salida de cámara, TET  [K]",
        "pr_axis": "Relación de compresión HPC",
        "design": "F107-WR-402\n(diseño)",
        "min": "Mínimo del dominio\n{v}",
        "noconv": "Sin solución\nconvergida",
        "tet_const": "TET constante",
        "pr_const": "Relación de compresión HPC (PR) constante",
        "carpet_dp": "F107-WR-402 · diseño\n2,90 kN · 22,83 g/(kN·s)",
        "comps": ["Fan + booster", "HPC", "Cámara", "HPT", "LPT", "Mezclador", "Tobera"],
        "hot": "Cámara",
        "T": "Temperatura total  [K]",
        "P": "Presión total  [kPa]",
        "excl": "2020–2021\nexcluidos\n(pandemia)",
        "monthly": "Pasajeros mensuales",
        "trend": "Tendencia (media móvil centrada de 12 meses)",
        "peak": "Máximo de tendencia\nmayo 2011 · {v} pax/mes",
        "last": "Oct. 2025\n{v} pax/mes",
        "serie_title": "Pasajeros por mes (salidas + llegadas)",
        "months": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
        "avg_month": "Mes medio = 1",
        "season_title": "Índice estacional medio del total",
        "above": "Por encima del mes medio",
        "below": "Por debajo del mes medio",
        "el_x": "ln PIB (índice trimestral)",
        "el_y": "ln media móvil trimestral",
        "el_title": "Relación tráfico–PIB (78 trimestres)",
        "el_all": "Recta del Excel: ε = {b}  (R² = {r})",
        "el_wo": "Sin el trimestre parcial: ε = {b}  (R² = {r})",
        "el_pts": "Trimestres",
        "el_partial": "2025 T4: solo octubre",
    },
    "en": {
        "tsfc": "TSFC  [g/(kN·s)]",
        "fn": "Net thrust  [kN]",
        "tet_axis": "Burner exit temperature, TET  [K]",
        "pr_axis": "HP compressor pressure ratio",
        "design": "F107-WR-402\n(design)",
        "min": "Domain minimum\n{v}",
        "noconv": "No converged\nsolution",
        "tet_const": "Constant TET",
        "pr_const": "Constant HP compressor pressure ratio (PR)",
        "carpet_dp": "F107-WR-402 · design\n2.90 kN · 22.83 g/(kN·s)",
        "comps": ["Fan + booster", "HPC", "Burner", "HPT", "LPT", "Mixer", "Nozzle"],
        "hot": "Burner",
        "T": "Total temperature  [K]",
        "P": "Total pressure  [kPa]",
        "excl": "2020–2021\nexcluded\n(pandemic)",
        "monthly": "Monthly passengers",
        "trend": "Trend (12-month centred moving average)",
        "peak": "Trend peak\nMay 2011 · {v} pax/month",
        "last": "Oct 2025\n{v} pax/month",
        "serie_title": "Passengers per month (departures + arrivals)",
        "months": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        "avg_month": "Average month = 1",
        "season_title": "Mean seasonal index (total traffic)",
        "above": "Above the average month",
        "below": "Below the average month",
        "el_x": "ln GDP (quarterly index)",
        "el_y": "ln quarterly moving average",
        "el_title": "Traffic–GDP relationship (78 quarters)",
        "el_all": "Spreadsheet fit: ε = {b}  (R² = {r})",
        "el_wo": "Without the partial quarter: ε = {b}  (R² = {r})",
        "el_pts": "Quarters",
        "el_partial": "2025 Q4: October only",
    },
}


def load_js(path, name):
    """Evalúa un fichero de datos JS del portfolio y devuelve el objeto como dict."""
    code = (
        "const fs=require('fs');"
        f"const D=new Function(fs.readFileSync(process.argv[1],'utf8')+';return {name}')();"
        "process.stdout.write(JSON.stringify(D));"
    )
    res = subprocess.run(["node", "-e", code, str(path)], capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def num(x, dec=0, lang="es"):
    """Formato numérico: es → 1.234,5 · en → 1,234.5"""
    s = f"{x:,.{dec}f}"
    if lang == "es":
        s = s.replace(",", "X").replace(".", ",").replace("X", ".")
    return s


def save(fig, name, lang):
    fig.savefig(OUT / f"{name}_{lang}.svg", bbox_inches=None, pad_inches=0)
    plt.close(fig)


def ramp(colors):
    return LinearSegmentedColormap.from_list("r", colors)


BLUE_RAMP = ramp(["#e3eefb", "#9ec5f4", "#5598e7", "#256abf", "#104281", "#0d2c55"])
ORANGE_RAMP = ramp(["#fbeee6", "#f2c3a8", "#e08a63", "#c75b39", "#8f3b20", "#5a2412"])
LABEL_BOX = dict(boxstyle="round,pad=0.25", fc="white", ec="none", alpha=0.88)


def as_array(m):
    return np.array([[np.nan if v is None else v for v in row] for row in m], dtype=float)


# =====================================================================
#  MOTOR F107-WR-402
# =====================================================================
def motor(lang):
    t = TXT[lang]
    D = load_js(ROOT / "parametric-data.js", "PARAMETRIC_DATA")
    PR = np.array(D["PR"])
    TET = np.array(D["TET"])
    TSFC = as_array(D["TSFC"])
    FN = as_array(D["Thrust"])
    dp = D["designPoint"]
    i_min, j_min = np.unravel_index(np.nanargmin(TSFC), TSFC.shape)

    # ---------- Mapas TSFC y empuje ----------
    for key, Z, cmap, label, levels, cb_ticks in [
        ("motor_mapa_tsfc", TSFC, BLUE_RAMP, t["tsfc"], np.arange(21.0, 27.01, 0.5), np.arange(21, 27.1, 1)),
        ("motor_mapa_empuje", FN, ORANGE_RAMP, t["fn"], np.arange(2.0, 4.31, 0.15), [2.0, 2.6, 3.2, 3.8]),
    ]:
        fig, ax = plt.subplots(figsize=(86 * MM, 68 * MM))
        fig.subplots_adjust(left=0.13, right=0.97, bottom=0.19, top=0.85)
        # Zona sin convergencia: fondo tramado bajo el mapa
        ax.add_patch(plt.Rectangle((TET[0], PR[0]), TET[-1] - TET[0], PR[-1] - PR[0],
                                   fc=BAND, ec="none", hatch="////", zorder=0))
        cf = ax.contourf(TET, PR, Z, levels=levels, cmap=cmap, extend="both", zorder=1)
        cs = ax.contour(TET, PR, Z, levels=levels[::2], colors="white", linewidths=0.6, alpha=0.85, zorder=2)
        ax.clabel(cs, fmt=lambda v: num(v, 1, lang), fontsize=6.2, inline_spacing=3, colors="white")
        ax.text(1072, 9.7, t["noconv"], fontsize=6.3, color=INK2, va="top", zorder=3)

        ax.plot(dp["TET"], dp["PR"], marker="*", ms=11, color=INK, mec="white", mew=1.2, zorder=5)
        ax.annotate(t["design"], (dp["TET"], dp["PR"]), xytext=(9, -14), textcoords="offset points",
                    ha="left", fontsize=6.6, color=INK, fontweight="semibold", bbox=LABEL_BOX, zorder=6)
        if key == "motor_mapa_tsfc":
            ax.plot(TET[j_min], PR[i_min], marker="o", ms=6, color="white", mec=INK, mew=1.2, zorder=5)
            ax.annotate(t["min"].format(v=num(TSFC[i_min, j_min], 2, lang)), (TET[j_min], PR[i_min]),
                        xytext=(0, -8), textcoords="offset points", ha="center", va="top",
                        fontsize=6.4, color=INK, bbox=LABEL_BOX, zorder=6)

        ax.set_xlabel(t["tet_axis"])
        ax.set_ylabel(t["pr_axis"])
        ax.set_title(label)
        ax.spines["left"].set_visible(False)
        ax.spines["bottom"].set_visible(False)
        ax.set_xlim(TET[0], TET[-1])
        ax.set_ylim(PR[0], PR[-1])
        ax.set_xticks([1100, 1200, 1300, 1400, 1500])
        ax.set_yticks([4, 5, 6, 7, 8, 9, 10])
        cb = fig.colorbar(cf, ax=ax, orientation="horizontal", fraction=0.05, pad=0.0, location="top", aspect=40)
        cb.outline.set_visible(False)
        cb.ax.tick_params(labelsize=6.2, length=0, pad=2)
        cb.ax.set_position([0.55, 0.88, 0.42, 0.024])
        cb.set_ticks(cb_ticks)
        cb.ax.set_xticklabels([num(v, 1, lang) for v in cb_ticks])
        save(fig, key, lang)

    # ---------- Carpet plot ----------
    fig, ax = plt.subplots(figsize=(178 * MM, 64 * MM))
    fig.subplots_adjust(left=0.075, right=0.92, bottom=0.17, top=0.87)
    tet_idx = list(range(0, len(TET), 4)) + ([len(TET) - 1] if (len(TET) - 1) % 4 else [])
    pr_idx = [int(np.where(PR == v)[0][0]) for v in [4, 5, 6, 7, 8, 9, 10]]
    for j in tet_idx:
        ax.plot(FN[:, j], TSFC[:, j], color=BLUE, lw=0.9, alpha=0.75, solid_capstyle="round")
    for i in pr_idx:
        ax.plot(FN[i, :], TSFC[i, :], color=INK2, lw=0.9, alpha=0.9, solid_capstyle="round")
    ends = sorted(((TSFC[i, -1], FN[i, -1], PR[i]) for i in pr_idx), reverse=True)
    x_lab = np.nanmax(FN[:, -1]) + 0.12
    y_prev = None
    for y, xe, pr in ends:
        y_lab = y if y_prev is None else min(y, y_prev - 0.32)
        ax.plot([xe, x_lab - 0.03], [y, y_lab], color=MUTED, lw=0.5)
        ax.text(x_lab, y_lab, f"PR {num(pr, 0, lang)}", va="center", fontsize=6.4, color=INK2)
        y_prev = y_lab
    for j in tet_idx[:-2:2]:
        ax.annotate(f"{TET[j]:.0f} K", (FN[0, j], TSFC[0, j]), xytext=(0, 5),
                    textcoords="offset points", ha="center", fontsize=6.2, color=BLUE)
    ax.plot(dp["Thrust"], dp["TSFC"], marker="*", ms=12, color=ACCENT, mec="white", mew=1.2, zorder=6)
    ax.annotate(t["carpet_dp"], (dp["Thrust"], dp["TSFC"]), xytext=(-12, -26), textcoords="offset points",
                ha="right", fontsize=6.8, color=INK, fontweight="semibold", zorder=7,
                bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="none", alpha=0.92),
                arrowprops=dict(arrowstyle="-", color=INK2, lw=0.6))
    ax.set_xlabel(t["fn"])
    ax.set_ylabel(t["tsfc"])
    ax.xaxis.set_major_formatter(FuncFormatter(lambda v, _: num(v, 1, lang)))
    ax.grid(True)
    ax.set_axisbelow(True)
    ax.spines["left"].set_visible(False)
    ax.set_xlim(1.9, x_lab + 0.32)
    ax.set_ylim(21.0, 27.6)
    ax.plot([], [], color=BLUE, lw=1.2, label=t["tet_const"])
    ax.plot([], [], color=INK2, lw=1.2, label=t["pr_const"])
    ax.legend(loc="lower left", bbox_to_anchor=(0.0, 1.0), ncol=2, handlelength=1.6, columnspacing=1.6)
    save(fig, "motor_carpet", lang)

    # ---------- Estaciones del flujo primario ----------
    st = ["2", "21", "3", "4", "44", "5", "64", "8"]
    T = [291.50, 382.28, 684.54, 1227.00, 962.68, 802.94, 600.51, 600.51]
    P = [113.00, 267.95, 1607.54, 1543.24, 477.08, 207.67, 215.38, 213.23]
    x = np.arange(len(st))
    fig = plt.figure(figsize=(178 * MM, 84 * MM))
    L, W = 0.075, 0.905
    strip = fig.add_axes([L, 0.88, W, 0.09])
    axT = fig.add_axes([L, 0.53, W, 0.26])
    axP = fig.add_axes([L, 0.12, W, 0.26])
    xlim = (-0.4, len(st) - 0.6)
    strip.set_xlim(*xlim)
    strip.set_ylim(0, 1)
    strip.axis("off")
    for k, name in enumerate(t["comps"]):
        hot = name == t["hot"]
        strip.add_patch(FancyBboxPatch((k + 0.05, 0.08), 0.9, 0.84, boxstyle="round,pad=0,rounding_size=0.08",
                                       fc=ACCENT if hot else BAND, ec="none", mutation_aspect=6))
        strip.text(k + 0.5, 0.5, name, ha="center", va="center", fontsize=6.8,
                   color="white" if hot else INK, fontweight="semibold")
    for ax, Y, color, title, keys in [
        (axT, T, ACCENT, t["T"], {2: "685 K", 3: "1227 K", 7: "601 K"}),
        (axP, P, BLUE, t["P"], {2: "1608 kPa", 4: "477 kPa", 7: "213 kPa"}),
    ]:
        ax.fill_between(x, Y, color=color, alpha=0.08, lw=0)
        ax.plot(x, Y, color=color, lw=2, solid_joinstyle="round", solid_capstyle="round")
        ax.plot(x, Y, "o", ms=4.2, color=color, mec="white", mew=1.0)
        for k, txt in keys.items():
            ax.annotate(txt, (x[k], Y[k]), xytext=(0, 6), textcoords="offset points",
                        ha="center", fontsize=6.6, color=INK, fontweight="semibold")
        ax.set_xticks(x)
        ax.set_xticklabels([f"St {s}" for s in st] if ax is axP else [])
        ax.set_title(title, pad=6)
        ax.grid(True)
        ax.set_axisbelow(True)
        ax.spines["left"].set_visible(False)
        ax.set_ylim(0, max(Y) * 1.22)
        ax.set_xlim(*xlim)
        ax.yaxis.set_major_locator(plt.MaxNLocator(4))
        ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: num(v, 0, lang)))
    save(fig, "motor_estaciones", lang)


# =====================================================================
#  AEROPUERTO DE ZARAGOZA
# =====================================================================
def zaragoza(lang):
    t = TXT[lang]
    Z = load_js(ROOT / "zaragoza-data.js", "ZARAGOZA_DATA")
    comp = Z["completa"]
    t_all = np.array([r[0] + (r[1] - 0.5) / 12 for r in comp])
    tot_all = np.array([r[2] + r[3] for r in comp])
    serie = [r for r in Z["serie"] if r[5] is not None]
    t_mm = np.array([r[0] + (r[1] - 0.5) / 12 for r in serie])
    mm = np.array([r[5] for r in serie])

    # ---------- Serie mensual y tendencia ----------
    fig, ax = plt.subplots(figsize=(178 * MM, 66 * MM))
    fig.subplots_adjust(left=0.07, right=0.985, bottom=0.12, top=0.84)
    ax.axvspan(2020, 2022, color=BAND, lw=0, zorder=0)
    ax.text(2021, 86000, t["excl"], ha="center", va="top", fontsize=6.4, color=MUTED, linespacing=1.25)
    ax.plot(t_all, tot_all, color=BLUE, lw=0.9, alpha=0.8, label=t["monthly"])
    pre = t_mm < 2020.5
    ax.plot(t_mm[pre], mm[pre], color=ACCENT, lw=2, solid_capstyle="round", label=t["trend"])
    ax.plot(t_mm[~pre], mm[~pre], color=ACCENT, lw=2, solid_capstyle="round")
    k = int(np.argmax(mm))
    ax.plot(t_mm[k], mm[k], "o", ms=5, color=ACCENT, mec="white", mew=1.2, zorder=5)
    ax.annotate(t["peak"].format(v=num(mm[k], 0, lang)), (t_mm[k], mm[k]), xytext=(14, 12),
                textcoords="offset points", fontsize=6.6, color=INK,
                arrowprops=dict(arrowstyle="-", color=INK2, lw=0.6))
    ax.plot(t_mm[-1], mm[-1], "o", ms=5, color=ACCENT, mec="white", mew=1.2, zorder=5)
    ax.annotate(t["last"].format(v=num(mm[-1], 0, lang)), (t_mm[-1], mm[-1]), xytext=(-6, 22),
                textcoords="offset points", ha="right", fontsize=6.6, color=INK,
                arrowprops=dict(arrowstyle="-", color=INK2, lw=0.6))
    ax.set_xlim(2004, 2026.4)
    ax.set_ylim(0, 90000)
    ax.set_yticks(range(0, 90001, 20000))
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: num(v, 0, lang)))
    ax.set_xticks(range(2004, 2027, 2))
    ax.grid(True, axis="y")
    ax.set_axisbelow(True)
    ax.spines["left"].set_visible(False)
    ax.set_title(t["serie_title"])
    ax.legend(loc="upper right", bbox_to_anchor=(1.0, 1.2), ncol=2, handlelength=1.6, columnspacing=1.6)
    save(fig, "zgz_serie", lang)

    # ---------- Índice estacional ----------
    idx = np.array([r[2] for r in Z["indices"]])
    fig, ax = plt.subplots(figsize=(88 * MM, 70 * MM))
    fig.subplots_adjust(left=0.12, right=0.98, bottom=0.11, top=0.8)
    colors = [ACCENT if v >= 1 else BLUE for v in idx]
    ax.bar(range(12), idx - 1, bottom=1, color=colors, width=0.72, edgecolor="white", linewidth=1)
    ax.axhline(1, color=INK2, lw=0.8)
    ax.text(11.45, 1.012, t["avg_month"], ha="right", va="bottom", fontsize=6.2, color=INK2)
    for k in (0, 6, 7, 10):
        v = idx[k]
        ax.annotate(num(v, 2, lang), (k, v), xytext=(0, 3 if v >= 1 else -3), textcoords="offset points",
                    ha="center", va="bottom" if v >= 1 else "top", fontsize=6.6, color=INK, fontweight="semibold")
    ax.set_xticks(range(12))
    ax.set_xticklabels(t["months"])
    ax.set_ylim(0.6, 1.52)
    ax.set_yticks([0.6, 0.8, 1.0, 1.2, 1.4])
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: num(v, 1, lang)))
    ax.grid(True, axis="y")
    ax.set_axisbelow(True)
    ax.spines["left"].set_visible(False)
    ax.set_title(t["season_title"], pad=20)
    ax.legend(handles=[Patch(color=ACCENT, label=t["above"]), Patch(color=BLUE, label=t["below"])],
              loc="lower left", bbox_to_anchor=(0.0, 1.0), ncol=2, handlelength=1.0,
              handleheight=0.8, columnspacing=1.2, borderaxespad=0.2)
    save(fig, "zgz_estacionalidad", lang)

    # ---------- Elasticidad: dispersión ln PIB – ln tráfico ----------
    pts = np.array([[p[2], p[3]] for p in Z["pib"]])
    partial = np.array([p[0] == 2025 and p[1] == "T4" for p in Z["pib"]])

    def fit(xy):
        b, a = np.polyfit(xy[:, 0], xy[:, 1], 1)
        r2 = np.corrcoef(xy[:, 0], xy[:, 1])[0, 1] ** 2
        return a, b, r2

    a1, b1, r1 = fit(pts)
    a2, b2, r2 = fit(pts[~partial])
    fig, ax = plt.subplots(figsize=(88 * MM, 70 * MM))
    fig.subplots_adjust(left=0.13, right=0.98, bottom=0.16, top=0.74)
    ax.scatter(pts[~partial, 0], pts[~partial, 1], s=11, color=BLUE, alpha=0.7, lw=0.6,
               edgecolor="white", zorder=3)
    ax.scatter(pts[partial, 0], pts[partial, 1], s=22, color="white", edgecolor=ACCENT, lw=1.2, zorder=4)
    ax.annotate(t["el_partial"], tuple(pts[partial][0]), xytext=(-6, 6), textcoords="offset points",
                ha="right", fontsize=6.3, color=INK)
    xs = np.linspace(pts[:, 0].min(), pts[:, 0].max(), 10)
    ax.plot(xs, a1 + b1 * xs, color=ACCENT, lw=2, label=t["el_all"].format(b=num(b1, 2, lang), r=num(r1, 2, lang)))
    ax.plot(xs, a2 + b2 * xs, color=INK2, lw=1.2, ls=(0, (4, 2)),
            label=t["el_wo"].format(b=num(b2, 2, lang), r=num(r2, 2, lang)))
    ax.set_xlabel(t["el_x"])
    ax.set_ylabel(t["el_y"])
    ax.xaxis.set_major_formatter(FuncFormatter(lambda v, _: num(v, 2, lang)))
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: num(v, 1, lang)))
    ax.grid(True)
    ax.set_axisbelow(True)
    ax.spines["left"].set_visible(False)
    ax.set_title(t["el_title"], pad=30)
    ax.legend(loc="lower left", bbox_to_anchor=(0.0, 1.0), ncol=1, handlelength=1.8, borderaxespad=0.3)
    save(fig, "zgz_elasticidad", lang)
    return round(b1, 4), round(r1, 3), round(b2, 4), round(r2, 3)


if __name__ == "__main__":
    for lang in ("es", "en"):
        motor(lang)
        print(lang, "elasticidad (con / sin trimestre parcial):", zaragoza(lang))
    print("Figuras generadas en", OUT)
