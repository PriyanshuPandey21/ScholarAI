import { motion } from 'framer-motion';
export default function GlassCard({ children, className = '', animate = true }) {
  const Comp = animate ? motion.div : 'div';
  const props = animate ? { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } } : {};
  return <Comp {...props} className={`section-card ${className}`}>{children}</Comp>;
}
