import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import useSingleSchool from '../hooks/schools/useSingleSchool';
import { PlusIcon } from 'lucide-react';
import { Button } from '../ui/button';
import useMangers from '../hooks/manger/useMangers';
import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { SelectContent } from '../ui/select';
import { SelectItem } from '../ui/select';
import { SelectTrigger } from '../ui/select';
import { SelectValue } from '../ui/select';
import FileViewer from '../components/FileViewer';

const School = () => {
  const { type, id, Office_id } = useParams();
  console.log(id, Office_id);
  const { SingleSchool, loading, error } = useSingleSchool(id, Office_id);  
  console.log(SingleSchool);
  const {Managers, totalCount, loading: mangersLoading, error: mangersError} = useMangers(0, "", 1, 10000);
  console.log(Managers);

  const [openAddMangerModal, setOpenAddMangerModal] = useState(false);
  const navigate = useNavigate();
  const [selectedManagerId, setSelectedManagerId] = useState(0);
  const [openMapModal, setOpenMapModal] = useState(false);
  
  return (
    <div className='flex flex-col gap-4 md:gap-6 p-3 md:p-4 lg:p-6'>
      {/* School Data Card */}
      <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-3 md:gap-4'>
        <h1 className='text-base md:text-lg lg:text-xl font-bold'>بيانات المدرسة</h1>
        
        <div className='border-t-2 border-[#C0C0C0] pt-3 md:pt-4 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0'>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-auto'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة الترخيص</span>
            <span className='text-sm md:text-base font-bold'>{SingleSchool?.mainSchool?.LicenseStatus}</span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-auto'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>حالة المزاولة</span>
            <span className='text-sm md:text-base font-bold'>{SingleSchool?.mainSchool?.ChamberCommerceStatus || "-------------"}</span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-auto'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>الحالة</span>
            <span className='text-sm md:text-base font-bold'>{SingleSchool?.mainSchool?.SchoolStatus}</span>  
          </div>
        </div>
      </div>

      {/* Two Column Cards */}
      <div className='flex flex-col lg:flex-row justify-between gap-4 md:gap-6 w-full'>
        {/* Left Card - المندوب */}
        <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2'>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم المفوض</span>
            <span className='text-sm md:text-base font-bold'>{SingleSchool?.mofwad?.FullName}</span>  
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>التاريخ</span>
            <span className="text-sm md:text-base font-bold md:text-left">
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

        {/* Right Card - School Manager */}
        <div className='bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between gap-4 w-full lg:w-1/2'>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282]'>مدير المدرسة</span>
            {
              SingleSchool?.managerSchool ? (
                <span className='text-sm md:text-base font-bold'>{SingleSchool?.managerSchool?.FullName}</span>
              ) : (
                <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2'>
                  <button 
                    className='bg-[#BE8D4A] text-white rounded-md p-1 md:p-0.5 gap-2 w-8 h-8 md:w-auto md:h-auto flex items-center justify-center'
                    onClick={() => setOpenAddMangerModal(true)}
                  >
                    <PlusIcon className='w-4 h-4' />
                  </button>
                  <span 
                    onClick={() => setOpenAddMangerModal(true)}
                    className='text-sm md:text-base font-bold cursor-pointer block sm:inline'
                  >
                    إضافة مدير مدرسة
                  </span>
                </div>
              )
            }
          </div>
          <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2 lg:w-full xl:w-1/2'>
            <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>المسوغات</span>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 md:justify-end'>
              <button className='bg-[#BE8D4A] text-white rounded-md p-1 md:p-0.5 gap-2 w-8 h-8 md:w-auto md:h-auto flex items-center justify-center'>
                <PlusIcon className='w-4 h-4' />
              </button>
              <span className='text-sm md:text-base font-bold cursor-pointer block sm:inline'>إضافة مسوغات</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Info Cards */}
      <div className='flex flex-col lg:flex-row justify-between gap-4 md:gap-6 w-full'>
        {/* Left Info Card */}
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4 w-full lg:w-1/2">
          <div className='flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>اسم الشركة</span>
              <span className='text-sm md:text-base font-bold break-words'>{SingleSchool?.mofwad?.CompanyName}</span>  
            </div>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>اسم المدرسة</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">
                {SingleSchool?.mainSchool?.School_FullName}
              </span>
            </div>
          </div>
          
          <hr className='border-t-2 border-[#C0C0C0] w-full'/>

          <div className='flex flex-col sm:flex-row justify-between gap-3 md:gap-4 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>البلدية</span>
              <span className='text-sm md:text-base font-bold break-words'>{SingleSchool?.mainSchool?.Baldia_FullName}</span>  
            </div>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>المكتب</span>
              <span className="text-sm md:text-base font-bold break-words md:text-left">
                {SingleSchool?.mainSchool?.OfficeName}
              </span>
            </div>
          </div>
        </div>

        {/* Right Info Card */}
        <div className="bg-white rounded-lg p-3 md:p-4 lg:p-6 flex flex-col gap-4 w-full lg:w-1/2">
          <div className='flex justify-between gap-4 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full'>
              <span className='text-xs md:text-sm font-bold text-[#828282] text-right'>موقع المدرسة المقترحة</span>
              <div 
                className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full cursor-pointer'
                onClick={() => setOpenMapModal(true)}
              >
                <span className="text-sm text-[#BE8D4A] md:text-base font-bold underline break-words text-right sm:text-left">
                  {SingleSchool?.mainSchool?.latitude} , {SingleSchool?.mainSchool?.longitude}
                </span>
                <button className='text-[#BE8D4A] font-bold rounded-md p-1 gap-2 text-sm md:text-base'>عرض</button>
              </div>
            </div>
          </div>
          
          <hr className='border-t-2 border-[#C0C0C0] w-full'/>

          <div className='flex flex-col sm:flex-row justify-between gap-4 md:gap-6 w-full'>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282]'>مرفقات أولية (صور الموقع)</span>
              <div className="w-full">
                <FileViewer id={SingleSchool?.mainSchool?.LocationPictureAttach} />
              </div>
            </div>
            <div className='flex flex-col justify-between gap-2 md:gap-4 w-full sm:w-1/2'>
              <span className='text-xs md:text-sm font-bold text-[#828282] md:text-left'>مرفقات أولية (موافقة الجيران)</span>
              <div className="w-full">
                <FileViewer id={SingleSchool?.mainSchool?.neighborsApproveAttach} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Manager Modal */}
      <Dialog open={openAddMangerModal} onOpenChange={setOpenAddMangerModal}>
        <DialogContent className='p-4 md:p-5 lg:p-[20px] max-w-3xl w-[95vw] md:w-full'>
          <DialogHeader className='flex justify-center w-full'>
            <DialogTitle className='text-base md:text-lg font-bold w-full text-right border-b-2 border-[#C0C0C0] pb-2'>
              إضافة مدير مدرسة
            </DialogTitle>
          </DialogHeader>
          <div className='flex flex-col md:flex-row items-end gap-4 md:gap-6 w-full mt-4'>
            <div className='flex flex-col gap-2 md:gap-4 w-full md:w-2/3'>
              <span className='text-sm md:text-base'>مدير مدرسة غير مكلف</span>
              <Select value={selectedManagerId} onValueChange={(value) => setSelectedManagerId(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder='برجاء إختيار مدير مدرسة غير مكلف' className='text-sm md:text-base font-bold' />
                </SelectTrigger>
                <SelectContent>
                  {
                    Managers.length === 0 && (
                      <SelectItem key={0} value={0}>لا يوجد مدراء مدارس غير مكلفين</SelectItem>
                    )
                  }
                  {Managers.map((manager) => (
                    <SelectItem key={manager.Id} value={manager.Id}>{manager.FullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center gap-2 w-full md:w-1/3'>
              <button className='bg-[#BE8D4A] text-white rounded-md p-1 md:p-0.5 gap-2 w-8 h-8 md:w-auto md:h-auto flex items-center justify-center'>
                <PlusIcon 
                  onClick={() => navigate("/requests/add-manger", { state: { schoolId: id, officeId: Office_id } })}
                  className='w-4 h-4'
                />
              </button>
              <span 
                onClick={() => navigate("/requests/add-manger", { state: { schoolId: id, officeId: Office_id } })}
                className='text-sm md:text-base font-bold cursor-pointer'
              >
                إضافة مدير مدرسة جديد
              </span>
            </div>
          </div>
          <DialogFooter className='flex flex-col sm:flex-row items-center gap-2 border-t-[1px] border-[#C0C0C0] pt-4 mt-4 md:mt-6'>
            <Button 
              onClick={() => setOpenAddMangerModal(false)} 
              className='hover:bg-red-600 hover:text-white bg-white text-red-500 border border-red-500 rounded-md p-2 md:p-0.5 gap-2 w-full sm:w-auto px-6 md:px-12'
            >
              الغاء
            </Button>
            <Button className='bg-[#BE8D4A] text-white rounded-md p-2 md:p-0.5 gap-2 w-full sm:w-auto px-6 md:px-12'>
              اضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default School