let currentZonalFilter = ['all'];
let zonalCounts = {};
let dropdownOverlay = null;
let isMultiSelectMode = true;
let temporaryZonalFilter = ['all'];
let zonalesData = [];
let isZonalesLoaded = false;

// Función para mostrar dropdown
function showZonalDropdown() {
  const dropdown = document.getElementById('zonal-dropdown');
  const toggleButton = document.getElementById('zonal-filter-toggle');

  if (!dropdown || !toggleButton) return;

  temporaryZonalFilter = [...currentZonalFilter];

  const buttonRect = toggleButton.getBoundingClientRect();
  const scrollY = window.scrollY || document.documentElement.scrollTop;
  const scrollX = window.scrollX || document.documentElement.scrollLeft;

  const dropdownHeight = 300;
  const spaceBelow = window.innerHeight - buttonRect.bottom;
  const spaceAbove = buttonRect.top;

  let top, bottom;
  if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
    top = buttonRect.bottom + scrollY + 4;
    bottom = 'auto';
  } else {
    top = 'auto';
    bottom = window.innerHeight - buttonRect.top - scrollY + 4;
  }

  dropdown.style.position = 'fixed';
  dropdown.style.left = `${buttonRect.left + scrollX}px`;
  dropdown.style.zIndex = '9999';

  if (top !== 'auto') {
    dropdown.style.top = `${top}px`;
    dropdown.style.bottom = 'auto';
  } else {
    dropdown.style.top = 'auto';
    dropdown.style.bottom = `${bottom}px`;
  }

  createDropdownOverlay();
  dropdown.classList.remove('hidden', 'hide');
  dropdown.classList.add('show');

  restoreCheckboxStates();
  updateSelectedCount();
  updateZonalOptionsUI();
  updateZonalCounts();

  if (isAllZonalesSelected()) {
    selectAllZonales();
  }
}

// Ocultar el dropdown
function hideZonalDropdown() {
  const dropdown = document.getElementById('zonal-dropdown');

  if (!dropdown) return;

  temporaryZonalFilter = [...currentZonalFilter];

  dropdown.classList.remove('show');
  dropdown.classList.add('hide');
  removeDropdownOverlay();

  setTimeout(() => {
    dropdown.classList.add('hidden');
    dropdown.classList.remove('hide');
  }, 150);
}

// Crear el overlay del dropdown
function createDropdownOverlay() {
  removeDropdownOverlay();
  dropdownOverlay = document.createElement('div');
  dropdownOverlay.className = 'zonal-dropdown-overlay';
  dropdownOverlay.addEventListener('click', hideZonalDropdown);
  document.body.appendChild(dropdownOverlay);
}

// Remover overlay
function removeDropdownOverlay() {
  if (dropdownOverlay && dropdownOverlay.parentNode) {
    dropdownOverlay.parentNode.removeChild(dropdownOverlay);
    dropdownOverlay = null;
  }
}

