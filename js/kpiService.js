/**
 * kpiService.js - Barra Flotante de KPIs Ejecutivos y Métricas Globales de Cartera
 * Calcula y actualiza dinámicamente:
 * - Inversión Total PIM (en millones o moneda local)
 * - Población Beneficiaria total estimada
 * - Avance Físico Promedio Ponderado
 * - Cantidad de Obras filtradas
 */

function updateExecutiveKpis(projectsList) {
  const allProjects = window.LOCAL_PROJECTS_DATA || [];
  const projects = projectsList !== undefined ? projectsList : allProjects;

  const countEl = document.getElementById('kpi-project-count');
  const invEl = document.getElementById('kpi-total-investment');
  const benEl = document.getElementById('kpi-total-beneficiaries');
  const progLabel = document.getElementById('kpi-avg-progress-label');
  const progBar = document.getElementById('kpi-avg-progress-bar');

  if (!projects || projects.length === 0) {
    if (countEl) countEl.textContent = '0 Obras';
    if (invEl) invEl.textContent = 'S/ 0 M';
    if (benEl) benEl.textContent = '0 hab.';
    if (progLabel) progLabel.textContent = '0%';
    if (progBar) progBar.style.width = '0%';
    return;
  }

  // 1. Contador de Obras
  if (countEl) {
    countEl.textContent = projects.length === 1 ? '1 Obra Activa' : `${projects.length} Obras`;
  }

  // 2. Inversión Total (PIM)
  const totalInvestment = projects.reduce(
    (acc, p) => acc + (Number(p.aPim) || Number(p.dCosContractual) || 0),
    0
  );

  if (invEl) {
    if (totalInvestment >= 1000000) {
      invEl.textContent = `S/ ${(totalInvestment / 1000000).toFixed(1)} M`;
    } else {
      invEl.textContent = `S/ ${Number(totalInvestment).toLocaleString('es-PE')}`;
    }
    invEl.title = `Inversión total exacta: S/ ${Number(totalInvestment).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  }

  // 3. Población Beneficiaria
  let totalBeneficiaries = 0;
  projects.forEach((p) => {
    if (p.beneficiaries) {
      const match = String(p.beneficiaries).replace(/,/g, '').match(/\d+/);
      if (match) {
        totalBeneficiaries += parseInt(match[0], 10);
      }
    }
  });

  if (benEl) {
    if (totalBeneficiaries >= 1000) {
      benEl.textContent = `${(totalBeneficiaries / 1000).toFixed(1)}k hab.`;
    } else {
      benEl.textContent = `${totalBeneficiaries} hab.`;
    }
    benEl.title = `Población total beneficiada: ${totalBeneficiaries.toLocaleString('es-PE')} personas`;
  }

  // 4. Avance Físico Promedio
  const totalProgress = projects.reduce((acc, p) => acc + (Number(p.progress) || 0), 0);
  const avgProgress = (totalProgress / projects.length).toFixed(1);

  if (progLabel) progLabel.textContent = `${avgProgress}%`;
  if (progBar) {
    progBar.style.width = `${Math.min(100, Math.max(0, avgProgress))}%`;
  }
}

// Alternar colapso / expansión de la barra de métricas
function toggleKpiBar() {
  const container = document.getElementById('kpi-metrics-container');
  const sep = document.getElementById('kpi-sep-1');
  const chevron = document.getElementById('kpi-chevron');
  if (!container) return;

  const isHidden = container.classList.contains('hidden');
  if (isHidden) {
    container.classList.remove('hidden');
    container.style.opacity = '1';
    if (sep) sep.classList.remove('hidden');
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  } else {
    container.classList.add('hidden');
    container.style.opacity = '0';
    if (sep) sep.classList.add('hidden');
    if (chevron) chevron.style.transform = 'rotate(180deg)';
  }
}

window.updateExecutiveKpis = updateExecutiveKpis;
window.toggleKpiBar = toggleKpiBar;

