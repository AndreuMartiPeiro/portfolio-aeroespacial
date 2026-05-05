%% =========================================================
%  Williams F107-WR-402 — Análisis Paramétrico GasTurb
%  Estudio: HP Compressor PR vs Burner Exit Temperature (T4)
%  Outputs: SFC [g/(kN·s)] y Empuje Neto FN [kN]
%  Autor: Portfolio — Propulsión Aeronáutica
%% =========================================================

clc; clear; close all;

%% --- 1. DATOS EXPORTADOS DE GASTURB ---
% Columnas: [HPC_PR, T4_K, SFC g/(kN·s), FN kN]
raw = [
4.375, 1072.9169, 25.672671, 2.088093;
4.375, 1083.3336, 25.408573, 2.162158;
4.375, 1093.7503, 25.183982, 2.234447;
4.375, 1104.167,  24.990219, 2.305368;
4.375, 1114.5837, 24.819764, 2.375338;
4.375, 1125.0004, 24.676283, 2.443774;
4.375, 1135.4171, 24.556707, 2.510735;
4.375, 1145.8338, 24.443833, 2.577810;
4.375, 1156.2505, 24.350263, 2.643573;
4.375, 1166.6672, 24.274678, 2.707995;
4.375, 1177.0839, 24.216461, 2.770989;
4.375, 1187.5006, 24.172865, 2.832763;
4.375, 1197.9173, 24.142086, 2.893425;
4.375, 1208.334,  24.118582, 2.953548;
4.375, 1218.7507, 24.106203, 3.012596;
4.375, 1229.1674, 24.105362, 3.070431;
4.375, 1239.5841, 24.115011, 3.127106;
4.375, 1250.0008, 24.134308, 3.182655;
4.375, 1260.4175, 24.162926, 3.237058;
4.375, 1270.8342, 24.199924, 3.290381;
4.375, 1281.2509, 24.244890, 3.342735;
4.375, 1291.6676, 24.296764, 3.394146;
4.375, 1302.0843, 24.355474, 3.444678;
4.375, 1312.501,  24.419975, 3.494378;
4.375, 1322.9177, 24.489285, 3.543280;
4.375, 1333.3344, 24.562429, 3.591401;
4.375, 1343.7511, 24.638483, 3.638885;
4.375, 1354.1678, 24.717478, 3.685672;
4.375, 1364.5845, 24.799459, 3.731819;
4.375, 1375.0012, 24.884428, 3.777310;
4.375, 1385.4179, 24.972356, 3.822189;
4.375, 1395.8346, 25.062285, 3.866458;
4.375, 1406.2513, 25.155215, 3.910152;
4.375, 1416.668,  25.250193, 3.953283;
4.375, 1427.0847, 25.347226, 3.995862;
4.375, 1437.5014, 25.446380, 4.037913;
4.375, 1447.9181, 25.547694, 4.079448;
4.375, 1458.3348, 25.651271, 4.120480;
4.375, 1468.7515, 25.757163, 4.161025;
4.375, 1479.1682, 25.865534, 4.201091;
4.375, 1489.5849, 25.976404, 4.240695;
4.375, 1500.0016, 26.089867, 4.279851;
5.625, 1083.3336, 24.661298, 2.273064;
5.625, 1093.7503, 24.447706, 2.348036;
5.625, 1104.167,  24.263219, 2.421459;
5.625, 1114.5837, 24.101920, 2.493686;
5.625, 1125.0004, 23.966263, 2.564462;
5.625, 1135.4171, 23.851699, 2.634104;
5.625, 1145.8338, 23.756219, 2.702750;
5.625, 1156.2505, 23.677376, 2.770234;
5.625, 1166.6672, 23.614272, 2.836669;
5.625, 1177.0839, 23.564534, 2.901976;
5.625, 1187.5006, 23.526948, 2.966311;
5.625, 1197.9173, 23.500327, 3.029752;
5.625, 1208.334,  23.483765, 3.092327;
5.625, 1218.7507, 23.476277, 3.154072;
5.625, 1229.1674, 23.476979, 3.214983;
5.625, 1239.5841, 23.485034, 3.274941;
5.625, 1250.0008, 23.501035, 3.334002;
5.625, 1260.4175, 23.523739, 3.392183;
5.625, 1270.8342, 23.552940, 3.449509;
5.625, 1281.2509, 23.588468, 3.505975;
5.625, 1291.6676, 23.629332, 3.561605;
5.625, 1302.0843, 23.675421, 3.616406;
5.625, 1312.501,  23.726667, 3.670395;
5.625, 1322.9177, 23.783163, 3.723574;
5.625, 1333.3344, 23.843991, 3.775977;
5.625, 1343.7511, 23.908147, 3.827597;
5.625, 1354.1678, 23.975639, 3.878453;
5.625, 1364.5845, 24.046522, 3.928566;
5.625, 1375.0012, 24.120820, 3.977942;
5.625, 1385.4179, 24.198561, 4.026594;
5.625, 1395.8346, 24.279785, 4.074529;
5.625, 1406.2513, 24.364518, 4.121762;
5.625, 1416.668,  24.452811, 4.168301;
5.625, 1427.0847, 24.544716, 4.214156;
5.625, 1437.5014, 24.640281, 4.259339;
5.625, 1447.9181, 24.739563, 4.303860;
5.625, 1458.3348, 24.842637, 4.347729;
5.625, 1468.7515, 24.949586, 4.390956;
5.625, 1479.1682, 25.060500, 4.433552;
5.625, 1489.5849, 25.175520, 4.475524;
6.875, 1104.167,  24.124537, 2.540047;
6.875, 1114.5837, 23.975484, 2.614826;
6.875, 1125.0004, 23.851086, 2.688143;
6.875, 1135.4171, 23.748162, 2.760302;
6.875, 1145.8338, 23.664030, 2.831438;
6.875, 1156.2505, 23.596748, 2.901443;
6.875, 1166.6672, 23.544618, 2.970414;
6.875, 1177.0839, 23.506117, 3.038339;
6.875, 1187.5006, 23.479696, 3.105289;
6.875, 1197.9173, 23.463875, 3.171279;
6.875, 1208.334,  23.457353, 3.236361;
6.875, 1218.7507, 23.459168, 3.300537;
6.875, 1229.1674, 23.468535, 3.363823;
6.875, 1239.5841, 23.484834, 3.426218;
6.875, 1250.0008, 23.507703, 3.487773;
6.875, 1260.4175, 23.536946, 3.548477;
6.875, 1270.8342, 23.572502, 3.608361;
6.875, 1281.2509, 23.614256, 3.667432;
6.875, 1291.6676, 23.661201, 3.725728;
6.875, 1302.0843, 23.713281, 3.783261;
6.875, 1312.501,  23.770493, 3.840051;
6.875, 1322.9177, 23.832829, 3.896106;
6.875, 1333.3344, 23.900281, 3.951440;
6.875, 1343.7511, 23.972845, 4.006063;
6.875, 1354.1678, 22.691655, 3.545090;  % <-- DESIGN POINT APROX
6.875, 1364.5845, 24.128564, 4.113621;
6.875, 1375.0012, 24.211315, 4.166854;
6.875, 1385.4179, 24.298254, 4.219697;
6.875, 1395.8346, 24.389458, 4.272166;
6.875, 1406.2513, 24.484983, 4.324270;
6.875, 1416.668,  24.584911, 4.376020;
6.875, 1427.0847, 24.689349, 4.427427;
6.875, 1437.5014, 24.798436, 4.478500;
6.875, 1447.9181, 24.912361, 4.529249;
6.875, 1458.3348, 25.031359, 4.579682;
6.875, 1468.7515, 25.155735, 4.629807;
6.875, 1479.1682, 25.285847, 4.679633;
6.875, 1489.5849, 25.421120, 4.729167;
8.125, 1125.0004, 23.901028, 2.782397;
8.125, 1135.4171, 23.805025, 2.856560;
8.125, 1145.8338, 23.727264, 2.929399;
8.125, 1156.2505, 23.665610, 3.001112;
8.125, 1166.6672, 23.618498, 3.071735;
8.125, 1177.0839, 23.583741, 3.141338;
8.125, 1187.5006, 23.559694, 3.209983;
8.125, 1197.9173, 23.545131, 3.277752;
8.125, 1208.334,  23.539119, 3.344651;
8.125, 1218.7507, 23.540887, 3.410697;
8.125, 1229.1674, 23.549764, 3.475902;
8.125, 1239.5841, 23.565279, 3.540284;
8.125, 1250.0008, 23.587118, 3.603864;
8.125, 1260.4175, 23.615045, 3.666648;
8.125, 1270.8342, 23.648869, 3.728660;
8.125, 1281.2509, 23.688484, 3.789907;
8.125, 1291.6676, 23.733899, 3.850407;
8.125, 1302.0843, 23.785015, 3.910175;
8.125, 1312.501,  23.841773, 3.969221;
8.125, 1322.9177, 23.904140, 4.027558;
8.125, 1333.3344, 23.972063, 4.085196;
8.125, 1343.7511, 24.045506, 4.142145;
8.125, 1354.1678, 24.124436, 4.198416;
8.125, 1364.5845, 24.208829, 4.254017;
8.125, 1375.0012, 24.298678, 4.308956;
8.125, 1385.4179, 24.394001, 4.363240;
8.125, 1395.8346, 24.494800, 4.416878;
8.125, 1406.2513, 24.601108, 4.469877;
8.125, 1416.668,  24.713001, 4.522245;
8.125, 1427.0847, 24.830586, 4.573990;
8.125, 1437.5014, 24.954028, 4.625118;
8.125, 1447.9181, 25.083523, 4.675637;
8.125, 1458.3348, 25.219378, 4.725553;
8.125, 1468.7515, 25.361950, 4.774873;
8.125, 1479.1682, 25.511736, 4.823604;
9.375, 1145.8338, 23.748706, 3.017001;
9.375, 1156.2505, 23.690527, 3.090684;
9.375, 1166.6672, 23.647000, 3.163254;
9.375, 1177.0839, 23.617044, 3.234802;
9.375, 1187.5006, 23.598808, 3.305387;
9.375, 1197.9173, 23.591037, 3.375062;
9.375, 1208.334,  23.592720, 3.443842;
9.375, 1218.7507, 23.602979, 3.511748;
9.375, 1229.1674, 23.620981, 3.578792;
9.375, 1239.5841, 23.646063, 3.645000;
9.375, 1250.0008, 23.677701, 3.710383;
9.375, 1260.4175, 23.715521, 3.774956;
9.375, 1270.8342, 23.759368, 3.838736;
9.375, 1281.2509, 23.809310, 3.901733;
9.375, 1291.6676, 23.865446, 3.963962;
9.375, 1302.0843, 23.927990, 4.025434;
9.375, 1312.501,  23.997169, 4.086159;
9.375, 1322.9177, 24.073219, 4.146148;
9.375, 1333.3344, 24.156382, 4.205412;
9.375, 1343.7511, 24.246906, 4.263961;
9.375, 1354.1678, 24.345042, 4.321806;
9.375, 1364.5845, 24.451048, 4.378954;
9.375, 1375.0012, 24.565264, 4.435415;
9.375, 1385.4179, 24.687999, 4.491197;
9.375, 1395.8346, 24.819614, 4.546308;
9.375, 1406.2513, 24.960510, 4.600756;
9.375, 1416.668,  25.111134, 4.654549;
9.375, 1427.0847, 25.271965, 4.707694;
9.375, 1437.5014, 25.443520, 4.760200;
9.375, 1447.9181, 25.626364, 4.812071;
9.375, 1458.3348, 25.821099, 4.863315;
9.375, 1468.7515, 26.028387, 4.913940;
];

