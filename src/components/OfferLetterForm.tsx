import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Briefcase,
  Code,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
  UserCog,
  Users,
  Sprout,
  Settings,
  FileText,
  Percent,
  Award,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

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

import {
  applyRoleDefaults,
  defaultFormState,
  ROLE_LABELS,
  type CustomBlock,
  type OfferLetterFormState,
  type Role,
  type OfferLetterRow,
} from "@/lib/offer-letter-types";
import { createLetter, updateLetter, listLetters } from "@/lib/offer-letter-api";
import { STANDARD_CLAUSES, getDefaultClauseText } from "@/lib/clauses-helper";

const DRAFT_KEY = "vaniki-offer-letter-draft-v2";

type Props = {
  initial?: OfferLetterFormState;
  letterId?: string;
};

interface SchemeProduct {
  id: string;
  name: string;
  target: string;
  status: string;
}

function parseSchemeProducts(jsonStr?: string): SchemeProduct[] {
  if (!jsonStr) {
    return [
      { id: "1", name: "HULK", target: "100 LTR", status: "Achieved" },
      { id: "2", name: "RUBICON", target: "50 LTR", status: "Achieved" },
    ];
  }
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {}
  return [
    { id: "1", name: "HULK", target: "100 LTR", status: "Achieved" },
    { id: "2", name: "RUBICON", target: "50 LTR", status: "Achieved" },
  ];
}

