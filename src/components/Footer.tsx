import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-8 mt-12">
      <div className="container mx-auto px-6 text-center">
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">مساعد الأدوية</h2>
          <p className="text-blue-200 text-sm mb-6 max-w-md">
            دليلك الذكي للحصول على معلومات دقيقة ومختصرة حول الأدوية المعتمدة.
          </p>

          {/* إخلاء المسؤولية - هام جداً للتطبيقات الطبية */}
          <p className="text-blue-300 text-xs mb-6 max-w-2xl leading-relaxed italic">
            تنبيه: هذا التطبيق يوفر معلومات استرشادية فقط ولا يغني عن استشارة الطبيب أو الصيدلي المختص. 
            يُرجى عدم اتخاذ أي قرارات طبية بناءً على هذه النتائج.
          </p>
          
          {/* الروابط المحدثة للربط مع react-router-dom */}
          <div className="flex gap-6 mb-6">
            <Link to="/privacy" className="hover:text-blue-400 transition underline decoration-blue-500">
              سياسة الخصوصية
            </Link>
            <Link to="/terms" className="hover:text-blue-400 transition underline decoration-blue-500">
              شروط الاستخدام
            </Link>
          </div>

          <p className="text-blue-400 text-sm">
            © {new Date().getFullYear()} جميع الحقوق محفوظة -صيدلية اون لاين الذكي
          </p>
        </div>
      </div>
    </footer>
  );
}