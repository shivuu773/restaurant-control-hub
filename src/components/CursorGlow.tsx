import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CursorGlow = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Smooth spring animation for cursor following
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const x = useSpring(mousePosition.x, springConfig);
  const y = useSpring(mousePosition.y, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <>
      {/* Main glow */}
      <motion.div
        className="fixed pointer-events-none z-[9999] hidden lg:block"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ opacity: { duration: 0.3 } }}
      >
        <div className="w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      </motion.div>

      {/* Inner glow - follows more closely */}
      <motion.div
        className="fixed pointer-events-none z-[9999] hidden lg:block"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.8,
        }}
        transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 blur-xl" />
      </motion.div>

      {/* Trail effect */}
      <motion.div
        className="fixed pointer-events-none z-[9998] hidden lg:block"
        style={{
          x,
          y,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isVisible ? 0.5 : 0,
        }}
        transition={{ 
          x: { damping: 40, stiffness: 100, mass: 1 },
          y: { damping: 40, stiffness: 100, mass: 1 },
          opacity: { duration: 0.4 } 
        }}
      >
        <div className="w-96 h-96 rounded-full bg-gradient-radial from-primary/5 to-transparent blur-2xl" />
      </motion.div>
    </>
  );
};

export default CursorGlow;
