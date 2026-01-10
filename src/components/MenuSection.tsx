import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import unique dish images
import dishSamosa from '@/assets/dish-samosa.jpg';
import dishButterChicken from '@/assets/dish-butter-chicken.jpg';
import dishBiryani from '@/assets/dish-biryani.jpg';
import dishPalakPaneer from '@/assets/dish-palak-paneer.jpg';
import dishDalMakhani from '@/assets/dish-dal-makhani.jpg';
import dishTandoori from '@/assets/dish-tandoori.jpg';
import dishDosa from '@/assets/dish-dosa.jpg';
import dishGulabJamun from '@/assets/dish-gulab-jamun.jpg';
import dishCholeBhature from '@/assets/dish-chole-bhature.jpg';
import dishPaneerTikka from '@/assets/dish-paneer-tikka.jpg';

const categories = ['Starters', 'Breakfast', 'Lunch', 'Dinner', 'Desserts'];

const menuItems = {
  Starters: [
    { name: 'Vegetable Samosa', price: 180, image: dishSamosa, description: 'Crispy pastry with spiced potato filling' },
    { name: 'Paneer Tikka', price: 320, image: dishPaneerTikka, description: 'Grilled cottage cheese with bell peppers' },
    { name: 'Tandoori Chicken', price: 380, image: dishTandoori, description: 'Classic tandoor-roasted chicken' },
  ],
  Breakfast: [
    { name: 'Masala Dosa', price: 150, image: dishDosa, description: 'Crispy crepe with potato filling' },
    { name: 'Chole Bhature', price: 180, image: dishCholeBhature, description: 'Spicy chickpeas with fried bread' },
    { name: 'Paneer Paratha', price: 140, image: dishPalakPaneer, description: 'Stuffed flatbread with cottage cheese' },
  ],
  Lunch: [
    { name: 'Hyderabadi Biryani', price: 350, image: dishBiryani, description: 'Aromatic rice with tender meat' },
    { name: 'Butter Chicken', price: 380, image: dishButterChicken, description: 'Creamy tomato chicken curry' },
    { name: 'Dal Makhani', price: 280, image: dishDalMakhani, description: 'Slow-cooked creamy black lentils' },
  ],
  Dinner: [
    { name: 'Palak Paneer', price: 320, image: dishPalakPaneer, description: 'Cottage cheese in spinach gravy' },
    { name: 'Chicken Biryani', price: 420, image: dishBiryani, description: 'Fragrant rice with spiced chicken' },
    { name: 'Tandoori Platter', price: 550, image: dishTandoori, description: 'Assorted tandoor grilled items' },
  ],
  Desserts: [
    { name: 'Gulab Jamun', price: 120, image: dishGulabJamun, description: 'Sweet milk balls in rose syrup' },
    { name: 'Ras Malai', price: 150, image: dishGulabJamun, description: 'Cottage cheese in sweet cream' },
    { name: 'Kheer', price: 130, image: dishGulabJamun, description: 'Traditional rice pudding' },
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
                key={`${activeCategory}-${item.name}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="menu-item-card group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-heading text-xl">{item.name}</h4>
                    <span className="text-primary text-xl font-bold">₹{item.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
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
