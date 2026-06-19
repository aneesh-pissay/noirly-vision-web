"use client";

import type { SettingsPageData } from "@/features/settings/types";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import {
  FormField,
  SettingSection,
} from "@/components/settings";
import {
  updateAvatar,
  updateProfile,
} from "@/features/settings/actions/settings.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getUserInitials } from "@/lib/user/display";

function SaveButton({
  saving,
  onClick,
}: {
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <Button className="h-11 rounded-lg px-5" onClick={onClick} disabled={saving}>
      {saving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        "Save changes"
      )}
    </Button>
  );
}

export function SettingsAccountTab({ data }: { data: SettingsPageData }) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [profile, setProfile] = useState(data.profile);
  const [avatarUrl, setAvatarUrl] = useState(data.profile.avatar ?? "");
  const [avatarOpen, setAvatarOpen] = useState(false);

  function runSave(action: () => Promise<{ success: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        toast.error(result.error ?? "Save failed");
        return;
      }
      toast.success("Account updated");
      router.refresh();
    });
  }

  const initials = getUserInitials(profile.displayName);

  return (
    <div className="space-y-4">
      <SettingSection
        title="Account"
        description="Your personal information and how you appear in Noirly."
        divided={false}
        contentClassName="space-y-5"
        actions={
          <SaveButton
            saving={isPending}
            onClick={() =>
              runSave(() =>
                updateProfile({
                  displayName: profile.displayName,
                  username: profile.username,
                  identityTitle: profile.identityTitle,
                }).then((result) => {
                  if (result.success) void refreshUser();
                  return result;
                })
              )
            }
          />
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16 rounded-xl">
            {profile.avatar ? (
              <AvatarImage src={profile.avatar} alt={profile.displayName} />
            ) : null}
            <AvatarFallback className="rounded-xl bg-primary/10 text-lg text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            className="h-11 rounded-lg"
            onClick={() => setAvatarOpen(true)}
          >
            Change avatar
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Display name" htmlFor="displayName">
            <Input
              id="displayName"
              value={profile.displayName}
              onChange={(e) =>
                setProfile((current) => ({
                  ...current,
                  displayName: e.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="Username" htmlFor="username">
            <Input
              id="username"
              value={profile.username}
              onChange={(e) =>
                setProfile((current) => ({
                  ...current,
                  username: e.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="Email" htmlFor="email">
            <Input id="email" value={profile.email} readOnly disabled />
          </FormField>
          <FormField label="Role / identity title" htmlFor="identityTitle">
            <Input
              id="identityTitle"
              value={profile.identityTitle}
              placeholder="Founder, Engineer, Student..."
              onChange={(e) =>
                setProfile((current) => ({
                  ...current,
                  identityTitle: e.target.value,
                }))
              }
            />
          </FormField>
          <FormField label="Account role" className="sm:col-span-2">
            <Badge variant="outline" className="capitalize">
              {profile.role}
            </Badge>
          </FormField>
          <FormField label="Current vision" className="sm:col-span-2">
            <Input
              value={data.activeVisionTitle ?? "No active vision"}
              readOnly
              disabled
            />
          </FormField>
        </div>
      </SettingSection>

      <Dialog open={avatarOpen} onOpenChange={setAvatarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change avatar</DialogTitle>
            <DialogDescription>
              Paste an image URL for your profile avatar.
            </DialogDescription>
          </DialogHeader>
          <FormField label="Avatar URL" htmlFor="avatar-url">
            <Input
              id="avatar-url"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </FormField>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="h-11 rounded-lg"
              onClick={() => setAvatarOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-11 rounded-lg"
              disabled={isPending}
              onClick={() =>
                runSave(async () => {
                  const result = await updateAvatar({
                    avatar: avatarUrl.trim() || null,
                  });
                  if (result.success) {
                    setProfile((current) => ({
                      ...current,
                      avatar: avatarUrl.trim() || null,
                    }));
                    setAvatarOpen(false);
                    void refreshUser();
                  }
                  return result;
                })
              }
            >
              Save avatar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
