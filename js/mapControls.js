let customPointsLayer = null;

function initializeMapControls() {
  setupZoomControls();
  setupNavigationControls();
  setupToolControls();
  setupPanelControls();
  setupLegendControls(false);
  setupSearchControls();
}

function setupZoomControls() {
  // Controles de zoom
  const zoomInBtn = document.querySelector('.btn-zoom-in');
  const zoomOutBtn = document.querySelector('.btn-zoom-out');

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function () {
      if (window.AppGlobals.view && window.AppGlobals.view.zoom) {
        window.AppGlobals.view.goTo({ zoom: window.AppGlobals.view.zoom + 1 });
      }
      animateButtonClick(this);
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function () {
      if (window.AppGlobals.view && window.AppGlobals.view.zoom) {
        window.AppGlobals.view.goTo({ zoom: window.AppGlobals.view.zoom - 1 });
      }
      animateButtonClick(this);
    });
  }
}

function setupNavigationControls() {
  // Funcionalidad del botón inicio
  const homeBtn = document.querySelector('.btn-home');
  if (homeBtn) {
    homeBtn.addEventListener('click', function () {
      if (window.AppGlobals.view && window.AppGlobals.initialExtent) {
        window.AppGlobals.view.goTo(window.AppGlobals.initialExtent);
        clearFeatureHighlight();
      }
      animateButtonClick(this);
    });
  }

  // Funcionalidad del botón capas
  const layersBtn = document.querySelector('.btn-layers');
  if (layersBtn) {
    layersBtn.addEventListener('click', function () {
     toggleLayersPanel();
      animateButtonClick(this);
    });
  }
}

function setupToolControls() {
  // Funcionalidad de botones de herramientas
  const searchBtn = document.querySelector('.btn-search');

  if (searchBtn) {
    let isSearchVisible = false;
    const searchContainer = document.getElementById('search-container');

    searchBtn.addEventListener('click', function () {
      isSearchVisible =  !searchContainer.classList.contains('show');
      //isSearchVisible = !isSearchVisible;

      if (isSearchVisible) {
        showSearch();
      } else {
        hideSearch();
      }

      animateButtonClick(this);

      function showSearch() {
        searchContainer.classList.add('show');
      }

      function hideSearch() {
        searchContainer.classList.remove('show');
      }
    });
  }
}

function setupPanelControls() {
  // Botón de alternar panel (en controles izquierdos)
  const panelToggleBtn = document.querySelector('.btn-panel-toggle');
  if (panelToggleBtn) {
    panelToggleBtn.addEventListener('click', function () {
      togglePanel();
      animateButtonClick(this);
    });
  }
}

function setupLegendControls(updateCounts = true) {
  const legendEls = getLegendElements();
  if (!legendEls) {
    return false;
  }
  const { legendToggleBtn } = legendEls;

  if (legendToggleBtn) {
    let isLegendExpanded = true;

    legendToggleBtn.addEventListener('click', function () {
      isLegendExpanded = !isLegendExpanded;

      if (isLegendExpanded) {
        showLegend();
      } else {
        hideLegend();
      }

      animateButtonClick(this);
    });
  }

  if (updateCounts) {
    updateLegendCounts();
  }
}

function showLegend() {
  const legendEls = getLegendElements();
  if (!legendEls) return false;
  const { legendContent, legendChevron } = legendEls;
  const legendDivider = document.getElementById('legend-divider');

  legendContent.style.maxWidth = '360px';
  legendContent.style.opacity = '1';
  legendContent.style.pointerEvents = 'auto';
  if (legendDivider) legendDivider.style.display = 'block';

  legendChevron.setAttribute('data-lucide', 'chevron-left');
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  updateLegendCounts();
  return true;
}

function hideLegend() {
  const legendEls = getLegendElements();
  if (!legendEls) return false;
  const { legendContent, legendChevron } = legendEls;
  const legendDivider = document.getElementById('legend-divider');

  legendContent.style.maxWidth = '0px';
  legendContent.style.opacity = '0';
  legendContent.style.pointerEvents = 'none';
  if (legendDivider) legendDivider.style.display = 'none';

  legendChevron.setAttribute('data-lucide', 'chevron-right');
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  return true;
}

