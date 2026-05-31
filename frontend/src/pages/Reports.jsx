import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import api from '../api/client';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const peso = (n) =>
  n == null || isNaN(Number(n))
    ? '\u2014'
    : `\u20B1${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const pesoPDF = (n) =>
  n == null || isNaN(Number(n))
    ? '--'
    : `PHP ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const dt = (v) => (v ? new Date(v).toLocaleString() : '\u2014');
const d  = (v) => (v ? new Date(v).toLocaleDateString() : '\u2014');

const safeStr = (v) => {
  if (v == null || v === '' || v === undefined) return '--';
  return String(v)
    .replace(/\u20B1/g, 'PHP ')
    .replace(/[\u2014\u2013]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x00-\xFF]/g, '?');
};

/* ------------------------------------------------------------------ */
/*  Status system (dark-theme pills)                                   */
/* ------------------------------------------------------------------ */

const STATUS_META = {
  Compliant:           { from: '#10b981', to: '#34d399' },
  'Fully Compliant':   { from: '#10b981', to: '#34d399' },
  Satisfactory:        { from: '#10b981', to: '#34d399' },
  Excellent:           { from: '#10b981', to: '#34d399' },
  Good:                { from: '#10b981', to: '#34d399' },
  'Very Clean':        { from: '#10b981', to: '#34d399' },
  Clean:               { from: '#10b981', to: '#34d399' },
  Low:                 { from: '#10b981', to: '#34d399' },
  Acknowledged:        { from: '#10b981', to: '#34d399' },
  Completed:           { from: '#10b981', to: '#34d399' },
  'Partially Compliant': { from: '#f59e0b', to: '#fb923c' },
  'Needs Improvement':   { from: '#f59e0b', to: '#fb923c' },
  Acceptable:            { from: '#f59e0b', to: '#fb923c' },
  Functional:            { from: '#f59e0b', to: '#fb923c' },
  Moderate:              { from: '#f59e0b', to: '#fb923c' },
  'Under Review':        { from: '#f59e0b', to: '#fb923c' },
  Ongoing:               { from: '#3b82f6', to: '#22d3ee' },
  Suspended:             { from: '#f59e0b', to: '#fb923c' },
  'Non-Compliant':              { from: '#f43f5e', to: '#fb7185' },
  Unsatisfactory:               { from: '#f43f5e', to: '#fb7185' },
  Poor:                         { from: '#f43f5e', to: '#fb7185' },
  High:                         { from: '#f43f5e', to: '#fb7185' },
  Critical:                     { from: '#f43f5e', to: '#fb7185' },
  'Needs Immediate Attention':  { from: '#f43f5e', to: '#fb7185' },
  'Unsafe Condition':           { from: '#f43f5e', to: '#fb7185' },
  'Out of Service':             { from: '#f43f5e', to: '#fb7185' },
  Terminated:                   { from: '#f43f5e', to: '#fb7185' },
  Pending: { from: '#8b5cf6', to: '#a78bfa' },
};

const getMeta = (val) => STATUS_META[val] || { from: '#64748b', to: '#94a3b8' };

const Pill = ({ children, value }) => {
  const { from } = getMeta(value || children);
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
      style={{ background: `${from}18`, borderColor: `${from}40`, color: from }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: from }} />
      {children}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/*  Layout primitives                                                  */
/* ------------------------------------------------------------------ */

const glassCard = 'rounded-2xl border border-white/10 backdrop-blur-xl';
const glassCardBg = 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)';

