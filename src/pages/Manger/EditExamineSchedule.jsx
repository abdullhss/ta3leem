import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { toast } from "react-toastify";

import TablePage from "../../components/TablePage";
import Divider from "../../components/Divider";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

import useEducationLevelForSchool from "../../hooks/schools/useEducationLevelForSchool";
import useEducationClassForSchool from "../../hooks/schools/useEducationClassForSchool";
import useEducationSecondaryLevelType from "../../hooks/useEducationSecondaryLevelType";
import useEducationPeriodForSchool from "../../hooks/schools/useEducationPeriodForSchool";
import useEducationMaterials from "../../hooks/useEducationMaterials";
import useExamineScheduleDetails from "../../hooks/schools/useExamineScheduleDetails";
import { DoMultiTransaction, DoTransaction, executeProcedure } from "../../services/apiServices";

import ScheduleRowModal from "./components/ScheduleRowModal";
import useEducationExamineType from "../../hooks/schools/useEducationExamineType";

// Schema for one schedule row (subject, date, times, duration)
const scheduleItemSchema = z.object({
  subjectId: z.string().min(1, "المادة مطلوبة"),
  subjectLabel: z.string().optional(),
  examDate: z.any().refine(
    (val) => val !== null && val !== undefined && val !== "",
    { message: "تاريخ الامتحان مطلوب" }
  ),
  timeFrom: z.string().min(1, "التوقيت من مطلوب"),
  timeTo: z.string().min(1, "التوقيت الى مطلوب"),
  examDuration: z.string().min(1, "زمن الامتحان مطلوب"),
});

const examineScheduleFormSchema = z
  .object({
    educationLevelId: z.string().min(1, "المرحلة الدراسية مطلوبة"),
    educationClassId: z.string().min(1, "الصف الدراسي مطلوب"),
    secondaryTypeId: z.string().optional(),
    educationPeriodId: z.string().min(1, "نوع الفترة مطلوب"),
    educationExamineTypeId: z.string().min(1, "نوع الامتحان مطلوب"),
    scheduleItems: z
      .array(scheduleItemSchema)
      .min(1, "يجب إضافة مادة واحدة على الأقل لجدول الامتحانات")
      .default([]),
  })
  .refine(
    (data) => {
      if (data.educationLevelId === "4") {
        return (
          data.secondaryTypeId != null &&
          String(data.secondaryTypeId).trim().length > 0
        );
      }
      return true;
    },
    {
      message: "الشعبة مطلوبة عند اختيار المرحلة الثانوية",
      path: ["secondaryTypeId"],
    }
  );

function formatDateForDisplay(val) {
  if (!val) return "—";
  try {
    if (dayjs.isDayjs(val)) return val.format("DD/MM/YYYY");
    return dayjs(val).format("DD/MM/YYYY");
  } catch {
    return String(val);
  }
}

const scheduleTableColumns = [
  { uid: "subject", name: "المادة" },
  { uid: "examDate", name: "تاريخ الامتحان" },
  { uid: "timeFrom", name: "التوقيت من" },
  { uid: "timeTo", name: "التوقيت الى" },
  { uid: "examDuration", name: "زمن الامتحان" },
  { uid: "actions", name: "الإجراءات" },
];

/**
 * Map API schedule details to form values.
 * detailsPayload can be array (first item) or single object.
 * ExamineScheduleMaterials: EducationMaterial_Id/EducationMaterialName_Id, ExamineDate, FromTime, ToTime, ExaminePeriod
 */
function mapDetailsToFormValues(detailsPayload) {
  if (!detailsPayload || typeof detailsPayload !== "object") return null;
  const raw = Array.isArray(detailsPayload)
    ? detailsPayload[0]
    : detailsPayload;
  if (!raw || typeof raw !== "object") return null;

  const materials = Array.isArray(raw.ExamineScheduleMaterials)
    ? raw.ExamineScheduleMaterials
    : [];

  const scheduleItems = materials.map((row) => ({
    id: row.id ?? row.Id,
    subjectId: String(
      row.EducationMaterial_Id ?? row.EducationMaterialName_Id ?? ""
    ),
    subjectLabel:
      row.EducationMaterialName_Description ??
      row.EducationMaterial_Description ??
      "",
    examDate: row.ExamineDate ? dayjs(row.ExamineDate) : null,
    timeFrom: row.FromTime ?? "",
    timeTo: row.ToTime ?? "",
    examDuration: row.ExaminePeriod ?? "",
  }));

  return {
    educationLevelId: String(raw.EducationLevel_Id ?? ""),
    educationClassId: String(raw.EducationClass_Id ?? ""),
    secondaryTypeId: String(raw.EducationSecondaryLevelType_Id ?? "").trim() || "",
    educationPeriodId: String(raw.EducationPeriod_Id ?? ""),
    educationExamineTypeId: String(raw.EducationExamineType_Id ?? ""),
    scheduleItems,
  };
}

