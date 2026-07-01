import React, { useState } from "react";
import logo from "@/assets/vaniki-logo.png";
import letterpadBg from "@/assets/letterpad.jpg";
import type { OfferLetterFormState } from "@/lib/offer-letter-types";
import { getDefaultClauseText } from "@/lib/clauses-helper";

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

function renderFormattedText(text: string): React.ReactNode {
  if (!text) return "";
  
  // Normalize HTML bold tags to **
  const normalized = text
    .replace(/<\/?b>/gi, "**")
    .replace(/<\/?strong>/gi, "**");
    
  // Split by **
  const parts = normalized.split(/\*\*([^*]+)\*\*/g);
  
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold text-neutral-900">{part}</strong>;
    }
    return part;
  });
}

export function LetterPreview({ data }: { data: OfferLetterFormState }) {
  const isSales = data.role === "sales";
  const isManager = data.role === "manager";

  // Printer Toggles
  const [usePrePrintedHeader, setUsePrePrintedHeader] = useState(true);

  // Dynamic company details extraction from JSON block
  let company_name = "VANIKI CROP SCIENCE PVT. LTD.";
  let company_gstin = "22AAJCV1916A1ZV";
  let company_phone = "9302228883";
  let company_corporate_add = "Shop No.34, Krishi Upaj Mandi, Dhamdha Road, Durg 491001 (C.G.)";
  let company_shop_add = "Bazar Chowk Bori, Dist-Durg 491001 (C.G.)";

  const companyBlock = data.custom_blocks.find((b) => b.id === "company_details");
  if (companyBlock) {
    try {
      const parsed = JSON.parse(companyBlock.content);
      if (parsed.company_name) company_name = parsed.company_name;
      if (parsed.company_gstin) company_gstin = parsed.company_gstin;
      if (parsed.company_phone) company_phone = parsed.company_phone;
      if (parsed.company_corporate_add) company_corporate_add = parsed.company_corporate_add;
      if (parsed.company_shop_add) company_shop_add = parsed.company_shop_add;
    } catch (e) {}
  }

  const getClause = (id: string): string => {
    const override = data.custom_blocks.find((b) => b.id === id && b.heading === "__clause_override__");
    return override ? override.content : getDefaultClauseText(id, data);
  };

  // Filter out system override blocks from general custom blocks output
  const userCustomBlocks = data.custom_blocks.filter(
    (b) => b.heading !== "__clause_override__" && b.heading !== "__company_details__"
  );

  if (data.role === "stockiest") {
    return (
      <article className="flex flex-col items-center gap-8 bg-muted/20 py-8 no-print-bg">
        <style>{`
          @media screen {
            .no-print-bg {
              background-color: var(--color-muted);
            }
          }
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            html, body {
              width: 210mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            .no-print-bg {
              background: white !important;
              padding: 0 !important;
              gap: 0 !important;
              display: block !important;
            }
            .print-page {
              position: relative !important;
              box-shadow: none !important;
              border: none !important;
              margin: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              overflow: hidden !important;
              page-break-after: always !important;
              break-after: page !important;
              display: flex !important;
              flex-direction: column !important;
            }
            .print-page:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>

        {/* Print settings toolbar */}
        <div className="mb-2 flex flex-wrap gap-4 items-center justify-between p-4 bg-white rounded-lg border border-neutral-200 shadow-sm no-print w-[210mm] max-w-full">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-700">🖨️ Printing Configuration</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600 cursor-pointer">
              <input
                type="checkbox"
                checked={usePrePrintedHeader}
                onChange={(e) => setUsePrePrintedHeader(e.target.checked)}
                className="rounded border-neutral-300 text-brand focus:ring-brand h-4 w-4"
              />
              Printing on Physical Letter Pad (hides digital letterhead image when printing)
            </label>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-brand hover:bg-brand/90 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            Print Now
          </button>
        </div>

        {/* Certificate Page */}
        <section className="print-page relative w-[210mm] min-h-[297mm] bg-white flex flex-col justify-between shadow-lg border border-neutral-200 print:shadow-none print:border-none print:m-0 print:w-full print:min-h-0" style={{padding: 0}}>
          {/* Letterpad Background Image */}
          <img
            src={letterpadBg}
            alt="Letterpad Background"
            className={`absolute inset-0 w-full h-full object-fill z-0 pointer-events-none${usePrePrintedHeader ? " print:hidden" : ""}`}
          />

          {/* Spacer to push body below letterhead */}
          <div style={{height: '70mm'}} className="w-full flex-shrink-0 z-10 relative" />

          {/* Body */}
          <div className="flex-grow z-10 relative px-[22mm] pb-[20mm] pt-[10mm] flex flex-col justify-between">
            <div>
              {/* Title */}
              <h2 className="text-center font-bold text-[18px] tracking-wider uppercase mb-16 mt-4 text-neutral-900 underline underline-offset-4">
                TO WHOM SO EVER IT MAY CONCERN
              </h2>

              {/* Main Content Paragraph */}
              <p className="text-[15px] leading-[2.2] text-justify mb-12 text-neutral-800 tracking-wide font-normal">
                {renderFormattedText(data.incentive_rules || "")}
              </p>
            </div>

            {/* Footer details */}
            <div className="mt-auto space-y-16">
              {/* Place & Date, Company Signatory */}
              <div className="flex justify-between items-start text-[14px]">
                <div className="space-y-4">
                  <p className="text-neutral-800">
                    Place: <span className="font-bold underline uppercase">{data.village || "Raipur"}</span>
                  </p>
                  <p className="text-neutral-800">
                    Date : <span className="font-bold">{formatDate(data.letter_date)}</span>
                  </p>
                </div>
                <div className="text-right w-[340px] space-y-1">
                  <p className="text-neutral-800 font-bold">
                    For,{data.company_name || "Vaniki Crop Science Private Limited"}
                  </p>
                  
                  {/* Spacer for physical signature/stamp */}
                  <div className="h-24"></div>

                  <p className="font-bold text-neutral-900 uppercase">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>

          {/* Page Number Spacer */}
          <div className="h-[20mm] w-full flex-shrink-0 z-10 relative" />
        </section>
      </article>
    );
  }

  return (
    <article className="flex flex-col items-center gap-8 bg-muted/20 py-8 no-print-bg">
      {/* Dynamic styles injected specifically for A4 screen previews and print breaks */}
      <style>{`
        @media screen {
          .no-print-bg {
            background-color: var(--color-muted);
          }
        }
        @page {
          size: A4 portrait;
          margin: 0mm;
        }
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print-bg {
            background: white !important;
            padding: 0 !important;
            gap: 0 !important;
            display: block !important;
          }
          .print-page {
            position: relative !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
            page-break-after: always !important;
            break-after: page !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .print-page:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Print settings toolbar (Hidden when printing) */}
      <div className="mb-2 flex flex-wrap gap-4 items-center justify-between p-4 bg-white rounded-lg border border-neutral-200 shadow-sm no-print w-[210mm] max-w-full">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-neutral-700">🖨️ Printing Configuration</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600 cursor-pointer">
            <input
              type="checkbox"
              checked={usePrePrintedHeader}
              onChange={(e) => setUsePrePrintedHeader(e.target.checked)}
              className="rounded border-neutral-300 text-brand focus:ring-brand h-4 w-4"
            />
            Printing on Physical Letter Pad (hides digital letterhead image when printing)
          </label>

        </div>
        <button
          onClick={() => window.print()}
          className="bg-brand hover:bg-brand/90 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5"
        >
          Print Now
        </button>
      </div>

      {/* ================= PAGE 1 ================= */}
      <section className="print-page relative w-[210mm] min-h-[297mm] bg-white flex flex-col justify-between shadow-lg border border-neutral-200 print:shadow-none print:border-none print:m-0 print:w-full print:min-h-0" style={{padding: 0}}>
        
        {/* Full-page Letterpad Background Image — always visible on screen.
             When printing on physical letter pad paper, hide this so it doesn't
             print on top of the pre-printed paper header. */}
        <img
          src={letterpadBg}
          alt="Letterpad Background"
          className={`absolute inset-0 w-full h-full object-fill z-0 pointer-events-none${usePrePrintedHeader ? " print:hidden" : ""}`}
        />

        {/* Spacer to push body below letterhead on screen and print */}
        <div style={{height: '70mm'}} className="w-full flex-shrink-0 z-10 relative" />

        {/* Letter body — padded */}
        <div className="flex-1 z-10 relative px-[20mm] pb-[15mm] pt-[20px]">

          {/* Letter Meta */}
          <div className="flex justify-between items-center text-[13px] font-bold mb-5 mt-2">
            <div>No.{data.letter_no}</div>
            <div>Date:{formatDate(data.letter_date)}</div>
          </div>

          {/* Recipient */}
          <div className="text-[13px] leading-normal mb-5 space-y-0.5">
            <p className="font-bold">To,</p>
            <p className="font-bold uppercase tracking-wide">{data.employee_name}</p>
            <p className="font-bold">VILLAGE: {data.village}</p>
            <p className="font-bold">PO: {data.po}</p>
            <p className="font-bold">DISTRICT: {data.district},</p>
            <p className="font-bold">STATE: {data.state}</p>
            <p className="font-bold">PIN CODE: {data.pin_code}</p>
            {data.phone && <p className="font-bold">Ph. No:{data.phone}</p>}
            {data.email && <p className="font-bold">Email id: {data.email}</p>}
          </div>

          {/* Subject */}
          <div className="text-[13px] font-bold mb-5 mt-4">
            Sub: Offer of engagement on {data.post}.
          </div>

          {/* Salutation */}
          <div className="text-[13px] mb-3">Sir/Madam,</div>


          {/* Intro */}
          <p className="text-[13px] leading-[1.6] text-justify mb-4 indent-12">
            {renderFormattedText(`we have the pleasure to inform you that you have been selected for engagement **for the post of ${data.post.toLowerCase()}** on the following terms and conditions:-`)}
          </p>

          {/* Clauses list */}
          <div className="text-[13px] leading-[1.6] space-y-4 mt-2">
            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-medium">i)</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_i"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-medium">ii)</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_ii"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-medium">iii)</span>
              <div className="flex-1">
                <p className="text-justify">
                  {renderFormattedText(getClause("clause_iii"))}
                </p>
                <div className="pl-6 space-y-2 mt-2">
                  <div className="flex items-start gap-2">
                    <span className="w-4 shrink-0">a)</span>
                    <p className="text-justify">{renderFormattedText(getClause("clause_iii_a"))}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 shrink-0">b)</span>
                    <p className="text-justify">{renderFormattedText(getClause("clause_iii_b"))}</p>
                  </div>
                </div>
                <p className="text-justify mt-3 pl-6">
                  {renderFormattedText(getClause("clause_iii_ta_da"))}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-neutral-500 font-semibold select-none mt-4 z-10 relative px-[20mm] pb-[10mm]">-1-</div>
      </section>

      {/* ================= PAGE 2 ================= */}
      <section className="print-page relative w-[210mm] min-h-[297mm] bg-white flex flex-col justify-between shadow-lg border border-neutral-200 print:shadow-none print:border-none print:m-0 print:w-full print:min-h-0">

        {/* Vaniki Watermark — same as letterpad (header area clipped) — hidden during print */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 print:hidden">
          <img
            src={letterpadBg}
            alt=""
            className="absolute w-full h-full object-fill"
            style={{clipPath: 'inset(22% 0 0 0)'}}
          />
        </div>

        <div className="flex-1 z-10 relative px-[20mm] pt-[15mm]">
          <div className="text-[13px] leading-[1.6] space-y-4">
            {/* Responsibilities */}
            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-medium">iv)</span>
              <div className="flex-1">
                <p className="font-bold mb-3">Main responsibilities:</p>
                
                {isSales || isManager ? (
                  <div className="pl-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="font-bold shrink-0">1)</span>
                      <p className="text-justify">{renderFormattedText(getClause("clause_iv_1"))}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-bold shrink-0">2)</span>
                      <p className="text-justify">{renderFormattedText(getClause("clause_iv_2"))}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-bold shrink-0">3)</span>
                      <p className="text-justify">{renderFormattedText(getClause("clause_iv_3"))}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-bold shrink-0">4)</span>
                      <p className="text-justify">{renderFormattedText(getClause("clause_iv_4"))}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-bold shrink-0">5)</span>
                      <div>
                        <p className="font-bold">Yearly Sale Target :-</p>
                        <p className="mt-0.5 text-neutral-800">{renderFormattedText(data.sales_target) || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-bold shrink-0">6)</span>
                      <div>
                        <p className="font-bold mb-1">Incentive Rules</p>
                        <div className="whitespace-pre-line text-neutral-700 text-[12.5px] leading-relaxed">
                          {renderFormattedText(data.incentive_rules)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pl-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="font-bold shrink-0">1)</span>
                      <p className="text-justify">{renderFormattedText(getClause("clause_iv_1"))}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-bold shrink-0">2)</span>
                      <p className="text-justify">{renderFormattedText(getClause("clause_iv_2"))}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-bold shrink-0">3)</span>
                      <p className="text-justify">{renderFormattedText(getClause("clause_iv_3"))}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-bold shrink-0">4)</span>
                      <p className="text-justify">{renderFormattedText(getClause("clause_iv_4"))}</p>
                    </div>
                    {data.incentive_rules && (
                      <div className="flex items-start gap-3">
                        <span className="font-bold shrink-0">5)</span>
                        <div>
                          <p className="font-bold mb-1">Incentive Rules / Bonus Details</p>
                          <div className="whitespace-pre-line text-neutral-700 text-[12.5px] leading-relaxed">
                            {renderFormattedText(data.incentive_rules)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-medium">v)</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_v"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-medium">vi)</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_vi"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-medium">vii)</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_vii"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-medium">viii)</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_viii"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-medium">ix)</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_ix"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-medium">x)</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_x"))}
              </p>
            </div>

            {/* Section 2 */}
            <div className="pt-2">
              <div className="whitespace-pre-line">{renderFormattedText(getClause("clause_2_cert"))}</div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-neutral-500 font-semibold select-none mt-4 z-10 relative px-[20mm] pb-[12mm]">-2-</div>
      </section>

      {/* ================= PAGE 3 ================= */}
      <section className="print-page relative w-[210mm] min-h-[297mm] bg-white flex flex-col justify-between shadow-lg border border-neutral-200 print:shadow-none print:border-none print:m-0 print:w-full print:min-h-0">

        {/* Vaniki Watermark — hidden during print */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 print:hidden">
          <img
            src={letterpadBg}
            alt=""
            className="absolute w-full h-full object-fill"
            style={{clipPath: 'inset(22% 0 0 0)'}}
          />
        </div>

        <div className="flex-1 z-10 relative px-[20mm] pt-[15mm]">
          <div className="text-[13px] leading-[1.6] space-y-4">
            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-bold">3.</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_3"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-bold">4.</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_4"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-bold">4.1</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_4_1"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-bold">5.</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_5"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-bold">6.</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_6"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-bold">7.</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_7"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-bold">8.</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_8"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-bold">9.</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_9"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-bold">10.</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_10"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-bold">11.</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_11"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-bold">12.</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_12"))}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-6 text-right shrink-0 font-bold">13.</span>
              <p className="text-justify">
                {renderFormattedText(getClause("clause_13"))}
              </p>
            </div>
          </div>

          {/* Custom Blocks container */}
          {userCustomBlocks.length > 0 && (
            <div className="mt-8 border-t border-neutral-200 pt-4">
              <h4 className="font-bold text-[13px] uppercase underline mb-3">Additional Clauses / Special Conditions</h4>
              <ol className="list-decimal pl-5 space-y-2 text-[13px]">
                {userCustomBlocks.map((b, idx) => (
                  <li key={b.id ?? idx} className="text-justify">
                    <span className="font-bold">{b.heading}:</span> {renderFormattedText(b.content)}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
        <div className="text-center text-xs text-neutral-500 font-semibold select-none mt-4 z-10 relative px-[20mm] pb-[12mm]">-3-</div>
      </section>

      {/* ================= PAGE 4 ================= */}
      <section className="print-page relative w-[210mm] min-h-[297mm] bg-white flex flex-col justify-between shadow-lg border border-neutral-200 print:shadow-none print:border-none print:m-0 print:w-full print:min-h-0">

        {/* Vaniki Watermark — hidden during print */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 print:hidden">
          <img
            src={letterpadBg}
            alt=""
            className="absolute w-full h-full object-fill"
            style={{clipPath: 'inset(22% 0 0 0)'}}
          />
        </div>

        <div className="flex-1 z-10 relative px-[20mm] pt-[15mm]">
          {/* Signatures */}
          <div className="mt-4 flex flex-col items-end text-[13px] leading-relaxed">
            <div className="w-[300px]">
              <p>Yours Sincerely,</p>
              <p className="font-bold mt-1">For and on behalf of VANIKI CROP SCIENCE PVT. LTD.,</p>
              
              {/* Spacer for physical signature and stamp */}
              <div className="h-28"></div>
 
              <p className="font-bold">DIRECTOR</p>
            </div>
          </div>

          {/* Declaration Section */}
          <div className="mt-14 border-t border-dashed border-neutral-300 pt-8 text-[13px] leading-relaxed">
            <h3 className="text-center font-bold text-[14px] underline mb-6 tracking-wide uppercase">DECLARATION</h3>
            <p className="mb-8">I accept all the above terms, targets & incentive structure.</p>
            
            <div className="space-y-6 max-w-[500px]">
              <div className="flex items-center gap-2">
                <span className="font-medium">Employee Name:</span>
                <span className="font-bold underline uppercase tracking-wide">{data.employee_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium shrink-0">Signature of the Candidate:</span>
                <span className="flex-1 border-b border-neutral-400 h-6"></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Dated:</span>
                <span className="w-48 border-b border-neutral-400 h-6"></span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-neutral-500 font-semibold select-none mt-4 z-10 relative px-[20mm] pb-[12mm]">-4-</div>
      </section>
    </article>
  );
}
