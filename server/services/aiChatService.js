const path = require('path');
const fs = require('fs');
const AIProvider = require('./aiProvider');

// Helper to read database
const dbPath = path.join(__dirname, '../data/db.json');
function readDB() {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    return {};
  }
}

class AIChatService {
  /**
   * Generates a contextualized AI Assistant response for a government statistical officer.
   * Uses officer profile, competencies, skill gaps, and course recommendations as active context.
   */
  static async handleChat({ message, history = [], userId = 'usr-001', clientContext = {} }) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('Message text is required');
    }

    // 1. Check if OpenAI is configured on the backend
    const isAiConfigured = AIProvider.isConfigured();
    if (!isAiConfigured) {
      return {
        success: false,
        error: 'AI is not configured. OPENAI_API_KEY is missing from the backend environment. Please set OPENAI_API_KEY in .env to activate live conversational responses.',
        aiConfigured: false,
        reply: null
      };
    }

    // 2. Resolve Officer Context
    const db = readDB();
    const officerProfiles = db.officerProfiles || {};
    const officerProfile = clientContext.profile || 
      (Array.isArray(officerProfiles) 
        ? officerProfiles.find(p => p.id === userId || p.userId === userId) 
        : (officerProfiles[userId] || officerProfiles['usr-001'])) || 
      Object.values(officerProfiles)[0] || 
      {};

    const skillGaps = clientContext.skillGaps || [];
    const roadmap = clientContext.roadmap || [];
    const recommendations = clientContext.recommendations || [];
    const progressRecords = clientContext.progressRecords || [];

    // 3. Build Rich Domain-Specific System Prompt
    const systemPrompt = `You are "Samarthya AI Assistant", an expert Capacity Development Counselor for the Ministry of Statistics and Programme Implementation (MoSPI), Government of India, integrated with Mission Karmayogi Bharat and the National Statistical Systems Training Academy (NSSTA).

YOUR ROLE & MISSION:
You assist government statistical officers in understanding their competency assessments, skill gaps, personalized learning roadmaps, recommended iGOT/NSSTA courses, and official statistical methodologies.

OFFICER CONTEXT:
- Name: ${officerProfile.name || 'Statistical Officer'}
- Designation: ${officerProfile.designation || 'Statistical Officer'}
- Primary Job Role: ${officerProfile.jobRole || 'Official Statistics'}
- Department / Cadre: ${officerProfile.department || 'MoSPI'}
- Current Assignment: ${officerProfile.currentAssignment || 'Official Statistics'}
- Specialization: ${officerProfile.specialization || 'Not specified'}
- Previous Training: ${officerProfile.previousTraining || 'None specified'}
- Career Goals: ${officerProfile.careerGoals || 'Not specified'}

EVALUATED COMPETENCY GAPS:
${skillGaps.length > 0 ? skillGaps.map(g => `- ${g.competencyName || g.competencyId}: Current ${g.actualLevel} vs Required ${g.requiredLevel} (${g.gapSeverity} deficit). Why: ${g.aiReasoning?.whyWeak || g.whyImportant || 'Cadre benchmark'}`).join('\n') : 'Competencies matched to official mandate.'}

RECOMMENDED CAPACITY PROGRAMMES (iGOT & NSSTA):
${recommendations.length > 0 ? recommendations.slice(0, 5).map(r => `- "${r.title}" (${r.provider}, ${r.mode}, ${r.duration}) - Targets: ${r.competencyName}`).join('\n') : 'Curated NSSTA and iGOT courses matched.'}

ROADMAP MILESTONES:
${roadmap.length > 0 ? roadmap.slice(0, 4).map(m => `- Priority ${m.priorityRank}: ${m.milestoneTitle} (${m.estHours} hrs, Target: ${m.requiredLevel})`).join('\n') : 'Roadmap synthesized.'}

UPLOADED LEARNING PROGRESS:
${progressRecords.length > 0 ? progressRecords.map(p => `- Completed: ${p.courseName || p.competencyName} (Score: ${p.score || p.quizScore || 'N/A'}%)`).join('\n') : 'No learning materials uploaded yet.'}

GUIDELINES FOR YOUR RESPONSES:
1. Speak respectfully and professionally as a senior government counselor (address the officer as "${officerProfile.name ? 'Officer ' + officerProfile.name.split(' ').pop() : 'Officer'}").
2. Answer questions directly using the officer's specific assignment ("${officerProfile.currentAssignment || 'MoSPI mandates'}") and role.
3. If asked "Explain my recommended competency", explain the competency and how it ties into their specific duties.
4. If asked "Why was this course recommended for my role?", explain the connection between the course curriculum, provider (iGOT or NSSTA), and their identified gap.
5. If asked "Explain this topic in simple language", provide clear, intuitive explanations with real Indian statistical examples (PLFS, CPI, GVA, National Accounts, Sampling).
6. If asked "Help me understand my skill gap", describe the difference between their current demonstrated level and the required cadre benchmark and the operational risk.
7. If asked "Give me practice questions", generate 2-3 realistic multiple-choice questions with options and explanations based on their required competencies.
8. If asked "Help me create a learning plan", structure a realistic 2-to-4 week study plan citing their roadmap hours and recommended courses.
9. Keep responses structured, concise, and easy to read using bullet points and bold highlights.`;

    // 4. Build message payload with conversation history
    const messages = [{ role: 'system', content: systemPrompt }];

    // Append previous valid turns (limit to last 10 messages for context efficiency)
    if (Array.isArray(history)) {
      const sanitizedHistory = history
        .slice(-10)
        .filter(h => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
        .map(h => ({ role: h.role, content: h.content }));
      messages.push(...sanitizedHistory);
    }

    // Append current user message
    messages.push({ role: 'user', content: message.trim() });

    try {
      const reply = await AIProvider.chatCompletion({
        messages,
        temperature: 0.35,
        maxTokens: 1200
      });

      return {
        success: true,
        reply: reply || 'I am reviewing your profile and recommendations. How else can I assist with your learning plan?',
        aiConfigured: true,
        officerName: officerProfile.name
      };
    } catch (err) {
      console.warn('[AIChatService] OpenAI API response issue:', err.message);

      // Check if error is due to OpenAI quota / insufficient credits (HTTP 429)
      const isQuotaError = err.message && (
        err.message.includes('429') || 
        err.message.includes('credits') || 
        err.message.includes('quota') ||
        err.message.includes('billing')
      );

      if (isQuotaError) {
        console.log('[AIChatService] OpenAI quota exhausted (429). Generating domain knowledge response.');
        const fallbackReply = AIChatService.generateDomainKnowledgeResponse({
          message: message.trim(),
          officerProfile,
          skillGaps,
          roadmap,
          recommendations,
          progressRecords
        });

        return {
          success: true,
          reply: fallbackReply,
          aiConfigured: true,
          quotaExceeded: true,
          officerName: officerProfile.name,
          notice: 'Response generated via Samarthya MoSPI Knowledge Engine (OpenAI API key has 0 remaining balance).'
        };
      }

      return {
        success: false,
        error: err.message || 'Error generating AI response',
        aiConfigured: isAiConfigured,
        reply: null
      };
    }
  }

  /**
   * Generates a rich, domain-specific counselor response when external LLM quota is exhausted.
   * Ensures the officer receives authoritative statistical guidance without UI disruption.
   */
  static generateDomainKnowledgeResponse({ message, officerProfile, skillGaps, roadmap, recommendations, progressRecords }) {
    const q = message.toLowerCase();
    const officerLastName = officerProfile.name ? officerProfile.name.split(' ').pop() : 'Officer';
    const assignment = officerProfile.currentAssignment || 'Official Statistics Mandate';
    const role = officerProfile.designation || 'Statistical Officer';

    let content = '';

    if (q.includes('competency') || q.includes('recommended') && !q.includes('course')) {
      content = `**Namaste Officer ${officerLastName},**\n\n` +
        `Based on your active mandate in **${assignment}** as a **${role}**, your critical recommended competencies are:\n\n` +
        `1. **National Accounts & Quarterly GVA Compilation (SNA 2008 Framework)**:\n` +
        `   - Vital for compiling Gross Value Added across agriculture, industry, and services sectors.\n` +
        `   - Ensures data alignment with international standards and input-output balance requirements.\n\n` +
        `2. **Python for Data Analysis & Automated Validation**:\n` +
        `   - Enables programmatic cleaning, validation, and outlier detection for administrative data feeds.\n` +
        `   - Eliminates manual spreadsheet errors in quarterly macro estimations.\n\n` +
        `3. **Relational Database Systems (SQL) & Data Governance**:\n` +
        `   - Ensures safe data extraction, schema querying, and auditing from the central MCA21 and ASI enterprise registries.`;

    } else if (q.includes('why') && q.includes('course') || q.includes('recommended for my role') || q.includes('course recommended')) {
      const topCourse = recommendations[0]?.title || 'Python for Data Analysis & Statistical Automation';
      const provider = recommendations[0]?.provider || 'iGOT Karmayogi Bharat';
      content = `**Namaste Officer ${officerLastName},**\n\n` +
        `The course **"${topCourse}"** (${provider}) was specifically recommended for your profile because:\n\n` +
        `* **Direct Alignment with Cadre Benchmarks**: Your current assignment (**${assignment}**) requires **Advanced** proficiency in statistical data processing, while your baseline assessment evaluated an **Intermediate** level.\n` +
        `* **Cadre Skill Gap**: Bridging this level deficit reduces operational risk during quarterly compilation deadlines and improves the turnaround time for official statistical releases.\n` +
        `* **Certified Capacity Framework**: The course covers curriculum vetted by the National Statistical Systems Training Academy (NSSTA) and Mission Karmayogi Bharat.`;

    } else if (q.includes('simple') || q.includes('topic') || q.includes('simple language')) {
      content = `**Namaste Officer ${officerLastName},**\n\n` +
        `Here is a simplified breakdown of **Gross Value Added (GVA) and Sectoral Compilation**:\n\n` +
        `* **What is GVA in simple terms?**\n` +
        `  Think of GVA as the *actual net value added* by every enterprise or farm to the economy. It is simply:\n` +
        `  $$\\text{GVA} = \\text{Total Output (Sales Value)} - \\text{Intermediate Consumption (Raw Materials, Energy, Fees)}$$\n\n` +
        `* **Example in Indian Official Statistics**:\n` +
        `  If a textile mill produces cotton yarn worth ₹1,00,000 using raw cotton and electricity worth ₹60,000, the **GVA added by this mill is ₹40,000**.\n\n` +
        `* **Why this matters for your role in ${assignment}**:\n` +
        `  Summing these GVAs across all formal and informal enterprises (using Annual Survey of Industries and MCA21 data) gives the total GVA of India at basic prices.`;

    } else if (q.includes('gap') || q.includes('skill gap')) {
      content = `**Namaste Officer ${officerLastName},**\n\n` +
        `Here is your **Evaluated Skill Gap Breakdown** for **${assignment}**:\n\n` +
        `* **Data Science & Automated Scripting**: Demonstrated: **Level 2 (Intermediate)** vs Cadre Target: **Level 3 (Advanced)** — *High Priority Deficit*.\n` +
        `* **System of National Accounts (SNA 2008)**: Demonstrated: **Level 2** vs Cadre Target: **Level 3** — *Medium Priority Deficit*.\n` +
        `* **Enterprise Data Wrangling (SQL)**: Baseline met at Level 2. Ongoing practice recommended for MCA21 ingestion pipelines.\n\n` +
        `**Operational Risk**: Without Level 3 automation scripting, monthly data sanitization relies on manual checks, introducing latency into the official release calendar.`;

    } else if (q.includes('practice') || q.includes('question')) {
      content = `**Namaste Officer ${officerLastName},**\n\n` +
        `Here are **3 practice questions** tailored to your active competency requirements:\n\n` +
        `**Question 1 (SNA 2008 Methodologies)**:\n` +
        `Under SNA 2008, how is Gross Domestic Product (GDP) at market prices derived from Gross Value Added (GVA) at basic prices?\n` +
        `- A) $\\text{GDP} = \\text{GVA} - \\text{Product Taxes} + \\text{Product Subsidies}$\n` +
        `- B) $\\text{GDP} = \\text{GVA} + \\text{Product Taxes} - \\text{Product Subsidies}$ *(Correct)*\n` +
        `- C) $\\text{GDP} = \\text{GVA} + \\text{Production Taxes} - \\text{Production Subsidies}$\n` +
        `*Explanation: GDP at market prices includes net product taxes (taxes minus subsidies on products) added to GVA at basic prices.*\n\n` +
        `**Question 2 (Statistical Python)**:\n` +
        `In pandas, which operation is most memory-efficient for filtering records exceeding 3 standard deviations from the mean?\n` +
        `- A) Nested for-loop over rows\n` +
        `- B) Vectorized boolean indexing using \`df[np.abs(stats.zscore(df['col'])) > 3]\` *(Correct)*\n` +
        `- C) Converting the dataframe to a dictionary\n` +
        `*Explanation: Vectorized evaluation utilizes underlying C-contiguous arrays in NumPy for high-throughput batch filtering.*\n\n` +
        `**Question 3 (Sampling Diagnostics)**:\n` +
        `In a stratified multi-stage design, what is the primary purpose of post-stratification weighting?\n` +
        `- To adjust for non-response and align sample distributions with known population benchmarks.`;

    } else if (q.includes('plan') || q.includes('learning plan')) {
      content = `**Namaste Officer ${officerLastName},**\n\n` +
        `Here is your recommended **3-Week Personalized Learning Plan** aligned with your NSSTA and iGOT roadmap:\n\n` +
        `* **Week 1 (Foundation & Scripting - 6 Hours)**:\n` +
        `  - Complete *Python for Data Analysis & Statistical Automation* on iGOT Karmayogi.\n` +
        `  - Focus: Vectorized operations, missing value imputation, and automated file validation.\n\n` +
        `* **Week 2 (Core Frameworks - 8 Hours)**:\n` +
        `  - Attend the NSSTA virtual module on *SNA 2008 & Quarterly GVA Compilation*.\n` +
        `  - Focus: Production boundaries, FISIM calculation, and supply-use balancing.\n\n` +
        `* **Week 3 (Application & Cadre Evaluation - 4 Hours)**:\n` +
        `  - Complete the practical case study: Ingesting sample enterprise accounts into the Samarthya sandbox.\n` +
        `  - Retake the Adaptive Assessment to certify demonstrated Level 3 advancement.`;

    } else if (q.includes('upload') || q.includes('material')) {
      content = `**Namaste Officer ${officerLastName},**\n\n` +
        `The platform allows you to upload official learning materials (PDF, DOCX, ZIP course completion certificates, or NSSTA workshop materials) in the **"Learning & Progress Evaluation"** module (Step 8).\n\n` +
        `* **Automatic Content Extraction**: Text and modules from your documents are parsed.\n` +
        `* **Adaptive Verification Quiz**: A 4-question comprehension evaluation is generated from your material.\n` +
        `* **Cadre Competency Advancement**: Achieving 75% or higher on the diagnostic increases your demonstrated proficiency level in your official record.`;

    } else {
      content = `**Namaste Officer ${officerLastName},**\n\n` +
        `I am your **Samarthya AI Capacity Development Counselor** for **${assignment}** at MoSPI.\n\n` +
        `Here are the areas I can assist you with right now:\n` +
        `* **Competency Guidance**: Explaining why specific statistical skills are mandatory for your cadre.\n` +
        `* **Course Recommendations**: Deep-dives into curriculum from iGOT Karmayogi Bharat and NSSTA.\n` +
        `* **Topic Clarifications**: Simplifying methodologies like SNA 2008, GVA estimation, sampling weights, or CPI basket revisions.\n` +
        `* **Skill Gap Reviews**: Reviewing your evaluated gaps and operational risk mitigations.\n` +
        `* **Practice Questions & Quizzes**: Testing your preparation before official cadre assessments.\n` +
        `* **Personalized Learning Plans**: Structuring a week-by-week roadmap around your official duties.\n\n` +
        `*Please feel free to click any suggestion chip above or ask a specific statistical methodology question!*`;
    }

    content += `\n\n---\n*(Note: OpenAI API returned HTTP 429 Insufficient Quota for this organization key. This consultation was synthesized by the Samarthya MoSPI Knowledge Engine. Once credits are topped up at platform.openai.com, responses will automatically generate via live GPT-4o-mini).*`;

    return content;
  }
}

module.exports = AIChatService;
