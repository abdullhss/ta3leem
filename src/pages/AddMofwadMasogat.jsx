import { ChevronRight, Paperclip, X, Upload, Eye } from 'lucide-react'
import React, { useRef, useState, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from "framer-motion"
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import useUploadFiles from '../hooks/useUploadFiles'
import { Button } from '../ui/button'
import useMofwad from '../hooks/Mofwad/useMofwad'
import { useSelector } from 'react-redux'
import { DoTransaction } from '../services/apiServices'
import FileViewer from '../components/FileViewer'

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const AddMofwadMasogat = () => {
  const navigate = useNavigate()

  const userData = useSelector((state) => state.auth.userData);
  const { Mofwad } = useMofwad(userData?.Id);
  const data = Mofwad?.[0];
  console.log("Mofwad Data:", data);
    // Check if all required attachments are provided and not 0
    const hasAllAttachments = () => {
      const requiredAttachments = [
        data?.WorkOfficeStatementAttach,
        data?.SecurityCardAttach,
        data?.PictureAttach,
        data?.HealthCardAttach,
        data?.BirthCertificateAttach,
      ];
      
      // Add WorkforceCardAttach only for non-nationals (nationality != 1)
      if (data?.Nationality_Id != 1) {
        requiredAttachments.push(data?.WorkforceCardAttach);
      }
      
      return requiredAttachments.every(attach => attach && attach !== 0);
    };
  // Create Zod schema based on nationality
  const formSchema = useMemo(() => {
    const isNational = data?.Nationality_Id === 1;
    
    // Helper to create a required string field that handles null/undefined
    const requiredString = (errorMessage) => 
      z.union([z.string(), z.null(), z.undefined()])
        .refine((val) => val != null && val !== "" && String(val).length > 0, {
          message: errorMessage
        });
    
    // Helper to create an optional string field
    const optionalString = () => 
      z.union([z.string(), z.null(), z.undefined()]).optional();
    
    const baseSchema = z.object({
      personalPhotoFileId: optionalString(),
      birthCertificateFileId: requiredString("شهادة الميلاد مطلوبة"),
      healthCardFileId: requiredString("البطاقة الصحية مطلوبة"),
      criminalRecordFileId: requiredString("شهادة الخلو من السوابق مطلوبة"),
      laborOfficeFileId: requiredString("إفادة مكتب العمل مطلوبة"),
    });

    if (isNational) {
      // For nationals, workforceCardFileId is optional
      return baseSchema.extend({
        workforceCardFileId: optionalString(),
      });
    } else {
      // For non-nationals, workforceCardFileId is required
      return baseSchema.extend({
        workforceCardFileId: requiredString("إفادة القوى العاملة مطلوبة"),
      });
    }
  }, [data?.Nationality_Id]);

  // File input refs
  const personalPhotoRef = useRef(null)
  const birthCertificateRef = useRef(null)
  const healthCardRef = useRef(null)
  const criminalRecordRef = useRef(null)
  const laborOfficeRef = useRef(null)
  const workforceCardRef = useRef(null)

  const [uploadedFiles, setUploadedFiles] = useState({
    personalPhoto: null,
    birthCertificate: null,
    healthCard: null,
    criminalRecord: null,
    laborOffice: null,
    workforceCard: null,
  })

  const [personalPhotoPreview, setPersonalPhotoPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { uploadSingleFile } = useUploadFiles()

  const saveMofwadMasogat = async (payload) => {
    const response = await DoTransaction("ekiVNGTkL2f4U3z4PaxoxA==",
      payload,
      1,
      "Id#BirthCertificateAttach#HealthCardAttach#SecurityCardAttach#WorkOfficeStatementAttach#WorkforceCardAttach#PictureAttach"
    );
    console.log("API Response:", response);
    
    if(response.success != 200){
      toast.error(response.errorMessage || "فشل العملية")
    //   return false;
    } else {
      toast.success("تم إضافة المسوغات بنجاح")
    //   return true;
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  })

  // Pre-populate form with existing file IDs when data is available
  useEffect(() => {
    if (data) {
      // Personal Photo (PictureAttach)
      if (data.PictureAttach && data.PictureAttach !== 0) {
        setValue("personalPhotoFileId", String(data.PictureAttach), { shouldValidate: true })
        setUploadedFiles(prev => ({
          ...prev,
          personalPhoto: {
            id: data.PictureAttach,
            name: "صورة شخصية",
            type: "personalPhoto"
          }
        }))
      }

      // Birth Certificate (BirthCertificateAttach)
      if (data.BirthCertificateAttach && data.BirthCertificateAttach !== 0) {
        setValue("birthCertificateFileId", String(data.BirthCertificateAttach), { shouldValidate: true })
        setUploadedFiles(prev => ({
          ...prev,
          birthCertificate: {
            id: data.BirthCertificateAttach,
            name: "شهادة ميلاد",
            type: "birthCertificate"
          }
        }))
      }

      // Health Card (HealthCardAttach)
      if (data.HealthCardAttach && data.HealthCardAttach !== 0) {
        setValue("healthCardFileId", String(data.HealthCardAttach), { shouldValidate: true })
        setUploadedFiles(prev => ({
          ...prev,
          healthCard: {
            id: data.HealthCardAttach,
            name: "البطاقة الصحية",
            type: "healthCard"
          }
        }))
      }

      // Criminal Record (SecurityCardAttach)
      if (data.SecurityCardAttach && data.SecurityCardAttach !== 0) {
        setValue("criminalRecordFileId", String(data.SecurityCardAttach), { shouldValidate: true })
        setUploadedFiles(prev => ({
          ...prev,
          criminalRecord: {
            id: data.SecurityCardAttach,
            name: "الخلو من السوابق الجنائية",
            type: "criminalRecord"
          }
        }))
      }

      // Labor Office (WorkOfficeStatementAttach)
      if (data.WorkOfficeStatementAttach && data.WorkOfficeStatementAttach !== 0) {
        setValue("laborOfficeFileId", String(data.WorkOfficeStatementAttach), { shouldValidate: true })
        setUploadedFiles(prev => ({
          ...prev,
          laborOffice: {
            id: data.WorkOfficeStatementAttach,
            name: "إفادة من مكتب العمل",
            type: "laborOffice"
          }
        }))
      }

      // Workforce Card (WorkforceCardAttach) - only for non-nationals
      if (data.WorkforceCardAttach && data.WorkforceCardAttach !== 0) {
        setValue("workforceCardFileId", String(data.WorkforceCardAttach), { shouldValidate: true })
        setUploadedFiles(prev => ({
          ...prev,
          workforceCard: {
            id: data.WorkforceCardAttach,
            name: "إفادة القوى العاملة",
            type: "workforceCard"
          }
        }))
      }
    }
  }, [data, setValue])

  const handleFileUpload = async (file, type) => {
    if (!file) return
    
    const fileObj = {
      uid: Date.now(),
      originFileObj: file,
      name: file.name
    }

    try {
      const fileId = await uploadSingleFile(fileObj)
      if (fileId) {
        setUploadedFiles(prev => ({
          ...prev,
          [type]: {
            id: fileId,
            name: file.name,
            type: type
          }
        }))

        // Set form value based on file type
        const fieldMap = {
          personalPhoto: "personalPhotoFileId",
          birthCertificate: "birthCertificateFileId",
          healthCard: "healthCardFileId",
          criminalRecord: "criminalRecordFileId",
          laborOffice: "laborOfficeFileId",
          workforceCard: "workforceCardFileId"
        }

        if (fieldMap[type]) {
          setValue(fieldMap[type], String(fileId), { shouldValidate: true })
          // Trigger validation for the field
          await trigger(fieldMap[type]);
        }

        // Handle personal photo preview
        if (type === 'personalPhoto') {
          const reader = new FileReader()
          reader.onloadend = () => {
            setPersonalPhotoPreview(reader.result)
          }
          reader.readAsDataURL(file)
        }
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("فشل في تحميل الملف")
    }
  }

  const removeFile = (type) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: null
    }))

    const fieldMap = {
      personalPhoto: "personalPhotoFileId",
      birthCertificate: "birthCertificateFileId",
      healthCard: "healthCardFileId",
      criminalRecord: "criminalRecordFileId",
      laborOffice: "laborOfficeFileId",
      workforceCard: "workforceCardFileId"
    }

    if (fieldMap[type]) {
      setValue(fieldMap[type], "", { shouldValidate: true })
    }

    if (type === 'personalPhoto') {
      setPersonalPhotoPreview(null)
    }
  }

  const FileDisplay = ({ file, fileId }) => {
    if (!file && !fileId) return null
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-2 md:mt-0 border border-green-500 rounded-lg py-1.5 px-3 md:px-6 flex items-center justify-between bg-green-50 w-full md:w-auto gap-2"
      >
        <div className="flex items-center gap-2">
          <Paperclip size={16} className="text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700 font-medium truncate max-w-[120px] md:max-w-[200px]">
            {file?.name || 'مرفق موجود'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {fileId && fileId !== 0 && (
            <FileViewer 
              id={fileId}
              customButton={
                <button
                  type="button"
                  className="text-[#BE8D4A] hover:text-[#a67a3f] p-1 rounded flex items-center gap-1 text-sm font-semibold"
                >
                  <Eye size={16} />
                  عرض
                </button>
              }
            />
          )}
          {file && (
            <button
              type="button"
              onClick={() => removeFile(file.type)}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 flex-shrink-0"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  const onSubmit = async (formData) => {
    console.log("Form submitted!");
    console.log("Form Data:", formData);
    console.log("Mofwad Data:", data);
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Create required files array based on nationality
      let requiredFiles = [
        'birthCertificateFileId',
        'healthCardFileId',
        'criminalRecordFileId',
        'laborOfficeFileId'
      ]

      // Add workforce card if not national
      if (data?.Nationality_Id != 1) {
        requiredFiles.push('workforceCardFileId')
      }

      console.log("Required files:", requiredFiles);
      console.log("Form data values:", {
        birthCertificate: formData.birthCertificateFileId,
        healthCard: formData.healthCardFileId,
        criminalRecord: formData.criminalRecordFileId,
        laborOffice: formData.laborOfficeFileId,
        workforceCard: formData.workforceCardFileId
      });

      const missingFiles = requiredFiles.filter(field => !formData[field])
      console.log("Missing files:", missingFiles);
      
      if (missingFiles.length > 0) {
        toast.error("يرجى تحميل جميع المسوغات المطلوبة")
        setIsSubmitting(false);
        return
      }

      // Build payload
      const payload = `${data?.Id}#${formData.birthCertificateFileId}#${formData.healthCardFileId}#${formData.criminalRecordFileId}#${formData.laborOfficeFileId}#${formData.workforceCardFileId || ''}#${formData.personalPhotoFileId || ''}`
      
      console.log("API Payload:", payload);

      // Call API
      const success = await saveMofwadMasogat(payload);
      
      if (success) {
        navigate(-1);
      }
    } catch (error) {
      console.error("Error saving masogat:", error)
      toast.error("حدث خطأ أثناء إضافة المسوغات")
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFormSubmit = (e) => {
    e?.preventDefault?.();
    console.log("Form submit event triggered");
    console.log("Form errors before submit:", errors);
    console.log("Nationality ID:", data?.Nationality_Id);
    handleSubmit(
      onSubmit,
      (errors) => {
        console.log("Validation errors:", errors);
        console.log("Form validation failed");
      }
    )(e);
  }

  return (
    <div className="p-6 flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 flex items-center gap-4">
        <span 
          className="bg-black rounded-md flex-shrink-0 cursor-pointer" 
          onClick={() => navigate(-1)}
        >
          <ChevronRight className="text-white" height={20} width={20}/>
        </span>
        <h2 className="text-xl font-bold">إضافة المسوغات</h2>
      </div>

      {/* Form */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6 p-4 md:p-6 bg-white rounded-md"
      >
        <form
          onSubmit={handleFormSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        >
          {/* Personal Photo Upload Section */}
          <div className='w-full col-span-1 md:col-span-2 border-b-2 border-b-[#C0C0C0] pb-6 mb-4'>
            <h3 className="font-bold text-lg mb-4">ارفاق صورة شخصية</h3>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Image Preview/Upload Area */}
              <div 
                className="relative border-2 border-dashed border-gray-300 rounded-xl w-full max-w-[150px] h-[150px] overflow-hidden cursor-pointer hover:border-[#BE8D4A] transition-colors"
                onClick={() => personalPhotoRef.current.click()}
              >
                {personalPhotoPreview ? (
                  <>
                    <img 
                      src={personalPhotoPreview} 
                      alt="Personal photo preview" 
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay for better UX */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <div className="text-white opacity-0 hover:opacity-100 transition-opacity text-center p-4">
                        <Upload size={24} className="mx-auto mb-2" />
                        <span className="text-sm">تغيير الصورة</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
                    <Upload size={48} className="mb-4" />
                    <p className="text-center mb-2">انقر لرفع صورة شخصية</p>
                  </div>
                )}
                
                <input
                  type="file"
                  hidden
                  ref={personalPhotoRef}
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e.target.files[0], "personalPhoto")}
                />
              </div>
              
              {/* Show existing personal photo viewer if available */}
              {data?.PictureAttach && data.PictureAttach != 0 && !personalPhotoPreview ? (
                <div className="flex items-center gap-2">
                  <FileViewer 
                    id={data.PictureAttach}
                    customButton={
                      <button
                        type="button"
                        className="flex items-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded hover:bg-[#a67a3f] transition-colors"
                      >
                        <Eye size={16} />
                        عرض الصورة الحالية
                      </button>
                    }
                  />
                </div>
              ) : null}
            </div>
            
            <input
              type="hidden"
              {...register("personalPhotoFileId")}
            />
          </div>

          {/* File Attachments */}
          <div className="flex flex-col gap-6 col-span-1 md:col-span-2 mt-4">
            <h3 className="font-bold text-lg">المسوغات المطلوبة</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* شهادة ميلاد */}
              <div className="flex flex-col w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => birthCertificateRef.current.click()}
                    className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded w-full md:w-1/2 hover:bg-[#a67a3f] transition-colors"
                  >
                    <Paperclip />
                    شهادة ميلاد
                  </button>
                  
                  <FileDisplay 
                    file={uploadedFiles.birthCertificate} 
                    fileId={data?.BirthCertificateAttach && data.BirthCertificateAttach != 0 ? data.BirthCertificateAttach : null}
                  />
                </div>
                {errors.birthCertificateFileId && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.birthCertificateFileId.message}
                  </span>
                )}
                <input
                  type="file"
                  hidden
                  {...register("birthCertificateFileId")}
                  ref={birthCertificateRef}
                  onChange={(e) => handleFileUpload(e.target.files[0], "birthCertificate")}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {/* البطاقة الصحية */}
              <div className="flex flex-col w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => healthCardRef.current.click()}
                    className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded w-full md:w-1/2 hover:bg-[#a67a3f] transition-colors"
                  >
                    <Paperclip />
                    البطاقة الصحية
                  </button>
                  
                  <FileDisplay 
                    file={uploadedFiles.healthCard} 
                    fileId={data?.HealthCardAttach && data.HealthCardAttach != 0 ? data.HealthCardAttach : null}
                  />
                </div>
                {errors.healthCardFileId && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.healthCardFileId.message}
                  </span>
                )}
                <input
                  type="file"
                  hidden
                  {...register("healthCardFileId")}
                  ref={healthCardRef}
                  onChange={(e) => handleFileUpload(e.target.files[0], "healthCard")}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {/* الخلو من السوابق الجنائية */}
              <div className="flex flex-col w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => criminalRecordRef.current.click()}
                    className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded w-full md:w-1/2 hover:bg-[#a67a3f] transition-colors"
                  >
                    <Paperclip />
                    الخلو من السوابق الجنائية
                  </button>
                  
                  <FileDisplay 
                    file={uploadedFiles.criminalRecord} 
                    fileId={data?.SecurityCardAttach && data.SecurityCardAttach != 0 ? data.SecurityCardAttach : null}
                  />
                </div>
                {errors.criminalRecordFileId && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.criminalRecordFileId.message}
                  </span>
                )}
                <input
                  type="file"
                  hidden
                  {...register("criminalRecordFileId")}
                  ref={criminalRecordRef}
                  onChange={(e) => handleFileUpload(e.target.files[0], "criminalRecord")}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {/* إفادة من مكتب العمل */}
              <div className="flex flex-col w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => laborOfficeRef.current.click()}
                    className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded w-full md:w-1/2 hover:bg-[#a67a3f] transition-colors"
                  >
                    <Paperclip />
                    إفادة من مكتب العمل
                  </button>
                  
                  <FileDisplay 
                    file={uploadedFiles.laborOffice} 
                    fileId={data?.WorkOfficeStatementAttach && data.WorkOfficeStatementAttach != 0 ? data.WorkOfficeStatementAttach : null}
                  />
                </div>
                {errors.laborOfficeFileId && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.laborOfficeFileId.message}
                  </span>
                )}
                <input
                  type="file"
                  hidden
                  {...register("laborOfficeFileId")}
                  ref={laborOfficeRef}
                  onChange={(e) => handleFileUpload(e.target.files[0], "laborOffice")}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {/* Conditionally render إفادة القوى العاملة for non-nationals */}
              {data?.Nationality_Id != 1 ? (
                <div className="flex flex-col w-full col-span-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => workforceCardRef.current.click()}
                      className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded w-full md:w-1/2 hover:bg-[#a67a3f] transition-colors"
                    >
                      <Paperclip />
                      إفادة القوى العاملة
                    </button>
                    
                    <FileDisplay 
                      file={uploadedFiles.workforceCard} 
                      fileId={data?.WorkforceCardAttach && data.WorkforceCardAttach != 0 ? data.WorkforceCardAttach : null}
                    />
                  </div>
                  {errors.workforceCardFileId && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.workforceCardFileId.message}
                    </span>
                  )}
                  <input
                    type="file"
                    hidden
                    {...register("workforceCardFileId")}
                    ref={workforceCardRef}
                    onChange={(e) => handleFileUpload(e.target.files[0], "workforceCard")}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              ) : (
                // Always register the field even when not shown, so react-hook-form can handle it
                <input
                  type="hidden"
                  {...register("workforceCardFileId")}
                />
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col md:flex-row gap-4 col-span-1 md:col-span-2 pt-6 mt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded font-semibold border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white transition-colors w-full md:w-auto"
            >
              إلغاء
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#BE8D4A] text-white px-6 py-2 rounded font-semibold hover:bg-[#a67a3f] transition-colors w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ المسوغات"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddMofwadMasogat