import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { DoTransaction } from '../../services/apiServices';

const PUNISHMENT_TYPE_TABLE_KEY = 'q3Z+msHn3Hgis6un+cjaIKgl1Ux/754M93k/xpENAW0=';
const PUNISHMENT_TYPE_COLUMNS = 'Id#Description#isActive#School_Id';

// مخطط التحقق
const punishmentTypeSchema = z.object({
  name: z
    .string()
    .min(1, 'اسم العقوبة مطلوب')
    .min(2, 'يجب أن يحتوي الاسم على حرفين على الأقل')
    .max(100, 'يجب ألا يتجاوز الاسم 100 حرف'),
});

const AddPunishmentType = () => {
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editState = location.state;
  const isEditMode = editState?.action === 1 && editState?.punishmentTypeData;
  const punishmentTypeData = editState?.punishmentTypeData ?? {};

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(punishmentTypeSchema),
    defaultValues: { name: punishmentTypeData.Description ?? '' },
  });

  useEffect(() => {
    if (isEditMode && punishmentTypeData.Description) {
      reset({ name: punishmentTypeData.Description });
    }
  }, [isEditMode, punishmentTypeData.Description, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const action = isEditMode ? 1 : 0;
      const id = isEditMode ? (punishmentTypeData.Id ?? punishmentTypeData.id) : 0;
      const isActive = isEditMode ? (punishmentTypeData.isActive ?? true) : true;
      const schoolId = userData?.School_Id ?? punishmentTypeData.school_id;

      const payload = [id, data.name, isActive, schoolId].join('#');

      const response = await DoTransaction(
        PUNISHMENT_TYPE_TABLE_KEY,
        payload,
        action,
        PUNISHMENT_TYPE_COLUMNS
      );

      if (response?.success !== 200) {
        toast.error(
          response?.errorMessage ||
            (isEditMode ? 'فشل في تعديل نوع العقوبة' : 'فشل في إضافة نوع العقوبة')
        );
      } else {
        toast.success(isEditMode ? 'تم تعديل نوع العقوبة بنجاح' : 'تم إضافة نوع العقوبة بنجاح');
        navigate('/punishments');
      }
    } catch (error) {
      console.error(isEditMode ? 'Error editing punishment type:' : 'Error adding punishment type:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors) => {
    console.log('Validation Errors:', errors);
  };

  return (
    <div className="flex gap-4 px-4 md:px-0 justify-center overflow-y-auto">
      <div className="w-full relative pb-8 bg-white rounded-lg p-6">
        <span className="text-lg font-bold">
          {isEditMode ? 'تعديل نوع العقوبة' : 'إضافة نوع العقوبة'}
        </span>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="mt-10">
          <div className="mt-10 grid grid-cols-1 gap-6">
            {/* اسم العقوبة */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">اسم العقوبة</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2"
                placeholder="أدخل اسم نوع العقوبة"
                {...register('name')}
                disabled={isSubmitting}
              />
              {errors.name && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </span>
              )}
            </div>
          </div>

          {/* أزرار الإضافة والإلغاء */}
          <div className="flex w-full gap-4 mt-10">
            <button
              type="button"
              className="w-full text-red-500 border border-red-500 transition-all duration-300 px-8 py-3 rounded text-lg font-semibold hover:bg-red-500 hover:text-white"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-[#BE8D4A] w-full text-white px-8 py-3 rounded text-lg font-semibold hover:bg-[#a67c42] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditMode
                  ? 'جاري الحفظ...'
                  : 'جاري الإضافة...'
                : isEditMode
                  ? 'حفظ'
                  : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPunishmentType;