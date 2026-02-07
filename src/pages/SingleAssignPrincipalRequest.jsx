import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import useSingleSchoolNewManager from '@/hooks/Mofwad/useSingleSchooNewManager'
import { useSelector } from 'react-redux'

const SingleAssignPrincipalRequest = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const userData = useSelector((state) => state.auth.userData)
  const { SingleSchoolNewManager, loading, error } = useSingleSchoolNewManager(userData?.Id, id)

  const request = SingleSchoolNewManager?.[0]

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'قيد الانتظار'
      case 1: return 'مقبول'
      case 2: return 'مرفوض'
      default: return 'غير معروف'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-------------'
    return new Intl.DateTimeFormat('ar-EG', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(dateString))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg text-red-500">حدث خطأ في تحميل البيانات</div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg">لا توجد بيانات للطلب</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-4 lg:p-6">
      {/* Header with back */}
      <div className="flex items-center font-bold gap-2 p-4 md:p-6 bg-white rounded-md">
        <span
          className="bg-black rounded-md flex-shrink-0 cursor-pointer p-1"
          onClick={() => navigate('/requests/assign-principal-requests')}
        >
          <ChevronRight className="text-white" height={20} width={20} />
        </span>
        <h1 className="text-lg md:text-xl">تفاصيل طلب تكليف مدير مدرسة</h1>
      </div>

      {/* Request Status Card */}
      <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-3 md:gap-4">
        <h2 className="text-base md:text-lg lg:text-xl font-bold">حالة الطلب</h2>
        <div className="border-t-2 border-[#C0C0C0] pt-3 md:pt-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-bold text-[#828282]">حالة الطلب</span>
            <span className="text-sm md:text-base font-bold">{getStatusText(request?.ApproveStatus)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-bold text-[#828282]">تاريخ الطلب</span>
            <span className="text-sm md:text-base font-bold">{formatDate(request?.RequestDate)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-bold text-[#828282]">تاريخ الموافقة</span>
            <span className="text-sm md:text-base font-bold">{formatDate(request?.ApproveDate)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-bold text-[#828282]">السنة الدراسية</span>
            <span className="text-sm md:text-base font-bold">{request?.YearDesc || '---'}</span>
          </div>
        </div>
      </div>

      {/* Delegate & Company */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 md:gap-6 w-full">
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2">
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-bold text-[#828282]">اسم المفوض</span>
            <span className="text-sm md:text-base font-bold">{request?.Mofwad_FullName || '---'}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-bold text-[#828282]">الشركة</span>
            <span className="text-sm md:text-base font-bold break-words">{request?.CompanyName || '---'}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2">
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-bold text-[#828282]">اسم المدرسة</span>
            <span className="text-sm md:text-base font-bold">{request?.School_FullName || '---'}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-bold text-[#828282]">البلدية</span>
            <span className="text-sm md:text-base font-bold">{request?.Baldia_FullName || '---'}</span>
          </div>
        </div>
      </div>

      {/* Old & New Manager */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 md:gap-6 w-full">
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4 w-full lg:w-1/2">
          <h2 className="text-base md:text-lg font-bold text-[#828282] mb-2">المدير القديم</h2>
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-bold text-[#828282]">الاسم</span>
            <span className="text-sm md:text-base font-bold">{request?.oldSchoolManager_FullName || '---'}</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4 w-full lg:w-1/2">
          <h2 className="text-base md:text-lg font-bold text-[#BE8D4A] mb-2">المدير الجديد (المكلف)</h2>
          <div className="flex flex-col gap-2">
            <span className="text-xs md:text-sm font-bold text-[#828282]">الاسم</span>
            <span className="text-sm md:text-base font-bold">{request?.newSchoolManager_FullName || '---'}</span>
          </div>
        </div>
      </div>

      {/* Reason & Approve Remarks */}
      <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4">
        <h2 className="text-base md:text-lg font-bold text-[#828282] mb-2">سبب التكليف</h2>
        <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[80px]">
          <p className="text-sm md:text-base text-gray-800 whitespace-pre-wrap">
            {request?.Reason || 'لا يوجد سبب مذكور'}
          </p>
        </div>
        {(request?.ApproveRemarks != null && request?.ApproveRemarks !== '' && request?.ApproveRemarks !== '0') && (
          <>
            <hr className="border-t-2 border-[#C0C0C0] w-full" />
            <h2 className="text-base md:text-lg font-bold text-[#828282]">ملاحظات الموافقة</h2>
            <div className="p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
              <p className="text-sm md:text-base text-gray-800">{request?.ApproveRemarks}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SingleAssignPrincipalRequest
