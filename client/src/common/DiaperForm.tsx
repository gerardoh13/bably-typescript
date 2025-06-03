import { useState, useEffect, useContext } from "react";
import UserContext from "../users/UserContext";
import Modal from "react-bootstrap/Modal";
import type { Diaper } from "../types";
import type { UserContextType } from "../users/UserContext";

type DiaperFormProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  submitUpdate?: (diaper_id: number, diaper: any) => Promise<void>;
  submitNew?: (diaper: any) => Promise<void>;
  onDelete?: (id: number, type: string) => void;
  diaper?: Diaper;
};

export default function DiaperForm({ show, setShow, submitNew, submitUpdate, onDelete, diaper }: DiaperFormProps) {
  const INITIAL_STATE = {
    type: "dry",
    size: "light",
    changed_at: "",
    maxDateTime: "",
  };
  const [formData, setFormData] = useState(INITIAL_STATE);
  const context = useContext(UserContext) as UserContextType;
  const currChild = context?.currChild;
  const currUser = context?.currUser;

  useEffect(() => {
    if (show && !diaper) {
      let now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      now.setMilliseconds(0);
      now.setSeconds(0);
      let currTime = now.toISOString().slice(0, -1);
      setFormData((data) => ({
        ...data,
        changed_at: currTime,
        maxDateTime: currTime,
      }));
    } else if (show && diaper) {
      let date = new Date(diaper.changed_at * 1000);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      date.setMilliseconds(0);
      date.setSeconds(0);
      const changedAtStr = date.toISOString().slice(0, -1);
      setFormData({
        type: diaper.type,
        size: diaper.size,
        changed_at: changedAtStr,
        maxDateTime: changedAtStr,
      });
    }
  }, [show, diaper]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((data) => ({
      ...data,
      [name]: value.trim(),
    }));
  };

  const resetForm = () => {
    setFormData(INITIAL_STATE);
    setShow(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
        if (currUser?.email === "demo@demo.com") {
      alert("Sign up for a free account to log diapers!");
      return;
    }
    // const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const changed_at = new Date(formData.changed_at).getTime() / 1000;
    if (!currChild) return;

    const newDiaper = {
      changed_at,
      type: formData.type,
      infant_id: currChild.id,
      size: formData.type === "dry" ? "light" : formData.size,
    };
    if (diaper && diaper.id !== undefined) {
      await submitUpdate?.(diaper.id, newDiaper);
    } else if (submitNew) {
      await submitNew(newDiaper);
    }
    resetForm();
  };

  const handleDelete = () => {
    if (currUser?.email === "demo@demo.com") {
      alert("Sign up for a free account to delete diapers!");
      return;
    }
    if (diaper && diaper.id !== undefined && onDelete) {
      onDelete(+diaper.id, "diaper");
    }
  };
  return (
    <Modal show={show} centered>
      <Modal.Header>
        <Modal.Title> {diaper ? "Edit" : "Log New"} Diaper Change</Modal.Title>
        <button
          className="btn-close"
          aria-label="Close"
          onClick={resetForm}
        ></button>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="text-center container">
          <input
            type="radio"
            className="btn-check"
            name="type"
            id="dry"
            autoComplete="off"
            value="dry"
            checked={formData.type === "dry"}
            onChange={handleChange}
          />
          <label className="btn btn-outline-secondary" htmlFor="dry">
            Dry
          </label>

          <input
            type="radio"
            className="btn-check"
            name="type"
            id="wet"
            autoComplete="off"
            value="wet"
            checked={formData.type === "wet"}
            onChange={handleChange}
          />
          <label className="btn btn-outline-secondary mx-2" htmlFor="wet">
            Wet
          </label>

          <input
            type="radio"
            className="btn-check"
            name="type"
            id="soiled"
            autoComplete="off"
            value="soiled"
            checked={formData.type === "soiled"}
            onChange={handleChange}
          />
          <label className="btn btn-outline-secondary" htmlFor="soiled">
            Soiled
          </label>

          <input
            type="radio"
            className="btn-check"
            name="type"
            id="mixed"
            autoComplete="off"
            value="mixed"
            checked={formData.type === "mixed"}
            onChange={handleChange}
          />
          <label className="btn btn-outline-secondary ms-2" htmlFor="mixed">
            Mixed
          </label>

          <div className={`${formData.type !== "dry" ? "mt-3" : "d-none"}`}>
            <input
              type="radio"
              className="btn-check"
              name="size"
              id="light"
              autoComplete="off"
              value="light"
              checked={formData.size === "light"}
              onChange={handleChange}
            />
            <label className="btn btn-outline-secondary ms-2" htmlFor="light">
              Light
            </label>
            <input
              type="radio"
              className="btn-check"
              name="size"
              id="medium"
              autoComplete="off"
              value="medium"
              checked={formData.size === "medium"}
              onChange={handleChange}
            />
            <label className="btn btn-outline-secondary ms-2" htmlFor="medium">
              Medium
            </label>
            <input
              type="radio"
              className="btn-check"
              name="size"
              id="heavy"
              autoComplete="off"
              value="heavy"
              checked={formData.size === "heavy"}
              onChange={handleChange}
            />
            <label className="btn btn-outline-secondary ms-2" htmlFor="heavy">
              Heavy
            </label>
          </div>

          <div className="row mt-3">
            <div className="col">
              <label htmlFor="changed_at">Change Time:</label>
            </div>
            <div className="col">
              <input
                className="form-control"
                type="datetime-local"
                name="changed_at"
                id="changed_at"
                required
                value={formData.changed_at}
                max={formData.maxDateTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="row mt-3">
            <button
              type="button"
              className="btn btn-secondary form-control col me-2"
              data-bs-dismiss="modal"
              onClick={resetForm}
            >
              Cancel
            </button>
            {diaper ? (
              <button
                type="button"
                className="btn btn-bablyRed form-control col me-2"
                onClick={handleDelete}
              >
                Delete
              </button>
            ) : null}
            <button className="btn btn-bablyGreen col form-control">
              {diaper ? "Edit" : "Log"} Diaper
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}