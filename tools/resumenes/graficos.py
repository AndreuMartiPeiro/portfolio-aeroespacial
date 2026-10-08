"""
graficos.py — Genera las figuras (SVG) de los resúmenes en PDF.

Lee los datos directamente de los ficheros del portfolio
(parametric-data.js y zaragoza-data.js) para que las figuras
coincidan siempre con lo publicado en la web.

Uso:  python3 tools/resumenes/graficos.py
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
    "legend.frameon": False,
    "legend.fontsize": 7,
    "figure.facecolor": SURFACE,
    "axes.facecolor": SURFACE,
    "savefig.facecolor": SURFACE,
})


def load_js(path, name):
    """Evalúa un fichero de datos JS del portfolio y devuelve el objeto como dict."""
    code = (
        "const fs=require('fs');"
        f"const D=new Function(fs.readFileSync(process.argv[1],'utf8')+';return {name}')();"
        "process.stdout.write(JSON.stringify(D));"
    )
    res = subprocess.run(["node", "-e", code, str(path)], capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


def es(x, dec=0):
    """Formato numérico en español: miles con punto y decimales con coma."""
    s = f"{x:,.{dec}f}"
    return s.replace(",", "X").replace(".", ",").replace("X", ".")


def save(fig, name):
    fig.savefig(OUT / f"{name}.svg", bbox_inches=None, pad_inches=0)
    plt.close(fig)


def ramp(colors):
    return LinearSegmentedColormap.from_list("r", colors)


# Rampa secuencial azul (paleta de referencia) y terracota (misma estructura)
BLUE_RAMP = ramp(["#e3eefb", "#9ec5f4", "#5598e7", "#256abf", "#104281", "#0d2c55"])
ORANGE_RAMP = ramp(["#fbeee6", "#f2c3a8", "#e08a63", "#c75b39", "#8f3b20", "#5a2412"])


# =====================================================================
#  MOTOR F107-WR-402
# =====================================================================
def motor():
    D = load_js(ROOT / "parametric-data.js", "PARAMETRIC_DATA")
    PR = np.array(D["PR"])
    TET = np.array(D["TET"])
    TSFC = np.array(D["TSFC"])
    FN = np.array(D["Thrust"])
    dp = D["designPoint"]

    i_min, j_min = np.unravel_index(np.argmin(TSFC), TSFC.shape)

    # ---------- Mapas TSFC y empuje (dos paneles) ----------
    for key, Z, cmap, label, levels, fmt in [
        ("motor_mapa_tsfc", TSFC, BLUE_RAMP, "TSFC  [g/(kN·s)]",
         np.arange(21.0, 26.51, 0.5), lambda v: es(v, 1)),
        ("motor_mapa_empuje", FN, ORANGE_RAMP, "Empuje neto  [kN]",
         np.arange(1.6, 4.41, 0.2), lambda v: es(v, 1)),
    ]:
        fig, ax = plt.subplots(figsize=(86 * MM, 66 * MM))
        fig.subplots_adjust(left=0.13, right=0.97, bottom=0.19, top=0.85)
        cf = ax.contourf(TET, PR, Z, levels=levels, cmap=cmap, extend="both")
        cs = ax.contour(TET, PR, Z, levels=levels[::2], colors="white", linewidths=0.6, alpha=0.85)
        ax.clabel(cs, fmt=fmt, fontsize=6.2, inline_spacing=3, colors="white")
        for c in cf.collections if hasattr(cf, "collections") else []:
            c.set_edgecolor("face")

        # Punto de diseño (anillo blanco de 2 px alrededor del marcador)
        ax.plot(dp["TET"], dp["PR"], marker="*", ms=11, color=INK, mec="white", mew=1.2, zorder=5)
        ax.annotate("F107-WR-402\n(diseño)", (dp["TET"], dp["PR"]), xytext=(-8, 9),
                    textcoords="offset points", ha="right", fontsize=6.6, color=INK,
                    fontweight="semibold",
                    bbox=dict(boxstyle="round,pad=0.25", fc="white", ec="none", alpha=0.85))
        if key == "motor_mapa_tsfc":
            ax.plot(TET[j_min], PR[i_min], marker="o", ms=6, color="white", mec=INK, mew=1.2, zorder=5)
            ax.annotate("Mínimo del dominio\n" + es(TSFC[i_min, j_min], 2), (TET[j_min], PR[i_min]),
                        xytext=(0, -8), textcoords="offset points", ha="center", va="top",
                        fontsize=6.4, color=INK,
                        bbox=dict(boxstyle="round,pad=0.25", fc="white", ec="none", alpha=0.85))

        ax.set_xlabel("Temperatura de salida de cámara, TET  [K]")
        ax.set_ylabel("Relación de compresión HPC")
        ax.set_title(label)
        ax.spines["left"].set_visible(False)
        ax.spines["bottom"].set_visible(False)
        ax.set_xticks([1100, 1200, 1300, 1400, 1500])
        ax.set_yticks([4, 5, 6, 7, 8, 9, 10])
        cb = fig.colorbar(cf, ax=ax, orientation="horizontal", fraction=0.05, pad=0.0,
                          location="top", aspect=40)
        cb.outline.set_visible(False)
        cb.ax.tick_params(labelsize=6.2, length=0, pad=2)
        cb.ax.set_position([0.13 + 0.42, 0.88, 0.42, 0.024])
        cb.set_ticks(levels[::2] if key == "motor_mapa_tsfc" else levels[::4])
        cb.ax.set_xticklabels([fmt(v) for v in (levels[::2] if key == "motor_mapa_tsfc" else levels[::4])])
        save(fig, key)

    # ---------- Carpet plot ----------
    fig, ax = plt.subplots(figsize=(178 * MM, 62 * MM))
    fig.subplots_adjust(left=0.075, right=0.92, bottom=0.17, top=0.87)
    tet_idx = list(range(0, len(TET), 2))
    pr_vals = [4, 5, 6, 7, 8, 10]  # PR 9 se cruza con PR 10 a 1500 K: se omite por legibilidad
    pr_idx = [int(np.where(PR == v)[0][0]) for v in pr_vals]
    for j in tet_idx:
        ax.plot(FN[:, j], TSFC[:, j], color=BLUE, lw=0.9, alpha=0.75, solid_capstyle="round")
    for i in pr_idx:
        ax.plot(FN[i, :], TSFC[i, :], color=INK2, lw=0.9, alpha=0.9, solid_capstyle="round")
    # Etiquetas de PR en el borde TET = 1500 K, separadas para que no se solapen
    ends = sorted(((TSFC[i, -1], FN[i, -1], PR[i]) for i in pr_idx), reverse=True)
    x_lab = FN[:, -1].max() + 0.12
    y_prev = None
    for y, xe, pr in ends:
        y_lab = y if y_prev is None else min(y, y_prev - 0.26)
        ax.plot([xe, x_lab - 0.03], [y, y_lab], color=MUTED, lw=0.5)
        ax.text(x_lab, y_lab, f"PR {es(pr, 0)}", va="center", fontsize=6.4, color=INK2)
        y_prev = y_lab
    # Etiquetas de TET a lo largo del borde PR = 4 (arriba)
    for j in tet_idx[::2]:
        ax.annotate(f"{TET[j]:.0f} K", (FN[0, j], TSFC[0, j]), xytext=(0, 5),
                    textcoords="offset points", ha="center", fontsize=6.2, color=BLUE)
    ax.plot(dp["Thrust"], dp["TSFC"], marker="*", ms=12, color=ACCENT, mec="white", mew=1.2, zorder=6)
    ax.annotate("F107-WR-402 · diseño\n2,90 kN · 22,83 g/(kN·s)", (dp["Thrust"], dp["TSFC"]),
                xytext=(10, 14), textcoords="offset points", fontsize=6.8, color=INK,
                fontweight="semibold", zorder=7,
                bbox=dict(boxstyle="round,pad=0.3", fc="white", ec="none", alpha=0.92),
                arrowprops=dict(arrowstyle="-", color=INK2, lw=0.6))
    ax.set_xlabel("Empuje neto  [kN]")
    ax.set_ylabel("TSFC  [g/(kN·s)]")
    ax.xaxis.set_major_formatter(FuncFormatter(lambda v, _: es(v, 1)))
    ax.grid(True)
    ax.set_axisbelow(True)
    ax.spines["left"].set_visible(False)
    ax.set_xlim(1.45, x_lab + 0.32)
    ax.set_ylim(20.8, 26.6)
    # Leyenda
    ax.plot([], [], color=BLUE, lw=1.2, label="TET constante")
    ax.plot([], [], color=INK2, lw=1.2, label="Relación de compresión HPC (PR) constante")
    ax.legend(loc="lower left", bbox_to_anchor=(0.0, 1.0), ncol=2, handlelength=1.6, columnspacing=1.6)
    save(fig, "motor_carpet")

    # ---------- Estaciones del flujo primario ----------
    st = ["2", "21", "3", "4", "44", "5", "64", "8"]
    T = [291.50, 382.28, 684.54, 1227.00, 962.68, 802.94, 600.51, 600.51]
    P = [113.00, 267.95, 1607.54, 1543.24, 477.08, 207.67, 215.38, 213.23]
    comps = ["Fan + booster", "HPC", "Cámara", "HPT", "LPT", "Mezclador", "Tobera"]
    x = np.arange(len(st))

    fig = plt.figure(figsize=(178 * MM, 92 * MM))
    L, W = 0.075, 0.905
    strip = fig.add_axes([L, 0.885, W, 0.085])
    axT = fig.add_axes([L, 0.53, W, 0.27])
    axP = fig.add_axes([L, 0.115, W, 0.27])
    xlim = (-0.4, len(st) - 0.6)

    strip.set_xlim(*xlim)
    strip.set_ylim(0, 1)
    strip.axis("off")
    for k, name in enumerate(comps):
        hot = name == "Cámara"
        strip.add_patch(FancyBboxPatch((k + 0.05, 0.08), 0.9, 0.84,
                                       boxstyle="round,pad=0,rounding_size=0.08",
                                       fc=ACCENT if hot else BAND, ec="none", mutation_aspect=6))
        strip.text(k + 0.5, 0.5, name, ha="center", va="center", fontsize=6.8,
                   color="white" if hot else INK, fontweight="semibold")

    for ax, Y, color, title, keys in [
        (axT, T, ACCENT, "Temperatura total  [K]", {2: "685 K", 3: "1227 K", 7: "601 K"}),
        (axP, P, BLUE, "Presión total  [kPa]", {2: "1608 kPa", 4: "477 kPa", 7: "213 kPa"}),
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
        ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: es(v)))
    save(fig, "motor_estaciones")


# =====================================================================
#  AEROPUERTO DE ZARAGOZA
# =====================================================================
def zaragoza():
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
    ax.text(2021, 86000, "2020–2021\nexcluidos\n(pandemia)", ha="center", va="top", fontsize=6.4,
            color=MUTED, linespacing=1.25)
    ax.plot(t_all, tot_all, color=BLUE, lw=0.9, alpha=0.8, label="Pasajeros mensuales")
    # Tendencia: se corta en el hueco 2019–2022
    pre = t_mm < 2020.5
    ax.plot(t_mm[pre], mm[pre], color=ACCENT, lw=2, solid_capstyle="round",
            label="Tendencia (media móvil centrada de 12 meses)")
    ax.plot(t_mm[~pre], mm[~pre], color=ACCENT, lw=2, solid_capstyle="round")
    k = int(np.argmax(mm))
    ax.plot(t_mm[k], mm[k], "o", ms=5, color=ACCENT, mec="white", mew=1.2, zorder=5)
    ax.annotate(f"Máximo de tendencia\nmayo 2011 · {es(mm[k])} pax/mes", (t_mm[k], mm[k]),
                xytext=(14, 12), textcoords="offset points", fontsize=6.6, color=INK,
                arrowprops=dict(arrowstyle="-", color=INK2, lw=0.6))
    ax.plot(t_mm[-1], mm[-1], "o", ms=5, color=ACCENT, mec="white", mew=1.2, zorder=5)
    ax.annotate(f"Oct. 2025\n{es(mm[-1])} pax/mes", (t_mm[-1], mm[-1]), xytext=(-6, 22),
                textcoords="offset points", ha="right", fontsize=6.6, color=INK,
                arrowprops=dict(arrowstyle="-", color=INK2, lw=0.6))
    ax.set_xlim(2004, 2026.4)
    ax.set_ylim(0, 90000)
    ax.set_yticks(range(0, 90001, 20000))
    ax.set_yticklabels([es(v) for v in range(0, 90001, 20000)])
    ax.set_xticks(range(2004, 2027, 2))
    ax.grid(True, axis="y")
    ax.set_axisbelow(True)
    ax.spines["left"].set_visible(False)
    ax.set_title("Pasajeros por mes (salidas + llegadas)")
    ax.legend(loc="upper right", bbox_to_anchor=(1.0, 1.2), ncol=2, handlelength=1.6, columnspacing=1.6)
    save(fig, "zgz_serie")

    # ---------- Índice estacional (barras divergentes respecto a 1) ----------
    idx = np.array([r[2] for r in Z["indices"]])
    meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    fig, ax = plt.subplots(figsize=(92 * MM, 70 * MM))
    fig.subplots_adjust(left=0.12, right=0.98, bottom=0.11, top=0.8)
    colors = [ACCENT if v >= 1 else BLUE for v in idx]
    ax.bar(range(12), idx - 1, bottom=1, color=colors, width=0.72, edgecolor="white", linewidth=1)
    ax.axhline(1, color=INK2, lw=0.8)
    ax.text(11.45, 1.012, "Mes medio = 1", ha="right", va="bottom", fontsize=6.2, color=INK2)
    for k in (0, 6, 7, 10):
        v = idx[k]
        ax.annotate(es(v, 2), (k, v), xytext=(0, 3 if v >= 1 else -3), textcoords="offset points",
                    ha="center", va="bottom" if v >= 1 else "top", fontsize=6.6, color=INK,
                    fontweight="semibold")
    ax.set_xticks(range(12))
    ax.set_xticklabels(meses)
    ax.set_ylim(0.6, 1.52)
    ax.set_yticks([0.6, 0.8, 1.0, 1.2, 1.4])
    ax.set_yticklabels([es(v, 1) for v in [0.6, 0.8, 1.0, 1.2, 1.4]])
    ax.grid(True, axis="y")
    ax.set_axisbelow(True)
    ax.spines["left"].set_visible(False)
    ax.set_title("Índice estacional medio del total", pad=20)
    ax.legend(handles=[Patch(color=ACCENT, label="Por encima del mes medio"),
                       Patch(color=BLUE, label="Por debajo del mes medio")],
              loc="lower left", bbox_to_anchor=(0.0, 1.0), ncol=2, handlelength=1.0,
              handleheight=0.8, columnspacing=1.2, borderaxespad=0.2)
    save(fig, "zgz_estacionalidad")


if __name__ == "__main__":
    motor()
    zaragoza()
    print("Figuras generadas en", OUT)
