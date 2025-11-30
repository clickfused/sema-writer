import { motion } from "framer-motion";
import { ReactNode, useRef } from "react";
import { useMagneticCursor } from "@/hooks/useMagneticCursor";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}

export const MagneticButton = ({ 
  children, 
  className = "", 
  onClick,
  strength = 0.3 
}: MagneticButtonProps) => {
  const { ref, position } = useMagneticCursor(strength);

  return (
    <motion.div
      ref={ref as any}
      className={className}
      onClick={onClick}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
    >
      {children}
    </motion.div>
  );
};
