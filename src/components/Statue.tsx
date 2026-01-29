import React from 'react';
import { motion } from 'framer-motion';

interface StatueProps {
    state: 'IDLE' | 'ANGRY';
}

export const Statue: React.FC<StatueProps> = ({ state }) => {
    return (
        <div className="relative w-full flex justify-center py-8">
            <motion.div
                animate={{ scale: state === 'ANGRY' ? 1.05 : 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-32 h-32 md:w-48 md:h-48 bg-gray-800 rounded-full flex items-center justify-center overflow-visible border-4 border-gray-700 shadow-2xl"
            >
                {/* Placeholder for Statue Image */}
                <div className="absolute w-full h-full rounded-full overflow-hidden opacity-50 bg-[url('https://preview.redd.it/solo-leveling-statue-of-god-v0-6r0y5j5j5j5j1.jpg?auto=webp&s=60655c655c655c655c655c655c655c655c655c65')] bg-cover bg-center">
                </div>

                {/* Eyes */}
                <div className="relative z-10 flex gap-8 mb-4">
                    <motion.div
                        className={`w-6 h-6 rounded-full ${state === 'ANGRY' ? 'bg-red-500 shadow-[0_0_25px_#ef4444]' : 'bg-black/50'} transition-colors duration-500`}
                    ></motion.div>
                    <motion.div
                        className={`w-6 h-6 rounded-full ${state === 'ANGRY' ? 'bg-red-500 shadow-[0_0_25px_#ef4444]' : 'bg-black/50'} transition-colors duration-500`}
                    ></motion.div>
                </div>

                {/* Mouth/Smile in Angry State */}
                {state === 'ANGRY' && (
                    <motion.div
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        className="absolute bottom-10 w-24 h-4 border-b-4 border-red-500 rounded-[50%]"
                    ></motion.div>
                )}
            </motion.div>

            {/* God Ray Light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/5 blur-[100px] pointer-events-none"></div>
        </div>
    );
};
