import React, { useState, useEffect } from "react";
// import { DateTime } from 'luxon';

// const timezones = [
//     "UTC",
//     "America/New_York",
//     "America/Los_Angeles",
//     "Europe/London",
//     "Europe/Berlin",
//     "Asia/Tokyo",
//     "Asia/Kolkata",
//     "Australia/Sydney"
// ];

const timezones = [
    { label: "UTC", offset: "+00:00" },
    { label: "GMT+1", offset: "+01:00" },
    { label: "GMT+2", offset: "+02:00" },
    { label: "GMT+3", offset: "+03:00" },
    { label: "EST", offset: "-05:00" },
    { label: "CST", offset: "-06:00" },
    { label: "MST", offset: "-07:00" },
    { label: "PST", offset: "-08:00" }
];

interface SimpleDateTimePickerProps {
    initialValue?: string;
    onChange?: (value: string) => void;
}
const getLocalOffsetString = () => {
    const offsetMinutes = new Date().getTimezoneOffset(); // in minutes
    const absMin = Math.abs(offsetMinutes);
    const sign = offsetMinutes <= 0 ? "+" : "-";
    const hours = String(Math.floor(absMin / 60)).padStart(2, "0");
    const mins = String(absMin % 60).padStart(2, "0");
    return `UTC${sign}${hours}:${mins}`;
};

export const SimpleDateTimePicker: React.FC<SimpleDateTimePickerProps> = ({
    initialValue,
    onChange
}) => {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [timezone, setTimezone] = useState(getLocalOffsetString());
    const [timezoneOffset, setTimezoneOffset] = useState(getLocalOffsetString());
    const [datetimeString, setDatetimeString] = useState("");

    useEffect(() => {
        if (initialValue) {
            // const dt = DateTime.fromISO(initialValue);
            const dt = Date.parse(`${initialValue}`)
            // if (dt) {
            // const newDate = dt.toISODate();
            const newDate = new Date(dt).toDateString();
            // const newTime = dt.toFormat("HH:mm");
            const newTime = new Date(dt).toTimeString();
            // const newTz = new Date(dt).getTimezoneOffset().toString();

            setDate(newDate);
            setTime(newTime);
            // setTimezone(newTz);
            // setTimezoneOffset(newTz)
            setDatetimeString(new Date(dt).toLocaleString());

            onChange?.(datetimeString);
            // }
        }
    }, [initialValue, datetimeString]);

    const updateDatetime = (newDate: string, newTime: string, tz: string) => {
        if (newDate && newTime && tz) {
            const dt = Date.parse(`${newDate}T${newTime}`).toLocaleString(); //.${tz}`);
            // const dt = DateTime.fromISO(`${newDate}T${newTime}`, { zone: tz });
            // if (dt) {
            // const iso = dt.toISO();
            // const iso = new Date(dt).toLocaleString()
            setDatetimeString(dt);
            onChange?.(dt); // call parent's onChange
            // }
        }
    };

    return (
        <div className="container mt-3">
            <div className="row g-3 align-items-center">
                <div className="col-auto">
                    <label className="col-form-label">Date:</label>
                </div>
                <div className="col-auto">
                    <input
                        type="date"
                        className="form-control"
                        value={date}
                        onChange={(e) => {
                            const val = e.target.value;
                            setDate(val);
                            updateDatetime(val, time, timezone);
                        }}
                    />
                </div>

                <div className="col-auto">
                    <label className="col-form-label">Time:</label>
                </div>
                <div className="col-auto">
                    <input
                        type="time"
                        className="form-control"
                        value={time}
                        onChange={(e) => {
                            const val = e.target.value;
                            setTime(val);
                            updateDatetime(date, val, timezone);
                        }}
                    />
                </div>

                {/* <div className="col-auto">
                    <label className="col-form-label">Timezone:</label>
                </div> */}
                {/* <div className="col-auto">
                    <select
                        className="form-select"
                        value={timezone}
                        onChange={(e) => {
                            const val = e.target.value;
                            setTimezone(val);
                            updateDatetime(date, time, val);
                        }}
                    >
                        {timezones.map((tz) => (
                            <option key={tz.offset} value={tz.offset}>
                                {tz.label}
                            </option>
                        ))}
                    </select>
                </div> */}
            </div>

            <div className="mt-4">
                <strong>Stored datetime string:</strong>
                <pre>{datetimeString}</pre>
            </div>
        </div>
    );
};

export default SimpleDateTimePicker;
