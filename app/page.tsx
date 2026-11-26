
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type WeatherInfo = {
  temperature: number;
  humidity: number;
  wind: number;
  description: string;
  icon: string;
};

const DAYS = [
  "วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ",
  "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์",
];

const MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "ท้องฟ้าแจ่มใส", icon: "☀️" },
  1: { description: "มีเมฆเล็กน้อย", icon: "🌤️" },
  2: { description: "มีเมฆบางส่วน", icon: "⛅" },
  3: { description: "มีเมฆมาก", icon: "☁️" },
  45: { description: "มีหมอก", icon: "🌫️" },
  48: { description: "มีหมอก", icon: "🌫️" },
  51: { description: "ฝนปรอยเล็กน้อย", icon: "🌦️" },
  53: { description: "ฝนปรอยปานกลาง", icon: "🌦️" },
  55: { description: "ฝนปรอยหนาแน่น", icon: "🌧️" },
  61: { description: "ฝนตกเล็กน้อย", icon: "🌦️" },
  63: { description: "ฝนตกปานกลาง", icon: "🌧️" },
  65: { description: "ฝนตกหนัก", icon: "🌧️" },
  80: { description: "ฝนตกเป็นช่วง", icon: "🌦️" },
  81: { description: "ฝนตกเป็นช่วงปานกลาง", icon: "🌧️" },
  82: { description: "ฝนตกหนักเป็นช่วง", icon: "⛈️" },
  95: { description: "พายุฝนฟ้าคะนอง", icon: "⛈️" },
  96: { description: "พายุฝนฟ้าคะนอง", icon: "⛈️" },
  99: { description: "พายุฝนฟ้าคะนองรุนแรง", icon: "⛈️" },
};

const pad = (n: number) => String(n).padStart(2, "0");

function formatStopwatch(ms: number) {
  const cs = Math.floor(ms / 10) % 100;
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return hours > 0
    ? `${pad(hours)}:${pad(remainingMinutes)}:${pad(seconds)}.${pad(cs)}`
    : `${pad(remainingMinutes)}:${pad(seconds)}.${pad(cs)}`;
}

