import { motion } from "framer-motion";

const stages = [
  { label: "Build", color: "bg-green-500", glow: "shadow-green-400/50" },
  { label: "Test", color: "bg-emerald-500", glow: "shadow-emerald-400/50" },
  { label: "Deploy", color: "bg-teal-500", glow: "shadow-teal-400/50" },
  { label: "Release", color: "bg-green-400", glow: "shadow-green-300/50" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.4 } },
};

const stageVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200 } },
};

export default function PipelineAnimation() {
  return (
    <div className="relative flex items-center justify-center gap-0 select-none">
      <motion.div
        className="flex items-center gap-0"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {stages.map((stage, i) => (
          <div key={stage.label} className="flex items-center">
            {/* Stage Node */}
            <motion.div
              variants={stageVariants as any}
              className="flex flex-col items-center gap-2"
            >
              {/* Glowing dot */}
              <div className={`w-12 h-12 rounded-full ${stage.color} shadow-lg ${stage.glow} flex items-center justify-center animate-pulse-slow`}>
                <div className="w-4 h-4 rounded-full bg-white/80" />
              </div>
              <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                {stage.label}
              </span>
            </motion.div>

            {/* Connector line (not after last) */}
            {i < stages.length - 1 && (
              <motion.div
                className="w-16 h-0.5 mx-1 relative overflow-hidden"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.4 + 0.3, duration: 0.4 }}
                style={{ transformOrigin: "left" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400" />
                {/* Animated travelling dot */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow"
                  animate={{ x: ["0%", "700%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 + 0.6, ease: "linear" }}
                />
              </motion.div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
