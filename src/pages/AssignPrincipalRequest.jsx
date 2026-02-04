import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import useSchoolNewManagers from '../hooks/Mofwad/useSchoolNewManagers'
import { DoTransaction } from '../services/apiServices'

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function AssignPrincipalRequest() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm({
    defaultValues: {
      schoolManagerId: ''
    }
  })
  
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const userData = useSelector((state) => state.auth.userData)
  const educationYearData = useSelector((state) => state.auth.educationYearData)
  
  // Fetch school new managers
  const { SchoolNewManagers, loading, error } = useSchoolNewManagers(
    userData?.Id || 0,  // Mofwad_Id
    "",  // searchText
    1,   // startNumber
    10000, // rowsPerPage
    0    // ApproveStatus
  )
  
  // Watch the selected school manager to get related data
  const selectedManagerId = watch('schoolManagerId')
  const selectedManager = SchoolNewManagers?.find(
    manager => manager.id.toString() === selectedManagerId
  )
  
  // Handle form submission
  const onSubmit = async (data) => {
    if (!selectedManager) {
      toast.error('يرجى اختيار مدير مدرسة')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Prepare the columns values string based on your API requirements
      // Format: Id#Mofwad_Id#YearDesc#RequestDate#ApproveStatus#Reason#EducationYear_Id#School_Id#oldSchoolManager_Id#newSchoolManager_Id#CompanyName
      const columnsValues = `0#${userData.Id}#${educationYearData.YearDesc}#${new Date().toISOString()}#0#طلب تكليف جديد#${educationYearData.Id}#${selectedManager.School_Id}#${selectedManager.oldSchoolManager_Id}#${selectedManager.newSchoolManager_Id}#${userData.CompanyName}`
      
      const response = await DoTransaction(
        "your_stored_procedure_hash_here", // Replace with actual stored procedure hash
        columnsValues,
        0, // Action (0 for create)
        "Id#Mofwad_Id#YearDesc#RequestDate#ApproveStatus#Reason#EducationYear_Id#School_Id#oldSchoolManager_Id#newSchoolManager_Id#CompanyName" // Columns order
      )
      
      if(response.success == 200){
        toast.success('تم إرسال طلب التكليف بنجاح')
        navigate("/requests/assignments") // Adjust navigation route as needed
      }
      else{
        toast.error(response.errorMessage || 'حدث خطأ أثناء إرسال الطلب')
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع')
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
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
          <h1 className="text-lg font-bold">
            طلب تكليف مدير مدرسة جديد
          </h1>
          
          {/* View Only Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* اسم المفوض */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">اسم المفوض</label>
              <div className="border rounded-md p-3 bg-gray-50 text-gray-700 min-h-[44px]">
                {userData?.FullName || 'غير محدد'}
              </div>
            </div>
            
            {/* اسم الشركة */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">اسم الشركة</label>
              <div className="border rounded-md p-3 bg-gray-50 text-gray-700 min-h-[44px]">
                {userData?.CompanyName || 'غير محدد'}
              </div>
            </div>
            
            {/* مدير المدرسة (will be filled from selection) */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">مدير المدرسة</label>
              <div className="border rounded-md p-3 bg-gray-50 text-gray-700 min-h-[44px]">
                {selectedManager?.oldSchoolManager_FullName || 'يرجى الاختيار من القائمة أدناه'}
              </div>
            </div>
            
            {/* المدرسة (will be filled from selection) */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">المدرسة</label>
              <div className="border rounded-md p-3 bg-gray-50 text-gray-700 min-h-[44px]">
                {selectedManager?.School_FullName || 'يرجى الاختيار من القائمة أدناه'}
              </div>
            </div>
          </div>
          
          {/* Horizontal Line */}
          <hr className="border-t border-[#C0C0C0] my-2" />
          
          {/* Selection Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              برجاء اختيار مدير مدرسة غير مكلف
            </h2>
            
            <div className="flex flex-col gap-2">
              <label className="font-medium">مدير مدرسة غير مكلف</label>
              <select
                {...register('schoolManagerId', { 
                  required: 'هذا الحقل مطلوب',
                  validate: value => value !== '' || 'يرجى اختيار مدير مدرسة'
                })}
                className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
                disabled={loading}
              >
                <option value="">اختر مدير مدرسة</option>
                {SchoolNewManagers?.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.oldSchoolManager_FullName} - {manager.School_FullName}
                  </option>
                ))}
              </select>
              
              {errors.schoolManagerId && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolManagerId.message}</p>
              )}
              
              {loading && (
                <p className="text-gray-500 text-sm mt-1">جاري تحميل البيانات...</p>
              )}
              
              {error && (
                <p className="text-red-500 text-sm mt-1">حدث خطأ في تحميل البيانات</p>
              )}
              
              {!loading && SchoolNewManagers?.length === 0 && (
                <p className="text-gray-500 text-sm mt-1">لا توجد بيانات متاحة</p>
              )}
            </div>
            
            {/* Display selected manager details */}
            {selectedManager && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">تفاصيل الاختيار:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-sm text-gray-600">اسم المدير:</span>
                    <p className="font-medium">{selectedManager.oldSchoolManager_FullName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">المدرسة:</span>
                    <p className="font-medium">{selectedManager.School_FullName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">سنة التعليم:</span>
                    <p className="font-medium">{selectedManager.YearDesc}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">تاريخ الطلب:</span>
                    <p className="font-medium">
                      {new Date(selectedManager.RequestDate).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border border-red-500 text-red-500 hover:bg-red-50 w-full py-3 rounded-md font-medium transition-colors"
            >
              الغاء
            </button>
            
            <button
              type="submit"
              disabled={!isValid || isSubmitting || loading}
              className={`w-full py-3 rounded-md text-white font-medium transition-colors ${
                isValid && !isSubmitting && !loading
                  ? 'bg-[#BE8D4A] hover:bg-[#a87a3f]' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}