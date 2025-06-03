import { useState } from "react";
import ImageUpload from "../common/ImageUpload";

type StepThreeProps = {
  data: {
    firstName?: string;
    publicId?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  changeStep: (step: number) => void;
  additionalChild?: boolean;
  submit: () => void;
};

  interface UploadResultInfo {
    secure_url: string;
    public_id: string;
  }

  interface UploadResult {
    event: string;
    info: UploadResultInfo;
  }

function StepThree({ data, setFormData, changeStep, additionalChild, submit }: StepThreeProps) {
  const [photoUrl, setPhotoUrl] = useState("");

  const uploadSuccess = (error: Error | null, result: UploadResult | undefined) => {
    if (!error && result && result.event === "success") {
      console.log("Done! Here is the image info: ", result.info);
      setPhotoUrl(result.info.secure_url);
      setFormData((data: any) => ({
        ...data,
        publicId: result.info.public_id,
      }));
    } else console.log(error);
  };
  return (
    <div className="tab">
      <div id="uploadForm">
        <h2 className="my-2">
          {`Would you like to add a photo of ${data.firstName || "your child"
            }`}
          ?
        </h2>
        <ImageUpload uploadSuccess={uploadSuccess} />
      </div>
      {photoUrl ? (
        <div>
          <img className="babyPic" src={photoUrl} alt="your baby" />
          <h3 className="mt-2">{`Looking good ${data.firstName}!`}</h3>
        </div>
      ) : null}
      <div className="row">
        <button
          className="btn btn-bablyGreen mt-3 me-2 form-control col"
          onClick={() => changeStep(-1)}
        >
          Previous
        </button>
        <button
          className="btn btn-bablyGreen mt-3 form-control col"
          onClick={() => (additionalChild ? submit() : changeStep(1))}
        >
          {additionalChild ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}

export default StepThree;
