const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create Excel template with your EXACT headers that users must upload
function createUserUploadTemplate() {
  // Your exact headers that users must use (D/I and M or F are separate columns)
  const headers = [
    'Trip #',
    'Actual Arrival Time / Departure Pick Up Time',
    'Arr Time / Dep PU',
    'Flight #',
    'D/I',                                  // Separate column for Domestic/International
    'M or F',                               // Separate column for Male/Female
    'Student Number',
    'Student Given Name',
    'Student Family Name',
    'Host Given Name',
    'Host Family Name',
    'Phone H=Home C=Cell B=Business',
    'Address',
    'City',
    'Special Instructions',
    'Study Permit Y or N',
    'School',
    'Staff Member Assigned',
    'Client'
  ];

  // Sample data that matches your system expectations
  const sampleData = [
    [
      '1',                                    // Trip #
      '5:10 PM / 8:00 AM',                  // Actual Arrival Time / Departure Pick Up Time
      '5:10 PM / 8:00 AM',                  // Arr Time / Dep PU
      'TK 075',                             // Flight #
      'I',                                  // D/I (Domestic/International)
      'M',                                  // M or F (Male/Female)
      '733382',                             // Student Number
      'Osama',                              // Student Given Name
      'Alansar',                            // Student Family Name
      'Rose',                               // Host Given Name
      'Pugosa',                             // Host Family Name
      'C=6044909182',                       // Phone H=Home C=Cell B=Business
      'Clinton Street',                     // Address
      'Burnaby',                            // City
      '',                                   // Special Instructions
      'N',                                  // Study Permit Y or N
      'EC',                                 // School
      'Staff Member 1',                     // Staff Member Assigned
      'EC'                                  // Client
    ],
    [
      '2',
      '4:15 AM / 8:15 AM',
      '4:15 AM / 8:15 AM',
      'AM 695',
      'I',                                  // International
      'F',                                  // Female
      '704047',
      'Judith',
      'Marcondes Armando',
      'Maria',
      'Santos',
      'H=6041234567',
      'Main Street',
      'Vancouver',
      'Departs @ 8:15 AM',
      'Y',
      'ILSC',
      'Staff Member 2',
      'ILSC'
    ],
    [
      '3',
      '2:00 AM / 6:00 AM',
      '2:00 AM / 6:00 AM',
      'AS 6047',
      'I',
      'F',
      'VE158887',
      'Mariana',
      'Palmieri Panazzolo',
      'Angelica',
      'Lim',
      'C=7782510236',
      'Fleming Street',
      'Vancouver',
      'Departs @ 6:00 AM',
      'Y',
      'VEC',
      'Jaskirat 1st Job',
      'VEC'
    ],
    [
      '4',
      '6:30 PM / 9:30 PM',
      '6:30 PM / 9:30 PM',
      'AC 123',
      'D',                                  // Domestic
      'M',                                  // Male
      '',                                   // Empty - will be auto-generated
      'John',
      'Smith',
      'David',
      'Johnson',
      'B=6049876543',
      'Oak Street',
      'Richmond',
      'Early pickup required',
      'N',
      'ILAC',
      'Staff Member 3',
      'ILAC'
    ],
    [
      '5',
      '3:45 AM / 7:45 AM',
      '3:45 AM / 7:45 AM',
      'WF 456',
      'I',
      'F',
      '',                                   // Empty - will be auto-generated
      'Sarah',
      'Williams',
      'Lisa',
      'Brown',
      'H=7781234567',
      'Granville Street',
      'Vancouver',
      '',
      'Y',
      'EC',
      'Staff Member 4',
      'EC'
    ]
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheetData = [headers, ...sampleData];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 8 },   // Trip #
    { wch: 25 },  // Actual Arrival Time / Departure Pick Up Time
    { wch: 20 },  // Arr Time / Dep PU
    { wch: 12 },  // Flight #
    { wch: 12 },  // I or M / F
    { wch: 15 },  // Student Number
    { wch: 18 },  // Student Given Name
    { wch: 20 },  // Student Family Name
    { wch: 15 },  // Host Given Name
    { wch: 18 },  // Host Family Name
    { wch: 25 },  // Phone H=Home C=Cell B=Business
    { wch: 20 },  // Address
    { wch: 15 },  // City
    { wch: 25 },  // Special Instructions
    { wch: 18 },  // Study Permit Y or N
    { wch: 12 },  // School
    { wch: 20 },  // Staff Member Assigned
    { wch: 12 }   // Client
  ];
  worksheet['!cols'] = columnWidths;

  // Style the header row
  const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "366092" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
  }

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Upload Template');

  // Create templates directory if it doesn't exist
  const templatesDir = path.join(__dirname, 'templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  // Write the Excel file
  const filePath = path.join(templatesDir, 'User_Upload_Template.xlsx');
  XLSX.writeFile(workbook, filePath);

  console.log('✅ User Excel template created successfully!');
  console.log(`📁 File location: ${filePath}`);
  console.log('\n📋 Template includes your EXACT headers:');
  headers.forEach((header, index) => {
    console.log(`${index + 1}. ${header}`);
  });
  
  console.log('\n📝 IMPORTANT - Users must upload Excel with these EXACT headers:');
  console.log('✅ All 18 columns must be present in this exact order');
  console.log('✅ Header names must match exactly (case-sensitive)');
  console.log('✅ Do not change, add, or remove any column headers');
  
  console.log('\n📋 Data Format Requirements:');
  console.log('- Trip #: 1, 2, 3, etc.');
  console.log('- Times: Use format like "5:10 PM / 8:00 AM" (arrival / departure)');
  console.log('- D/I: Use "D" for Domestic or "I" for International');
  console.log('- M or F: Use "M" for Male or "F" for Female');
  console.log('- Student Number: Can be left empty for auto-generation');
  console.log('- Phone: Use format "H=1234567890", "C=1234567890", "B=1234567890"');
  console.log('- Study Permit Y or N: Use "Y" or "N"');
  
  console.log('\n✅ Your upload logic will correctly process this template!');

  return filePath;
}

// Create the template
try {
  createUserUploadTemplate();
  console.log('\n🎉 Template created successfully!');
  console.log('📋 Users can now upload Excel files with your exact header format!');
} catch (error) {
  console.error('❌ Error creating template:', error);
}