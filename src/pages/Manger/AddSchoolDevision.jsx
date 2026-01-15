import React from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux';
import { DoTransaction } from '../../services/apiServices';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AddSchoolDevision = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm()
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const departments = [
    { id: 0, name: 'إدارة التعليم الابتدائي' },
    { id: 0, name: 'إدارة التعليم الثانوي' },
    { id: 0 , name: 'إدارة التعليم الخاص' },
    { id: 0, name: 'إدارة المناهج' },
    { id: 0, name: 'إدارة التدريب' }
  ]

  const departmentHeads = [
    { id: 0, name: 'أحمد محمد' },
    { id: 0, name: 'سارة علي' },
    { id: 0, name: 'محمد خالد' },
    { id: 0, name: 'فاطمة عبدالله' },
    { id: 0, name: 'خالد إبراهيم' }
  ]

    const onSubmit = async (data) => {
        const response = await DoTransaction(
            "SI2sCeLI3BHIzngEXxosAg==",
            `0#${data.divisionName}#${data.departmentId}#${data.headId}#${userData.School_Id}`,
            0,
            "Id#Description#SchoolDepartment_Id#SchoolEmployee_Id#School_id"
        );
        console.log(response);
        if(response.success != 200){
            toast.error(response.errorMessage || "فشل العملية");
        }else{
            toast.success("تم إضافة القسم بنجاح");
            navigate("/SchoolDevision");
        }
    }

  return (
    <div className="p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 p-4 sm:p-6 bg-white rounded-lg shadow"
      >
        <span className="text-lg font-bold">إضافة قسم جديد</span>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* اسم القسم */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">اسم القسم</label>
            <input
              {...register('divisionName', { required: 'هذا الحقل مطلوب' })}
              className="border rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
              placeholder="ادخل اسم القسم"
            />
            {errors.divisionName && (
              <p className="text-red-500 text-sm mt-1">{errors.divisionName.message}</p>
            )}
          </div>

          {/* الإدارة */}
          <div className="flex flex-col gap-2">
            <label className="font-medium">الإدارة</label>
            <select
              {...register('departmentId', { required: 'اختر الإدارة' })}
              className="border rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
            >
              <option value="">اختر الإدارة</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
            )}
          </div>

          {/* رئيس القسم المكلف - col-span-2 */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-medium">رئيس القسم المكلف</label>
            <select
              {...register('headId', { required: 'اختر رئيس القسم المكلف' })}
              className="border rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
            >
              <option value="">اختر رئيس القسم المكلف</option>
              {departmentHeads.map((head) => (
                <option key={head.id} value={head.id}>
                  {head.name}
                </option>
              ))}
            </select>
            {errors.headId && (
              <p className="text-red-500 text-sm mt-1">{errors.headId.message}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            className="border border-red-500 text-red-500 hover:bg-red-50 w-full py-3 rounded-md font-medium transition-colors"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-3 rounded-md text-white font-medium transition-colors ${
              isValid 
                ? 'bg-[#BE8D4A] hover:bg-[#a87a3f]' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            إضافة
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddSchoolDevision