"use client";

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useMergeRefs,
  useRole,
} from "@floating-ui/react";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import { REPLACE_REASON_LABELS, SLOT_LABELS } from "@/lib/content/labels";
import { replaceReasonSchema, type ReplaceReason } from "@/lib/intake/schema";
import type { FoodSlot } from "@/lib/nutrition/plan-engine";
import { cn } from "@/lib/cn";
import { useMountMediaQuery } from "@/hooks/use-mount-media-query";
import {
  CONFIRM_HOLD_MS,
  dismiss as dismissGesture,
  floatingSurfaceTransition,
  floatingSurfaceVariants,
  LOADING_THRESHOLD_MS,
  opacityTween,
  replaceChipEnterTransition,
  replaceChipEnterVariants,
  replaceChipExitTransition,
  replaceChipExitVariants,
  sheetSurfaceTransition,
  sheetSurfaceVariants,
  spring,
  stagger,
} from "@/lib/motion";
import { transformOriginFromPlacement } from "@/lib/portal/replace-popover-origin";
import { ReplaceChip, ReplaceChipSkeleton } from "./replace-chip";
import { ReplaceGhostLink } from "./replace-ghost-link";

const REPLACE_REASONS = replaceReasonSchema.options;

type ReplaceOption = { slot: FoodSlot; label: string; tier: string };

type ReplaceStep = "reason" | "options";

export type ReplaceSelection = {
  reason: ReplaceReason;
  replacementSlot?: FoodSlot;
  replacementLabel: string;
};

export type MealReplacePopoverProps = {
  slot: FoodSlot;
  mealLabel: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onReplace?: (selection: ReplaceSelection) => void;
  className?: string;
};

export function MealReplacePopover({
  slot,
  mealLabel,
  open: openProp,
  onOpenChange,
  onReplace,
  className,
}: MealReplacePopoverProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const { mounted, matches: isMobile } = useMountMediaQuery("(max-width: 639px)");
  const panelId = useId();
  const headingId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstChipRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [onOpenChange, openProp],
  );

  const [step, setStep] = useState<ReplaceStep>("reason");
  const [reason, setReason] = useState<ReplaceReason | null>(null);
  const [options, setOptions] = useState<ReplaceOption[]>([]);
  const [fetching, setFetching] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const { refs, floatingStyles, context, placement } = useFloating({
    open: open && mounted && !isMobile,
    onOpenChange: setOpen,
    placement: "bottom-end",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: 12 }),
      shift({ padding: 12 }),
      size({
        padding: 12,
        apply({ availableHeight, elements, rects }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${availableHeight}px`,
            maxWidth: `${Math.min(340, rects.reference.width + 200)}px`,
          });
        },
      }),
    ],
  });

  const dismiss = useDismiss(context, { outsidePressEvent: "pointerdown" });
  const role = useRole(context, { role: "dialog" });
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, role]);
  const referenceRef = useMergeRefs([refs.setReference, triggerRef]);

  useEffect(() => {
    if (!open) {
      setStep("reason");
      setReason(null);
      setOptions([]);
      setFetching(false);
      setShowSkeleton(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !mounted) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) {
          firstChipRef.current?.focus({ preventScroll: true });
        }
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [open, mounted, step]);

  useEffect(() => {
    if (!open || !isMobile) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const previous = {
      position: style.position,
      top: style.top,
      width: style.width,
      overflow: style.overflow,
    };
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    style.overflow = "hidden";
    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.width = previous.width;
      style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open, isMobile]);

  useEffect(() => {
    if (!fetching) {
      setShowSkeleton(false);
      return;
    }
    const timer = window.setTimeout(() => setShowSkeleton(true), LOADING_THRESHOLD_MS);
    return () => window.clearTimeout(timer);
  }, [fetching]);

  async function pickReason(nextReason: ReplaceReason) {
    setReason(nextReason);
    setFetching(true);
    try {
      const res = await fetch(`/api/portal/adapt/replace?slot=${slot}`);
      const data = (await res.json()) as { options?: ReplaceOption[] };
      setOptions(data.options ?? []);
      setStep("options");
    } finally {
      setFetching(false);
    }
  }

  function closeAndReset() {
    setOpen(false);
    requestAnimationFrame(() => {
      triggerRef.current?.focus({ preventScroll: true });
    });
  }

  function confirmReplace(replacementSlot?: FoodSlot) {
    if (!reason) return;
    const replacementLabel = replacementSlot
      ? SLOT_LABELS[replacementSlot]
      : "another option";
    onReplace?.({ reason, replacementSlot, replacementLabel });
    closeAndReset();
  }

  const surfaceVariants = floatingSurfaceVariants(reduceMotion);
  const surfaceTransition = floatingSurfaceTransition(reduceMotion);
  const transformOrigin = transformOriginFromPlacement(placement);

  const panelSurfaceClass =
    "rounded-control border border-hairline bg-surface p-5 shadow-floating";

  const stepPanel = (
    <ReplaceStepPanel
      step={step}
      headingId={headingId}
      fetching={fetching}
      showSkeleton={showSkeleton}
      options={options}
      firstChipRef={firstChipRef}
      reduceMotion={reduceMotion}
      onPickReason={(r) => void pickReason(r)}
      onConfirm={confirmReplace}
      onBack={() => setStep("reason")}
      onCancel={closeAndReset}
    />
  );

  return (
    <>
      <ReplaceGhostLink
        ref={referenceRef}
        active={open}
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Replace ${mealLabel}`}
        {...getReferenceProps({
          onClick() {
            setOpen(!open);
          },
        })}
      >
        Replace
      </ReplaceGhostLink>

      {mounted ? (
        <FloatingPortal>
          <AnimatePresence mode="popLayout">
            {open && !isMobile ? (
              <FloatingFocusManager
                key="popover"
                context={context}
                modal={false}
                returnFocus={triggerRef}
                initialFocus={-1}
                guards={false}
                closeOnFocusOut
              >
                <div
                  ref={refs.setFloating}
                  id={panelId}
                  style={floatingStyles}
                  {...getFloatingProps()}
                  className="z-50 w-[340px]"
                >
                  <motion.div
                    layout
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={surfaceVariants}
                    transition={{
                      opacity: opacityTween(reduceMotion),
                      layout: spring.resize,
                      default: surfaceTransition,
                    }}
                    style={{ transformOrigin }}
                    className={panelSurfaceClass}
                  >
                    {stepPanel}
                  </motion.div>
                </div>
              </FloatingFocusManager>
            ) : null}

            {open && isMobile ? (
              <MobileReplaceSheet
                key="sheet"
                panelId={panelId}
                headingId={headingId}
                reduceMotion={reduceMotion}
                sheetRef={sheetRef}
                scrollRef={scrollRef}
                dragControls={dragControls}
                onClose={closeAndReset}
              >
                {stepPanel}
              </MobileReplaceSheet>
            ) : null}
          </AnimatePresence>
        </FloatingPortal>
      ) : null}
    </>
  );
}

