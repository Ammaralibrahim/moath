const Backup = require("../models/Backup");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), "backups");
const ENCRYPTION_KEY = process.env.BACKUP_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

const ensureBackupDir = async () => {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
};

const encryptData = (data) => {
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      data: encrypted.toString('hex'),
      authTag: authTag.toString('hex'),
      version: '2.0'
    };
  } catch (error) {
    throw new Error('فشل في تشفير البيانات');
  }
};

const decryptData = (encrypted) => {
  try {
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(encrypted.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
    
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted.data, 'hex')),
      decipher.final()
    ]);
    
    return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    throw new Error('فشل في فك تشفير البيانات');
  }
};

const collectData = async (type) => {
  const data = {
    metadata: {
      createdAt: new Date().toISOString(),
      type: type,
      version: "3.0"
    },
    patients: [],
    appointments: []
  };

  if (type === 'full' || type === 'patients') {
    const patients = await Patient.find().lean();
    data.patients = patients.map(patient => {
      const { _id, __v, ...rest } = patient;
      return {
        originalId: _id.toString(),
        ...rest
      };
    });
    data.metadata.patients = patients.length;
  }

  if (type === 'full' || type === 'appointments') {
    const appointments = await Appointment.find()
      .populate('patientId', 'patientName phoneNumber')
      .lean();
    
    data.appointments = appointments.map(appointment => {
      const { _id, __v, patientId, ...rest } = appointment;
      
      const patientInfo = patientId ? {
        patientId: patientId._id.toString(),
        patientName: patientId.patientName,
        phoneNumber: patientId.phoneNumber
      } : {
        patientId: null,
        patientName: appointment.patientName,
        phoneNumber: appointment.phoneNumber
      };

      return {
        originalId: _id.toString(),
        ...patientInfo,
        ...rest
      };
    });
    data.metadata.appointments = appointments.length;
  }

  data.metadata.totalRecords = data.patients.length + data.appointments.length;
  data.metadata.checksum = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

  return data;
};

