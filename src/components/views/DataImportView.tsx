import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  autoDetectColumnMapping,
  parseCsvFile,
  parseExcelFile,
  validateAndTransformDataset,
  DEFAULT_MAPPING,
} from '../../engine/validation';
import { ColumnMapping, RawTransaction, StandardTransaction, ValidationReport } from '../../types/data';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Download,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  FileCheck,
  Eye,
  Layers,
} from 'lucide-react';

export const DataImportView: React.FC = () => {
  const { loadImportedData, resetToDemoData, language, isDemoData } = useApp();

  // Wizard Step: 1 = Upload, 2 = Preview, 3 = Mapping, 4 = Validation, 5 = Summary
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(DEFAULT_MAPPING);

  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [validTransactions, setValidTransactions] = useState<StandardTransaction[]>([]);
  const [rejectedRows, setRejectedRows] = useState<{ rowNumber: number; data: any; reason: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle File Selection
  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setUploadedFile(file);

    try {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.csv')) {
        const result = await parseCsvFile(file);
        setFileHeaders(result.headers);
        setRawRows(result.rows);
        const detected = autoDetectColumnMapping(result.headers);
        setColumnMapping(detected);
        setCurrentStep(2);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const result = await parseExcelFile(file);
        setSheetNames(result.sheetNames);
        setActiveSheet(result.activeSheet);
        setFileHeaders(result.headers);
        setRawRows(result.rows);
        const detected = autoDetectColumnMapping(result.headers);
        setColumnMapping(detected);
        setCurrentStep(2);
      } else {
        alert(
          language === 'ar'
            ? 'يرجى اختيار ملف بصيغة CSV أو Excel (.xlsx / .xls)'
            : 'Please upload a CSV or Excel file'
        );
      }
    } catch (err: any) {
      alert((language === 'ar' ? 'فشل قراءة الملف: ' : 'Failed to parse file: ') + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Run validation
  const runValidation = () => {
    setIsProcessing(true);
    const { report, validTransactions: valid, rejectedRows: rejected } =
      validateAndTransformDataset(rawRows, columnMapping);
    setValidationReport(report);
    setValidTransactions(valid);
    setRejectedRows(rejected);
    setIsProcessing(false);
    setCurrentStep(4);
  };

  // Commit and switch dataset
  const commitImport = () => {
    if (validTransactions.length === 0) {
      alert(
        language === 'ar'
          ? 'لا توجد سجلات صالحة للاستيراد'
          : 'No valid records to import'
      );
      return;
    }
    loadImportedData(validTransactions);
  };

  // Download Sample CSV Template
  const downloadSampleTemplate = () => {
    const csvContent =
      'رقم الطلب,تاريخ الطلب,كود العميل,اسم العميل,كود الصنف,اسم الصنف,التصنيف,الكمية,سعر الوحدة,سعر التكلفة,الخصم,المرتجع,المحافظة,مندوب المبيعات\n' +
      'ORD-9001,2026-10-01,CUST-01,سوبرماركت التحرير,SKU-01,زيت عباد شمس 1 لتر,زيوت وسمن,20,85,75,0,0,القاهرة,أحمد حسن\n' +
      'ORD-9001,2026-10-01,CUST-01,سوبرماركت التحرير,SKU-02,سكر أبيض 1 كجم,بقوليات وأرز,50,36,31,10,0,القاهرة,أحمد حسن\n' +
      'ORD-9002,2026-10-02,CUST-02,هايبر النور - الإسكندرية,SKU-03,حليب كامل الدسم 1 لتر,ألبان ومشروبات,30,52,45,0,0,الإسكندرية,كريم محمود\n' +
      'ORD-9003,2026-10-03,CUST-03,شركة الدلتا للتجارة,SKU-04,مسحوق أريال 2.5 كجم,منظفات وعناية,40,820,700,500,0,الدلتا,طارق يوسف\n' +
      'ORD-9004,2026-10-04,CUST-04,أسواق الحرمين - فيصل,SKU-05,تونة صن شاين قطع,معلبات ومحفوظات,15,2750,2350,300,0,الجيزة,مينا سامي\n';

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'business_insight_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadSampleCsvToWizard = () => {
    const csvContent =
      'رقم الطلب,تاريخ الطلب,كود العميل,اسم العميل,كود الصنف,اسم الصنف,التصنيف,الكمية,سعر الوحدة,سعر التكلفة,الخصم,المرتجع,المحافظة,مندوب المبيعات\n' +
      'ORD-9001,2026-10-01,CUST-01,سوبرماركت التحرير,SKU-01,زيت عباد شمس 1 لتر,زيوت وسمن,20,85,75,0,0,القاهرة,أحمد حسن\n' +
      'ORD-9001,2026-10-01,CUST-01,سوبرماركت التحرير,SKU-02,سكر أبيض 1 كجم,بقوليات وأرز,50,36,31,10,0,القاهرة,أحمد حسن\n' +
      'ORD-9002,2026-10-02,CUST-02,هايبر النور - الإسكندرية,SKU-03,حليب كامل الدسم 1 لتر,ألبان ومشروبات,30,52,45,0,0,الإسكندرية,كريم محمود\n' +
      'ORD-9003,2026-10-03,CUST-03,شركة الدلتا للتجارة,SKU-04,مسحوق أريال 2.5 كجم,منظفات وعناية,40,820,700,500,0,الدلتا,طارق يوسف\n' +
      'ORD-9004,2026-10-04,CUST-04,أسواق الحرمين - فيصل,SKU-05,تونة صن شاين قطع,معلبات ومحفوظات,15,2750,2350,300,0,الجيزة,مينا سامي\n';

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], 'demo_sample_sales.csv', { type: 'text/csv' });
    handleFileProcess(file);
  };

  // Download Validation Report
  const downloadValidationReportText = () => {
    if (!validationReport) return;
    const lines = [
      '=== BUSINESS INSIGHT AI - تقرير تدقيق استيراد البيانات ===',
      `الملف: ${uploadedFile?.name || 'file'}`,
      `إجمالي الصفوف: ${validationReport.totalRows}`,
      `الصفوف الصالحة: ${validationReport.validRows}`,
      `صفوف تحتوي تحذيرات: ${validationReport.warningRows}`,
      `صفوف مرفوضة بها أخطاء: ${validationReport.errorRows}`,
      `تكرارات مرشحة: ${validationReport.duplicateCandidates}`,
      `توفر بيانات التكلفة: ${validationReport.hasCostData ? 'نعم' : 'لا'}`,
      '',
      '--- قائمة الملاحظات والأخطاء التفصيلية ---',
      ...validationReport.issues.map(
        (i) => `سطر ${i.rowNumber} [${i.severity.toUpperCase()}]: ${i.messageAr} (عمود: ${i.column})`
      ),
    ];

    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'validation_audit_report.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          {[
            { num: 1, labelAr: '1. رفع الملف', labelEn: '1. Upload' },
            { num: 2, labelAr: '2. معاينة الصفوف', labelEn: '2. Preview' },
            { num: 3, labelAr: '3. مطابقة الأعمدة', labelEn: '3. Column Mapping' },
            { num: 4, labelAr: '4. التدقيق والتحقق', labelEn: '4. Validation' },
            { num: 5, labelAr: '5. ملخص التحميل', labelEn: '5. Summary' },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 font-bold ${
                currentStep === s.num
                  ? 'text-teal-700'
                  : currentStep > s.num
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  currentStep === s.num
                    ? 'bg-teal-700 text-white'
                    : currentStep > s.num
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {currentStep > s.num ? '✓' : s.num}
              </span>
              <span>{language === 'ar' ? s.labelAr : s.labelEn}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Upload */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div
            className={`dropzone-container ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
            />

            <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
              <UploadCloud size={32} />
            </div>

            <h3 className="font-extrabold text-slate-800 text-base mb-1">
              {language === 'ar'
                ? 'اسحب وأفلت ملف المبيعات هنا، أو انقر للتصفح'
                : 'Drag and drop your sales file here, or click to browse'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'ar'
                ? 'يدعم ملفات CSV وإكسل (XLSX/XLS). الحد الأقصى لحجم الملف 15 ميجابايت.'
                : 'Supports CSV and Excel files (XLSX/XLS) up to 15MB.'}
            </p>

            <button type="button" className="btn btn-primary btn-sm mx-auto">
              <FileSpreadsheet size={15} />
              <span>{language === 'ar' ? 'اختر ملف من جهازك' : 'Select file'}</span>
            </button>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Download size={16} className="text-slate-600" />
              <div>
                <span className="font-bold text-slate-800 text-xs block">
                  {language === 'ar' ? 'نموذج إرشادي جاهز' : 'Sample CSV Template'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'ar'
                    ? 'قم بتحميل ملف نموذجي مهيأ مسبقاً بالأعمدة القياسية'
                    : 'Download pre-formatted template with standard headers'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={loadSampleCsvToWizard}
              >
                <Sparkles size={14} className="text-emerald-600" />
                <span>{language === 'ar' ? 'تجربة استيراد ملف فوري' : 'Try Sample Import'}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={downloadSampleTemplate}
              >
                <Download size={14} />
                <span>{language === 'ar' ? 'تحميل ملف النموذج (CSV)' : 'Download Template'}</span>
              </button>

              {!isDemoData && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={resetToDemoData}
                >
                  <RotateCcw size={14} />
                  <span>{language === 'ar' ? 'استعادة البيانات التجريبية' : 'Restore Demo Data'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Preview */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'ar' ? 'معاينة الملف المرفوع: ' : 'Uploaded File Preview: '}
                <span className="font-mono text-teal-800">{uploadedFile?.name}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? `تم اكتشاف ${rawRows.length} صفاً و ${fileHeaders.length} عموداً.`
                  : `Detected ${rawRows.length} rows and ${fileHeaders.length} columns.`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={14} className={language === 'ar' ? 'transform rotate-180' : ''} />
                <span>{language === 'ar' ? 'تغيير الملف' : 'Change file'}</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setCurrentStep(3)}
              >
                <span>{language === 'ar' ? 'متابعة إلى مطابقة الأعمدة' : 'Next: Column Mapping'}</span>
                <ArrowRight size={14} className={language === 'ar' ? 'transform rotate-180' : ''} />
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="table-container max-h-96 shadow-xs">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12">#</th>
                  {fileHeaders.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rawRows.slice(0, 8).map((row, rIdx) => (
                  <tr key={rIdx}>
                    <td className="text-slate-400 font-mono text-xs">{rIdx + 1}</td>
                    {fileHeaders.map((h, cIdx) => (
                      <td key={cIdx} className="text-xs truncate max-w-[160px]">
                        {row[h] !== undefined ? String(row[h]) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STEP 3: Column Mapping */}
      {currentStep === 3 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'ar'
                  ? 'مطابقة أعمدة ملفك مع الحقول القياسية للمنصة'
                  : 'Map file columns to platform fields'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'قام النظام بالتعرف التلقائي على الأعمدة. يمكنك تعديل أي حقل يدويًا أدناه.'
                  : 'Automated suggestions based on headers. Adjust any field mappings if required.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentStep(2)}
              >
                <span>{language === 'ar' ? 'رجوع للمعاينة' : 'Back'}</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={runValidation}
              >
                <span>{language === 'ar' ? 'فحص وتدقيق البيانات' : 'Run Validation'}</span>
                <ArrowRight size={14} className={language === 'ar' ? 'transform rotate-180' : ''} />
              </button>
            </div>
          </div>

          {/* Mapping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            {[
              { field: 'orderId', labelAr: 'رقم الفاتورة / الطلب *', labelEn: 'Order / Invoice ID *', req: true },
              { field: 'orderDate', labelAr: 'تاريخ الطلب *', labelEn: 'Order Date *', req: true },
              { field: 'productName', labelAr: 'اسم الصنف / المنتج *', labelEn: 'Product Name *', req: true },
              { field: 'quantity', labelAr: 'الكمية المباعة *', labelEn: 'Quantity Sold *', req: true },
              { field: 'unitPrice', labelAr: 'سعر البيع للوحدة *', labelEn: 'Selling Price *', req: true },
              { field: 'customerName', labelAr: 'اسم العميل / المتجر', labelEn: 'Customer Name' },
              { field: 'customerId', labelAr: 'كود العميل', labelEn: 'Customer ID' },
              { field: 'productId', labelAr: 'كود الصنف / SKU', labelEn: 'Product ID / SKU' },
              { field: 'category', labelAr: 'التصنيف السلعي', labelEn: 'Category' },
              { field: 'unitCost', labelAr: 'سعر التكلفة (لحساب الأرباح)', labelEn: 'Unit Cost (COGS)' },
              { field: 'discount', labelAr: 'قيمة الخصم التجاري', labelEn: 'Discount' },
              { field: 'returnAmount', labelAr: 'قيمة المرتجع', labelEn: 'Return Amount' },
              { field: 'region', labelAr: 'المحافظة / الإقليم', labelEn: 'Region / City' },
              { field: 'salesRep', labelAr: 'مندوب المبيعات', labelEn: 'Sales Rep' },
            ].map(({ field, labelAr, labelEn, req }) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>{language === 'ar' ? labelAr : labelEn}</span>
                  {req && <span className="text-rose-500 font-extrabold text-[10px]">مطلوب</span>}
                </label>
                <select
                  className="select w-full text-xs"
                  value={(columnMapping as any)[field] || ''}
                  onChange={(e) =>
                    setColumnMapping({ ...columnMapping, [field]: e.target.value })
                  }
                >
                  <option value="">{language === 'ar' ? '-- غير متوفر في الملف --' : '-- Not in file --'}</option>
                  {fileHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4 & 5: Validation Results & Commit */}
      {currentStep >= 4 && validationReport && (
        <div className="space-y-6">
          {/* Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-slate-500 block">
                {language === 'ar' ? 'إجمالي الصفوف' : 'Total Rows'}
              </span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {validationReport.totalRows}
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-emerald-800 block">
                {language === 'ar' ? 'الصفوف الصالحة' : 'Valid Rows'}
              </span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                {validationReport.validRows}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-amber-800 block">
                {language === 'ar' ? 'صفوف بها تحذيرات' : 'Warning Rows'}
              </span>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">
                {validationReport.warningRows}
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs">
              <span className="text-xs font-bold text-rose-800 block">
                {language === 'ar' ? 'صفوف مرفوضة (أخطاء)' : 'Rejected (Errors)'}
              </span>
              <div className="text-2xl font-extrabold text-rose-700 mt-1">
                {validationReport.errorRows}
              </div>
            </div>
          </div>

          {/* Missing cost advisory */}
          {!validationReport.hasCostData && (
            <div className="alert-box info">
              <AlertTriangle size={18} className="text-sky-700 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold block text-sm">
                  {language === 'ar'
                    ? 'ملاحظة: لم يتم تحديد عمود سعر التكلفة (Unit Cost)'
                    : 'Notice: Unit Cost column was not mapped'}
                </span>
                <p>
                  {language === 'ar'
                    ? 'سيتم حساب الإيرادات والمبيعات بدقة كاملة، ولكن سيتم إيقاف مؤشر "إجمالي الربح" و"هامش الربح" التزاماً بمبدأ عدم التخمين.'
                    : 'Revenues will be calculated accurately, but Gross Profit and Margin metrics will be withheld to maintain audit integrity.'}
                </p>
              </div>
            </div>
          )}

          {/* Actions & Report Download */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={downloadValidationReportText}
              >
                <Download size={14} />
                <span>{language === 'ar' ? 'تنزيل تقرير التدقيق التفصيلي' : 'Download Audit Report'}</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentStep(3)}
              >
                <span>{language === 'ar' ? 'تعديل المطابقة' : 'Edit Mapping'}</span>
              </button>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              disabled={validTransactions.length === 0}
              onClick={commitImport}
            >
              <CheckCircle size={16} />
              <span>
                {language === 'ar'
                  ? `اعتماد وتحميل (${validTransactions.length}) سجلاً للوحة التحكم`
                  : `Commit and load (${validTransactions.length}) records to Dashboard`}
              </span>
            </button>
          </div>

          {/* Rejected Rows Table if any */}
          {rejectedRows.length > 0 && (
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title-wrap">
                  <h4 className="chart-title text-rose-800 flex items-center gap-2">
                    <AlertOctagon size={16} />
                    <span>{language === 'ar' ? 'الصفوف المرفوضة وأسباب الاستبعاد' : 'Rejected Rows & Reasons'}</span>
                  </h4>
                  <p className="chart-desc">
                    {language === 'ar'
                      ? 'تم استبعاد هذه السجلات لضمان عدم تشويه الحسابات الرياضية'
                      : 'Excluded to prevent metric distortion'}
                  </p>
                </div>
              </div>

              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{language === 'ar' ? 'رقم السطر' : 'Row #'}</th>
                      <th>{language === 'ar' ? 'سبب الرفض' : 'Rejection Reason'}</th>
                      <th>{language === 'ar' ? 'البيانات المسجلة' : 'Recorded Data'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedRows.map((r, i) => (
                      <tr key={i}>
                        <td className="font-mono font-bold text-rose-700 text-xs">
                          {r.rowNumber}
                        </td>
                        <td className="text-xs text-rose-800 font-semibold">{r.reason}</td>
                        <td className="font-mono text-[11px] text-slate-500 truncate max-w-xs">
                          {JSON.stringify(r.data)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
