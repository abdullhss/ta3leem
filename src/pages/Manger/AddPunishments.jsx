import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

// Hooks
import useEducationLevelForSchool from '../../hooks/schools/useEducationLevelForSchool';
import useEducationClassForSchool from '../../hooks/schools/useEducationClassForSchool';
import useSchoolClass from '../../hooks/useSchoolClass';
import useEducationSecondaryLevelType from '../../hooks/useEducationSecondaryLevelType';
import useStudentsByClass from '../../hooks/schools/useStudentsByClass';
// Assume this hook exists or replace with your actual hook
import usePunishments from '../../hooks/schools/usePunishments';
import { DoTransaction } from '../../services/apiServices';
import { ConfirmModal } from '../../global/global-modal/ConfirmModal';

// Animation variants (copied from AddTransfer)
const fadeIn = {
  initial: { opacity: 0, height: 0 },
  animate: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 },
  },
};

// Zod validation schema for punishment
const addPunishmentSchema = z.object({
  educationalStage: z.string().min(1, 'المرحلة الدراسية مطلوبة'),
  grade: z.string().min(1, 'الصف الدراسي مطلوب'),
  semester: z.string().min(1, 'الفصل الدراسي مطلوب'),
  educationSecondaryLevelType: z.string().optional(),
  studentId: z.string().min(1, 'اسم الطالب مطلوب'),
  punishmentTypeId: z.string().min(1, 'نوع العقوبة مطلوب'),
  // Optional fields (like reason, date) can be added later
});

// Placeholder – replace with actual table key
const PUNISHMENT_TABLE_KEY = 'YourPunishmentTableKey';

