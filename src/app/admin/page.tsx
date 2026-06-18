"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface AdminStats {
  user_count: number;
  cabinet_count: number;
  member_count: number;
  topic_count: number;
  word_count: number;
  practice_count: number;
}

interface AdminUser {
  id: string;
  full_name: string;
  pin_code: string | null;
  created_at: string;
  cabinet_count: number;
  owned_cabinet_count: number;
  practice_count: number;
}

interface AdminCabinet {
  id: string;
  name: string;
  code: string;
  owner_id: string;
  owner_name: string;
  created_at: string;
  member_count: number;
  topic_count: number;
  word_count: number;
}

interface AdminMember {
  id: string;
  cabinet_id: string;
  user_id: string;
  user_name: string;
  cabinet_name: string;
  cabinet_code: string;
  created_at: string;
}

interface AdminTopic {
  id: string;
  cabinet_id: string;
  cabinet_name: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  word_count: number;
}

interface AdminPractice {
  id: string;
  user_id: string;
  user_name: string;
  topic_id: string;
  topic_title: string;
  cabinet_name: string;
  mode: string;
  correct_count: number;
  wrong_count: number;
  completed_at: string;
}

interface AdminOverview {
  stats: AdminStats;
  users: AdminUser[];
  cabinets: AdminCabinet[];
  members: AdminMember[];
  topics: AdminTopic[];
  recentPractice: AdminPractice[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("kk-KZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ShortId({ value }: { value: string }) {
  return <span className="font-mono text-xs text-ink-400">{value.slice(0, 8)}</span>;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl bg-white/80 p-4 shadow-card">
      <p className="text-2xl font-black text-ink-900">{value}</p>
      <p className="mt-1 text-xs font-bold text-ink-500">{label}</p>
    </div>
  );
}

function DataSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-black text-ink-900">{title}</h2>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
          {count}
        </span>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </Card>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-black uppercase tracking-[0.14em] text-ink-400">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-ink-700">{children}</td>;
}

export default function AdminPage() {
  const [accessCode, setAccessCode] = useState("");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Admin деректері жүктелмеді.");
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin деректері жүктелмеді.");
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">Admin</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-ink-900">WordRoom басқару</h1>
            <p className="mt-2 text-sm font-semibold text-ink-500">
              Барлық кабинеттер, қолданушылар және қатысу деректері.
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="surface">Dashboard</Button>
          </Link>
        </div>

        <Card className="mb-6 p-5">
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Input
              label="Admin code"
              name="adminCode"
              type="password"
              placeholder="4 сандық код"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              autoComplete="current-password"
            />
            <Button type="submit" loading={loading} className="h-[50px]">
              Кіру
            </Button>
          </form>
          {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
        </Card>

        {overview && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <StatCard label="Users" value={overview.stats.user_count} />
              <StatCard label="Cabinets" value={overview.stats.cabinet_count} />
              <StatCard label="Members" value={overview.stats.member_count} />
              <StatCard label="Topics" value={overview.stats.topic_count} />
              <StatCard label="Words" value={overview.stats.word_count} />
              <StatCard label="Practice" value={overview.stats.practice_count} />
            </div>

            <DataSection title="Users" count={overview.users.length}>
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <Th>Аты-жөні</Th>
                    <Th>PIN</Th>
                    <Th>ID</Th>
                    <Th>Кабинет</Th>
                    <Th>Owner</Th>
                    <Th>Practice</Th>
                    <Th>Құрылған</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/70">
                  {overview.users.map((user) => (
                    <tr key={user.id}>
                      <Td>{user.full_name}</Td>
                      <Td><span className="font-mono">{user.pin_code || "—"}</span></Td>
                      <Td><ShortId value={user.id} /></Td>
                      <Td>{user.cabinet_count}</Td>
                      <Td>{user.owned_cabinet_count}</Td>
                      <Td>{user.practice_count}</Td>
                      <Td>{formatDate(user.created_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataSection>

            <DataSection title="Cabinets" count={overview.cabinets.length}>
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <Th>Кабинет</Th>
                    <Th>Код</Th>
                    <Th>Owner</Th>
                    <Th>Адам</Th>
                    <Th>Тақырып</Th>
                    <Th>Сөз</Th>
                    <Th>ID</Th>
                    <Th>Құрылған</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/70">
                  {overview.cabinets.map((cabinet) => (
                    <tr key={cabinet.id}>
                      <Td>{cabinet.name}</Td>
                      <Td><span className="font-mono tracking-widest">{cabinet.code}</span></Td>
                      <Td>{cabinet.owner_name}</Td>
                      <Td>{cabinet.member_count}</Td>
                      <Td>{cabinet.topic_count}</Td>
                      <Td>{cabinet.word_count}</Td>
                      <Td><ShortId value={cabinet.id} /></Td>
                      <Td>{formatDate(cabinet.created_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataSection>

            <DataSection title="Cabinet Members" count={overview.members.length}>
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <Th>User</Th>
                    <Th>Кабинет</Th>
                    <Th>Код</Th>
                    <Th>User ID</Th>
                    <Th>Cabinet ID</Th>
                    <Th>Кірген уақыты</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/70">
                  {overview.members.map((member) => (
                    <tr key={member.id}>
                      <Td>{member.user_name}</Td>
                      <Td>{member.cabinet_name}</Td>
                      <Td><span className="font-mono tracking-widest">{member.cabinet_code}</span></Td>
                      <Td><ShortId value={member.user_id} /></Td>
                      <Td><ShortId value={member.cabinet_id} /></Td>
                      <Td>{formatDate(member.created_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataSection>

            <DataSection title="Topics" count={overview.topics.length}>
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <Th>Тақырып</Th>
                    <Th>Кабинет</Th>
                    <Th>Status</Th>
                    <Th>Сөз</Th>
                    <Th>ID</Th>
                    <Th>Құрылған</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/70">
                  {overview.topics.map((topic) => (
                    <tr key={topic.id}>
                      <Td>{topic.title}</Td>
                      <Td>{topic.cabinet_name}</Td>
                      <Td>{topic.status}</Td>
                      <Td>{topic.word_count}</Td>
                      <Td><ShortId value={topic.id} /></Td>
                      <Td>{formatDate(topic.created_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataSection>

            <DataSection title="Recent Practice" count={overview.recentPractice.length}>
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                  <tr>
                    <Th>User</Th>
                    <Th>Кабинет</Th>
                    <Th>Тақырып</Th>
                    <Th>Mode</Th>
                    <Th>Дұрыс</Th>
                    <Th>Қате</Th>
                    <Th>Уақыты</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/70">
                  {overview.recentPractice.map((practice) => (
                    <tr key={practice.id}>
                      <Td>{practice.user_name}</Td>
                      <Td>{practice.cabinet_name}</Td>
                      <Td>{practice.topic_title}</Td>
                      <Td>{practice.mode}</Td>
                      <Td>{practice.correct_count}</Td>
                      <Td>{practice.wrong_count}</Td>
                      <Td>{formatDate(practice.completed_at)}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataSection>
          </div>
        )}
      </div>
    </main>
  );
}
