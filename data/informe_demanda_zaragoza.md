---
titulo: Planificación de la demanda futura del aeropuerto de Zaragoza
subtitulo: Análisis del tráfico mensual de pasajeros a partir de los datos oficiales de Aena (2004-2026) y previsión a 2050
titulo_corto: Demanda del aeropuerto de Zaragoza
fecha: hoy
estilo: academico
portada: si
autor: Marc Marzal Català; Hector Hernández de la Rosa; Andreu Martí Peiró
portada_imagen: portada.jpg
portada_credito: Fotografía: Hugo González Duenas (JetPhotos)
---

# Introducción y objetivo

El objetivo del trabajo es planificar la demanda futura del aeropuerto de Zaragoza: estimar cuántos pasajeros tendrá en el año 2050, cómo se repartirán a lo largo del año y qué infraestructura de pista exigirán en la hora más cargada. Para ello se parte de lo ocurrido en el pasado y se relaciona con la evolución de la economía.

Este informe explica el análisis realizado en el Excel de trabajo, hoja por hoja. Para cada paso indica de dónde proceden los datos, cómo se tratan y por qué, qué representan los resultados y qué se consigue con ellos. Los cálculos, tablas y gráficos son los del propio Excel. Las comprobaciones propias que se han hecho sobre ellos se indican siempre como tales y se agrupan en el apartado 7.

# Datos de partida

## Fuente y alcance

Los datos son las cifras mensuales oficiales de Aena, gestora del aeropuerto, entre enero de 2004 y abril de 2026 (268 meses): **salidas**, **llegadas** y **pasajeros totales**, que son la suma de ambas. Se usan datos mensuales y no anuales porque la estacionalidad (el efecto de las estaciones del año) solo puede observarse con una periodicidad inferior al año. Como comprobación, la suma de los doce meses de 2025 en el Excel (707.493 pasajeros) y el dato de diciembre de 2025 (51.192) coinciden con el balance anual publicado por Aena (Aena, 2026).

Cada magnitud representa algo distinto. Las salidas son los pasajeros que embarcan en el aeropuerto y las llegadas los que desembarcan; el total es su suma y mide la carga que soporta el conjunto de las instalaciones. Como terminal, pista y accesos atienden ambos flujos, el dimensionamiento se hace sobre el total, y salidas y llegadas se conservan por separado para comprobar que están equilibradas.

## Organización del Excel

El libro reproduce la cadena de cálculo de una previsión de demanda, resumida en la @tbl:hojas. Los datos fluyen de la serie de Aena a la tendencia y la estacionalidad, de ahí a la relación con el PIB y, por último, a los escenarios futuros y al dimensionamiento de la pista.

| Hoja | Contenido | Papel en el análisis |
|:-----|:----------|:---------------------|
| Comparativa mes año anterior | Serie completa de Aena (268 meses) y variación interanual | Datos de partida |
| Análisis tendencia | Serie sin 2020 y 2021 (244 meses), media móvil e índice estacional | Cálculo central |
| Promedios | Índice estacional medio de cada mes | Estacionalidad |
| Media móvil total | Media móvil mensual y por trimestre | Tendencia |
| PIB | Media móvil trimestral y PIB, logaritmos, elasticidad, tasa de crecimiento y escenarios a 2050 | Previsión |
| HP | Pasajeros por mes, por día y en la hora punta de cada escenario | Dimensionamiento |
| Operaciones | Pasajeros por operación, operaciones por hora y número de pistas | Dimensionamiento |
| Tabla1 | Listado de operaciones mensuales | Auxiliar |