// Yardımcı fonksiyonlar - DÜZELTİLMİŞ VERSİYON
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().replace(/\s+/g, '');
  const s2 = str2.toLowerCase().replace(/\s+/g, '');
  
  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;
  
  // Levenshtein distance benzerliği
  const matrix = [];
  for (let i = 0; i <= s2.length; i++) matrix[i] = [i];
  for (let j = 0; j <= s1.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      const cost = s1.charAt(j - 1) === s2.charAt(i - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return 1 - distance / maxLength;
};

const mergeTextFields = (existing, backup) => {
  // Eğer ikisi de boşsa boş string döndür
  if (!existing && !backup) return '';
  
  // Eğer biri boşsa diğerini döndür
  if (!existing && backup) return backup;
  if (!backup && existing) return existing;
  
  // Her iki değeri string'e çevir
  const existingText = String(existing || '');
  const backupText = String(backup || '');
  
  // Her iki değer de boşsa boş string döndür
  if (!existingText.trim() && !backupText.trim()) return '';
  
  // Benzersiz paragrafları birleştir
  const existingParagraphs = existingText.split('\n\n').filter(p => p.trim());
  const backupParagraphs = backupText.split('\n\n').filter(p => p.trim());
  
  const allParagraphs = [...existingParagraphs];
  backupParagraphs.forEach(paragraph => {
    if (!existingParagraphs.some(p => p.includes(paragraph.substring(0, 50)))) {
      allParagraphs.push(paragraph);
    }
  });
  
  return allParagraphs.join('\n\n');
};

const mergeListFields = (existing, backup) => {
  // Eğer ikisi de boşsa boş string döndür
  if (!existing && !backup) return '';
  
  // Eğer biri boşsa diğerini döndür
  if (!existing && backup) return String(backup);
  if (!backup && existing) return String(existing);
  
  // Her iki değeri string'e çevir
  const existingStr = String(existing || '');
  const backupStr = String(backup || '');
  
  // Virgülle ayrılmış listeleri işle
  const existingItems = existingStr.split(',').map(item => item.trim()).filter(item => item);
  const backupItems = backupStr.split(',').map(item => item.trim()).filter(item => item);
  
  const allItems = [...existingItems];
  backupItems.forEach(item => {
    if (!existingItems.includes(item)) {
      allItems.push(item);
    }
  });
  
  return allItems.join(', ');
};

// 📌 CREATE BACKUP
const createBackup = async (req, res) => {
  let backupRecord;
  let session;

  try {
    const { type = "full", schedule } = req.body;

    if (!["full", "patients", "appointments"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "نوع النسخ الاحتياطي غير صالح"
      });
    }

    await ensureBackupDir();
    session = await mongoose.startSession();
    session.startTransaction();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupId = uuidv4().substring(0, 8);
    const filename = `${type}-backup-${timestamp}-${backupId}.backup`;
    const filePath = path.join(BACKUP_DIR, filename);

    backupRecord = new Backup({
      filename,
      path: filePath,
      size: 0,
      type,
      status: "pending",
      metadata: { type, version: "3.0", scheduled: !!schedule }
    });

    await backupRecord.save({ session });

    const backupData = await collectData(type);
    
    if (backupData.patients.length === 0 && backupData.appointments.length === 0) {
      throw new Error('لا توجد بيانات لحفظها');
    }

    const encryptedData = encryptData(backupData);
    const compressedData = zlib.gzipSync(JSON.stringify(encryptedData));
    
    await fs.writeFile(filePath, compressedData);

    const stats = await fs.stat(filePath);
    backupRecord.size = stats.size;
    backupRecord.status = "success";
    backupRecord.metadata = backupData.metadata;
    backupRecord.metadata.fileSize = stats.size;
    backupRecord.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await backupRecord.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "تم إنشاء النسخ الاحتياطي بنجاح",
      data: backupRecord,
      metadata: backupData.metadata
    });

  } catch (error) {
    if (session) await session.abortTransaction();
    
    if (backupRecord) {
      backupRecord.status = "failed";
      backupRecord.metadata = { error: error.message };
      await backupRecord.save();
    }

    res.status(500).json({
      success: false,
      message: "فشل في إنشاء النسخ الاحتياطي",
      error: error.message
    });
  } finally {
    if (session) session.endSession();
  }
};

// 📌 PREVIEW BACKUP
const previewBackup = async (req, res) => {
  try {
    const { id } = req.params;
    const backup = await Backup.findById(id);
    
    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "النسخ الاحتياطي غير موجود"
      });
    }

    const compressedData = await fs.readFile(backup.path);
    const decompressedData = zlib.gunzipSync(compressedData);
    const encryptedData = JSON.parse(decompressedData.toString());
    const backupData = decryptData(encryptedData);

    const samplePatients = backupData.patients.slice(0, 5);
    const sampleAppointments = backupData.appointments.slice(0, 5);

    res.json({
      success: true,
      data: {
        backupInfo: {
          filename: backup.filename,
          type: backup.type,
          createdAt: backup.createdAt,
          size: backup.size
        },
        metadata: backupData.metadata,
        sample: {
          patients: samplePatients,
          appointments: sampleAppointments
        },
        stats: {
          totalPatients: backupData.patients.length,
          totalAppointments: backupData.appointments.length,
          dataIntegrity: "✅ جيد"
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "فشل في معاينة النسخ الاحتياطي",
      error: error.message
    });
  }
};

