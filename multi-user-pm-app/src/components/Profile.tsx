"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProfileSection() {
  const { data: session } = useSession();
  const name = session?.user?.name || "Guest";
  const email = session?.user?.email || "";

  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <Avatar>
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <div className="text-sm">
        <p className="font-medium">{name}</p>
        <p className="text-muted-foreground text-xs truncate">{email}</p>
      </div>
    </div>
  );
}
