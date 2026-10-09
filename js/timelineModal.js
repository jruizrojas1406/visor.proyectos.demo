/**
 * TimelineModal - Línea de Tiempo y Registro de Hitos Ejecutivos.
 * Presenta la cronología de obra, progreso físico acumulado, evidencias fotográficas
 * y estados de cada intervención en un modal moderno de nivel ejecutivo.
 */

function initializeTimelineModal() {
    console.log('Timeline modal module initialized');
}

async function openTimelineModal(projectCode, projectName) {
    if (window.AppGlobals.isTimelineModalOpen) {
        return;
    }

    try {
        const timelineData = await window.AppGlobals.timelineService.fetchTimelineData(projectCode);

        if (!timelineData || !timelineData.timeline || timelineData.timeline.length === 0) {
            showTimelineWarningModal(projectCode);
            return;
        }

        createTimelineModal();
        showTimelineModal();
        populateTimelineContent(timelineData);
        window.AppGlobals.isTimelineModalOpen = true;
    } catch (error) {
        console.error('Error al abrir modal de timeline:', error);
        showTimelineErrorModal(projectCode);
    }
}

// Crear la estructura del modal moderno
function createTimelineModal() {
    const existingModal = document.getElementById('timeline-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'timeline-modal';
    modal.className =
        'fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/75 backdrop-blur-md transition-all duration-300';
    modal.style.display = 'none';
    modal.style.opacity = '0';

    modal.innerHTML = `
    <div class="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-white rounded-md shadow-2xl flex flex-col overflow-hidden border border-white/40 transform transition-all duration-300 scale-95" id="timeline-modal-card">
      
      <!-- Header Ejecutivo Compacto y Elegante (Slim Height Bar) -->
      <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-5 py-3.5 shadow-md relative overflow-hidden flex-shrink-0 border-b border-white/10">
        <!-- Glows ambientales sutiles -->
        <div class="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-blue-600/10 blur-2xl pointer-events-none"></div>

        <div class="relative z-10 flex items-center justify-between gap-4">
          <!-- Información Izquierda: Icono, Título y Metadatos en 1 sola sección -->
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md flex-shrink-0 border border-white/20">
              <i data-lucide="calendar-range" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h2 class="text-sm md:text-base font-bold text-white tracking-tight truncate leading-tight" id="timeline-project-title">
                  Línea de Tiempo del Proyecto
                </h2>
                <span class="px-2 py-0.2 rounded text-[10px] font-extrabold tracking-wide uppercase bg-blue-500/25 text-blue-300 border border-blue-400/30 flex-shrink-0" id="timeline-project-code">
                  PFIS ---
                </span>
              </div>
              <div class="flex items-center gap-2 text-[11px] text-slate-300 font-medium truncate mt-0.5">
                <span class="flex items-center gap-1 text-slate-300">
                  <i data-lucide="map-pin" class="w-3 h-3 text-blue-400 flex-shrink-0"></i>
                  <span id="timeline-project-location">Ubicación</span>
                </span>
                <span class="text-slate-500">•</span>
                <span>Inicio: <strong class="text-white font-semibold" id="timeline-start-date">--/--/----</strong></span>
                <span class="text-slate-500">•</span>
                <span>Fin: <strong class="text-white font-semibold" id="timeline-end-date">--/--/----</strong></span>
              </div>
            </div>
          </div>

          <!-- Métricas Derecha: Avance Compacto, Plazo y Botón Cerrar -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <div class="hidden sm:flex flex-col items-end gap-1">
              <div class="flex items-center gap-2 text-[11px] font-bold">
                <span class="text-slate-400 font-normal">Plazo: <strong class="text-white" id="timeline-duration">-- días</strong></span>
                <span class="text-slate-500">•</span>
                <span class="text-emerald-400" id="timeline-progress-badge">0% Avance</span>
              </div>
              <div class="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden p-0.2 border border-white/10">
                <div id="timeline-progress-bar"
                  class="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-1000"
                  style="width: 0%"></div>
              </div>
            </div>

            <!-- Botón Cerrar Compacto -->
            <button id="close-timeline-modal"
              class="w-8 h-8 rounded-xl bg-white/10 hover:bg-red-500 text-white backdrop-blur-md flex items-center justify-center transition border border-white/20 cursor-pointer shadow-sm ml-1"
              title="Cerrar ventana (Esc)">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Contenedor del Timeline Scrollable -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-slate-100/60" id="timeline-scroll-container">
        <div class="max-w-3xl mx-auto">
          
          <!-- SECCIÓN: COMPARADOR INTERACTIVO ANTES VS DESPUÉS -->
          <div class="mb-8 bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-sm overflow-hidden" id="before-after-section">
            <div class="flex items-center justify-between my-3 px-1">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
                  <i data-lucide="split" class="w-4 h-4"></i>
                </div>
                <div>
                  <h3 class="text-xs font-bold text-slate-900 leading-tight">Comparador de Evolución: Antes vs. Después</h3>
                  <p class="text-[11px] text-slate-500 leading-tight mt-0.5">Arrastra la línea central para comparar el terreno inicial con la infraestructura construida</p>
                </div>
              </div>
              <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-[10px] font-bold">
                <i data-lucide="chevrons-left-right" class="w-3.5 h-3.5 text-indigo-600"></i>
                <span>Deslizar</span>
              </div>
            </div>

            <!-- Contenedor Interactivo con Cortina Split -->
            <div class="before-after-wrapper relative w-full h-64 md:h-80 overflow-hidden select-none cursor-ew-resize group shadow-inner bg-slate-950" id="before-after-container">
              <!-- Imagen DESPUÉS (Base completa) -->
              <img id="after-img-elem" src="" alt="Después" class="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" />
              
              <!-- Badge Flotante Después -->
              <div id="after-badge-container" class="absolute top-3 right-3 z-10 pointer-events-none transition-all duration-200">
                <span class="px-3 py-1 rounded-full text-[10px] font-extrabold bg-slate-950/85 text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span id="after-badge-text">DESPUÉS</span>
                </span>
              </div>

              <!-- Capa ANTES (Cortina con ancho dinámico recortado) -->
              <div class="before-layer absolute inset-0 overflow-hidden select-none pointer-events-none z-10" id="before-image-layer" style="width: 50%;">
                <img id="before-img-elem" src="" alt="Antes" class="absolute inset-0 w-full h-full object-cover select-none pointer-events-none" style="width: 100%; max-width: none;" />
                
                <!-- Badge Flotante Antes -->
                <div id="before-badge-container" class="absolute top-3 left-3 z-10 pointer-events-none transition-all duration-200">
                  <span class="px-3 py-1 rounded-full text-[10px] font-extrabold bg-slate-950/85 text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                    <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span id="before-badge-text">ANTES</span>
                  </span>
                </div>
              </div>

              <!-- Línea Divisoria y Mango Central con Icono -->
              <div class="divider-line absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-20 pointer-events-none" id="slider-divider" style="left: 50%;">
                <div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-slate-800 shadow-2xl border-2 border-slate-200 flex items-center justify-center font-bold text-xs transform group-hover:scale-110 transition-transform">
                  <i data-lucide="chevrons-left-right" class="w-4 h-4 text-slate-700"></i>
                </div>
              </div>

              <!-- Control Deslizante Invisible para Máxima Accesibilidad y Fluidez -->
              <input type="range" min="0" max="100" value="50" class="slider-range-input absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30 m-0" id="before-after-range" aria-label="Comparar antes y después" />
            </div>

            <!-- Leyenda y Descripción Ejecutiva de las Fotografías -->
            <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div class="flex items-start gap-2.5 p-2.5 bg-amber-50/70 border border-amber-200/60 shadow-2xs">
                <div class="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i data-lucide="history" class="w-3.5 h-3.5"></i>
                </div>
                <div class="min-w-0">
                  <div class="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <span>Estado Inicial</span>
                    <span class="px-1.5 py-0.2 rounded text-[9px] bg-amber-200/70 text-amber-900 font-bold">Antes</span>
                  </div>
                  <div id="before-full-caption" class="text-xs text-slate-700 leading-snug mt-0.5 font-medium truncate sm:whitespace-normal">Terreno inicial y cimentación previa</div>
                </div>
              </div>

              <div class="flex items-start gap-2.5 p-2.5 bg-emerald-50/70 border border-emerald-200/60 shadow-2xs">
                <div class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i>
                </div>
                <div class="min-w-0">
                  <div class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <span>Estado Culminado</span>
                    <span class="px-1.5 py-0.2 rounded text-[9px] bg-emerald-200/70 text-emerald-900 font-bold">Después</span>
                  </div>
                  <div id="after-full-caption" class="text-xs text-slate-700 leading-snug mt-0.5 font-medium truncate sm:whitespace-normal">Infraestructura finalizada y entregada</div>
                </div>
              </div>
            </div>
          </div>

          <!-- SECCIÓN: HITOS EN STEPPER VERTICAL -->
          <div class="relative">
            <!-- Línea vertical conectora continua -->
            <div class="absolute left-4 md:left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-400 to-emerald-500 z-0"></div>

            <!-- Contenedor dinámico de hitos -->
            <div id="timeline-content" class="space-y-6 relative z-10">
              <!-- Se inyecta dinámicamente -->
            </div>
          </div>

          <!-- Fin de datos -->
          <div id="end-of-data-indicator" class="text-center py-6">
            <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-600">
              <i data-lucide="check-check" class="w-4 h-4 text-emerald-600"></i>
              <span>Todos los hitos han sido cargados satisfactoriamente (<span id="final-count">0</span> registros)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    setupTimelineModalEvents();
}

function setupTimelineModalEvents() {
    const closeBtn = document.getElementById('close-timeline-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTimelineModal);
    }

    const handleEscape = function (e) {
        if (e.key === 'Escape' && window.AppGlobals.isTimelineModalOpen) {
            closeTimelineModal();
        }
    };
    document.addEventListener('keydown', handleEscape);
    window.AppGlobals.timelineEscapeHandler = handleEscape;

    const modal = document.getElementById('timeline-modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeTimelineModal();
            }
        });
    }
}

function populateTimelineContent(timelineData) {
    if (!timelineData) return;

    const codeEl = document.getElementById('timeline-project-code');
    const title = document.getElementById('timeline-project-title');
    const subtitle = document.getElementById('timeline-project-subtitle');
    const duration = document.getElementById('timeline-duration');
    const startDate = document.getElementById('timeline-start-date');
    const endDate = document.getElementById('timeline-end-date');
    const progressBar = document.getElementById('timeline-progress-bar');
    const progressBadge = document.getElementById('timeline-progress-badge');
    const loadedCount = document.getElementById('timeline-loaded-count');
    const finalCount = document.getElementById('final-count');

    if (codeEl) codeEl.textContent = `PFIS ${timelineData.projectCode}`;
    if (title) title.textContent = timelineData.projectName;
    if (subtitle)
        subtitle.textContent = timelineData.projectPurpose || 'Seguimiento técnico de ejecución';

    const locationEl = document.getElementById('timeline-project-location');
    if (locationEl) locationEl.textContent = timelineData.locationText || 'Ubicación registrada';

    if (duration) duration.textContent = `${timelineData.totalDays} días`;
    if (startDate) startDate.textContent = timelineData.startDate || 'Inicio';
    if (endDate) endDate.textContent = timelineData.endDate || 'Término';
    if (loadedCount) loadedCount.textContent = timelineData.totalItems;
    if (finalCount) finalCount.textContent = timelineData.totalItems;

    const currentProgress = timelineData.currentProgress || 0;
    if (progressBar) {
        setTimeout(() => {
            progressBar.style.width = `${currentProgress}%`;
        }, 200);
    }
    if (progressBadge) {
        progressBadge.textContent = `${currentProgress}% Avance`;
    }

    // Poblar Comparador Antes vs Después
    const beforeImg = document.getElementById('before-img-elem');
    const afterImg = document.getElementById('after-img-elem');
    const beforeBadgeText = document.getElementById('before-badge-text');
    const afterBadgeText = document.getElementById('after-badge-text');
    const beforeFullCaption = document.getElementById('before-full-caption');
    const afterFullCaption = document.getElementById('after-full-caption');

    if (beforeImg && afterImg) {
        beforeImg.src =
            timelineData.beforeImage ||
            'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=1200&auto=format&fit=crop&q=80';
        afterImg.src =
            timelineData.afterImage ||
            'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&auto=format&fit=crop&q=80';

        if (beforeBadgeText) {
            beforeBadgeText.textContent = 'ANTES';
        }
        if (afterBadgeText) {
            afterBadgeText.textContent = 'DESPUÉS';
        }

        if (beforeFullCaption && timelineData.beforeCaption) {
            beforeFullCaption.textContent = timelineData.beforeCaption;
        }
        if (afterFullCaption && timelineData.afterCaption) {
            afterFullCaption.textContent = timelineData.afterCaption;
        }

        setupBeforeAfterSlider();
    }

    const content = document.getElementById('timeline-content');
    if (content) {
        content.innerHTML = '';
        timelineData.timeline.forEach((item, index) => {
            const itemEl = createTimelineItem(item, index);
            content.appendChild(itemEl);
        });

        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 50);
    }
}

// Configurar comportamiento interactivo del Slider Antes vs Después
function setupBeforeAfterSlider() {
    const container = document.getElementById('before-after-container');
    const beforeLayer = document.getElementById('before-image-layer');
    const divider = document.getElementById('slider-divider');
    const rangeInput = document.getElementById('before-after-range');
    const beforeImg = document.getElementById('before-img-elem');
    const beforeBadge = document.getElementById('before-badge-container');
    const afterBadge = document.getElementById('after-badge-container');

    if (!container || !beforeLayer || !divider || !rangeInput || !beforeImg) return;

    function updateSliderPosition(percent) {
        percent = Math.max(0, Math.min(100, percent));
        beforeLayer.style.width = `${percent}%`;
        divider.style.left = `${percent}%`;

        const rect = container.getBoundingClientRect();
        if (rect.width > 0) {
            beforeImg.style.width = `${rect.width}px`;
            beforeImg.style.maxWidth = `${rect.width}px`;
        }

        // Ocultar suavemente el badge ANTES cuando el divisor se desliza a la izquierda
        if (beforeBadge) {
            if (percent < 18) {
                beforeBadge.style.opacity = '0';
                beforeBadge.style.transform = 'translateX(-12px) scale(0.92)';
            } else {
                beforeBadge.style.opacity = '1';
                beforeBadge.style.transform = 'translateX(0) scale(1)';
            }
        }

        // Ocultar suavemente el badge DESPUÉS cuando el divisor se desliza a la derecha
        if (afterBadge) {
            if (percent > 82) {
                afterBadge.style.opacity = '0';
                afterBadge.style.transform = 'translateX(12px) scale(0.92)';
            } else {
                afterBadge.style.opacity = '1';
                afterBadge.style.transform = 'translateX(0) scale(1)';
            }
        }
    }

    // Sincronizar en resize de ventana
    window.addEventListener('resize', () => {
        const val = parseFloat(rangeInput.value) || 50;
        updateSliderPosition(val);
    });

    // Evento al deslizar el input
    rangeInput.addEventListener('input', (e) => {
        updateSliderPosition(parseFloat(e.target.value));
    });

    // Soporte para arrastrar con mouse / touch
    container.addEventListener('pointermove', (e) => {
        if (e.buttons === 1) {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = (x / rect.width) * 100;
            rangeInput.value = percent;
            updateSliderPosition(percent);
        }
    });

    // Inicializar al 50%
    setTimeout(() => {
        updateSliderPosition(50);
    }, 100);
}

// Crear cada tarjeta de hito en el timeline
function createTimelineItem(item, index) {
    const itemEl = document.createElement('div');
    itemEl.className = 'relative flex items-start gap-4 md:gap-5 group';

    const isCompleted =
        item.progress >= 100 || item.status === 'Culminado' || item.status === 'Concluido';
    const nodeColor = isCompleted
        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
        : 'bg-blue-600 text-white ring-4 ring-blue-100';

    const images = item.images || [];

    itemEl.innerHTML = `
    <!-- Nodo Circular de Hito -->
    <div class="w-8 h-8 md:w-10 md:h-10 rounded-full ${nodeColor} flex items-center justify-center font-extrabold text-xs shadow-md z-10 flex-shrink-0 transition-transform group-hover:scale-110">
      ${index + 1}
    </div>

    <!-- Tarjeta de Contenido del Hito -->
    <div class="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mb-2">
      
      <!-- Encabezado de la Tarjeta -->
      <div class="p-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-700">
              Día ${item.day || index + 1}
            </span>
            <span class="text-xs font-semibold text-slate-500">${item.date}</span>
          </div>
          <h3 class="text-sm font-bold text-slate-900 leading-tight">
            ${item.title}
          </h3>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-full text-xs font-extrabold ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
            ${item.progress}% Avance
          </span>
        </div>
      </div>

      <!-- Cuerpo de la Tarjeta -->
      <div class="p-4 space-y-3">
        <!-- Ubicación de la Intervención -->
        <div class="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
          <i data-lucide="map-pin" class="w-3.5 h-3.5 text-blue-600 flex-shrink-0"></i>
          <span class="truncate">Zona de Intervención: <strong>${item.location || 'Área Principal'}</strong></span>
        </div>

        <!-- Descripción -->
        <p class="text-xs text-slate-600 leading-relaxed">
          ${item.description}
        </p>

        <!-- Evidencias Fotográficas -->
        ${
            images.length > 0
                ? `
          <div class="pt-2 border-t border-slate-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="camera" class="w-3.5 h-3.5 text-indigo-600"></i>
                Evidencias Fotográficas (${images.length})
              </span>
              <span class="text-[10px] text-slate-400">Clic para ampliar</span>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              ${images
                  .map((img, imgIdx) => {
                      const imgUrl =
                          typeof img === 'string' ? img : img.url || generateImageUrl(img);
                      const caption =
                          typeof img === 'object' && img.caption
                              ? img.caption
                              : `Evidencia ${imgIdx + 1} - ${item.title}`;
                      return `
                    <div class="relative group/photo rounded-xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 cursor-pointer shadow-xs hover:shadow-md transition-all"
                         onclick="openImageModal('${imgUrl}', '${caption.replace(/'/g, "\\'")}', '${item.date}')">
                      <img src="${imgUrl}" alt="${caption}" class="w-full h-full object-cover transform transition-transform duration-500 group-hover/photo:scale-110" loading="lazy" />
                      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-end p-2 text-white">
                        <span class="text-[10px] font-semibold truncate flex items-center gap-1">
                          <i data-lucide="zoom-in" class="w-3 h-3"></i>
                          Ampliar
                        </span>
                      </div>
                    </div>
                  `;
                  })
                  .join('')}
            </div>
          </div>
        `
                : ''
        }
      </div>
    </div>
  `;

    return itemEl;
}

// Fallback para URL de imagen si es objeto antiguo
function generateImageUrl(image) {
    if (!image) return '';
    if (typeof image === 'string') return image;
    if (image.url) return image.url;
    if (image.nombreFisico) {
        const baseUrl = window.AppGlobals.timelinePhotoApiUrl || '';
        return `${baseUrl}/jpg/timeline/${image.nombreFisico}`;
    }
    return '';
}

// Lightbox Modal para visualizar evidencias fotográficas en HD
function openImageModal(imageUrl, caption, date) {
    const existingModal = document.getElementById('image-modal');
    if (existingModal) existingModal.remove();

    const imageModal = document.createElement('div');
    imageModal.id = 'image-modal';
    imageModal.className =
        'fixed inset-0 z-[70] bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 transition-opacity duration-300';
    imageModal.style.opacity = '0';

    imageModal.innerHTML = `
    <div class="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
      
      <!-- Header del visor -->
      <div class="flex items-center justify-between p-4 bg-slate-950/80 border-b border-white/10 text-white z-10">
        <div>
          <h3 class="text-sm font-bold text-white line-clamp-1">${caption}</h3>
          <p class="text-xs text-slate-400">${date || 'Fecha de registro'}</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="downloadImage('${imageUrl}', '${caption.replace(/'/g, "\\'")}', '${date}')"
            class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span>Descargar</span>
          </button>
          <button onclick="closeImageModal()"
            class="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500 text-white flex items-center justify-center transition border border-white/20">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Imagen Central -->
      <div class="flex-1 flex items-center justify-center p-4 overflow-hidden bg-black/40">
        <img src="${imageUrl}" alt="${caption}" class="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg" />
      </div>
    </div>
  `;

    document.body.appendChild(imageModal);

    setTimeout(() => {
        imageModal.style.opacity = '1';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 20);

    imageModal.addEventListener('click', function (e) {
        if (e.target === imageModal) {
            closeImageModal();
        }
    });

    const handleEscape = function (e) {
        if (e.key === 'Escape') {
            closeImageModal();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 250);
    }
}

function downloadImage(imageUrl, caption, date) {
    const fileName = `${caption.replace(/[^a-zA-Z0-9]/g, '_')}_${date}.jpg`;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.target = '_blank';
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function showTimelineModal() {
    const modal = document.getElementById('timeline-modal');
    const card = document.getElementById('timeline-modal-card');
    if (modal && card) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, 20);
        document.body.style.overflow = 'hidden';
    }
}

function closeTimelineModal() {
    const modal = document.getElementById('timeline-modal');
    const card = document.getElementById('timeline-modal-card');
    if (modal && card) {
        modal.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
            window.AppGlobals.isTimelineModalOpen = false;
        }, 250);

        if (window.AppGlobals.timelineEscapeHandler) {
            document.removeEventListener('keydown', window.AppGlobals.timelineEscapeHandler);
            window.AppGlobals.timelineEscapeHandler = null;
        }
    }
}

function showTimelineWarningModal(projectCode) {
    const warningModal = document.createElement('div');
    warningModal.className =
        'fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4';
    warningModal.innerHTML = `
    <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-200">
      <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-4">
        <i data-lucide="calendar-x" class="w-7 h-7"></i>
      </div>
      <h3 class="text-base font-bold text-slate-800 mb-1">Sin Hitos Registrados</h3>
      <p class="text-xs text-slate-500 mb-6 leading-relaxed">
        El proyecto <strong>PFIS ${projectCode}</strong> se encuentra en etapa de programación preliminar.
      </p>
      <button onclick="this.closest('.fixed').remove()" class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition">
        Entendido
      </button>
    </div>
  `;
    document.body.appendChild(warningModal);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function showTimelineErrorModal(projectCode) {
    if (window.notificationHelper) {
        window.notificationHelper.error(
            `No se pudo cargar la línea de tiempo del proyecto PFIS ${projectCode}.`
        );
    }
}

window.initializeTimelineModal = initializeTimelineModal;
window.openTimelineModal = openTimelineModal;
window.closeTimelineModal = closeTimelineModal;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.downloadImage = downloadImage;