// 📌 RESTORE BACKUP - GÜNCELLENMİŞ VE HATA DÜZELTİLMİŞ VERSİYON
const restoreBackup = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { id } = req.params;
    const { 
      mode = "replace",
      preservePatients = false,
      preserveAppointments = false,
      fixDataOnly = false,
      preserveNames = true,
      preservePhoneNumbers = true,
      fieldLevelMapping = {
        patientName: "keep_existing",
        phoneNumber: "keep_existing",
        email: "update_if_empty",
        address: "update_if_empty",
        medicalHistory: "merge",
        allergies: "merge",
        medications: "merge",
        notes: "merge"
      }
    } = req.body;

    const backup = await Backup.findById(id);
    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "النسخ الاحتياطي غير موجود"
      });
    }

    const compressedData = await fs.readFile(backup.path);
    const decompressedData = zlib.gunzipSync(compressedData);
    const encryptedData = JSON.parse(decompressedData.toString());
    const backupData = decryptData(encryptedData);

    session.startTransaction();

    let result = {
      patients: { created: 0, updated: 0, skipped: 0, fixed: 0 },
      appointments: { created: 0, updated: 0, skipped: 0, fixed: 0 }
    };

    // 🎯 VERİ DÜZELTME MODU (FIX-ONLY)
    if (mode === "fix-only" || fixDataOnly) {
      console.log("🔧 Veri düzeltme modu aktif...");
      console.log(`📊 Toplam hasta: ${backupData.patients.length}, Toplam randevu: ${backupData.appointments.length}`);
      
      // HASTALARI DÜZELT
      for (const patientData of backupData.patients) {
        const { originalId, patientName: backupName, phoneNumber: backupPhone, ...rest } = patientData;
        
        console.log(`🔍 Hasta aranıyor: ${backupName} (${backupPhone}) - originalId: ${originalId}`);
        
        // 1. Önce originalId ile ara
        let existingPatient = null;
        if (originalId) {
          existingPatient = await Patient.findOne({ originalId }).session(session);
          if (existingPatient) {
            console.log(`✅ Hasta originalId ile bulundu: ${existingPatient.patientName}`);
          }
        }
        
        // 2. Eğer bulunamazsa, telefon ve isimle ara
        if (!existingPatient && backupPhone) {
          existingPatient = await Patient.findOne({ 
            phoneNumber: backupPhone 
          }).session(session);
          if (existingPatient) {
            console.log(`✅ Hasta telefon numarası ile bulundu: ${existingPatient.patientName}`);
          }
        }
        
        // 3. Hala bulunamazsa, isimle ara (sadece isim benzerse)
        if (!existingPatient && backupName) {
          // Benzer isimleri ara (%80 benzerlik)
          const allPatients = await Patient.find({}).session(session);
          existingPatient = allPatients.find(p => {
            const similarity = calculateSimilarity(p.patientName, backupName);
            return similarity > 0.8;
          });
          if (existingPatient) {
            console.log(`✅ Hasta isim benzerliği ile bulundu: ${existingPatient.patientName} (benzerlik: ${calculateSimilarity(existingPatient.patientName, backupName)})`);
          }
        }

        if (existingPatient) {
          // MEVCUT HASTAYI DÜZELT
          const updateData = {};
          const patientUpdates = {};
          
          // Her alan için özel mantık
          Object.keys(fieldLevelMapping).forEach(field => {
            const strategy = fieldLevelMapping[field];
            const existingValue = existingPatient[field];
            const backupValue = patientData[field];
            
            // Değerleri kontrol et
            const existingIsEmpty = !existingValue || existingValue === '' || existingValue === null || existingValue === undefined;
            const backupIsEmpty = !backupValue || backupValue === '' || backupValue === null || backupValue === undefined;
            
            switch(strategy) {
              case 'keep_existing':
                // Mevcut değeri koru
                if (!existingIsEmpty) {
                  updateData[field] = existingValue;
                } else if (!backupIsEmpty) {
                  updateData[field] = backupValue;
                  if (existingValue !== backupValue) {
                    patientUpdates[field] = 'updated (from empty)';
                  }
                }
                break;
                
              case 'use_backup':
                // Yedekteki değeri kullan
                if (!backupIsEmpty) {
                  updateData[field] = backupValue;
                  if (existingValue !== backupValue) {
                    patientUpdates[field] = 'updated (from backup)';
                  }
                } else if (!existingIsEmpty) {
                  updateData[field] = existingValue;
                }
                break;
                
              case 'update_if_empty':
                // Sadece boşsa güncelle
                if (existingIsEmpty && !backupIsEmpty) {
                  updateData[field] = backupValue;
                  patientUpdates[field] = 'updated (was empty)';
                } else if (!existingIsEmpty) {
                  updateData[field] = existingValue;
                }
                break;
                
              case 'merge':
                // Birleştir (özel mantık)
                if (field === 'medicalHistory' || field === 'notes') {
                  try {
                    const merged = mergeTextFields(existingValue, backupValue);
                    updateData[field] = merged;
                    if (!backupIsEmpty && existingValue !== merged) {
                      patientUpdates[field] = 'merged';
                    }
                  } catch (mergeError) {
                    console.error(`❌ mergeTextFields hatası (${field}):`, mergeError);
                    updateData[field] = existingValue || backupValue;
                  }
                } else if (field === 'allergies' || field === 'medications') {
                  try {
                    const merged = mergeListFields(existingValue, backupValue);
                    updateData[field] = merged;
                    if (!backupIsEmpty && existingValue !== merged) {
                      patientUpdates[field] = 'merged';
                    }
                  } catch (mergeError) {
                    console.error(`❌ mergeListFields hatası (${field}):`, mergeError);
                    updateData[field] = existingValue || backupValue;
                  }
                } else {
                  updateData[field] = existingValue || backupValue;
                }
                break;
                
              default:
                updateData[field] = existingValue || backupValue;
            }
          });

          // Önemli alanları koru (eğer seçildiyse)
          if (preserveNames && existingPatient.patientName) {
            updateData.patientName = existingPatient.patientName;
            if (patientUpdates.patientName) delete patientUpdates.patientName;
          }
          
          if (preservePhoneNumbers && existingPatient.phoneNumber) {
            updateData.phoneNumber = existingPatient.phoneNumber;
            if (patientUpdates.phoneNumber) delete patientUpdates.phoneNumber;
          }
          
          // Backup verilerini kaydet
          try {
            const backupDataMap = existingPatient.backupData || new Map();
            backupDataMap.set(backup._id.toString(), {
              backupName,
              backupPhone,
              restoredAt: new Date(),
              changes: patientUpdates
            });
            
            updateData.backupData = Object.fromEntries(backupDataMap);
          } catch (backupDataError) {
            console.error('❌ Backup data kaydetme hatası:', backupDataError);
          }
          
          // Orijinal ID'yi kaydet (eğer yoksa)
          if (!existingPatient.originalId && originalId) {
            updateData.originalId = originalId;
          }
          
          // Güncelle
          if (Object.keys(updateData).length > 0) {
            try {
              await Patient.updateOne(
                { _id: existingPatient._id },
                { 
                  $set: updateData
                }
              ).session(session);
              console.log(`✅ Hasta güncellendi: ${existingPatient.patientName}`);
            } catch (updateError) {
              console.error(`❌ Hasta güncelleme hatası (${existingPatient.patientName}):`, updateError);
            }
          }
          
          // Değişiklikleri kaydet
          if (Object.keys(patientUpdates).length > 0) {
            result.patients.fixed++;
            console.log(`✅ Hasta düzeltildi: ${existingPatient.patientName}`, patientUpdates);
          } else {
            result.patients.skipped++;
            console.log(`⏭️  Hasta atlandı (değişiklik yok): ${existingPatient.patientName}`);
          }
        } else {
          result.patients.skipped++;
          console.log(`⏭️  Hasta atlandı (eşleşme bulunamadı): ${backupName} (${backupPhone})`);
        }
      }

      // RANDEVULARI DÜZELT
      for (const appointmentData of backupData.appointments) {
        const { originalId, patientId: backupPatientId, ...rest } = appointmentData;
        
        // 1. OriginalId ile randevuyu bul
        let existingAppointment = null;
        if (originalId) {
          existingAppointment = await Appointment.findOne({ originalId }).session(session);
        }
        
        if (existingAppointment) {
          // Randevuyu güncelle ama hasta bilgilerini değiştirme
          const updateData = { ...rest };
          
          // Hasta ID'sini koru
          if (existingAppointment.patientId) {
            updateData.patientId = existingAppointment.patientId;
          }
          
          // Backup verilerini kaydet
          try {
            const backupDataMap = existingAppointment.backupData || new Map();
            backupDataMap.set(backup._id.toString(), {
              restoredAt: new Date()
            });
            
            updateData.backupData = Object.fromEntries(backupDataMap);
          } catch (backupDataError) {
            console.error('❌ Randevu backup data kaydetme hatası:', backupDataError);
          }
          
          if (Object.keys(updateData).length > 0) {
            try {
              await Appointment.updateOne(
                { _id: existingAppointment._id },
                { $set: updateData }
              ).session(session);
              result.appointments.fixed++;
            } catch (updateError) {
              console.error(`❌ Randevu güncelleme hatası:`, updateError);
            }
          }
        } else {
          result.appointments.skipped++;
        }
      }
      
      await session.commitTransaction();
      
      res.json({
        success: true,
        message: "تم تصحيح البيانات بنجاح",
        mode: "fix-only",
        result: result,
        summary: {
          totalProcessed: backupData.patients.length + backupData.appointments.length,
          patientsFixed: result.patients.fixed,
          appointmentsFixed: result.appointments.fixed,
          patientsSkipped: result.patients.skipped,
          appointmentsSkipped: result.appointments.skipped
        },
        fieldStrategy: fieldLevelMapping
      });
      
      return;
    }

    // 📌 REPLACE MODE
    if (mode === 'replace') {
      if (!preservePatients) {
        await Patient.deleteMany({}).session(session);
      }
      if (!preserveAppointments) {
        await Appointment.deleteMany({}).session(session);
      }
      
      if (backupData.patients.length > 0 && !preservePatients) {
        const patientsToInsert = backupData.patients.map(p => {
          const { originalId, ...rest } = p;
          return { ...rest, _id: new mongoose.Types.ObjectId(), originalId };
        });
        await Patient.insertMany(patientsToInsert, { session });
        result.patients.created = patientsToInsert.length;
      }

      if (backupData.appointments.length > 0 && !preserveAppointments) {
        const appointmentsToInsert = await Promise.all(
          backupData.appointments.map(async (a) => {
            const { originalId, patientId, ...rest } = a;
            let newPatientId = null;
            if (patientId) {
              const patient = await Patient.findOne({
                patientName: a.patientName,
                phoneNumber: a.phoneNumber 
              }).session(session);
              newPatientId = patient?._id;
            }
            return {
              ...rest,
              patientId: newPatientId,
              _id: new mongoose.Types.ObjectId(),
              originalId
            };
          })
        );
        await Appointment.insertMany(appointmentsToInsert, { session });
        result.appointments.created = appointmentsToInsert.length;
      }
    } 
    // 📌 MERGE MODE
    else if (mode === "merge") {
      for (const patientData of backupData.patients) {
        const { originalId, ...rest } = patientData;
        const existingPatient = await Patient.findOne({
          $or: [
            { patientName: rest.patientName, phoneNumber: rest.phoneNumber },
            { originalId: originalId }
          ]
        }).session(session);

        if (existingPatient) {
          // Güncelleme stratejisi
          const updateData = {};
          Object.keys(rest).forEach(key => {
            if (rest[key] && (!existingPatient[key] || existingPatient[key] === '')) {
              updateData[key] = rest[key];
            }
          });
          
          if (Object.keys(updateData).length > 0) {
            await Patient.updateOne(
              { _id: existingPatient._id },
              { $set: updateData }
            ).session(session);
            result.patients.updated++;
          } else {
            result.patients.skipped++;
          }
        } else {
          await Patient.create([{ ...rest, originalId }], { session });
          result.patients.created++;
        }
      }
    }

    await session.commitTransaction();
    backup.status = "restored";
    backup.restoredAt = new Date();
    await backup.save();

    res.json({
      success: true,
      message: "تم استعادة النسخ الاحتياطي بنجاح",
      mode: mode,
      result: result,
      summary: {
        totalProcessed: backupData.metadata.totalRecords,
        patients: result.patients,
        appointments: result.appointments
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("❌ Restore hatası:", error);
    console.error("❌ Hata detayı:", error.stack);
    res.status(500).json({
      success: false,
      message: "فشل في استعادة النسخ الاحتياطي",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    session.endSession();
  }
};

// 📌 DOWNLOAD BACKUP
const downloadBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);
    
    if (!backup || !backup.path) {
      return res.status(404).json({
        success: false,
        message: "النسخ الاحتياطي غير موجود"
      });
    }

    const compressedData = await fs.readFile(backup.path);
    const decompressedData = zlib.gunzipSync(compressedData);
    const encryptedData = JSON.parse(decompressedData.toString());
    const backupData = decryptData(encryptedData);

    const cleanData = JSON.stringify(backupData, null, 2);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${backup.filename.replace('.backup', '.json')}"`);
    res.setHeader('Content-Length', Buffer.byteLength(cleanData, 'utf8'));
    
    res.send(cleanData);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "فشل في تحميل النسخ الاحتياطي",
      error: error.message
    });
  }
};

