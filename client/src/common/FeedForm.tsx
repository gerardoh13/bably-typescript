import { useState, useEffect, useContext } from "react";
import UserContext from "../users/UserContext";
import Modal from "react-bootstrap/Modal";
import type { Feed } from "../types";
import type { UserContextType } from "../users/UserContext";

type FeedFormProps = {
  show: boolean;
  setShow: (show: boolean) => void;
  submitUpdate?: (feed_id: number, feed: any) => Promise<void>;
  submitNew?: (feed: any) => Promise<void>;
  onDelete?: (id: number, type: string) => void;
  feed?: Feed;
};


function FeedForm({ show, setShow, submitNew, submitUpdate, onDelete, feed }: FeedFormProps) {
  let INITIAL_STATE = {
    method: "bottle",
    amount: "6",
    duration: "",
    fed_at: "",
    maxDateTime: "",
  };

  const [formData, setFormData] = useState(INITIAL_STATE);
  const context = useContext(UserContext) as UserContextType;
  const currUser = context?.currUser;
  const currChild = context?.currChild;

  useEffect(() => {
    if (show && !feed) {
      let now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      now.setMilliseconds(0);
      now.setSeconds(0);
      let currTime = now.toISOString().slice(0, -1);
      setFormData((data) => ({
        ...data,
        fed_at: currTime,
        maxDateTime: currTime,
      }));
    } else if (show && feed) {
      let date = new Date(feed.fed_at * 1000);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
      date.setMilliseconds(0);
      date.setSeconds(0);
      setFormData({
        method: feed.method,
        amount: feed.amount !== undefined && feed.amount !== null ? feed.amount.toString() : "",
        duration: feed.duration !== undefined && feed.duration !== null ? feed.duration.toString() : "",
        fed_at: date.toISOString().slice(0, -1),
        maxDateTime: date.toISOString().slice(0, -1),
      });
    }
  }, [show, feed]);

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
      alert("Sign up for a free account to log feeds!");
      return;
    }
    // let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let fed_at = new Date(formData.fed_at).getTime() / 1000;
    if (!currChild) return;

    let newFeed: any = { fed_at, method: formData.method, infant_id: currChild.id };
    if (formData.method === "bottle") {
      let amount = parseFloat(formData.amount);
      newFeed.amount = amount;
      delete newFeed.duration;
    } else {
      let duration = parseFloat(formData.duration);
      newFeed.duration = duration;
      newFeed.amount = null;
      delete newFeed.amount;
    }
    if (feed && feed.id !== undefined) await submitUpdate?.(feed.id, newFeed);
    else if (submitNew) await submitNew(newFeed);
    resetForm();
  };

  const handleDelete = () => {
    if (currUser?.email === "demo@demo.com") {
      alert("Sign up for a free account to delete feeds!");
      return;
    }
    if (feed && feed.id !== undefined && onDelete) {
      onDelete(+feed.id, "feed");
    }
  }
  return (
    <Modal show={show} centered>
      <Modal.Header>
        <Modal.Title>{feed ? "Edit" : "Log New"} Feed</Modal.Title>
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
            className="btn-check method"
            name="method"
            id="bottle"
            autoComplete="off"
            value="bottle"
            checked={formData.method === "bottle"}
            onChange={handleChange}
          />
          <label
            className="btn btn-outline-secondary radioLabel me-2"
            htmlFor="bottle"
          >
            Bottle
          </label>

          <input
            type="radio"
            className="btn-check method"
            name="method"
            id="nursing"
            autoComplete="off"
            value="nursing"
            checked={formData.method === "nursing"}
            onChange={handleChange}
          />
          <label
            className="btn btn-outline-secondary radioLabel"
            htmlFor="nursing"
          >
            Nursing
          </label>

          <div className="row mt-3 px-3">
            <div className="col">
              <label htmlFor="fed_at">Start Time:</label>
            </div>
            <div className="col">
              <input
                className="form-control"
                type="datetime-local"
                name="fed_at"
                id="fed_at"
                required
                value={formData.fed_at}
                max={formData.maxDateTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={`${formData.method === "nursing" ? "d-none" : ""}`}>
            <label htmlFor="amount" className="form-label mt-2">
              Amount:
            </label>
            <input
              type="range"
              name="amount"
              id="amount"
              className="form-range"
              step="0.25"
              min="1"
              max="12"
              onChange={handleChange}
              value={formData.amount}
            />
            <output>{formData.amount}</output>
            <span> oz</span>
          </div>
          <div
            className={`${formData.method === "bottle" ? "d-none" : "row mt-3"
              }`}
          >
            <div className="col">
              <label htmlFor="amount" className="form-label">
                Duration (mins):
              </label>
            </div>
            <div className="col">
              <input
                type="number"
                name="duration"
                id="duration"
                className="form-control"
                step="1"
                min="1"
                max="60"
                disabled={formData.method === "bottle"}
                value={formData.duration}
                onChange={handleChange}
                required={formData.method === "nursing"}
              />
            </div>
          </div>
          <div className="row mt-3">
            <button
              type="button"
              className="btn btn-secondary col me-2"
              data-bs-dismiss="modal"
              onClick={resetForm}
            >
              Cancel
            </button>
            {feed ? (
              <button
                type="button"
                className="btn btn-bablyRed col me-2"
                onClick={handleDelete}
              >
                Delete
              </button>
            ) : null}
            <button className="btn btn-bablyGreen col" type="submit">
              {feed ? "Edit" : "Log"} Feed
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

export default FeedForm;
