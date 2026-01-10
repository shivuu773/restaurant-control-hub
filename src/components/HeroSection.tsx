import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroFood from '@/assets/hero-food.png';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const HeroSection = () => {
  const { settings } = useSiteSettings();

  const scrollToBooking = () => {
    const element = document.getElementById('book-a-table');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Parse title to add highlight
  const titleParts = settings.hero_title.split(' ');
  const firstPart = titleParts.slice(0, Math.ceil(titleParts.length / 2)).join(' ');
  const secondPart = titleParts.slice(Math.ceil(titleParts.length / 2)).join(' ');

  return (
    <section id="hero" className="relative min-h-screen flex items-center bg-section pt-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left order-2 lg:order-1"
          >
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {firstPart}
              <br />
              <span className="text-primary">{secondPart || settings.hero_subtitle}</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto lg:mx-0">
              {settings.hero_description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button onClick={scrollToBooking} className="btn-book">
                Book a Table
              </Button>
              <Button
                variant="outline"
                className="group border-primary/50 hover:border-primary"
                onClick={() => window.open(settings.hero_video_url, '_blank')}
              >
                <span className="flex items-center">
                  <span className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                    <Play className="h-4 w-4 text-primary-foreground ml-0.5" />
                  </span>
                  Watch Video
                </span>
              </Button>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 flex justify-center"
          >
            <div className="relative group">
              {/* Glowing background effect */}
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl scale-110 group-hover:bg-primary/40 transition-colors duration-500" />
              {/* Rotating decorative ring */}
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-primary/20 scale-110 animate-spin-slow" />
              {/* Static decorative ring */}
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 scale-105 group-hover:scale-110 transition-transform duration-500" />
              {/* Main circular image container */}
              <div className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] rounded-full overflow-hidden border-4 border-primary/50 shadow-2xl shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-500 cursor-pointer">
                <img
                  src={heroFood}
                  alt="Delicious Indian vegetarian thali"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              {/* Floating decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary rounded-full animate-float shadow-lg shadow-primary/50" />
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-accent rounded-full animate-float shadow-lg shadow-accent/50" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 -right-6 w-4 h-4 bg-primary/70 rounded-full animate-float" style={{ animationDelay: '0.5s' }} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
