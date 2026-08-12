import type { LucideIcon } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export type MenuItem = {
  callback?: () => Promise<void> | void;
  children?: MenuItem[];
  icon: LucideIcon;
  label: string;
  to?: string;
};

type FooterProps = {
  items: readonly MenuItem[];
};

const submenuVariants = {
  closed: {
    transition: { staggerChildren: 0.035, staggerDirection: -1 },
  },
  opened: {
    transition: { delayChildren: 0.04, staggerChildren: 0.075 },
  },
};

const submenuItemVariants = {
  closed: { filter: 'blur(5px)', opacity: 0, scale: 0.72, y: 18 },
  opened: {
    filter: 'blur(0px)',
    opacity: 1,
    scale: 1,
    transition: { damping: 17, mass: 0.55, stiffness: 310, type: 'spring' as const },
    y: 0,
  },
};

const isMenuItemActive = (item: MenuItem, pathname: string): boolean =>
  item.to === pathname ||
  Boolean(item.children?.some((child) => isMenuItemActive(child, pathname)));

type DockIconProps = {
  Icon: LucideIcon;
  iconSize: ReturnType<typeof useTransform<number, number>>;
  isActive: boolean;
  lift: ReturnType<typeof useTransform<number, number>>;
  size: ReturnType<typeof useSpring>;
};

const DockIcon = ({ Icon, iconSize, isActive, lift, size }: DockIconProps) => (
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
        className="bg-cyber-cyan shadow-cyber-cyan/80 absolute -bottom-2 h-1 w-1 rounded-full shadow-[0_0_10px_currentColor]"
        layoutId="footer-active-indicator"
      />
    )}
  </motion.span>
);

const DockItem = ({
  callback,
  children,
  icon: Icon,
  label,
  mouseX,
  to,
}: MenuItem & { mouseX: ReturnType<typeof useMotionValue<number>> }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const submenuId = useId();
  const hasChildren = Boolean(children?.length);
  const isBranchActive = isMenuItemActive(
    { callback, children, icon: Icon, label, to },
    location.pathname,
  );
  const distance = useTransform(mouseX, (pointerX) => {
    const bounds = (triggerRef.current ?? linkRef.current)?.getBoundingClientRect();

    return bounds ? pointerX - (bounds.left + bounds.width / 2) : Number.POSITIVE_INFINITY;
  });
  const size = useSpring(useTransform(distance, [-120, 0, 120], [48, 76, 48]), {
    damping: 18,
    mass: 0.14,
    stiffness: 220,
  });
  const iconSize = useTransform(size, [48, 76], [22, 34]);
  const lift = useTransform(size, [48, 76], [0, -12]);
  let control: ReactNode;

  if (callback) {
    control = (
      <button
        ref={triggerRef}
        aria-controls={hasChildren ? submenuId : undefined}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-haspopup={hasChildren ? 'menu' : undefined}
        aria-label={label}
        className="group relative flex items-end justify-center outline-none"
        onClick={callback}
        type="button"
      >
        <DockIcon
          Icon={Icon}
          iconSize={iconSize}
          isActive={isBranchActive || isOpen}
          lift={lift}
          size={size}
        />
      </button>
    );
  } else if (to) {
    control = (
      <NavLink
        ref={linkRef}
        aria-controls={hasChildren ? submenuId : undefined}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-haspopup={hasChildren ? 'menu' : undefined}
        aria-label={label}
        className="group relative flex items-end justify-center outline-none"
        end={to === '/main'}
        to={to}
      >
        {({ isActive }) => (
          <DockIcon Icon={Icon} iconSize={iconSize} isActive={isActive} lift={lift} size={size} />
        )}
      </NavLink>
    );
  } else {
    control = (
      <button
        ref={triggerRef}
        aria-label={label}
        className="group relative flex cursor-not-allowed items-end justify-center opacity-45 outline-none"
        disabled
        type="button"
      >
        <DockIcon Icon={Icon} iconSize={iconSize} isActive={false} lift={lift} size={size} />
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group relative flex items-end justify-center"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
      }}
      onFocus={() => {
        if (hasChildren) setIsOpen(true);
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        if (hasChildren) setIsOpen(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsOpen(false);
      }}
    >
      <AnimatePresence>
        {isHovered && !isOpen && (
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

      {control}

      <AnimatePresence>
        {isOpen && children && (
          <motion.div
            animate="opened"
            className="absolute bottom-[calc(100%+24px)] left-1/2 z-30 flex -translate-x-1/2 flex-col-reverse gap-2"
            exit="closed"
            id={submenuId}
            initial="closed"
            role="menu"
            variants={submenuVariants}
          >
            <span aria-hidden="true" className="absolute -bottom-6 left-0 h-6 w-full" />
            {children.map(
              ({ callback: childCallback, icon: ChildIcon, label: childLabel, to: childTo }) => {
                const content = (
                  <>
                    <ChildIcon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                    <span className="border-border bg-surface/95 text-text pointer-events-none absolute right-[calc(100%+10px)] whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs opacity-100 shadow-[0_0_18px_rgba(176,38,255,0.2)] backdrop-blur-xl">
                      {childLabel}
                    </span>
                  </>
                );
                const className =
                  'group/child relative grid h-11 w-11 place-items-center rounded-full border border-primary-neon/55 bg-surface/85 text-muted-text shadow-[0_0_22px_rgba(176,38,255,0.24)] outline-none backdrop-blur-xl transition-colors hover:border-primary-neon hover:text-text focus-visible:border-cyber-cyan focus-visible:text-cyber-cyan';
                let action: ReactNode;

                if (childCallback) {
                  action = (
                    <button
                      aria-label={childLabel}
                      className={className}
                      onClick={() => {
                        setIsOpen(false);
                        childCallback();
                      }}
                      role="menuitem"
                      type="button"
                    >
                      {content}
                    </button>
                  );
                } else if (childTo) {
                  action = (
                    <NavLink
                      aria-label={childLabel}
                      className={className}
                      onClick={() => setIsOpen(false)}
                      role="menuitem"
                      to={childTo}
                    >
                      {content}
                    </NavLink>
                  );
                } else {
                  action = (
                    <button
                      aria-label={childLabel}
                      className={`${className} cursor-not-allowed opacity-45`}
                      disabled
                      role="menuitem"
                      type="button"
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <motion.div
                    key={`${childTo ?? 'callback'}-${childLabel}`}
                    variants={submenuItemVariants}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                  >
                    {action}
                  </motion.div>
                );
              },
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Footer = ({ items }: FooterProps) => {
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);

  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-5">
      <motion.nav
        aria-label="Основная навигация"
        className="border-border bg-surface/55 shadow-primary-neon/10 pointer-events-auto flex h-[72px] items-end gap-3 rounded-[1.75rem] border px-3 pb-3 shadow-[0_0_45px_currentColor] backdrop-blur-2xl"
        onMouseLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
        onMouseMove={({ clientX }) => mouseX.set(clientX)}
      >
        {items.map((item) => (
          <DockItem key={`${item.to ?? 'callback'}-${item.label}`} {...item} mouseX={mouseX} />
        ))}
      </motion.nav>
    </footer>
  );
};
