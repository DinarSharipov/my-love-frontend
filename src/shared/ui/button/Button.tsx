import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { AnimatePresence, motion } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';

type AnimateVariant = 'magnetic' | 'base';

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  animateVariant?: AnimateVariant;
  children?: ReactNode;
  containerClassName?: string;
};

type ElectricBurst = {
  id: number;
  x: number;
  y: number;
};

const magneticRadius = 100;
const magneticStrength = 0.4;
const electricColors = [
  'var(--color-primary-neon)',
  'var(--color-neon-pink)',
  'var(--color-cyber-cyan)',
  'var(--color-electric-blue)',
];

const electricParticles = Array.from({ length: 18 }, (_, index) => {
  const angle = (Math.PI * 2 * index) / 18;
  const distance = 58 + (index % 4) * 13;
  const directionX = Math.cos(angle) * distance;
  const directionY = Math.sin(angle) * distance;
  const offset = index % 2 === 0 ? 9 : -9;

  return {
    angle: (angle * 180) / Math.PI,
    color: electricColors[index % electricColors.length],
    id: `particle-${index}`,
    midX: directionX * 0.46 + Math.sin(angle) * offset,
    midY: directionY * 0.46 - Math.cos(angle) * offset,
    x: directionX,
    y: directionY,
  };
});

