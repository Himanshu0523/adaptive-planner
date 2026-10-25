import { Injectable, Logger } from '@nestjs/common';
import {
  IModelGateway,
  ModelGatewayResponse,
  StructuredPlanOutput,
} from './model-gateway.interface';

@Injectable()
export class GeminiGatewayService implements IModelGateway {
  readonly providerName = 'model-gateway-cascade';
  private readonly logger = new Logger(GeminiGatewayService.name);
  private readonly geminiKey: string;
  private readonly groqKey: string;
  private readonly openRouterKey: string;
  private readonly geminiModel: string;
  private readonly groqModel: string;
  private readonly openRouterModel: string;

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY || '';
    this.groqKey = process.env.GROQ_API_KEY || '';
    this.openRouterKey = process.env.OPENROUTER_API_KEY || '';
    this.geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    this.openRouterModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.2-3b-instruct:free';
  }

  /**
   * Generates text with automatic provider failover:
   * 1. Google Gemini Flash
   * 2. Groq Cloud (Free Tier)
   * 3. OpenRouter (Free Tier)
   * 4. Deterministic simulation
   */
  async generateText(prompt: string, systemPrompt?: string): Promise<ModelGatewayResponse> {
    // 1. Primary: Google Gemini Flash
    if (this.geminiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: this.geminiKey });
        const response = await ai.models.generateContent({
          model: this.geminiModel,
          contents: `${systemPrompt ? systemPrompt + '\n\n' : ''}${prompt}`,
        });

        if (response.text) {
          return {
            text: response.text,
            model: `gemini:${this.geminiModel}`,
          };
        }
      } catch (err: any) {
        this.logger.warn(`Primary Gemini failed (rate-limit/error: ${err?.message || err}). Failing over to Groq...`);
      }
    }

    // 2. Fallback: Groq Cloud API
    if (this.groqKey) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.groqKey}`,
          },
          body: JSON.stringify({
            model: this.groqModel,
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            this.logger.log(`Successfully generated text using Groq fallback (${this.groqModel})`);
            return {
              text: content,
              model: `groq:${this.groqModel}`,
            };
          }
        } else {
          this.logger.warn(`Groq fallback failed with HTTP ${res.status}. Trying OpenRouter...`);
        }
      } catch (err: any) {
        this.logger.warn(`Groq fallback error: ${err?.message || err}. Trying OpenRouter...`);
      }
    }

    // 3. Fallback: OpenRouter Free Tier
    if (this.openRouterKey) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openRouterKey}`,
          },
          body: JSON.stringify({
            model: this.openRouterModel,
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              { role: 'user', content: prompt },
            ],
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            this.logger.log(`Successfully generated text using OpenRouter fallback (${this.openRouterModel})`);
            return {
              text: content,
              model: `openrouter:${this.openRouterModel}`,
            };
          }
        }
      } catch (err: any) {
        this.logger.warn(`OpenRouter fallback error: ${err?.message || err}`);
      }
    }

    // 4. Deterministic Simulation
    return {
      text: `Adaptive Planner [Deterministic Narrative]: Evaluated observation and schedule metrics for prompt: "${prompt.slice(0, 80)}"`,
      model: 'deterministic-simulation',
    };
  }

  /**
   * Generates structured 3-step action plans with multi-tier failover
   */
  async generateStructuredPlan(
    goalIntent: string,
    contextSummary: string,
    availableTools: string[],
  ): Promise<StructuredPlanOutput> {
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

    // 1. Primary: Google Gemini Flash
    if (this.geminiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: this.geminiKey });

        const response = await ai.models.generateContent({
          model: this.geminiModel,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          return JSON.parse(response.text) as StructuredPlanOutput;
        }
      } catch (err: any) {
        this.logger.warn(`Primary Gemini structured plan failed (${err?.message || err}). Trying Groq...`);
      }
    }

    // 2. Fallback: Groq Cloud
    if (this.groqKey) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.groqKey}`,
          },
          body: JSON.stringify({
            model: this.groqModel,
            messages: [
              { role: 'system', content: 'Respond with valid JSON matching the exact schema provided.' },
              { role: 'user', content: prompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            this.logger.log('Successfully generated structured plan via Groq');
            return JSON.parse(content) as StructuredPlanOutput;
          }
        }
      } catch (err: any) {
        this.logger.warn(`Groq structured plan fallback failed: ${err?.message || err}`);
      }
    }

    // 3. Fallback: High-quality deterministic planner conforming to Adaptive Planner guidelines
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
          description: 'Query calendar for free slots before scheduling',
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
