import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useSingleSchoolOther from '../hooks/Mofwad/useSingleSchoolOther';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';

const SingleOtherRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const { SingleSchoolOther, loading, error } = useSingleSchoolOther(userData?.Id, id);

  const request = Array.isArray(SingleSchoolOther) ? SingleSchoolOther?.[0] : SingleSchoolOther;

  const getStatusText = (status) => {
    switch (status) {
      case 0: return 'قيد الانتظار';
      case 1: return 'مقبول';
      case 2: return 'مرفوض';
      default: return 'غير معروف';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-lg'>جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-lg text-red-500'>حدث خطأ في تحميل البيانات</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-lg'>لا توجد بيانات للطلب</div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 md:gap-6 p-3 md:p-4 lg:p-6'>
      {/* Header */}
      <div className="flex items-center font-bold gap-2 p-4 md:p-6 bg-white rounded-md">
        <span
          className="bg-black rounded-md flex-shrink-0 cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ChevronRight className="text-white" height={20} width={20} />
        </span>
        <h1 className="text-base md:text-lg lg:text-xl">تفاصيل الطلب الآخر</h1>
      </div>

      {/* Request Status Card */}
      <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-3 md:gap-4'>
        <h2 className='text-base md:text-lg font-bold'>حالة الطلب</h2>
        <div className='border-t-2 border-[#C0C0C0] pt-3 md:pt-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الطلب الأولية</span>
            <span className='text-sm md:text-base font-bold'>
              {getStatusText(request?.InitialApproveStatus)}
            </span>
          </div>
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الطلب النهائية</span>
            <span className='text-sm md:text-base font-bold'>
              {getStatusText(request?.FinalApproveStatus)}
            </span>
          </div>
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>تاريخ الطلب</span>
            <span className="text-sm md:text-base font-bold">
              {request?.RequestDate
                ? new Intl.DateTimeFormat('ar-EG', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }).format(new Date(request.RequestDate))
                : '—'}
            </span>
          </div>
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>تاريخ الموافقة النهائية</span>
            <span className="text-sm md:text-base font-bold">
              {request?.FinalApproveDate
                ? new Intl.DateTimeFormat('ar-EG', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }).format(new Date(request.FinalApproveDate))
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Delegate and School Row */}
      <div className='flex flex-col lg:flex-row justify-between gap-4 md:gap-6 w-full'>
        <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2'>
          <div className='flex flex-col gap-2 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم المفوض</span>
            <span className='text-sm md:text-base font-bold'>{request?.Mofwad_FullName || '—'}</span>
          </div>
          <div className='flex flex-col gap-2 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>الشركة</span>
            <span className="text-sm md:text-base font-bold break-words">{request?.CompanyName || '—'}</span>
          </div>
        </div>
        <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2'>
          <div className='flex flex-col gap-2 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم المدرسة</span>
            <span className='text-sm md:text-base font-bold'>{request?.School_FullName || '—'}</span>
          </div>
          <div className='flex flex-col gap-2 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>نوع الطلب</span>
            <span className="text-sm md:text-base font-bold">{request?.RequestType_Desc || request?.RequstDesc || '—'}</span>
          </div>
        </div>
      </div>

      {/* Reason and status */}
      <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4'>
        <h2 className='text-base md:text-lg font-bold text-[#828282]'>سبب الطلب</h2>
        <div className='p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px]'>
          <p className='text-sm md:text-base text-gray-800 whitespace-pre-wrap'>
            {request?.Reason || 'لا يوجد'}
          </p>
        </div>
        <hr className='border-t-2 border-[#C0C0C0] w-full' />
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>الملاحظات الأولية</span>
            <div className='p-2 md:p-3 bg-gray-50 rounded border border-gray-200 min-h-[60px]'>
              <p className='text-sm text-gray-800'>{request?.InitialApproveRemarks || '—'}</p>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>الملاحظات النهائية</span>
            <div className='p-2 md:p-3 bg-gray-50 rounded border border-gray-200 min-h-[60px]'>
              <p className='text-sm text-gray-800'>{request?.FinalApproveRemarks || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='flex flex-wrap gap-3'>
        <Button
          type="button"
          onClick={() => navigate(-1)}
          className="border border-[#C0C0C0] bg-white text-gray-800 hover:bg-gray-50"
        >
          رجوع
        </Button>
        <Button
          type="button"
          onClick={() =>
            navigate('/requests/create-other', {
              state: { otherRequest: request, action: 1 },
            })
          }
          className="bg-[#BE8D4A] text-white hover:bg-[#a67a3f]"
        >
          تعديل الطلب
        </Button>
      </div>
    </div>
  );
};

export default SingleOtherRequest;
