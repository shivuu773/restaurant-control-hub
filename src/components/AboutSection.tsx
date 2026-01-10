import { motion } from 'framer-motion';
import { CheckCircle2, Play } from 'lucide-react';
import aboutRestaurant from '@/assets/about-restaurant.jpg';

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <h2>About Us</h2>
          <p>Learn More <span>About Us</span></p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={aboutRestaurant}
                alt="Zayka Restaurant Interior"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              
              {/* Call Us Box */}
              <div className="absolute bottom-6 left-6 bg-primary text-primary-foreground p-6 rounded-xl">
                <h4 className="font-heading text-xl font-semibold mb-1">Book a Table</h4>
                <p className="text-2xl font-bold">+91 8090-XXX-X16</p>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ul className="space-y-6 mb-8">
              <li className="flex items-start">
                <CheckCircle2 className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Culinary Passion:</strong> At Zayka Restaurant, 
                  our culinary journey is driven by a passion for creating exceptional dining experiences.
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Authentic Flavors:</strong> We take pride in 
                  serving authentic dishes that are a celebration of local and global flavors.
                </p>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-6 w-6 text-primary mr-4 mt-1 flex-shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Chef's Expertise:</strong> Our talented chefs 
                  bring years of expertise to the kitchen, crafting each dish with precision and creativity.
                </p>
              </li>
            </ul>

            {/* Video Preview */}
            <div className="relative rounded-xl overflow-hidden group cursor-pointer">
              <img
                src={aboutRestaurant}
                alt="Watch our story"
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/40">
                  <Play className="h-6 w-6 text-primary-foreground ml-1" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
