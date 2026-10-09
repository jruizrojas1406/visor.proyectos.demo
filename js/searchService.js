/**
 * SearchService - Servicio de búsqueda y filtrado de proyectos locales.
 */

function initializeSearchService() {
  window.AppGlobals = window.AppGlobals || {};

  window.AppGlobals.searchService = {
    allProjects: [],
    filteredProjects: [],

    async initialize() {
      this.allProjects = [...(window.LOCAL_PROJECTS_DATA || [])];
      this.filteredProjects = [...this.allProjects];
      console.log(`SearchService inicializado con ${this.allProjects.length} proyectos locales.`);
    },

    search(criteria = {}) {
      const term = (criteria.term || '').trim().toLowerCase();
      const status = criteria.status || 'all';
      const department = criteria.department || 'all';

      return this.allProjects.filter((p) => {
        const matchTerm =
          !term ||
          p.cCodPFIS.toLowerCase().includes(term) ||
          p.cDesInfraest.toLowerCase().includes(term) ||
          p.cDesFinalidad.toLowerCase().includes(term) ||
          p.location.department.toLowerCase().includes(term) ||
          p.location.district.toLowerCase().includes(term) ||
          p.contractor.toLowerCase().includes(term);

        const matchStatus =
          status === 'all' ||
          p.statusCode === status ||
          p.cDesEstado.toLowerCase() === status.toLowerCase();

        const matchDept =
          department === 'all' ||
          p.location.department.toLowerCase() === department.toLowerCase();

        return matchTerm && matchStatus && matchDept;
      });
    },

    getFilterOptions() {
      return {
        statuses: ['all', 'concluded', 'execution', 'programmed'],
        departments: [...new Set(this.allProjects.map((p) => p.location.department))],
      };
    },
  };
}