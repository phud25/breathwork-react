import { motion, AnimatePresence } from "framer-motion";

interface BreathingGuideProps {
  pattern: {
    name: string;
    sequence: number[];
  };
  isActive: boolean;
  currentPhase: number;
}

const phaseLabels = ["Inhale", "Hold", "Exhale", "Hold"];

export function BreathingGuide({ pattern, isActive, currentPhase }: BreathingGuideProps) {
  const circleVariants = {
    inhale: {
      scale: 2,
      transition: { duration: pattern.sequence[currentPhase] }
    },
    exhale: {
      scale: 1,
      transition: { duration: pattern.sequence[currentPhase] }
    },
    hold: {
      scale: currentPhase === 1 ? 2 : 1,
      transition: { duration: pattern.sequence[currentPhase] }
    }
  };

  const getPhaseVariant = () => {
    if (currentPhase === 0) return "inhale";
    if (currentPhase === 2) return "exhale";
    return "hold";
  };

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <motion.div
        className="w-20 h-20 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center"
        variants={circleVariants}
        animate={isActive ? getPhaseVariant() : "hold"}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={currentPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-primary font-semibold"
          >
            {isActive ? phaseLabels[currentPhase] : "Ready"}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