// 📌 GET BACKUP STATS
const getBackupStats = async (req, res) => {
  try {
    const [
      totalBackups,
      successfulBackups,
      totalSizeResult,
      typeStats
    ] = await Promise.all([
      Backup.countDocuments(),
      Backup.countDocuments({ status: "success" }),
      Backup.aggregate([
        { $match: { size: { $exists: true, $gt: 0 } } },
        { $group: { _id: null, total: { $sum: "$size" } } }
      ]),
      Backup.aggregate([
        { $group: { 
          _id: "$type", 
          count: { $sum: 1 }, 
          totalSize: { $sum: "$size" }
        } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          total: totalBackups,
          successful: successfulBackups,
          successRate: totalBackups > 0 ? (successfulBackups / totalBackups * 100).toFixed(2) : 0
        },
        storage: {
          totalSize: totalSizeResult[0]?.total || 0
        },
        types: typeStats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "فشل في جلب إحصائيات النسخ الاحتياطي"
    });
  }
};

// 📌 LIST BACKUPS
const listBackups = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const backups = await Backup.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v -path");

    const total = await Backup.countDocuments(query);

    res.json({
      success: true,
      data: backups,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "فشل في جلب النسخ الاحتياطية"
    });
  }
};

// 📌 DELETE BACKUP
const deleteBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);
    
    if (!backup) {
      return res.status(404).json({
        success: false,
        message: "النسخ الاحتياطي غير موجود"
      });
    }

    if (backup.path) {
      try {
        await fs.unlink(backup.path);
      } catch (error) {
        console.warn(`File not found: ${backup.path}`);
      }
    }

    await backup.deleteOne();

    res.json({
      success: true,
      message: "تم حذف النسخ الاحتياطي بنجاح"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "فشل في حذف النسخ الاحتياطي",
      error: error.message
    });
  }
};

