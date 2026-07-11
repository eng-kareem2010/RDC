import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';
import '../MolarStyles.css';

export default function ClinicAdminDashboard() {
    const navigate = useNavigate();
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const [newShiftDate, setNewShiftDate] = useState('');
    const [startHour, setStartHour] = useState('17:00');
    const [endHour, setEndHour] = useState('22:00');
    const [duration, setDuration] = useState(30);
    const [specialty, setSpecialty] = useState('أسنان كبير');
    
    const [allClinicSlots, setAllClinicSlots] = useState([]);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookings, setBookings] = useState([]);

    const formatTime12Hour = (timeString) => {
        if (!timeString) return '';
        let [hours, minutes] = timeString.split(':');
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = parseInt(hours) % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    useEffect(() => {
        const session = sessionStorage.getItem('admin_token');
        if (session === 'valid_clinic_key') setIsAdminAuthenticated(true);
    }, []);

    useEffect(() => {
        if (!isAdminAuthenticated) return;
        async function getAdminData() {
            const { data: slotData } = await supabase.from('available_slots').select('*').order('slot_date', { ascending: false });
            if (slotData) setAllClinicSlots(slotData);

            const { data: bookingData } = await supabase.from('appointments').select('*');
            if (bookingData && slotData) {
                const filtered = bookingData.filter(b => {
                    const slot = slotData.find(s => s.id === b.slot_id);
                    return slot?.slot_date === filterDate;
                });
                setBookings(filtered);
            }
        }
        getAdminData();
    }, [isAdminAuthenticated, filterDate]);

    const executeAdminLogin = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase
            .from('admins')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (data) {
            sessionStorage.setItem('admin_token', 'valid_clinic_key');
            setIsAdminAuthenticated(true);
            toast.success('تم تسجيل الدخول بنجاح');
        } else {
            toast.error('هذه البيانات غير مسجلة في النظام من فضلك تأكد من البيانات و أعد المحاولة');
        }
    };

    const createNewShiftSlots = async (e) => {
        e.preventDefault();
        if (!newShiftDate) return;

        let current = new Date(`${newShiftDate}T${startHour}`);
        const finish = new Date(`${newShiftDate}T${endHour}`);
        const generatedBulk = [];

        while (current < finish) {
            const startStr = current.toTimeString().split(' ')[0].substring(0, 5);
            current.setMinutes(current.getMinutes() + parseInt(duration));
            const endStr = current.toTimeString().split(' ')[0].substring(0, 5);
            if (current <= finish) {
                generatedBulk.push({ slot_date: newShiftDate, start_time: startStr, end_time: endStr, specialty: specialty });
            }
        }

        const { error } = await supabase.from('available_slots').insert(generatedBulk);
        if (!error) {
            toast.success('تم إضافة الشفت بنجاح ✔');
            window.location.reload();
        } else {
            toast.error('فشل إضافة الشفت من فضلك حاول مره أخرى ✖');
        }
    };

    const purgeSpecificSlot = async (id) => {
        if (!window.confirm('متأكد من حذف هذه الساعة؟')) return;
        await supabase.from('available_slots').delete().eq('id', id);
        setAllClinicSlots(prev => prev.filter(item => item.id !== id));
        toast.success('تم الحذف.');
    };

    const deleteBooking = async (id) => {
        if (!window.confirm('هل أنت متأكد من إلغاء الحجز؟')) return;
        const { error } = await supabase.from('appointments').delete().eq('id', id);
        if (!error) {
            setBookings(prev => prev.filter(b => b.id !== id));
            toast.success('تم إلغاء الحجز.');
        }
    };

    if (!isAdminAuthenticated) {
        return (
            <div className="dentist-app-body flex items-center justify-center pt-24" dir="rtl">
                <form onSubmit={executeAdminLogin} className="clinical-card-shell p-6 w-96 space-y-4">
                    <h2 className="text-xl font-bold text-center mb-4">تسجيل دخول الإدارة</h2>
                    <input type="text" placeholder="اسم المستخدم" onChange={(e) => setUsername(e.target.value)} className="dental-clinic-input" required />
                    <input type="password" placeholder="كلمة المرور" onChange={(e) => setPassword(e.target.value)} className="dental-clinic-input" required />
                    <button type="submit" className="w-full py-3 bg-slate-800 text-white rounded-xl">دخول</button>
                </form>
            </div>
        );
    }

    return (
        <div className="dentist-app-body p-6" dir="rtl">
            <div className="molar-gradient-top p-6 mb-8 text-white rounded-xl">
                <h1 className="text-2xl font-bold">👨‍⚕️ لوحة تحكم الإدارة</h1>
                <button onClick={() => { sessionStorage.clear(); window.location.reload(); }} className="mt-4 bg-rose-500 p-2 px-4 rounded-lg">تسجيل الخروج</button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="clinical-card-shell">
                    <h3 className="text-lg font-bold text-sky-600 mb-4">⏰ إضافة شفت جديد</h3>
                    <form onSubmit={createNewShiftSlots} className="space-y-3">
                        <input type="date" value={newShiftDate} onChange={(e) => setNewShiftDate(e.target.value)} className="dental-clinic-input" required />
                        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="dental-clinic-input">
                            <option value="أسنان كبير">أسنان كبير</option>
                            <option value="أطفال">أطفال</option>
                            <option value="تقويم">تقويم وتجميل</option>
                        </select>
                        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="dental-clinic-input" placeholder="مدة الكشف بالدقائق" />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} className="dental-clinic-input" />
                            <input type="time" value={endHour} onChange={(e) => setEndHour(e.target.value)} className="dental-clinic-input" />
                        </div>
                        <button type="submit" className="w-full py-2.5 bg-sky-500 text-white rounded-xl">توليد المواعيد</button>
                    </form>
                </div>

                <div className="clinical-card-shell h-96 overflow-y-auto">
                    <h3 className="font-bold mb-4">إدارة الشفتات</h3>
                    {allClinicSlots.map(slot => (
                        <div key={slot.id} className="flex justify-between p-2 border-b text-sm">
                            <span>{slot.slot_date} - {formatTime12Hour(slot.start_time)}</span>
                            <button onClick={() => purgeSpecificSlot(slot.id)} className="text-rose-500">حذف</button>
                        </div>
                    ))}
                </div>

                <div className="clinical-card-shell xl:col-span-3 overflow-x-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-sky-600">📊 كشف المرضى ليوم: {filterDate}</h3>
                        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="p-2 border rounded" />
                    </div>
                    <table className="w-full min-w-[600px] text-right">
                        <thead>
                            <tr className="bg-slate-50 text-slate-600 text-xs font-bold">
                                <th className="p-3">المريض</th>
                                <th className="p-3">التخصص</th>
                                <th className="p-3">الميعاد</th>
                                <th className="p-3">إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(book => (
                                <tr key={book.id} className="border-b text-sm">
                                    <td className="p-3">{book.patient_name}</td>
                                    <td className="p-3">{book.specialty}</td>
                                    <td className="p-3 font-bold text-sky-700">
                                        {formatTime12Hour(allClinicSlots.find(s => s.id === book.slot_id)?.start_time) || "غير متاح"}
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => deleteBooking(book.id)} className="text-white bg-rose-500 px-3 py-1 rounded-lg text-xs">حذف</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
