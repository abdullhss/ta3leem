export const base64ToBlob = (base64, mimeType) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters?.length);
  for (let i = 0; i < byteCharacters?.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const type = base64ToArrayBuffer(base64);
  return new Blob([byteArray], { type: mimeType || getMimeTypeFromArrayBuffer(type) });
};

export function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString?.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

export function getMimeTypeFromArrayBuffer(buffer) {
  const arr = new Uint8Array(buffer).subarray(0, 4);
  let header = "";
  for (let i = 0; i < arr?.length; i++) {
    header += arr[i].toString(16).padStart(2, '0');
  }

  let mimeType = "";
  switch (header) {
    case "89504e47":
      mimeType = "image/png";
      break;
    case "47494638":
      mimeType = "image/gif";
      break;
    case "ffd8ffe0":
    case "ffd8ffe1":
    case "ffd8ffe2":
      mimeType = "image/jpeg";
      break;
    case "25504446":
      mimeType = "application/pdf";
      break;
    case "504b0304":
      mimeType = "application/zip";
      break;
    case "d0cf11e0":
      mimeType = "application/msword";
      break;
    case "504b34":
    case "504b50":
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      break;
    case "3c3f786d":
      mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      break;
    case "1f8b08":
      mimeType = "application/gzip";
      break;
    case "52494646":
      const riffType = new Uint8Array(buffer).subarray(8, 12);
      let riffHeader = "";
      for (let i = 0; i < riffType?.length; i++) {
        riffHeader += String.fromCharCode(riffType[i]);
      }
      if (riffHeader === "WEBP") {
        mimeType = "image/webp";
      } else {
        mimeType = "unknown";
      }
      break;
    default:
      mimeType = "unknown";
      break;
  }
  return mimeType;
}

