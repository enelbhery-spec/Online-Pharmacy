import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav dir="rtl" className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* الشعار - عند الضغط عليه يعود للرئيسية */}
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <span className="text-white font-bold text-xl">💊</span>
          </div>
          <span className="text-blue-900 font-bold text-2xl tracking-tight">
           صيدلية اون لاين
          </span>
        </Link>

        {/* القائمة */}
        <div className="flex items-center gap-6 text-gray-600 font-medium">
          <Link to="/" className="hover:text-blue-600 transition-colors">الرئيسية</Link>
          <Link to="/terms" className="hover:text-blue-600 transition-colors">حول التطبيق</Link>
          {/* يمكنك ربط زر "اتصل بنا" بصفحة جديدة لاحقاً أو تركه كما هو */}
          <button className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-all shadow-md">
            اتصل بنا
          </button>
        </div>
      </nav>
    </header>
  );
}