: Hojas del Excel de trabajo {#tbl:hojas}

# Metodología

## Exclusión del periodo de la pandemia

Se eliminan los 24 meses de 2020 y 2021, de modo que el análisis central se apoya en 244 meses. Durante la pandemia el tráfico cayó casi a cero (en abril de 2020 se registraron solo 4 pasajeros) y en 2021 se recuperó con aumentos porcentuales desproporcionados sobre una base mínima. Son valores anómalos que no reflejan el comportamiento normal de la demanda y habrían distorsionado la tendencia, la estacionalidad y la relación con el PIB. Por coherencia, los 8 trimestres de 2020 y 2021 también se excluyen de la comparación con el PIB. Excluir no significa sustituir los meses por una estimación: simplemente se dejan fuera de todos los cálculos posteriores (medias, índices y regresión), de modo que las series quedan con un hueco entre diciembre de 2019 y enero de 2022.

## Tendencia: media móvil centrada de 12 meses

Para cada mes se calcula la media de los pasajeros de los 12 meses que lo rodean: los seis anteriores y los seis posteriores, con la mitad de peso en los dos extremos para que la ventana quede centrada. La fórmula general, que es la que aplica el Excel, es

*MM~t~ = (1/12) · [ 0,5 · X~t−6~ + X~t−5~ + X~t−4~ + … + X~t+5~ + 0,5 · X~t+6~ ]*

donde *X~t~* son los pasajeros del mes *t* y *MM~t~* su media móvil. Con una ventana de 12 meses, el centro cae entre dos meses y no sobre uno, por lo que se promedian dos medias de 12 meses desplazadas un mes entre sí; el resultado es una ventana de 13 meses en la que los dos extremos pesan la mitad.

Se elige este método por dos razones. Cada mes del año entra exactamente una vez en la ventana, por lo que el efecto estacional se compensa y queda el nivel de fondo de la demanda; y se suavizan las fluctuaciones puntuales de un mes concreto. La media móvil responde a la pregunta de cuántos pasajeros al mes tendría el aeropuerto en un mes medio de ese momento. Como contrapartida se pierden seis meses en cada extremo: no hay valor para enero-junio de 2004 ni para noviembre de 2025-abril de 2026, de modo que la última tendencia disponible es la de octubre de 2025 (59.066 pasajeros al mes). La @tbl:ejemplo muestra el cálculo de enero de 2025.

| Mes | Pasajeros totales | Peso en la media |
|:----|------------------:|-----------------:|
| Julio de 2024 | 66.492 | 0,5 |
| Agosto de 2024 | 71.136 | 1 |
| Septiembre de 2024 | 64.624 | 1 |
| Octubre de 2024 | 61.961 | 1 |
| Noviembre de 2024 | 48.343 | 1 |
| Diciembre de 2024 | 54.624 | 1 |
| **Enero de 2025** | **44.040** | **1** |
| Febrero de 2025 | 43.859 | 1 |
| Marzo de 2025 | 52.160 | 1 |
| Abril de 2025 | 67.643 | 1 |
| Mayo de 2025 | 64.862 | 1 |
| Junio de 2025 | 61.293 | 1 |
| Julio de 2025 | 71.064 | 0,5 |

: Ejemplo de cálculo de la media móvil de enero de 2025 (media móvil total: 58.610,25) {#tbl:ejemplo}

La hoja *Media móvil total* recoge estos valores mes a mes y los agrupa por trimestres, sumando la media móvil de los tres meses de cada trimestre. Esa serie trimestral es la que se compara después con el PIB.

## Estacionalidad: índice estacional

**Qué es.** La estacionalidad es el patrón que se repite cada año en el tráfico por causas de calendario: las vacaciones de verano, la Navidad, los puentes o la temporada escolar. En Zaragoza, por ejemplo, julio y agosto tienen siempre más pasajeros que enero o febrero, con independencia de que el aeropuerto crezca o decrezca ese año.

**Por qué se calcula.** Por tres motivos. El primero es no confundir estacionalidad con cambio real: que agosto de 2025 (73.934 pasajeros) supere a febrero de 2025 (43.859) no indica que el aeropuerto haya crecido, sino que es verano. El segundo es poder repartir una cifra anual entre los meses, lo que permite conocer cuál es el mes más cargado, que es el que condiciona el diseño de las instalaciones (apartado 3.6). El tercero es comparar meses de épocas distintas en igualdad de condiciones.

**Cómo se calcula.** El índice estacional de un mes concreto es su valor real dividido entre su media móvil, es decir, entre el nivel de fondo de ese momento:

*I~t~ = X~t~ / MM~t~*

Como cada mes del año aparece en muchos años, se promedian todos los índices del mismo mes (hoja *Promedios*) para obtener un único factor por mes:

*I~m~ = (1/N) · Σ I~t~, sumando los N años en que existe el mes m*

Si los factores están bien equilibrados, su suma debe ser aproximadamente 12:

*Σ I~m~ ≈ 12*

Un índice de 1,00 corresponde a un mes medio; uno superior indica que el mes está por encima de su nivel de fondo y uno inferior, que está por debajo. En el ejemplo anterior, el índice de enero de 2025 es 44.040 / 58.610,25 = 0,75: ese enero tuvo un 25 % menos de pasajeros que un mes medio de su entorno. Este índice es multiplicativo, es decir, expresa la estacionalidad como un porcentaje del nivel de fondo. Por eso sigue siendo válido cuando el tráfico crece: agosto es 1,42 veces el mes medio tanto con 50.000 como con 100.000 pasajeros al mes. Se calcula para salidas, llegadas y total, y para el dimensionamiento se usa el índice del total.

## Elasticidad del tráfico respecto al PIB

**Para qué sirve.** Para prever el tráfico de 2050 hace falta un motivo por el que crezca. El Excel supone que el tráfico depende de la economía, medida por el PIB, y cuantifica esa dependencia con la elasticidad. Así, una hipótesis sobre el crecimiento económico, que es más fácil de plantear, se convierte en una hipótesis sobre el tráfico.

**Datos que se comparan.** La hoja *PIB* enfrenta la media móvil trimestral del tráfico (que ya no tiene estacionalidad) con un índice trimestral del PIB. Se usan trimestres porque el PIB se dispone con esa periodicidad, y se excluyen los de 2020 y 2021, lo que deja 78 trimestres.

**Por qué logaritmos.** Se supone que el tráfico *T* y el PIB se relacionan mediante una potencia, *T = A · PIB^ε^*. Al tomar logaritmos naturales, la relación se convierte en una recta:

*ln T = ln A + ε · ln PIB*

La pendiente de esa recta es la elasticidad *ε*, que indica el porcentaje en que varía el tráfico cuando el PIB varía un 1 %. El Excel la calcula con la función PENDIENTE, que aplica la fórmula de mínimos cuadrados:

*ε = Σ (x − x̄)(y − ȳ) / Σ (x − x̄)^2^, con x = ln PIB e y = ln T*

El resultado es 1,07. Al ser superior a 1, el tráfico del aeropuerto crece algo más rápido que la economía.

**El tráfico anual móvil.** Como complemento, la columna TAM calcula el logaritmo de la suma de cuatro trimestres consecutivos de la media móvil, que se interpreta como el tráfico de un año completo que se desplaza trimestre a trimestre:

*TAM~q~ = ln (T~q~ + T~q−1~ + T~q−2~ + T~q−3~)*

Se representa frente al logaritmo del PIB para comprobar la relación con una magnitud anual y no trimestral.

## Escenarios de crecimiento a 2050

**Por qué escenarios.** Nadie sabe cómo crecerá la economía en los próximos 25 años. En lugar de apostar por un único valor, el Excel define tres escenarios de crecimiento del PIB (pesimista del 1,0 %, base del 1,5 % y optimista del 2,2 %) y calcula el tráfico que resultaría en cada uno. El resultado no es una predicción, sino un rango de demanda plausible dentro del cual debe funcionar el aeropuerto.

**Referencia histórica: la tasa de crecimiento anual compuesta.** Para comprobar que los escenarios son razonables, el Excel calcula a qué ritmo ha crecido realmente el PIB. La tasa de crecimiento anual compuesta (CAGR) es el crecimiento anual constante que llevaría del valor inicial al valor final:

*r = (V~final~ / V~inicial~)^1/t^ − 1*

Con un valor inicial de 91,99 y uno final de 128,15 (cuarto trimestre de 2025) a lo largo de 86 trimestres (21,5 años), resulta *r* = 1,55 % anual. Es muy próxima al escenario base del 1,5 %, lo que lo justifica como hipótesis central.

**De la economía al tráfico.** En cada escenario, el crecimiento anual del tráfico *i* es el del PIB multiplicado por la elasticidad:

*i = ε · g*

con *g* el crecimiento del PIB del escenario. Por ejemplo, en el escenario base *i* = 1,07 · 1,5 % = 1,61 %.

**Demanda futura.** El tráfico crece de forma compuesta, es decir, cada año se aplica el porcentaje sobre el tráfico del año anterior:

*Demanda futura = Tráfico en el origen · (1 + i)^n^*

El tráfico en el origen es el de 2025 (707.493 pasajeros) y *n* = 25 años hasta 2050. La suma de los doce meses de 2025 es el último año completo disponible.

## Del tráfico anual a la hora punta (hoja HP)

**Qué es la hora punta y por qué importa.** Un aeropuerto no se dimensiona para el tráfico medio, sino para los momentos de mayor demanda. Las instalaciones (mostradores de facturación, controles de seguridad, salas de embarque, cintas de equipaje, puertas de embarque, estacionamiento de aeronaves y accesos) deben absorber a la vez a todos los pasajeros de una misma franja horaria. Si se diseñaran para el promedio anual, se saturarían cada verano; si se diseñaran para el instante más extremo del año, estarían sobredimensionadas casi siempre. La **hora punta de diseño** es el criterio habitual para equilibrar ambos extremos: el número de pasajeros en la hora más cargada de un día representativo del mes más cargado. Es el dato que convierte una previsión anual en un tamaño de instalaciones y el que alimenta el cálculo de operaciones y pistas.

**Por qué se hace en tres pasos.** La demanda no se reparte de forma uniforme ni entre los meses, ni entre los días ni entre las horas. Por eso la hoja *HP* desciende de una escala temporal a otra: del año al mes, del mes al día y del día a la hora. El resultado se calcula para los tres escenarios, de modo que cada magnitud tiene tres columnas, según el crecimiento del PIB supuesto (1,0 %, 1,5 % y 2,2 %). La @tbl:columnas explica cada columna.

| Columna | Qué representa | Fórmula | Por qué se calcula |
|:--------|:---------------|:--------|:-------------------|
| Índices (salidas, llegadas, total) | Factor estacional de cada mes | Hoja *Promedios* | Repartir el año entre los meses |
| MMT 1,0 %, 1,5 %, 2,2 % | Pasajeros totales del mes en 2050 en cada escenario | MMT = PAX~2050~ · I~m~ / 12 | Conocer el mes más cargado |
| DMT 1,0 %, 1,5 %, 2,2 % | Pasajeros de un día medio de ese mes | DMT = MMT / 31 | Pasar de la escala mensual a la diaria |
| HDP 1,0 %, 1,5 %, 2,2 % | Pasajeros en la hora punta de ese día | HDP = DMT · 0,11 | Obtener el dato de diseño |

: Columnas de la hoja HP {#tbl:columnas}

**Primer paso: del año al mes (MMT).** Si el tráfico anual se repartiera por igual, cada mes tendría PAX~2050~ / 12 pasajeros. Como no es así, se multiplica por el índice estacional del mes: los meses con índice mayor que 1 reciben más tráfico que el promedio y los de índice menor que 1, menos. Por eso el índice utilizado es el del total y los doce valores suman aproximadamente 12, de manera que el reparto conserva el total anual.

**Segundo paso: del mes al día (DMT).** Se divide el tráfico del mes entre 31 para obtener el de un día medio. El Excel usa 31 para todos los meses, lo que es una simplificación: en los meses de 30 días el valor diario queda un 3 % por debajo del real y en febrero, un 10 %. No afecta al resultado de diseño, porque el mes punta, agosto, tiene 31 días.

**Tercer paso: del día a la hora (HDP).** El tráfico de un día no se reparte de forma uniforme entre las 24 horas, sino que se concentra en oleadas de vuelos. El Excel supone que la hora más cargada concentra el 11 % de los pasajeros del día. Es un parámetro supuesto, sin fuente indicada en el Excel, y es de los que más influyen en el resultado, ya que el dato de diseño es proporcional a él.

**Ejemplo (agosto, escenario base).** Con 1.054.129 pasajeros en 2050 y un índice total de 1,42392:

*MMT = 1.054.129 · 1,42392 / 12 = 125.083 pasajeros en el mes*

*DMT = 125.083 / 31 = 4.035 pasajeros al día*

*HDP = 4.035 · 0,11 = 444 pasajeros en la hora punta*

**Qué valor se toma para el diseño.** De todos los meses se elige el de mayor tráfico, que es agosto, por tener el índice estacional más alto. Por eso en el Excel está resaltada la fila de agosto: sus tres valores de hora punta (389, 444 y 450 pasajeros) son los que se trasladan a la hoja *Operaciones*.

## Operaciones y número de pistas (hoja Operaciones)

**Por qué traducir pasajeros a operaciones.** La capacidad de una pista y del control de tránsito aéreo no se mide en pasajeros, sino en movimientos de aeronaves por hora, es decir, aterrizajes y despegues (operaciones). Para saber si la pista actual es suficiente hay que convertir los pasajeros de la hora punta en operaciones, y eso depende de cuántos pasajeros lleva cada avión.

**Pasajeros por operación.** El Excel supone un avión de 100 plazas con un factor de ocupación del 85 %, es decir, 85 pasajeros por operación. Es un supuesto simplificado que la propia hoja contrasta con datos reales: dividiendo los pasajeros de cada mes entre sus operaciones se obtiene el número real de pasajeros por operación, y su promedio de los últimos 40 meses es de 67,4.

*Pasajeros por operación = Pasajeros del mes / Operaciones del mes*

**Operaciones por hora y pistas.** Con ese dato se obtienen las operaciones de la hora punta y, comparándolas con lo que puede gestionar una pista (entre 40 y 45 operaciones por hora, según la nota del Excel, del que se toma el valor prudente de 40), el número de pistas necesarias:

*Operaciones por hora = HDP / (Capacidad del avión · Factor de ocupación) = HDP / 85*

*Número de pistas = Operaciones por hora / 40*

Un resultado inferior a 1 significa que una sola pista, trabajando a una fracción de su capacidad, atiende toda la demanda de la hora punta.

# Resultados

## Evolución de salidas y llegadas

La @fig:completa muestra la serie completa de salidas y llegadas mensuales, incluidos los meses de la pandemia. El hundimiento de 2020 y 2021 es evidente y justifica su exclusión posterior. Salidas y llegadas evolucionan de forma casi idéntica, con un reparto medio del 50,1 % y el 49,9 %, lo que permite analizar el total sin perder información.

![Salidas y llegadas mensuales, serie completa (gráfico original del Excel). El eje horizontal va del mes más reciente (izquierda) al más antiguo (derecha), como en el Excel.](graficos_excel/serie_completa.png){#fig:completa width=88%}

La @fig:barras y la @fig:lineas presentan la serie una vez retirados 2020 y 2021. En ellas se aprecia el patrón repetido de cada año (máximos en verano y mínimos en invierno) y los cambios en el nivel medio de un periodo a otro.

![Salidas y llegadas mensuales sin el periodo de la pandemia (gráfico original del Excel, mismo orden del eje).](graficos_excel/tendencia_barras.png){#fig:barras width=88%}

![Evolución de salidas y llegadas, en líneas (gráfico original del Excel).](graficos_excel/tendencia_lineas.png){#fig:lineas width=88%}

## Tendencia

La @fig:media recoge la media móvil de salidas y de llegadas. Al desaparecer las oscilaciones estacionales se distinguen con claridad las etapas del aeropuerto. La media móvil total alcanza su máximo en mayo de 2011 (62.731 pasajeros al mes), desciende después hasta un mínimo en 2019 (28.938 en julio, valor sobre el que se hace una advertencia en el apartado 7) y se recupera tras la pandemia hasta situarse en torno a los 56.000-59.000 pasajeros al mes desde 2023. La última tendencia disponible, la de octubre de 2025 (59.066), equivale a unos 708.800 pasajeros anuales, cifra coherente con los 707.493 de 2025.

![Media móvil de 12 meses de salidas y llegadas (gráfico original del Excel).](graficos_excel/media_movil.png){#fig:media width=88%}

## Estacionalidad

La @tbl:indices recoge los índices estacionales medios de la hoja *Promedios*. Cada cifra es el promedio, a lo largo de todos los años disponibles, del cociente entre los pasajeros de un mes y su media móvil. Resume, por tanto, cuánto se aparta ese mes de su nivel de fondo en un año típico. La última columna traduce el índice del total a un porcentaje respecto a un mes medio.

| Mes | Salidas | Llegadas | Total | Total frente al mes medio |
|:----|--------:|---------:|------:|--------:|
| Enero | 0,74 | 0,68 | 0,71 | −29 % |
| Febrero | 0,76 | 0,76 | 0,76 | −24 % |
| Marzo | 0,99 | 0,97 | 0,98 | −2 % |
| Abril | 1,04 | 1,06 | 1,05 | +5 % |
| Mayo | 0,89 | 0,92 | 0,91 | −9 % |
| Junio | 1,05 | 0,98 | 1,02 | +2 % |
| Julio | 1,37 | 1,33 | 1,35 | +35 % |
| Agosto | 1,42 | 1,43 | 1,42 | +42 % |
| Septiembre | 1,09 | 1,16 | 1,13 | +13 % |
| Octubre | 0,98 | 0,99 | 0,98 | −2 % |
| Noviembre | 0,79 | 0,77 | 0,78 | −22 % |
| Diciembre | 0,85 | 0,92 | 0,88 | −12 % |
| Suma | 11,97 | 11,97 | 11,97 | |

: Índice estacional medio por mes (hoja *Promedios*) {#tbl:indices}

**Cómo leer la tabla.** Un índice de 1,00 significa que el mes tiene el tráfico de un mes medio. Un índice de 1,42 (agosto) indica un tráfico un 42 % superior al de su nivel de fondo, y uno de 0,71 (enero), un 29 % inferior. Los índices no dependen del tamaño del aeropuerto: son proporciones, y por eso pueden aplicarse a cualquier nivel de tráfico, incluido el de 2050.

**Qué muestra.** Los meses se agrupan en tres bloques:

- **Temporada alta (julio, agosto y septiembre):** índices de 1,35, 1,42 y 1,13. Es el periodo vacacional y concentra el máximo del año; agosto tiene un 42 % más de pasajeros que un mes medio.
- **Temporada media (marzo, abril, mayo, junio, octubre y diciembre):** índices entre 0,88 y 1,05, próximos a la media. Abril (1,05) y junio (1,02) quedan algo por encima y mayo (0,91) y diciembre (0,88) algo por debajo.
- **Temporada baja (enero, febrero y noviembre):** índices entre 0,71 y 0,78, es decir, entre un 22 % y un 29 % por debajo de la media.

La diferencia entre el mes más fuerte y el más débil es muy marcada: agosto (1,42) tiene el doble de tráfico que enero (0,71). Esta concentración es la que obliga a dimensionar el aeropuerto para el verano y no para el promedio anual.

**Salidas frente a llegadas.** Los índices de salidas y de llegadas son casi iguales, pero presentan algunas diferencias. Enero y junio tienen más peso en las salidas (0,74 frente a 0,68 y 1,05 frente a 0,98), mientras que diciembre y septiembre lo tienen en las llegadas (0,92 frente a 0,85 y 1,16 frente a 1,09). Una posible explicación, que el Excel no permite confirmar, es que el viaje de ida y el de vuelta no coinciden en el mismo mes, por ejemplo con llegadas por las fiestas de diciembre y por el regreso de las vacaciones en septiembre. Como a lo largo del año ambos flujos se compensan (reparto del 50,1 % y el 49,9 %), para el dimensionamiento se utiliza el índice del total.

**Para qué se utilizan después.** Los índices tienen dos usos en el resto del análisis. Sirven para repartir el tráfico anual de 2050 entre los meses (hoja *HP*, apartado 3.6) e identificar así el mes de diseño, que es agosto. Y permiten distinguir si un mes concreto es bajo por ser invierno o porque el tráfico realmente ha caído.

**Limitaciones.** Los índices medios suponen que el patrón estacional es estable en el tiempo, porque promedian todos los años disponibles. Los doce valores suman 11,97 y no exactamente 12, por lo que el reparto mensual que se hace con ellos es una buena aproximación, pero no perfecta.

## Relación con el PIB

**Qué se quiere comprobar.** Antes de utilizar el PIB para prever el tráfico, hay que comprobar que ambas magnitudes están relacionadas y medir cuánto. Para ello sirven los gráficos de dispersión de las @fig:pib y @fig:tam: cada punto es un trimestre, con el logaritmo del PIB en el eje horizontal y el logaritmo del tráfico en el vertical. Si el tráfico dependiera del PIB, los puntos se dispondrían a lo largo de una recta ascendente.

**Por qué se representan logaritmos.** Lo que interesa no es cuántos pasajeros más hay cuando el PIB sube un punto, sino en qué porcentaje aumenta el tráfico cuando el PIB aumenta un porcentaje dado. En una escala logarítmica, las distancias representan variaciones porcentuales. Por eso la pendiente de la recta es directamente el cociente entre la variación porcentual del tráfico y la del PIB (la elasticidad), sin que influyan las unidades de medida: el PIB es un índice y el tráfico se mide en pasajeros.

**Qué representa la @fig:pib.** Es la gráfica de la que se obtiene la elasticidad. Los 78 puntos corresponden a los trimestres sin pandemia. En el eje vertical no se usa el tráfico bruto de cada trimestre, sino su media móvil, que ya no tiene estacionalidad; de lo contrario, las diferencias entre verano e invierno ensancharían la nube y ocultarían la relación con la economía. Los puntos se distribuyen de abajo a la izquierda hacia arriba a la derecha: los periodos con mayor PIB tienden a tener también más tráfico, lo que supone una pendiente positiva. La pendiente de la recta que mejor se ajusta a la nube es 1,07. La nube es, sin embargo, muy dispersa, lo que indica que el PIB explica solo una parte de la variación del tráfico, coherente con el peso de la oferta de las aerolíneas descrito en el apartado 5. El punto aislado de la parte inferior derecha corresponde al trimestre incompleto de 2025 y se comenta en el apartado 7.

![Cada punto es un trimestre: logaritmo del PIB (eje horizontal) frente al logaritmo de la media móvil trimestral del tráfico (eje vertical). La pendiente de la recta de mejor ajuste es la elasticidad (gráfico original del Excel).](graficos_excel/pib_elasticidad.png){#fig:pib width=68%}

**Qué añade la @fig:tam.** Repite la comparación con el tráfico anual móvil (TAM), que suma cuatro trimestres consecutivos, es decir, un año completo. Se hace por dos motivos. Con datos anuales se reducen las fluctuaciones de un trimestre a otro, y el tráfico se expresa en la misma unidad en que suele hacerse la planificación, el año. Además, sirve de contraste: si la relación positiva se mantiene con otra forma de medir el tráfico, no es un resultado casual de usar datos trimestrales. La nube vuelve a ascender, con una dispersión parecida. El Excel solo representa este gráfico y no calcula su pendiente, de modo que la elasticidad que se utiliza es la de la @fig:pib.

![Cada punto es un trimestre: logaritmo del PIB (eje horizontal) frente al logaritmo del tráfico anual móvil, TAM (eje vertical), que suma cuatro trimestres consecutivos de la media móvil (gráfico original del Excel).](graficos_excel/pib_tam.png){#fig:tam width=68%}

**Resultado.** La elasticidad de 1,07 indica que, por cada 1 % de crecimiento del PIB, el tráfico crece un 1,07 %. Por su parte, el PIB crece a una tasa anual compuesta del 1,55 % entre el primer y el último dato. Combinadas, ambas cifras permiten convertir cualquier hipótesis de crecimiento económico en una de crecimiento del tráfico, que es lo que se hace en los escenarios del apartado siguiente.

## Escenarios de demanda en 2050

La @tbl:escenarios recoge los tres escenarios del Excel y el tráfico resultante en 2050.

| Escenario | Crecimiento del PIB | Crecimiento anual del tráfico | Pasajeros en 2050 |
|:----------|--------------------:|------------------------------:|------------------:|
| 1. Pesimista | 1,0 % | 1,07 % | 923.583 |
| 2. Base | 1,5 % | 1,61 % | 1.054.129 |
| 3. Optimista | 2,2 % | 1,67 % | 1.069.258 |

: Escenarios de demanda en 2050 (hoja *PIB*) {#tbl:escenarios}

Partiendo de los 707.493 pasajeros de 2025, los escenarios suponen un aumento del 30,5 %, del 49,0 % y del 51,1 % respectivamente: entre 923.000 y 1.069.000 pasajeros anuales. La fórmula que calcula el tercer escenario merece una revisión, que se explica en el apartado 7.

## Hora punta

Las @tbl:mmt y @tbl:dmt reproducen la tabla de la hoja *HP*. En ellas se aprecia el efecto de cada paso del cálculo.

| Mes | Índice salidas | Índice llegadas | Índice total | MMT 1,0 % | MMT 1,5 % | MMT 2,2 % |
|:----|------:|------:|------:|------:|------:|------:|
| Enero | 0,74 | 0,68 | 0,71 | 54.948 | 62.715 | 63.615 |
| Febrero | 0,76 | 0,76 | 0,76 | 58.266 | 66.502 | 67.456 |
| Marzo | 0,99 | 0,97 | 0,98 | 75.518 | 86.192 | 87.429 |
| Abril | 1,04 | 1,06 | 1,05 | 80.766 | 92.181 | 93.504 |
| Mayo | 0,89 | 0,92 | 0,91 | 69.835 | 79.706 | 80.850 |
| Junio | 1,05 | 0,98 | 1,02 | 78.324 | 89.395 | 90.678 |
| Julio | 1,37 | 1,33 | 1,35 | 103.751 | 118.416 | 120.115 |
| **Agosto** | 1,42 | 1,43 | 1,42 | 109.592 | 125.083 | 126.878 |
| Septiembre | 1,09 | 1,16 | 1,13 | 86.649 | 98.897 | 100.316 |
| Octubre | 0,98 | 0,99 | 0,98 | 75.463 | 86.129 | 87.365 |
| Noviembre | 0,79 | 0,77 | 0,78 | 60.180 | 68.686 | 69.672 |
| Diciembre | 0,85 | 0,92 | 0,88 | 67.992 | 77.603 | 78.717 |

: Pasajeros por mes en 2050 (MMT) según el escenario, con los índices estacionales utilizados (hoja *HP*) {#tbl:mmt}

| Mes | DMT 1,0 % | DMT 1,5 % | DMT 2,2 % | HDP 1,0 % | HDP 1,5 % | HDP 2,2 % |
|:----|------:|------:|------:|------:|------:|------:|
| Enero | 1.773 | 2.023 | 2.052 | 195 | 223 | 226 |
| Febrero | 1.880 | 2.145 | 2.176 | 207 | 236 | 239 |
| Marzo | 2.436 | 2.780 | 2.820 | 268 | 306 | 310 |
| Abril | 2.605 | 2.974 | 3.016 | 287 | 327 | 332 |
| Mayo | 2.253 | 2.571 | 2.608 | 248 | 283 | 287 |
| Junio | 2.527 | 2.884 | 2.925 | 278 | 317 | 322 |
| Julio | 3.347 | 3.820 | 3.875 | 368 | 420 | 426 |
| **Agosto** | 3.535 | 4.035 | 4.093 | 389 | 444 | 450 |
| Septiembre | 2.795 | 3.190 | 3.236 | 307 | 351 | 356 |
| Octubre | 2.434 | 2.778 | 2.818 | 268 | 306 | 310 |
| Noviembre | 1.941 | 2.216 | 2.247 | 214 | 244 | 247 |
| Diciembre | 2.193 | 2.503 | 2.539 | 241 | 275 | 279 |

: Pasajeros por día medio (DMT) y en la hora punta (HDP) de cada mes en 2050 según el escenario (hoja *HP*) {#tbl:dmt}

La lectura es la siguiente. En la @tbl:mmt, el tráfico mensual varía entre unos 55.000-64.000 pasajeros en enero, el mes más bajo, y unos 110.000-127.000 en agosto, el más alto, según el escenario: el mes punta tiene el doble de tráfico que el valle. En la @tbl:dmt, esos valores se convierten en entre 1.773 y 4.093 pasajeros al día y en entre 195 y 450 en la hora punta. El valor de diseño es el de agosto: **389, 444 y 450 pasajeros por hora** en los escenarios pesimista, base y optimista. Obsérvese que la diferencia entre escenarios es mayor entre el pesimista y el base (un 14 %) que entre el base y el optimista (un 1 %), por el motivo explicado en el apartado 7.

## Operaciones y pistas

La @tbl:pistas traduce los pasajeros de la hora punta en operaciones y en número de pistas.

| Magnitud | Pesimista | Base | Optimista |
|:---------|----------:|-----:|----------:|
| Pasajeros en la hora punta | 389 | 444 | 450 |
| Operaciones por hora (÷ 85) | 4,6 | 5,2 | 5,3 |
| Pistas necesarias (÷ 40) | 0,11 | 0,13 | 0,13 |

: Operaciones por hora y pistas necesarias en 2050 (hoja *Operaciones*) {#tbl:pistas}

En todos los escenarios se necesitan entre 4,6 y 5,3 operaciones por hora (389 / 85 = 4,6; 450 / 85 = 5,3), frente a una capacidad de 40 a 45 por pista, es decir, entre un 11 % y un 13 % de la capacidad de una sola pista (4,6 / 40 = 0,11; 5,3 / 40 = 0,13). La conclusión del Excel es que **con una pista basta en cualquier situación**. El valor de 85 pasajeros por operación es coherente con lo observado en el mes punta actual: en agosto de 2025, con 73.934 pasajeros y 849 operaciones, se registraron 87,1 pasajeros por operación (el promedio de los últimos 40 meses es de 67,4).

# Contexto: por qué el tráfico se comporta así

Los datos del Excel muestran qué ha ocurrido, pero no por qué. Para interpretarlos conviene tener en cuenta algunos factores externos, tomados de fuentes públicas.

**Dependencia de la oferta de las aerolíneas.** El tráfico de pasajeros de un aeropuerto regional depende sobre todo de las rutas y frecuencias que ofrecen las aerolíneas, y en Zaragoza tiene un peso especial la aerolínea de bajo coste Ryanair (El Español, 2026). Esto permite entender que el aeropuerto cambie de nivel de forma brusca por decisiones de las aerolíneas, con independencia de la evolución de la economía en general. Es también la razón por la que la relación con el PIB, aunque positiva, es solo una parte de la explicación.

**Cambios de nivel.** La serie muestra un periodo de fuerte crecimiento hasta 2011, una caída sostenida en los años siguientes y una recuperación posterior a la pandemia. La nueva terminal, inaugurada en marzo de 2008 con motivo de la Expo de Zaragoza, amplió la capacidad del aeropuerto hasta un millón de pasajeros al año (Wikipedia, s. f.-a). Las causas concretas de cada cambio de nivel no figuran en el Excel y requerirían un estudio específico de las rutas de cada periodo.

**Situación posterior al Excel.** Los datos terminan en abril de 2026. En septiembre de 2025, Ryanair anunció un recorte del 45 % de su capacidad en Zaragoza, que atribuyó a la subida de las tasas aeroportuarias de Aena (Aragón Digital, 2025). Según la información publicada, en agosto de 2026 el aeropuerto registró 63.717 pasajeros, un 13,8 % menos que un año antes, y entre enero y agosto de 2026 acumuló 453.930 pasajeros, un 5,2 % menos que en el mismo periodo de 2025 (El Español, 2026). Este descenso es relevante porque los escenarios parten del tráfico de 2025.

# Qué se consigue con estos datos

El análisis del Excel convierte una serie histórica de pasajeros en una previsión dimensionada, paso a paso:

- **La tendencia (media móvil) y el índice estacional** separan el nivel de fondo de la demanda de su patrón anual.
- **La elasticidad** relaciona ese nivel con la economía, de modo que la demanda futura puede proyectarse a partir de escenarios de crecimiento del PIB, en lugar de depender de una única hipótesis.
- **Los tres escenarios** acotan el tráfico de 2050 entre unos 923.000 y 1.069.000 pasajeros anuales.
- **El reparto mensual y la hora punta** traducen ese tráfico anual en la demanda que debe soportar el aeropuerto en su momento más exigente.
- **Las operaciones y el número de pistas** permiten concluir si la infraestructura actual es suficiente: con una pista basta en cualquier escenario.

# Observaciones sobre los datos y los cálculos

Durante la revisión se han detectado varios puntos que conviene comprobar antes de usar los resultados. Las cifras señaladas como cálculo propio no figuran en el Excel y se han obtenido repitiendo sus fórmulas.

- **Trimestre parcial en la elasticidad.** El primer punto de la regresión (cuarto trimestre de 2025) contiene solo octubre (59.066 pasajeros, frente a unos 177.000 de un trimestre completo). Es el punto aislado que se ve en la parte inferior derecha de la @fig:pib y reduce la elasticidad. Sin ese punto, la elasticidad es de 1,50 en lugar de 1,07 (cálculo propio), y los escenarios de 1,0 %, 1,5 % y 2,2 % darían unos 1,03, 1,24 y 1,60 millones de pasajeros en 2050. Además, la relación explica poco de la variación del tráfico (R² de 0,11 con el dato parcial y de 0,22 sin él, cálculo propio), por lo que la elasticidad debe tomarse como una estimación aproximada.
- **Escenario optimista.** Su etiqueta indica un crecimiento del PIB del 2,2 %, pero la fórmula multiplica la elasticidad por la tasa histórica del 1,55 %, no por el 2,2 %. Por eso su resultado (1.069.258) es casi igual al del escenario base. Con el 2,2 % indicado en la etiqueta resultarían unos 1.267.000 pasajeros (cálculo propio).
- **Parámetros de la hora punta.** El factor del 11 % no tiene fuente indicada y el reparto diario divide todos los meses entre 31 días. La hoja *Operaciones* calcula un promedio de 67,4 pasajeros por operación, pero después usa 85. Con el promedio observado se obtendrían entre 5,8 y 6,7 operaciones por hora (cálculo propio), cifra que sigue muy por debajo de la capacidad de una pista, de modo que la conclusión no cambia.
- **Datos de 2019.** La suma de los meses de 2019 en el Excel es de 344.978 pasajeros. Según el balance publicado de Aena, el aeropuerto cerró 2019 con 467.774 pasajeros, de los cuales 345.301 fueron internacionales y 120.421 nacionales (Aragón Digital, 2020). La cifra del Excel se aproxima a la de pasajeros internacionales y no al total, mientras que en los demás años contrastados (2011 a 2014, 2017, 2018, 2020 y 2025) el Excel coincide con las cifras publicadas (Wikipedia, s. f.-b). Es posible que los datos de 2019 se hayan tomado de una categoría parcial, lo que afectaría a la media móvil de 2018 y 2019, y el mínimo de 2019 de la @fig:media podría estar infravalorado.
- **Unión de 2019 y 2022.** Al eliminar 2020 y 2021, la media móvil de agosto a diciembre de 2019 y de enero a mayo de 2022 (diez meses) mezcla meses de ambos años. Su efecto sobre los índices medios es muy pequeño (inferior a 0,01 en cualquier mes, cálculo propio).
- **Índice del PIB.** El Excel no indica su fuente, su ámbito ni su año base. El primer trimestre de cada año es siempre inferior al cuarto del año anterior, lo que sugiere que no está desestacionalizado. Además, el valor inicial de la tasa de crecimiento se etiqueta como «PIB 2004 T1», pero corresponde al tercer trimestre de 2004, y faltan los trimestres de 2020 y 2021.
- **Columna de variación interanual.** En la primera hoja utiliza el valor absoluto en parte de los meses y muestra como aumento algunas caídas (agosto de 2019 aparece como +41,3 % cuando fue una caída). No debe emplearse sin corregir.

<!-- pagebreak -->

# Anexo. Resumen de las fórmulas utilizadas {-}

La @tbl:formulas reúne las fórmulas generales de cada apartado, en el orden en que se aplican.

| Magnitud | Fórmula | Hoja |
|:---------|:--------|:-----|
| Pasajeros totales | Total = Salidas + Llegadas | Análisis tendencia |
| Reparto de salidas | % salidas = Salidas / Total | Análisis tendencia |
| Media móvil centrada de 12 meses | MM~t~ = (1/12) · [0,5 · X~t−6~ + X~t−5~ + … + X~t+5~ + 0,5 · X~t+6~] | Análisis tendencia |
| Índice estacional de un mes | I~t~ = X~t~ / MM~t~ | Análisis tendencia |
| Índice estacional medio | I~m~ = (1/N) · Σ I~t~; control: Σ I~m~ ≈ 12 | Promedios |
| Media móvil trimestral | Suma de la media móvil de los 3 meses del trimestre | Media móvil total |
| Logaritmos | ln T = LN(media móvil trimestral); ln PIB = LN(PIB) | PIB |
| Elasticidad | ε = PENDIENTE(ln T ; ln PIB) | PIB |
| Tráfico anual móvil | TAM~q~ = ln (T~q~ + T~q−1~ + T~q−2~ + T~q−3~) | PIB |
| Crecimiento anual compuesto del PIB | r = (V~final~ / V~inicial~)^1/t^ − 1 | PIB |
| Crecimiento anual del tráfico | i = ε · g | PIB |
| Demanda futura | PAX~2050~ = PAX~2025~ · (1 + i)^n^, con n = 25 | PIB |
| Pasajeros del mes | MMT = PAX~2050~ · I~m~ / 12 | HP |
| Pasajeros del día medio | DMT = MMT / 31 | HP |
| Pasajeros en la hora punta | HDP = DMT · 0,11 | HP |
| Pasajeros por operación | Pasajeros del mes / Operaciones del mes | Operaciones |
| Operaciones por hora | HDP / (100 · 0,85) | Operaciones |
| Número de pistas | Operaciones por hora / 40 | Operaciones |

: Fórmulas generales empleadas en el análisis {#tbl:formulas}

<!-- pagebreak -->

# Referencias {-}

::: referencias
Aena. (2026). *El Aeropuerto de Zaragoza cierra 2025 con más de 707.000 pasajeros*. https://www.aena.es/es/prensa/el-aeropuerto-de-zaragoza-cierra-2025-con-mas-de-707.000-pasajeros.html

Aragón Digital. (2020, 13 de enero). *El Aeropuerto de Zaragoza bate el récord de tráfico de mercancías con más de 180.000 toneladas*. https://www.aragondigital.es/articulo/economia/el-aeropuerto-de-zaragoza-bate-el-record-de-trafico-de-mercancias-con-mas-de-180-000-toneladas/20200113123405777703.html

Aragón Digital. (2025, 3 de septiembre). *Ryanair recorta un 45 % su capacidad en Zaragoza tras la subida de tasas de Aena*. https://www.aragondigital.es/articulo/espana/ryanair-recorta-capacidad-zaragoza-subida-tasas-aena/20250903100841940024.html

El Español. (2026, 23 de septiembre). *El Aeropuerto de Zaragoza pierde 10.000 pasajeros en agosto respecto a 2025: la mayoría fueron internacionales*. https://www.elespanol.com/aragon/actualidad/20260923/aeropuerto-zaragoza-pierde-pasajeros-agosto-respecto-mayoria-internacionales/1003744392896_0.html

Wikipedia. (s. f.-a). *Aeropuerto de Zaragoza*. https://es.wikipedia.org/wiki/Aeropuerto_de_Zaragoza

Wikipedia. (s. f.-b). *Zaragoza Airport*. https://en.wikipedia.org/wiki/Zaragoza_Airport
:::
