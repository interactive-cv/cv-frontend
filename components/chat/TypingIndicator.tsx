import { motion } from "framer-motion";

/**
 * Typing-индикатор: три точки, подпрыгивающие по очереди.
 * Показывается, пока AI формирует ответ.
 */
export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-2">
      <div className="bg-gray-800 px-3 py-3 rounded-lg flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-2 h-2 rounded-full bg-gray-400"
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
