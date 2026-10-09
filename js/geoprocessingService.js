/**
 * GeoprocessingService - Servicio de generación y visualización de reportes PDF para la Demo.
 * Localiza directamente los archivos PDF existentes en la carpeta 'pdf/' correspondientes a cada proyecto.
 */

function initializeGeoprocessingService() {
  window.AppGlobals = window.AppGlobals || {};

  window.AppGlobals.geoprocessingService = {
    isGeneratingReport: false,

    async generateProjectReport(projectCode) {
      if (!projectCode) {
        if (window.notificationHelper) {
          window.notificationHelper.warning('Debe seleccionar un proyecto para visualizar su reporte');
        }
        return;
      }

      const projects = window.LOCAL_PROJECTS_DATA || [];
      const codeStr = String(projectCode).trim().toLowerCase();
      const project = projects.find(
        (p) =>
          String(p.cCodPFIS).toLowerCase() === codeStr ||
          String(p.id).toLowerCase() === codeStr ||
          p.cDesInfraest.toLowerCase().includes(codeStr)
      );

      if (!project) {
        if (window.notificationHelper) {
          window.notificationHelper.error(`No se encontró reporte PDF para el código ${projectCode}`);
        }
        return;
      }

      if (window.notificationHelper) {
        window.notificationHelper.info(`Cargando reporte técnico: ${project.cDesInfraest}`, {
          title: 'Reporte de Proyecto',
          duration: 2500,
          icon: 'file-text',
        });
      }

      this.displayPDF(project.pdfUrl, project);
    },

    displayPDF(pdfUrl, project) {
      try {
        if (!window.pdfViewerInstance) {
          window.pdfViewerInstance = new PDFViewer({
            showDownloadButton: true,
            showNewTabButton: true,
            showFullscreenButton: true,
          });
        }

        const title = project.cDesInfraest || `Reporte del Proyecto ${project.cCodPFIS}`;
        const subtitle = `Modalidad: ${project.cNomTipAdmin} | Dpto: ${project.location.department}`;
        window.pdfViewerInstance.open(pdfUrl, title, subtitle);
      } catch (error) {
        console.error('GeoprocessingService: Error al mostrar reporte PDF:', error);
        window.open(pdfUrl, '_blank');
      }
    },
  };
}
