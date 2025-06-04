import { useState, useEffect, useContext } from "react";
import type { UserContextType } from "../users/UserContext";
import UserContext from "../users/UserContext";
import Alerts from "../common/Alerts";

type RemindersProps = {
  reminders: {
    hours: string;
    minutes: string;
    cutoff: string;
    start: string;
    enabled: boolean;
    cutoffEnabled: boolean;
  };
  update: (data: any) => Promise<{ updated: boolean }>;
  setCurrUser: (user: any) => void;
};


function Reminders({ reminders, update, setCurrUser }: RemindersProps) {
  const [formData, setFormData] = useState({
    hours: reminders.hours,
    minutes: reminders.minutes,
    cutoff: reminders.cutoff,
    start: reminders.start,
  });
  const [enabled, setEnabled] = useState(reminders.enabled);
  const [cutoffEnabled, setCutoffEnabled] = useState(reminders.cutoffEnabled);
  const [msgs, setMsgs] = useState<string[]>([]);
  const [errs, setErrs] = useState<string[]>([]);
  const [iOS, setiOS] = useState(false);

  const context = useContext(UserContext) as UserContextType;
  const currUser = context?.currUser;

  useEffect(() => {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      setErrs(["Coming soon!", "Reminders not currently available on iOS"]);
      setiOS(true);
      return;
    } else {
      return;
    }
  }, [iOS]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currUser?.email === "demo@demo.com") {
      alert("Demo user cannot change reminders");
      return;
    }
    setMsgs([]);
    setErrs([]);
    const validTime = validateTime();
    const validStartCutoff = validateStartCutoff();
    if (!validTime || !validStartCutoff) return;
    let updatedReminders = structuredClone(formData) as any;
    updatedReminders.enabled = enabled;
    updatedReminders.cutoffEnabled = cutoffEnabled;
    let res = await update(updatedReminders);
    if (res.updated) {
      setMsgs(["Reminder settings updated!"])
      setCurrUser((prev: any) => ({
        ...prev,
        reminders: updatedReminders,
      }));
    }
  };

  const validateTime = () => {
    if (!enabled) return true;
    let time = parseInt(formData.hours) + parseInt(formData.minutes);
    if (time === 0) setErrs(["'Remind After' can't be 0 hours and 0 minutes"]);
    return time > 0;
  };

  const validateStartCutoff = () => {
    const sleepTimeEnd = getDate(formData.start);
    const sleepTimeStart = getDate(formData.cutoff);
    if (sleepTimeEnd >= sleepTimeStart)
      setErrs((prev) => [
        ...prev,
        "Sleep start time must be later than end time",
      ]);
    return sleepTimeEnd < sleepTimeStart;
  };

  const getDate = (time: string) => {
    let date = new Date();
    const [hrs, mins] = time.split(":").map((t) => parseInt(t));
    date.setHours(hrs, mins, 0);
    return date;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((data) => ({
      ...data,
      [name]: value,
    }));
  };

  const toLocalTime = (time: string) => {
    const [h, m] = time.split(":");
    return `${+h % 12 ? +h % 12 : 12}:${m} ${+h >= 12 ? "PM" : "AM"}`;
  };

  const handleSwitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (name === "enabled") setEnabled((prev) => !prev);
    if (name === "cutoffEnabled") setCutoffEnabled((prev) => !prev);
  };

  return (
    <form onSubmit={handleSubmit}>
      {msgs.length ? <Alerts msgs={msgs} type="primary" /> : null}
      {errs.length ? <Alerts msgs={errs} /> : null}

      <div className="row">
        <div className="col-6">
          <p>Reminders</p>
        </div>
        <div className="col-6 form-check form-switch">
          <input
            className="form-check-input lgSwitch ms-1"
            type="checkbox"
            role="switch"
            name="enabled"
            checked={enabled && !iOS}
            disabled={iOS}
            onChange={handleSwitch}
          />
        </div>
        <span className="my-1">
          {enabled
            ? `Disable to stop reminders after new feeds`
            : "Enable to receive reminders after new feeds"}
        </span>
      </div>
      <div className="row mt-2">
        <div className="col-6">
          <br />
          <p>Remind After</p>
        </div>
        <div className="col-6">
          <div className="row">
            <div className="col pe-1">
              <span>Hours</span>
              <select
                name="hours"
                className="form-select"
                value={formData.hours}
                onChange={handleChange}
                disabled={!enabled || iOS}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
            <div className="col ps-1">
              <span>Mins</span>
              <select
                name="minutes"
                className="form-select"
                value={formData.minutes}
                onChange={handleChange}
                disabled={!enabled || iOS}
              >
                <option value="0">0</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="row my-3">
        <div className="col-6">
          <span>Sleep Time</span>
          <br />
        </div>
        <div className="col-6 form-check form-switch">
          <input
            className="form-check-input lgSwitch ms-1"
            type="checkbox"
            role="switch"
            name="cutoffEnabled"
            checked={cutoffEnabled && !iOS}
            onChange={handleSwitch}
            disabled={!enabled || iOS}
          />
        </div>
        <span className="my-1">
          {cutoffEnabled
            ? `Reminders muted from ${toLocalTime(
              formData.cutoff
            )} to ${toLocalTime(formData.start)}`
            : "Enable to stop reminders during sleep time"}
        </span>
      </div>
      <div className="row mt-3">
        <div className="col">
          <label htmlFor="cutoff">Sleep Start Time</label>
          <p>Reminders stop at:</p>
        </div>
        <div className="col">
          <input
            className="form-control"
            type="time"
            name="cutoff"
            id="cutoff"
            value={formData.cutoff}
            onChange={handleChange}
            disabled={!cutoffEnabled || !enabled || iOS}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col">
          <label htmlFor="start">Sleep End Time</label>
          <p>Reminders start at:</p>
        </div>
        <div className="col">
          <input
            className="form-control"
            type="time"
            name="start"
            id="start"
            value={formData.start}
            onChange={handleChange}
            disabled={!cutoffEnabled || !enabled || iOS}
          />
        </div>
      </div>
      <button className="btn btn-bablyGreen btn-lg form-control mt-3">
        Save
      </button>
    </form>
  );
}

export default Reminders;
