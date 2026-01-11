import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  bgColor?: string;
  accentColor?: string;
  id?: string;
}

const SectionWrapper = ({ 
  children, 
  className = '',
  bgColor = 'hsl(var(--background))',
  accentColor = 'hsl(var(--primary) / 0.1)',
  id
}: SectionWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Create smooth gradient transition
  const gradientOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.8, 0.8, 0]);
  const overlayY = useTransform(scrollYProgress, [0, 1], ['10%', '-10%']);

  return (
    <div 
      ref={ref} 
      id={id}
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {/* Animated gradient overlay */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          opacity: gradientOpacity,
          y: overlayY,
          background: `radial-gradient(ellipse at center, ${accentColor} 0%, transparent 70%)`
        }}
      />
      
      {/* Top fade edge */}
      <div 
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none z-10"
        style={{
          background: `linear-gradient(to bottom, ${bgColor}, transparent)`
        }}
      />
      
      {/* Bottom fade edge */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
        style={{
          background: `linear-gradient(to top, ${bgColor}, transparent)`
        }}
      />
      
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
};

export default SectionWrapper;
