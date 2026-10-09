class PDFViewer {
  constructor(options = {}) {
    this.options = {
      // Configuración por defecto
      modalId: 'pdf-viewer-modal',
      showDownloadButton: true,
      showNewTabButton: true,
      showFullscreenButton: true,
      showZoomControls: false,
      showPageControls: false, // Para PDFs multipágina
      allowPrint: false,
      autoClose: false,
      closeOnEscape: true,
      closeOnBackdrop: true,
      showLoadingIndicator: true,
      customTitle: null,
      customSubtitle: null,
      onOpen: null,
      onClose: null,
      onDownload: null,
      onError: null,
      showNotifications: false,
      notifyOnOpen: false,
      notifyOnClose: false,
      notifyOnDownload: true,
      ...options,
    };

    this.isOpen = false;
    this.currentPdfUrl = null;
    this.currentTitle = null;
    this.escapeHandler = null;
    this.fullscreenMode = false;
  }

  // Método principal para abrir el visor
  open(pdfUrl, title = 'Documento PDF', subtitle = null) {
    if (this.isOpen) {
      this.close();
    }

    this.currentPdfUrl = pdfUrl;
    this.currentTitle = title;

    try {
      this.createModal(pdfUrl, title, subtitle);
      this.showModal();
      this.setupEventListeners();

      this.isOpen = true;

      // Callback de apertura
      if (this.options.onOpen) {
        this.options.onOpen(pdfUrl, title);
      }

      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    } catch (error) {
      console.error('PDFViewer: Error al abrir PDF:', error);
      if (this.options.onError) {
        this.options.onError(error);
      }
      // Fallback: abrir en nueva pestaña
      window.open(pdfUrl, '_blank');
    }
  }

  // Crear la estructura del modal
  createModal(pdfUrl, title, subtitle) {
    // Remover modal existente
    this.removeExistingModal();

    const modal = document.createElement('div');
    modal.id = this.options.modalId;
    modal.className = 'pdf-viewer-modal fixed inset-0 bg-black bg-opacity-95 z-[60] flex flex-col';
    modal.setAttribute('tabindex', '-1');
    modal.style.display = 'none';

    modal.innerHTML = this.generateModalHTML(pdfUrl, title, subtitle);

    document.body.appendChild(modal);

    // Inicializar iconos Lucide
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 100);
  }

  // Generar HTML del modal
  generateModalHTML(pdfUrl, title, subtitle) {
    const displayTitle = this.options.customTitle || title;
    const displaySubtitle = this.options.customSubtitle || subtitle || 'Documento PDF';

    return `
            <!-- Header del visor -->
            <div class="pdf-viewer-header flex-shrink-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 shadow-lg">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
                            <i data-lucide="file-text" class="w-5 h-5 text-white"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h2 class="text-lg font-bold truncate">${displayTitle}</h2>
                            <p class="text-sm text-gray-300 truncate">${displaySubtitle}</p>
                        </div>
                    </div>
                    
                    <!-- Controles del header -->
                    <div class="flex items-center gap-2">
                        ${
                          this.options.showDownloadButton
                            ? `
                            <button id="pdf-download-btn" 
                                    class="pdf-control-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                    title="Descargar PDF">
                                <i data-lucide="download" class="w-4 h-4"></i>
                                <span class="hidden sm:inline">Descargar</span>
                            </button>
                        `
                            : ''
                        }
                        
                        ${
                          this.options.showNewTabButton
                            ? `
                            <button id="pdf-newtab-btn" 
                                    class="pdf-control-btn px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                                    title="Abrir en nueva pestaña">
                                <i data-lucide="external-link" class="w-4 h-4"></i>
                                <span class="hidden sm:inline">Nueva Pestaña</span>
                            </button>
                        `
                            : ''
                        }
                        
                        ${
                          this.options.showFullscreenButton
                            ? `
                            <button id="pdf-fullscreen-btn" 
                                    class="pdf-control-btn px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-all duration-200"
                                    title="Pantalla completa">
                                <i data-lucide="maximize" class="w-4 h-4"></i>
                            </button>
                        `
                            : ''
                        }
                        
                        <button id="pdf-close-btn" 
                                class="pdf-control-btn w-10 h-10 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center transition-all duration-200"
                                title="Cerrar visor">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                </div>
                
                ${
                  this.options.showZoomControls
                    ? `
                    <!-- Controles de zoom -->
                    <div class="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-700">
                        <button id="pdf-zoom-out" class="pdf-zoom-btn w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-all duration-200" title="Reducir zoom">
                            <i data-lucide="zoom-out" class="w-4 h-4"></i>
                        </button>
                        
                        <span id="pdf-zoom-level" class="text-sm font-medium px-3 py-1 bg-gray-700 rounded-lg min-w-[60px] text-center">100%</span>
                        
                        <button id="pdf-zoom-in" class="pdf-zoom-btn w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-all duration-200" title="Aumentar zoom">
                            <i data-lucide="zoom-in" class="w-4 h-4"></i>
                        </button>
                        
                        <button id="pdf-zoom-reset" class="pdf-zoom-btn px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-medium transition-all duration-200" title="Zoom original">
                            Ajustar
                        </button>
                        
                        ${
                          this.options.allowPrint
                            ? `
                            <button id="pdf-print-btn" class="pdf-zoom-btn px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1" title="Imprimir">
                                <i data-lucide="printer" class="w-3 h-3"></i>
                                Imprimir
                            </button>
                        `
                            : ''
                        }
                    </div>
                `
                    : ''
                }
            </div>
            
            <!-- Contenedor del PDF -->
            <div class="pdf-viewer-content flex-1 relative bg-gray-100 overflow-hidden">
                <iframe 
                    id="pdf-iframe"
                    src="${pdfUrl}" 
                    class="w-full h-full border-0 pdf-iframe"
                    title="${displayTitle}"
                    onload="window.pdfViewerInstance?.handleIframeLoad()"
                    onerror="window.pdfViewerInstance?.handleIframeError()"
                    style="opacity: 0; transition: opacity 0.5s ease;">
                </iframe>
                
                ${
                  this.options.showLoadingIndicator
                    ? `
                    <div id="pdf-loading-indicator" class="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div class="text-center">
                            <div class="pdf-loading-spinner animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                            <p class="text-gray-700 font-medium text-lg">Cargando documento PDF...</p>
                            <p class="text-gray-500 text-sm mt-2">Por favor espere un momento</p>
                        </div>
                    </div>
                `
                    : ''
                }
                
                <!-- Indicador de error -->
                <div id="pdf-error-indicator" class="absolute inset-0 flex items-center justify-center bg-gray-100 hidden">
                    <div class="text-center max-w-md mx-auto p-6">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="alert-circle" class="w-8 h-8 text-red-500"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">Error al cargar PDF</h3>
                        <p class="text-gray-600 mb-4">No se pudo cargar el documento. Verifique la conexión o intente nuevamente.</p>
                        <div class="flex gap-2 justify-center">
                            <button id="pdf-retry-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                Reintentar
                            </button>
                            <button id="pdf-open-external-btn" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                                Abrir Externamente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  // Mostrar el modal con animación
  showModal() {
    const modal = document.getElementById(this.options.modalId);
    if (!modal) return;

    modal.style.display = 'flex';
    modal.style.opacity = '0';
    modal.style.transform = 'scale(0.95)';

    // Enfocar el modal
    setTimeout(() => {
      modal.focus();
    }, 100);

    // Animar entrada
    setTimeout(() => {
      modal.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      modal.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    }, 50);
  }

  // Configurar event listeners
  setupEventListeners() {
    const modal = document.getElementById(this.options.modalId);
    if (!modal) return;

    // Botón cerrar
    const closeBtn = modal.querySelector('#pdf-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Botón descargar
    const downloadBtn = modal.querySelector('#pdf-download-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.download());
    }

    // Botón nueva pestaña
    const newTabBtn = modal.querySelector('#pdf-newtab-btn');
    if (newTabBtn) {
      newTabBtn.addEventListener('click', () => this.openInNewTab());
    }

    // Botón pantalla completa
    const fullscreenBtn = modal.querySelector('#pdf-fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // Controles de zoom
    this.setupZoomControls(modal);

    // Botón imprimir
    const printBtn = modal.querySelector('#pdf-print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', () => this.print());
    }

    // Botones de error
    const retryBtn = modal.querySelector('#pdf-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.retry());
    }

    const openExternalBtn = modal.querySelector('#pdf-open-external-btn');
    if (openExternalBtn) {
      openExternalBtn.addEventListener('click', () => this.openInNewTab());
    }

    // Cerrar con escape
    if (this.options.closeOnEscape) {
      this.escapeHandler = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      };
      document.addEventListener('keydown', this.escapeHandler);
    }

    // Cerrar al hacer clic en el fondo
    if (this.options.closeOnBackdrop) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.close();
        }
      });
    }
  }

  // Configurar controles de zoom
  setupZoomControls(modal) {
    const zoomInBtn = modal.querySelector('#pdf-zoom-in');
    const zoomOutBtn = modal.querySelector('#pdf-zoom-out');
    const zoomResetBtn = modal.querySelector('#pdf-zoom-reset');
    const iframe = modal.querySelector('#pdf-iframe');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => this.zoomIn());
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => this.zoomOut());
    }

    if (zoomResetBtn) {
      zoomResetBtn.addEventListener('click', () => this.resetZoom());
    }
  }

  // Manejar carga exitosa del iframe
  handleIframeLoad() {
    const loadingIndicator = document.querySelector('#pdf-loading-indicator');
    const iframe = document.querySelector('#pdf-iframe');
    const statusElement = document.querySelector('#pdf-status');

    if (loadingIndicator) {
      loadingIndicator.style.opacity = '0';
      setTimeout(() => {
        loadingIndicator.style.display = 'none';
      }, 300);
    }

    if (iframe) {
      iframe.style.opacity = '1';
    }

    if (statusElement) {
      statusElement.textContent = 'Documento cargado';
    }

    // Inicializar zoom después de cargar
    this.initializeZoom();
  }

  // Manejar error del iframe
  handleIframeError() {
    const loadingIndicator = document.querySelector('#pdf-loading-indicator');
    const errorIndicator = document.querySelector('#pdf-error-indicator');
    const statusElement = document.querySelector('#pdf-status');

    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

    if (errorIndicator) {
      errorIndicator.classList.remove('hidden');
    }

    if (statusElement) {
      statusElement.textContent = 'Error al cargar';
    }

    if (this.options.onError) {
      this.options.onError(new Error('Error al cargar PDF en iframe'));
    }
  }

  download() {
    const loadingDownload = window.notificationHelper.loading('Descargando documento...', {
      position: 'top-right',
    });

    try {
      const link = document.createElement('a');
      link.href = this.currentPdfUrl;
      link.download = this.generateFileName();
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (this.options.onDownload) {
        this.options.onDownload(this.currentPdfUrl, this.currentTitle);
      }

      window.notificationHelper.dismiss(loadingDownload);
      window.notificationHelper.success(this.generateFileName(), {
        title: 'Documento descargado',
        position: 'top-right',
        duration: 3000,
      });
    } catch (error) {
      console.error('PDFViewer: Error al descargar:', error);
      window.notificationHelper.dismiss(loadingDownload);
      window.notificationHelper.error('Error en la descarga');
    }
  }

  openInNewTab() {
    window.open(this.currentPdfUrl, '_blank');
  }

  toggleFullscreen() {
    const modal = document.getElementById(this.options.modalId);
    if (!modal) return;

    if (!this.fullscreenMode) {
      // Entrar en pantalla completa
      if (modal.requestFullscreen) {
        modal.requestFullscreen();
      } else if (modal.webkitRequestFullscreen) {
        modal.webkitRequestFullscreen();
      } else if (modal.msRequestFullscreen) {
        modal.msRequestFullscreen();
      }
      this.fullscreenMode = true;
    } else {
      // Salir de pantalla completa
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      this.fullscreenMode = false;
    }
  }

  print() {
    const iframe = document.querySelector('#pdf-iframe');
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.print();
      } catch (error) {
        console.error('PDFViewer: Error al imprimir:', error);
        // Fallback: abrir en nueva ventana para imprimir
        window.open(this.currentPdfUrl, '_blank');
      }
    }
  }

  retry() {
    const iframe = document.querySelector('#pdf-iframe');
    const errorIndicator = document.querySelector('#pdf-error-indicator');
    const loadingIndicator = document.querySelector('#pdf-loading-indicator');

    if (errorIndicator) {
      errorIndicator.classList.add('hidden');
    }

    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex';
    }

    if (iframe) {
      iframe.src = this.currentPdfUrl + '?retry=' + Date.now();
    }
  }

  // Inicializar sistema de zoom
  initializeZoom() {
    this.currentZoom = 100;
    this.minZoom = 25;
    this.maxZoom = 500;
    this.zoomStep = 25;

    // Actualizar display inicial
    this.updateZoomDisplay();
  }

  // Controles de zoom mejorados
  zoomIn() {
    if (this.currentZoom < this.maxZoom) {
      this.currentZoom += this.zoomStep;
      this.applyZoom();
      this.updateZoomDisplay();

      // Feedback visual
      this.showZoomFeedback(`${this.currentZoom}%`);
    } else {
      this.showZoomFeedback('Zoom máximo alcanzado');
    }
  }

  zoomOut() {
    if (this.currentZoom > this.minZoom) {
      this.currentZoom -= this.zoomStep;
      this.applyZoom();
      this.updateZoomDisplay();

      // Feedback visual
      this.showZoomFeedback(`${this.currentZoom}%`);
    } else {
      this.showZoomFeedback('Zoom mínimo alcanzado');
    }
  }

  resetZoom() {
    this.currentZoom = 100;
    this.applyZoom();
    this.updateZoomDisplay();
    this.showZoomFeedback('Zoom restaurado');
  }

  // Aplicar zoom al iframe
  applyZoom() {
    const iframe = document.querySelector('#pdf-iframe');
    if (iframe) {
      const zoomFactor = this.currentZoom / 100;

      // Aplicar transformación CSS al iframe
      iframe.style.transform = `scale(${zoomFactor})`;
      iframe.style.transformOrigin = 'top left';

      // Ajustar el contenedor para el nuevo tamaño
      const container = iframe.parentElement;
      if (container && zoomFactor !== 1) {
        // Calcular nuevo tamaño del contenedor
        const newWidth = 100 / zoomFactor;
        const newHeight = 100 / zoomFactor;

        iframe.style.width = `${newWidth}%`;
        iframe.style.height = `${newHeight}%`;

        // Habilitar scroll si es necesario
        container.style.overflow = zoomFactor > 1 ? 'auto' : 'hidden';
      } else if (container) {
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        container.style.overflow = 'hidden';
      }
    }
  }

  // Actualizar display del nivel de zoom
  updateZoomDisplay() {
    const zoomLevelElement = document.querySelector('#pdf-zoom-level');
    if (zoomLevelElement) {
      zoomLevelElement.textContent = this.currentZoom + '%';

      // Efecto visual de actualización
      zoomLevelElement.style.transform = 'scale(1.1)';
      zoomLevelElement.style.transition = 'transform 0.2s ease';

      setTimeout(() => {
        zoomLevelElement.style.transform = 'scale(1)';
      }, 200);
    }

    // Actualizar estado de botones
    this.updateZoomButtons();
  }

  // Actualizar estado de botones de zoom
  updateZoomButtons() {
    const zoomInBtn = document.querySelector('#pdf-zoom-in');
    const zoomOutBtn = document.querySelector('#pdf-zoom-out');

    if (zoomInBtn) {
      if (this.currentZoom >= this.maxZoom) {
        zoomInBtn.disabled = true;
        zoomInBtn.style.opacity = '0.5';
        zoomInBtn.style.cursor = 'not-allowed';
      } else {
        zoomInBtn.disabled = false;
        zoomInBtn.style.opacity = '1';
        zoomInBtn.style.cursor = 'pointer';
      }
    }

    if (zoomOutBtn) {
      if (this.currentZoom <= this.minZoom) {
        zoomOutBtn.disabled = true;
        zoomOutBtn.style.opacity = '0.5';
        zoomOutBtn.style.cursor = 'not-allowed';
      } else {
        zoomOutBtn.disabled = false;
        zoomOutBtn.style.opacity = '1';
        zoomOutBtn.style.cursor = 'pointer';
      }
    }
  }

  // Mostrar feedback visual del zoom
  showZoomFeedback(message) {
    // Crear elemento de feedback temporal
    const feedback = document.createElement('div');
    feedback.className =
      'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm font-medium z-[70] pointer-events-none';
    feedback.textContent = message;

    document.body.appendChild(feedback);

    // Animar entrada
    feedback.style.opacity = '0';
    feedback.style.transform = 'translate(-50%, -50%) scale(0.8)';

    setTimeout(() => {
      feedback.style.transition = 'all 0.3s ease';
      feedback.style.opacity = '1';
      feedback.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);

    // Remover después de 1.5 segundos
    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transform = 'translate(-50%, -50%) scale(0.8)';

      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 300);
    }, 1500);
  }

  // Manejar zoom con rueda del mouse
  setupMouseWheelZoom() {
    const iframe = document.querySelector('#pdf-iframe');
    if (iframe) {
      iframe.addEventListener(
        'wheel',
        (e) => {
          // Solo si se mantiene Ctrl presionado
          if (e.ctrlKey) {
            e.preventDefault();

            if (e.deltaY < 0) {
              this.zoomIn();
            } else {
              this.zoomOut();
            }
          }
        },
        { passive: false },
      );
    }
  }

  // Cerrar el visor
  close() {
    if (!this.isOpen) return;

    const modal = document.getElementById(this.options.modalId);
    if (modal) {
      // Animar salida
      modal.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      modal.style.opacity = '0';
      modal.style.transform = 'scale(0.95)';

      setTimeout(() => {
        this.removeExistingModal();
      }, 300);
    }

    // Limpiar event listeners
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }

    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }

    // Restaurar scroll del body
    document.body.style.overflow = '';

    this.isOpen = false;
    this.currentPdfUrl = null;
    this.currentTitle = null;
    this.fullscreenMode = false;
    this.currentZoom = 100;

    // Callback de cierre
    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  // Remover modal existente
  removeExistingModal() {
    const existingModal = document.getElementById(this.options.modalId);
    if (existingModal) {
      existingModal.remove();
    }
  }

  // Generar nombre de archivo para descarga
  generateFileName() {
    const timestamp = new Date().toISOString().split('T')[0];
    const safeName = this.currentTitle.replace(/[^a-zA-Z0-9]/g, '_');
    return `${safeName}_${timestamp}.pdf`;
  }

  // Métodos de utilidad

  isViewerOpen() {
    return this.isOpen;
  }

  getCurrentPdfUrl() {
    return this.currentPdfUrl;
  }

  updateTitle(newTitle, newSubtitle = null) {
    this.currentTitle = newTitle;

    const titleElement = document.querySelector('.pdf-viewer-header h2');
    const subtitleElement = document.querySelector('.pdf-viewer-header p');

    if (titleElement) {
      titleElement.textContent = newTitle;
    }

    if (subtitleElement && newSubtitle) {
      subtitleElement.textContent = newSubtitle;
    }
  }

  // Método estático para crear instancia global
  static createGlobalInstance(options = {}) {
    if (!window.pdfViewerInstance) {
      window.pdfViewerInstance = new PDFViewer(options);
    }
    return window.pdfViewerInstance;
  }
}

// Crear instancia global por defecto
window.PDFViewer = PDFViewer;
window.pdfViewerInstance = PDFViewer.createGlobalInstance();

// Funciones de conveniencia globales
window.openPDF = (url, title, subtitle) => {
  window.pdfViewerInstance.open(url, title, subtitle);
};

window.closePDF = () => {
  window.pdfViewerInstance.close();
};

// Integración con el sistema de notificaciones existente
window.pdfViewerInstance.options.onOpen = (url, title) => {
  if (window.pdfViewerInstance.options.notifyOnOpen) {
    console.debug('PDFViewer: PDF abierto:', title);
  }
};

window.pdfViewerInstance.options.onClose = () => {
  if (window.pdfViewerInstance.options.notifyOnClose) {
    console.debug('PDFViewer: PDF cerrado');
  }
};

window.pdfViewerInstance.options.onDownload = (url, title) => {
  if (window.pdfViewerInstance.options.notifyOnDownload) {
    console.debug('PDFViewer: PDF descargado:', title);
  }
};

window.pdfViewerInstance.options.onError = (error) => {
  window.notificationHelper.error('Error en el visor PDF', {
    message: error.message,
    duration: 5000,
  });
};
// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PDFViewer;
}
