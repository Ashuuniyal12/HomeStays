import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Background Image with Parallax Scale */}
            <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: "easeOut" }}
                className="absolute inset-0 z-0"
            >
                <img
                    src="/hero-bg.png"
                    alt="Luxury Bedroom"
                    className="w-full h-full object-cover"
                />
                {/* Soft Overlay */}
                <div className="absolute inset-0 bg-black/30 bg-gradient-to-b from-black/40 via-transparent to-black/20" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    {/* Trust Text */}
                    <div className="flex items-center gap-2 justify-center mb-6 text-white/80 text-sm tracking-widest font-light uppercase">
                        <span className="text-[#D4AF37]">★★★★★</span> 4.9/5 Rating on Google
                    </div>

                    {/* Main Heading */}
                    <h1 className="font-serif text-5xl md:text-7xl text-white mb-6 leading-tight max-w-4xl">
                        Welcome to <br className="hidden md:block" /> Laxmi Jawahar Homestay
                    </h1>

                    {/* Subheading */}
                    <p className="font-sans text-white/90 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
                        A refined homestay experience in the heart of Harrawala, Dehradun.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
