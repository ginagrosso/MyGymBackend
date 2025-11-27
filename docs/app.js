// ==================== INICIALIZACIÓN UI ====================
document.addEventListener('DOMContentLoaded', () => {
    // LOGOUT
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        if (localStorage.getItem('token')) {
            logoutBtn.style.display = '';
        } else {
            logoutBtn.style.display = 'none';
        }
        logoutBtn.onclick = () => {
            localStorage.removeItem('token');
            location.reload();
        };
    }

    // MODALES Y LANDING
    // Modal Login
    const loginModal = document.getElementById('loginModal');
    const openLoginBtn = document.getElementById('openLoginModal');
    const closeLoginBtn = document.getElementById('closeLoginModal');
    if (openLoginBtn && loginModal) openLoginBtn.onclick = () => { loginModal.style.display = 'flex'; };
    if (closeLoginBtn && loginModal) closeLoginBtn.onclick = () => { loginModal.style.display = 'none'; document.getElementById('loginModalResponse').textContent = ''; };

    // Modal Registro
    const registerModal = document.getElementById('registerModal');
    const openRegisterBtn = document.getElementById('openRegisterModal');
    const closeRegisterBtn = document.getElementById('closeRegisterModal');
    if (openRegisterBtn && registerModal) openRegisterBtn.onclick = () => { registerModal.style.display = 'flex'; };
    if (closeRegisterBtn && registerModal) closeRegisterBtn.onclick = () => { registerModal.style.display = 'none'; document.getElementById('registerModalResponse').textContent = ''; };

    window.onclick = (e) => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === registerModal) registerModal.style.display = 'none';
    };

    // Login Modal Form (asegura mostrar respuesta)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            showLoading('loginModalResponse');
            const result = await makeRequest('/auth/auth/login', 'POST', { email, password });
            // Ocultar el token en la respuesta visual, incluso si es el único campo o si la respuesta es un string
            let resultToShow = { ...result };
            if (resultToShow.success && resultToShow.data) {
                // Si la respuesta es un string (ej: el token plano)
                if (typeof resultToShow.data === 'string') {
                    // Guardar el token pero no mostrarlo
                    localStorage.setItem('token', resultToShow.data);
                    resultToShow = { ...resultToShow, data: { message: '¡Inicio de sesión exitoso!' } };
                } else if (resultToShow.data.token) {
                    localStorage.setItem('token', resultToShow.data.token);
                    const keys = Object.keys(resultToShow.data);
                    if (keys.length === 1 && keys[0] === 'token') {
                        resultToShow = { ...resultToShow, data: { message: '¡Inicio de sesión exitoso!' } };
                    } else {
                        // Eliminar el token de la respuesta visual
                        const { token, ...rest } = resultToShow.data;
                        resultToShow = { ...resultToShow, data: rest };
                    }
                }
                // Mostrar el botón de logout inmediatamente
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) logoutBtn.style.display = '';
                // Cerrar modal tras breve delay
                setTimeout(() => { loginModal.style.display = 'none'; }, 800);
            }
            showResponse('loginModalResponse', resultToShow);
        };
    }

    // Llenar los selects al cargar la página y al agregar ejercicios (rutinas)
    if (document.getElementById('routineExercises')) {
        cargarEjerciciosParaRutina();
        // Al agregar un nuevo ejercicio, volver a poblar el select
        document.getElementById('addExerciseBtn').addEventListener('click', () => {
            setTimeout(actualizarSelectsEjercicios, 50);
        });
    }
});
// ========== PROCESAR PAGO ==========
const processPaymentForm = document.getElementById('processPaymentForm');
if (processPaymentForm) {
    processPaymentForm.onsubmit = async (e) => {
        e.preventDefault();
        showLoading('processPaymentResponse');
        const userId = document.getElementById('paymentUserId').value;
        const amount = Number(document.getElementById('paymentAmount').value);
        const paymentMethod = document.getElementById('paymentMethod').value;
        const description = document.getElementById('paymentDescription').value;
        const body = { userId, amount, paymentMethod, description };
        let token = localStorage.getItem('token') || null;
        const result = await makeRequest('/payments/process', 'POST', body, token);
        showResponse('processPaymentResponse', result);
    };
}
// ========== CREAR INSCRIPCIÓN ==========
const createRegistrationForm = document.getElementById('createRegistrationForm');
if (createRegistrationForm) {
    createRegistrationForm.onsubmit = async (e) => {
        e.preventDefault();
        showLoading('createRegistrationResponse');
        const userId = document.getElementById('registrationUserId').value;
        const gymId = document.getElementById('registrationGymId').value;
        const membershipType = document.getElementById('registrationMembershipType').value;
        const startDate = document.getElementById('registrationStartDate').value;
        const body = { userId, gymId, membershipType, startDate };
        let token = localStorage.getItem('token') || null;
        const result = await makeRequest('/registrations', 'POST', body, token);
        showResponse('createRegistrationResponse', result);
    };
}
// ========== REGISTRAR PROGRESO ==========
const logProgressForm = document.getElementById('logProgressForm');
if (logProgressForm) {
    // Agregar ejercicios dinámicamente
    document.getElementById('addProgressExerciseBtn').onclick = () => {
        const container = document.createElement('div');
        container.className = 'progress-exercise';
        container.innerHTML = `
            <select class="exerciseId" required><option value="">Seleccionar ejercicio...</option></select>
            <input type="number" class="completedSets" placeholder="Sets completados" min="0" required>
            <input type="number" class="completedReps" placeholder="Reps completadas (opcional)" min="0">
            <input type="number" class="weight" placeholder="Peso (opcional)">
            <input type="text" class="notes" placeholder="Notas (opcional)">
            <button type="button" class="removeProgressExercise">Quitar</button>
        `;
        container.querySelector('.removeProgressExercise').onclick = function() { container.remove(); };
        document.getElementById('progressExercises').appendChild(container);
        actualizarSelectsEjerciciosProgreso();
    };

    // Poblar selects de ejercicios
    function actualizarSelectsEjerciciosProgreso() {
        document.querySelectorAll('.progress-exercise .exerciseId').forEach(select => {
            const valorActual = select.value;
            select.innerHTML = '<option value="">Seleccionar ejercicio...</option>';
            ejerciciosDisponibles.forEach(ej => {
                const nombre = ej.nombre || ej.name || ej.id || ej._id;
                const id = ej._id || ej.id || ej.exerciseId || '';
                if (id) {
                    const option = document.createElement('option');
                    option.value = id;
                    option.textContent = nombre + ' (' + id + ')';
                    if (valorActual === id) option.selected = true;
                    select.appendChild(option);
                }
            });
        });
    }
    // Llenar los selects al cargar la página y al agregar ejercicios
    actualizarSelectsEjerciciosProgreso();
    // Enlazar también a la carga global de ejercicios
    document.addEventListener('ejerciciosCargados', actualizarSelectsEjerciciosProgreso);

    logProgressForm.onsubmit = async (e) => {
        e.preventDefault();
        showLoading('logProgressResponse');
        const date = document.getElementById('progressDate').value;
        const notes = document.getElementById('progressNotes').value;
        const exercises = [];
        document.querySelectorAll('#progressExercises .progress-exercise').forEach(div => {
            const exerciseId = div.querySelector('.exerciseId').value;
            const completedSets = div.querySelector('.completedSets').value;
            const completedReps = div.querySelector('.completedReps').value;
            const weight = div.querySelector('.weight').value;
            const notesEj = div.querySelector('.notes').value;
            if (exerciseId && completedSets) {
                const ej = {
                    exerciseId,
                    completedSets: Number(completedSets)
                };
                if (completedReps) ej.completedReps = Number(completedReps);
                if (weight) ej.weight = Number(weight);
                if (notesEj) ej.notes = notesEj;
                exercises.push(ej);
            }
        });
        const body = { exercises };
        if (date) body.date = date;
        if (notes) body.notes = notes;
        // Token si existe
        let token = localStorage.getItem('token') || null;
        const result = await makeRequest('/routines/progress', 'POST', body, token);
        showResponse('logProgressResponse', result);
    };
}
// ========== OBTENER Y MAPEAR EJERCICIOS PARA RUTINAS ==========
let ejerciciosDisponibles = [];
async function cargarEjerciciosParaRutina() {
    // Llama al endpoint de ejercicios con token si existe
    let token = localStorage.getItem('token') || null;
    let result;
    if (token) {
        result = await makeRequest('/exercises', 'GET', null, token);
    } else {
        result = await makeRequest('/exercises', 'GET');
    }
    // El endpoint devuelve { success: true, data: [ ... ] }
    if (result.success && Array.isArray(result.data)) {
        ejerciciosDisponibles = result.data;
    } else if (result.success && result.data && Array.isArray(result.data.ejercicios)) {
        ejerciciosDisponibles = result.data.ejercicios;
    } else if (result.success && result.data && Array.isArray(result.data.data)) {
        ejerciciosDisponibles = result.data.data;
    } else {
        ejerciciosDisponibles = [];
    }
    actualizarSelectsEjercicios();
}

