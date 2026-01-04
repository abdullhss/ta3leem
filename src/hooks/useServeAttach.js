import { base64ToBlob } from "../utils/Base64ToFile.js";
import { HandelFile } from "../services/HandelFile.js";

const useServeAttach = () => {
  async function ServeAttach({ fileId, SessionID = "" }) {
    if (!fileId) return;
    try {
      const file = await new HandelFile().DownloadFile({ fileId, SessionID });
      if (file.status === 200) {
        let mimeType;
        if (file.FileExt === ".HTML") {
          mimeType = "text/html";
        }
        // Extract base64 from data URL
        // HandelFile returns url as data URL format: data:image/png;base64,...
        let base64 = file.url;
        if (file.url && file.url.includes("base64,")) {
          base64 = file.url.split("base64,")[1];
        } else if (file.url && file.url.includes(",")) {
          // Fallback: extract everything after comma
          const parts = file.url.split(",");
          if (parts.length > 1) {
            base64 = parts.slice(1).join(",");
          }
        }
        const blobFile = base64ToBlob(base64, mimeType);
        const blobUrl = URL.createObjectURL(blobFile);
        return [
          {
            name: file.OriginalName,
            type: file.FileExt,
            thumbUrl: blobUrl,
            base64: base64,
            status: "done",
            response: "ok",
            percent: 100,
            id: fileId,
          },
        ];
      }
    } catch (error) {
      console.error("Error serving attachment:", error);
    }
  }
  return { ServeAttach };
};

export default useServeAttach;

