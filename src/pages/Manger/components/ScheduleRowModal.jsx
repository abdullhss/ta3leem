import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import GlobalDatePicker from "../../../global/global-datePicker/GlobalDatePicker";
const emptyDefaults = {
  subjectId: "",
  examDate: null,
  timeFrom: "",
  timeTo: "",
  examDuration: "",
};

export default function ScheduleRowModal({
  open,
  onOpenChange,
  onAdd,
  onEdit,
  editIndex = null,
  initialValues = null,
  scheduleItemSchema,
  subjectOptions = [],
  subjectOptionsLoading = false,
}) {
  const isEditMode = editIndex !== null && editIndex !== undefined;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(scheduleItemSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (open && isEditMode && initialValues) {
      reset({
        subjectId: initialValues.subjectId ?? "",
        examDate: initialValues.examDate
          ? dayjs.isDayjs(initialValues.examDate)
            ? initialValues.examDate
            : dayjs(initialValues.examDate)
          : null,
        timeFrom: initialValues.timeFrom ?? "",
        timeTo: initialValues.timeTo ?? "",
        examDuration: initialValues.examDuration ?? "",
      });
    } else if (open && !isEditMode) {
      reset(emptyDefaults);
    }
  }, [open, isEditMode, initialValues, reset]);

  const handleClose = (isOpen) => {
    if (!isOpen) {
      reset(emptyDefaults);
    }
    onOpenChange(isOpen);
  };

  const onModalSubmit = (data) => {
    const row = {
      subjectId: data.subjectId,
      subjectLabel: undefined,
      examDate: data.examDate,
      timeFrom: data.timeFrom,
      timeTo: data.timeTo,
      examDuration: data.examDuration,
    };
    if (isEditMode && typeof onEdit === "function") {
      onEdit(editIndex, row);
    } else if (typeof onAdd === "function") {
      onAdd(row);
    }
    reset(emptyDefaults);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="p-[20px] max-w-5xl" dir="rtl">
        <DialogHeader className="flex justify-center pb-4 border-b">
          <DialogTitle>
            {isEditMode
              ? "تعديل مادة في جدول الامتحانات"
              : "إضافة مادة لجدول الامتحانات"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onModalSubmit)}
          className="flex flex-col gap-4 pt-2"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">المادة</label>
            <Controller
              name="subjectId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  disabled={subjectOptionsLoading}
                  className={`border border-input bg-background rounded-md px-3 py-2 text-sm ${
                    errors.subjectId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">
                    {subjectOptionsLoading ? "جاري التحميل..." : "اختر المادة"}
                  </option>
                  {subjectOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.subjectId && (
              <p className="text-sm text-red-500">{errors.subjectId.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">تاريخ الامتحان</label>
            <Controller
              name="examDate"
              control={control}
              render={({ field }) => (
                <GlobalDatePicker
                  label=""
                  showLabelInside={false}
                  value={
                    field.value
                      ? dayjs.isDayjs(field.value)
                        ? field.value
                        : dayjs(field.value)
                      : null
                  }
                  onChange={(date) => field.onChange(date)}
                  placeholder="اختر التاريخ"
                />
              )}
            />
            {errors.examDate && (
              <p className="text-sm text-red-500">{errors.examDate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">التوقيت من</label>
              <Controller
                name="timeFrom"
                control={control}
                render={({ field }) => (
                  <Input
                    type="time"
                    {...field}
                    className={errors.timeFrom ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.timeFrom && (
                <p className="text-sm text-red-500">
                  {errors.timeFrom.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">التوقيت الى</label>
              <Controller
                name="timeTo"
                control={control}
                render={({ field }) => (
                  <Input
                    type="time"
                    {...field}
                    className={errors.timeTo ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.timeTo && (
                <p className="text-sm text-red-500">{errors.timeTo.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">زمن الامتحان</label>
            <Controller
              name="examDuration"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="مثال: ساعتان"
                  dir="rtl"
                  className={errors.examDuration ? "border-red-500" : ""}
                />
              )}
            />
            {errors.examDuration && (
              <p className="text-sm text-red-500">
                {errors.examDuration.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 justify-end border-t pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 text-destructive border-destructive py-5 font-bold hover:bg-destructive/5"
              onClick={() => handleClose(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" className="flex-1 py-5 font-bold bg-primary text-primary-foreground hover:bg-primary/90">
              {isEditMode ? "حفظ" : "إضافة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
