import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import WhyUsSection from '@/components/WhyUsSection';
import StatsSection from '@/components/StatsSection';
import MenuSection from '@/components/MenuSection';
import EventsSection from '@/components/EventsSection';
import ChefsSection from '@/components/ChefsSection';
import GallerySection from '@/components/GallerySection';
import BookingSection from '@/components/BookingSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      {/* Pure Veg Badge - always visible */}
      <div className="fixed bottom-4 left-4 z-40 bg-primary text-primary-foreground px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
        <Leaf className="h-5 w-5" />
        <span className="font-medium text-sm">100% Pure Veg</span>
      </div>
      
      <AboutSection />
      <WhyUsSection />
      <StatsSection />
      <MenuSection />
      
      {/* Show full features only for logged in users */}
      {user ? (
        <>
          <EventsSection />
          <ChefsSection />
          <GallerySection />
          <BookingSection />
        </>
      ) : (
        <section className="py-20 bg-section">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <Leaf className="h-16 w-16 text-primary mx-auto mb-6" />
              <h2 className="font-heading text-3xl md:text-4xl mb-4">
                Join Our <span className="text-primary">Vegetarian Family</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Sign up or login to explore our events, meet our chefs, view gallery, and book your table for an authentic pure vegetarian dining experience.
              </p>
              <a 
                href="/auth" 
                className="btn-book inline-block"
              >
                Login / Sign Up
              </a>
            </div>
          </div>
        </section>
      )}
      
      <ContactSection />
      <Footer />
      {user && <ChatWidget />}
    </div>
  );
};

export default Index;
