import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollEnergyBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 30, mass: 0.2 });

  return (
    <div className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-1">
      <div className="absolute inset-0 bg-background/40" />
      <motion.div
        aria-hidden
        style={{ scaleX, transformOrigin: "0% 50%" }}
        className="h-full bg-gradient-to-r from-accent via-primary to-accent"
      />
    </div>
  );
}
