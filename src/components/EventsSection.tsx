import { motion } from 'framer-motion';
import event1 from '@/assets/event-1.jpg';
import event2 from '@/assets/event-2.jpg';
import event3 from '@/assets/event-3.jpg';

const events = [
  {
    title: 'Private Parties',
    description: 'Host your exclusive gatherings in our elegant private dining space with personalized service.',
    price: 5000,
    image: event1,
  },
  {
    title: 'Birthday Celebrations',
    description: 'Make birthdays special with our curated menus, decorations, and memorable experiences.',
    price: 3500,
    image: event2,
  },
  {
    title: 'Corporate Events',
    description: 'Professional settings for business dinners, team celebrations, and corporate meetings.',
    price: 8000,
    image: event3,
  },
];

const EventsSection = () => {
  return (
    <section id="events" className="py-20 bg-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <h2>Events</h2>
          <p>Share Your <span>Special Moments</span></p>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="event-card group"
            >
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-heading text-2xl font-bold mb-2">{event.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{event.description}</p>
                  <p className="text-primary font-bold text-xl">
                    Starting from ₹{event.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