const EditExamineSchedule = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const scheduleId = location.state?.scheduleId;
  const isEditMode = Boolean(scheduleId);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const detailsAppliedRef = useRef(false);

  const { userData, educationYearData } = useSelector((state) => state.auth);

  const { EducationLevels, loading: educationLevelsLoading } =
    useEducationLevelForSchool({ school_id: userData?.School_Id });
  const { EducationClasses, loading: educationClassesLoading } =
    useEducationClassForSchool({ school_id: userData?.School_Id });
  const {
    EducationSecondaryLevelTypes,
    loading: secondaryTypeDataLoading,
  } = useEducationSecondaryLevelType();
  const { EducationPeriods, loading: educationPeriodsLoading } =
    useEducationPeriodForSchool({ school_id: userData?.School_Id });
  const { educationMaterials, loading: educationMaterialsLoading } =
    useEducationMaterials("", 1);

    
  const { educationExamineTypes, loading: educationExamineTypesLoading } = useEducationExamineType();
  console.log(educationExamineTypes);
  

  const {
    examineScheduleDetails,
    loading: loadingDetails,
    error: detailsError,
  } = useExamineScheduleDetails(
    userData?.School_Id,
    scheduleId || "0",
    1
  );

  const educationLevelOptions = useMemo(
    () =>
      (EducationLevels || []).map((level) => ({
        value: String(level.Id ?? level.id),
        label: level.Description ?? "",
      })),
    [EducationLevels]
  );

  

  const secondaryTypeOptions = useMemo(
    () =>
      (EducationSecondaryLevelTypes || []).map((type) => ({
        value: String(type.id ?? type.Id),
        label: type.Description ?? "",
      })),
    [EducationSecondaryLevelTypes]
  );

  const materialOptions = useMemo(
    () =>
      (educationMaterials || []).map((m) => ({
        value: String(m.Id ?? m.id),
        label: m.Description ?? m.Name ?? m.MaterialName ?? "",
      })),
    [educationMaterials]
  );

  const educationPeriodOptions = useMemo(
    () =>
      (EducationPeriods || []).map((p) => ({
        value: String(p.Id ?? p.id),
        label: p.Description ?? p.Name ?? "",
      })),
    [EducationPeriods]
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(examineScheduleFormSchema),
    defaultValues: {
      educationLevelId: "",
      educationClassId: "",
      secondaryTypeId: "",
      educationPeriodId: "",
      educationExamineTypeId: "",
      scheduleItems: [],
    },
  });

  const scheduleItems = watch("scheduleItems") || [];
  const selectedEducationLevelId = watch("educationLevelId");
  const selectedEducationClassId = watch("educationClassId");
  const selectedSecondaryTypeId = watch("secondaryTypeId");
  const showSecondaryType = selectedEducationLevelId === "4";

  const materialOptionsForModal = useMemo(() => {
    const usedIds = new Set(
      scheduleItems
        .map((row, i) =>
          editingIndex !== null && i === editingIndex ? null : row.subjectId
        )
        .filter(Boolean)
    );
    return materialOptions.filter((opt) => !usedIds.has(opt.value));
  }, [materialOptions, scheduleItems, editingIndex]);

  const educationClassOptions = useMemo(() => {
    const list = EducationClasses || [];
    return list
      .filter(cls => {
        // Only show classes belonging to the selected level
        if (!selectedEducationLevelId) return false;
        // IMPORTANT: adjust the property name if your API uses something else
        return String(cls.EducationLevel_Id ?? cls.educationLevelId) === selectedEducationLevelId;
      })
      .map(cls => ({
        value: String(cls.Id ?? cls.id),
        label: cls.Description ?? "",
      }));
  }, [EducationClasses, selectedEducationLevelId]);

  useEffect(() => {
    setValue("educationClassId", "");
  }, [selectedEducationLevelId, setValue]);


  const scheduleTableData = useMemo(
    () =>
      scheduleItems.map((row, index) => ({
        id: index + 1,
        subject: row.subjectLabel ?? row.subjectId ?? "—",
        examDate: formatDateForDisplay(row.examDate),
        timeFrom: row.timeFrom ?? "—",
        timeTo: row.timeTo ?? "—",
        examDuration: row.examDuration ?? "—",
      })),
    [scheduleItems]
  );

  useEffect(() => {
    if (!isEditMode || !examineScheduleDetails) return;
    const values = mapDetailsToFormValues(examineScheduleDetails);
    if (values && !detailsAppliedRef.current) {
      detailsAppliedRef.current = true;
      setValue("educationLevelId", values.educationLevelId);
      setValue("educationClassId", values.educationClassId);
      setValue("secondaryTypeId", values.secondaryTypeId);
      setValue("educationPeriodId", values.educationPeriodId);
      setValue("educationExamineTypeId", values.educationExamineTypeId);
      setValue("scheduleItems", values.scheduleItems);
    }
  }, [examineScheduleDetails, isEditMode, setValue]);

  useEffect(() => {
    if (!isEditMode) {
      detailsAppliedRef.current = false;
    }
  }, [isEditMode]);

  useEffect(() => {
    if (showSecondaryType) return;
    setValue("secondaryTypeId", "");
  }, [showSecondaryType, setValue]);

  useEffect(() => {
    if (detailsError) {
      toast.error("فشل تحميل تفاصيل جدول الامتحانات");
    }
  }, [detailsError]);

  const handleOpenAddModal = () => {
    if (!selectedEducationLevelId || !selectedEducationClassId) {
      toast.warning("يرجى اختيار المرحلة الدراسية والصف الدراسي أولاً");
      return;
    }
    if (showSecondaryType && !selectedSecondaryTypeId) {
      toast.warning("يرجى اختيار الشعبة أولاً");
      return;
    }
    setEditingIndex(null);
    setAddModalOpen(true);
  };

  const handleEditRow = (item) => {
    const index = item.id - 1;
    if (index < 0 || index >= scheduleItems.length) return;
    setEditingIndex(index);
    setAddModalOpen(true);
  };

  const handleDeleteRow = (index) => {
    const next = scheduleItems.filter((_, i) => i !== index);
    setValue("scheduleItems", next);
  };

  const handleModalOpenChange = (isOpen) => {
    if (!isOpen) setEditingIndex(null);
    setAddModalOpen(isOpen);
  };

  const actionsConfig = [
    { label: "تعديل", onClick: handleEditRow, show: true },
    {
      label: "حذف",
      onClick: (item) => handleDeleteRow(item.id - 1),
      show: true,
      className: "text-destructive",
    },
  ];

  const handleCancel = () => navigate("/examine-schedule");

  const onSubmit = async (data) => {
    try {
      // TODO: Replace with your backend save/update procedure when available.
      // Build payload: schoolId, educationYearId, educationLevelId, educationClassId,
      // secondaryTypeId, educationPeriodId, educationExamineTypeId, scheduleItems (materials with subjectId, examDate, timeFrom, timeTo, examDuration).
      const schoolId = userData?.School_Id ?? 0;
      const educationYearId = educationYearData?.Id ?? 0;
      const materialsPayload = data.scheduleItems.map((item) => ({
        EducationMaterial_Id: item.subjectId,
        ExamineDate: item.examDate ? dayjs(item.examDate).format("YYYY-MM-DD") : "",
        FromTime: item.timeFrom,
        ToTime: item.timeTo,
        ExaminePeriod: item.examDuration,
      }));

      // Placeholder: call your actual executeProcedure with the correct procedure key and parameter string for insert/update.
      const procedureKey = ""; // e.g. your save procedure key
      const params = `${schoolId}#${isEditMode ? scheduleId : 0}#${educationYearId}#${data.educationLevelId}#${data.educationClassId}#${data.secondaryTypeId || ""}#${data.educationPeriodId}#${data.educationExamineTypeId}#${JSON.stringify(materialsPayload)}#$????`;

      if (procedureKey) {
        const response = await executeProcedure(procedureKey, params);
        if (response?.success && !response?.error) {
          toast.success(isEditMode ? "تم تعديل جدول الامتحانات بنجاح" : "تم إضافة جدول الامتحانات بنجاح");
          navigate("/examine-schedule");
        } else {
          toast.error(response?.decrypted?.error || (isEditMode ? "فشل في تعديل جدول الامتحانات" : "فشل في إضافة جدول الامتحانات"));
        }
      } else {
        
        const response1 = await DoTransaction(
            "k3hC0J0Bmzh1AU6b3NtPJF47gXVZtuRAojBxg9+r5PU=" ,
            `0#${userData?.School_Id}#${educationYearData?.Id}#${data.educationLevelId}#${data.educationClassId}#${data.secondaryTypeId || ""}#${data.educationPeriodId}#${data.educationExamineTypeId}#default#${userData?.id}#1#${userData?.id}#default#0#0#default#`,
            0 , 
            "Id#School_Id#EducationYear_Id#EducationLevel_Id#EducationClass_Id#EducationSecondaryLevelType_Id#EducationPeriod_Id#EducationExamineType_Id#CreatedDate#CreatedBy#IsSent#SentBy#SentDate#IsApproved#ApprovedBy#ApprovedDate#ApproveRemarks"
          )
          const newid = response1.NewId ;

          const multiTableName = Array(data.scheduleItems.length)
            .fill("k3hC0J0Bmzh1AU6b3NtPJC7qDnbNfugl/qwg7hGUZOM=")
            .join('^');

            const multiColumnsValues = data.scheduleItems
            .map((item) => {
              return [
                0,
                newid,
                item.subjectId,
                item.examDate.format("DD/MM/YYYY"),
                item.timeFrom,
                item.timeTo,
                item.examDuration
              ].join('#');
            })
            .join('^');          
          console.log( "test : ", multiTableName);
          console.log( "test222 : ", multiColumnsValues);
          
          if(response1.success == 200){
            const response2 = await DoMultiTransaction(
              multiTableName, 
              multiColumnsValues, 
              0 , 
            )
            console.log(response2);
            
            if(response2.success == 200){
              toast.success("تم حفظ جدول الامتحانات بنجاح");
              navigate("/examine-schedule");
            } else {
              toast.error(response2.errorMessage || "فشل العملية");
            }
        }
      }
    } catch (err) {
      console.error("Error saving examine schedule:", err);
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  if (isEditMode && loadingDetails) {
    return (
      <div className="bg-white rounded-lg p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-xl font-bold">إعداد جدول الامتحانات</h1>
        </div>
        <p className="text-muted-foreground">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-xl font-bold">
          {isEditMode ? "تعديل جدول الامتحانات" : "إعداد جدول الامتحانات"}
        </h1>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`flex flex-col gap-2 w-full ${showSecondaryType ? "" : "md:col-span-2"}`}
          >
            <label htmlFor="educationLevelId" className="text-sm font-medium">
              المرحلة الدراسية
            </label>
            <Controller
              name="educationLevelId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={educationLevelsLoading}
                  className={`border border-input bg-background rounded-md px-3 py-2 text-sm ${
                    errors.educationLevelId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">
                    {educationLevelsLoading
                      ? "جاري التحميل..."
                      : "اختر المرحلة الدراسية"}
                  </option>
                  {educationLevelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.educationLevelId && (
              <p className="text-sm text-red-500">
                {errors.educationLevelId.message}
              </p>
            )}
          </div>

          {showSecondaryType && (
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="secondaryTypeId" className="text-sm font-medium">
                الشعبة
              </label>
              <Controller
                name="secondaryTypeId"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    disabled={secondaryTypeDataLoading}
                    className={`border border-input bg-background rounded-md px-3 py-2 text-sm ${
                      errors.secondaryTypeId ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">
                      {secondaryTypeDataLoading
                        ? "جاري التحميل..."
                        : "اختر الشعبة"}
                    </option>
                    {secondaryTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.secondaryTypeId && (
                <p className="text-sm text-red-500">
                  {errors.secondaryTypeId.message}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 w-full md:col-span-2">
            <label htmlFor="educationClassId" className="text-sm font-medium">
              الصف الدراسي
            </label>
            <Controller
              name="educationClassId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={educationClassesLoading}
                  className={`border border-input bg-background rounded-md px-3 py-2 text-sm ${
                    errors.educationClassId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">
                    {educationClassesLoading
                      ? "جاري التحميل..."
                      : "اختر الصف الدراسي"}
                  </option>
                  {educationClassOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.educationClassId && (
              <p className="text-sm text-red-500">
                {errors.educationClassId.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="educationPeriodId" className="text-sm font-medium">
              نوع الفترة
            </label>
            <Controller
              name="educationPeriodId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={educationPeriodsLoading}
                  className={`border border-input bg-background rounded-md px-3 py-2 text-sm ${
                    errors.educationPeriodId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">
                    {educationPeriodsLoading
                      ? "جاري التحميل..."
                      : "اختر نوع الفترة"}
                  </option>
                  {educationPeriodOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.educationPeriodId && (
              <p className="text-sm text-red-500">
                {errors.educationPeriodId.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label
              htmlFor="educationExamineTypeId"
              className="text-sm font-medium"
            >
              نوع الامتحان
            </label>
            <Controller
              name="educationExamineTypeId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className={`border border-input bg-background rounded-md px-3 py-2 text-sm ${
                    errors.educationExamineTypeId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">اختر نوع الامتحان</option>
                  {educationExamineTypes.map((opt) => (
                    <option key={opt.Id} value={opt.Id}>
                      {opt.Description}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.educationExamineTypeId && (
              <p className="text-sm text-red-500">
                {errors.educationExamineTypeId.message}
              </p>
            )}
          </div>
        </div>

        <Divider className="my-4" />

        <div className="flex flex-col gap-2 w-full">
          <TablePage
            data={scheduleTableData}
            columns={scheduleTableColumns}
            total={scheduleItems.length}
            fetchApi={async () => {}}
            isLoading={false}
            filters={[]}
            isFilteredByDate={false}
            rowsPerPageDefault={5}
            clickable={false}
            tableTitle="جدول الامتحانات"
            isHeaderSticky={true}
            actionsConfig={actionsConfig}
            AddButtonProps={{
              title: "إضافة",
              action: handleOpenAddModal,
            }}
            specialCells={[
              {
                key: "examDate",
                render: (value) => <span dir="ltr">{value}</span>,
              },
              {
                key: "timeFrom",
                render: (value) => <span dir="ltr">{value}</span>,
              },
              {
                key: "timeTo",
                render: (value) => <span dir="ltr">{value}</span>,
              },
            ]}
          />
          {errors.scheduleItems && (
            <p className="text-sm text-red-500">
              {errors.scheduleItems.message}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:flex-1 text-destructive border-destructive py-5 sm:py-6 text-base sm:text-lg font-bold hover:bg-destructive/5 hover:text-destructive"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            className="w-full sm:flex-1 py-5 sm:py-6 text-base sm:text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </div>
      </form>

      <ScheduleRowModal
        scheduleItemSchema={scheduleItemSchema}
        open={addModalOpen}
        onOpenChange={handleModalOpenChange}
        subjectOptions={materialOptionsForModal}
        subjectOptionsLoading={educationMaterialsLoading}
        editIndex={editingIndex}
        initialValues={
          editingIndex !== null && scheduleItems[editingIndex]
            ? scheduleItems[editingIndex]
            : null
        }
        onAdd={(row) => {
          const subjectOption = materialOptions.find(
            (o) => o.value === row.subjectId
          );
          setValue("scheduleItems", [
            ...(watch("scheduleItems") || []),
            {
              subjectId: row.subjectId,
              subjectLabel: subjectOption?.label ?? row.subjectId,
              examDate: row.examDate,
              timeFrom: row.timeFrom,
              timeTo: row.timeTo,
              examDuration: row.examDuration,
              id: undefined,
            },
          ]);
          setAddModalOpen(false);
        }}
        onEdit={(index, row) => {
          const subjectOption = materialOptions.find(
            (o) => o.value === row.subjectId
          );
          const current = watch("scheduleItems") || [];
          const next = [...current];
          if (index >= 0 && index < next.length) {
            const existingId = next[index].id;
            next[index] = {
              subjectId: row.subjectId,
              subjectLabel: subjectOption?.label ?? row.subjectId,
              examDate: row.examDate,
              timeFrom: row.timeFrom,
              timeTo: row.timeTo,
              examDuration: row.examDuration,
              id: existingId,
            };
            setValue("scheduleItems", next);
          }
          setAddModalOpen(false);
          setEditingIndex(null);
        }}
      />
    </div>
  );
};

export default EditExamineSchedule;
