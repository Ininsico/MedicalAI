



let envUrl = process.env.NEXT_PUBLIC_API_URL || '';
envUrl = envUrl.replace(/\/$/, '');
if (envUrl && !envUrl.endsWith('/api')) {
    envUrl += '/api';
}
const API_URL = envUrl;

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function request<T>(endpoint: string, method: RequestMethod = 'GET', body?: any): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

export const api = {
    auth: {
        login: (credentials: any) => request<any>('/auth/login', 'POST', credentials),
        register: (data: any) => request<any>('/auth/register', 'POST', data),
        getProfile: () => request<any>('/auth/profile', 'GET'),
    },
    patient: {
        createLog: (patientId: string, logData: any) => request<any>(`/patients/${patientId}/logs`, 'POST', logData),
        getLogs: (patientId: string) => request<any>(`/patients/${patientId}/logs`, 'GET'),
        getCaregivers: (patientId: string) => request<any>(`/patients/${patientId}/caregivers`, 'GET'),
    },
    caregiver: {
        getDashboard: () => request<any>('/caregiver/dashboard', 'GET'),
        getPatients: () => request<any>('/caregiver/patients', 'GET'),
        getPatientLogs: (patientId: string) => request<any>(`/caregiver/patients/${patientId}/logs`, 'GET'),
        getPatientDetails: (patientId: string) => request<any>(`/caregiver/patients/${patientId}`, 'GET'),
        generateReport: (patientId: string) => request<any>(`/caregiver/patients/${patientId}/report`, 'GET'),
    },

    notifications: {
        getAll: () => request<any>('/notifications', 'GET'),
        markRead: (id: string) => request<any>(`/notifications/${id}/read`, 'PUT'),
        markAllRead: () => request<any>('/notifications/read-all', 'PUT'),
    },
    admin: {
        getPatients: () => request<any>('/admin/patients', 'GET'),
        getPatientDetails: (id: string) => request<any>(`/admin/patients/${id}`, 'GET'),
        getCaregivers: () => request<any>('/admin/caregivers', 'GET'),
        createCaregiver: (data: any) => request<any>('/admin/caregivers', 'POST', data),
        assignCaregiver: (data: { patient_id: string, caregiver_id: string, assignment_notes?: string }) =>
            request<any>('/admin/assign-caregiver', 'POST', data),
        getAssignments: () => request<any>('/admin/assignments', 'GET'),
        getAuditLogs: () => request<any>('/admin/audit-logs', 'GET'),
        getSystemHealth: () => request<any>('/admin/system/health', 'GET'),
    }
};
