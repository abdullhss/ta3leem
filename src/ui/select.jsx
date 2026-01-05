import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";
import { ChevronDownIcon } from "../utils/Icons";

const SelectContext = React.createContext(undefined);

const Select = ({ children, value, onValueChange, ...props }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || "");

  // Sync internal state when value prop changes
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ open, setOpen, selectedValue, handleValueChange }}>
      <div className="relative" style={{ overflow: 'visible' }} data-select-container {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef(
  ({ className, children, showClearButton, onClear, value, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    const displayValue = value || context?.selectedValue || "";

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => context?.setOpen(!context.open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span className="flex-1 text-right">{children || displayValue}</span>
        <div className="flex items-center gap-2">
          {showClearButton && displayValue && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear?.();
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
          <ChevronDownIcon className="h-4 w-4 opacity-50" />
        </div>
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = ({ placeholder, ...props }) => {
  const context = React.useContext(SelectContext);
  return <span {...props}>{context?.selectedValue || placeholder}</span>;
};

const SelectContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext);
    const contentRef = React.useRef(null);
    const triggerRef = React.useRef(null);
    const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });

    React.useEffect(() => {
      if (context?.open) {
        // Find the trigger button
        const selectContainer = document.querySelector('[data-select-container]');
        if (selectContainer) {
          const trigger = selectContainer.querySelector('button');
          if (trigger) {
            triggerRef.current = trigger;
            const rect = trigger.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;
            
            // Calculate position
            let top = rect.bottom + 4;
            let maxHeight = Math.min(300, spaceBelow - 20);
            
            // If not enough space below but more space above, open upward
            if (spaceBelow < 200 && spaceAbove > spaceBelow) {
              top = rect.top - 4;
              maxHeight = Math.min(300, spaceAbove - 20);
            }
            
            setPosition({
              top,
              left: rect.left,
              width: rect.width,
              maxHeight
            });
          }
        }
      }
    }, [context?.open]);

    if (!context?.open) return null;

    const content = (
      <>
        <div
          className="fixed inset-0"
          style={{ zIndex: 9998 }}
          onClick={() => context.setOpen(false)}
        />
        <div
          ref={(node) => {
            contentRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          className={cn(
            "fixed min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-white text-foreground shadow-lg",
            className
          )}
          style={{
            zIndex: 9999,
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            maxHeight: `${position.maxHeight}px`,
            maxWidth: 'calc(100vw - 2rem)',
          }}
          {...props}
        >
          {children}
        </div>
      </>
    );

    // Use portal to render at document root to avoid overflow issues
    return createPortal(content, document.body);
  }
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef(
  ({ className, children, value, ...props }, ref) => {
    const context = React.useContext(SelectContext);

    return (
      <div
        ref={ref}
        onClick={() => context?.handleValueChange(value)}
        className={cn(
          "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};

