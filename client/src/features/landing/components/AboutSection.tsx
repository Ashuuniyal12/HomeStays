import { Section } from './Section';
import { motion } from 'framer-motion';

export default function AboutSection() {
    return (
        <Section id="about" className="bg-[#F9F7F2]">
            <div className="grid md:grid-cols-2 gap-16 items-center">
                {/* Text Column */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="font-serif text-4xl text-[#2D2D2D] mb-8 leading-snug">
                        Your Home in <br /> Dehradun
                    </h2>
                    <div className="font-sans text-[#555] space-y-6 text-lg font-light leading-relaxed">
                        <p>
                            Located near Sidhpuram and the Mall of Dehradun, Laxmi Jawahar Homestay offers a perfect blend of accessibility and tranquility. We pride ourselves on providing a clean, hygienic environment where every guest is treated like family.
                        </p>
                        <p>
                            Experience the warmth of a true homestay with modern comforts. Enjoy panoramic mountain views from your private balcony, spacious rooms, and event spaces for your gatherings. Whether for a vacation or a stopover, we ensure a memorable stay.
                        </p>
                    </div>
                </motion.div>

                {/* Decorative Space / Minimal Image Placeholder if needed, 
            but prompt said 'text-heavy, image-light', so we can use a quote or minimal graphic */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="hidden md:flex justify-center items-center h-full border-l border-[#D4AF37]/30 pl-16"
                >
                    <blockquote className="font-serif text-2xl italic text-[#8A8A8A] text-center max-w-sm">
                        "A peaceful retreat with thoughtful service."
                        <footer className="text-sm font-sans mt-4 text-[#D4AF37] not-italic uppercase tracking-widest">
                            - Our Promise
                        </footer>
                    </blockquote>
                </motion.div>
            </div>
        </Section>
    );
}
