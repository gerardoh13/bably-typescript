import { useState, useEffect } from "react";
import type { Diaper } from "../types";
import DiaperForm from "../common/DiaperForm";
import BablyApi from "../api";
import ConfirmModal from "../common/ConfirmModal";
import type { Infant } from "../types";

type DiaperTableProps = {
  diapers: Diaper[];
  toDateStr: (timestamp: number) => string;
  setCurrEvent?: (event: Diaper) => void;
  currChild: Infant;
  setChangeCount: React.Dispatch<React.SetStateAction<number>>;
};

function DiaperTable({ diapers, toDateStr, currChild, setChangeCount }: DiaperTableProps) {
  const [showMore, setShowMore] = useState("d-none");
  const [showDiaperForm, setShowDiaperForm] = useState(false);
  const [currEvent, setCurrEvent] = useState<Diaper | undefined>();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toDelete, setToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (!showDiaperForm) setCurrEvent(undefined)
  }, [showDiaperForm])

  const createRows = (arr: any[], hidden = false) => {
    return arr.map((d, idx) => (
      <tr key={d.id || idx} className={hidden ? showMore : ""} onClick={() => handleClick(d)}>
        <td>{toDateStr(d.changed_at)}</td>
        <td>{d.type.charAt(0).toUpperCase() + d.type.substr(1)}</td>
        <td>{d.size.charAt(0).toUpperCase() + d.size.substr(1)}</td>
      </tr>
    ));
  };

  const onDelete = (id: number): void => {
    setToDelete(id);
    setShowDiaperForm((prev) => !prev);
    setShowConfirmModal(true);
  };

  const updateDiaper = async (diaper_id: number, diaper: any) => {
    delete diaper.infant_id;
    if (!currChild) return;
    await BablyApi.updateDiaper(currChild.id, diaper_id.toString(), diaper);
    setChangeCount((prev) => prev + 1);
  };

  const confirmDelete = async () => {
    if (!toDelete || !currChild) return;
    await BablyApi.deleteDiaper(currChild.id, toDelete.toString());
    setToDelete(null);
    setShowConfirmModal(false);
    setCurrEvent(undefined)
    setChangeCount((prev) => prev + 1);
  };

  const handleClick = (diaper: Diaper) => {
    setCurrEvent(diaper)
    setShowDiaperForm(true)
  }

  return (
    <>
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
      <div>
        <table className="table table-sm table-striped bg-light">
          <thead>
            <tr>
              <th className="wThird" scope="col">Time</th>
              <th className="wThird" scope="col">Type</th>
              <th className="wThird" scope="col">Size</th>
            </tr>
          </thead>
          <tbody id="table">
            {createRows(diapers.slice(0, 3))}
            {diapers.length > 3 ? (
              <>
                <tr
                  className={showMore === "" ? "d-none" : ""}
                >
                  <td />
                  <th scope="row">
                    <button className="btn btn-bablyGreen btn-sm"
                      onClick={() => setShowMore("")}
                    >
                      Show {diapers.slice(3).length} More
                    </button>
                  </th>
                  <td />
                </tr>
                <tr className="d-none" />
                {createRows(diapers.slice(3), true)}
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

export default DiaperTable;
