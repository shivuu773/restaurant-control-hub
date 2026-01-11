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
import ParallaxSection from '@/components/ParallaxSection';
import ParallaxBackground from '@/components/ParallaxBackground';
import { useAuth } from '@/contexts/AuthContext';
import { Leaf } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      
      {/* Hero with parallax background */}
      <div className="relative">
        <ParallaxBackground speed={0.3} />
        <HeroSection />
      </div>
      
      {/* Pure Veg Badge - always visible */}
      <div className="fixed bottom-4 left-4 z-40 bg-primary text-primary-foreground px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
        <Leaf className="h-5 w-5" />
        <span className="font-medium text-sm">100% Pure Veg</span>
      </div>
      
      {/* About Section with parallax */}
      <ParallaxSection speed={0.15} direction="up">
        <AboutSection />
      </ParallaxSection>
      
      {/* Why Us Section with parallax */}
      <ParallaxSection speed={0.1} direction="down">
        <WhyUsSection />
      </ParallaxSection>
      
      {/* Stats Section */}
      <ParallaxSection speed={0.2} direction="up">
        <StatsSection />
      </ParallaxSection>
      
      {/* Menu Section with parallax background */}
      <div className="relative">
        <ParallaxBackground speed={0.4} className="opacity-50" />
        <MenuSection />
      </div>
      
      {/* Show full features only for logged in users */}
      {user ? (
        <>
          <ParallaxSection speed={0.15} direction="up">
            <EventsSection />
          </ParallaxSection>
          
          <ParallaxSection speed={0.1} direction="down">
            <ChefsSection />
          </ParallaxSection>
          
          <div className="relative">
            <ParallaxBackground speed={0.35} className="opacity-40" />
            <GallerySection />
          </div>
          
          <ParallaxSection speed={0.2} direction="up">
            <BookingSection />
          </ParallaxSection>
        </>
      ) : (
        <ParallaxSection speed={0.15} direction="up">
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
        </ParallaxSection>
      )}
      
      <ParallaxSection speed={0.1} direction="down">
        <ContactSection />
      </ParallaxSection>
      
      <Footer />
      {user && <ChatWidget />}
    </div>
  );
};

export default Index;
