import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserContext from "../users/UserContext.tsx";
import BablyApi from "../api";
import DiaperForm from "../common/DiaperForm.tsx";
import FeedForm from "../common/FeedForm.tsx";
import FeedTable from "./FeedTable";
import SummaryCards from "./SummaryCards.tsx";
import DiaperTable from "./DiaperTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBaby } from "@fortawesome/free-solid-svg-icons";
import { faBottleDroplet } from "@fortawesome/free-solid-svg-icons";
import type { UserContextType } from "../users/UserContext";

function Home() {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [diapers, setDiapers] = useState<any[]>([]);
  const [showDiaperForm, setShowDiaperForm] = useState(false);
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [changeCount, setChangeCount] = useState(0)
  const [totals, setTotals] = useState({
    amount: 0,
    duration: 0,
    wet: 0,
    soiled: 0,
  });

  const context = useContext(UserContext) as UserContextType;
  const currUser = context?.currUser;
  const currChild = context?.currChild;

  useEffect(() => {
    const getActivity = async () => {
      if (!currChild) return;
      const { lastMidnight, nextMidnight } = getMidnights();
      const todaysData = await BablyApi.getTodaysData(
        currChild.id,
        lastMidnight.toString(),
        nextMidnight.toString()
      );
      setFeeds(todaysData.feeds);
      setDiapers(todaysData.diapers);
      updateFeedCard(todaysData.feeds);
      updateDiaperCard(todaysData.diapers);
    };
    getActivity();
  }, [currChild?.id, changeCount]);

  const getMidnights = () => {
    let midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    let lastMidnight = midnight.getTime() / 1000;
    midnight.setDate(midnight.getDate() + 1);
    let nextMidnight = midnight.getTime() / 1000;
    return { lastMidnight, nextMidnight };
  };

  const addFeed = async (feed: any) => {
    let newFeed = await BablyApi.addFeed(feed);
    const { lastMidnight, nextMidnight } = getMidnights();
    let newFeedTime = parseInt(newFeed.fed_at);
    let latestFeedTime = feeds.length ? feeds[0].fed_at : 0;
    handleNotifications(newFeedTime, latestFeedTime);
    if (newFeedTime > lastMidnight && newFeedTime < nextMidnight) {
      pushAndSortFeeds(newFeed);
    }
  };

  const handleNotifications = async (newFeedTime: number, latestFeedTime: number) => {
    const { enabled, hours, minutes, cutoffEnabled, start, cutoff } =
      currUser?.reminders;
    // if feed is not the latest feed, do nothing
    if (newFeedTime < latestFeedTime) return;
    // if reminders are disabled, do nothing
    if (!enabled) return;
    let now = new Date();
    let futureTime = (hours * 60 + minutes) * 60;
    let futureDate = new Date((newFeedTime + futureTime) * 1000);
    // if future reminder date already passed, do nothing
    if (futureDate.getTime() < now.getTime()) return;
    if (cutoffEnabled) {
      const [startHours, startMins] = start.split(":").map((t: string) => parseInt(t));
      const [endHours, endMins] = cutoff.split(":").map((t: string) => parseInt(t));
      const startTime = startHours * 60 + startMins;
      const endTime = endHours * 60 + endMins;
      const futureMins = futureDate.getHours() * 60 + futureDate.getMinutes();
      // if cutoff is enabled and reminder falls after cutoff or before start, do nothing
      if (futureMins >= endTime || futureMins <= startTime) return;
    }
    console.log("set reminder at", futureDate.toLocaleString());
    if (!currUser || !currChild) return;
    let res = await BablyApi.scheduleReminder(currUser.email, {
      timestamp: futureDate.getTime(),
      infant: currChild.firstName,
    });
    console.log(res);
  };

  const pushAndSortFeeds = (newFeed: any) => {
    let feedsCopy = [...feeds];
    feedsCopy.push(newFeed);
    feedsCopy.sort((a, b) => b.fed_at - a.fed_at);
    setFeeds(feedsCopy);
    updateFeedCard(feedsCopy);
  };

  const updateFeedCard = (todaysFeeds: any[]) => {
    const bottleFeeds = todaysFeeds.filter((f) => f.method === "bottle");
    const nursingFeeds = todaysFeeds.filter((f) => f.method === "nursing");
    let feedAmt = !bottleFeeds.length
      ? 0
      : bottleFeeds.reduce((acc, curr) => acc + curr.amount, 0);
    let feedDuration = !nursingFeeds.length
      ? 0
      : nursingFeeds.reduce((acc, curr) => acc + curr.duration, 0);
    setTotals((data) => ({
      ...data,
      duration: feedDuration,
      amount: feedAmt,
    }));
  };

  const addDiaper = async (diaper: any) => {
    let newDiaper = await BablyApi.addDiaper(diaper);
    const { lastMidnight, nextMidnight } = getMidnights();
    let dateTime = parseInt(newDiaper.changed_at);
    if (dateTime > lastMidnight && dateTime < nextMidnight) {
      pushAndSortDiapers(newDiaper);
    }
  };

  const pushAndSortDiapers = (newDiaper: any) => {
    let diapersCopy = [...diapers];
    diapersCopy.push(newDiaper);
    diapersCopy.sort((a, b) => b.changed_at - a.changed_at);
    setDiapers(diapersCopy);
    updateDiaperCard(diapersCopy);
  };

  const updateDiaperCard = (todaysDiapers: any[]) => {
    const wetDiapers = todaysDiapers.filter(
      (f) => f.type === "wet" || f.type === "mixed"
    );
    const soiledDiapers = todaysDiapers.filter(
      (f) => f.type === "soiled" || f.type === "mixed"
    );
    setTotals((data) => ({
      ...data,
      wet: wetDiapers.length,
      soiled: soiledDiapers.length,
    }));
  };

  function toDateStr(timestamp: number) {
    let value = timestamp * 1000;
    let toDate = new Date(value);
    let time = toDate.toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${time}`;
  }

  return (
    <>
      <DiaperForm
        show={showDiaperForm}
        setShow={setShowDiaperForm}
        submitNew={addDiaper}
      />
      <FeedForm
        show={showFeedForm}
        setShow={setShowFeedForm}
        submitNew={addFeed}
      />
      <div className="main-container col-11 col-md-6 col-xxl-5 text-center text-light mx-auto">
        <div className="content">
          <h1 className="my-4">
            {currChild?.firstName}
            {currChild?.firstName.endsWith("s") ? "'" : "'s"} Daily Activity
          </h1>
          <>
            <SummaryCards
              feeds={feeds}
              totals={totals}
              diapers={diapers}
            />
            {feeds.length && currChild && currUser ? (
              <FeedTable feeds={feeds}
                currChild={currChild}
                setChangeCount={setChangeCount}
                toDateStr={toDateStr} />
            ) : (
              <div className="my-3 card">
                <div className="card-body text-center">
                  <b>
                    Log {currChild?.firstName}
                    {currUser && currChild?.firstName.endsWith("s") ? "'" : "'s"} feeds to
                    see {currChild?.gender === "male" ? "his" : "her"} {" "}
                    activity here!
                  </b>
                </div>
              </div>
            )}

            {diapers.length && currChild && currUser ? (
              <DiaperTable
                diapers={diapers}
                currChild={currChild}
                setChangeCount={setChangeCount}
                toDateStr={toDateStr}
              />
            ) : (
              <div className="my-3 card">
                <div className="card-body text-center">
                  <b>
                    Log {currChild?.firstName}
                    {currUser && currChild?.firstName.endsWith("s") ? "'" : "'s"} diapers to
                    see {currChild?.gender === "male" ? "his" : "her"} {" "}
                    activity here!
                  </b>
                </div>
              </div>
            )}
          </>
        </div>
        <div className="mt-auto buttons w-100">
          <div className="row m-auto w-100">
            <div
              className="card bablyBlue text-light mb-3 pointer col me-1"
              onClick={() => setShowFeedForm(true)}
            >
              <div className="card-body">
                <h5 className="card-title"> <span className="me-1">
                  <FontAwesomeIcon icon={faBottleDroplet} />
                </span>Log Feed</h5>            </div>
            </div>

            <div
              className="card bablyGreen text-light mb-3 pointer col ms-1"
              onClick={() => setShowDiaperForm(true)}
            >
              <div className="card-body">
                <h5 className="card-title"> <span className="me-1">
                  <FontAwesomeIcon icon={faBaby} />
                </span>Log Diaper</h5>
              </div>
            </div>
          </div>

          <div className="row m-auto w-100">
            <div className="card bablyGrey text-light mb-3 col me-1">
              <Link className="nav-link" to="/settings">
                <div className="card-body">
                  <h5 className="card-title">Settings</h5>
                </div>
              </Link>
            </div>

            <div className="card bablyColor text-light mb-3 col ms-1">
              <Link className="nav-link" to="/calendar">
                <div className="card-body">
                  <h5 className="card-title">Calendar</h5>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
export default Home;
