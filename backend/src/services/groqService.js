/**
 * Groq AI guide - answers user onboarding questions based on stage
 */
async function callGroq({ system, prompt, temperature=0.35, max_tokens=220 }){
  const apiKey = process.env.GROQ_API_KEY;
  if(!apiKey) throw new Error("GROQ_API_KEY missing in .env");

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
      temperature,
      max_tokens
    })
  });

  const data = await response.json();
  if(!response.ok){
    const msg = data?.error?.message || "Groq API error";
    throw new Error(msg);
  }

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

export async function onboardingGuide({ stage, question }){
  const system = `You are an assistant for a customer onboarding & KYC platform.
Respond in a helpful way for a student final-year project.
Be concise, practical, and structured.`;

  const prompt = `User onboarding stage: ${stage}

User question:
${question}

Provide guidance with:
- What to do now
- What documents are needed
- Common mistakes to avoid
- Next stage`;

  return callGroq({ system, prompt, temperature: 0.35, max_tokens: 260 });
}
