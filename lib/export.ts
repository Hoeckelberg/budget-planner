/**
 * Export utilities — CSV and plain text report generation
 * No external dependencies required.
 */

export interface ExportTransaction {
    date: string;
    description: string;
    category: string;
    type: 'income' | 'expense';
    amount: number;
}

export interface ExportSummary {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    period: string;
}

// ─── CSV Generation ───────────────────────────────────────────────────────────
export function generateCSV(transactions: ExportTransaction[]): string {
    const header = 'Datum;Beschreibung;Kategorie;Typ;Betrag (EUR)';
    const rows = transactions.map(t => {
        const sign = t.type === 'expense' ? '-' : '+';
        return [
            t.date,
            `"${t.description.replace(/"/g, '""')}"`,
            `"${t.category.replace(/"/g, '""')}"`,
            t.type === 'income' ? 'Einnahme' : 'Ausgabe',
            `${sign}${t.amount.toFixed(2).replace('.', ',')}`,
        ].join(';');
    });

    return [header, ...rows].join('\n');
}

// ─── HTML Report (for expo-print) ────────────────────────────────────────────
export function generateHTMLReport(
    transactions: ExportTransaction[],
    summary: ExportSummary
): string {
    const rows = transactions.map(t => {
        const sign = t.type === 'expense' ? '-' : '+';
        const color = t.type === 'expense' ? '#FF3B30' : '#34C759';
        return `
            <tr>
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td style="color:${color}; font-weight:600">
                    ${sign}€${t.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </td>
            </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Budget Bericht — ${summary.period}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f2f2f7; color: #1c1c1e; font-size: 14px; }
    .header { background: linear-gradient(135deg, #007AFF, #5856D6); color: white; padding: 32px 24px; }
    .header h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin-top: 4px; opacity: 0.8; }
    .summary { display: flex; gap: 16px; padding: 20px 24px; }
    .summary-card { flex: 1; background: white; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .summary-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #8e8e93; margin-bottom: 4px; }
    .summary-value { font-size: 22px; font-weight: 700; }
    .income { color: #34C759; } .expense { color: #FF3B30; } .savings { color: #007AFF; }
    table { width: 100%; border-collapse: collapse; margin: 0 24px; width: calc(100% - 48px); }
    th { background: white; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #8e8e93; padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e5ea; }
    td { padding: 10px 12px; border-bottom: 1px solid #f2f2f7; background: white; }
    tr:last-child td { border-bottom: none; }
    .footer { text-align: center; padding: 24px; color: #8e8e93; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Budget Planner</h1>
    <p>Finanzbericht · ${summary.period}</p>
  </div>
  <div class="summary">
    <div class="summary-card">
      <div class="summary-label">Einnahmen</div>
      <div class="summary-value income">€${summary.totalIncome.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Ausgaben</div>
      <div class="summary-value expense">€${summary.totalExpenses.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Gespart</div>
      <div class="summary-value savings">€${summary.netSavings.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Datum</th><th>Beschreibung</th><th>Kategorie</th><th>Betrag</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Budget Planner App · Erstellt am ${new Date().toLocaleDateString('de-DE')}</div>
</body>
</html>`;
}