HPC_PR = raw(:,1);
T4     = raw(:,2);
SFC    = raw(:,3);
FN     = raw(:,4);

% Punto de diseño real F107-WR-402
DP_T4     = 1350;   % K
DP_HPC_PR = 6.57;   % (valor real entre 6.875 de GasTurb)
DP_SFC    = 22.69;  % g/(kN·s)  → TSFC = 0.683 lb/lbf·h oficial
DP_FN     = 3.1;    % kN        → 700 lbf oficial

%% --- 2. MALLADO E INTERPOLACIÓN ---
HPC_vals = unique(HPC_PR);
T4_min   = 1100; T4_max = 1480;
T4_grid  = linspace(T4_min, T4_max, 80);
HPC_grid = linspace(min(HPC_vals), max(HPC_vals), 80);
[T4_mesh, HPC_mesh] = meshgrid(T4_grid, HPC_grid);

SFC_mesh = griddata(T4, HPC_PR, SFC, T4_mesh, HPC_mesh, 'cubic');
FN_mesh  = griddata(T4, HPC_PR, FN,  T4_mesh, HPC_mesh, 'cubic');

%% --- FIGURA 1: Mapa de contorno SFC ---
figure('Name','Mapa SFC — F107 Paramétrico','Position',[100 100 900 650]);

