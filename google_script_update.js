/**
 * تكامل 26 - Google Apps Script Backend (نسخة مطورة)
 * 
 * نسخ هذا الكود بالكامل إلى Apps Script واعمل Deploy جديد (New Version).
 * يجب الموافقة على صلاحيات Gmail و Drive عند أول تشغيل.
 */

function doPost(e) {
  var sheetId = '1aAWEDifOhgpQlsU6a4TMm0Lca-2Gp1XYyURNjzvwQx4';
  var adminEmail = 'ahmed.eltaweel.actuary@gmail.com, eltaweel.actuary@gmail.com';

  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheets()[0];

    // === رفع المستندات إلى Google Drive ===
    var driveFolder = getOrCreateFolder('Takamol26 - طلبات التأمين');
    var clientName = data['customerName'] || data['اسم العميل'] || 'عميل';
    var clientFolder = getOrCreateFolder(clientName + ' - ' + new Date().toLocaleDateString('ar-EG'), driveFolder);

    var docFields = ['nationalIdDoc', 'carLicenseDoc', 'carRegistrationDoc', 'commercialRegDoc', 'extraDoc'];
    docFields.forEach(function(field) {
      if (data[field] && data[field + '_type'] && data[field + '_name']) {
        try {
          var decoded = Utilities.base64Decode(data[field]);
          var blob = Utilities.newBlob(decoded, data[field + '_type'], data[field + '_name']);
          var file = clientFolder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          // حفظ الرابط بدلاً من البيانات الخام
          data[field + '_link'] = file.getUrl();
        } catch(err) {
          data[field + '_link'] = 'خطأ في الرفع: ' + err.message;
        }
        // حذف البيانات الخام الضخمة
        delete data[field];
        delete data[field + '_type'];
        delete data[field + '_name'];
      }
    });

    // === الأعمدة الأساسية ===
    var HEADERS = [
      'Timestamp', 'نوع العميل', 'اسم العميل', 'الرقم القومي/السجل التجاري',
      'رقم الهاتف', 'البريد الإلكتروني', 'الشكل القانوني للشركة',
      'نوع التأمين', 'ماركة السيارة', 'الموديل وسنة الصنع', 'قيمة السيارة',
      'تاريخ الميلاد', 'أمراض مزمنة', 'عدد الموظفين', 'نسبة الجنس',
      'رابط البطاقة الوطنية', 'رابط رخصة السيارة', 'رابط استمارة السيارة',
      'رابط السجل التجاري', 'رابط مستند إضافي', 'تفاصيل إضافية'
    ];

    // إنشاء العناوين إذا كان الشيت فارغاً
    var firstCell = sheet.getRange(1, 1).getValue();
    if (firstCell === '') {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.setFrozenRows(1);
    }

    // === ربط البيانات بالأعمدة ===
    var row = [
      new Date(),
      data['userType'] || '',
      data['customerName'] || '',
      data['customerID'] || '',
      data['phone'] || '',
      data['email'] || '',
      data['legalForm'] || '',
      data['insuranceType'] || '',
      data['carMake'] || '',
      data['carModel'] || '',
      data['carValue'] || '',
      data['customerDob'] || data['lifeDob'] || '',
      data['chronicDiseases'] || '',
      data['employeeCount'] || '',
      data['genderRatio'] || '',
      data['nationalIdDoc_link'] || '',
      data['carLicenseDoc_link'] || '',
      data['carRegistrationDoc_link'] || '',
      data['commercialRegDoc_link'] || '',
      data['extraDoc_link'] || '',
      data['extraDetails'] || ''
    ];

    sheet.appendRow(row);

    // === إرسال الإيميل ===
    var subject = '🔔 طلب تأمين جديد: ' + (data['customerName'] || 'عميل') + ' - تكامل 26';
    var body = 'مرحباً أحمد،\n\nوصل طلب تأمين جديد. إليك التفاصيل:\n\n';
    body += '=====================================\n';

    var labels = {
      userType: 'نوع العميل', customerName: 'اسم العميل', customerID: 'الرقم القومي/السجل',
      phone: 'رقم الهاتف', email: 'البريد الإلكتروني', legalForm: 'الشكل القانوني',
      insuranceType: 'نوع التأمين', carMake: 'ماركة السيارة', carModel: 'الموديل/السنة',
      carValue: 'قيمة السيارة', customerDob: 'تاريخ الميلاد', lifeDob: 'تاريخ الميلاد',
      chronicDiseases: 'أمراض مزمنة', employeeCount: 'عدد الموظفين',
      extraDetails: 'تفاصيل إضافية',
      nationalIdDoc_link: '📎 رابط البطاقة الوطنية',
      carLicenseDoc_link: '📎 رابط رخصة السيارة',
      carRegistrationDoc_link: '📎 رابط استمارة السيارة',
      commercialRegDoc_link: '📎 رابط السجل التجاري',
      extraDoc_link: '📎 رابط مستند إضافي'
    };

    Object.keys(data).forEach(function(key) {
      if (data[key] && data[key].toString().trim() !== '') {
        body += '🔸 ' + (labels[key] || key) + ':\n' + data[key] + '\n\n';
      }
    });

    body += '=====================================\n';
    body += 'تم حفظ البيانات في الشيت تلقائياً.';

    GmailApp.sendEmail(adminEmail, subject, body);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// دالة مساعدة لإنشاء مجلد في Drive
function getOrCreateFolder(name, parent) {
  var search = parent 
    ? parent.getFoldersByName(name) 
    : DriveApp.getFoldersByName(name);
  if (search.hasNext()) return search.next();
  return parent ? parent.createFolder(name) : DriveApp.createFolder(name);
}

// دالة الاختبار - شغّلها أولاً لتفعيل الصلاحيات
function testSetup() {
  DriveApp.getRootFolder(); // تفعيل صلاحية Drive
  var adminEmail = 'ahmed.eltaweel.actuary@gmail.com, eltaweel.actuary@gmail.com';
  GmailApp.sendEmail(adminEmail, 'اختبار تكامل 26 ✅', 'النظام يعمل بشكل صحيح! صلاحيات Gmail و Drive مفعّلة.');
  Logger.log('تم الاختبار بنجاح!');
}
