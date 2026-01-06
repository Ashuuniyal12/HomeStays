import { Section } from './Section';
import { motion } from 'framer-motion';

export default function DiningAmenities() {
    return (
        <section className="relative w-full h-[80vh] overflow-hidden">
            <div className="absolute inset-0">
                <img
                    src="/dining.png"
                    alt="Fine Dining"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="font-serif text-4xl md:text-6xl text-white mb-6"
                >
                    Dining Crafted With Care
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-sans text-white/90 text-lg max-w-2xl font-light leading-relaxed"
                >
                    Our culinary team selects only the freshest local ingredients to create dishes that comfort the soul and delight the palate. Experience dining where every flavor tells a story.
                </motion.p>
            </div>
        </section>
    );
}
