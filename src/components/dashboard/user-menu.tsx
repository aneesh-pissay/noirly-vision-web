"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/lib/user/display";

export function UserAvatar() {
  const { user } = useAuth();

  const displayName = user?.displayName ?? "User";
  const initials = getUserInitials(displayName);

  return (
    <Avatar className="h-8 w-8" aria-hidden>
      {user?.avatar ? (
        <AvatarImage src={user.avatar} alt={displayName} />
      ) : null}
      <AvatarFallback className="bg-primary/10 text-xs text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