function calculateNextLetterNo(role: Role, letters: OfferLetterRow[]): string {
  if (role === "stockiest") {
    let maxNum = 0;
    letters.forEach((l) => {
      if (l.role === "stockiest" && l.letter_no) {
        const num = parseInt(l.letter_no, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    return nextNum.toString().padStart(2, "0");
  } else if (role === "lifting_discount") {
    let maxNum = 0;
    letters.forEach((l) => {
      if (l.role === "lifting_discount" && l.letter_no) {
        const match = l.letter_no.match(/LD-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `LD-${nextNum.toString().padStart(2, "0")}`;
  } else if (role === "dealer_scheme") {
    let maxNum = 0;
    letters.forEach((l) => {
      if (l.role === "dealer_scheme" && l.letter_no) {
        const match = l.letter_no.match(/DS-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `DS-${nextNum.toString().padStart(2, "0")}`;
  } else {
    let maxNum = 0;
    letters.forEach((l) => {
      if (
        l.role !== "stockiest" &&
        l.role !== "lifting_discount" &&
        l.role !== "dealer_scheme" &&
        l.letter_no
      ) {
        const match = l.letter_no.match(/VN-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
    });
    const nextNum = maxNum + 1;
    return `VN-${nextNum.toString().padStart(2, "0")}`;
  }
}

const ROLE_CARDS: { role: Role; Icon: typeof Code; tagline: string }[] = [
  { role: "developer", Icon: Code, tagline: "Engineering & product team" },
  { role: "sales", Icon: Briefcase, tagline: "Field sales & territory" },
  { role: "manager", Icon: UserCog, tagline: "Team leadership" },
  { role: "hr", Icon: Users, tagline: "Human resources & admin" },
  { role: "field_assistant", Icon: Sprout, tagline: "Field operations & farming" },
  { role: "other", Icon: Settings, tagline: "Customizable/other roles" },
  { role: "stockiest", Icon: FileText, tagline: "Stockiest Authorization" },
  { role: "lifting_discount", Icon: Percent, tagline: "Product discount offer" },
  { role: "dealer_scheme", Icon: Award, tagline: "Gold scheme & targets" },
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
  const [existingLetters, setExistingLetters] = useState<OfferLetterRow[]>([]);

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

  // Fetch letters on mount to calculate next serial numbers and save in state
  useEffect(() => {
    listLetters()
      .then((letters) => {
        setExistingLetters(letters);

        // For new letters, set initial serial letter_no based on the current default role
        if (!letterId && !initial) {
          setForm((prev) => {
            const nextLetterNo = calculateNextLetterNo(prev.role, letters);
            if (prev.letter_no === "VN-01" || prev.letter_no === "EN06-2026" || !prev.letter_no) {
              return { ...prev, letter_no: nextLetterNo };
            }
            return prev;
          });
        }
      })
      .catch((err) => console.error("Error fetching letters:", err));
  }, [letterId, initial]);

  function update<K extends keyof OfferLetterFormState>(key: K, value: OfferLetterFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function selectRole(role: Role) {
    setForm((prev) => {
      const updated = applyRoleDefaults(prev, role);
      const nextLetterNo = calculateNextLetterNo(role, existingLetters);
      return { ...updated, letter_no: nextLetterNo };
    });
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
      if (saved.id.startsWith("local-")) {
        toast.info("Saved locally in browser (Offline Mode)");
      } else {
        toast.success(letterId ? "Letter updated online" : "Letter created online");
      }
      navigate({ to: "/preview/$id", params: { id: saved.id } });
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
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

      {form.role === "stockiest" ? (
        <Card className="border-l-4 border-l-brand">
          <CardHeader>
            <CardTitle className="text-base">2. Certificate Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Certificate No." required>
              <Input value={form.letter_no} onChange={(e) => update("letter_no", e.target.value)} />
            </Field>
            <Field label="Date" required>
              <Input
                type="date"
                value={form.letter_date}
                onChange={(e) => update("letter_date", e.target.value)}
              />
            </Field>
            <Field label="Supply To" required className="md:col-span-2">
              <Input
                value={form.employee_name}
                onChange={(e) => update("employee_name", e.target.value)}
                placeholder="M/S. Unnat Krishi Sewa Kendra-Ahiwara, Dist-Drug"
              />
            </Field>
            <Field label="Place" required>
              <Input
                value={form.village}
                onChange={(e) => update("village", e.target.value)}
                placeholder="Raipur"
              />
            </Field>
            <Field label="Company Name" required>
              <Input
                value={form.company_name || ""}
                onChange={(e) => update("company_name", e.target.value)}
                placeholder="Vaniki Crop Science Private Limited"
              />
            </Field>
            <Field label="Company Address (for letterhead)" className="md:col-span-2">
              <Input
                value={form.company_corporate_add || ""}
                onChange={(e) => update("company_corporate_add", e.target.value)}
                placeholder="Shop no. 37, Krishi Upaj Mandi, Dhamdha Road, Durg 491001 (C.G.)"
              />
            </Field>
            <Field label="Certificate Body Text" required className="md:col-span-2">
              <Textarea
                rows={4}
                value={form.incentive_rules}
                onChange={(e) => update("incentive_rules", e.target.value)}
                placeholder="Certificate text..."
              />
            </Field>
          </CardContent>
        </Card>
      ) : form.role === "lifting_discount" ? (
        <div className="space-y-6">
          <Card className="border-l-4 border-l-brand">
            <CardHeader>
              <CardTitle className="text-base">2. Lifting Discount Recipient & Offer Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Letter / Ref No." required>
                <Input value={form.letter_no} onChange={(e) => update("letter_no", e.target.value)} />
              </Field>
              <Field label="Date" required>
                <Input
                  type="date"
                  value={form.letter_date}
                  onChange={(e) => update("letter_date", e.target.value)}
                />
              </Field>
              <Field label="Contact Person (e.g. Mr Manoj Pathak)" required>
                <Input
                  value={form.employee_name}
                  onChange={(e) => update("employee_name", e.target.value)}
                  placeholder="Mr Manoj Pathak"
                />
              </Field>
              <Field label="Dealer / Firm Name (e.g. Shiv Shakti Krishi Kendra)" required>
                <Input
                  value={form.village}
                  onChange={(e) => update("village", e.target.value)}
                  placeholder="Shiv Shakti Krishi Kendra"
                />
              </Field>
              <Field label="Address / Location" required className="md:col-span-2">
                <Input
                  value={form.district}
                  onChange={(e) => update("district", e.target.value)}
                  placeholder="Manpur Chowk, Khamhartola, Balod (C.G.)"
                />
              </Field>
              <Field label="Contact No.">
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="9617932488"
                />
              </Field>
              <Field label="Dealer GSTIN">
                <Input
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="22AXDPP6919K1Z7"
                />
              </Field>
              <Field label="Subject" required className="md:col-span-2">
                <Input
                  value={form.post}
                  onChange={(e) => update("post", e.target.value)}
                  placeholder="Special Lifting Discount of ₹200 Per Litre on Hulk"
                />
              </Field>
              <Field label="Product Name" required>
                <Input
                  value={form.hq}
                  onChange={(e) => update("hq", e.target.value)}
                  placeholder="Hulk"
                />
              </Field>
              <Field label="Discount Amount / Rate" required>
                <Input
                  value={form.salary}
                  onChange={(e) => update("salary", e.target.value)}
                  placeholder="₹200 (Rupees Two Hundred Only) per litre"
                />
              </Field>
              <Field label="Minimum Purchase Quantity" required>
                <Input
                  value={form.contract_period}
                  onChange={(e) => update("contract_period", e.target.value)}
                  placeholder="100 litres"
                />
              </Field>
              <Field label="Company Name">
                <Input
                  value={form.company_name || ""}
                  onChange={(e) => update("company_name", e.target.value)}
                  placeholder="Vaniki Crop Science Pvt. Ltd."
                />
              </Field>
              <Field label="Signatory Name">
                <Input
                  value={form.joining_deadline}
                  onChange={(e) => update("joining_deadline", e.target.value)}
                  placeholder="Sajal Kumar Tamrakar"
                />
              </Field>
              <Field label="Signatory Designation">
                <Input
                  value={form.jurisdiction}
                  onChange={(e) => update("jurisdiction", e.target.value)}
                  placeholder="Manager, Vaniki Crop Science Pvt Ltd"
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">3. Full Editable Letter Body</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const discount = form.salary || "₹200 (Rupees Two Hundred Only) per litre";
                  const product = form.hq || "Hulk";
                  const minQty = form.contract_period || "100 litres";
                  update(
                    "incentive_rules",
                    `We are pleased to offer you a special lifting discount of **${discount}** on **${product}**, subject to a minimum purchase quantity of **${minQty}**.\n\nWe value your association with our company and look forward to strengthening our business relationship in the future.\n\nWe request you to kindly take advantage of this special offer.\n\nThank you for your continued trust and support.`
                  );
                  toast.success("Updated text from fields!");
                }}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Auto-Fill Body
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={7}
                value={form.incentive_rules}
                onChange={(e) => update("incentive_rules", e.target.value)}
                placeholder="Enter letter body text..."
                className="text-sm leading-relaxed"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Wrap any text in <strong>**double asterisks**</strong> to make it <strong>bold</strong>.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : form.role === "dealer_scheme" ? (
        <div className="space-y-6">
          <Card className="border-l-4 border-l-brand">
            <CardHeader>
              <CardTitle className="text-base">2. डीलर एवं गोल्ड स्कीम विवरण (Dealer & Gold Scheme Details)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="रेफरेंस नं. (Ref No.)" required>
                <Input value={form.letter_no} onChange={(e) => update("letter_no", e.target.value)} />
              </Field>
              <Field label="दिनांक (Date)" required>
                <Input
                  type="date"
                  value={form.letter_date}
                  onChange={(e) => update("letter_date", e.target.value)}
                />
              </Field>
              <Field label="डीलर का नाम (Dealer Name)" required>
                <Input
                  value={form.employee_name}
                  onChange={(e) => update("employee_name", e.target.value)}
                  placeholder="शिव शक्ति कृषि केंद्र"
                />
              </Field>
              <Field label="स्थान / पता (Location)" required>
                <Input
                  value={form.village}
                  onChange={(e) => update("village", e.target.value)}
                  placeholder="दल्लीराजहरा, (छ.ग.)"
                />
              </Field>
              <Field label="विषय (Subject)" required className="md:col-span-2">
                <Input
                  value={form.post}
                  onChange={(e) => update("post", e.target.value)}
                  placeholder="डीलर गोल्ड स्कीम 2026-2027 के अंतर्गत टारगेट की पुष्टि तथा 2 ग्राम गोल्ड की पात्रता"
                />
              </Field>
              <Field label="स्कीम का नाम (Scheme Name)" required>
                <Input
                  value={form.contract_period}
                  onChange={(e) => update("contract_period", e.target.value)}
                  placeholder="डीलर गोल्ड स्कीम 2026-27"
                />
              </Field>
              <Field label="जमा राशि (Deposit Amount)" required>
                <Input
                  value={form.salary}
                  onChange={(e) => update("salary", e.target.value)}
                  placeholder="₹ 1,00,000 (एक लाख रूपये मात्र)"
                />
              </Field>
              <Field label="गोल्ड / रिवॉर्ड पात्रता (Reward)" required>
                <Input
                  value={form.hq}
                  onChange={(e) => update("hq", e.target.value)}
                  placeholder="२ ग्राम गोल्ड स्कीम"
                />
              </Field>
              <Field label="कंपनी का नाम (Company Name)" required>
                <Input
                  value={form.company_name || ""}
                  onChange={(e) => update("company_name", e.target.value)}
                  placeholder="VANIKI CROP SCIENCE PVT. LTD."
                />
              </Field>
              <Field label="हस्ताक्षरकर्ता पद (Signatory Title)" className="md:col-span-2">
                <Input
                  value={form.jurisdiction}
                  onChange={(e) => update("jurisdiction", e.target.value)}
                  placeholder="अधिकृत हस्ताक्षरकर्ता"
                />
              </Field>
            </CardContent>
          </Card>

          {/* Products Target Table Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">3. Target Achievement Details (उत्पाद एवं टारगेट विवरण)</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  यह तालिका पत्र में 'Target Achievement Details' के रूप में प्रिंट होगी।
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const current = parseSchemeProducts(form.sales_target);
                  const nextId = (current.length + 1).toString();
                  const updated = [...current, { id: nextId, name: "", target: "", status: "Achieved" }];
                  update("sales_target", JSON.stringify(updated));
                }}
              >
                <Plus className="mr-1 h-4 w-4" /> Add Product Row
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-neutral-600 px-2">
                <div className="col-span-1">क्र.</div>
                <div className="col-span-5">उत्पाद का नाम (Product Name)</div>
                <div className="col-span-3">निर्धारित टारगेट (Target)</div>
                <div className="col-span-2">स्थिति (Status)</div>
                <div className="col-span-1 text-right">हटाएं</div>
              </div>
              {parseSchemeProducts(form.sales_target).map((p, idx) => (
                <div key={p.id || idx} className="grid grid-cols-12 gap-2 items-center rounded-md border p-2 bg-muted/20">
                  <div className="col-span-1 font-bold text-center text-sm">{idx + 1}</div>
                  <div className="col-span-5">
                    <Input
                      placeholder="e.g. HULK"
                      value={p.name}
                      onChange={(e) => {
                        const current = parseSchemeProducts(form.sales_target);
                        current[idx].name = e.target.value;
                        update("sales_target", JSON.stringify(current));
                      }}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder="e.g. 100 LTR"
                      value={p.target}
                      onChange={(e) => {
                        const current = parseSchemeProducts(form.sales_target);
                        current[idx].target = e.target.value;
                        update("sales_target", JSON.stringify(current));
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder="Achieved"
                      value={p.status}
                      onChange={(e) => {
                        const current = parseSchemeProducts(form.sales_target);
                        current[idx].status = e.target.value;
                        update("sales_target", JSON.stringify(current));
                      }}
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const current = parseSchemeProducts(form.sales_target);
                        const filtered = current.filter((_, i) => i !== idx);
                        update("sales_target", JSON.stringify(filtered));
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Body Text Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">4. पत्र का मुख्य विवरण एवं संदेश (Letter Body Text)</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const company = form.company_name || "VANIKI CROP SCIENCE PVT. LTD.";
                  const scheme = form.contract_period || "डीलर गोल्ड स्कीम 2026-27";
                  const amount = form.salary || "₹ 1,00,000 (एक लाख रूपये मात्र)";
                  const reward = form.hq || "२ ग्राम गोल्ड स्कीम";
                  update(
                    "incentive_rules",
                    `महोदय,\nहमे यह बताते हुए हर्ष हो रहा है की **${company}** द्वारा संचालित **${scheme}** के अंतर्गत कंपनी में आपका **${amount}** की राशि सफलतापूर्वक जमा कर दी गई है।\nइसके साथ ही, आपने निर्धारित खरीद टारगेट भी सफलतापूर्वक प्राप्त कर लिया है। आपकी इस उपलब्धि के लिए हम आपको हार्दिक बधाई देते है।\n\n---TABLE---\n\n**Congratulations**\n\nआपको यह सूचित करते हुए प्रसन्नता हो रही है की आपने निर्धारित खरीद टारगेट पूरा कर लिया है तथा जमा राशि की शर्त भी सफलतापूर्वक पूरी कर ली है। अतः आप कंपनी की **${reward}** के अंतर्गत लाभ प्राप्त करने के लिए पात्र है।\n\nहम आपके विश्वास, सहयोग एवं कंपनी के उत्पादों के प्रति आपके योगदान की सराहना करते है। भविष्य में भी आपके साथ हमारे व्यवसायिक संबंध और अधिक मजबूत एवं सफल बने रहे, यही हमारी कामना है।\n\nहार्दिक शुभकामनाएँ सहित,`
                  );
                  toast.success("Updated Hindi text template!");
                }}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Auto-Fill Body
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={9}
                value={form.incentive_rules}
                onChange={(e) => update("incentive_rules", e.target.value)}
                placeholder="Enter Hindi body text..."
                className="text-sm leading-relaxed font-sans"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                💡 पत्र में जिस स्थान पर <strong>---TABLE---</strong> लिखा होगा, वहाँ ऊपर दी गई उत्पाद तालिका स्वतः प्रिंट होगी। बोल्ड करने हेतु <strong>**शब्द**</strong> का प्रयोग करें।
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
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
                  placeholder="e.g. SHRI MANOJ BISWAS"
                />
              </Field>
              <Field label="Subject / Post" required>
                <Input
                  value={form.post}
                  onChange={(e) => update("post", e.target.value)}
                  placeholder="e.g. SALES OFFICER"
                />
              </Field>
              <Field label="Village">
                <Input
                  value={form.village}
                  onChange={(e) => update("village", e.target.value)}
                  placeholder="e.g. P. V. 49, SITAPUR"
                />
              </Field>
              <Field label="P.O.">
                <Input
                  value={form.po}
                  onChange={(e) => update("po", e.target.value)}
                  placeholder="e.g. GONDAHUR"
                />
              </Field>
              <Field label="District">
                <Input
                  value={form.district}
                  onChange={(e) => update("district", e.target.value)}
                  placeholder="e.g. KANKER"
                />
              </Field>
              <Field label="State">
                <Input
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  placeholder="e.g. CHHATTISGARH"
                />
              </Field>
              <Field label="PIN Code">
                <Input
                  value={form.pin_code}
                  onChange={(e) => update("pin_code", e.target.value)}
                  placeholder="e.g. 494776"
                />
              </Field>
              <Field label="Phone">
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="e.g. 9770378064"
                />
              </Field>
              <Field label="Email" className="md:col-span-2">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="e.g. mb3125097@gmail.com"
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
        </>
      )}

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
