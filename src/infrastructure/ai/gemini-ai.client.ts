import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAiClient } from '@/domain/proposals/proposal.types';

export class GeminiAiClient implements IAiClient {
  private readonly client: GoogleGenerativeAI;
  private readonly modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    const key =
      apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!key) {
      throw new Error(
        'Falta la variable de entorno GEMINI_API_KEY o GOOGLE_API_KEY. Configúrala en tu archivo .env para habilitar el motor de IA.'
      );
    }

    this.client = new GoogleGenerativeAI(key);
    this.modelName = modelName || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }

  async generateStructuredContent<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const model = this.client.getGenerativeModel({
      model: this.modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const result = await model.generateContent(userPrompt);
    const responseText = result.response.text();

    try {
      return JSON.parse(responseText) as T;
    } catch (parseError: any) {
      // Si el texto incluye delimitadores markdown a pesar del mimeType
      const cleaned = responseText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*$/gi, '')
        .trim();
      return JSON.parse(cleaned) as T;
    }
  }
}
