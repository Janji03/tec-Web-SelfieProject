import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { RRule, rrulestr } from "rrule";
import { Link } from "react-router-dom";

import "../../../styles/EventInfo.css";
import { getUser } from "../../../services/userService";

const EventInfo = ({
  selectedEvent,
  selectedOccurrence,
  handleEditEvent,
  handleDeleteEvent,
}) => {
  const [invitedUsers, setInvitedUsers] = useState([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (
        selectedEvent.extendedProps.invitedUsers &&
        selectedEvent.extendedProps.invitedUsers.length > 0
      ) {
        const users = await Promise.all(
          selectedEvent.extendedProps.invitedUsers.map(async (invite) => {
            const user = await getUser(invite.userID);
            return user
              ? {
                  name: user.name,
                  email: user.email,
                  status: invite.status,
                }
              : null;
          })
        );
        setInvitedUsers(users.filter((user) => user));
      }
    };

    fetchParticipants();
  }, [selectedEvent, getUser]);

  const start = selectedEvent.start;
  const end = selectedEvent.end;

  const timeOptions = {
    0: "At the time of the event",
    5: "5 minutes before",
    10: "10 minutes before",
    15: "15 minutes before",
    30: "30 minutes before",
    60: "1 hour before",
    120: "2 hours before",
    1440: "1 day before",
    2880: "2 days before",
    10080: "1 week before",
  };

  const getRecurrenceSummary = (rruleString) => {
    try {
      const rule = rrulestr(rruleString);
      const options = rule.origOptions;
      let summary = "";

      const fullDayNames = {
        MO: "Monday",
        TU: "Tuesday",
        WE: "Wednesday",
        TH: "Thursday",
        FR: "Friday",
        SA: "Saturday",
        SU: "Sunday",
      };

      const fullMonthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      if (options.interval && options.interval > 1) {
        switch (options.freq) {
          case RRule.DAILY:
            summary += `Every ${options.interval} days`;
            break;
          case RRule.WEEKLY:
            summary += `Every ${options.interval} weeks`;
            break;
          case RRule.MONTHLY:
            summary += `Every ${options.interval} months`;
            break;
          case RRule.YEARLY:
            summary += `Every ${options.interval} years`;
            break;
          default:
            summary += `Custom`;
        }
      } else {
        switch (options.freq) {
          case RRule.DAILY:
            summary += `Daily`;
            break;
          case RRule.WEEKLY:
            summary += `Weekly`;
            break;
          case RRule.MONTHLY:
            summary += `Monthly`;
            break;
          case RRule.YEARLY:
            summary += `Yearly`;
            break;
          default:
            summary += `Custom`;
        }
      }

      if (options.byweekday) {
        const weekdayOrder = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
        const ordinals = [
          "first",
          "second",
          "third",
          "fourth",
          "fifth",
          "last",
        ];

        let ordinal;

        const days = options.byweekday
          .sort(
            (a, b) =>
              weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday)
          )
          .map((day) => {
            const dayName = fullDayNames[day.toString().slice(-2)];
            ordinal = day.n ? ordinals[day.n > 0 ? day.n - 1 : 5] : "";
            return ordinal ? `the ${ordinal} ${dayName}` : dayName;
          });

        const isWeekdayPattern =
          days.length === 5 &&
          ["MO", "TU", "WE", "TH", "FR"].every((d) =>
            days.some((day) => day.includes(fullDayNames[d]))
          );
        const isWeekendPattern =
          days.length === 2 &&
          ["SA", "SU"].every((d) =>
            days.some((day) => day.includes(fullDayNames[d]))
          );

        if (isWeekdayPattern) {
          summary += ` on the ${ordinal} weekday`;
        } else if (isWeekendPattern) {
          summary += ` on the ${ordinal} weekend`;
        } else {
          summary += ` on ${days.join(", ")}`;
        }
      }

      if (options.bymonthday) {
        const monthDays = Array.isArray(options.bymonthday)
          ? options.bymonthday
          : [options.bymonthday];
        summary += ` on day ${monthDays.join(", ")}`;
      }

      if (options.freq === RRule.YEARLY && options.bymonth) {
        const months = options.bymonth
          .map((month) => fullMonthNames[month - 1])
          .join(", ");
        summary += ` in ${months}`;
      }

      if (options.until) {
        const endDate = DateTime.fromJSDate(options.until).toLocaleString(
          DateTime.DATE_FULL
        );
        summary += ` - repeat until ${endDate}`;
      } else if (options.count) {
        summary += ` - repeat ${options.count} times`;
      }

      return summary || "Custom recurrence";
    } catch (error) {
      console.error("Invalid RRULE string", error);
      return "Custom recurrence";
    }
  };

  return (
    <div className="event-info">
      <h2>{selectedEvent.title}</h2>

      <p>
        <strong>Start:</strong>{" "}
        {selectedEvent.allDay
          ? DateTime.fromISO(start, { zone: "UTC" })
              .setZone(selectedEvent.extendedProps.timeZone)
              .toLocaleString(DateTime.DATE_SHORT)
          : DateTime.fromISO(start, { zone: "UTC" })
              .setZone(selectedEvent.extendedProps.timeZone)
              .toLocaleString(DateTime.DATETIME_FULL)}
      </p>
      <p>
        <strong>End:</strong>{" "}
        {selectedEvent.allDay
          ? DateTime.fromISO(end, { zone: "UTC" })
              .setZone(selectedEvent.extendedProps.timeZone)
              .toLocaleString(DateTime.DATE_SHORT)
          : DateTime.fromISO(end, { zone: "UTC" })
              .setZone(selectedEvent.extendedProps.timeZone)
              .toLocaleString(DateTime.DATETIME_FULL)}
      </p>

      {selectedEvent.allDay && (
        <p className="all-day-indicator">
          <strong>All Day Event</strong>
        </p>
      )}

      {selectedEvent.extendedProps.location && (
        <p className="location">
          <strong>Location:</strong> {selectedEvent.extendedProps.location}
        </p>
      )}

      {selectedEvent.extendedProps.description && (
        <p className="description">
          <strong>Description:</strong>{" "}
          {selectedEvent.extendedProps.description}
        </p>
      )}

      {selectedEvent.rrule && (
        <p className="recurrence">
          <strong>Repeats:</strong> {getRecurrenceSummary(selectedEvent.rrule)}
        </p>
      )}

      {/* Invited Users Section */}
      {invitedUsers.length > 0 && (
        <div className="invited-users-container">
          <h3>Invited Users:</h3>
          <ul>
            {invitedUsers.map((user, index) => (
              <li key={index} className="invited-user-item">
                <div className="user-details">
                  <div>
                    <strong>{user.name}</strong>
                    <div className="user-email">{user.email}</div>{" "}
                  </div>
                </div>
                <div className={`status ${user.status.toLowerCase()}`}>
                  {user.status}
                </div>{" "}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notifications Section */}
      {selectedEvent.extendedProps.notifications.length > 0 && (
        <div className="notifications-container">
          <h3>Notifications:</h3>
          <ul>
            {selectedEvent.extendedProps.notifications.map(
              (notification, index) => (
                <li key={index} className="notification">
                  <strong>{timeOptions[notification.timeBefore]}</strong>
                </li>
              )
            )}
          </ul>
        </div>
      )}

      {selectedEvent.extendedProps.timeZone && (
        <p className="timezone">
          <strong>Time Zone:</strong> {selectedEvent.extendedProps.timeZone}
        </p>
      )}

      <div className="action-buttons">
        <button className="edit" onClick={handleEditEvent}>
          Edit Event
        </button>

        <button className="delete" onClick={() => handleDeleteEvent(null)}>
          Delete Event
        </button>

        {selectedEvent.rrule && (
          <button
            className="delete-single"
            onClick={() => handleDeleteEvent(selectedOccurrence)}
          >
            Delete Single Instance
          </button>
        )}

        {selectedEvent.extendedProps.isPomodoro && (
          <div>
            <button>
              <Link
                to="/pomodoro"
                state={{
                  id: selectedEvent.id,
                  title: selectedEvent.title,
                  pomodoroSettings:
                    selectedEvent.extendedProps.pomodoroSettings,
                  selectedEvent: selectedEvent,
                }}
              >
                Vai al Pomodoro
              </Link>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventInfo;
