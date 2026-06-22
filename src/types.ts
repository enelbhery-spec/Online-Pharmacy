export interface MedicationDetails {
  name: string; // اسم الدواء العربي
  englishName?: string; // اسم الدواء الإنجليزي المعادل
  activeIngredients: string; // مكونات الدواء الفعالة
  price: number; // السعر التقريبي بالعملة المحلية (مثال: جنيه مصري أو ريال سعودي)
  currency: string; // العملة المستخدمة (مثال: ج.م أو ر.س)
  usageInstructions: string; // طريقة الاستخدام
  dosage: string; // الجرعات المعتادة وطريقة التناول
  form: string; // شكل الدواء (أقراص، شراب، حقن، مرهم، إلخ)
  purpose: string; // دواعي الاستعمال الأساسية
}

export interface AnalysisResponse {
  queryType: 'name' | 'box_photo' | 'prescription_photo' | 'barcode';
  medications: MedicationDetails[];
  totalCost: number; // المجموع الكلي لأسعار الأدوية في الروشتة
  confidenceScore: number; // نسبة الدقة لعملية التعرف
  notes: string; // تنبيهات طبية هامة أو إرشادات للاستخدام بأمان باللغة العربية
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  queryType: 'name' | 'box_photo' | 'prescription_photo' | 'barcode';
  inputText?: string;
  imageUrl?: string;
  result: AnalysisResponse;
}
