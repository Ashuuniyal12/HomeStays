import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '#about' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-sans ${isScrolled ? 'bg-[#F9F7F2]/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
                {/* Brand */}
                <Link
                    to="/"
                    className={`font-serif text-2xl tracking-widest uppercase font-semibold transition-colors ${isScrolled ? 'text-[#2D2D2D]' : 'text-white'
                        }`}
                >
                    Laxmi Jawahar
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className={`text-sm tracking-wide transition-colors hover:opacity-75 ${isScrolled ? 'text-[#2D2D2D]' : 'text-white/90'
                                }`}
                        >
                            {link.name}
                        </a>
                    ))}

                    <Link
                        to="/login"
                        className={`px-6 py-2.5 text-sm tracking-wide border transition-all duration-300 ${isScrolled
                            ? 'border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-[#F9F7F2]'
                            : 'border-white text-white hover:bg-white hover:text-[#2D2D2D]'
                            }`}
                    >
                        Login
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <div className={`w-6 h-0.5 mb-1.5 transition-all ${isScrolled || mobileMenuOpen ? 'bg-[#2D2D2D]' : 'bg-white'}`}></div>
                    <div className={`w-6 h-0.5 mb-1.5 transition-all ${isScrolled || mobileMenuOpen ? 'bg-[#2D2D2D]' : 'bg-white'}`}></div>
                    <div className={`w-6 h-0.5 transition-all ${isScrolled || mobileMenuOpen ? 'bg-[#2D2D2D]' : 'bg-white'}`}></div>
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-[#F9F7F2] shadow-lg p-6 md:hidden flex flex-col space-y-4 items-center"
                    >
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-[#2D2D2D] text-lg font-light"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <Link
                            to="/login"
                            className="px-8 py-3 bg-[#2D2D2D] text-[#F9F7F2] text-sm tracking-widest mt-4 w-full text-center"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            LOGIN
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
