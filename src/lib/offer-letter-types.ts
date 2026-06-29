export type Role = "developer" | "sales" | "manager";

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
};

export const ROLE_DEFAULTS: Record<Role, Partial<OfferLetterFormState>> = {
  developer: {
    salary: "₹35,000",
    hq: "Vaniki Crop Science, Durg",
    sales_target: "",
    contract_period: "1 year",
    post: "DEVELOPER",
    incentive_rules:
      "Performance-based quarterly bonus as per project deliverables and code quality reviews.",
  },
  sales: {
    salary: "₹22,000",
    hq: "Vaniki Crop Science, Rajim",
    sales_target: "₹80 Lakh/Year",
    contract_period: "1 year",
    post: "SALES OFFICER",
    incentive_rules:
      "1% incentive on achieving 100% of annual sales target. 2% incentive on exceeding 120% of target. Travel allowance as per company policy.",
  },
  manager: {
    salary: "₹45,000",
    hq: "Vaniki Crop Science, Durg",
    sales_target: "₹2 Crore/Year",
    contract_period: "2 years",
    post: "MANAGER",
    incentive_rules:
      "2% incentive on team achieving annual target. Additional 1% on exceeding 110%. Vehicle and fuel reimbursement as per grade.",
  },
};

export function defaultFormState(role: Role = "sales"): OfferLetterFormState {
  const today = new Date().toISOString().slice(0, 10);
  const base: OfferLetterFormState = {
    letter_no: "EN07-2026",
    letter_date: today,
    role,
    employee_name: "SHRI YAMESH KUMAR",
    village: "PARTEWA",
    po: "DEORI",
    district: "GARIYABNDH",
    state: "CHHATTISGARH",
    pin_code: "493992",
    phone: "8770912848",
    email: "Yameshkumarsahu9999@gmail.com",
    post: "SALES OFFICER",
    salary: "",
    pf_included: false,
    annual_increment: "5%",
    hq: "",
    contract_period: "1 year",
    casual_leaves: 10,
    medical_leaves: 15,
    sales_target: "",
    incentive_rules: "",
    notice_period: "1 month",
    joining_deadline: "15.07.2026",
    jurisdiction: "DURG",
    custom_blocks: [],
  };
  return { ...base, ...ROLE_DEFAULTS[role] };
}

export function applyRoleDefaults(
  state: OfferLetterFormState,
  role: Role,
): OfferLetterFormState {
  return { ...state, role, ...ROLE_DEFAULTS[role] };
}
