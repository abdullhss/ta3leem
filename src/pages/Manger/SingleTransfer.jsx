import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '../../ui/button';
import useSingleStudentTransportation from '@/hooks/schools/useSingleStudentTransportation';
import useSingleStudentReception from '@/hooks/schools/useSingleStudentReception';
import { DoTransaction } from '@/services/apiServices';
import { toast } from 'react-toastify';
import useGlobalModal from '@/hooks/useModal';
import { RejectReasonModal } from '@/global/global-modal/RejectReasonModal';

const approvalText = (v) => (v === 1 ? 'موافق' : v === -1 ? 'مرفوض' : 'قيد المراجعة');

const SingleTransfer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const source = location.state?.source || 'transportation';
  const { userData } = useSelector((state) => state.auth);
  const schoolId = userData?.School_Id;
  const { openModal, closeModal, Modal } = useGlobalModal();

  const { SingleStudentTransportation, loading: loadingTrans } = useSingleStudentTransportation({
    School_id: schoolId,
    request_id: id,
  });
  
  const { SingleStudentReception, loading: loadingRec } = useSingleStudentReception({
    School_id: schoolId,
    request_id: id,
  });

  const isReception = source === 'reception';
  const loading = isReception ? loadingRec : loadingTrans;
  const rawList = isReception ? SingleStudentReception : SingleStudentTransportation;
  const details = Array.isArray(rawList) ? rawList?.[0] : rawList;

  const handleAccept = async () => {
    console.log(`${details.Id}#1#${userData.id}#default#`);
    
    const response = await DoTransaction(
      "bODjeovmi/JdOPD2B+6n6j1y3X2IJMdguQEtVdLuTsI=",
      `${details.Id}#1#${userData.id}#default#`,
      1,
      "Id#SchoolApproved#SchoolApproveBy#SchoolApproveDate#SchoolApproveRemarks"
    )
    console.log(response);
    if(response.success != 200){
      toast.error(response.errorMessage || "فشل في قبول الطلب");
    } else {
      toast.success("تم قبول الطلب بنجاح");
    }
  };

  const submitReject = async (reason) => {
    const response = await DoTransaction(
      "bODjeovmi/JdOPD2B+6n6j1y3X2IJMdguQEtVdLuTsI=",
      `${details.Id}#2#${userData?.id}#default#${reason ?? ''}`,
      1,
      "Id#SchoolApproved#SchoolApproveBy#SchoolApproveDate#SchoolApproveRemarks"
    );
    if (response.success != 200) {
      toast.error(response.errorMessage || "فشل في رفض الطلب");
    } else {
      toast.success("تم رفض الطلب بنجاح");
      closeModal();
    }
  };

  const handleReject = () => {
    openModal(
      <RejectReasonModal
        desc="هل أنت متأكد من رفض الطلب؟"
        onConfirm={submitReject}
        onClose={closeModal}
      />,
      'رفض الطلب'
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="text-lg">جاري التحميل...</span>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-4 lg:p-6">
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-3 md:gap-4">
          <h1 className="text-base md:text-lg lg:text-xl font-bold">تفاصيل طلب النقل</h1>
          <div className="border-t-2 border-[#C0C0C0] pt-3 md:pt-4 w-full">
            <p className="text-sm md:text-base font-bold text-[#828282]">لا توجد بيانات لهذا الطلب.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Modal />
      <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-4 lg:p-6">
      {/* Main data card - same structure as School.jsx */}
      <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-3 md:gap-4">
        <h1 className="text-base md:text-lg lg:text-xl font-bold">بيانات الطلب</h1>

        <div className="border-t-2 border-[#C0C0C0] pt-3 md:pt-4 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 flex-wrap">
          <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-auto">
            <span className="text-xs md:text-sm font-bold text-[#828282]">اسم الطالب</span>
            <span className="text-sm md:text-base font-bold">{details.Student_FullName ?? '—'}</span>
          </div>
          <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-auto">
            <span className="text-xs md:text-sm font-bold text-[#828282]">المرحلة الدراسية</span>
            <span className="text-sm md:text-base font-bold">{details.EducationLeveL_Description ?? '—'}</span>
          </div>
          <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-auto">
            <span className="text-xs md:text-sm font-bold text-[#828282]">موافقة المدرسة</span>
            <span className="text-sm md:text-base font-bold">{approvalText(details.SchoolApproved)}</span>
          </div>
          <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-auto">
            <span className="text-xs md:text-sm font-bold text-[#828282]">موافقة المكتب</span>
            <span className="text-sm md:text-base font-bold">{approvalText(details.OfficeApproved)}</span>
          </div>
        </div>
      </div>

      {/* Two column cards - same layout as School.jsx */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 md:gap-6 w-full">
        {/* Left card - بيانات الطالب */}
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2">
          <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2">
            <span className="text-xs md:text-sm font-bold text-[#828282]">الرقم الإداري</span>
            <span className="text-sm md:text-base font-bold">{details.Student_AdministrativeNum ?? '—'}</span>
          </div>
          <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2">
            <span className="text-xs md:text-sm font-bold text-[#828282] md:text-left">الرقم الوطني</span>
            <span className="text-sm md:text-base font-bold md:text-left">{details.Student_NationalNum ?? '—'}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2">
          <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2">
            <span className="text-xs md:text-sm font-bold text-[#828282]">الجنسية</span>
            <span className="text-sm md:text-base font-bold">{details.Student_NationalityName ?? '—'}</span>
          </div>
          <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2">
            <span className="text-xs md:text-sm font-bold text-[#828282] md:text-left">الصف الدراسي</span>
            <span className="text-sm md:text-base font-bold md:text-left">{details.EducationClass_Description ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* Two column info cards */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 md:gap-6 w-full">
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4 w-full lg:w-1/2">
          <div className="flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full">
            <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2">
              <span className="text-xs md:text-sm font-bold text-[#828282]">المدرسة</span>
              <span className="text-sm md:text-base font-bold break-words">{details.School_FullName ?? '—'}</span>
            </div>
            <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2">
              <span className="text-xs md:text-sm font-bold text-[#828282] md:text-left">الفصل</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">{details.SchoolClass_Description ?? '—'}</span>
            </div>
          </div>
          <hr className="border-t-2 border-[#C0C0C0] w-full" />
          <div className="flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full">
            <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2">
              <span className="text-xs md:text-sm font-bold text-[#828282]">المدرسة المراد الانتقال لها</span>
              <span className="text-sm md:text-base font-bold break-words">{details.WantedSchool_FullName ?? '—'}</span>
            </div>
            <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2">
              <span className="text-xs md:text-sm font-bold text-[#828282] md:text-left">المكتب المراد</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">{details.WantedOffice_Name ?? '—'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4 w-full lg:w-1/2">
          <div className="flex flex-col justify-between gap-2 md:gap-4 w-full">
            <span className="text-xs md:text-sm font-bold text-[#828282]">السبب</span>
            <span className="text-sm md:text-base font-bold break-words">{details.Reason ?? '—'}</span>
          </div>
          <hr className="border-t-2 border-[#C0C0C0] w-full" />
          <div className="flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full">
            <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2">
              <span className="text-xs md:text-sm font-bold text-[#828282]">ملاحظات موافقة المدرسة</span>
              <span className="text-sm md:text-base font-bold break-words">{details.SchoolApproveRemarks || '—'}</span>
            </div>
            <div className="flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2">
              <span className="text-xs md:text-sm font-bold text-[#828282] md:text-left">ملاحظات موافقة المكتب</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">{details.OfficeApproveRemarks || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reception-only: الغاء / قبول / رفض */}
      {isReception && (
        <div className="bg-white rounded-lg p-4 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            className="hover:bg-red-600 w-full hover:text-white bg-white text-red-500 border border-red-500 rounded-md px-6 md:px-12"
            onClick={() => navigate(-1)}
          >
            الغاء
          </Button>
          <Button
            className="bg-[#BE8D4A] w-full hover:bg-[#A97838] text-white rounded-md px-6 md:px-12"
            onClick={handleAccept}
          >
            قبول
          </Button>
          <Button variant="destructive" className="w-full" onClick={handleReject}>
            رفض
          </Button>
        </div>
      )}
    </div>
    </>
  );
};

export default SingleTransfer;
