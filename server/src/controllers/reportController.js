// controllers/reportController.js
const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const { createObjectCsvWriter } = require('csv-writer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// إنشاء مجلد التصدير
const exportsDir = path.join(__dirname, '..', 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// وظيفة مساعدة لإنشاء ملف Excel مع تنسيق محسّن
const createExcelFile = async (data, columns, fileName, sheetName = 'تقرير') => {
  try {
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);
    
    // إعداد الأعمدة
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 25
    }));

    // تنسيق رأس الجدول
    const headerRow = worksheet.getRow(1);
    headerRow.font = { 
      bold: true, 
      color: { argb: 'FFFFFF' },
      size: 12
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '2E5BFF' }
    };
    headerRow.alignment = { 
      vertical: 'middle', 
      horizontal: 'center',
      wrapText: true
    };
    headerRow.height = 30;

    // إضافة البيانات
    data.forEach((item, index) => {
      const row = worksheet.addRow(item);
      
      // تنسيق الصفوف
      row.alignment = { 
        vertical: 'middle', 
        horizontal: 'right',
        wrapText: true 
      };
      row.height = 25;
      
      // تلوين الصفوف الزوجية
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8F9FA' }
        };
      }
      
      // تنسيق خلايا التاريخ والأرقام
      row.eachCell((cell, colNumber) => {
        if (cell.value instanceof Date) {
          cell.numFmt = 'yyyy-mm-dd';
        } else if (typeof cell.value === 'number' && !columns[colNumber - 1]?.key.includes('sira')) {
          cell.numFmt = '#,##0.00';
        }
      });
    });

    // تجميد الصف الأول
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    
    // ضبط تلقائي للعرض
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, 10), 50);
    });

    // حفظ الملف
    const filePath = path.join(exportsDir, `${fileName}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  } catch (error) {
    console.error('خطأ في إنشاء ملف Excel:', error);
    throw error;
  }
};

// تصدير المواعيد حسب البيانات الفعلية
exports.exportAppointmentsExcel = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};

    // تصفية التاريخ
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: start, $lte: end };
    } else if (startDate) {
      const start = new Date(startDate);
      query.appointmentDate = { $gte: start };
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.appointmentDate = { $lte: end };
    }

    // تصفية الحالة
    if (status && status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate("patientId", "patientName phoneNumber birthDate gender")
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .lean();

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على مواعيد تطابق هذه المعايير"
      });
    }

    // تنسيق البيانات الفعلية من الموديل
    const excelData = appointments.map((apt, index) => {
      const patient = apt.patientId || {};
      
      // حساب العمر من تاريخ الميلاد إذا كان موجوداً
      let age = '';
      if (patient.birthDate) {
        const birthDate = new Date(patient.birthDate);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      return {
        sira: index + 1,
        patientName: apt.patientName || patient.patientName || '',
        phoneNumber: apt.phoneNumber || patient.phoneNumber || '',
        gender: patient.gender === 'male' ? 'ذكر' : patient.gender === 'female' ? 'أنثى' : 'غير محدد',
        age: age || '',
        appointmentDate: apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('ar-SA') : '',
        appointmentTime: apt.appointmentTime || '',
        status: apt.status === 'pending' ? 'قيد الانتظار' : 
                apt.status === 'confirmed' ? 'مؤكد' : 
                apt.status === 'cancelled' ? 'ملغي' : '',
        notes: apt.notes || '',
        createdAt: apt.createdAt ? new Date(apt.createdAt).toLocaleDateString('ar-SA') : '',
        updatedAt: apt.updatedAt ? new Date(apt.updatedAt).toLocaleDateString('ar-SA') : ''
      };
    });

    // أعمدة Excel محسنة
    const columns = [
      { header: 'رقم', key: 'sira', width: 8 },
      { header: 'اسم المريض', key: 'patientName', width: 30 },
      { header: 'رقم الهاتف', key: 'phoneNumber', width: 20 },
      { header: 'الجنس', key: 'gender', width: 12 },
      { header: 'العمر', key: 'age', width: 10 },
      { header: 'تاريخ الموعد', key: 'appointmentDate', width: 15 },
      { header: 'وقت الموعد', key: 'appointmentTime', width: 12 },
      { header: 'حالة الموعد', key: 'status', width: 15 },
      { header: 'ملاحظات', key: 'notes', width: 40 },
      { header: 'تاريخ الإنشاء', key: 'createdAt', width: 15 },
      { header: 'تاريخ التحديث', key: 'updatedAt', width: 15 }
    ];

    // اسم الملف
    const startDateStr = startDate ? new Date(startDate).toISOString().split('T')[0] : 'الكل';
    const endDateStr = endDate ? new Date(endDate).toISOString().split('T')[0] : 'الكل';
    const statusStr = status === 'pending' ? 'قيد-الانتظار' : 
                     status === 'confirmed' ? 'مؤكد' : 
                     status === 'cancelled' ? 'ملغي' : 'الكل';
    
    const fileName = `تقرير-المواعيد_${startDateStr}_إلى_${endDateStr}_${statusStr}`;

    const filePath = await createExcelFile(excelData, columns, fileName, 'المواعيد');

    // إرسال الملف
    res.download(filePath, `${fileName}.xlsx`, (err) => {
      if (err) {
        console.error('خطأ في إرسال الملف:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: "حدث خطأ أثناء إرسال الملف"
          });
        }
      }
      // تنظيف الملف المؤقت
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (unlinkError) {
          console.error('خطأ في حذف الملف:', unlinkError);
        }
      }, 5000);
    });

  } catch (error) {
    console.error('خطأ في تصدير المواعيد:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء تصدير بيانات المواعيد"
      });
    }
  }
};

// تصدير المرضى حسب البيانات الفعلية
exports.exportPatientsExcel = async (req, res) => {
  try {
    const { gender, minAge, maxAge, registrationDate } = req.query;
    let query = {};

    // تصفية الجنس
    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    // تصفية العمر بناءً على تاريخ الميلاد
    if (minAge || maxAge) {
      const today = new Date();
      if (maxAge) {
        const maxBirthDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
        query.birthDate = { $gte: maxBirthDate };
      }
      if (minAge) {
        const minBirthDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
        if (query.birthDate) {
          query.birthDate.$lte = minBirthDate;
        } else {
          query.birthDate = { $lte: minBirthDate };
        }
      }
    }

    // تصفية تاريخ التسجيل
    if (registrationDate) {
      const date = new Date(registrationDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.createdAt = { $gte: date, $lt: nextDay };
    }

    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .lean();

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على مرضى يطابقون هذه المعايير"
      });
    }

    // تنسيق البيانات الفعلية من موديل المرضى
    const excelData = patients.map((patient, index) => {
      // حساب العمر من تاريخ الميلاد
      let age = '';
      if (patient.birthDate) {
        const birthDate = new Date(patient.birthDate);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      return {
        sira: index + 1,
        patientName: patient.patientName || '',
        phoneNumber: patient.phoneNumber || '',
        birthDate: patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('ar-SA') : '',
        age: age || '',
        gender: patient.gender === 'male' ? 'ذكر' : 'أنثى',
        email: patient.email || '',
        address: patient.address || '',
        emergencyContact: patient.emergencyContact || '',
        medicalHistory: patient.medicalHistory || '',
        allergies: patient.allergies || '',
        medications: patient.medications || '',
        notes: patient.notes || '',
        isActive: patient.isActive ? 'نشط' : 'غير نشط',
        lastVisit: patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('ar-SA') : '',
        appointmentCount: patient.appointmentCount || 0,
        totalVisits: patient.totalVisits || 0,
        createdAt: patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('ar-SA') : '',
        updatedAt: patient.updatedAt ? new Date(patient.updatedAt).toLocaleDateString('ar-SA') : ''
      };
    });

    // أعمدة Excel مفصلة
    const columns = [
      { header: 'رقم', key: 'sira', width: 8 },
      { header: 'اسم المريض', key: 'patientName', width: 30 },
      { header: 'رقم الهاتف', key: 'phoneNumber', width: 20 },
      { header: 'تاريخ الميلاد', key: 'birthDate', width: 15 },
      { header: 'العمر', key: 'age', width: 10 },
      { header: 'الجنس', key: 'gender', width: 10 },
      { header: 'البريد الإلكتروني', key: 'email', width: 25 },
      { header: 'العنوان', key: 'address', width: 35 },
      { header: 'جهة اتصال الطوارئ', key: 'emergencyContact', width: 20 },
      { header: 'التاريخ الطبي', key: 'medicalHistory', width: 40 },
      { header: 'الحساسيات', key: 'allergies', width: 30 },
      { header: 'الأدوية', key: 'medications', width: 30 },
      { header: 'ملاحظات', key: 'notes', width: 40 },
      { header: 'الحالة', key: 'isActive', width: 12 },
      { header: 'آخر زيارة', key: 'lastVisit', width: 15 },
      { header: 'عدد المواعيد', key: 'appointmentCount', width: 15 },
      { header: 'إجمالي الزيارات', key: 'totalVisits', width: 15 },
      { header: 'تاريخ التسجيل', key: 'createdAt', width: 15 },
      { header: 'تاريخ التحديث', key: 'updatedAt', width: 15 }
    ];

    // إنشاء اسم الملف بناءً على الفلاتر
    const filters = [];
    if (gender && gender !== 'all') filters.push(gender === 'male' ? 'ذكر' : 'أنثى');
    if (minAge) filters.push(`من-عمر-${minAge}`);
    if (maxAge) filters.push(`إلى-عمر-${maxAge}`);
    if (registrationDate) filters.push(`تسجيل-${new Date(registrationDate).toISOString().split('T')[0]}`);
    
    const filterText = filters.length > 0 ? `_${filters.join('_')}` : '';
    const fileName = `تقرير-المرضى${filterText}`;

    const filePath = await createExcelFile(excelData, columns, fileName, 'المرضى');

    res.download(filePath, `${fileName}.xlsx`, (err) => {
      if (err) {
        console.error('خطأ في إرسال الملف:', err);
      }
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (unlinkError) {
          console.error('خطأ في حذف الملف:', unlinkError);
        }
      }, 5000);
    });

  } catch (error) {
    console.error('خطأ في تصدير المرضى:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تصدير بيانات المرضى"
    });
  }
};

// تقرير الأداء الشهري المحدث
exports.monthlyPerformanceReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // جلب البيانات الفعلية
    const [appointments, newPatients] = await Promise.all([
      Appointment.find({
        appointmentDate: { $gte: startDate, $lte: endDate }
      }).lean(),
      Patient.find({
        createdAt: { $gte: startDate, $lte: endDate }
      }).lean()
    ]);

    // حساب الإحصائيات
    const stats = {
      totalAppointments: appointments.length,
      confirmedAppointments: appointments.filter(a => a.status === 'confirmed').length,
      cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
      pendingAppointments: appointments.filter(a => a.status === 'pending').length,
      newPatients: newPatients.length,
      uniquePatients: [...new Set(appointments.map(a => a.patientId?.toString()).filter(Boolean))].length
    };

    // التوزيع اليومي
    const dailyStats = [];
    const daysInMonth = endDate.getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(targetYear, targetMonth - 1, day);
      const dayEnd = new Date(targetYear, targetMonth - 1, day, 23, 59, 59);
      
      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= dayStart && aptDate <= dayEnd;
      });

      const dayPatients = newPatients.filter(patient => {
        const createDate = new Date(patient.createdAt);
        return createDate >= dayStart && createDate <= dayEnd;
      });

      dailyStats.push({
        day: day,
        date: dayStart.toLocaleDateString('ar-SA'),
        appointments: dayAppointments.length,
        confirmed: dayAppointments.filter(a => a.status === 'confirmed').length,
        cancelled: dayAppointments.filter(a => a.status === 'cancelled').length,
        pending: dayAppointments.filter(a => a.status === 'pending').length,
        newPatients: dayPatients.length
      });
    }

    // إعداد بيانات Excel
    const excelData = [
      // الإحصائيات الشهرية
      { section: 'الإحصائيات الشهرية', metric: '', value: '' },
      { section: 'إجمالي المواعيد', metric: stats.totalAppointments, value: 'موعد' },
      { section: 'المواعيد المؤكدة', metric: stats.confirmedAppointments, value: `%${stats.totalAppointments > 0 ? ((stats.confirmedAppointments / stats.totalAppointments) * 100).toFixed(1) : 0}` },
      { section: 'المواعيد الملغاة', metric: stats.cancelledAppointments, value: `%${stats.totalAppointments > 0 ? ((stats.cancelledAppointments / stats.totalAppointments) * 100).toFixed(1) : 0}` },
      { section: 'المواعيد المعلقة', metric: stats.pendingAppointments, value: `%${stats.totalAppointments > 0 ? ((stats.pendingAppointments / stats.totalAppointments) * 100).toFixed(1) : 0}` },
      { section: 'مرضى جدد', metric: stats.newPatients, value: 'مريض' },
      { section: 'مرضى فريدين', metric: stats.uniquePatients, value: 'مريض' },
      { section: '', metric: '', value: '' },
      { section: 'التوزيع اليومي', metric: '', value: '' },
      { section: 'التاريخ', metric: 'المواعيد', value: 'التفاصيل' },
      ...dailyStats.map(day => ({
        section: day.date,
        metric: day.appointments,
        value: `مؤكدة: ${day.confirmed}, ملغاة: ${day.cancelled}, معلقة: ${day.pending}, مرضى جدد: ${day.newPatients}`
      }))
    ];

    const columns = [
      { header: 'الفئة', key: 'section', width: 25 },
      { header: 'القيمة', key: 'metric', width: 15 },
      { header: 'النسبة/التوضيح', key: 'value', width: 40 }
    ];

    const fileName = `تقرير-الأداء-الشهري_${targetYear}_${String(targetMonth).padStart(2, '0')}`;
    const filePath = await createExcelFile(excelData, columns, fileName, 'الأداء الشهري');

    res.download(filePath, `${fileName}.xlsx`, (err) => {
      if (err) {
        console.error('خطأ في إرسال الملف:', err);
      }
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (unlinkError) {
          console.error('خطأ في حذف الملف:', unlinkError);
        }
      }, 5000);
    });

  } catch (error) {
    console.error('خطأ في تقرير الأداء الشهري:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء تقرير الأداء الشهري"
    });
  }
};

// تقرير تحليل المرضى المحدث
exports.patientAnalysisReport = async (req, res) => {
  try {
    const patients = await Patient.find().lean();

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على مرضى للتحليل"
      });
    }

    // تحليل البيانات الفعلية
    const analysis = {
      totalPatients: patients.length,
      activePatients: patients.filter(p => p.isActive).length,
      patientsWithAppointments: patients.filter(p => p.appointmentCount > 0).length,
      
      genderDistribution: {
        male: patients.filter(p => p.gender === 'male').length,
        female: patients.filter(p => p.gender === 'female').length
      },
      
      ageGroups: {
        under18: 0,
        age18to30: 0,
        age31to50: 0,
        over50: 0
      },
      
      appointmentFrequency: {
        none: 0,
        low: 0,      // 1-3 مواعيد
        medium: 0,   // 4-10 مواعيد
        high: 0      // أكثر من 10 مواعيد
      },
      
      recentActivity: {
        lastWeek: 0,
        lastMonth: 0,
        last3Months: 0,
        over3Months: 0
      }
    };

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    patients.forEach(patient => {
      // تحليل فئات العمر
      if (patient.birthDate) {
        const birthDate = new Date(patient.birthDate);
        const age = now.getFullYear() - birthDate.getFullYear();
        const monthDiff = now.getMonth() - birthDate.getMonth();
        const adjustedAge = monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate()) ? age - 1 : age;
        
        if (adjustedAge < 18) analysis.ageGroups.under18++;
        else if (adjustedAge <= 30) analysis.ageGroups.age18to30++;
        else if (adjustedAge <= 50) analysis.ageGroups.age31to50++;
        else analysis.ageGroups.over50++;
      }

      // تحليل تواتر المواعيد
      const appCount = patient.appointmentCount || 0;
      if (appCount === 0) analysis.appointmentFrequency.none++;
      else if (appCount <= 3) analysis.appointmentFrequency.low++;
      else if (appCount <= 10) analysis.appointmentFrequency.medium++;
      else analysis.appointmentFrequency.high++;

      // تحليل النشاط الأخير
      if (patient.lastVisit) {
        const lastVisit = new Date(patient.lastVisit);
        if (lastVisit > oneWeekAgo) analysis.recentActivity.lastWeek++;
        else if (lastVisit > oneMonthAgo) analysis.recentActivity.lastMonth++;
        else if (lastVisit > threeMonthsAgo) analysis.recentActivity.last3Months++;
        else analysis.recentActivity.over3Months++;
      } else {
        analysis.recentActivity.over3Months++;
      }
    });

    // إعداد بيانات Excel
    const excelData = [
      // نظرة عامة
      { category: 'نظرة عامة', metric: '', value: '' },
      { category: 'إجمالي المرضى', metric: analysis.totalPatients, value: 'مريض' },
      { category: 'المرضى النشطين', metric: analysis.activePatients, value: `%${((analysis.activePatients / analysis.totalPatients) * 100).toFixed(1)}` },
      { category: 'مرضى لديهم مواعيد', metric: analysis.patientsWithAppointments, value: `%${((analysis.patientsWithAppointments / analysis.totalPatients) * 100).toFixed(1)}` },
      
      { category: '', metric: '', value: '' },
      
      // توزيع الجنس
      { category: 'توزيع الجنس', metric: '', value: '' },
      { category: 'ذكر', metric: analysis.genderDistribution.male, value: `%${((analysis.genderDistribution.male / analysis.totalPatients) * 100).toFixed(1)}` },
      { category: 'أنثى', metric: analysis.genderDistribution.female, value: `%${((analysis.genderDistribution.female / analysis.totalPatients) * 100).toFixed(1)}` },
      
      { category: '', metric: '', value: '' },
      
      // فئات العمر
      { category: 'فئات العمر', metric: '', value: '' },
      { category: 'أقل من 18 سنة', metric: analysis.ageGroups.under18, value: `%${((analysis.ageGroups.under18 / analysis.totalPatients) * 100).toFixed(1)}` },
      { category: '18 - 30 سنة', metric: analysis.ageGroups.age18to30, value: `%${((analysis.ageGroups.age18to30 / analysis.totalPatients) * 100).toFixed(1)}` },
      { category: '31 - 50 سنة', metric: analysis.ageGroups.age31to50, value: `%${((analysis.ageGroups.age31to50 / analysis.totalPatients) * 100).toFixed(1)}` },
      { category: 'أكثر من 50 سنة', metric: analysis.ageGroups.over50, value: `%${((analysis.ageGroups.over50 / analysis.totalPatients) * 100).toFixed(1)}` },
      
      { category: '', metric: '', value: '' },
      
      // تواتر المواعيد
      { category: 'تواتر المواعيد', metric: '', value: '' },
      { category: 'بدون مواعيد', metric: analysis.appointmentFrequency.none, value: `%${((analysis.appointmentFrequency.none / analysis.totalPatients) * 100).toFixed(1)}` },
      { category: 'مواعيد قليلة (1-3)', metric: analysis.appointmentFrequency.low, value: `%${((analysis.appointmentFrequency.low / analysis.totalPatients) * 100).toFixed(1)}` },
      { category: 'مواعيد متوسطة (4-10)', metric: analysis.appointmentFrequency.medium, value: `%${((analysis.appointmentFrequency.medium / analysis.totalPatients) * 100).toFixed(1)}` },
      { category: 'مواعيد كثيرة (أكثر من 10)', metric: analysis.appointmentFrequency.high, value: `%${((analysis.appointmentFrequency.high / analysis.totalPatients) * 100).toFixed(1)}` },
      
      { category: '', metric: '', value: '' },
      
      // النشاط الأخير
      { category: 'النشاط الأخير', metric: '', value: '' },
      { category: 'زيارة خلال أسبوع', metric: analysis.recentActivity.lastWeek, value: `%${((analysis.recentActivity.lastWeek / analysis.totalPatients) * 100).toFixed(1)}` },
      { category: 'زيارة خلال شهر', metric: analysis.recentActivity.lastMonth, value: `%${((analysis.recentActivity.lastMonth / analysis.totalPatients) * 100).toFixed(1)}` },
      { category: 'زيارة خلال 3 أشهر', metric: analysis.recentActivity.last3Months, value: `%${((analysis.recentActivity.last3Months / analysis.totalPatients) * 100).toFixed(1)}` },
      { category: 'أكثر من 3 أشهر', metric: analysis.recentActivity.over3Months, value: `%${((analysis.recentActivity.over3Months / analysis.totalPatients) * 100).toFixed(1)}` }
    ];

    const columns = [
      { header: 'الفئة', key: 'category', width: 35 },
      { header: 'العدد', key: 'metric', width: 15 },
      { header: 'النسبة', key: 'value', width: 15 }
    ];

    const fileName = `تقرير-تحليل-المرضى_${new Date().toISOString().split('T')[0]}`;
    const filePath = await createExcelFile(excelData, columns, fileName, 'تحليل المرضى');

    res.download(filePath, `${fileName}.xlsx`, (err) => {
      if (err) {
        console.error('خطأ في إرسال الملف:', err);
      }
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (unlinkError) {
          console.error('خطأ في حذف الملف:', unlinkError);
        }
      }, 5000);
    });

  } catch (error) {
    console.error('خطأ في تقرير تحليل المرضى:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء تقرير تحليل المرضى"
    });
  }
};

// تقرير المواعيد القادمة المحدث
exports.upcomingAppointmentsReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      appointmentDate: { $gte: today, $lte: nextWeek },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate("patientId", "patientName phoneNumber birthDate gender medicalHistory")
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .lean();

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على مواعيد للأسبوع القادم"
      });
    }

    // تنسيق البيانات مع معلومات إضافية مفيدة
    const excelData = appointments.map((apt, index) => {
      const patient = apt.patientId || {};
      
      // حساب العمر
      let age = '';
      if (patient.birthDate) {
        const birthDate = new Date(patient.birthDate);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      const aptDate = new Date(apt.appointmentDate);
      const daysUntil = Math.ceil((aptDate - today) / (1000 * 60 * 60 * 24));
      
      let priority = 'عادي';
      if (daysUntil === 0) priority = 'عالي - اليوم';
      else if (daysUntil <= 1) priority = 'متوسط - غداً';
      
      // معلومات طبية مختصرة
      const medicalInfo = patient.medicalHistory ? 
        (patient.medicalHistory.length > 50 ? 
          patient.medicalHistory.substring(0, 50) + '...' : 
          patient.medicalHistory) : '';

      return {
        sira: index + 1,
        patientName: apt.patientName || patient.patientName || '',
        phoneNumber: apt.phoneNumber || patient.phoneNumber || '',
        gender: patient.gender === 'male' ? 'ذكر' : 'أنثى',
        age: age || '',
        appointmentDate: aptDate.toLocaleDateString('ar-SA'),
        appointmentTime: apt.appointmentTime || '',
        daysUntil: daysUntil,
        priority: priority,
        status: apt.status === 'pending' ? 'قيد الانتظار' : 'مؤكد',
        notes: apt.notes || '',
        medicalInfo: medicalInfo,
        lastVisit: patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('ar-SA') : 'لا توجد زيارات سابقة',
        appointmentCount: patient.appointmentCount || 0
      };
    });

    // أعمدة محسنة للمواعيد القادمة
    const columns = [
      { header: 'رقم', key: 'sira', width: 8 },
      { header: 'اسم المريض', key: 'patientName', width: 25 },
      { header: 'رقم الهاتف', key: 'phoneNumber', width: 18 },
      { header: 'الجنس', key: 'gender', width: 10 },
      { header: 'العمر', key: 'age', width: 8 },
      { header: 'تاريخ الموعد', key: 'appointmentDate', width: 15 },
      { header: 'وقت الموعد', key: 'appointmentTime', width: 12 },
      { header: 'الأيام المتبقية', key: 'daysUntil', width: 15 },
      { header: 'الأولوية', key: 'priority', width: 15 },
      { header: 'الحالة', key: 'status', width: 12 },
      { header: 'ملاحظات الموعد', key: 'notes', width: 30 },
      { header: 'معلومات طبية مختصرة', key: 'medicalInfo', width: 35 },
      { header: 'آخر زيارة', key: 'lastVisit', width: 15 },
      { header: 'عدد المواعيد السابقة', key: 'appointmentCount', width: 20 }
    ];

    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = nextWeek.toISOString().split('T')[0];
    const fileName = `المواعيد-القادمة_${startDateStr}_إلى_${endDateStr}`;
    
    const filePath = await createExcelFile(excelData, columns, fileName, 'المواعيد القادمة');

    res.download(filePath, `${fileName}.xlsx`, (err) => {
      if (err) {
        console.error('خطأ في إرسال الملف:', err);
      }
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (unlinkError) {
          console.error('خطأ في حذف الملف:', unlinkError);
        }
      }, 5000);
    });

  } catch (error) {
    console.error('خطأ في تقرير المواعيد القادمة:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء تقرير المواعيد القادمة"
    });
  }
};

// تقرير يومي PDF المحدث
exports.dailyReportPDF = async (req, res) => {
  try {
    const { date } = req.query;
    let targetDate;
    
    if (date) {
      targetDate = new Date(date);
    } else {
      targetDate = new Date();
    }
    
    targetDate.setHours(0, 0, 0, 0);
    const tomorrow = new Date(targetDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // جلب البيانات الفعلية
    const [appointments, newPatients] = await Promise.all([
      Appointment.find({
        appointmentDate: { $gte: targetDate, $lt: tomorrow }
      })
        .populate("patientId", "patientName phoneNumber birthDate gender")
        .sort({ appointmentTime: 1 })
        .lean(),
      Patient.find({
        createdAt: { $gte: targetDate, $lt: tomorrow }
      }).lean()
    ]);

    // حساب الإحصائيات
    const stats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === "pending").length,
      confirmed: appointments.filter(a => a.status === "confirmed").length,
      cancelled: appointments.filter(a => a.status === "cancelled").length,
      newPatients: newPatients.length,
      uniquePatients: [...new Set(appointments.map(a => a.patientId?.toString()).filter(Boolean))].length
    };

    // إنشاء PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      layout: 'portrait',
      info: {
        Title: `تقرير يومي - ${targetDate.toLocaleDateString('ar-SA')}`,
        Author: 'نظام إدارة العيادة',
        Subject: 'تقرير مواعيد ومرضى يومي',
        Keywords: 'تقرير, يومي, مواعيد, مرضى',
        Creator: 'نظام إدارة العيادة v1.0'
      }
    });

    doc.font('Helvetica');
    
    // العنوان
    doc.fontSize(20)
       .fillColor('#1e40af')
       .text('نظام إدارة العيادة', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(16)
       .fillColor('#374151')
       .text('تقرير يومي', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(12)
       .fillColor('#6b7280')
       .text(targetDate.toLocaleDateString('ar-SA', { 
         weekday: 'long', 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       }), { align: 'center' });
    
    doc.moveDown(1);
    
    // إحصائيات اليوم
    doc.fontSize(14)
       .fillColor('#1f2937')
       .text('إحصائيات اليوم', 50, 150);
    
    doc.rect(50, 170, 500, 80).stroke('#e5e7eb');
    
    let yPos = 185;
    doc.fontSize(11)
       .fillColor('#374151');
    
    doc.text('إجمالي المواعيد:', 60, yPos);
    doc.text(stats.total.toString(), 180, yPos);
    
    doc.text('مؤكدة:', 250, yPos);
    doc.text(stats.confirmed.toString(), 350, yPos);
    
    doc.text('قيد الانتظار:', 400, yPos);
    doc.text(stats.pending.toString(), 500, yPos);
    
    yPos += 25;
    
    doc.text('ملغاة:', 60, yPos);
    doc.text(stats.cancelled.toString(), 180, yPos);
    
    doc.text('مرضى جدد:', 250, yPos);
    doc.text(stats.newPatients.toString(), 350, yPos);
    
    doc.text('مرضى فريدين:', 400, yPos);
    doc.text(stats.uniquePatients.toString(), 500, yPos);
    
    yPos += 40;
    
    // قائمة المواعيد
    if (appointments.length > 0) {
      doc.fontSize(14)
         .fillColor('#1f2937')
         .text('قائمة المواعيد', 50, yPos);
      
      yPos += 20;
      
      // جدول المواعيد
      doc.fontSize(9);
      
      // رأس الجدول
      doc.rect(50, yPos, 500, 20).fill('#4f46e5');
      doc.fillColor('#FFFFFF');
      doc.text('الوقت', 60, yPos + 6);
      doc.text('اسم المريض', 120, yPos + 6);
      doc.text('الهاتف', 270, yPos + 6);
      doc.text('الحالة', 370, yPos + 6);
      doc.text('ملاحظات', 450, yPos + 6);
      
      yPos += 25;
      
      // بيانات المواعيد
      appointments.forEach((apt, index) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }
        
        const rowY = yPos;
        
        // خلفية صف متبادلة
        if (index % 2 === 0) {
          doc.rect(50, rowY - 5, 500, 20).fill('#f8fafc');
        }
        
        doc.fillColor('#374151');
        
        // بيانات الموعد
        doc.text(apt.appointmentTime || '', 60, rowY);
        doc.text(apt.patientName || apt.patientId?.patientName || '', 120, rowY, { width: 140 });
        doc.text(apt.phoneNumber || apt.patientId?.phoneNumber || '', 270, rowY, { width: 90 });
        
        // لون الحالة
        let statusColor = '#374151';
        if (apt.status === 'confirmed') statusColor = '#059669';
        else if (apt.status === 'pending') statusColor = '#d97706';
        else if (apt.status === 'cancelled') statusColor = '#dc2626';
        
        doc.fillColor(statusColor);
        doc.text(
          apt.status === 'pending' ? 'قيد الانتظار' : 
          apt.status === 'confirmed' ? 'مؤكد' : 'ملغي',
          370, rowY, { width: 70 }
        );
        
        doc.fillColor('#374151');
        const notes = apt.notes || '';
        doc.text(notes.length > 30 ? notes.substring(0, 30) + '...' : notes, 450, rowY, { width: 100 });
        
        yPos += 25;
      });
    } else {
      doc.fontSize(12)
         .fillColor('#6b7280')
         .text('لا توجد مواعيد لهذا اليوم.', 50, yPos);
    }
    
    // تذييل الصفحة
    const pageHeight = doc.page.height;
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .text(
         `تاريخ الإنشاء: ${new Date().toLocaleString('ar-SA')} | الصفحة ${doc.bufferedPageRange().count || 1}`,
         50, pageHeight - 50, { align: 'center', width: 500 }
       );
    
    doc.text('© نظام إدارة العيادة - جميع الحقوق محفوظة', 
             50, pageHeight - 30, { align: 'center', width: 500 });

    // إرسال PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 
      `attachment; filename="تقرير-يومي-${targetDate.toISOString().split('T')[0]}.pdf"`);
    
    doc.pipe(res);
    doc.end();

  } catch (error) {
    console.error("خطأ في تقرير PDF اليومي:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء تقرير PDF"
    });
  }
};

// إحصائيات النظام المحدثة
exports.systemStats = async (req, res) => {
  try {
    const [
      totalPatients,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      confirmedAppointments,
      cancelledAppointments,
      malePatients,
      femalePatients,
      lastWeekPatients,
      lastMonthAppointments,
      patientsWithAppointments,
      activePatients
    ] = await Promise.all([
      Patient.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: { 
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999)
        }
      }),
      Appointment.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({ status: 'confirmed' }),
      Appointment.countDocuments({ status: 'cancelled' }),
      Patient.countDocuments({ gender: 'male' }),
      Patient.countDocuments({ gender: 'female' }),
      Patient.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      Patient.countDocuments({ appointmentCount: { $gt: 0 } }),
      Patient.countDocuments({ isActive: true })
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        confirmedAppointments,
        cancelledAppointments,
        malePatients,
        femalePatients,
        lastWeekPatients,
        lastMonthAppointments,
        patientsWithAppointments,
        activePatients,
        averageAppointmentsPerPatient: totalPatients > 0 ? (totalAppointments / totalPatients).toFixed(1) : 0,
        appointmentCompletionRate: totalAppointments > 0 ? 
          ((confirmedAppointments + (totalAppointments - pendingAppointments - cancelledAppointments)) / totalAppointments * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error("خطأ في إحصائيات النظام:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحميل الإحصائيات"
    });
  }
};