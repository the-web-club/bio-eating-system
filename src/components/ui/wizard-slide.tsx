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
  const { variants, transition } = wizardSlideVariants(!!reduceMotion);

  return (
    <div className="rounded-surface border border-hairline bg-surface p-s4 sm:p-s5">
      <p className="text-label text-faint u-caps">
        Step {index + 1} of {STEPS.length}
      </p>
      <div className="relative mt-s4 min-h-28 overflow-clip [overflow-clip-margin:3px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
          >
            <h3 className="text-section-serif text-foreground">{step.title}</h3>
            <p className="mt-s1 measure text-body text-muted">{step.body}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-s4 flex flex-wrap items-center gap-s2">
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
