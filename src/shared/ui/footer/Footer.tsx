import { House, UserRound, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

type MenuItem = {
  icon: LucideIcon;
  label: string;
  to: string;
};

const menuItems: readonly MenuItem[] = [
  { icon: House, label: 'Главная', to: '/main' },
  { icon: UserRound, label: 'Личный кабинет', to: '/main/profile' },
];

const DockItem = ({
  icon: Icon,
  label,
  mouseX,
  to,
}: MenuItem & { mouseX: ReturnType<typeof useMotionValue<number>> }) => {
  const itemRef = useRef<HTMLAnchorElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const distance = useTransform(mouseX, (pointerX) => {
    const bounds = itemRef.current?.getBoundingClientRect();

    return bounds ? pointerX - (bounds.left + bounds.width / 2) : Number.POSITIVE_INFINITY;
  });
  const size = useSpring(useTransform(distance, [-120, 0, 120], [48, 76, 48]), {
    damping: 18,
    mass: 0.14,
    stiffness: 220,
  });
  const iconSize = useTransform(size, [48, 76], [22, 34]);
  const lift = useTransform(size, [48, 76], [0, -12]);

  return (
    <NavLink
      ref={itemRef}
      aria-label={label}
      className="group relative flex items-end justify-center outline-none"
      end={to === '/main'}
      onBlur={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      to={to}
    >
      {({ isActive }) => (
        <>
          <AnimatePresence>
            {isHovered && (
              <motion.span
                animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                className="border-border bg-surface/90 text-text pointer-events-none absolute bottom-[calc(100%+18px)] z-20 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium shadow-[0_0_24px_rgba(176,38,255,0.24)] backdrop-blur-xl"
                exit={{ filter: 'blur(4px)', opacity: 0, y: 5 }}
                initial={{ filter: 'blur(4px)', opacity: 0, y: 5 }}
                transition={{ duration: 0.16 }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          <motion.span
            className={`relative grid place-items-center rounded-2xl border backdrop-blur-xl transition-colors duration-300 ${
              isActive
                ? 'border-primary-neon/80 bg-primary-neon/15 text-primary-neon shadow-[0_0_24px_rgba(176,38,255,0.48),inset_0_0_16px_rgba(176,38,255,0.12)]'
                : 'border-border bg-elevated/65 text-muted-text group-hover:border-primary-neon/70 group-hover:text-text group-hover:shadow-[0_0_26px_rgba(176,38,255,0.42)] group-focus-visible:border-cyber-cyan group-focus-visible:text-cyber-cyan'
            }`}
            style={{ height: size, translateY: lift, width: size }}
          >
            <motion.span
              aria-hidden="true"
              className="bg-primary-neon/20 pointer-events-none absolute inset-2 rounded-xl opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
            />
            <motion.span
              className="relative grid place-items-center"
              style={{ height: iconSize, width: iconSize }}
            >
              <Icon className="h-full w-full" strokeWidth={1.7} />
            </motion.span>
            {isActive && (
              <motion.span
                layoutId="footer-active-indicator"
                className="bg-cyber-cyan shadow-cyber-cyan/80 absolute -bottom-2 h-1 w-1 rounded-full shadow-[0_0_10px_currentColor]"
              />
            )}
          </motion.span>
        </>
      )}
    </NavLink>
  );
};

export const Footer = () => {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);

  return (
    <footer className="relative z-30 flex shrink-0 justify-center px-4 pb-5 pt-3">
      <motion.nav
        aria-label="Основная навигация"
        className="border-border bg-surface/55 shadow-primary-neon/10 flex h-[72px] items-end gap-3 rounded-[1.75rem] border px-3 pb-3 shadow-[0_0_45px_currentColor] backdrop-blur-2xl"
        onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
        onMouseMove={({ clientX }) => mouseX.set(clientX)}
      >
        {menuItems.map((item) => (
          <DockItem key={item.to} {...item} mouseX={mouseX} />
        ))}
      </motion.nav>
    </footer>
  );
};
