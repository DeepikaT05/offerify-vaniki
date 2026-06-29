import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit3, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LetterPreview } from "@/components/LetterPreview";
import { SiteHeader } from "@/components/SiteHeader";
import { getLetter } from "@/lib/offer-letter-api";

export const Route = createFileRoute("/preview/$id")({
  head: () => ({ meta: [{ title: "Letter Preview — Vaniki" }] }),
  component: PreviewLetter,
});

function PreviewLetter() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["offer-letter", id],
    queryFn: () => getLetter(id),
  });

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="no-print">
        <SiteHeader />
        <div className="mx-auto flex max-w-[820px] flex-wrap items-center justify-between gap-3 px-6 pt-6">
          <Button variant="ghost" size="sm" onClick={() => router.navigate({ to: "/" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to dashboard
          </Button>
          {data && (
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/edit/$id" params={{ id: data.id }}>
                  <Edit3 className="mr-1 h-4 w-4" /> Edit
                </Link>
              </Button>
              <Button size="sm" onClick={() => window.print()}>
                <Printer className="mr-1 h-4 w-4" /> Print / Save as PDF
              </Button>
            </div>
          )}
        </div>
      </div>

      <main className="px-6 py-6">
        {isLoading && <p className="text-center text-sm text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-center text-sm text-destructive">
            Failed to load: {(error as Error).message}
          </p>
        )}
        {!isLoading && !data && (
          <p className="text-center text-sm text-muted-foreground">Letter not found.</p>
        )}
        {data && <LetterPreview data={data} />}
      </main>
    </div>
  );
}
