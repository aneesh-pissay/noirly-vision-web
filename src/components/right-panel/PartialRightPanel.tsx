import type { RightPanelData } from "@/components/right-panel/types";

import { StrategicIntelligencePanel } from "@/components/right-panel/strategic-intelligence-panel";



type PartialRightPanelProps = {

  data: RightPanelData;

};



export function PartialRightPanel({ data }: PartialRightPanelProps) {

  return (

    <StrategicIntelligencePanel

      title="System Setup"

      intelligence={data.intelligence}

    />

  );

}


