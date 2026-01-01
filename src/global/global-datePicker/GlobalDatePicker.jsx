import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { cn } from '../../lib/utils';

const GlobalDatePicker = ({
  label,
  showLabelInside = false,
  value,
  onChange,
  disabledDate,
  className,
  ...props
}) => {
  // Handle value - it could be a dayjs object, string, or empty
  let dateValue = null;
  if (value) {
    if (dayjs.isDayjs(value)) {
      dateValue = value;
    } else if (typeof value === 'string') {
      dateValue = dayjs(value);
    } else {
      dateValue = value;
    }
  }

  const handleChange = (date) => {
    // Pass the dayjs object directly to onChange
    onChange?.(date);
  };

  return (
    <div className={cn("w-full", className)}>
      {!showLabelInside && label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <DatePicker
        value={dateValue}
        onChange={handleChange}
        disabledDate={disabledDate}
        placeholder={showLabelInside ? label : undefined}
        className="w-full"
        format="DD/MM/YYYY"
        {...props}
      />
    </div>
  );
};

export default GlobalDatePicker;

