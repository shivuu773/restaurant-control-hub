import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxBackgroundProps {
  className?: string;
  speed?: number;
}

const ParallaxBackground = ({ className = '', speed = 0.5 }: ParallaxBackgroundProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);

  return (
    <motion.div 
      ref={ref}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ y }}
    >
      {/* Decorative floating elements with parallax */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
    </motion.div>
  );
};

export default ParallaxBackground;
