import { motion } from 'framer-motion';

export default function LoadingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-cream/90 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-del-monte-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-dark text-lg font-medium">Analyzing your ingredients...</p>
        <p className="text-text-muted text-sm mt-2">This may take up to 30 seconds</p>
      </div>
    </motion.div>
  );
}