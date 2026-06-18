"use client";

import { Switch } from "@/components/ui/switch";
import { SettingRow } from "@/components/settings/setting-row";

export function SettingSwitch({
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
  id,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}) {
  const switchId = id ?? title.toLowerCase().replace(/\s+/g, "-");

  return (
    <SettingRow
      title={title}
      description={description}
      control={
        <Switch
          id={switchId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-label={title}
        />
      }
    />
  );
}
