import type { StrategicIntelligence } from "@/lib/intelligence/resolver";

import { StrategicIntelligencePanel } from "@/components/right-panel/strategic-intelligence-panel";



type VisionPagePanelProps = {

  intelligence: StrategicIntelligence;

};



export function VisionPagePanel({ intelligence }: VisionPagePanelProps) {

  return (

    <StrategicIntelligencePanel title="Vision Guidance" intelligence={intelligence} />

  );

}


