/**
 * Takamol26 Backend - Google Apps Script
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0];
    
    // 1. Prepare Headers (Will be created only if row 1 is empty or doesn't match)
    const HEADERS = [
      "Timestamp", 
      "User Type", 
      "Customer Name", 
      "ID / Commercial Reg", 
      "Phone", 
      "Email", 
      "Legal Form",
      "Insurance Type",
      "Car Make",
      "Car Model/Year",
      "Car Value",
      "Customer DOB",
      "Chronic Diseases",
      "Employee Count",
      "Gender Ratio",
      "Extra Details"
    ];

    const currentHeader = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    if (currentHeader[0] === "") {
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
        sheet.setFrozenRows(1);
    }

    // 2. Map Data to Row
    const row = [
      data.timestamp || new Date(),
      data.userType || "",
      data.customerName || "",
      data.customerID || "",
      data.phone || "",
      data.email || "",
      data.legalForm || "",
      data.insuranceType || "",
      data.carMake || "",
      data.carModel || "",
      data.carValue || "",
      data.customerDob || "",
      data.chronicDiseases || "",
      data.employeeCount || "",
      data.genderRatio || "",
      data.extraDetails || ""
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
    
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
