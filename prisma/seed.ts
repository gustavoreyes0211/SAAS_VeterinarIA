import { PrismaClient, BranchFacilityType, RoomType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando siembra de datos clínicos y operativos...');

  // 1. Permisos del Sistema
  const permissionsList = [
    { code: 'clinical:view', module: 'CLINICA', description: 'Ver expedientes clínicos y consultas' },
    { code: 'clinical:create', module: 'CLINICA', description: 'Crear nuevas consultas SOAP y recetas' },
    { code: 'clinical:edit', module: 'CLINICA', description: 'Editar y agregar adendas a consultas' },
    { code: 'icu:view', module: 'UCI', description: 'Visualizar Flowboard de hospitalización 24/7' },
    { code: 'icu:administer', module: 'UCI', description: 'Marcar ejecución de tratamientos y dosis' },
    { code: 'surgery:schedule', module: 'QUIROFANO', description: 'Programar cirugías y reservas' },
    { code: 'surgery:anesthesia', module: 'QUIROFANO', description: 'Registrar monitoreo transanestésico' },
    { code: 'triage:evaluate', module: 'EMERGENCIAS', description: 'Realizar triaje VECCS y clasificar gravedad' },
    { code: 'pharmacy:dispense', module: 'FARMACIA', description: 'Dispensar medicamentos fraccionados' },
    { code: 'pharmacy:adjust', module: 'FARMACIA', description: 'Realizar tomas físicas y mermas' },
    { code: 'dte:issue', module: 'FACTURACION', description: 'Emitir Facturas y Créditos Fiscales DTE' },
    { code: 'dte:void', module: 'FACTURACION', description: 'Invalidar documentos tributarios electrónicos' },
    { code: 'pos:cash_cut', module: 'CAJA', description: 'Realizar cortes de caja X y Z' },
    { code: 'grooming:manage', module: 'PELUQUERIA', description: 'Gestionar tablero Kanban de spa y baño' },
    { code: 'admin:users', module: 'ADMIN', description: 'Administrar usuarios y personal médico' },
    { code: 'admin:branches', module: 'ADMIN', description: 'Configurar sedes y consultorios' },
  ];

  console.log('  -> Creando catálogo de permisos...');
  const createdPermissions: Record<string, string> = {};
  for (const perm of permissionsList) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description, module: perm.module },
      create: perm,
    });
    createdPermissions[perm.code] = p.id;
  }

  // 2. Roles del Sistema
  console.log('  -> Creando roles maestros...');
  const rolesList = [
    { name: 'SUPER_ADMIN', isSystemRole: true, perms: Object.keys(createdPermissions) },
    {
      name: 'DIRECTOR_MEDICO',
      isSystemRole: true,
      perms: [
        'clinical:view', 'clinical:create', 'clinical:edit',
        'icu:view', 'icu:administer', 'surgery:schedule', 'surgery:anesthesia',
        'triage:evaluate', 'pharmacy:dispense', 'pharmacy:adjust', 'dte:issue', 'admin:branches'
      ]
    },
    {
      name: 'VETERINARIO_GENERAL',
      isSystemRole: true,
      perms: ['clinical:view', 'clinical:create', 'clinical:edit', 'triage:evaluate', 'icu:view', 'pharmacy:dispense']
    },
    {
      name: 'ENFERMERO_UCI',
      isSystemRole: true,
      perms: ['clinical:view', 'icu:view', 'icu:administer', 'triage:evaluate', 'pharmacy:dispense']
    },
    {
      name: 'RECEPCION_CAJA',
      isSystemRole: true,
      perms: ['clinical:view', 'triage:evaluate', 'dte:issue', 'pos:cash_cut', 'grooming:manage']
    },
    {
      name: 'PELUQUERO_GROOMER',
      isSystemRole: true,
      perms: ['grooming:manage']
    },
  ];

  const createdRoles: Record<string, string> = {};
  for (const r of rolesList) {
    let role = await prisma.role.findFirst({
      where: { name: r.name, isSystemRole: true },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: r.name,
          isSystemRole: true,
        },
      });
    }

    createdRoles[r.name] = role.id;

    // Vincular permisos al rol
    for (const code of r.perms) {
      const permId = createdPermissions[code];
      if (permId) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permId,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permId,
          },
        });
      }
    }
  }

  // 3. Tenant Demo (Hospital Principal)
  console.log('  -> Creando Tenant Demo (Hospital Central)...');
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'central' },
    update: {},
    create: {
      legalName: 'Hospital Veterinario San Salvador S.A. de C.V.',
      tradeName: 'Hospital Veterinario Central San Salvador',
      nit: '0614-010190-102-1',
      nrc: '123456-7',
      economicActivityCode: '75000',
      economicActivityName: 'Actividades Veterinarias, Clínicas y Hospitalarias',
      countryCode: 'SV',
      currencyCode: 'USD',
      subdomain: 'central',
      isActive: true,
    },
  });

  // 4. Sucursal Principal (Escalón)
  console.log('  -> Creando Sucursal Principal 24/7...');
  let branch = await prisma.branch.findFirst({
    where: { tenantId: tenant.id, code: 'ESC-01' },
  });

  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        tenantId: tenant.id,
        name: 'Sucursal Escalón - Hospital 24/7',
        code: 'ESC-01',
        facilityType: BranchFacilityType.MAIN_HOSPITAL_24_7,
        address: 'Paseo General Escalón #324, San Salvador',
        departmentCode: '06',
        municipalityCode: '14',
        establishmentCodeMh: 'M001',
        phoneE164: '+50322001122',
        emailContact: 'escalon@veterinaria.com',
        timezone: 'America/El_Salvador',
        hospitalizationCapacity: 24,
        icuCapacity: 6,
        hasSurgeryRoom: true,
        hasGroomingSalon: true,
        hasXrayImaging: true,
        hasLabFacility: true,
        hasEmergencyService247: true,
        isActive: true,
      },
    });
  }

  // 5. Salas y Consultorios de la Sede
  console.log('  -> Creando Consultorios y Salas Operativas...');
  const roomsList = [
    { name: 'Consultorio 1 - General', roomType: RoomType.CONSULTATION_GENERAL, code: 'C1' },
    { name: 'Consultorio 2 - Cat Friendly', roomType: RoomType.CONSULTATION_SPECIALTY, code: 'C2' },
    { name: 'Quirófano A (Cirugía Mayor)', roomType: RoomType.SURGERY_ROOM, code: 'QX-A' },
    { name: 'Unidad de Cuidados Intensivos (UCI)', roomType: RoomType.ICU_ROOM, code: 'UCI' },
    { name: 'Sala de Rayos X y Ecografía', roomType: RoomType.XRAY_ROOM, code: 'RX-1' },
    { name: 'Área de Triaje / Shock Room', roomType: RoomType.TRIAGE_ROOM, code: 'TR-1' },
    { name: 'Salón de Peluquería y Spa', roomType: RoomType.GROOMING_ROOM, code: 'SPA' },
  ];

  for (const r of roomsList) {
    const existingRoom = await prisma.room.findFirst({
      where: { tenantId: tenant.id, branchId: branch.id, code: r.code },
    });
    if (!existingRoom) {
      await prisma.room.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          name: r.name,
          roomType: r.roomType,
          code: r.code,
          isActive: true,
        },
      });
    }
  }

  // 6. Catálogo de Razas Base
  console.log('  -> Sembrando catálogo de razas caninas y felinas...');
  const baseBreeds = [
    // Caninos
    { species: 'CANINE', name: 'Labrador Retriever', weightM: 32, weightF: 28 },
    { species: 'CANINE', name: 'Golden Retriever', weightM: 30, weightF: 26 },
    { species: 'CANINE', name: 'Pastor Alemán', weightM: 35, weightF: 30 },
    { species: 'CANINE', name: 'Bulldog Francés', weightM: 12, weightF: 10 },
    { species: 'CANINE', name: 'Chihuahua', weightM: 2.5, weightF: 2.2 },
    { species: 'CANINE', name: 'Poodle (Caniche)', weightM: 7, weightF: 6 },
    { species: 'CANINE', name: 'Husky Siberiano', weightM: 25, weightF: 21 },
    { species: 'CANINE', name: 'Schnauzer Miniatura', weightM: 7.5, weightF: 6.8 },
    { species: 'CANINE', name: 'Mestizo Canino', weightM: 15, weightF: 14 },
    // Felinos
    { species: 'FELINE', name: 'Doméstico de Pelo Corto (DPC)', weightM: 4.5, weightF: 3.8 },
    { species: 'FELINE', name: 'Siamés', weightM: 4.0, weightF: 3.2 },
    { species: 'FELINE', name: 'Persa', weightM: 5.0, weightF: 4.0 },
    { species: 'FELINE', name: 'Maine Coon', weightM: 8.5, weightF: 6.5 },
    { species: 'FELINE', name: 'Bengala', weightM: 6.0, weightF: 4.8 },
  ];

  for (const b of baseBreeds) {
    const existing = await prisma.breed.findFirst({
      where: { species: b.species, name: b.name, tenantId: null },
    });
    if (!existing) {
      await prisma.breed.create({
        data: {
          species: b.species,
          name: b.name,
          standardWeightMaleKg: b.weightM,
          standardWeightFemKg: b.weightF,
          isSystemStandard: true,
        },
      });
    }
  }

  // 7. Usuario Administrador / Director Médico
  console.log('  -> Creando usuario administrador inicial...');
  const adminEmail = 'admin@veterinaria.com';
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      fullName: 'Dr. Gustavo Reyes',
      professionalLicense: 'JVPM-8942',
      isSuperAdmin: true,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      fullName: 'Dr. Gustavo Reyes',
      phoneE164: '+50370001234',
      professionalLicense: 'JVPM-8942',
      isSuperAdmin: true,
      isActive: true,
    },
  });

  // Vincular usuario al Tenant con rol SUPER_ADMIN
  const superAdminRoleId = createdRoles['SUPER_ADMIN'];
  await prisma.userTenant.upsert({
    where: {
      userId_tenantId: {
        userId: adminUser.id,
        tenantId: tenant.id,
      },
    },
    update: {
      roleId: superAdminRoleId,
      isActive: true,
    },
    create: {
      userId: adminUser.id,
      tenantId: tenant.id,
      roleId: superAdminRoleId,
      isActive: true,
    },
  });

  // Asignar sucursal por defecto
  await prisma.userBranchAssignment.upsert({
    where: {
      userId_branchId: {
        userId: adminUser.id,
        branchId: branch.id,
      },
    },
    update: {
      isDefaultBranch: true,
      canSwitchBranches: true,
      roleId: superAdminRoleId,
    },
    create: {
      tenantId: tenant.id,
      userId: adminUser.id,
      branchId: branch.id,
      roleId: superAdminRoleId,
      isDefaultBranch: true,
      canSwitchBranches: true,
    },
  });

  // Crear Perfil Médico para el Dr. Gustavo Reyes
  await prisma.doctorProfile.upsert({
    where: {
      userId: adminUser.id,
    },
    update: {},
    create: {
      tenantId: tenant.id,
      userId: adminUser.id,
      jvpmLicenseNumber: 'JVPM-8942',
      specialties: ['CIRUGIA_GENERAL', 'MEDICINA_INTERNA_CRITICA'],
      isLeadSurgeon: true,
      isAnesthesiologist: true,
      isIntensivistIcu: true,
      emergencyBreakGlassAuthorized: true,
    },
  });

  // 6. Pacientes y Tutores de Demostración Clínica
  console.log('  -> Creando clientes y pacientes de demostración...');
  let client1 = await prisma.client.findFirst({
    where: { tenantId: tenant.id, dui: '04581290-3' },
  });
  if (!client1) {
    client1 = await prisma.client.create({
      data: {
        tenantId: tenant.id,
        firstName: 'Carlos Alberto',
        lastName: 'Mendoza Flores',
        taxType: 'CONSUMIDOR_FINAL',
        category: 'VIP',
        dui: '04581290-3',
        phoneE164: '+503 7845-1234',
        secondaryPhone: '+503 2260-4455',
        email: 'carlos.mendoza@gmail.com',
        address: 'Colonia Escalón, Calle El Mirador, Pasaje 3 #14',
        departmentCode: '06',
        municipalityCode: '14',
        emergencyContactName: 'Sofía Mendoza (Esposa)',
        emergencyContactPhone: '+503 7122-3344',
        emergencyContactRelationship: 'CÓNYUGE',
        currentBalance: 0,
        creditLimit: 500,
      },
    });
  }

  let client2 = await prisma.client.findFirst({
    where: { tenantId: tenant.id, nit: '0614-120588-102-3' },
  });
  if (!client2) {
    client2 = await prisma.client.create({
      data: {
        tenantId: tenant.id,
        firstName: 'María Elena',
        lastName: 'Hernández de Sol',
        taxType: 'CONTRIBUYENTE_CREDITO_FISCAL',
        category: 'FREQUENT',
        nit: '0614-120588-102-3',
        nrc: '294812-4',
        tradeName: 'Servicios Agropecuarios Sol S.A. de C.V.',
        phoneE164: '+503 7234-5678',
        email: 'm.hernandez@solgroup.sv',
        address: 'Boulevard Los Próceres, Edificio Torre Roble Nivel 4',
        departmentCode: '06',
        municipalityCode: '14',
        emergencyContactName: 'Rodrigo Sol',
        emergencyContactPhone: '+503 7999-8877',
        emergencyContactRelationship: 'HIJO',
      },
    });
  }

  // Paciente 1: Rocky (Bulldog Francés con Alergia a Penicilinas)
  const frenchieBreed = await prisma.breed.findFirst({
    where: { name: 'Bulldog Francés' },
  });

  let patient1 = await prisma.patient.findFirst({
    where: { tenantId: tenant.id, microchipNumber: '981098104523190' },
  });
  if (!patient1) {
    patient1 = await prisma.patient.create({
      data: {
        tenantId: tenant.id,
        clientId: client1.id,
        breedId: frenchieBreed?.id,
        name: 'Rocky',
        species: 'CANINE',
        breed: 'Bulldog Francés',
        gender: 'MALE_NEUTERED',
        birthDate: new Date('2022-04-10'),
        microchipNumber: '981098104523190',
        coatColor: 'Atigrado / Brindle',
        bloodType: 'DEA 1.1 Positivo',
        temperamentAlert: 'FEARFUL_AGGRESSIVE',
        knownAllergies: ['Amoxicilina + Clavulánico', 'Proteína de Pollo', 'Picadura de Pulga'],
        chronicConditions: ['Síndrome Braquicefálico Leve', 'Dermatitis Atópica'],
      },
    });
  }

  // Paciente 2: Luna (Felino Siamés)
  const siameseBreed = await prisma.breed.findFirst({
    where: { name: 'Siamés' },
  });

  let patient2 = await prisma.patient.findFirst({
    where: { tenantId: tenant.id, microchipNumber: '981098107765432' },
  });
  if (!patient2) {
    patient2 = await prisma.patient.create({
      data: {
        tenantId: tenant.id,
        clientId: client2.id,
        breedId: siameseBreed?.id,
        name: 'Luna',
        species: 'FELINE',
        breed: 'Siamés',
        gender: 'FEMALE_SPAYED',
        birthDate: new Date('2023-08-15'),
        microchipNumber: '981098107765432',
        coatColor: 'Seal Point',
        temperamentAlert: 'FRIENDLY',
        knownAllergies: [],
        chronicConditions: [],
      },
    });
  }

  // Historial de pesos de Rocky
  const existingWeightsRocky = await prisma.patientWeightHistory.count({
    where: { patientId: patient1.id },
  });
  if (existingWeightsRocky === 0) {
    await prisma.patientWeightHistory.createMany({
      data: [
        {
          tenantId: tenant.id,
          branchId: branch.id,
          patientId: patient1.id,
          weightKg: 13.8,
          recordedByUserId: adminUser.id,
          recordedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000),
        },
        {
          tenantId: tenant.id,
          branchId: branch.id,
          patientId: patient1.id,
          weightKg: 14.2,
          recordedByUserId: adminUser.id,
          recordedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000),
        },
      ],
    });
  }

  // Historial de pesos de Luna
  const existingWeightsLuna = await prisma.patientWeightHistory.count({
    where: { patientId: patient2.id },
  });
  if (existingWeightsLuna === 0) {
    await prisma.patientWeightHistory.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        patientId: patient2.id,
        weightKg: 3.85,
        recordedByUserId: adminUser.id,
      },
    });
  }

  // Medicina preventiva: Vacuna y desparasitación para Rocky
  const existingVax = await prisma.vaccinationRecord.findFirst({
    where: { patientId: patient1.id, vaccineName: 'Séxtuple Canina (DHPPi/L4)' },
  });
  if (!existingVax) {
    await prisma.vaccinationRecord.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        patientId: patient1.id,
        vaccineName: 'Séxtuple Canina (DHPPi/L4)',
        lotNumber: 'L-89421A',
        status: 'APPLIED',
        administeredAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        nextDueDate: new Date(Date.now() + 335 * 24 * 3600 * 1000),
        veterinarianId: adminUser.id,
        notes: 'Aplicación en cuadrante escapular derecho sin reacciones adversas.',
      },
    });
  }

  const existingDeworm = await prisma.dewormingRecord.findFirst({
    where: { patientId: patient1.id },
  });
  if (!existingDeworm) {
    await prisma.dewormingRecord.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        patientId: patient1.id,
        productName: 'Drontal Plus Sabor (Praziquantel/Pirantel/Febantel)',
        type: 'INTERNAL',
        administeredAt: new Date(Date.now() - 15 * 24 * 3600 * 1000),
        nextDueDate: new Date(Date.now() + 75 * 24 * 3600 * 1000),
        veterinarianId: adminUser.id,
      },
    });
  }

  // Consulta Médica SOAP Demostrativa Cerrada e Inmutable para Rocky
  let consultation1 = await prisma.consultation.findFirst({
    where: { patientId: patient1.id },
  });
  if (!consultation1) {
    consultation1 = await prisma.consultation.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        patientId: patient1.id,
        veterinarianId: adminUser.id,
        consultationType: 'GENERAL',
        anamnesisReason: 'Dificultad respiratoria estridulosa post ejercicio leve y prurito podal intenso.',
        currentDiet: 'Alimento hipoalergénico Royal Canin Hydrolyzed Protein 150g BID',
        currentMedications: 'Oclacitinib (Apoquel) 5.4mg cada 24 horas',
        weightKg: 14.2,
        tempCelsius: 38.6,
        heartRateBpm: 110,
        respiratoryRateBpm: 26,
        systolicBp: 125,
        capillaryRefillSeconds: 1.5,
        mucousMembraneStatus: 'PINK',
        hydrationPercentage: 0,
        bodyConditionScore: 6,
        painScaleScore: 0,
        physicalExamSystems: {
          eyes: { normal: true, notes: 'Sin secreciones ni epífora' },
          ears: { normal: true, notes: 'Conductos limpios, sin eritema' },
          oral: { normal: true, notes: 'Tártaro dental grado 1, sin halitosis' },
          cardio: { normal: true, notes: 'Ritmo regular, sin soplos audibles' },
          resp: { normal: false, notes: 'Estridor inspiratorio típico braquicefálico; campos pulmonares limpios' },
          abdomen: { normal: true, notes: 'Blando, depresible, no reactivo al dolor' },
          lymph: { normal: true, notes: 'Linfonodos poplíteos y mandibulares simétricos' },
          musculo: { normal: true, notes: 'Sin claudicación evidente' },
          skin: { normal: false, notes: 'Eritema interdigital en miembros anteriores compatible con atopia' },
          neuro: { normal: true, notes: 'Pares craneales y reflejos posturales intactos' },
        },
        subjective: 'Tutor refiere que el paciente presentó ronquidos aumentados luego de paseo matutino y lamido continuo en ambas patas anteriores.',
        objective: 'Estridor laríngeo audible sin disnea franca. Mucosas rosadas y húmedas. Eritema leve en pliegues interdigitales anteriores, sin exudado.',
        assessmentDiagnosis: '1. Síndrome Braquicefálico Grado I en reposo. 2. Dermatitis Atópica Interdigital reactivada.',
        differentialDiagnoses: ['Malassezia interdigital', 'Pododermatitis bacteriana secundaria', 'Rinorrea retrógrada'],
        planTherapeuticSummary: 'Manejo ambiental estricto con aire acondicionado. Baños podales con Clorhexidina al 3% dos veces por semana. Continuar Apoquel.',
        requiresHospitalization: false,
        requiresSurgery: false,
        requiresLabTests: false,
        requiresImaging: false,
        isClosed: true,
        closedAt: new Date(),
      },
    });
  }

  // Receta Médica Digital para la consulta
  let rx1 = await prisma.prescription.findFirst({
    where: { prescriptionCode: 'REC-2026-001' },
  });
  if (!rx1) {
    rx1 = await prisma.prescription.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        patientId: patient1.id,
        veterinarianId: adminUser.id,
        consultationId: consultation1.id,
        prescriptionCode: 'REC-2026-001',
        generalIndications: 'Evitar sobrepeso y paseos en horas de calor extremo (11:00 AM a 3:00 PM).',
      },
    });

    await prisma.prescriptionItem.createMany({
      data: [
        {
          tenantId: tenant.id,
          prescriptionId: rx1.id,
          medicationName: 'Apoquel (Oclacitinib)',
          activeIngredient: 'Oclacitinib maleato 5.4mg',
          dosageText: '5.4 mg (1 comprimido)',
          routeOfAdministration: 'ORAL',
          frequencyHours: 24,
          durationDays: 30,
          quantityToDispense: '1 Caja (30 comprimidos)',
          specialInstructions: 'Administrar preferentemente en la mañana con alimento.',
        },
        {
          tenantId: tenant.id,
          prescriptionId: rx1.id,
          medicationName: 'Shampoo Clorhexidina 3% + Ketoconazol',
          activeIngredient: 'Clorhexidina digluconato 30mg/ml',
          dosageText: 'Baño local en patas',
          routeOfAdministration: 'TOPICA',
          frequencyHours: 72,
          durationDays: 21,
          quantityToDispense: '1 Frasco 250ml',
          specialInstructions: 'Dejar actuar por 10 minutos antes de enjuagar con abundante agua tibia.',
        },
      ],
    });
  }

  // Adenda Médica de ejemplo
  const existingAddendum = await prisma.consultationAddendum.findFirst({
    where: { consultationId: consultation1.id },
  });
  if (!existingAddendum) {
    await prisma.consultationAddendum.create({
      data: {
        tenantId: tenant.id,
        consultationId: consultation1.id,
        veterinarianId: adminUser.id,
        addendumText: 'Tutor reporta vía telefónica a las 48h excelente respuesta: cese del lamido interdigital y buena ventilación en reposo.',
      },
    });
  }

  // ── 7. Triajes de Emergencia VECCS de Demostración ──
  console.log('  -> Creando triajes de emergencia VECCS...');
  const countTriages = await prisma.emergencyTriage.count({
    where: { branchId: branch.id },
  });
  if (countTriages === 0) {
    await prisma.emergencyTriage.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        patientId: patient1.id,
        clientId: client1.id,
        evaluatedByUserId: adminUser.id,
        attendingVetId: adminUser.id,
        triageColor: 'ORANGE_VERY_URGENT',
        clinicalStatus: 'STABILIZING',
        chiefComplaint: 'Dificultad respiratoria estridulosa post-ejercicio, lengua cianótica leve.',
        estimatedOrFastWeightKg: 14.2,
        airwayStatus: 'STRIDOR',
        breathingEffort: 'DYSPNEIC',
        circulationPulse: 'STRONG',
        capillaryRefillSeconds: 2.0,
        mucousColor: 'PALE',
        mentalStatus: 'ALERT',
        heartRateBpm: 138,
        respiratoryRateBpm: 38,
        spo2Percent: 93,
        systolicBp: 135,
        assignedShockTable: 'Box de Choque 1',
        isCodeRedBroadcasted: false,
        admittedAt: new Date(Date.now() - 25 * 60 * 1000), // Hace 25 minutos
      },
    });

    await prisma.emergencyTriage.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        evaluatedByUserId: adminUser.id,
        attendingVetId: adminUser.id,
        triageColor: 'RED_IMMEDIATE',
        clinicalStatus: 'IN_CRASH_ROOM',
        chiefComplaint: '[Urgencia de Calle] Canino Mestizo atropellado, shock hipovolémico severo, pulso filiforme.',
        estimatedOrFastWeightKg: 18.5,
        airwayStatus: 'PATENT',
        breathingEffort: 'AGONIC',
        circulationPulse: 'WEAK',
        capillaryRefillSeconds: 3.5,
        mucousColor: 'PALE',
        mentalStatus: 'STUPOROUS',
        heartRateBpm: 175,
        respiratoryRateBpm: 14,
        spo2Percent: 88,
        systolicBp: 70,
        assignedShockTable: 'Mesa de Choque Principal',
        isCodeRedBroadcasted: true, // Código Rojo Activo
        admittedAt: new Date(Date.now() - 8 * 60 * 1000), // Hace 8 minutos
      },
    });
  }

  // ── 8. Hospitalización UCI y Flowboard de Demostración ──
  console.log('  -> Creando hospitalización UCI y Flowboard...');
  const countHosps = await prisma.hospitalization.count({
    where: { branchId: branch.id },
  });
  if (countHosps === 0) {
    const hosp1 = await prisma.hospitalization.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        patientId: patient2.id,
        attendingVetId: adminUser.id,
        admissionWeightKg: 3.85,
        status: 'ADMITTED',
        admissionReason: 'Gastroenteritis aguda deshidratante (5%), vómitos de 24h y anorexia.',
        admissionDate: new Date(Date.now() - 12 * 3600 * 1000), // Hace 12 horas
      },
    });

    // Órdenes de hospitalización para Luna
    await prisma.hospitalizationOrder.create({
      data: {
        tenantId: tenant.id,
        hospitalizationId: hosp1.id,
        orderType: 'FLUIDS',
        name: 'Solución Hartmann (Cristaloides)',
        rateMlHr: 16.0,
        frequencyHours: 24,
        instructions: 'Infusión en bomba continua a 16 ml/h (Holliday-Segar + 5% deshidratación). Vigilar micción.',
        isActive: true,
      },
    });

    await prisma.hospitalizationOrder.create({
      data: {
        tenantId: tenant.id,
        hospitalizationId: hosp1.id,
        orderType: 'MEDICATION',
        name: 'Maropitant (Cerenia) 10 mg/ml',
        dosage: '0.38 ml (1 mg/kg)',
        frequencyHours: 24,
        instructions: 'Inyección subcutánea lenta refrigerada cada 24 horas.',
        isActive: true,
      },
    });

    const medOrder2 = await prisma.hospitalizationOrder.create({
      data: {
        tenantId: tenant.id,
        hospitalizationId: hosp1.id,
        orderType: 'MEDICATION',
        name: 'Ampicilina Sulbactam 375 mg',
        dosage: '0.4 ml (20 mg/kg)',
        frequencyHours: 8,
        instructions: 'Diluir en 5 ml de solución salina y pasar IV lento en 10 minutos.',
        isActive: true,
      },
    });

    // Ejecuciones horarias para el Flowboard
    const now = Date.now();
    await prisma.flowboardExecution.createMany({
      data: [
        {
          tenantId: tenant.id,
          orderId: medOrder2.id,
          scheduledAt: new Date(now - 8 * 3600 * 1000),
          administeredAt: new Date(now - 8 * 3600 * 1000),
          administeredByUserId: adminUser.id,
          status: 'ADMINISTERED',
          notes: 'Administrado sin complicaciones por enfermería.',
        },
        {
          tenantId: tenant.id,
          orderId: medOrder2.id,
          scheduledAt: new Date(now),
          status: 'PENDING',
        },
        {
          tenantId: tenant.id,
          orderId: medOrder2.id,
          scheduledAt: new Date(now + 8 * 3600 * 1000),
          status: 'PENDING',
        },
      ],
    });
  }

  // ── 9. Centro Quirúrgico y Monitoreo ASA de Demostración ──
  console.log('  -> Creando cirugías y monitoreo anestésico transoperatorio...');
  const countSurgeries = await prisma.surgery.count({
    where: { branchId: branch.id },
  });
  if (countSurgeries === 0) {
    const surgeryRoom = await prisma.room.findFirst({
      where: { branchId: branch.id, roomType: 'SURGERY_ROOM' },
    });

    const surgery1 = await prisma.surgery.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        patientId: patient1.id,
        leadSurgeonId: adminUser.id,
        anesthesiologistId: adminUser.id,
        roomId: surgeryRoom?.id || null,
        surgeryName: 'Corrección de Síndrome Braquicefálico (Estafiloplastia + Rinoplastia)',
        asaGrade: 'ASA_II',
        status: 'IN_SURGERY',
        preOpWeightKg: 14.2,
        preMedicationProtocol: 'Dexmedetomidina 5 mcg/kg + Metadona 0.2 mg/kg IM',
        inductionAgent: 'Propofol 4 mg/kg IV lento',
        maintenanceAgent: 'Isoflurano al 1.5% en O2 al 100%',
        surgeryStartTime: new Date(Date.now() - 35 * 60 * 1000), // Hace 35 min
        checklistSignInPassed: true,
        checklistTimeOutPassed: true,
        checklistSignOutPassed: false,
        surgicalFindingsReport: 'Resección de 8 mm de paladar blando elongado mediante técnica de estafiloplastia. Amputación en cuña alar bilateral para corrección de estenosis de narinas. Hemostasia rigurosa con electrobisturí bipolar.',
      },
    });

    // Signos vitales minuto a minuto para Rocky en pabellón
    const sStart = Date.now() - 35 * 60 * 1000;
    await prisma.surgeryAnesthesiaLog.createMany({
      data: [
        {
          tenantId: tenant.id,
          surgeryId: surgery1.id,
          recordedAt: new Date(sStart + 5 * 60 * 1000),
          heartRateBpm: 124,
          respiratoryRateBpm: 20,
          spo2Percent: 97.5,
          etco2Mmhg: 37,
          systolicBp: 125,
          diastolicBp: 78,
          meanBp: 93,
          tempCelsius: 38.2,
          vaporizerPct: 2.0,
          fluidRateMlHr: 90.0,
          administeredBolus: 'Cefazolina 22 mg/kg IV (Profilaxis)',
          notes: 'Inducción e intubación endotraqueal atraumática con tubo Murphy 7.5.',
        },
        {
          tenantId: tenant.id,
          surgeryId: surgery1.id,
          recordedAt: new Date(sStart + 15 * 60 * 1000),
          heartRateBpm: 110,
          respiratoryRateBpm: 16,
          spo2Percent: 99.0,
          etco2Mmhg: 40,
          systolicBp: 118,
          diastolicBp: 72,
          meanBp: 87,
          tempCelsius: 37.9,
          vaporizerPct: 1.5,
          fluidRateMlHr: 90.0,
          administeredBolus: null,
          notes: 'Inicio de resección de paladar blando. Plano anestésico quirúrgico óptimo.',
        },
        {
          tenantId: tenant.id,
          surgeryId: surgery1.id,
          recordedAt: new Date(sStart + 30 * 60 * 1000),
          heartRateBpm: 98,
          respiratoryRateBpm: 14,
          spo2Percent: 99.0,
          etco2Mmhg: 39,
          systolicBp: 110,
          diastolicBp: 66,
          meanBp: 80,
          tempCelsius: 37.5,
          vaporizerPct: 1.3,
          fluidRateMlHr: 90.0,
          administeredBolus: 'Metadona 0.1 mg/kg IV (Refuerzo analgésico)',
          notes: 'Rinoplastia alar finalizada. Hemostasia completa.',
        },
      ],
    });

    // Cirugía 2: Programada
    await prisma.surgery.create({
      data: {
        tenantId: tenant.id,
        branchId: branch.id,
        patientId: patient2.id,
        leadSurgeonId: adminUser.id,
        roomId: surgeryRoom?.id || null,
        surgeryName: 'Profilaxis Dental Ultrasónica y Pulido Coronal',
        asaGrade: 'ASA_I',
        status: 'SCHEDULED',
        preOpWeightKg: 3.85,
        preMedicationProtocol: 'Butorfanol 0.2 mg/kg + Midazolam 0.2 mg/kg IM',
        inductionAgent: 'Alfaxalona 2 mg/kg IV',
        maintenanceAgent: 'Isoflurano al 1.2% en O2',
      },
    });
  }

  // ── 10. Horarios Médicos y Citas de Demostración ──
  console.log('  -> Sembrando horarios médicos semanales y citas...');
  const doctorProf = await prisma.doctorProfile.findFirst({
    where: { userId: adminUser.id },
  });

  if (doctorProf) {
    // Horario Lunes a Sábado (1 al 6)
    for (let day = 1; day <= 6; day++) {
      const existingSched = await prisma.doctorSchedule.findFirst({
        where: {
          branchId: branch.id,
          doctorId: doctorProf.id,
          dayOfWeek: day,
        },
      });

      if (!existingSched) {
        await prisma.doctorSchedule.create({
          data: {
            tenantId: tenant.id,
            branchId: branch.id,
            doctorId: doctorProf.id,
            dayOfWeek: day,
            startTime: '08:00',
            endTime: '17:00',
            breakStartTime: '12:00',
            breakEndTime: '13:00',
            slotDurationMinutes: 30,
            dailyConsultationLimit: 12,
            isActive: true,
          },
        });
      }
    }

    // Citas Médicas de Demostración
    const countAppts = await prisma.appointment.count({
      where: { branchId: branch.id },
    });

    if (countAppts === 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Cita 1: Hoy 09:00 - En Consulta
      await prisma.appointment.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          doctorId: doctorProf.id,
          patientId: patient1.id,
          clientId: client1.id,
          appointmentDate: today,
          startTime: '09:00',
          endTime: '09:30',
          status: 'IN_CONSULTATION',
          serviceType: 'CONSULTA_GENERAL',
          reasonForVisit: 'Control postquirúrgico y revisión de narinas/paladar.',
          internalNotes: 'Tutor refiere evolución favorable en casa.',
          createdByUserId: adminUser.id,
        },
      });

      // Cita 2: Hoy 10:00 - En Sala de Espera
      await prisma.appointment.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          doctorId: doctorProf.id,
          patientId: patient2.id,
          clientId: client2.id,
          appointmentDate: today,
          startTime: '10:00',
          endTime: '10:30',
          status: 'IN_WAITING_ROOM',
          serviceType: 'REVISION_POST_OP',
          reasonForVisit: 'Chequeo de tolerancia oral y ganancia de peso post-alta UCI.',
          internalNotes: 'Paciente arribó a recepción a las 09:55 AM.',
          createdByUserId: adminUser.id,
        },
      });

      // Cita 3: Hoy 14:30 - Confirmada
      await prisma.appointment.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          doctorId: doctorProf.id,
          patientId: patient1.id,
          clientId: client1.id,
          appointmentDate: today,
          startTime: '14:30',
          endTime: '15:00',
          status: 'CONFIRMED',
          serviceType: 'ESPECIALIDAD_DERMATOLOGIA',
          reasonForVisit: 'Evaluación de dermatitis atópica interdigital y raspado cutáneo.',
          createdByUserId: adminUser.id,
        },
      });

      // Cita 4: Mañana 11:00 - Agendada
      await prisma.appointment.create({
        data: {
          tenantId: tenant.id,
          branchId: branch.id,
          doctorId: doctorProf.id,
          patientId: patient2.id,
          clientId: client2.id,
          appointmentDate: tomorrow,
          startTime: '11:00',
          endTime: '11:30',
          status: 'SCHEDULED',
          serviceType: 'VACUNACION',
          reasonForVisit: 'Aplicación de vacuna Triple Felina y desparasitación.',
          createdByUserId: adminUser.id,
        },
      });
    }
  }


  console.log('✅ Siembra de datos completada exitosamente.');
  console.log('----------------------------------------------------');
  console.log('Credenciales de acceso clínico:');
  console.log('📧 Correo: admin@veterinaria.com');
  console.log('🔑 Clave:  Password123!');
  console.log('🏥 Sede:    Sucursal Escalón (ESC-01)');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