gsap.registerPlugin(useGSAP);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      animateVariant = 'base',
      children,
      className = '',
      containerClassName = '',
      disabled,
      onClick,
      type = 'button',
      ...buttonProps
    },
    forwardedRef,
  ) => {
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const magneticContainerRef = useRef<HTMLSpanElement | null>(null);
    const magneticTargetRef = useRef<HTMLSpanElement | null>(null);
    const burstId = useRef(0);
    const cleanupTimers = useRef<number[]>([]);
    const [bursts, setBursts] = useState<ElectricBurst[]>([]);

    useImperativeHandle(forwardedRef, () => buttonRef.current as HTMLButtonElement);

    useGSAP(
      (_, contextSafe) => {
        const magneticContainer = magneticContainerRef.current;
        const magneticTarget = magneticTargetRef.current;

        if (
          !magneticContainer ||
          !magneticTarget ||
          !contextSafe ||
          animateVariant !== 'magnetic' ||
          disabled
        ) {
          if (magneticTarget) {
            gsap.set(magneticTarget, { clearProps: 'x,y' });
          }

          return () => undefined;
        }

        let isMagneticActive = false;

        const resetPosition = contextSafe(() => {
          if (!isMagneticActive) {
            return;
          }

          isMagneticActive = false;
          gsap.to(magneticTarget, {
            duration: 0.7,
            ease: 'elastic.out(1, 0.45)',
            overwrite: true,
            x: 0,
            y: 0,
          });
        });

        const followPointer = contextSafe((event: PointerEvent) => {
          if (event.pointerType !== 'mouse') {
            return;
          }

          const rect = magneticContainer.getBoundingClientRect();
          const distanceX = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
          const distanceY = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
          const isWithinMagneticArea = Math.hypot(distanceX, distanceY) <= magneticRadius;

          if (!isWithinMagneticArea) {
            resetPosition();
            return;
          }

          isMagneticActive = true;

          const zoneWidth = rect.width + magneticRadius * 2;
          const zoneHeight = rect.height + magneticRadius * 2;
          const mappedX = gsap.utils.mapRange(
            rect.left - magneticRadius,
            rect.right + magneticRadius,
            -zoneWidth / 2,
            zoneWidth / 2,
            event.clientX,
          );
          const mappedY = gsap.utils.mapRange(
            rect.top - magneticRadius,
            rect.bottom + magneticRadius,
            -zoneHeight / 2,
            zoneHeight / 2,
            event.clientY,
          );

          gsap.to(magneticTarget, {
            duration: 0.4,
            ease: 'power2.out',
            overwrite: true,
            x: mappedX * magneticStrength,
            y: mappedY * magneticStrength,
          });
        });

        window.addEventListener('pointermove', followPointer);
        window.addEventListener('pointerleave', resetPosition);
        window.addEventListener('blur', resetPosition);
        window.addEventListener('resize', resetPosition);
        window.addEventListener('scroll', resetPosition, true);

        return () => {
          window.removeEventListener('pointermove', followPointer);
          window.removeEventListener('pointerleave', resetPosition);
          window.removeEventListener('blur', resetPosition);
          window.removeEventListener('resize', resetPosition);
          window.removeEventListener('scroll', resetPosition, true);
        };
      },
      {
        dependencies: [animateVariant, disabled],
        revertOnUpdate: true,
        scope: magneticContainerRef,
      },
    );

    useEffect(
      () => () => {
        cleanupTimers.current.forEach((timer) => window.clearTimeout(timer));
      },
      [],
    );

    const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      burstId.current += 1;

      const nextBurst = {
        id: burstId.current,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      setBursts((currentBursts) => [...currentBursts, nextBurst]);

      const timer = window.setTimeout(() => {
        setBursts((currentBursts) => currentBursts.filter((burst) => burst.id !== nextBurst.id));
        cleanupTimers.current = cleanupTimers.current.filter(
          (activeTimer) => activeTimer !== timer,
        );
      }, 950);

      cleanupTimers.current.push(timer);
      onClick?.(event);
    };

    return (
      <span ref={magneticContainerRef} className={`relative inline-flex ${containerClassName}`}>
        <span ref={magneticTargetRef} className="relative inline-flex will-change-transform">
          <motion.button
            {...buttonProps}
            ref={buttonRef}
            className={`border-primary-neon/60 bg-primary-neon text-text group relative isolate overflow-hidden rounded-xl border px-6 py-3 font-semibold shadow-[0_0_22px_color-mix(in_srgb,var(--color-primary-neon)_18%,transparent)] outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            disabled={disabled}
            onClick={handleClick}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            type={type}
            whileHover={
              disabled || animateVariant === 'magnetic' ? undefined : { scale: 1.025, y: -2 }
            }
            whileTap={disabled ? undefined : { scale: 0.96, y: 0 }}
          >
            <motion.span
              aria-hidden="true"
              className="from-electric-purple via-neon-pink to-primary-neon absolute inset-0 -z-10 bg-gradient-to-r opacity-0"
              transition={{ duration: 0.25 }}
              whileHover={{ opacity: 1 }}
            />
            <span className="relative z-10">{children}</span>
          </motion.button>

          <AnimatePresence>
            {bursts.map((burst) => (
              <motion.span
                className="pointer-events-none absolute z-30"
                exit={{ opacity: 0 }}
                key={burst.id}
                style={{ left: burst.x, top: burst.y }}
              >
                {[0, 1, 2].map((ring) => (
                  <motion.span
                    animate={{ opacity: [0.8, 0.36, 0], scale: [0.3, 3.8 + ring * 1.6] }}
                    className="border-cyber-cyan absolute -left-2 -top-2 h-4 w-4 rounded-full border"
                    initial={{ opacity: 0.8, scale: 0.3 }}
                    key={`ring-${ring}`}
                    transition={{ delay: ring * 0.08, duration: 0.72, ease: 'easeOut' }}
                  />
                ))}

                {electricParticles.map((particle) => (
                  <motion.span
                    animate={{
                      opacity: [0, 1, 0.75, 0],
                      scaleX: [0.2, 1.35, 0.8, 0],
                      x: [0, particle.midX, particle.x],
                      y: [0, particle.midY, particle.y],
                    }}
                    className="absolute -left-0.5 -top-px h-0.5 w-4 origin-left rounded-full"
                    initial={{ opacity: 0, scaleX: 0.2, x: 0, y: 0 }}
                    key={particle.id}
                    style={{
                      backgroundColor: particle.color,
                      boxShadow: `0 0 8px ${particle.color}`,
                      rotate: particle.angle,
                    }}
                    transition={{ duration: 0.76, ease: 'easeOut' }}
                  />
                ))}
              </motion.span>
            ))}
          </AnimatePresence>
        </span>
      </span>
    );
  },
);

Button.displayName = 'Button';
