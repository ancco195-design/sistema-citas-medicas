# Sistema de Citas Médicas

## Descripción del Proyecto

Plataforma web completa para la gestión y reserva de citas médicas en línea. El sistema permite a los pacientes agendar citas con doctores según su especialidad y disponibilidad, a los doctores administrar su agenda diaria, y a los administradores supervisar las estadísticas del sistema.

## Tecnologías y Herramientas Utilizadas

- **Angular 20.3.0** - Framework principal
- **TypeScript** - Lenguaje de programación
- **Firebase Authentication** - Autenticación de usuarios
- **Firebase Firestore** - Base de datos en tiempo real
- **Firebase Hosting** - Despliegue de la aplicación
- **AngularFire** - Librería oficial de Firebase para Angular
- **RxJS** - Programación reactiva
- **CSS3** - Estilos y diseño responsivo
- **Git & GitHub** - Control de versiones

## Requisitos para Instalar y Ejecutar

### Prerrequisitos

- Node.js (v18 o superior)
- npm (v9 o superior)
- Angular CLI (`npm install -g @angular/cli`)
- Cuenta de Firebase

### Instalación

1. Clonar el repositorio:
```bash
git clone 
cd sistema-citas-medicas
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar Firebase:
   - Crear proyecto en [Firebase Console](https://console.firebase.google.com)
   - Habilitar Authentication (Email/Password)
   - Crear base de datos Firestore
   - Copiar configuración en `src/environments/environment.ts`

4. Ejecutar en modo desarrollo:
```bash
ng serve
```

5. Abrir navegador en `http://localhost:4200`

### Build para producción

```bash
ng build --configuration production
```

### Deploy a Firebase Hosting

```bash
firebase login
firebase init hosting
firebase deploy
```

## Arquitectura del Proyecto

### Estructura de Carpetas

```
src/app/
├── caracteristicas/          # Módulos por funcionalidad
│   ├── autenticacion/        # Login y registro
│   ├── paciente/             # Funcionalidades del paciente
│   ├── doctor/               # Funcionalidades del doctor
│   ├── admin/                # Panel administrativo
│   └── compartido/           # Componentes compartidos
├── nucleo/                   # Core de la aplicación
│   ├── servicios/            # Servicios de negocio
│   ├── guardias/             # Protección de rutas
│   ├── modelos/              # Interfaces y modelos
│   └── pipes/                # Pipes personalizados
└── environments/             # Configuraciones de entorno
```

### Componentes Principales

**Módulo Paciente:**
- `inicio-paciente` - Dashboard principal
- `lista-doctores` - Búsqueda y filtrado de doctores
- `agendar-cita` - Formulario de reserva de citas
- `mis-citas` - Gestión de citas del paciente
- `detalle-doctor` - Información detallada del doctor
- `perfil-paciente` - Perfil y configuración

**Módulo Doctor:**
- `inicio-doctor` - Dashboard del doctor
- `agenda-doctor` - Calendario y agenda diaria
- `lista-pacientes` - Listado de pacientes
- `detalle-paciente` - Historial del paciente
- `detalle-cita` - Información de la cita
- `perfil-doctor` - Perfil y especialidades

**Módulo Admin:**
- `panel-estadisticas` - Métricas y reportes
- `perfil-admin` - Configuración administrativa

**Módulo Compartido:**
- `navbar` - Barra de navegación
- `configuracion` - Ajustes generales
- `pagina-404` - Página de error

### Servicios

- **autenticacion.service.ts** - Manejo de login, registro y sesión
- **citas.service.ts** - CRUD de citas y validación de horarios
- **doctores.service.ts** - Gestión de doctores y especialidades
- **usuarios.service.ts** - Administración de usuarios
- **storage.service.ts** - Manejo de archivos (opcional)

### Guards (Protección de Rutas)

- **auth-guard.ts** - Verifica autenticación del usuario
- **rol-guard.ts** - Valida roles (paciente/doctor/admin)
- **no-auth-guard.ts** - Redirige si ya está autenticado

### Modelos

- **usuario.model.ts** - Interfaz de usuario
- **doctor.model.ts** - Interfaz de doctor con especialidades
- **cita.model.ts** - Interfaz de cita médica
- **especialidad.model.ts** - Catálogo de especialidades

