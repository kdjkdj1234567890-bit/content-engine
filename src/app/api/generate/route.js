import { Groq } from "groq-sdk";
import { calculateOverallQuality } from "@/lib/quality-scorer";
import { analyzeSEO } from "@/lib/seo-analyzer";
import { checkFacts } from "@/lib/fact-checker";
import { predictPerformance } from "@/lib/performance-predictor";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Base System Prompt - The Foundation of Antigravity Architecture
const BASE_SYSTEM_PROMPT = `
You are ContentEngine AI, a world-class content marketing expert.
IMPORTANT: You are part of the "{TEAM_NAME}" within the user's organization.
Your goal is to produce high-performing content that aligns with the organization's Shared Brain.

## 🧠 SHARED BRAIN (Global Context) & RULES
The user has defined the following Brand Voice and Global Rules. You MUST adhere to these strictly:

### 1. Brand Voice (Tone & Manner)
{BRAND_VOICE}
(If empty, use default: Professional yet engaging, authoritative but accessible, optimized for Korean readers)

### 2. Global Rules (Constraints)
{GLOBAL_RULES}
(If empty, use default: No hallucinations, fact-check everything, use short sentences)

## 🏢 YOUR TEAM & ROLE: {TEAM_NAME}
{TEAM_ROLE_DESC}

## ⚡ CORE CONTENT RULES (Applies to ALL content)
1. **Hook First**: The first sentence must grab attention immediately (question, statistic, or bold statement).
2. **Value-Centric**: Focus on the benefit to the reader, not just features.
3. **Scannable**: Use short paragraphs, bullet points, and bold text for readability.
4. **No Fluff**: Remove unnecessary adjectives and adverbs. Be concise.
5. **Call to Action (CTA)**: Always end with a clear, compelling next step.
6. **Korean Optimization**: Use natural, modern Korean business language. No direct translation awkwardness. Apply "Gam-sung-bi" (Emotional Satisfaction).
7. **Fact-Based**: If you cite stats or facts, they must be accurate. If unsure, generalize or omit.

## 🛡️ HALLUCINATION CHECK
- Do NOT invent specific dates, prices, or case studies unless known to be true.
- If mentioning a specific tool or person, ensure they exist.

Generate the content adhering to these guidelines.
`;

const TEAM_DEFINITIONS = {
    content: {
        name: "콘텐츠 미디어팀 (Contents Media Team)",
        role: "You are a creative storyteller and SEO specialist. Focus on high engagement, virality, and search ranking. Your writing should be shareable, emotional, and informative. Prioritize reader retention and brand awareness.",
    },
    sales: {
        name: "세일즈 전략팀 (Sales Strategy Team)",
        role: "You are a persuasive copywriter and conversion strategist (CRO expert). Focus on driving action, sales, and leads. Your writing should be psychological, benefit-driven, and urgent. Use cognitive biases like Scarcity and Social Proof.",
    }
};

function buildSystemPrompt(type, details) {
    const teamKey = details?.team || "content";
    const team = TEAM_DEFINITIONS[teamKey];

    const brandVoice = details?.brandVoice ? details.brandVoice : "Professional, Trustworthy, Modern";
    const globalRules = details?.globalRules ? details.globalRules : "No specific constraints provided";

    return BASE_SYSTEM_PROMPT
        .replace(/{TEAM_NAME}/g, team.name)
        .replace(/{TEAM_ROLE_DESC}/g, team.role)
        .replace(/{BRAND_VOICE}/g, brandVoice)
        .replace(/{GLOBAL_RULES}/g, globalRules);
}

