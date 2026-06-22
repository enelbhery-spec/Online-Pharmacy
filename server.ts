import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Set high limits for receiving image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve API routes first
app.post("/api/analyze-medicine", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "لم يتم العثور على مفتاح الذكاء الاصطناعي (GEMINI_API_KEY). يرجى الانتقال إلى الإعدادات (Settings > Secrets) لإضافة المفتاح لتتمكن من تشغيل الخدمة."
      });
    }

    const { queryType, inputText, image } = req.body;

    if (!queryType) {
      return res.status(400).json({ error: "نوع الاستعلام مطلوب" });
    }

    // Initialize Gemini AI Client inside the route handler to avoid module-load crashes if keys are initially missing
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    let prompt = "";
    const parts: any[] = [];

    // Construct prompt based on query type
    if (queryType === 'name') {
      if (!inputText) {
        return res.status(400).json({ error: "اسم الدواء مطلوب للبحث بالاسم" });
      }
      prompt = `
        المستخدم يبحث عن دواء بالاسم التالي: "${inputText}".
        قم بتحليل هذا الاسم وتوفير معلومات الدواء الرسمية والدقيقة بالكامل.
        إذا كان الاسم يشير إلى دواء غير معروف أو مكتوب بخطأ إملائي واضح، حاول تخمين الدواء الأقرب وإرجاع معلوماته، مع كتابة تنبيه في حقل الملاحظات (notes).
      `;
    } else if (queryType === 'barcode') {
      prompt = `
        المستخدم يقوم بتصوير باركود دواء أو إدخال رقم باركود (EAN-13 / UPC).
        ${inputText ? `رقم الباركود الموفر هو: "${inputText}".` : ''}
        يرجى قراءة الباركود من الصورة أو البحث بواسطة رقم الباركود المعطى للتعرف على الدواء وتوفير معلوماته الطبية الدقيقة، تفاصيل السعر، والمكونات.
      `;
      if (image && image.data) {
        parts.push({
          inlineData: {
            mimeType: image.mimeType || "image/jpeg",
            data: image.data
          }
        });
      }
    } else if (queryType === 'box_photo') {
      if (!image || !image.data) {
        return res.status(400).json({ error: "صورة علبة الدواء مطلوبة" });
      }
      prompt = `
        لقد قام المستخدم برفع صورة لعلبة دواء (أو شريط دواء).
        يرجى تحليل النص والشكل المكتوب في الصورة وتحديد اسم الدواء، ثم قم بملء تفاصيله الطبية الكاملة بدقة.
      `;
      parts.push({
        inlineData: {
          mimeType: image.mimeType || "image/jpeg",
          data: image.data
        }
      });
    } else if (queryType === 'prescription_photo') {
      if (!image || !image.data) {
        return res.status(400).json({ error: "صورة الروشتة مطلوبة" });
      }
      prompt = `
        لقد قام المستخدم بتصوير روشتة طبية (أو رسالة دكتور تحتوي على أسماء أدوية أو متطلبات للمريض).
        يرجى قراءة خط يد الطبيب بحرص شديد، واستخراج جميع الأدوية المذكورة في الروشتة الطبية.
        لكل دواء مستخرج، حدد المكونات الفعالة والسعر التقريبي والجرعة وطريقة الاستخدام والشكل الصيدلي.
        تأكد من حساب إجمالي السعر لجميع الأدوية المدرجة في الروشتة بدقة في حقل (totalCost).
        إذا لم تتمكن من تحديد بعض الكلمات، ضعها كدواء مقترح مع حقل ثقة أقل.
      `;
      parts.push({
        inlineData: {
          mimeType: image.mimeType || "image/jpeg",
          data: image.data
        }
      });
    }

    parts.push({ text: prompt });

    // Call Gemini API containing System Instruction & structured Arabic responseSchema
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: parts },
      config: {
        systemInstruction: `أنت صيدلي خبير ومساعد طبي ذكي بالذكاء الاصطناعي. مهمتك هي تحليل طلبات الأدوية بأربعة طرق مختلفة: بالاسم، بالباركود (صورة أو رقم)، أو بتحليل صورة علبة الدواء، أو بتحليل صورة الروشتة المكتوبة بخط يد الطبيب وسعر كل دواء وإجمالي سعر الروشتة.
يجب عليك استخراج تفاصيل كل دواء وعرض النتيجة بشكل JSON دقيق باللغة العربية.
ملاحظات هامة:
1. استخرج اسم كل دواء بدقة واسمه الإنجليزي المعين.
2. قدر السعر التقريبي للدواء بالعملة المحلية للبلد (استخدم عملة الجنيه المصري "ج.م" كمرجع افتراضي إن لم يتضح غير ذلك، مع استخدام نفس العملة الموحدة لجميع الأدوية في النتيجة لحساب الإجمالي بدقة).
3. حدد المكونات الفعالة، دواعي الاستعمال، طريقة الاستخدام، الجرعة، والشكل الصيدلي.
4. احسب التكلفة الإجمالية لجميع الأدوية التي تم التعرف عليها في الروشتة بدقة (totalCost).
5. دائماً أضف تنبيه طبي في حقل الملاحظات (notes) تذكر فيه أن التطبيق ذو طبيعة إرشادية واستشارية فقط، وأن قرار الطبيب أو الصيدلي ضروري ولا يغني عنه التطبيق تحت أي ظرف، وأن الأسعار المذكورة استرشادية تقريبية.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            queryType: {
              type: Type.STRING,
              description: "نوع البحث المستخدم"
            },
            medications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "اسم الدواء بالعربية" },
                  englishName: { type: Type.STRING, description: "اسم الدواء بالإنجليزية" },
                  activeIngredients: { type: Type.STRING, description: "المكونات الفعالة للدواء" },
                  price: { type: Type.NUMBER, description: "السعر التقريبي للدواء كعدد صحيح أو عشري كقيمة رقمية فقط" },
                  currency: { type: Type.STRING, description: "رمز العملة (مثال: ج.م)" },
                  usageInstructions: { type: Type.STRING, description: "طريقة استخدام الدواء" },
                  dosage: { type: Type.STRING, description: "الجرعة الموصى بها وطريقة التناول بالتفصيل" },
                  form: { type: Type.STRING, description: "الشكل الصيدلاني (أقراص، شراب، إلخ)" },
                  purpose: { type: Type.STRING, description: "دواعي الاستعمال" }
                },
                required: ["name", "activeIngredients", "price", "currency", "usageInstructions", "dosage", "form", "purpose"]
              }
            },
            totalCost: { type: Type.NUMBER, description: "إجمالي السعر لجميع الأدوية المعترف عليها" },
            confidenceScore: { type: Type.NUMBER, description: "نسبة الثقة في التعرف من 0 إلى 1" },
            notes: { type: Type.STRING, description: "تنبيهات وإرشادات طبية هامة وصيغ تحذيرية باللغة العربية" }
          },
          required: ["queryType", "medications", "totalCost", "confidenceScore", "notes"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("لم يتم إرجاع نتيجة من خادم الذكاء الاصطناعي");
    }

    const jsonResult = JSON.parse(textOutput.trim());
    return res.json(jsonResult);

  } catch (error: any) {
    console.error("Error analyzing medicine:", error);
    return res.status(500).json({
      error: "حدث خطأ أثناء تحليل طلب الدواء أو معالجة الصورة.",
      details: error.message || error
    });
  }
});

// Setup Vite Dev Server / Static Hosting
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
  }
}

setupServer();

export default app;