export default function HomePage() {
  const [now, setNow] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date | null>(null);
  const [isLight, setIsLight] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherStatus, setWeatherStatus] = useState("กำลังโหลดข้อมูล...");

  const [running, setRunning] = useState(false);
  const [stopwatchMs, setStopwatchMs] = useState(0);

  const stopwatchStartRef = useRef(0);
  const stopwatchElapsedRef = useRef(0);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    setCalendarMonth(new Date());

    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!running) return;

    stopwatchStartRef.current = Date.now();

    const timer = window.setInterval(() => {
      setStopwatchMs(
        stopwatchElapsedRef.current +
          Date.now() -
          stopwatchStartRef.current,
      );
    }, 30);

    return () => window.clearInterval(timer);
  }, [running]);

  const loadWeather = useCallback(
    async (
      latitude = 17.0078,
      longitude = 99.823,
      place = "สุโขทัย",
    ) => {
      setWeatherStatus(`กำลังโหลดข้อมูล ${place}`);

      try {
        const params = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          current:
            "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
          timezone: "Asia/Bangkok",
        });

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params}`,
          { cache: "no-store" },
        );

        if (!response.ok) throw new Error("Weather error");

        const result = await response.json();
        const current = result.current;
        const info = WEATHER_CODES[Number(current.weather_code)] ?? {
          description: "ไม่ทราบสภาพอากาศ",
          icon: "🌡️",
        };

        setWeather({
          temperature: Math.round(Number(current.temperature_2m)),
          humidity: Number(current.relative_humidity_2m),
          wind: Math.round(Number(current.wind_speed_10m)),
          description: info.description,
          icon: info.icon,
        });

        setWeatherStatus(
          `อัปเดต ${new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
        );
      } catch {
        setWeatherStatus("ไม่สามารถโหลดข้อมูลได้ กรุณาตรวจสอบอินเทอร์เน็ต");
      }
    },
    [],
  );

  useEffect(() => {
    void loadWeather();

    const refresh = window.setInterval(
      () => void loadWeather(),
      15 * 60 * 1000,
    );

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          void loadWeather(
            position.coords.latitude,
            position.coords.longitude,
            "ตำแหน่งของคุณ",
          );
        },
        () => {},
        { timeout: 5000 },
      );
    }

    return () => window.clearInterval(refresh);
  }, [loadWeather]);

  const calendarCells = useMemo(() => {
    if (!calendarMonth) return [];

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const first = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    const previous = new Date(year, month, 0).getDate();

    return Array.from({ length: 42 }, (_, index) => {
      if (index < first) {
        return {
          day: previous - first + index + 1,
          muted: true,
          key: `p${index}`,
          today: false,
        };
      }

      if (index >= first + total) {
        return {
          day: index - first - total + 1,
          muted: true,
          key: `n${index}`,
          today: false,
        };
      }

      const day = index - first + 1;
      const date = now ?? new Date();

      return {
        day,
        muted: false,
        key: `d${day}`,
        today:
          day === date.getDate() &&
          month === date.getMonth() &&
          year === date.getFullYear(),
      };
    });
  }, [calendarMonth, now]);

  const changeMonth = (amount: number) => {
    setCalendarMonth((current) => {
      if (!current) return new Date();

      return new Date(
        current.getFullYear(),
        current.getMonth() + amount,
        1,
      );
    });
  };

  const toggleStopwatch = () => {
    if (running) {
      const total =
        stopwatchElapsedRef.current +
        Date.now() -
        stopwatchStartRef.current;

      stopwatchElapsedRef.current = total;
      setStopwatchMs(total);
      setRunning(false);
    } else {
      setRunning(true);
    }
  };

  const resetStopwatch = () => {
    setRunning(false);
    stopwatchElapsedRef.current = 0;
    stopwatchStartRef.current = 0;
    setStopwatchMs(0);
  };

  if (!now) {
    return (
      <main className="app-background">
        <div className="loading-screen">กำลังเตรียมแอปพลิเคชัน...</div>
      </main>
    );
  }

  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();

  const progress =
    ((hour * 3600 + minute * 60 + second) / 86400) * 100;

  return (
    <main className={`app-background ${isLight ? "light" : ""}`}>
      <div className="mobile-app">

        <header className="app-header">
          <div className="app-brand">
            <div className="app-logo">◷</div>
            <div>
              <h1>TIMELESS</h1>
              <p>YOUR PERSONAL SPACE</p>
            </div>
          </div>

          <button
            className="theme-toggle"
            onClick={() => setIsLight((v) => !v)}
            type="button"
            aria-label="เปลี่ยนธีม"
          >
            {isLight ? "☾" : "☼"}
          </button>
        </header>

        <section className="welcome-section">
          <div>
            <span className="eyebrow">WELCOME BACK</span>
            <h2>สวัสดี วันนี้เป็นอย่างไรบ้าง?</h2>
            <p>{DAYS[now.getDay()]}ที่ {now.getDate()} {MONTHS[now.getMonth()]} {now.getFullYear() + 543}</p>
          </div>
          <span className="welcome-sparkle">✦</span>
        </section>

        <section className="hero-clock">
          <div className="hero-clock-top">
            <span><i className="live-dot" /> LIVE CLOCK</span>
            <span>THAILAND · GMT+7</span>
          </div>

          <div className="hero-time">
            {pad(hour)}<span>:</span>{pad(minute)}
          </div>

          <div className="hero-seconds">
            {pad(second)} SECONDS
          </div>

          <div className="hero-date">
            {DAYS[now.getDay()]} · {now.getDate()} {MONTHS[now.getMonth()]} {now.getFullYear() + 543}
          </div>

          <div className="hero-decoration">✧</div>
        </section>

        <section className="weather-card">
          <div className="card-title">
            <div>
              <span className="eyebrow">LIVE WEATHER</span>
              <h3>สภาพอากาศ</h3>
            </div>
            <span className="weather-symbol">{weather?.icon ?? "☁️"}</span>
          </div>

          {weather ? (
            <>
              <div className="weather-main">
                <div className="weather-temperature">
                  {weather.temperature}<span>°C</span>
                </div>
                <div className="weather-description">
                  {weather.description}
                  <small>อุณหภูมิปัจจุบัน</small>
                </div>
              </div>

              <div className="weather-details">
                <div>
                  <span>💧</span>
                  <div><small>ความชื้น</small><b>{weather.humidity}%</b></div>
                </div>
                <div>
                  <span>💨</span>
                  <div><small>ความเร็วลม</small><b>{weather.wind} กม./ชม.</b></div>
                </div>
              </div>
            </>
          ) : (
            <p className="weather-loading">กำลังโหลดสภาพอากาศ...</p>
          )}

          <div className="weather-status">{weatherStatus}</div>
        </section>

        <section className="section-title">
          <div>
            <span className="eyebrow">YOUR TOOLS</span>
            <h2>เครื่องมือของคุณ</h2>
          </div>
          <span className="section-star">✦</span>
        </section>

        <section className="tool-grid">
          <article className="tool-card calendar-card">
            <div className="tool-heading">
              <span className="tool-icon">▦</span>
              <span>ปฏิทิน</span>
            </div>

            <div className="calendar-month">
              <strong>
                {calendarMonth
                  ? `${MONTHS[calendarMonth.getMonth()]} ${calendarMonth.getFullYear() + 543}`
                  : ""}
              </strong>
              <div className="calendar-controls">
                <button type="button" onClick={() => changeMonth(-1)}>‹</button>
                <button type="button" onClick={() => changeMonth(1)}>›</button>
              </div>
            </div>

            <div className="calendar-grid">
              {WEEKDAYS.map((day) => (
                <span className="weekday" key={day}>{day}</span>
              ))}
              {calendarCells.map((cell) => (
                <span
                  key={cell.key}
                  className={`calendar-day ${cell.muted ? "muted" : ""} ${cell.today ? "today" : ""}`}
                >
                  {cell.day}
                </span>
              ))}
            </div>
          </article>

          <article className="tool-card stopwatch-card">
            <div className="tool-heading">
              <span className="tool-icon">◷</span>
              <span>นาฬิกาจับเวลา</span>
            </div>

            <div className="stopwatch-display">
              {formatStopwatch(stopwatchMs)}
            </div>

            <div className="stopwatch-caption">
              {running ? "กำลังจับเวลา..." : "พร้อมเริ่มต้น"}
            </div>

            <div className="stopwatch-actions">
              <button
                className="start-button"
                type="button"
                onClick={toggleStopwatch}
              >
                {running ? "หยุด" : "เริ่ม"}
              </button>
              <button
                className="reset-button"
                type="button"
                onClick={resetStopwatch}
              >
                รีเซ็ต
              </button>
            </div>
          </article>
        </section>

        <section className="daily-card">
          <div className="card-title">
            <div>
              <span className="eyebrow">DAILY OVERVIEW</span>
              <h3>ความคืบหน้าของวันนี้</h3>
            </div>
            <span className="daily-icon">✧</span>
          </div>

          <div className="daily-progress-heading">
            <strong>{progress.toFixed(1)}%</strong>
            <span>ผ่านไปแล้ว</span>
          </div>

          <div className="progress-track">
            <div style={{ width: `${progress}%` }} />
          </div>

          <div className="daily-times">
            <span>00:00</span>
            <span>24:00</span>
          </div>
        </section>

        <section className="quote-card">
          <span className="quote-mark">“</span>
          <p>ทุกช่วงเวลามีคุณค่า จงใช้ทุกวันให้ดีที่สุด</p>
          <span className="quote-en">MAKE EVERY MOMENT COUNT</span>
        </section>

        <footer className="app-footer">
          <span>TIMELESS</span>
          <span>DESIGNED FOR YOUR DAY ✦</span>
        </footer>

        <nav className="bottom-nav">
          <button
            type="button"
            className={activeTab === "home" ? "active" : ""}
            onClick={() => setActiveTab("home")}
          >
            <span>⌂</span>
            <small>หน้าหลัก</small>
          </button>

          <button
            type="button"
            className={activeTab === "calendar" ? "active" : ""}
            onClick={() => {
              setActiveTab("calendar");
              document.getElementById("calendar-placeholder")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span>▦</span>
            <small>ปฏิทิน</small>
          </button>

          <button
            type="button"
            className={activeTab === "timer" ? "active" : ""}
            onClick={() => {
              setActiveTab("timer");
              document.querySelector(".stopwatch-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <span>◷</span>
            <small>จับเวลา</small>
          </button>

          <button
            type="button"
            className={activeTab === "weather" ? "active" : ""}
            onClick={() => {
              setActiveTab("weather");
              document.querySelector(".weather-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <span>☁</span>
            <small>อากาศ</small>
          </button>
        </nav>
      </div>
    </main>
  );
}
