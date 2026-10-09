function parseDate(dateString) {
  if (!dateString) {
    return null;
  }

  // Si ya es un objeto Date
  if (dateString instanceof Date) {
    return dateString;
  }

  // Formato Microsoft: /Date(1704171600000)/
  if (typeof dateString === 'string' && dateString.includes('Date(')) {
    const timestamp = parseInt(dateString.match(/\d+/)[0]);
    return new Date(timestamp);
  }

  // Formato DD/MM/YYYY
  if (typeof dateString === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString.trim())) {
    const parts = dateString.trim().split('/');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }

  // Otros formatos (ISO, etc.)
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

function convertDate(dateString) {
  if (!dateString) {
    return 'Fecha no disponible';
  }

  let date = parseDate(dateString);

  if (!date) {
    return 'Fecha no válida';
  }

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDate(dateString) {
  if (!dateString) {
    return 'Fecha no disponible';
  }

  let date = parseDate(dateString);

  if (!date) {
    return 'Fecha no válida';
  }

  return date.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
}

// Crear tarjeta de información moderna con diseño limpio
function createInfoCard(icon, title, value, subtitle = '', color = 'blue') {
  const colorVariants = {
    blue: {
      bg: 'from-blue-50 to-slate-50',
      border: 'border-blue-200',
      icon: 'text-white',
      iconBg: '#007ac2',
      text: '#007ac2',
      subtitle: '#007ac2',
    },
    red: {
      bg: 'from-red-50 to-slate-50',
      border: 'border-red-200',
      icon: 'text-white',
      iconBg: '#e5252a',
      text: '#e5252a',
      subtitle: '#e5252a',
    },
  };

  const variant = colorVariants[color];

  return `
        <div class="bg-gradient-to-br ${variant.bg} ${
    variant.border
  } border rounded-xl p-4 hover:shadow-md transition-all duration-300 group">
            <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 ${
                      variant.icon
                    } rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300" style="background-color: ${
    variant.iconBg
  };">
                        <i data-lucide="${icon}" class="w-5 h-5"></i>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-xs font-medium ${variant.text} mb-1 uppercase tracking-wider">${title}</h3>
                    <p class="text-base font-semibold leading-tight mb-1" style="color: ${variant.text};">${value}</p>
                    ${subtitle ? `<p class="text-xs" style="color: ${variant.subtitle};">${subtitle}</p>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Crear fila de datos compacta
function createDataRow(label, value, icon = '') {
  return `
        <div class="bg-white/90 rounded-lg border border-gray-200/50 hover:bg-white hover:shadow-sm transition-all duration-200 p-3">
            <div class="flex items-start gap-3 mb-2">
                ${icon ? `<i data-lucide="${icon}" class="w-3 h-3 text-gray-500"></i>` : ''}
                <span class="text-xs font-medium text-gray-500 uppercase tracking-wider">${label}</span>
            </div>
            <div class="text-sm font-medium text-gray-800 leading-relaxed break-words">${value}</div>
        </div>
    `;
}

// Crear encabezado de sección
function createSectionHeader(title, icon, color = 'blue') {
  const colorVariants = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      color: '#007ac2',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      color: '#e5252a',
    },
  };

  const variant = colorVariants[color];

  return `
        <div class="flex items-center gap-3 mb-4 mt-6 first:mt-0">
            <div class="w-7 h-7 ${variant.bg} ${variant.border} rounded-lg flex items-center justify-center border">
                <i data-lucide="${icon}" class="w-4 h-4" style="color: ${variant.color};"></i>
            </div>
            <h2 class="text-sm font-semibold text-gray-800">${title}</h2>
            <div class="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
        </div>
    `;
}

