/**
 * esriMap.js - Módulo retirado.
 * Migrado 100% a Leaflet (leafletMap.js) para eliminar la necesidad de API Key de ArcGIS.
 */

function initializeEsriMap() {
  console.log('VisorApp: Migrado a Leaflet. No se utiliza ArcGIS ni se requiere API Key.');
  if (typeof initializeModernMap === 'function') {
    initializeModernMap();
  }
}
