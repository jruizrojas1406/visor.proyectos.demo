let isCountLayerLoaded = false;

function initializeLayersPanel() {
  setupLayersPanelEvents();
  setupLayersToggles();
}

function setupLayersPanelEvents() {
  const toggleBtn = document.getElementById('layers-panel-toggle');
  const panelToggleBtn = document.getElementById('toggle-layers-panel');
  const toggleAllLayersBtns = document.getElementsByClassName('layer-control-btn');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleLayersPanel);
  }

  if (panelToggleBtn) {
    panelToggleBtn.addEventListener('click', toggleLayersPanel);
  }

  Array.from(toggleAllLayersBtns).forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('show')) {
        showAllLayers();
      } else {
        hideAllLayers();
      }
    });
  });
}

// Mostrar/Ocultar panel de capas
function toggleLayersPanel() {
  const panel = document.getElementById('layers-panel');

  if (panel) {
    const isOpen = panel.classList.contains('open');

    if (isOpen) {
      panel.classList.remove('open');
    } else {
      panel.classList.add('open');
      updateLayerCounts();
    }

    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

function setupLayersToggles() {
  const layerCheckboxes = document.querySelectorAll('.layer-checkbox');

  layerCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const layerKey = event.target.value;
      const isChecked = event.target.checked;
      toggleLayerVisibility(layerKey, isChecked);
    });
  });
}

function getLayerKeys() {
  return ['concluded', 'execution', 'programmed', 'pending', 'infrastructure'];
}

function getLayersVisibilityState() {
  const layerKeys = getLayerKeys();
  const state = {};

  if (window.AppGlobals.leafletMap && window.AppGlobals.leafletLayers) {
    layerKeys.forEach((key) => {
      const lGroup = window.AppGlobals.leafletLayers[key];
      state[key] = lGroup ? window.AppGlobals.leafletMap.hasLayer(lGroup) : false;
    });
    return state;
  }

  layerKeys.forEach((key) => {
    const layer = window.AppGlobals.featureLayers ? window.AppGlobals.featureLayers[key] : null;
    state[key] = layer ? layer.visible : false;
  });

  return state;
}

function toggleLayerVisibility(layerKey, visible = null) {
  if (window.AppGlobals.leafletMap && window.AppGlobals.leafletLayers) {
    const lGroup = window.AppGlobals.leafletLayers[layerKey];
    if (lGroup) {
      const isCurrentlyVisible = window.AppGlobals.leafletMap.hasLayer(lGroup);
      const shouldBeVisible = visible === null ? !isCurrentlyVisible : visible;
      if (shouldBeVisible) {
        window.AppGlobals.leafletMap.addLayer(lGroup);
      } else {
        window.AppGlobals.leafletMap.removeLayer(lGroup);
      }
      return shouldBeVisible;
    }
  }

  const layer = window.AppGlobals.featureLayers && window.AppGlobals.featureLayers[layerKey];
  if (!layer) {
    return false;
  }

  if (visible === null) {
    layer.visible = !layer.visible;
  } else {
    layer.visible = visible;
  }

  return layer.visible;
}

function toggleCheckboxState(checkbox, checked = true) {
  if (checkbox) {
    checkbox.checked = checked;
  }
}

function findCheckboxByLayerKey(layerKey) {
  return Array.from(document.querySelectorAll('.layer-checkbox')).find((checkbox) => checkbox.value === layerKey);
}

function toggleLayerCheckbox(layerKey, checked = true) {
  const checkbox = findCheckboxByLayerKey(layerKey);
  toggleCheckboxState(checkbox, checked);
}

function hideAllLayers() {
  const layerKeys = Object.entries(getLayersVisibilityState());

  layerKeys.forEach(([key, value]) => {
    if (value) {
      toggleLayerCheckbox(key, false);
      toggleLayerVisibility(key, false);
    }
  });
}

function showAllLayers() {
  const layerKeys = Object.entries(getLayersVisibilityState());

  layerKeys.forEach(([key, value]) => {
    if (!value) {
      toggleLayerCheckbox(key, true);
      toggleLayerVisibility(key, true);
    }
  });
}

async function updateLayerCounts() {
  try {
    if (isCountLayerLoaded) return;

    const projectCounts = await getProjectCountsFromMapLayers();

    const concludedCount = document.getElementById('layer-concluded-count');
    const executionCount = document.getElementById('layer-execution-count');
    const programmedCount = document.getElementById('layer-programmed-count');
    const pendingCount = document.getElementById('layer-pending-count');

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

    isCountLayerLoaded = true;
  } catch (error) {
    console.error('LayersPanel: Error al actualizar contadores:', error);
  }
}

function zoomToLayer(layerId) {
  // Soporte nativo para Leaflet
  if (window.AppGlobals.leafletMap && window.AppGlobals.leafletLayers) {
    const lGroup = window.AppGlobals.leafletLayers[layerId];
    if (lGroup && lGroup.getLayers().length > 0) {
      const groupBounds = L.featureGroup(lGroup.getLayers()).getBounds();
      window.AppGlobals.leafletMap.fitBounds(groupBounds, { maxZoom: 13, padding: [60, 60] });
      return;
    } else {
      if (window.notificationHelper) {
        window.notificationHelper.warning('La capa no tiene elementos visibles');
      }
      return;
    }
  }

  if (!window.AppGlobals.view) {
    if (window.notificationHelper) {
      window.notificationHelper.warning('Vista del mapa no disponible');
    }
    return;
  }
}
