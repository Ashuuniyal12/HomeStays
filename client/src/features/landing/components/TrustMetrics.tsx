import { Section } from './Section';

export default function TrustMetrics() {
    const metrics = [
        { label: "Guest Rating on Google", value: "4.9/5" },
        { label: "Guest Reviews", value: "100+" },
        { label: "Near Mall of Dehradun", value: "Location" },
    ];

    return (
        <div className="w-full bg-white border-y border-gray-100 py-16">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {metrics.map((metric, index) => (
                    <div key={index} className="pt-8 md:pt-0 md:pl-12 first:pl-0">
                        <p className="font-serif text-5xl text-[#D4AF37] mb-2">{metric.value}</p>
                        <p className="font-sans text-[#2D2D2D] text-sm uppercase tracking-widest">{metric.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
