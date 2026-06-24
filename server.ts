import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const apiKey = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
const openai = new OpenAI({ 
  apiKey: apiKey as string, 
  baseURL: "https://api.groq.com/openai/v1" 
});

const drugDictionary: Record<string, string> = {
  "كونكور": "Concor (Bisoprolol)", "فلاجيل": "Flagyl (Metronidazole)",
  "أملور": "Amlor (Amlodipine)", "بانادول": "Panadol (Paracetamol)",
  "أوجمنتين": "Augmentin (Amoxicillin/Clavulanate)", "كاتافلام": "Cataflam (Diclofenac Potassium)",
  "بروفين": "Brufen (Ibuprofen)", "كونترولوك": "Controloc (Pantoprazole)"
};

app.post('/api/ask', async (req: Request, res: Response) => {
  const { drugName } = req.body;
  if (!drugName) return res.status(400).json({ error: "اسم الدواء مطلوب" });

  const targetDrug = drugDictionary[drugName as keyof typeof drugDictionary] || drugName;

  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: `أنت مساعد طبي. أجب بصيغة JSON فقط.
          الهيكل المطلوب: {"description": "وصف قصير", "uses": "استخدامات الدواء", "activeIngredient": "المادة الفعالة", "dosage": "الجرعة", "warnings": "التحذيرات", "price": "يختلف حسب الصيدلية", "sideEffects": "الآثار الجانبية"}. 
          التزم بهذا الهيكل ولا تكتب أي نصوص خارجية.` 
        },
        { role: "user", content: `أعطني معلومات طبية دقيقة ومختصرة عن: ${targetDrug}` }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content || "{}";
    res.json({ answer: JSON.parse(content) });
  } catch (error) {
    console.error("خطأ:", error);
    res.status(500).json({ error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));