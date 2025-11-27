/**
 * MyGym API Tester
 * Herramienta completa de testing para el backend de MyGym
 */

// ============================================
// API TESTER - Core Module
// ============================================

const ApiTester = {
    config: {
        baseUrl: 'https://us-central1-mygym-912d1.cloudfunctions.net',
        token: null,
        userId: null,
        userEmail: null,
        userType: null
    },

    presets: {
        prod: 'https://us-central1-mygym-912d1.cloudfunctions.net',
        local: '127.0.0.1:5001/mygym-912d1/us-central1'
    },

    init() {
        // Load from localStorage
        const savedToken = localStorage.getItem('mygym_token');
        const savedUserId = localStorage.getItem('mygym_userId');
        const savedEmail = localStorage.getItem('mygym_email');
        const savedType = localStorage.getItem('mygym_userType');
        const savedUrl = localStorage.getItem('mygym_baseUrl');

        if (savedToken) {
            this.config.token = savedToken;
            this.config.userId = savedUserId;
            this.config.userEmail = savedEmail;
            this.config.userType = savedType;
        }

        if (savedUrl) {
            this.config.baseUrl = savedUrl;
            document.getElementById('baseUrl').value = savedUrl;
            // Set correct preset
            if (savedUrl === this.presets.prod) {
                document.getElementById('urlPreset').value = 'prod';
            } else if (savedUrl === this.presets.local) {
                document.getElementById('urlPreset').value = 'local';
            } else {
                document.getElementById('urlPreset').value = 'custom';
            }
        }

        this.updateAuthUI();
        this.initNavigation();
        this.initUrlInput();

        console.log('🚀 MyGym API Tester initialized');
    },

    initNavigation() {
        const links = document.querySelectorAll('.sidebar-link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section;
                
                // Update active link
                links.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show section
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                document.getElementById(sectionId).classList.add('active');
            });
        });
    },

    initUrlInput() {
        const input = document.getElementById('baseUrl');
        input.addEventListener('change', () => {
            this.config.baseUrl = input.value.trim().replace(/\/$/, '');
            localStorage.setItem('mygym_baseUrl', this.config.baseUrl);
        });
    },

    setUrlPreset(preset) {
        const input = document.getElementById('baseUrl');
        if (preset === 'prod') {
            this.config.baseUrl = this.presets.prod;
            input.value = this.presets.prod;
            input.disabled = true;
        } else if (preset === 'local') {
            this.config.baseUrl = this.presets.local;
            input.value = this.presets.local;
            input.disabled = true;
        } else {
            input.disabled = false;
            input.focus();
        }
        localStorage.setItem('mygym_baseUrl', this.config.baseUrl);
    },

    setAuth(token, userData = {}) {
        this.config.token = token;
        this.config.userId = userData.userId || userData.uid || userData.id;
        this.config.userEmail = userData.email;
        this.config.userType = userData.userType || userData.role;

        localStorage.setItem('mygym_token', token);
        if (this.config.userId) localStorage.setItem('mygym_userId', this.config.userId);
        if (this.config.userEmail) localStorage.setItem('mygym_email', this.config.userEmail);
        if (this.config.userType) localStorage.setItem('mygym_userType', this.config.userType);

        this.updateAuthUI();
        Toast.success('Sesión iniciada correctamente');
    },

    logout() {
        this.config.token = null;
        this.config.userId = null;
        this.config.userEmail = null;
        this.config.userType = null;

        localStorage.removeItem('mygym_token');
        localStorage.removeItem('mygym_userId');
        localStorage.removeItem('mygym_email');
        localStorage.removeItem('mygym_userType');

        this.updateAuthUI();
        Toast.info('Sesión cerrada');
    },

    updateAuthUI() {
        const statusEl = document.getElementById('authStatus');
        const logoutBtn = document.getElementById('logoutBtn');
        const dot = statusEl.querySelector('.status-dot');
        const text = statusEl.querySelector('.status-text');

        if (this.config.token) {
            dot.classList.remove('offline');
            dot.classList.add('online');
            const role = this.config.userType ? ` (${this.config.userType})` : '';
            text.textContent = `${this.config.userEmail || 'Usuario'}${role}`;
            logoutBtn.style.display = 'block';
        } else {
            dot.classList.remove('online');
            dot.classList.add('offline');
            text.textContent = 'No autenticado';
            logoutBtn.style.display = 'none';
        }
    },

    async request(method, endpoint, body = null, options = {}) {
        const startTime = performance.now();
        const url = `${this.config.baseUrl}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add auth header unless explicitly skipped
        if (!options.skipAuth && this.config.token) {
            headers['Authorization'] = `Bearer ${this.config.token}`;
        }

        const fetchOptions = {
            method,
            headers
        };

        if (body && method !== 'GET') {
            fetchOptions.body = JSON.stringify(body);
        }

        let response, data, error = null;

        try {
            response = await fetch(url, fetchOptions);
            
            try {
                data = await response.json();
            } catch (e) {
                data = { message: 'Response is not valid JSON' };
            }
        } catch (e) {
            error = e;
            data = { message: e.message };
        }

        const duration = Math.round(performance.now() - startTime);

        // Log to debug panel
        DebugPanel.log({
            method,
            url,
            headers,
            body,
            status: response?.status || 0,
            statusText: response?.statusText || error?.message || 'Network Error',
            response: data,
            duration,
            success: response?.ok || false
        });

        return {
            success: response?.ok || false,
            status: response?.status || 0,
            data
        };
    }
};

// ============================================
// DEBUG PANEL
// ============================================

const DebugPanel = {
    isCollapsed: false,

    toggle() {
        const panel = document.getElementById('debugPanel');
        this.isCollapsed = !this.isCollapsed;
        panel.classList.toggle('collapsed', this.isCollapsed);
    },

    clear() {
        const logs = document.getElementById('debugLogs');
        logs.innerHTML = '<div class="debug-empty">Realiza una petición para ver los detalles aquí...</div>';
    },

    log(entry) {
        const logs = document.getElementById('debugLogs');
        
        // Remove empty message if present
        const empty = logs.querySelector('.debug-empty');
        if (empty) empty.remove();

        const timestamp = new Date().toLocaleTimeString();
        const statusClass = entry.success ? 'success' : (entry.status >= 400 ? 'error' : 'warning');

        const html = `
            <div class="debug-entry">
                <div class="debug-entry-header">
                    <span class="method ${entry.method.toLowerCase()}">${entry.method}</span>
                    <span class="debug-timestamp">${timestamp}</span>
                    <span class="debug-duration">${entry.duration}ms</span>
                    <span class="debug-status ${statusClass}">${entry.status} ${entry.statusText}</span>
                </div>
                
                <div class="debug-request">
                    <span class="debug-label">Request</span>
                    <div class="debug-url">
                        <code>${entry.url}</code>
                    </div>
                    ${entry.body ? `
                        <div class="debug-label">Body</div>
                        <pre class="debug-pre">${this.formatJSON(entry.body)}</pre>
                    ` : ''}
                    <div class="debug-label">Headers</div>
                    <pre class="debug-pre">${this.formatJSON(entry.headers)}</pre>
                </div>
                
                <div class="debug-response">
                    <span class="debug-label">Response</span>
                    <pre class="debug-pre">${this.formatJSON(entry.response)}</pre>
                </div>
            </div>
        `;

        logs.insertAdjacentHTML('afterbegin', html);

        // Expand panel if collapsed
        if (this.isCollapsed) {
            this.toggle();
        }
    },

    formatJSON(obj) {
        if (!obj) return 'null';
        const json = JSON.stringify(obj, null, 2);
        return json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
            .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
            .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
            .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
            .replace(/: (null)/g, ': <span class="json-null">$1</span>');
    }
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================

const Toast = {
    container: null,

    init() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },

    show(message, type = 'info') {
        if (!this.container) this.init();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    info(msg) { this.show(msg, 'info'); }
};

// ============================================
// SMART SELECTORS
// ============================================

const SmartSelectors = {
    cache: {
        gyms: [],
        exercises: [],
        classes: [],
        clients: {}
    },

    // Convierte objetos/mapas {id: {data}} a arrays [{id, ...data}]
    normalizeData(data) {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (typeof data === 'object') {
            return Object.entries(data).map(([key, value]) => {
                // Asegurar que value es objeto
                if (typeof value === 'object' && value !== null) {
                    return { ...value, id: key, uid: key }; // Inyectamos ID y UID para compatibilidad
                }
                return { id: key, uid: key, value };
            });
        }
        return [];
    },

    async loadGyms(selectId) {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Cargando...</option>';
        
        const result = await ApiTester.request('GET', '/gyms/gyms', null, { skipAuth: true });
        
        if (result.success && result.data?.data) {
            this.cache.gyms = this.normalizeData(result.data.data);
            this.populateSelect(select, this.cache.gyms, 'uid', 'businessName');
            Toast.success(`${this.cache.gyms.length} gimnasios cargados`);
        } else {
            select.innerHTML = '<option value="">Error al cargar</option>';
            Toast.error('Error al cargar gimnasios');
        }
    },

    async loadClients(gymSelectId, clientSelectId) {
        const gymSelect = document.getElementById(gymSelectId);
        const clientSelect = document.getElementById(clientSelectId);
        const gymId = gymSelect.value;
        
        if (!gymId) {
            Toast.error('Selecciona un gimnasio primero');
            return;
        }
        
        clientSelect.innerHTML = '<option value="">Cargando...</option>';
        
        const result = await ApiTester.request('GET', `/gyms/gyms/${gymId}/clients`);
        
        if (result.success && result.data?.data) {
            const clients = this.normalizeData(result.data.data);
            this.cache.clients[gymId] = clients;
            this.populateSelect(clientSelect, clients, 'uid', 'name', 'email');
            Toast.success(`${clients.length} clientes cargados`);
        } else {
            clientSelect.innerHTML = '<option value="">Error al cargar</option>';
            Toast.error('Error al cargar clientes');
        }
    },

    async loadExercises(selectId) {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Cargando...</option>';
        
        const result = await ApiTester.request('GET', '/exercises/');
        
        if (result.success && result.data?.data) {
            this.cache.exercises = this.normalizeData(result.data.data);
            this.populateSelect(select, this.cache.exercises, 'exerciseId', 'nombre', 'categoria');
            Toast.success(`${this.cache.exercises.length} ejercicios cargados`);
        } else {
            select.innerHTML = '<option value="">Error al cargar</option>';
            Toast.error('Error al cargar ejercicios');
        }
    },

    async loadClasses(selectId) {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Cargando...</option>';
        
        const result = await ApiTester.request('GET', '/classes/');
        
        if (result.success && result.data?.data) {
            this.cache.classes = this.normalizeData(result.data.data);
            this.populateSelect(select, this.cache.classes, 'id', 'nombre');
            Toast.success(`${this.cache.classes.length} clases cargadas`);
        } else {
            select.innerHTML = '<option value="">Error al cargar</option>';
            Toast.error('Error al cargar clases');
        }
    },

    async loadRoutines(selectId) {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Cargando...</option>';
        
        const result = await ApiTester.request('GET', '/routines/');
        
        if (result.success && result.data?.data) {
            const routines = this.normalizeData(result.data.data);
            this.populateSelect(select, routines, 'id', 'nombre');
            Toast.success(`${routines.length} rutinas cargadas`);
        } else {
            select.innerHTML = '<option value="">Error al cargar</option>';
            Toast.error('Error al cargar rutinas');
        }
    },

    async loadRegistrations(selectId) {
        const select = document.getElementById(selectId);
        const userId = ApiTester.config.userId;
        
        if (!userId) {
            Toast.error('Inicia sesión para ver tus inscripciones');
            return;
        }

        select.innerHTML = '<option value="">Cargando...</option>';
        
        // Usamos el endpoint de historial para obtener todas las inscripciones
        const result = await ApiTester.request('GET', `/registrations/history?userId=${userId}`);
        
        if (result.success && result.data?.data) {
            const registrations = this.normalizeData(result.data.data);
            
            select.innerHTML = '<option value="">Seleccionar...</option>';
            registrations.forEach(reg => {
                // Formatear fecha
                const date = new Date(reg.registrationDate || reg.createdAt || Date.now()).toLocaleDateString();
                const className = reg.className || reg.classId || 'Clase';
                // const status = reg.isActive ? 'Activa' : 'Inactiva'; // Texto eliminado a petición
                const option = document.createElement('option');
                option.value = reg.id || reg.registrationId;
                option.textContent = `${className} (${date})`;
                select.appendChild(option);
            });
            
            Toast.success(`${registrations.length} inscripciones cargadas`);
        } else {
            select.innerHTML = '<option value="">Error al cargar</option>';
            Toast.error('Error al cargar inscripciones');
        }
    },

    populateSelect(select, items, valueKey, labelKey, subtitleKey = null) {
        select.innerHTML = '<option value="">Seleccionar...</option>';
        items.forEach(item => {
            const value = item[valueKey] || item.id || item.exerciseId || item._id || item.uid;
            const label = item[labelKey] || item.name || item.nombre || value;
            const subtitle = subtitleKey && item[subtitleKey] ? ` (${item[subtitleKey]})` : '';
            
            if (value) {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = `${label}${subtitle}`;
                select.appendChild(option);
            }
        });
    }
};

// ============================================
// AUTH MODULE
// ============================================

const AuthModule = {
    async login(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const result = await ApiTester.request('POST', '/auth/auth/login', { email, password }, { skipAuth: true });
        
        if (result.success && result.data?.data?.token) {
            const data = result.data.data;
            // Backend devuelve: { token, user: { uid, email, userType, ... } }
            const userObj = data.user || data;

            ApiTester.setAuth(data.token, {
                userId: userObj.uid || userObj.id || userObj.userId,
                email: userObj.email || email,
                userType: userObj.userType || userObj.role
            });
        } else {
            Toast.error(result.data?.message || 'Error en login');
        }
    },

    async forgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgotEmail').value;
        const result = await ApiTester.request('POST', '/auth/auth/forgot-password', { email }, { skipAuth: true });
        
        if (result.success) {
            Toast.success('Email de recuperación enviado');
        } else {
            Toast.error(result.data?.message || 'Error al enviar email');
        }
    },

    async resetPassword(e) {
        e.preventDefault();
        
        const oobCode = document.getElementById('resetOobCode').value;
        const newPassword = document.getElementById('resetNewPassword').value;
        
        const result = await ApiTester.request('POST', '/auth/auth/reset-password', { oobCode, newPassword }, { skipAuth: true });
        
        if (result.success) {
            Toast.success('Contraseña restablecida');
        } else {
            Toast.error(result.data?.message || 'Error al restablecer');
        }
    }
};

// ============================================
// USERS MODULE
// ============================================

const UsersModule = {
    async registerClient(e) {
        e.preventDefault();
        
        const body = {
            email: document.getElementById('regClientEmail').value,
            password: document.getElementById('regClientPassword').value,
            name: document.getElementById('regClientName').value,
            dni: document.getElementById('regClientDni').value,
            birthDate: document.getElementById('regClientBirthDate').value,
            gymId: document.getElementById('regClientGymId').value
        };

        // Optional fields
        const gender = document.getElementById('regClientGender').value;
        const phone = document.getElementById('regClientPhone').value;
        const weight = document.getElementById('regClientWeight').value;
        const height = document.getElementById('regClientHeight').value;
        
        if (gender) body.gender = gender;
        if (phone) body.phone = phone;
        if (weight) body.weight = Number(weight);
        if (height) body.height = Number(height);
        
        const result = await ApiTester.request('POST', '/users/auth/register/client', body, { skipAuth: true });
        
        if (result.success) {
            Toast.success('Cliente registrado exitosamente');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error en registro');
        }
    },

    async getMe() {
        const result = await ApiTester.request('GET', '/users/users/me');
        
        if (result.success) {
            Toast.success('Perfil obtenido');
        } else {
            Toast.error(result.data?.message || 'Error al obtener perfil');
        }
    },

    async updateMe(e) {
        e.preventDefault();
        
        const body = {};
        
        const name = document.getElementById('updateName').value;
        const phone = document.getElementById('updatePhone').value;
        const gender = document.getElementById('updateGender').value;
        const avatarUri = document.getElementById('updateAvatarUri').value;
        const weight = document.getElementById('updateWeight').value;
        const height = document.getElementById('updateHeight').value;
        
        if (name) body.name = name;
        if (phone) body.phone = phone;
        if (gender) body.gender = gender;
        if (avatarUri) body.avatarUri = avatarUri;
        if (weight) body.weight = Number(weight);
        if (height) body.height = Number(height);
        
        if (Object.keys(body).length === 0) {
            Toast.error('Ingresa al menos un campo para actualizar');
            return;
        }
        
        const result = await ApiTester.request('PUT', '/users/users/me', body);
        
        if (result.success) {
            Toast.success('Perfil actualizado');
        } else {
            Toast.error(result.data?.message || 'Error al actualizar');
        }
    },

    async changePassword(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        
        const result = await ApiTester.request('PUT', '/users/users/me/password', { currentPassword, newPassword });
        
        if (result.success) {
            Toast.success('Contraseña actualizada');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error al cambiar contraseña');
        }
    }
};

// ============================================
// GYMS MODULE
// ============================================

const GymsModule = {
    async registerGym(e) {
        e.preventDefault();
        
        const body = {
            email: document.getElementById('regGymEmail').value,
            password: document.getElementById('regGymPassword').value,
            businessName: document.getElementById('regGymBusinessName').value,
            address: document.getElementById('regGymAddress').value
        };
        
        const phone = document.getElementById('regGymPhone').value;
        const avatarUri = document.getElementById('regGymAvatarUri').value;
        
        if (phone) body.phone = phone;
        if (avatarUri) body.avatarUri = avatarUri;
        
        const result = await ApiTester.request('POST', '/gyms/auth/register/gym', body, { skipAuth: true });
        
        if (result.success) {
            Toast.success('Gimnasio registrado');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error en registro');
        }
    },

    async getAllGyms() {
        const result = await ApiTester.request('GET', '/gyms/gyms', null, { skipAuth: true });
        
        if (result.success) {
            const count = result.data?.data?.length || 0;
            Toast.success(`${count} gimnasios encontrados`);
        } else {
            Toast.error(result.data?.message || 'Error al listar');
        }
    },

    async getGymById() {
        const gymId = document.getElementById('getGymId').value;
        
        if (!gymId) {
            Toast.error('Selecciona un gimnasio');
            return;
        }
        
        const result = await ApiTester.request('GET', `/gyms/gyms/${gymId}`);
        
        if (result.success) {
            Toast.success('Gimnasio obtenido');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async updateGymMe(e) {
        e.preventDefault();
        
        const body = {};
        
        const businessName = document.getElementById('updateGymBusinessName').value;
        const address = document.getElementById('updateGymAddress').value;
        const phone = document.getElementById('updateGymPhone').value;
        const avatarUri = document.getElementById('updateGymAvatarUri').value;
        
        if (businessName) body.businessName = businessName;
        if (address) body.address = address;
        if (phone) body.phone = phone;
        if (avatarUri) body.avatarUri = avatarUri;
        
        if (Object.keys(body).length === 0) {
            Toast.error('Ingresa al menos un campo');
            return;
        }
        
        const result = await ApiTester.request('PUT', '/gyms/gyms/me', body);
        
        if (result.success) {
            Toast.success('Gimnasio actualizado');
        } else {
            Toast.error(result.data?.message || 'Error al actualizar');
        }
    },

    async getGymStats() {
        const gymId = document.getElementById('statsGymId').value;
        
        if (!gymId) {
            Toast.error('Selecciona un gimnasio');
            return;
        }
        
        const result = await ApiTester.request('GET', `/gyms/gyms/${gymId}/stats`);
        
        if (result.success) {
            Toast.success('Estadísticas obtenidas');
        } else {
            Toast.error(result.data?.message || 'Error al obtener estadísticas');
        }
    },

    async addClientManually(e) {
        e.preventDefault();
        
        const gymId = document.getElementById('addClientGymId').value;
        const body = {
            email: document.getElementById('manualClientEmail').value,
            name: document.getElementById('manualClientName').value,
            dni: document.getElementById('manualClientDni').value,
            birthDate: document.getElementById('manualClientBirthDate').value
        };
        
        const result = await ApiTester.request('POST', `/gyms/gyms/${gymId}/clients`, body);
        
        if (result.success) {
            Toast.success('Cliente registrado manualmente');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error al registrar');
        }
    },

    async getGymClients() {
        const gymId = document.getElementById('listClientsGymId').value;
        const status = document.getElementById('listClientsStatus').value;
        
        if (!gymId) {
            Toast.error('Selecciona un gimnasio');
            return;
        }
        
        let endpoint = `/gyms/gyms/${gymId}/clients`;
        if (status) endpoint += `?status=${status}`;
        
        const result = await ApiTester.request('GET', endpoint);
        
        if (result.success) {
            const count = result.data?.data?.length || 0;
            Toast.success(`${count} clientes encontrados`);
        } else {
            Toast.error(result.data?.message || 'Error al listar');
        }
    },

    async deactivateClient() {
        const gymId = document.getElementById('deactivateClientGymId').value;
        const clientId = document.getElementById('deactivateClientId').value;
        
        if (!gymId || !clientId) {
            Toast.error('Selecciona gimnasio y cliente');
            return;
        }
        
        const result = await ApiTester.request('DELETE', `/gyms/gyms/${gymId}/clients/${clientId}`);
        
        if (result.success) {
            Toast.success('Cliente dado de baja');
        } else {
            Toast.error(result.data?.message || 'Error al dar de baja');
        }
    },

    async activateClient() {
        const gymId = document.getElementById('activateClientGymId').value;
        const clientId = document.getElementById('activateClientId').value;
        
        if (!gymId || !clientId) {
            Toast.error('Selecciona gimnasio y cliente');
            return;
        }
        
        const result = await ApiTester.request('PATCH', `/gyms/gyms/${gymId}/clients/${clientId}/activate`);
        
        if (result.success) {
            Toast.success('Cliente reactivado');
        } else {
            Toast.error(result.data?.message || 'Error al reactivar');
        }
    }
};

// ============================================
// CLASSES MODULE
// ============================================

const ClassesModule = {
    async getCategories() {
        const result = await ApiTester.request('GET', '/classes/categories');
        
        if (result.success) {
            Toast.success('Categorías obtenidas');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async createCategory(e) {
        e.preventDefault();
        
        const body = {
            name: document.getElementById('categoryName').value
        };
        
        const description = document.getElementById('categoryDescription').value;
        if (description) body.description = description;
        
        const result = await ApiTester.request('POST', '/classes/categories', body);
        
        if (result.success) {
            Toast.success('Categoría creada');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error al crear');
        }
    },

    async getAllClasses() {
        const active = document.getElementById('classesActiveFilter').value;
        let endpoint = '/classes/';
        if (active) endpoint += `?active=${active}`;
        
        const result = await ApiTester.request('GET', endpoint);
        
        if (result.success) {
            const count = result.data?.data?.length || 0;
            Toast.success(`${count} clases encontradas`);
        } else {
            Toast.error(result.data?.message || 'Error al listar');
        }
    },

    async createClass(e) {
        e.preventDefault();
        
        let diasHorarios;
        try {
            diasHorarios = JSON.parse(document.getElementById('classDiasHorarios').value);
        } catch (err) {
            Toast.error('JSON de horarios inválido');
            return;
        }
        
        const body = {
            nombre: document.getElementById('className').value,
            cupoMaximo: Number(document.getElementById('classCupoMaximo').value),
            diasHorarios
        };
        
        const descripcion = document.getElementById('classDescripcion').value;
        const imagen = document.getElementById('classImagen').value;
        const categoriaId = document.getElementById('classCategoriaId').value;
        
        if (descripcion) body.descripcion = descripcion;
        if (imagen) body.imagen = imagen;
        if (categoriaId) body.categoriaId = categoriaId;
        
        const result = await ApiTester.request('POST', '/classes/', body);
        
        if (result.success) {
            Toast.success('Clase creada');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error al crear');
        }
    },

    async getClassById() {
        const id = document.getElementById('getClassId').value;
        
        if (!id) {
            Toast.error('Selecciona una clase');
            return;
        }
        
        const result = await ApiTester.request('GET', `/classes/${id}`);
        
        if (result.success) {
            Toast.success('Clase obtenida');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async updateClass(e) {
        e.preventDefault();
        
        const id = document.getElementById('updateClassId').value;
        if (!id) {
            Toast.error('Selecciona una clase');
            return;
        }
        
        const body = {};
        
        const nombre = document.getElementById('updateClassName').value;
        const cupoMaximo = document.getElementById('updateClassCupo').value;
        const descripcion = document.getElementById('updateClassDescripcion').value;
        
        if (nombre) body.nombre = nombre;
        if (cupoMaximo) body.cupoMaximo = Number(cupoMaximo);
        if (descripcion) body.descripcion = descripcion;
        
        if (Object.keys(body).length === 0) {
            Toast.error('Ingresa al menos un campo');
            return;
        }
        
        const result = await ApiTester.request('PUT', `/classes/${id}`, body);
        
        if (result.success) {
            Toast.success('Clase actualizada');
        } else {
            Toast.error(result.data?.message || 'Error al actualizar');
        }
    },

    async deleteClass() {
        const id = document.getElementById('deleteClassId').value;
        
        if (!id) {
            Toast.error('Selecciona una clase');
            return;
        }
        
        const result = await ApiTester.request('DELETE', `/classes/${id}`);
        
        if (result.success) {
            Toast.success('Clase archivada');
        } else {
            Toast.error(result.data?.message || 'Error al archivar');
        }
    },

    async toggleStatus() {
        const id = document.getElementById('toggleStatusClassId').value;
        const activa = document.getElementById('toggleStatusValue').value === 'true';
        
        if (!id) {
            Toast.error('Selecciona una clase');
            return;
        }
        
        const result = await ApiTester.request('PATCH', `/classes/${id}/status`, { activa });
        
        if (result.success) {
            Toast.success(`Clase ${activa ? 'activada' : 'desactivada'}`);
        } else {
            Toast.error(result.data?.message || 'Error al cambiar estado');
        }
    },

    async getSchedule() {
        const id = document.getElementById('getScheduleClassId').value;
        
        if (!id) {
            Toast.error('Selecciona una clase');
            return;
        }
        
        const result = await ApiTester.request('GET', `/classes/${id}/schedule`);
        
        if (result.success) {
            Toast.success('Horarios obtenidos');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async updateSchedule(e) {
        e.preventDefault();
        
        const id = document.getElementById('updateScheduleClassId').value;
        if (!id) {
            Toast.error('Selecciona una clase');
            return;
        }
        
        let body;
        try {
            body = JSON.parse(document.getElementById('updateScheduleData').value);
        } catch (err) {
            Toast.error('JSON inválido');
            return;
        }
        
        const result = await ApiTester.request('PUT', `/classes/${id}/schedule`, body);
        
        if (result.success) {
            Toast.success('Horarios actualizados');
        } else {
            Toast.error(result.data?.message || 'Error al actualizar');
        }
    },

    async updateImage(e) {
        e.preventDefault();
        
        const id = document.getElementById('updateImageClassId').value;
        const imageUrl = document.getElementById('updateImageUrl').value;
        
        if (!id) {
            Toast.error('Selecciona una clase');
            return;
        }
        
        const result = await ApiTester.request('PUT', `/classes/${id}/image`, { imageUrl });
        
        if (result.success) {
            Toast.success('Imagen actualizada');
        } else {
            Toast.error(result.data?.message || 'Error al actualizar');
        }
    },

    async getStats() {
        const id = document.getElementById('statsClassId').value;
        
        if (!id) {
            Toast.error('Selecciona una clase');
            return;
        }
        
        let endpoint = `/classes/${id}/stats`;
        const params = [];
        
        const startDate = document.getElementById('statsStartDate').value;
        const endDate = document.getElementById('statsEndDate').value;
        
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        
        if (params.length) endpoint += `?${params.join('&')}`;
        
        const result = await ApiTester.request('GET', endpoint);
        
        if (result.success) {
            Toast.success('Estadísticas obtenidas');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async getWaitlist() {
        const id = document.getElementById('getWaitlistClassId').value;
        
        if (!id) {
            Toast.error('Selecciona una clase');
            return;
        }
        
        const result = await ApiTester.request('GET', `/classes/${id}/waitlist`);
        
        if (result.success) {
            Toast.success('Lista de espera obtenida');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async joinWaitlist() {
        const id = document.getElementById('joinWaitlistClassId').value;
        
        if (!id) {
            Toast.error('Selecciona una clase');
            return;
        }
        
        const result = await ApiTester.request('POST', `/classes/${id}/waitlist`);
        
        if (result.success) {
            Toast.success('Agregado a lista de espera');
        } else {
            Toast.error(result.data?.message || 'Error al agregar');
        }
    },

    async leaveWaitlist() {
        const id = document.getElementById('leaveWaitlistClassId').value;
        let userId = document.getElementById('leaveWaitlistUserId').value;
        
        if (!id) {
            Toast.error('Selecciona una clase');
            return;
        }
        
        // If no userId provided, use current user
        if (!userId) {
            userId = ApiTester.config.userId;
        }
        
        if (!userId) {
            Toast.error('Ingresa un User ID o inicia sesión');
            return;
        }
        
        const result = await ApiTester.request('DELETE', `/classes/${id}/waitlist/${userId}`);
        
        if (result.success) {
            Toast.success('Removido de lista de espera');
        } else {
            Toast.error(result.data?.message || 'Error al remover');
        }
    }
};

// ============================================
// EXERCISES MODULE
// ============================================

const ExercisesModule = {
    async getAllExercises() {
        const result = await ApiTester.request('GET', '/exercises/');
        
        if (result.success) {
            const count = result.data?.data?.length || 0;
            Toast.success(`${count} ejercicios encontrados`);
        } else {
            Toast.error(result.data?.message || 'Error al listar');
        }
    },

    async createExercise(e) {
        e.preventDefault();
        
        const body = {
            nombre: document.getElementById('exerciseNombre').value,
            categoria: document.getElementById('exerciseCategoria').value
        };
        
        const descripcion = document.getElementById('exerciseDescripcion').value;
        const grupoMuscular = document.getElementById('exerciseGrupoMuscular').value;
        const equipamiento = document.getElementById('exerciseEquipamiento').value;
        const videoUrl = document.getElementById('exerciseVideoUrl').value;
        const imagenUrl = document.getElementById('exerciseImagenUrl').value;
        const instrucciones = document.getElementById('exerciseInstrucciones').value;
        
        if (descripcion) body.descripcion = descripcion;
        if (grupoMuscular) body.grupoMuscular = grupoMuscular;
        if (equipamiento) body.equipamiento = equipamiento;
        if (videoUrl) body.videoUrl = videoUrl;
        if (imagenUrl) body.imagenUrl = imagenUrl;
        if (instrucciones) body.instrucciones = instrucciones;
        
        const result = await ApiTester.request('POST', '/exercises/create', body);
        
        if (result.success) {
            Toast.success('Ejercicio creado');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error al crear');
        }
    },

    async getExerciseById() {
        const id = document.getElementById('getExerciseId').value;
        
        if (!id) {
            Toast.error('Selecciona un ejercicio');
            return;
        }
        
        const result = await ApiTester.request('GET', `/exercises/${id}`);
        
        if (result.success) {
            Toast.success('Ejercicio obtenido');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async updateExercise(e) {
        e.preventDefault();
        
        const id = document.getElementById('updateExerciseId').value;
        if (!id) {
            Toast.error('Selecciona un ejercicio');
            return;
        }
        
        const body = {};
        
        const nombre = document.getElementById('updateExerciseNombre').value;
        const categoria = document.getElementById('updateExerciseCategoria').value;
        const descripcion = document.getElementById('updateExerciseDescripcion').value;
        
        if (nombre) body.nombre = nombre;
        if (categoria) body.categoria = categoria;
        if (descripcion) body.descripcion = descripcion;
        
        if (Object.keys(body).length === 0) {
            Toast.error('Ingresa al menos un campo');
            return;
        }
        
        const result = await ApiTester.request('PUT', `/exercises/${id}`, body);
        
        if (result.success) {
            Toast.success('Ejercicio actualizado');
        } else {
            Toast.error(result.data?.message || 'Error al actualizar');
        }
    },

    async deleteExercise() {
        const id = document.getElementById('deleteExerciseId').value;
        
        if (!id) {
            Toast.error('Selecciona un ejercicio');
            return;
        }
        
        const result = await ApiTester.request('DELETE', `/exercises/${id}`);
        
        if (result.success) {
            Toast.success('Ejercicio archivado');
        } else {
            Toast.error(result.data?.message || 'Error al archivar');
        }
    }
};

// ============================================
// ROUTINES MODULE
// ============================================

const RoutinesModule = {
    exercisesCache: [],

    async ensureExercisesLoaded() {
        if (this.exercisesCache && this.exercisesCache.length > 0) return;
        
        const result = await ApiTester.request('GET', '/exercises/');
        if (result.success && result.data?.data) {
            this.exercisesCache = SmartSelectors.normalizeData(result.data.data);
        }
    },

    async addExerciseRow() {
        await this.ensureExercisesLoaded();
        const container = document.getElementById('exercisesContainer');
        
        const row = document.createElement('div');
        row.className = 'exercise-row';
        row.style.cssText = 'background: var(--bg-tertiary); padding: 15px; margin-bottom: 10px; border-radius: var(--radius-md); border: 1px solid var(--border); position: relative; animation: fadeIn 0.3s ease;';
        
        let options = '<option value="">Seleccionar Ejercicio...</option>';
        this.exercisesCache.forEach(ex => {
            options += `<option value="${ex.exerciseId || ex.id}">${ex.nombre} (${ex.categoria})</option>`;
        });

        row.innerHTML = `
            <button type="button" onclick="this.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem; line-height: 1;">&times;</button>
            <div class="form-group">
                <label>Ejercicio</label>
                <select class="exercise-select" required style="width: 100%; margin-bottom: 10px;">
                    ${options}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Sets</label>
                    <input type="number" class="exercise-sets" placeholder="3" required min="1">
                </div>
                <div class="form-group">
                    <label>Reps</label>
                    <input type="number" class="exercise-reps" placeholder="12" required min="1">
                </div>
                <div class="form-group">
                    <label>Peso (kg)</label>
                    <input type="number" class="exercise-weight" placeholder="0" min="0">
                </div>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label>Notas</label>
                <input type="text" class="exercise-notes" placeholder="Notas opcionales">
            </div>
        `;
        
        container.appendChild(row);
    },

    async createRoutine(e) {
        e.preventDefault();
        
        const rows = document.querySelectorAll('.exercise-row');
        if (rows.length === 0) {
            Toast.error('Agrega al menos un ejercicio');
            return;
        }

        const ejercicios = [];
        let hasError = false;

        rows.forEach(row => {
            const exerciseId = row.querySelector('.exercise-select').value;
            const sets = Number(row.querySelector('.exercise-sets').value);
            const reps = Number(row.querySelector('.exercise-reps').value);
            const weight = Number(row.querySelector('.exercise-weight').value);
            const notes = row.querySelector('.exercise-notes').value;

            if (!exerciseId) {
                hasError = true;
                return;
            }

            const exercise = {
                exerciseId,
                sets,
                reps,
                weight
            };
            if (notes) exercise.notes = notes;
            
            ejercicios.push(exercise);
        });

        if (hasError) {
            Toast.error('Selecciona un ejercicio en todas las filas');
            return;
        }
        
        const body = {
            nombre: document.getElementById('routineNombre').value,
            ejercicios
        };
        
        const descripcion = document.getElementById('routineDescripcion').value;
        if (descripcion) body.descripcion = descripcion;
        
        const result = await ApiTester.request('POST', '/routines/create', body);
        
        if (result.success) {
            Toast.success('Rutina creada');
            e.target.reset();
            document.getElementById('exercisesContainer').innerHTML = '';
        } else {
            Toast.error(result.data?.message || 'Error al crear');
        }
    },

    async getRoutineById() {
        const id = document.getElementById('getRoutineId').value;
        
        if (!id) {
            Toast.error('Ingresa un ID de rutina');
            return;
        }
        
        const result = await ApiTester.request('GET', `/routines/${id}`);
        
        if (result.success) {
            Toast.success('Rutina obtenida');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async updateRoutine(e) {
        e.preventDefault();
        
        const id = document.getElementById('updateRoutineId').value;
        if (!id) {
            Toast.error('Ingresa un ID de rutina');
            return;
        }
        
        const body = {};
        
        const nombre = document.getElementById('updateRoutineNombre').value;
        const descripcion = document.getElementById('updateRoutineDescripcion').value;
        const ejerciciosStr = document.getElementById('updateRoutineEjercicios').value;
        
        if (nombre) body.nombre = nombre;
        if (descripcion) body.descripcion = descripcion;
        
        if (ejerciciosStr) {
            try {
                body.ejercicios = JSON.parse(ejerciciosStr);
            } catch (err) {
                Toast.error('JSON de ejercicios inválido');
                return;
            }
        }
        
        if (Object.keys(body).length === 0) {
            Toast.error('Ingresa al menos un campo');
            return;
        }
        
        const result = await ApiTester.request('PUT', `/routines/${id}`, body);
        
        if (result.success) {
            Toast.success('Rutina actualizada');
        } else {
            Toast.error(result.data?.message || 'Error al actualizar');
        }
    },

    async deleteRoutine() {
        const id = document.getElementById('deleteRoutineId').value;
        
        if (!id) {
            Toast.error('Ingresa un ID de rutina');
            return;
        }
        
        const result = await ApiTester.request('DELETE', `/routines/${id}`);
        
        if (result.success) {
            Toast.success('Rutina archivada');
        } else {
            Toast.error(result.data?.message || 'Error al archivar');
        }
    },

    async assignRoutine(e) {
        e.preventDefault();
        
        const userId = document.getElementById('assignUserId').value;
        const routineId = document.getElementById('assignRoutineId').value;
        
        const result = await ApiTester.request('POST', '/routines/assign', { userId, routineId });
        
        if (result.success) {
            Toast.success('Rutina asignada');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error al asignar');
        }
    },

    async getUserRoutine() {
        let userId = document.getElementById('getUserRoutineUserId').value;
        
        if (!userId) {
            userId = ApiTester.config.userId;
        }
        
        if (!userId) {
            Toast.error('Ingresa un User ID o inicia sesión');
            return;
        }
        
        const result = await ApiTester.request('GET', `/routines/user/${userId}`);
        
        if (result.success) {
            Toast.success('Rutina del usuario obtenida');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async addProgressExerciseRow() {
        await this.ensureExercisesLoaded();
        const container = document.getElementById('progressExercisesContainer');
        
        const row = document.createElement('div');
        row.className = 'progress-exercise-row';
        row.style.cssText = 'background: var(--bg-tertiary); padding: 15px; margin-bottom: 10px; border-radius: var(--radius-md); border: 1px solid var(--border); position: relative; animation: fadeIn 0.3s ease;';
        
        let options = '<option value="">Seleccionar Ejercicio...</option>';
        this.exercisesCache.forEach(ex => {
            options += `<option value="${ex.exerciseId || ex.id}">${ex.nombre} (${ex.categoria})</option>`;
        });

        row.innerHTML = `
            <button type="button" onclick="this.parentElement.remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem; line-height: 1;">&times;</button>
            <div class="form-group">
                <label>Ejercicio</label>
                <select class="progress-exercise-select" required style="width: 100%; margin-bottom: 10px;">
                    ${options}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Completed Sets</label>
                    <input type="number" class="progress-sets" placeholder="3" required min="1">
                </div>
                <div class="form-group">
                    <label>Completed Reps</label>
                    <input type="number" class="progress-reps" placeholder="10" required min="1">
                </div>
                <div class="form-group">
                    <label>Peso (kg)</label>
                    <input type="number" class="progress-weight" placeholder="0" min="0">
                </div>
            </div>
        `;
        
        container.appendChild(row);
    },

    async logProgress(e) {
        e.preventDefault();
        
        const rows = document.querySelectorAll('.progress-exercise-row');
        if (rows.length === 0) {
            Toast.error('Agrega al menos un ejercicio completado');
            return;
        }

        const exercises = [];
        let hasError = false;

        rows.forEach(row => {
            const exerciseId = row.querySelector('.progress-exercise-select').value;
            const completedSets = Number(row.querySelector('.progress-sets').value);
            const completedReps = Number(row.querySelector('.progress-reps').value);
            const weight = Number(row.querySelector('.progress-weight').value);

            if (!exerciseId) {
                hasError = true;
                return;
            }

            exercises.push({
                exerciseId,
                completedSets,
                completedReps,
                weight
            });
        });

        if (hasError) {
            Toast.error('Selecciona un ejercicio en todas las filas');
            return;
        }
        
        const body = {
            userId: document.getElementById('progressUserId').value,
            exercises
        };
        
        const date = document.getElementById('progressDate').value;
        const notes = document.getElementById('progressNotes').value;
        
        if (date) body.date = date;
        if (notes) body.notes = notes;
        
        const result = await ApiTester.request('POST', '/routines/progress', body);
        
        if (result.success) {
            Toast.success('Progreso registrado');
            e.target.reset();
            document.getElementById('progressExercisesContainer').innerHTML = '';
        } else {
            Toast.error(result.data?.message || 'Error al registrar');
        }
    }
};

// ============================================
// STREAKS MODULE
// ============================================

const StreaksModule = {
    async checkIn(e) {
        e.preventDefault();
        
        const body = {};
        
        // Usa el usuario logueado actual
        let userId = ApiTester.config.userId;
        
        // Si no hay userId en config, intentar recuperar de localStorage por si acaso
        if (!userId) {
             userId = localStorage.getItem('mygym_userId');
             // Si lo recuperamos, actualizar config
             if (userId) ApiTester.config.userId = userId;
        }
        
        if (!userId) {
            Toast.error('Debes iniciar sesión primero (No User ID found)');
            return;
        }
        
        body.userId = userId;
        
        const gymId = document.getElementById('checkInGymId').value;
        const classId = document.getElementById('checkInClassId').value;
        const code = document.getElementById('checkInCode').value;
        
        if (gymId) body.gymId = gymId;
        if (classId) body.classId = classId;
        if (code) body.code = code;
        
        const result = await ApiTester.request('POST', '/streaks/check-in', body);
        
        if (result.success) {
            Toast.success('Check-in registrado');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error en check-in');
        }
    },

    async getHistory() {
        // Se usa directamente el usuario logueado
        let userId = ApiTester.config.userId;
        
        if (!userId) {
            Toast.error('Debes iniciar sesión primero');
            return;
        }
        
        const result = await ApiTester.request('GET', `/streaks/history?userId=${userId}`);
        
        if (result.success) {
            Toast.success('Historial obtenido');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async getStreak() {
        // Se usa directamente el usuario logueado
        let userId = ApiTester.config.userId;
        
        if (!userId) {
            Toast.error('Debes iniciar sesión primero');
            return;
        }
        
        const result = await ApiTester.request('GET', `/streaks/${userId}`);
        
        if (result.success) {
            Toast.success('Racha obtenida');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    }
};

// ============================================
// REGISTRATIONS MODULE
// ============================================

const RegistrationsModule = {
    async getActive() {
        // Se usa el usuario logueado
        let userId = ApiTester.config.userId;
        
        if (!userId) {
            Toast.error('Debes iniciar sesión primero');
            return;
        }
        
        const result = await ApiTester.request('GET', `/registrations/?userId=${userId}`);
        
        if (result.success) {
            const count = result.data?.data?.length || 0;
            Toast.success(`${count} inscripciones activas`);
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async create(e) {
        e.preventDefault();
        
        const userId = ApiTester.config.userId;

        if (!userId) {
             Toast.error('Debes iniciar sesión primero');
             return;
        }

        const body = {
            userId: userId,
            gymId: document.getElementById('regGymId').value,
            classId: document.getElementById('regClassId').value
        };
        
        const result = await ApiTester.request('POST', '/registrations/', body);
        
        if (result.success) {
            Toast.success('Inscripción creada');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error al crear');
        }
    },

    async getHistory() {
        // Se usa el usuario logueado
        let userId = ApiTester.config.userId;
        
        if (!userId) {
            Toast.error('Debes iniciar sesión primero');
            return;
        }
        
        const result = await ApiTester.request('GET', `/registrations/history?userId=${userId}`);
        
        if (result.success) {
            Toast.success('Historial obtenido');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async getById() {
        const id = document.getElementById('getRegistrationId').value;
        
        if (!id) {
            Toast.error('Ingresa un ID de inscripción');
            return;
        }
        
        const result = await ApiTester.request('GET', `/registrations/${id}`);
        
        if (result.success) {
            Toast.success('Inscripción obtenida');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async cancel() {
        const id = document.getElementById('cancelRegistrationId').value;
        
        if (!id) {
            Toast.error('Ingresa un ID de inscripción');
            return;
        }
        
        const result = await ApiTester.request('DELETE', `/registrations/${id}`);
        
        if (result.success) {
            Toast.success('Inscripción cancelada');
        } else {
            Toast.error(result.data?.message || 'Error al cancelar');
        }
    }
};

// ============================================
// PAYMENTS MODULE
// ============================================

const PaymentsModule = {
    async processPayment(e) {
        e.preventDefault();
        
        const body = {
            amount: Number(document.getElementById('paymentAmount').value),
            method: document.getElementById('paymentMethod').value,
            token: document.getElementById('paymentToken').value,
            gymId: document.getElementById('paymentGymId').value
        };
        
        const concept = document.getElementById('paymentConcept').value;
        if (concept) body.concept = concept;
        
        const result = await ApiTester.request('POST', '/payments/process', body);
        
        if (result.success) {
            Toast.success('Pago procesado');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error al procesar');
        }
    },

    async getHistory() {
        const year = document.getElementById('paymentHistoryYear').value;
        let endpoint = '/payments/history';
        
        if (year) endpoint += `?year=${year}`;
        
        const result = await ApiTester.request('GET', endpoint);
        
        if (result.success) {
            const count = result.data?.data?.length || 0;
            Toast.success(`${count} pagos encontrados`);
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async getStatus() {
        const result = await ApiTester.request('GET', '/payments/status');
        
        if (result.success) {
            Toast.success('Estado obtenido');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async getMethods() {
        const result = await ApiTester.request('GET', '/payments/methods');
        
        if (result.success) {
            const count = result.data?.data?.length || 0;
            Toast.success(`${count} métodos encontrados`);
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async addMethod(e) {
        e.preventDefault();
        
        const body = {
            type: document.getElementById('methodType').value
        };
        
        const detailsStr = document.getElementById('methodDetails').value;
        if (detailsStr) {
            try {
                body.details = JSON.parse(detailsStr);
            } catch (err) {
                Toast.error('JSON de detalles inválido');
                return;
            }
        }
        
        const result = await ApiTester.request('POST', '/payments/methods', body);
        
        if (result.success) {
            Toast.success('Método agregado');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error al agregar');
        }
    },

    async deleteMethod() {
        const id = document.getElementById('deleteMethodId').value;
        
        if (!id) {
            Toast.error('Ingresa un ID de método');
            return;
        }
        
        const result = await ApiTester.request('DELETE', `/payments/methods/${id}`);
        
        if (result.success) {
            Toast.success('Método eliminado');
        } else {
            Toast.error(result.data?.message || 'Error al eliminar');
        }
    }
};

// ============================================
// FINANCE MODULE
// ============================================

const FinanceModule = {
    async getSettings() {
        const result = await ApiTester.request('GET', '/finance/settings');
        
        if (result.success) {
            Toast.success('Configuración obtenida');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async updateSettings(e) {
        e.preventDefault();
        
        const body = {
            monthlyQuota: Number(document.getElementById('financeMonthlyQuota').value)
        };
        
        const expirationDays = document.getElementById('financeExpirationDays').value;
        const surchargePercentage = document.getElementById('financeSurcharge').value;
        const currency = document.getElementById('financeCurrency').value;
        
        if (expirationDays) body.expirationDays = Number(expirationDays);
        if (surchargePercentage) body.surchargePercentage = Number(surchargePercentage);
        if (currency) body.currency = currency;
        
        const result = await ApiTester.request('PUT', '/finance/settings', body);
        
        if (result.success) {
            Toast.success('Configuración actualizada');
        } else {
            Toast.error(result.data?.message || 'Error al actualizar');
        }
    },

    async getDashboard() {
        const period = document.getElementById('dashboardPeriod').value;
        let endpoint = '/finance/dashboard';
        
        if (period) endpoint += `?period=${period}`;
        
        const result = await ApiTester.request('GET', endpoint);
        
        if (result.success) {
            Toast.success('Dashboard obtenido');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async getTransactions() {
        const result = await ApiTester.request('GET', '/finance/transactions');
        
        if (result.success) {
            const count = result.data?.data?.length || 0;
            Toast.success(`${count} transacciones encontradas`);
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async getMonthlyReport() {
        const month = document.getElementById('reportMonth').value;
        const year = document.getElementById('reportYear').value;
        
        if (!month || !year) {
            Toast.error('Selecciona mes y año');
            return;
        }
        
        const result = await ApiTester.request('GET', `/finance/reports/monthly?month=${month}&year=${year}`);
        
        if (result.success) {
            Toast.success('Reporte generado');
        } else {
            Toast.error(result.data?.message || 'Error al generar');
        }
    },

    async getInvoice() {
        const id = document.getElementById('getInvoiceId').value;
        
        if (!id) {
            Toast.error('Ingresa un ID de factura');
            return;
        }
        
        const result = await ApiTester.request('GET', `/finance/invoices/${id}`);
        
        if (result.success) {
            Toast.success('Factura obtenida');
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async getDebtors() {
        const result = await ApiTester.request('GET', '/finance/debtors');
        
        if (result.success) {
            const count = result.data?.data?.length || 0;
            Toast.success(`${count} deudores encontrados`);
        } else {
            Toast.error(result.data?.message || 'Error al obtener');
        }
    },

    async sendReminders(e) {
        e.preventDefault();
        
        let userIds;
        try {
            userIds = JSON.parse(document.getElementById('reminderUserIds').value);
        } catch (err) {
            Toast.error('JSON inválido');
            return;
        }
        
        const result = await ApiTester.request('POST', '/finance/reminders', { userIds });
        
        if (result.success) {
            Toast.success('Recordatorios enviados');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error al enviar');
        }
    },

    async registerManualPayment(e) {
        e.preventDefault();
        
        const body = {
            userId: document.getElementById('manualPaymentUserId').value,
            amount: Number(document.getElementById('manualPaymentAmount').value)
        };
        
        const concept = document.getElementById('manualPaymentConcept').value;
        if (concept) body.concept = concept;
        
        const result = await ApiTester.request('POST', '/finance/manual-payment', body);
        
        if (result.success) {
            Toast.success('Pago manual registrado');
            e.target.reset();
        } else {
            Toast.error(result.data?.message || 'Error al registrar');
        }
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    ApiTester.init();
    Toast.init();
});
