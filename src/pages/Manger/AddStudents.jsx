import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Paperclip, X, Plus } from 'lucide-react'
import useNationality from '../../hooks/useNationality'
import useUploadFiles from '../../hooks/useUploadFiles'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useEducationLevel from '../../hooks/useEducationLevel'
import useEducationSecondaryLevelType from '../../hooks/useEducationSecondaryLevelType'
import useEducationClass from '../../hooks/useEducationClass'
import useStudentParents from '../../hooks/useStudentParents'
import useGender from '../../hooks/useGender'
import useStudentStatus from '../../hooks/useStudentStatus'
import useStudentTransStatus from '../../hooks/useStudentTransStatus'
import useEducationPeriod from '../../hooks/useEducationPeriod'
import useSchoolClass from '../../hooks/useSchoolClass'
import { DoTransaction } from '../../services/apiServices'
import { ConfirmModal } from '../../global/global-modal/ConfirmModal'
import useSchoolStudentDetails from '../../hooks/useSchoolStudentDetails'
import FileViewer from '../../components/FileViewer'

// Animation variants
const fadeIn = {
  initial: { opacity: 0, height: 0 },
  animate: { 
    opacity: 1, 
    height: "auto",
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    height: 0,
    transition: { duration: 0.2 }
  }
}

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.2 }
  }
}

// Zod validation schema
const addStudentSchema = z.object({
  studentName: z
    .string()
    .min(3, "اسم الطالب يجب أن يكون على الأقل 3 أحرف")
    .regex(/^[\u0600-\u06FF\s]+$/, "اسم الطالب يجب أن يكون باللغة العربية"),

  nationalityId: z.string().min(1, "الجنسية مطلوبة"),

  gender: z.enum(['1', '2'], {
    required_error: "الجنس مطلوب"
  }),

  nationalId: z.string().optional(),
  nationalFileId: z.number().optional(),
  genderId: z.string().min(1, "الجنس مطلوب"),
  passportNumber: z.string().optional(),
  passportFileId: z.number().optional(),

  administrativeNumber: z.string().optional(),

  residenceNumber: z.string().optional(),
  residenceExpiry: z.string().optional(),
  residenceFileId: z.number().optional(),

  studentStatus: z.string().min(1, "حالة الطالب مطلوبة"),
  transportDetails: z.string().min(1, "تفاصيل النقل مطلوبة"),
  grade: z.string().min(1, "الصف الدراسي مطلوب"),
  educationalStage: z.string().min(1, "المرحلة الدراسية مطلوبة"),
  educationSecondaryLevelType: z.string().optional(),
  educationPeriod: z.string().min(1, "فترة التعليم مطلوبة"),
  semester: z.string().min(1, "الفصل الدراسي مطلوب"),
  guardianId: z.string().min(1, "ولي الأمر مطلوب"),

  papersFileId: z.number().optional(),
  healthFileId: z.number().optional()
})
.superRefine((data, ctx) => {
  // إذا كان الطالب سعودي
  if (data.nationalityId === "1") {
    if (!data.nationalId) {
      ctx.addIssue({
        path: ["nationalId"],
        message: "الرقم الوطني للطالب مطلوب",
      });
    }

    if (!data.nationalFileId) {
      ctx.addIssue({
        path: ["nationalFileId"],
        message: "مرفق الرقم الوطني مطلوب",
      });
    }

    if (!data.administrativeNumber) {
      ctx.addIssue({
        path: ["administrativeNumber"],
        message: "الرقم الإداري مطلوب",
      });
    }
  }

  if (data.nationalityId !== "1") {
    const requiredFields = [
      { key: "passportNumber", msg: "رقم جواز السفر مطلوب" },
      { key: "passportFileId", msg: "مرفق جواز السفر مطلوب" },
      { key: "residenceNumber", msg: "رقم الإقامة مطلوب" },
      { key: "residenceExpiry", msg: "تاريخ انتهاء الإقامة مطلوب" },
      { key: "residenceFileId", msg: "مرفق الإقامة مطلوب" },
    ];

    requiredFields.forEach((field) => {
      if (!data[field.key]) {
        ctx.addIssue({
          path: [field.key],
          message: field.msg,
        });
      }
    });
  }

  // الشعبة الدراسية مطلوبة فقط إذا كانت المرحلة الدراسية == 4
  if (data.educationalStage === "4") {
    if (!data.educationSecondaryLevelType) {
      ctx.addIssue({
        path: ["educationSecondaryLevelType"],
        message: "الشعبة الدراسية مطلوبة",
      });
    }
  }

  // الملفات العامة المطلوبة لجميع الطلاب
  if (!data.papersFileId) {
    ctx.addIssue({
      path: ["papersFileId"],
      message: "مرفق الصحائف مطلوب",
    });
  }

  if (!data.healthFileId) {
    ctx.addIssue({
      path: ["healthFileId"],
      message: "الملف الصحي مطلوب",
    });
  }
});

