import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import menu1 from '@/assets/menu-1.jpg';
import menu2 from '@/assets/menu-2.jpg';
import menu3 from '@/assets/menu-3.jpg';
import menu4 from '@/assets/menu-4.jpg';
import menu5 from '@/assets/menu-5.jpg';
import menu6 from '@/assets/menu-6.jpg';

const categories = ['Starters', 'Breakfast', 'Lunch', 'Dinner'];

const menuItems = {
  Starters: [
    { name: 'Cheese Fry', price: 200, image: menu1 },
    { name: 'Spring Rolls', price: 250, image: menu2 },
    { name: 'Hakka Noodles', price: 300, image: menu3 },
    { name: 'Paneer Tikka', price: 580, image: menu4 },
    { name: 'Chocolate Brownie', price: 780, image: menu5 },
    { name: 'Crispy Pakoras', price: 490, image: menu6 },
  ],
  Breakfast: [
    { name: 'Cheese Fry', price: 750, image: menu1 },
    { name: 'Spring Rolls', price: 590, image: menu2 },
    { name: 'Hakka Noodles', price: 650, image: menu3 },
    { name: 'Paneer Tikka', price: 365, image: menu4 },
    { name: 'Chocolate Brownie', price: 490, image: menu5 },
    { name: 'Crispy Pakoras', price: 650, image: menu6 },
  ],
  Lunch: [
    { name: 'Cheese Fry', price: 650, image: menu1 },
    { name: 'Spring Rolls', price: 490, image: menu2 },
    { name: 'Hakka Noodles', price: 365, image: menu3 },
    { name: 'Paneer Tikka', price: 650, image: menu4 },
    { name: 'Chocolate Brownie', price: 590, image: menu5 },
    { name: 'Crispy Pakoras', price: 750, image: menu6 },
  ],
  Dinner: [
    { name: 'Cheese Fry', price: 850, image: menu1 },
    { name: 'Spring Rolls', price: 690, image: menu2 },
    { name: 'Hakka Noodles', price: 565, image: menu3 },
    { name: 'Paneer Tikka', price: 850, image: menu4 },
    { name: 'Chocolate Brownie', price: 790, image: menu5 },
    { name: 'Crispy Pakoras', price: 950, image: menu6 },
  ],
};

const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState('Starters');

  return (
    <section id="menu" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="section-header">
          <h2>Our Menu</h2>
          <p>Check Our <span>Yummy Menu</span></p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-secondary text-foreground hover:bg-primary/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Category Header */}
        <div className="text-center mb-8">
          <p className="text-primary font-medium uppercase tracking-wider text-sm">Menu</p>
          <h3 className="font-heading text-3xl">{activeCategory}</h3>
        </div>

        {/* Menu Items Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {menuItems[activeCategory as keyof typeof menuItems].map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="menu-item-card"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <h4 className="font-heading text-xl mb-2">{item.name}</h4>
                  <p className="text-primary text-xl font-bold">₹{item.price}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MenuSection;