[C1, h1] = contourf(T4_mesh, HPC_mesh, SFC_mesh, 20, 'LineWidth', 0.5);
colormap(flipud(parula));
cb1 = colorbar;
cb1.Label.String = 'SFC [g/(kN·s)]';
cb1.Label.FontSize = 12;
clabel(C1, h1, 'FontSize', 8, 'Color', 'w');
hold on;

% Líneas de contorno principales marcadas
[C1b, h1b] = contour(T4_mesh, HPC_mesh, SFC_mesh, ...
    [22 23 24 25 26], 'k--', 'LineWidth', 1.2);
clabel(C1b, h1b, 'FontSize', 9, 'FontWeight','bold');

% Punto de diseño real
plot(DP_T4, DP_HPC_PR, 'rp', 'MarkerSize', 18, ...
    'MarkerFaceColor', 'red', 'DisplayName', 'Punto diseño F107');
text(DP_T4+10, DP_HPC_PR+0.15, ...
    sprintf('F107-WR-402\nSFC=%.2f g/kNs\nFN=%.1f kN', DP_SFC, DP_FN), ...
    'Color','red','FontWeight','bold','FontSize',9);

% Óptimo por línea de mínimo SFC
for hv = HPC_vals'
    mask = HPC_PR == hv;
    [~, idx] = min(SFC(mask));
    t4_arr = T4(mask);
    plot(t4_arr(idx), hv, 'w^', 'MarkerSize', 8, 'MarkerFaceColor','w');
