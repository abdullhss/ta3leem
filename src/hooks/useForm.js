import { useState, useCallback } from 'react';
import dayjs from 'dayjs';

const useForm = (initialValues = {}) => {
  const [formInfo, setFormInfo] = useState(initialValues);

  const handelDateChange = useCallback((date, fieldName) => {
    if (date) {
      // If it's a dayjs object, format it as DD/MM/YYYY
      if (dayjs.isDayjs(date)) {
        const formattedDate = date.format('DD/MM/YYYY');
        setFormInfo(prev => ({
          ...prev,
          [fieldName]: formattedDate
        }));
      } else if (date.$d) {
        // Handle antd DatePicker format
        const formattedDate = dayjs(date.$d).format('DD/MM/YYYY');
        setFormInfo(prev => ({
          ...prev,
          [fieldName]: formattedDate
        }));
      } else {
        setFormInfo(prev => ({
          ...prev,
          [fieldName]: date
        }));
      }
    } else {
      setFormInfo(prev => ({
        ...prev,
        [fieldName]: ""
      }));
    }
  }, []);

  const setFieldValue = useCallback((fieldName, value) => {
    setFormInfo(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormInfo(initialValues);
  }, [initialValues]);

  return {
    formInfo,
    setFormInfo,
    handelDateChange,
    setFieldValue,
    resetForm
  };
};

export default useForm;

