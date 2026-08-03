'use client';

import { motion, type PanInfo, type Variants } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRightLeft,
  Bell,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  FolderOpen,
  Mail,
  MessageCircle,
  Microscope,
  Phone,
  PhoneMissed,
  RotateCcw,
  Syringe,
  Users,
  UserRound,
} from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';
import {
  isResetLayoutFanfarePlaying,
  playResetLayoutFanfare,
  RESET_FANFARE,
  RESET_SETTLE_STAGGER,
} from '@/components/home/problem-chaos-desk/resetLayoutSound';

const STORAGE_KEY = 'phx-chaos-desk-positions';

type Pos = { x: number; y: number };
type PosMap = Record<string, Pos>;

type DeskDragContextValue = {
  deskRef: RefObject<HTMLDivElement | null>;
  positions: PosMap;
  updatePosition: (id: string, next: Pos) => void;
  bringToFront: (id: string) => void;
  frontId: string | null;
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
  resetKey: number;
  useScoredReset: boolean;
};

const DeskDragContext = createContext<DeskDragContextValue | null>(null);

function useDeskDrag() {
  const ctx = useContext(DeskDragContext);
  if (!ctx) throw new Error('useDeskDrag must be used inside ProblemChaosDesk');
  return ctx;
}

function loadPositions(): PosMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PosMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function persistPositions(map: PosMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

/** First-load entrance (viewport). Keep light — not scored to the fanfare. */
const enterContainerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.08 } },
};

const enterItemVariants: Variants = {
  hidden: (rotate: number) => ({ opacity: 0, scale: 0.85, rotate }),
  show: (rotate: number) => ({
    opacity: 1,
    scale: 1,
    rotate,
    transition: { type: 'spring', stiffness: 300, damping: 22, mass: 0.7 },
  }),
};

/**
 * Reset shuffle — scored to RESET_FANFARE:
 * chaos (dissonance) → settle waves (chord grid → sparkle).
 * No `x`/`y` in variants — drag owns translation. Rotate stays via `custom`.
 */
const resetContainerVariants: Variants = {
  hidden: {},
  chaos: {
    // Parallel burst — must finish with RESET_FANFARE.chaosEnd so settle hits chord 1
    transition: { staggerChildren: 0, delayChildren: 0 },
  },
  settle: {
    transition: {
      staggerChildren: RESET_SETTLE_STAGGER,
      delayChildren: 0.02,
    },
  },
};

