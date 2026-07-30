export type Role = "developer" | "sales" | "manager" | "hr" | "field_assistant" | "other" | "stockiest";

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