const SectionCard = ({ title, children, tone = 'default', accentFrom, accentTo, collapsible = false }) => {
  const [open, setOpen] = useState(true);
  const accents = {
    default: { from: '#6366f1', to: '#3b82f6' },
    red:     { from: '#f43f5e', to: '#fb7185' },
    green:   { from: '#10b981', to: '#34d399' },
    amber:   { from: '#f59e0b', to: '#fb923c' },
    blue:    { from: '#3b82f6', to: '#22d3ee' },
    slate:   { from: '#64748b', to: '#94a3b8' },
  };
  const accent = accentFrom ? { from: accentFrom, to: accentTo } : accents[tone];
  return (
    <div className={glassCard} style={{ background: glassCardBg }}>
      <div className="h-0.5 w-full rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to}55)` }} />
      <div className="p-5">
        {collapsible ? (
          <button type="button" onClick={() => setOpen((p) => !p)}
            className="w-full flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10 hover:border-white/20 transition-colors group">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50 group-hover:text-white/70 transition-colors">{title}</span>
            <svg className={`w-4 h-4 text-white/30 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : (
          <div className="mb-4 pb-3 border-b border-white/10">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">{title}</span>
          </div>
        )}
        {(!collapsible || open) && children}
      </div>
    </div>
  );
};

const KV = ({ k, v }) => (
  <div className="flex gap-3 text-sm min-w-0">
    <div className="text-white/35 text-[11px] font-bold uppercase tracking-widest min-w-[100px] sm:min-w-[140px] flex-shrink-0 pt-0.5">{k}</div>
    <div className="text-white/80 font-semibold text-[13px] break-words">{v ?? '\u2014'}</div>
  </div>
);

const TableSimple = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-xl border border-white/8">
    <table className="w-full text-xs">
      <thead>
        <tr style={{ background: 'rgba(255,255,255,0.06)' }}>
          {headers.map((h) => (
            <th key={h} className="text-left px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-white/40 border-b border-white/8">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={headers.length} className="px-3 py-4 text-center text-white/25 text-xs font-bold">— No records —</td></tr>
        ) : rows.map((r, i) => (
          <tr key={i} className="border-t border-white/5 hover:bg-white/4 transition-colors">
            {r.map((c, j) => <td key={j} className="px-3 py-2.5 align-top text-white/65 font-medium">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ------------------------------------------------------------------ */
/*  KPI Card                                                           */
/* ------------------------------------------------------------------ */

const KpiCard = ({ label, value, color, icon }) => (
  <div className={`${glassCard} p-4 flex flex-col items-center justify-center text-center gap-1`} style={{ background: glassCardBg }}>
    {icon && <span className="text-white/20 mb-0.5">{icon}</span>}
    <div className="text-2xl font-black" style={{
      background: `linear-gradient(135deg, ${color}, ${color}aa)`,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    }}>{value}</div>
    <div className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</div>
  </div>
);

/* ================================================================== */
/*  PDF EXPORT — Enhanced Professional Layout                          */
/* ================================================================== */

function buildPDF(report, analytics) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const PW = doc.internal.pageSize.getWidth();   // 595.28
  const PH = doc.internal.pageSize.getHeight();  // 841.89
  const ML = 36;
  const MR = 36;
  const MT = 62;
  const MB = 52;
  const CW = PW - ML - MR;

  /* ── Palette ── */
  const C = {
    navy:        [10,  30,  80],
    navyMid:     [22,  58, 138],
    navyLight:   [44,  92, 198],
    teal:        [6,  128, 120],
    tealLight:   [14, 158, 150],
    tealBg:      [218,246, 243],
    slate:       [52,  72, 100],
    slateLight:  [118,138, 162],
    ink:         [16,  26,  44],
    muted:       [102,116, 136],
    hairline:    [220,228, 238],
    bg:          [246,249, 253],
    bgAlt:       [238,244, 251],
    bgDark:      [224,233, 246],
    white:       [255,255, 255],
    red:         [190,  24,  44],
    redLight:    [255, 232, 235],
    green:       [14, 148,  70],
    greenLight:  [226,250, 236],
    amber:       [184,122,   2],
    amberLight:  [255,246, 218],
    purple:      [94,  34, 202],
    purpleLight: [236,232, 255],
    rose:        [202,  18,  56],
    roseLight:   [255,228, 234],
    indigo:      [75,  66, 222],
    indigoLight: [236,238, 255],
    gold:        [160, 120,  20],
    goldLight:   [255, 248, 220],
  };

  let y = MT;
  let currentPage = 1;

  /* ── Page overflow guard ── */
  function ensure(neededH) {
    if (y + neededH > PH - MB - 10) {
      drawFooter();
      doc.addPage();
      currentPage++;
      y = MT;
      drawHeader();
    }
  }

  /* ── HEADER ── */
  function drawHeader() {
    doc.setFillColor(...C.navy);
    doc.rect(0, 0, PW, 48, 'F');
    doc.setFillColor(...C.teal);
    doc.rect(0, 0, 6, 48, 'F');
    doc.setFillColor(...C.tealLight);
    doc.rect(0, 48, PW, 2, 'F');
    doc.setFillColor(200, 230, 240);
    doc.rect(0, 50, PW, 0.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...C.white);
    doc.text('BUILDCHECK', 18, 21);
    const bcW = doc.getTextWidth('BUILDCHECK');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(...C.tealLight);
    doc.text(' MONITOR', 18 + bcW, 21);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(168, 196, 228);
    doc.text('Construction Inspection & Compliance Tracking System', 18, 35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.tealLight);
    doc.text('OFFICIAL INSPECTION REPORT', PW - MR, 21, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(152,178, 214);
    doc.text(`Generated: ${safeStr(new Date().toLocaleString())}`, PW - MR, 34, { align: 'right' });
    y = MT;
  }

  /* ── FOOTER ── */
  function drawFooter() {
    const pg = doc.internal.getNumberOfPages();
    doc.setFillColor(...C.bgAlt);
    doc.rect(0, PH - MB, PW, MB, 'F');
    doc.setDrawColor(...C.navyMid);
    doc.setLineWidth(0.75);
    doc.line(0, PH - MB, PW, PH - MB);
    doc.setFillColor(...C.teal);
    doc.rect(0, PH - MB, 5, MB, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...C.navy);
    doc.text('CONFIDENTIAL', ML, PH - MB + 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text('BuildCheck Monitor -- Official Report. Not for public distribution.', ML + 70, PH - MB + 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.navyMid);
    doc.text(`Page ${pg}`, PW - MR, PH - MB + 20, { align: 'right' });
  }

  /* ── Wrapped text writer ── */
  function writeText(text, { x = ML, size = 9, bold = false, color = C.ink, maxW = CW, lineH } = {}) {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lh = lineH || size * 1.6;
    const lines = doc.splitTextToSize(safeStr(text), maxW);
    lines.forEach((line) => {
      ensure(lh + 2);
      doc.text(line, x, y);
      y += lh;
    });
  }

  /* ── Section heading bar ── */
  function sectionHeading(label, colorLeft = C.navy, colorRight = null) {
    ensure(34);
    y += 4;
    const cr = colorRight || colorLeft.map((c) => Math.min(255, c + 50));
    const bandBg = colorLeft.map((c) => Math.min(255, c + 212));
    doc.setFillColor(...bandBg);
    doc.roundedRect(ML, y, CW, 22, 2, 2, 'F');
    doc.setFillColor(...colorLeft);
    doc.rect(ML, y, 4, 22, 'F');
    doc.setFillColor(...cr);
    doc.circle(ML + CW - 12, y + 11, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...colorLeft);
    doc.text(safeStr(label).toUpperCase(), ML + 11, y + 14.5);
    y += 28;
  }

  /* ── Sub-heading (smaller) ── */
  function subHeading(label, color = C.slate) {
    ensure(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...color);
    doc.text(safeStr(label).toUpperCase(), ML, y + 9);
    y += 16;
    doc.setDrawColor(...C.hairline);
    doc.setLineWidth(0.35);
    doc.line(ML, y, ML + CW, y);
    y += 6;
  }

  /* ── Horizontal divider ── */
  function divider(before = 8, after = 8) {
    y += before;
    doc.setDrawColor(...C.hairline);
    doc.setLineWidth(0.4);
    doc.line(ML, y, PW - MR, y);
    y += after;
  }

  /* ── Two-column KV grid ── */
  function kvGrid(pairs, cols = 2) {
    const colW  = CW / cols;
    const keyW  = 110;
    const vPad  = 6;
    const rowMinH = 22;

    for (let i = 0; i < pairs.length; i += cols) {
      let rowH = rowMinH;
      for (let c = 0; c < cols && i + c < pairs.length; c++) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        const valStr = safeStr(pairs[i + c][1]);
        const availW = colW - keyW - 20;
        const lines = doc.splitTextToSize(valStr, availW);
        const h = lines.length * 12 + vPad * 2 + 2;
        if (h > rowH) rowH = h;
      }

      ensure(rowH + 2);

      const rowIdx = Math.floor(i / cols);
      doc.setFillColor(...(rowIdx % 2 === 0 ? C.bgAlt : C.white));
      doc.rect(ML, y, CW, rowH, 'F');

      if (cols === 2) {
        doc.setDrawColor(...C.hairline);
        doc.setLineWidth(0.25);
        doc.line(ML + colW, y + 3, ML + colW, y + rowH - 3);
      }

      doc.setDrawColor(...C.hairline);
      doc.setLineWidth(0.25);
      doc.line(ML, y + rowH, ML + CW, y + rowH);

      for (let c = 0; c < cols && i + c < pairs.length; c++) {
        const [k, v] = pairs[i + c];
        const xOff  = ML + c * colW + 8;
        const baseY = y + vPad + 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(...C.slateLight);
        doc.text(safeStr(k).toUpperCase(), xOff, baseY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...C.ink);
        const availW = colW - keyW - 14;
        const valLines = doc.splitTextToSize(safeStr(v), availW);
        valLines.forEach((line, li) => {
          doc.text(line, xOff + keyW, baseY + li * 12);
        });
      }

      y += rowH;
    }
    y += 8;
  }

  /* ── Styled table ── */
  function table(headers, rows, colWidths) {
    const cw       = colWidths || headers.map(() => Math.floor(CW / headers.length));
    const headH    = 22;
    const cellPadX = 8;
    const cellPadY = 5;
    const minRowH  = 20;

    ensure(headH + 4);

    doc.setFillColor(...C.navy);
    doc.rect(ML, y, CW, headH, 'F');
    doc.setFillColor(...C.teal);
    doc.rect(ML, y, 4, headH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.white);
    let xh = ML + 4;
    headers.forEach((h, idx) => {
      doc.text(safeStr(h).toUpperCase(), xh + cellPadX, y + 14.5);
      xh += cw[idx];
    });
    y += headH;

    if (!rows || rows.length === 0) {
      ensure(minRowH + 4);
      doc.setFillColor(...C.bg);
      doc.rect(ML, y, CW, minRowH + 4, 'F');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.slateLight);
      doc.text('-- No records --', ML + CW / 2, y + 14, { align: 'center' });
      y += minRowH + 8;
      return;
    }

    rows.forEach((row, rIdx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);

      let maxLines = 1;
      const cellLines = row.map((cell, cIdx) => {
        const availW = cw[cIdx] - cellPadX * 2;
        const lines = doc.splitTextToSize(safeStr(cell), availW);
        if (lines.length > maxLines) maxLines = lines.length;
        return lines;
      });
      const rowH = Math.max(minRowH, maxLines * 12 + cellPadY * 2);

      ensure(rowH + 2);

      doc.setFillColor(...(rIdx % 2 === 0 ? C.white : C.bgAlt));
      doc.rect(ML, y, CW, rowH, 'F');
      doc.setFillColor(...(rIdx % 2 === 0 ? C.teal : C.navyMid));
      doc.rect(ML, y, 4, rowH, 'F');
      doc.setDrawColor(...C.hairline);
      doc.setLineWidth(0.3);
      doc.line(ML + 4, y + rowH, ML + CW, y + rowH);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.ink);
      let xr = ML + 4;
      cellLines.forEach((lines, cIdx) => {
        lines.forEach((line, li) => {
          doc.text(line, xr + cellPadX, y + cellPadY + 10 + li * 12);
        });
        xr += cw[cIdx];
      });

      y += rowH;
    });

    doc.setDrawColor(...C.navyMid);
    doc.setLineWidth(0.6);
    doc.line(ML, y, ML + CW, y);
    y += 12;
  }

  /* ── KPI stat boxes (cover page) ── */
  function statBoxRow(items) {
    const count = items.length;
    const bW    = CW / count;
    const bH    = 66;
    ensure(bH + 16);

    items.forEach((item, i) => {
      const bx     = ML + i * bW;
      const col    = item.color || C.navy;
      const bgRGB  = col.map((c) => Math.min(255, c + 212));

      doc.setFillColor(...bgRGB);
      doc.roundedRect(bx + 3, y, bW - 6, bH, 4, 4, 'F');
      doc.setFillColor(...col);
      doc.rect(bx + 3, y, bW - 6, 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(...col);
      doc.text(safeStr(item.value), bx + bW / 2, y + 37, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(...C.slate);
      const labelLines = doc.splitTextToSize(safeStr(item.label).toUpperCase(), bW - 14);
      labelLines.forEach((line, li) => {
        doc.text(line, bx + bW / 2, y + 51 + li * 8, { align: 'center' });
      });
    });

    y += bH + 18;
  }

  /* ── Badge row ── */
  function badgeRow(items) {
    const count = items.length;
    const bW    = CW / count;
    const bH    = 26;
    ensure(bH + 10);

    items.forEach((item, i) => {
      const bx  = ML + i * bW;
      const col = item.color || C.slate;
      const bg  = col.map((c) => Math.min(255, c + 192));

      doc.setFillColor(...bg);
      doc.roundedRect(bx + 3, y, bW - 6, bH, 3, 3, 'F');
      doc.setFillColor(...col);
      doc.roundedRect(bx + 3, y, bW - 6, 3, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setTextColor(...col);
      doc.text(safeStr(item.label).toUpperCase(), bx + bW / 2, y + 12, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...C.ink);
      const valText = doc.splitTextToSize(safeStr(item.value), bW - 14);
      doc.text(valText[0], bx + bW / 2, y + 22, { align: 'center' });
    });

    y += bH + 12;
  }

  /* ── Violation card ── */
  function violationCard(v, idx) {
    const acked   = v.acknowledged;
    const ackC    = acked ? C.green : C.amber;
    const ackBg   = acked ? C.greenLight : C.amberLight;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const descLines   = doc.splitTextToSize(safeStr(v.description), CW - 30);
    const actionLines = doc.splitTextToSize(safeStr(v.corrective_action), CW - 30);
    const remarkLines = v.contractor_remarks
      ? doc.splitTextToSize(safeStr(v.contractor_remarks), CW - 30)
      : [];

    const fieldH = (lines) => lines.length * 12 + 18;
    const estimH = 32
      + (descLines.length   > 0 ? fieldH(descLines)   : 0)
      + (actionLines.length > 0 ? fieldH(actionLines) : 0)
      + (remarkLines.length > 0 ? fieldH(remarkLines) : 0)
      + 18;

    ensure(estimH + 12);

    doc.setFillColor(...C.roseLight);
    doc.roundedRect(ML, y, CW, estimH, 4, 4, 'F');
    doc.setFillColor(...C.rose);
    doc.roundedRect(ML, y, 5, estimH, 3, 3, 'F');
    doc.setDrawColor(...C.rose);
    doc.setLineWidth(0.4);
    doc.roundedRect(ML, y, CW, estimH, 4, 4, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.rose);
    doc.text(`VIOLATION #${idx + 1}`, ML + 14, y + 15);

    const ackLabel = acked ? 'ACKNOWLEDGED' : 'PENDING ACK.';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    const ackW = doc.getTextWidth(ackLabel) + 18;
    doc.setFillColor(...ackBg);
    doc.roundedRect(PW - MR - ackW, y + 6, ackW, 14, 3, 3, 'F');
    doc.setTextColor(...ackC);
    doc.text(ackLabel, PW - MR - ackW / 2, y + 15, { align: 'center' });

    y += 22;

    doc.setDrawColor(...C.rose);
    doc.setLineWidth(0.3);
    doc.line(ML + 14, y, PW - MR - 8, y);
    y += 8;

    const field = (label, val) => {
      if (!val || val === '--') return;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(...C.slate);
      doc.text(label.toUpperCase() + ':', ML + 14, y + 8);
      y += 14;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.ink);
      const lines = doc.splitTextToSize(safeStr(val), CW - 30);
      lines.forEach((line) => { doc.text(line, ML + 14, y + 2); y += 12; });
      y += 4;
    };

    field('Description', v.description);
    field('Corrective Action', v.corrective_action);
    if (v.contractor_remarks) field('Contractor Remarks', v.contractor_remarks);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text(`Logged: ${safeStr(dt(v.created_at))}`, ML + 14, y + 10);
    if (acked && v.acknowledged_at) {
      doc.setTextColor(...C.green);
      doc.text(`Ack: ${safeStr(dt(v.acknowledged_at))}`, PW - MR, y + 10, { align: 'right' });
    }
    y += 18;
  }

  /* ── Note / info box ── */
  function noteBox(text, color = C.indigo) {
    const bg    = color.map((c) => Math.min(255, c + 210));
    const lines = doc.splitTextToSize(safeStr(text), CW - 26);
    const bH    = lines.length * 12 + 20;
    ensure(bH + 8);
    doc.setFillColor(...bg);
    doc.roundedRect(ML, y, CW, bH, 4, 4, 'F');
    doc.setFillColor(...color);
    doc.rect(ML, y, 4, bH, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...C.ink);
    lines.forEach((line, li) => {
      doc.text(line, ML + 14, y + 12 + li * 12);
    });
    y += bH + 10;
  }

  /* ── Budget progress bar ── */
  function budgetBar(approved, contract) {
    if (!approved || !contract) return;
    ensure(52);
    const pct        = Math.min((Number(contract) / Number(approved)) * 100, 100);
    const overBudget = Number(contract) > Number(approved);
    const barCol     = overBudget ? C.red : C.teal;
    const barBg      = overBudget ? C.redLight : C.tealBg;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.slateLight);
    doc.text('CONTRACT AMOUNT VS. APPROVED BUDGET (ABC)', ML, y + 10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...barCol);
    doc.text(`${Math.round(pct)}%`, PW - MR, y + 10, { align: 'right' });
    y += 16;
    doc.setFillColor(...barBg);
    doc.roundedRect(ML, y, CW, 10, 4, 4, 'F');
    doc.setFillColor(...barCol);
    const fillW = Math.max(10, CW * pct / 100);
    doc.roundedRect(ML, y, fillW, 10, 4, 4, 'F');
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.muted);
    doc.text('PHP 0', ML, y);
    doc.text(`ABC: ${pesoPDF(approved)}`, PW - MR, y, { align: 'right' });
    y += 14;
  }

  /* ============================================================= */
  /*  START BUILDING THE PDF                                        */
  /* ============================================================= */

  drawHeader();

  y += 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(52);
  doc.setTextColor(228, 235, 248);
  doc.text('INSPECTION', ML - 2, y + 38);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...C.navy);
  doc.text('Inspection Report', ML, y + 36);

  y += 46;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(...C.slate);
  const p = report.project;
  const projLines = doc.splitTextToSize(safeStr(p.name), CW - 60);
  projLines.forEach((line) => { doc.text(line, ML, y); y += 18; });

  y += 4;
  doc.setFillColor(...C.teal);
  doc.rect(ML, y, 48, 3, 'F');
  doc.setFillColor(...C.hairline);
  doc.rect(ML + 52, y + 1, CW - 52, 1, 'F');
  y += 16;

  const metaItems = [
    { label: 'Ref No.',    value: safeStr(p.ref_number) || '--' },
    { label: 'Year',       value: safeStr(p.year) || '--' },
    { label: 'Status',     value: safeStr(p.project_status) || '--' },
    { label: 'Contractor', value: safeStr(p.contractor) || '--' },
  ];
  const mW = CW / metaItems.length;
  metaItems.forEach((m, i) => {
    const xPos = ML + i * mW + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.slateLight);
    doc.text(m.label.toUpperCase(), xPos, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...C.navy);
    const valLines = doc.splitTextToSize(m.value, mW - 10);
    valLines.forEach((line, li) => {
      doc.text(line, xPos, y + 14 + li * 13);
    });
  });
  y += 34;

  divider(8, 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...C.slateLight);
  doc.text('AT A GLANCE', ML, y);
  y += 12;

  statBoxRow([
    { label: 'Inspections',    value: String(report.summary.total_inspections),               color: C.navyLight  },
    { label: 'Violations',     value: String(report.summary.total_violations),                color: C.red        },
    { label: 'Acknowledged',   value: String(report.summary.acknowledged_violations),         color: C.green      },
    { label: 'Compliance %',   value: `${analytics?.compliancePct ?? 0}%`,                    color: C.teal       },
    { label: 'Total Manpower', value: String(analytics?.totalManpower ?? 0),                  color: C.amber      },
    { label: 'Photos',         value: String(analytics?.totalPhotos ?? 0),                    color: C.purple     },
  ]);

  sectionHeading('Project Information', C.navy, C.navyLight);

  kvGrid([
    ['Year',                    safeStr(p.year)],
    ['Reference Number',        safeStr(p.ref_number)],
    ['Location',                safeStr(p.location_name || p.location_id)],
    ['Project Status',          safeStr(p.project_status)],
    ['Contractor',              safeStr(p.contractor)],
    ['Person-In-Charge',        safeStr(p.person_in_charge)],
    ['Mode of Procurement',     safeStr(p.mode_of_procurement)],
    ['Funding Source',          safeStr(p.funding_source)],
    ['Duration',                safeStr(p.duration)],
    ['Date of Start',           safeStr(d(p.start_date))],
    ['Target Completion',       safeStr(d(p.target_completion_date))],
    ['Revised Expiry',          safeStr(d(p.revised_expiry_date))],
    ['Approved Budget (ABC)',   pesoPDF(p.approved_budget)],
    ['Contract Amount',         pesoPDF(p.contract_amount)],
    ['Variation Orders',        pesoPDF(p.variation_orders)],
    ['Revised Contract Amount', pesoPDF(p.revised_contract_amount)],
  ], 2);

  budgetBar(p.approved_budget, p.contract_amount);
  divider(10, 6);

  sectionHeading('Summary Analytics', C.teal, C.tealLight);

  if (analytics) {
    const countStr = (obj) =>
      Object.entries(obj || {}).length
        ? Object.entries(obj).map(([k, v]) => `${safeStr(k)}: ${v}`).join('   |   ')
        : '--';

    kvGrid([
      ['Compliance Distribution', countStr(analytics.complianceCount)],
      ['Overall Assessments',     countStr(analytics.assessmentCount)],
      ['Weather Conditions',      countStr(analytics.weatherCount)],
      ['Risk Levels',             countStr(analytics.riskByLevel)],
      ['Safety Items by Status',  countStr(analytics.safetyByStatus)],
      ['Environmental Status',    countStr(analytics.envByStatus)],
      ['Equipment Condition',     countStr(analytics.equipmentByCondition)],
      ['Acknowledgement Rate',    `${analytics.ackPct ?? 0}%  (${report.summary.acknowledged_violations} of ${report.summary.total_violations} violations)`],
    ], 1);

    if (Object.keys(analytics.manpowerBreakdown).length) {
      subHeading('Manpower Breakdown by Category', C.slate);
      table(
        ['Manpower Category', 'Total Count'],
        Object.entries(analytics.manpowerBreakdown).map(([k, v]) => [safeStr(k), String(v)]),
        [CW - 110, 110],
      );
    }

    if (Object.keys(analytics.activityCount).length) {
      subHeading('Activities Logged Across All Inspections', C.slate);
      table(
        ['Activity', '# of Inspections'],
        Object.entries(analytics.activityCount).map(([k, v]) => [safeStr(k), String(v)]),
        [CW - 120, 120],
      );
    }
  }

  sectionHeading('Inspection History Overview', C.navyMid, C.navyLight);

  table(
    ['#', 'Date & Time', 'Inspector', 'Weather', 'Compliance', 'Assessment', 'Status', 'Photos', 'Viol.'],
    report.inspections.map((insp, idx) => [
      String(idx + 1),
      safeStr(dt(insp.inspection_datetime)),
      safeStr(insp.inspector_name),
      safeStr(insp.weather) + (insp.weather_other ? ` (${safeStr(insp.weather_other)})` : ''),
      safeStr(insp.compliance_status),
      safeStr(insp.overall_assessment),
      safeStr(insp.status),
      String((insp.photos || []).length),
      String((insp.violations || []).length),
    ]),
    [20, 90, 74, 52, 74, 72, 52, 32, 32],
  );

  report.inspections.forEach((insp, idx) => {
    doc.addPage();
    y = MT;
    drawHeader();
    y += 12;

    const heroH = 60;
    doc.setFillColor(...C.navy);
    doc.roundedRect(ML, y, CW, heroH, 5, 5, 'F');
    doc.setFillColor(...C.teal);
    doc.roundedRect(ML, y, 6, heroH, 4, 4, 'F');
    doc.setFillColor(...C.navyMid);
    const tx = ML + CW;
    doc.triangle(tx - 60, y, tx, y, tx, y + heroH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...C.tealLight);
    doc.text(`INSPECTION #${idx + 1}`, ML + 18, y + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(186, 208, 236);
    doc.text(safeStr(dt(insp.inspection_datetime)), ML + 18, y + 32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(144, 174, 222);
    doc.text('INSPECTOR', PW - MR - 8, y + 18, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...C.white);
    const inspLines = doc.splitTextToSize(safeStr(insp.inspector_name), 160);
    inspLines.forEach((line, li) => {
      doc.text(line, PW - MR - 8, y + 30 + li * 12, { align: 'right' });
    });

    const heroMetas = [
      `Compliance: ${safeStr(insp.compliance_status)}`,
      `Assessment: ${safeStr(insp.overall_assessment)}`,
      `Status: ${safeStr(insp.status)}`,
      `Weather: ${safeStr(insp.weather)}`,
    ];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(106, 140, 206);
    const metaStripW = (CW - 30) / heroMetas.length;
    heroMetas.forEach((m, mi) => {
      doc.text(m, ML + 18 + mi * metaStripW, y + 50, { maxWidth: metaStripW - 6 });
    });

    y += heroH + 12;

    badgeRow([
      { label: 'Status',      value: safeStr(insp.status),             color: C.navyMid },
      { label: 'Compliance',  value: safeStr(insp.compliance_status),  color: C.teal    },
      { label: 'Assessment',  value: safeStr(insp.overall_assessment), color: C.slate   },
      { label: 'Cleanliness', value: safeStr(insp.site_cleanliness),   color: C.navy    },
    ]);

    if (insp.compliance_remarks) {
      ensure(54);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const remLines = doc.splitTextToSize(safeStr(insp.compliance_remarks), CW - 30);
      const remH = remLines.length * 12 + 28;
      doc.setFillColor(...C.amberLight);
      doc.roundedRect(ML, y, CW, remH, 4, 4, 'F');
      doc.setFillColor(...C.amber);
      doc.roundedRect(ML, y, 5, remH, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(...C.amber);
      doc.text('COMPLIANCE REMARKS', ML + 14, y + 13);
      y += 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...C.ink);
      remLines.forEach((line) => { doc.text(line, ML + 14, y + 4); y += 12; });
      y += 12;
    }

    sectionHeading('Inspection Details', C.navy, C.navyLight);
    kvGrid([
      ['Inspector',        safeStr(insp.inspector_name)],
      ['Date & Time',      safeStr(dt(insp.inspection_datetime))],
      ['Weather',          `${safeStr(insp.weather)}${insp.weather_other ? ' -- ' + safeStr(insp.weather_other) : ''}`],
      ['Site Cleanliness', safeStr(insp.site_cleanliness)],
      ['Compliance',       safeStr(insp.compliance_status)],
      ['Overall Assess.',  safeStr(insp.overall_assessment)],
    ], 2);

    sectionHeading('Site Activities', C.teal, C.tealLight);
    if ((insp.activities || []).length === 0) {
      writeText('-- None recorded --', { size: 8.5, color: C.slateLight }); y += 6;
    } else {
      const actCols = 3;
      const actColW = CW / actCols;
      const actRowH = 18;
      const chunks  = [];
      for (let i = 0; i < insp.activities.length; i += actCols)
        chunks.push(insp.activities.slice(i, i + actCols));

      chunks.forEach((row, rowI) => {
        ensure(actRowH + 2);
        doc.setFillColor(...(rowI % 2 === 0 ? C.tealBg : C.white));
        doc.rect(ML, y, CW, actRowH, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(...C.ink);
        row.forEach((a, ci) => {
          doc.text(
            `- ${safeStr(a.activity_name)}`,
            ML + ci * actColW + 8,
            y + 12,
            { maxWidth: actColW - 14 }
          );
        });
        y += actRowH;
      });
      y += 8;
    }

    sectionHeading('Manpower', C.navyMid, C.navyLight);
    if ((insp.manpower || []).length === 0) {
      writeText('-- None recorded --', { size: 8.5, color: C.slateLight }); y += 6;
    } else {
      table(
        ['Manpower Category', 'Count'],
        insp.manpower.map((m) => [safeStr(m.category), safeStr(m.count)]),
        [CW - 110, 110],
      );
    }

    sectionHeading('Equipment & Machinery', C.navyMid, C.navyLight);
    if ((insp.equipment || []).length === 0) {
      writeText('-- None recorded --', { size: 8.5, color: C.slateLight }); y += 6;
    } else {
      table(
        ['Condition', 'Remarks'],
        insp.equipment.map((e) => [safeStr(e.condition), safeStr(e.remarks) || '--']),
        [150, CW - 150],
      );
    }

    sectionHeading('Safety & Health -- General Items', C.red);
    if ((insp.safety_general || []).length === 0) {
      writeText('-- None recorded --', { size: 8.5, color: C.slateLight }); y += 6;
    } else {
      table(
        ['Item', 'Status', 'Remarks'],
        insp.safety_general.map((s) => [safeStr(s.item), safeStr(s.status), safeStr(s.remarks) || '--']),
        [210, 100, CW - 310],
      );
    }

    sectionHeading('High-Risk Areas', C.red);
    if ((insp.safety_risk || []).length === 0) {
      writeText('-- None recorded --', { size: 8.5, color: C.slateLight }); y += 6;
    } else {
      table(
        ['Risk Type', 'Level', 'Control Measures'],
        insp.safety_risk.map((s) => [safeStr(s.risk_type), safeStr(s.risk_level), safeStr(s.measures) || '--']),
        [170, 90, CW - 260],
      );
    }

    sectionHeading('Environmental & Health Control', C.green);
    if ((insp.environmental || []).length === 0) {
      writeText('-- None recorded --', { size: 8.5, color: C.slateLight }); y += 6;
    } else {
      table(
        ['Item', 'Status', 'Remarks'],
        insp.environmental.map((s) => [safeStr(s.item), safeStr(s.status), safeStr(s.remarks) || '--']),
        [210, 120, CW - 330],
      );
    }

    if ((insp.photos || []).length > 0) {
      sectionHeading(
        `Photo Documentation -- ${insp.photos.length} photo${insp.photos.length !== 1 ? 's' : ''}`,
        C.purple
      );
      insp.photos.forEach((ph, pi) => {
        ensure(16);
        doc.setFillColor(...(pi % 2 === 0 ? C.purpleLight : C.white));
        doc.rect(ML, y, CW, 15, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...C.ink);
        doc.text(
          `${pi + 1}.  ${safeStr(ph.file_path)}`,
          ML + 8,
          y + 11,
          { maxWidth: CW - 16 }
        );
        y += 15;
      });
      y += 8;
    }

    if ((insp.violations || []).length > 0) {
      sectionHeading(
        `Violations -- ${insp.violations.length} recorded`,
        C.rose
      );
      y += 6;
      insp.violations.forEach((v, vi) => {
        violationCard(v, vi);
        y += 8;
      });
    }
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let pg = 1; pg <= totalPages; pg++) {
    doc.setPage(pg);
    drawFooter();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.navyMid);
    doc.text(`${pg} / ${totalPages}`, PW - MR, PH - MB + 20, { align: 'right' });
  }

  const safe = (report.project.name || 'project')
    .replace(/[^a-z0-9]+/gi, '_')
    .slice(0, 60);
  doc.save(`BuildCheck_Report_${safe}.pdf`);
}

/* ------------------------------------------------------------------ */
/*  Input / Select style                                               */
/* ------------------------------------------------------------------ */

const inputClass = `block w-full px-4 py-3 rounded-xl text-white font-semibold placeholder:text-white/40
  focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-400/60
  transition-all duration-300 hover:border-white/30 text-sm
  bg-slate-700/60 backdrop-blur-md border border-white/20`;
const selectClass = `${inputClass} appearance-none cursor-pointer [&>option]:bg-slate-800 [&>option]:text-white`;

/* ------------------------------------------------------------------ */
/*  Delete Confirmation Modal                                          */
/* ------------------------------------------------------------------ */

const DeleteModal = ({ projectName, onConfirm, onCancel, isDeleting }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
  >
    <div
      className="w-full max-w-md rounded-2xl border border-rose-500/30 p-6"
      style={{
        background: 'linear-gradient(160deg, rgba(20,10,15,0.98) 0%, rgba(30,10,15,0.95) 100%)',
        boxShadow: '0 0 60px rgba(244,63,94,0.2), 0 25px 50px rgba(0,0,0,0.6)',
        animation: 'slideUp 0.2s ease-out both',
      }}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl border border-rose-500/30 mx-auto mb-4"
        style={{ background: 'rgba(244,63,94,0.12)' }}>
        <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75"
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-base font-black text-white text-center mb-2">Delete Project Records</h3>

      {/* Body */}
      <p className="text-sm text-white/50 text-center leading-relaxed mb-1">
        You are about to permanently delete all records for:
      </p>
      <p className="text-sm font-black text-rose-300 text-center mb-4 px-2 break-words">
        {projectName}
      </p>
      <div className="rounded-xl border border-rose-500/20 px-4 py-3 mb-6"
        style={{ background: 'rgba(244,63,94,0.08)' }}>
        <p className="text-xs text-white/50 leading-relaxed">
          This will permanently delete the project and <span className="text-rose-300 font-bold">all associated inspections, violations, photos, manpower, safety, and environmental records</span>. This action <span className="text-rose-300 font-bold">cannot be undone</span>.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 px-4 py-3 rounded-xl border border-white/15 text-white/60 font-black text-xs uppercase tracking-wider hover:border-white/30 hover:text-white/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: isDeleting
              ? 'rgba(244,63,94,0.3)'
              : 'linear-gradient(135deg, #f43f5e, #e11d48)',
            boxShadow: isDeleting ? 'none' : '0 4px 20px rgba(244,63,94,0.4)',
            color: '#fff',
          }}
        >
          {isDeleting ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Deleting…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Permanently
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function Reports() {
  const [params, setParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const projectId = params.get('project') || '';
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({ from: '', to: '', status: '' });
  const [view, setView] = useState('summary');
  const [openId, setOpenId] = useState(null);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => { api.get('/projects').then((r) => setProjects(r.data)); }, []);

  useEffect(() => {
    if (!projectId) { setReport(null); return; }
    const q = new URLSearchParams();
    if (filters.from)   q.set('from', filters.from);
    if (filters.to)     q.set('to', filters.to);
    if (filters.status) q.set('status', filters.status);
    api.get(`/reports/${projectId}?${q.toString()}`).then((r) => setReport(r.data));
  }, [projectId, filters]);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`/reports/${projectId}`);
      setShowDeleteModal(false);
      setReport(null);
      setParams({});
      // Refresh project list
      const r = await api.get('/projects');
      setProjects(r.data);
    } catch (err) {
      setDeleteError(err?.response?.data?.error || 'Failed to delete. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const analytics = useMemo(() => {
    if (!report) return null;
    const insps = report.inspections || [];
    const totalManpower = insps.reduce((sum, i) => sum + (i.manpower || []).reduce((s, m) => s + Number(m.count || 0), 0), 0);
    const manpowerBreakdown = {};
    const equipmentByCondition = {};
    const safetyByStatus = { Compliant: 0, 'Partially Compliant': 0, 'Non-Compliant': 0 };
    const riskByLevel = { Low: 0, Moderate: 0, High: 0, Critical: 0 };
    const envByStatus = { Satisfactory: 0, 'Needs Improvement': 0, Unsatisfactory: 0 };
    const activityCount = {};
    const weatherCount = {};
    const complianceCount = {};
    const assessmentCount = {};
    let totalPhotos = 0;

    for (const i of insps) {
      (i.manpower || []).forEach((m) => { manpowerBreakdown[m.category] = (manpowerBreakdown[m.category] || 0) + Number(m.count || 0); });
      (i.equipment || []).forEach((e) => { equipmentByCondition[e.condition] = (equipmentByCondition[e.condition] || 0) + 1; });
      (i.safety_general || []).forEach((s) => { safetyByStatus[s.status] = (safetyByStatus[s.status] || 0) + 1; });
      (i.safety_risk || []).forEach((s) => { riskByLevel[s.risk_level] = (riskByLevel[s.risk_level] || 0) + 1; });
      (i.environmental || []).forEach((s) => { envByStatus[s.status] = (envByStatus[s.status] || 0) + 1; });
      (i.activities || []).forEach((a) => { activityCount[a.activity_name] = (activityCount[a.activity_name] || 0) + 1; });
      weatherCount[i.weather]               = (weatherCount[i.weather] || 0) + 1;
      complianceCount[i.compliance_status]  = (complianceCount[i.compliance_status] || 0) + 1;
      assessmentCount[i.overall_assessment] = (assessmentCount[i.overall_assessment] || 0) + 1;
      totalPhotos += (i.photos || []).length;
    }

    const compliancePct = insps.length ? Math.round(((complianceCount['Fully Compliant'] || 0) / insps.length) * 100) : 0;
    const ackPct = report.summary.total_violations
      ? Math.round((report.summary.acknowledged_violations / report.summary.total_violations) * 100)
      : 100;

    return { totalManpower, manpowerBreakdown, equipmentByCondition, safetyByStatus, riskByLevel, envByStatus, activityCount, weatherCount, complianceCount, assessmentCount, totalPhotos, compliancePct, ackPct };
  }, [report]);

  const FieldLabel = ({ children }) => (
    <label className="block text-[10px] font-black text-white/50 uppercase tracking-[0.18em] ml-0.5 mb-2">
      {children}
    </label>
  );

  const AckRing = ({ pct }) => {
    const r = 20;
    const circ = 2 * Math.PI * r;
    return (
      <div className="relative w-14 h-14 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
          <circle cx="24" cy="24" r={r} fill="none"
            stroke={pct === 100 ? '#10b981' : '#6366f1'}
            strokeWidth="4"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/70">{pct}%</span>
      </div>
    );
  };

  const selectedProject = report?.project;

  return (
    <div className="min-h-screen pb-20 relative">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        select option { background-color: #1e3a5f; color: #f1f5f9; font-weight: 600; }
        input::-webkit-calendar-picker-indicator { filter: invert(1) brightness(0.7); cursor: pointer; opacity: 0.5; }
      `}</style>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteModal
          projectName={selectedProject?.name || 'this project'}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setShowDeleteModal(false); setDeleteError(''); }}
          isDeleting={isDeleting}
        />
      )}

      {/* Page header */}
      <div className="relative z-10 border-b border-white/8 mb-8"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div style={{ animation: 'slideDown 0.7s ease-out both' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.15))' }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Inspection Analytics</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">Reports</h1>
            <p className="text-white/40 text-sm font-medium mt-2">Comprehensive inspection records, analytics, and exportable PDF.</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-6 items-start" style={{ animation: 'slideUp 0.6s ease-out 0.1s both' }}>

          {/* Sticky sidebar */}
          <div className="w-full lg:w-60 flex-shrink-0 lg:sticky lg:top-6 flex flex-col gap-4">

            {selectedProject ? (
              <div className={`${glassCard} p-4`} style={{ background: glassCardBg }}>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">Active Project</p>
                <p className="text-xs font-black text-white/80 leading-snug mb-2">{selectedProject.name}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Pill value={selectedProject.project_status}>{selectedProject.project_status}</Pill>
                </div>
                <div className="space-y-1 mt-3">
                  {[
                    ['Ref',      selectedProject.ref_number],
                    ['Year',     selectedProject.year],
                    ['Duration', selectedProject.duration],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[10px]">
                      <span className="text-white/30 font-bold uppercase tracking-widest">{k}</span>
                      <span className="text-white/60 font-bold">{v || '\u2014'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`${glassCard} p-4`} style={{ background: glassCardBg }}>
                <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-2">No project selected</p>
                <p className="text-[11px] text-white/25">Pick a project to view its report.</p>
              </div>
            )}

            {analytics && (
              <div className={`${glassCard} p-4 flex items-center gap-3`} style={{ background: glassCardBg }}>
                <AckRing pct={analytics.ackPct} />
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Ack. Rate</p>
                  <p className="text-xs font-black text-white/70 mt-0.5">
                    {report.summary.acknowledged_violations}/{report.summary.total_violations} violations
                  </p>
                </div>
              </div>
            )}

            {report && (
              <div className={`${glassCard} overflow-hidden`} style={{ background: glassCardBg }}>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-4 pt-4 pb-2">View Mode</p>
                {[
                  { key: 'summary',  label: 'Summary',  icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
                  { key: 'detailed', label: 'Detailed', icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
                ].map(({ key, label, icon }) => {
                  const active = view === key;
                  return (
                    <button key={key} onClick={() => setView(key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 border-t border-white/5 ${active ? 'bg-indigo-500/15' : 'hover:bg-white/5'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${active ? 'bg-indigo-400' : 'bg-white/20'}`} />
                      <span className={`text-xs font-bold flex items-center gap-2 ${active ? 'text-indigo-300' : 'text-white/50'}`}>
                        {icon}{label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {report && (
              <>
                {/* Export PDF button */}
                <button onClick={() => buildPDF(report, analytics)}
                  className="w-full px-5 py-3 rounded-xl text-white font-black uppercase tracking-wider text-xs transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 border border-white/20"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #2563eb)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export PDF
                </button>

                {/* Delete Records button */}
                <button
                  onClick={() => { setDeleteError(''); setShowDeleteModal(true); }}
                  className="w-full px-5 py-3 rounded-xl font-black uppercase tracking-wider text-xs transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 border border-rose-500/30 hover:border-rose-400/50"
                  style={{
                    background: 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(190,18,60,0.12))',
                    color: '#fb7185',
                    boxShadow: '0 2px 12px rgba(244,63,94,0.15)',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Records
                </button>

                {/* Inline error (if delete failed) */}
                {deleteError && (
                  <div className="rounded-xl border border-rose-500/30 px-3 py-2.5"
                    style={{ background: 'rgba(244,63,94,0.08)' }}>
                    <p className="text-[11px] text-rose-400 font-bold">{deleteError}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4" style={{ animation: 'slideUp 0.6s ease-out 0.2s both' }}>

            {/* Filters */}
            <div className={`${glassCard} p-5`} style={{ background: glassCardBg }}>
              <div className="h-0.5 w-full rounded-t-2xl -mt-5 mb-5 rounded-t-2xl"
                style={{ background: 'linear-gradient(90deg, #6366f1, #3b82f688)' }} />
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <FieldLabel>Project</FieldLabel>
                  <div className="relative">
                    <select className={selectClass} value={projectId}
                      onChange={(e) => setParams(e.target.value ? { project: e.target.value } : {})}>
                      <option value="">— Select project —</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div>
                  <FieldLabel>From</FieldLabel>
                  <input type="date" className={inputClass} value={filters.from}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
                </div>
                <div>
                  <FieldLabel>To</FieldLabel>
                  <input type="date" className={inputClass} value={filters.to}
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
                </div>
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <div className="relative">
                    <select className={selectClass} value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                      <option value="">All</option>
                      <option>Completed</option>
                      <option>Pending</option>
                      <option>Overdue</option>
                    </select>
                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {!report && !projectId && (
              <div className={`${glassCard} p-12 flex flex-col items-center justify-center gap-3 text-center`} style={{ background: glassCardBg }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5">
                  <svg className="w-6 h-6 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-white/30 text-sm font-bold">Select a project to generate its report</p>
              </div>
            )}

            {report && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { label: 'Inspections',  value: report.summary.total_inspections,       color: '#3b82f6' },
                    { label: 'Violations',   value: report.summary.total_violations,        color: '#f43f5e' },
                    { label: 'Acknowledged', value: report.summary.acknowledged_violations, color: '#10b981' },
                    { label: 'Compliance %', value: `${analytics?.compliancePct ?? 0}%`,    color: '#6366f1' },
                    { label: 'Manpower',     value: analytics?.totalManpower ?? 0,          color: '#f59e0b' },
                    { label: 'Photos',       value: analytics?.totalPhotos ?? 0,            color: '#64748b' },
                  ].map((kpi) => <KpiCard key={kpi.label} {...kpi} />)}
                </div>

                {/* Project Info */}
                <SectionCard title="Project Information" tone="blue">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <KV k="Project Name"          v={report.project.name} />
                    <KV k="Reference"             v={`${report.project.year || ''} \u2014 ${report.project.ref_number || ''}`} />
                    <KV k="Location"              v={report.project.location_name || report.project.location_id} />
                    <KV k="Status"                v={<Pill value={report.project.project_status}>{report.project.project_status}</Pill>} />
                    <KV k="Contractor"            v={report.project.contractor} />
                    <KV k="Person-In-Charge"      v={report.project.person_in_charge} />
                    <KV k="Mode of Procurement"   v={report.project.mode_of_procurement} />
                    <KV k="Funding Source"        v={report.project.funding_source} />
                    <KV k="Duration"              v={report.project.duration} />
                    <KV k="Date of Start"         v={d(report.project.start_date)} />
                    <KV k="Target Completion"     v={d(report.project.target_completion_date)} />
                    <KV k="Revised Expiry"        v={d(report.project.revised_expiry_date)} />
                    <KV k="Approved Budget (ABC)" v={peso(report.project.approved_budget)} />
                    <KV k="Contract Amount"       v={peso(report.project.contract_amount)} />
                    <KV k="Variation Orders"      v={peso(report.project.variation_orders)} />
                    <KV k="Revised Contract Amt"  v={peso(report.project.revised_contract_amount)} />
                  </div>

                  {report.project.approved_budget && report.project.contract_amount && (
                    <div className="mt-5 pt-4 border-t border-white/8">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Contract vs ABC</span>
                        <span className={`text-[10px] font-black ${
                          Number(report.project.contract_amount) > Number(report.project.approved_budget) ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {Number(report.project.approved_budget) > 0
                            ? `${Math.round((Number(report.project.contract_amount) / Number(report.project.approved_budget)) * 100)}%`
                            : '\u2014'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min((Number(report.project.contract_amount) / Number(report.project.approved_budget)) * 100, 100)}%`,
                            background: Number(report.project.contract_amount) > Number(report.project.approved_budget)
                              ? 'linear-gradient(90deg, #f43f5e, #fb7185)'
                              : 'linear-gradient(90deg, #10b981, #34d399)',
                          }} />
                      </div>
                      <div className="flex justify-between mt-1.5 text-[9px] text-white/25 font-bold">
                        <span>\u20B10</span>
                        <span>ABC: {peso(report.project.approved_budget)}</span>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* Analytics grids */}
                {analytics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SectionCard title="Compliance Distribution">
                      <TableSimple headers={['Status', 'Count']}
                        rows={Object.entries(analytics.complianceCount).map(([k, v]) => [<Pill value={k}>{k}</Pill>, v])} />
                    </SectionCard>
                    <SectionCard title="Overall Assessments">
                      <TableSimple headers={['Assessment', 'Count']}
                        rows={Object.entries(analytics.assessmentCount).map(([k, v]) => [<Pill value={k}>{k}</Pill>, v])} />
                    </SectionCard>
                    <SectionCard title="Risk Level Breakdown" tone="red">
                      <TableSimple headers={['Risk Level', 'Count']}
                        rows={Object.entries(analytics.riskByLevel).map(([k, v]) => [<Pill value={k}>{k}</Pill>, v])} />
                    </SectionCard>
                    <SectionCard title="Environmental Status" tone="green">
                      <TableSimple headers={['Status', 'Count']}
                        rows={Object.entries(analytics.envByStatus).map(([k, v]) => [<Pill value={k}>{k}</Pill>, v])} />
                    </SectionCard>
                    <SectionCard title="Equipment Condition">
                      <TableSimple headers={['Condition', 'Count']}
                        rows={Object.entries(analytics.equipmentByCondition).map(([k, v]) => [<Pill value={k}>{k}</Pill>, v])} />
                    </SectionCard>
                    <SectionCard title="Manpower by Category">
                      <TableSimple headers={['Category', 'Total']}
                        rows={Object.entries(analytics.manpowerBreakdown).map(([k, v]) => [k, v])} />
                    </SectionCard>
                    <SectionCard title="Activities Logged" tone="amber">
                      <TableSimple headers={['Activity', '# Inspections']}
                        rows={Object.entries(analytics.activityCount).map(([k, v]) => [k, v])} />
                    </SectionCard>
                    <SectionCard title="Weather Frequency">
                      <TableSimple headers={['Weather', 'Count']}
                        rows={Object.entries(analytics.weatherCount).map(([k, v]) => [k, v])} />
                    </SectionCard>
                  </div>
                )}

                {/* Inspection History / Detail */}
                {view === 'summary' ? (
                  <SectionCard title="Inspection History">
                    <TableSimple
                      headers={['#', 'Date', 'Inspector', 'Weather', 'Cleanliness', 'Compliance', 'Assessment', 'Status', 'Photos', 'Viol.']}
                      rows={report.inspections.map((i, idx) => [
                        <span className="text-white/40 font-black">{idx + 1}</span>,
                        dt(i.inspection_datetime),
                        i.inspector_name,
                        i.weather,
                        <Pill value={i.site_cleanliness}>{i.site_cleanliness}</Pill>,
                        <Pill value={i.compliance_status}>{i.compliance_status}</Pill>,
                        <Pill value={i.overall_assessment}>{i.overall_assessment}</Pill>,
                        <Pill value={i.status}>{i.status}</Pill>,
                        i.photos.length,
                        i.violations.length,
                      ])}
                    />
                  </SectionCard>
                ) : (
                  <div className="space-y-4" style={{ animation: 'slideDown 0.25s ease-out' }}>
                    {report.inspections.map((i, idx) => {
                      const open = openId === i.id;
                      return (
                        <div key={i.id} className={`${glassCard} overflow-hidden`} style={{ background: glassCardBg }}>
                          <div className="h-0.5 w-full"
                            style={{ background: open ? 'linear-gradient(90deg, #6366f1, #3b82f6)' : 'linear-gradient(90deg, #6366f133, #3b82f622)' }} />
                          <div className="p-5">
                            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">#{idx + 1}</span>
                                <span className="text-sm font-black text-white/80">{dt(i.inspection_datetime)}</span>
                                <Pill value={i.compliance_status}>{i.compliance_status}</Pill>
                                <Pill value={i.overall_assessment}>{i.overall_assessment}</Pill>
                                <Pill value={i.status}>{i.status}</Pill>
                              </div>
                              <button
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:border-white/25 transition-all text-[10px] font-black uppercase tracking-widest"
                                onClick={() => setOpenId(open ? null : i.id)}>
                                {open ? 'Collapse' : 'Expand'}
                                <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                              <KV k="Inspector"        v={i.inspector_name} />
                              <KV k="Weather"          v={`${i.weather}${i.weather_other ? ' \u00B7 ' + i.weather_other : ''}`} />
                              <KV k="Site Cleanliness" v={<Pill value={i.site_cleanliness}>{i.site_cleanliness}</Pill>} />
                              <KV k="Manpower Total"   v={(i.manpower || []).reduce((s, m) => s + Number(m.count || 0), 0)} />
                            </div>

                            {i.compliance_remarks && (
                              <div className="rounded-xl border border-amber-400/20 px-4 py-3 mb-3"
                                style={{ background: 'rgba(245,158,11,0.07)' }}>
                                <p className="text-[9px] font-black text-amber-400/70 uppercase tracking-widest mb-1">Compliance Remarks</p>
                                <p className="text-xs text-white/60 font-medium">{i.compliance_remarks}</p>
                              </div>
                            )}

                            {open && (
                              <div className="space-y-3 pt-2" style={{ animation: 'slideDown 0.25s ease-out' }}>
                                <SectionCard title="Site Activities" tone="default">
                                  <div className="flex flex-wrap gap-2">
                                    {(i.activities || []).length === 0
                                      ? <span className="text-white/25 text-xs font-bold">— None —</span>
                                      : i.activities.map((a) => (
                                          <span key={a.id} className="px-2.5 py-1 rounded-lg bg-white/6 border border-white/10 text-[11px] text-white/60 font-bold">{a.activity_name}</span>
                                        ))}
                                  </div>
                                </SectionCard>
                                <SectionCard title="Manpower">
                                  <TableSimple headers={['Category', 'Count']}
                                    rows={(i.manpower || []).map((m) => [m.category, m.count])} />
                                </SectionCard>
                                <SectionCard title="Equipment & Machinery">
                                  <TableSimple headers={['Condition', 'Remarks']}
                                    rows={(i.equipment || []).map((e) => [<Pill value={e.condition}>{e.condition}</Pill>, e.remarks || '\u2014'])} />
                                </SectionCard>
                                <SectionCard title="Safety & Health — General" tone="red">
                                  <TableSimple headers={['Item', 'Status', 'Remarks']}
                                    rows={(i.safety_general || []).map((s) => [s.item, <Pill value={s.status}>{s.status}</Pill>, s.remarks || '\u2014'])} />
                                </SectionCard>
                                <SectionCard title="High-Risk Areas" tone="red">
                                  <TableSimple headers={['Risk Type', 'Level', 'Measures']}
                                    rows={(i.safety_risk || []).map((s) => [s.risk_type, <Pill value={s.risk_level}>{s.risk_level}</Pill>, s.measures || '\u2014'])} />
                                </SectionCard>
                                <SectionCard title="Environmental & Health Control" tone="green">
                                  <TableSimple headers={['Item', 'Status', 'Remarks']}
                                    rows={(i.environmental || []).map((s) => [s.item, <Pill value={s.status}>{s.status}</Pill>, s.remarks || '\u2014'])} />
                                </SectionCard>
                                {(i.photos || []).length > 0 && (
                                  <SectionCard title={`Photo Documentation (${i.photos.length})`}>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                      {i.photos.map((ph) => (
                                        <a key={ph.id} href={ph.file_path} target="_blank" rel="noreferrer" className="block">
                                          <img src={ph.file_path} alt="" className="w-full h-24 object-cover rounded-xl border border-white/10 hover:border-white/30 hover:opacity-90 transition-all" />
                                        </a>
                                      ))}
                                    </div>
                                  </SectionCard>
                                )}
                              </div>
                            )}

                            {(i.violations || []).length > 0 && (
                              <div className="mt-3 space-y-2">
                                <p className="text-[9px] font-black text-rose-400/70 uppercase tracking-widest">
                                  {i.violations.length} Violation{i.violations.length > 1 ? 's' : ''} Recorded
                                </p>
                                {i.violations.map((v) => (
                                  <div key={v.id} className="rounded-xl border border-rose-500/25 px-4 py-3"
                                    style={{ background: 'rgba(244,63,94,0.07)' }}>
                                    <div className="text-xs font-bold text-white/70 mb-1"><span className="text-white/35">Description: </span>{v.description}</div>
                                    <div className="text-xs font-bold text-white/70 mb-1"><span className="text-white/35">Corrective Action: </span>{v.corrective_action}</div>
                                    {v.contractor_remarks && (
                                      <div className="text-xs font-bold text-white/70 mb-1"><span className="text-white/35">Contractor Remarks: </span>{v.contractor_remarks}</div>
                                    )}
                                    <div className="flex items-center gap-3 mt-2">
                                      <Pill value={v.acknowledged ? 'Acknowledged' : 'Pending'}>
                                        {v.acknowledged ? `Acknowledged${v.acknowledged_at ? ' \u00B7 ' + dt(v.acknowledged_at) : ''}` : 'Pending Acknowledgement'}
                                      </Pill>
                                      <span className="text-[10px] text-white/25 font-bold">Logged: {dt(v.created_at)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}