const resetItemVariants: Variants = {
  hidden: (rotate: number) => ({
    opacity: 0,
    scale: 0.42,
    rotate: rotate * 3.2,
  }),
  chaos: (rotate: number) => ({
    opacity: 0.72,
    scale: 1.12,
    rotate: rotate * 2.4,
    transition: {
      duration: RESET_FANFARE.chaosEnd,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  settle: (rotate: number) => ({
    opacity: 1,
    scale: 1,
    rotate,
    transition: {
      opacity: { duration: 0.18 },
      scale: { type: 'spring', stiffness: 220, damping: 16, mass: 0.85 },
      rotate: { type: 'spring', stiffness: 160, damping: 14, mass: 0.95 },
    },
  }),
};

function DraggableShell({
  id,
  className,
  children,
  style,
  rotate = 0,
  baseZ = 10,
  'aria-hidden': ariaHidden,
}: {
  id: string;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  rotate?: number;
  baseZ?: number;
  'aria-hidden'?: boolean;
}) {
  const {
    deskRef,
    positions,
    updatePosition,
    bringToFront,
    frontId,
    draggingId,
    setDraggingId,
    useScoredReset,
  } = useDeskDrag();
  const pos = positions[id] ?? { x: 0, y: 0 };
  const isDragging = draggingId === id;
  const zIndex = isDragging || frontId === id ? 60 : baseZ;

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      setDraggingId(null);
      updatePosition(id, {
        x: pos.x + info.offset.x,
        y: pos.y + info.offset.y,
      });
    },
    [id, pos.x, pos.y, setDraggingId, updatePosition],
  );

  return (
    <motion.div
      variants={useScoredReset ? resetItemVariants : enterItemVariants}
      custom={rotate}
      drag
      dragConstraints={deskRef}
      dragMomentum={false}
      dragElastic={0.06}
      whileDrag={{ scale: 1.03 }}
      onDragStart={() => {
        bringToFront(id);
        setDraggingId(id);
      }}
      onDragEnd={handleDragEnd}
      style={{ x: pos.x, y: pos.y, zIndex, ...style }}
      className={cn(
        'absolute touch-none select-none phx-chaos-cursor-grab',
        isDragging && 'phx-chaos-cursor-grabbing phx-chaos-card-lift',
        className,
      )}
      aria-hidden={ariaHidden}
    >
      {children}
    </motion.div>
  );
}

function GlassCard({
  id,
  className,
  children,
  style,
  rotate = 0,
  baseZ = 10,
}: {
  id: string;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  rotate?: number;
  baseZ?: number;
}) {
  return (
    <DraggableShell
      id={id}
      rotate={rotate}
      baseZ={baseZ}
      style={style}
      className={cn(
        'rounded-xl border border-white/15 bg-[#0B1020]/75 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.45)] p-2.5',
        className,
      )}
    >
      {children}
    </DraggableShell>
  );
}

function StickyNote({
  id,
  className,
  color,
  children,
  rotate = -6,
  baseZ = 30,
}: {
  id: string;
  className?: string;
  color: 'yellow' | 'pink' | 'purple' | 'green';
  children: ReactNode;
  rotate?: number;
  baseZ?: number;
}) {
  const bg =
    color === 'yellow'
      ? 'bg-[#FDE68A] text-[#78350F]'
      : color === 'pink'
        ? 'bg-[#FBCFE8] text-[#9D174D]'
        : color === 'green'
          ? 'bg-[#BBF7D0] text-[#14532D]'
          : 'bg-[#DDD6FE] text-[#5B21B6]';
  return (
    <DraggableShell
      id={id}
      rotate={rotate}
      baseZ={baseZ}
      className={cn(
        'w-[88px] h-[88px] p-2 text-[10px] font-medium leading-snug shadow-lg',
        bg,
        className,
      )}
    >
      {children}
    </DraggableShell>
  );
}

export default function ProblemChaosDesk() {
  const reducedMotion = usePrefersReducedMotion();
  const deskRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<PosMap>({});
  const [hydrated, setHydrated] = useState(false);
  const [frontId, setFrontId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    setPositions(loadPositions());
    setHydrated(true);
  }, []);

  const updatePosition = useCallback((id: string, next: Pos) => {
    setPositions((prev) => {
      const map = { ...prev, [id]: next };
      persistPositions(map);
      return map;
    });
  }, []);

  const bringToFront = useCallback((id: string) => {
    setFrontId(id);
  }, []);

  const resetLayout = useCallback(() => {
    if (isResetLayoutFanfarePlaying()) return;
    if (!reducedMotion) {
      playResetLayoutFanfare();
    }
    setPositions({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setFrontId(null);
    setDraggingId(null);
    setResetKey((k) => k + 1);
  }, [reducedMotion]);

  const dragCtx = useMemo(
    () => ({
      deskRef,
      positions,
      updatePosition,
      bringToFront,
      frontId,
      draggingId,
      setDraggingId,
      resetKey,
      useScoredReset: resetKey > 0 && !reducedMotion,
    }),
    [positions, updatePosition, bringToFront, frontId, draggingId, resetKey, reducedMotion],
  );

  const useScoredReset = resetKey > 0 && !reducedMotion;

  const containerMotionProps = reducedMotion
    ? { initial: 'show' as const, animate: 'show' as const }
    : useScoredReset
      ? {
          // Scored chaos → settle sequence (see RESET_FANFARE)
          initial: 'hidden' as const,
          animate: ['chaos', 'settle'] as const,
        }
      : {
          initial: 'hidden' as const,
          whileInView: 'show' as const,
          viewport: { once: true, amount: 0.15 },
        };

  return (
    <div
      ref={deskRef}
      className="relative w-full h-full min-h-[560px] lg:min-h-[780px] rounded-2xl overflow-hidden border border-white/10"
    >
      {/* Desk surface */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 60% 40%, #1a1528 0%, #0a0a0f 55%, #050508 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Dashed connectors */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none opacity-30"
        viewBox="0 0 800 780"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M120 80 C 220 120, 280 200, 360 240"
          stroke="rgba(148,163,184,0.5)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M400 120 C 480 180, 520 260, 580 300"
          stroke="rgba(148,163,184,0.45)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M180 320 C 280 360, 360 400, 480 420"
          stroke="rgba(148,163,184,0.4)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M520 160 C 560 280, 540 380, 420 480"
          stroke="rgba(148,163,184,0.35)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M260 520 C 340 540, 420 560, 560 540"
          stroke="rgba(148,163,184,0.35)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <path
          d="M100 560 C 220 600, 380 620, 520 600"
          stroke="rgba(148,163,184,0.3)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
      </svg>

      <button
        type="button"
        onClick={resetLayout}
        className="absolute top-2.5 right-2.5 z-[70] inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-medium text-[#94A3B8] backdrop-blur-sm transition-colors hover:border-white/25 hover:text-[#E2E8F0] phx-focus-ring"
      >
        <RotateCcw className="w-3 h-3" />
        Reset layout
      </button>

      <DeskDragContext.Provider value={dragCtx}>
        {hydrated && (
          <motion.div
            key={resetKey}
            className="absolute inset-0"
            variants={useScoredReset ? resetContainerVariants : enterContainerVariants}
            {...containerMotionProps}
          >
            <GlassCard id="whatsapp" className="left-[4%] top-[5%] w-[178px]" rotate={-4} baseZ={20}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#22C55E]/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-3.5 h-3.5 text-[#22C55E]" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[10px] font-semibold text-[#F8FAFC]">WhatsApp</p>
                    <span className="text-[9px] text-[#64748B]">9:02 AM</span>
                  </div>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">
                    Can I reschedule to 11 AM?
                  </p>
                  <span className="inline-flex mt-1 w-4 h-4 rounded-full bg-[#22C55E] text-[8px] text-white items-center justify-center font-bold">
                    2
                  </span>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="incoming-call" className="left-[28%] top-[2%] w-[176px]" rotate={3} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
                  <Phone className="w-3.5 h-3.5 text-[#A78BFA]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[10px] font-semibold text-[#F8FAFC]">Incoming Call</p>
                    <span className="text-[9px] text-[#64748B]">9:01 AM</span>
                  </div>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">+91 98765 43210</p>
                  <div className="flex gap-1.5 mt-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#22C55E]/30 flex items-center justify-center">
                      <Phone className="w-2.5 h-2.5 text-[#22C55E]" />
                    </span>
                    <span className="w-5 h-5 rounded-full bg-[#EF4444]/30 flex items-center justify-center">
                      <PhoneMissed className="w-2.5 h-2.5 text-[#EF4444]" />
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard
              id="double-booking"
              className="right-[6%] top-[4%] w-[188px] border-[#EF4444]/30"
              rotate={5}
              baseZ={20}
            >
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#EF4444]/20 flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-[#F87171]" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[10px] font-semibold text-[#F8FAFC]">Double Booking</p>
                    <span className="text-[9px] text-[#64748B]">9:04 AM</span>
                  </div>
                  <p className="text-[10px] text-[#FCA5A5] mt-0.5 leading-snug">
                    Dr. Sarah — 10:00 AM already booked
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="patient-message" className="left-[6%] top-[22%] w-[172px]" rotate={2} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
                  <UserRound className="w-3.5 h-3.5 text-[#A78BFA]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Patient Message</p>
                  <p className="text-[9px] text-[#64748B]">9:05 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5">Is Max&apos;s lab ready?</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard
              id="inventory-low"
              className="left-[34%] top-[18%] w-[182px] border-[#EF4444]/25"
              rotate={-3}
              baseZ={20}
            >
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#EF4444]/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F87171]" />
                </span>
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[10px] font-semibold text-[#F8FAFC]">Inventory Low</p>
                    <span className="text-[9px] text-[#64748B]">9:08 AM</span>
                  </div>
                  <p className="text-[10px] text-[#FCA5A5] mt-0.5 leading-snug">
                    Metronidazole 250mg — Only 2 left in stock
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="new-email" className="right-[3%] top-[22%] w-[176px]" rotate={-5} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                  <Mail className="w-3.5 h-3.5 text-[#93C5FD]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">New Email</p>
                  <p className="text-[9px] text-[#64748B]">9:07 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5">Lab invoice attached</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="patient-records" className="left-[50%] top-[8%] w-[164px]" rotate={7} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
                  <FolderOpen className="w-3.5 h-3.5 text-[#A78BFA]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Patient Records</p>
                  <p className="text-[9px] text-[#64748B]">9:10 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">
                    Scattered across 3 different folders
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="room-conflict" className="left-[22%] top-[30%] w-[158px]" rotate={6} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#EF4444]/20 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#F87171]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Room Conflict</p>
                  <p className="text-[9px] text-[#64748B]">9:09 AM</p>
                  <p className="text-[10px] text-[#FCA5A5] mt-0.5 leading-snug">Exam 2 double-booked</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="todays-schedule" className="right-[20%] top-[32%] w-[198px]" rotate={2} baseZ={20}>
              <div className="flex items-center gap-2 mb-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-[#A78BFA]" />
                <p className="text-[10px] font-semibold text-[#F8FAFC]">Today&apos;s Schedule</p>
              </div>
              <ul className="space-y-1 text-[10px]">
                <li className="flex justify-between text-[#CBD5E1]">
                  <span>09:00 Bella</span>
                  <span className="text-[#64748B]">Check-up</span>
                </li>
                <li className="flex justify-between items-center rounded bg-[#EF4444]/15 px-1.5 py-0.5 text-[#FCA5A5] border border-[#EF4444]/25">
                  <span>10:00 Dr. Sarah</span>
                  <AlertTriangle className="w-3 h-3" />
                </li>
                <li className="flex justify-between text-[#CBD5E1]">
                  <span>11:45 Luna</span>
                  <span className="text-[#64748B]">Follow-up</span>
                </li>
              </ul>
            </GlassCard>

            <GlassCard id="lab-report" className="left-[5%] top-[38%] w-[158px]" rotate={-2} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#22C55E]/15 flex items-center justify-center shrink-0">
                  <Microscope className="w-3.5 h-3.5 text-[#86EFAC]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Lab Report</p>
                  <p className="text-[9px] text-[#64748B]">9:12 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5">Uploaded — Max</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="rx-pending" className="left-[48%] top-[38%] w-[160px]" rotate={-6} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#F97316]/20 flex items-center justify-center shrink-0">
                  <Syringe className="w-3.5 h-3.5 text-[#FDBA74]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Rx Pending</p>
                  <p className="text-[9px] text-[#64748B]">9:11 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">3 scripts not dispensed</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="payment-pending" className="left-[28%] top-[42%] w-[155px]" rotate={4} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#F97316]/20 flex items-center justify-center shrink-0">
                  <DollarSign className="w-3.5 h-3.5 text-[#FDBA74]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Payment Pending</p>
                  <p className="text-[9px] text-[#64748B]">9:15 AM</p>
                  <p className="text-[10px] text-[#FDBA74] mt-0.5">₹ 8,400 overdue</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="crm" className="right-[4%] top-[48%] w-[162px]" rotate={-3} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#EC4899]/20 flex items-center justify-center shrink-0">
                  <UserRound className="w-3.5 h-3.5 text-[#F9A8D4]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">CRM</p>
                  <p className="text-[9px] text-[#64748B]">Retention</p>
                  <p className="text-[10px] text-[#F9A8D4] mt-0.5">Last seen: 45 days ago</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="missed-call" className="left-[14%] top-[54%] w-[168px]" rotate={3} baseZ={20}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#EF4444]/20 flex items-center justify-center shrink-0">
                  <PhoneMissed className="w-3.5 h-3.5 text-[#F87171]" />
                </span>
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[10px] font-semibold text-[#F8FAFC]">Missed Call</p>
                    <span className="text-[9px] text-[#64748B]">9:16 AM</span>
                  </div>
                  <p className="text-[10px] text-[#FCA5A5] mt-0.5 leading-snug">3 missed — no callback yet</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="staff-handoff" className="left-[38%] top-[56%] w-[172px]" rotate={-3} baseZ={20}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#A78BFA]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Staff Handoff</p>
                  <p className="text-[9px] text-[#64748B]">9:18 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">Who took Bella&apos;s vitals?</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="paper-form" className="right-[22%] top-[52%] w-[170px]" rotate={4} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-[#FCD34D]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Paper Form Pending</p>
                  <p className="text-[9px] text-[#64748B]">9:20 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">Consent not scanned yet</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="walk-in" className="right-[5%] top-[62%] w-[164px]" rotate={-4} baseZ={20}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#22D3EE]/20 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-[#67E8F9]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Walk-in Queue</p>
                  <p className="text-[9px] text-[#64748B]">9:22 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">2 waiting, no room free</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="reminder-overdue" className="left-[62%] top-[64%] w-[162px]" rotate={5} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#A855F7]/20 flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5 text-[#C4B5FD]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Reminder Overdue</p>
                  <p className="text-[9px] text-[#64748B]">9:24 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">Vaccine recall not sent</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="lab-delay" className="left-[6%] top-[68%] w-[158px]" rotate={-5} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#3B82F6]/20 flex items-center justify-center shrink-0">
                  <Microscope className="w-3.5 h-3.5 text-[#93C5FD]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Lab Delay</p>
                  <p className="text-[9px] text-[#64748B]">9:25 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">Bloodwork still pending</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="chart-unsigned" className="left-[26%] top-[70%] w-[160px]" rotate={3} baseZ={20}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#EF4444]/20 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-3.5 h-3.5 text-[#F87171]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Chart Unsigned</p>
                  <p className="text-[9px] text-[#64748B]">9:26 AM</p>
                  <p className="text-[10px] text-[#FCA5A5] mt-0.5 leading-snug">SOAP waiting on Dr. Lee</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="owner-waiting" className="left-[48%] top-[72%] w-[162px]" rotate={-4} baseZ={20}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#F59E0B]/20 flex items-center justify-center shrink-0">
                  <UserRound className="w-3.5 h-3.5 text-[#FCD34D]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Owner Waiting</p>
                  <p className="text-[9px] text-[#64748B]">9:27 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">Lobby — 18 min overdue</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="vaccine-due" className="left-[70%] top-[70%] w-[158px]" rotate={5} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#22C55E]/20 flex items-center justify-center shrink-0">
                  <Syringe className="w-3.5 h-3.5 text-[#86EFAC]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Vaccine Due</p>
                  <p className="text-[9px] text-[#64748B]">9:28 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">Luna — DHPP overdue</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard id="insurance-hold" className="left-[34%] top-[78%] w-[155px]" rotate={-2} baseZ={10}>
              <div className="flex items-start gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-[#A78BFA]" />
                </span>
                <div>
                  <p className="text-[10px] font-semibold text-[#F8FAFC]">Insurance Hold</p>
                  <p className="text-[9px] text-[#64748B]">9:29 AM</p>
                  <p className="text-[10px] text-[#CBD5E1] mt-0.5 leading-snug">Claim stalled — missing code</p>
                </div>
              </div>
            </GlassCard>

            <DraggableShell
              id="notepad"
              rotate={-3}
              baseZ={30}
              className="left-[2%] bottom-[5%] w-[118px] rounded bg-[#fefce8] border border-[#eab308]/30 p-2 shadow-lg text-[#713f12]"
            >
              <p className="text-[9px] font-bold uppercase mb-1">Today&apos;s Tasks</p>
              <ul className="space-y-0.5 text-[8px]">
                {['Confirm vaccines', 'Order meds', 'Call lab', 'Update chart'].map((t) => (
                  <li key={t} className="flex items-center gap-1">
                    <Check className="w-2.5 h-2.5 text-[#16a34a]" />
                    {t}
                  </li>
                ))}
              </ul>
            </DraggableShell>

            <StickyNote id="sticky-yellow" className="left-[20%] bottom-[5%]" color="yellow" rotate={-5}>
              Owner arriving at 9:30 AM
            </StickyNote>
            <StickyNote id="sticky-pink" className="left-[33%] bottom-[4.5%]" color="pink" rotate={4}>
              Call back Mr. John !!
            </StickyNote>
            <StickyNote id="sticky-purple" className="left-[46%] bottom-[5.5%]" color="purple" rotate={-3} baseZ={28}>
              Check Inventory!
            </StickyNote>
            <StickyNote id="sticky-green" className="left-[59%] bottom-[5%]" color="green" rotate={5}>
              Refill vaccines today
            </StickyNote>

            <DraggableShell
              id="paper-pen"
              aria-hidden
              rotate={-4}
              baseZ={14}
              className="left-[72%] bottom-[7%] w-[68px] h-9"
            >
              <div className="absolute inset-0 rounded-[2px] bg-[#e7e2d6] rotate-[5deg] shadow-md" />
              <div className="absolute inset-0 rounded-[2px] bg-[#faf7ef] -rotate-[2deg] shadow-md border border-black/5 p-1">
                <div className="h-0.5 w-3/4 rounded bg-[#cbd5e1]" />
                <div className="mt-0.5 h-0.5 w-full rounded bg-[#e2e8f0]" />
                <div className="mt-0.5 h-0.5 w-2/3 rounded bg-[#e2e8f0]" />
              </div>
              <div className="absolute -right-3 top-1 w-14 h-1.5 rounded-full rotate-[20deg] bg-gradient-to-r from-[#0f766e] via-[#134e4a] to-[#0b3b38] shadow-md">
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-1.5 rounded-r-full bg-[#cbd5e1]" />
              </div>
            </DraggableShell>

            <DraggableShell
              id="mug"
              aria-hidden
              rotate={6}
              baseZ={16}
              className="right-[3%] bottom-[10%] w-14 h-14"
            >
              {!reducedMotion && (
                <motion.svg
                  viewBox="0 0 40 28"
                  className="absolute left-1/2 -top-3 -translate-x-1/2 w-8 h-6 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0], y: [3, -5, -8] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <path d="M14 26 C 10 18, 18 14, 14 6" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M26 26 C 30 18, 22 14, 26 6" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" fill="none" />
                </motion.svg>
              )}
              <div className="relative mx-auto w-14 h-14">
                <span className="absolute -right-2.5 top-3.5 w-4 h-7 rounded-r-full border-[3px] border-[#d5dbe4]" />
                <div className="absolute inset-0 rounded-full border-[3px] border-[#e2e8f0] bg-[#111827] shadow-[0_8px_16px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-[5px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#6b4423_0%,#3f2716_55%,#241206_100%)]">
                    <span className="absolute left-[28%] top-[26%] w-2.5 h-1 rounded-full bg-white/25 blur-[1px]" />
                  </div>
                </div>
              </div>
            </DraggableShell>

            <DraggableShell
              id="clipboard"
              rotate={8}
              baseZ={20}
              className="left-[56%] top-[42%] w-[138px] rounded-lg bg-[#1e1b2e] border border-white/10 shadow-xl overflow-hidden"
            >
              <div className="h-3 bg-[#374151]" />
              <div className="p-2 bg-[#f8fafc] text-[#0f172a]">
                <p className="text-[8px] font-bold uppercase tracking-wide mb-1">Today&apos;s Appointments</p>
                <ul className="space-y-0.5 text-[8px]">
                  <li className="line-through text-slate-400">09:00 Bella</li>
                  <li className="bg-red-100 text-red-700 px-0.5 font-semibold">10:00 DOUBLE BOOKED</li>
                  <li>11:45 Luna</li>
                  <li>02:00 Rocky</li>
                </ul>
              </div>
            </DraggableShell>
          </motion.div>
        )}
      </DeskDragContext.Provider>

      <div
        aria-hidden
        className="absolute bottom-0 left-[35%] right-[20%] h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
      />
    </div>
  );
}
