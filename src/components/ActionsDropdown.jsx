import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VerticalDotsIcon } from '../utils/Icons';
import { cn } from '../lib/utils';

const ActionsDropdown = ({ actions, item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Calculate position when opening
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 4,
          right: window.innerWidth - rect.right,
        });
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick(item);
    }
    setIsOpen(false);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          ref={triggerRef}
          onClick={handleToggle}
          className="text-primary-200 cursor-pointer hover:text-primary"
        >
          <VerticalDotsIcon />
        </button>
      </div>
      {isOpen && (
        <>
          {/* Backdrop */}
          {createPortal(
            <div
              className="fixed inset-0"
              style={{ zIndex: 9998 }}
              onClick={() => setIsOpen(false)}
            />,
            document.body
          )}
          {/* Dropdown Menu */}
          {createPortal(
            <div
              ref={dropdownRef}
              className="fixed bg-white rounded-md shadow-lg border border-gray-200"
              style={{
                zIndex: 9999,
                top: `${position.top}px`,
                right: `${position.right}px`,
                minWidth: '120px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="py-1">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action)}
                    className={cn(
                      "w-full text-right px-4 py-2 text-sm hover:bg-gray-100 transition-colors",
                      action.danger && "text-red-600 hover:bg-red-50"
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </>
  );
};

export default ActionsDropdown;