const AddPunishments = () => {
  const { userData, educationYearData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const action = location.state?.action ?? 0; // 0 = add, 1 = edit, 2 = delete
  const punishmentData = location.state?.punishmentData;
  const isEditMode = action === 1;
  const isDeleteMode = action === 2;
  const punishmentId = punishmentData?.Id ?? punishmentData?.id;

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State for dependent selects
  const [selectedEducationalStage, setSelectedEducationalStage] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // ---------- Data fetching ----------
  // Education levels (المرحلة الدراسية)
  const { EducationLevels, loading: educationLevelsLoading } =
    useEducationLevelForSchool({
      school_id: userData.School_Id,
    });

  // Education classes (الصف الدراسي) – filtered by selected level
  const { EducationClasses, loading: educationClassesLoading } =
    useEducationClassForSchool({
      school_id: userData.School_Id,
    });

  // School classes (الفصل الدراسي) – filtered by level & grade
  const { SchoolClasses, loading: schoolClassesLoading } = useSchoolClass(
    userData.School_Id,
    '',
    1,
    10000
  );

  // Secondary level types (الشعبة) – only for stage 4
  const { EducationSecondaryLevelTypes, loading: secondaryLevelsLoading } =
    useEducationSecondaryLevelType();

  // Students – filtered by selected semester (SchoolClass_id)
  const { Students, loading: studentsLoading } = useStudentsByClass({
    School_id: userData.School_Id,
    EducationYear_Id: educationYearData?.Id || 0,
    SchoolClass_id: selectedSemester || 0,
    EducationPeriod_id: -1,
    value: '',
    StartNum: 1,
    Count: 10000,
  });

  // Punishment types – replace with your actual hook
  const { punishments, loading: punishmentsLoading } =
    usePunishments(userData.School_Id);

  // ---------- React Hook Form ----------
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addPunishmentSchema),
    defaultValues: {
      educationalStage: '',
      grade: '',
      semester: '',
      educationSecondaryLevelType: '',
      studentId: '',
      punishmentTypeId: '',
    },
  });

  // Watch form values
  const watchEducationalStage = watch('educationalStage');
  const watchGrade = watch('grade');
  const watchSemester = watch('semester');

  // ---------- Dependent filters ----------
  // Filter education classes by selected educational stage
  const allowedEducationClasses = EducationClasses.filter(
    (ec) => ec.EducationLevel_Id == selectedEducationalStage
  );

  // Filter school classes by selected educational stage and grade
  const allowedSchoolClasses = SchoolClasses.filter(
    (sc) =>
      sc.EducationLevel_Id == selectedEducationalStage &&
      sc.EducationClass_Id == selectedGrade
  );

  // ---------- Sync selected values with form watchers ----------
  useEffect(() => {
    setSelectedEducationalStage(watchEducationalStage);
  }, [watchEducationalStage]);

  useEffect(() => {
    setSelectedGrade(watchGrade);
  }, [watchGrade]);

  useEffect(() => {
    setSelectedSemester(watchSemester);
  }, [watchSemester]);

  // Pre-fill form in edit mode from punishmentData – set both form values and filter state
  // so dependent dropdowns (grade, semester, students) have options and show the selected value
  useEffect(() => {
    if (!isEditMode || !punishmentData) return;
    const d = punishmentData;
    const levelId = String(d.EducationLevel_Id ?? '');
    const classId = String(d.EducationClass_Id ?? '');
    const schoolClassId = String(d.SchoolClass_Id ?? '');
    const studentIdVal = String(d.Student_id ?? '');
    const punishmentTypeVal = String(d.StudentPunishmentType_Id ?? '');

    setSelectedEducationalStage(levelId);
    setSelectedGrade(classId);
    setSelectedSemester(schoolClassId);

    setValue('educationalStage', levelId);
    setValue('grade', classId);
    setValue('semester', schoolClassId);
    setValue('studentId', studentIdVal);
    setValue('punishmentTypeId', punishmentTypeVal);
    if (d.EducationSecondaryLevelType_Id != null && d.EducationSecondaryLevelType_Id !== '') {
      setValue('educationSecondaryLevelType', String(d.EducationSecondaryLevelType_Id));
    }
  }, [isEditMode, punishmentData, setValue]);

  // Clear dependent fields when educational stage changes (skip in edit mode when pre-filled)
  useEffect(() => {
    if (isEditMode && punishmentData) return;
    if (selectedEducationalStage) {
      setValue('grade', '');
      setValue('semester', '');
      setValue('studentId', '');
    }
  }, [selectedEducationalStage, setValue, isEditMode, punishmentData]);

  // Clear dependent fields when grade changes
  useEffect(() => {
    if (isEditMode && punishmentData) return;
    if (selectedGrade) {
      setValue('semester', '');
      setValue('studentId', '');
    }
  }, [selectedGrade, setValue, isEditMode, punishmentData]);

  // Clear student when semester changes
  useEffect(() => {
    if (isEditMode && punishmentData) return;
    if (selectedSemester) {
      setValue('studentId', '');
    }
  }, [selectedSemester, setValue, isEditMode, punishmentData]);

  // ---------- Form Submission (add = 0, edit = 1) ----------
  const onSubmit = async (data) => {
    try {
      const id = isEditMode ? (punishmentId ?? punishmentData?.Id ?? punishmentData?.id) : 0;
      const payload = [
        id,
        userData.School_Id,
        educationYearData?.Id || 0,
        data.educationalStage,
        data.grade,
        data.semester,
        data.studentId,
        data.punishmentTypeId
      ].join('#');

      const response = await DoTransaction(
        "q3Z+msHn3Hgis6un+cjaIOjm1eQZglUZPOFMCGgkNxE=",
        payload,
        isEditMode ? 1 : 0, // 0 = add, 1 = edit
        'Id#School_Id#EducationYear_Id#EducationLevel_Id#EducationClass_Id#SchoolClass_Id#Student_id#StudentPunishmentType_Id'
      );

      if (response?.success !== 200) {
        toast.error(response?.errorMessage || (isEditMode ? 'فشل في تعديل العقوبة' : 'فشل في إضافة العقوبة'));
      } else {
        toast.success(isEditMode ? 'تم تعديل العقوبة بنجاح' : 'تم إضافة العقوبة بنجاح');
        navigate('/punishments');
      }
    } catch (error) {
      console.error('Error saving punishment:', error);
      toast.error('حدث خطأ أثناء ' + (isEditMode ? 'تعديل' : 'إضافة') + ' العقوبة');
    }
  };

  // ---------- Delete ----------
  const handleDelete = async () => {
    const idToDelete = punishmentData?.Id ?? punishmentData?.id;
    if (!idToDelete) {
      toast.error('بيانات العقوبة غير صحيحة');
      return;
    }
    try {
      const response = await DoTransaction(
        "q3Z+msHn3Hgis6un+cjaIOjm1eQZglUZPOFMCGgkNxE=",
        String(idToDelete),
        2 // action 2 = delete
      );
      if (response?.success === 200) {
        toast.success('تم حذف العقوبة بنجاح');
        setShowDeleteModal(false);
        navigate('/punishments');
      } else {
        toast.error(response?.errorMessage || 'فشل في حذف العقوبة');
      }
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const onError = (errors) => {
    console.log('Validation Errors:', errors);
  };

  // Delete mode: show confirmation screen
  if (isDeleteMode && punishmentData) {
    const displayName = punishmentData.student_FullName?.trim() || punishmentData.StudentPunishmentType_Description || 'هذه العقوبة';
    return (
      <div className="flex gap-4 px-4 md:px-0 justify-center overflow-y-auto">
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <ConfirmModal
                desc={`هل أنت متأكد من حذف العقوبة "${displayName}"؟`}
                confirmFunc={handleDelete}
                onClose={() => setShowDeleteModal(false)}
              />
            </div>
          </div>
        )}
        <div className="w-full relative pb-8 bg-white rounded-lg p-6">
          <span className="text-lg font-bold">حذف عقوبة</span>
          <div className="flex flex-col gap-6 pt-4 mt-10">
            <div className="text-center py-8">
              <p className="text-base text-foreground">
                هل أنت متأكد من حذف العقوبة <strong>"{displayName}"</strong>؟
              </p>
              <p className="text-sm text-gray-500 mt-2">لا يمكن التراجع عن هذا الإجراء</p>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                className="flex-1 text-red-500 border border-red-500 px-8 py-3 rounded text-lg font-semibold hover:bg-red-500 hover:text-white transition-colors"
                onClick={() => navigate(-1)}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="flex-1 bg-red-500 text-white px-8 py-3 rounded text-lg font-semibold hover:bg-red-600"
                onClick={() => setShowDeleteModal(true)}
              >
                حذف العقوبة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 px-4 md:px-0 justify-center overflow-y-auto">
      <div className="w-full relative pb-8 bg-white rounded-lg p-6">
        <span className="text-lg font-bold">{isEditMode ? 'تعديل عقوبة' : 'إضافة عقوبة'}</span>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="mt-10">
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* المرحلة الدراسية */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">المرحلة الدراسية</label>
              <select
                className="border border-gray-300 rounded px-3 py-2"
                {...register('educationalStage')}
                disabled={educationLevelsLoading}
              >
                <option value="">اختر المرحلة الدراسية</option>
                {EducationLevels.map((level) => (
                  <option key={level.Id || level.id} value={String(level.Id ?? level.id)}>
                    {level.Description}
                  </option>
                ))}
              </select>
              {errors.educationalStage && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.educationalStage.message}
                </span>
              )}
            </div>

            {/* الصف الدراسي */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">الصف الدراسي</label>
              <select
                className="border border-gray-300 rounded px-3 py-2"
                {...register('grade')}
                disabled={!selectedEducationalStage || educationClassesLoading}
              >
                <option value="">اختر الصف الدراسي</option>
                {allowedEducationClasses.map((grade) => (
                  <option key={grade.id ?? grade.Id} value={String(grade.Id ?? grade.id)}>
                    {grade.Description}
                  </option>
                ))}
              </select>
              {errors.grade && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.grade.message}
                </span>
              )}
            </div>

            {/* الفصل الدراسي */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">الفصل الدراسي</label>
              <select
                className="border border-gray-300 rounded px-3 py-2"
                {...register('semester')}
                disabled={!selectedGrade || schoolClassesLoading}
              >
                <option value="">اختر الفصل الدراسي</option>
                {allowedSchoolClasses.map((semester) => (
                  <option
                    key={semester.id ?? semester.Id}
                    value={String(semester.Id ?? semester.id)}
                  >
                    {semester.Descrition ||
                      semester.Description ||
                      semester.SchoolClass_Description}
                  </option>
                ))}
              </select>
              {errors.semester && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.semester.message}
                </span>
              )}
            </div>

            {/* الشعبة الدراسية – تظهر فقط إذا المرحلة == 4 */}
            <AnimatePresence>
              {selectedEducationalStage === '4' && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className="mb-1 font-semibold">
                    الشعبة الدراسية (اختياري)
                  </label>
                  <select
                    className="border border-gray-300 rounded px-3 py-2"
                    {...register('educationSecondaryLevelType')}
                    disabled={secondaryLevelsLoading}
                  >
                    <option value="">اختر الشعبة الدراسية</option>
                    {EducationSecondaryLevelTypes.map((type) => (
                      <option key={type.Id ?? type.id} value={String(type.Id ?? type.id)}>
                        {type.Description}
                      </option>
                    ))}
                  </select>
                  {errors.educationSecondaryLevelType && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.educationSecondaryLevelType.message}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* اسم الطالب */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">اسم الطالب</label>
              <select
                className="border border-gray-300 rounded px-3 py-2"
                {...register('studentId')}
                disabled={!selectedSemester || studentsLoading}
              >
                <option value="">اختر اسم الطالب</option>
                {Students.map((student) => (
                  <option key={student.Id ?? student.id} value={String(student.Id ?? student.id)}>
                    {student.FullName}
                  </option>
                ))}
              </select>
              {errors.studentId && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.studentId.message}
                </span>
              )}
            </div>

            {/* نوع العقوبة + زر إضافة نوع جديد */}
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 font-semibold">نوع العقوبة</label>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <select
                  className="border border-gray-300 rounded px-3 py-2 flex-1 w-full"
                  {...register('punishmentTypeId')}
                  disabled={punishmentsLoading}
                >
                  <option value="">اختر نوع العقوبة</option>
                  {punishments?.map((type) => (
                    <option key={type.Id} value={String(type.Id)}>
                      {type.Description}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => navigate('/add-punishment-type')}
                  className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-5 py-2 rounded whitespace-nowrap hover:bg-[#a67c42] transition-colors"
                >
                  <PlusCircle size={18} />
                  إضافة نوع عقوبة
                </button>
              </div>
              {errors.punishmentTypeId && (
                <span className="text-red-500 text-sm mt-1">
                  {errors.punishmentTypeId.message}
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
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="bg-[#BE8D4A] w-full text-white px-8 py-3 rounded text-lg font-semibold hover:bg-[#a67c42]"
            >
              {isEditMode ? 'حفظ التعديلات' : 'إضافة عقوبة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPunishments;