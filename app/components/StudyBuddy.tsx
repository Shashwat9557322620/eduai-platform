"use client";
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface StudyBuddyProps {
  mood: 'happy' | 'thinking' | 'concerned' | 'celebrating';
  isSpeaking?: boolean;
}

export default function StudyBuddy({ mood, isSpeaking }: StudyBuddyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blink, setBlink] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let raf: number;
    const draw = (t: number) => {
      ctx.clearRect(0, 0, 120, 120);
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0a0f';
      ctx.fill();
      ctx.strokeStyle = 'rgba(34,211,238,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      const eyeY = mood === 'happy' ? 48 : mood === 'concerned' ? 52 : 50;
      const eyeOffset = mood === 'celebrating' ? Math.sin(t * 0.01) * 3 : 0;
      
      ctx.beginPath();
      ctx.arc(42, eyeY + eyeOffset, blink ? 1 : 6, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(78, eyeY + eyeOffset, blink ? 1 : 6, 0, Math.PI * 2);
      ctx.fillStyle = '#22d3ee';
      ctx.fill();
      
      ctx.beginPath();
      const mouthY = mood === 'happy' ? 72 : mood === 'concerned' ? 68 : 70;
      const mouthCurve = mood === 'happy' ? 10 : mood === 'concerned' ? -5 : 0;
      ctx.moveTo(45, mouthY);
      ctx.quadraticCurveTo(60, mouthY + mouthCurve, 75, mouthY);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      if (isSpeaking) {
        const pulse = Math.sin(t * 0.005) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(60, 60, 55, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34,211,238,${pulse * 0.3})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000);
    
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(blinkInterval);
    };
  }, [mood, isSpeaking]);
  
  return (
    <motion.div 
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className="glass rounded-2xl p-3">
        <canvas ref={canvasRef} width={120} height={120} className="rounded-xl" />
        <div className="mt-2 text-center">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
            {isSpeaking ? 'Speaking...' : 'Study Buddy'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
