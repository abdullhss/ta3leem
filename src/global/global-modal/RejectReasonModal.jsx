import { useState } from 'react';
import { Button } from '../../ui/button';

export const RejectReasonModal = ({ desc, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason?.trim() || '');
    onClose?.();
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-foreground font-[var(--font-family-sans)] text-base">{desc}</p>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">سبب الرفض (اختياري)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="أدخل سبب الرفض..."
          className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          dir="rtl"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button variant="destructive" onClick={handleConfirm}>
          تأكيد الرفض
        </Button>
      </div>
    </div>
  );
};