function actualizarSelectsEjercicios() {
    document.querySelectorAll('.routine-exercise .exerciseId').forEach(select => {
        const valorActual = select.value;
        select.innerHTML = '<option value="">Seleccionar ejercicio...</option>';
        ejerciciosDisponibles.forEach(ej => {
            const nombre = ej.nombre || ej.name || ej.id || ej._id;
            const id = ej._id || ej.id || ej.exerciseId || '';
            if (id) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = nombre + ' (' + id + ')';
                if (valorActual === id) option.selected = true;
                select.appendChild(option);
            }
        });
    });
}

// Llenar los selects al cargar la página y al agregar ejercicios
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('routineExercises')) {
        cargarEjerciciosParaRutina();
        // Al agregar un nuevo ejercicio, volver a poblar el select
        document.getElementById('addExerciseBtn').addEventListener('click', () => {
            setTimeout(actualizarSelectsEjercicios, 50);
        });
    }
});
// ========== CREAR RUTINA ==========
const createRoutineForm = document.getElementById('createRoutineForm');
if (createRoutineForm) {
    // Agregar ejercicios dinámicamente
    document.getElementById('addExerciseBtn').onclick = () => {
        const container = document.createElement('div');
        container.className = 'routine-exercise';
        container.innerHTML = `
            <select class="exerciseId" required><option value="">Seleccionar ejercicio...</option></select>
            <input type="number" class="sets" placeholder="Sets" min="1" required>
            <input type="number" class="reps" placeholder="Reps" min="1" required>
            <input type="number" class="weight" placeholder="Peso (opcional)">
            <input type="text" class="notes" placeholder="Notas (opcional)">
            <button type="button" class="removeExercise">Quitar</button>
        `;
        container.querySelector('.removeExercise').onclick = function() { container.remove(); };
        document.getElementById('routineExercises').appendChild(container);
        actualizarSelectsEjercicios();
    };

    createRoutineForm.onsubmit = async (e) => {
        e.preventDefault();
        showLoading('createRoutineResponse');
        const nombre = document.getElementById('routineNombre').value;
        const descripcion = document.getElementById('routineDescripcion').value;
        const ejercicios = [];
        document.querySelectorAll('#routineExercises .routine-exercise').forEach(div => {
            const exerciseId = div.querySelector('.exerciseId').value;
            const sets = div.querySelector('.sets').value;
            const reps = div.querySelector('.reps').value;
            const weight = div.querySelector('.weight').value;
            const notes = div.querySelector('.notes').value;
            if (exerciseId && sets && reps) {
                const ej = {
                    exerciseId,
                    sets: Number(sets),
                    reps: Number(reps)
                };
                if (weight) ej.weight = Number(weight);
                if (notes) ej.notes = notes;
                ejercicios.push(ej);
            }
        });
        const body = { nombre, ejercicios };
        if (descripcion) body.descripcion = descripcion;
        const result = await makeRequest('/routines/create', 'POST', body);
        showResponse('createRoutineResponse', result);
    };
}
// ========== MODALES Y LANDING ==========
// ==================== HELPERS ====================

