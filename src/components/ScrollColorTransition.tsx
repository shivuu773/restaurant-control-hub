import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollColorTransitionProps {
  fromColor: string;
  toColor: string;
  className?: string;
}

const ScrollColorTransition = ({ 
  fromColor, 
  toColor, 
  className = '' 
}: ScrollColorTransitionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  return (
    <div ref={ref} className={`relative h-32 -my-16 z-10 pointer-events-none ${className}`}>
      <motion.div 
        className="absolute inset-0"
        style={{ 
          opacity,
          background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`
        }}
      />
    </div>
  );
};

export default ScrollColorTransition;
