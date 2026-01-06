import { Section } from './Section';
import { Wifi, Home, MapPin, Coffee, Car, PawPrint } from 'lucide-react';

const amenities = [
    { icon: Wifi, label: 'Free High-Speed Wi-Fi' },
    { icon: Home, label: 'Clean & Hygienic Rooms' },
    { icon: MapPin, label: 'Near Mall of Dehradun' },
    { icon: Coffee, label: 'Terrace & Events' },
    { icon: PawPrint, label: 'Pet Friendly' },
    { icon: Car, label: 'Free Parking' },
];

export default function AmenitiesGrid() {
    return (
        <Section className="bg-[#F9F7F2]">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {amenities.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={index} className="flex flex-col items-center text-center gap-4 group">
                            <div className="p-4 rounded-full bg-[#EAE8E0] text-[#2D2D2D] group-hover:bg-[#D4AF37] group-hover:text-white transition-colors duration-300">
                                <Icon size={24} strokeWidth={1.5} />
                            </div>
                            <span className="font-sans text-sm tracking-wide text-[#2D2D2D]">{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </Section>
    );
}
