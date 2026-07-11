import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">


                <div className="text-xl font-bold">RDC</div>


                <ul className={`flex-1 flex justify-end gap-6 md:static absolute bg-slate-900 w-full left-0 top-full transition-all duration-300
                ${isOpen ? 'flex flex-col items-center py-4' : 'hidden md:flex'}
    `}>
                    <li><Link to="/admin" className="hover:text-sky-400">لوحة الإدارة</Link></li>
                    <li><Link to="/book" className="hover:text-sky-400">احجز ميعاد</Link></li>
                    <li><Link to="/" className="hover:text-sky-400">الرئيسية</Link></li>
                    
                    
                </ul>

                {/* زرار المنيو (للموبايل) */}
                <button className="md:hidden text-2xl ml-4" onClick={() => setIsOpen(!isOpen)}>
                    ☰
                </button>
            </div>
        </nav>
    );
}