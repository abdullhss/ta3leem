import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TablePage from '../../components/TablePage';
import useStudentPunishments from '../../hooks/schools/useStudentPunishment';
import usePunishments from '@/hooks/schools/usePunishments';
import { DoTransaction } from '../../services/apiServices';
import { ConfirmModal } from '../../global/global-modal/ConfirmModal';
import useGlobalModal from '../../hooks/useModal';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { toast } from 'react-toastify';

const PUNISHMENT_TYPE_TABLE_KEY = 'q3Z+msHn3Hgis6un+cjaIKgl1Ux/754M93k/xpENAW0=';
const PUNISHMENT_TYPE_COLUMNS = 'Id#Description#isActive#School_Id';

// Student punishments tab columns
const studentColumns = [
  { uid: 'student_FullName', name: 'اسم الطالب' },
  { uid: 'EducationLeveL_Description', name: 'المرحلة الدراسية' },
  { uid: 'EducationClass_Description', name: 'الصف الدراسي' },
  { uid: 'SchoolClass_Description', name: 'الفصل' },
  { uid: 'StudentPunishmentType_Description', name: 'نوع العقوبة' },
  { uid: 'EducationYear_YearDesc', name: 'السنة الدراسية' },
  { uid: 'School_FullName', name: 'المدرسة' },
  { uid: 'actions', name: 'الإجراءات' },
];

// Punishment types tab columns
const punishmentTypeColumns = [
  { uid: 'Description', name: 'الوصف' },
  { uid: 'isActive', name: 'نشط' },
  { uid: 'actions', name: 'الإجراءات' },
];