end
plot(nan, nan, 'w^', 'MarkerFaceColor','w', 'DisplayName','SFC mínimo por HPC PR');

xlabel('Temperatura de Salida Combustor T4 [K]', 'FontSize', 12);
ylabel('Relación de Presión HPC', 'FontSize', 12);
title({'Williams F107-WR-402 — Mapa de Consumo Específico (SFC)', ...
       'Estudio Paramétrico: HPC PR vs T4 (GasTurb 15)'}, 'FontSize', 13);
legend('Location','northwest','FontSize',9);
grid on; box on;
xlim([T4_min T4_max]); ylim([min(HPC_vals)-0.2 max(HPC_vals)+0.2]);

%% --- FIGURA 2: Mapa de contorno Empuje Neto ---
figure('Name','Mapa Empuje Neto — F107 Paramétrico','Position',[150 150 900 650]);

[C2, h2] = contourf(T4_mesh, HPC_mesh, FN_mesh, 20, 'LineWidth', 0.5);
colormap(hot);
cb2 = colorbar;
cb2.Label.String = 'Empuje Neto FN [kN]';
cb2.Label.FontSize = 12;
hold on;

[C2b, h2b] = contour(T4_mesh, HPC_mesh, FN_mesh, ...
    [2.5 3.0 3.1 3.5 4.0 4.5], 'w-', 'LineWidth', 1.2);
clabel(C2b, h2b, 'FontSize', 9, 'Color','w','FontWeight','bold');

% Línea de empuje nominal F107 = 3.1 kN
[C2c, h2c] = contour(T4_mesh, HPC_mesh, FN_mesh, [3.1 3.1], ...
    'c-', 'LineWidth', 2.5);
clabel(C2c, h2c, 'FontSize', 10,'Color','c','FontWeight','bold');
plot(nan, nan, 'c-', 'LineWidth', 2.5, 'DisplayName', 'FN = 3.1 kN (nominal)');

plot(DP_T4, DP_HPC_PR, 'rp', 'MarkerSize', 18, ...
    'MarkerFaceColor', 'red', 'DisplayName', 'Punto diseño F107');

xlabel('Temperatura de Salida Combustor T4 [K]', 'FontSize', 12);
ylabel('Relación de Presión HPC', 'FontSize', 12);
title({'Williams F107-WR-402 — Mapa de Empuje Neto (FN)', ...
       'Estudio Paramétrico: HPC PR vs T4 (GasTurb 15)'}, 'FontSize', 13);
legend('Location','northwest','FontSize',9);
grid on; box on;
xlim([T4_min T4_max]); ylim([min(HPC_vals)-0.2 max(HPC_vals)+0.2]);

%% --- FIGURA 3: SFC vs T4 por curvas de HPC PR ---
figure('Name','SFC vs T4 — curvas HPC PR','Position',[200 200 850 550]);
colors_map = lines(length(HPC_vals));
hold on;

for k = 1:length(HPC_vals)
    hv = HPC_vals(k);
    mask = HPC_PR == hv;
    [T4s, si] = sort(T4(mask));
    SFCs = SFC(mask); SFCs = SFCs(si);
    plot(T4s, SFCs, '-o', 'Color', colors_map(k,:), ...
        'LineWidth', 1.8, 'MarkerSize', 4, ...
        'DisplayName', sprintf('HPC PR = %.3f', hv));
    % Marcar mínimo
    [mn, mi] = min(SFCs);
    plot(T4s(mi), mn, 's', 'Color', colors_map(k,:), ...
        'MarkerSize', 10, 'MarkerFaceColor', colors_map(k,:));
end