async function makeRequest(endpoint, method = 'GET', body = null, token = null) {
    const baseUrl = document.getElementById('baseUrl').value.trim();
    const url = `${baseUrl}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    // Si no se pasa token explícito, buscar en localStorage
    if (!token) {
        token = localStorage.getItem('token') || null;
    }
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    if (body) {
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return { success: response.ok, data, status: response.status };
    } catch (error) {
        return { success: false, data: { message: error.message }, status: 0 };
    }
}

function showResponse(elementId, result) {
    const element = document.getElementById(elementId);
    element.className = 'response';
    
    if (result.success) {
        element.classList.add('success');
    } else {
        element.classList.add('error');
    }
    
    element.textContent = JSON.stringify(result.data, null, 2);
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.className = 'response loading';
    element.textContent = '⏳ Cargando...';
}

// ==================== AUTH ====================


// Nuevo login con inputs
const loginSectionForm = document.getElementById('loginSectionForm');
if (loginSectionForm) {
    loginSectionForm.onsubmit = async (e) => {
        e.preventDefault();
        showLoading('loginResponse');
        const body = {
            email: document.getElementById('loginSectionEmail').value,
            password: document.getElementById('loginSectionPassword').value
        };
        const result = await makeRequest('/auth/login', 'POST', body);
        showResponse('loginResponse', result);
        // Guardar token si login exitoso
        if (result.success && result.data && result.data.token) {
            localStorage.setItem('token', result.data.token);
        }
    };
}


// Nuevo recuperar contraseña con inputs
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.onsubmit = async (e) => {
        e.preventDefault();
        showLoading('forgotPasswordResponse');
        const body = {
            email: document.getElementById('forgotPasswordEmail').value
        };
        const result = await makeRequest('/auth/auth/forgot-password', 'POST', body);
        showResponse('forgotPasswordResponse', result);
    };
}

// ==================== USUARIOS ====================


// Nuevo registro de usuario con inputs
const createUserForm = document.getElementById('createUserForm');
if (createUserForm) {
    createUserForm.onsubmit = async (e) => {
        e.preventDefault();
        showLoading('createUserResponse');
        const body = {
            email: document.getElementById('userEmail').value,
            password: document.getElementById('userPassword').value,
            name: document.getElementById('userName').value,
            dni: document.getElementById('userDni').value,
            birthDate: document.getElementById('userBirthDate').value,
            gender: document.getElementById('userGender').value,
            phone: document.getElementById('userPhone').value,
            weight: Number(document.getElementById('userWeight').value),
            height: Number(document.getElementById('userHeight').value)
        };
        const result = await makeRequest('/users/auth/register/client', 'POST', body);
        showResponse('createUserResponse', result);
    };
}

// ==================== GIMNASIOS ====================


// Nuevo registro de gimnasio con inputs
const registerGymForm = document.getElementById('registerGymForm');
if (registerGymForm) {
    registerGymForm.onsubmit = async (e) => {
        e.preventDefault();
        showLoading('registerGymResponse');
        const body = {
            name: document.getElementById('gymName').value,
            address: document.getElementById('gymAddress').value,
            phone: document.getElementById('gymPhone').value,
            email: document.getElementById('gymEmail').value,
            ownerEmail: document.getElementById('gymOwnerEmail').value,
            ownerPassword: document.getElementById('gymOwnerPassword').value
        };
        const result = await makeRequest('/gyms/auth/register/gym', 'POST', body);
        showResponse('registerGymResponse', result);
    };
}

async function getAllGyms() {
    showLoading('getAllGymsResponse');
    const result = await makeRequest('/gyms/gyms', 'GET');
    showResponse('getAllGymsResponse', result);
}

async function getGym() {
    const gymId = document.getElementById('getGymId').value.trim();
    if (!gymId) {
        showResponse('getGymResponse', { success: false, data: { message: 'gymId es requerido' } });
        return;
    }
    showLoading('getGymResponse');
    const result = await makeRequest(`/gyms/gyms/${gymId}`, 'GET');
    showResponse('getGymResponse', result);
}

// ==================== EJERCICIOS ====================


// Nuevo registro de ejercicio con inputs
const createExerciseForm = document.getElementById('createExerciseForm');
if (createExerciseForm) {
    createExerciseForm.onsubmit = async (e) => {
        e.preventDefault();
        showLoading('createExerciseResponse');
        const nombre = document.getElementById('exerciseNombre').value;
        const descripcion = document.getElementById('exerciseDescripcion').value;
        const categoria = document.getElementById('exerciseCategoria').value;
        const grupoMuscular = document.getElementById('exerciseGrupoMuscular').value;
        const equipamiento = document.getElementById('exerciseEquipamiento').value;
        const videoUrl = document.getElementById('exerciseVideoUrl').value;
        const imagenUrl = document.getElementById('exerciseImagenUrl').value;
        const instrucciones = document.getElementById('exerciseInstrucciones').value;
        const body = { nombre, categoria };
        if (descripcion) body.descripcion = descripcion;
        if (grupoMuscular) body.grupoMuscular = grupoMuscular;
        if (equipamiento) body.equipamiento = equipamiento;
        if (videoUrl) body.videoUrl = videoUrl;
        if (imagenUrl) body.imagenUrl = imagenUrl;
        if (instrucciones) body.instrucciones = instrucciones;
        const result = await makeRequest('/exercises/create', 'POST', body);
        showResponse('createExerciseResponse', result);
    };
}

async function getAllExercises() {
    showLoading('getAllExercisesResponse');
    const result = await makeRequest('/exercises', 'GET');
    showResponse('getAllExercisesResponse', result);
}

async function getExerciseById() {
    const exerciseId = document.getElementById('getExerciseId').value.trim();
    if (!exerciseId) {
        showResponse('getExerciseByIdResponse', { success: false, data: { message: 'exerciseId es requerido' } });
        return;
    }
    showLoading('getExerciseByIdResponse');
    const result = await makeRequest(`/exercises/${exerciseId}`, 'GET');
    showResponse('getExerciseByIdResponse', result);
}

// ==================== RUTINAS ====================

async function createRoutine() {
    showLoading('createRoutineResponse');
    try {
        const body = JSON.parse(document.getElementById('createRoutineBody').value);
        const result = await makeRequest('/routines/create', 'POST', body);
        showResponse('createRoutineResponse', result);
    } catch (error) {
        showResponse('createRoutineResponse', { success: false, data: { message: 'JSON inválido' } });
    }
}

async function assignRoutine() {
    const userId = document.getElementById('assignUserId').value.trim();
    const routineId = document.getElementById('assignRoutineId').value.trim();
    
    if (!userId || !routineId) {
        showResponse('assignRoutineResponse', { 
            success: false, 
            data: { message: 'userId y routineId son requeridos' } 
        });
        return;
    }
    
    showLoading('assignRoutineResponse');
    const result = await makeRequest('/routines/assign', 'POST', { userId, routineId });
    showResponse('assignRoutineResponse', result);
}

async function getUserRoutine() {
    const userId = document.getElementById('getUserRoutineId').value.trim();
    
    if (!userId) {
        showResponse('getUserRoutineResponse', { success: false, data: { message: 'userId es requerido' } });
        return;
    }
    
    showLoading('getUserRoutineResponse');
    const result = await makeRequest(`/routines/user/${userId}`, 'GET');
    showResponse('getUserRoutineResponse', result);
}

async function getRoutineById() {
    const routineId = document.getElementById('getRoutineId').value.trim();
    if (!routineId) {
        showResponse('getRoutineByIdResponse', { success: false, data: { message: 'routineId es requerido' } });
        return;
    }
    showLoading('getRoutineByIdResponse');
    const result = await makeRequest(`/routines/${routineId}`, 'GET');
    showResponse('getRoutineByIdResponse', result);
}

// ==================== PROGRESO ====================

async function logProgress() {
    const userId = document.getElementById('progressUserId').value.trim();
    
    if (!userId) {
        showResponse('logProgressResponse', { success: false, data: { message: 'userId es requerido' } });
        return;
    }
    
    showLoading('logProgressResponse');
    
    try {
        const body = JSON.parse(document.getElementById('logProgressBody').value);
        const result = await makeRequest(`/routines/user/${userId}/progress`, 'POST', body);
        showResponse('logProgressResponse', result);
    } catch (error) {
        showResponse('logProgressResponse', { success: false, data: { message: 'JSON inválido' } });
    }
}

// ==================== RACHAS ====================

async function checkIn() {
    const userId = document.getElementById('checkinUserId').value.trim();
    const classId = document.getElementById('checkinClassId').value.trim();
    
    if (!userId || !classId) {
        showResponse('checkInResponse', { 
            success: false, 
            data: { message: 'userId y classId son requeridos' } 
        });
        return;
    }
    
    showLoading('checkInResponse');
    const result = await makeRequest('/streaks/check-in', 'POST', { userId, classId });
    showResponse('checkInResponse', result);
}

async function getStreak() {
    const userId = document.getElementById('streakUserId').value.trim();
    
    if (!userId) {
        showResponse('getStreakResponse', { success: false, data: { message: 'userId es requerido' } });
        return;
    }
    
    showLoading('getStreakResponse');
    const result = await makeRequest(`/streaks/streak/${userId}`, 'GET');
    showResponse('getStreakResponse', result);
}

async function getHistory() {
    const userId = document.getElementById('historyUserId').value.trim();
    
    if (!userId) {
        showResponse('getHistoryResponse', { success: false, data: { message: 'userId es requerido' } });
        return;
    }
    
    showLoading('getHistoryResponse');
    const result = await makeRequest(`/streaks/history?userId=${userId}`, 'GET');
    showResponse('getHistoryResponse', result);
}

// ==================== INSCRIPCIONES ====================

async function createRegistration() {
    showLoading('createRegistrationResponse');
    try {
        const body = JSON.parse(document.getElementById('createRegistrationBody').value);
        const result = await makeRequest('/registrations', 'POST', body);
        showResponse('createRegistrationResponse', result);
    } catch (error) {
        showResponse('createRegistrationResponse', { success: false, data: { message: 'JSON inválido' } });
    }
}

async function getUserRegistrations() {
    const userId = document.getElementById('getRegistrationsUserId').value.trim();
    
    if (!userId) {
        showResponse('getUserRegistrationsResponse', { success: false, data: { message: 'userId es requerido' } });
        return;
    }
    
    showLoading('getUserRegistrationsResponse');
    const result = await makeRequest(`/registrations?userId=${userId}`, 'GET');
    showResponse('getUserRegistrationsResponse', result);
}

async function getRegistrationHistory() {
    const userId = document.getElementById('getRegistrationHistoryUserId').value.trim();
    
    if (!userId) {
        showResponse('getRegistrationHistoryResponse', { success: false, data: { message: 'userId es requerido' } });
        return;
    }
    
    showLoading('getRegistrationHistoryResponse');
    const result = await makeRequest(`/registrations/history?userId=${userId}`, 'GET');
    showResponse('getRegistrationHistoryResponse', result);
}

async function cancelRegistration() {
    const registrationId = document.getElementById('cancelRegistrationId').value.trim();
    
    if (!registrationId) {
        showResponse('cancelRegistrationResponse', { success: false, data: { message: 'registrationId es requerido' } });
        return;
    }
    
    showLoading('cancelRegistrationResponse');
    const result = await makeRequest(`/registrations/${registrationId}/cancel`, 'POST');
    showResponse('cancelRegistrationResponse', result);
}

// ==================== PAGOS ====================

async function processPayment() {
    showLoading('processPaymentResponse');
    try {
        const body = JSON.parse(document.getElementById('processPaymentBody').value);
        const result = await makeRequest('/payments/process', 'POST', body);
        showResponse('processPaymentResponse', result);
    } catch (error) {
        showResponse('processPaymentResponse', { success: false, data: { message: 'JSON inválido' } });
    }
}

async function getPaymentStatus() {
    const userId = document.getElementById('paymentStatusUserId').value.trim();
    
    if (!userId) {
        showResponse('getPaymentStatusResponse', { success: false, data: { message: 'userId es requerido' } });
        return;
    }
    
    showLoading('getPaymentStatusResponse');
    const result = await makeRequest(`/payments/status/${userId}`, 'GET');
    showResponse('getPaymentStatusResponse', result);
}

async function getPaymentHistory() {
    const userId = document.getElementById('paymentHistoryUserId').value.trim();
    
    if (!userId) {
        showResponse('getPaymentHistoryResponse', { success: false, data: { message: 'userId es requerido' } });
        return;
    }
    
    showLoading('getPaymentHistoryResponse');
    const result = await makeRequest(`/payments/history/${userId}`, 'GET');
    showResponse('getPaymentHistoryResponse', result);
}

// ==================== FINANZAS ====================

async function getFinanceSettings() {
    showLoading('getFinanceSettingsResponse');
    const result = await makeRequest('/finance/settings', 'GET');
    showResponse('getFinanceSettingsResponse', result);
}

async function updateFinanceSettings() {
    showLoading('updateFinanceSettingsResponse');
    try {
        const body = JSON.parse(document.getElementById('updateFinanceSettingsBody').value);
        const result = await makeRequest('/finance/settings', 'PUT', body);
        showResponse('updateFinanceSettingsResponse', result);
    } catch (error) {
        showResponse('updateFinanceSettingsResponse', { success: false, data: { message: 'JSON inválido' } });
    }
}

async function getFinanceDashboard() {
    showLoading('getFinanceDashboardResponse');
    const result = await makeRequest('/finance/dashboard', 'GET');
    showResponse('getFinanceDashboardResponse', result);
}

async function getDebtors() {
    showLoading('getDebtorsResponse');
    const result = await makeRequest('/finance/debtors', 'GET');
    showResponse('getDebtorsResponse', result);
}
