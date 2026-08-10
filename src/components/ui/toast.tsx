"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { toastTransition, travel } from "@/lib/motion";
import { Status, type StatusRole } from "./status";

type ToastItem = {
  id: string;
  message: string;
  role: StatusRole;
};

type ToastContextValue = {
  push: (message: string, role?: StatusRole) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const reduceMotion = useReducedMotion();
  const paused = useRef(false);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((message: string, role: StatusRole = "neutral") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setItems((prev) => [...prev.slice(-2), { id, message, role }]);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-s4 right-s4 z-[60] flex w-full max-w-sm flex-col-reverse gap-s1"
        onMouseEnter={() => {
          paused.current = true;
        }}
        onMouseLeave={() => {
          paused.current = false;
        }}
        onFocusCapture={() => {
          paused.current = true;
        }}
        onBlurCapture={() => {
          paused.current = false;
        }}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <ToastCard
              key={item.id}
              item={item}
              reduceMotion={!!reduceMotion}
              paused={paused}
              onDismiss={() => dismiss(item.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  reduceMotion,
  paused,
  onDismiss,
}: {
  item: ToastItem;
  reduceMotion: boolean;
  paused: React.MutableRefObject<boolean>;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const started = Date.now();
    let remaining = 4000;
    let timer = setTimeout(tick, remaining);

    function tick() {
      if (paused.current) {
        timer = setTimeout(tick, 200);
        return;
      }
      const elapsed = Date.now() - started;
      if (elapsed >= 4000) onDismiss();
      else {
        remaining = 4000 - elapsed;
        timer = setTimeout(tick, remaining);
      }
    }

    return () => clearTimeout(timer);
  }, [onDismiss, paused]);

  const motionTransition = toastTransition(reduceMotion);

  return (
    <motion.div
      className="pointer-events-auto"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: travel.close }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: travel.close }}
      transition={{
        duration: motionTransition.duration,
        ease: motionTransition.ease as "linear" | [number, number, number, number],
      }}
    >
      <div className={cn("rounded-surface bg-surface py-s2 pl-s1 pr-s4 shadow-floating")}>
        <Status role={item.role}>{item.message}</Status>
      </div>
    </motion.div>
  );
}
