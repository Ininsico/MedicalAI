import { Request, Response } from 'express';
import { supabase } from '../lib/supabaseClient';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

/**
 * @swagger
 * /api/ai/patient-summary:
 *   post:
 *     summary: Generate a structured AI summary of patient health logs
 *     tags: [AI & Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *             properties:
 *               patientId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Professional AI-generated Markdown summary
 *       400:
 *         description: Missing patientId or no logs found in range
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error or AI API failure
 */
export const generatePatientSummary = async (req: Request, res: Response) => {
    try {
        const { patientId, startDate, endDate } = req.body;

        if (!patientId) {
            return res.status(400).json({ error: 'Patient ID is required' });
        }

        // Fetch patient details
        const { data: patient, error: patientError } = await supabase
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .single();

        if (patientError || !patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Fetch daily logs
        let query = supabase
            .from('daily_logs')
            .select('*')
            .eq('patient_id', patientId)
            .order('date', { ascending: true });

        if (startDate) {
            query = query.gte('date', startDate);
        }
        if (endDate) {
            query = query.lte('date', endDate);
        }

        const { data: logs, error: logsError } = await query;

        if (logsError) {
            return res.status(500).json({ error: 'Error fetching logs' });
        }

        if (!logs || logs.length === 0) {
            return res.status(400).json({ error: 'No logs found for this patient in the specified date range' });
        }

        // Aggregate Data
        const moodScores: { [key: string]: number } = {
            'excellent': 5,
            'good': 4,
            'neutral': 3,
            'poor': 2,
            'bad': 1
        };

        let totalTremor = 0;
        let totalStiffness = 0;
        let totalSleep = 0;
        let totalMood = 0;
        let moodCount = 0;
        let missedMeds = 0;
        const sideEffects: any[] = [];
        const symptomsCount: Record<string, number> = {};

        logs.forEach(log => {
            totalTremor += log.tremor_severity || 0;
            totalStiffness += log.stiffness_severity || 0;
            totalSleep += Number(log.sleep_hours) || 0;

            if (log.mood && moodScores[log.mood]) {
                totalMood += moodScores[log.mood];
                moodCount++;
            }

            if (log.medication_taken === false) {
                missedMeds++;
            }

            // Check for side effects/symptoms
            if (log.symptoms && Array.isArray(log.symptoms)) {
                log.symptoms.forEach((symptom: string) => {
                    symptomsCount[symptom] = (symptomsCount[symptom] || 0) + 1;
                });
                if (log.symptoms.length > 0) {
                    sideEffects.push({ date: log.date, symptoms: log.symptoms, notes: log.medication_notes });
                }
            }
        });

        const avgTremor = (totalTremor / logs.length).toFixed(1);
        const avgStiffness = (totalStiffness / logs.length).toFixed(1);
        const avgSleep = (totalSleep / logs.length).toFixed(1);
        const avgMood = moodCount > 0 ? (totalMood / moodCount).toFixed(1) : 'N/A';

        const prompt = `
        You are an advanced medical AI assistant for the ParkiTrack system (Parkinson's Disease tracking).
        Generate a highly structured, professional, and insightful summary report for a patient.
        
        **Patient Context:**
        - Name: ${patient.full_name}
        - Age/DOB: ${patient.date_of_birth}
        - Medical History: ${patient.medical_history || 'N/A'}
        - Current Medications: ${patient.current_medications?.join(', ') || 'N/A'}

        **Report Period:**
        - Date Range: ${startDate || 'Start'} to ${endDate || 'End'}
        - Total Check-ins: ${logs.length}
        
        **Quantitative Metrics (Period Averages):**
        - Tremor Severity (0-10): ${avgTremor}
        - Muscle Stiffness (0-10): ${avgStiffness}
        - Sleep Quality (Hours/Night): ${avgSleep}
        - Average Mood Score (1-5): ${avgMood}
        - Medication Adherence: Missed ${missedMeds} days out of ${logs.length}

        **Symptom Analysis:**
        - Most Frequent Symptoms: ${Object.entries(symptomsCount).map(([k, v]) => `${k} (${v})`).join(', ') || 'None reported'}
        - Specific Incident History (Side Effects): 
        ${sideEffects.length > 0 ? JSON.stringify(sideEffects.slice(0, 10), null, 2) : 'No specific side effects reported.'}
        
        **Instructions for AI Generation:**
        1. **Executive Summary**: A high-level overview of the patient's status. Is it stable, improving, or deteriorating?
        2. **Detailed Health Analysis**:
           - Analyze the correlation between medication adherence and tremor/stiffness severity.
           - Analyze sleep patterns, mood stability, and their potential impact on daily symptoms.
           - **Check for any mentions of Balance/Gait issues in the notes or symptoms.**
        3. **Medication & Side Effects**:
           - detailed report on missed medications and any specific side effects reported.
           - Which days had the worst side effects?
        4. **AI Insights & Recommendations**:
           - actionable advice for the caregiver or patient based on this data.
           - "User ID" mention is not needed in the text, but keep the tone personal to the patient/caregiver.
        
        Format the output in clean, professional Markdown. Use h2 (##) for sections, bold for emphasis, and bullet points for lists. The tone should be clinical yet accessible.
        `;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const data: any = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const text = data.choices[0]?.message?.content || "No analysis could be generated.";

        return res.json({ summary: text });

    } catch (error: any) {
        console.error("AI API Error:", error);
        return res.status(500).json({ error: error.message });
    }
};
