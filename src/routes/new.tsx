import { createFileRoute } from "@tanstack/react-router";
import { OfferLetterForm } from "@/components/OfferLetterForm";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [{ title: "New Offer Letter — Vaniki Crop Science" }],
  }),
  component: NewLetter,
});

function NewLetter() {
  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold">New Offer Letter</h1>
          <p className="text-sm text-muted-foreground">
            Pick a role to pre-fill defaults, then customize any field. Drafts auto-save in your
            browser.
          </p>
        </div>
        <OfferLetterForm />
      </main>
    </div>
  );
}
