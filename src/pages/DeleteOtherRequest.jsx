import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { DoTransaction } from '../services/apiServices';
import { toast } from 'react-toastify';
import { ChevronRight, AlertTriangle } from 'lucide-react';

const OTHER_TABLE_KEY = '2qLGid3TE+79fX0k8oMLF2+DTLR4LWfhJmStnaLPjlM=';

const DeleteOtherRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId, requestData } = location.state || {};
  const [isDeleting, setIsDeleting] = useState(false);

  const request = requestData;
  const idToDelete = requestId ?? request?.id ?? request?.Id;

  const handleConfirmDelete = async () => {
    if (!idToDelete) {
      toast.error('معرف الطلب غير متوفر');
      return;
    }
    setIsDeleting(true);
    try {
      const response = await DoTransaction(OTHER_TABLE_KEY, `${idToDelete}`, 2);
      if (response?.success === 200) {
        toast.success('تم حذف الطلب بنجاح');
        navigate('/requests/other', { state: { refreshList: true } });
      } else {
        toast.error(response?.errorMessage || 'فشل في حذف الطلب');
      }
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (!idToDelete && !request) {
    return (
      <div className='flex flex-col gap-4 p-6'>
        <p className='text-red-500'>لم يتم تمرير بيانات الطلب. يرجى العودة والاختيار من القائمة.</p>
        <Button onClick={() => navigate('/requests/other')}>العودة إلى الطلبات الأخرى</Button>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 p-4 md:p-6 max-w-2xl mx-auto'>
      <div className="flex items-center font-bold gap-2 p-4 bg-white rounded-md">
        <span className="bg-black rounded-md flex-shrink-0 cursor-pointer" onClick={handleCancel}>
          <ChevronRight className="text-white" height={20} width={20} />
        </span>
        <h1 className="text-lg md:text-xl">حذف الطلب الآخر</h1>
      </div>

      <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 md:p-6 flex flex-col gap-4'>
        <div className='flex items-center gap-2 text-amber-800'>
          <AlertTriangle size={24} />
          <span className='font-bold'>هل أنت متأكد من حذف هذا الطلب؟</span>
        </div>
        <p className='text-amber-800 text-sm'>هذا الإجراء لا يمكن التراجع عنه.</p>

        {request && (
          <div className='bg-white rounded-lg p-4 border border-amber-100'>
            <div className='flex flex-col gap-2'>
              <div>
                <span className='text-xs font-bold text-gray-500'>المدرسة: </span>
                <span className='font-medium'>{request.School_FullName || '—'}</span>
              </div>
              <div>
                <span className='text-xs font-bold text-gray-500'>نوع الطلب: </span>
                <span className='font-medium'>{request.RequestType_Desc || request.RequstDesc || '—'}</span>
              </div>
              {request.RequestDate && (
                <div>
                  <span className='text-xs font-bold text-gray-500'>تاريخ الطلب: </span>
                  <span className='font-medium'>
                    {new Date(request.RequestDate).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className='flex flex-wrap gap-3 pt-2'>
          <Button
            type="button"
            onClick={handleCancel}
            disabled={isDeleting}
            className="border border-gray-400 bg-white text-gray-800 hover:bg-gray-50"
          >
            إلغاء
          </Button>
          <Button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteOtherRequest;
