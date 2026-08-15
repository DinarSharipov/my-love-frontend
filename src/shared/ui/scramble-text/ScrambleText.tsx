import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';

type ScrambleTextProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  characterClassName?: string;
  text: string;
};

type CharacterToken = {
  character: string;
  id: string;
};

const scrambleGlyphs = '01アイウエオカキクケコЖФЦЧШЩЪЫЬЭЮЯ<>/[]{}#$%*+'.split('');
const scrambleFrames = 8;
const frameDuration = 42;

const createCharacterTokens = (text: string): CharacterToken[] => {
  const occurrences = new Map<string, number>();

  return Array.from(text, (character) => {
    const occurrence = occurrences.get(character) ?? 0;
    occurrences.set(character, occurrence + 1);

    return {
      character,
      id: `${character.codePointAt(0) ?? 0}-${occurrence}`,
    };
  });
};

const ScrambleCharacter = ({
  character,
  className = '',
}: {
  character: string;
  className?: string;
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayedCharacter, setDisplayedCharacter] = useState(character);
  const [isScrambling, setIsScrambling] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const startScramble = () => {
    if (shouldReduceMotion || character.trim().length === 0) {
      return;
    }

    clearTimers();
    setIsScrambling(true);

    const characterSeed = character.codePointAt(0) ?? 0;

    for (let frame = 0; frame <= scrambleFrames; frame += 1) {
      const timer = window.setTimeout(() => {
        const isFinalFrame = frame === scrambleFrames;
        const nextCharacter = isFinalFrame
          ? character
          : scrambleGlyphs[(characterSeed + frame * 7) % scrambleGlyphs.length];

        setDisplayedCharacter(nextCharacter);

        if (isFinalFrame) {
          setIsScrambling(false);
        }
      }, frame * frameDuration);

      timersRef.current.push(timer);
    }
  };

  return (
    <motion.span
      animate={
        isScrambling
          ? {
              color: 'var(--color-cyber-cyan)',
              scale: [1, 1.18, 0.94, 1],
              textShadow: '0 0 14px var(--color-cyber-cyan)',
              y: [0, -3, 2, 0],
            }
          : {
              color: 'inherit',
              scale: 1,
              textShadow: 'inherit',
              y: 0,
            }
      }
      aria-hidden="true"
      className={`inline-grid cursor-default place-items-center ${className}`}
      onHoverStart={startScramble}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      <span className="invisible col-start-1 row-start-1">{character}</span>
      <span className="col-start-1 row-start-1">{displayedCharacter}</span>
    </motion.span>
  );
};

export const ScrambleText = ({
  characterClassName,
  className = '',
  text,
  ...props
}: ScrambleTextProps) => {
  const characters = useMemo(() => createCharacterTokens(text), [text]);

  return (
    <span aria-label={text} className={`inline-flex ${className}`} {...props}>
      {characters.map(({ character, id }) => (
        <ScrambleCharacter character={character} className={characterClassName} key={id} />
      ))}
    </span>
  );
};
