class NotificationHelper {
  constructor() {
    this.defaultDuration = 3000;
    this.maxNotifications = 5;
    this.notifications = new Map();
    this.notificationId = 0;

    // Crear contenedor de notificaciones si no existe
    this.createNotificationContainer();

    // Configurar estilos CSS
    this.injectStyles();
  }

  // Crear contenedor principal de notificaciones
  createNotificationContainer() {
    const base = 'z-[100] space-y-3 pointer-events-none max-w-[400px]';
    const positions = {
      'top-right': 'fixed top-4 right-4',
      'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'fixed bottom-4 right-4',
    };

    for (const pos in positions) {
      if (!document.getElementById(`notification-container-${pos}`)) {
        const container = document.createElement('div');
        container.id = `notification-container-${pos}`;
        container.className = `${positions[pos]} ${base}`;
        document.body.appendChild(container);
      }
    }
  }

  // Obtener la clase del contenedor según la posición
  getContainerClassByPosition(position) {
    const base = 'z-[100] space-y-3 pointer-events-none max-w-[400px]';
    const map = {
      'top-right': 'fixed top-4 right-4',
      'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'fixed bottom-4 right-4',
    };
    return `${map[position] || map['top-right']} ${base}`;
  }

  // Inyectar estilos CSS
  injectStyles() {
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
                .notification-item {
                    pointer-events: auto;
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .notification-item.show {
                    transform: translateX(0);
                    opacity: 1;
                }
                
                .notification-item.hide {
                    transform: translateX(100%);
                    opacity: 0;
                }
                
                .notification-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: rgba(255, 255, 255, 0.3);
                    transition: width linear;
                }
                
                .notification-close-btn {
                    transition: all 0.2s ease;
                }
                
                .notification-close-btn:hover {
                    transform: scale(1.1);
                    background: rgba(255, 255, 255, 0.2);
                }
                
                @keyframes notificationPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                
                .notification-pulse {
                    animation: notificationPulse 0.6s ease-in-out;
                }
            `;
      document.head.appendChild(style);
    }
  }

  // Método principal para mostrar las notificaciones
  show(options) {
    const config = this.normalizeOptions(options);
    this.limitNotifications(config.position);

    const notification = this.createNotificationElement(config);

    // Selecciona el contenedor según la posición
    const container =
      document.getElementById(`notification-container-${config.position}`) || document.getElementById('notification-container-top-right');
    container.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 50);

    if (config.autoDismiss) {
      this.setupAutoDismiss(notification, config);
    }

    this.notifications.set(notification.id, {
      element: notification,
      config: config,
      createdAt: Date.now(),
    });

    return notification.id;
  }

  normalizeOptions(options) {
    if (typeof options === 'string') {
      options = { message: options };
    }

    return {
      id: `notification-${++this.notificationId}`,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      icon: options.icon || this.getDefaultIcon(options.type),
      duration: options.duration !== undefined ? options.duration : this.defaultDuration,
      autoDismiss: options.autoDismiss !== false,
      closable: options.closable !== false,
      actions: options.actions || [],
      className: options.className || '',
      onClick: options.onClick || null,
      onClose: options.onClose || null,
      persistent: options.persistent || false,
      showProgress: options.showProgress !== false && options.autoDismiss !== false,
      background: options.background || '',
      position: options.position || 'top-center', // top-center, center, top-right
    };
  }

  // Obtener el icono por defecto según el tipo de notificación
  getDefaultIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'alert-circle',
      warning: 'alert-triangle',
      info: 'info',
      loading: 'loader',
      question: 'help-circle',
    };
    return icons[type] || 'info';
  }

  // Crear el elemento del DOM de la notificación
  createNotificationElement(config) {
    const notification = document.createElement('div');
    notification.id = config.id;
    notification.className = `notification-item ${config.className}`;

    const bgColors = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-orange-600',
      info: 'bg-blue-600',
      loading: 'bg-gray-600',
      question: 'bg-purple-600',
    };

    let bgColor = bgColors[config.type] || bgColors.info;
    let styleAttr = '';

    if (config.background) {
      bgColor = '';
      styleAttr = `background: ${config.background};`;
    }

    notification.innerHTML = `
            <div class="${bgColor} text-white rounded-lg shadow-lg overflow-hidden relative" style="${styleAttr}">
                ${config.showProgress ? `<div class="notification-progress" style="width: 100%"></div>` : ''}
                
                <div class="p-4">
                    <div class="flex items-start gap-3">
                        ${
                          config.icon
                            ? `
                            <div class="flex-shrink-0 mt-0.5">
                                <i data-lucide="${config.icon}" class="w-5 h-5 ${config.type === 'loading' ? 'animate-spin' : ''}"></i>
                            </div>
                        `
                            : ''
                        }
                        
                        <div class="flex-1 min-w-0">
                            ${
                              config.title
                                ? `
                                <div class="text-sm font-medium font-semibold">${config.title}</div>
                            `
                                : ''
                            }
                            
                            ${
                              config.message
                                ? `
                                <div class="text-${config.title.length > 0 ? 'xs' : 'sm'} opacity-90 leading-relaxed">${
                                    config.message
                                  }</div>
                            `
                                : ''
                            }
                            
                            ${
                              config.actions.length > 0
                                ? `
                                <div class="flex gap-2 mt-3">
                                    ${config.actions
                                      .map(
                                        (action) => `
                                        <button 
                                            class="px-3 py-1 text-xs font-medium bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition-all duration-200"
                                            onclick="window.notificationHelper.handleAction('${config.id}', '${action.id}')"
                                        >
                                            ${action.label}
                                        </button>
                                    `,
                                      )
                                      .join('')}
                                </div>
                            `
                                : ''
                            }
                        </div>
                        
                        ${
                          config.closable
                            ? `
                            <button 
                                class="notification-close-btn flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white hover:bg-opacity-20 transition-all duration-200"
                                onclick="window.notificationHelper.dismiss('${config.id}')"
                                title="Cerrar"
                            >
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                        `
                            : ''
                        }
                    </div>
                </div>
            </div>
        `;

    // Agregar el event listener para el click de la notificación
    if (config.onClick) {
      notification.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          config.onClick(config.id);
        }
      });
      notification.style.cursor = 'pointer';
    }

    return notification;
  }

  // Configurar el auto-dismiss con barra de progreso
  setupAutoDismiss(notification, config) {
    if (config.duration <= 0) return;

    const progressBar = notification.querySelector('.notification-progress');

    if (progressBar) {
      // Animar la barra de progreso
      setTimeout(() => {
        progressBar.style.width = '0%';
        progressBar.style.transitionDuration = `${config.duration}ms`;
      }, 100);
    }

    // Auto-dismiss después del tiempo especificado
    setTimeout(() => {
      this.dismiss(config.id);
    }, config.duration);
  }

  // Limitar el número de notificaciones visibles
  limitNotifications(position = 'top-right') {
    const container =
      document.getElementById(`notification-container-${position}`) || document.getElementById('notification-container-top-right');
    const notifications = container.children;
    while (notifications.length >= this.maxNotifications) {
      const oldest = notifications[0];
      this.dismiss(oldest.id, false);
    }
  }

  // Manejar las acciones de los botones
  handleAction(notificationId, actionId) {
    const notification = this.notifications.get(notificationId);
    if (!notification) return;

    const action = notification.config.actions.find((a) => a.id === actionId);
    if (action && action.handler) {
      action.handler(notificationId, actionId);
    }

    // Auto-dismiss después de la acción si no es persistente
    if (!notification.config.persistent) {
      this.dismiss(notificationId);
    }
  }

  // Descartar la notificación
  dismiss(notificationId, animate = true) {
    const notification = this.notifications.get(notificationId);
    if (!notification) return;

    const element = notification.element;

    if (animate) {
      element.classList.add('hide');
      setTimeout(() => {
        this.removeNotification(notificationId);
      }, 400);
    } else {
      this.removeNotification(notificationId);
    }

    // Ejecutar el callback onClose
    if (notification.config.onClose) {
      notification.config.onClose(notificationId);
    }
  }

  // Remover la notificación del DOM y la memoria
  removeNotification(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (!notification) return;

    if (notification.element.parentNode) {
      notification.element.parentNode.removeChild(notification.element);
    }

    this.notifications.delete(notificationId);
  }

  // Métodos rápidos para tipos específicos
  success(message, options = {}) {
    return this.show({
      type: 'success',
      message,
      ...options,
    });
  }

  error(message, options = {}) {
    return this.show({
      type: 'error',
      message,
      duration: 10000, // Errores duran más tiempo
      ...options,
    });
  }

  warning(message, options = {}) {
    return this.show({
      type: 'warning',
      message,
      duration: 4000,
      ...options,
    });
  }

  info(message, options = {}) {
    return this.show({
      type: 'info',
      message,
      ...options,
    });
  }

  loading(message, options = {}) {
    return this.show({
      type: 'loading',
      message,
      autoDismiss: false,
      closable: false,
      showProgress: false,
      ...options,
    });
  }

  question(message, options = {}) {
    return this.show({
      type: 'question',
      message,
      autoDismiss: false,
      ...options,
    });
  }

  // ==========================================
  // GESTIÓN DE INDICADORES DE CARGA
  // ==========================================

  // Indicadores de carga centralizados
  loadingIndicators = new Map();

  // Mostrar indicador de carga con ID y configuración específica
  showLoading(id, options = {}) {
    // Si ya existe un loading con este ID, actualizarlo
    if (this.loadingIndicators.has(id)) {
      return this.updateLoading(id, options);
    }

    const config = {
      id: id,
      type: 'loading',
      message: options.message || 'Cargando...',
      title: options.title || '',
      position: options.position || 'top-center', // top-center, center, top-right
      overlay: options.overlay !== false, // Mostrar overlay por defecto
      closable: options.closable || false,
      showProgress: options.showProgress || false,
      progressValue: options.progressValue || 0,
      icon: options.icon || 'loader-circle',
      className: options.className || '',
      size: options.size || 'normal', // small, normal, large
      ...options,
    };

    const element = this.createLoadingElement(config);
    this.loadingIndicators.set(id, { element, config });

    return id;
  }

  // Crear elemento visual del loading según posición y configuración
  createLoadingElement(config) {
    const element = document.createElement('div');
    element.id = `loading-${config.id}`;

    // Clases de posición
    const positionClasses = {
      'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
      center: 'fixed inset-0 flex items-center justify-center z-50',
      'top-right': 'fixed top-4 right-4 z-50',
      'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
    };

    element.className = positionClasses[config.position] || positionClasses['top-center'];

    // Agregar overlay si es necesario
    if (config.overlay && config.position === 'center') {
      element.classList.add('bg-black', 'bg-opacity-50');
    }

    // Variantes de tamaño
    const sizeClasses = {
      small: 'text-sm',
      normal: '',
      large: 'text-lg',
    };

    const sizeClass = sizeClasses[config.size] || '';

    element.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden ${config.className}">
                <div class="p-4 ${sizeClass}">
                    <div class="flex items-center gap-3">
                        ${
                          config.icon
                            ? `
                            <div class="flex-shrink-0">
                                <i data-lucide="${config.icon}" class="h-8 w-8 animate-spin text-blue-600"></i>
                            </div>
                        `
                            : ''
                        }
                        
                        <div class="flex-1">
                            ${
                              config.title
                                ? `
                                <div class="font-semibold text-gray-800 mb-1">${config.title}</div>
                            `
                                : ''
                            }
                            
                            <div class="text-gray-600">${config.message}</div>
                            
                            ${
                              config.showProgress
                                ? `
                                <div class="mt-2">
                                    <div class="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Progreso</span>
                                        <span>${config.progressValue}%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                             style="width: ${config.progressValue}%"></div>
                                    </div>
                                </div>
                            `
                                : ''
                            }
                        </div>
                        
                        ${
                          config.closable
                            ? `
                            <button 
                                class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                                onclick="window.notificationHelper.hideLoading('${config.id}')"
                            >
                                <i data-lucide="x" class="w-4 h-4 text-gray-500"></i>
                            </button>
                        `
                            : ''
                        }
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(element);

    // Animar entrada
    element.style.opacity = '0';
    element.style.transform = config.position === 'center' ? 'scale(0.9)' : 'translateY(-20px)';

    setTimeout(() => {
      element.style.transition = 'all 0.3s ease';
      element.style.opacity = '1';
      element.style.transform = config.position === 'center' ? 'scale(1)' : 'translateY(0)';
    }, 50);

    // Inicializar iconos
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    return element;
  }

  // Actualizar un indicador de carga existente
  updateLoading(id, updates) {
    const loading = this.loadingIndicators.get(id);
    if (!loading) return;

    // Actualizar configuración
    Object.assign(loading.config, updates);

    // Actualizar elementos específicos
    const element = loading.element;

    if (updates.message) {
      const messageEl = element.querySelector('.text-gray-600');
      if (messageEl) messageEl.textContent = updates.message;
    }

    if (updates.progressValue !== undefined) {
      const progressBar = element.querySelector('.bg-blue-600');
      const progressText = element.querySelector('.text-xs span:last-child');
      if (progressBar) progressBar.style.width = `${updates.progressValue}%`;
      if (progressText) progressText.textContent = `${updates.progressValue}%`;
    }

    return id;
  }

  // Ocultar un indicador de carga
  hideLoading(id) {
    console.log(id);
    const loading = this.loadingIndicators.get(id);
    if (!loading) return;

    const element = loading.element;

    // Animar salida
    element.style.transition = 'all 0.3s ease';
    element.style.opacity = '0';
    element.style.transform = loading.config.position === 'center' ? 'scale(0.9)' : 'translateY(-20px)';

    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.loadingIndicators.delete(id);
    }, 300);
  }

  // Ocultar todos los indicadores de carga
  hideAllLoading() {
    const loadingIds = Array.from(this.loadingIndicators.keys());
    loadingIds.forEach((id) => this.hideLoading(id));
  }

  // ==========================================
  // MÉTODOS ESPECIALIZADOS DE CARGA
  // ==========================================

  // Carga de proyecto
  showProjectLoading(projectCode) {
    return this.showLoading('project-data', {
      title: 'Cargando Proyecto',
      message: `Obteniendo datos del proyecto ${projectCode}...`,
      icon: 'database',
      position: 'top-center',
    });
  }

  hideProjectLoading() {
    this.hideLoading('project-data');
  }

  // Carga de historial
  showTimelineLoading(projectCode) {
    return this.showLoading('timeline-data', {
      title: 'Cargando Historial',
      message: 'Obteniendo evidencias del proyecto...',
      icon: 'calendar-days',
      position: 'center',
      overlay: true,
    });
  }

  hideTimelineLoading() {
    this.hideLoading('timeline-data');
  }

  // Carga de generación de reporte
  showReportLoading(projectCode) {
    return this.showLoading('report-generation', {
      title: 'Generando Reporte',
      message: 'Procesando información del proyecto...',
      icon: 'file-text',
      position: 'center',
      overlay: true,
      showProgress: true,
      progressValue: 0,
    });
  }

  updateReportProgress(progress, message) {
    this.updateLoading('report-generation', {
      progressValue: progress,
      message: message || 'Procesando información del proyecto...',
    });
  }

  hideReportLoading() {
    this.hideLoading('report-generation');
  }

  // Carga de búsqueda
  showSearchLoading() {
    return this.showLoading('search-data', {
      message: 'Buscando proyectos...',
      icon: 'search',
      position: 'top-right',
      size: 'small',
    });
  }

  hideSearchLoading() {
    this.hideLoading('search-data');
  }

  // Métodos específicos para el proyecto
  projectSelected(projectCode) {
    return this.success(`Proyecto ${projectCode} cargado exitosamente`, {
      icon: 'check-circle',
      duration: 2000,
    });
  }

  projectAlreadySelected(projectCode) {
    return this.info(`Proyecto ${projectCode} ya está seleccionado`, {
      icon: 'info',
      duration: 1500,
    });
  }

  serviceNotAvailable(serviceName) {
    return this.warning(`${serviceName} no disponible`, {
      message: 'El servicio no está inicializado correctamente',
      duration: 3000,
    });
  }

  noProjectSelected() {
    return this.warning('Debe seleccionar un proyecto en el mapa', {
      message: 'Haga clic en cualquier punto del mapa para seleccionar un proyecto',
      duration: 3000,
    });
  }

  featureDisabled(featureName) {
    return this.info(`${featureName} no disponible`, {
      duration: 2000,
    });
  }

  searchProjectFound(projectCode) {
    return this.success(`Proyecto ${projectCode} encontrado y seleccionado`, {
      icon: 'search-check',
      duration: 2000,
    });
  }

  reportGenerated(projectCode, outputPath) {
    return this.success('Reporte Generado Exitosamente', {
      message: `Proyecto: ${projectCode}${outputPath ? `\nArchivo: ${outputPath.split('\\').pop()}` : ''}`,
      duration: 8000,
      actions: [
        {
          id: 'open-folder',
          label: 'Abrir Carpeta',
          handler: () => {
            console.log('Abriendo carpeta de reportes...');
          },
        },
      ],
    });
  }

  // Métodos de utilidad
  dismissAll() {
    const notificationIds = Array.from(this.notifications.keys());
    notificationIds.forEach((id) => this.dismiss(id));
  }

  updateNotification(notificationId, updates) {
    const notification = this.notifications.get(notificationId);
    if (!notification) return;

    // Actualizar configuración
    Object.assign(notification.config, updates);

    // Re-crear elemento con nueva configuración
    const newElement = this.createNotificationElement(notification.config);
    const oldElement = notification.element;

    // Reemplazar en el DOM
    oldElement.parentNode.replaceChild(newElement, oldElement);

    // Actualizar referencia
    notification.element = newElement;

    // Animar entrada
    setTimeout(() => {
      newElement.classList.add('show');
    }, 50);

    // Re-inicializar iconos
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // Obtener estadísticas
  getStats() {
    return {
      total: this.notifications.size,
      byType: Array.from(this.notifications.values()).reduce((acc, n) => {
        acc[n.config.type] = (acc[n.config.type] || 0) + 1;
        return acc;
      }, {}),
      oldest: Math.min(...Array.from(this.notifications.values()).map((n) => n.createdAt)),
      newest: Math.max(...Array.from(this.notifications.values()).map((n) => n.createdAt)),
    };
  }
}

// Inicializar helper global
window.notificationHelper = new NotificationHelper();

// Función de conveniencia global
window.notify = (message, options = {}) => {
  if (typeof message === 'string') {
    return window.notificationHelper.show({ message, ...options });
  }
  return window.notificationHelper.show(message);
};

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationHelper;
}
