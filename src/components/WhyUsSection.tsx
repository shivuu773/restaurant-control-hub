import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const WhyUsSection = () => {
  const { settings } = useSiteSettings();

  return (
    <section className="py-20 bg-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-primary-foreground">
            <h3 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              {settings.why_us_title}
            </h3>
            <p className="text-primary-foreground/90 mb-8 leading-relaxed">
              {settings.why_us_description}
            </p>
            <button className="flex items-center text-primary-foreground font-medium hover:gap-2 transition-all group">
              Learn More 
              <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyUsSection;
