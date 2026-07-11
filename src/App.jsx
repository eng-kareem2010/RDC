import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import UserConsultation from './components/UserConsultation';
import ClinicAdminDashboard from './components/ClinicAdminDashboard';
import './MolarStyles.css';
import orthoImg from './assets/imgs/Ortho.jpg';
import childrenImg from './assets/imgs/Children.jpg';
import implantsImg from './assets/imgs/Implants.avif';
function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Hero Section */}
            <header className="bg-white py-20 px-6 text-center shadow-sm">
                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
                    ابتسامتك تبدأ من هنا في <span className="text-sky-500">RDC</span>
                </h1>
                <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
                    نقدم لكم أفضل خدمات طب الأسنان بأحدث التقنيات وبأيدٍ خبيرة لضمان راحتكم وجمال ابتسامتكم.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link to="/book" className="px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition">
                        احجز استشارتك الآن 📅
                    </Link>
                </div>
            </header>
            <section className="py-16 px-6 container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">خدماتنا المميزة</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "زراعة وتجميل",
                            img: implantsImg,
                            desc: "أحدث تقنيات زراعة الأسنان وتصميم الابتسامة.",
                            doctor:"د. رفيق رمضان استشاري زراعة و تركيب الأسنان بجامعة طنطا"
                        },
                        {
                            title: "علاج الأطفال",
                            img: childrenImg,
                            desc: "رعاية خاصة لصحة أسنان أطفالكم ببيئة مريحة.",
                            doctor:"د. أحمد دكتور بجامعة طنطا"
                        },
                        {
                            title: "تقويم الأسنان",
                            img: orthoImg,
                            desc: "حلول تقويم متطورة للحصول على صف أسنان مثالي.",
                            doctor:"د. محمد السحرتي استشاري تقويم أسنان جامعة طنطا"
                        }
                    ].map((service, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition">
                            {/* الصورة هنا */}
                            <img src={service.img} alt={service.title} className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                                <p className="text-gray-600">{service.desc}</p>
                                <p className="mt-3 text-black-600">{service.doctor}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="py-16 bg-sky-600 text-white px-6 text-center">
                <div className="container mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold">نحن هنا لنعتني بابتسامتك كل يوم</h2>
                    <p className="mt-4 text-sky-100 italic">مركز الدكتور رفيق رمضان لطب و جراحة الأسنان - المحلة الكبرى -  برج زمزم الدور الثاني</p>
                    <p className="mt-4 text-sky-100 italic">جميع الحقوق محفوظة لمركز الدكتور رفيق رمضان &#169; 2026</p>
                </div>
            </section>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/book" element={<UserConsultation />} />
                <Route path="/admin" element={<ClinicAdminDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer position="top-right" rtl={true} autoClose={3000} theme="colored" />
        </BrowserRouter>
    );
}