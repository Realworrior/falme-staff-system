/**
 * Export Utility for Rota Module
 * Provides logic for print-optimized views and schedule exports.
 */

export const triggerPrint = () => {
  // We can add logic here to prepare the document for printing if needed,
  // but for now, it triggers the browser's print dialog.
  // The CSS in App.tsx (print: classes) handles the layout.
  window.print();
};

export const exportToCSV = (schedule: any[]) => {
  const headers = ['Date', 'Shift Type', 'Staff Members'];
  const rows = schedule.flatMap(day => {
    const date = day.date.toLocaleDateString();
    return [
      [date, 'AM', day.shifts.AM.join('; ')],
      [date, 'PM', day.shifts.PM.join('; ')],
      [date, 'NT', day.shifts.NT.join('; ')]
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `rota_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
