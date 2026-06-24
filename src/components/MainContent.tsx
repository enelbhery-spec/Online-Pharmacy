import { useState } from "react";
import { Search, Loader2, ShieldCheck } from "lucide-react";

export default function MainContent() {
  const [drugName, setDrugName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!drugName.trim()) return;
    setIsLoading(true);
    setResult(null);

    try {
      // استخدام المسار النسبي /api/ask ليعمل على Vercel وأي بيئة أخرى
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugName }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "فشل الاتصال بالسيرفر");
      }
      
      setResult(data.answer || { error: "لم يتم العثور على معلومات" });
    } catch (err: any) {
      setResult({ error: "تعذر الاتصال بالسيرفر" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 text-right">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl text-white text-center py-12 px-6 mb-8 shadow-xl">
        <ShieldCheck size={60} className="mx-auto mb-4" />
        <h1 className="text-5xl font-bold mb-3">بحث صيدلية اون لاين الذكى</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
        <div className="flex items-center bg-slate-100 rounded-2xl overflow-hidden">
          <input 
            className="flex-1 px-6 py-5 bg-transparent outline-none text-lg" 
            placeholder="اكتب اسم الدواء..." 
            value={drugName} 
            onChange={(e) => setDrugName(e.target.value)} 
          />
          <button onClick={handleSearch} className="bg-blue-600 px-8 text-white">
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 border-b pb-4">نتيجة التحليل</h2>
          {result.error ? (
            <p className="text-red-500 text-center">{result.error}</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(result).map(([key, value]) => (
                <div key={key} className={`p-4 rounded-xl border ${key === 'price' ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                  <h3 className="font-bold text-blue-800 capitalize mb-1">
                    {key === "uses" ? "الاستخدامات" : 
                     key === "description" ? "الوصف" :
                     key === "activeIngredient" ? "المادة الفعالة" :
                     key === "dosage" ? "الجرعة" :
                     key === "warnings" ? "التحذيرات" :
                     key === "price" ? "السعر التقريبي" :
                     key === "sideEffects" ? "الآثار الجانبية" : key}:
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{String(value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}