import { useState } from 'react';
import { Section } from './Section';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
    { question: "Is the property pet-friendly?", answer: "Yes, we are a pet-friendly homestay. We understand that pets are part of the family." },
    { question: "What are the check-in and check-out times?", answer: "Check-in is at 12:00 PM and check-out is at 11:00 AM. Early check-in or late check-out may be available upon request." },
    { question: "Is parking available?", answer: "Yes, providing free and secure parking for all our guests." },
    { question: "How far is the Mall of Dehradun?", answer: "We are located very close to the Mall of Dehradun, making it easy for you to enjoy shopping and entertainment nearby." },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <Section className="bg-[#F9F7F2]">
            <h2 className="font-serif text-3xl text-center mb-12 text-[#2D2D2D]">Frequently Asked Questions</h2>
            <div className="max-w-2xl mx-auto space-y-4">
                {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-[#2D2D2D]/10 pb-4">
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full flex justify-between items-center text-left text-lg font-serif text-[#2D2D2D] hover:text-[#D4AF37] transition-colors"
                        >
                            {faq.question}
                            <motion.div
                                animate={{ rotate: openIndex === index ? 180 : 0 }}
                            >
                                <ChevronDown size={20} className="opacity-50" />
                            </motion.div>
                        </button>
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <p className="pt-4 text-[#555] font-sans font-light leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </Section>
    );
}
