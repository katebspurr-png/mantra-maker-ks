import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl, transcript, affirmationText } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert in acoustic and linguistic tone analysis.
Your job is to evaluate short voice recordings of users speaking affirmations or mantras and provide clear, supportive feedback about:

- Conviction — how strongly the user sounds like they believe what they are saying
- Sincerity — how authentic and emotionally aligned their voice appears
- Consistency — whether tone, pacing, and emphasis match the message

You are not evaluating the quality of their voice. You are evaluating the emotional truthfulness and self-belief expressed in the recording.

Listen and analyze for:
- steadiness
- clarity
- hesitations
- vocal energy
- emotional resonance
- upward/downward inflection
- micro-pauses
- volume stability
- alignment between spoken tone and meaning

Return your response as structured JSON:
{
  "conviction_score": 0–100,
  "sincerity_score": 0–100,
  "analysis_summary": "2–3 sentences explaining what the tone suggests.",
  "strengths": ["bullet point", "bullet point"],
  "suggested_improvements": ["bullet point", "bullet point"],
  "practice_exercise": "One simple exercise the user can do before re-recording."
}

Scoring Guide:
0–40 = Low (sounds hesitant, unsure, disconnected)
41–70 = Moderate (some confidence, but inconsistent)
71–100 = High (strong belief, emotional authenticity)

Always be warm, encouraging, and non-judgmental. Speak like a supportive coach, not a critic. Focus on growth and improvement.

If background noise or recording quality affects tone analysis, mention it briefly and continue anyway.
Do not rewrite the affirmation unless asked.
Do not comment on the user's identity, only on the tone.`;

    const userMessage = `Please analyze the tone of this affirmation recording.

${affirmationText ? `Intended affirmation text: "${affirmationText}"` : ''}
${transcript ? `Transcript of what was spoken: "${transcript}"` : ''}

Audio URL for analysis: ${audioUrl}

Provide your analysis in the JSON format specified.`;

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

    // Parse the JSON from the response
    // The AI might wrap it in markdown code blocks, so we need to extract it
    let analysis;
    try {
      // Try to extract JSON from markdown code block if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : content.trim();
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse analysis response");
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-tone:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
