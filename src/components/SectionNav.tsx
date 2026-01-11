import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'why-us', label: 'Why Us' },
  { id: 'stats', label: 'Stats' },
  { id: 'menu', label: 'Menu' },
  { id: 'events', label: 'Events' },
  { id: 'chefs', label: 'Chefs' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'booking', label: 'Booking' },
  { id: 'contact', label: 'Contact' },
];

const SectionNav = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [visibleSections, setVisibleSections] = useState<string[]>([]);

  useEffect(() => {
    // Check which sections exist in the DOM
    const existingSections = sections.filter(s => document.getElementById(s.id));
    setVisibleSections(existingSections.map(s => s.id));

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (const section of [...existingSections].reverse()) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayedSections = sections.filter(s => visibleSections.includes(s.id));

  if (displayedSections.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-end gap-3"
    >
      {displayedSections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className="group flex items-center gap-3"
          aria-label={`Navigate to ${section.label}`}
        >
          {/* Label tooltip */}
          <span className="text-sm font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {section.label}
          </span>
          
          {/* Dot indicator */}
          <div className="relative">
            <motion.div
              className={`w-3 h-3 rounded-full border-2 transition-colors duration-300 ${
                activeSection === section.id
                  ? 'bg-primary border-primary'
                  : 'bg-transparent border-muted-foreground/40 group-hover:border-primary/60'
              }`}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            />
            
            {/* Active glow */}
            {activeSection === section.id && (
              <motion.div
                layoutId="activeGlow"
                className="absolute inset-0 bg-primary rounded-full blur-sm opacity-50"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </div>
        </button>
      ))}
      
      {/* Connecting line */}
      <div className="absolute right-[5px] top-0 bottom-0 w-px bg-muted-foreground/20 -z-10" />
    </motion.nav>
  );
};

export default SectionNav;
