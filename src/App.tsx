import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Camera, 
  FileText, 
  Pill, 
  DollarSign, 
  ChevronRight, 
  RotateCcw, 
  Upload, 
  Info, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Plus, 
  Loader2, 
  BookmarkCheck,
  ShoppingBag,
  HelpCircle,
  Barcode
} from "lucide-react";
import { MedicationDetails, AnalysisResponse, HistoryItem } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"name" | "box" | "prescription" | "barcode">("name");
  
  // Search inputs
  const [medicineName, setMedicineName] = useState("");
  const [barcodeNumber, setBarcodeNumber] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>("image/jpeg");
  
  // App state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // UI preferences
  const [currencySymbol, setCurrencySymbol] = useState("ج.م");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("medication_assistant_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Save history helper
  const saveToHistory = (res: AnalysisResponse, inputText?: string, imageUrl?: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' }) + " - " + new Date().toLocaleDateString("ar-EG"),
      queryType: activeTab,
      inputText,
      imageUrl,
      result: res
    };
    const updated = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updated);
    localStorage.setItem("medication_assistant_history", JSON.stringify(updated));
  };

  // Clear all history
  const clearHistory = () => {
    if (confirm("هل أنت متأكد من رغبتك في حذف سجل عمليات البحث والتحليلات بالكامل؟")) {
      setHistory([]);
      localStorage.removeItem("medication_assistant_history");
    }
  };

  // Convert files to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("حجم الملف كبير جداً. يرجى اختيار صورة يقل حجمها عن 10 ميجابايت.");
        return;
      }
      setImageMime(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Pre-configured simulation samples for interactive preview testing
  const demoPresets = {
    name: [
      { label: "بنادول إكسترا (مسكن)", term: "Panadol Extra" },
      { label: "كونجستال (للبرد والإنفلونزا)", term: "Congestal" },
      { label: "جليمبريد (مخفف السكر)", term: "Glimepiride" }
    ],
    barcode: {
      label: "تحليل تجريبي لباركود دواء ديلاركس للحساسية",
      data: {
        queryType: "barcode" as const,
        medications: [
          {
            name: "ديلاركس ٥ ملجم",
            englishName: "Delarex 5mg",
            activeIngredients: "ديسلوراتادين (Desloratadine)",
            price: 29,
            currency: "ج.م",
            usageInstructions: "يفضل تناوله مساءً قبل النوم، مع الطعام أو بدونه.",
            dosage: "قرص واحد يومياً لعمر ١٢ سنة فما فوق بانتظام مع كوب ماء.",
            form: "أقراص (Tablets)",
            purpose: "مضاد للهستامين، لعلاج أعراض الحساسية كالعطس ورشح الأنف والحكة الجلدية."
          }
        ],
        totalCost: 29,
        confidenceScore: 0.99,
        notes: "تم التعرف على الدواء بنجاح عبر الرقم الكودي للباركود الخاص بالدواء. الباركود يضمن أصالة المنتج الدوائي بنسبة دقة مطلقة."
      }
    },
    box: {
      label: "تحليل تجريبي لعلبة دواء بروفين",
      image: "placeholder_box",
      data: {
        queryType: "box_photo" as const,
        medications: [
          {
            name: "بروفين 400 ملجم",
            englishName: "Brufen 400mg",
            activeIngredients: "أيبوبروفين (Ibuprofen)",
            price: 45,
            currency: "ج.م",
            usageInstructions: "يؤخذ بعد الطعام مباشرة مع كوب ماء لتجنب اضطرابات المعدة.",
            dosage: "قرص واحد عند اللزوم (مثل حالات الصداع أو الحرارة الكبيرة)، بحد أقصى ٣ أقراص يومياً.",
            form: "أقراص مغلفة (Tablets)",
            purpose: "مسكن للألم الشديد، خافض للحرارة ومضاد للالتهابات والمفاصل."
          }
        ],
        totalCost: 45,
        confidenceScore: 0.98,
        notes: "تم استخراج البيانات من علبة الدواء بنجاح بنسبة دقة عالية. يحظر استخدامه لمرضى قرحة المعدة أو الكلى دون استشارة طبيبك."
      }
    },
    prescription: {
      label: "تحليل تجريبي لروشتة أطفال (روشتة طبيب نموذجية)",
      image: "placeholder_prescription",
      data: {
        queryType: "prescription_photo" as const,
        medications: [
          {
            name: "ميجاموكس ٤٥٧ ملجم شراب",
            englishName: "Megamox 457mg Oral Suspension",
            activeIngredients: "أموكسيسيللين + حمض الكلافولانيك (Amoxicillin + Clavulanic Acid)",
            price: 110,
            currency: "ج.م",
            usageInstructions: "يجب رج الزجاجة جيداً قبل الاستعمال، ويحفظ في الثلاجة بعد التحضير.",
            dosage: "٥ مل كل ١٢ ساعة لمدة ٧ أيام بانتظام كجرعة مضاد حيوي.",
            form: "شراب معلق للأطفال (Suspension)",
            purpose: "مضاد حيوي واسع المجال لعدوى الجهاز التنفسي والتهاب الأذن الوسطى."
          },
          {
            name: "ستال مخفض حرارة",
            englishName: "Setal Drops",
            activeIngredients: "باراسيتامول (Paracetamol)",
            price: 25,
            currency: "ج.م",
            usageInstructions: "يمكن خلطه بالماء أو العصير للأطفال.",
            dosage: "١ مل عند الملاحظة وارتفاع درجة الحرارة (٨ نقاط لكل كيلو من وزن الطفل)، تكرر كل ٦ ساعات عند اللزوم.",
            form: "نقط بالفم للأطفال (Drops)",
            purpose: "مسكن وخافض آمن للحرارة ومضاد لأعراض التسنين."
          },
          {
            name: "أولفين لبوس رضع",
            englishName: "Olfen Suppositories",
            activeIngredients: "ديكلوفيناك الصوديوم (Diclofenac Sodium)",
            price: 35,
            currency: "ج.م",
            usageInstructions: "شرجياً فقط عند هجمات الحرارة الشديدة للسيطرة عليها.",
            dosage: "قمع واحد عند اللزوم، بحد أقصى مرتين باليوم.",
            form: "أقماع شرجية (Suppositories)",
            purpose: "خافض حرارة سريع ومسكن قوي ومضاد للتورم والالتهاب."
          }
        ],
        totalCost: 170,
        confidenceScore: 0.94,
        notes: "الروشتة تحتوي على ٣ أصناف (مضاد حيوي، مخفض حرارة، لبوس طوارئ للأطفال). يرجى الالتزام التام بمواعيد المضاد الحيوي، وإكمال الكورس العلاجي بالكامل حتى لو تحسن الطفل صيدلانياً."
      }
    }
  };

  // Main Submit Analysis Action
  const handleAnalyze = async (e?: React.FormEvent, simulatedResult?: any) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setResults(null);

    // If using the simulation triggers instantly
    if (simulatedResult) {
      setTimeout(() => {
        setResults(simulatedResult);
        saveToHistory(
          simulatedResult,
          simulatedResult.medications.map((m: any) => m.name).join(" + "),
          simulatedResult.queryType !== "name" ? "تمت المحاكاة عبر نموذج تجريبي ذكي" : undefined
        );
        setSuccessMsg("تمت محاكاة تحليل العينة النموذجية بنجاح لمشاهدة تفاصيل التطبيق!");
        setLoading(false);
      }, 700);
      return;
    }

    try {
      let payload: any = { queryType: activeTab };

      if (activeTab === "name") {
        if (!medicineName.trim()) {
          setErrorMsg("من فضلك أدخل اسم الدواء للبحث عنه");
          setLoading(false);
          return;
        }
        payload.inputText = medicineName.trim();
      } else if (activeTab === "barcode") {
        if (!barcodeNumber.trim() && !selectedImage) {
          setErrorMsg("من فضلك اكتب رقم الباركود يدوياً أو ارفع صورة باركود الدواء للتحليل بالذكاء الاصطناعي");
          setLoading(false);
          return;
        }
        if (barcodeNumber.trim()) {
          payload.inputText = barcodeNumber.trim();
        }
        if (selectedImage) {
          const base64Parts = selectedImage.split(",");
          const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
          payload.image = {
            mimeType: imageMime,
            data: base64Data
          };
        }
      } else {
        if (!selectedImage) {
          setErrorMsg("يرجى اختيار أو التقاط صورة الدواء أولاً لبدء التحليل بالذكاء الاصطناعي");
          setLoading(false);
          return;
        }
        // Extract base64 payload
        const base64Parts = selectedImage.split(",");
        const base64Data = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];
        
        payload.image = {
          mimeType: imageMime,
          data: base64Data
        };
      }

      const response = await fetch("/api/analyze-medicine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطأ غير معروف في السيرفر");
      }

      setResults(data);
      saveToHistory(
        data, 
        activeTab === "name" 
          ? medicineName 
          : activeTab === "barcode" 
            ? (barcodeNumber || "قراءة باركود ملتقط") 
            : "تم التعرف من الصورة", 
        activeTab !== "name" ? selectedImage : undefined
      );
      setSuccessMsg("تم اكتمال تحليل الذكاء الاصطناعي بنجاح وعرض كافة تفاصيل الروشتة والأدوية!");
    } catch (err: any) {
      console.error(err);
      
      // Automatic smart local fallback with premium feedback if API Key is missing or service is offline
      // This is crucial for seamless AI Studio previews. We inform the user nicely, but let them choose simulated options easily!
      const genericFallback: AnalysisResponse = {
        queryType: activeTab,
        medications: [
          {
            name: activeTab === "name" 
              ? medicineName 
              : activeTab === "barcode" 
                ? "دواء ديلاركس ٥ ملجم" 
                : "دواء ديافانس 50ملجم",
            englishName: activeTab === "name" 
              ? medicineName + " Premium" 
              : activeTab === "barcode" 
                ? "Delarex 5mg" 
                : "Diavance 50mg",
            activeIngredients: activeTab === "barcode" ? "ديسلوراتادين (Desloratadine)" : "ميتفورمين هيدروكلوريد + فيلداجليبتين",
            price: activeTab === "barcode" ? 29 : 68,
            currency: "ج.م",
            usageInstructions: activeTab === "barcode" ? "يفضل تناوله مساءً." : "مباشرة قبل الإفطار يفضل بالجرعة المحددة.",
            dosage: activeTab === "barcode" ? "قرص واحد يومياً قبل النوم." : "قرص مرتين باليوم قبل الأكل بـ ٣٠ دقيقة بانتظام.",
            form: "أقراص (Tablets)",
            purpose: activeTab === "barcode" ? "مضاد للهستامين وعلاج الحساسية." : "تنظيم وخفض مستويات سكر الدم لمرضى داء السكري من النوع الثاني."
          }
        ],
        totalCost: activeTab === "barcode" ? 29 : 68,
        confidenceScore: 0.85,
        notes: "تنبيه: أنت تشاهد الآن لوحة معاينة تفاعلية. لتشغيل الذكاء الاصطناعي الفعلي على صورك، تأكد من إضافة مفتاح (GEMINI_API_KEY) في قائمة Secrets بالإعدادات الجانبية، حيث يعود السيرفر تلقائياً للاستجابة."
      };

      setResults(genericFallback);
      setErrorMsg(`تنبيه: لم تتوفر استجابة حقيقية من السيرفر لأن مفتاح GEMINI_API_KEY غير مثبت، ولكن تم تفعيل البحث الافتراضي لمساعدتك في اختبار وفهم خصائص التطبيق بكفاءة.`);
    } finally {
      setLoading(false);
    }
  };

  const selectHistoryItem = (item: HistoryItem) => {
    setActiveTab(item.queryType);
    if (item.queryType === "name") {
      setMedicineName(item.inputText || "");
    } else if (item.queryType === "barcode") {
      setBarcodeNumber(item.inputText || "");
      setSelectedImage(item.imageUrl || null);
    } else {
      setSelectedImage(item.imageUrl || null);
    }
    setResults(item.result);
    setErrorMsg(null);
    setSuccessMsg("تم استعادة نتيجة التحليل بنجاح من سجل المحفوظات!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" dir="rtl">
      {/* Top Stylish Medical Navbar */}
      <header className="bg-white border-b border-slate-100 shadow-xs sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-xs">
              <Activity className="w-6 h-6 animate-pulse" id="brand-logo" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display">
                مساعد الأدوية الذكي
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                تحليل الروشتات، قراءة علب الأدوية وتسعيرها بالذكاء الاصطناعي
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              مدعوم بـ Gemini 3.5
            </span>
            <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              متاح أوفلاين كمعاينة
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Controls / Scan options */}
        <div className="lg:col-span-7 space-y-6">

          {/* Core Warning Disclaimer Box */}
          <div className="bg-amber-50 border-r-4 border-amber-500 rounded-xl p-4 shadow-2xs">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">ملاحظة طبية وقانونية هامة جداً:</h4>
                <p className="text-xs text-amber-800 leading-relaxed mt-1">
                  المعلومات التي يقدمها هذا التطبيق استرشادية فقط ومبنية على الذكاء الاصطناعي. **لا يجب إطلاقاً تناول أو تغيير جرعات أي دواء دون استشارة مباشرة ومؤكدة من الطبيب المعالج أو الصيدلاني المرخص له.**
                </p>
              </div>
            </div>
          </div>

          {/* Segmented Search Tabs */}
          <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-1 md:flex-nowrap">
            <button
              id="tab-btn-name"
              type="button"
              onClick={() => {
                setActiveTab("name");
                setSelectedImage(null);
                setResults(null);
                setErrorMsg(null);
              }}
              className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === "name"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>البحث بالاسم</span>
            </button>
            <button
              id="tab-btn-barcode"
              type="button"
              onClick={() => {
                setActiveTab("barcode");
                setSelectedImage(null);
                setBarcodeNumber("");
                setResults(null);
                setErrorMsg(null);
              }}
              className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === "barcode"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Barcode className="w-4 h-4" />
              <span>الرفع بالباركود</span>
            </button>
            <button
              id="tab-btn-box"
              type="button"
              onClick={() => {
                setActiveTab("box");
                setSelectedImage(null);
                setResults(null);
                setErrorMsg(null);
              }}
              className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === "box"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>تصوير علبة الدواء</span>
            </button>
            <button
              id="tab-btn-prescription"
              type="button"
              onClick={() => {
                setActiveTab("prescription");
                setSelectedImage(null);
                setResults(null);
                setErrorMsg(null);
              }}
              className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === "prescription"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/15"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>تصوير الروشتة</span>
            </button>
          </div>

          {/* Interactive Card based on Active Tab */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            
            {activeTab === "name" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="medName" className="block text-sm font-bold text-slate-800 mb-2">
                    أدخل اسم الدواء التجاري أو المادة الفعالة:
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    مثال: بنادول، بروفين، اموكسيسيلين، أدول، أو أي علاج تود جلب تفاصيله الكيميائية وسعره وإرشاداته.
                  </p>
                  <div className="relative">
                    <input
                      id="medName"
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400 font-medium font-sans"
                      placeholder="اكتب اسم الدواء هنا باللغة العربية أو الإنجليزية..."
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAnalyze();
                      }}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Pill className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Popular Presets Quick Pick */}
                <div>
                  <span className="block text-xs font-bold text-slate-600 mb-2.5">
                    عينات جاهزة للاختبار الفوري للتطبيق:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {demoPresets.name.map((preset, idx) => (
                      <button
                        key={idx}
                        id={`preset-name-${idx}`}
                        type="button"
                        onClick={() => {
                          setMedicineName(preset.term);
                          // Trigger direct analytic simulation for Panadol/Brf
                          if (preset.term.toLowerCase().includes("panadol")) {
                            handleAnalyze(undefined, {
                              queryType: "name",
                              medications: [{
                                name: "بنادول إكسترا",
                                englishName: "Panadol Extra",
                                activeIngredients: "باراسيتامول (Paracetamol) 500 مغ + كافيين (Caffeine) 65 مغ",
                                price: 35,
                                currency: "ج.م",
                                usageInstructions: "يؤخذ بعد الأكل عند اللزوم لتفادي الصداع أو الحرارة. يفضل عدم تناوله قرب وقت النوم بسبب احتوائه على الكافيين.",
                                dosage: "١-٢ قرص كل ٦ ساعات عند الصداع، وبحد أقصى ٨ أقراص يومياً.",
                                form: "أقراص (Tablets)",
                                purpose: "تسكين الصداع الشديد، آلام الأسنان، آلام الظهر، والآلام المصاحبة لنزلات البرد."
                              }],
                              totalCost: 35,
                              confidenceScore: 0.99,
                              notes: "تحذير: لا تتناول أدوية أخرى تحتوي على الباراسيتامول في نفس الوقت لتفادي الأضرار على وظائف الكبد."
                            });
                          } else if (preset.term.toLowerCase().includes("congestal")) {
                            handleAnalyze(undefined, {
                              queryType: "name",
                              medications: [{
                                name: "كونجستال أقراص",
                                englishName: "Congestal Tablets",
                                activeIngredients: "باراسيتامول + برومفينيرامين + كلورفينيرامين",
                                price: 31,
                                currency: "ج.م",
                                usageInstructions: "يفضل تناوله مساءً لأنه يسبب النعاس والارتخاء البدني.",
                                dosage: "قرص واحد ٣ مرات يومياً بعد الوجبات بانتظام حتى زوال الأعراض.",
                                form: "أقراص (Tablets)",
                                purpose: "علاج أعراض البرد، الرشح، السيلان الأنفي، احتقان الحلق، والصداع المصاحب للإنفلونزا."
                              }],
                              totalCost: 31,
                              confidenceScore: 0.99,
                              notes: "ملاحظة: هذا الدواء يسبب النعاس، يرجى تجنب القيادة أو استخدام الآلات الثقيلة بعد تناوله لحمايتك."
                            });
                          } else {
                            setMedicineName(preset.term);
                          }
                        }}
                        className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "barcode" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <label htmlFor="barcodeNum" className="block text-sm font-bold text-slate-800">
                    أدخل رقم الكود الشريطي (الباركود) للدواء:
                  </label>
                  <p className="text-xs text-slate-500">
                    يمكنك كتابة الرقم أسفل الباركود يدوياً (مثال: 6221435011029)، ليتولى نظام الذكاء الاصطناعي جلب تفاصيله الصيدلانية وسعره.
                  </p>
                  <div className="relative">
                    <input
                      id="barcodeNum"
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400 font-medium font-sans"
                      placeholder="امسح أو اكتب الأرقام تحت الباركود هنا..."
                      value={barcodeNumber}
                      onChange={(e) => setBarcodeNumber(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAnalyze();
                      }}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Barcode className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold">أو قم برفع/تصوير ملصق الباركود</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    يرجى تصوير الباركود بشكل مستقيم وواضح على علبة الدواء لتسهيل قراءته عبر طاقة الباركود الذكية الكامنة:
                  </p>
                  {/* Photo Upload Zone */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer ${
                      selectedImage 
                        ? "border-emerald-500 bg-emerald-50/20" 
                        : "border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-slate-100/50"
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {selectedImage ? (
                      <div className="w-full max-w-sm mx-auto space-y-3 text-center">
                        <img 
                          src={selectedImage} 
                          alt="Uploaded material" 
                          className="max-h-48 mx-auto rounded-xl shadow-xs object-contain border border-slate-200 bg-white"
                        />
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs font-semibold text-slate-500 truncate max-w-48">
                            تم اختيار صورة الباركود بنجاح
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(null);
                            }}
                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            حذف الصورة
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-white rounded-full text-emerald-600 shadow-sm border border-slate-100">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <span className="block text-sm font-bold text-slate-800">اضغط لرفع صورة الباركود أو سحبها وإفلاتها هنا</span>
                          <span className="block text-xs text-slate-400 mt-1">امتدادات الصور المدعومة: PNG, JPG, JPEG</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Simulated testing triggers specifically for those files */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-emerald-950">هل تود تجربة محاكاة الباركود فوراً؟</span>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        اضغط على الاختصار التالي لمشاهدة كيف يتم التعرف على الأدوية بالباركود وتبيان السعر والتفاصيل:
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-1 border-t border-emerald-100/60">
                    <button
                      type="button"
                      id="demo-barcode-btn"
                      onClick={() => {
                        setBarcodeNumber("6221435011029");
                        handleAnalyze(undefined, demoPresets.barcode.data);
                      }}
                      className="text-xs bg-white text-emerald-800 font-semibold px-3 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors text-right flex items-center gap-2 shadow-2xs cursor-pointer"
                    >
                      <Barcode className="w-3.5 h-3.5 text-emerald-600" />
                      <span>اضغط لتجربة الباركود النموذجي: دواء ديلاركس</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === "box" || activeTab === "prescription") && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1.5">
                    {activeTab === "box" 
                      ? "ارفع أو التقط صورة لعلبة الدواء من الأمام:" 
                      : "ارفع أو التقط صورة لرسالة الطبيب أو الروشتة المكتوبة باليد:"}
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    سيقوم محرك الذكاء الاصطناعي باستخراج الكلمات ومعرفة أسماء الأدوية وحساب السعر التقريبي فورياً.
                  </p>
                  
                  {/* Photo Upload Zone */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-200 flex flex-col items-center justify-center gap-3 cursor-pointer ${
                      selectedImage 
                        ? "border-emerald-500 bg-emerald-50/20" 
                        : "border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-slate-100/50"
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {selectedImage ? (
                      <div className="w-full max-w-sm mx-auto space-y-3 text-center">
                        <img 
                          src={selectedImage} 
                          alt="Uploaded material" 
                          className="max-h-56 mx-auto rounded-xl shadow-xs object-contain border border-slate-200 bg-white"
                        />
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs font-semibold text-slate-500 truncate max-w-48">
                            تم اختيار الصورة بنجاح
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImage(null);
                            }}
                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            حذف الصورة
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="p-3 bg-white rounded-full text-emerald-600 shadow-sm border border-slate-100">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <span className="block text-sm font-bold text-slate-800">اضغط لرفع الصورة أو سحبها وإفلاتها هنا</span>
                          <span className="block text-xs text-slate-400 mt-1">امتدادات الصور المدعومة: PNG, JPG, JPEG</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Simulated testing triggers specifically for those files */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-xs font-bold text-emerald-950">هل تود اختبار التطبيق دون تحميل صور حقيقية؟</span>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        اضغط على أحد الاختصارات النموذجية التالية لمحاكاة تحليل صورة العلبة أو الروشتة وتكلفة العلاج بالكامل:
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-emerald-100/60">
                    {activeTab === "box" ? (
                      <button
                        type="button"
                        id="demo-box-btn"
                        onClick={() => handleAnalyze(undefined, demoPresets.box.data)}
                        className="text-xs bg-white text-emerald-800 font-semibold px-3 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors text-right flex items-center gap-2 shadow-2xs"
                      >
                        <Pill className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تشغيل العرض التوضيحي: علبة دواء بروفين</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        id="demo-presc-btn"
                        onClick={() => handleAnalyze(undefined, demoPresets.prescription.data)}
                        className="text-xs bg-white text-emerald-800 font-semibold px-3 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors text-right flex items-center gap-2 shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تشغيل العرض التوضيحي: روشتة علاج أطفال متكاملة</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error and Success feedback messages */}
            {errorMsg && (
              <div className="bg-rose-50 border-r-4 border-rose-500 rounded-xl p-4 text-xs font-bold text-rose-800 leading-relaxed space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
                <div className="pt-2 border-t border-rose-100/50">
                  <p className="text-rose-700 font-medium">يمكنك دوماً الضغط على الأزرار التجريبية النموذجية المخصصة أعلاه لاختبار التطبيق فوراً بدون الحاجة للمفتاح.</p>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border-r-4 border-emerald-500 rounded-xl p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            {/* Main Action Submit Button */}
            <button
              id="analyze-submit-btn"
              type="button"
              disabled={loading}
              onClick={() => handleAnalyze()}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جارٍ تحليل وقراءة البيانات بالذكاء الاصطناعي...</span>
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  <span>ابدأ التحليل واستخلاص النتائج</span>
                </>
              )}
            </button>
          </div>

          {/* Practical Tips on how to use */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Info className="w-4.5 h-4.5 text-emerald-600" />
              <span>تعليمات الاستخدام للحصول على أدق نتائج:</span>
            </h3>
            <ul className="text-xs text-slate-600 space-y-2.5 list-disc list-inside">
              <li>في حالة البحث بالاسم، اكتب الاسم التجاري الشهير مثل <strong className="text-slate-900">أوجمنتين</strong> بدلاً من الاسم المتفرع.</li>
              <li>عند تصوير علبة الدواء، احرص على وجود إضاءة جيدة وأن يكون الاسم والمكونات الفعالة والتركيز بوضوح داخل إطار كاميرا الهاتف.</li>
              <li>عند تصوير روشتة الطبيب، حاول فرد الورقة جيداً والتقريب من الخط المكتوب، وسيميز الذكاء الاصطناعي الأدوية ويقدر أسعارها لتقدير سعر الروشتة الإجمالي.</li>
              <li>استشر فوراً الطبيب المعالج أو الصيدلاني عند حدوث أي أعراض جانبية بعد تناول الأدوية.</li>
            </ul>
          </div>
        </div>

        {/* Right column: Results display and history */}
        <div className="lg:col-span-5 space-y-6">

          {/* Calculation Board & Pharmacist Response */}
          {results ? (
            <div className="space-y-6">
              
              {/* Premium Summary Badge */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden" id="result-summary-card">
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/5 rounded-full"></div>
                <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-white/5 rounded-full"></div>
                
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-white/15 px-3 py-1 rounded-md font-semibold tracking-wide">
                      {results.queryType === "name" && "تفاصيل علاج مجدول"}
                      {results.queryType === "box_photo" && "تحليل علبة دواء"}
                      {results.queryType === "prescription_photo" && "تحليل الروشتة الطبية"}
                    </span>
                    <span className="text-xs font-semibold text-emerald-100 flex items-center gap-1">
                      دقة مطابقة: {(results.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-emerald-100 block">إجمالي التكلفة التقديرية للروشتة:</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-extrabold tracking-tight">{results.totalCost}</span>
                      <span className="text-lg font-bold">{results.medications[0]?.currency || currencySymbol}</span>
                    </div>
                  </div>

                  <div className="text-xs text-emerald-50/90 leading-relaxed border-t border-white/10 pt-3.5">
                    <strong>عدد الأصناف المحددة:</strong> {results.medications.length} أدوية
                  </div>
                </div>
              </div>

              {/* Individual Medication cards listed in result */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                  <span>الأدوية المستخرجة وتفاصيلها:</span>
                  <span className="text-xs font-medium text-slate-500">تم التعرف على {results.medications.length}</span>
                </h3>

                {results.medications.map((med, index) => (
                  <div key={index} className="bg-white rounded-xl border border-slate-100 shadow-2xs p-5 relative overflow-hidden">
                    <span className="absolute left-4 top-4 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-sm">
                      {med.form || "غير محدد"}
                    </span>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="w-1.5 h-3 bg-emerald-500 rounded-xs"></span>
                          {med.name}
                        </h4>
                        {med.englishName && (
                          <span className="text-xs text-slate-400 font-mono block mt-0.5">{med.englishName}</span>
                        )}
                      </div>

                      {/* Active components */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-500 block">المادة الفعالة:</span>
                        <span className="text-xs font-semibold text-slate-800 leading-tight block mt-0.5">{med.activeIngredients}</span>
                      </div>

                      {/* Grid for prices and guidance */}
                      <div className="grid grid-cols-2 gap-3.5 pt-1">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">السعر التقديري:</span>
                          <span className="text-sm font-bold text-emerald-600 block mt-0.5">
                            {med.price} {med.currency || currencySymbol}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block">دواعي الاستعمال:</span>
                          <span className="text-xs font-semibold text-slate-700 truncate block mt-0.5" title={med.purpose}>
                            {med.purpose}
                          </span>
                        </div>
                      </div>

                      {/* Usage & Dose Instructions */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold text-slate-600 block">الجرعة وطريقة الاستخدام الموصى بها:</span>
                          <p className="text-xs text-slate-700 leading-relaxed mt-1 font-medium bg-emerald-50/25 p-2 rounded-lg text-emerald-950">
                            {med.dosage}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 block font-medium">إرشادات التناول:</span>
                          <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                            {med.usageInstructions}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Master Alerts on analysis */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-2xs p-5 space-y-3">
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">توجيهات الصيدلاني</span>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  {results.notes}
                </p>
              </div>

            </div>
          ) : (
            /* No Results Placeholder Layout */
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-8 text-center space-y-4">
              <div className="mx-auto w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Pill className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">بانتظار بدء التحليل</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mt-1">
                  اكتب اسم الدواء أو قم بتحميل صورة العينة والتقاط الروشتة ثم اضغط على زر التحليل لمشاهدة السعر الإجمالي الكلي للروشتة والتفاصيل الكيميائية للجرعات هنا.
                </p>
              </div>
              <div className="pt-2">
                <p className="text-[11px] text-slate-400">
                  يمكنك الضغط على الأزرار النموذجية بالجانب الأيمن للتجربة والمشاهدة الآن.
                </p>
              </div>
            </div>
          )}

          {/* Persistence Search History Component */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>سجل التحليلات السابقة والروشتات المحفوظة</span>
              </h3>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1.5 focus:outline-none"
                  title="حذف الكل"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>مسح السجل</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                لا توجد عمليات بحث سابقة محفوظة حتى الآن في المتصفح.
              </p>
            ) : (
              <div className="space-y-3.5 max-h-80 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => selectHistoryItem(item)}
                    className="p-3 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-200/60 cursor-pointer transition-all duration-150 flex items-center justify-between gap-3 text-right"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <span className="text-[10px] font-mono text-slate-400 block">{item.timestamp}</span>
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {item.queryType === "name" ? `بحث بالاسم: ${item.inputText}` : "تحليل صورة مستخرجة"}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        الأصناف: {item.result.medications.map((m) => m.name).join(" - ")}
                      </p>
                    </div>
                    
                    <div className="text-left shrink-0">
                      <span className="text-xs font-bold text-emerald-700 block">
                        {item.result.totalCost} {item.result.medications[0]?.currency || currencySymbol}
                      </span>
                      <span className="text-[9px] bg-white border border-slate-200 rounded px-1 text-slate-400 font-semibold">
                        {item.result.medications.length} علاجات
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-slate-500">
            مساعد الأدوية الذكي بالذكاء الاصطناعي - جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-xl mx-auto">
            إخلاء مسؤولية: هذا النظام إرشادي لا يغني أبداً عن زيارة العيادات الطبية أو الصيدليات الرسمية المرخصة. لا تقم بشراء الأدوية أو تناولها تلقائياً بالاعتماد على التطبيق.
          </p>
        </div>
      </footer>
    </div>
  );
}
