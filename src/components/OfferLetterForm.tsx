import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Briefcase, Code, GripVertical, Loader2, Plus, Trash2, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

import {
  applyRoleDefaults,
  defaultFormState,
  ROLE_LABELS,
  type CustomBlock,
  type OfferLetterFormState,
  type Role,
} from "@/lib/offer-letter-types";
import { createLetter, updateLetter } from "@/lib/offer-letter-api";
import { STANDARD_CLAUSES, getDefaultClauseText } from "@/lib/clauses-helper";

const DRAFT_KEY = "vaniki-offer-letter-draft";

type Props = {
  initial?: OfferLetterFormState;
  letterId?: string;
};

const ROLE_CARDS: { role: Role; Icon: typeof Code; tagline: string }[] = [
  { role: "developer", Icon: Code, tagline: "Engineering & product team" },
  { role: "sales", Icon: Briefcase, tagline: "Field sales & territory" },
  { role: "manager", Icon: UserCog, tagline: "Team leadership" },
];

export function OfferLetterForm({ initial, letterId }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<OfferLetterFormState>(() => {
    const base = initial ?? defaultFormState("sales");
    const companyBlock = base.custom_blocks.find((b) => b.id === "company_details");
    if (companyBlock) {
      try {
        const parsed = JSON.parse(companyBlock.content);
        return {
          ...base,
          company_name: parsed.company_name ?? base.company_name,
          company_gstin: parsed.company_gstin ?? base.company_gstin,
          company_phone: parsed.company_phone ?? base.company_phone,
          company_corporate_add: parsed.company_corporate_add ?? base.company_corporate_add,
          company_shop_add: parsed.company_shop_add ?? base.company_shop_add,
        };
      } catch (e) {}
    }
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [termsOpen, setTermsOpen] = useState(true);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [clausesOpen, setClausesOpen] = useState(false);

  // Auto-save draft to localStorage (new letters only)
  useEffect(() => {
    if (letterId) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      } catch { }
    }, 400);
    return () => clearTimeout(t);
  }, [form, letterId]);

  // Restore draft on mount (new letters only, no `initial` provided)
  useEffect(() => {
    if (letterId || initial) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setForm(parsed);
      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof OfferLetterFormState>(key: K, value: OfferLetterFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectRole(role: Role) {
    setForm((prev) => applyRoleDefaults(prev, role));
  }

  function addBlock() {
    const block: CustomBlock = {
      id: crypto.randomUUID(),
      heading: "",
      content: "",
    };
    setForm((prev) => ({ ...prev, custom_blocks: [...prev.custom_blocks, block] }));
  }

  function updateBlock(id: string, patch: Partial<CustomBlock>) {
    setForm((prev) => ({
      ...prev,
      custom_blocks: prev.custom_blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }

  function removeBlock(id: string) {
    setForm((prev) => ({
      ...prev,
      custom_blocks: prev.custom_blocks.filter((b) => b.id !== id),
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employee_name.trim()) {
      toast.error("Employee name is required");
      return;
    }
    if (!form.letter_no.trim()) {
      toast.error("Letter number is required");
      return;
    }
    setSaving(true);

    const companyDetailsBlock = {
      id: "company_details",
      heading: "__company_details__",
      content: JSON.stringify({
        company_name: form.company_name ?? "VANIKI CROP SCIENCE PVT. LTD.",
        company_gstin: form.company_gstin ?? "22AAJCV1916A1ZV",
        company_phone: form.company_phone ?? "9302228883",
        company_corporate_add: form.company_corporate_add ?? "Shop No.34, Krishi Upaj Mandi, Dhamdha Road, Durg 491001 (C.G.)",
        company_shop_add: form.company_shop_add ?? "Bazar Chowk Bori, Dist-Durg 491001 (C.G.)",
      })
    };

    const {
      company_name,
      company_gstin,
      company_phone,
      company_corporate_add,
      company_shop_add,
      ...dbForm
    } = form;

    const cleanBlocks = dbForm.custom_blocks.filter((b) => b.id !== "company_details");
    dbForm.custom_blocks = [...cleanBlocks, companyDetailsBlock];

    try {
      const saved = letterId
        ? await updateLetter(letterId, dbForm)
        : await createLetter(dbForm);
      if (!letterId) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch { }
      }
      toast.success(letterId ? "Letter updated" : "Letter created");
      navigate({ to: "/preview/$id", params: { id: saved.id } });
    } catch (err) {
      console.error(err);
      toast.error("Could not save letter. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const showSalesTarget = form.role === "sales" || form.role === "manager";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Role selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">1. Select Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {ROLE_CARDS.map(({ role, Icon, tagline }) => {
              const active = form.role === role;
              return (
                <button
                  type="button"
                  key={role}
                  onClick={() => selectRole(role)}
                  className={[
                    "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition",
                    active
                      ? "border-brand bg-brand/5 ring-2 ring-brand"
                      : "border-border hover:border-brand/50 hover:bg-muted",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-md",
                      active ? "bg-brand text-brand-foreground" : "bg-muted text-foreground",
                    ].join(" ")}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="font-semibold">{ROLE_LABELS[role]}</div>
                  <div className="text-xs text-muted-foreground">{tagline}</div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Primary fields */}
      <Card className="border-l-4 border-l-brand">
        <CardHeader>
          <CardTitle className="text-base">2. Primary Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Letter No." required>
            <Input value={form.letter_no} onChange={(e) => update("letter_no", e.target.value)} />
          </Field>
          <Field label="Date" required>
            <Input
              type="date"
              value={form.letter_date}
              onChange={(e) => update("letter_date", e.target.value)}
            />
          </Field>
          <Field label="Employee Name" required>
            <Input
              value={form.employee_name}
              onChange={(e) => update("employee_name", e.target.value)}
            />
          </Field>
          <Field label="Subject / Post" required>
            <Input value={form.post} onChange={(e) => update("post", e.target.value)} />
          </Field>
          <Field label="Village">
            <Input value={form.village} onChange={(e) => update("village", e.target.value)} />
          </Field>
          <Field label="P.O.">
            <Input value={form.po} onChange={(e) => update("po", e.target.value)} />
          </Field>
          <Field label="District">
            <Input value={form.district} onChange={(e) => update("district", e.target.value)} />
          </Field>
          <Field label="State">
            <Input value={form.state} onChange={(e) => update("state", e.target.value)} />
          </Field>
          <Field label="PIN Code">
            <Input value={form.pin_code} onChange={(e) => update("pin_code", e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </Field>
          <Field label="Email" className="md:col-span-2">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Terms */}
      <Card>
        <Collapsible open={termsOpen} onOpenChange={setTermsOpen}>
          <CardHeader>
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              <CardTitle className="text-base">3. Letter Terms & Conditions</CardTitle>
              <ChevronDown
                className={`h-4 w-4 transition ${termsOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Monthly Salary (₹)">
                <Input value={form.salary} onChange={(e) => update("salary", e.target.value)} />
              </Field>
              <Field label="PF Included">
                <div className="flex h-10 items-center gap-3 rounded-md border border-input bg-background px-3">
                  <Switch
                    checked={form.pf_included}
                    onCheckedChange={(v) => update("pf_included", v)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {form.pf_included ? "Yes — PF included" : "No — PF excluded"}
                  </span>
                </div>
              </Field>
              <Field label="Annual Increment %">
                <Input
                  value={form.annual_increment}
                  onChange={(e) => update("annual_increment", e.target.value)}
                />
              </Field>
              <Field label="HQ Location">
                <Input value={form.hq} onChange={(e) => update("hq", e.target.value)} />
              </Field>
              <Field label="Contract Period">
                <Input
                  value={form.contract_period}
                  onChange={(e) => update("contract_period", e.target.value)}
                />
              </Field>
              <Field label="Notice Period">
                <Input
                  value={form.notice_period}
                  onChange={(e) => update("notice_period", e.target.value)}
                />
              </Field>
              <Field label="Casual Leaves">
                <Input
                  type="number"
                  min={0}
                  value={form.casual_leaves}
                  onChange={(e) => update("casual_leaves", Number(e.target.value))}
                />
              </Field>
              <Field label="Medical Leaves">
                <Input
                  type="number"
                  min={0}
                  value={form.medical_leaves}
                  onChange={(e) => update("medical_leaves", Number(e.target.value))}
                />
              </Field>
              {showSalesTarget && (
                <Field label="Sales Target" className="md:col-span-2">
                  <Input
                    value={form.sales_target}
                    onChange={(e) => update("sales_target", e.target.value)}
                  />
                </Field>
              )}
              <Field label="Incentive Rules" className="md:col-span-2">
                <Textarea
                  rows={3}
                  value={form.incentive_rules}
                  onChange={(e) => update("incentive_rules", e.target.value)}
                />
              </Field>
              <Field label="Joining Deadline">
                <Input
                  value={form.joining_deadline}
                  onChange={(e) => update("joining_deadline", e.target.value)}
                />
              </Field>
              <Field label="Jurisdiction Court">
                <Input
                  value={form.jurisdiction}
                  onChange={(e) => update("jurisdiction", e.target.value)}
                />
              </Field>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Company & Header Details */}
      <Card>
        <Collapsible open={companyOpen} onOpenChange={setCompanyOpen}>
          <CardHeader>
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              <CardTitle className="text-base">4. Company & Header Details (Optional)</CardTitle>
              <ChevronDown className={`h-4 w-4 transition ${companyOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Company Name">
                <Input
                  value={form.company_name || ""}
                  onChange={(e) => update("company_name", e.target.value)}
                />
              </Field>
              <Field label="GSTIN">
                <Input
                  value={form.company_gstin || ""}
                  onChange={(e) => update("company_gstin", e.target.value)}
                />
              </Field>
              <Field label="Phone/Contact">
                <Input
                  value={form.company_phone || ""}
                  onChange={(e) => update("company_phone", e.target.value)}
                />
              </Field>
              <div></div>
              <Field label="Corporate Address" className="md:col-span-2">
                <Input
                  value={form.company_corporate_add || ""}
                  onChange={(e) => update("company_corporate_add", e.target.value)}
                />
              </Field>
              <Field label="Shop Address" className="md:col-span-2">
                <Input
                  value={form.company_shop_add || ""}
                  onChange={(e) => update("company_shop_add", e.target.value)}
                />
              </Field>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Edit Standard Clauses & Text */}
      <Card>
        <Collapsible open={clausesOpen} onOpenChange={setClausesOpen}>
          <CardHeader>
            <CollapsibleTrigger className="flex w-full items-center justify-between">
              <CardTitle className="text-base">5. Edit Standard Clauses & Letter Text (Optional Overrides)</CardTitle>
              <ChevronDown
                className={`h-4 w-4 transition ${clausesOpen ? "rotate-180" : ""}`}
              />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              <p className="text-xs text-neutral-600 mb-4 bg-neutral-50 border border-dashed rounded p-3 leading-relaxed">
                💡 <strong>How to customize & format:</strong>
                <br />
                • Edit any clause below to customize its text. The clause will lock and stop auto-updating when you change details above.
                <br />
                • To make any word or sentence <strong>bold</strong>, wrap it in double asterisks like <strong>**your text**</strong> or use HTML tags like <strong>&lt;b&gt;your text&lt;/b&gt;</strong>.
                <br />
                • Click <strong>"Reset to Template"</strong> to return the clause back to the automatic template.
              </p>
              
              {/* Group clauses by category */}
              {Array.from(new Set(STANDARD_CLAUSES.map(c => c.category))).map(category => (
                <div key={category} className="space-y-4">
                  <h3 className="text-sm font-bold text-brand border-b pb-1.5">{category}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {STANDARD_CLAUSES.filter(c => c.category === category).map((clause) => {
                      const overrideBlock = form.custom_blocks.find(
                        (b) => b.id === clause.id && b.heading === "__clause_override__"
                      );
                      const isOverridden = !!overrideBlock;
                      const activeText = isOverridden 
                        ? overrideBlock.content 
                        : getDefaultClauseText(clause.id, form);

                      return (
                        <div key={clause.id} className="rounded-lg border border-border bg-card p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">{clause.label}</span>
                            {isOverridden ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Customized</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-[10px] text-destructive hover:text-destructive/90 px-2"
                                  onClick={() => {
                                    setForm(prev => ({
                                      ...prev,
                                      custom_blocks: prev.custom_blocks.filter(b => b.id !== clause.id)
                                    }));
                                  }}
                                >
                                  Reset to Template
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded border">Template (Auto)</span>
                            )}
                          </div>
                          
                          <Textarea
                            rows={3}
                            value={activeText}
                            placeholder="Enter custom clause text..."
                            className={`text-xs leading-relaxed ${isOverridden ? "border-amber-300 focus-visible:ring-amber-500 font-medium" : "text-neutral-500"}`}
                            onChange={(e) => {
                              const val = e.target.value;
                              setForm(prev => {
                                const cleanBlocks = prev.custom_blocks.filter(b => b.id !== clause.id);
                                return {
                                  ...prev,
                                  custom_blocks: [
                                    ...cleanBlocks,
                                    {
                                      id: clause.id,
                                      heading: "__clause_override__",
                                      content: val
                                    }
                                  ]
                                };
                              });
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Custom blocks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">6. Additional Clauses / Custom Content</CardTitle>
          <Button type="button" size="sm" variant="outline" onClick={addBlock}>
            <Plus className="mr-1 h-4 w-4" /> Add Custom Block
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.custom_blocks.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No custom blocks. Use this to add special conditions, perks, or any other clause.
            </p>
          )}
          {form.custom_blocks.map((b) => (
            <div
              key={b.id}
              className="flex gap-3 rounded-md border border-border bg-muted/30 p-3"
            >
              <div className="mt-2 cursor-grab text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Heading (e.g. Special Conditions)"
                  value={b.heading}
                  onChange={(e) => updateBlock(b.id, { heading: e.target.value })}
                />
                <Textarea
                  rows={2}
                  placeholder="Content..."
                  value={b.content}
                  onChange={(e) => updateBlock(b.id, { content: e.target.value })}
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeBlock(b.id)}
                aria-label="Remove block"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="sticky bottom-0 -mx-2 flex items-center justify-end gap-3 border-t border-border bg-background/95 px-2 py-3 backdrop-blur">
        <Button type="button" variant="ghost" onClick={() => navigate({ to: "/" })}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {letterId ? "Save Changes" : "Save & Preview"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  required,
  className,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 inline-block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
