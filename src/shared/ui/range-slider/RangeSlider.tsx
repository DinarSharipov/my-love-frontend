import { motion, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import type { ChangeEvent, ComponentPropsWithoutRef, PointerEvent, ReactNode } from 'react';

type RangeSliderProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'max'
  | 'min'
  | 'onChange'
  | 'onPointerCancel'
  | 'onPointerDown'
  | 'onPointerMove'
  | 'onPointerUp'
  | 'step'
  | 'type'
  | 'value'
> & {
  icon?: ReactNode;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  value: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const roundToStep = (value: number, min: number, step: number) =>
  Number((min + Math.round((value - min) / step) * step).toFixed(6));

export const RangeSlider = ({
  className,
  disabled,
  icon,
  max,
  min,
  onBlur,
  onChange,
  onFocus,
  step,
  value,
  ...props
}: RangeSliderProps) => {
  const prefersReducedMotion = useReducedMotion();
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [pull, setPull] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const progress = max === min ? 0 : (clamp(value, min, max) - min) / (max - min);

  const updateFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerProgress = clamp(1 - (event.clientY - bounds.top) / bounds.height, 0, 1);
    const nextValue = roundToStep(min + pointerProgress * (max - min), min, step);
    onChange(clamp(nextValue, min, max));
    setPull(
      clamp((event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width * 1.4), -1, 1),
    );
  };

  const resetInteraction = () => {
    setIsActive(false);
    setPull(0);
  };

  return (
    <motion.div
      animate={{
        scaleX: isActive && !prefersReducedMotion ? 0.94 : 1,
        scaleY: isActive && !prefersReducedMotion ? 1.04 : 1,
        x: isActive && !prefersReducedMotion ? pull * 7 : 0,
      }}
      className={`relative h-56 w-24 touch-none select-none ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-ns-resize'} ${className ?? ''}`}
      onPointerCancel={resetInteraction}
      onPointerDown={(event) => {
        if (disabled) return;
        inputRef.current?.focus();
        event.currentTarget.setPointerCapture(event.pointerId);
        setIsActive(true);
        updateFromPointer(event);
      }}
      onPointerMove={(event) => {
        if (isActive && !disabled) updateFromPointer(event);
      }}
      onPointerUp={resetInteraction}
      transition={
        prefersReducedMotion ? { duration: 0 } : { bounce: 0.28, duration: 0.42, type: 'spring' }
      }
    >
      <motion.span
        animate={{ opacity: isFocused ? 1 : 0, scale: isFocused ? 1 : 0.92 }}
        aria-hidden="true"
        className="border-cyber-cyan/80 pointer-events-none absolute -inset-1 rounded-[2rem] border-2"
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18 }}
      />
      <span
        aria-hidden="true"
        className="border-border bg-elevated/95 pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem] border shadow-[0_0_28px_rgba(176,38,255,0.16)]"
      >
        <motion.span
          animate={{ height: `${progress * 100}%` }}
          className="from-electric-purple via-primary-neon to-neon-pink absolute inset-x-0 bottom-0 bg-linear-to-t shadow-[0_0_24px_rgba(176,38,255,0.72)]"
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { bounce: 0.22, duration: 0.38, type: 'spring' }
          }
        >
          {icon && (
            <span className="text-background absolute inset-x-0 bottom-5 grid place-items-center drop-shadow-[0_0_8px_rgba(5,5,10,0.55)]">
              {icon}
            </span>
          )}
        </motion.span>
      </span>
      <input
        {...props}
        aria-orientation="vertical"
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value}
        className="pointer-events-none sr-only"
        disabled={disabled}
        max={max}
        min={min}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(Number(event.target.value))}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        ref={inputRef}
        step={step}
        type="range"
        value={value}
      />
    </motion.div>
  );
};
