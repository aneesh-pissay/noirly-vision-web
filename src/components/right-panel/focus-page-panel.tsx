import type { StrategicIntelligence } from "@/lib/intelligence/resolver";

import { StrategicIntelligencePanel } from "@/components/right-panel/strategic-intelligence-panel";



type FocusPagePanelProps = {

  intelligence: StrategicIntelligence;

};



export function FocusPagePanel({ intelligence }: FocusPagePanelProps) {

  return (

    <StrategicIntelligencePanel title="Focus Guidance" intelligence={intelligence} />

  );

}


