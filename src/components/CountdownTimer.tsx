// Path: /src/components/CountdownTimer.tsx

import React, { useState, useEffect } from 'react';
import { ClockIcon } from 'lucide-react';

interface CountdownTimerProps {
    initialMinutes: number;
    onTimeout: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialMinutes, onTimeout }) => {
    // Initial time in seconds
    const initialSeconds = initialMinutes * 60;
    const [timeLeft, setTimeLeft] = useState(initialSeconds);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeout();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        // Cleanup function
        return () => clearInterval(timerId);
    }, [timeLeft, onTimeout]);

    // Format time (MM:SS)
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Timer ka color change karna agar time kam ho
    const timerColor = timeLeft < 60 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400';

    return (
        <div className="flex items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-gray-200 dark:border-gray-700">
            <ClockIcon className={`w-6 h-6 mr-2 ${timerColor}`} />
            <span className={`text-xl font-mono font-bold ${timerColor}`}>
                {timeString}
            </span>
        </div>
    );
};

