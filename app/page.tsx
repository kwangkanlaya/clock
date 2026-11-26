
"use client";

import { useEffect, useState } from "react";

type Alarm = {
  id: number;
  time: string;
  label: string;
  enabled: boolean;
  days: string[];
};

type Tab = "world" | "alarm" | "stopwatch" | "timer";

const dayNames = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export default function Home() {
  const [tab, setTab] = useState<Tab>("alarm");
  const [now, setNow] = useState(new Date());

  const [alarms, setAlarms] = useState<Alarm[]>([
    {
      id: 1,
      time: "05:45",
      label: "ตื่นนอน",
      enabled: true,
      days: ["จ.", "อ.", "พ.", "พฤ.", "ศ."],
    },
    {
      id: 2,
      time: "05:50",
      label: "เตือนสำรอง",
      enabled: false,
      days: ["จ.", "อ.", "พ.", "พฤ.", "ศ."],
    },
  ]);

  const [editing, setEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newTime, setNewTime] = useState("06:00");
  const [newLabel, setNewLabel] = useState("");
  const [newDays, setNewDays] = useState<string[]>(dayNames);

  const [stopwatch, setStopwatch] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);

  const [timerInput, setTimerInput] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!stopwatchRunning) return;

    const interval = setInterval(() => {
      setStopwatch((value) => value + 10);
    }, 10);

    return () => clearInterval(interval);
  }, [stopwatchRunning]);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((value) => {
        if (value <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  const timeNow = new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);

  const dateNow = new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const toggleAlarm = (id: number) => {
    setAlarms((items) =>
      items.map((alarm) =>
        alarm.id === id
          ? { ...alarm, enabled: !alarm.enabled }
          : alarm
      )
    );
  };

  const addAlarm = () => {
    if (!newTime) return;

    setAlarms((items) => [
      ...items,
      {
        id: Date.now(),
        time: newTime,
        label: newLabel.trim() || "นาฬิกาปลุก",
        enabled: true,
        days: newDays,
      },
    ]);

    setNewTime("06:00");
    setNewLabel("");
    setNewDays(dayNames);
    setShowAdd(false);
  };

  const deleteAlarm = (id: number) => {
    setAlarms((items) => items.filter((alarm) => alarm.id !== id));
  };

  const toggleDay = (day: string) => {
    setNewDays((days) =>
      days.includes(day)
        ? days.filter((item) => item !== day)
        : [...days, day]
    );
  };

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    return `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  };

  const getCityTime = (zone: string) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(now);

  return (
    <main className="phone-app">
      <div className="app-content">

        {/* HEADER */}
        <header className="top-header">
          <div className="brand">
            <div className="brand-icon">T</div>
            <div>
              <div className="brand-name">TIMELESS</div>
              <div className="brand-subtitle">
                YOUR DAILY COMPANION
              </div>
            </div>
          </div>

          <div className="header-date">
            {dateNow}
          </div>
        </header>

        {/* ALARM PAGE */}
        {tab === "alarm" && (
          <section className="screen">
            <div className="page-toolbar">
              <div>
                <span className="eyebrow">YOUR DAILY ROUTINE</span>
                <h1>นาฬิกาปลุก</h1>
              </div>

              <div className="toolbar-actions">
                <button
                  className={`edit-button ${editing ? "selected" : ""}`}
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? "เสร็จสิ้น" : "แก้ไข"}
                </button>

                <button
                  className="add-button"
                  onClick={() => setShowAdd(true)}
                  aria-label="เพิ่มนาฬิกาปลุก"
                >
                  +
                </button>
              </div>
            </div>

            <div className="sleep-card">
              <div className="sleep-icon">☾</div>

              <div className="sleep-info">
                <strong>นอนหลับ | ตื่นนอน</strong>
                <span>จัดตารางการพักผ่อนของคุณ</span>
              </div>

              <span className="sleep-arrow">›</span>
            </div>

            <div className="sleep-summary">
              <div>
                <span className="muted-text">
                  กำหนดเวลานอน
                </span>
                <strong>ไม่มีการตั้งปลุก</strong>
              </div>

              <button
                className="configure-button"
                onClick={() => setShowAdd(true)}
              >
                ตั้งค่า
              </button>
            </div>

            <div className="list-heading">
              <div>
                <span className="eyebrow">WAKE UP ON TIME</span>
                <h2>การตั้งปลุกอื่นๆ</h2>
              </div>

              <span className="alarm-count">
                {alarms.filter((a) => a.enabled).length} ACTIVE
              </span>
            </div>

            <div className="alarm-list">
              {alarms.length === 0 ? (
                <div className="empty-state">
                  <div>◷</div>
                  <p>ยังไม่มีนาฬิกาปลุก</p>
                  <span>กดปุ่ม + เพื่อเพิ่มเวลาปลุกของคุณ</span>
                </div>
              ) : (
                alarms.map((alarm) => (
                  <div
                    className={`alarm-row ${
                      alarm.enabled
                        ? "alarm-enabled"
                        : "alarm-disabled"
                    }`}
                    key={alarm.id}
                  >
                    <div className="alarm-details">
                      <div className="alarm-time">
                        {alarm.time}
                      </div>

                      <div className="alarm-label">
                        <span>{alarm.label}</span>
                        <span className="day-list">
                          {alarm.days.length
                            ? alarm.days.join(" ")
                            : "ครั้งเดียว"}
                        </span>
                      </div>
                    </div>

                    <div className="alarm-actions">
                      {editing && (
                        <button
                          className="delete-button"
                          onClick={() => deleteAlarm(alarm.id)}
                        >
                          ลบ
                        </button>
                      )}

                      <button
                        role="switch"
                        aria-checked={alarm.enabled}
                        aria-label={`เปิดหรือปิด ${alarm.label}`}
                        className={`switch ${
                          alarm.enabled ? "switch-on" : ""
                        }`}
                        onClick={() => toggleAlarm(alarm.id)}
                      >
                        <span />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* WORLD CLOCK */}
        {tab === "world" && (
          <section className="screen">
            <span className="eyebrow">GLOBAL TIME</span>
            <h1>นาฬิกาโลก</h1>

            <p className="page-description">
              เวลาปัจจุบันจากเมืองต่างๆ ทั่วโลก
            </p>

            <div className="world-main-card">
              <span>THAILAND · BANGKOK</span>

              <div className="world-main-time">
                {timeNow}
              </div>

              <strong>ประเทศไทย</strong>
              <p>{dateNow}</p>
              <span className="timezone-tag">GMT +7</span>
            </div>

            <h2 className="subheading">เมืองต่างๆ</h2>

            {[
              {
                name: "London",
                country: "สหราชอาณาจักร",
                zone: "Europe/London",
                flag: "🇬🇧",
              },
              {
                name: "Tokyo",
                country: "ญี่ปุ่น",
                zone: "Asia/Tokyo",
                flag: "🇯🇵",
              },
              {
                name: "New York",
                country: "สหรัฐอเมริกา",
                zone: "America/New_York",
                flag: "🇺🇸",
              },
              {
                name: "Singapore",
                country: "สิงคโปร์",
                zone: "Asia/Singapore",
                flag: "🇸🇬",
              },
            ].map((city) => (
              <div className="city-row" key={city.name}>
                <div className="city-flag">{city.flag}</div>

                <div className="city-info">
                  <strong>{city.name}</strong>
                  <span>{city.country}</span>
                </div>

                <div className="city-time">
                  {getCityTime(city.zone)}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* STOPWATCH */}
        {tab === "stopwatch" && (
          <section className="screen utility-screen">
            <span className="eyebrow">
              PRECISION TIMEKEEPING
            </span>

            <h1>นาฬิกาจับเวลา</h1>

            <p className="page-description">
              จับเวลาทุกช่วงเวลาสำคัญ
            </p>

            <div className="stopwatch-card">
              <div className="stopwatch-ring">
                <div className="stopwatch-value">
                  {formatStopwatch(stopwatch)}
                </div>
                <span>HOUR : MIN : SEC</span>
              </div>

              <div className="utility-buttons">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setStopwatchRunning(false);
                    setStopwatch(0);
                  }}
                >
                  รีเซ็ต
                </button>

                <button
                  className="primary-button"
                  onClick={() =>
                    setStopwatchRunning(!stopwatchRunning)
                  }
                >
                  {stopwatchRunning
                    ? "หยุดชั่วคราว"
                    : "เริ่มจับเวลา"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TIMER */}
        {tab === "timer" && (
          <section className="screen utility-screen">
            <span className="eyebrow">COUNTDOWN TIMER</span>

            <h1>นาฬิกานับถอยหลัง</h1>

            <p className="page-description">
              กำหนดเวลาและเริ่มนับถอยหลัง
            </p>

            <div className="timer-card">
              <div className="timer-circle">
                <div className="timer-value">
                  {formatTimer(timerSeconds)}
                </div>
                <span>HOUR : MIN : SEC</span>
              </div>

              <div className="timer-input">
                <label htmlFor="timer-minutes">
                  กำหนดเวลา (นาที)
                </label>

                <input
                  id="timer-minutes"
                  type="number"
                  min="1"
                  max="999"
                  value={timerInput}
                  disabled={timerRunning}
                  onChange={(e) => {
                    const value = Math.max(
                      1,
                      Math.min(999, Number(e.target.value))
                    );

                    setTimerInput(value);
                    setTimerSeconds(value * 60);
                  }}
                />
              </div>

              <div className="utility-buttons">
                <button
                  className="secondary-button"
                  onClick={() => {
                    setTimerRunning(false);
                    setTimerSeconds(timerInput * 60);
                  }}
                >
                  รีเซ็ต
                </button>

                <button
                  className="primary-button"
                  disabled={timerSeconds === 0 && !timerRunning}
                  onClick={() => {
                    if (!timerRunning && timerSeconds === 0) {
                      setTimerSeconds(timerInput * 60);
                    }

                    setTimerRunning(!timerRunning);
                  }}
                >
                  {timerRunning
                    ? "หยุดชั่วคราว"
                    : "เริ่มนับถอยหลัง"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="app-footer">
          <span>TIMELESS</span>
          <span>MAKE EVERY SECOND COUNT ✦</span>
        </footer>
      </div>

      {/* ADD ALARM MODAL */}
      {showAdd && (
        <div
          className="modal-overlay"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="alarm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">
                  CREATE NEW ALARM
                </span>
                <h2>เพิ่มนาฬิกาปลุก</h2>
              </div>

              <button
                className="close-modal"
                onClick={() => setShowAdd(false)}
              >
                ×
              </button>
            </div>

            <label htmlFor="alarm-time">เลือกเวลา</label>

            <input
              id="alarm-time"
              className="time-input"
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />

            <label htmlFor="alarm-label">ชื่อการปลุก</label>

            <input
              id="alarm-label"
              className="text-input"
              placeholder="เช่น ตื่นนอน, ไปเรียน"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />

            <label>ทำซ้ำในวัน</label>

            <div className="day-picker">
              {dayNames.map((day) => (
                <button
                  key={day}
                  className={
                    newDays.includes(day)
                      ? "day active-day"
                      : "day"
                  }
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>

            <button
              className="save-alarm-button"
              onClick={addAlarm}
            >
              บันทึกนาฬิกาปลุก
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM NAVIGATION */}
      <nav className="bottom-navigation">
        <button
          className={
            tab === "world" ? "nav-button active-nav" : "nav-button"
          }
          onClick={() => setTab("world")}
        >
          <span className="nav-icon">◎</span>
          <span>นาฬิกาโลก</span>
        </button>

        <button
          className={
            tab === "alarm" ? "nav-button active-nav" : "nav-button"
          }
          onClick={() => setTab("alarm")}
        >
          <span className="nav-icon">◷</span>
          <span>นาฬิกาปลุก</span>
        </button>

        <button
          className={
            tab === "stopwatch"
              ? "nav-button active-nav"
              : "nav-button"
          }
          onClick={() => setTab("stopwatch")}
        >
          <span className="nav-icon">⏱</span>
          <span>จับเวลา</span>
        </button>

        <button
          className={
            tab === "timer" ? "nav-button active-nav" : "nav-button"
          }
          onClick={() => setTab("timer")}
        >
          <span className="nav-icon">◴</span>
          <span>นับถอยหลัง</span>
        </button>
      </nav>
    </main>
  );
}
