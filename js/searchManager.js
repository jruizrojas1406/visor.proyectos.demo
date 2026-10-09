/**
 * SearchManager - Manejador del control de busqueda de proyectos.
 * Maneja todos los tipos de búsqueda: simple, rápida y avanzada
 */
class SearchManager {
  constructor() {
    this.isSearching = false;
    this.searchCache = new Map();
    this.lastSearchTerm = '';
    this.searchTimeout = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.debounceDelay = 300; // 300ms
    this.currentPage = 1;
    this.pageSize = 10;
    this.totalResults = 0;
    this.totalPages = 0;
    this.currentResults = [];
    this.quickFilterActivatedByClick = false;
  }

  // =============================
  // INICIALIZACIÓN
  // =============================

  initialize() {
    this.setupEventListeners();
    this.setupFooterEvents();
    this.setupQuickFilters();
  }

  setupEventListeners() {
    const searchInput = document.getElementById('map-search-input');
    const clearBtn = document.getElementById('search-clear-btn');
    const advancedBtn = document.getElementById('apply-advanced-search');
    const clearAdvancedBtn = document.getElementById('clear-advanced-filters');
    const hiddenAdvancedBtn = document.getElementById('hidden-advanced-search');
    const closeSearchPanelBtn = document.getElementById('close-search-panel-btn');

    if (searchInput) {
      //searchInput.addEventListener('input', () => this.handleSearchInput());
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();

          if (searchInput.value.length < 3) {
            window.notificationHelper.warning('El término de búsqueda debe tener al menos 3 caracteres.');
            this.displayNoResults('simple');
            return;
          }

          this.executeSearch();
          //this.handleSearchInput();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearSearch());
    }

    if (advancedBtn) {
      advancedBtn.addEventListener('click', () => this.executeAdvancedSearch());
    }

    if (clearAdvancedBtn) {
      clearAdvancedBtn.addEventListener('click', () => this.clearAdvancedFilters());
    }

    if (hiddenAdvancedBtn) {
      hiddenAdvancedBtn.addEventListener('click', () => this.hiddenAdvancedSearch());
    }

    if (closeSearchPanelBtn) {
      closeSearchPanelBtn.addEventListener('click', () => this.closeSearchPanel());
    }
  }

  setupQuickFilters() {
    const quickFilters = document.querySelectorAll('.quick-filter-status');
    quickFilters.forEach((filter) => {
      filter.addEventListener('click', () => {
        quickFilters.forEach((f) => f.classList.remove('active'));
        filter.classList.add('active');
        this.quickFilterActivatedByClick = true;
        setTimeout(() => this.executeSearch(), 100);
      });
    });
  }

  setupFooterEvents() {
    const verTodosBtn = document.querySelector('#search-footer button:first-of-type');
    const exportarBtn = document.querySelector('#search-footer button:last-of-type');

    if (verTodosBtn) {
      verTodosBtn.addEventListener('click', () => this.showAllResults());
    }

    if (exportarBtn) {
      exportarBtn.addEventListener('click', () => this.exportResults());
    }
  }

  // =============================
  // MANEJO DE BÚSQUEDAS
  // =============================

  handleSearchInput() {
    const searchInput = document.getElementById('map-search-input');
    const clearBtn = document.getElementById('search-clear-btn');

    if (!searchInput || !clearBtn) return;

    const hasValue = searchInput.value.trim().length > 0;
    const currentTerm = searchInput.value.trim();

    // Mostrar/ocultar botón de limpiar
    this.toggleClearButton(clearBtn, hasValue);

    // Evitar búsquedas duplicadas
    if (currentTerm === this.lastSearchTerm) return;

    // Limpiar timeout anterior
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (hasValue && currentTerm.length >= 2) {
      this.searchTimeout = setTimeout(() => {
        this.executeSearch();
      }, this.debounceDelay);
    } else if (!hasValue) {
      this.clearResults();
    }
  }

