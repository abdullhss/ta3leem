import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import useSingleSchoolRenew from '../hooks/Mofwad/useSingleSchoolRenew';
import { useSelector } from 'react-redux';
import MapViewer from '../components/MapViewer';
import FileViewer from '../components/FileViewer';

const RenewRequest = () => {
  const { id } = useParams();
  const userData = useSelector((state) => state.auth.userData);
  const { SingleSchoolRenew, loading, error } = useSingleSchoolRenew(userData?.Id, id);
  
  const [openMapModal, setOpenMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: null,
    lng: null,
    title: 'موقع المدرسة'
  });
  
  const renewRequest = SingleSchoolRenew?.[0];
  
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

  if (!renewRequest) {
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
        <h1 className='text-base md:text-lg lg:text-xl font-bold'>حالة طلب التجديد</h1>
        
        <div className='border-t-2 border-[#C0C0C0] pt-3 md:pt-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الطلب الأولية</span>
            <span className='text-sm md:text-base font-bold'>
              {getStatusText(renewRequest?.InitialApproveStatus)}
            </span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الطلب النهائية</span>
            <span className='text-sm md:text-base font-bold'>
              {getStatusText(renewRequest?.FinalApproveStatus)}
            </span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الطلب الرئيسية</span>
            <span className='text-sm md:text-base font-bold'>
              {getStatusText(renewRequest?.MainApproveStatus)}
            </span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>تاريخ الطلب</span>
            <span className="text-sm md:text-base font-bold">
              {renewRequest?.RequestDate &&
                new Intl.DateTimeFormat("ar-EG", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(renewRequest.RequestDate))}
            </span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الترخيص</span>
            <span className="text-sm md:text-base font-bold">
              {renewRequest?.LicenseStatus || "-------------"}
            </span>  
          </div>
        </div>
      </div>

      {/* Two Column Cards - Manager and Delegate */}
      <div className='flex flex-col lg:flex-row justify-between gap-4 md:gap-6 w-full'>
        {/* Left Card - المندوب */}
        <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2'>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <div className='flex items-center gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم المفوض</span>
            </div>
            <span className='text-sm md:text-base font-bold'>{renewRequest?.Mofwad_FullName}</span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>الشركة</span>
            <span className="text-sm md:text-base font-bold break-words md:text-left">
              {renewRequest?.CompanyName}
            </span>
          </div>
        </div>

        {/* Right Card - School Manager */}
        <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2'>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <div className='flex items-center gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>مدير المدرسة</span>
            </div>
            <span className='text-sm md:text-base font-bold'>{renewRequest?.SchoolManager_FullName}</span>
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>السنة التعليمية</span>
            <span className="text-sm md:text-base font-bold md:text-left">
              {renewRequest?.YearDesc}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Info Cards - School Info */}
      <div className='flex flex-col lg:flex-row justify-between gap-4 md:gap-6 w-full'>
        {/* Left Card - School Basic Data */}
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4 w-full lg:w-1/2">
          <h2 className='text-base md:text-lg font-bold text-[#828282] mb-2'>بيانات المدرسة</h2>
          
          <div className='flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم المدرسة</span>
              <span className='text-sm md:text-base font-bold break-words'>{renewRequest?.School_FullName}</span>  
            </div>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>البلدية</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">
                {renewRequest?.Baldia_FullName}
              </span>
            </div>
          </div>
          
          <hr className='border-t-2 border-[#C0C0C0] w-full'/>
          
          <div className='flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>المكتب</span>
              <span className='text-sm md:text-base font-bold break-words'>{renewRequest?.OfficeName}</span>  
            </div>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>حالة المزاولة</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">
                {renewRequest?.ChamberCommerceStatus || "-------------"}
              </span>
            </div>
          </div>
          
          <hr className='border-t-2 border-[#C0C0C0] w-full'/>
          
          <div className='flex flex-col justify-between gap-4 w-full'>
            <span className='text-xs md:text-sm font-bold text-[#828282] text-right'>موقع المدرسة</span>
            <div 
              className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full cursor-pointer'
              onClick={() => handleOpenMap(renewRequest?.latitude, renewRequest?.longitude)}
            >
              <span className="text-sm text-[#BE8D4A] md:text-base font-bold underline break-words text-right sm:text-left">
                {renewRequest?.latitude} , {renewRequest?.longitude}
              </span>
              <button className='text-[#BE8D4A] font-bold rounded-md p-1 gap-2 text-sm md:text-base'>عرض</button>
            </div>
          </div>
        </div>

        {/* Right Card - License Data */}
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4 w-full lg:w-1/2">
          <h2 className='text-base md:text-lg font-bold text-[#BE8D4A] mb-2'>بيانات الترخيص المطلوبة</h2>
          
          <div className='flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>رقم الترخيص</span>
              <span className='text-sm md:text-base font-bold break-words'>{renewRequest?.LicenseNum || "-------------"}</span>  
            </div>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>مكان الترخيص</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">
                {renewRequest?.LicensePlace || "-------------"}
              </span>
            </div>
          </div>
          
          <hr className='border-t-2 border-[#C0C0C0] w-full'/>
          
          <div className='flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>تاريخ بداية الترخيص</span>
              <span className='text-sm md:text-base font-bold break-words'>
                {renewRequest?.LicenseStartDate ?
                  new Intl.DateTimeFormat("ar-EG", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(renewRequest.LicenseStartDate)) : 
                  "-------------"
                }
              </span>  
            </div>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>تاريخ نهاية الترخيص</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">
                {renewRequest?.LicenseEndDate ?
                  new Intl.DateTimeFormat("ar-EG", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(renewRequest.LicenseEndDate)) : 
                  "-------------"
                }
              </span>
            </div>
          </div>
          
          <hr className='border-t-2 border-[#C0C0C0] w-full'/>
          
          <div className='flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>رقم السجل التجاري</span>
              <span className='text-sm md:text-base font-bold break-words'>{renewRequest?.ChamberCommerceNum || "-------------"}</span>  
            </div>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>تاريخ نهاية السجل التجاري</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">
                {renewRequest?.ChamberCommerceEndDate ?
                  new Intl.DateTimeFormat("ar-EG", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(renewRequest.ChamberCommerceEndDate)) : 
                  "-------------"
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Attachments Section */}
      <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6'>
        <h2 className='text-base md:text-lg font-bold text-[#828282] mb-4'>مرفقات طلب التجديد</h2>
        
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
          {/* Location Pictures */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>صور الموقع</span>
            <div className="w-full">
              <FileViewer id={renewRequest?.LocationPictureAttach} />
            </div>
          </div>
          
          {/* Neighbors Approval */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>موافقة الجيران</span>
            <div className="w-full">
              <FileViewer id={renewRequest?.neighborsApproveAttach} />
            </div>
          </div>
          
          {/* Air Map */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>خريطة جوية</span>
            <div className="w-full">
              <FileViewer id={renewRequest?.AirMapAttach} />
            </div>
          </div>
          
          {/* Chamber Commerce */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>سجل تجاري</span>
            <div className="w-full">
              <FileViewer id={renewRequest?.ChamberCommerceAttach} />
            </div>
          </div>
          
          {/* Commercial Register */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>السجل التجاري</span>
            <div className="w-full">
              <FileViewer id={renewRequest?.CommercialRegisterAttach} />
            </div>
          </div>
          
          {/* Choose Manager */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>اختيار مدير</span>
            <div className="w-full">
              <FileViewer id={renewRequest?.ChooseManagerAttach} />
            </div>
          </div>
          
          {/* Create Contract */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>عقد إنشاء</span>
            <div className="w-full">
              <FileViewer id={renewRequest?.CreateContractAttach} />
            </div>
          </div>
          
          {/* Koroki Draw */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>خرائط كروكي</span>
            <div className="w-full">
              <FileViewer id={renewRequest?.KorokiDrawAttach} />
            </div>
          </div>
          
          {/* License Attach */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>الترخيص</span>
            <div className="w-full">
              <FileViewer id={renewRequest?.LicenseAttach} />
            </div>
          </div>
          
          {/* Mozawla Attach */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>مزاولة</span>
            <div className="w-full">
              <FileViewer id={renewRequest?.MozawlaAttach} />
            </div>
          </div>
          
          {/* Sanad Melkia */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>صك ملكية</span>
            <div className="w-full">
              <FileViewer id={renewRequest?.SanadMelkiaAttach} />
            </div>
          </div>
          
          {/* Security Card */}
          <div className='flex flex-col gap-2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>بطاقة أمنية</span>
            <div className="w-full">
              <FileViewer id={renewRequest?.SecurityCardAttach} />
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

export default RenewRequest;