# 🏋️ MyGymBackend

Backend para sistema de gestión de gimnasios desarrollado con Firebase Cloud Functions y Express.

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Cloud%20Functions-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)

---

## 🚀 Demo Online - API Tester

**Probá la API directamente desde el navegador:**

### 👉 [https://ginagrosso.github.io/MyGymBackend/](https://ginagrosso.github.io/MyGymBackend/)

Esta herramienta permite probar todos los endpoints de la API sin necesidad de instalar nada. Incluye:
- Autenticación de usuarios y gimnasios
- Gestión de clases y horarios
- Sistema de rutinas y ejercicios
- Módulo de pagos y finanzas
- Consola de debug para ver las respuestas

---

## 📋 Tecnologías

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| Node.js | 22 | Runtime de JavaScript |
| Firebase Cloud Functions | 6.x | Serverless backend |
| Express | 5.x | Framework web |
| Joi | 18.x | Validación de datos |
| Firebase Realtime Database | - | Base de datos NoSQL |
| Firebase Admin SDK | 12.x | Administración de Firebase |

---

## ⚙️ Requisitos Previos

- **Node.js** versión 22 o superior
- **Firebase CLI** instalado globalmente
  ```bash
  npm install -g firebase-tools
  ```
- Cuenta de Firebase con un proyecto configurado
- Credenciales de Firebase Admin SDK

---

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/ginagrosso/MyGymBackend.git
   cd MyGymBackend
   ```

2. **Instalar dependencias**
   ```bash
   cd functions
   npm install
   ```

3. **Configurar Firebase**
   ```bash
   firebase login
   firebase use --add
   ```

4. **Configurar credenciales**
   - Descargar el archivo de credenciales del Admin SDK desde la consola de Firebase
   - Colocarlo en `functions/permissions/`

---

## 📜 Scripts Disponibles

Ejecutar desde la carpeta `/functions`:

| Script | Comando | Descripción |
|--------|---------|-------------|
| Emuladores | `npm run serve` | Inicia los emuladores locales de Firebase |
| Deploy | `npm run deploy` | Despliega las funciones a producción |
| Lint | `npm run lint` | Ejecuta ESLint para verificar el código |
| Logs | `npm run logs` | Muestra los logs de las funciones en producción |
| Shell | `npm run shell` | Abre el shell interactivo de Firebase Functions |

### Puertos de los Emuladores

| Servicio | Puerto |
|----------|--------|
| Functions | 5001 |
| Auth | 9099 |
| Database | 9000 |
| Emulator UI | 4000 |

---

## 🏗️ Arquitectura

El proyecto sigue una arquitectura modular organizada en capas:

```
functions/
├── index.js              # Entry point - exporta Cloud Functions
├── modules/              # Routers de Express por dominio
│   ├── auth.js
│   ├── users.js
│   ├── gyms.js
│   ├── classes.js
│   ├── exercises.js
│   ├── routines.js
│   ├── registrations.js
│   ├── streaks.js
│   ├── payments.js
│   └── finance.js
└── src/
    ├── middlewares/      # Middleware de autenticación y logging
    ├── services/         # Lógica de negocio
    ├── repositories/     # Acceso a datos
    ├── schemas/          # Validación con Joi
    └── utils/            # Utilidades comunes
```

### Flujo de datos

```
Request → Module (Router) → Middleware → Service → Repository → Database
```

---

## 🔌 Endpoints Principales

### 🔐 Autenticación (`/auth`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/forgot-password` | Recuperar contraseña |
| POST | `/auth/reset-password` | Restablecer contraseña |

### 👤 Usuarios (`/users`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register/client` | Registrar nuevo cliente |
| GET | `/users/me` | Obtener perfil actual |
| PUT | `/users/me` | Actualizar perfil |
| PUT | `/users/me/password` | Cambiar contraseña |

### 🏢 Gimnasios (`/gyms`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/register/gym` | Registrar gimnasio |
| GET | `/gyms` | Listar gimnasios |
| GET | `/gyms/:id` | Obtener gimnasio |
| PUT | `/gyms/me` | Actualizar mi gimnasio |
| GET | `/gyms/:id/clients` | Listar clientes |
| POST | `/gyms/:id/clients` | Agregar cliente |

### 📅 Clases (`/classes`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar clases |
| POST | `/` | Crear clase |
| GET | `/:id` | Obtener clase |
| PUT | `/:id` | Actualizar clase |
| DELETE | `/:id` | Archivar clase |
| GET | `/categories` | Listar categorías |
| GET | `/:id/waitlist` | Ver lista de espera |

### 💪 Ejercicios (`/exercises`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Listar ejercicios |
| POST | `/create` | Crear ejercicio |
| GET | `/:id` | Obtener ejercicio |
| PUT | `/:id` | Actualizar ejercicio |

### 📋 Rutinas (`/routines`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/create` | Crear rutina |
| GET | `/:id` | Obtener rutina |
| PUT | `/:id` | Actualizar rutina |
| POST | `/assign` | Asignar rutina a usuario |
| POST | `/progress` | Registrar progreso |

### 📝 Inscripciones (`/registrations`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Mis inscripciones activas |
| POST | `/` | Crear inscripción |
| GET | `/history` | Historial |
| DELETE | `/:id` | Cancelar inscripción |

### 🔥 Rachas (`/streaks`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/check-in` | Registrar asistencia |
| GET | `/history` | Ver historial |
| GET | `/:userId` | Obtener racha |

### 💳 Pagos (`/payments`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/process` | Procesar pago |
| GET | `/history` | Historial de pagos |
| GET | `/status` | Estado de cuenta |
| GET | `/methods` | Métodos de pago |

### 💰 Finanzas (`/finance`)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/settings` | Configuración |
| PUT | `/settings` | Actualizar configuración |
| GET | `/dashboard` | Dashboard financiero |
| GET | `/debtors` | Lista de deudores |
| POST | `/manual-payment` | Registrar pago manual |

---

## 🔐 Variables de Entorno

El proyecto utiliza Firebase Admin SDK para la autenticación. Asegurate de tener el archivo de credenciales en:

```
functions/permissions/mygym-912d1-firebase-adminsdk-fbsvc-XXXXXXXX.json
```

---

## 👥 Equipo de Desarrollo

| Integrante | Dominio | Responsabilidad |
|------------|---------|-----------------|
| **Gina Grosso** | Usuarios y Autenticación | Gestión de identidad, perfiles y administración de usuarios |
| **Victor Teo Risso** | Gestión de Clases | ABM de clases, horarios y categorías |
| **Martina Canteros** | Actividad del Socio | Inscripciones, rutinas, ejercicios y rachas |
| **Esteban Cardozo** | Sistema Financiero | Pagos, cuotas, deudas y reportes |

---

## 📄 Licencia

Este proyecto fue desarrollado como trabajo práctico académico.

---

<p align="center">
  Desarrollado con ❤️ para la materia de Programación IV
</p>

