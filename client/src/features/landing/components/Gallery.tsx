import { Section } from './Section';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const images = [
    '/hero-bg.png',
    '/dining.webp',
    '/room-std.png',
    '/gallery-1.png',
    '/room-alt.png',
    '/room-2.webp',
    '/outdoor.webp',
    '/room-3.webp',
    '/outdoor-coffee.webp'
];

export default function Gallery() {
    const scrollRef = useRef(null);

    return (
        <div className="py-20 bg-white overflow-hidden">
            <div className="text-center mb-12">
                <h2 className="font-serif text-3xl italic text-[#2D2D2D]">Glimpses of Serenity</h2>
            </div>

            {/* Horizontal Scroll Container */}
            <div
                className="flex gap-4 overflow-x-auto pb-8 px-6 md:px-24 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
            >
                {images.map((img, i) => (
                    <div key={i} className="min-w-[80vw] md:min-w-[40vw] aspect-[16/9] snap-center relative">
                        <img
                            src={img}
                            alt="Gallery"
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
