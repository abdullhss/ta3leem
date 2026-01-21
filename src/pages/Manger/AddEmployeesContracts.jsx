import React, { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Paperclip, X, Eye, ChevronRight, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { DoTransaction } from '../../services/apiServices'
import useUploadFiles from '../../hooks/useUploadFiles'
import FileViewer from '../../components/FileViewer'
import useSchoolEmployeeByDevision from '../../hooks/manger/useSchoolEmployeeByDevision'
import useSchoolJobTitle from '../../hooks/manger/useSchoolJobTitle'
import { Dialog } from '@radix-ui/react-dialog'
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog'
import { Button } from '../../ui/button'

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const AddEmployeesContracts = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm()
  
  const { userData } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const [showAddJobTitleModal, setShowAddJobTitleModal] = useState(false);
  const [jobTitleName, setJobTitleName] = useState('')
  // Get contract data and action from location state
  const contractData = location.state?.contractData
  const action = location.state?.action || 0 // 0 = add, 1 = edit
  const isEditMode = action === 1
  
  // File upload state
  const contractFileRef = useRef(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { uploadSingleFile } = useUploadFiles()
  
  // Fetch employees and job titles
  const { SchoolEmployees, loading: loadingEmployees } = useSchoolEmployeeByDevision(
    userData?.School_Id || 0,
    -1, // Get all employees (not filtered by devision)
    1,
    "",
    1,
    10000
  )
  
  const { SchoolJobTitles: jobTitles, loading: loadingJobTitles } = useSchoolJobTitle() ;
  console.log(jobTitles);
  
  // Populate form when in edit mode
  useEffect(() => {
    if (isEditMode && contractData) {
      setValue('employeeId', contractData.SchoolEmployee_Id || '')
      setValue('jobTitleId', contractData.SchoolJobTitle_Id || '')
      setValue('fromDate', contractData.FromDate?.split('T')[0] || '')
      setValue('toDate', contractData.ToDate?.split('T')[0] || '')
      
      // Set existing contract file if available
      if (contractData.ContractAttach && contractData.ContractAttach !== 0) {
        setUploadedFile({
          id: contractData.ContractAttach,
          name: contractData.ContractFileName || 'عقد العمل',
          type: 'contract'
        })
        setValue('contractFileId', contractData.ContractAttach)
      }
    }
  }, [isEditMode, contractData, setValue])
  
  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return
    
    const fileObj = {
      uid: Date.now(),
      originFileObj: file,
      name: file.name
    }
    
    try {
      setIsSubmitting(true)
      const fileId = await uploadSingleFile(fileObj)
      if (fileId) {
        setUploadedFile({
          id: fileId,
          name: file.name,
          type: 'contract'
        })
        setValue('contractFileId', fileId, { shouldValidate: true })
        toast.success('تم رفع الملف بنجاح')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('فشل في تحميل الملف')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null)
    setValue('contractFileId', '', { shouldValidate: true })
  }
  
  // File display component
  const FileDisplay = ({ file }) => {
    if (!file) return null
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-2 md:mt-0 border border-green-500 rounded-lg py-1.5 px-3 md:px-6 flex items-center justify-between bg-green-50 w-full md:w-auto gap-2"
      >
        <div className="flex items-center gap-2">
          <Paperclip size={16} className="text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700 font-medium truncate max-w-[120px] md:max-w-[200px]">
            {file.name || 'مرفق موجود'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {file.id && file.id !== 0 && (
            <FileViewer 
              id={file.id}
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
          <button
            type="button"
            onClick={removeFile}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    )
  }
  const handleAddJobTitle =  async () => {
    const response = await DoTransaction(
      "c59NIefQBJxKsiG5dAyiA9KxL8NZL7mFlQjJrzLC83c=", // Replace with actual code
      `${0}#${jobTitleName}`,
      0,
      "Id#Desription"
    )
    console.log(response);
    
    if(response.success != 200) {
      toast.error(response.errorMessage || "فشل العملية")
    } else {
      toast.success("تم إضافة الصفة الوظيفية بنجاح")
      setShowAddJobTitleModal(false)
    }
  }
  
  // Handle form submission
  const onSubmit = async (data) => {
    if (!data.contractFileId) {
      toast.error('يرجى رفع عقد العمل')
      return
    }
    
    const contractId = isEditMode
      ? (contractData?.id || contractData?.Id || 0)
      : 0
    
    // Format dates properly for API
    const formatDate = (date) => {
      if (!date) return '';
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    };
    
    const fromDate = formatDate(data.fromDate);
    const toDate = formatDate(data.toDate);
    
    
    const response = await DoTransaction(
      "O3VojVL5NIoj4UVhd5XXcOmg/8Xxx5lzsj72G46NqE0=",
      `${contractId}#${data.employeeId}#${data.jobTitleId}#${fromDate}#${toDate}#${data.contractFileId}`,
      action,
      "Id#SchoolEmployee_Id#SchoolJobDescription_Id#ContractStartDate#ContractEndDate#ContractAttach"
    )
    
    if (response.success != 200) {
      toast.error(response.errorMessage || (isEditMode ? "فشل التعديل" : "فشل العملية"))
    } else {
      toast.success(isEditMode ? "تم تعديل العقد بنجاح" : "تم إضافة العقد بنجاح")
      navigate("/EmployeesContracts") // Adjust route as needed
    }
  }
  
  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (e.g., 5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('الملف كبير جداً. الحد الأقصى 5 ميجابايت')
        return
      }
      
      // Check file type
      const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('نوع الملف غير مسموح به. المسموح: PDF, JPG, PNG, DOC')
        return
      }
      
      handleFileUpload(file)
      e.target.value = null // Reset input
    }
  }
  
  return (
    <div className="p-6 flex flex-col gap-6 w-full">
      
      {/* Form */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6 p-4 sm:p-6 bg-white rounded-lg shadow"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className='flex items-center justify-between'>
            <span className="text-lg font-bold">
              {isEditMode ? 'تعديل عقد الموظف' : 'إضافة عقد موظف'}
            </span>
            <div className='flex items-center gap-2 cursor-pointer font-semibold' onClick={() => setShowAddJobTitleModal(true)}>
              <button type="button" className="bg-black text-white p-0.5 rounded-md">
                <Plus size={16} />
              </button>
              إضافة صفة وظيفية
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* اسم الموظف */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">اسم الموظف</label>
              <select
                {...register('employeeId', { required: 'هذا الحقل مطلوب' })}
                className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
                disabled={loadingEmployees}
              >
                <option value="">اختر الموظف</option>
                {SchoolEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.FullName}
                  </option>
                ))}
              </select>
              {errors.employeeId && (
                <p className="text-red-500 text-sm mt-1">{errors.employeeId.message}</p>
              )}
            </div>
            
            {/* الصفة الوظيفية */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">الصفة الوظيفية</label>
              <select
                {...register('jobTitleId', { required: 'هذا الحقل مطلوب' })}
                className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
                disabled={loadingJobTitles}
              >
                <option value="">اختر الصفة الوظيفية</option>
                {jobTitles.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.Description}
                  </option>
                ))}
              </select>
              {errors.jobTitleId && (
                <p className="text-red-500 text-sm mt-1">{errors.jobTitleId.message}</p>
              )}
            </div>
            
            {/* من تاريخ */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">من تاريخ</label>
              <input
                type="date"
                {...register('fromDate', { required: 'هذا الحقل مطلوب' })}
                className="border rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
              />
              {errors.fromDate && (
                <p className="text-red-500 text-sm mt-1">{errors.fromDate.message}</p>
              )}
            </div>
            
            {/* الى تاريخ */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">الى تاريخ</label>
              <input
                type="date"
                {...register('toDate', { required: 'هذا الحقل مطلوب' })}
                className="border rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
              />
              {errors.toDate && (
                <p className="text-red-500 text-sm mt-1">{errors.toDate.message}</p>
              )}
            </div>
            
            {/* عقد العمل - File Uploader */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-medium">عقد العمل</label>
              <div className="flex flex-col w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => contractFileRef.current.click()}
                    className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded w-full md:w-1/2 hover:bg-[#a67a3f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    <Paperclip size={16} />
                    {isSubmitting ? 'جاري الرفع...' : 'رفع عقد العمل'}
                  </button>
                  
                  <FileDisplay file={uploadedFile} />
                </div>
                <input
                  type="file"
                  hidden
                  ref={contractFileRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <input
                  type="hidden"
                  {...register('contractFileId', { required: 'عقد العمل مطلوب' })}
                />
                {errors.contractFileId && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.contractFileId.message}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border border-red-500 text-red-500 hover:bg-red-50 w-full py-3 rounded-md font-medium transition-colors"
            >
              إلغاء
            </button>
            
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className={`w-full py-3 rounded-md text-white font-medium transition-colors ${
                isValid && !isSubmitting
                  ? 'bg-[#BE8D4A] hover:bg-[#a87a3f]' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'جاري الحفظ...' : (isEditMode ? 'تعديل' : 'إضافة')}
            </button>
          </div>
        </form>
      </motion.div>
      <Dialog open={showAddJobTitleModal} onOpenChange={setShowAddJobTitleModal}>
        <DialogContent className='p-4 md:p-5 lg:p-[20px] max-w-3xl w-[95vw] md:w-full'>
          <DialogHeader className='flex justify-center w-full'>
            <DialogTitle className='text-base md:text-lg font-bold w-full text-right border-b-2 border-[#C0C0C0] pb-2'>
              إضافة صفة وظيفية
            </DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <label className='font-medium'>الصفة الوظيفية</label>
              <input type='text' placeholder='ادخل الصفة الوظيفية' className='border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]' value={jobTitleName} onChange={(e) => setJobTitleName(e.target.value)} />
            </div>
          </div>
          
        <DialogFooter className='flex flex-col sm:flex-row items-center w-full gap-2 border-t-[1px] border-[#C0C0C0] pt-4 mt-4 md:mt-6'>
          <Button onClick={() => setShowAddJobTitleModal(false)} className='hover:bg-red-600 hover:text-white bg-white text-red-500 border border-red-500 rounded-md p-2 md:p-0.5 gap-2 w-full px-6 md:px-12'>
            الغاء
          </Button>
          <Button onClick={handleAddJobTitle} className='bg-[#BE8D4A] text-white rounded-md p-2 md:p-0.5 gap-2 w-full px-6 md:px-12'>
            اضافة
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddEmployeesContracts