import { Section } from './Section';
import { motion } from 'framer-motion';

const rooms = [
    { name: 'Deluxe King Room', image: '/room-std.png' },
    { name: 'Superior Double Room', image: '/room-alt.png' },
    { name: 'Superior Family Room', image: '/room-std.png' },
    { name: 'Deluxe Double Room', image: '/room-alt.png' },
    { name: 'Deluxe Room', image: '/room-std.png' },
    { name: 'Double Room', image: '/room-alt.png' },
    { name: 'Deluxe Family Room', image: '/room-std.png' },
];

export default function RoomsPreview() {
    return (
        <Section id="rooms" className="bg-white">
            <div className="text-center mb-16">
                <h2 className="font-serif text-4xl text-[#2D2D2D] mb-4">Our Exquisite Collections</h2>
                <p className="font-sans text-[#555] max-w-2xl mx-auto font-light">
                    Each room is a masterpiece of comfort, designed to offer a serene escape from the everyday.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {rooms.map((room, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative overflow-hidden aspect-[4/3] cursor-default"
                    >
                        <img
                            src={room.image}
                            alt={room.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="font-serif text-2xl tracking-wide">{room.name}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Section>
    );
}
