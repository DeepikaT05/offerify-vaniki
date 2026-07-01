import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download, Edit3, Eye, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SiteHeader } from "@/components/SiteHeader";
import { deleteLetter, listLetters } from "@/lib/offer-letter-api";
import { ROLE_LABELS } from "@/lib/offer-letter-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Vaniki Offer Letter Generator" },
      {
        name: "description",
        content: "All saved offer letters for Vaniki Crop Science. View, edit, or download.",
      },
    ],
  }),
  component: Dashboard,
});

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = iso.includes("T") ? new Date(iso) : new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Dashboard() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["offer-letters"],
    queryFn: listLetters,
  });

  async function handleDelete(id: string) {
    try {
      await deleteLetter(id);
      toast.success("Letter deleted");
      refetch();
    } catch (e) {
      console.error(e);
      toast.error("Could not delete letter");
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Offer Letters</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate, manage, and print offer letters for new hires.
            </p>
          </div>
          <Button asChild>
            <Link to="/new">
              <Plus className="mr-1 h-4 w-4" /> New Offer Letter
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-sm">
          {isLoading && (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Loading letters…
            </div>
          )}
          {error && (
            <div className="p-12 text-center text-sm text-destructive">
              Failed to load letters. {(error as Error).message}
            </div>
          )}
          {!isLoading && !error && data && data.length === 0 && (
            <div className="flex flex-col items-center gap-3 p-16 text-center">
              <div className="rounded-full bg-brand/10 p-4 text-brand">
                <FileText className="h-8 w-8" />
              </div>
              <h2 className="font-serif text-xl font-semibold">No letters yet</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Create your first offer letter. The form is pre-filled with sensible defaults for
                each role.
              </p>
              <Button asChild className="mt-2">
                <Link to="/new">
                  <Plus className="mr-1 h-4 w-4" /> Create Letter
                </Link>
              </Button>
            </div>
          )}
          {!isLoading && data && data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Letter No.</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">{l.letter_no}</TableCell>
                    <TableCell className="font-medium">{l.employee_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="secondary">{ROLE_LABELS[l.role]}</Badge>
                        {l.id.startsWith("local-") && (
                          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 text-[10px] py-0 px-1.5 font-semibold">
                            Local
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(l.letter_date)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Preview"
                          onClick={() =>
                            router.navigate({ to: "/preview/$id", params: { id: l.id } })
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Edit"
                          onClick={() =>
                            router.navigate({ to: "/edit/$id", params: { id: l.id } })
                          }
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Download"
                          onClick={() =>
                            router.navigate({ to: "/preview/$id", params: { id: l.id } })
                          }
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label="Delete">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this letter?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Letter <strong>{l.letter_no}</strong> for{" "}
                                <strong>{l.employee_name}</strong> will be permanently removed.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(l.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
