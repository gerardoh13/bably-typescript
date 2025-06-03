import { useEffect, useState, useRef, useContext } from "react";
import type { UserContextType } from "../users/UserContext";
import UserContext from "../users/UserContext";

declare global {
  interface Window {
    cloudinary: any;
  }
}

type ImageUploadProps = {
  uploadSuccess: (error: any, result: any) => void;
  setUrl?: (url: string) => void;
  formKey?: string;
};

function ImageUpload({ uploadSuccess, setUrl, formKey }: ImageUploadProps) {
  //   https://cloudinary.com/documentation/upload_widget_reference
  const [cloudinaryWidget, setCloudinaryWidget] = useState(null);
  const widgetRef = useRef<any>(null);

  const cloudName = "dolnu62zm";
  const uploadPreset = "yssxueby";

  const context = useContext(UserContext) as UserContextType;
  const currUser = context?.currUser;

  useEffect(() => {
    if (!cloudinaryWidget) {
      const myWidget = window.cloudinary.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: uploadPreset,
          cropping: true,
          sources: ["local", "facebook", "instagram", "camera"],
          multiple: false,
          context: { alt: "user_uploaded" },
          clientAllowedFormats: ["jpg", "HEIF"],
          maxImageFileSize: 6000000,
        },
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            uploadSuccess(error, result);
            myWidget.close();
          }
        }
      );
      setCloudinaryWidget(myWidget);
      widgetRef.current = myWidget;
    }
  }, [cloudinaryWidget, formKey, setUrl, uploadSuccess]);

  const openWidget = () => {
    // Access the widget instance from the ref and open it
    if (currUser?.email === "demo@demo.com") {
      alert("This feature is not available in demo mode.");
      return;
    }
    widgetRef.current.open();
  };

  return (
    <>
      <button className="btn btn-bablyBlue" type="button" onClick={openWidget}>
        Upload
      </button>
    </>
  );
}

export default ImageUpload;
