import { OpenAI } from "openai";

export default async function handler(req: any, res: any) {
  // التأكد من أن الطلب من نوع POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.VITE_GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "Missing VITE_GROQ_API_KEY",
      });
    }

    // إعداد عميل OpenAI للعمل مع Groq
    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const { inputText } = req.body;

    if (!inputText) {
      return res.status(400).json({ success: false, error: "Input text is required" });
    }

    // استدعاء النموذج
    const completion = await client.chat.completions.create({
      model: "llama3-8b-8192", // أو أي نموذج مدعوم في Groq
      messages: [{ role: "user", content: inputText }],
    });

    return res.status(200).json({
      success: true,
      result: completion.choices[0].message.content,
    });

  } catch (err: any) {
    console.error("API Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "حدث خطأ غير متوقع",
    });
  }
}