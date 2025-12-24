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
  console.log('تم إنشاء مجلد التصدير:', exportsDir);
}

// وظيفة مساعدة لإنشاء ملف Excel
const createExcelFile = async (data, columns, fileName) => {
  try {
    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('تقرير');
    
    // تعريف الأنماط
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 20
    }));

    // صف العنوان
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4F46E5' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // إضافة البيانات
    data.forEach(item => {
      worksheet.addRow(item);
    });

    // تنسيق جميع الصفوف
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: 'middle', horizontal: 'right' };
        if (rowNumber % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F8FAFC' }
          };
        }
      }
    });

    // حفظ الملف - في مجلد التصدير
    const filePath = path.join(exportsDir, `${fileName}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  } catch (error) {
    console.error('خطأ في إنشاء ملف Excel:', error);
    throw error;
  }
};

// تصدير المواعيد بصيغة Excel
exports.exportAppointmentsExcel = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};

    // تصفية التاريخ
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.appointmentDate = {
        $gte: start,
        $lte: end
      };
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
      .populate("patientId", "patientName phoneNumber birthDate gender nationalId")
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .lean();

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على مواعيد تطابق هذه المعايير"
      });
    }

    // تنسيق البيانات لملف Excel
    const excelData = appointments.map((apt, index) => {
      const patient = apt.patientId || {};
      const birthDate = patient.birthDate ? new Date(patient.birthDate) : null;
      const age = birthDate ? 
        Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)) : '';
      
      return {
        sira: index + 1,
        hastaAdi: apt.patientName || patient.patientName || '',
        telefon: apt.phoneNumber || patient.phoneNumber || '',
        tcKimlik: patient.nationalId || '',
        cinsiyet: patient.gender === 'male' ? 'ذكر' : patient.gender === 'female' ? 'أنثى' : '',
        yas: age,
        randevuTarihi: new Date(apt.appointmentDate).toLocaleDateString('tr-TR'),
        randevuSaati: apt.appointmentTime,
        durum: apt.status === 'pending' ? 'قيد الانتظار' : 
               apt.status === 'confirmed' ? 'مؤكد' : 
               apt.status === 'cancelled' ? 'ملغي' : 
               apt.status === 'completed' ? 'مكتمل' : '',
        notlar: apt.notes || '',
        olusturulmaTarihi: new Date(apt.createdAt).toLocaleDateString('tr-TR'),
        doktorNotu: apt.doctorNotes || ''
      };
    });

    // أعمدة Excel
    const columns = [
      { header: 'رقم التسلسل', key: 'sira', width: 10 },
      { header: 'اسم المريض', key: 'hastaAdi', width: 25 },
      { header: 'رقم الهاتف', key: 'telefon', width: 15 },
      { header: 'رقم الهوية', key: 'tcKimlik', width: 15 },
      { header: 'الجنس', key: 'cinsiyet', width: 10 },
      { header: 'العمر', key: 'yas', width: 10 },
      { header: 'تاريخ الموعد', key: 'randevuTarihi', width: 15 },
      { header: 'وقت الموعد', key: 'randevuSaati', width: 15 },
      { header: 'الحالة', key: 'durum', width: 15 },
      { header: 'ملاحظات المريض', key: 'notlar', width: 30 },
      { header: 'ملاحظات الطبيب', key: 'doktorNotu', width: 30 },
      { header: 'تاريخ الإنشاء', key: 'olusturulmaTarihi', width: 15 }
    ];

    // إنشاء اسم الملف - تنظيف الأحرف غير الصالحة
    const sanitizeFileName = (name) => {
      return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    };
    
    const dateRangeText = startDate && endDate ? 
      `${new Date(startDate).toLocaleDateString('tr-TR').replace(/[\.\s]/g, '_')}-${new Date(endDate).toLocaleDateString('tr-TR').replace(/[\.\s]/g, '_')}` :
      'جميع_المواعيد';
    
    const statusText = status && status !== 'all' ? 
      `_${status === 'pending' ? 'قيد الانتظار' : 
        status === 'confirmed' ? 'مؤكد' : 
        status === 'cancelled' ? 'ملغي' : 
        status === 'completed' ? 'مكتمل' : ''}` : '';
    
    const fileName = sanitizeFileName(`مواعيد_${dateRangeText}${statusText}_${new Date().toISOString().split('T')[0]}`);

    // إنشاء ملف Excel
    const filePath = await createExcelFile(excelData, columns, fileName);

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
      // حذف الملف المؤقت - في حالة الخطأ لا يتم الحذف
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (unlinkError) {
        console.error('خطأ في حذف الملف:', unlinkError);
      }
    });

  } catch (error) {
    console.error('خطأ في تصدير مواعيد Excel:', error);
    
    // إذا لم يتم إرسال الرد بعد، أرسل رسالة الخطأ
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء تصدير بيانات المواعيد",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// تصدير المرضى بصيغة Excel
exports.exportPatientsExcel = async (req, res) => {
  try {
    const { gender, minAge, maxAge, registrationDate } = req.query;
    let query = {};

    // تصفية الجنس
    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    // تصفية العمر
    if (minAge || maxAge) {
      const now = new Date();
      if (maxAge) {
        const maxBirthDate = new Date(now.getFullYear() - maxAge, now.getMonth(), now.getDate());
        query.birthDate = { $gte: maxBirthDate };
      }
      if (minAge) {
        const minBirthDate = new Date(now.getFullYear() - minAge, now.getMonth(), now.getDate());
        query.birthDate = { ...query.birthDate, $lte: minBirthDate };
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

    // تنسيق البيانات لملف Excel
    const excelData = patients.map((patient, index) => {
      const birthDate = patient.birthDate ? new Date(patient.birthDate) : null;
      const age = birthDate ? 
        Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)) : '';
      
      const lastVisit = patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('tr-TR') : '';

      return {
        sira: index + 1,
        hastaNo: patient.patientNumber || `م-${1000 + index}`,
        adSoyad: patient.patientName || '',
        tcKimlik: patient.nationalId || '',
        telefon: patient.phoneNumber || '',
        email: patient.email || '',
        dogumTarihi: birthDate ? birthDate.toLocaleDateString('tr-TR') : '',
        yas: age,
        cinsiyet: patient.gender === 'male' ? 'ذكر' : 'أنثى',
        adres: patient.address || '',
        acilDurumKontak: patient.emergencyContact || '',
        kanGrubu: patient.bloodType || '',
        alerjiler: patient.allergies || '',
        kronikHastaliklar: patient.chronicDiseases || '',
        kullanilanIlaclar: patient.medications || '',
        toplamRandevu: patient.appointmentCount || 0,
        toplamZiyaret: patient.totalVisits || 0,
        sonZiyaret: lastVisit,
        kayitTarihi: new Date(patient.createdAt).toLocaleDateString('tr-TR'),
        notlar: patient.notes || ''
      };
    });

    // أعمدة Excel
    const columns = [
      { header: 'رقم التسلسل', key: 'sira', width: 10 },
      { header: 'رقم المريض', key: 'hastaNo', width: 15 },
      { header: 'الاسم الكامل', key: 'adSoyad', width: 25 },
      { header: 'رقم الهوية', key: 'tcKimlik', width: 15 },
      { header: 'الهاتف', key: 'telefon', width: 15 },
      { header: 'البريد الإلكتروني', key: 'email', width: 25 },
      { header: 'تاريخ الميلاد', key: 'dogumTarihi', width: 15 },
      { header: 'العمر', key: 'yas', width: 10 },
      { header: 'الجنس', key: 'cinsiyet', width: 10 },
      { header: 'العنوان', key: 'adres', width: 30 },
      { header: 'جهة اتصال الطوارئ', key: 'acilDurumKontak', width: 20 },
      { header: 'فصيلة الدم', key: 'kanGrubu', width: 10 },
      { header: 'الحساسيات', key: 'alerjiler', width: 25 },
      { header: 'الأمراض المزمنة', key: 'kronikHastaliklar', width: 25 },
      { header: 'الأدوية المستخدمة', key: 'kullanilanIlaclar', width: 25 },
      { header: 'إجمالي المواعيد', key: 'toplamRandevu', width: 15 },
      { header: 'إجمالي الزيارات', key: 'toplamZiyaret', width: 15 },
      { header: 'آخر زيارة', key: 'sonZiyaret', width: 15 },
      { header: 'تاريخ التسجيل', key: 'kayitTarihi', width: 15 },
      { header: 'ملاحظات', key: 'notlar', width: 30 }
    ];

    // إنشاء اسم الملف
    const filters = [];
    if (gender && gender !== 'all') filters.push(gender === 'male' ? 'ذكر' : 'أنثى');
    if (minAge) filters.push(`${minAge}+عمر`);
    if (maxAge) filters.push(`${maxAge}-عمر`);
    if (registrationDate) filters.push(new Date(registrationDate).toLocaleDateString('tr-TR'));
    
    const filterText = filters.length > 0 ? `-${filters.join('-')}` : '';
    const fileName = `مرضى${filterText}-${new Date().toISOString().split('T')[0]}`;

    // إنشاء ملف Excel
    const filePath = await createExcelFile(excelData, columns, fileName);

    // إرسال الملف
    res.download(filePath, `${fileName}.xlsx`, (err) => {
      if (err) {
        console.error('خطأ في إرسال الملف:', err);
      }
      // حذف الملف المؤقت
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error('خطأ في تصدير مرضى Excel:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تصدير بيانات المرضى"
    });
  }
};

// تقرير الأداء الشهري
exports.monthlyPerformanceReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // إحصائيات شهرية
    const [
      totalAppointments,
      confirmedAppointments,
      cancelledAppointments,
      completedAppointments,
      totalPatients,
      newPatients,
      totalRevenue
    ] = await Promise.all([
      Appointment.countDocuments({
        appointmentDate: { $gte: startDate, $lte: endDate }
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: startDate, $lte: endDate },
        status: 'confirmed'
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: startDate, $lte: endDate },
        status: 'cancelled'
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: startDate, $lte: endDate },
        status: 'completed'
      }),
      Patient.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      Patient.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      Appointment.aggregate([
        {
          $match: {
            appointmentDate: { $gte: startDate, $lte: endDate },
            status: { $in: ['confirmed', 'completed'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$fee', 0] } }
          }
        }
      ])
    ]);

    // التوزيع اليومي
    const dailyStats = [];
    const daysInMonth = endDate.getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(targetYear, targetMonth - 1, day);
      const dayEnd = new Date(targetYear, targetMonth - 1, day, 23, 59, 59);
      
      const [dayAppointments, dayPatients, dayRevenue] = await Promise.all([
        Appointment.countDocuments({
          appointmentDate: { $gte: dayStart, $lte: dayEnd }
        }),
        Patient.countDocuments({
          createdAt: { $gte: dayStart, $lte: dayEnd }
        }),
        Appointment.aggregate([
          {
            $match: {
              appointmentDate: { $gte: dayStart, $lte: dayEnd },
              status: { $in: ['confirmed', 'completed'] }
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $ifNull: ['$fee', 0] } }
            }
          }
        ])
      ]);

      dailyStats.push({
        gun: day,
        tarih: dayStart.toLocaleDateString('tr-TR'),
        randevuSayisi: dayAppointments,
        yeniHasta: dayPatients,
        gelir: dayRevenue[0]?.total || 0
      });
    }

    // بيانات Excel
    const excelData = [
      {
        kategori: 'إحصائيات عامة',
        deger: '',
        aciklama: ''
      },
      {
        kategori: 'إجمالي عدد المواعيد',
        deger: totalAppointments,
        aciklama: ''
      },
      {
        kategori: 'المواعيد المؤكدة',
        deger: confirmedAppointments,
        aciklama: `%${totalAppointments > 0 ? ((confirmedAppointments / totalAppointments) * 100).toFixed(1) : 0}`
      },
      {
        kategori: 'المواعيد المكتملة',
        deger: completedAppointments,
        aciklama: `%${totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0}`
      },
      {
        kategori: 'المواعيد الملغاة',
        deger: cancelledAppointments,
        aciklama: `%${totalAppointments > 0 ? ((cancelledAppointments / totalAppointments) * 100).toFixed(1) : 0}`
      },
      {
        kategori: 'مرضى جدد مسجلين',
        deger: newPatients,
        aciklama: ''
      },
      {
        kategori: 'إجمالي الإيرادات',
        deger: totalRevenue[0]?.total || 0,
        aciklama: 'ليرة تركية'
      },
      {
        kategori: '',
        deger: '',
        aciklama: ''
      },
      {
        kategori: 'التوزيع اليومي',
        deger: '',
        aciklama: ''
      },
      ...dailyStats.map(day => ({
        kategori: day.tarih,
        deger: day.randevuSayisi,
        aciklama: `مرضى جدد: ${day.yeniHasta}, إيرادات: ${day.gelir} ليرة تركية`
      }))
    ];

    // أعمدة Excel
    const columns = [
      { header: 'الفئة', key: 'kategori', width: 25 },
      { header: 'القيمة', key: 'deger', width: 15 },
      { header: 'توضيح', key: 'aciklama', width: 30 }
    ];

    const fileName = `تقرير-أداء-شهري-${targetYear}-${String(targetMonth).padStart(2, '0')}-${new Date().toISOString().split('T')[0]}`;
    const filePath = await createExcelFile(excelData, columns, fileName);

    res.download(filePath, `${fileName}.xlsx`, (err) => {
      if (err) {
        console.error('خطأ في إرسال الملف:', err);
      }
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error('خطأ في تقرير الأداء الشهري:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء تقرير الأداء الشهري"
    });
  }
};

// تقرير تحليل المرضى
exports.patientAnalysisReport = async (req, res) => {
  try {
    const allPatients = await Patient.find().lean();

    if (allPatients.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على مرضى للتحليل"
      });
    }

    // فئات العمر
    const ageGroups = {
      '0-18': { count: 0, percentage: 0 },
      '19-30': { count: 0, percentage: 0 },
      '31-50': { count: 0, percentage: 0 },
      '51+': { count: 0, percentage: 0 }
    };

    // توزيع الجنس
    const genderDistribution = {
      erkek: { count: 0, percentage: 0 },
      kadin: { count: 0, percentage: 0 }
    };

    // توزيع عدد المواعيد
    const appointmentDistribution = {
      '0': { count: 0, percentage: 0 },
      '1-5': { count: 0, percentage: 0 },
      '6-10': { count: 0, percentage: 0 },
      '10+': { count: 0, percentage: 0 }
    };

    // توزيع فصائل الدم
    const bloodTypeDistribution = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
      'AB+': 0, 'AB-': 0, '0+': 0, '0-': 0, 'غير معروف': 0
    };

    let totalAge = 0;
    let totalAppointments = 0;

    allPatients.forEach(patient => {
      // حساب العمر
      const birthDate = patient.birthDate ? new Date(patient.birthDate) : null;
      let age = 0;
      if (birthDate) {
        age = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        totalAge += age;

        // فئة العمر
        if (age <= 18) ageGroups['0-18'].count++;
        else if (age <= 30) ageGroups['19-30'].count++;
        else if (age <= 50) ageGroups['31-50'].count++;
        else ageGroups['51+'].count++;
      }

      // الجنس
      if (patient.gender === 'male') {
        genderDistribution.erkek.count++;
      } else if (patient.gender === 'female') {
        genderDistribution.kadin.count++;
      }

      // عدد المواعيد
      const appCount = patient.appointmentCount || 0;
      totalAppointments += appCount;
      
      if (appCount === 0) appointmentDistribution['0'].count++;
      else if (appCount <= 5) appointmentDistribution['1-5'].count++;
      else if (appCount <= 10) appointmentDistribution['6-10'].count++;
      else appointmentDistribution['10+'].count++;

      // فصيلة الدم
      const bloodType = patient.bloodType || 'غير معروف';
      bloodTypeDistribution[bloodType] = (bloodTypeDistribution[bloodType] || 0) + 1;
    });

    // حساب النسب المئوية
    Object.keys(ageGroups).forEach(key => {
      ageGroups[key].percentage = (ageGroups[key].count / allPatients.length * 100).toFixed(1);
    });

    Object.keys(genderDistribution).forEach(key => {
      genderDistribution[key].percentage = (genderDistribution[key].count / allPatients.length * 100).toFixed(1);
    });

    Object.keys(appointmentDistribution).forEach(key => {
      appointmentDistribution[key].percentage = (appointmentDistribution[key].count / allPatients.length * 100).toFixed(1);
    });

    // المتوسطات
    const averageAge = totalAge > 0 ? (totalAge / allPatients.length).toFixed(1) : 0;
    const averageAppointments = totalAppointments > 0 ? (totalAppointments / allPatients.length).toFixed(1) : 0;

    // بيانات Excel
    const excelData = [
      { kategori: 'إحصائيات عامة', deger: '', aciklama: '' },
      { kategori: 'إجمالي عدد المرضى', deger: allPatients.length, aciklama: '' },
      { kategori: 'متوسط العمر', deger: averageAge, aciklama: 'سنة' },
      { kategori: 'متوسط عدد المواعيد', deger: averageAppointments, aciklama: 'موعد/مريض' },
      { kategori: '', deger: '', aciklama: '' },
      { kategori: 'توزيع فئات العمر', deger: '', aciklama: '' },
      ...Object.keys(ageGroups).map(key => ({
        kategori: `${key} سنة`,
        deger: ageGroups[key].count,
        aciklama: `%${ageGroups[key].percentage}`
      })),
      { kategori: '', deger: '', aciklama: '' },
      { kategori: 'توزيع الجنس', deger: '', aciklama: '' },
      ...Object.keys(genderDistribution).map(key => ({
        kategori: key === 'erkek' ? 'ذكر' : 'أنثى',
        deger: genderDistribution[key].count,
        aciklama: `%${genderDistribution[key].percentage}`
      })),
      { kategori: '', deger: '', aciklama: '' },
      { kategori: 'توزيع عدد المواعيد', deger: '', aciklama: '' },
      ...Object.keys(appointmentDistribution).map(key => ({
        kategori: key === '0' ? 'بدون مواعيد' : 
                 key === '1-5' ? 'لديه 1-5 مواعيد' :
                 key === '6-10' ? 'لديه 6-10 مواعيد' : 'لديه أكثر من 10 مواعيد',
        deger: appointmentDistribution[key].count,
        aciklama: `%${appointmentDistribution[key].percentage}`
      })),
      { kategori: '', deger: '', aciklama: '' },
      { kategori: 'توزيع فصائل الدم', deger: '', aciklama: '' },
      ...Object.keys(bloodTypeDistribution).map(key => ({
        kategori: key,
        deger: bloodTypeDistribution[key],
        aciklama: `%${(bloodTypeDistribution[key] / allPatients.length * 100).toFixed(1)}`
      }))
    ];

    // أعمدة Excel
    const columns = [
      { header: 'فئة التحليل', key: 'kategori', width: 30 },
      { header: 'العدد', key: 'deger', width: 15 },
      { header: 'النسبة', key: 'aciklama', width: 15 }
    ];

    const fileName = `تقرير-تحليل-المرضى-${new Date().toISOString().split('T')[0]}`;
    const filePath = await createExcelFile(excelData, columns, fileName);

    res.download(filePath, `${fileName}.xlsx`, (err) => {
      if (err) {
        console.error('خطأ في إرسال الملف:', err);
      }
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error('خطأ في تقرير تحليل المرضى:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء تقرير تحليل المرضى"
    });
  }
};

// مواعيد الأسبوع القادم
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
      .populate("patientId", "patientName phoneNumber birthDate gender nationalId")
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .lean();

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على مواعيد للأسبوع القادم"
      });
    }

    // بيانات Excel
    const excelData = appointments.map((apt, index) => {
      const patient = apt.patientId || {};
      const birthDate = patient.birthDate ? new Date(patient.birthDate) : null;
      const age = birthDate ? 
        Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)) : '';
      
      const aptDate = new Date(apt.appointmentDate);
      const dayOfWeek = aptDate.toLocaleDateString('tr-TR', { weekday: 'long' });

      return {
        sira: index + 1,
        gun: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1),
        tarih: aptDate.toLocaleDateString('tr-TR'),
        saat: apt.appointmentTime,
        hastaAdi: apt.patientName || patient.patientName || '',
        telefon: apt.phoneNumber || patient.phoneNumber || '',
        tcKimlik: patient.nationalId || '',
        yas: age,
        cinsiyet: patient.gender === 'male' ? 'ذكر' : 'أنثى',
        durum: apt.status === 'pending' ? 'قيد الانتظار' : 'مؤكد',
        notlar: apt.notes || '',
        ucret: apt.fee || 0,
        kalanGun: Math.ceil((aptDate - today) / (1000 * 60 * 60 * 24))
      };
    });

    // أعمدة Excel
    const columns = [
      { header: 'رقم التسلسل', key: 'sira', width: 10 },
      { header: 'اليوم', key: 'gun', width: 15 },
      { header: 'التاريخ', key: 'tarih', width: 15 },
      { header: 'الوقت', key: 'saat', width: 15 },
      { header: 'اسم المريض', key: 'hastaAdi', width: 25 },
      { header: 'الهاتف', key: 'telefon', width: 15 },
      { header: 'رقم الهوية', key: 'tcKimlik', width: 15 },
      { header: 'العمر', key: 'yas', width: 10 },
      { header: 'الجنس', key: 'cinsiyet', width: 10 },
      { header: 'الحالة', key: 'durum', width: 12 },
      { header: 'ملاحظات', key: 'notlar', width: 25 },
      { header: 'التكلفة (ليرة تركية)', key: 'ucret', width: 12 },
      { header: 'الأيام المتبقية', key: 'kalanGun', width: 12 }
    ];

    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = nextWeek.toISOString().split('T')[0];
    const fileName = `مواعيد-الأسبوع-القادم-${startDateStr}-${endDateStr}`;
    
    const filePath = await createExcelFile(excelData, columns, fileName);

    res.download(filePath, `${fileName}.xlsx`, (err) => {
      if (err) {
        console.error('خطأ في إرسال الملف:', err);
      }
      fs.unlinkSync(filePath);
    });

  } catch (error) {
    console.error('خطأ في تقرير المواعيد القادمة:', error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء تقرير المواعيد القادمة"
    });
  }
};

// تقرير يومي PDF (محدث)
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

    const appointments = await Appointment.find({
      appointmentDate: { $gte: targetDate, $lt: tomorrow },
    })
      .populate("patientId", "patientName phoneNumber birthDate gender nationalId")
      .sort({ appointmentTime: 1 })
      .lean();

    // مرضى جدد
    const newPatients = await Patient.countDocuments({
      createdAt: { $gte: targetDate, $lt: tomorrow }
    });

    // حساب الإيرادات
    const revenueResult = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: targetDate, $lt: tomorrow },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ['$fee', 0] } }
        }
      }
    ]);

    const stats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === "pending").length,
      confirmed: appointments.filter(a => a.status === "confirmed").length,
      cancelled: appointments.filter(a => a.status === "cancelled").length,
      completed: appointments.filter(a => a.status === "completed").length,
      revenue: revenueResult[0]?.total || 0
    };

    // إنشاء PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      layout: 'portrait',
      info: {
        Title: `تقرير يومي - ${targetDate.toLocaleDateString('tr-TR')}`,
        Author: 'نظام إدارة العيادة',
        Subject: 'تقرير مواعيد ومرضى يومي',
        Keywords: 'تقرير, يومي, مواعيد, مرضى',
        Creator: 'نظام إدارة العيادة v1.0',
        CreationDate: new Date()
      }
    });

    // دعم النص من اليمين إلى اليسار
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
       .text(targetDate.toLocaleDateString('tr-TR', { 
         weekday: 'long', 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       }), { align: 'center' });
    
    doc.moveDown(1);
    
    // مربع الإحصائيات
    doc.rect(50, 150, 500, 100).stroke('#e5e7eb');
    
    doc.fontSize(14)
       .fillColor('#1f2937')
       .text('ملخص اليوم', 60, 160);
    
    let yPos = 190;
    const col1 = 60;
    const col2 = 200;
    const col3 = 340;
    
    doc.fontSize(11)
       .fillColor('#374151');
    
    // الإحصائيات
    doc.text('إجمالي المواعيد:', col1, yPos);
    doc.text(stats.total.toString(), col1 + 100, yPos, { width: 50, align: 'right' });
    
    doc.text('مؤكدة:', col2, yPos);
    doc.text(stats.confirmed.toString(), col2 + 80, yPos, { width: 50, align: 'right' });
    
    doc.text('قيد الانتظار:', col3, yPos);
    doc.text(stats.pending.toString(), col3 + 80, yPos, { width: 50, align: 'right' });
    
    yPos += 25;
    
    doc.text('مكتملة:', col1, yPos);
    doc.text(stats.completed.toString(), col1 + 100, yPos, { width: 50, align: 'right' });
    
    doc.text('ملغاة:', col2, yPos);
    doc.text(stats.cancelled.toString(), col2 + 80, yPos, { width: 50, align: 'right' });
    
    doc.text('مرضى جدد:', col3, yPos);
    doc.text(newPatients.toString(), col3 + 80, yPos, { width: 50, align: 'right' });
    
    yPos += 25;
    
    doc.text('إيرادات اليوم:', col1, yPos);
    doc.text(`${stats.revenue.toFixed(2)} ليرة تركية`, col1 + 100, yPos, { width: 80, align: 'right' });
    
    yPos += 40;
    
    // عنوان قائمة المواعيد
    if (appointments.length > 0) {
      doc.fontSize(14)
         .fillColor('#1f2937')
         .text('قائمة المواعيد', 50, yPos);
      
      yPos += 20;
      
      // عناوين الجدول
      doc.fontSize(10)
         .fillColor('#ffffff')
         .rect(50, yPos, 500, 20).fill('#4f46e5');
      
      doc.text('الوقت', 60, yPos + 5);
      doc.text('اسم المريض', 120, yPos + 5);
      doc.text('الهاتف', 270, yPos + 5);
      doc.text('الحالة', 370, yPos + 5);
      doc.text('التكلفة', 450, yPos + 5);
      
      yPos += 25;
      
      // صفوف المواعيد
      appointments.forEach((apt, index) => {
        const rowY = yPos + (index * 25);
        
        if (index % 2 === 0) {
          doc.rect(50, rowY - 5, 500, 20).fill('#f8fafc');
        }
        
        doc.fontSize(9)
           .fillColor('#374151');
        
        doc.text(apt.appointmentTime, 60, rowY);
        doc.text(apt.patientName || apt.patientId?.patientName || '', 120, rowY, { width: 140 });
        doc.text(apt.phoneNumber || apt.patientId?.phoneNumber || '', 270, rowY, { width: 90 });
        
        // ألوان الحالة
        let statusColor = '#374151';
        if (apt.status === 'confirmed') statusColor = '#059669';
        else if (apt.status === 'pending') statusColor = '#d97706';
        else if (apt.status === 'cancelled') statusColor = '#dc2626';
        
        doc.fillColor(statusColor)
           .text(
             apt.status === 'pending' ? 'قيد الانتظار' : 
             apt.status === 'confirmed' ? 'مؤكد' : 
             apt.status === 'cancelled' ? 'ملغي' : 'مكتمل',
             370, rowY, { width: 70 }
           );
        
        doc.fillColor('#1e40af')
           .text(`${apt.fee || 0} ليرة تركية`, 450, rowY, { width: 90, align: 'right' });
        
        if (rowY > 700) {
          doc.addPage();
          yPos = 50;
        }
      });
    } else {
      doc.fontSize(12)
         .fillColor('#6b7280')
         .text('لا توجد مواعيد لهذا اليوم.', 50, yPos);
    }
    
    // التذييل
    const pageHeight = doc.page.height;
    doc.fontSize(8)
       .fillColor('#9ca3af')
       .text(
         `تاريخ إنشاء التقرير: ${new Date().toLocaleString('tr-TR')} | الصفحة ${doc.bufferedPageRange().count || 1}`,
         50, pageHeight - 50, { align: 'center', width: 500 }
       );
    
    doc.text('© 2024 نظام إدارة العيادة - جميع الحقوق محفوظة', 
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

// إحصائيات النظام (محدثة)
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
      patientWithAppointments,
      activePatients,
      totalRevenue
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
      Patient.countDocuments({ isActive: true }),
      Appointment.aggregate([
        {
          $match: {
            status: { $in: ['confirmed', 'completed'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$fee', 0] } }
          }
        }
      ])
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
        patientWithAppointments,
        activePatients,
        totalRevenue: totalRevenue[0]?.total || 0,
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