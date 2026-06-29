import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { OfferLetterForm } from "@/components/OfferLetterForm";
import { SiteHeader } from "@/components/SiteHeader";
import { getLetter } from "@/lib/offer-letter-api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/edit/$id")({
  head: () => ({ meta: [{ title: "Edit Offer Letter — Vaniki" }] }),
  component: EditLetter,
});

function EditLetter() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["offer-letter", id],
    queryFn: () => getLetter(id),
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold">Edit Offer Letter</h1>
          <p className="text-sm text-muted-foreground">
            Update fields and save. Changes are persisted to the database.
          </p>
        </div>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-sm text-destructive">Failed to load: {(error as Error).message}</p>
        )}
        {!isLoading && !data && (
          <div className="rounded-md border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Letter not found.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/">Back to dashboard</Link>
            </Button>
          </div>
        )}
        {data && <OfferLetterForm initial={data} letterId={data.id} />}
      </main>
    </div>
  );
}
