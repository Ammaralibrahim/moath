// components/AdditionalInfoSection.tsx
'use client'

import React, { ChangeEvent } from 'react';
import { AdditionalInfo, colors } from '../types/types';

interface AdditionalInfoSectionProps {
  additionalInfo: AdditionalInfo;
  onAdditionalInfoChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  additionalInfo,
  onAdditionalInfoChange
}) => {
  return (
    <div className="mt-8 pt-6 border-t" style={{ borderColor: colors.border }}>
      <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
        معلومات طبية إضافية (اختياري)
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="previousVisit"
              name="previousVisit"
              checked={additionalInfo.previousVisit}
              onChange={onAdditionalInfoChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="previousVisit" className="mr-2 text-sm font-medium" style={{ color: colors.text }}>
              زيارات سابقة للمركز
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="pregnant"
              name="pregnant"
              checked={additionalInfo.pregnant}
              onChange={onAdditionalInfoChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="pregnant" className="mr-2 text-sm font-medium" style={{ color: colors.text }}>
              حامل أو احتمال حمل
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasMetalImplants"
              name="hasMetalImplants"
              checked={additionalInfo.hasMetalImplants}
              onChange={onAdditionalInfoChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="hasMetalImplants" className="mr-2 text-sm font-medium" style={{ color: colors.text }}>
              أجهزة أو غرسات معدنية
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="claustrophobic"
              name="claustrophobic"
              checked={additionalInfo.claustrophobic}
              onChange={onAdditionalInfoChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="claustrophobic" className="mr-2 text-sm font-medium" style={{ color: colors.text }}>
              رهاب الأماكن المغلقة
            </label>
          </div>
        </div>
        
        {additionalInfo.previousVisit && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
              تاريخ آخر زيارة
            </label>
            <input
              type="date"
              name="previousVisitDate"
              value={additionalInfo.previousVisitDate}
              onChange={onAdditionalInfoChange}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
              style={{ 
                borderColor: colors.border,
                backgroundColor: colors.background,
                color: colors.text
              }}
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
            حساسيات (إن وجدت)
          </label>
          <textarea
            name="allergies"
            value={additionalInfo.allergies}
            onChange={onAdditionalInfoChange}
            rows={2}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="الحساسية من الأدوية، الطعام، أو مواد أخرى..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
            أدوية حالية
          </label>
          <textarea
            name="currentMedications"
            value={additionalInfo.currentMedications}
            onChange={onAdditionalInfoChange}
            rows={2}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all resize-none"
            style={{ 
              borderColor: colors.border,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="الأدوية التي تأخذها حالياً..."
          />
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfoSection;