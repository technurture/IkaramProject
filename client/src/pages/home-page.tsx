import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import FeaturedBlogs from "@/components/featured-blogs";
import UpcomingEvents from "@/components/upcoming-events";
import StaffHighlights from "@/components/staff-highlights";
import CallToAction from "@/components/call-to-action";
import Footer from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturedBlogs />
      <UpcomingEvents />
      <StaffHighlights />
      <CallToAction />
      <Footer />
    </div>
  );
}
