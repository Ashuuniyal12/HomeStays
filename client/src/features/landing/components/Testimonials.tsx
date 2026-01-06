import { Section } from './Section';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const reviews = [
    {
        author: "Shilpa Pai",
        rating: "5/5",
        text: "Clean bedrooms, really nice location very close to mall of dehradun, and very decent prices per room.",
        platform: "Google"
    },
    {
        author: "Vishwadeep Tyagi",
        rating: "5/5",
        text: "Best homestay to stay in Dehradun. The service was exceptionally on a very high note.",
        platform: "Google"
    },
    {
        author: "Narendra Negi",
        rating: "5/5",
        text: "Highly recommended! The rooms are neat, clean and very well maintained.",
        platform: "Google"
    },
    {
        author: "Upasana",
        rating: "10/10",
        text: "Property is very nice. Staff is very cheerful and humble. Food is beyond my expectations.. it's delicious.",
        platform: "Booking.com"
    },
    {
        author: "Majhi",
        rating: "10/10",
        text: "It was great staying at this homestay, staff is courteous and helpful.. i had no problem.",
        platform: "Booking.com"
    },
    {
        author: "Narinder",
        rating: "10/10",
        text: "Exceptional service by the staff.",
        platform: "Booking.com"
    }
];

export default function Testimonials() {
    return (
        <Section className="bg-white">
            <div className="text-center mb-16">
                <h2 className="font-serif text-4xl text-[#2D2D2D] mb-4">Guest Experiences</h2>
                <p className="font-sans text-[#555] max-w-2xl mx-auto font-light">
                    Stories of comfort and care from those who have stayed with us.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map((review, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="p-8 bg-[#F9F7F2] rounded-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-1 mb-4 text-[#D4AF37]">
                            <Star fill="#D4AF37" size={16} />
                            <Star fill="#D4AF37" size={16} />
                            <Star fill="#D4AF37" size={16} />
                            <Star fill="#D4AF37" size={16} />
                            <Star fill="#D4AF37" size={16} />
                            <span className="ml-2 text-xs text-[#8A8A8A] font-sans tracking-wide">
                                {review.rating} on {review.platform}
                            </span>
                        </div>

                        <p className="font-serif text-[#2D2D2D] text-lg italic mb-6 leading-relaxed">
                            "{review.text}"
                        </p>

                        <div className="font-sans text-sm font-medium text-[#2D2D2D] uppercase tracking-wider">
                            — {review.author}
                        </div>
                    </motion.div>
                ))}
            </div>
        </Section>
    );
}
