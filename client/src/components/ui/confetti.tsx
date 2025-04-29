import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  count?: number;
  duration?: number;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  animationDelay: number;
}

const COLORS = [
  '#FF0000', // Red
  '#FF7F00', // Orange
  '#FFFF00', // Yellow
  '#00FF00', // Green
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#9400D3', // Violet
  '#FF1493', // Pink
  '#00FFFF', // Cyan
  '#FFD700', // Gold
];

export function Confetti({ count = 100, duration = 3000 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [active, setActive] = useState(true);

  // Generate confetti pieces
  useEffect(() => {
    const newPieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100, // Random position across screen width (%)
        y: -10 - Math.random() * 10, // Start above the screen
        rotation: Math.random() * 360, // Random rotation
        scale: 0.5 + Math.random() * 1, // Random size
        color: COLORS[Math.floor(Math.random() * COLORS.length)], // Random color
        shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle', // Random shape
        animationDelay: Math.random() * 500, // Random start delay
      });
    }
    
    setPieces(newPieces);
    
    // Cleanup after duration
    const timer = setTimeout(() => {
      setActive(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [count, duration]);
  
  if (!active) return null;
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            transformOrigin: 'center center',
            animationDelay: `${piece.animationDelay}ms`,
            width: '10px',
            height: '10px',
            opacity: 0,
          }}
        >
          {piece.shape === 'circle' && (
            <div 
              className="w-full h-full rounded-full" 
              style={{ backgroundColor: piece.color }}
            />
          )}
          {piece.shape === 'square' && (
            <div 
              className="w-full h-full" 
              style={{ backgroundColor: piece.color }}
            />
          )}
          {piece.shape === 'triangle' && (
            <div 
              className="w-0 h-0" 
              style={{ 
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: `10px solid ${piece.color}`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}