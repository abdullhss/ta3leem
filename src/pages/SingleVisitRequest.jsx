import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import useSingleSchoolVisit from '../hooks/Mofwad/useSingleSchoolVisit';
import { useSelector } from 'react-redux';
import MapViewer from '../components/MapViewer';
import FileViewer from '../components/FileViewer';

const SingleVisitRequest = () => {
  const { id } = useParams();
  const userData = useSelector((state) => state.auth.userData);
  const { SingleSchoolVisit, loading, error } = useSingleSchoolVisit(userData?.Id, id);
  
  const [openMapModal, setOpenMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: null,
    lng: null,
    title: 'موقع المدرسة'
  });
  
  const visitRequest = SingleSchoolVisit?.[0];
  
  const handleOpenMap = (lat, lng) => {
    setSelectedLocation({
      lat: lat || null,
      lng: lng || null,
      title: 'موقع المدرسة'
    });
    setOpenMapModal(true);
  };

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

  if (!visitRequest) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-lg'>لا توجد بيانات للطلب</div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 md:gap-6 p-3 md:p-4 lg:p-6'>
      {/* Request Status Card */}
      <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-3 md:gap-4'>
        <h1 className='text-base md:text-lg lg:text-xl font-bold'>حالة طلب الزيارة</h1>
        
        <div className='border-t-2 border-[#C0C0C0] pt-3 md:pt-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الطلب الأولية</span>
            <span className='text-sm md:text-base font-bold'>
              {getStatusText(visitRequest?.InitialApproveStatus)}
            </span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الطلب النهائية</span>
            <span className='text-sm md:text-base font-bold'>
              {getStatusText(visitRequest?.FinalApproveStatus)}
            </span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>تاريخ الطلب</span>
            <span className="text-sm md:text-base font-bold">
              {visitRequest?.RequestDate &&
                new Intl.DateTimeFormat("ar-EG", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(visitRequest.RequestDate))}
            </span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>تاريخ الموافقة النهائية</span>
            <span className="text-sm md:text-base font-bold">
              {visitRequest?.FinalApproveDate ?
                new Intl.DateTimeFormat("ar-EG", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(visitRequest.FinalApproveDate)) : 
                "-------------"
              }
            </span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الترخيص</span>
            <span className="text-sm md:text-base font-bold">
              {visitRequest?.LicenseStatus || "-------------"}
            </span>  
          </div>
        </div>
      </div>

      {/* Two Column Cards - Delegate Info */}
      <div className='flex flex-col lg:flex-row justify-between gap-4 md:gap-6 w-full'>
        {/* Left Card - المندوب */}
        <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2'>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <div className='flex items-center gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم المفوض</span>
            </div>
            <span className='text-sm md:text-base font-bold'>{visitRequest?.Mofwad_FullName}</span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>الشركة</span>
            <span className="text-sm md:text-base font-bold break-words md:text-left">
              {visitRequest?.CompanyName}
            </span>
          </div>
        </div>

        {/* Right Card - School and Year Info */}
        <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2'>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <div className='flex items-center gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم المدرسة</span>
            </div>
            <span className='text-sm md:text-base font-bold'>{visitRequest?.School_FullName}</span>
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>السنة التعليمية</span>
            <span className="text-sm md:text-base font-bold md:text-left">
              {visitRequest?.YearDesc}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Info Cards - School Data and Visit Details */}
      <div className='flex flex-col lg:flex-row justify-between gap-4 md:gap-6 w-full'>
        {/* Left Card - School Basic Data */}
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4 w-full lg:w-1/2">
          <h2 className='text-base md:text-lg font-bold text-[#828282] mb-2'>بيانات المدرسة</h2>
          
          <div className='flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>البلدية</span>
              <span className='text-sm md:text-base font-bold break-words'>{visitRequest?.Baldia_FullName}</span>  
            </div>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>المكتب</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">
                {visitRequest?.OfficeName}
              </span>
            </div>
          </div>
          
          <hr className='border-t-2 border-[#C0C0C0] w-full'/>
          
          <div className='flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة المزاولة</span>
              <span className='text-sm md:text-base font-bold break-words'>{visitRequest?.ChamberCommerceStatus || "-------------"}</span>  
            </div>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>حالة المدرسة</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">
                {visitRequest?.SchoolStatus}
              </span>
            </div>
          </div>
          
          <hr className='border-t-2 border-[#C0C0C0] w-full'/>
          
          <div className='flex flex-col justify-between gap-4 w-full'>
            <span className='text-xs md:text-sm font-bold text-[#828282] text-right'>موقع المدرسة</span>
            <div 
              className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full cursor-pointer'
              onClick={() => handleOpenMap(visitRequest?.latitude, visitRequest?.longitude)}
            >
              <span className="text-sm text-[#BE8D4A] md:text-base font-bold underline break-words text-right sm:text-left">
                {visitRequest?.latitude} , {visitRequest?.longitude}
              </span>
              <button className='text-[#BE8D4A] font-bold rounded-md p-1 gap-2 text-sm md:text-base'>عرض</button>
            </div>
          </div>
        </div>

        {/* Right Card - Visit Request Details */}
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4 w-full lg:w-1/2">
          <h2 className='text-base md:text-lg font-bold text-[#BE8D4A] mb-2'>تفاصيل طلب الزيارة</h2>
          
          <div className='flex flex-col gap-4 w-full'>
            <div className='flex flex-col gap-2 md:gap-3'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>سبب طلب الزيارة</span>
              <div className='p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[120px]'>
                <p className='text-sm md:text-base text-gray-800 whitespace-pre-wrap'>
                  {visitRequest?.Reason || "لا يوجد سبب مذكور"}
                </p>
              </div>
            </div>
            
            <hr className='border-t-2 border-[#C0C0C0] w-full'/>
            
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='flex flex-col gap-2'>
                <span className='text-xs md:text-sm font-bold text-[#828282]'>الملاحظات الأولية</span>
                <div className='p-2 md:p-3 bg-gray-50 rounded border border-gray-200 min-h-[60px]'>
                  <p className='text-sm text-gray-800'>
                    {visitRequest?.InitialApproveRemarks || "لا توجد ملاحظات"}
                  </p>
                </div>
              </div>
              
              <div className='flex flex-col gap-2'>
                <span className='text-xs md:text-sm font-bold text-[#828282]'>الملاحظات النهائية</span>
                <div className='p-2 md:p-3 bg-gray-50 rounded border border-gray-200 min-h-[60px]'>
                  <p className='text-sm text-gray-800'>
                    {visitRequest?.FinalApproveRemarks || "لا توجد ملاحظات"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6'>
        <h2 className='text-base md:text-lg font-bold text-[#828282] mb-4'>مرفقات المدرسة</h2>
        
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6'>
          {/* Location Pictures */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>صور الموقع</span>
            <div className="w-full">
              <FileViewer id={visitRequest?.LocationPictureAttach} />
            </div>
          </div>
          
          {/* Neighbors Approval */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>موافقة الجيران</span>
            <div className="w-full">
              <FileViewer id={visitRequest?.neighborsApproveAttach} />
            </div>
          </div>
        </div>
      </div>

      {/* Map Viewer Modal */}
      <MapViewer
        isOpen={openMapModal}
        onClose={() => setOpenMapModal(false)}
        latitude={selectedLocation.lat}
        longitude={selectedLocation.lng}
        title={selectedLocation.title}
        markerLabel="موقع المدرسة"
      />
    </div>
  );
};

export default SingleVisitRequest;