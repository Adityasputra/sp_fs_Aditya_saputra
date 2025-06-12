"use client";

import useSWR from "swr";
import { useState } from "react";
import { redirect, usePathname, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import ProfileSection from "@/components/Profile";
import { signOut } from "next-auth/react";

type Member = {
  id: string;
  email: string;
  role: "Owner" | "Member";
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProjectSettings() {
  const pathname = usePathname();
  const projectId = pathname.split("/")[2];
  const router = useRouter();

  const { data: members = [], mutate } = useSWR<Member[]>(
    projectId ? `/api/projects/${projectId}/members` : null,
    fetcher
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/projects/${projectId}/invite`, {
      method: "POST",
      body: JSON.stringify({ email: inviteEmail }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to invite member.");
    } else {
      setInviteEmail("");
      toast.success("Member invited successfully.");
      mutate();
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Project deleted successfully.");
      router.push("/dashboard");
    } else {
      toast.error("Failed to delete the project.");
    }
  };

  return (
    <>
      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <div className="relative mb-6">
          <div>
            <h1 className="text-3xl font-bold">Project Settings</h1>
            <div className="w-1/2">
              <p className="text-muted-foreground break-words whitespace-pre-line md:whitespace-nowrap">
                Managing, and members who joined for this project.
              </p>
            </div>
          </div>
          <div className="absolute right-0 top-0">
            <div className="flex md:items-center items-end md:space-x-2 gap-2 flex-col-reverse md:flex-row">
              <Button onClick={() => redirect("/dashboard")}>Dashboard</Button>
              <p className="hidden md:block">|</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2">
                  <ProfileSection />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Button variant="destructive" onClick={() => signOut()}>
                      Sign Out
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invite Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Input
                    id="email"
                    type="email"
                    placeholder="User email..."
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? "Inviting..." : "Invite"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <ul className="space-y-2 min-w-[250px]">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-md p-2 text-sm gap-1"
                  >
                    <span className="break-all">{member.email}</span>
                    <span className="text-muted-foreground">{member.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Delete Project</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete this project?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone and will delete all tasks
                    related to this project.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="w-full sm:w-auto"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <div className="text-right mt-4 space-x-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() =>
              window.open(`/api/projects/${projectId}/export`, "_blank")
            }
          >
            Export to JSON
          </Button>
          <Button
            variant="default"
            className="w-full sm:w-auto mt-2"
            onClick={() => redirect(`/projects/${projectId}`)}
          >
            Go to Task Board
          </Button>
        </div>
      </div>
    </>
  );
}
