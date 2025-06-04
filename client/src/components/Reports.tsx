import { useState, useContext, useEffect } from "react";
import BablyApi from "../api";
import UserContext from "../users/UserContext";
import type { UserContextType } from "../users/UserContext";

export default function Reports() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showFeeds, setShowFeeds] = useState(true);
    const [showDiapers, setShowDiapers] = useState(true);
    const [results, setResults] = useState<any[]>([]);
    const [filteredResults, setFilteredResults] = useState<any[]>([]);
    const context = useContext(UserContext) as UserContextType;

    useEffect(() => {
        let filtered = [...results];
        if (!showFeeds) filtered = filtered.filter((e: any) => !e.title.includes("feed") && !e.title.includes("nursing"));
        if (!showDiapers) filtered = filtered.filter((e: any) => !e.title.includes("diaper"));
        setFilteredResults(filtered);
    }, [showFeeds, showDiapers, results]);

    const currChild = context?.currChild;
    const getEvents = async (start: Date, end: Date) => {
        const startTimestamp = start.getTime() / 1000;
        const endTimestamp = end.getTime() / 1000;
        if (!currChild) return [];
        let events = await BablyApi.getEvents(currChild.id, startTimestamp, endTimestamp);
        events = [
            ...events.feeds,
            ...events.diapers,
        ].sort((a: any, b: any) => {
            return b.start - a.start;
        });
        return events;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!startDate || !endDate) return;
        const end = new Date(endDate);
        // Ensure end date is inclusive
        end.setDate(end.getDate() + 1);
        if (new Date(startDate).getTime() > end.getTime()) {
            // Alert if start date is after end date
            alert("Start date cannot be after end date.");
            return;
        }
        const events = await getEvents(new Date(startDate), end);
        setResults(events);
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "startDate") {
            setStartDate(value);
        } else if (name === "endDate") {
            setEndDate(value);
        }
    };
    return (
        <div>
            <h4>Reports</h4>
            <form
                className="container"
                onSubmit={handleSubmit}
            >
                <div className="row">
                    <div className="col-6">
                        <label htmlFor="startDate">
                            Start Date:
                        </label>
                        <input
                            className="form-control"
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={handleDateChange}
                            name="startDate"
                            required
                        />
                    </div>
                    <div className="col-6">
                        <label htmlFor="endDate">
                            End Date:
                        </label>
                        <input
                            className="form-control"
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={handleDateChange}
                            name="endDate"
                            required
                        />
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col d-flex justify-content-around">
                        <div className="form-check form-switch">
                            <input
                                type="checkbox"
                                checked={showFeeds}
                                onChange={e => setShowFeeds(e.target.checked)}
                                id="showFeeds"
                                className="form-check-input lgSwitch"
                                role="switch"
                            />
                            <label htmlFor="showFeeds" className="form-check-label ms-2 mt-1">
                                Feeds
                            </label>
                        </div>

                        <div className="form-check form-switch">
                            <input
                                type="checkbox"
                                checked={showDiapers}
                                onChange={e => setShowDiapers(e.target.checked)}
                                id="showDiapers"
                                className="form-check-input lgSwitch"
                                role="switch"
                            />
                            <label htmlFor="showDiapers" className="form-check-label ms-2 mt-1">
                                Diapers
                            </label>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-bablyGreen col-5">Get Events</button>

                </div>

            </form>
            {filteredResults.length > 0 && (
                <div className="mt-4">
                    <table className="table table-striped text-center">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Details</th>
                                <th>Date/Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.map((event, idx) => {
                                const type = event.title.includes("feed") ? "Bottle Feed" :
                                    event.title.includes("diaper") ? "Diaper" :
                                        event.title.includes("nursing") ? "Nursing" :
                                            "Event";

                                return (
                                    <tr key={event.id || idx}>
                                        <td>
                                            {type}
                                        </td>
                                        <td>
                                            {type === "Bottle Feed"
                                                ? `Amount: ${event.title.split(",")[1] || "-"}`
                                                : type === "Nursing" ? `Time: ${event.title.split(",")[1] || "-"}` :
                                                    type === "Diaper"
                                                        ? `Type: ${event.title.split(" ")[0] || "-"}`
                                                        : "-"}
                                        </td>
                                        <td>
                                            {event.start
                                                ? new Date(event.start).toLocaleString()
                                                : "-"}
                                        </td>
                                    </tr>
                                )

                            }


                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}