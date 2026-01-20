import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux';
import { DoTransaction } from '../../services/apiServices';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import useSchoolDepartment from '../../hooks/manger/useSchoolDepartment';

const AddSchoolDevision = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid }
  } = useForm()
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get devision data and action from location state
  const devisionData = location.state?.devisionData;
  const action = location.state?.action || 0; // 0 = add, 1 = edit
  const isEditMode = action === 1;
  const { SchoolDepartments : departments, loading: loadingDepartments } = useSchoolDepartment(userData?.School_Id || 0, "")
  console.log(departments);

  const departmentHeads = [
    { id: 0, name: 'أحمد محمد' },
    { id: 0, name: 'سارة علي' },
    { id: 0, name: 'محمد خالد' },
    { id: 0, name: 'فاطمة عبدالله' },
    { id: 0, name: 'خالد إبراهيم' }
  ]

  // Populate form when in edit mode
  useEffect(() => {
    if (isEditMode && devisionData) {
      setValue('divisionName', devisionData.Description || '');
      setValue('departmentId', devisionData.SchoolDepartment_Id || '');
      setValue('headId', devisionData.SchoolEmployee_Id || '');
    }
  
    if (!isEditMode) {
      setValue('headId', 0);
    }
  }, [isEditMode, devisionData, setValue]);
  

  const onSubmit = async (data) => {
    const devisionId = isEditMode
      ? (devisionData?.id || devisionData?.Id || 0)
      : 0;
  
    const headId = isEditMode ? data.headId : 0;
  
    const response = await DoTransaction(
      "SI2sCeLI3BHIzngEXxosAg==",
      `${devisionId}#${data.divisionName}#${data.departmentId}#${headId}#${userData.School_Id}`,
      action,
      "Id#Description#SchoolDepartment_Id#SchoolEmployee_Id#School_id"
    );
  
    if (response.success != 200) {
      toast.error(response.errorMessage || (isEditMode ? "فشل التعديل" : "فشل العملية"));
    } else {
      toast.success(isEditMode ? "تم تعديل القسم بنجاح" : "تم إضافة القسم بنجاح");
      navigate("/SchoolDevisions");
    }
  };
  
  return (
    <div className="p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 p-4 sm:p-6 bg-white rounded-lg shadow"
      >
        <span className="text-lg font-bold">{isEditMode ? 'تعديل قسم' : 'إضافة قسم جديد'}</span>
        
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
                  {dept.Description}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
            )}
          </div>

          {/* رئيس القسم المكلف - col-span-2 */}
          {isEditMode && (
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
          )}

        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
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
            {isEditMode ? 'تعديل' : 'إضافة'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddSchoolDevision