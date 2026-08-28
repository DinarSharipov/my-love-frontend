import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

import { useFindCurrentUserQuery, useFindMyFamilyQuery } from '@/shared/api';
import intimacyCalendarAppIcon from '@/shared/assets/intimacy-calendar-app-icon.png';
import wishesAppIcon from '@/shared/assets/wishes-app-icon.png';
import { HeaderPanel, PageLayout } from '@/shared/ui';

gsap.registerPlugin(useGSAP);

type EntertainmentApp = {
  image: string;
  title: string;
  to: string;
};

type EntertainmentAppConfig = EntertainmentApp & { requiresPair?: boolean };

const entertainmentApps: readonly EntertainmentAppConfig[] = [
  { image: wishesAppIcon, title: 'Наши желания', to: '/my_family/wishes' },
  {
    image: intimacyCalendarAppIcon,
    requiresPair: true,
    title: 'Интимный календарь',
    to: '/my_family/intimacy',
  },
];

const EntertainmentAppTile = ({ image, title, to }: EntertainmentApp) => {
  const shouldReduceMotion = useReducedMotion();
  const scopeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<{
    contentX: (value: number) => gsap.core.Tween;
    contentY: (value: number) => gsap.core.Tween;
    rotateX: (value: number) => gsap.core.Tween;
    rotateY: (value: number) => gsap.core.Tween;
  } | null>(null);

  useGSAP(
    () => {
      if (shouldReduceMotion) {
        return () => {
          tiltRef.current = null;
        };
      }

      if (cardRef.current && contentRef.current) {
        tiltRef.current = {
          contentX: gsap.quickTo(contentRef.current, 'x', { duration: 0.45, ease: 'power3.out' }),
          contentY: gsap.quickTo(contentRef.current, 'y', { duration: 0.45, ease: 'power3.out' }),
          rotateX: gsap.quickTo(cardRef.current, 'rotationX', {
            duration: 0.7,
            ease: 'power3.out',
          }),
          rotateY: gsap.quickTo(cardRef.current, 'rotationY', {
            duration: 0.7,
            ease: 'power3.out',
          }),
        };
      }

      const handlePagePointerMove = (event: globalThis.PointerEvent) => {
        if (event.pointerType === 'touch' || !cardRef.current) return;

        const bounds = cardRef.current.getBoundingClientRect();
        const x = Math.max(
          -1,
          Math.min(1, (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width * 2)),
        );
        const y = Math.max(
          -1,
          Math.min(1, (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height * 2)),
        );

        tiltRef.current?.rotateX(-y * 24);
        tiltRef.current?.rotateY(x * 24);
        tiltRef.current?.contentX(x * 12);
        tiltRef.current?.contentY(y * 12);
      };

      window.addEventListener('pointermove', handlePagePointerMove, { passive: true });

      return () => {
        window.removeEventListener('pointermove', handlePagePointerMove);
        tiltRef.current = null;
      };
    },
    { dependencies: [shouldReduceMotion], scope: scopeRef },
  );

  return (
    <div className="[perspective:1100px]" ref={scopeRef}>
      <Link
        aria-label={`Открыть раздел «${title}»`}
        className="group relative block aspect-square w-full min-w-40 max-w-64 overflow-hidden rounded-[30%] bg-transparent shadow-[0_18px_48px_rgba(176,38,255,0.32)] outline-none transition-shadow duration-300 hover:shadow-[0_0_34px_rgba(255,43,214,0.7),0_22px_58px_rgba(0,245,255,0.24)] focus-visible:ring-2 focus-visible:ring-cyber-cyan"
        ref={cardRef}
        style={{ transformStyle: 'preserve-3d' }}
        to={to}
      >
        <img
          alt=""
          className="absolute inset-0 size-full scale-[1.22] rounded-[30%] object-cover"
          src={image}
        />
        <span className="absolute inset-0 rounded-[30%] bg-gradient-to-t from-surface/70 via-surface/5 to-transparent" />
        <span className="absolute inset-0 bg-[linear-gradient(125deg,transparent_36%,rgba(255,255,255,0.44)_48%,transparent_62%)] opacity-60 transition-transform duration-700 group-hover:translate-x-8" />
        <div
          className="absolute inset-0 flex flex-col justify-between px-5 py-5 text-left text-surface"
          ref={contentRef}
          style={{ transform: 'translateZ(42px)' }}
        >
          <span className="max-w-full break-words bg-gradient-to-br from-white via-fuchsia-50 to-cyan-100 bg-clip-text text-[clamp(1rem,2vw,1.25rem)] font-black leading-[1] tracking-tight text-transparent drop-shadow-[0_3px_8px_rgba(42,8,72,0.45)]">
            {title}
          </span>
        </div>
      </Link>
    </div>
  );
};

export const EntertainmentPage = () => {
  const family = useFindMyFamilyQuery();
  const currentUser = useFindCurrentUserQuery();
  const partners = family.data?.members.filter((member) => member.role === 'PARTNER') ?? [];
  const canUseIntimacy =
    partners.length === 2 && partners.some((member) => member.user.id === currentUser.data?.id);
  const visibleApps = entertainmentApps
    .filter((app) => !app.requiresPair || canUseIntimacy)
    .map(({ image, title, to }) => ({ image, title, to }));

  return (
    <PageLayout>
      <HeaderPanel
        left={
          <>
            <p className="text-neon-pink text-xs font-semibold uppercase tracking-[0.2em]">
              Развлечения
            </p>
            <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">
              Время для вас двоих
            </h1>
            <p className="text-muted-text mt-1 text-sm">
              Выберите настроение и создавайте новые общие истории.
            </p>
          </>
        }
      />

      <section
        aria-label="Приложения развлечений"
        className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-6 px-1 py-5 sm:gap-8"
      >
        {visibleApps.map((app) => (
          <EntertainmentAppTile key={app.to} {...app} />
        ))}
      </section>
    </PageLayout>
  );
};
