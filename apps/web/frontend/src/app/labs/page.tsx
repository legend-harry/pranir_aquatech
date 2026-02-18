"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const mockLabs = [
  { name: "Aqua Diagnostics", city: "Vizag", tests: ["Water", "Soil"], turnaround: "24-48h" },
  { name: "Blue Labs", city: "Chennai", tests: ["Water", "Feed"], turnaround: "24h" },
  { name: "Coastline Analytics", city: "Mumbai", tests: ["Water", "Soil", "Micro"], turnaround: "48-72h" },
];

export default function LabsPage() {
  const [query, setQuery] = useState("");
  const [testFilter, setTestFilter] = useState("");

  const results = useMemo(() => {
    return mockLabs.filter((lab) => {
      const q = query.toLowerCase();
      const matchesText = q === "" || lab.name.toLowerCase().includes(q) || lab.city.toLowerCase().includes(q);
      const matchesTest = testFilter === "" || lab.tests.map(t => t.toLowerCase()).includes(testFilter.toLowerCase());
      return matchesText && matchesTest;
    });
  }, [query, testFilter]);

  return (
    <div className="space-y-4">
      <PageHeader title="Find Labs" description="Search partner labs and their report offerings." />
      <div className="grid gap-3 md:grid-cols-2">
        <Input placeholder="Search by lab or city" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Input placeholder="Filter by test (e.g., Water)" value={testFilter} onChange={(e) => setTestFilter(e.target.value)} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {results.map((lab) => (
          <Card key={lab.name}>
            <CardHeader>
              <CardTitle>{lab.name}</CardTitle>
              <CardDescription>{lab.city}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                {lab.tests.map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">TAT: {lab.turnaround}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
