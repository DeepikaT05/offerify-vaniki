export type Role = "developer" | "sales" | "manager" | "hr" | "field_assistant" | "other" | "stockiest" | "lifting_discount" | "dealer_scheme";

export interface CustomBlock {
  id: string;
  heading: string;
  content: string;
}

export interface OfferLetterFormState {
  letter_no: string;
  letter_date: string;
  role: Role;
  employee_name: string;
  village: string;
  po: string;
  district: string;
  state: string;
  pin_code: string;
  phone: string;
  email: string;
  post: string;
  salary: string;
  pf_included: boolean;
  annual_increment: string;
  hq: string;
  contract_period: string;
  casual_leaves: number;
  medical_leaves: number;
  sales_target: string;
  incentive_rules: string;
  notice_period: string;
  joining_deadline: string;
  jurisdiction: string;
  custom_blocks: CustomBlock[];
  company_name?: string;
  company_gstin?: string;
  company_phone?: string;
  company_corporate_add?: string;
  company_shop_add?: string;
}

export interface OfferLetterRow extends Omit<OfferLetterFormState, "custom_blocks"> {
  id: string;
  custom_blocks: CustomBlock[];
  created_at: string;
  updated_at: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  developer: "Developer",
  sales: "Sales Officer",
  manager: "Manager",
  hr: "HR Executive",
  field_assistant: "Field Assistant",
  other: "Other (Custom)",
  stockiest: "Stockiest Certificate",
  lifting_discount: "Lifting Discount Offer",
  dealer_scheme: "Dealer Gold Scheme",
};

export const ROLE_DEFAULTS: Record<Role, Partial<OfferLetterFormState>> = {
  developer: {
    salary: "35,000",
    hq: "VANIKI CROP SCIENCE PVT.LTD. DURG, CHHATTISGARH",
    sales_target: "",
    contract_period: "one years",
    post: "DEVELOPER",
    incentive_rules: "Performance-based quarterly bonus as per project deliverables and code quality reviews.",
    joining_deadline: "15.06.2026 and in any case not later than 30.06.2026",
    jurisdiction: "DURG",
  },
  sales: {
    salary: "22,000",
    hq: "VANIKI CROP SCIENCE PVT.LTD. KONDAGOAN, CHHATTISGARH",
    sales_target: "₹ 1 Cr /- Year on Selected Product",
    contract_period: "one years",
    post: "SALES OFFICER",
    incentive_rules: `Incentive applicable only on payment collection
No incentive on overdue bills
Company reserves the right to revise policy
Incentive Pay on Year End.
**Training or field experience is required for this role.**`,
    joining_deadline: "15.06.2026 and in any case not later than 30.06.2026",
    jurisdiction: "DURG",
  },
  manager: {
    salary: "45,000",
    hq: "VANIKI CROP SCIENCE PVT.LTD. DURG, CHHATTISGARH",
    sales_target: "₹ 2 Cr /- Year on Selected Product",
    contract_period: "two years",
    post: "DISTRICT SALES MANAGER",
    incentive_rules: `Incentive applicable only on payment collection
No incentive on overdue bills
Company reserves the right to revise policy
Incentive Pay on Year End.`,
    joining_deadline: "15.06.2026 and in any case not later than 30.06.2026",
    jurisdiction: "DURG",
  },
  hr: {
    salary: "25,000",
    hq: "VANIKI CROP SCIENCE PVT.LTD. DURG, CHHATTISGARH",
    sales_target: "",
    contract_period: "one years",
    post: "HR EXECUTIVE",
    incentive_rules: "Performance-based annual increment as per HR policy and company standards.",
    joining_deadline: "15.06.2026 and in any case not later than 30.06.2026",
    jurisdiction: "DURG",
  },
  field_assistant: {
    salary: "15,000",
    hq: "VANIKI CROP SCIENCE PVT.LTD. DURG, CHHATTISGARH",
    sales_target: "",
    contract_period: "one years",
    post: "FIELD ASSISTANT",
    incentive_rules: "Field travel allowance and performance-based monthly incentives.",
    joining_deadline: "15.06.2026 and in any case not later than 30.06.2026",
    jurisdiction: "DURG",
  },
  other: {
    salary: "20,000",
    hq: "VANIKI CROP SCIENCE PVT.LTD. DURG, CHHATTISGARH",
    sales_target: "",
    contract_period: "one years",
    post: "EXECUTIVE",
    incentive_rules: "Performance-based incentives as per company policy.",
    joining_deadline: "15.06.2026 and in any case not later than 30.06.2026",
    jurisdiction: "DURG",
  },
  stockiest: {
    employee_name: "M/S. Unnat Krishi Sewa Kendra-Ahiwara, Dist-Drug",
    village: "Raipur",
    company_name: "Vaniki Crop Science Private Limited",
    company_corporate_add: "Shop no. 37, Krishi Upaj Mandi, Dhamdha Road, Durg 491001 (C.G.)",
    post: "STOCKIEST CERTIFICATE",
    salary: "",
    hq: "",
    sales_target: "",
    incentive_rules: "it is certify to that the company source certificate No. **05** Date **01.05.2025** has been supply to, **M/S. Unnat Krishi Sewa Kendra-Ahiwara, Dist-Drug** is the authorized Stockiest of **Vaniki Crop Science Private Limited**",
    contract_period: "",
    annual_increment: "",
    joining_deadline: "",
    jurisdiction: "",
  },
  lifting_discount: {
    letter_no: "LD-01",
    employee_name: "Mr Manoj Pathak",
    village: "Shiv Shakti Krishi Kendra",
    district: "Manpur Chowk, Khamhartola, Balod (C.G.)",
    phone: "9617932488",
    email: "22AXDPP6919K1Z7",
    post: "Special Lifting Discount of ₹200 Per Litre on Hulk",
    hq: "Hulk",
    salary: "₹200 (Rupees Two Hundred Only) per litre",
    contract_period: "100 litres",
    joining_deadline: "Sajal Kumar Tamrakar",
    jurisdiction: "Manager, Vaniki Crop Science Pvt Ltd",
    company_name: "Vaniki Crop Science Pvt. Ltd.",
    company_gstin: "22AAJCV1916A1ZV",
    company_phone: "9302228883",
    company_corporate_add: "Shop No.34, Krishi Upaj Mandi Dhamdha Road, Durg 491001 (C.G.)",
    company_shop_add: "Bazar Chowk Bori, Dist-Durg 491001 (C.G.)",
    incentive_rules: `We are pleased to offer you a special lifting discount of **₹200 (Rupees Two Hundred Only)** per litre on **Hulk**, subject to a minimum purchase quantity of **100 litres**.

We value your association with our company and look forward to strengthening our business relationship in the future.

We request you to kindly take advantage of this special offer.

Thank you for your continued trust and support.`,
  },
  dealer_scheme: {
    letter_no: "DS-01",
    employee_name: "शिव शक्ति कृषि केंद्र",
    village: "दल्लीराजहरा, (छ.ग.)",
    post: "डीलर गोल्ड स्कीम 2026-2027 के अंतर्गत टारगेट की पुष्टि तथा 2 ग्राम गोल्ड की पात्रता",
    salary: "₹ 1,00,000 (एक लाख रूपये मात्र)",
    hq: "2 ग्राम गोल्ड",
    contract_period: "डीलर गोल्ड स्कीम 2026-27",
    sales_target: JSON.stringify([
      { id: "1", name: "HULK", target: "100 LTR", status: "Achieved" },
      { id: "2", name: "RUBICON", target: "50 LTR", status: "Achieved" },
    ]),
    jurisdiction: "अधिकृत हस्ताक्षरकर्ता",
    company_name: "VANIKI CROP SCIENCE PVT. LTD.",
    company_gstin: "22AAJCV1916A1ZV",
    company_phone: "9302228883",
    company_corporate_add: "Shop No.34, Krishi Upaj Mandi Dhamdha Road, Durg 491001 (C.G.)",
    company_shop_add: "Bazar Chowk Bori, Dist-Durg 491001 (C.G.)",
    incentive_rules: `महोदय,
हमे यह बताते हुए हर्ष हो रहा है की **VANIKI CROP SCIENCE PVT. LTD.** द्वारा संचालित **डीलर गोल्ड स्कीम 2026-27** के अंतर्गत कंपनी में आपका **₹ 1,00,000 (एक लाख रूपये मात्र)** की राशि सफलतापूर्वक जमा कर दी गई है।
इसके साथ ही, आपने निर्धारित खरीद टारगेट भी सफलतापूर्वक प्राप्त कर लिया है। आपकी इस उपलब्धि के लिए हम आपको हार्दिक बधाई देते है।

---TABLE---

**Congratulations**

आपको यह सूचित करते हुए प्रसन्नता हो रही है की आपने निर्धारित खरीद टारगेट पूरा कर लिया है तथा जमा राशि की शर्त भी सफलतापूर्वक पूरी कर ली है। अतः आप कंपनी की **2 ग्राम गोल्ड स्कीम** के अंतर्गत लाभ प्राप्त करने के लिए पात्र है।

हम आपके विश्वास, सहयोग एवं कंपनी के उत्पादों के प्रति आपके योगदान की सराहना करते है। भविष्य में भी आपके साथ हमारे व्यवसायिक संबंध और अधिक मजबूत एवं सफल बने रहे, यही हमारी कामना है।

हार्दिक शुभकामनाएँ सहित,`,
  },
};

