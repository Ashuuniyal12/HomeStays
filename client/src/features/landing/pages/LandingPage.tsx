import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import TrustMetrics from '../components/TrustMetrics';
import RoomsPreview from '../components/RoomsPreview';
import DiningAmenities from '../components/DiningAmenities';
import AmenitiesGrid from '../components/AmenitiesGrid';
import Gallery from '../components/Gallery';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import ContactFooter from '../components/ContactFooter';

export default function LandingPage() {
    return (
        <div className="min-h-screen w-full bg-[#F5F5F7] font-sans">
            <Navbar />
            <Hero />
            <AboutSection />
            <TrustMetrics />
            <RoomsPreview />
            <DiningAmenities />
            <AmenitiesGrid />
            <Gallery />
            <Testimonials />
            <FAQ />
            <ContactFooter />
        </div>
    );
}
