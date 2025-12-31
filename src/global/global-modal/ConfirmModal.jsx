import { Button } from "../../ui/button";

export const ConfirmModal = ({ desc, confirmFunc, onClose }) => {
  const handleConfirm = () => {
    if (confirmFunc) {
      confirmFunc();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-foreground font-[var(--font-family-sans)] text-base">{desc}</p>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>
          إلغاء
        </Button>
        <Button variant="default" onClick={handleConfirm}>
          تأكيد
        </Button>
      </div>
    </div>
  );
};

