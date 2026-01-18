import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Reusable MultiSelect Component
 * @param {Array} options - Array of options with { value, label } or objects with id/Id and name/label properties
 * @param {Array} selectedValues - Array of selected values (IDs)
 * @param {Function} onSelectionChange - Callback when selection changes, receives array of selected IDs
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message
 * @param {string} placeholder - Placeholder text when nothing is selected
 * @param {string} emptyText - Text to show when no options available
 * @param {string} className - Additional CSS classes
 * @param {Function} getValue - Function to extract value from option object (default: id || Id)
 * @param {Function} getLabel - Function to extract label from option object (default: label || name || FullName || Description)
 * @param {string} itemLabel - Label for items (e.g., "موظف", "فصل") for display text
 * @param {boolean} disabled - Whether the select is disabled
 * @param {string} itemsLabel - Label for items (e.g., "عناصر", "مواد") for display text
 */
export function MultiSelect({
  options = [],
  selectedValues = [],
  onSelectionChange,
  loading = false,
  error = null,
  placeholder = "برجاء الاختيار",
  emptyText = "لا يوجد خيارات",
  className = "",
  getValue = (option) => option.value || option.id || option.Id,
  getLabel = (option) => option.label || option.name || option.FullName || option.Description || String(option.value || option.id || option.Id),
  itemLabel = "عنصر",
  itemsLabel = "عناصر",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleToggleItem = (itemValue) => {
    const newSelection = selectedValues.includes(itemValue)
      ? selectedValues.filter((id) => id !== itemValue)
      : [...selectedValues, itemValue];
    onSelectionChange(newSelection);
  };

  const selectedCount = selectedValues.length;
  const displayText = selectedCount > 0 
    ? `${selectedCount} ${selectedCount > 1 ? `${itemsLabel}` :`${itemLabel}`} محدد${selectedCount > 1 ? 'ة' : ''}`
    : placeholder;

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 h-9",
          error && "border-red-500"
        )}
        disabled={loading || disabled}
      >
        <span className={selectedCount === 0 ? "text-muted-foreground" : ""}>
          {loading ? "جاري التحميل..." : displayText}
        </span>
        <ChevronDownIcon className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              جاري التحميل...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-sm text-red-500">
              {error}
            </div>
          ) : options.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            <div className="p-1">
              {options.map((option, index) => {
                const itemValue = getValue(option);
                const itemLabel = getLabel(option);
                const isSelected = selectedValues.includes(itemValue);
                return (
                  <div
                    key={itemValue || index}
                    onClick={() => handleToggleItem(itemValue)}
                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent"
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border-2 transition-colors",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input"
                      )}
                    >
                      {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm">{itemLabel}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

