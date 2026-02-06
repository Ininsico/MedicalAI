export interface SymptomLog {
    id?: string;
    user_id: string;
    tremor: number;
    stiffness: number;
    balance: number;
    sleep: number;
    mood: number;
    medication_adherence: string;
    side_effects: string[];
    other_notes?: string;
    logged_at?: string;
}

export interface Profile {
    id: string;
    full_name: string;
    role: 'patient' | 'caregiver' | 'admin';
    updated_at?: string;
}
