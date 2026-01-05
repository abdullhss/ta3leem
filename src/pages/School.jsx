import React from 'react'
import { useParams } from 'react-router-dom';
import useSingleSchool from '../hooks/schools/useSingleSchool';

const School = () => {
  const { type, id, Office_id } = useParams();
  console.log(id, Office_id);
  const { SingleSchool, loading, error } = useSingleSchool(id, Office_id);  
  console.log(SingleSchool);
  return (
    <div className='flex flex-col gap-6 p-4 md:p-6'>
      <div className='bg-white rounded-lg p-4 md:p-6 flex flex-col gap-4'>
        <h1 className='text-lg md:text-xl font-bold'>بيانات المدرسة</h1>
        
        <div className='border-t-2 border-[#C0C0C0] pt-4 w-full flex items-center justify-between'>
          <div className='flex flex-col justify-between gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الترخيص</span>
            <span className='text-sm md:text-base font-bold'>{SingleSchool?.mainSchool?.LicenseStatus}</span>  
          </div>
          <div className='flex flex-col justify-between gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة المزاولة</span>
            <span className='text-sm md:text-base font-bold'>{SingleSchool?.mainSchool?.ChamberCommerceStatus || "-------------"}</span>  
          </div>
          <div className='flex flex-col justify-between gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>الحالة</span>
            <span className='text-sm md:text-base font-bold'>{SingleSchool?.mainSchool?.SchoolStatus}</span>  
          </div>
        </div>
      </div>

      <div className='flex justify-between gap-6 w-full'>
        <div className='bg-white rounded-lg p-4 md:p-6 flex justify-between gap-4 w-1/2'>
          <div className='flex flex-col justify-between gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم المفوض</span>
            <span className='text-sm md:text-base font-bold'>{SingleSchool?.mofwad?.FullName}</span>  
          </div>
          <div className='flex flex-col justify-between gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282] text-left'>التاريخ</span>
            <span className="text-sm md:text-base font-bold">
              {SingleSchool?.mofwad?.ApprovedDate &&
                new Intl.DateTimeFormat("ar-EG", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                }).format(new Date(SingleSchool.mofwad.ApprovedDate))}
            </span>
          </div>
          
        </div>
        <div className='bg-white rounded-lg p-4 md:p-6 flex justify-between gap-4 w-1/2'>
          <div className='flex flex-col justify-between gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>مدير المدرسة</span>

          </div>
          <div className='flex flex-col justify-between gap-4'>
            <span className='text-xs md:text-sm font-bold text-[#828282] text-left'>المسوغات</span>
            
          </div>
          
        </div>

      </div>

   
      <div className='flex justify-between gap-6 w-full'>
        <div className="bg-white rounded-lg p-4 md:p-6 flex flex-col gap-4 w-1/2">
          <div className='bg-white rounded-lg flex justify-between gap-4 w-full'>
            <div className='flex flex-col justify-between gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم الشركة</span>
              <span className='text-sm md:text-base font-bold'>{SingleSchool?.mofwad?.CompanyName}</span>  
            </div>
            <div className='flex flex-col justify-between gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282] text-left'>اسم المدرسة</span>
              <span className="text-sm md:text-base font-bold ">
                {SingleSchool?.mainSchool?.School_FullName}
              </span>
            </div>
            
          </div>
          
          <hr className='border-t-2 border-[#C0C0C0] w-full'/>

          <div className='bg-white rounded-lg flex justify-between gap-4 w-full'>
            <div className='flex flex-col justify-between gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>البلدية</span>
              <span className='text-sm md:text-base font-bold'>{SingleSchool?.mainSchool?.Baldia_FullName}</span>  
            </div>
            <div className='flex flex-col justify-between gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282] text-left'>المكتب</span>
              <span className="text-sm md:text-base font-bold">
                {SingleSchool?.mainSchool?.OfficeName}
              </span>
            </div>
            
          </div>
        </div>


        <div className="bg-white rounded-lg p-4 md:p-6 flex flex-col gap-4 w-1/2">
          <div className='bg-white rounded-lg flex justify-between gap-4 w-full'>
            <div className='flex flex-col justify-between gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم الشركة</span>
              <span className='text-sm md:text-base font-bold'>{SingleSchool?.mofwad?.CompanyName}</span>  
            </div>
            <div className='flex flex-col justify-between gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282] text-left'>اسم المدرسة</span>
              <span className="text-sm md:text-base font-bold ">
                {SingleSchool?.mainSchool?.School_FullName}
              </span>
            </div>
            
          </div>
          
          <hr className='border-t-2 border-[#C0C0C0] w-full'/>

          <div className='bg-white rounded-lg flex justify-between gap-4 w-full'>
            <div className='flex flex-col justify-between gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>البلدية</span>
              <span className='text-sm md:text-base font-bold'>{SingleSchool?.mainSchool?.Baldia_FullName}</span>  
            </div>
            <div className='flex flex-col justify-between gap-4'>
              <span className='text-xs md:text-sm font-bold text-[#828282] text-left'>المكتب</span>
              <span className="text-sm md:text-base font-bold">
                {SingleSchool?.mainSchool?.OfficeName}
              </span>
            </div>
            
          </div>
        </div>

      </div>


      <div className='bg-white rounded-lg p-4 md:p-6 flex flex-col gap-4'>
        <h1 className='text-xs md:text-sm font-bold text-[#828282]'>ملاحظات</h1>

        <p className='text-sm md:text-base font-bold'>{SingleSchool?.mainSchool?.SchoolDescription}</p>
      </div>
    </div>
  )
}

export default School