import { generateEventDraft } from "../services/aiService.js";

export const generateEventDraftController = async (req, res) => {
  try {
    const prompt = String(req.body.prompt || "").trim();
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    const draft = await generateEventDraft(prompt);
    return res.status(200).json({ success: true, draft });
  } catch (error) {
    console.error("generateEventDraftController error:", error);
    return res.status(500).json({ success: false, message: "Error generating draft" });
  }
};
