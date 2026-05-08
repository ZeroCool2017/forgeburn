/**
 * Export loan + transaction data as a CSV spreadsheet download.
 */

function toCSV(headers, rows) {
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const str = String(v);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.map(escape).join(',')];
  rows.forEach(row => lines.push(row.map(escape).join(',')));
  return lines.join('\n');
}

function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAllData(loans, transactions) {
  const date = new Date().toISOString().slice(0, 10);

  // Sheet 1: Loans
  const loanHeaders = [
    'Name', 'Category', 'Current Balance', 'Original Balance',
    'Interest Rate (%)', 'Minimum Payment', 'Due Date', 'Extra Payment',
    'Progress (%)', 'Created Date'
  ];
  const loanRows = loans.map(l => {
    const original = l.original_balance || l.current_balance;
    const progress = original > 0 ? ((1 - l.current_balance / original) * 100).toFixed(1) : '0';
    return [
      l.name,
      l.category || '',
      l.current_balance,
      original,
      l.interest_rate,
      l.minimum_payment,
      l.due_date || '',
      l.extra_payment || 0,
      progress,
      l.created_date ? l.created_date.slice(0, 10) : '',
    ];
  });

  // Sheet 2: Transactions
  const txHeaders = ['Date', 'Description', 'Amount', 'Notes', 'Habit ID', 'Created Date'];
  const txRows = transactions.map(t => [
    t.date || '',
    t.description || '',
    t.amount,
    t.notes || '',
    t.habit_id || '',
    t.created_date ? t.created_date.slice(0, 10) : '',
  ]);

  // Combine into one CSV with section headers
  const combined = [
    '=== LOANS ===',
    toCSV(loanHeaders, loanRows),
    '',
    '=== TRANSACTIONS ===',
    toCSV(txHeaders, txRows),
  ].join('\n');

  downloadCSV(`carry-the-zero-export-${date}.csv`, combined);
}