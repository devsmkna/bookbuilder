import React, { useEffect, useState } from 'react';

const generateParticles = (count: number) => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100, // Random x position (percent)
    y: -Math.random() * 20 - 10, // Start above the viewport
    size: Math.random() * 6 + 4, // Random size between 4-10px
    color: `hsl(${Math.random() * 360}, 80%, 60%)`, // Random bright color
    velocity: {
      x: (Math.random() - 0.5) * 8, // Random horizontal movement
      y: Math.random() * 3 + 2 // Random fall speed
    },
    rotation: Math.random() * 360, // Random rotation
    rotationSpeed: (Math.random() - 0.5) * 10 // Random rotation speed
  }));
};

interface ConfettiProps {
  count?: number;
  duration?: number;
}

export function Confetti({ count = 100, duration = 3000 }: ConfettiProps) {
  const [particles, setParticles] = useState<any[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    setParticles(generateParticles(count));
    
    // Stop animation after duration
    const timer = setTimeout(() => {
      setActive(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [count, duration]);

  useEffect(() => {
    if (!active) return;
    
    let animationFrame: number;
    
    const updateParticles = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          x: particle.x + particle.velocity.x * 0.1,
          y: particle.y + particle.velocity.y,
          rotation: (particle.rotation + particle.rotationSpeed) % 360,
          // Remove particles that have fallen out of view
          remove: particle.y > 110
        })).filter(particle => !particle.remove)
      );
      
      animationFrame = requestAnimationFrame(updateParticles);
    };
    
    animationFrame = requestAnimationFrame(updateParticles);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50" aria-hidden="true">
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute rounded-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: Math.max(0, Math.min(1, (100 - particle.y) / 100))
          }}
        />
      ))}
    </div>
  );
}