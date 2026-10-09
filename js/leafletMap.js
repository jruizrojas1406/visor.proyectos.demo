/**
 * LeafletMap - Motor de mapa interactivo moderno y ultra-ligero para la Demo.
 * Rápido, sin dependencias de backend, con soporte para satélite y OpenStreetMap,
 * marcadores con animación de pulso y selección instantánea de proyectos.
 */

function initializeModernMap() {
  window.AppGlobals = window.AppGlobals || {};

  const mapContainer = document.getElementById('viewDiv');
  if (!mapContainer) return;

  if (typeof L !== 'undefined') {
    initLeafletEngine();
  } else {
    console.error('LeafletMap: La biblioteca Leaflet (L) no está disponible en la página.');
  }
}

function initLeafletEngine() {
  const defaultCenter = [-9.5, -75.5];
  const defaultZoom = 6;

  // Crear mapa Leaflet
  const map = L.map('viewDiv', {
    center: defaultCenter,
    zoom: defaultZoom,
    zoomControl: false, // Usaremos los botones personalizados
    attributionControl: false,
  });

  window.AppGlobals.leafletMap = map;

  // Capas base 100% abiertas (Cero API Keys)
  const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
  });

  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  });

  const lightLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd',
  });

  // Capa Satelital Híbrida de Alta Resolución (Esri World Imagery + Etiquetas - 100% gratuita y sin API key)
  const satelliteImagery = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 19,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    }
  );

  const satelliteLabels = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 19,
      opacity: 0.9,
    }
  );

  const satelliteLayer = L.layerGroup([satelliteImagery, satelliteLabels]);

  // Capa base por defecto: Satelital Híbrido de Alta Resolución (Esri World Imagery)
  satelliteLayer.addTo(map);

  window.AppGlobals.baseLayers = {
    satellite: satelliteLayer,
    osm: osmLayer,
    carto: cartoLayer,
    light: lightLayer,
  };

  // Grupos de capas por estado
  const layers = {
    concluded: L.layerGroup().addTo(map),
    execution: L.layerGroup().addTo(map),
    programmed: L.layerGroup().addTo(map),
    pending: L.layerGroup().addTo(map),
  };

  window.AppGlobals.leafletLayers = layers;
  window.AppGlobals.projectMarkers = {};

  // Crear marcadores para cada proyecto local
  const projects = window.LOCAL_PROJECTS_DATA || [];

  projects.forEach((proj) => {
    const lat = proj.location.lat;
    const lng = proj.location.lng;

    // Color y estilo según estado
    let badgeColor = 'bg-emerald-500';
    let ringColor = 'border-emerald-400';
    let pulseColor = 'bg-emerald-400';
    let hexColor = '#10b981';
    let statusPillBg = 'bg-emerald-950/85 text-emerald-200 border-emerald-400/40';

    if (proj.statusCode === 'concluded') {
      badgeColor = 'bg-purple-600';
      ringColor = 'border-purple-400';
      pulseColor = 'bg-purple-400';
      hexColor = '#9333ea';
      statusPillBg = 'bg-purple-950/85 text-purple-200 border-purple-400/40';
    } else if (proj.statusCode === 'programmed') {
      badgeColor = 'bg-amber-500';
      ringColor = 'border-amber-400';
      pulseColor = 'bg-amber-400';
      hexColor = '#f59e0b';
      statusPillBg = 'bg-amber-950/85 text-amber-200 border-amber-400/40';
    }

    const formatCurrency = window.formatCurrency || ((val) => 'S/ ' + Number(val).toLocaleString('es-PE', { minimumFractionDigits: 0 }));

    // HTML del marcador personalizado con icono y pulso
    const customIconHtml = `
      <div class="relative flex items-center justify-center cursor-pointer group transform hover:scale-110 transition-transform duration-300">
        <span class="absolute w-8 h-8 rounded-full ${pulseColor} opacity-75 animate-ping"></span>
        <div class="w-9 h-9 ${badgeColor} text-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white relative z-10">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
        <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
          ${proj.cDesInfraest.split(' - ')[0]}
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: customIconHtml,
      className: 'custom-project-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([lat, lng], { icon: customIcon });

    // Tarjeta Flotante Ejecutiva Moderna (Hover Card)
    const hoverCardContent = `
      <div class="modern-hover-card-inner w-72 rounded-2xl overflow-hidden shadow-2xl bg-white/95 border border-white/70 backdrop-blur-xl text-slate-800"
           onclick="window.selectProjectOnMap('${proj.cCodPFIS}', [${lat}, ${lng}])">
        <!-- Portada fotográfica con degradado -->
        <div class="relative h-24 w-full bg-slate-900 overflow-hidden">
          <img src="${proj.coverImage || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80'}" 
               alt="${proj.cDesInfraest}" 
               class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-black/20"></div>
          
          <!-- Badges flotantes superiores -->
          <div class="absolute top-2 inset-x-2.5 flex items-center justify-between text-[10px] font-bold z-10">
            <span class="px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-md flex items-center gap-1 border ${statusPillBg}">
              <span class="w-1.5 h-1.5 rounded-full ${pulseColor} animate-pulse"></span>
              ${proj.cDesEstado}
            </span>
            <span class="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white border border-white/20">
              PFIS ${proj.cCodPFIS}
            </span>
          </div>

          <!-- Ubicación geográfica -->
          <div class="absolute bottom-1.5 inset-x-2.5 text-white z-10">
            <div class="text-[10px] text-blue-200 font-medium flex items-center gap-1">
              <svg class="w-3 h-3 text-blue-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span class="truncate">${proj.location.district}, ${proj.location.department}</span>
            </div>
          </div>
        </div>

        <!-- Ficha de Información Ejecutiva -->
        <div class="p-3 space-y-2 bg-white/95">
          <h4 class="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
            ${proj.cDesInfraest}
          </h4>

          <!-- KPIs Presupuestales -->
          <div class="grid grid-cols-2 gap-2 text-[10px] bg-slate-50/90 p-2 rounded-xl border border-slate-200/70">
            <div>
              <span class="text-slate-400 font-semibold block uppercase">Presupuesto PIM</span>
              <strong class="text-slate-800 text-[11px] leading-tight block">${formatCurrency(proj.aPim)}</strong>
            </div>
            <div>
              <span class="text-slate-400 font-semibold block uppercase">Beneficiarios</span>
              <strong class="text-slate-800 text-[11px] truncate block leading-tight">${proj.beneficiaries || 'Población zonal'}</strong>
            </div>
          </div>

          <!-- Barra de Avance Físico -->
          <div class="space-y-1 pt-0.5">
            <div class="flex justify-between items-center text-[10px] font-semibold text-slate-600">
              <span>Avance Físico</span>
              <span class="font-extrabold text-slate-800">${proj.progress}%</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden p-0.5 border border-slate-200/60">
              <div class="h-full rounded-full transition-all duration-700" style="background-color: ${hexColor}; width: ${proj.progress}%;"></div>
            </div>
          </div>

          <!-- Hint de Acción -->
          <div class="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-blue-600 font-bold">
            <span>👆 Clic para abrir ficha completa</span>
            <svg class="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
        </div>
      </div>
    `;

    marker.bindTooltip(hoverCardContent, {
      direction: 'top',
      offset: [0, -22],
      className: 'modern-executive-popup-card',
      interactive: true,
      opacity: 1,
    });

    // Evento de clic en el marcador
    marker.on('click', () => {
      selectProjectOnMap(proj.cCodPFIS, [lat, lng]);
    });

    // Guardar referencia y agregar a la capa
    window.AppGlobals.projectMarkers[proj.cCodPFIS] = marker;

    if (layers[proj.statusCode]) {
      layers[proj.statusCode].addLayer(marker);
    } else {
      layers.pending.addLayer(marker);
    }
  });

  // Configurar interfaz de compatibilidad con AppGlobals.view
  window.AppGlobals.view = {
    zoom: defaultZoom,
    goTo: function (target, options = {}) {
      if (target && target.target) {
        target = target.target;
      }
      if (Array.isArray(target)) {
        map.flyTo(target, options.zoom || 13, { duration: 1.2 });
      } else if (target && target.latitude && target.longitude) {
        map.flyTo([target.latitude, target.longitude], options.zoom || 13, { duration: 1.2 });
      } else if (target && target.lat && target.lng) {
        map.flyTo([target.lat, target.lng], options.zoom || 13, { duration: 1.2 });
      } else {
        map.flyTo(defaultCenter, defaultZoom, { duration: 1.2 });
      }
      return Promise.resolve();
    },
  };

  // Clic en área vacía del mapa deselecciona proyecto
  map.on('click', () => {
    const deselected = new CustomEvent('projectDeselected');
    document.dispatchEvent(deselected);
    if (typeof updateExecutiveKpis === 'function') {
      updateExecutiveKpis(window.LOCAL_PROJECTS_DATA);
    }
  });

  // Conectar controles de Zoom
  const zoomInBtn = document.querySelector('.btn-zoom-in');
  const zoomOutBtn = document.querySelector('.btn-zoom-out');
  const homeBtn = document.querySelector('.btn-home');

  if (zoomInBtn) {
    zoomInBtn.onclick = () => map.zoomIn();
  }
  if (zoomOutBtn) {
    zoomOutBtn.onclick = () => map.zoomOut();
  }
  if (homeBtn) {
    homeBtn.onclick = () => {
      window.flyToRegion('all');
    };
  }

  // Actualizar contadores de leyenda
  updateLegendCounts();

  console.log('LeafletMap inicializado con éxito con 3 proyectos locales.');
}

// Función global para seleccionar un proyecto y centrar el mapa
window.selectProjectByCode = function (projectCode) {
  const projects = window.LOCAL_PROJECTS_DATA || [];
  const codeStr = String(projectCode).trim().toLowerCase();
  const project = projects.find(
    (p) =>
      String(p.cCodPFIS).toLowerCase() === codeStr ||
      String(p.id).toLowerCase() === codeStr ||
      p.cDesInfraest.toLowerCase().includes(codeStr)
  );

  if (!project) return;

  const latLng = [project.location.lat, project.location.lng];
  selectProjectOnMap(project.cCodPFIS, latLng);
};

function selectProjectOnMap(projectCode, latLng) {
  const map = window.AppGlobals.leafletMap;
  if (map && latLng) {
    map.flyTo(latLng, 14, { duration: 1.4, easeLinearity: 0.25 });
  }

  // Disparar evento para que projectPanel.js cargue los datos
  const event = new CustomEvent('projectSelected', {
    detail: { projectCode: projectCode },
  });
  document.dispatchEvent(event);

  // Abrir tooltip
  const marker = window.AppGlobals.projectMarkers && window.AppGlobals.projectMarkers[projectCode];
  if (marker) {
    marker.openTooltip();
  }

  // Sincronizar pastilla de región activa
  syncActiveRegionPillForProject(projectCode);
}

window.selectProjectOnMap = selectProjectOnMap;

// Sincronizar select de región según el proyecto seleccionado
function syncActiveRegionPillForProject(projectCode) {
  const projects = window.LOCAL_PROJECTS_DATA || [];
  const project = projects.find((p) => String(p.cCodPFIS) === String(projectCode));
  if (!project || !project.location || !project.location.department) return;

  const deptKey = project.location.department
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const regionSelect = document.getElementById('quick-region-dropdown');
  if (regionSelect) {
    for (let opt of regionSelect.options) {
      const optClean = opt.value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      if (optClean === deptKey) {
        regionSelect.value = opt.value;
        break;
      }
    }
  }

  const projectSelect = document.getElementById('quick-project-dropdown');
  if (projectSelect) {
    projectSelect.value = String(projectCode);
  }
}

// Función interactiva para volar suavemente por Región (FlyTo Suave)
window.flyToRegion = function (regionName) {
  const map = window.AppGlobals.leafletMap;
  if (!map) return;

  const defaultCenter = [-9.5, -75.5];
  const defaultZoom = 6;
  const projects = window.LOCAL_PROJECTS_DATA || [];

  const cleanName = String(regionName || 'all')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Sincronizar select de regiones
  const regionSelect = document.getElementById('quick-region-dropdown');
  if (regionSelect) {
    if (cleanName === 'all') {
      regionSelect.value = 'all';
    } else {
      for (let opt of regionSelect.options) {
        const optClean = opt.value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        if (optClean === cleanName) {
          regionSelect.value = opt.value;
          break;
        }
      }
    }
  }

  if (cleanName === 'all' || !regionName) {
    map.flyTo(defaultCenter, defaultZoom, { duration: 1.5, easeLinearity: 0.25 });

    // Cerrar tooltips abiertos
    map.closePopup();
    if (window.AppGlobals.projectMarkers) {
      Object.values(window.AppGlobals.projectMarkers).forEach((m) => m.closeTooltip());
    }

    const deselected = new CustomEvent('projectDeselected');
    document.dispatchEvent(deselected);

    // Resetear dropdown de proyectos
    const projectSelect = document.getElementById('quick-project-dropdown');
    if (projectSelect) projectSelect.value = '';

    if (typeof updateExecutiveKpis === 'function') {
      updateExecutiveKpis(projects);
    }

    if (window.notificationHelper) {
      window.notificationHelper.info(
        'Visualizando territorio nacional con todos los proyectos disponibles.',
        {
          title: 'Visión Perú',
          duration: 2500,
        }
      );
    }
    return;
  }

  // Filtrar proyectos que corresponden a la región
  const regionProjects = projects.filter(
    (p) =>
      p.location &&
      p.location.department &&
      p.location.department
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') === cleanName
  );

  if (regionProjects.length > 0) {
    const targetProject = regionProjects[0];
    const latLng = [targetProject.location.lat, targetProject.location.lng];

    // Actualizar KPIs para la región seleccionada
    if (typeof updateExecutiveKpis === 'function') {
      updateExecutiveKpis(regionProjects);
    }

    // Animación flyTo cinemática y fluida
    map.flyTo(latLng, 13, { duration: 1.6, easeLinearity: 0.2 });

    // Abrir ficha y tooltip tras culminar el desplazamiento
    setTimeout(() => {
      selectProjectOnMap(targetProject.cCodPFIS, latLng);
    }, 450);

    // Sincronizar dropdown de proyectos
    const projectSelect = document.getElementById('quick-project-dropdown');
    if (projectSelect) projectSelect.value = targetProject.cCodPFIS;

    if (window.notificationHelper) {
      window.notificationHelper.success(
        `Ubicado: ${targetProject.cDesInfraest} (${targetProject.location.province}, ${targetProject.location.department})`,
        {
          title: `Región ${targetProject.location.department}`,
          duration: 3500,
        }
      );
    }
  }
};