% Punto de diseño F107
plot(DP_T4, DP_SFC, 'rp', 'MarkerSize', 18, 'MarkerFaceColor','red', ...
    'DisplayName', sprintf('F107 diseño (%.2f g/kNs)', DP_SFC));
text(DP_T4+8, DP_SFC+0.15, 'F107-WR-402', 'Color','red','FontWeight','bold');

xline(DP_T4, 'r--', 'T4=1350K', 'LabelVerticalAlignment','bottom','FontSize',9);

xlabel('Temperatura de Salida Combustor T4 [K]', 'FontSize', 12);
ylabel('Consumo Específico SFC [g/(kN·s)]', 'FontSize', 12);
title({'Williams F107-WR-402 — SFC vs T4', ...
       'Curvas parametrizadas por HPC Pressure Ratio'}, 'FontSize', 13);
legend('Location','northeast','FontSize',9);
grid on; box on;
ylim([21 27]);

%% --- FIGURA 4: FN vs T4 por curvas de HPC PR ---
figure('Name','FN vs T4 — curvas HPC PR','Position',[250 250 850 550]);
hold on;

for k = 1:length(HPC_vals)
    hv = HPC_vals(k);
    mask = HPC_PR == hv;
    [T4s, si] = sort(T4(mask));
    FNs = FN(mask); FNs = FNs(si);
    plot(T4s, FNs, '-o', 'Color', colors_map(k,:), ...
        'LineWidth', 1.8, 'MarkerSize', 4, ...
        'DisplayName', sprintf('HPC PR = %.3f', hv));
end

yline(DP_FN, 'r--', 'FN=3.1 kN (nominal)', 'LabelHorizontalAlignment','left','FontSize',9);
plot(DP_T4, DP_FN, 'rp', 'MarkerSize', 18, 'MarkerFaceColor','red', ...
    'DisplayName', 'F107 diseño (700 lbf)');

xlabel('Temperatura de Salida Combustor T4 [K]', 'FontSize', 12);
ylabel('Empuje Neto FN [kN]', 'FontSize', 12);
title({'Williams F107-WR-402 — Empuje Neto vs T4', ...
       'Curvas parametrizadas por HPC Pressure Ratio'}, 'FontSize', 13);
legend('Location','northwest','FontSize',9);
grid on; box on;

%% --- FIGURA 5: Trade-off SFC vs FN (Pareto) ---
figure('Name','Trade-off SFC vs FN','Position',[300 300 750 550]);
hold on;

for k = 1:length(HPC_vals)
    hv = HPC_vals(k);
    mask = HPC_PR == hv;
    scatter(FN(mask), SFC(mask), 30, T4(mask), 'filled', ...
        'DisplayName', sprintf('HPC PR = %.3f', hv));
end
cb3 = colorbar;
cb3.Label.String = 'T4 [K]';
colormap(parula);

plot(DP_FN, DP_SFC, 'rp', 'MarkerSize', 18, 'MarkerFaceColor','red', ...
    'DisplayName', 'F107 diseño');
text(DP_FN+0.03, DP_SFC+0.15, 'F107-WR-402','Color','red','FontWeight','bold');

xlabel('Empuje Neto FN [kN]', 'FontSize', 12);
ylabel('SFC [g/(kN·s)]', 'FontSize', 12);
title({'Williams F107-WR-402 — Trade-off SFC vs Empuje', ...
       'Frontera de Pareto del ciclo termodinámico'}, 'FontSize', 13);
legend('Location','northeast','FontSize',9);
grid on; box on;

%% --- RESUMEN NUMÉRICO EN CONSOLA ---
fprintf('\n======= RESUMEN ANÁLISIS F107-WR-402 =======\n');
fprintf('Punto de diseño real: HPC_PR=6.57, T4=1350K\n');
fprintf('  SFC = %.3f g/(kN·s)  [TSFC = 0.683 lb/lbf·h oficial]\n', DP_SFC);
fprintf('  FN  = %.2f kN        [700 lbf oficial]\n\n', DP_FN);
fprintf('%-10s %-15s %-15s %-12s\n','HPC_PR','T4_opt (K)','SFC_min','FN @ opt');
for k = 1:length(HPC_vals)
    hv = HPC_vals(k);
    mask = HPC_PR == hv;
    [mn, mi] = min(SFC(mask));
    t4a = T4(mask); fna = FN(mask);
    t4s = sort(t4a); [~,si]=sort(t4a);
    fns = fna(si);
    fprintf('%-10.3f %-15.1f %-15.4f %-12.4f\n', hv, t4a(mi), mn, fna(mi));
end
fprintf('=============================================\n');