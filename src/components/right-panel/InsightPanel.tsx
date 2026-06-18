import { Lightbulb, TrendingUp, Zap } from "lucide-react";

import type { LucideIcon } from "lucide-react";

import type { RightPanelInsight } from "@/components/right-panel/types";

import { InsightCard } from "@/components/right-panel/insight-card";



const toneStyles: Record<

  RightPanelInsight["tone"],

  { icon: LucideIcon; color: string; bg: string }

> = {

  primary: {

    icon: Lightbulb,

    color: "text-primary",

    bg: "bg-primary/10",

  },

  success: {

    icon: TrendingUp,

    color: "text-chart-3",

    bg: "bg-chart-3/10",

  },

  warning: {

    icon: Zap,

    color: "text-chart-4",

    bg: "bg-chart-4/10",

  },

};



type InsightPanelProps = {

  insights: RightPanelInsight[];

};



export function InsightPanel({ insights }: InsightPanelProps) {

  if (insights.length === 0) {

    return null;

  }



  return (

    <div className="min-w-0 space-y-3">

      <p className="truncate text-sm font-semibold">Insights</p>

      {insights.map((insight) => {

        const style = toneStyles[insight.tone];



        return (

          <InsightCard

            key={insight.id}

            insight={insight}

            icon={style.icon}

            iconColor={style.color}

            iconBg={style.bg}

          />

        );

      })}

    </div>

  );

}


