import { useState, useEffect, useContext } from "react";
import Modal from "react-bootstrap/Modal";
import ImageUpload from "../common/ImageUpload";
import UserContext from "../users/UserContext";
import type { Infant } from "../types";
import type { UserContextType } from "../users/UserContext";

type EditChildFormProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  child: Infant;
}

interface FormData {
  firstName: string;
  dob: string;
  gender: string;
  publicId?: string;
}

function EditChildForm({ show, setShow, child }: EditChildFormProps) {
  const context = useContext(UserContext) as UserContextType;
  const updateInfant = context?.updateInfant;

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    dob: "",
    gender: "",
    publicId: "",
  });
  let defaultURL = child.publicId
    ? `https://res.cloudinary.com/dolnu62zm/image/upload/${child.publicId}`
    : "";
  const [photoUrl, setPhotoUrl] = useState(defaultURL);
  const [maxDate, setMaxDate] = useState("");
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    let max = new Date().toISOString().slice(0, -14);
    let event = new Date();
    let twoYearsAgo = event.getFullYear() - 2;
    event.setFullYear(twoYearsAgo);
    let min = event.toISOString().slice(0, -14);
    setMaxDate(max);
    setMinDate(min);
    setFormData({
      firstName: child.firstName,
      dob: child.dob.slice(0, 10),
      gender: child.gender,
      publicId: child.publicId || "",
    });
  }, [show, child]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((data) => ({
      ...data,
      [name]: value.trim(),
    }));
  };

  interface SubmitEvent extends React.FormEvent<HTMLFormElement> { }

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    let updatedData: FormData = structuredClone(formData);
    if (!updatedData.publicId) delete updatedData.publicId;
    if (updateInfant) {
      await updateInfant(child.id, updatedData);
    }
    setShow(false);
  };

  interface UploadResultInfo {
    secure_url: string;
    public_id: string;
  }

  interface UploadResult {
    event: string;
    info: UploadResultInfo;
  }

  const uploadSuccess = (error: Error | null, result: UploadResult | undefined) => {
    if (!error && result && result.event === "success") {
      console.log("Done! Here is the image info: ", result.info);
      setPhotoUrl(result.info.secure_url);
      setFormData((data) => ({
        ...data,
        publicId: result.info.public_id,
      }));
    } else {
      console.log(error);
    }
  };

  return (
    <Modal show={show} centered>
      <Modal.Header>
        <Modal.Title>Edit Profile</Modal.Title>
        <button
          className="btn-close"
          aria-label="Close"
          onClick={() => setShow(false)}
        ></button>
      </Modal.Header>
      <Modal.Body>
        {photoUrl ? (
          <div className="text-center mb-3">
            <img className="babyPic" src={photoUrl} alt="your baby" />
          </div>
        ) : null}
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-8">{`Upload photo of ${formData.firstName}`}</div>
            <div className="col-4 text-end">
              <ImageUpload uploadSuccess={uploadSuccess} />
            </div>
          </div>
          <div className="form-floating">
            <input
              type="text"
              className="form-control"
              id="firstName"
              name="firstName"
              placeholder="Child's First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <label htmlFor="firstName">First Name</label>
            <div className="invalid-feedback">
              Please enter your child's name.
            </div>
          </div>
          <br />
          <div className="text-center">
            <small className="me-2">Gender:</small>
            <input
              type="radio"
              className="btn-check gender"
              name="gender"
              id="boy"
              autoComplete="off"
              checked={formData.gender === "male"}
              value="male"
              required
              onChange={handleChange}
            />
            <label className="btn btn-outline-dark me-2" htmlFor="boy">
              <i className="bi bi-gender-male"></i> Boy
            </label>
            <input
              type="radio"
              className="btn-check gender"
              name="gender"
              id="girl"
              autoComplete="off"
              checked={formData.gender === "female"}
              value="female"
              onChange={handleChange}
            />
            <label className="btn btn-outline-dark" htmlFor="girl">
              <i className="bi bi-gender-female"></i> Girl
            </label>
          </div>
          <br />
          <label htmlFor="dob">Date of Birth</label>
          <input
            className="form-control"
            type="date"
            name="dob"
            id="dob"
            max={maxDate}
            min={minDate}
            value={formData.dob}
            onChange={handleChange}
            required
          />
          <div className="invalid-feedback">
            Please enter your child's date of birth.
          </div>
          <div className="row mt-3">
            <button
              type="button"
              className="btn btn-secondary form-control col me-2"
              data-bs-dismiss="modal"
              onClick={() => setShow(false)}
            >
              Cancel
            </button>
            <button className="btn btn-bablyGreen col form-control">
              Save Changes
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

export default EditChildForm;
