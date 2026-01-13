import { ChevronRight, Paperclip, X, Upload, Eye } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from "framer-motion"
import useUploadFiles from '../../../hooks/useUploadFiles'
import { Button } from '../../../ui/button'
import { DoTransaction, executeProcedure } from '../../../services/apiServices'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'
import useSchools from '../../../hooks/schools/useSchools'
import useSingleManger from '../../../hooks/manger/useSingleManger'
import FileViewer from '../../../components/FileViewer'
import { ConfirmModal } from '../../../global/global-modal/ConfirmModal'

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const AddManager = () => {
  const navigate = useNavigate()
  const location = useLocation()
  console.log(location);
  
  // Get manager ID, manager data, and action from location state
  const managerId = location.state?.managerId
  const managerData = location.state?.managerData
  const type = location.state?.type
  const action = location.state?.action || 0 // 0 = add, 1 = edit, 2 = delete
  const isEditMode = action === 1
  const isDeleteMode = action === 2
  const isViewOnly = type === "viewonly" // Check if viewonly mode
  
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const userData = useSelector((state) => state.auth.userData)
  
  
  const { uploadSingleFile } = useUploadFiles()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    getValues,
    reset,
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  // Fetch single manager data if in edit, delete, or viewonly mode
  const deleteModeManagerId = isDeleteMode && managerData ? (managerData.id || managerData.Id) : null
  const { SingleManger, loading: managerLoading } = useSingleManger(isEditMode || isViewOnly ? managerId : (isDeleteMode ? deleteModeManagerId : null));
  
  // Use managerData from state if in delete or viewonly mode, otherwise use SingleManger from API
  const currentManagerData = isDeleteMode || isViewOnly ? (managerData || SingleManger) : SingleManger

  // Populate form when manager data is loaded in edit or viewonly mode
  useEffect(() => {
    if ((isEditMode || isViewOnly) && currentManagerData && Object.keys(currentManagerData).length > 0) {
      // Set form values
      setValue('fullName', currentManagerData.FullName || '')
      setValue('email', currentManagerData.Email || '')
      setValue('motherName', currentManagerData.MotherName || '')
      setValue('nationalId', currentManagerData.NationalNum || '')
      setValue('username', currentManagerData.LoginName || '')
      // setValue('schoolId', currentManagerData.School_Id?.toString() || '')
      
      // Set file IDs (for existing files) - only set if file ID exists and is not 0
      // These will be used by FileDisplay to show view buttons
      if (currentManagerData.PictureAttach && currentManagerData.PictureAttach !== 0) {
        setValue('profileImageFileId', currentManagerData.PictureAttach)
      }
      if (currentManagerData.EductionAttach && currentManagerData.EductionAttach !== 0) {
        setValue('eduQualificationFileId', currentManagerData.EductionAttach)
      }
      if (currentManagerData.NationalNumAttach && currentManagerData.NationalNumAttach !== 0) {
        setValue('nationalIdFileId', currentManagerData.NationalNumAttach)
      }
      if (currentManagerData.SecurityCardAttach && currentManagerData.SecurityCardAttach !== 0) {
        setValue('criminalRecordFileId', currentManagerData.SecurityCardAttach)
      }
      if (currentManagerData.HealthCardAttach && currentManagerData.HealthCardAttach !== 0) {
        setValue('healthCertificateFileId', currentManagerData.HealthCardAttach)
      }
      
      // Note: Password fields are left empty for security reasons
      // User will need to enter new password if they want to change it
    }
  }, [isEditMode, isViewOnly, currentManagerData, setValue])  

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
          {file && !isViewOnly && (
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

  // Handle delete action
  const handleDelete = async () => {
    const managerToDelete = currentManagerData
    if (!managerToDelete || (!managerToDelete.id && !managerToDelete.Id)) {
      toast.error("لا يمكن حذف المدير: بيانات غير صحيحة")
      return
    }

    const managerIdToDelete = managerToDelete.id || managerToDelete.Id
    
    // For delete, we need to send minimal data with the manager ID
    // The first parameter in the data string is the ID
    const response = await DoTransaction(
      "wbMXck1ImGtMJHBzukySHA==",
      `${managerIdToDelete}`,
      2, // wanted action 2 = delete
      "Id"
    )
    
    console.log(response);
    if(response.success != 200){
      toast.error(response.errorMessage || "فشل حذف المدير")
    } else {
      toast.success("تم حذف المدير بنجاح")
      setShowDeleteModal(false)
      navigate(-1)
    }
  }

  const onSubmit = async (data) => {
    // If delete mode, show confirmation modal
    if (isDeleteMode) {
      setShowDeleteModal(true)
      return
    }

    // For viewonly mode, just navigate back
    if (isViewOnly) {
      navigate(-1)
      return
    }

    // For edit mode, password is optional (only validate if provided)
    if (!isEditMode) {
      // Check if passwords match (only for new managers)
      if (data.password !== data.confirmPassword) {
        toast.error("كلمات المرور غير متطابقة")
        return
      }
    } else {
      // For edit mode, if password is provided, check if they match
      if (data.password && data.password !== data.confirmPassword) {
        toast.error("كلمات المرور غير متطابقة")
        return
      }
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
      // schoolName: data.schoolId 
      //   ? schools.find(s => s.id.toString() === data.schoolId)?.School_FullName 
      //   : null,
    }
    
    console.log("Manager Form Data Submitted:", formData)
    
    // Use empty string if password not provided in edit mode (backend should keep existing password)
    // For new managers, password is required
    const passwordToUse = isEditMode && !data.password 
      ? '' // Empty string - backend should handle keeping existing password
      : data.password || ''
    
    // API call to save/update manager
    try {
      const response = await DoTransaction(
        "wbMXck1ImGtMJHBzukySHA==",
        `${isEditMode ? managerId : 0}#${userData.Id}#${data.fullName}#${data.motherName}#${data.email}#${data.nationalId}##${data.username}#${passwordToUse}#${data.nationalIdFileId}#${data.eduQualificationFileId}#${data.healthCertificateFileId}#${data.criminalRecordFileId}#${data.profileImageFileId || 0}`,
        action, // wanted action 0 add , 1 edit , 2 delete
        "Id#Mofwad_Id#FullName#MotherName#Email#NationalNum#School_Id#LoginName#Password#NationalNumAttach#EductionAttach#HealthCardAttach#SecurityCardAttach#PictureAttach#User_Id"
      )
      
      console.log(response)
      if(response.success !== 200) {
        toast.error(response.errorMessage || (isEditMode ? "حدث خطأ أثناء تعديل المدير" : "حدث خطأ أثناء إضافة المدير"))
      } else {
        toast.success(isEditMode ? "تم تعديل المدير بنجاح" : "تم إضافة المدير بنجاح")
        navigate(-1)
      }
    } catch (error) {
      console.error("Error saving manager:", error)
      toast.error(isEditMode ? "حدث خطأ أثناء تعديل المدير" : "حدث خطأ أثناء إضافة المدير")
    }
  }

  // Show loading state while fetching manager data in edit, delete, or viewonly mode
  if ((isEditMode || isDeleteMode || isViewOnly) && managerLoading && !managerData) {
    return (
      <div className='flex flex-col gap-6 w-full'>
        <div className="flex items-center justify-center p-8 bg-white rounded-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BE8D4A] mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات المدير...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6 w-full'>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <ConfirmModal
              desc={`هل أنت متأكد من حذف المدير "${currentManagerData?.FullName || 'هذا المدير'}"؟`}
              confirmFunc={handleDelete}
              onClose={() => setShowDeleteModal(false)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center font-bold gap-2 p-4 md:p-6 bg-white rounded-md">
        <span className="bg-black rounded-md flex-shrink-0" onClick={() => navigate(-1)}>
          <ChevronRight className="text-white cursor-pointer" height={20} width={20}/>
        </span>
        <h1 className="text-lg md:text-xl">
          {isDeleteMode 
            ? 'حذف مدير' 
            : isEditMode 
              ? 'تعديل مدير' 
              : isViewOnly
                ? 'عرض بيانات المدير'
                : 'إضافة مدير جديد'}
        </h1>
      </div>

      {!isDeleteMode && (
        /* Form */
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
              {!isViewOnly && (
                <div 
                  className="relative border-2 border-dashed border-gray-300 rounded-xl w-full max-w-[150px] h-[150px] overflow-hidden cursor-pointer hover:border-[#BE8D4A] transition-colors"
                  onClick={() => !isViewOnly && profileImageRef.current.click()}
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
                    onChange={(e) => !isViewOnly && handleFileUpload(e.target.files[0], "profileImage")}
                    disabled={isViewOnly}
                  />
                </div>
              )}
              
              {/* Show existing profile image if in viewonly, edit, or delete mode */}
              {(isViewOnly || isEditMode) && currentManagerData?.PictureAttach && currentManagerData.PictureAttach !== 0 && (
                <div className="flex flex-col items-center gap-4">
                  {isViewOnly && (
                    <div className="relative border-2 border-gray-200 rounded-xl w-full max-w-[150px] h-[150px] overflow-hidden">
                      <FileViewer 
                        id={currentManagerData.PictureAttach}
                        customButton={
                          <div className="w-full h-full">
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <Eye size={32} className="text-gray-400" />
                            </div>
                          </div>
                        }
                        showFileName={false}
                      />
                    </div>
                  )}
                  
                  {isEditMode && (
                    <FileViewer 
                      id={currentManagerData.PictureAttach}
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
                  )}
                </div>
              )}
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
              disabled={isViewOnly}
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
              disabled={isViewOnly}
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
              disabled={isViewOnly}
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
              disabled={isViewOnly}
            />
            {errors.nationalId && (
              <span className="text-red-500 text-sm mt-1">{errors.nationalId.message}</span>
            )}
          </div>

          {/* اسم المستخدم - Hide in edit mode or viewonly */}
          {!isEditMode && !isViewOnly && (
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
          )}

          {/* المدرسة */}
          {/* <div className="flex flex-col">
            <label className="mb-1 font-semibold flex items-center gap-2">
              المدرسة
            </label>
            <select
              className="border border-gray-300 rounded px-3 py-2"
              {...register("schoolId", { required: "هذا الحقل مطلوب" })}
              disabled={isViewOnly}
            >
              <option value="">اختر المدرسة</option>
              {schools?.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.School_FullName}
                </option>
              ))}
            </select>
            {errors.schoolId && (
              <span className="text-red-500 text-sm mt-1">{errors.schoolId.message}</span>
            )}
          </div> */}

          {/* كلمة المرور - Hide in edit mode or viewonly */}
          {!isEditMode && !isViewOnly && (
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
          )}

          {/* تأكيد كلمة المرور - Hide in edit mode or viewonly */}
          {!isEditMode && !isViewOnly && (
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
                  validate: value => {
                    const password = getValues('password')
                    if (!password && !value) return "هذا الحقل مطلوب"
                    if (password && value !== password) return "كلمات المرور غير متطابقة"
                    return true
                  }
                })}
              />
              {errors.confirmPassword && (
                <span className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</span>
              )}
            </div>
          )}

          {/* المرفقات */}
          {!isViewOnly && (
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
                    
                    <FileDisplay 
                      file={uploadedFiles.eduQualification} 
                      fileId={isEditMode && currentManagerData?.EductionAttach && currentManagerData.EductionAttach !== 0 ? currentManagerData.EductionAttach : null}
                    />
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
                    
                    <FileDisplay 
                      file={uploadedFiles.nationalId} 
                      fileId={isEditMode && currentManagerData?.NationalNumAttach && currentManagerData.NationalNumAttach !== 0 ? currentManagerData.NationalNumAttach : null}
                    />
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
                    
                    <FileDisplay 
                      file={uploadedFiles.criminalRecord} 
                      fileId={isEditMode && currentManagerData?.SecurityCardAttach && currentManagerData.SecurityCardAttach !== 0 ? currentManagerData.SecurityCardAttach : null}
                    />
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
                    
                    <FileDisplay 
                      file={uploadedFiles.healthCertificate} 
                      fileId={isEditMode && currentManagerData?.HealthCardAttach && currentManagerData.HealthCardAttach !== 0 ? currentManagerData.HealthCardAttach : null}
                    />
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
          )}

          {/* View only attachments display */}
          {isViewOnly && (
            <div className="flex flex-col gap-3 col-span-1 md:col-span-2 mt-4">
              <h3 className="font-bold text-lg">المرفقات</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* مرفق المؤهل العلمي التربوي */}
                {currentManagerData?.EductionAttach && currentManagerData.EductionAttach !== 0 && (
                  <div className="flex flex-col w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                      <div className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2.5 rounded w-full md:w-1/2">
                        <Paperclip />
                        المؤهل العلمي التربوي
                      </div>
                      
                      <FileDisplay 
                        file={null} 
                        fileId={currentManagerData.EductionAttach}
                      />
                    </div>
                  </div>
                )}

                {/* مرفق الرقم الوطني */}
                {currentManagerData?.NationalNumAttach && currentManagerData.NationalNumAttach !== 0 && (
                  <div className="flex flex-col w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                      <div className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2.5 rounded w-full md:w-1/2">
                        <Paperclip />
                        الرقم الوطني
                      </div>
                      
                      <FileDisplay 
                        file={null} 
                        fileId={currentManagerData.NationalNumAttach}
                      />
                    </div>
                  </div>
                )}

                {/* الخلو من السوابق الجنائية */}
                {currentManagerData?.SecurityCardAttach && currentManagerData.SecurityCardAttach !== 0 && (
                  <div className="flex flex-col w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                      <div className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2.5 rounded w-full md:w-1/2">
                        <Paperclip />
                        الخلو من السوابق الجنائية
                      </div>
                      
                      <FileDisplay 
                        file={null} 
                        fileId={currentManagerData.SecurityCardAttach}
                      />
                    </div>
                  </div>
                )}

                {/* شهادة اللياقة الصحية */}
                {currentManagerData?.HealthCardAttach && currentManagerData.HealthCardAttach !== 0 && (
                  <div className="flex flex-col w-full">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                      <div className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2.5 rounded w-full md:w-1/2">
                        <Paperclip />
                        شهادة اللياقة الصحية
                      </div>
                      
                      <FileDisplay 
                        file={null} 
                        fileId={currentManagerData.HealthCardAttach}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </motion.div>
      )}

      {isDeleteMode && (
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-6 p-4 md:p-6 bg-white rounded-md"
        >
          <div className="text-center py-8">
            <p className="text-lg text-gray-700 mb-4">
              هل أنت متأكد من حذف المدير <strong>"{currentManagerData?.FullName || 'هذا المدير'}"</strong>؟
            </p>
            <p className="text-sm text-gray-500">لا يمكن التراجع عن هذا الإجراء</p>
          </div>
        </motion.div>
      )}

      {/* Buttons - Hide in viewonly mode */}
      {!isViewOnly && (
        <div className="flex flex-col items-center font-bold gap-6 p-4 md:p-6 bg-white rounded-md">
          {!isDeleteMode && (
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <Button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded font-semibold border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white transition-colors w-full md:w-auto"
              >
                إلغاء
              </Button>

              <Button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                className="bg-[#BE8D4A] text-white px-6 py-3 rounded font-semibold hover:bg-[#a67a3f] transition-colors w-full md:w-auto"
                disabled={!managerLoading}
              >
                {isEditMode ? 'تعديل المدير' : 'حفظ المدير'}
              </Button>
            </div>
          )}
          
          {isDeleteMode && (
            <div className="flex gap-4 w-full">
              <Button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-4 rounded font-semibold w-1/2 border border-gray-500 bg-transparent text-gray-700 hover:bg-gray-100 transition-colors"
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-4 rounded font-semibold w-1/2 bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                حذف المدير
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AddManager