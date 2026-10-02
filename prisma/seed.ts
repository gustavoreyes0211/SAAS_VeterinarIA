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
