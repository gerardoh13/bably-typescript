import { useContext, useState, useEffect } from "react";
import UserContext from "../users/UserContext";
import Milestones from "./Milestones";
import EditChildForm from "./EditChildForm";
import { DateTime } from "luxon";
import type { UserContextType } from "../users/UserContext";

function Profile() {
  const context = useContext(UserContext) as UserContextType;
  const currChild = context?.currChild;

  const [showForm, setShowForm] = useState(false);

  const [age, setAge] = useState({
    years: 0,
    months: 0,
    days: 0,
    totalMonths: 0,
  });
  
  useEffect(() => {
    if (!currChild || !currChild.dob) return;
    const dobISO = new Date(currChild?.dob).toISOString();
    const now = DateTime.now();
    const dob = DateTime.fromISO(dobISO);
    const diff = now.diff(dob, ["years", "months", "days"]);
    const totalMonths = diff.years
      ? diff.years * 12 + diff.months
      : diff.months;
    setAge({
      years: diff.years,
      months: diff.months,
      days: Math.floor(diff.days),
      totalMonths: totalMonths,
    });
  }, [currChild]);

  const prettyAge = () => {
    let years = age.years
      ? `${age.years} ${formatPlurals(age.years, "year")}`
      : "";
    let months = age.months
      ? `${age.months} ${formatPlurals(age.months, "month")}`
      : "";
    let days = age.days ? `${age.days} ${formatPlurals(age.days, "day")}` : "";
    if (years && (months || days)) years += ",";
    if (months && days) months += ",";
    if (years || months) days = "and " + days;
    let formattedAge = `${years} ${months} ${days}`;
    return formattedAge;
  };

  const formatPlurals = (num: number, unit: string) => {
    return num > 1 ? unit + "s" : unit;
  };
  return (
    <>
      {currChild?.userIsAdmin ? (
        <EditChildForm
          show={showForm}
          setShow={setShowForm}
          child={{
            ...currChild,
            dob: new Date(currChild.dob).toISOString(),
          }}
        />
      ) : null}
      <div className="col-11 col-md-6 col-xxl-5 card text-center mt-4 my-sm-auto">
        <div className="card-body">
          <div className="row mt-3">
            {currChild?.publicId ? (
              <div className="col-12 col-sm-6">
                <img
                  className="profileImg rounded"
                  src={`https://res.cloudinary.com/dolnu62zm/image/upload/${currChild.publicId}`}
                  alt={currChild.firstName}
                />
              </div>
            ) : null}
            <div className="col-12 col-sm-6 m-auto">
              <h1 className="card-title">{currChild?.firstName}</h1>
              <p>
                Date of Birth: {currChild?.dob ? new Date(currChild.dob).toLocaleDateString() : "N/A"}
              </p>
              <p>
                {prettyAge().trim() ? currChild?.firstName + " is " + prettyAge() + " old!" : "Happy Birthday!"}
              </p>

              {currChild?.userIsAdmin ? (
                <button
                  className="btn btn-bablyGreen"
                  onClick={() => setShowForm(true)}
                >
                  Edit Profile
                </button>
              ) : null}
            </div>
          </div>

          <div className="text-start mt-4 mx-lg-5">
            <Milestones gender={currChild?.gender} months={age.totalMonths} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
