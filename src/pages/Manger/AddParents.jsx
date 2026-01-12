import React, { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { DoTransaction } from '../../services/apiServices'
import { ConfirmModal } from '../../global/global-modal/ConfirmModal'

const formSchema = z.object({
  name: z.string()
    .min(1, { message: "الاسم مطلوب" })
    .min(2, { message: "يجب أن يكون الاسم أكثر من حرفين" }),
  
  phone: z.string()
    .min(1, { message: "رقم الهاتف مطلوب" })
    .regex(/^[0-9]+$/, { message: "يجب أن يحتوي رقم الهاتف على أرقام فقط" })
    .min(10, { message: "يجب أن يكون رقم الهاتف 10 أرقام على الأقل" }),
  
  whatsapp: z.string()
    .min(1, { message: "هاتف الواتس مطلوب" })
    .regex(/^[0-9]+$/, { message: "يجب أن يحتوي رقم الواتس على أرقام فقط" })
    .min(10, { message: "يجب أن يكون رقم الواتس 10 أرقام على الأقل" }),
  
  email: z.string()
    .min(1, { message: "البريد الإلكتروني مطلوب" })
    .email({ message: "البريد الإلكتروني غير صالح" }),
  
  address: z.string()
    .min(1, { message: "عنوان السكن مطلوب" })
    .min(5, { message: "يجب أن يكون العنوان أكثر تفصيلاً" }),
  
  nationalId: z.string()
    .min(1, { message: "الرقم الوطني مطلوب" })
    .regex(/^[0-9]+$/, { message: "يجب أن يحتوي الرقم الوطني على أرقام فقط" })
    .min(10, { message: "يجب أن يكون الرقم الوطني 10 أرقام على الأقل" })
})


const AddParents = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get parent data and action from location state
  const parentData = location.state?.parentData
  const action = location.state?.action || 0 // 0 = add, 1 = edit, 2 = delete
  const isEditMode = action === 1
  const isDeleteMode = action === 2
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const { 
    register, 
    handleSubmit, 
    setValue,
    formState: { errors, isDirty, isValid, isSubmitting } 
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      nationalId: ''
    }
  })
  
  // Populate form when in edit mode
  useEffect(() => {
    if (isEditMode && parentData) {
      setValue('name', parentData.FullName || '')
      setValue('phone', parentData.MobileNum || '')
      setValue('whatsapp', parentData.WhatsupNum || '')
      setValue('email', parentData.Email || '')
      setValue('address', parentData.Address || '')
      setValue('nationalId', parentData.IdNum || '')
    }
  }, [isEditMode, parentData, setValue])

  // Handle delete action
  const handleDelete = async () => {
    if (!parentData || (!parentData.id && !parentData.Id)) {
      toast.error("لا يمكن حذف الولي الأمر: بيانات غير صحيحة")
      return
    }

    const parentIdToDelete = parentData.id || parentData.Id
    
    try {
      const response = await DoTransaction(
        "C/r/WfbHmx4eCw17BNaEQw==",
        `${parentIdToDelete}`,
        2, // wanted action 2 = delete
        "Id"
      )
      
      console.log(response)
      if(response.success != 200){
        toast.error(response.errorMessage || "فشل حذف الولي الأمر")
      } else {
        toast.success("تم حذف الولي الأمر بنجاح")
        setShowDeleteModal(false)
        navigate(-1)
      }
    } catch (error) {
      console.error("Error deleting parent:", error)
      toast.error(error.response?.data?.errorMessage || "حدث خطأ أثناء حذف الولي الأمر")
    }
  }

  const onSubmit = async (data) => {
    // If delete mode, show confirmation modal
    if (isDeleteMode) {
      setShowDeleteModal(true)
      return
    }

    console.log(data)
    
    const parentId = isEditMode ? (parentData?.id || parentData?.Id || 0) : 0
    const schoolId = parentData?.School_Id || 0
    
    try {
      const response = await DoTransaction(
        "C/r/WfbHmx4eCw17BNaEQw==",
        `${parentId}#${schoolId}#${data.name}#${data.phone}#${data.whatsapp}#${data.email}#${data.address}#${data.nationalId}`,
        action, // wanted action 0 add , 1 edit , 2 delete
        "Id#School_Id#FullName#MobileNum#WhatsupNum#Email#Address#IdNum"
      )
      console.log(response)
      if(response.success != 200){
        toast.error(response.errorMessage || (isEditMode ? "فشل تعديل الولي الأمر" : "فشل العملية"))
      } else {
        toast.success(isEditMode ? "تم تعديل الولي الأمر بنجاح" : "تم إضافة الولي الأمر بنجاح")
        navigate(-1)
      }
    } catch (error) {
      console.error("Error saving parent:", error)
      toast.error(error.response?.data?.errorMessage || (isEditMode ? "حدث خطأ أثناء تعديل الولي الأمر" : "حدث خطأ أثناء إضافة الولي الأمر"))
    }
  }

  return (
    <div className='flex flex-col gap-6 w-full'>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <ConfirmModal
              desc={`هل أنت متأكد من حذف الولي الأمر "${parentData?.FullName || 'هذا الولي الأمر'}"؟`}
              confirmFunc={handleDelete}
              onClose={() => setShowDeleteModal(false)}
            />
          </div>
        </div>
      )}

      <div className='flex flex-col font-bold gap-6 p-4 md:p-6 bg-white rounded-md'>
        <div className="flex items-center font-bold gap-2">
          <button 
            className="bg-black rounded-md flex-shrink-0 hover:bg-gray-800 transition-colors p-1"
            onClick={() => navigate(-1)}
            type="button"
            aria-label="رجوع"
          >
            <ChevronRight className="text-white cursor-pointer" height={20} width={20}/>
          </button>
          <h1 className="text-lg md:text-xl">
            {isDeleteMode 
              ? 'حذف ولي أمر' 
              : isEditMode 
                ? 'تعديل ولي أمر' 
                : 'إضافة ولي أمر جديد'}
          </h1>
        </div>
        
        {!isDeleteMode && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-medium">
            {/* Name Field */}
            <div className="col-span-1">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  الاسم <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="أدخل الاسم الكامل"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>
            </div>

            {/* Phone Field */}
            <div className="col-span-1">
              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="01XXXXXXXX"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* WhatsApp Field */}
            <div className="col-span-1">
              <div className="flex flex-col gap-2">
                <label htmlFor="whatsapp" className="text-sm font-medium">
                  هاتف الواتس <span className="text-red-500">*</span>
                </label>
                <input
                  id="whatsapp"
                  type="tel"
                  placeholder="01XXXXXXXX"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] ${
                    errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register("whatsapp")}
                />
                {errors.whatsapp && (
                  <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="col-span-1">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  البريد الإلكتروني <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="example@domain.com"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Address Field */}
            <div className="col-span-1">
              <div className="flex flex-col gap-2">
                <label htmlFor="address" className="text-sm font-medium">
                  عنوان السكن <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  type="text"
                  placeholder="أدخل العنوان الكامل"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                )}
              </div>
            </div>

            {/* National ID Field */}
            <div className="col-span-1">
              <div className="flex flex-col gap-2">
                <label htmlFor="nationalId" className="text-sm font-medium">
                  الرقم الوطني <span className="text-red-500">*</span>
                </label>
                <input
                  id="nationalId"
                  type="text"
                  placeholder="10XXXXXXXX"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] ${
                    errors.nationalId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...register("nationalId")}
                />
                {errors.nationalId && (
                  <p className="text-red-500 text-xs mt-1">{errors.nationalId.message}</p>
                )}
              </div>
            </div>
          </div>

          {!isDeleteMode && (
            <div className="flex gap-6 pt-4">
              <button
                type="button"
                className="border border-red-500 text-red-500 w-full py-3 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="w-full py-3 rounded-md text-white bg-[#BE8D4A] hover:bg-[#a87c3e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={(!isDirty && !isEditMode) || !isValid || isSubmitting}
              >
                {isSubmitting ? 'جاري الحفظ...' : (isEditMode ? 'تعديل' : 'حفظ')}
              </button>
            </div>
          )}
        </form>
        )}
        
        {isDeleteMode && (
          <div className="flex flex-col gap-6 pt-4">
            <div className="text-center py-8">
              <p className="text-lg text-gray-700 mb-4">
                هل أنت متأكد من حذف الولي الأمر <strong>"{parentData?.FullName || 'هذا الولي الأمر'}"</strong>؟
              </p>
              <p className="text-sm text-gray-500">لا يمكن التراجع عن هذا الإجراء</p>
            </div>
            <div className="flex gap-6">
              <button
                type="button"
                className="border border-gray-500 text-gray-700 w-full py-3 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="w-full py-3 rounded-md text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowDeleteModal(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'جاري الحذف...' : 'حذف الولي الأمر'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddParents