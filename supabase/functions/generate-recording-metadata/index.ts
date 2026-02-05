import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const toneAnalysisSchema = z.object({
  conviction_score: z.number().min(0).max(100).optional(),
  sincerity_score: z.number().min(0).max(100).optional(),
  analysis_summary: z.string().max(2000).optional(),
  strengths: z.array(z.string().max(200)).max(10).optional(),
  suggested_improvements: z.array(z.string().max(200)).max(10).optional(),
  practice_exercise: z.string().max(500).optional()
}).passthrough();

const inputSchema = z.object({
  transcript: z.string().max(10000, "Transcript must be less than 10000 characters").optional(),
  toneAnalysis: toneAnalysisSchema.optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const parseResult = inputSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parseResult.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { transcript, toneAnalysis } = parseResult.data;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const currentDate = new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    const systemPrompt = `You are an AI assistant that analyzes voice recording transcripts and tone analysis data to generate meaningful metadata.

Given the transcript and tone analysis, generate:
1. A default recording name (3-7 words, title case)
2. 1-4 auto-assigned tags from the approved list
3. A tone profile summary (1-3 supportive sentences)

RECORDING NAME RULES:
- Use the first sentence of the transcript when meaningful
- If first sentence is weak (filler words, "testing", etc.), extract main intention
- Keep 3-7 words, title case
- Remove filler words and personal identifiers
- Convert statements into short, positive title-style phrases
- Fallback: "Affirmation – ${currentDate}" or "My New Recording – ${currentDate}"

Examples:
- "I am becoming more confident every day." → "Becoming More Confident"
- "Um so this is a test about healing…" → "Healing and Growth"

AUTO-TAGGING RULES:
- Use both transcript and tone analysis to infer themes
- Select 1-4 tags from approved list, ordered by importance
- If no meaningful tags apply, return ["general"]

APPROVED TAGS:
Confidence, Self-Love, Healing, Motivation, Abundance, Gratitude, Clarity, Calm, Presence, Letting Go, Compassion, Growth Mindset, Boundaries, Purpose, Identity, Manifestation, General

TONE PROFILE SUMMARY RULES:
- 1-3 short, supportive sentences
- Reference conviction, emotional tone, pace, clarity, confidence
- Be gentle, supportive, non-judgmental
- Give helpful insight about delivery

Examples:
- "You sound grounded and sincere, with rising conviction as you speak."
- "Your tone is gentle and calm, suggesting a reflective mindset."
- "You begin softly but your confidence builds throughout the recording."

OUTPUT FORMAT (JSON only, no additional text):
{
  "name": "Short Title Case Name",
  "tags": ["Tag1", "Tag2"],
  "tone_summary": "1-3 supportive insight sentences about tone."
}`;

    const userMessage = `Analyze this recording and generate metadata:

TRANSCRIPT:
${transcript || "(No transcript available)"}

TONE ANALYSIS:
${toneAnalysis ? JSON.stringify(toneAnalysis, null, 2) : "(No tone analysis available)"}

Return only the JSON object with name, tags, and tone_summary.`;

    console.log("Generating recording metadata...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("AI response:", content);

    // Parse the JSON from the response (handle markdown code blocks)
    let metadata;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();
      metadata = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return fallback metadata
      metadata = {
        name: `Affirmation – ${currentDate}`,
        tags: ["general"],
        tone_summary: "Recording captured successfully."
      };
    }

    // Validate and sanitize the response
    const validTags = [
      "Confidence", "Self-Love", "Healing", "Motivation", "Abundance", 
      "Gratitude", "Clarity", "Calm", "Presence", "Letting Go", 
      "Compassion", "Growth Mindset", "Boundaries", "Purpose", 
      "Identity", "Manifestation", "General"
    ];

    const sanitizedMetadata = {
      name: typeof metadata.name === 'string' && metadata.name.length > 0 
        ? metadata.name.slice(0, 100) 
        : `Affirmation – ${currentDate}`,
      tags: Array.isArray(metadata.tags) 
        ? metadata.tags.filter((tag: string) => validTags.includes(tag)).slice(0, 4)
        : ["general"],
      tone_summary: typeof metadata.tone_summary === 'string' && metadata.tone_summary.length > 0
        ? metadata.tone_summary.slice(0, 500)
        : "Recording captured successfully."
    };

    // Ensure at least one tag
    if (sanitizedMetadata.tags.length === 0) {
      sanitizedMetadata.tags = ["general"];
    }

    return new Response(JSON.stringify(sanitizedMetadata), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-recording-metadata:", error);
    const message = error instanceof Error ? error.message : "Metadata generation failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