const Punishments = () => {
  const navigate = useNavigate();
  const { userData, educationYearData } = useSelector((state) => state.auth);
  const { Modal, openModal: openGlobalModal, closeModal } = useGlobalModal();

  const [activeTab, setActiveTab] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const startNumber = (currentPage - 1) * rowsPerPage + 1;

  const { punishments, loading: punishmentsLoading, refetch: refetchPunishmentTypes } = usePunishments(
    userData?.School_Id ?? -1,
    '',
    -1
  );

  const { studentPunishments, totalCount, loading, error } = useStudentPunishments(
    userData?.School_Id ?? -1,
    -1,
    educationYearData?.Id ?? -1,
    -1,
    -1,
    -1,
    -1,
    startNumber,
    rowsPerPage
  );

  const [tableData, setTableData] = useState([]);

  const transformStudentData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((item) => ({
      id: item.Id,
      student_FullName: item.student_FullName?.trim() ?? '',
      EducationLeveL_Description: item.EducationLeveL_Description ?? '',
      EducationClass_Description: item.EducationClass_Description ?? '',
      SchoolClass_Description: item.SchoolClass_Description ?? '',
      StudentPunishmentType_Description: item.StudentPunishmentType_Description ?? '',
      EducationYear_YearDesc: item.EducationYear_YearDesc?.trim() ?? '',
      School_FullName: item.School_FullName ?? '',
      _fullData: item,
    }));
  };

  const punishmentTypesTableData = useMemo(() => {
    if (!punishments || !Array.isArray(punishments)) return [];
    return punishments.map((item) => ({
      id: item.Id,
      Description: item.Description ?? '',
      isActive: item.isActive ?? false,
      _fullData: item,
    }));
  }, [punishments]);

  useEffect(() => {
    setTableData(transformStudentData(studentPunishments));
  }, [studentPunishments]);

  const fetchApi = async (search, page, rowsPerPageValue) => {
    setCurrentPage(page);
    setRowsPerPage(rowsPerPageValue ?? rowsPerPage);
  };

  const handleToggleActive = useCallback(
    async (item) => {
      const row = item._fullData ?? item;
      const id = row.Id ?? item.id;
      const description = row.Description ?? item.Description ?? '';
      const schoolId = userData?.School_Id ?? row.school_id;
      const newActive = !(row.isActive ?? item.isActive ?? false);

      setTogglingId(id);
      try {
        const payload = [id, description, newActive, schoolId].join('#');
        const response = await DoTransaction(
          PUNISHMENT_TYPE_TABLE_KEY,
          payload,
          1,
          PUNISHMENT_TYPE_COLUMNS
        );
        if (response?.success !== 200) {
          toast.error(response?.errorMessage || 'فشل في تحديث الحالة');
        } else {
          toast.success(newActive ? 'تم تفعيل نوع العقوبة' : 'تم إلغاء تفعيل نوع العقوبة');
          refetchPunishmentTypes?.();
        }
      } catch (err) {
        console.error(err);
        toast.error('حدث خطأ أثناء التحديث');
      } finally {
        setTogglingId(null);
      }
    },
    [userData?.School_Id, refetchPunishmentTypes]
  );

  const confirmDeleteType = useCallback(async (targetItem) => {
    const target = targetItem ?? deleteTarget;
    if (!target) return;
    const id = target.id ?? target._fullData?.Id ?? target.Id;
    try {
      const response = await DoTransaction(PUNISHMENT_TYPE_TABLE_KEY, String(id), 2);
      if (response?.success !== 200) {
        toast.error(response?.errorMessage || 'فشل في حذف نوع العقوبة');
      } else {
        toast.success('تم حذف نوع العقوبة بنجاح');
        setDeleteTarget(null);
        refetchPunishmentTypes?.();
      }
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء الحذف');
    }
  }, [deleteTarget, refetchPunishmentTypes]);

  const handleDeleteType = useCallback(
    (item) => {
      setDeleteTarget(item);
      openGlobalModal?.(
        <ConfirmModal
          desc="هل أنت متأكد من حذف نوع العقوبة؟"
          confirmFunc={async () => {
            await confirmDeleteType(item);
            closeModal();
          }}
          onClose={() => {
            setDeleteTarget(null);
            closeModal();
          }}
        />,
        'تأكيد الحذف'
      );
    },
    [openGlobalModal, closeModal, confirmDeleteType]
  );

  const specialCellsPunishmentTypes = useMemo(
    () => [
      {
        key: 'isActive',
        render: (value, item) => {
          const active = item.isActive ?? item._fullData?.isActive ?? false;
          const id = item.id ?? item._fullData?.Id;
          const isToggling = togglingId === id;
          return (
            <Checkbox
              checked={active}
              onCheckedChange={() => handleToggleActive(item)}
              disabled={isToggling}
              className="w-4 h-4"
            />
          );
        },
      },
    ],
    [togglingId, handleToggleActive]
  );

  const studentActionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData ?? item;
        navigate('/add-punishment', { state: { action: 1, punishmentData: data } });
      },
    },
    {
      label: 'حذف',
      danger: true,
      onClick: (item) => {
        const data = item._fullData ?? item;
        navigate('/add-punishment', { state: { action: 2, punishmentData: data } });
      },
    },
  ];

  const punishmentTypeActionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData ?? item;
        navigate('/add-punishment-type', { state: { action: 1, punishmentTypeData: data } });
      },
    },
    {
      label: 'حذف',
      danger: true,
      onClick: (item) => handleDeleteType(item),
    },
  ];

  const getCurrentTabData = () => {
    if (activeTab === 'students') {
      return {
        data: tableData,
        total: totalCount ?? 0,
        loading,
        columns: studentColumns,
        actionsConfig: studentActionsConfig,
        title: 'عقوبات الطلبة',
        addButtonTitle: 'إضافة عقوبة',
        addButtonPath: '/add-punishment',
        specialCells: undefined,
      };
    }
    if (activeTab === 'types') {
      return {
        data: punishmentTypesTableData,
        total: punishmentTypesTableData.length,
        loading: punishmentsLoading,
        columns: punishmentTypeColumns,
        actionsConfig: punishmentTypeActionsConfig,
        title: 'أنواع العقوبات',
        addButtonTitle: 'إضافة نوع عقوبة',
        addButtonPath: '/add-punishment-type',
        specialCells: specialCellsPunishmentTypes,
      };
    }
    return null;
  };

  const currentTabData = getCurrentTabData();

  return (
    <div className="w-full h-full flex flex-col gap-8 p-4 sm:p-6">
      <AnimatePresence mode="wait">
        {!activeTab && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6 sm:gap-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 sm:p-6 bg-white rounded-lg font-bold text-black">
              <span className="text-base sm:text-lg">العقوبات</span>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-6 bg-white rounded-lg font-bold">
              <Button
                onClick={() => setActiveTab('students')}
                className="bg-[#C18C46] hover:bg-[#A97838] text-white text-base sm:text-lg w-full md:max-w-[40%] py-6"
              >
                عقوبات الطلبة
              </Button>
              <Button
                onClick={() => setActiveTab('types')}
                className="bg-[#C18C46] hover:bg-[#A97838] text-white text-base sm:text-lg w-full md:max-w-[40%] py-6"
              >
                أنواع العقوبات
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab && currentTabData && (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full"
          >
            <div className="bg-white rounded-lg p-4">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-bold">
                  {activeTab === 'students' ? 'عقوبات الطلبة' : 'أنواع العقوبات'}
                </h2>
                <button
                  onClick={() => setActiveTab(null)}
                  className="text-[#C18C46] hover:text-[#A97838] font-medium text-sm flex items-center gap-2"
                >
                  <span>العودة</span>
                </button>
              </div>

              <TablePage
                data={currentTabData.data}
                columns={currentTabData.columns}
                total={currentTabData.total}
                fetchApi={fetchApi}
                isLoading={currentTabData.loading}
                rowsPerPageDefault={activeTab === 'students' ? 10 : 5}
                clickable={false}
                tableTitle={currentTabData.title}
                isHeaderSticky={true}
                AddButtonProps={{
                  title: currentTabData.addButtonTitle,
                  path: currentTabData.addButtonPath,
                }}
                actionsConfig={currentTabData.actionsConfig}
                specialCells={currentTabData.specialCells}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isDismissable={false} />
    </div>
  );
};

export default Punishments;