// Crear dropdown dinámicamente
async function createZonalDropdown() {
  const existingDropdown = document.getElementById('zonal-dropdown');
  if (existingDropdown) {
    existingDropdown.remove();
  }

  if (!isZonalesLoaded) {
    await loadZonalesFromService();
  }

  const dropdown = document.createElement('div');
  dropdown.id = 'zonal-dropdown';
  dropdown.className = 'hidden';
  dropdown.innerHTML = `
        <div class="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span class="text-xs font-medium text-gray-700">Seleccionar UZ</span>
            <div class="flex gap-1">
                <button id="select-all-zonales" class="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded">
                    Todas
                </button>
                <button id="clear-all-zonales" class="text-xs text-gray-600 hover:text-gray-700 px-2 py-1 rounded">
                    Ninguna
                </button>
            </div>
        </div>

        <div class="zonal-option w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2 cursor-pointer border-b border-gray-100"
                data-zonal-value="all">
            <div class="checkbox-container">
                <input type="checkbox" 
                       id="checkbox-all" 
                       class="zonal-checkbox w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                       data-zonal-value="all"
                       checked>
            </div>
            <i data-lucide="layers" class="w-3 h-3 text-blue-500"></i>
            <span class="flex-1 font-medium">Todas las Unidades Zonales</span>
            <span class="text-gray-500 text-xs zonal-count" id="all-zonales-count">${getTotalOptionsCount()}</span>
        </div>

        <div class="max-h-48 overflow-y-auto">
            ${getZonalOptionsHTML()}
        </div>

        <div class="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span class="text-xs text-gray-600" id="selected-count">1 seleccionada</span>
            <div class="flex gap-2">
                <button id="cancel-zonal-filter" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium hidden">
                    Cancelar
                </button>
                <button id="apply-zonal-filter" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium">
                    Aplicar Filtro
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(dropdown);
  setupZonalCheckboxListeners(dropdown);
  setupZonalControlButtons(dropdown);

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Listar las Unidades Zonales / Departamentos locales
async function loadZonalesFromService() {
  const projects = window.LOCAL_PROJECTS_DATA || [];
  const uniqueDepts = [...new Set(projects.map((p) => p.location.department))];

  zonalesData = uniqueDepts.map((dept, index) => {
    const proj = projects.find((p) => p.location.department === dept);
    return {
      value: (index + 1).toString(),
      name: `${dept} (${proj ? proj.cNomArea : 'Zonal'})`,
      nameOriginal: dept,
      code: dept.toUpperCase(),
      codeDoc: `ZON-${index + 1}`,
    };
  });

  isZonalesLoaded = true;
  return zonalesData;
}

// Generar HTML de opciones zonales
function getZonalOptionsHTML() {
  if (!zonalesData || zonalesData.length === 0) {
    return '<div class="px-3 py-2 text-xs text-gray-500">Cargando unidades zonales...</div>';
  }

  return zonalesData
    .map(
      (zonal) => `
        <div class="zonal-option w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                data-zonal-value="${zonal.value}">
            <div class="checkbox-container">
                <input type="checkbox"
                       id="checkbox-${zonal.value}" 
                       class="zonal-checkbox w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                       data-zonal-value="${zonal.value}">
                <label for="checkbox-${zonal.value}" class="sr-only">${zonal.name}</label>
            </div>
            <i data-lucide="map-pin" class="w-3 h-3 text-gray-500"></i>
            <span class="flex-1">${zonal.name}</span>
        </div>
    `,
    )
    .join('');
}

// Configurar event listeners para checkboxes
function setupZonalCheckboxListeners(dropdown) {
  const checkboxes = dropdown.querySelectorAll('.zonal-checkbox');

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      handleZonalCheckboxChange(checkbox);
    });
  });

  const zonalOptions = dropdown.querySelectorAll('.zonal-option');
  zonalOptions.forEach((option) => {
    option.addEventListener('click', (e) => {
      if (e.target.type !== 'checkbox' && e.target.tagName !== 'BUTTON') {
        const checkbox = option.querySelector('.zonal-checkbox');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          handleZonalCheckboxChange(checkbox);
        }
      }
    });
  });
}

// Configurar botones de control
function setupZonalControlButtons(dropdown) {
  const selectAllBtn = dropdown.querySelector('#select-all-zonales');
  const clearAllBtn = dropdown.querySelector('#clear-all-zonales');
  const applyBtn = dropdown.querySelector('#apply-zonal-filter');
  const cancelBtn = dropdown.querySelector('#cancel-zonal-filter');

  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      selectAllZonales();
    });
  }

  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearAllZonales();
    });
  }

  if (applyBtn) {
    applyBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      window.searchManager.quickFilterActivatedByClick = true;
      await applySelectedZonales();
      hideZonalDropdown();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      hideZonalDropdown();
    });
  }
}

// Manejar cambios en checkboxes
function handleZonalCheckboxChange(checkbox) {
  const value = checkbox.dataset.zonalValue;
  const isChecked = checkbox.checked;

  if (value === 'all') {
    handleSelectAllCheckbox(isChecked);
  } else {
    handleIndividualCheckbox(value, isChecked);
  }

  updateSelectedCount();
  updateZonalOptionsUI();
}

// Manejar checkbox "Todas"
function handleSelectAllCheckbox(isChecked) {
  const dropdown = document.getElementById('zonal-dropdown');
  const individualCheckboxes = dropdown.querySelectorAll('.zonal-checkbox:not([data-zonal-value="all"])');

  individualCheckboxes.forEach((cb) => {
    cb.checked = isChecked;
  });

  if (isChecked) {
    const allValues = getAllZonalValues();
    temporaryZonalFilter = ['all', ...allValues];
  } else {
    temporaryZonalFilter = [];
  }
}

// Manejar checkboxes individuales
function handleIndividualCheckbox(value, isChecked) {
  if (isChecked) {
    if (!temporaryZonalFilter.includes(value)) {
      temporaryZonalFilter.push(value);
    }
    if (temporaryZonalFilter.includes('all') && temporaryZonalFilter.length === 1) {
      temporaryZonalFilter = temporaryZonalFilter.filter((v) => v !== 'all');
      temporaryZonalFilter.push(value);
    }
  } else {
    temporaryZonalFilter = temporaryZonalFilter.filter((v) => v !== value);

    const allCheckbox = document.querySelector('#checkbox-all');
    if (allCheckbox) {
      allCheckbox.checked = false;
    }
    temporaryZonalFilter = temporaryZonalFilter.filter((v) => v !== 'all');
  }

  const totalIndividualZonales = getTotalOptionsCount();
  const selectedIndividualZonales = temporaryZonalFilter.filter((v) => v !== 'all').length;

  if (selectedIndividualZonales === totalIndividualZonales) {
    const allCheckbox = document.querySelector('#checkbox-all');
    if (allCheckbox && !allCheckbox.checked) {
      allCheckbox.checked = true;
      if (!temporaryZonalFilter.includes('all')) {
        temporaryZonalFilter.unshift('all');
      }
    }
  }
}

function isAllZonalesSelected() {
  return (
    Array.isArray(currentZonalFilter) &&
    currentZonalFilter.includes('all')
  );
}

// Seleccionar todas las zonales
function selectAllZonales() {
  const dropdown = document.getElementById('zonal-dropdown');
  const checkboxes = dropdown.querySelectorAll('.zonal-checkbox');

  checkboxes.forEach((cb) => {
    cb.checked = true;
  });

  const allValues = ['all', ...getAllZonalValues()];
  temporaryZonalFilter = [...allValues];

  updateSelectedCount();
  updateZonalOptionsUI();
}

// Limpiar todas las selecciones
function clearAllZonales() {
  const dropdown = document.getElementById('zonal-dropdown');
  const checkboxes = dropdown.querySelectorAll('.zonal-checkbox');

  checkboxes.forEach((cb) => {
    cb.checked = false;
  });

  temporaryZonalFilter = [];

  updateSelectedCount();
  updateZonalOptionsUI();
}

// Actualizar contador de seleccionados
function updateSelectedCount() {
  const countElement = document.getElementById('selected-count');
  if (!countElement) return;

  const selectedCount = temporaryZonalFilter.filter((v) => v !== 'all').length;

  if (currentZonalFilter.includes('all')) {
    countElement.textContent = 'Todas seleccionadas';
  } else if (selectedCount === 0) {
    countElement.textContent = 'Ninguna seleccionada';
  } else if (selectedCount === 1) {
    countElement.textContent = '1 seleccionada';
  } else {
    countElement.textContent = `${selectedCount} seleccionadas`;
  }
}

// Aplicar filtros seleccionados
async function applySelectedZonales() {
  if (temporaryZonalFilter.length === 0) {
      window.notificationHelper.warning('Debe seleccionar al menos una unidad zonal', {       
        position: 'top-center',
        duration: 3000,
      });
    return;
  }

  currentZonalFilter = [...temporaryZonalFilter];

  await applyMultiZonalFilter(currentZonalFilter);
  updateZonalFilterButtonText();  
}

// Actualizar UI de opciones zonales
function updateZonalOptionsUI() {
  const zonalOptions = document.querySelectorAll('.zonal-option');

  zonalOptions.forEach((option) => {
    const value = option.dataset.zonalValue;
    const isSelected = temporaryZonalFilter.includes(value);

    if (isSelected) {
      option.style.backgroundColor = '#dbeafe';
      option.classList.add('selected');
    } else {
      option.style.backgroundColor = 'transparent';
      option.classList.remove('selected');
    }
  });
}

// Actualizar texto del botón de filtro
function updateZonalFilterButtonText() {
  const zonalFilterToggle = document.getElementById('zonal-filter-toggle');
  const zonalText = zonalFilterToggle.querySelector('#zonal-filter-text');

  if (!zonalFilterToggle || !zonalText) return;

  zonalFilterToggle.classList.add('active');

  if (currentZonalFilter.includes('all') || currentZonalFilter.length === 19) {
    zonalText.textContent = 'Unidades Zonales';
  } else if (currentZonalFilter.length === 0) {
    zonalText.textContent = 'Sin filtro';
    zonalFilterToggle.classList.remove('active');
  } else if (currentZonalFilter.length === 1) {
    const zonalName = getZonalName(currentZonalFilter[0]);
    zonalText.textContent = zonalName;
  } else {
    zonalText.textContent = `${currentZonalFilter.length} zonales`;
  }
}

// Aplicar filtro multi-zonal al mapa
async function applyMultiZonalFilter(selectedZonales) {
  const zonalIds = selectedZonales.filter((v) => v !== 'all');
  temporaryZonalFilter = [...selectedZonales];
  console.log(zonalIds.join(','));

  await window.searchManager.executeSearch();
}

function getTotalOptionsCount() {
  if (!zonalesData || zonalesData.length === 0) {
    return 0;
  }

  const totalCount = zonalesData.reduce((sum, zonal) => sum + (zonal.count || 0), 0);
  return totalCount > 0 ? totalCount : zonalesData.length;
}

// Toggle dropdown
function toggleZonalDropdown() {
  const dropdown = document.getElementById('zonal-dropdown');

  if (!dropdown) {
    createZonalDropdown();
    showZonalDropdown();
    return;
  }

  if (dropdown.classList.contains('hidden') || dropdown.style.display === 'none') {
    showZonalDropdown();
  } else {
    hideZonalDropdown();
  }
}

// Seleccionar filtro zonal
async function selectZonalFilter(zonalValue) {
  if (Array.isArray(zonalValue)) {
    currentZonalFilter = [...zonalValue];
  } else {
    currentZonalFilter = [zonalValue];
  }

  await applyMultiZonalFilter(currentZonalFilter);
  updateZonalFilterButtonText();

  const dropdown = document.getElementById('zonal-dropdown');
  if (dropdown && !dropdown.classList.contains('hidden')) {
    updateCheckboxStates();
    updateSelectedCount();
    updateZonalOptionsUI();
  }
}

// Actualizar estados de checkboxes
function updateCheckboxStates() {
  const checkboxes = document.querySelectorAll('.zonal-checkbox');

  checkboxes.forEach((checkbox) => {
    const value = checkbox.dataset.zonalValue;
    checkbox.checked = currentZonalFilter.includes(value);
  });
}

// Obtener nombre de zonal
function getZonalName(zonalValue) {
  const zonal = zonalesData.find((item) => item.value === zonalValue);

  if (zonal) {
    return zonal.name;
  }

  return '';
}

// Obtener todos los valores de las zonales
function getAllZonalValues() {
  if (!zonalesData || zonalesData.length === 0) {
    return [];
  }

  return zonalesData.map((zonal) => zonal.value).filter((value) => value && value !== 'all');
}

// Inicializar filtro zonal
function initializeZonalFilter() {
  const zonalToggle = document.getElementById('zonal-filter-toggle');

  if (!zonalToggle) {
    console.warn('ZonalFilter: Botón toggle no encontrado');
    return;
  }

  createZonalDropdown();

  zonalToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleZonalDropdown();
  });

  window.addEventListener('resize', () => {
    const dropdown = document.getElementById('zonal-dropdown');
    if (dropdown && !dropdown.classList.contains('hidden')) {
      hideZonalDropdown();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const dropdown = document.getElementById('zonal-dropdown');
      if (dropdown && !dropdown.classList.contains('hidden')) {
        hideZonalDropdown();
      }
    }
  });
}

// Limpiar filtro zonal
function cleanupZonalFilter() {
  removeDropdownOverlay();

  const dropdown = document.getElementById('zonal-dropdown');
  if (dropdown && dropdown.parentNode) {
    dropdown.parentNode.removeChild(dropdown);
  }
}

// Resetear filtro
function resetZonalFilter() {
  selectZonalFilter(['all']);
}

// Obtener filtro actual
function getCurrentZonalFilter() {
  return currentZonalFilter;
}

// Actualizar contadores
async function updateZonalCounts() {
  try {
    console.log('ZonalFilter: Actualizando contadores...');
  } catch (error) {
    console.error('ZonalFilter: Error general al actualizar contadores:', error);
  }
}

function restoreCheckboxStates() {
  const checkboxes = document.querySelectorAll('.zonal-checkbox');

  checkboxes.forEach((checkbox) => {
    const value = checkbox.dataset.zonalValue;
    checkbox.checked = temporaryZonalFilter.includes(value);
  });

  temporaryZonalFilter = [...currentZonalFilter];
}

// Limpieza automática
window.addEventListener('beforeunload', cleanupZonalFilter);

window.ZonalFilter = {
  initialize: initializeZonalFilter,
  select: selectZonalFilter,
  reset: resetZonalFilter,
  isAllSelected: isAllZonalesSelected,
  getCurrentFilter: getCurrentZonalFilter,
  updateCounts: updateZonalCounts,
  cleanup: cleanupZonalFilter,
  toggle: toggleZonalDropdown,
  show: showZonalDropdown,
  hide: hideZonalDropdown,
};