const AddStudents = () => {
  const location = useLocation()
  const userData = useSelector((state) => state.auth.userData);

  // Get student data and action from location state
  const studentData = location.state?.studentData
  const action = location.state?.action || 0 // 0 = add, 1 = edit, 2 = delete
  const isEditMode = action === 1
  const isDeleteMode = action === 2
  
  // Fetch full student details only in edit mode
  const { SchoolStudentDetails, loading: loadingSchoolStudentDetails } = useSchoolStudentDetails(
    isEditMode && studentData?.id ? userData.School_Id : null,
    isEditMode && studentData?.id ? studentData.id : null
  )
  
  const [uploadedFiles, setUploadedFiles] = useState({
    national: null,
    passport: null,
    residence: null,
    papers: null,
    health: null
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const nationalFileRef = useRef(null)
  const passportFileRef = useRef(null)
  const residenceFileRef = useRef(null)
  const papersFileRef = useRef(null)
  const healthFileRef = useRef(null)

  const { nationalities, loading: loadingNationalities } = useNationality()
  const { uploadSingleFile } = useUploadFiles()
  const navigate = useNavigate();
  const { EducationLevels, loading: loadingEducationLevels } = useEducationLevel()
  const { EducationSecondaryLevelTypes, loading: loadingEducationSecondaryLevelTypes } = useEducationSecondaryLevelType()
  const { EducationClasses, loading: loadingEducationClasses } = useEducationClass()
  const [selectedEducationalStage, setSelectedEducationalStage] = useState(null)
  const [allowedEducationClasses, setAllowedEducationClasses] = useState([])
  const [allowedSchoolClasses, setAllowedSchoolClasses] = useState([])
  const [selectedEducationClass, setSelectedEducationClass] = useState(null)

  const { StudentParents, StudentParentCount, loading, error } = useStudentParents(
    userData.School_Id,
    "",
    1,
    10000
  );  
  const { SchoolClasses, loading: groupsLoading } = useSchoolClass(userData.School_Id, "", 1, 10000) ;
  
  useEffect(() => {
    if (SchoolClasses && selectedEducationalStage && selectedEducationClass) {
      setAllowedSchoolClasses(
        SchoolClasses.filter(
        (c) => c.EducationLevel_Id == selectedEducationalStage && c.EducationClass_Id == selectedEducationClass
        )
    )
    } else {
      setAllowedSchoolClasses([])
    }
  }, [selectedEducationalStage, selectedEducationClass, SchoolClasses])

  

  const {genders , loading: loadingGenders} = useGender() ; 

  const { StudentTransStatuses, loading: loadingStudentTransStatuses } = useStudentTransStatus()
  
  const { EducationPeriods, loading: loadingEducationPeriods } = useEducationPeriod()
  const {StudentStatuses, loading: loadingStudentStatuses} = useStudentStatus();
  

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      nationalityId: "",
      gender: "",
      studentStatus: "",
      transportDetails: "",
      grade: "",
      educationalStage: "",
      educationSecondaryLevelType: "",
      educationPeriod: "",
      semester: "",
      guardianId: ""
    }
  })

  const selectedNationality = watch("nationalityId")
  const selectedGender = watch("gender")
  const nationalFileId = watch("nationalFileId")
  const passportFileId = watch("passportFileId")
  const residenceFileId = watch("residenceFileId")
  const papersFileId = watch("papersFileId")
  const healthFileId = watch("healthFileId")

  // Sync genderId with gender
  useEffect(() => {
    if (selectedGender) {
      setValue("genderId", selectedGender)
    }
  }, [selectedGender, setValue])

  useEffect(() => {      
    if (selectedEducationalStage) {
    setAllowedEducationClasses(
        EducationClasses.filter(
        (c) => c.EducationLevel_Id == selectedEducationalStage
        )
    )
    }
    
    // Clear educationSecondaryLevelType if educational stage is not 4
    if (selectedEducationalStage !== "4") {
      setValue("educationSecondaryLevelType", "")
    }
}, [selectedEducationalStage, EducationClasses, setValue])

  // Populate form when in edit mode with full student details
  useEffect(() => {
    if (isEditMode && SchoolStudentDetails && SchoolStudentDetails.length > 0 && !loadingSchoolStudentDetails) {
      const details = SchoolStudentDetails[0]; // Get first item from array
      
      // Basic information
      setValue("studentName", details.FullName || '')
      setValue("nationalityId", details.Nationality_Id?.toString() || '')
      setValue("gender", details.Gender_Id?.toString() || '')
      setValue("nationalId", details.NationalNum || '')
      setValue("passportNumber", details.PassportNum || '')
      setValue("administrativeNumber", details.AdministrativeNum || '')
      setValue("residenceNumber", details.ResidenseNum || '')
      
      // Format date for residence expiry (convert from ISO string to YYYY-MM-DD format)
      if (details.ResidenseEndDate) {
        const date = new Date(details.ResidenseEndDate);
        const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        setValue("residenceExpiry", formattedDate)
      }
      
      // Status and transport
      setValue("studentStatus", details.StudentStatus_Id?.toString() || '')
      setValue("transportDetails", details.StudentTransStatus_Id?.toString() || '')
      
      // Education details
      setValue("educationalStage", details.EducationLevel_Id?.toString() || '')
      setValue("grade", details.EducationClass_Id?.toString() || '')
      // Note: semester value will be set after allowedSchoolClasses is populated (see useEffect below)
      setValue("educationSecondaryLevelType", details.EducationSecondaryLevelType_Id && details.EducationSecondaryLevelType_Id !== 0 ? details.EducationSecondaryLevelType_Id.toString() : '')
      setValue("educationPeriod", details.EducationPeriod_Id?.toString() || '')
      setValue("guardianId", details.StudentParent_Id?.toString() || '')
      
      // Set uploaded files if they exist (only if file ID is not 0)
      if (details.NationalNumAttach && details.NationalNumAttach !== 0) {
        setUploadedFiles(prev => ({ ...prev, national: { id: details.NationalNumAttach, name: 'ملف الهوية', type: 'national' } }))
        setValue("nationalFileId", details.NationalNumAttach)
      }
      if (details.PassportNumAttach && details.PassportNumAttach !== 0) {
        setUploadedFiles(prev => ({ ...prev, passport: { id: details.PassportNumAttach, name: 'ملف الجواز', type: 'passport' } }))
        setValue("passportFileId", details.PassportNumAttach)
      }
      if (details.ResidenseNumAttach && details.ResidenseNumAttach !== 0) {
        setUploadedFiles(prev => ({ ...prev, residence: { id: details.ResidenseNumAttach, name: 'ملف الإقامة', type: 'residence' } }))
        setValue("residenceFileId", details.ResidenseNumAttach)
      }
      if (details.SahefAttach && details.SahefAttach !== 0) {
        setUploadedFiles(prev => ({ ...prev, papers: { id: details.SahefAttach, name: 'ملف الصحائف', type: 'papers' } }))
        setValue("papersFileId", details.SahefAttach)
      }
      if (details.HelthFileAttach && details.HelthFileAttach !== 0) {
        setUploadedFiles(prev => ({ ...prev, health: { id: details.HelthFileAttach, name: 'الملف الصحي', type: 'health' } }))
        setValue("healthFileId", details.HelthFileAttach)
      }
      
      // Set selected educational stage and class to trigger filters
      if (details.EducationLevel_Id) {
        setSelectedEducationalStage(details.EducationLevel_Id.toString())
      }
      if (details.EducationClass_Id) {
        setSelectedEducationClass(details.EducationClass_Id.toString())
      }
    }
  }, [isEditMode, SchoolStudentDetails, loadingSchoolStudentDetails, setValue])

  // Set semester value after allowedSchoolClasses is populated in edit mode
  useEffect(() => {
    if (isEditMode && SchoolStudentDetails && SchoolStudentDetails.length > 0 && !loadingSchoolStudentDetails && allowedSchoolClasses.length > 0) {
      const details = SchoolStudentDetails[0];
      // Only set semester if allowedSchoolClasses is populated and contains the value
      if (details.SchoolClass_Id) {
        const schoolClassExists = allowedSchoolClasses.find(
          (sc) => (sc.id == details.SchoolClass_Id) || (sc.Id == details.SchoolClass_Id)
        );
        if (schoolClassExists) {
          const semesterValue = (schoolClassExists.id || schoolClassExists.Id).toString();
          setValue("semester", semesterValue, { shouldValidate: false });
        }
      }
    }
  }, [isEditMode, SchoolStudentDetails, loadingSchoolStudentDetails, allowedSchoolClasses, setValue])



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

        if (type === "national") setValue("nationalFileId", fileId)
        if (type === "passport") setValue("passportFileId", fileId)
        if (type === "residence") setValue("residenceFileId", fileId)
        if (type === "papers") setValue("papersFileId", fileId)
        if (type === "health") setValue("healthFileId", fileId)
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

    if (type === "national") setValue("nationalFileId", null)
    if (type === "passport") setValue("passportFileId", null)
    if (type === "residence") setValue("residenceFileId", null)
    if (type === "papers") setValue("papersFileId", null)
    if (type === "health") setValue("healthFileId", null)
  }

  const FileDisplay = ({ file, fileId, fileName, fileType }) => {
    // If file has an ID (existing file from edit mode or newly uploaded with ID), use FileViewer
    if (fileId && fileId !== 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 border border-green-500 rounded-lg py-1.5 px-6 flex items-center justify-between bg-green-50"
        >
          <div className="flex-1">
            <FileViewer 
              id={fileId}
              name={fileName || 'المرفق'}
            />
          </div>
          <button
            type="button"
            onClick={() => removeFile(fileType || file?.type)}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </motion.div>
      )
    }
    
    // For newly uploaded files without ID yet (during upload process)
    if (!file) return null
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-2 border border-green-500 rounded-lg py-1.5 px-6 flex items-center justify-between bg-green-50"
      >
        <div className="flex items-center gap-2">
          <Paperclip size={16} className="text-green-600" />
          <span className="text-sm text-green-700 font-medium truncate max-w-[200px]">
            {file.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => removeFile(file.type)}
          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
        >
          <X size={18} />
        </button>
      </motion.div>
    )
  }
  const formatDate = (date) => {
    const d = new Date(date);
  
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
  
    return `${day}/${month}/${year}`;
  };

  // Handle delete action
  const handleDelete = async () => {
    if (!studentData || (!studentData.id && !studentData.Id)) {
      toast.error("لا يمكن حذف الطالب: بيانات غير صحيحة")
      return
    }

    const studentIdToDelete = studentData.id || studentData.Id
    
    try {
      const response = await DoTransaction(
        "v2OlGoMIebFYixqaeVf4qQ==",
        `${studentIdToDelete}`,
        2, // wanted action 2 = delete
        "Id"
      )
      
      console.log(response)
      if(response.success != 200){
        toast.error(response.errorMessage || "فشل حذف الطالب")
      } else {
        toast.success("تم حذف الطالب بنجاح")
        setShowDeleteModal(false)
        navigate(-1)
      }
    } catch (error) {
      console.error("Error deleting student:", error)
      toast.error(error.response?.data?.errorMessage || "حدث خطأ أثناء حذف الطالب")
    }
  }
  
  const onSubmit = async (data) => {
    console.log("=== Form Submission Started ===")
    console.log("Form Data:", data)
    console.log("Form Errors:", errors)
    
    try {
      // Get student id for edit mode - prefer SchoolStudentDetails if available, otherwise use studentData
      const studentId = isEditMode 
        ? (SchoolStudentDetails && SchoolStudentDetails.length > 0 
            ? (SchoolStudentDetails[0]?.id || SchoolStudentDetails[0]?.Id)
            : (studentData?.id || studentData?.Id))
        : 0
      
      // Map form data to API parameters
      // Format: Id#School_Id#FullName#Gender_Id#Nationality_Id#NationalNum#AdministrativeNum#PassportNum#ResidenseNum#MotherName#NationalNumAttach#PassportNumAttach#ResidenseNumAttach#ResidenseEndDate#EducationLevel_Id#EducationClass_Id#SchoolClass_Id#StudentStatus_Id#StudentTransStatus_Id#SahefAttach#HelthFileAttach#StudentParent_Id#IsActive#EducationYear_Id#EducationSecondaryLevelType_Id#EducationPeriod_Id#OldStudent_Id
      
      const payload = `${studentId}#${userData.School_Id}#${data.studentName || ''}#${data.gender || ''}#${data.nationalityId || ''}#${data.nationalId || data.passportNumber}#${data.administrativeNumber || ''}#${data.passportNumber || data.nationalId}#${data.residenceNumber || data.nationalId}#${''}#${data.nationalFileId || 0}#${data.passportFileId || 0}#${data.residenceFileId || 0}#${data.residenceExpiry && formatDate(data.residenceExpiry) || 'default'}#${data.educationalStage || ''}#${data.grade || ''}#${data.semester || ''}#${data.studentStatus || ''}#${data.transportDetails || ''}#${data.papersFileId || 0}#${data.healthFileId || 0}#${data.guardianId || ''}#${"True"}#${1}#${data.educationSecondaryLevelType || ''}#${data.educationPeriod || ''}#${0}`
      
      console.log("API Payload:", payload)
      
      const response = await DoTransaction(
        "v2OlGoMIebFYixqaeVf4qQ==",
        payload,
        action, // action 0 add, 1 edit, 2 delete
        "Id#School_Id#FullName#Gender_Id#Nationality_Id#NationalNum#AdministrativeNum#PassportNum#ResidenseNum#MotherName#NationalNumAttach#PassportNumAttach#ResidenseNumAttach#ResidenseEndDate#EducationLevel_Id#EducationClass_Id#SchoolClass_Id#StudentStatus_Id#StudentTransStatus_Id#SahefAttach#HelthFileAttach#StudentParent_Id#IsActive#EducationYear_Id#EducationSecondaryLevelType_Id#EducationPeriod_Id#OldStudent_Id"
      )
      
      console.log("API Response:", response)
      
      if(response.success != 200){
        toast.error(response.errorMessage || (isEditMode ? "فشل تعديل الطالب" : "فشل إضافة الطالب"))
      } else {
        toast.success(isEditMode ? "تم تعديل الطالب بنجاح" : "تم إضافة الطالب بنجاح")
        navigate(-1)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error(isEditMode ? "حدث خطأ أثناء تعديل الطالب" : "حدث خطأ أثناء إضافة الطالب")
    }
  }

    const handleAddGroup = () => {
        navigate("/education-levels/groups")
    }

    const handleAddGuardian = () => {
        navigate("/education-levels/parents/add")
    }

  const onError = (errors) => {
    console.log("=== Form Validation Errors ===")
    console.log("Errors:", errors)
  }

  return (
    <div className='flex gap-4 px-4 md:px-0 justify-center overflow-y-auto'>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <ConfirmModal
              desc={`هل أنت متأكد من حذف الطالب "${studentData?.FullName || 'هذا الطالب'}"؟`}
              confirmFunc={handleDelete}
              onClose={() => setShowDeleteModal(false)}
            />
          </div>
        </div>
      )}

      <div className='w-full relative pb-8 bg-white rounded-lg p-6'>
        <span className="text-lg font-bold">
          {isDeleteMode ? 'حذف طالب' : isEditMode ? 'تعديل طالب' : 'إضافة طالب'}
        </span>
        
        {!isDeleteMode && (
          <form onSubmit={handleSubmit(onSubmit, onError)} className="mt-10">
          <div className='mt-10 grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* اسم الطالب */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>اسم الطالب</label>
              <input
                type="text"
                className='border border-gray-300 rounded px-3 py-2'
                placeholder="ادخل اسم الطالب كاملاً"
                {...register("studentName")}
              />
              {errors.studentName && (
                <span className="text-red-500 text-sm mt-1">{errors.studentName.message}</span>
              )}
            </div>

            {/* الجنسية */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الجنسية</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("nationalityId")}
                disabled={loadingNationalities}
              >
                <option value="">اختر الجنسية</option>
                {nationalities.map((nationality) => (
                  <option key={nationality.Id} value={nationality.Id}>
                    {nationality.Name}
                  </option>
                ))}
              </select>
              {errors.nationalityId && (
                <span className="text-red-500 text-sm mt-1">{errors.nationalityId.message}</span>
              )}
            </div>

            {/* الجنس */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الجنس</label>
              <div className="flex gap-6 mt-2">
                {
                  genders.map((gender) => (
                    <label className="flex items-center gap-2" key={gender.Id}>
                      <input
                          type="radio"
                          value={gender.Id}
                          {...register("gender")}
                          className="w-5 h-5 accent-[#BE8D4A]"
                        />
                      <span>{gender.Name}</span>
                    </label>
                  ))
                }
              </div>
              {errors.gender && (
                <span className="text-red-500 text-sm mt-1">{errors.gender.message}</span>
              )}
            </div>

            {/* السعودي - الرقم الوطني للطالب */}
            <AnimatePresence>
              {selectedNationality === "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className='mb-1 font-semibold'>الرقم الوطني للطالب</label>
                  <input
                    type="text"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="ادخل الرقم الوطني للطالب"
                    {...register("nationalId")}
                  />
                  {errors.nationalId && (
                    <span className="text-red-500 text-sm mt-1">{errors.nationalId.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* غير السعودي - رقم جواز السفر */}
            <AnimatePresence>
              {selectedNationality && selectedNationality !== "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideIn}
                >
                  <label className='mb-1 font-semibold'>رقم جواز السفر</label>
                  <input
                    type="text"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="ادخل رقم جواز السفر"
                    {...register("passportNumber")}
                  />
                  {errors.passportNumber && (
                    <span className="text-red-500 text-sm mt-1">{errors.passportNumber.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* غير السعودي - مرفق جواز السفر */}
            <AnimatePresence>
              {selectedNationality && selectedNationality !== "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideIn}
                >
                  <label className='mb-1 font-semibold'>مرفق جواز السفر</label>
                  <div className='flex items-center gap-6'>
                    <button
                      type="button"
                      className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                      onClick={() => passportFileRef.current.click()}
                    >
                      <Paperclip />
                      تحميل مرفق جواز السفر
                    </button>
                    <input
                      type="file"
                      ref={passportFileRef}
                      hidden
                      onChange={(e) => handleFileUpload(e.target.files[0], "passport")}
                    />
                    <FileDisplay 
                      file={uploadedFiles.passport} 
                      fileId={passportFileId}
                      fileName="مرفق جواز السفر"
                      fileType="passport"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* السعودي - مرفق الرقم الوطني */}
            <AnimatePresence>
              {selectedNationality === "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className='mb-1 font-semibold'>مرفق الرقم الوطني</label>
                  <div className='flex items-center gap-6'>
                    <button
                      type="button"
                      className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                      onClick={() => nationalFileRef.current.click()}
                    >
                      <Paperclip />
                      تحميل مرفق الرقم الوطني
                    </button>
                    <input
                      type="file"
                      ref={nationalFileRef}
                      hidden
                      onChange={(e) => handleFileUpload(e.target.files[0], "national")}
                    />
                    <FileDisplay 
                      file={uploadedFiles.national} 
                      fileId={nationalFileId}
                      fileName="مرفق الرقم الوطني"
                      fileType="national"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* السعودي - الرقم الإداري */}
            <AnimatePresence>
              {selectedNationality === "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className='mb-1 font-semibold'>الرقم الإداري</label>
                  <input
                    type="text"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="ادخل الرقم الإداري"
                    {...register("administrativeNumber")}
                  />
                  {errors.administrativeNumber && (
                    <span className="text-red-500 text-sm mt-1">{errors.administrativeNumber.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* غير السعودي - رقم الإقامة */}
            <AnimatePresence>
              {selectedNationality && selectedNationality !== "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideIn}
                >
                  <label className='mb-1 font-semibold'>رقم الإقامة</label>
                  <input
                    type="text"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="ادخل رقم الإقامة"
                    {...register("residenceNumber")}
                  />
                  {errors.residenceNumber && (
                    <span className="text-red-500 text-sm mt-1">{errors.residenceNumber.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* غير السعودي - مرفق رقم الإقامة */}
            <AnimatePresence>
              {selectedNationality && selectedNationality !== "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideIn}
                >
                  <label className='mb-1 font-semibold'>مرفق رقم الإقامة</label>
                  <div className='flex items-center gap-6'>
                    <button
                      type="button"
                      className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                      onClick={() => residenceFileRef.current.click()}
                    >
                      <Paperclip />
                      تحميل مرفق رقم الإقامة
                    </button>
                    <input
                      type="file"
                      ref={residenceFileRef}
                      hidden
                      onChange={(e) => handleFileUpload(e.target.files[0], "residence")}
                    />
                    <FileDisplay 
                      file={uploadedFiles.residence} 
                      fileId={residenceFileId}
                      fileName="مرفق رقم الإقامة"
                      fileType="residence"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* غير السعودي - تاريخ إنتهاء الإقامة */}
            <AnimatePresence>
              {selectedNationality && selectedNationality !== "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideIn}
                >
                  <label className='mb-1 font-semibold'>تاريخ إنتهاء الإقامة</label>
                  <input
                    type="date"
                    className='border border-gray-300 rounded px-3 py-2'
                    {...register("residenceExpiry")}
                  />
                  {errors.residenceExpiry && (
                    <span className="text-red-500 text-sm mt-1">{errors.residenceExpiry.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* حالة الطالب */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>حالة الطالب</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("studentStatus")}
              >
                <option value="">اختر حالة الطالب</option>
                {StudentStatuses.map((status) => (
                  <option key={status.Id} value={status.Id}>
                    {status.Description}
                  </option>
                ))}
              </select>
              {errors.studentStatus && (
                <span className="text-red-500 text-sm mt-1">{errors.studentStatus.message}</span>
              )}
            </div>

            {/* تفاصيل النقل */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>تفاصيل النقل</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("transportDetails")}
              >
                <option value="">اختر تفاصيل النقل</option>
                {StudentTransStatuses.map((status) => (
                  <option key={status.Id} value={status.Id}>
                    {status.Description}
                  </option>
                ))}
              </select>
              {errors.transportDetails && (
                <span className="text-red-500 text-sm mt-1">{errors.transportDetails.message}</span>
              )}
            </div>

            
            {/* المرحلة الدراسية */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>المرحلة الدراسية</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("educationalStage")}
                onChange={(e) => setSelectedEducationalStage(e.target.value)}
              >
                <option value="">اختر المرحلة الدراسية</option>
                {EducationLevels.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.Description}
                  </option>
                ))}
              </select>
              {errors.educationalStage && (
                <span className="text-red-500 text-sm mt-1">{errors.educationalStage.message}</span>
              )}
            </div>
            
            {/* الصف الدراسي */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الصف الدراسي</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("grade")}
                onChange={(e) => setSelectedEducationClass(e.target.value)}
              >
                <option value="">اختر الصف الدراسي</option>
                {allowedEducationClasses.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.Description}
                  </option>
                ))}
              </select>
              {errors.grade && (
                <span className="text-red-500 text-sm mt-1">{errors.grade.message}</span>
              )}
            </div>

            {/* الشعبة الدراسية - تظهر فقط إذا كانت المرحلة الدراسية == 4 */}
            <AnimatePresence>
              {selectedEducationalStage === "4" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className='mb-1 font-semibold'>الشعبة الدراسية</label>
                  <select
                    className='border border-gray-300 rounded px-3 py-2'
                    {...register("educationSecondaryLevelType")}
                    disabled={loadingEducationSecondaryLevelTypes}
                  >
                    <option value="">اختر الشعبة الدراسية</option>
                    {EducationSecondaryLevelTypes.map((type) => (
                      <option key={type.Id || type.id} value={type.Id || type.id}>
                        {type.Description}
                      </option>
                    ))}
                  </select>
                  {errors.educationSecondaryLevelType && (
                    <span className="text-red-500 text-sm mt-1">{errors.educationSecondaryLevelType.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* فترة التعليم */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>فترة التعليم</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("educationPeriod")}
                disabled={loadingEducationPeriods}
              >
                <option value="">اختر فترة التعليم</option>
                {EducationPeriods.map((period) => (
                  <option key={period.Id || period.id} value={period.Id || period.id}>
                    {period.Description}
                  </option>
                ))}
              </select>
              {errors.educationPeriod && (
                <span className="text-red-500 text-sm mt-1">{errors.educationPeriod.message}</span>
              )}
            </div>

            {/* الفصل الدراسي مع زر إضافة مجموعة */}
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1 flex flex-col'>
                <label className='mb-1 font-semibold'>الفصل الدراسي</label>
                <select
                  className='border border-gray-300 rounded px-3 py-2'
                  {...register("semester")}
                >
                  <option value="">اختر الفصل الدراسي</option>
                  {allowedSchoolClasses.map((semester) => (
                    <option key={semester.id || semester.Id} value={semester.id || semester.Id}>
                      {semester.Descrition || semester.Description || semester.SchoolClass_Description}
                    </option>
                  ))}
                </select>
                {errors.semester && (
                  <span className="text-red-500 text-sm mt-1">{errors.semester.message}</span>
                )}
              </div>
              <div className='flex items-end'>
                <button
                  type="button"
                  onClick={handleAddGroup}
                  className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2.5 rounded h-[42px]'
                >
                  <Plus size={18} />
                  إضافة مجموعة
                </button>
              </div>
            </div>

            {/* ولي الأمر مع زر إضافة ولي الأمر */}
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1 flex flex-col'>
                <label className='mb-1 font-semibold'>ولي الأمر</label>
                <select
                  className='border border-gray-300 rounded px-3 py-2'
                  {...register("guardianId")}
                >
                  <option value="">اختر ولي الأمر</option>
                  {StudentParents.map((guardian) => (
                    <option key={guardian.id} value={guardian.id}>
                      {guardian.FullName}
                    </option>
                  ))}
                </select>
                {errors.guardianId && (
                  <span className="text-red-500 text-sm mt-1">{errors.guardianId.message}</span>
                )}
              </div>
              <div className='flex items-end'>
                <button
                  type="button"
                  onClick={handleAddGuardian}
                  className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2.5 rounded h-[42px]'
                >
                  <Plus size={18} />
                  إضافة ولي الأمر
                </button>
              </div>
            </div>

            {/* الصحائف - ملفات uploader */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الصحائف</label>
              <div className='flex items-center gap-6'>
                <button
                  type="button"
                  className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                  onClick={() => papersFileRef.current.click()}
                >
                  <Paperclip />
                  تحميل الصحائف
                </button>
                <input
                  type="file"
                  ref={papersFileRef}
                  hidden
                  onChange={(e) => handleFileUpload(e.target.files[0], "papers")}
                />
                <FileDisplay 
                  file={uploadedFiles.papers} 
                  fileId={papersFileId}
                  fileName="ملف الصحائف"
                  fileType="papers"
                />
              </div>
              {errors.papersFileId && (
                <span className="text-red-500 text-sm mt-1">{errors.papersFileId.message}</span>
              )}
            </div>

            {/* الملف الصحي - ملفات uploader */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الملف الصحي</label>
              <div className='flex items-center gap-6'>
                <button
                  type="button"
                  className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                  onClick={() => healthFileRef.current.click()}
                >
                  <Paperclip />
                  تحميل الملف الصحي
                </button>
                <input
                  type="file"
                  ref={healthFileRef}
                  hidden
                  onChange={(e) => handleFileUpload(e.target.files[0], "health")}
                />
                <FileDisplay 
                  file={uploadedFiles.health} 
                  fileId={healthFileId}
                  fileName="الملف الصحي"
                  fileType="health"
                />
              </div>
              {errors.healthFileId && (
                <span className="text-red-500 text-sm mt-1">{errors.healthFileId.message}</span>
              )}
            </div>
          </div>

          {/* أزرار الإضافة والإلغاء */}
          <div className="flex w-full gap-4 mt-10">
            <button
            type="button"
            className="w-full text-red-500 border border-red-500 transition-all duration-300 px-8 py-3 rounded text-lg font-semibold hover:bg-red-500 hover:text-white"
            onClick={() => navigate(-1)}
            >
            إلغاء
            </button>
            <button
            type="submit"
            className="bg-[#BE8D4A] w-full text-white px-8 py-3 rounded text-lg font-semibold hover:bg-[#a67c42]"
            >
            {isEditMode ? 'تعديل' : 'إضافة طالب'}
            </button>
          </div>
        </form>
        )}
        
        {isDeleteMode && (
          <div className="flex flex-col gap-6 pt-4 mt-10">
            <div className="text-center py-8">
              <p className="text-lg text-gray-700 mb-4">
                هل أنت متأكد من حذف الطالب <strong>"{studentData?.FullName || 'هذا الطالب'}"</strong>؟
              </p>
              <p className="text-sm text-gray-500">لا يمكن التراجع عن هذا الإجراء</p>
            </div>
            <div className="flex gap-6">
              <button
                type="button"
                className="border border-gray-500 text-gray-700 w-full py-3 rounded-md hover:bg-gray-100 transition-colors"
                onClick={() => navigate(-1)}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="w-full py-3 rounded-md text-white bg-red-500 hover:bg-red-600 transition-colors"
                onClick={() => setShowDeleteModal(true)}
              >
                حذف الطالب
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddStudents