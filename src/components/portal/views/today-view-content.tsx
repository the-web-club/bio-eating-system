import { LifeHappenedButton } from "@/components/portal/life-happened-button";
import { MealListWithReplace } from "@/components/portal/meal-list-with-replace";
import { ContentMeasure, Split } from "@/components/portal/layout";
import { TodayAside } from "@/components/portal/today-aside";
import type { AssembledMeal, TodaySummary } from "@/lib/portal/meal-assembly";

export type TodayViewProps = {
  firstName: string;
  meals: AssembledMeal[];
  summary: TodaySummary;
  notices: string[];
  maintenanceOnly: boolean;
  weeklyAvailable: boolean;
  basePath: string;
  showRecalibration?: boolean;
  showCheckIn?: boolean;
};

/** Dynamic Today body. The page frame supplies the stable title and greeting. */
export function TodayViewContent({
  meals,
  summary,
  notices,
  maintenanceOnly,
  weeklyAvailable,
  basePath,
  showRecalibration,
  showCheckIn,
}: Omit<TodayViewProps, "firstName">) {
  return (
    <Split
      main={
        <ContentMeasure>
          <MealListWithReplace meals={meals} />
        </ContentMeasure>
      }
      aside={
        <>
          <TodayAside
            summary={summary}
            weeklyAvailable={weeklyAvailable}
            basePath={basePath}
            maintenanceOnly={maintenanceOnly}
            notices={notices}
            showRecalibration={showRecalibration}
            showCheckIn={showCheckIn}
          />
          <LifeHappenedButton basePath={basePath} />
        </>
      }
    />
  );
}
