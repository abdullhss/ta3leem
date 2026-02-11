import { useState, useCallback } from 'react';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

const useGlobalModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  const openModal = useCallback((content = null, title = '') => {
    setModalContent(content);
    setModalTitle(title);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalContent(null);
    setModalTitle('');
  }, []);

  const Modal = useCallback(({ children, title, isDismissable = true, ...props }) => {
    // Helper to render modal content safely
    const renderContent = () => {
      if (children) return children;
      if (!modalContent) return null;
      
      // If modalContent is a React element, render it
      if (React.isValidElement(modalContent)) {
        return modalContent;
      }
      
      // If modalContent is an object, render it as JSON (for debugging)
      if (typeof modalContent === 'object') {
        return (
          <pre className="p-4 bg-gray-50 rounded overflow-auto">
            {JSON.stringify(modalContent, null, 2)}
          </pre>
        );
      }
      
      // Otherwise render as string
      return <div>{String(modalContent)}</div>;
    };

    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && isDismissable) {
          closeModal();
        }
      }} {...props}>
        <DialogContent>
          {(title || modalTitle) && (
            <DialogHeader>
              <DialogTitle className="text-right">{title || modalTitle}</DialogTitle>
            </DialogHeader>
          )}
          {renderContent()}
        </DialogContent>
      </Dialog>
    );
  }, [isOpen, modalContent, modalTitle, closeModal]);

  return {
    Modal,
    openModal,
    closeModal,
    isOpen
  };
};

export default useGlobalModal;

