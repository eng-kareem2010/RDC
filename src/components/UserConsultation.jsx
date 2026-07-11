import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import '../MolarStyles.css';

export default function UserConsultation() {
    const [specialty, setSpecialty] = useState('أسنان كبير');
    const [availableDates, setAvailableDates] = useState([]);
    const [chosenDate, setChosenDate] = useState('');
    const [slots, setSlots] = useState([]);
    const [activeSlot, setActiveSlot] = useState(null);
    const [fullname, setFullname] = useState('');
    const [mobile, setMobile] = useState('');

    useEffect(() => {
        async function pullClinicDates() {
            const { data, error } = await supabase.from('available_slots').select('slot_date').eq('is_booked', false);
            if (!error && data) {
                const uniqueDates = [...new Set(data.map(item => item.slot_date))];
                setAvailableDates(uniqueDates);
            }
        }
        pullClinicDates();
    }, []);

    // عند اختيار التخصص، الفلتر هيشتغل تلقائياً
    useEffect(() => {
        async function pullAvailableSlots() {
            if (!chosenDate || !specialty) return;

            // هنا بنجيب المواعيد المتاحة حسب "التخصص" و "التاريخ"
            const { data, error } = await supabase
                .from('available_slots')
                .select('*')
                .eq('slot_date', chosenDate)
                .eq('specialty', specialty); // فلاتر حسب التخصص

            if (data) {
                // فلتر إضافي: استبعاد المواعيد المحجوزة بالفعل لنفس التخصص
                const { data: bookings } = await supabase
                    .from('appointments')
                    .select('slot_id')
                    .eq('specialty', specialty);

                const bookedIds = bookings.map(b => b.slot_id);
                setSlots(data.filter(slot => !bookedIds.includes(slot.id)));
            }
        }
        pullAvailableSlots();
    }, [chosenDate, specialty]); 

    const triggerAppointmentSubmission = async (e) => {
        e.preventDefault();
        if (!activeSlot || !fullname || !mobile) {
            toast.error('يا صاحبي اختار وقتك واكتب بياناتك كاملة أولاً!');
            return;
        }

        const loadToastId = toast.loading('جاري التأكد من إتاحة الميعاد لعيادتك...');

        try {
            // 1. الفحص الصارم: هل الميعاد ده محجوز لنفس التخصص اللي العميل مختاره؟
            const { data: existingBooking, error: fetchError } = await supabase
                .from('appointments')
                .select('id')
                .eq('slot_id', activeSlot)
                .eq('specialty', specialty) // هنا السر: بنفحص الميعاد + التخصص
                .maybeSingle();

            if (fetchError) throw fetchError;

            // لو لقى حجز بنفس التخصص في نفس الميعاد، يرفض
            if (existingBooking) {
                toast.update(loadToastId, {
                    render: `عذراً، الميعاد ده محجوز بالفعل في عيادة ${specialty}.`,
                    type: 'error',
                    isLoading: false,
                    autoClose: 4000
                });
                return;
            }

            // 2. لو مفيش حجز لنفس التخصص، كمل الحجز عادي
            const { error: insertError } = await supabase.from('appointments').insert([{
                patient_name: fullname,
                phone: mobile,
                slot_id: activeSlot,
                specialty: specialty,
                status: 'pending'
            }]);

            if (insertError) throw insertError;

            toast.update(loadToastId, { render: 'تم حجز عيادتك بنجاح! 🎉', type: 'success', isLoading: false, autoClose: 4000 });
            setFullname('');
            setMobile('');
            setActiveSlot(null);
        } catch (err) {
            toast.update(loadToastId, { render: 'حدث خطأ في السيرفر، جرب تاني.', type: 'error', isLoading: false, autoClose: 4000 });
        }
    };

    return (
        <div className="dentist-app-body py-12 px-4" dir="rtl">
            <div className="max-w-xl mx-auto clinical-card-shell">
                <h1 className="text-2xl clinical-main-headline text-center text-sky-600 mb-6"> حجز زيارة للمركز</h1>
                <form onSubmit={triggerAppointmentSubmission} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">تخصص الطبيب:</label>
                        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="dental-clinic-input bg-white font-medium">
                            <option value="أسنان كبير">طبيب أسنان عام (كبير)</option>
                            <option value="أطفال">طب أسنان الأطفال</option>
                            <option value="تقويم">تقويم وتجميل الأسنان</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">التواريخ المتاحة في العيادة:</label>
                        <select value={chosenDate} onChange={(e) => setChosenDate(e.target.value)} className="dental-clinic-input bg-white font-medium">
                            <option value="">-- اختر من الأيام المتوفرة --</option>
                            {availableDates.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    {chosenDate && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">الساعات المتوفرة للعيادة:</label>
                            {slots.length === 0 ? (
                                <p className="text-sm text-cyan-700 bg-cyan-50 p-3 rounded-xl text-center">لا يوجد ساعات متوفرة في هذا اليوم حالياً.</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {slots.map(s => (
                                        <button key={s.id} type="button" onClick={() => setActiveSlot(s.id)} className={`tooth-action-trigger ${activeSlot === s.id ? 'selected-molar' : 'bg-slate-50 text-slate-700'}`}>
                                            {s.start_time.substring(0, 5)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {activeSlot && (
                        <div className="space-y-4 border-t pt-4">
                            <input type="text" placeholder="اسمك الكريم" value={fullname} onChange={(e) => setFullname(e.target.value)} className="dental-clinic-input" />
                            <input type="tel" placeholder="رقم الهاتف للتواصل وسرعة التأكيد" value={mobile} onChange={(e) => setMobile(e.target.value)} className="dental-clinic-input" />
                            <button type="submit" className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-all shadow-md">🎯 تأكيد حجز الاستشارة فوراً</button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}