function buildPrompt(type, keyword) {
    switch (type) {
        case 'blog':
            return `
      Topic: "${keyword}"
      Format: SEO-optimized Blog Post (Markdown)
      
      Structure:
      1. **Catchy Title** (Include keyword, use numbers/power words)
      2. **Introduction** (Hook the reader, state the problem, promise a solution. Include keyword in first 100 chars)
      3. **Main Body** (3-5 Subheadings using H2/H3. Use bullet points. Short paragraphs)
      4. **Conclusion** (Summarize key points, reinforce benefits)
      5. **FAQ Section** (3 common questions)
      
      Requirements:
      - Keyword Density: Use "${keyword}" naturally 3-5 times.
      - Length: 1,500+ characters.
      - Tone: Matches Brand Voice.
      `;

        case 'instagram':
            return `
      Topic: "${keyword}"
      Format: Instagram Caption + Hashtags
      
      Structure:
      1. **Hook Line** (Stop the scroll immediately)
      2. **Value Body** (Micro-story or 3 quick tips. Line breaks between points)
      3. **Engagement Question** (Ask followers something)
      4. **Hashtags** (Mix of broad and niche tags, 15-20 count)
      
      Requirements:
      - Emoji usage: High (relevant to context)
      - Visual description: Suggest 1 image/reel idea to go with this.
      `;

        case 'youtube':
            return `
      Topic: "${keyword}"
      Format: YouTube Video Script (8-10 mins)
      
      Structure:
      1. **Hook (0:00-0:45)**: Visual hook + "In this video, you'll learn..."
      2. **Intro**: Quick branding + "Subscribe" nudges
      3. **Body (The Meat)**: 3-5 distinct actionable steps or secrets.
      4. **Bonus Tip**: Give 1 extra value point near the end to boost retention.
      5. **Outro**: Clear CTA (Watch this next video...)
      
      Requirements:
      - Include visual cues [Visual: ...] for the editor.
      - Conversational, spoken tone.
      `;

        case 'email':
            return `
      Topic: "${keyword}"
      Format: Cold Email / Newsletter
      
      Structure:
      1. **Subject Line**: 3 Variations (High Open Rate style)
      2. **Opening**: Personal connection or shocking stat.
      3. **Problem/Agitation**: Why the current way is failing.
      4. **Solution (The Product/Service)**: How it fixes everything.
      5. **CTA**: Low friction (e.g., "Reply 'Yes' to learn more")
      
      Requirements:
      - Keep it under 200 words if possible (for cold email).
      - Focus on "What's in it for them".
      `;

        case 'ad':
            return `
      Topic: "${keyword}"
      Format: Facebook/Instagram Ad Copy
      
      Structure:
      1. **Primary Text**: Pain point question + Story/Solution.
      2. **Headline**: Short, punchy benefit (5 words max).
      3. **Description**: Urgency or Social Proof.
      4. **Display Link**: Trustworthy URL slug.
      
      Requirements:
      - Use AIDA Framework (Attention, Interest, Desire, Action).
      - Highlight objections and crush them instantly.
      - Use Urgency (Limited time, Low stock).
      `;

        default:
            return `Write a high-quality piece of content about "${keyword}".`;
    }
}

export async function POST(req) {
    try {
        const { keyword, type, details } = await req.json();

        if (!keyword) {
            return Response.json({ error: "Keyword is required" }, { status: 400 });
        }

        const systemPrompt = buildSystemPrompt(type, details);
        const userPrompt = buildPrompt(type, keyword);

        // Call Groq API
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 4096,
        });

        let content = completion.choices[0]?.message?.content || "";

        // Clean up content (remove markdown fences if present)
        content = content.replace(/^```markdown\n/, "").replace(/^```\n/, "").replace(/\n```$/, "");

        // --- Research-Backed Analysis ---

        // 1. SEO Analysis
        const seoResult = analyzeSEO(content, keyword); // Using content-based analysis

        // 2. Fact Check
        const factCheckResult = await checkFacts(content);

        // 3. Performance Prediction
        const perfResult = predictPerformance(content, type);

        // 4. Overall Quality Score
        const qualityScore = calculateOverallQuality(seoResult, factCheckResult, perfResult);

        return Response.json({
            content,
            seo: seoResult,
            factCheck: factCheckResult,
            performance: perfResult,
            quality: qualityScore
        });

    } catch (error) {
        console.error("Content generation error:", error);
        return Response.json({ error: "Failed to generate content. Please try again." }, { status: 500 });
    }
}
