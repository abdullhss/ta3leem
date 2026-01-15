import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { DoTransaction } from '../../services/apiServices';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AddDepartmentForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
  });
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const onSubmit = async(data) => {
    const response = await DoTransaction(
      "ZIFEL17gLyWFPeaISNh4ydM8cDH8xmOCbmJhCEciZ/o=",
      `0#${data.departmentName}#${data.managerId}#${userData.School_Id}`,
      0,
      "Id#Description#SchoolEmployee_Id#School_id"
    );
    console.log(response);
    if(response.success != 200){
      toast.error(response.errorMessage || "فشل العملية");
    }else{
      toast.success("تم إضافة الإدارة بنجاح");
      navigate("/Departments");
    }
  };

  // المديرين المكلفين (Static Options)
  const managers = [
    { id: 0, name: 'أحمد علي' },
    { id: 0, name: 'محمود حسن' },
    { id: 0, name: 'سارة محمد' },
  ];

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 p-4 sm:p-6 bg-white rounded-lg shadow"
      >
        <span className="text-lg font-bold">إضافة إدارة جديدة</span>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* اسم الإدارة */}
          <div className="flex flex-col gap-2">
            <label>اسم الإدارة</label>
            <input
              {...register('departmentName', { required: 'هذا الحقل مطلوب' })}
              className="border rounded-md p-3 w-full"
              placeholder="ادخل اسم الإدارة"
            />
            {errors.departmentName && (
              <p className="text-red-500 text-sm">{errors.departmentName.message}</p>
            )}
          </div>

          {/* المدير المكلف */}
          <div className="flex flex-col gap-2">
            <label>المدير المكلف</label>
            <select
              {...register('managerId', { required: 'اختر المدير المكلف' })}
              className="border rounded-md p-2 w-full"
            >
              <option value="">اختر المدير المكلف</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            {errors.managerId && (
              <p className="text-red-500 text-sm">{errors.managerId.message}</p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-6">
          <button
            type="button"
            className="border border-red-500 text-red-500 w-full py-3 rounded-md"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-3 rounded-md text-white ${
              isValid ? 'bg-[#BE8D4A]' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            حفظ
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDepartmentForm;
