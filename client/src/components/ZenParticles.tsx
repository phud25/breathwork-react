import { useSpring, animated } from "@react-spring/web";
import { useEffect, useState } from "react";
import { useInterval } from "react-use";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  angle: number;
  speed: number;
}

interface ZenParticlesProps {
  isActive: boolean;
  isInhaling: boolean;
  intensity?: number;
}

export function ZenParticles({ isActive, isInhaling, intensity = 1 }: ZenParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerSize = 280; // Match the breathing circle size
  const maxParticles = 20;

  const generateParticle = (index: number): Particle => {
    const angle = (Math.PI * 2 * index) / maxParticles;
    const distance = containerSize / 2 - 10;
    return {
      id: Date.now() + index,
      x: Math.cos(angle) * distance + containerSize / 2,
      y: Math.sin(angle) * distance + containerSize / 2,
      size: Math.random() * 3 + 2,
      opacity: Math.random() * 0.5 + 0.3,
      angle,
      speed: Math.random() * 0.5 + 0.5,
    };
  };

  useEffect(() => {
    if (isActive) {
      const initialParticles = Array.from({ length: maxParticles }, (_, i) =>
        generateParticle(i)
      );
      setParticles(initialParticles);
    } else {
      setParticles([]);
    }
  }, [isActive]);

  useInterval(
    () => {
      if (!isActive) return;

      setParticles((currentParticles) =>
        currentParticles.map((particle) => {
          const distance = containerSize / 2 - 10;
          const targetDistance = isInhaling ? distance * 0.4 : distance;
          const currentDistance = Math.sqrt(
            Math.pow(particle.x - containerSize / 2, 2) +
              Math.pow(particle.y - containerSize / 2, 2)
          );

          const moveToward = isInhaling ? -1 : 1;
          const newDistance = currentDistance + moveToward * particle.speed * intensity;
          const ratio = newDistance / currentDistance;

          return {
            ...particle,
            x: (particle.x - containerSize / 2) * ratio + containerSize / 2,
            y: (particle.y - containerSize / 2) * ratio + containerSize / 2,
            opacity: Math.min(
              0.8,
              isInhaling
                ? particle.opacity * 0.95
                : particle.opacity + 0.02 * intensity
            ),
          };
        })
      );
    },
    isActive ? 16 : null
  );

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={containerSize}
      height={containerSize}
      viewBox={`0 0 ${containerSize} ${containerSize}`}
    >
      {particles.map((particle) => (
        <animated.circle
          key={particle.id}
          cx={particle.x}
          cy={particle.y}
          r={particle.size}
          fill="currentColor"
          className="text-primary"
          style={{
            opacity: particle.opacity,
          }}
        />
      ))}
    </svg>
  );
}
