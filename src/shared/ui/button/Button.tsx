import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { AnimatePresence, motion } from 'motion/react';
import type { HTMLMotionProps } from 'motion/react';
import { createPortal } from 'react-dom';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';

type AnimateVariant = 'magnetic' | 'base';
type ButtonSize = 's' | 'm' | 'l' | 'xl';

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  animateVariant?: AnimateVariant;
  children?: ReactNode;
  containerClassName?: string;
  icon?: ReactNode;
  size?: ButtonSize;
  clickEffect?: boolean;
};

type HeartBurst = {
  id: number;
  x: number;
  y: number;
  particles: Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    rotate: number;
    drift: number;
    fall: number;
    duration: number;
    delay: number;
  }>;
};

const magneticRadius = 100;
const magneticStrength = 0.4;
const sizeClassNames: Record<ButtonSize, string> = {
  s: 'h-9 px-3 text-xs',
  m: 'h-10 px-5 text-sm',
  l: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg',
};

gsap.registerPlugin(useGSAP);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      animateVariant = 'base',
      children,
      clickEffect = true,
      className = '',
      containerClassName = '',
      icon,
      disabled,
      onClick,
      size = 'm',
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
    const [bursts, setBursts] = useState<HeartBurst[]>([]);

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
      if (clickEffect) {
        burstId.current += 1;
        const nextBurst: HeartBurst = {
          id: burstId.current,
          x: event.clientX,
          y: event.clientY,
          particles: Array.from({ length: 22 }, (_, index) => {
            const angle = Math.random() * Math.PI * 2;
            const distance = 70 + Math.random() * 190;

            return {
              id: index,
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              color: 'var(--color-button)',
              size: 11 + Math.random() * 10,
              rotate: -360 + Math.random() * 720,
              drift: (Math.random() - 0.5) * 180,
              fall: 150 + Math.random() * 220,
              duration: 1.35 + Math.random() * 0.45,
              delay: Math.random() * 0.08,
            };
          }),
        };
        setBursts((currentBursts) => [...currentBursts, nextBurst]);
        const timer = window.setTimeout(() => {
          setBursts((currentBursts) => currentBursts.filter((burst) => burst.id !== nextBurst.id));
          cleanupTimers.current = cleanupTimers.current.filter(
            (activeTimer) => activeTimer !== timer,
          );
        }, 1700);
        cleanupTimers.current.push(timer);
      }
      onClick?.(event);
    };

    return (
      <>
        <span ref={magneticContainerRef} className={`relative inline-flex ${containerClassName}`}>
          <span ref={magneticTargetRef} className="relative inline-flex will-change-transform">
            <motion.button
              {...buttonProps}
              ref={buttonRef}
              className={`border-[var(--color-button)] cursor-pointer bg-surface/20 text-text group relative isolate inline-flex items-center justify-center overflow-hidden rounded-xl border font-semibold leading-none shadow-[0_0_10px_color-mix(in_srgb,var(--color-button)_55%,transparent),0_0_28px_color-mix(in_srgb,var(--color-button)_22%,transparent),inset_0_0_16px_color-mix(in_srgb,var(--color-button)_10%,transparent)] outline-none backdrop-blur-xl transition-[color,background-color,border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50 ${sizeClassNames[size]} ${className}`}
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
                whileHover={{ opacity: 0.22 }}
              />
              <span className="relative z-10 inline-flex items-center justify-center gap-1">
                {icon}
                {children}
              </span>
            </motion.button>
            <AnimatePresence>
              {bursts.map((burst) => (
                <motion.span
                  className="pointer-events-none absolute inset-0 z-30 rounded-xl"
                  exit={{ opacity: 0 }}
                  key={burst.id}
                >
                  {[0, 1, 2, 3].map((wave) => (
                    <motion.span
                      animate={{
                        filter: ['blur(0px)', 'blur(1px)', 'blur(4px)'],
                        opacity: [0.85, 0.36, 0],
                        scale: [1, 1.22 + wave * 0.14, 1.48 + wave * 0.2],
                      }}
                      className="border-[var(--color-button)] absolute inset-0 rounded-xl border"
                      initial={{ filter: 'blur(0px)', opacity: 0.85, scale: 1 }}
                      key={`wave-${wave}`}
                      style={{
                        boxShadow:
                          '0 0 12px color-mix(in srgb, var(--color-button) 65%, transparent)',
                      }}
                      transition={{ delay: wave * 0.09, duration: 0.78, ease: 'easeOut' }}
                    />
                  ))}
                </motion.span>
              ))}
            </AnimatePresence>
          </span>
        </span>
        {clickEffect &&
          createPortal(
            <AnimatePresence>
              {bursts.map((burst) => (
                <span className="pointer-events-none fixed inset-0 z-[9999]" key={burst.id}>
                  {burst.particles.map((particle) => (
                    <motion.span
                      animate={{
                        opacity: [0, 1, 0],
                        rotate: particle.rotate,
                        scale: [0.2, 1, 0.65],
                        x: [0, particle.x, particle.x + particle.drift],
                        y: [0, particle.y, particle.y + particle.fall],
                      }}
                      className="absolute drop-shadow-[0_0_7px_currentColor]"
                      initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
                      key={particle.id}
                      style={{
                        color: particle.color,
                        fontSize: particle.size,
                        left: burst.x,
                        top: burst.y,
                      }}
                      transition={{
                        delay: particle.delay,
                        duration: particle.duration,
                        ease: ['easeOut', 'easeIn'],
                        times: [0, 0.42, 1],
                      }}
                    >
                      ♥
                    </motion.span>
                  ))}
                </span>
              ))}
            </AnimatePresence>,
            document.body,
          )}
      </>
    );
  },
);

Button.displayName = 'Button';