function ReplaceStepPanel({
  step,
  headingId,
  fetching,
  showSkeleton,
  options,
  firstChipRef,
  reduceMotion,
  onPickReason,
  onConfirm,
  onBack,
  onCancel,
}: {
  step: ReplaceStep;
  headingId: string;
  fetching: boolean;
  showSkeleton: boolean;
  options: ReplaceOption[];
  firstChipRef: RefObject<HTMLButtonElement | null>;
  reduceMotion: boolean;
  onPickReason: (reason: ReplaceReason) => void;
  onConfirm: (replacementSlot?: FoodSlot) => void;
  onBack: () => void;
  onCancel: () => void;
}) {
  const heading =
    step === "reason" ? "Why are you replacing this?" : "Choose a replacement";

  return (
    <div role="group" aria-labelledby={headingId}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.h3
          key={heading}
          id={headingId}
          layout="position"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={opacityTween(reduceMotion, "heading")}
          className="text-meta font-medium text-foreground"
        >
          {heading}
        </motion.h3>
      </AnimatePresence>

      <div className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          {step === "reason" ? (
            <motion.div
              key="reason"
              initial="visible"
              animate="visible"
              exit="hidden"
              variants={{
                visible: {
                  transition: reduceMotion
                    ? { duration: 0 }
                    : {
                        staggerChildren: stagger.chipEnter,
                      },
                },
                hidden: {
                  transition: reduceMotion
                    ? { duration: 0 }
                    : {
                        staggerChildren: stagger.chipExit,
                        staggerDirection: -1,
                      },
                },
              }}
            >
              {showSkeleton && fetching ? (
                <ReplaceChipSkeleton />
              ) : (
                <div
                  className={cn(
                    "flex flex-wrap gap-2",
                    fetching && "pointer-events-none opacity-50",
                  )}
                >
                  {REPLACE_REASONS.map((r, index) => (
                    <motion.div
                      key={r}
                      variants={replaceChipExitVariants(reduceMotion)}
                      transition={replaceChipExitTransition(reduceMotion)}
                    >
                      <ReplaceChip
                        ref={index === 0 ? firstChipRef : undefined}
                        onClick={() => onPickReason(r)}
                      >
                        {REPLACE_REASON_LABELS[r]}
                      </ReplaceChip>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="options"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                visible: {
                  transition: reduceMotion
                    ? { duration: 0 }
                    : {
                        staggerChildren: stagger.chipEnter,
                      },
                },
                hidden: { transition: { duration: 0 } },
              }}
              className="space-y-3"
            >
              <div className="flex flex-wrap gap-2">
                {options.map((opt, index) => (
                  <motion.div
                    key={`${opt.tier}-${opt.slot}`}
                    variants={replaceChipEnterVariants(reduceMotion)}
                    transition={replaceChipEnterTransition(reduceMotion)}
                  >
                    <ReplaceChip
                      ref={index === 0 ? firstChipRef : undefined}
                      onClick={() => onConfirm(opt.slot)}
                    >
                      {opt.label}: {SLOT_LABELS[opt.slot]}
                    </ReplaceChip>
                  </motion.div>
                ))}
              </div>
              <ReplaceGhostLink onClick={() => onConfirm()}>Show another meal</ReplaceGhostLink>
              <div className="flex flex-wrap gap-4 pt-1">
                <ReplaceGhostLink onClick={onBack}>Back</ReplaceGhostLink>
                <ReplaceGhostLink onClick={onCancel}>Cancel</ReplaceGhostLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {step === "reason" ? (
        <div className="mt-4">
          <ReplaceGhostLink onClick={onCancel}>Cancel</ReplaceGhostLink>
        </div>
      ) : null}
    </div>
  );
}

function MobileReplaceSheet({
  panelId,
  headingId,
  reduceMotion,
  sheetRef,
  scrollRef,
  dragControls,
  onClose,
  children,
}: {
  panelId: string;
  headingId: string;
  reduceMotion: boolean;
  sheetRef: RefObject<HTMLDivElement | null>;
  scrollRef: RefObject<HTMLDivElement | null>;
  dragControls: ReturnType<typeof useDragControls>;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [dragOffset, setDragOffset] = useState(0);

  function handleDrag(_: unknown, info: PanInfo) {
    setDragOffset(Math.max(0, info.offset.y));
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const height = sheetRef.current?.offsetHeight ?? 1;
    const projected = info.offset.y + info.velocity.y * dismissGesture.projection;
    if (
      projected > height * dismissGesture.ratio ||
      info.velocity.y > dismissGesture.velocity
    ) {
      onClose();
      return;
    }
    setDragOffset(0);
  }

  const backdropOpacity = Math.max(0, 1 - dragOffset / 280);

  return (
    <>
      <motion.button
        type="button"
        aria-label="Close"
        className="fixed inset-0 z-40 bg-surface-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: backdropOpacity }}
        exit={{ opacity: 0 }}
        transition={opacityTween(reduceMotion, "sheetBackdrop")}
        onClick={onClose}
      />
      <motion.div
        ref={sheetRef}
        id={panelId}
        role="dialog"
        aria-labelledby={headingId}
        drag={reduceMotion ? false : "y"}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={sheetSurfaceVariants(reduceMotion)}
        transition={{
          opacity: opacityTween(reduceMotion, "sheetBackdrop"),
          y: sheetSurfaceTransition(reduceMotion),
        }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-hidden rounded-t-sheet border border-hairline border-b-0 bg-surface shadow-floating"
        style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
      >
        <div
          className="flex cursor-grab justify-center pt-3 active:cursor-grabbing"
          onPointerDown={(event) => {
            const scrollTop = scrollRef.current?.scrollTop ?? 0;
            if (scrollTop > 0) return;
            dragControls.start(event);
          }}
        >
          <div className="h-1 w-9 rounded-pill bg-faint" aria-hidden />
        </div>
        <div ref={scrollRef} className="overflow-y-auto px-5 pb-5 pt-3">
          {children}
        </div>
      </motion.div>
    </>
  );
}
