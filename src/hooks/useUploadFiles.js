import { useState } from "react";
import { HandelFile } from "../services/HandelFile.js";
import {
  abortController,
  removeController,
  setController,
} from "../utils/uploadControllerManager.js";

const useUploadFiles = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadFiles = async (dataArray) => {
    setLoading(true);
    setError(null);
    const result = {};

    try {
      for (const item of dataArray) {
        const label = item.label;
        const cleanedFileList = item.fileList.filter((file) => !file?.modified);

        const uploadPromises = cleanedFileList.map(async (file) => {
          const actualFile = file.originFileObj || file;
          const controller = new AbortController();

          setController(file.uid, controller);

          const response = await new HandelFile().UploadFile({
            action: "Add",
            file: actualFile,
            controller,
          });

          removeController(file.uid);
          return response;
        });

        const responses = await Promise.all(uploadPromises);
        const fileIds = responses.map((res) => res?.id).filter(Boolean);

        result[label] =
          fileIds?.length === 1
            ? fileIds[0]
            : fileIds?.length > 1
            ? fileIds
            : null;
      }

      return result;
    } catch (err) {
      setError(err.message || "An error occurred during the upload process.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const uploadSingleFile = async (file, onProgressCallback,action="Add",fileId="") => {
    const actualFile = file.originFileObj || file;
    const controller = new AbortController();

    setController(file.uid, controller);
    setLoading(true);
    setError(null);
    console.log("enter");
    
    try {
      const response = await new HandelFile().UploadFile({
        action: action,
        file: actualFile,
        onProgress: onProgressCallback,
        controller,
        fileId: fileId,
      });
      console.log(response);
      

      removeController(file.uid);
      return response?.id || null;
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") {
      } else {
        setError(err.message || "Error uploading file.");
      }

      removeController(file.uid);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const abortUpload = (file) => {
    abortController(file.uid);
    return true;
  };

  return {
    uploadFiles,
    uploadSingleFile,
    abortUpload,
    loading,
    setLoading,
    error,
  };
};

export default useUploadFiles;
