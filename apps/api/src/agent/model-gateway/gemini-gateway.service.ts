import { Injectable, Logger } from '@nestjs/common';
import {
  IModelGateway,
  ModelGatewayResponse,
  StructuredPlanOutput,
} from './model-gateway.interface';

@Injectable()
export class GeminiGatewayService implements IModelGateway {
  readonly providerName = 'gemini';
  private readonly logger = new Logger(GeminiGatewayService.name);
  private readonly apiKey: string;
  private readonly modelName: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<ModelGatewayResponse> {
    if (this.apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: this.apiKey });
        const response = await ai.models.generateContent({
          model: this.modelName,
          contents: `${systemPrompt ? systemPrompt + '\n\n' : ''}${prompt}`,
        });

        return {
          text: response.text || '',
          model: this.modelName,
        };
      } catch (err) {
        this.logger.error(`Gemini generateText error: ${err}`);
      }
    }

    // Deterministic fallback for dev mode without API key
    return {
      text: `Adaptive Planner [Dev Mode Response]: Synthesized response for prompt: "${prompt.slice(0, 80)}"`,
      model: `${this.modelName}-dev-simulation`,
    };
  }

  async generateStructuredPlan(
    goalIntent: string,
    contextSummary: string,
    availableTools: string[],
  ): Promise<StructuredPlanOutput> {
    if (this.apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: this.apiKey });

        const prompt = `
You are the AI Planner engine for Adaptive Planner.
Decompose the following goal intent into a psychologically safe, realistic, 3-step action plan.
Goal Intent: "${goalIntent}"
Context: "${contextSummary}"
Available Tools: [${availableTools.join(', ')}]

Return ONLY a valid JSON object matching this schema:
{
  "intent": string,
  "assumptions": string[],
  "tradeOffs": string[],
  "steps": [
    {
      "stepNumber": number,
      "title": string,
      "description": string,
      "estimatedMinutes": number,
      "targetToolName": string (or null),
      "riskLevel": "READ_ONLY" | "LOW_RISK_INTERNAL_WRITE" | "EXTERNAL_WRITE" | "SENSITIVE_ACTION"
    }
  ]
}
`;

        const response = await ai.models.generateContent({
          model: this.modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text) as StructuredPlanOutput;
          return parsed;
        }
      } catch (err) {
        this.logger.warn(`Gemini structured plan failed, using deterministic planner: ${err}`);
      }
    }

    // High-quality deterministic fallback conforming to Adaptive Planner guidelines
    return {
      intent: goalIntent,
      assumptions: [
        'User has 45-60 minutes daily capacity for focused execution',
        'Built-in 15% cognitive decompression buffer applied between steps',
      ],
      tradeOffs: [
        'Prioritizes early architectural validation over premature UI polish',
      ],
      steps: [
        {
          stepNumber: 1,
          title: 'Establish foundational requirements & constraints',
          description: `Analyze scope and define criteria for "${goalIntent}"`,
          estimatedMinutes: 30,
          targetToolName: undefined,
          riskLevel: 'LOW_RISK_INTERNAL_WRITE',
        },
        {
          stepNumber: 2,
          title: 'Check calendar availability for deep-work block',
          description: 'Query Google Calendar for free slots before scheduling',
          estimatedMinutes: 15,
          targetToolName: availableTools.includes('google_calendar_list_events')
            ? 'google_calendar_list_events'
            : undefined,
          riskLevel: 'READ_ONLY',
        },
        {
          stepNumber: 3,
          title: 'Execute milestone tasks and track progress',
          description: 'Complete core milestone tasks and verify completion',
          estimatedMinutes: 45,
          targetToolName: undefined,
          riskLevel: 'LOW_RISK_INTERNAL_WRITE',
        },
      ],
    };
  }
}
