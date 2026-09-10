const OpenAI = require('openai');
const config = require('../config/env');

let openaiClient = null;
function getClient() {
  const apiKey = (config.OPENAI_API_KEY || '').trim();
  if (!apiKey) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey, maxRetries: 0, timeout: 2000 });
  }
  return openaiClient;
}

class AIProvider {
  /**
   * Returns true only if a non-empty OPENAI_API_KEY is configured.
   */
  static isConfigured() {
    const key = (config.OPENAI_API_KEY || '').trim();
    return key.length > 0;
  }

  /**
   * Throws explicit error if OPENAI_API_KEY is missing.
   */
  static ensureConfigured() {
    if (!this.isConfigured()) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
  }

  /**
   * Returns human-readable provider name or configuration warning.
   */
  static getProviderName() {
    return this.isConfigured()
      ? `OpenAI (${config.OPENAI_MODEL || 'gpt-4o-mini'})`
      : 'OPENAI_API_KEY is not configured';
  }

  /**
   * Real OpenAI Call: Structured JSON Generation
   */
  static async generateJSON({ systemPrompt = '', userPrompt = '', temperature = 0.2, maxTokens = 2000 }) {
    this.ensureConfigured();
    const client = getClient();
    if (!client) throw new Error('OPENAI_API_KEY is not configured');

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({
      role: 'user',
      content: userPrompt + '\n\nIMPORTANT: Return ONLY valid, parseable JSON. Do not include markdown code fence formatting outside the JSON object.'
    });

    const completion = await client.chat.completions.create({
      model: config.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
      temperature,
      max_tokens: maxTokens
    });

    const rawContent = completion.choices?.[0]?.message?.content || '{}';
    try {
      return JSON.parse(rawContent);
    } catch (e) {
      // Clean possible wrapper if any
      const cleaned = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    }
  }

  /**
   * Real OpenAI Call: Text Generation
   */
  static async generateText({ systemPrompt = '', userPrompt = '', temperature = 0.3, maxTokens = 2000 }) {
    this.ensureConfigured();
    const client = getClient();
    if (!client) throw new Error('OPENAI_API_KEY is not configured');

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userPrompt });

    const completion = await client.chat.completions.create({
      model: config.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature,
      max_tokens: maxTokens
    });

    return completion.choices?.[0]?.message?.content || '';
  }

  /**
   * Real OpenAI Call: Multi-turn Chat Completion
   */
  static async chatCompletion({ messages = [], temperature = 0.4, maxTokens = 1500 }) {
    this.ensureConfigured();
    const client = getClient();
    if (!client) throw new Error('OPENAI_API_KEY is not configured');

    const completion = await client.chat.completions.create({
      model: config.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature,
      max_tokens: maxTokens
    });

    return completion.choices?.[0]?.message?.content || '';
  }

  /**
   * Universal wrapper for legacy callers
   */
  static async generateContent(prompt) {
    return this.generateText({ userPrompt: prompt });
  }
}

module.exports = AIProvider;