export function defaultFormState(role: Role = "sales"): OfferLetterFormState {
  const today = new Date().toISOString().slice(0, 10);
  const base: OfferLetterFormState = {
    letter_no: "VN-01",
    letter_date: today,
    role,
    employee_name: "",
    village: "",
    po: "",
    district: "",
    state: "",
    pin_code: "",
    phone: "",
    email: "",
    post: "SALES OFFICER",
    salary: "22,000",
    pf_included: true,
    annual_increment: "5%",
    hq: "VANIKI CROP SCIENCE PVT.LTD. KONDAGOAN, CHHATTISGARH",
    contract_period: "one years",
    casual_leaves: 10,
    medical_leaves: 15,
    sales_target: "₹ 1 Cr /- Year on Selected Product",
    incentive_rules: `Incentive applicable only on payment collection
No incentive on overdue bills
Company reserves the right to revise policy
Incentive Pay on Year End.
**Training or field experience is required for this role.**`,
    notice_period: "one month",
    joining_deadline: "15.06.2026 and in any case not later than 30.06.2026",
    jurisdiction: "DURG",
    custom_blocks: [],
    company_name: "VANIKI CROP SCIENCE PVT. LTD.",
    company_gstin: "22AAJCV1916A1ZV",
    company_phone: "9302228883",
    company_corporate_add: "Shop No.34, Krishi Upaj Mandi, Dhamdha Road, Durg 491001 (C.G.)",
    company_shop_add: "Bazar Chowk Bori, Dist-Durg 491001 (C.G.)",
  };
  return { ...base, ...ROLE_DEFAULTS[role] };
}

export function applyRoleDefaults(
  state: OfferLetterFormState,
  role: Role,
): OfferLetterFormState {
  return { ...state, role, ...ROLE_DEFAULTS[role] };
}

