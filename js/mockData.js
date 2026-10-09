/**
 * Modelos de datos locales para la demostración del Visor.
 * Reemplaza la dependencia de base de datos y servicios externos con datos mock locales y enriquecidos.
 * Basado en los proyectos de la carpeta 'pdf/'.
 */

window.LOCAL_PROJECTS_DATA = [
  {
    id: "5021",
    cCodPFIS: "5021",
    uSefun: "SEF-2023-089",
    cui: "2458921",
    cDesInfraest: "C.S. Fernando Carbajal Segura - El Bosque",
    cDesFinalidad: "Mejoramiento y ampliación de la capacidad resolutiva de los servicios de salud del Centro de Salud Fernando Carbajal Segura - El Bosque, Distrito de La Victoria, Provincia de Chiclayo.",
    cNomArea: "DIRESA Lambayeque / Zonal Norte",
    cNomTipAdmin: "Obra Pública",
    cNomTipInterv: "Infraestructura Hospitalaria de Salud I-4",
    cNomUniMedida: "m² techados",
    dCantidadKm: 3840.50,
    cDesEstado: "Concluido",
    statusCode: "concluded",
    statusBadgeClass: "bg-purple-100 text-purple-800 border-purple-300",
    statusColorHex: "#9333ea",
    dCosContractual: 41200000,
    aPim: 42850320,
    executedBudget: 41200000,
    progress: 100,
    budgetProgress: 100,
    contractor: "Consorcio Salud Norte (Constructora del Norte S.A.C.)",
    supervisor: "Consorcio Supervisor Lambayeque",
    fFecInicio: "15/03/2023",
    fFecFinal: "28/08/2024",
    durationDays: 532,
    beneficiaries: "68,400 habitantes",
    pdfFile: "C.S. Fernando Carbajal Segura - El Bosque-Obra Pública-Lambayeque.pdf",
    pdfUrl: "pdf/C.S. Fernando Carbajal Segura - El Bosque-Obra Pública-Lambayeque.pdf",
    location: {
      department: "Lambayeque",
      province: "Chiclayo",
      district: "La Victoria",
      address: "Av. Los Incas N° 450, Urb. El Bosque",
      lat: -6.7865,
      lng: -79.8450
    },
    coverImage: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop&q=80",
    beforeImage: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=1200&auto=format&fit=crop&q=80",
    beforeCaption: "Terreno Inicial y Trazo Topográfico (Marzo 2023)",
    afterImage: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&auto=format&fit=crop&q=80",
    afterCaption: "Centro de Salud Fernando Carbajal Culminado y Equipado (Agosto 2024)",
    metrics: {
      bedsCount: 24,
      consultingRooms: 18,
      floors: 4,
      emergency24h: "Sí"
    },
    buttons: {
      hasTimeline: true,
      hasExecutiveSummary: true,
      hasReports: true
    },
    timeline: [
      {
        day: 1,
        date: "15/03/2023",
        title: "Acta de Entrega de Terreno e Inicio de Obra",
        description: "Se realizó la firma de acta y entrega formal de terreno con presencia de autoridades locales y supervisión técnica. Inicio de replanteo topográfico.",
        progress: 5,
        status: "Culminado",
        location: "La Victoria, Chiclayo",
        images: ["https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=600&auto=format&fit=crop&q=80"]
      },
      {
        day: 120,
        date: "12/07/2023",
        title: "Culminación de Cimentaciones y Zapatas",
        description: "Vaciado continuo de concreto premezclado en zapatas aisladas y vigas de cimentación sismorresistentes conforme a Norma E.030.",
        progress: 28,
        status: "Culminado",
        location: "Sector A y B - Terreno Principal",
        images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80"]
      },
      {
        day: 280,
        date: "20/12/2023",
        title: "Conclusión de Estructura de Concreto Armado (4 Niveles)",
        description: "Techado del 4to nivel y helipuerto de evacuación de emergencia. Encofrados retirados satisfactoriamente con pruebas de compresión superadas.",
        progress: 60,
        status: "Culminado",
        location: "Bloque Central",
        images: ["https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600&auto=format&fit=crop&q=80"]
      },
      {
        day: 420,
        date: "10/05/2024",
        title: "Instalaciones Especiales y Equipamiento Biomédico",
        description: "Instalación de redes de gases medicinales, tableros aislados de quirófano, grupo electrógeno y equipamiento de esterilización.",
        progress: 92,
        status: "Culminado",
        location: "Salas de Parto y Hospitalización",
        images: ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80"]
      },
      {
        day: 532,
        date: "28/08/2024",
        title: "Recepción Conforme y Entrega a la Comunidad",
        description: "Comité de Recepción suscribe acta de recepción final sin observaciones. Puesta en marcha blanca y atención a los usuarios.",
        progress: 100,
        status: "Concluido",
        location: "Frontis Principal",
        images: ["https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80"]
      }
    ]
  },
  {
    id: "4747",
    cCodPFIS: "4747",
    uSefun: "SEF-2023-142",
    cui: "2389140",
    cDesInfraest: "C.S. Villa María del Triunfo",
    cDesFinalidad: "Construcción y equipamiento del nuevo Centro de Salud Materno Infantil Villa María del Triunfo, DIRIS Lima Sur, Distrito de Villa María del Triunfo.",
    cNomArea: "DIRIS Lima Sur / Red Integrada de Salud",
    cNomTipAdmin: "Obra Pública",
    cNomTipInterv: "Infraestructura Especializada Materno Infantil I-4",
    cNomUniMedida: "m² techados",
    dCantidadKm: 5210.80,
    cDesEstado: "En Ejecución",
    statusCode: "execution",
    statusBadgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    statusColorHex: "#10b981",
    dCosContractual: 56150000,
    aPim: 58420900,
    executedBudget: 38462750,
    progress: 68.5,
    budgetProgress: 68.5,
    contractor: "Constructora e Inmobiliaria Metropolitana S.A.",
    supervisor: "Consorcio Control Técnico VMT S.A.C.",
    fFecInicio: "10/11/2023",
    fFecFinal: "30/11/2025",
    durationDays: 751,
    beneficiaries: "145,000 habitantes",
    pdfFile: "C.S. Villa María del Triunfo-Obra Pública-Lima.pdf",
    pdfUrl: "pdf/C.S. Villa María del Triunfo-Obra Pública-Lima.pdf",
    location: {
      department: "Lima",
      province: "Lima",
      district: "Villa María del Triunfo",
      address: "Av. Salvador Allende cdra. 12 s/n",
      lat: -12.1610,
      lng: -76.9380
    },
    coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop&q=80",
    beforeImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80",
    beforeCaption: "Excavaciones masivas y muros de contención (Noviembre 2023)",
    afterImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80",
    afterCaption: "Edificio Materno Infantil y Quirófanos en acabados (Marzo 2025)",
    metrics: {
      bedsCount: 36,
      consultingRooms: 24,
      floors: 5,
      emergency24h: "Sí"
    },
    buttons: {
      hasTimeline: true,
      hasExecutiveSummary: true,
      hasReports: true
    },
    timeline: [
      {
        day: 1,
        date: "10/11/2023",
        title: "Inicio de Movimiento de Tierras y Muros de Contención",
        description: "Demolición de la infraestructura antigua y estabilización de taludes con pantallas de micropilotes en zona de ladera.",
        progress: 8,
        status: "Culminado",
        location: "Villa María del Triunfo",
        images: ["https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80"]
      },
      {
        day: 180,
        date: "08/05/2024",
        title: "Montaje de Aisladores Sísmicos de Base",
        description: "Instalación de 32 elastómeros con núcleo de plomo importados para garantizar operatividad hospitalaria continua post-sismo.",
        progress: 35,
        status: "Culminado",
        location: "Nivel de Subsuelo",
        images: ["https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80"]
      },
      {
        day: 365,
        date: "09/11/2024",
        title: "Estructura Principal Culminada al 100%",
        description: "Conclusión de los 5 niveles en concreto armado. Inicio de albañilería confinada, tabiquería de drywall acústico y ductos sanitarios.",
        progress: 55,
        status: "Culminado",
        location: "Pisos 1 al 5",
        images: ["https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=600&auto=format&fit=crop&q=80"]
      },
      {
        day: 480,
        date: "05/03/2025",
        title: "Acabados y Redes Electromecánicas (En Ejecución)",
        description: "Avance sostenido en instalación de piso vinílico conductivo en quirófanos, carpintería metálica y unidades de aire acondicionado.",
        progress: 68.5,
        status: "En Proceso",
        location: "Área Quirúrgica y Neonatal",
        images: ["https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80"]
      }
    ]
  },
  {
    id: "3892",
    cCodPFIS: "3892",
    uSefun: "SEF-2024-031",
    cui: "2297433",
    cDesInfraest: "E.S. Progreso",
    cDesFinalidad: "Mejoramiento integral y ampliación de los servicios de salud del Establecimiento de Salud Progreso del Distrito de Chimbote, Provincia del Santa, Departamento de Ancash.",
    cNomArea: "Gobierno Regional de Ancash / Red Pacífico Sur",
    cNomTipAdmin: "Obra Pública",
    cNomTipInterv: "Construcción y Equipamiento de Establecimiento de Salud",
    cNomUniMedida: "m² techados",
    dCantidadKm: 3120.00,
    cDesEstado: "Programado",
    statusCode: "programmed",
    statusBadgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    statusColorHex: "#eab308",
    dCosContractual: 33900000,
    aPim: 34780000,
    executedBudget: 3390000,
    progress: 0.0,
    budgetProgress: 10.0,
    contractor: "Consorcio Hospitalario El Puerto (Proceso de Adjudicación)",
    supervisor: "Comité de Supervisión Técnica - GORE Ancash",
    fFecInicio: "01/12/2026",
    fFecFinal: "15/06/2028",
    durationDays: 562,
    beneficiaries: "52,300 habitantes",
    pdfFile: "E.S. Progreso-Obra Pública-Ancash.pdf",
    pdfUrl: "pdf/E.S. Progreso-Obra Pública-Ancash.pdf",
    location: {
      department: "Ancash",
      province: "Santa",
      district: "Chimbote",
      address: "Jr. Progreso N° 820, Chimbote",
      lat: -9.0740,
      lng: -78.5780
    },
    coverImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
    beforeImage: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&auto=format&fit=crop&q=80",
    beforeCaption: "Terreno actual y cerco perimétrico preliminar (Enero 2024)",
    afterImage: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&auto=format&fit=crop&q=80",
    afterCaption: "Diseño hospitalario proyectado según expediente técnico",
    metrics: {
      bedsCount: 16,
      consultingRooms: 14,
      floors: 3,
      emergency24h: "Sí"
    },
    buttons: {
      hasTimeline: true,
      hasExecutiveSummary: true,
      hasReports: true
    },
    timeline: [
      {
        day: 0,
        date: "15/08/2026",
        title: "Aprobación de Expediente Técnico y Licencia de Edificación",
        description: "Resolución Directoral que aprueba el expediente técnico definitivo con presupuesto validado en el banco de inversiones Invierte.pe.",
        progress: 0,
        status: "Culminado",
        location: "GORE Ancash - Sede Central",
        images: ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80"]
      },
      {
        day: 0,
        date: "25/09/2026",
        title: "Plan de Contingencia y Mantenimiento Temporal",
        description: "Habilitación del local temporal de contingencia para el traslado de los servicios de consulta externa y emergencia sin interrumpir la atención médica.",
        progress: 0,
        status: "Culminado",
        location: "Local Comunal Chimbote",
        images: ["https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80"]
      },
      {
        day: 1,
        date: "01/12/2026",
        title: "Inicio Programado de Demolición y Obras Civiles",
        description: "Hito contractual programado para el inicio del replanteo, demolición de la infraestructura antigua y movimiento de tierras.",
        progress: 0,
        status: "Programado",
        location: "Terreno E.S. Progreso",
        images: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80"]
      }
    ]
  }
];

window.AppGlobals = window.AppGlobals || {};
window.AppGlobals.allProjects = window.LOCAL_PROJECTS_DATA;

