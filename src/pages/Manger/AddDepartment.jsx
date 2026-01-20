import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { DoTransaction } from '../../services/apiServices';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import useSchoolEmployeeByDepartment from '../../hooks/manger/useSchoolEmployeeByDepartment';

const AddDepartmentForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
  });
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get department data and action from location state
  const departmentData = location.state?.departmentData;
  const action = location.state?.action || 0; // 0 = add, 1 = edit
  const isEditMode = action === 1;
  console.log(departmentData);
  const { SchoolEmployees, EmployeeCount, loading, error } = useSchoolEmployeeByDepartment(
    userData.School_Id,
    departmentData?.id,
    1,
    "",
    1,
    10000
  );
  console.log(SchoolEmployees);

  const onSubmit = async (data) => {
    const departmentId = isEditMode
      ? (departmentData?.id || departmentData?.Id || 0)
      : 0;
  
    const managerId = isEditMode ? data.managerId : 0;
  
    const response = await DoTransaction(
      "ZIFEL17gLyWFPeaISNh4ydM8cDH8xmOCbmJhCEciZ/o=",
      `${departmentId}#${data.departmentName}#${managerId}#${userData.School_Id}`,
      action,
      "Id#Description#SchoolEmployee_Id#School_id"
    );
  
    if (response.success != 200) {
      toast.error(response.errorMessage || (isEditMode ? "فشل التعديل" : "فشل العملية"));
    } else {
      toast.success(isEditMode ? "تم تعديل الإدارة بنجاح" : "تم إضافة الإدارة بنجاح");
      navigate("/Departments");
    }
  };
  
  useEffect(() => {
    if (isEditMode && departmentData) {
      setValue('departmentName', departmentData.Description || '');
      setValue('managerId', departmentData.SchoolEmployee_Id || '');
    }
  
    if (!isEditMode) {
      setValue('managerId', 0);
    }
  }, [isEditMode, departmentData, setValue]);

  // Populate form when in edit mode
  useEffect(() => {
    if (isEditMode && departmentData) {
      setValue('departmentName', departmentData.Description || '');
      setValue('managerId', departmentData.SchoolEmployee_Id || '');
    }
  }, [isEditMode, departmentData, setValue]);

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 p-4 sm:p-6 bg-white rounded-lg shadow"
      >
        <span className="text-lg font-bold">{isEditMode ? 'تعديل إدارة' : 'إضافة إدارة جديدة'}</span>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* اسم الإدارة */}
          <div className={`flex flex-col gap-2 ${isEditMode ? '' : 'col-span-2'}`}>
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
          {isEditMode && (
            <div className="flex flex-col gap-2">
              <label>المدير المكلف</label>
              <select
                {...register('managerId', { required: 'اختر المدير المكلف' })}
                className="border rounded-md p-2 w-full"
              >
                <option value="">اختر المدير المكلف</option>
                {SchoolEmployees.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.FullName}
                  </option>
                ))}
              </select>
              {errors.managerId && (
                <p className="text-red-500 text-sm">{errors.managerId.message}</p>
              )}
            </div>
          )}

        </div>

        {/* Buttons */}
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="border border-red-500 text-red-500 w-full py-3 rounded-md hover:bg-red-50 transition-colors"
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-3 rounded-md text-white transition-colors ${
              isValid ? 'bg-[#BE8D4A] hover:bg-[#a87a3f]' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isEditMode ? 'تعديل' : 'حفظ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDepartmentForm;
