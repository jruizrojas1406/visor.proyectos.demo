/**
 * Panel de Información de Proyectos (Rediseño Moderno Ejecutivo)
 * Implementa pestañas segmentadas (Resumen, Técnico, Cronograma),
 * visualización de KPIs, portadas dinámicas y vinculación a PDF y Timeline.
 */

window.currentActiveProjectTab = 'resumen';

function initializeProjectPanel() {
    hidePanel();

    if (!document.getElementById('project-info')) {
        console.error('ProjectPanel: Contenedor de información de proyecto no encontrado');
        return;
    }

    setupPanelInteractions();

    // Escuchar eventos de selección y deselección desde Leaflet
    document.addEventListener('projectSelected', handleProjectSelection);
    document.addEventListener('projectDeselected', handleProjectDeselection);

    showBtnsProjectPanel(true, false);
}

// Cambiar entre pestañas del panel
function switchProjectTab(tabKey) {
    window.currentActiveProjectTab = tabKey || 'resumen';

    const tabButtons = {
        resumen: document.getElementById('tab-btn-resumen'),
        tecnico: document.getElementById('tab-btn-tecnico'),
        cronograma: document.getElementById('tab-btn-cronograma')
    };

    Object.entries(tabButtons).forEach(([key, btn]) => {
        if (!btn) return;
        if (key === window.currentActiveProjectTab) {
            btn.className = 'project-tab-btn active flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 bg-white text-blue-700 shadow-sm font-bold';
        } else {
            btn.className = 'project-tab-btn flex-1 py-1.5 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 hover:text-slate-900 text-slate-500 font-semibold';
        }
    });

    const descContainer = document.getElementById('project-description-container');
    if (descContainer) {
        descContainer.style.display = (window.currentActiveProjectTab === 'resumen') ? 'block' : 'none';
    }

    createProjectInformation();
}

// Cargar y actualizar datos del proyecto seleccionado
async function loadAndfetchProjectData(projectCode) {
    try {
        if (!projectCode || projectCode === 'unknown') {
            console.warn('ProjectPanel: Código de proyecto inválido');
            return;
        }

        if (!window.AppGlobals.projectService) {
            console.error('ProjectPanel: ProjectService no inicializado');
            showErrorInPanel('Servicio no disponible');
            return;
        }

        const projectData = await window.AppGlobals.projectService.fetchProjectData(projectCode);

        if (!projectData) {
            console.warn('ProjectPanel: No se recibieron datos de proyecto para código:', projectCode);
            showErrorInPanel('No se encontraron datos para el proyecto ' + projectCode);
            return;
        }

        window.AppGlobals.currentProjectData = { ...projectData };

        // Actualizar cabecera y contenidos
        updateProjectHeader();
        updateProjectDescription();
        createProjectInformation();
        showBtnsProjectPanel(projectData.buttons?.hasTimeline !== false, projectData.buttons?.hasExecutiveSummary || false);
        showSuccessUpdateFeedback();
    } catch (error) {
        console.error('ProjectPanel: Error al cargar datos de proyecto:', error);
        showErrorInPanel('Error al cargar datos del proyecto ' + projectCode + ': ' + error.message);
        showErrorUpdateFeedback(projectCode);
    }
}

// Actualizar cabecera, imagen hero, estados y códigos
function updateProjectHeader() {
    const data = window.AppGlobals.currentProjectData;
    if (!data) return;

    // 1. Imagen de portada con fallback
    const coverImg = document.getElementById('project-cover-img');
    if (coverImg) {
        coverImg.src = data.coverImage || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80';
        coverImg.alt = data.cDesInfraest || 'Infraestructura de Salud';
    }

    // 2. Badge de estado con degradado y dot animado
    const statusBadge = document.getElementById('project-status-badge');
    if (statusBadge) {
        if (data.statusCode === 'concluded') {
            statusBadge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md bg-purple-950/85 text-purple-200 border border-purple-400/50';
            statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span><span>${data.cDesEstado}</span>`;
        } else if (data.statusCode === 'execution') {
            statusBadge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md bg-emerald-950/85 text-emerald-200 border border-emerald-400/50';
            statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>${data.cDesEstado}</span>`;
        } else {
            statusBadge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md bg-amber-950/85 text-amber-200 border border-amber-400/50';
            statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span><span>${data.cDesEstado}</span>`;
        }
    }

    // 3. Título del Proyecto
    const projectCodeEl = document.getElementById('project-code');
    if (projectCodeEl) {
        projectCodeEl.textContent = data.cDesInfraest;
    }

    // 4. Ubicación Breadcrumb
    const projectAreaEl = document.getElementById('project-area');
    if (projectAreaEl) {
        const loc = data.location;
        projectAreaEl.textContent = loc ? `${loc.district}, ${loc.province} • ${loc.department}` : data.cNomArea;
    }

    // 5. CUI y Código PFIS
    const cuiEl = document.getElementById('project-cui-display');
    if (cuiEl) {
        cuiEl.textContent = data.cui || '---';
    }

    const codeEl = document.getElementById('project-code-display');
    if (codeEl) {
        codeEl.textContent = data.cCodPFIS || '---';
    }
}

// Actualizar descripción / finalidad
function updateProjectDescription() {
    const descElement = document.getElementById('project-description');
    if (descElement && window.AppGlobals.currentProjectData) {
        descElement.textContent = window.AppGlobals.currentProjectData.cDesFinalidad;
    }
}

// Renderizar contenido dinámico según pestaña activa
function createProjectInformation() {
    const infoContainer = document.getElementById('project-info');
    if (!infoContainer) return;

    const data = window.AppGlobals.currentProjectData;
    if (!data) {
        resetPanelToNoDataState();
        return;
    }

    let html = '';

    if (window.currentActiveProjectTab === 'resumen') {
        html = renderResumenTab(data);
    } else if (window.currentActiveProjectTab === 'tecnico') {
        html = renderTecnicoTab(data);
    } else if (window.currentActiveProjectTab === 'cronograma') {
        html = renderCronogramaTab(data);
    }

    infoContainer.innerHTML = html;

    // Refrescar iconos Lucide
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 50);

    enableQuickActionButtons();
}

// Pestaña 1: Resumen Ejecutivo y Financiero
function renderResumenTab(data) {
    const formatCurrency = window.formatCurrency || ((val) => 'S/ ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2 }));
    
    return `
        <!-- KPIs Financieros -->
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-gradient-to-br from-blue-50/90 to-indigo-50/60 border border-blue-200/80 rounded-2xl p-3.5 shadow-sm hover:shadow transition-all">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700">PIM 2026</span>
                    <div class="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <i data-lucide="coins" class="w-3.5 h-3.5"></i>
                    </div>
                </div>
                <div class="text-sm font-extrabold text-slate-800 leading-tight">${formatCurrency(data.aPim)}</div>
                <span class="text-[10px] text-blue-600 font-medium">Presupuesto Institucional</span>
            </div>

            <div class="bg-gradient-to-br from-indigo-50/90 to-purple-50/60 border border-indigo-200/80 rounded-2xl p-3.5 shadow-sm hover:shadow transition-all">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Costo Contractual</span>
                    <div class="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <i data-lucide="wallet" class="w-3.5 h-3.5"></i>
                    </div>
                </div>
                <div class="text-sm font-extrabold text-slate-800 leading-tight">${formatCurrency(data.dCosContractual)}</div>
                <span class="text-[10px] text-indigo-600 font-medium">Monto Adjudicado</span>
            </div>
        </div>

        <!-- Indicadores de Avance Físico y Financiero -->
        <div class="space-y-3 pt-1">
            <!-- Avance Físico -->
            <div class="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <i data-lucide="trending-up" class="w-3.5 h-3.5 text-blue-600"></i>
                        Avance Físico de Obra
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-extrabold ${data.progress >= 100 ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'}">
                        ${data.progress}%
                    </span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
                    <div class="h-full rounded-full transition-all duration-1000 ${data.progress >= 100 ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}" style="width: ${data.progress}%"></div>
                </div>
            </div>

            <!-- Avance Presupuestal Ejecutado -->
            <div class="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm space-y-2">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <i data-lucide="badge-percent" class="w-3.5 h-3.5 text-emerald-600"></i>
                        Avance Presupuestal Ejecutado
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        ${data.budgetProgress}%
                    </span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
                    <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-1000" style="width: ${data.budgetProgress}%"></div>
                </div>
                <div class="flex justify-between text-[11px] text-slate-500 font-medium pt-0.5">
                    <span>Ejecutado: ${formatCurrency(data.executedBudget || 0)}</span>
                    <span>Meta: 100%</span>
                </div>
            </div>
        </div>

        <!-- Badges de Impacto y Modalidad -->
        <div class="grid grid-cols-2 gap-2.5 pt-1">
            <div class="bg-slate-50/90 border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <i data-lucide="users" class="w-3.5 h-3.5"></i>
                </div>
                <div class="min-w-0">
                    <div class="text-[10px] text-slate-400 font-bold uppercase truncate">Beneficiarios</div>
                    <div class="text-xs font-bold text-slate-800 truncate">${data.beneficiaries || 'Población zonal'}</div>
                </div>
            </div>
            <div class="bg-slate-50/90 border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                    <i data-lucide="layers" class="w-3.5 h-3.5"></i>
                </div>
                <div class="min-w-0">
                    <div class="text-[10px] text-slate-400 font-bold uppercase truncate">Modalidad</div>
                    <div class="text-xs font-bold text-slate-800 truncate">${data.cNomTipAdmin || 'Obra Pública'}</div>
                </div>
            </div>
        </div>
    `;
}

// Pestaña 2: Ficha Técnica y Metas
function renderTecnicoTab(data) {
    const metrics = data.metrics || {};

    return `
        <!-- Métricas Clave de Capacidad -->
        <div class="grid grid-cols-4 gap-2">
            <div class="bg-blue-50/80 border border-blue-200/70 rounded-xl p-2.5 text-center shadow-xs">
                <div class="w-6 h-6 mx-auto rounded-lg bg-blue-600 text-white flex items-center justify-center mb-1">
                    <i data-lucide="bed" class="w-3 h-3"></i>
                </div>
                <div class="text-sm font-extrabold text-slate-800">${metrics.bedsCount || '0'}</div>
                <div class="text-[9px] font-semibold text-slate-500 uppercase">Camas</div>
            </div>

            <div class="bg-emerald-50/80 border border-emerald-200/70 rounded-xl p-2.5 text-center shadow-xs">
                <div class="w-6 h-6 mx-auto rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-1">
                    <i data-lucide="stethoscope" class="w-3 h-3"></i>
                </div>
                <div class="text-sm font-extrabold text-slate-800">${metrics.consultingRooms || '0'}</div>
                <div class="text-[9px] font-semibold text-slate-500 uppercase">Consultorios</div>
            </div>

            <div class="bg-indigo-50/80 border border-indigo-200/70 rounded-xl p-2.5 text-center shadow-xs">
                <div class="w-6 h-6 mx-auto rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-1">
                    <i data-lucide="building" class="w-3 h-3"></i>
                </div>
                <div class="text-sm font-extrabold text-slate-800">${metrics.floors || '1'}</div>
                <div class="text-[9px] font-semibold text-slate-500 uppercase">Niveles</div>
            </div>

            <div class="bg-amber-50/80 border border-amber-200/70 rounded-xl p-2.5 text-center shadow-xs">
                <div class="w-6 h-6 mx-auto rounded-lg bg-amber-600 text-white flex items-center justify-center mb-1">
                    <i data-lucide="maximize-2" class="w-3 h-3"></i>
                </div>
                <div class="text-sm font-extrabold text-slate-800">${Math.round(data.dCantidadKm || 0)}</div>
                <div class="text-[9px] font-semibold text-slate-500 uppercase">m² Tech.</div>
            </div>
        </div>

        <!-- Fichas de Intervención y Actores Clave -->
        <div class="space-y-2.5 pt-1">
            <!-- Tipo de Intervención -->
            <div class="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div class="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i data-lucide="activity" class="w-3.5 h-3.5"></i>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Categoría de Intervención</span>
                    <span class="text-xs font-bold text-slate-800 leading-snug">${data.cNomTipInterv || 'Infraestructura de Salud'}</span>
                </div>
            </div>

            <!-- Contratista Ejecutor -->
            <div class="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div class="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i data-lucide="hard-hat" class="w-3.5 h-3.5"></i>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contratista Ejecutor</span>
                    <span class="text-xs font-bold text-slate-800 leading-snug">${data.contractor || 'No especificado'}</span>
                </div>
            </div>

            <!-- Supervisión de Obra -->
            <div class="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supervisión de Obra</span>
                    <span class="text-xs font-bold text-slate-800 leading-snug">${data.supervisor || 'No especificado'}</span>
                </div>
            </div>

            <!-- Ubicación Detallada -->
            <div class="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex items-start gap-3">
                <div class="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                </div>
                <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dirección Predial</span>
                    <span class="text-xs font-medium text-slate-700 leading-snug">
                        ${data.location?.address || 'Sin dirección registrada'}
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Pestaña 3: Cronograma e Hitos
function renderCronogramaTab(data) {
    const timelineItems = data.timeline || [];

    let timelineCards = '';
    if (timelineItems.length > 0) {
        timelineCards = timelineItems.slice(0, 3).map((item, idx) => `
            <div class="flex gap-3 relative pb-4 last:pb-0">
                ${idx < 2 ? '<div class="absolute left-3.5 top-6 bottom-0 w-0.5 bg-slate-200"></div>' : ''}
                <div class="w-7 h-7 rounded-full bg-blue-100 border-2 border-blue-600 text-blue-700 flex items-center justify-center flex-shrink-0 z-10 text-[10px] font-bold shadow-xs">
                    ${idx + 1}
                </div>
                <div class="flex-1 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-[10px] font-bold text-blue-600">${item.date}</span>
                        <span class="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">${item.progress}%</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 leading-tight mb-1">${item.title}</div>
                    <p class="text-[11px] text-slate-500 line-clamp-2">${item.description}</p>
                </div>
            </div>
        `).join('');
    } else {
        timelineCards = `
            <p class="text-xs text-slate-500 text-center py-4">No se han registrado hitos para este proyecto.</p>
        `;
    }

    return `
        <!-- Plazos Contractuales -->
        <div class="grid grid-cols-3 gap-2">
            <div class="bg-blue-50/80 border border-blue-200/70 rounded-xl p-2.5 text-center">
                <span class="text-[9px] font-bold text-blue-600 uppercase block mb-1">Inicio</span>
                <span class="text-xs font-bold text-slate-800">${data.fFecInicio || 'N/A'}</span>
            </div>
            <div class="bg-indigo-50/80 border border-indigo-200/70 rounded-xl p-2.5 text-center">
                <span class="text-[9px] font-bold text-indigo-600 uppercase block mb-1">Culminación</span>
                <span class="text-xs font-bold text-slate-800">${data.fFecFinal || 'N/A'}</span>
            </div>
            <div class="bg-emerald-50/80 border border-emerald-200/70 rounded-xl p-2.5 text-center">
                <span class="text-[9px] font-bold text-emerald-600 uppercase block mb-1">Duración</span>
                <span class="text-xs font-bold text-slate-800">${data.durationDays || '0'} días</span>
            </div>
        </div>

        <!-- Hitos Destacados -->
        <div class="pt-2">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <i data-lucide="milestone" class="w-3.5 h-3.5 text-blue-600"></i>
                    Hitos Principales de Obra
                </span>
                <button onclick="handleHystoryClick()" class="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    Ver todos
                    <i data-lucide="chevron-right" class="w-3 h-3"></i>
                </button>
            </div>
            <div class="space-y-1">
                ${timelineCards}
            </div>
        </div>
    `;
}

// Resetear panel al estado "Sin selección"
function resetPanelToNoDataState() {
    const projectCodeEl = document.getElementById('project-code');
    if (projectCodeEl) projectCodeEl.textContent = 'Panel de Información';

    const projectAreaEl = document.getElementById('project-area');
    if (projectAreaEl) projectAreaEl.textContent = 'Seleccione un proyecto en el mapa';

    const statusBadge = document.getElementById('project-status-badge');
    if (statusBadge) {
        statusBadge.className = 'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md bg-white/90 text-slate-600 border border-white/40';
        statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-400"></span><span id="project-status">Sin seleccionar</span>`;
    }

    const cuiEl = document.getElementById('project-cui-display');
    if (cuiEl) cuiEl.textContent = '---';

    const codeEl = document.getElementById('project-code-display');
    if (codeEl) codeEl.textContent = '---';

    const descElement = document.getElementById('project-description');
    if (descElement) {
        descElement.textContent = 'Haga clic en cualquiera de los marcadores en el mapa para cargar su ficha técnica completa.';
    }

    const coverImg = document.getElementById('project-cover-img');
    if (coverImg) {
        coverImg.src = 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80';
    }

    const infoContainer = document.getElementById('project-info');
    if (infoContainer) {
        infoContainer.innerHTML = `
            <div class="no-data-state py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3 shadow-xs">
                    <i data-lucide="map-pin" class="w-6 h-6"></i>
                </div>
                <h3 class="text-sm font-bold text-slate-800 mb-1">No hay proyecto seleccionado</h3>
                <p class="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Haga clic en un marcador del mapa para explorar sus datos presupuestales, técnicos y el cronograma.
                </p>
            </div>
        `;

        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 50);
    }

    disableQuickActionButtons();
}

// Configuración de interacciones (botones, minimizar, cerrar)
function setupPanelInteractions() {
    const minimizeBtn = document.querySelector('.minimize-btn');
    const panel = document.getElementById('project-panel');

    if (minimizeBtn && panel) {
        minimizeBtn.addEventListener('click', function () {
            if (window.AppGlobals.isPanelMinimized) {
                panel.style.transform = 'scale(1)';
                panel.style.transformOrigin = 'top right';
                this.innerHTML = '<i data-lucide="minimize-2" class="w-3.5 h-3.5"></i>';
                window.AppGlobals.isPanelMinimized = false;
            } else {
                panel.style.transform = 'scale(0.85)';
                panel.style.transformOrigin = 'top right';
                this.innerHTML = '<i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>';
                window.AppGlobals.isPanelMinimized = true;
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    }

    const headerButtonClose = document.getElementById('close-header-panel-btn');
    if (headerButtonClose) {
        headerButtonClose.addEventListener('click', hidePanel);
    }

    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach((button) => {
        if (button.name === 'history-btn') {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                handleHystoryClick();
            });
        } else if (button.name === 'report-btn') {
            button.addEventListener('click', function (e) {
                e.preventDefault();
                handleReporteClick();
            });
        }
    });
}

function handleHystoryClick() {
    if (!window.AppGlobals.currentProjectData || !window.AppGlobals.currentProjectCode) {
        showNoProjectSelectedNotification();
        return;
    }
    openTimelineModal(window.AppGlobals.currentProjectCode, window.AppGlobals.currentProjectData.cDesFinalidad);
}

function handleReporteClick() {
    if (!window.AppGlobals.currentProjectCode) {
        showNoProjectSelectedNotification();
        return;
    }

    if (!window.AppGlobals.geoprocessingService) {
        showServiceNotAvailableNotification('Servicio de reportes');
        return;
    }

    generateProjectReport(window.AppGlobals.currentProjectCode);
}

async function generateProjectReport(projectCode) {
    try {
        await window.AppGlobals.geoprocessingService.generateProjectReport(projectCode);
    } catch (error) {
        console.error('ProjectPanel: Error al generar reporte:', error);
    }
}

function showNoProjectSelectedNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white rounded-xl shadow-xl px-4 py-3 z-50 flex items-center gap-3';
    notification.innerHTML = `
        <i data-lucide="alert-triangle" class="w-4 h-4"></i>
        <div class="text-xs font-semibold">Seleccione un proyecto en el mapa para ver sus detalles</div>
    `;
    document.body.appendChild(notification);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

async function handleProjectSelection(event) {
    const { projectCode } = event.detail;

    if (window.AppGlobals.currentProjectCode === projectCode) {
        if (!window.AppGlobals.isPanelVisible) {
            showPanel();
        }
        showProjectAlreadySelectedFeedback(projectCode);
        return;
    }

    window.AppGlobals.currentProjectCode = projectCode;

    if (!window.AppGlobals.isPanelVisible) {
        showPanel();
    }

    await loadAndfetchProjectData(projectCode);
    showProjectSelectedNotification(projectCode);
}

function handleProjectDeselection() {
    window.AppGlobals.currentProjectCode = null;
    window.AppGlobals.currentProjectData = null;
    resetPanelToNoDataState();
}

function showPanel() {
    const panelContainer = document.getElementById('project-panel');
    if (panelContainer) {
        panelContainer.style.display = 'block';
        setTimeout(() => {
            panelContainer.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            panelContainer.style.opacity = '1';
            panelContainer.style.transform = 'translateX(0) scale(1)';
        }, 30);
        window.AppGlobals.isPanelVisible = true;
    }
}

function hidePanel() {
    const panelContainer = document.getElementById('project-panel');
    if (panelContainer) {
        panelContainer.style.transition = 'all 0.3s ease-in';
        panelContainer.style.opacity = '0';
        panelContainer.style.transform = 'translateX(80px) scale(0.95)';
        setTimeout(() => {
            panelContainer.style.display = 'none';
        }, 300);
        window.AppGlobals.isPanelVisible = false;
    }
}

function togglePanel() {
    if (window.AppGlobals.isPanelVisible) {
        hidePanel();
    } else {
        showPanel();
    }
}

function showSuccessUpdateFeedback() {
    const panel = document.querySelector('.glass-panel');
    if (panel) {
        panel.style.transition = 'all 0.4s ease';
        panel.style.boxShadow = '0 20px 40px -15px rgba(59, 130, 246, 0.3)';
        setTimeout(() => {
            panel.style.boxShadow = '';
        }, 800);
    }
}

function showErrorUpdateFeedback(projectCode) {
    const panel = document.querySelector('.glass-panel');
    if (panel) {
        panel.style.transition = 'all 0.3s ease';
        panel.style.boxShadow = '0 20px 40px -15px rgba(239, 68, 68, 0.3)';
        setTimeout(() => {
            panel.style.boxShadow = '';
        }, 800);
    }
}

function showProjectSelectedNotification(projectCode) {
    // Retroalimentación sutil opcional
}

function showProjectAlreadySelectedFeedback(projectCode) {
    // Retroalimentación sutil opcional
}

function disableQuickActionButtons() {
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach((button) => {
        button.disabled = true;
        button.classList.add('opacity-50', 'pointer-events-none');
    });
}

function enableQuickActionButtons() {
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach((button) => {
        button.disabled = false;
        button.classList.remove('opacity-50', 'pointer-events-none');
    });
}

function showBtnsProjectPanel(hasTimeline = true, hasExecutiveSummary = false) {
    const historyBtn = document.getElementById('history-btn');
    const helpDocBtn = document.getElementById('help-document-btn');
    if (historyBtn) {
        historyBtn.style.display = hasTimeline ? 'flex' : 'none';
    }
    if (helpDocBtn) {
        helpDocBtn.style.display = hasExecutiveSummary ? 'flex' : 'none';
    }
}

function showErrorInPanel(message) {
    const infoContainer = document.getElementById('project-info');
    if (infoContainer) {
        infoContainer.innerHTML = `
            <div class="no-data-state py-6 text-center bg-red-50/80 rounded-2xl border border-red-200">
                <i data-lucide="alert-circle" class="w-8 h-8 text-red-500 mx-auto mb-2"></i>
                <h3 class="text-sm font-bold text-red-800 mb-1">Error al cargar datos</h3>
                <p class="text-xs text-red-600">${message}</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

window.initializeProjectPanel = initializeProjectPanel;
window.switchProjectTab = switchProjectTab;
window.showPanel = showPanel;
window.hidePanel = hidePanel;
window.togglePanel = togglePanel;
window.handleHystoryClick = handleHystoryClick;
window.handleReporteClick = handleReporteClick;