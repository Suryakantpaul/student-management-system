// utils/exportExcel.js
// Handles Excel (.xlsx) export using the SheetJS (xlsx) library.

import * as XLSX from 'xlsx';

/**
 * Exports an array of student objects to a .xlsx file and triggers a download.
 *
 * @param {Array}  students  - Array of student objects to export
 * @param {string} filename  - Output file name (default: 'students.xlsx')
 */
export const exportToExcel = (students, filename = 'students.xlsx') => {
  // 1. Map data to a clean row format (omit internal id if desired, or keep it)
  const rows = students.map((s, index) => ({
    '#':    index + 1,
    Name:   s.name,
    Email:  s.email,
    Age:    s.age,
  }));

  // 2. Convert the rows array to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // 3. Set column widths for readability
  worksheet['!cols'] = [
    { wch: 5  },   // #
    { wch: 24 },   // Name
    { wch: 32 },   // Email
    { wch: 8  },   // Age
  ];

  // 4. Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

  // 5. Trigger browser download
  XLSX.writeFile(workbook, filename);
};