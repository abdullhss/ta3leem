import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Paperclip, X, ChevronRight } from 'lucide-react'
import useGender from '../../hooks/useGender'
import useNationality from '../../hooks/useNationality'
import useUploadFiles from '../../hooks/useUploadFiles'
import { toast } from 'react-toastify'
import FileViewer from '../../components/FileViewer'
import useEducationMaterials from '../../hooks/useEducationMaterials'
import { MultiSelect } from '../../ui/multi-select'
import { DoTransaction } from '../../services/apiServices'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import useSchoolDepartment from '../../hooks/manger/useSchoolDepartment'
import useSchoolDevision from '../../hooks/manger/useSchoolDevision'
import { ConfirmModal } from '../../global/global-modal/ConfirmModal'

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

// Employee type options
const employeeTypes = [
  { id: "1", name: "اداري" },
  { id: "2", name: "معلم" },
]

// Base Zod validation schema for add
const addEmployeeSchema = z.object({
  employeeType: z.string().min(1, "نوع الموظف مطلوب"),
  employeeName: z.string().min(3, "اسم الموظف يجب أن يكون على الأقل 3 أحرف"),
  employeeNumber: z.string().min(1, "رقم الموظف مطلوب"),
  genderId: z.string().min(1, "الجنس مطلوب"),
  phone: z
    .string()
    .regex(/^09[0-9]{8}$/, "رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  loginName: z.string().min(3, "اسم المستخدم يجب أن يكون على الأقل 3 أحرف"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف"),
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  nationalityId: z.string().min(1, "الجنسية مطلوبة"),
  
  nationalId: z
    .string()
    .regex(/^[0-9]{12}$/, "الرقم الوطني يجب أن يتكون من 12 رقم")
    .optional(),
  nationalFileId: z.number().optional(),

  passportNumber: z.string().optional(),
  passportFileId: z.number().optional(),

  residenceNumber: z.string().optional(),
  residenceExpiry: z.string().optional(),
  residenceFileId: z.number().optional(),

  motherName: z.string().min(3, "اسم الأم يجب أن يكون على الأقل 3 أحرف"),
  
  educationalQualificationFileId: z.number().min(1, "المؤهل التربوي مطلوب"),
  cvFileId: z.number().min(1, "السيرة الذاتية مطلوبة"),
  
  yearsOfExperience: z.string().min(1, "سنوات الخبرة مطلوبة"),
  subjects: z.array(z.number()).optional(),
  schoolDepartmentId: z.string().optional(),
  schoolDevisionId: z.string().optional()
})
.superRefine((data, ctx) => {
  /** لو ليبي */
  if (data.nationalityId === "1") {
    if (!data.nationalId) {
      ctx.addIssue({
        path: ["nationalId"],
        message: "الرقم الوطني مطلوب",
      });
    }

    if (!data.nationalFileId) {
      ctx.addIssue({
        path: ["nationalFileId"],
        message: "مرفق الرقم الوطني مطلوب",
      });
    }
  }

  /** لو غير ليبي */
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

  // Validate password confirmation
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ["confirmPassword"],
      message: "كلمة المرور وتأكيد كلمة المرور غير متطابقين",
    });
  }

  // Validate based on employee type
  if (data.employeeType === "1") {
    // اداري - require department and division, not subjects
    if (!data.schoolDepartmentId) {
      ctx.addIssue({
        path: ["schoolDepartmentId"],
        message: "الادارة مطلوبة",
      });
    }
    if (!data.schoolDevisionId) {
      ctx.addIssue({
        path: ["schoolDevisionId"],
        message: "القسم مطلوب",
      });
    }
  } else if (data.employeeType === "2") {
    // معلم - require subjects, not department/division
    if (!data.subjects || data.subjects.length === 0) {
      ctx.addIssue({
        path: ["subjects"],
        message: "المواد المقررة مطلوبة",
      });
    }
  }
});

