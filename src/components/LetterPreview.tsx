import logo from "@/assets/vaniki-logo.png";
import type { OfferLetterFormState } from "@/lib/offer-letter-types";

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function LetterPreview({ data }: { data: OfferLetterFormState }) {
  const isSales = data.role === "sales" || data.role === "manager";
  return (
    <article className="print-letter mx-auto max-w-[820px] bg-white p-12 text-[14px] leading-relaxed text-neutral-900 shadow-lg ring-1 ring-border">
      {/* Letterhead */}
      <header className="flex items-start justify-between gap-6 border-b-2 border-brand pb-5">
        <img
          src={logo}
          alt="Vaniki Crop Science"
          width={96}
          height={96}
          className="h-24 w-24 object-contain"
        />
        <div className="text-right">
          <h1 className="font-serif text-3xl font-bold tracking-wide text-brand">
            VANIKI CROP SCIENCE PVT. LTD.
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-gold-foreground">
            Innovating Agriculture · Empowering Farmers
          </p>
          <p className="mt-2 text-xs text-neutral-600">
            Head Office: Durg, Chhattisgarh · India
          </p>
        </div>
      </header>

      {/* Letter meta */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <div>
          <span className="font-semibold">Letter No:</span> {data.letter_no}
        </div>
        <div>
          <span className="font-semibold">Date:</span> {formatDate(data.letter_date)}
        </div>
      </div>

      {/* Recipient */}
      <section className="mt-6 text-sm">
        <p>To,</p>
        <p className="font-semibold uppercase">{data.employee_name}</p>
        <p>
          Vill. {data.village}, P.O. {data.po}
        </p>
        <p>
          Dist. {data.district}, {data.state} – {data.pin_code}
        </p>
        <p>Phone: {data.phone}</p>
        <p>Email: {data.email}</p>
      </section>

      <p className="mt-6 text-center text-base font-bold uppercase underline">
        Subject: Offer Letter for the Post of {data.post}
      </p>

      <p className="mt-5 text-sm">Dear {data.employee_name.replace(/^SHRI\s+/i, "")},</p>

      <p className="mt-3 text-sm">
        With reference to your application and the subsequent interview, we are pleased to
        offer you the position of <strong>{data.post}</strong> at Vaniki Crop Science Pvt.
        Ltd. on the following terms and conditions:
      </p>

      {/* Terms */}
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
        <li>
          <strong>Monthly Salary:</strong> {data.salary} per month{" "}
          {data.pf_included ? "(inclusive of PF)" : "(excluding PF)"}.
        </li>
        <li>
          <strong>Annual Increment:</strong> {data.annual_increment} on completion of one year,
          subject to performance review.
        </li>
        <li>
          <strong>Headquarters:</strong> {data.hq}.
        </li>
        <li>
          <strong>Contract Period:</strong> {data.contract_period} from the date of joining.
        </li>
        <li>
          <strong>Leaves:</strong> {data.casual_leaves} casual leaves and {data.medical_leaves}{" "}
          medical leaves per annum.
        </li>
        {isSales && data.sales_target && (
          <li>
            <strong>Sales Target:</strong> {data.sales_target}.
          </li>
        )}
        {data.incentive_rules && (
          <li>
            <strong>Incentive:</strong> {data.incentive_rules}
          </li>
        )}
        <li>
          <strong>Notice Period:</strong> {data.notice_period} from either side.
        </li>
        <li>
          <strong>Joining Deadline:</strong> You are required to join on or before{" "}
          {data.joining_deadline}.
        </li>
        <li>
          <strong>Jurisdiction:</strong> Any dispute arising out of this contract shall be
          subject to the jurisdiction of courts at {data.jurisdiction} only.
        </li>
        {data.custom_blocks.map((b, idx) => (
          <li key={b.id ?? idx}>
            <strong>{b.heading}:</strong> {b.content}
          </li>
        ))}
      </ol>

      <p className="mt-5 text-sm">
        Kindly sign and return a copy of this letter as a token of your acceptance.
      </p>

      <p className="mt-3 text-sm">
        We welcome you to the Vaniki family and look forward to a long and mutually rewarding
        association.
      </p>

      {/* Signatures */}
      <div className="mt-12 grid grid-cols-2 gap-12 text-sm">
        <div>
          <p className="font-semibold">For Vaniki Crop Science Pvt. Ltd.</p>
          <div className="mt-12 border-t border-neutral-400 pt-1">
            Authorised Signatory
          </div>
        </div>
        <div>
          <p className="font-semibold">Accepted by Employee</p>
          <div className="mt-12 border-t border-neutral-400 pt-1">
            {data.employee_name}
            <div className="text-xs text-neutral-600">Date: ____________</div>
          </div>
        </div>
      </div>
    </article>
  );
}
