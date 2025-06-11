"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Member = {
  id: string;
  email: string;
  role: "Owner" | "Member";
};

export default function ProjectSettings() {
  const pathname = usePathname();
  const projectId = pathname.split("/")[2];
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch member list
  useEffect(() => {
    fetch(`/api/projects/${projectId}/members`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setMembers(data);
        } else {
          setError(data.error);
        }
      });
  }, [projectId]);

  // Handle invite
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/projects/${projectId}/invite`, {
      method: "POST",
      body: JSON.stringify({ email: inviteEmail }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Gagal mengundang member.");
    } else {
      setInviteEmail("");
      // refresh member list
      const updated = await fetch(`/api/projects/${projectId}/members`).then(
        (r) => r.json()
      );
      setMembers(updated);
    }

    setLoading(false);
  };

  // Handle delete project
  const handleDelete = async () => {
    const confirmed = confirm("Yakin ingin menghapus project ini?");
    if (!confirmed) return;

    const res = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/dashboard");
    } else {
      alert("Gagal menghapus project.");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">Pengaturan Project</h1>

      {/* Invite Member */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Undang Member</h2>
        <form onSubmit={handleInvite} className="flex gap-2">
          <Input
            type="email"
            placeholder="Email user..."
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Mengundang..." : "Undang"}
          </Button>
        </form>
        {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
      </section>

      {/* List Member */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Daftar Member</h2>
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md border"
            >
              <span>{member.email}</span>
              <span className="text-sm text-gray-500">{member.role}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Delete Project */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-red-600">
          Hapus Project
        </h2>
        <Button
          variant="outline"
          onClick={handleDelete}
          className="border-red-500 text-red-600 hover:bg-red-50"
        >
          Hapus Project
        </Button>
      </section>

      <Button
        variant="outline"
        className="border-gray-400"
        onClick={() => {
          window.open(`/api/projects/${projectId}/export`, "_blank");
        }}
      >
        Export ke JSON
      </Button>
    </div>
  );
}
