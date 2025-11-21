export const getFileUrl = (filePath: string) => {
  const API_BASE_URL = import.meta.env.VITE_API_PUBLIC_BASE_URL
const serverBase = API_BASE_URL.replace(/\/api\/?$/, "");

  return `${serverBase}/${filePath.replace(/\\/g, "/")}`;
};

export const getFileType = (fileName: string): string => {
  const extension = fileName.toLowerCase().split(".").pop();
  if (
    ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(
      extension || ""
    )
  ) {
    return "image";
  } else if (extension === "pdf") {
    return "pdf";
  } else if (["doc", "docx", "txt", "rtf"].includes(extension || "")) {
    return "document";
  } else {
    return "other";
  }
};