### Pipes Personalizados

- **telefono-pipe.ts** - Formateo de números telefónicos
- **tiempo-relativo-pipe.ts** - Conversión de fechas relativas

## URLs de Despliegue

- **Aplicación desplegada:** 

## Video Demostrativo

**URL del video:** 

**Contenido del video (5-8 minutos):**
- Funcionalidades principales del sistema
- Flujo completo de autenticación (registro y login)
- Proceso de reserva de citas por paciente
- Gestión de agenda por parte del doctor
- Panel estadístico del administrador
- Demostración de registro y lectura en Firestore
- Explicación del código: componentes, servicios y guards

## Manual de Usuario

### Para Pacientes

#### 1. Registro e Inicio de Sesión
1. Acceder a la aplicación
2. Hacer clic en "Registrarse"
3. Completar formulario con datos personales
4. Confirmar correo electrónico (si aplica)
5. Iniciar sesión con credenciales

#### 2. Buscar Doctores
1. Ir a "Lista de Doctores"
2. Usar filtros por:
   - Especialidad médica
   - Nombre del doctor
   - Disponibilidad
3. Ver perfil detallado del doctor

#### 3. Agendar Cita
1. Seleccionar un doctor
2. Hacer clic en "Agendar Cita"
3. Elegir fecha y hora disponible
4. Ingresar motivo de consulta
5. Confirmar reserva
6. Recibir notificación de confirmación

#### 4. Gestionar Mis Citas
1. Acceder a "Mis Citas"
2. Ver citas:
   - Próximas
   - En proceso
   - Completadas
   - Canceladas
3. Cancelar cita (con anticipación mínima)
4. Ver detalles de cada cita

#### 5. Actualizar Perfil
1. Ir a "Mi Perfil"
2. Editar información personal
3. Cambiar contraseña
4. Actualizar datos de contacto

### Para Doctores

#### 1. Acceso al Sistema
1. Iniciar sesión con credenciales de doctor
2. Acceder al dashboard

#### 2. Gestionar Agenda
1. Ver agenda diaria en "Mi Agenda"
2. Revisar citas programadas por hora
3. Marcar citas como:
   - Completadas
   - En proceso
   - Canceladas
4. Ver alertas de próximas citas

#### 3. Revisar Pacientes
1. Acceder a "Lista de Pacientes"
2. Buscar paciente específico
3. Ver historial de citas
4. Consultar información del paciente

#### 4. Administrar Disponibilidad
1. Configurar horarios de atención
2. Bloquear días no disponibles
3. Definir duración de consultas

#### 5. Perfil Profesional
1. Actualizar información profesional
2. Agregar especialidades
3. Modificar datos de contacto

### Para Administradores

#### 1. Panel de Control
1. Acceder con credenciales de administrador
2. Visualizar dashboard con métricas

#### 2. Estadísticas
1. Ver reportes de:
   - Citas por especialidad
   - Citas por doctor
   - Citas por período
   - Estados de citas
2. Exportar reportes (si aplica)

#### 3. Gestión de Doctores
1. Aprobar/rechazar nuevos doctores
2. Modificar información de doctores
3. Desactivar cuentas

#### 4. Gestión de Especialidades
1. Crear nuevas especialidades
2. Editar especialidades existentes
3. Asignar especialidades a doctores

#### 5. Supervisión del Sistema
1. Monitorear actividad de usuarios
2. Resolver conflictos de citas
3. Gestionar configuraciones generales

### Funcionalidades Generales

#### Notificaciones
- Confirmación de citas agendadas
- Recordatorios de citas próximas
- Cancelaciones
- Cambios en el estado de citas

#### Filtros y Búsquedas
- Búsqueda en tiempo real
- Filtrado por múltiples criterios
- Ordenamiento de resultados

#### Validaciones del Sistema
- Prevención de solapamiento de horarios
- Validación de disponibilidad en tiempo real
- Control de citas duplicadas
- Verificación de datos requeridos

## Soporte

Para reportar problemas o sugerencias, crear un issue en el repositorio de GitHub.

---

**Desarrollado por:** Juan David
**Materia:** Desarrollo de Aplicaciones Web  
**Docente:** Iván Soria Solís  
**Año:** 2024