  async executeSearch(page = 1) {
    if (this.isSearching) {
      console.log('Búsqueda en progreso...');
      return;
    }

    try {
      this.isSearching = true;
      const filterType = this.determineFilterType();
      this.quickFilterActivatedByClick = false;

      let paginatedResult;

      switch (filterType) {
        case 'advanced':
          paginatedResult = await this.performAdvancedSearch(page);
          break;
        case 'quick':
          paginatedResult = await this.performQuickFilterSearch(page);
          break;
        case 'simple':
        default:
          paginatedResult = await this.performSimpleSearch(page);
          break;
      }

      // Actualizar estado de paginación
      this.currentPage = paginatedResult.currentPage;
      this.totalResults = paginatedResult.totalCount;
      this.totalPages = paginatedResult.totalPages;
      this.currentResults = paginatedResult.results;

      this.displayResults(paginatedResult.results, filterType);
      this.displayPagination();
    } catch (error) {
      console.error('Error en búsqueda:', error);
      this.displayError(error);
    } finally {
      this.isSearching = false;
    }
  }

  // =============================
  // DETERMINAR FILTROS
  // =============================

  determineFilterType() {
    if (this.isAdvancedPanelActive()) {
      return 'advanced';
    }
    if (this.quickFilterActivatedByClick || this.isQuickFilterActive() || !window.ZonalFilter.isAllSelected()) {
      return 'quick';
    }
    return 'simple';
  }

  isAdvancedPanelActive() {
    // Lista de controles de búsqueda avanzada
    const fields = ['advanced-pfis-codes', 'advanced-route-code', 'advanced-project-purpose'];
    return fields.some((fieldId) => {
      const field = document.getElementById(fieldId);
      return field && field.value.trim().length > 0;
    });
  }

  isQuickFilterActive() {
    const activeFilter = document.querySelector('.quick-filter-status.active');
    return activeFilter && activeFilter.dataset.filter !== 'all';
  }

  getActiveQuickFilterType() {
    const activeFilter = document.querySelector('.quick-filter-status.active');
    return activeFilter?.dataset.filter || 'all';
  }

  getActiveQuickFilterValue() {
    const activeFilter = document.querySelector('.quick-filter-status.active');
    return activeFilter?.dataset.value || null;
  }

  getActiveQuickFilterText() {
    const activeFilter = document.querySelector('.quick-filter-status.active');
    const span = activeFilter.querySelector('span');
    return span ? span.textContent.trim() : 'Sin texto';
  }

  // =============================
  // MÉTODOS DE BÚSQUEDA
  // =============================

