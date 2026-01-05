import React, { useState } from 'react';
import useGlobalModal from '../hooks/useModal.jsx';
import useServeAttach from '../hooks/useServeAttach.js';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { message } from 'antd';
import { base64ToBlob } from '../utils/Base64ToFile.js';
import PDF from '../assets/PDF.svg';

export default function FileViewer({ id, customButton, SessionID = "", name = "المرفق" }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const { Modal, openModal, onClose } = useGlobalModal();
  const { ServeAttach } = useServeAttach();
  const [fileType, setFileType] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  const handleOpenAttach = async () => {
    console.log({id})
    try {
      if (id === undefined) return message.error("fileIdNotFound");
      setIsLoading(true);
      openModal();
      const file = await ServeAttach({ fileId: id, SessionID });
      const FileType = file?.[0]?.type;
      setFileType(FileType);
      let mimeType;
      if (FileType === '.HTML') {
        mimeType = 'text/html';
      }
      let base64 = file?.[0]?.base64;
      const blobFile = base64ToBlob(base64, mimeType);
      const blobUrl = URL.createObjectURL(blobFile);
      setBlobUrl(blobUrl);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      onClose();
      message.error('Error displaying attachment');
    }
  };

  const RenderedFile = () => {
    switch (fileType) {
      case 'application/pdf':
      case '.pdf':
        return (
          <embed
            src={blobUrl}
            width="100%"
            height="100%"
            type="application/pdf"
            className="w-full h-full"
          />
        );
      case '.HTML':
      case '.html':
      case 'text/html':
        return (
          <embed
            src={blobUrl}
            width="100%"
            height="100%"
            type="text/html"
            className="w-full h-full"
          />
        );
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
      case '.webp':
        return (
          <div className='flex justify-center items-center w-full'>
            <img
              alt="file_Image"
              width={300}
              src={blobUrl}
              className="max-w-full h-auto"
            />
          </div>
        );
      default:
        return (
          <div className='flex h-full w-full justify-center items-center text-primary'>
            {(id === 0 || id === "0") ? 'fileNotFound' : 'Error displaying attachment'}
          </div>
        );
    }
  };  

  return (
    <>
      {customButton
        ? React.isValidElement(customButton)
          ? React.cloneElement(customButton, {
              onClick: (e) => {
                customButton.props?.onClick?.(e);
                handleOpenAttach();
              }
            })
          : customButton
        : (
            (id && id !== "0" && id !== 0) ? (
              <div className={"flex flex-row items-center justify-between gap-x-10 gap-y-2"}>
              <div className="flex gap-2 items-center text-xs">
                <img src={PDF} alt="PDF" />
                <span>{name}.PDF</span>
              </div>
                  <Button 
                    type="button"
                    onClick={handleOpenAttach}
                    variant="text" 
                    size="sm" 
                    className={"text-primary font-bold"}
                  >
                    عرض
                  </Button>
            </div>
            ) : null
          )
      }

      <Modal
        ModalBodyClassName='h-full'
        baseClassName="min-h-[calc(100%_-60px)] max-h-[calc(100%_-60px)] max-w-[calc(100%_-20px)] md:max-w-[calc(100%_-10%)] lg:max-w-[calc(100%_-20%)] aspect-square md:!min-h-[300px] flex flex-col"
      >
        {isLoading ? (
          <div className='w-full h-full flex justify-center items-center'>
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
          {/* <div className='w-full h-full flex justify-center items-center bg-green-500'>hi</div> */}
            {RenderedFile()}
          </>
        )}
      </Modal>
    </>
  );
}