// 📌 AUTOMATIC BACKUP
const createAutomaticBackup = async () => {
  try {
    await ensureBackupDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupId = uuidv4().substring(0, 8);
    const filename = `auto-backup-${timestamp}-${backupId}.backup`;
    const filePath = path.join(BACKUP_DIR, filename);

    const backupRecord = new Backup({
      filename,
      path: filePath,
      size: 0,
      type: "automatic",
      status: "pending",
      metadata: {
        version: "3.0",
        scheduled: true,
        autoGenerated: true
      }
    });

    await backupRecord.save();

    const backupData = await collectData("full");
    const encryptedData = encryptData(backupData);
    const compressedData = zlib.gzipSync(JSON.stringify(encryptedData));
    
    await fs.writeFile(filePath, compressedData);

    const stats = await fs.stat(filePath);
    backupRecord.size = stats.size;
    backupRecord.status = "success";
    backupRecord.metadata = backupData.metadata;
    backupRecord.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await backupRecord.save();
    
    console.log(`🤖 تم إنشاء نسخة احتياطية تلقائية: ${filename}`);
    return backupRecord;

  } catch (error) {
    console.error('❌ خطأ في النسخ الاحتياطي التلقائي:', error);
    throw error;
  }
};

module.exports = {
  createBackup,
  previewBackup,
  restoreBackup,
  downloadBackup,
  getBackupStats,
  listBackups,
  deleteBackup,
  createAutomaticBackup,
  calculateSimilarity,
  mergeTextFields,
  mergeListFields
};