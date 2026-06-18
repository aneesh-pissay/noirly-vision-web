import type { RightPanelData } from "@/components/right-panel/types";

import { EmptyRightPanel } from "@/components/right-panel/EmptyRightPanel";

import { PartialRightPanel } from "@/components/right-panel/PartialRightPanel";

import { StrategicIntelligencePanel } from "@/components/right-panel/strategic-intelligence-panel";



type RightPanelProps = {

  data: RightPanelData;

};



export function RightPanel({ data }: RightPanelProps) {

  if (data.state === "new") {

    return (

      <EmptyRightPanel

        checklist={data.checklist}

        setupProgress={data.setupProgress}

      />

    );

  }



  if (data.state === "partial") {

    return <PartialRightPanel data={data} />;

  }



  return (

    <StrategicIntelligencePanel

      title="Command Center"

      intelligence={data.intelligence}

    />

  );

}


