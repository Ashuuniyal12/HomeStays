import { Section } from './Section';
import { Link } from 'react-router-dom';

export default function ContactFooter() {
    return (
        <footer id="contact" className="bg-[#1A1A1A] text-[#E5E5E5]">
            <Section className="py-24">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Brand */}
                    <div>
                        <h3 className="font-serif text-3xl text-white mb-6">Laxmi Jawahar Homestay</h3>
                        <p className="font-sans text-sm text-white/60 leading-relaxed font-light">
                            A refined escape designed for the modern traveler seeking peace and comfort.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-sans text-xs uppercase tracking-widest text-[#D4AF37] mb-6">Explore</h4>
                        <div className="flex flex-col space-y-3">
                            <a href="#" className="font-serif text-white/80 hover:text-white transition-colors">Home</a>
                            <a href="#about" className="font-serif text-white/80 hover:text-white transition-colors">About</a>
                            <a href="#rooms" className="font-serif text-white/80 hover:text-white transition-colors">Rooms</a>
                            <Link to="/login" className="font-serif text-white/80 hover:text-white transition-colors">Login</Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-sans text-xs uppercase tracking-widest text-[#D4AF37] mb-6">Contact</h4>
                        <div className="space-y-4 font-light text-sm text-white/80">
                            <p>H.n 05, Sidhpuram, Lane No. 1, <br />Near SBI, Harrawala,<br />Uttarakhand 248005</p>
                            <p>089797 00206</p>
                            <p>hello@laxmijawahar.com</p>
                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-sans text-xs uppercase tracking-widest text-[#D4AF37] mb-6">Legal</h4>
                        <div className="flex flex-col space-y-3">
                            <a href="#" className="font-sans text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="font-sans text-sm text-white/60 hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>

                </div>

                <div className="mt-20 pt-8 border-t border-white/10 text-center text-xs text-white/40 font-light tracking-widest">
                    © {new Date().getFullYear()} HOMESTAY MANAGEMENT. ALL RIGHTS RESERVED.
                </div>
            </Section>
        </footer>
    );
}
