const fs = require('fs');
const path = require('path');

function createPdfDocument(data) {
  // Generates valid PDF 1.4 document
  let stream = 'q\n';
  
  // Header background banner (Deep Blue gradient representation)
  stream += '0.08 0.24 0.45 rg 30 730 535 80 re f\n';
  stream += '0.85 0.20 0.20 rg 30 726 535 4 re f\n'; // Red stripe (Peruvian national accent)
  
  // Header Title
  stream += 'BT /F2 16 Tf 1 1 1 rg 45 780 Td (' + sanitize(data.headerTitle || 'SISTEMA DE GESTION DE INFRAESTRUCTURA PUBLICA') + ') Tj ET\n';
  stream += 'BT /F2 13 Tf 0.9 0.95 1 rg 45 760 Td (' + sanitize(data.title) + ') Tj ET\n';
  stream += 'BT /F1 9 Tf 0.75 0.85 0.95 rg 45 742 Td (' + sanitize('ESTADO: ' + data.status.toUpperCase() + ' | MODALIDAD: ' + data.modality.toUpperCase() + ' | FECHA REPORTE: ' + data.reportDate) + ') Tj ET\n';
  
  // Section 1: Datos Generales
  stream += '0.12 0.35 0.60 rg 30 700 535 20 re f\n';
  stream += 'BT /F2 10 Tf 1 1 1 rg 40 706 Td (1. DATOS GENERALES DEL PROYECTO) Tj ET\n';
  
  let y = 680;
  const generalData = [
    { label: 'Codigo PFIS / CUI', val: data.codePfis + ' / CUI: ' + data.cui },
    { label: 'Nombre Proyecto', val: data.title },
    { label: 'Ubicacion Geografica', val: 'Dpto: ' + data.department + ' | Prov: ' + data.province + ' | Dist: ' + data.district },
    { label: 'Modalidad de Ejecucion', val: data.modality },
    { label: 'Estado Situacional', val: data.status + ' (' + data.physicalProgress + '% Avance Fisico)' }
  ];
  
  for (const row of generalData) {
    stream += '0.96 0.97 0.99 rg 30 ' + (y - 18) + ' 535 20 re f\n';
    stream += '0.85 0.88 0.92 RG 0.5 w 30 ' + (y - 18) + ' 535 20 re s\n';
    stream += 'BT /F2 9 Tf 0.15 0.25 0.40 rg 40 ' + (y - 13) + ' Td (' + sanitize(row.label) + ':) Tj ET\n';
    stream += 'BT /F1 9 Tf 0.1 0.1 0.1 rg 190 ' + (y - 13) + ' Td (' + sanitize(row.val) + ') Tj ET\n';
    y -= 22;
  }
  
  y -= 8;
  // Section 2: Datos Financieros y Cronograma
  stream += '0.12 0.35 0.60 rg 30 ' + y + ' 535 20 re f\n';
  stream += 'BT /F2 10 Tf 1 1 1 rg 40 ' + (y + 6) + ' Td (2. EJECUCION FINANCIERA Y CRONOGRAMA) Tj ET\n';
  y -= 20;
  
  const finData = [
    { label: 'Presupuesto PIM 2026', val: 'S/. ' + data.pim },
    { label: 'Costo Contractual Total', val: 'S/. ' + data.contractualCost },
    { label: 'Avance Financiero Ejecutado', val: data.financialProgress + '% (S/. ' + data.financialAmount + ')' },
    { label: 'Plazo de Ejecucion', val: data.startDate + ' hasta ' + data.endDate + ' (' + data.durationDays + ' dias)' },
    { label: 'Contratista Ejecutor', val: data.contractor },
    { label: 'Empresa Supervisora', val: data.supervisor }
  ];
  
  for (const row of finData) {
    stream += '0.96 0.97 0.99 rg 30 ' + (y - 18) + ' 535 20 re f\n';
    stream += '0.85 0.88 0.92 RG 0.5 w 30 ' + (y - 18) + ' 535 20 re s\n';
    stream += 'BT /F2 9 Tf 0.15 0.25 0.40 rg 40 ' + (y - 13) + ' Td (' + sanitize(row.label) + ':) Tj ET\n';
    stream += 'BT /F1 9 Tf 0.1 0.1 0.1 rg 190 ' + (y - 13) + ' Td (' + sanitize(row.val) + ') Tj ET\n';
    y -= 22;
  }
  
  y -= 8;
  // Section 3: Resumen Ejecutivo y Metas
  stream += '0.12 0.35 0.60 rg 30 ' + y + ' 535 20 re f\n';
  stream += 'BT /F2 10 Tf 1 1 1 rg 40 ' + (y + 6) + ' Td (3. RESUMEN EJECUTIVO Y METAS FISICAS) Tj ET\n';
  y -= 24;
  
  stream += '0.96 0.98 1 rg 30 ' + (y - 85) + ' 535 90 re f\n';
  stream += '0.80 0.85 0.90 RG 0.5 w 30 ' + (y - 85) + ' 535 90 re s\n';
  
  let descLines = data.descriptionLines || [];
  let lineY = y - 10;
  for (const dline of descLines) {
    stream += 'BT /F1 8.5 Tf 0.15 0.15 0.20 rg 42 ' + lineY + ' Td (' + sanitize(dline) + ') Tj ET\n';
    lineY -= 14;
  }
  
  y -= 105;
  // Signatures / Stamps Box
  stream += '0.85 0.88 0.92 RG 1 w 50 ' + y + ' 210 50 re s\n';
  stream += '0.85 0.88 0.92 RG 1 w 335 ' + y + ' 210 50 re s\n';
  stream += 'BT /F1 8 Tf 0.4 0.4 0.4 rg 85 ' + (y + 10) + ' Td (JEFE DE PROYECTO / RESIDENTE) Tj ET\n';
  stream += 'BT /F1 8 Tf 0.4 0.4 0.4 rg 380 ' + (y + 10) + ' Td (SUPERVISION DE OBRA) Tj ET\n';
  
  // Footer
  stream += '0.08 0.24 0.45 rg 30 30 535 15 re f\n';
  stream += 'BT /F1 8 Tf 1 1 1 rg 45 34 Td (Documento Oficial de Seguimiento de Inversiones - Generado para DEMO VISORAPP) Tj ET\n';
  stream += 'BT /F1 8 Tf 1 1 1 rg 480 34 Td (Pagina 1 de 1) Tj ET\n';
  
  stream += 'Q\n';
  
  const streamBuf = Buffer.from(stream, 'latin1');
  const streamLen = streamBuf.length;
  
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n';
  const obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n';
  const obj6 = '6 0 obj\n<< /Length ' + streamLen + ' >>\nstream\n' + stream + 'endstream\nendobj\n';
  
  const body = [obj1, obj2, obj3, obj4, obj5, obj6];
  let pdf = '%PDF-1.4\n';
  let offsets = [0];
  let cur = Buffer.byteLength(pdf, 'latin1');
  
  for (let i = 0; i < body.length; i++) {
    offsets.push(cur);
    pdf += body[i];
    cur = Buffer.byteLength(pdf, 'latin1');
  }
  
  const xrefOffset = cur;
  pdf += 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 1; i <= 6; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF\n';
  
  return Buffer.from(pdf, 'latin1');
}

function sanitize(str) {
  if (!str) return '';
  return String(str).replace(/[()\\\\]/g, '').replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n').replace(/Á/g, 'A').replace(/É/g, 'E').replace(/Í/g, 'I').replace(/Ó/g, 'O').replace(/Ú/g, 'U').replace(/Ñ/g, 'N');
}

const projects = [
  {
    fileName: 'C.S. Fernando Carbajal Segura - El Bosque-Obra Pública-Lambayeque.pdf',
    data: {
      headerTitle: 'MINISTERIO DE SALUD - GOBIERNO REGIONAL LAMBAYEQUE',
      title: 'C.S. Fernando Carbajal Segura - El Bosque',
      codePfis: '5021',
      cui: '2458921',
      modality: 'Obra Publica (Contrata)',
      status: 'Concluido',
      department: 'Lambayeque',
      province: 'Chiclayo',
      district: 'La Victoria',
      pim: '42,850,320.00',
      contractualCost: '41,200,000.00',
      financialAmount: '41,200,000.00',
      physicalProgress: '100',
      financialProgress: '100',
      startDate: '15/03/2023',
      endDate: '28/08/2024',
      durationDays: '532',
      contractor: 'Consorcio Salud Norte (Constructora del Norte SAC)',
      supervisor: 'Consorcio Supervisor Lambayeque',
      reportDate: '08/10/2026',
      descriptionLines: [
        'El proyecto contempla la construccion y equipamiento integral de 4 niveles para la atencion primaria y especializada.',
        'Cuenta con areas de emergencia 24h, salas de parto moderno, 18 consultorios medicos externos y laboratorio tipo II-1.',
        'Obra culminada satisfactoriamente con acta de recepcion conforme y entrega en operacion a la comunidad de La Victoria.',
        'Beneficiarios directos: Mas de 65,000 pobladores de la provincia de Chiclayo y zonas aledanas.'
      ]
    }
  },
  {
    fileName: 'C.S. Villa María del Triunfo-Obra Pública-Lima.pdf',
    data: {
      headerTitle: 'MINISTERIO DE SALUD - DIRIS LIMA SUR',
      title: 'C.S. Villa Maria del Triunfo',
      codePfis: '4747',
      cui: '2389140',
      modality: 'Obra Publica (Contrata)',
      status: 'En Ejecucion',
      department: 'Lima',
      province: 'Lima',
      district: 'Villa Maria del Triunfo',
      pim: '58,420,900.00',
      contractualCost: '56,150,000.00',
      financialAmount: '38,462,750.00',
      physicalProgress: '68.5',
      financialProgress: '68.5',
      startDate: '10/11/2023',
      endDate: '30/11/2025',
      durationDays: '751',
      contractor: 'Constructora e Inmobiliaria Metropolitana S.A.',
      supervisor: 'Consorcio Control Tecnico VMT SAC',
      reportDate: '08/10/2026',
      descriptionLines: [
        'Construccion del nuevo Centro Materno Infantil de 5 niveles con aislamiento sismico y tecnologia hospitalaria de vanguardia.',
        'Estructura de concreto armado culminada al 100%. Instalaciones sanitarias y electricas con avance del 72%.',
        'Se realizan trabajos de acabados arquitectonicos, muros cortina y preparacion de ductos de climatizacion.',
        'Se preve la recepcion y marcha blanca para el ultimo trimestre con capacidad para 120,000 atenciones anuales.'
      ]
    }
  },
  {
    fileName: 'E.S. Progreso-Obra Pública-Ancash.pdf',
    data: {
      headerTitle: 'MINISTERIO DE SALUD - GOBIERNO REGIONAL DE ANCASH',
      title: 'E.S. Progreso',
      codePfis: '3892',
      cui: '2297433',
      modality: 'Obra Publica (Contrata)',
      status: 'Programado',
      department: 'Ancash',
      province: 'Santa',
      district: 'Chimbote',
      pim: '34,780,000.00',
      contractualCost: '33,900,000.00',
      financialAmount: '3,390,000.00',
      physicalProgress: '0.0',
      financialProgress: '10.0',
      startDate: '01/12/2026',
      endDate: '15/06/2028',
      durationDays: '562',
      contractor: 'Consorcio Hospitalario El Puerto (Proceso de Adjudicacion)',
      supervisor: 'Comite Especial de Supervision - GORE Ancash',
      reportDate: '08/10/2026',
      descriptionLines: [
        'Proyecto estrategico para la reposicion y modernizacion integral del Establecimiento de Salud Progreso.',
        'Expediente tecnico aprobado y con declaratoria de viabilidad vigente en el marco del Invierte.pe.',
        'Terreno saneado legalmente con plan de contingencia temporal aprobado para garantizar atencion medica continua.',
        'Inicio de obras fisicas y demolicion de estructura antigua programada segun cronograma de contrataciones del Estado.'
      ]
    }
  }
];

const pdfDir = path.join(__dirname, 'pdf');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

for (const p of projects) {
  const filePath = path.join(pdfDir, p.fileName);
  const pdfBuffer = createPdfDocument(p.data);
  fs.writeFileSync(filePath, pdfBuffer);
  console.log('Generado:', p.fileName, '(' + pdfBuffer.length + ' bytes)');
}

