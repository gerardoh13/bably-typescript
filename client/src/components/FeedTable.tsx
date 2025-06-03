import { useState, useEffect } from "react";
import type { Feed } from "../types";
import FeedForm from "../common/FeedForm";
import BablyApi from "../api";
import ConfirmModal from "../common/ConfirmModal";
import type { Infant } from "../types";

type FeedTableProps = {
  feeds: Feed[];
  toDateStr: (timestamp: number) => string;
  setCurrEvent?: (event: Feed) => void;
  currChild: Infant;
  setChangeCount: React.Dispatch<React.SetStateAction<number>>;
};


function FeedTable({ feeds, toDateStr, currChild, setChangeCount }: FeedTableProps) {
  const [showMore, setShowMore] = useState("d-none");
  const [showFeedForm, setShowFeedForm] = useState(false);
  const [currEvent, setCurrEvent] = useState<Feed | undefined>();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!showFeedForm) setCurrEvent(undefined)
  }, [showFeedForm])

  const createRows = (arr: any[], hidden = false) => {
    return arr.map((f, idx) => (
      <tr key={f.id || idx} className={hidden ? showMore : ""} onClick={() => handleClick(f)}>
        <td>{toDateStr(f.fed_at)}</td>
        <td>{f.method.charAt(0).toUpperCase() + f.method.substr(1)}</td>
        <td>
          {f.method === "bottle" ? `${f.amount} oz` : `${f.duration} Mins`}
        </td>
      </tr>
    ));
  };

  const onDelete = (id: number): void => {
    setToDelete(id);
    setShowFeedForm((prev) => !prev);
    setShowConfirmModal(true);
  };

  const updateFeed = async (feed_id: number, feed: any) => {
    delete feed.infant_id;
    if (!currChild) return;
    await BablyApi.updateFeed(currChild.id, feed_id.toString(), feed);
    setChangeCount((prev) => prev + 1);
  };

  const confirmDelete = async () => {
    if (!toDelete || !currChild) return;
    await BablyApi.deleteFeed(currChild.id, toDelete.toString());
    setToDelete(null);
    setShowConfirmModal(false);
    setCurrEvent(undefined)
    setChangeCount((prev) => prev + 1);
  };

  const handleClick = (feed: Feed) => {
    setCurrEvent(feed)
    setShowFeedForm(true)
  }

  return (
    <>
      <FeedForm
        show={showFeedForm}
        setShow={setShowFeedForm}
        submitUpdate={updateFeed}
        feed={currEvent}
        onDelete={onDelete}
      />
      <ConfirmModal
        show={showConfirmModal}
        setShow={setShowConfirmModal}
        confirm={confirmDelete}
        cancel={setToDelete}
      />
      <div>
        <table className="table table-sm table-striped bg-light">
          <thead>
            <tr>
              <th className="wThird" scope="col">
                Time
              </th>
              <th className="wThird" scope="col">
                Method
              </th>
              <th className="wThird" scope="col">
                oz/Mins
              </th>
            </tr>
          </thead>
          <tbody>
            {createRows(feeds.slice(0, 3))}
            {feeds.length > 3 ? (
              <>
                <tr
                  className={showMore === "" ? "d-none" : ""}
                >
                  <td />
                  <th scope="row">
                    <button className="btn btn-bablyGreen btn-sm"
                      onClick={() => setShowMore("")}
                    >
                      Show {feeds.slice(3).length} More
                    </button>
                  </th>
                  <td />
                </tr>
                <tr className="d-none" />
                {createRows(feeds.slice(3), true)}
                <tr className={showMore}>
                  <td />
                  <th scope="row">
                    <button className="btn btn-bablyBlue btn-sm"
                      onClick={() => setShowMore("d-none")}
                    >
                      Hide
                    </button>
                  </th>
                  <td />
                </tr>
              </>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default FeedTable;