function getLegendElements() {
  const legendContent = document.getElementById('legend-content');
  const legendToggleBtn = document.getElementById('legend-toggle-btn');
  const legendChevron = document.getElementById('legend-chevron');
  if (!legendContent || !legendToggleBtn || !legendChevron) {
    return null;
  }
  return { legendContent, legendToggleBtn, legendChevron };
}

// Filtrar mapa al hacer clic en los estados de la leyenda
window.filterByLegendStatus = function(status) {
  const activeChip = document.querySelector('.quick-filter-status.active');
  const targetChip = document.querySelector(`.quick-filter-status[data-value="${status}"]`);
  const allChip = document.querySelector('.quick-filter-status[data-value="all"]');

  if (activeChip && activeChip.getAttribute('data-value') === status && allChip) {
    // Si ya está activo, volver a mostrar todos
    allChip.click();
  } else if (targetChip) {
    targetChip.click();
  }
};

// Actualizar contadores de proyectos de la leyenda
async function updateLegendCounts() {
  try {
    const projectCounts = await getProjectCountsFromMapLayers();

    const concludedCount = document.getElementById('concluded-count');
    const executionCount = document.getElementById('execution-count');
    const programmedCount = document.getElementById('programmed-count');
    const pendingCount = document.getElementById('pending-count');

    if (concludedCount) {
      animateCounterUpdate(concludedCount, projectCounts.concluded);
    }
    if (executionCount) {
      animateCounterUpdate(executionCount, projectCounts.execution);
    }
    if (programmedCount) {
      animateCounterUpdate(programmedCount, projectCounts.programmed);
    }
    if (pendingCount) {
      animateCounterUpdate(pendingCount, projectCounts.pending);
    }
  } catch (error) {
    console.error('MapControls: Error al actualizar contadores de leyenda:', error);
  }
}

// Obtener conteos de proyectos desde los modelos locales
async function getProjectCountsFromMapLayers() {
  const projects = window.LOCAL_PROJECTS_DATA || [];
  const counts = {
    concluded: projects.filter((p) => p.statusCode === 'concluded').length,
    execution: projects.filter((p) => p.statusCode === 'execution').length,
    programmed: projects.filter((p) => p.statusCode === 'programmed').length,
    pending: projects.filter((p) => p.statusCode === 'pending').length,
  };
  return counts;
}

// Configurar controles de búsqueda
function setupSearchControls() {
  if (typeof SearchManager !== 'undefined') {
    window.searchManager = new SearchManager();
    window.searchManager.initialize();
  } else {
    console.error('SearchManager no está disponible. Verifique que searchManager.js esté cargado.');
  }

  setupAdvancedSearchToggle();
}

function setupAdvancedSearchToggle() {
  const advancedToggle = document.getElementById('advanced-search-toggle');
  const advancedPanel = document.getElementById('advanced-search-panel');

  if (advancedToggle && advancedPanel) {
    advancedToggle.addEventListener('click', function () {
      const isHidden = advancedPanel.classList.contains('hidden');

      if (isHidden) {
        advancedPanel.classList.remove('hidden');
      } else {
        advancedPanel.classList.add('hidden');
      }
    });
  }
}

function addPointToMap(longitude, latitude, options = {}) {
  const map = window.AppGlobals.leafletMap;
  if (!map) return;

  if (!customPointsLayer) {
    customPointsLayer = L.layerGroup().addTo(map);
  }

  const marker = L.circleMarker([latitude, longitude], {
    color: '#3b82f6',
    fillColor: '#60a5fa',
    fillOpacity: 0.8,
    radius: 8,
  });

  if (options.title || options.description) {
    marker.bindPopup(`<b>${options.title || 'Punto'}</b><br>${options.description || ''}`);
  }

  customPointsLayer.addLayer(marker);
}

function clearAllCustomPoints() {
  if (customPointsLayer) {
    customPointsLayer.clearLayers();
  }
}