// Crear indicador de progreso
function createProgressIndicator(label, percentage, color = 'blue') {
  const colorVariants = {
    blue: '#007ac2',
    red: '#e5252a',
  };

  return `
        <div class="bg-white/90 rounded-lg p-3 border border-gray-200/50">
            <div class="flex justify-between items-center mb-3">
                <span class="text-xs font-medium text-gray-600">${label}</span>
                <span class="text-sm font-semibold text-gray-800">${percentage}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-1000 ease-out" 
                     style="background: linear-gradient(to right, ${colorVariants[color]}, ${colorVariants[color]}aa); width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

// Crear elemento de progresso de tiempo
function createTimeProggressItem(icon, label, date, isActive = false) {
  if (isActive) {
    return `
            <div class="rounded-lg p-3 text-white shadow-sm flex-1 border" style="background: linear-gradient(to right, #007ac2, #005284); border-color: rgba(0, 122, 194, 0.5);">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-white/20 rounded-md flex items-center justify-center flex-shrink-0">
                        <i data-lucide="${icon}" class="w-4 h-4"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-xs font-medium text-white/90">${label}</p>
                        <p class="text-sm font-semibold">${date}</p>
                    </div>
                    <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse flex-shrink-0"></div>
                </div>
            </div>
        `;
  } else {
    return `
            <div class="bg-white/90 rounded-lg p-3 border border-gray-200/50 hover:bg-white hover:shadow-sm transition-all duration-200 flex-1">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200 flex-shrink-0">
                        <i data-lucide="${icon}" class="w-4 h-4 text-gray-600"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-xs font-medium text-gray-600">${label}</p>
                        <p class="text-sm font-semibold text-gray-800">${date}</p>
                    </div>
                </div>
            </div>
        `;
  }
}

// Utilidad de animación para clics de botón
function animateButtonClick(button) {
  button.style.transform = 'translateY(-2px) scale(0.95)';
  setTimeout(() => {
    button.style.transform = '';
  }, 150);
}

// Agregar efectos interactivos
function addInteractiveEffects() {
  addParallaxEffect();
  addSmoothScrollBehavior();
}

function addParallaxEffect() {
  // Agregar efecto parallax a elementos flotantes (si existen)
  document.addEventListener('mousemove', function (e) {
    const floatingElements = document.querySelectorAll('.floating-element');
    if (floatingElements.length === 0) return;

    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    floatingElements.forEach((element, index) => {
      const speed = (index + 1) * 0.5;
      const x = (mouseX - 0.5) * speed * 20;
      const y = (mouseY - 0.5) * speed * 20;

      element.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
}

function addSmoothScrollBehavior() {
  document.documentElement.style.scrollBehavior = 'smooth';
}

// Manejar eventos de redimensionamiento de ventana
function handleWindowResize() {
  window.addEventListener('resize', () => {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 100);
  });
}

// Animar el cambio de valor de un contador de la leyenda
function animateCounterUpdate(element, newValue) {
  if (!element) return;
  const duration = 600; // ms
  const startValue = parseInt(element.textContent.replace(/\D/g, '')) || 0;
  const endValue = parseInt(newValue) || 0;
  if (startValue === endValue) return;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(startValue + (endValue - startValue) * progress);
    element.textContent = value;
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.textContent = endValue;
    }
  }
  requestAnimationFrame(animate);
}

function createSyncHash(str) {
  let hash1 = 5381;
  let hash2 = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);

    // djb2 hash
    hash1 = (hash1 << 5) + hash1 + char;
    hash1 = hash1 & 0xffffffff;

    // sdbm hash
    hash2 = char + (hash2 << 6) + (hash2 << 16) - hash2;
    hash2 = hash2 & 0xffffffff;
  }

  // Combinar y convertir a base36
  const h1 = (hash1 >>> 0).toString(36);
  const h2 = (hash2 >>> 0).toString(36);

  return (h1 + h2).substring(0, 12);
}

// Generar IDs únicos
function generateUniqueId(prefix = 'id') {
     if (!generateUniqueId.counter) generateUniqueId.counter = 0;
    generateUniqueId.counter++;

    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 10);
    const counter = generateUniqueId.counter.toString(36);

    return `${prefix}-${timestamp}-${counter}-${random}`;
}