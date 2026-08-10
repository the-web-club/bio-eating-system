"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { wizardSlideVariants } from "@/lib/motion";
import { Button } from "./button";

const STEPS = [
  { id: "one", title: "Step one", body: "Key name: step.one.body" },
  { id: "two", title: "Step two", body: "Key name: step.two.body" },
  { id: "three", title: "Step three", body: "Key name: step.three.body" },
] as const;

export function WizardSlideDemo() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const variants = wizardSlideVariants(!!reduceMotion);

  return (
    <div className="overflow-hidden rounded-panel border border-hairline bg-surface p-5 sm:p-6">
      <p className="text-micro text-faint u-caps">
        Step {index + 1} of {STEPS.length}
      </p>
      <div className="relative mt-4 min-h-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: variants.transition.duration,
              ease: variants.transition.ease as
                | "linear"
                | [number, number, number, number],
            }}
          >
            <h3 className="text-display text-foreground">{step.title}</h3>
            <p className="mt-2 measure text-body text-muted">{step.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          variant="quiet"
          disabled={index === 0}
          disabledReason="Already on the first step"
          onClick={() => setIndex(index - 1)}
        >
          Back
        </Button>
        <Button
          disabled={index === STEPS.length - 1}
          disabledReason="Already on the last step"
          onClick={() => setIndex(index + 1)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
