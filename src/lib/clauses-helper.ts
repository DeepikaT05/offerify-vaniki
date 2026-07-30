import type { OfferLetterFormState } from "./offer-letter-types";

export interface ClauseMeta {
  id: string;
  label: string;
  category: string;
}

export const STANDARD_CLAUSES: ClauseMeta[] = [
  { id: "clause_i", label: "Clause i) Contract Period & Extension", category: "Page 1 Terms" },
  { id: "clause_ii", label: "Clause ii) Headquarters Location", category: "Page 1 Terms" },
  { id: "clause_iii", label: "Clause iii) Consolidated Pay & Increment", category: "Page 1 Terms" },
  { id: "clause_iii_a", label: "Clause iii-a) Pay based on attendance", category: "Page 1 Terms" },
  { id: "clause_iii_b", label: "Clause iii-b) Company borne costs", category: "Page 1 Terms" },
  { id: "clause_iii_ta_da", label: "Clause iii-TA/DA) Reimbursement text", category: "Page 1 Terms" },
  { id: "clause_iv_1", label: "Responsibility 1) Relationship Building", category: "Responsibilities" },
  { id: "clause_iv_2", label: "Responsibility 2) Promotion & Sales", category: "Responsibilities" },
  { id: "clause_iv_3", label: "Responsibility 3) Field Visits", category: "Responsibilities" },
  { id: "clause_iv_4", label: "Responsibility 4) Payments & Reports", category: "Responsibilities" },
  { id: "clause_v", label: "Clause v) No other monetary benefit", category: "Page 2 Terms" },
  { id: "clause_vi", label: "Clause vi) Leaves entitlement", category: "Page 2 Terms" },
  { id: "clause_vii", label: "Clause vii) Weekly rest & Holidays", category: "Page 2 Terms" },
  { id: "clause_viii", label: "Clause viii) Work duties & locations", category: "Page 2 Terms" },
  { id: "clause_ix", label: "Clause ix) Full-time service exclusivity", category: "Page 2 Terms" },
  { id: "clause_x", label: "Clause x) Work under supervision", category: "Page 2 Terms" },
  { id: "clause_2_cert", label: "Clause 2) Required original certificates", category: "Page 2 Terms" },
  { id: "clause_3", label: "Clause 3) No interest in other contracts", category: "Page 3 Terms" },
  { id: "clause_4", label: "Clause 4) Termination by Company", category: "Page 3 Terms" },
  { id: "clause_4_1", label: "Clause 4.1) Termination by Employee", category: "Page 3 Terms" },
  { id: "clause_5", label: "Clause 5) Notice pay calculation base", category: "Page 3 Terms" },
  { id: "clause_6", label: "Clause 6) Confidentiality & Official secrets", category: "Page 3 Terms" },
  { id: "clause_7", label: "Clause 7) Integrity & Discipline", category: "Page 3 Terms" },
  { id: "clause_8", label: "Clause 8) Safekeeping of Company property", category: "Page 3 Terms" },
  { id: "clause_9", label: "Clause 9) Dismissal on false info", category: "Page 3 Terms" },
  { id: "clause_10", label: "Clause 10) Other matters discretion", category: "Page 3 Terms" },
  { id: "clause_11", label: "Clause 11) Acceptance Notice & Reporting", category: "Page 3 Terms" },
  { id: "clause_12", label: "Clause 12) Automatic withdrawal timeline", category: "Page 3 Terms" },
  { id: "clause_13", label: "Clause 13) Durg Court Jurisdiction", category: "Page 3 Terms" },
];

