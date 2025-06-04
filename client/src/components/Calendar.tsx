import { useContext, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import BablyApi from "../api";
import UserContext from "../users/UserContext";
import FeedForm from "../common/FeedForm";
import DiaperForm from "../common/DiaperForm";
import ConfirmModal from "../common/ConfirmModal";
import "./Calendar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBaby } from "@fortawesome/free-solid-svg-icons";
import { faBottleDroplet } from "@fortawesome/free-solid-svg-icons";
import type { UserContextType } from "../users/UserContext";

function Calendar() {
  const [currEvent, setCurrEvent] = useState(undefined);
  const context = useContext(UserContext) as UserContextType;
  const currChild = context?.currChild;
  const currUser = context?.currUser;
  const [showDiaperForm, setShowDiaperForm] = useState(false);
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toDelete, setToDelete] = useState<[number, string] | null>(null);

  const getEvents = async (start: Date, end: Date) => {
    const startTimestamp = start.getTime() / 1000;
    const endTimestamp = end.getTime() / 1000;
    if (!currChild) return [];
    let events;
    if (currUser?.email === "demo@demo.com") {
      // For demo purposes, return static data
      events = await BablyApi.getEvents(currChild.id, 0, 1);
    } else {
      events = await BablyApi.getEvents(currChild.id, startTimestamp, endTimestamp);
    }
    const uniqueFeedDates = new Set(
      events.feeds.map((d: any) =>
        new Date(d.start)
          .toLocaleString("sv", { timeZoneName: "short" })
          .slice(0, 10)
      )
    );
    const uniqueDiaperDates = new Set(
      events.diapers.map((d: any) =>
        new Date(d.start)
          .toLocaleString("sv", { timeZoneName: "short" })
          .slice(0, 10)
      )
    );
    const allDayFeedEvents = Array.from(uniqueFeedDates).map((d) => ({
      title: "F",
      backgroundColor: "#66bdb8",
      date: d,
    }));
    const allDayDiaperEvents = Array.from(uniqueDiaperDates).map((d) => ({
      date: d,
      title: "D",
    }));
    events = [
      ...events.feeds,
      ...events.diapers,
      ...allDayFeedEvents,
      ...allDayDiaperEvents,
    ];
    return events;
  };

  const updateDiaper = async (diaper_id: number, diaper: any) => {
    delete diaper.infant_id;
    if (!currChild) return;
    await BablyApi.updateDiaper(currChild.id, diaper_id.toString(), diaper);
  };

  const updateFeed = async (feed_id: number, feed: any) => {
    delete feed.infant_id;
    if (!currChild) return;
    await BablyApi.updateFeed(currChild.id, feed_id.toString(), feed);
  };

  function renderEventContent(eventInfo: any) {
    // Render icons in month view, otherwise show event title
    const { event, view } = eventInfo;
    const timeText = eventInfo.timeText.split(" - ")[0].trim();
    if (view.type === "dayGridMonth") {
      let faIcon;
      if (event.title === "F") faIcon = faBottleDroplet;
      else if (event.title === "D") faIcon = faBaby;
      if (!faIcon) return null;
      return (
        <span>
          <FontAwesomeIcon icon={faIcon} />
          {eventInfo.event.title}
        </span>
      );
    } else {
      // For other views, show the time and title
      return (
        <p className="small">{timeText}, {event.title}</p>
      );
    }
  }

  const confirmDelete = async () => {
    if (!toDelete || !currChild) return;
    if (toDelete[1] === "diaper") {
      await BablyApi.deleteDiaper(currChild.id, toDelete[0].toString());
    } else if (toDelete[1] === "feed") {
      await BablyApi.deleteFeed(currChild.id, toDelete[0].toString());
    }
    setToDelete(null);
    setShowConfirmModal(false);
  };

  const onDelete = (id: number, type: string): void => {
    setToDelete([id, type]);
    showModal(type);
    setShowConfirmModal(true);
  };

  const showModal = (type: string) => {
    if (type === "feed") {
      setShowFeedForm((prev) => !prev);
    } else if (type === "diaper") {
      setShowDiaperForm((prev) => !prev);
    }
  };

  return (
    <>
      <FeedForm
        show={showFeedForm}
        setShow={setShowFeedForm}
        submitUpdate={updateFeed}
        feed={currEvent}
        onDelete={onDelete}
      />
      <DiaperForm
        show={showDiaperForm}
        setShow={setShowDiaperForm}
        submitUpdate={updateDiaper}
        diaper={currEvent}
        onDelete={onDelete}
      />
      <ConfirmModal
        show={showConfirmModal}
        setShow={setShowConfirmModal}
        confirm={confirmDelete}
        cancel={setToDelete}
      />
      <div className="col-12 col-sm-8 col-xl-6 col-xxl-5 mt-4 my-sm-auto">

        <FullCalendar
          plugins={[
            dayGridPlugin,
            bootstrap5Plugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          dateClick={(info) => {
            if (info.view.type === "dayGridMonth") {
              info.view.calendar.changeView("timeGridDay", info.dateStr);
            }
          }}
          eventClick={async function (info) {
            if (currUser?.email === "demo@demo.com") {
              alert("This is a demo account. You cannot edit or delete events.");
              return;
            }
            if (!currChild || !(currChild as any).crud) return;
            const [type, eventId] = info.event._def.publicId.split("-");
            let event;
            if (type === "feed") {
              event = await BablyApi.getFeed(currChild.id, eventId);
            } else if (type === "diaper") {
              event = await BablyApi.getDiaper(currChild.id, eventId);
            }
            setCurrEvent(event);
            showModal(type);
          }}
          initialView="dayGridMonth"
          height="auto"
          nextDayThreshold="09:00:00"
          themeSystem="bootstrap5"
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "dayGridMonth,timeGridDay",
          }}
          views={{
            dayGrid: {
              titleFormat: { year: "numeric", month: "short" },
            },
            day: {
              titleFormat: { year: "numeric", month: "short", day: "numeric" },
              allDaySlot: false,
            },
          }}
          // dayMaxEvents={3}
          slotEventOverlap={false}
          events={{
            events: function (info: any) {
              return getEvents(info.start, info.end);
            },
          }}
          eventContent={renderEventContent}
        />
        <div className="card mt-2">
          <div className="card-body">
            <span style={{ backgroundColor: "rgb(102, 189, 184)", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", marginLeft: "0.5rem", color: "white" }}>
              <FontAwesomeIcon icon={faBottleDroplet} /> F
            </span> : Feeds logged this Day
            <br className="d-md-none" />
            <br className="d-md-none" />
            <span style={{ backgroundColor: "#3788d8", padding: "0.2rem 0.5rem", borderRadius: "0.25rem", marginLeft: "0.5rem", color: "white" }}>
              <FontAwesomeIcon icon={faBaby} /> D
            </span> : Diapers logged this Day
          </div>
        </div>
      </div>
    </>
  );
}

export default Calendar;
