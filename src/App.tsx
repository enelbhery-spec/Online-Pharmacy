import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MainContent from "./components/MainContent";
// تأكد من استيراد المكونات الجديدة التي أنشأناها
import { Terms, Privacy } from "./components/LegalPages"; 

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        {/* الهيدر يظهر دائماً في الأعلى */}
        <Header />

        {/* المحتوى الرئيسي يتغير بناءً على الرابط الحالي */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<MainContent />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>

        {/* الفوتر يظهر دائماً في الأسفل */}
        <Footer />
      </div>
    </Router>
  );
}