'use client'
import React from 'react';

const GradientBanner: React.FC = () => {
    return (
        <div    className="w-full px-4 md:px-6 py-4 h-full overflow-hidden flex justify-start animate-gradient-flow"
        style={{
            background: 'linear-gradient(94.57deg, #D1F701 0%, #E2E6F3 36.67%, #C4B5FD 99.93%)',
            backgroundSize: '200% 200%',
            minHeight: '120px',
            animation: 'gradientFlow 15s ease-in-out infinite',
        }}
    >
    <div className='flex flex-col items-center justify-center'>
        <p className='text-white font-geist font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-9xl leading-tight md:leading-26 text-center md:text-left'>
            Get Credit.<br />Get Going.
        </p>
    </div>
    <style jsx>{`
                    @keyframes gradientFlow {
                        0% {
                            background-position: 0% 50%;
                        }
                        25% {
                            background-position: 100% 50%;
                        }
                        50% {
                            background-position: 100% 100%;
                        }
                        75% {
                            background-position: 0% 100%;
                        }
                        100% {
                            background-position: 0% 50%;
                        }
                    }
                `}</style>
        </div>
      )
};

export default GradientBanner; 