function numberToIndianWords(salaryStr: string): string {
  const cleanStr = salaryStr.replace(/[^\d]/g, "");
  const num = parseInt(cleanStr, 10);
  if (isNaN(num) || num === 0) return "";

  const a = [
    "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"
  ];
  const b = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  function numToWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " hundred" + (n % 100 !== 0 ? " and " + numToWords(n % 100) : "");
    return "";
  }

  let words = "";
  let temp = num;

  const crore = Math.floor(temp / 10000000);
  temp %= 10000000;
  if (crore > 0) {
    words += numToWords(crore) + " crore ";
  }

  const lakh = Math.floor(temp / 100000);
  temp %= 100000;
  if (lakh > 0) {
    words += numToWords(lakh) + " lakh ";
  }

  const thousand = Math.floor(temp / 1000);
  temp %= 1000;
  if (thousand > 0) {
    words += numToWords(thousand) + " thousand ";
  }

  if (temp > 0) {
    words += numToWords(temp);
  }

  const formatted = words.trim();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function getDefaultClauseText(clauseId: string, data: OfferLetterFormState): string {
  const salaryWords = numberToIndianWords(data.salary);
  const formattedSalaryWords = salaryWords ? `(Rupees ${salaryWords} Only)` : "";

  switch (clauseId) {
    case "clause_i":
      return `Your engagement on contract basis will be for a period of maximum up to ${data.contract_period} initially or till the age of 60 years, whichever is earlier, with effect from the date of joining. The initial agreed period can be extended based on satisfactory performance and depending on the requirement at the discretion of Management. The post is not against any permanent vacancy. This engagement will not entitle you to claim regular/ permanent employment in future. The engagement of your services would automatically end on the expiry of initial/ agreed period, unless an order for extension for further period is issued to you in writing.`;
    case "clause_ii":
      return `Your Headquarters will be **${data.hq}**.`;
    case "clause_iii":
      return `You will be paid a consolidated pay of Rs. **${data.salary}/-** ${formattedSalaryWords} per month, ${data.pf_included ? "including PF" : "excluding PF"}.The same can be increased up to maximum of ${data.annual_increment} on annual basis in subsequent years, based upon your satisfactory performance during the said period.`;
    case "clause_iii_a":
      return `The consolidated pay will be based on actual attendance and prorated deductions shall be made for your absence.`;
    case "clause_iii_b":
      return `As applicable, shall be borne by the Company.`;
    case "clause_iii_ta_da":
      return `The travelling expenses shall be reimbursed as per company’s TA and DA applicable.`;
    case "clause_iv_1":
      if (data.role === "developer") {
        return `**Deliverables:** execute tasks and assignments in alignment with project goals.`;
      } else if (data.role === "hr") {
        return `**Recruitment & Sourcing:** Sourcing candidates, screening resumes, and coordinating the recruitment and onboarding process.`;
      } else if (data.role === "field_assistant") {
        return `**Field Operations Support:** Assisting in executing field activities, seed/crop management, and monitoring crop/soil health.`;
      } else if (data.role === "other") {
        return `**Task Execution:** Perform core operational tasks and assignments aligned with the department goals.`;
      } else {
        return `**Relationship Building :** maintaining constant contact with dealers GST, retailers and farmers.`;
      }
    case "clause_iv_2":
      if (data.role === "developer") {
        return `**Collaboration:** coordinate effectively with team members and management.`;
      } else if (data.role === "hr") {
        return `**Employee Relations:** Acting as a bridge between management and employees by addressing queries, grievances, and organizing engagement activities.`;
      } else if (data.role === "field_assistant") {
        return `**Farmer Engagement:** Conducting crop demonstrations, product usage guidance, and gathering farmer feedbacks.`;
      } else if (data.role === "other") {
        return `**Team Collaboration:** Coordinate effectively with team members, supervisors, and external stakeholders.`;
      } else {
        return `**Promotion & Sales:** To promote **VANIKI** products, conduct demos, organize meetings and increase sale.`;
      }
    case "clause_iv_3":
      if (data.role === "developer") {
        return `**Reporting:** report progress and status as per company norms.`;
      } else if (data.role === "hr") {
        return `**Policy Implementation & Compliance:** Implementing company policies, managing personnel files, and ensuring compliance with labor laws.`;
      } else if (data.role === "field_assistant") {
        return `**Field Data Collection:** Gathering crop yield details, pest infestation reports, and submitting periodic reports to supervisors.`;
      } else if (data.role === "other") {
        return `**Reporting & Documentation:** Maintain proper records, prepare routine reports, and document key processes.`;
      } else {
        return `**Field Visits:** Visiting farms, providing technical support and reporting based on farmer feedback.`;
      }
    case "clause_iv_4":
      if (data.role === "developer") {
        return `**Quality Assurance:** Ensure testing and quality control for delivered work.`;
      } else if (data.role === "hr") {
        return `**HR Administration & Payroll:** Maintaining accurate employee records, managing attendance, and supporting payroll administration.`;
      } else if (data.role === "field_assistant") {
        return `**Stock & Tool Management:** Managing farm tools, safety equipment, maintaining local storage logs, and assisting sales teams.`;
      } else if (data.role === "other") {
        return `**Operational Quality:** Adhere to company guidelines, safety standards, and execute assignments with quality.`;
      } else {
        return `**Payments and reports:** Collect sales payment and ensure daily work reporting as per company regulations.`;
      }
    case "clause_v":
      return `No other monetary benefit shall be admissible.`;
    case "clause_vi":
      return `You are entitled for ${data.casual_leaves} days of Casual Leaves and ${data.medical_leaves} days of Medical Leave in a calendar year. The un-availed Casual Leave and Medical Leaves in a year cannot be carried forward. Encashment of Casual Leave and Medical Leaves are not permitted.`;
    case "clause_vii":
      return `You will be eligible for weekly day of rest and public holidays as per rules of the Company.`;
    case "clause_viii":
      return `You will have field, office, material dispatch and team leads program organize etc. working per day. If required, you will have to work extra hours also as per the instructions of directors/ In-charge of the Company.`;
    case "clause_ix":
      return `During the contract period, your services shall be at the disposal of the Company whole time and you will diligently and faithfully carry out the instructions given to you by your superiors in connection with your work, to the best of your skill and ability. You will not undertake any other employment either in full or part time basis. Any violation of this condition will automatically lead to termination of your engagement.`;
    case "clause_x":
      return `You will be required to work under the supervision of such officers as you may be directed to do from time to time.`;
    case "clause_2_cert":
      return `**2.** This engagement on contract basis will be further subject to production of the following original certificates as applicable:\n(i)\tEducational and other technical & Professional qualifications\n(ii)\tProof of age (i.e10th/Matric Certificate)\n(iii)\tDischarge Certificate of previous employment.`;
    case "clause_3":
      return `This engagement is subject to your not having directly or indirectly by yourself or your partner or agent, any share of interest in any contract by or on behalf of the Company, otherwise than an employee of the Company.`;
    case "clause_4":
      return `Not with standing any of the clause’s aforesaid, the management reserves the absolute right to terminate your engagement at its absolute discretion after giving you ${data.notice_period} notice or on payment of a sum equal to your consolidated pay for one month in lieu of notice, in case your performance is found to be poor or unsatisfactory or your services are no longer required.`;
    case "clause_4_1":
      return `The contract may be terminated from your side by giving ${data.notice_period}’s notice or pay in lieu of ${data.notice_period}’s notice (i.e. consolidated pay in lieu of notice).`;
    case "clause_5":
      return `In case notice pay (consolidated pay in lieu of notice) is payable by either side, the notice shall be calculated solely on the basis of your monthly consolidated pay and will not include the value of any allowances or benefits you receive by virtue of the terms of your contractual engagement.`;
    case "clause_6":
      return `You will keep secret and confidential any and all official documents and/ or information or any other data which you require or which comes to your knowledge during your tenure. You shall not carry any document/paper/datacartridge/ compact disc etc. without obtaining prior and specific written permission from the controlling/ reporting officer.`;
    case "clause_7":
      return `You shall at all times during your tenure maintain absolute integrity, discipline, devotion to duty, and do not indulge in any act of misconduct which is against the interest of the company. Any contravention to this condition will entail termination of your engagement.`;
    case "clause_8":
      return `You will be responsible for the safe custody of the property of the Company and always maintain the same in good condition, which may been trusted to your official use during the course of your employment and shall return all such property to the Company prior to relinquishment of your charge, failing which the cost of the same will be recovered from you by the Company.`;
    case "clause_9":
      return `If it is revealed that any information submitted to the company by you in your application/Bio-data/declaration, is incorrect or false or misleading or not matching with the advertised specifications and/ or amounting to suppression of information etc., this offer is liable to be cancelled/terminated, as the case may be, with immediate effect without any compensation whatsoever.`;
    case "clause_10":
      return `Any other matter not specifically provided above shall be dealt with as per the discretion of the management.`;
    case "clause_11":
      const leadText = data.joining_deadline.toLowerCase().startsWith("any") || data.joining_deadline.toLowerCase().startsWith("on") ? "" : "any working day from ";
      return `If you accept the above mentioned terms and conditions, you are requested to indicate your acceptance on the duplicate copy of this letter and return to this Office within a week of the receipt of this letter and report for duty to **Executive Director, VANIKI CROP SCIENCE PVT. LTD. DURG Chhattisgarh** on ${leadText}**${data.joining_deadline}**.`;
    case "clause_12":
      return `Please note that this letter of engagement would stand automatically withdrawn/ cancelled if your acceptance is not received before the stipulated date/ failure to join within prescribed time.`;
    case "clause_13":
      return `In case of any dispute arising out of this Letter of Contractual Engagement, the courts at ${data.jurisdiction} shall have jurisdiction.`;
    default:
      return "";
  }
}
