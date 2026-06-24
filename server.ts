import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors()); 
app.use(express.json());

const apiKey = process.env.GROQ_API_KEY;
const openai = new OpenAI({ 
  apiKey: apiKey || '', 
  baseURL: "https://api.groq.com/openai/v1" 
});

const drugDictionary: Record<string, string> = {
  "كونكور": "Concor (Bisoprolol)", "فلاجيل": "Flagyl (Metronidazole)",
  "أملور": "Amlor (Amlodipine)", "بانادول": "Panadol (Paracetamol)",
  "أوجمنتين": "Augmentin (Amosticillin/Clavulanate)", "كاتافلام": "Cataflam (Diclofenac Potassium)",
  "بروفين": "Brufen (Ibuprofen)", "كونترولوك": "Controloc (Pantoprazole)"
};

app.post('/api/ask', async (req: Request, res: Response) => {
  const { drugName } = req.body;
  if (!drugName) return res.status(400).json({ error: "اسم الدواء مطلوب" });

  const targetDrug = drugDictionary[drugName as keyof typeof drugDictionary] || drugName;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "أنت مساعد طبي. أجب بصيغة JSON فقط. الهيكل المطلوب: {\"description\": \"\", \"uses\": \"\", \"activeIngredient\": \"\", \"dosage\": \"\", \"warnings\": \"\", \"price\": \"\", \"sideEffects\": \"\"}" },
        { role: "user", content: `أعطني معلومات طبية دقيقة ومختصرة عن: ${targetDrug}` }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content || "{}";
    res.json({ answer: JSON.parse(content) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء معالجة الطلب" });
  }
});

// هذا التصدير هو المطلوب لـ Vercel
export default app;