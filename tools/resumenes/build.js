/**
 * build.js — Genera los resúmenes en PDF de los apartados del portfolio.
 *
 *   node tools/resumenes/build.js            (todos)
 *   node tools/resumenes/build.js motor      (solo uno)
 *
 * 1. Regenera las figuras (graficos.py) a partir de los datos de la web.
 * 2. Imprime cada plantilla HTML a PDF con Chromium (Playwright).
 * Salida: data/resumenes/*.pdf
 */
const path = require('path');
const { execFileSync } = require('child_process');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  ({ chromium } = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright')));
}

const DIR = __dirname;
const OUT = path.resolve(DIR, '../../data/resumenes');

const RESUMENES = [
  { html: 'motor.html', pdf: 'Resumen_Analisis_Motor_F107.pdf', title: 'Análisis termodinámico del motor F107-WR-402' },
  { html: 'zaragoza.html', pdf: 'Resumen_Demanda_Aeropuerto_Zaragoza.pdf', title: 'Demanda del aeropuerto de Zaragoza' }
];

(async () => {
  execFileSync('python3', [path.join(DIR, 'graficos.py')], { stdio: 'inherit' });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const only = process.argv[2];
  for (const r of RESUMENES.filter(x => !only || x.html.startsWith(only))) {
    await page.goto('file://' + path.join(DIR, r.html), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: path.join(OUT, r.pdf),
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      tagged: true
    });
    console.log('PDF generado:', path.join('data/resumenes', r.pdf));
  }
  await browser.close();
})();
