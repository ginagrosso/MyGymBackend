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

async function login() {
    showLoading('loginResponse');
    try {
        const body = JSON.parse(document.getElementById('loginBody').value);
        const result = await makeRequest('/auth/auth/login', 'POST', body);
        showResponse('loginResponse', result);
    } catch (error) {
        showResponse('loginResponse', { success: false, data: { message: 'JSON inválido' } });
    }
}

async function forgotPassword() {
    showLoading('forgotPasswordResponse');
    try {
        const body = JSON.parse(document.getElementById('forgotPasswordBody').value);
        const result = await makeRequest('/auth/auth/forgot-password', 'POST', body);
        showResponse('forgotPasswordResponse', result);
    } catch (error) {
        showResponse('forgotPasswordResponse', { success: false, data: { message: 'JSON inválido' } });
    }
}

// ==================== USUARIOS ====================

async function createUser() {
    showLoading('createUserResponse');
    try {
        const body = JSON.parse(document.getElementById('createUserBody').value);
        const result = await makeRequest('/users/auth/register/client', 'POST', body);
        showResponse('createUserResponse', result);
    } catch (error) {
        showResponse('createUserResponse', { success: false, data: { message: 'JSON inválido' } });
    }
}

// ==================== GIMNASIOS ====================

async function registerGym() {
    showLoading('registerGymResponse');
    try {
        const body = JSON.parse(document.getElementById('registerGymBody').value);
        const result = await makeRequest('/gyms/auth/register/gym', 'POST', body);
        showResponse('registerGymResponse', result);
    } catch (error) {
        showResponse('registerGymResponse', { success: false, data: { message: 'JSON inválido' } });
    }
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

async function createExercise() {
    showLoading('createExerciseResponse');
    try {
        const body = JSON.parse(document.getElementById('createExerciseBody').value);
        const result = await makeRequest('/exercises/create', 'POST', body);
        showResponse('createExerciseResponse', result);
    } catch (error) {
        showResponse('createExerciseResponse', { success: false, data: { message: 'JSON inválido' } });
    }
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
