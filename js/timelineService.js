/**
 * TimelineService - Servicio local de línea de tiempo y evidencias.
 * Provee los registros históricos y avances físicos de los proyectos locales.
 */

function initializeTimelineService() {
  window.AppGlobals = window.AppGlobals || {};

  window.AppGlobals.timelineService = {
    async fetchTimelineData(projectId) {
      if (!projectId) {
        return null;
      }

      const projects = window.LOCAL_PROJECTS_DATA || [];
      const codeStr = String(projectId).trim().toLowerCase();
      const project = projects.find(
        (p) =>
          String(p.cCodPFIS).toLowerCase() === codeStr ||
          String(p.id).toLowerCase() === codeStr ||
          p.cDesInfraest.toLowerCase().includes(codeStr)
      );

      if (!project) {
        console.warn(`TimelineService: No se encontró proyecto con ID/Código ${projectId}`);
        return null;
      }

      return {
        projectCode: project.cCodPFIS,
        projectName: project.cDesInfraest,
        projectPurpose: project.cDesFinalidad,
        totalDays: project.durationDays || 365,
        startDate: project.fFecInicio,
        endDate: project.fFecFinal,
        currentProgress: project.progress,
        locationText: project.location ? `${project.location.district}, ${project.location.province} • ${project.location.department}` : project.cNomArea,
        beforeImage: project.beforeImage || 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=1200&auto=format&fit=crop&q=80',
        beforeCaption: project.beforeCaption || 'Terreno inicial y trazo preliminar',
        afterImage: project.afterImage || project.coverImage || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&auto=format&fit=crop&q=80',
        afterCaption: project.afterCaption || 'Infraestructura hospitalaria culminada',
        timeline: (project.timeline || []).map((item, idx) => ({
          day: item.day || idx + 1,
          date: item.date,
          title: item.title,
          description: item.description,
          location: item.location || project.location.district,
          progress: item.progress || 0,
          status: item.status || 'Culminado',
          images: item.images || [],
        })),
        totalItems: (project.timeline || []).length,
      };
    },
  };
}
