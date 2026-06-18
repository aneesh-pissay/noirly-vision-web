import type { StrategicIntelligence } from "@/lib/intelligence/resolver";

import { StrategicIntelligencePanel } from "@/components/right-panel/strategic-intelligence-panel";



type ExecutionPagePanelProps = {

  intelligence: StrategicIntelligence;

};



export function ExecutionPagePanel({ intelligence }: ExecutionPagePanelProps) {

  return (

    <StrategicIntelligencePanel title="Execution Guidance" intelligence={intelligence} />

  );

}