// Edit schema without password and loginName
const editEmployeeSchema = addEmployeeSchema
  .omit({ password: true, confirmPassword: true, loginName: true })
  .superRefine((data, ctx) => {
    // Remove password validation for edit
    /** لو ليبي */
    if (data.nationalityId === "1") {
      if (!data.nationalId) {
        ctx.addIssue({
          path: ["nationalId"],
          message: "الرقم الوطني مطلوب",
        });
      }

      if (!data.nationalFileId) {
        ctx.addIssue({
          path: ["nationalFileId"],
          message: "مرفق الرقم الوطني مطلوب",
        });
      }
    }

    /** لو غير ليبي */
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

    // Validate based on employee type
    if (data.employeeType === "1") {
      // اداري - require department and division, not subjects
      if (!data.schoolDepartmentId) {
        ctx.addIssue({
          path: ["schoolDepartmentId"],
          message: "الادارة مطلوبة",
        });
      }
      if (!data.schoolDevisionId) {
        ctx.addIssue({
          path: ["schoolDevisionId"],
          message: "القسم مطلوب",
        });
      }
    } else if (data.employeeType === "2") {
      // معلم - require subjects, not department/division
      if (!data.subjects || data.subjects.length === 0) {
        ctx.addIssue({
          path: ["subjects"],
          message: "المواد المقررة مطلوبة",
        });
      }
    }
  });

