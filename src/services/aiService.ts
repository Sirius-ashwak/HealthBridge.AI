import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';

// Initialize the Gemini AI model
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export async function analyzeSymptoms(symptoms: string): Promise<string> {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });

    const prompt = `As a medical AI assistant, analyze the following symptoms and provide a detailed response:
    ${symptoms}
    
    Please include:
    1. Possible conditions or diseases
    2. Severity assessment
    3. Recommended next steps
    4. Whether immediate medical attention is needed
    
    Note: This is for informational purposes only. Always consult a healthcare professional for proper diagnosis and treatment.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('No response received from AI model');
    }
    
    return text;
  } catch (error) {
    console.error('Error analyzing symptoms:', error);
    if (error instanceof Error) {
      return `I apologize, but I encountered an error while analyzing your symptoms: ${error.message}. Please try again or consult a healthcare professional.`;
    }
    return 'I apologize, but I encountered an error while analyzing your symptoms. Please try again or consult a healthcare professional.';
  }
} 