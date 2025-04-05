import React, { useEffect } from 'react';

interface ExplosionEffectProps {
  position: { x: number, y: number };
  onAnimationComplete?: () => void;
}

const ExplosionEffect: React.FC<ExplosionEffectProps> = ({ position, onAnimationComplete }) => {
  // Create particles array
  const particleCount = 20;
  const particles = Array.from({ length: particleCount }, (_, i) => i);
  
  useEffect(() => {
    // Trigger animation complete callback after animation duration
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 1000); // Animation takes 1 second
    
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);
  
  return (
    <div className="explosion-container" style={{ 
      position: 'fixed', 
      left: position.x, 
      top: position.y, 
      pointerEvents: 'none',
      zIndex: 100 
    }}>
      {particles.map((i) => {
        // Random angle and distance for each particle
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 40;
        
        // Calculate the end position based on angle and distance
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        // Random size and color for each particle
        const size = 3 + Math.random() * 7;
        const colors = ['#FFD700', '#FF6347', '#FFA500', '#FF4500', '#FF8C00'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random delay for staggered effect
        const delay = Math.random() * 0.2;
        
        return (
          <div
            key={i}
            className="explosion-particle"
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: `0 0 ${size*2}px ${color}`,
              transform: 'translate(-50%, -50%)',
              animation: `explosion-particle 1s forwards`,
              animationDelay: `${delay}s`,
              // Define custom animation properties through CSS variables
              ['--end-x' as any]: `${endX}px`,
              ['--end-y' as any]: `${endY}px`,
            }}
          />
        );
      })}
      
      {/* Center flash */}
      <div
        className="explosion-center"
        style={{
          position: 'absolute',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: 'white',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 30px white, 0 0 60px rgba(255,255,0,0.8)',
          animation: 'explosion-center 0.8s forwards',
        }}
      />
    </div>
  );
};

export default ExplosionEffect;