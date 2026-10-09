/**
 * ProjectService - Servicio local de proyectos para la Demo.
 * Utiliza los modelos de datos locales definidos en mockData.js sin dependencias de base de datos.
 */

function initializeProjectService() {
  window.AppGlobals = window.AppGlobals || {};

  window.AppGlobals.projectService = {
    // Lista completa de proyectos locales
    get projects() {
      return window.LOCAL_PROJECTS_DATA || [];
    },

    // Obtener todos los proyectos
    async getAllProjects() {
      return [...this.projects];
    },

    // Obtener datos de un proyecto por su código PFIS o ID
    async fetchProjectData(projectCode) {
      if (!projectCode) {
        console.warn('ProjectService: No se proporcionó código de proyecto');
        return this.getFallbackData('unknown');
      }

      this.showLoadingIndicator();

      // Simular un pequeño retardo de 120ms para una experiencia fluida
      await new Promise((resolve) => setTimeout(resolve, 120));

      const codeStr = String(projectCode).trim().toLowerCase();
      const project = this.projects.find((p) =>
        String(p.cCodPFIS).toLowerCase() === codeStr ||
        String(p.id).toLowerCase() === codeStr ||
        p.cDesInfraest.toLowerCase().includes(codeStr) ||
        p.location.department.toLowerCase().includes(codeStr)
      );

      this.hideLoadingIndicator();

      if (project) {
        return this.transformData(project);
      } else {
        console.warn(`ProjectService: Proyecto no encontrado para código "${projectCode}"`);
        return this.getFallbackData(projectCode);
      }
    },

    // Buscar proyectos por término de búsqueda y filtros
    async searchProjects(criteria = {}) {
      const term = (criteria.term || '').trim().toLowerCase();
      const status = criteria.status || 'all';
      const department = criteria.department || 'all';

      return this.projects.filter((p) => {
        // Filtro por término
        const matchTerm = !term ||
          p.cCodPFIS.toLowerCase().includes(term) ||
          p.cDesInfraest.toLowerCase().includes(term) ||
          p.cDesFinalidad.toLowerCase().includes(term) ||
          p.location.department.toLowerCase().includes(term) ||
          p.location.province.toLowerCase().includes(term) ||
          p.location.district.toLowerCase().includes(term) ||
          p.contractor.toLowerCase().includes(term);

        // Filtro por estado
        const matchStatus = status === 'all' ||
          p.statusCode === status ||
          p.cDesEstado.toLowerCase() === status.toLowerCase();

        // Filtro por departamento
        const matchDept = department === 'all' ||
          p.location.department.toLowerCase() === department.toLowerCase();

        return matchTerm && matchStatus && matchDept;
      });
    },

    // Transformar datos del proyecto para la interfaz
    transformData(project) {
      return {
        id: project.id,
        cCodPFIS: project.cCodPFIS,
        uSefun: project.uSefun || 'SEF-LOCAL',
        cui: project.cui || 'N/A',
        cDesFinalidad: project.cDesFinalidad,
        cDesInfraest: project.cDesInfraest,
        cNomArea: project.cNomArea,
        cNomTipAdmin: project.cNomTipAdmin || 'Obra Pública',
        cNomTipInterv: project.cNomTipInterv,
        cNomUniMedida: project.cNomUniMedida || 'm²',
        dCantidadKm: project.dCantidadKm || 0,
        dCosContractual: project.dCosContractual || 0,
        aPim: project.aPim || 0,
        executedBudget: project.executedBudget || 0,
        cDesEstado: project.cDesEstado,
        statusCode: project.statusCode,
        statusColorHex: project.statusColorHex,
        fFecInicio: project.fFecInicio,
        fFecFinal: project.fFecFinal,
        durationDays: project.durationDays || 0,
        progress: project.progress || 0,
        budgetProgress: project.budgetProgress || 0,
        contractor: project.contractor,
        supervisor: project.supervisor,
        beneficiaries: project.beneficiaries || 'Población beneficiaria',
        pdfFile: project.pdfFile,
        pdfUrl: project.pdfUrl,
        location: { ...project.location },
        metrics: { ...(project.metrics || {}) },
        timeline: project.timeline || [],
        buttons: {
          hasTimeline: true,
          hasExecutiveSummary: true,
          hasReports: true,
        },
      };
    },

    // Datos de respaldo
    getFallbackData(projectCode) {
      return {
        cCodPFIS: projectCode,
        cDesFinalidad: 'Información del proyecto no disponible en la base local de demo',
        cDesInfraest: 'Proyecto no identificado',
        cNomArea: 'Área no disponible',
        cNomTipAdmin: 'Obra Pública',
        cNomTipInterv: 'No especificado',
        cNomUniMedida: 'm²',
        dCantidadKm: 0,
        dCosContractual: 0,
        aPim: 0,
        cDesEstado: 'Sin estado',
        fFecFinal: 'N/A',
        fFecInicio: 'N/A',
        progress: 0,
        budgetProgress: 0,
        contractor: 'No asignado',
        supervisor: 'No asignado',
        location: {
          department: 'No disponible',
          province: 'No disponible',
          district: 'No disponible',
        },
        buttons: {
          hasTimeline: false,
          hasExecutiveSummary: false,
          hasReports: false,
        },
      };
    },

    // Indicador visual de carga
    showLoadingIndicator() {
      this.hideLoadingIndicator();
      const indicator = document.createElement('div');
      indicator.id = 'project-loading-indicator';
      indicator.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none';
      indicator.innerHTML = `
        <div class="bg-slate-900/90 backdrop-blur-md text-white rounded-xl shadow-2xl border border-white/20 px-4 py-2.5 flex items-center gap-3">
          <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
          <span class="text-xs font-semibold tracking-wide">Cargando modelo de proyecto...</span>
        </div>
      `;
      document.body.appendChild(indicator);
    },

    hideLoadingIndicator() {
      const indicator = document.getElementById('project-loading-indicator');
      if (indicator) {
        indicator.remove();
      }
    },
  };
}