  async performSimpleSearch(page = 1) {
    const searchInput = document.getElementById('map-search-input');
    const searchTerm = searchInput?.value.trim() || '';

    const params = {
      term: searchTerm,
      pageNumber: page,
      pageSize: this.pageSize,
    };

    const cacheKey = `simple_${createSyncHash(JSON.stringify(params))}`;
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey);
    }

    const response = await this.callSearchService(window.AppGlobals.quickProjectSearchUrl, params);
    const paginatedResult = this.buildPaginationResult(response, page);

    this.setCacheWithTTL(cacheKey, paginatedResult);
    this.lastSearchTerm = searchTerm;

    return paginatedResult;
  }

  async performQuickFilterSearch(page = 1) {
    const searchInput = document.getElementById('map-search-input');
    const searchTerm = searchInput?.value.trim() || '';

    const params = {
      status: this.isQuickFilterActive() ? this.getActiveQuickFilterValue() : '',
      term: searchTerm,
      zonal: window.ZonalFilter.isAllSelected() ? '' : window.ZonalFilter.getCurrentFilter().join(','),
      pageNumber: page,
      pageSize: this.pageSize,
    };

    const cacheKey = `quick_${createSyncHash(JSON.stringify(params))}`;

    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey);
    }

    const response = await this.callSearchService(window.AppGlobals.quickProjectFilterSearchUrl, params);
    const paginatedResult = this.buildPaginationResult(response, page);

    this.setCacheWithTTL(cacheKey, paginatedResult);
    return paginatedResult;
  }

  async performAdvancedSearch(page = 1) {
    const requestData = this.buildAdvancedSearchRequest(page);
    const cacheKey = `advanced_${createSyncHash(JSON.stringify(requestData))}`;

    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey);
    }

    const response = await this.callSearchService(window.AppGlobals.advancedProjectSearchUrl, requestData);
    const paginatedResult = this.buildPaginationResult(response, page);

    this.setCacheWithTTL(cacheKey, paginatedResult);
    return paginatedResult;
  }

  buildAdvancedSearchRequest(page = 1) {
    return {
      textoBusqueda: document.getElementById('map-search-input')?.value || '',
      codigosPFIS: document.getElementById('advanced-pfis-codes')?.value || '',
      codigosAreaZonal: window.ZonalFilter.isAllSelected() ? '' : window.ZonalFilter.getCurrentFilter().join(','),
      sefun: document.getElementById('advanced-route-code')?.value || '',
      finalidadProyecto: document.getElementById('advanced-project-purpose')?.value || '',
      estado: this.isQuickFilterActive() ? this.getActiveQuickFilterValue() : '',
      pageNumber: page,
      pageSize: this.pageSize,
    };
  }

  // =============================
  // SERVICIO HTTP
  // =============================

  async callSearchService(url, data) {
    const term = (data.term || data.textoBusqueda || '').toLowerCase().trim();
    const statusVal = String(data.status || data.estado || '').toLowerCase().trim();
    const pfisCodes = (data.codigosPFIS || '').split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);

    const all = window.LOCAL_PROJECTS_DATA || [];
    const filtered = all.filter((p) => {
      // Búsqueda por término
      const matchTerm =
        !term ||
        p.cCodPFIS.toLowerCase().includes(term) ||
        p.cDesInfraest.toLowerCase().includes(term) ||
        p.cDesFinalidad.toLowerCase().includes(term) ||
        p.location.department.toLowerCase().includes(term) ||
        p.location.province.toLowerCase().includes(term) ||
        p.location.district.toLowerCase().includes(term) ||
        p.contractor.toLowerCase().includes(term);

      // Búsqueda por estado
      let matchStatus = true;
      if (statusVal && statusVal !== 'all') {
        matchStatus =
          p.statusCode.toLowerCase() === statusVal ||
          p.cDesEstado.toLowerCase().includes(statusVal) ||
          (statusVal === '99' && p.statusCode === 'concluded') ||
          (statusVal === '98' && p.statusCode === 'execution') ||
          (statusVal === '80' && p.statusCode === 'programmed') ||
          (statusVal === '168' && p.statusCode === 'pending');
      }

      // Búsqueda por código PFIS
      let matchPfis = true;
      if (pfisCodes.length > 0) {
        matchPfis = pfisCodes.some((code) => p.cCodPFIS.toLowerCase().includes(code));
      }

      return matchTerm && matchStatus && matchPfis;
    });

    return {
      success: true,
      data: filtered,
      totalCount: filtered.length,
      currentPage: 1,
      totalPages: 1,
    };
  }

  buildPaginationResult(response, page) {
    return {
      results: response.data || [],
      totalCount: response.totalCount || 0,
      currentPage: page,
      totalPages: response.totalPages || 0,
    };
  }

  // =============================
  // MOSTRAR RESULTADOS
  // =============================

  displayResults(results, filterType = 'simple') {
    const dropdown = document.getElementById('search-results-dropdown');
    const resultsList = document.getElementById('search-results-list');
    const searchFooter = document.getElementById('search-footer');
    const resultsCount = document.getElementById('results-count');

    if (!dropdown || !resultsList) return;

    if (results && results.length > 0) {
      const indicator = this.getFilterTypeIndicator(filterType);
      const resultItems = results.map((result, index) => this.createResultItem(result, index)).join('');

      resultsList.innerHTML = indicator + resultItems;

      if (resultsCount) {
        resultsCount.textContent = `${results.length} resultado${results.length !== 1 ? 's' : ''}`;
      }

      dropdown.classList.remove('hidden');
      if (searchFooter) searchFooter.classList.remove('hidden');

      this.recreateIcons();
    } else {
      this.displayNoResults(filterType);
    }
  }

  createResultItem(result, index) {
    return `
      <div class="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0 result-item" 
           data-index="${index}" data-codigopfis="${result.cCodPFIS}"
           onclick="window.searchManager.selectResult('${result.cCodPFIS}')">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-semibold text-gray-800">${result.cCodPFIS}</span>
              <span class="text-xs px-2 py-1 rounded ${this.getStatusBadgeClass(result.desEstado || result.cDesEstado)}">
                ${result.desEstado || result.cDesEstado}
              </span>
            </div>
            <div class="text-xs text-gray-600 mb-1 line-clamp-2">
              ${result.cDesFinalidad || result.cDesInfraest || 'Sin descripción'}
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <i data-lucide="map-pin" class="w-3 h-3"></i>
                ${result.cNomArea || 'Sin área'}
              </span>
              ${
                result.dCosContractual
                  ? `
                <span class="flex items-center gap-1">
                  <i data-lucide="coins" class="w-3 h-3"></i>
                  S/ ${Number(result.dCosContractual).toLocaleString('es-PE')}
                </span>
              `
                  : ''
              }
            </div>
          </div>
          <div class="ml-3">
            <button class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
              <i data-lucide="eye" class="w-4 h-4 text-blue-600"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  displayNoResults(filterType) {
    this.currentPage = 1;
    this.totalResults = 0;
    this.totalPages = 0;
    this.currentResults = [];
    this.displayPagination();
    const dropdown = document.getElementById('search-results-dropdown');
    const resultsList = document.getElementById('search-results-list');
    const resultsCount = document.getElementById('results-count');

    if (resultsList) {
      const indicator = this.getFilterTypeIndicator(filterType);
      resultsList.innerHTML = `
        ${indicator}
        <div class="p-4 text-center">
          <div class="flex flex-col items-center gap-2">
            <i data-lucide="search-x" class="w-8 h-8 text-gray-400"></i>
            <p class="text-sm text-gray-600">No se encontraron resultados</p>
            <p class="text-xs text-gray-500">Intente con términos diferentes</p>
          </div>
        </div>
      `;

      if (resultsCount) resultsCount.textContent = '0 resultados';
      if (dropdown) dropdown.classList.remove('hidden');
      this.recreateIcons();
    }
  }

  displayError(error) {
    const resultsList = document.getElementById('search-results-list');
    const resultsCount = document.getElementById('results-count');

    if (resultsList) {
      resultsList.innerHTML = `
        <div class="p-4 text-center">
          <div class="flex flex-col items-center gap-2">
            <i data-lucide="alert-circle" class="w-8 h-8 text-red-400"></i>
            <p class="text-sm text-gray-600">Error al buscar proyectos</p>
            <p class="text-xs text-gray-500">Por favor, intente nuevamente</p>
          </div>
        </div>
      `;

      if (resultsCount) resultsCount.textContent = 'Error en búsqueda';
      this.recreateIcons();
    }
  }

  // =============================
  // UTILITARIOS
  // =============================

  showLoadingIndicator(message = 'Cargando...') {
    const resultsList = document.getElementById('search-results-list');
    const resultsCount = document.getElementById('results-count');

    if (resultsList) {
      const filterType = this.determineFilterType();
      const indicator = this.getFilterTypeIndicator(filterType);

      resultsList.innerHTML =
        indicator +
        `
      <div class="p-6 text-center">
        <div class="flex flex-col items-center gap-3">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p class="text-sm text-gray-600 font-medium">${message}</p>
          <p class="text-xs text-gray-500">Esto puede tomar unos momentos...</p>
          <div class="w-48 bg-gray-200 rounded-full h-2 mt-2">
            <div id="loading-progress" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
          </div>
          <p id="loading-status" class="text-xs text-gray-500">Iniciando...</p>
        </div>
      </div>
    `;
    }

    if (resultsCount) {
      resultsCount.textContent = 'Cargando...';
    }
  }

  getFilterTypeIndicator(type) {
    const indicators = {
      simple: `
      <div class="p-2 bg-green-50 border-b border-green-100">
        <span class="text-xs text-green-700 font-medium flex items-center gap-1">
          <i data-lucide="search" class="w-3 h-3"></i>
          Búsqueda simple
        </span>
      </div>
    `,
      quick: `
      <div class="p-2 bg-blue-50 border-b border-blue-100">
        <span class="text-xs text-blue-700 font-medium flex items-center gap-1">
          <i data-lucide="zap" class="w-3 h-3"></i>
          Filtro por estado: ${this.getActiveQuickFilterText()}
        </span>
      </div>
    `,
      advanced: `
      <div class="p-2 bg-purple-50 border-b border-purple-100">
        <span class="text-xs text-purple-700 font-medium flex items-center gap-1">
          <i data-lucide="target" class="w-3 h-3"></i>
          Búsqueda avanzada
        </span>
      </div>
    `,
    };
    return indicators[type] || '';
  }

  getStatusBadgeClass(status) {
    const statusClasses = {
      'En Ejecución': 'bg-status-execution text-white',
      Programado: 'bg-status-programmed text-blue-800',
      Concluido: 'bg-status-concluded text-white',
      Desactivado: 'bg-status-pending text-yellow-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  }

  toggleClearButton(btn, show) {
    if (show) {
      btn.style.display = 'block';
      btn.style.opacity = '1';
    } else {
      btn.style.opacity = '0';
      setTimeout(() => (btn.style.display = 'none'), 200);
    }
  }

  setCacheWithTTL(key, value) {
    this.searchCache.set(key, value);
    setTimeout(() => this.searchCache.delete(key), this.cacheTimeout);
  }

  recreateIcons() {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 50);
  }

  // =============================
  // ACCIONES PÚBLICAS
  // =============================

  async selectResult(projectCode) {
    try {
      const dropdown = document.getElementById('search-results-dropdown');
      this.showProcessingIndicator(projectCode);

      if (window.selectProjectByCode) {
        window.selectProjectByCode(projectCode);
      } else {
        const event = new CustomEvent('projectSelected', { detail: { projectCode: projectCode } });
        document.dispatchEvent(event);
      }

      this.highlightSelectedResult(projectCode);

      if (dropdown) {
        setTimeout(() => {
          dropdown.classList.add('hidden');
        }, 500);
      }
    } catch (error) {
      this.showProcessingError(projectCode, error);
    }
  }

  clearResults() {
    const dropdown = document.getElementById('search-results-dropdown');
    const searchFooter = document.getElementById('search-footer');

    if (dropdown) dropdown.classList.add('hidden');
    if (searchFooter) searchFooter.classList.add('hidden');

    this.searchCache.clear();
    this.lastSearchTerm = '';
  }

  clearSearch() {
    const searchInput = document.getElementById('map-search-input');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    this.clearResults();
  }

  clearAdvancedFilters() {
    const fields = ['advanced-pfis-codes', 'advanced-area-filter', 'advanced-route-code', 'advanced-project-purpose'];
    fields.forEach((fieldId) => {
      const field = document.getElementById(fieldId);
      if (field) field.value = '';
    });
  }

  async executeAdvancedSearch() {
    const btn = document.getElementById('apply-advanced-search');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = 'Buscando...';
    }

    try {
      await this.executeSearch();
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Aplicar filtros';
      }
    }
  }

  hiddenAdvancedSearch() {
    console.log('hiddenAdvancedSearch called');
    const advancedPanel = document.getElementById('advanced-search-panel');

    if (advancedPanel) {
      advancedPanel.classList.add('hidden');
    }
  }

  closeSearchPanel() {
    const searchContainer = document.getElementById('search-container');
    if (searchContainer) {
      searchContainer.classList.remove('show');
    }
  }

  showProcessingIndicator(projectCode) {
    const projectItem = document.querySelector(`[data-codigopfis="${projectCode}"]`);

    if (projectItem) {
      projectItem.classList.add('processing');

      // Agregar boton de procesamiento.
      const actionButton = projectItem.querySelector('button');

      if (actionButton) {
        actionButton.innerHTML = '<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>';
        actionButton.classList.add('cursor-not-allowed');
        actionButton.disabled = true;
      }

      // Agregar badge de procesamiento
      const projectHeader = projectItem.querySelector('.flex.items-center.gap-2');
      if (projectHeader && !projectHeader.querySelector('.processing-badge')) {
        const processingBadge = document.createElement('span');
        processingBadge.className = 'processing-badge text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 animate-pulse';
        processingBadge.innerHTML = '<i data-lucide="loader" class="w-3 h-3 inline mr-1"></i>Procesando...';
        projectHeader.appendChild(processingBadge);
      }
    }

    this.recreateIcons();
  }

  showProcessingError(projectCode, error) {
    console.error(`Error al procesar el proyecto ${projectCode}:`, error);
    window.notificationHelper.error(error);

    // Actualizar el item en la lista
    const projectItem = document.querySelector(`[data-codigopfis="${projectCode}"]`);

    if (projectItem) {
      projectItem.classList.add('error');
      projectItem.classList.remove('processing');

      // Cambiar el botón de acción a error
      const actionButton = projectItem.querySelector('button');
      if (actionButton) {
        actionButton.title = error;
        actionButton.innerHTML = '<i data-lucide="alert-circle" class="w-4 h-4 text-red-600"></i>';
        actionButton.classList.add('bg-red-100');
        actionButton.disabled = false;
      }

      // Remover badge de procesamiento.
      const processingBadge = projectItem.querySelector('.processing-badge');
      if (processingBadge) {
        processingBadge.remove();
      }
    }
  }

  highlightSelectedResult(projectCode) {
    // Limpiar selecciones anteriores
    document.querySelectorAll('.result-item').forEach((item) => {
      item.classList.remove('selected', 'bg-blue-50', 'border-blue-200');
    });

    const selectedItem = document.querySelector(`[data-codigopfis="${projectCode}"]`);

    if (selectedItem) {
      // Remover badge de procesamiento.
      const processingBadge = selectedItem.querySelector('.processing-badge');
      if (processingBadge) {
        processingBadge.remove();
      }

      selectedItem.classList.add('selected', 'bg-blue-50', 'border-blue-200');

      // Agregar badge de seleccionado
      const projectHeader = selectedItem.querySelector('.flex.items-center.gap-2');
      if (projectHeader && !projectHeader.querySelector('.selected-badge')) {
        const selectedBadge = document.createElement('span');
        selectedBadge.className = 'selected-badge text-xs px-2 py-1 rounded bg-blue-100 text-blue-800';
        selectedBadge.innerHTML = '<i data-lucide="check-circle" class="w-3 h-3 inline mr-1"></i>Seleccionado';
        projectHeader.appendChild(selectedBadge);
      }
    }
  }

  // =============================
  // MOSTRAR PAGINACIÓN
  // =============================

  displayPagination() {
    const searchFooter = document.getElementById('search-footer');
    if (!searchFooter) return;

    let paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) {
      paginationContainer = document.createElement('div');
      paginationContainer.id = 'pagination-container';
      paginationContainer.className = 'px-3 py-2 border-t border-gray-100 bg-gray-50';
      searchFooter.appendChild(paginationContainer);
    }

    this.showPagination();

    if (this.totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    const paginationHTML = this.createPaginationHTML();
    paginationContainer.innerHTML = paginationHTML;

    // ✅ Agregar event listeners para navegación
    this.setupPaginationEvents();
    this.recreateIcons();
  }

  createPaginationHTML() {
    const pages = this.calculateVisiblePages();

    return `
      <div class="flex items-center justify-between text-sm">
        <div class="text-gray-600">
          Mostrando ${(this.currentPage - 1) * this.pageSize + 1}-${Math.min(this.currentPage * this.pageSize, this.totalResults)} 
          de ${this.totalResults} resultados
        </div>
        <div class="flex items-center gap-1">
          <!-- Botón anterior -->
          <button 
            id="prev-page" 
            class="px-2 py-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            ${this.currentPage <= 1 ? 'disabled' : ''}
          >
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
          </button>

          <!-- Números de página -->
          ${pages
            .map(
              (page) => `
            <button 
              class="pagination-btn px-3 py-1 rounded text-sm ${
                page === this.currentPage ? 'bg-blue-500 text-white' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }"
              data-page="${page}"
              ${page === '...' ? 'disabled' : ''}
            >
              ${page}
            </button>
          `,
            )
            .join('')}

          <!-- Botón siguiente -->
          <button 
            id="next-page" 
            class="px-2 py-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            ${this.currentPage >= this.totalPages ? 'disabled' : ''}
          >
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;
  }

  calculateVisiblePages() {
    const delta = 2; // Mostrar 2 páginas antes y después de la actual
    const pages = [];
    const start = Math.max(1, this.currentPage - delta);
    const end = Math.min(this.totalPages, this.currentPage + delta);

    // Primera página
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    // Páginas del rango
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Última página
    if (end < this.totalPages) {
      if (end < this.totalPages - 1) pages.push('...');
      pages.push(this.totalPages);
    }

    return pages;
  }

  setupPaginationEvents() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageButtons = document.querySelectorAll('.pagination-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.executeSearch(this.currentPage - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentPage < this.totalPages) {
          this.executeSearch(this.currentPage + 1);
        }
      });
    }

    pageButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page && page !== this.currentPage) {
          this.executeSearch(page);
        }
      });
    });
  }

  // =============================
  // MEJORAR FOOTER EXISTENTE
  // =============================

  async showAllResults() {
    const filterType = this.determineFilterType();

    try {
      this.showLoadingIndicator('Cargando todos los resultados...');
      const allResults = await this.loadAllResults();

      if (allResults && allResults.length > 0) {
        this.currentResults = allResults;
        this.totalResults = allResults.length;

        this.currentPage = 1;
        this.totalPages = 1;

        this.displayResults(allResults, filterType);
        this.hidePagination();
      } else {
        console.warn('No se encontraron resultados para cargar');
        this.displayNoResults(filterType);
      }
    } catch (error) {
      console.error('SearchManager: Error al cargar todos los resultados:', error);
    }
  }

  async loadAllResults() {
    const filterType = this.determineFilterType();
    let allResults = [];

    // Cargar todas las páginas
    for (let page = 1; page <= this.totalPages; page++) {
      try {
        let pageResults;

        this.updateLoadingProgress(page, this.totalPages);

        switch (filterType) {
          case 'advanced':
            pageResults = await this.performAdvancedSearch(page);
            break;
          case 'quick':
            pageResults = await this.performQuickFilterSearch(page);
            break;
          case 'simple':
          default:
            pageResults = await this.performSimpleSearch(page);
            break;
        }

        if (pageResults && pageResults.results) {
          allResults = allResults.concat(pageResults.results);
        }

        if (this.totalPages > 5) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`SearchManager: Error cargando la página ${page}:`, error);
      }
    }

    return allResults;
  }

  updateLoadingProgress(currentPage, totalPages) {
    const progressBar = document.getElementById('loading-progress');
    const statusText = document.getElementById('loading-status');

    if (progressBar) {
      const progress = Math.round((currentPage / totalPages) * 100);
      progressBar.style.width = `${progress}%`;
    }

    if (statusText) {
      statusText.textContent = `Página ${currentPage} de ${totalPages} (${Math.round((currentPage / totalPages) * 100)}%)`;
    }
  }

  hidePagination() {
    const paginationContainer = document.getElementById('pagination-container');
    if (paginationContainer) {
      paginationContainer.classList.add('hidden');
    }
  }

  showPagination() {
    const paginationContainer = document.getElementById('pagination-container');
    const isHidden = paginationContainer.classList.contains('hidden');

    if (paginationContainer && isHidden) {
      paginationContainer.classList.remove('hidden');
    }
  }

  async exportResults() {
    try {
      console.log('Exportando resultados...');

      const allResults = await this.loadAllResults();
      this.exportToCSV(allResults, `resultados_busqueda_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error al exportar resultados:', error);
    }
  }

  exportToCSV(data, filename) {
    if (!data || data.length === 0) {
      console.warn('No hay datos para exportar');
      return;
    }

    const headers = ['Código PFIS', 'Finalidad', 'Área/Zonal', 'Estado', 'Costo Contractual'];
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        [
          `"${row.cCodPFIS || ''}"`,
          `"${(row.cDesFinalidad || row.cDesInfraest || '').replace(/"/g, '""')}"`,
          `"${row.cNomArea || ''}"`,
          `"${row.desEstado || row.cDesEstado || ''}"`,
          `"${row.dCosContractual || 0}"`,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Resultados exportados exitosamente');
    }
  }
}

// =============================
// EXPORTAR PARA USO GLOBAL
// =============================

window.SearchManager = SearchManager;
