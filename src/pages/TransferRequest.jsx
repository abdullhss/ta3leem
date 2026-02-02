import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useSingleSchoolTrans from '../hooks/Mofwad/useSingleSchoolTrans';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import FileViewer from '../components/FileViewer';
import { Button } from '../ui/button';
import { toast } from 'react-toastify';
import MapViewer from '../components/MapViewer';

const TransferRequests = () => {
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();
  const { id } = useParams();
  const { SingleSchoolTrans, loading, error } = useSingleSchoolTrans(userData?.Id, id);
  console.log(SingleSchoolTrans);
  
  const [openMapModal, setOpenMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: null,
    lng: null,
    title: '',
    isRequested: false
  });
  
  const transferRequest = SingleSchoolTrans?.[0];
  
  const handleOpenMap = (lat, lng, isRequested = false) => {
    setSelectedLocation({
      lat: lat || null,
      lng: lng || null,
      title: isRequested ? 'الموقع المطلوب للنقل' : 'الموقع الحالي',
      isRequested
    });
    setOpenMapModal(true);
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

  if (!transferRequest) {
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
        <h1 className='text-base md:text-lg lg:text-xl font-bold'>حالة طلب النقل</h1>
        
        <div className='border-t-2 border-[#C0C0C0] pt-3 md:pt-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الطلب الأولية</span>
            <span className='text-sm md:text-base font-bold'>
              {transferRequest?.InitialApproveStatus === 1 ? 'مقبول' : 
               transferRequest?.InitialApproveStatus === 0 && 'قيد الانتظار'}
            </span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الطلب النهائية</span>
            <span className='text-sm md:text-base font-bold'>
              {transferRequest?.FinalApproveStatus === 1 ? 'مقبول' : 
               transferRequest?.FinalApproveStatus === 0 && 'قيد الانتظار'}
            </span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>تاريخ الطلب</span>
            <span className="text-sm md:text-base font-bold">
              {transferRequest?.RequestDate &&
                new Intl.DateTimeFormat("ar-EG", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(transferRequest.RequestDate))}
            </span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>تاريخ الموافقة النهائية</span>
            <span className="text-sm md:text-base font-bold">
              {transferRequest?.FinalApproveDate ?
                new Intl.DateTimeFormat("ar-EG", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(transferRequest.FinalApproveDate)) : 
                "-------------"
              }
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
            <span className='text-sm md:text-base font-bold'>{transferRequest?.Mofwad_FullName}</span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>الشركة</span>
            <span className="text-sm md:text-base font-bold break-words md:text-left">
              {transferRequest?.CompanyName}
            </span>
          </div>
        </div>

        {/* Right Card - School Manager */}
        <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2'>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <div className='flex items-center gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>مدير المدرسة</span>
            </div>
            <span className='text-sm md:text-base font-bold'>{transferRequest?.SchoolManager_FullName}</span>
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>السنة التعليمية</span>
            <span className="text-sm md:text-base font-bold md:text-left">
              {transferRequest?.YearDesc}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Info Cards - Original vs Requested */}
      <div className='flex flex-col lg:flex-row justify-between gap-4 md:gap-6 w-full'>
        {/* Left Card - Original School Data */}
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4 w-full lg:w-1/2">
          <h2 className='text-base md:text-lg font-bold text-[#828282] mb-2'>البيانات الأصلية</h2>
          
          <div className='flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم المدرسة</span>
              <span className='text-sm md:text-base font-bold break-words'>{transferRequest?.School_FullName}</span>  
            </div>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>البلدية</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">
                {transferRequest?.Baldia_FullName}
              </span>
            </div>
          </div>
          
          <hr className='border-t-2 border-[#C0C0C0] w-full'/>
          <div className='flex flex-col justify-between gap-4 w-full'>
            <span className='text-xs md:text-sm font-bold text-[#828282] text-right'>موقع المدرسة الحالي</span>
            <div 
              className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full cursor-pointer'
              onClick={() => handleOpenMap(transferRequest?.latitude, transferRequest?.longitude)}
            >
              <span className="text-sm text-[#BE8D4A] md:text-base font-bold underline break-words text-right sm:text-left">
                {transferRequest?.latitude} , {transferRequest?.longitude}
              </span>
              <button className='text-[#BE8D4A] font-bold rounded-md p-1 gap-2 text-sm md:text-base'>عرض</button>
            </div>
          </div>
        </div>

        {/* Right Card - Requested School Data */}
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4 w-full lg:w-1/2">
          <h2 className='text-base md:text-lg font-bold text-[#BE8D4A] mb-2'>البيانات المطلوبة للنقل</h2>
          
          <div className='flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم المدرسة</span>
              <span className='text-sm md:text-base font-bold break-words'>{transferRequest?.School_FullName}</span>  
            </div>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>البلدية المطلوبة</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">
                {transferRequest?.Request_Baldia_FullName}
              </span>
            </div>
          </div>
          
          <hr className='border-t-2 border-[#C0C0C0] w-full'/>

          <div className='flex flex-col justify-between gap-4 w-full'>
            <span className='text-xs md:text-sm font-bold text-[#BE8D4A] text-right'>موقع المدرسة المطلوب</span>
            <div 
              className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full cursor-pointer'
              onClick={() => handleOpenMap(transferRequest?.Request_latitude, transferRequest?.Request_longitude, true)}
            >
              <span className="text-sm text-[#BE8D4A] md:text-base font-bold underline break-words text-right sm:text-left">
                {transferRequest?.Request_latitude} , {transferRequest?.Request_longitude}
              </span>
              <button className='text-[#BE8D4A] font-bold rounded-md p-1 gap-2 text-sm md:text-base'>عرض</button>
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
        markerLabel={selectedLocation.isRequested ? 'الموقع المطلوب' : 'الموقع الحالي'}
      />
    </div>
  );
};

export default TransferRequests;