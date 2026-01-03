import { ChevronRight, Paperclip, X, Upload } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from "framer-motion"
import useUploadFiles from '../../../hooks/useUploadFiles'
import { Button } from '../../../ui/button'
import { DoTransaction, executeProcedure } from '../../../services/apiServices'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const AddManager = () => {
  const navigate = useNavigate()
  
  // File input refs
  const profileImageRef = useRef(null)
  const eduQualificationRef = useRef(null)
  const nationalIdRef = useRef(null)
  const criminalRecordRef = useRef(null)
  const healthCertificateRef = useRef(null)

  const [uploadedFiles, setUploadedFiles] = useState({
    profileImage: null,
    eduQualification: null,
    nationalId: null,
    criminalRecord: null,
    healthCertificate: null,
  })

  const [profileImagePreview, setProfileImagePreview] = useState(null)

  const userData = useSelector((state) => state.auth.userData)
  
  // You might want to fetch schools from API
  const [schools, setSchools] = useState([])
  
  const { uploadSingleFile } = useUploadFiles()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    getValues,
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  // Fetch schools on component mount (example)
  useEffect(() => {
    // Dummy data for demo
    const dummySchools = [
      { Id: 1, SchoolName: 'مدرسة النهضة', Location: 'الرياض' },
      { Id: 2, SchoolName: 'مدرسة الأمل', Location: 'جدة' },
      { Id: 3, SchoolName: 'مدرسة المستقبل', Location: 'الدمام' },
    ]
    setSchools(dummySchools)
  }, [])

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
          profileImage: "profileImageFileId",
          eduQualification: "eduQualificationFileId",
          nationalId: "nationalIdFileId",
          criminalRecord: "criminalRecordFileId",
          healthCertificate: "healthCertificateFileId"
        }

        if (fieldMap[type]) {
          setValue(fieldMap[type], fileId, { shouldValidate: true })
        }

        // Handle profile image preview
        if (type === 'profileImage') {
          const reader = new FileReader()
          reader.onloadend = () => {
            setProfileImagePreview(reader.result)
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
      profileImage: "profileImageFileId",
      eduQualification: "eduQualificationFileId",
      nationalId: "nationalIdFileId",
      criminalRecord: "criminalRecordFileId",
      healthCertificate: "healthCertificateFileId"
    }

    if (fieldMap[type]) {
      setValue(fieldMap[type], null, { shouldValidate: true })
    }

    if (type === 'profileImage') {
      setProfileImagePreview(null)
    }
  }

  const FileDisplay = ({ file }) => {
    if (!file) return null
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-2 md:mt-0 border border-green-500 rounded-lg py-1.5 px-3 md:px-6 flex items-center justify-between bg-green-50 w-full md:w-auto"
      >
        <div className="flex items-center gap-2">
          <Paperclip size={16} className="text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700 font-medium truncate max-w-[120px] md:max-w-[200px]">
            {file.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => removeFile(file.type)}
          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 flex-shrink-0"
        >
          <X size={18} />
        </button>
      </motion.div>
    )
  }

  const onSubmit = async (data) => {
    // Check if passwords match
    if (data.password !== data.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة")
      return
    }

    // Check if all required files are uploaded
    const requiredFiles = [
      'eduQualificationFileId',
      'nationalIdFileId',
      'criminalRecordFileId',
      'healthCertificateFileId'
    ]

    const missingFiles = requiredFiles.filter(field => !data[field])
    if (missingFiles.length > 0) {
      toast.error("يرجى تحميل جميع المرفقات المطلوبة")
      return
    }

    // Create the complete data object
    const formData = {
      ...data,
      attachments: uploadedFiles,
      schoolName: data.schoolId 
        ? schools.find(s => s.Id.toString() === data.schoolId)?.SchoolName 
        : null,
    }
    
    console.log("Manager Form Data Submitted:", formData)
    
    // API call to save manager
    try {
      const response = await DoTransaction(
        "YOUR_PROCEDURE_ID_HERE",
        `0#${data.fullName}#${data.email}#${data.motherName}#${data.nationalId}#${data.username}#${data.schoolId}#${data.password}#${data.eduQualificationFileId}#${data.nationalIdFileId}#${data.criminalRecordFileId}#${data.healthCertificateFileId}#${data.profileImageFileId || ''}`,
        0,
        "Id#FullName#Email#MotherName#NationalId#Username#School_Id#Password#EduQualificationAttach#NationalIdAttach#CriminalRecordAttach#HealthCertificateAttach#ProfileImageAttach"
      )
      
      console.log(response)
      if(response.success !== 200) {
        toast.error(response.errorMessage || "حدث خطأ أثناء إضافة المدير")
      } else {
        toast.success("تم إضافة المدير بنجاح")
        navigate(-1)
      }
    } catch (error) {
      console.error("Error saving manager:", error)
      toast.error("حدث خطأ أثناء إضافة المدير")
    }
  }

  return (
    <div className='flex flex-col gap-6 w-full'>
      {/* Header */}
      <div className="flex items-center font-bold gap-2 p-4 md:p-6 bg-white rounded-md">
        <span className="bg-black rounded-md flex-shrink-0" onClick={() => navigate(-1)}>
          <ChevronRight className="text-white cursor-pointer" height={20} width={20}/>
        </span>
        <h1 className="text-lg md:text-xl">إضافة مدير جديد</h1>
      </div>

      {/* Form */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6 p-4 md:p-6 bg-white rounded-md"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        >
          {/* Profile Image Upload Section */}
          <div className='w-full col-span-1 md:col-span-2 border-b-2 border-b-[#C0C0C0] pb-6 mb-4'>
            <h3 className="font-bold text-lg mb-4">صورة المدير</h3>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Image Preview/Upload Area */}
              <div 
                className="relative border-2 border-dashed border-gray-300 rounded-xl w-full max-w-[150px] h-[150px] overflow-hidden cursor-pointer hover:border-[#BE8D4A] transition-colors"
                onClick={() => profileImageRef.current.click()}
              >
                {profileImagePreview ? (
                  <>
                    <img 
                      src={profileImagePreview} 
                      alt="Profile preview" 
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
                    <p className="text-center mb-2">انقر لرفع صورة المدير</p>
                  </div>
                )}
                
                <input
                  type="file"
                  hidden
                  ref={profileImageRef}
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e.target.files[0], "profileImage")}
                />
              </div>
            </div>
            
            <input
              type="hidden"
              {...register("profileImageFileId")}
            />
          </div>
          {/* اسم المدير رباعي */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold flex items-center gap-2">
              اسم المدير رباعي
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2"
              placeholder="ادخل الاسم الرباعي للمدير"
              {...register("fullName", { 
                required: "هذا الحقل مطلوب",
                pattern: {
                  value: /^[\u0600-\u06FF\s]{4,}$/,
                  message: "يرجى إدخال اسم رباعي صحيح"
                }
              })}
            />
            {errors.fullName && (
              <span className="text-red-500 text-sm mt-1">{errors.fullName.message}</span>
            )}
          </div>

          {/* البريد الالكتروني */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold flex items-center gap-2">
              البريد الالكتروني
            </label>
            <input
              type="email"
              className="border border-gray-300 rounded px-3 py-2"
              placeholder="example@domain.com"
              {...register("email", { 
                required: "هذا الحقل مطلوب",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "يرجى إدخال بريد إلكتروني صحيح"
                }
              })}
            />
            {errors.email && (
              <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>
            )}
          </div>

          {/* اسم الأم رباعي */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold flex items-center gap-2">
              اسم الأم رباعي
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2"
              placeholder="ادخل الاسم الرباعي للأم"
              {...register("motherName", { 
                required: "هذا الحقل مطلوب",
                pattern: {
                  value: /^[\u0600-\u06FF\s]{4,}$/,
                  message: "يرجى إدخال اسم رباعي صحيح"
                }
              })}
            />
            {errors.motherName && (
              <span className="text-red-500 text-sm mt-1">{errors.motherName.message}</span>
            )}
          </div>

          {/* الرقم الوطني */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold flex items-center gap-2">
              الرقم الوطني
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2"
              placeholder="10 أرقام"
              {...register("nationalId", { 
                required: "هذا الحقل مطلوب",
                pattern: {
                  value: /^\d{10}$/,
                  message: "يجب أن يتكون الرقم الوطني من 10 أرقام"
                }
              })}
            />
            {errors.nationalId && (
              <span className="text-red-500 text-sm mt-1">{errors.nationalId.message}</span>
            )}
          </div>

          {/* اسم المستخدم */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold flex items-center gap-2">
              اسم المستخدم
            </label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2"
              placeholder="ادخل اسم المستخدم"
              {...register("username", { 
                required: "هذا الحقل مطلوب",
                minLength: {
                  value: 3,
                  message: "يجب أن يكون اسم المستخدم 3 أحرف على الأقل"
                }
              })}
            />
            {errors.username && (
              <span className="text-red-500 text-sm mt-1">{errors.username.message}</span>
            )}
          </div>

          {/* المدرسة */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold flex items-center gap-2">
              المدرسة
            </label>
            <select
              className="border border-gray-300 rounded px-3 py-2"
              {...register("schoolId", { required: "هذا الحقل مطلوب" })}
            >
              <option value="">اختر المدرسة</option>
              {schools?.map((school) => (
                <option key={school.Id} value={school.Id}>
                  {school.SchoolName} - {school.Location}
                </option>
              ))}
            </select>
            {errors.schoolId && (
              <span className="text-red-500 text-sm mt-1">{errors.schoolId.message}</span>
            )}
          </div>

          {/* كلمة المرور */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold flex items-center gap-2">
              كلمة المرور
            </label>
            <input
              type="password"
              className="border border-gray-300 rounded px-3 py-2"
              placeholder="كلمة المرور"
              {...register("password", { 
                required: "هذا الحقل مطلوب",
                minLength: {
                  value: 6,
                  message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل"
                }
              })}
            />
            {errors.password && (
              <span className="text-red-500 text-sm mt-1">{errors.password.message}</span>
            )}
          </div>

          {/* تأكيد كلمة المرور */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold flex items-center gap-2">
              تأكيد كلمة المرور
            </label>
            <input
              type="password"
              className="border border-gray-300 rounded px-3 py-2"
              placeholder="تأكيد كلمة المرور"
              {...register("confirmPassword", { 
                required: "هذا الحقل مطلوب",
                validate: value => 
                  value === getValues('password') || "كلمات المرور غير متطابقة"
              })}
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* المرفقات */}
          <div className="flex flex-col gap-3 col-span-1 md:col-span-2 mt-4">
            <h3 className="font-bold text-lg">المرفقات المطلوبة</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* مرفق المؤهل العلمي التربوي */}
              <div className="flex flex-col w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => eduQualificationRef.current.click()}
                    className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2.5 rounded w-full md:w-1/2"
                  >
                    <Paperclip />
                    المؤهل العلمي التربوي
                  </button>
                  
                  <FileDisplay file={uploadedFiles.eduQualification} />
                </div>
                {errors.eduQualificationFileId && (
                  <span className="text-red-500 text-sm mt-1">
                    هذا المرفق مطلوب
                  </span>
                )}
                <input
                  type="file"
                  hidden
                  {...register("eduQualificationFileId", { required: true })}
                  ref={eduQualificationRef}
                  onChange={(e) => handleFileUpload(e.target.files[0], "eduQualification")}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {/* مرفق الرقم الوطني */}
              <div className="flex flex-col w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => nationalIdRef.current.click()}
                    className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2.5 rounded w-full md:w-1/2"
                  >
                    <Paperclip />
                    الرقم الوطني
                  </button>
                  
                  <FileDisplay file={uploadedFiles.nationalId} />
                </div>
                {errors.nationalIdFileId && (
                  <span className="text-red-500 text-sm mt-1">
                    هذا المرفق مطلوب
                  </span>
                )}
                <input
                  type="file"
                  hidden
                  {...register("nationalIdFileId", { required: true })}
                  ref={nationalIdRef}
                  onChange={(e) => handleFileUpload(e.target.files[0], "nationalId")}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {/* الخلو من السوابق الجنائية */}
              <div className="flex flex-col w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => criminalRecordRef.current.click()}
                    className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2.5 rounded w-full md:w-1/2"
                  >
                    <Paperclip />
                    الخلو من السوابق الجنائية
                  </button>
                  
                  <FileDisplay file={uploadedFiles.criminalRecord} />
                </div>
                {errors.criminalRecordFileId && (
                  <span className="text-red-500 text-sm mt-1">
                    هذا المرفق مطلوب
                  </span>
                )}
                <input
                  type="file"
                  hidden
                  {...register("criminalRecordFileId", { required: true })}
                  ref={criminalRecordRef}
                  onChange={(e) => handleFileUpload(e.target.files[0], "criminalRecord")}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              {/* شهادة اللياقة الصحية */}
              <div className="flex flex-col w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => healthCertificateRef.current.click()}
                    className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2.5 rounded w-full md:w-1/2"
                  >
                    <Paperclip />
                    شهادة اللياقة الصحية
                  </button>
                  
                  <FileDisplay file={uploadedFiles.healthCertificate} />
                </div>
                {errors.healthCertificateFileId && (
                  <span className="text-red-500 text-sm mt-1">
                    هذا المرفق مطلوب
                  </span>
                )}
                <input
                  type="file"
                  hidden
                  {...register("healthCertificateFileId", { required: true })}
                  ref={healthCertificateRef}
                  onChange={(e) => handleFileUpload(e.target.files[0], "healthCertificate")}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col md:flex-row gap-4 col-span-1 md:col-span-2 pt-4 mt-4">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded font-semibold border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white transition-colors w-full md:w-auto"
            >
              إلغاء
            </Button>

            <Button
              type="submit"
              className="bg-[#BE8D4A] text-white px-6 py-3 rounded font-semibold hover:bg-[#a67a3f] transition-colors w-full md:w-auto"
            >
              حفظ المدير
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddManager