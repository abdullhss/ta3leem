import { Upload, Modal, ConfigProvider } from "antd";
import { CameraIcon, ExcelIcon, PdfIcon, WordIcon } from "../utils/Icons";
import "./uploadImage.css";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Keyboard, Pagination, Navigation } from "swiper/modules";

export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const uploadButton = (
  <div className="text-center">
    <CameraIcon type="plus" />
  </div>
);
export default function UploadImage({ errorMessage, error, fileList, handleUploadChange,renderButton=uploadButton,maxCount = 8,accept="image/*", ...props }) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const handleCancel = () => setPreviewVisible(false);

  const handlePreview = (e) => {
    setPreviewVisible(true);
  };
  const customRequest = ({ onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };


  return (
    <ConfigProvider
      theme={{
        token: {
          colorBorder: error ? "#d32f2f" : "#a2a1a833",
        },
      }}
    >
      <div className="flex flex-col">
        <Upload
          id="Developer"
          customRequest={customRequest}
          listType="picture-card"
          fileList={fileList}
          style={{ width: "100%"}}
          onPreview={handlePreview}
          onChange={e=>{
            if(e.file.size !== 0 || e.file.type){
              handleUploadChange(e)
            }
          }}
          accept={accept}
          className="w-full"
          // accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx"
          multiple
          maxCount={maxCount}
          hasControlInside={true}
          iconRender={(e) => {
            switch (e.type) {
              case "application/pdf":
                return <div className="flex justify-center"><PdfIcon /></div>
              case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return <div className="flex justify-center"><WordIcon /></div>
              case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                return <div className="flex justify-center"><ExcelIcon /></div>

              default:
            }
          }
          }
          {...props}
        >
          {fileList?.length >= maxCount ? null : renderButton}
        </Upload>
        {errorMessage && <span className="text-[#d32f2f] px-[14px]">{errorMessage}</span>}

        <Modal className='!rounded-md' open={previewVisible} footer={null} onCancel={handleCancel} centered>
          <Swiper
            dir="rtl"
            slidesPerView={1}
            spaceBetween={30}
            keyboard={{
              enabled: true,
            }}
            grabCursor={true}
            navigation={true}
            modules={[Keyboard, Pagination, Navigation]}
            className="mySwiper"
          >
            {fileList?.map((img, index) => (
              <SwiperSlide key={index} className="flex justify-center items-center">
                <img
                  src={img.preview}
                  alt="preview"
                  className="
                    aspect-square
                    max-h-[70vh]
                    object-contain
                    rounded-md
                    cursor-grab
                    blur-sm
                    hover:blur-0
                    transition
                  "
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Modal>
      </div>
    </ConfigProvider>
  );
};