const AddEmployees = () => {
  const location = useLocation();
  const { state } = location;
  const employeeData = state?.employeeData || null;
  const action = state?.action || 0; // 0 = add, 1 = edit, 2 = delete
  
  const [uploadedFiles, setUploadedFiles] = useState({
    national: null,
    passport: null,
    residence: null,
    educationalQualification: null,
    cv: null
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const { educationMaterials, totalCount, loading: loadingEducationMaterials } = useEducationMaterials("", 1);
  
  const nationalFileRef = useRef(null)
  const passportFileRef = useRef(null)
  const residenceFileRef = useRef(null)
  const educationalQualificationRef = useRef(null)
  const cvFileRef = useRef(null)

  const { genders, loading: loadingGenders } = useGender()
  const { nationalities, loading: loadingNationalities } = useNationality()
  const { uploadSingleFile } = useUploadFiles()
  const userData = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()
  
  const isEditMode = action === 1;
  const isDeleteMode = action === 2;
  const isAddMode = action === 0;
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isAddMode ? addEmployeeSchema : editEmployeeSchema),
    defaultValues: {
      nationalityId: "",
      genderId: "",
      employeeType: "",
      yearsOfExperience: "",
      subjects: [],
      schoolDepartmentId: "",
      schoolDevisionId: "",
      // Pre-fill for edit/delete modes
      ...(employeeData && {
        employeeType: employeeData.SchoolEmployeeType_Id?.toString() || "",
        employeeName: employeeData.FullName || "",
        employeeNumber: employeeData.DefinedNum || "",
        genderId: employeeData.Gender_Id?.toString() || "",
        phone: employeeData.MobileNum || "",
        email: employeeData.Email || "",
        loginName: employeeData.LoginName || "",
        nationalityId: employeeData.Nationality_Id?.toString() || "",
        nationalId: employeeData.NationalNum || "",
        passportNumber: employeeData.PassportNum || "",
        residenceNumber: employeeData.ResidenseNum || "",
        residenceExpiry: employeeData.ResidenseEndDate || "",
        motherName: employeeData.MotherName || "",
        yearsOfExperience: employeeData.ExperinceYears || "",
        subjects: employeeData.EducationMaterialName_Ids ? 
          employeeData.EducationMaterialName_Ids.split(',').map(Number) : [],
        schoolDepartmentId: employeeData.SchoolDepartment_Id?.toString() || "",
        schoolDevisionId: employeeData.SchoolDevision_Id?.toString() || "",
      })
    }
  })

  const selectedNationality = watch("nationalityId")
  const selectedSubjects = watch("subjects") || []
  const selectedEmployeeType = watch("employeeType")
  const selectedDepartmentId = watch("schoolDepartmentId")
  const selectedDevisionId = watch("schoolDevisionId")
  
  const { SchoolDepartments, loading: loadingDepartments } = useSchoolDepartment(userData?.School_Id || 0, "")
  const { SchoolDevisions, loading: loadingDevisions } = useSchoolDevision(userData?.School_Id || 0, selectedDepartmentId || 0, "")
  
  // Reset division when department changes
  useEffect(() => {
    setValue("schoolDevisionId", "")
  }, [selectedDepartmentId, setValue])

  // Pre-fill uploaded files for edit/delete modes
  useEffect(() => {
    if (employeeData && (isEditMode || isDeleteMode)) {
      const files = {
        national: employeeData.NationalNumAttach ? {
          id: employeeData.NationalNumAttach,
          name: "مرفق الرقم الوطني",
          type: "national"
        } : null,
        passport: employeeData.PassportNumAttach ? {
          id: employeeData.PassportNumAttach,
          name: "مرفق جواز السفر",
          type: "passport"
        } : null,
        residence: employeeData.ResidenseNumAttach ? {
          id: employeeData.ResidenseNumAttach,
          name: "مرفق الإقامة",
          type: "residence"
        } : null,
        educationalQualification: employeeData.EducationCertificateAttach ? {
          id: employeeData.EducationCertificateAttach,
          name: "المؤهل التربوي",
          type: "educationalQualification"
        } : null,
        cv: employeeData.CVAttach ? {
          id: employeeData.CVAttach,
          name: "السيرة الذاتية",
          type: "cv"
        } : null
      };
      
      setUploadedFiles(files);
      
      // Set file IDs in form
      if (employeeData.NationalNumAttach) setValue("nationalFileId", employeeData.NationalNumAttach);
      if (employeeData.PassportNumAttach) setValue("passportFileId", employeeData.PassportNumAttach);
      if (employeeData.ResidenseNumAttach) setValue("residenceFileId", employeeData.ResidenseNumAttach);
      if (employeeData.EducationCertificateAttach) setValue("educationalQualificationFileId", employeeData.EducationCertificateAttach);
      if (employeeData.CVAttach) setValue("cvFileId", employeeData.CVAttach);
    }
  }, [employeeData, isEditMode, isDeleteMode, setValue]);

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    
    // Validate file type - only accept PDF
    const allowedTypes = ['application/pdf'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && fileExtension !== 'pdf') {
      toast.error("يرجى تحميل ملف PDF فقط");
      return;
    }

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
        if (type === "educationalQualification") setValue("educationalQualificationFileId", fileId)
        if (type === "cv") setValue("cvFileId", fileId)
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("فشل تحميل الملف. يرجى المحاولة مرة أخرى");
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
    if (type === "educationalQualification") setValue("educationalQualificationFileId", null)
    if (type === "cv") setValue("cvFileId", null)
  }
  
  const formatDate = (dateInput) => {
    if (!dateInput) return "01/01/1900";
    const date = new Date(dateInput);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  }
  
  const handleDelete = async () => {
    if (!employeeData || !employeeData.id) {
      toast.error("لا يمكن حذف الموظف: بيانات غير صحيحة");
      return;
    }

    try {
      const response = await DoTransaction(
        "ps1zVpV4q7/4qh8wV8pzqA==",
        `${employeeData.id}`,
        2, // delete action
        "Id"
      );
      
      if(response.success !== 200){
        toast.error(response.errorMessage || "فشل حذف الموظف");
      } else {
        toast.success("تم حذف الموظف بنجاح");
        setShowDeleteModal(false);
        navigate("/Employees");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("حدث خطأ أثناء حذف الموظف");
    }
  };
  
  const onSubmit = async (data) => {
    // If delete mode, show confirmation modal
    if (isDeleteMode) {
      setShowDeleteModal(true);
      return;
    }

    const employeeId = (isEditMode && employeeData) ? employeeData.id : 0;
    const residenceExpiryFormatted = data.residenceExpiry ? formatDate(data.residenceExpiry) : "01/01/1900";
    const loginName = isEditMode ? (data.loginName || employeeData.LoginName || "") : data.loginName;
    const password = isEditMode ? (employeeData.Password || "123456") : data.password;

    try {
      const response = await DoTransaction(
        "ps1zVpV4q7/4qh8wV8pzqA==",
        `${employeeId}#${userData.School_Id}#${data.employeeType}#${data.employeeName}#${data.employeeNumber}#${data.phone}#${data.genderId}#${data.email}#${loginName}#${password}#${data.nationalityId}#${data.nationalId || "0"}#${data.passportNumber || "0"}#${data.residenceNumber || "0"}#${data.motherName}#${uploadedFiles.national?.id || 0}#${uploadedFiles.passport?.id || 0}#${uploadedFiles.residence?.id || 0}#${residenceExpiryFormatted}#${uploadedFiles.cv?.id || 0}#${uploadedFiles.educationalQualification?.id || 0}#${data.yearsOfExperience}#${selectedSubjects.join(',')}#False#0#01/01/1900#0#0#01/01/1900##${employeeData?.IsActive || false}#${selectedDepartmentId}#${selectedDevisionId}#0#0`, 
        action, // 0 add , 1 edit , 2 delete
        "Id#School_Id#SchoolEmployeeType_Id#FullName#DefinedNum#MobileNum#Gender_Id#Email#LoginName#Password#Nationality_Id#NationalNum#PassportNum#ResidenseNum#MotherName#NationalNumAttach#PassportNumAttach#ResidenseNumAttach#ResidenseEndDate#CVAttach#EducationCertificateAttach#ExperinceYears#EducationMaterialName_Ids#IsSent#SentBy#SentDate#IsApproved#ApprovedBy#ApprovedDate#ApprovedRemarks#IsActive#SchoolDepartment_Id#SchoolDevision_Id#SchoolUserGroup_Id#User_Id"
      );
      
      if(response.success !== 200){
        toast.error(response.errorMessage || "حدث خطأ أثناء حفظ البيانات");
      } else {
        const successMessage = isEditMode ? "تم تعديل البيانات بنجاح" : "تم حفظ البيانات بنجاح";
        toast.success(successMessage);
        navigate("/Employees");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const handleAddContracts = () => {
    navigate("/Employees/Contracts/Add");
  };

  const getFormTitle = () => {
    if (isDeleteMode) return "حذف موظف";
    if (isEditMode) return "تعديل موظف";
    return "إضافة موظف";
  };

  const getButtonText = () => {
    if (isDeleteMode) return "حذف";
    if (isEditMode) return "حفظ التعديلات";
    return "حفظ";
  };

  return (
    <div className='gap-4 px-4 md:px-0 overflow-y-auto'>
      <div className='w-full relative mt-8 pb-8 p-6 bg-white rounded-lg'>
        {/* Header */}
        <div className="flex items-center font-bold gap-2 mb-6">
          <span 
            className="bg-black rounded-md flex-shrink-0 cursor-pointer" 
            onClick={() => navigate("/Employees")}
          >
            <ChevronRight className="text-white" height={20} width={20}/>
          </span>
          <h1 className='text-xl font-bold'>{getFormTitle()}</h1>
        </div>
  
        {isDeleteMode ? (
          <>
            <div className="text-center py-8">
              <p className="text-lg text-gray-700 mb-4">
                هل أنت متأكد من حذف الموظف <strong>"{employeeData?.FullName || 'هذا الموظف'}"</strong>؟
              </p>
              <p className="text-sm text-gray-500">لا يمكن التراجع عن هذا الإجراء</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mt-10">
              <button
                type="button"
                onClick={() => navigate("/Employees")}
                className="flex-1 border border-red-500 text-red-500 py-3 rounded text-lg font-semibold"
              >
                إلغاء
              </button>
              
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded text-lg font-semibold"
              >
                حذف
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
            <div className='mt-10 grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* نوع الموظف */}
              <div className='flex flex-col'>
                <label className='mb-1 font-semibold'>نوع الموظف</label>
                <select
                  className={`border border-gray-300 rounded px-3 py-1 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                  {...register("employeeType")}
                  disabled={isDeleteMode || isEditMode}
                >
                  <option value="">اختر نوع الموظف</option>
                  {employeeTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.employeeType && (
                  <span className="text-red-500 text-sm mt-1">{errors.employeeType.message}</span>
                )}
              </div>
  
              {/* اسم الموظف */}
              <div className='flex flex-col'>
                <label className='mb-1 font-semibold'>اسم الموظف</label>
                <input
                  type="text"
                  className={`border border-gray-300 rounded px-3 py-2 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                  placeholder="ادخل اسم الموظف"
                  {...register("employeeName")}
                  readOnly={isDeleteMode}
                />
                {errors.employeeName && (
                  <span className="text-red-500 text-sm mt-1">{errors.employeeName.message}</span>
                )}
              </div>
  
              {/* رقم الموظف */}
              <div className='flex flex-col'>
                <label className='mb-1 font-semibold'>رقم الموظف</label>
                <input
                  type="text"
                  className={`border border-gray-300 rounded px-3 py-2 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                  placeholder="ادخل رقم الموظف"
                  {...register("employeeNumber")}
                  readOnly={isDeleteMode}
                />
                {errors.employeeNumber && (
                  <span className="text-red-500 text-sm mt-1">{errors.employeeNumber.message}</span>
                )}
              </div>
  
              {/* الجنس */}
              <div className='flex flex-col'>
                <label className='mb-1 font-semibold'>الجنس</label>
                <select
                  className={`border border-gray-300 rounded px-3 py-1 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                  {...register("genderId")}
                  disabled={loadingGenders || isDeleteMode}
                >
                  <option value="">اختر الجنس</option>
                  {genders.map((gender) => (
                    <option key={gender.Id} value={gender.Id}>
                      {gender.Name}
                    </option>
                  ))}
                </select>
                {errors.genderId && (
                  <span className="text-red-500 text-sm mt-1">{errors.genderId.message}</span>
                )}
              </div>
  
              {/* رقم الهاتف */}
              <div className='flex flex-col'>
                <label className='mb-1 font-semibold'>رقم الهاتف</label>
                <input
                  type="tel"
                  className={`border border-gray-300 rounded px-3 py-2 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                  placeholder="09xxxxxxxx"
                  {...register("phone")}
                  readOnly={isDeleteMode}
                />
                {errors.phone && (
                  <span className="text-red-500 text-sm mt-1">{errors.phone.message}</span>
                )}
              </div>
  
              {/* البريد الإلكتروني */}
              <div className='flex flex-col'>
                <label className='mb-1 font-semibold'>البريد الإلكتروني</label>
                <input
                  type="email"
                  className={`border border-gray-300 rounded px-3 py-2 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                  placeholder="example@mail.com"
                  {...register("email")}
                  readOnly={isDeleteMode}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>
                )}
              </div>
  
              {/* اسم المستخدم - Only show in Add mode */}
              {isAddMode && (
                <div className='flex flex-col'>
                  <label className='mb-1 font-semibold'>اسم المستخدم</label>
                  <input
                    type="text"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="ادخل اسم المستخدم"
                    {...register("loginName")}
                  />
                  {errors.loginName && (
                    <span className="text-red-500 text-sm mt-1">{errors.loginName.message}</span>
                  )}
                </div>
              )}
  
              {/* كلمة المرور - Only show in Add mode */}
              {isAddMode && (
                <div className='flex flex-col'>
                  <label className='mb-1 font-semibold'>كلمة المرور</label>
                  <input
                    type="password"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="ادخل كلمة المرور"
                    {...register("password")}
                  />
                  {errors.password && (
                    <span className="text-red-500 text-sm mt-1">{errors.password.message}</span>
                  )}
                </div>
              )}
  
              {/* تأكيد كلمة المرور - Only show in Add mode */}
              {isAddMode && (
                <div className='flex flex-col'>
                  <label className='mb-1 font-semibold'>تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="أعد إدخال كلمة المرور"
                    {...register("confirmPassword")}
                  />
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</span>
                  )}
                </div>
              )}
  
              {/* الجنسية */}
              <div className='flex flex-col'>
                <label className='mb-1 font-semibold'>الجنسية</label>
                <select
                  className={`border border-gray-300 rounded px-3 py-1 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                  {...register("nationalityId")}
                  disabled={loadingNationalities || isDeleteMode}
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
  
              {/* الليبي - الرقم الوطني */}
              <AnimatePresence>
                {selectedNationality === "1" && (
                  <motion.div
                    className="flex flex-col"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={fadeIn}
                  >
                    <label className='mb-1 font-semibold'>الرقم الوطني</label>
                    <input
                      type="text"
                      className={`border border-gray-300 rounded px-3 py-2 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                      placeholder="ادخل الرقم الوطني"
                      {...register("nationalId")}
                      readOnly={isDeleteMode}
                    />
                    {errors.nationalId && (
                      <span className="text-red-500 text-sm mt-1">{errors.nationalId.message}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
  
              {/* الليبي - مرفق الرقم الوطني */}
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
                      {!isDeleteMode && (
                        <>
                          <button
                            type="button"
                            className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                            onClick={() => nationalFileRef.current.click()}
                          >
                            <Paperclip />
                            تحميل ملف PDF
                          </button>
                          <input
                            type="file"
                            ref={nationalFileRef}
                            hidden
                            onChange={(e) => handleFileUpload(e.target.files[0], "national")}
                            accept=".pdf,application/pdf"
                          />
                        </>
                      )}
                      <FileViewer id={uploadedFiles.national?.id} />
                    </div>
                    {errors.nationalFileId && (
                      <span className="text-red-500 text-sm mt-1">{errors.nationalFileId.message}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
  
              {/* غير الليبي - رقم جواز السفر */}
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
                      className={`border border-gray-300 rounded px-3 py-2 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                      placeholder="ادخل رقم جواز السفر"
                      {...register("passportNumber")}
                      readOnly={isDeleteMode}
                    />
                    {errors.passportNumber && (
                      <span className="text-red-500 text-sm mt-1">{errors.passportNumber.message}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
  
              {/* غير الليبي - مرفق جواز السفر */}
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
                      {!isDeleteMode && (
                        <>
                          <button
                            type="button"
                            className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                            onClick={() => passportFileRef.current.click()}
                          >
                            <Paperclip />
                            تحميل ملف PDF
                          </button>
                          <input
                            type="file"
                            ref={passportFileRef}
                            hidden
                            onChange={(e) => handleFileUpload(e.target.files[0], "passport")}
                            accept=".pdf,application/pdf"
                          />
                        </>
                      )}
                      <FileViewer id={uploadedFiles.passport?.id} />
                    </div>
                    {errors.passportFileId && (
                      <span className="text-red-500 text-sm mt-1">{errors.passportFileId.message}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
  
              {/* غير الليبي - رقم الإقامة */}
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
                      className={`border border-gray-300 rounded px-3 py-2 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                      placeholder="ادخل رقم الإقامة"
                      {...register("residenceNumber")}
                      readOnly={isDeleteMode}
                    />
                    {errors.residenceNumber && (
                      <span className="text-red-500 text-sm mt-1">{errors.residenceNumber.message}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
  
              {/* غير الليبي - مرفق رقم الإقامة */}
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
                      {!isDeleteMode && (
                        <>
                          <button
                            type="button"
                            className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                            onClick={() => residenceFileRef.current.click()}
                          >
                            <Paperclip />
                            تحميل ملف PDF
                          </button>
                          <input
                            type="file"
                            ref={residenceFileRef}
                            hidden
                            onChange={(e) => handleFileUpload(e.target.files[0], "residence")}
                            accept=".pdf,application/pdf"
                          />
                        </>
                      )}
                      <FileViewer id={uploadedFiles.residence?.id} />
                    </div>
                    {errors.residenceFileId && (
                      <span className="text-red-500 text-sm mt-1">{errors.residenceFileId.message}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
  
              {/* غير الليبي - تاريخ إنتهاء الإقامة */}
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
                      className={`border border-gray-300 rounded px-3 py-2 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                      {...register("residenceExpiry")}
                      readOnly={isDeleteMode}
                    />
                    {errors.residenceExpiry && (
                      <span className="text-red-500 text-sm mt-1">{errors.residenceExpiry.message}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
  
              {/* اسم الام */}
              <div className='flex flex-col'>
                <label className='mb-1 font-semibold'>اسم الام</label>
                <input
                  type="text"
                  className={`border border-gray-300 rounded px-3 py-2 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                  placeholder="ادخل اسم الام"
                  {...register("motherName")}
                  readOnly={isDeleteMode}
                />
                {errors.motherName && (
                  <span className="text-red-500 text-sm mt-1">{errors.motherName.message}</span>
                )}
              </div>
  
              {/* المؤهل التربوي */}
              <div className='flex flex-col'>
                <label className='mb-1 font-semibold'>المؤهل التربوي</label>
                <div className='flex items-center gap-6'>
                  {!isDeleteMode && (
                    <>
                      <button
                        type="button"
                        className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                        onClick={() => educationalQualificationRef.current.click()}
                      >
                        <Paperclip />
                        تحميل ملف PDF
                      </button>
                      <input
                        type="file"
                        ref={educationalQualificationRef}
                        hidden
                        onChange={(e) => handleFileUpload(e.target.files[0], "educationalQualification")}
                        accept=".pdf,application/pdf"
                      />
                    </>
                  )}
                  <FileViewer id={uploadedFiles.educationalQualification?.id} />
                </div>
                {errors.educationalQualificationFileId && (
                  <span className="text-red-500 text-sm mt-1">{errors.educationalQualificationFileId.message}</span>
                )}
              </div>
  
              {/* السيرة الذاتية */}
              <div className='flex flex-col'>
                <label className='mb-1 font-semibold'>السيرة الذاتية</label>
                <div className='flex items-center gap-6'>
                  {!isDeleteMode && (
                    <>
                      <button
                        type="button"
                        className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                        onClick={() => cvFileRef.current.click()}
                      >
                        <Paperclip />
                        تحميل ملف PDF
                      </button>
                      <input
                        type="file"
                        ref={cvFileRef}
                        hidden
                        onChange={(e) => handleFileUpload(e.target.files[0], "cv")}
                        accept=".pdf,application/pdf"
                      />
                    </>
                  )}
                  <FileViewer id={uploadedFiles.cv?.id} />
                </div>
                {errors.cvFileId && (
                  <span className="text-red-500 text-sm mt-1">{errors.cvFileId.message}</span>
                )}
              </div>
  
              {/* سنوات الخبرة */}
              <div className='flex flex-col'>
                <label className='mb-1 font-semibold'>سنوات الخبرة</label>
                <input
                  type="number"
                  className={`border border-gray-300 rounded px-3 py-2 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                  placeholder="ادخل سنوات الخبرة"
                  {...register("yearsOfExperience")}
                  readOnly={isDeleteMode}
                />
                {errors.yearsOfExperience && (
                  <span className="text-red-500 text-sm mt-1">{errors.yearsOfExperience.message}</span>
                )}
              </div>
  
              {/* اختر الادارة - Only for اداري (employeeType == 1) */}
              <AnimatePresence>
                {selectedEmployeeType === "1" && (
                  <motion.div
                    className="flex flex-col"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={fadeIn}
                  >
                    <label className='mb-1 font-semibold'>اختر الادارة</label>
                    <select
                      className={`border border-gray-300 rounded px-3 py-1 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                      {...register("schoolDepartmentId")}
                      disabled={loadingDepartments || isDeleteMode}
                    >
                      <option value="">اختر الادارة</option>
                      {SchoolDepartments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.Description}
                        </option>
                      ))}
                    </select>
                    {errors.schoolDepartmentId && (
                      <span className="text-red-500 text-sm mt-1">{errors.schoolDepartmentId.message}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
  
              {/* اختر القسم - Only for اداري (employeeType == 1) */}
              <AnimatePresence>
                {selectedEmployeeType === "1" && (
                  <motion.div
                    className="flex flex-col"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={fadeIn}
                  >
                    <label className='mb-1 font-semibold'>اختر القسم</label>
                    <select
                      className={`border border-gray-300 rounded px-3 py-1 ${isDeleteMode ? 'bg-gray-100' : ''}`}
                      {...register("schoolDevisionId")}
                      value={selectedDevisionId}
                      disabled={loadingDevisions || !selectedDepartmentId || isDeleteMode}
                    >
                      <option value="">اختر القسم</option>
                      {SchoolDevisions.map((dev) => (
                        <option key={dev.id} value={dev.id}>
                          {dev.Description}
                        </option>
                      ))}
                    </select>
                    {errors.schoolDevisionId && (
                      <span className="text-red-500 text-sm mt-1">{errors.schoolDevisionId.message}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
  
              {/* المواد المقررة - Only for معلم (employeeType == 2) */}
              <AnimatePresence>
                {selectedEmployeeType === "2" && (
                  <motion.div
                    className="flex flex-col"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={fadeIn}
                  >
                    <label className='mb-1 font-semibold'>المواد المقررة</label>
                    <MultiSelect
                      options={educationMaterials}
                      selectedValues={selectedSubjects}
                      onSelectionChange={(values) => setValue("subjects", values)}
                      loading={loadingEducationMaterials}
                      error={null}
                      placeholder="اختر المواد المقررة"
                      emptyText="لا توجد مواد متاحة"
                      itemLabel="مادة"
                      itemsLabel="مواد"
                      getValue={(option) => option.Id}
                      getLabel={(option) => option.Description}
                      className="py-1"
                      disabled={isDeleteMode}
                    />
                    {errors.subjects && (
                      <span className="text-red-500 text-sm mt-1">{errors.subjects.message}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
  
            <div className="flex flex-col md:flex-row gap-4 mt-10">
              <button
                type="button"
                onClick={() => navigate("/Employees")}
                className="flex-1 border border-red-500 text-red-500 py-3 rounded text-lg font-semibold"
              >
                إلغاء
              </button>
              
              {isAddMode && (
                <button
                  type="button"
                  onClick={handleAddContracts}
                  className="flex-1 bg-[#BE8D4A] text-white py-3 rounded text-lg font-semibold"
                >
                  إضافة العقود للموظف
                </button>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 bg-[#BE8D4A] hover:bg-[#a67a3f] text-white py-3 rounded text-lg font-semibold ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'جاري الحفظ...' : getButtonText()}
              </button>
            </div>
          </form>
        )}
  
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <ConfirmModal
                desc={`هل أنت متأكد من حذف الموظف "${employeeData?.FullName || 'هذا الموظف'}"؟`}
                confirmFunc={handleDelete}
                onClose={() => setShowDeleteModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddEmployees