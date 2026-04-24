import { env } from "../config/env.js";

const fallbackDraft = (prompt) => {
  const topic = prompt || "campus event";
  return {
    title: `${topic} Experience`,
    description:
      `A focused, well-structured event for students and professionals interested in ${topic}. Includes practical sessions, guided discussion, and networking.`,
    category: "workshop",
    eventType: "in-person",
    targetAudience: "Students, early professionals, and curious beginners",
    prerequisites: "Basic interest in the topic. No advanced preparation required.",
    tags: ["campus", "learning", "networking"],
    agenda: [
      "Welcome and context setting",
      "Main session with practical examples",
      "Hands-on activity or discussion",
      "Q&A and networking",
    ],
    promotionalCopy:
      `Join EventEase for ${topic}. Learn, meet peers, and leave with practical next steps.`,
  };
};

export const generateEventDraft = async (prompt) => {
  if (!env.huggingFaceToken) return fallbackDraft(prompt);

  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.huggingFaceToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: env.huggingFaceModel,
        messages: [
          {
            role: "system",
            content:
              "Generate a practical campus/corporate event listing as strict JSON with keys: title, description, category, eventType, targetAudience, prerequisites, tags, agenda, promotionalCopy. Return valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        stream: false,
      }),
    });

    if (!response.ok) return fallbackDraft(prompt);

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    return text ? JSON.parse(text) : fallbackDraft(prompt);
  } catch (error) {
    console.error("AI draft generation failed:", error);
    return fallbackDraft(prompt);
  }
};
