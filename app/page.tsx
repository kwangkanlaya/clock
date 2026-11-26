
"use client";

import { useEffect, useMemo, useState } from "react";

type WeatherData = {
  temperature: number;
  windspeed: number;
  code: number;
};

const weatherDescriptions: Record<number, string> = {
  0: "ท้องฟ้าแจ่มใส",
  1: "ท้องฟ้าโปร่ง",
  2: "มีเมฆบางส่วน",
  3: "มีเมฆมาก",
  45: "มีหมอก",
  48: "มีหมอกหนา",
  51: "ฝนปรอยเล็กน้อย",
  53: "ฝนปรอย",
  55: "ฝนปรอยหนัก",
  61: "ฝนตกเล็กน้อย",
  63: "ฝนตกปานกลาง",
  65: "ฝนตกหนัก",
  71: "หิมะตกเล็กน้อย",
  80: "มีฝนตกเป็นช่วง",
  81: "ฝนตกเป็นช่วง",
  82: "ฝนตกหนักเป็นช่วง",
  95: "มีพายุฝนฟ้าคะนอง",
};

function getWeatherIcon(code: number) {
  if (code === 0 || code === 1) return "☀️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code >= 45 && code <= 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}

const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
  "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
  "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const thaiDays = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export default function Home() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState("");
  const [monthDate, setMonthDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("home");
  const [lightMode, setLightMode] = useState(false);

  const [stopwatch, setStopwatch] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setStopwatch((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather(latitude: number, longitude: number) {
      try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");
        url.search = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          current: "temperature_2m,wind_speed_10m,weather_code",
          timezone: "Asia/Bangkok",
        }).toString();

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("ไม่สามารถโหลดข้อมูลอากาศได้");

        const data = await response.json();
        if (cancelled) return;

        setWeather({
          temperature: data.current.temperature_2m,
          windspeed: data.current.wind_speed_10m,
          code: data.current.weather_code,
        });
        setWeatherError("");
      } catch {
        if (!cancelled) setWeatherError("ไม่สามารถโหลดข้อมูลสภาพอากาศได้");
      }
    }

    const defaultLocation = () => loadWeather(17.0078, 99.8230);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          loadWeather(position.coords.latitude, position.coords.longitude),
        defaultLocation,
        { timeout: 5000 }
      );
    } else {
      defaultLocation();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const dateText = new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const timeText = now.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const dayProgress = useMemo(() => {
    const seconds =
      now.getHours() * 3600 +
      now.getMinutes() * 60 +
      now.getSeconds();
    return (seconds / 86400) * 100;
  }, [now]);

  const calendarCells = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
  }, [monthDate]);

  const stopwatchText = [
    Math.floor(stopwatch / 3600),
    Math.floor((stopwatch % 3600) / 60),
    stopwatch % 60,
  ]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");

  function scrollToSection(section: string) {
    setActiveTab(section);
    const element = document.getElementById(section);
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function changeMonth(amount: number) {
    setMonthDate(
      new Date(monthDate.getFullYear(), monthDate.getMonth() + amount, 1)
    );
  }

  return (
    <main className={`app-shell ${lightMode ? "light-mode" : ""}`}>
      <div className="app-container">
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">T</div>
            <div>
              <div className="brand-name">TIMELESS</div>
              <div className="brand-caption">YOUR DAILY COMPANION</div>
            </div>
          </div>

          <button
            className="theme-button"
            onClick={() => setLightMode(!lightMode)}
            aria-label="เปลี่ยนธีม"
          >
            {lightMode ? "☾" : "☼"}
          </button>
        </header>

        <section className="welcome-section" id="home">
          <div className="eyebrow">WELCOME BACK</div>
          <h1>ช่วงเวลาดี ๆ <span>เริ่มต้นที่นี่</span></h1>
          <p>จัดการทุกช่วงเวลาของคุณให้ง่ายและมีสไตล์</p>
        </section>

        <section className="clock-card">
          <div className="card-topline">
            <span>เวลาปัจจุบัน</span>
            <span className="live-indicator"><i /> LIVE</span>
          </div>

          <div className="clock-time">{timeText}</div>
          <div className="clock-date">{dateText}</div>

          <div className="clock-divider" />

          <div className="clock-footer">
            <span>THAILAND · GMT+7</span>
            <span className="clock-decoration">✦ TIME IS PRECIOUS</span>
          </div>
        </section>

        <section className="section-block" id="weather">
          <div className="section-heading">
            <div>
              <div className="eyebrow">WEATHER TODAY</div>
              <h2>สภาพอากาศ</h2>
            </div>
            <span className="section-symbol">✧</span>
          </div>

          <div className="weather-card">
            <div className="weather-main">
              <div>
                <div className="weather-location">ตำแหน่งปัจจุบัน / สุโขทัย</div>
                {weather ? (
                  <>
                    <div className="temperature">
                      {Math.round(weather.temperature)}<span>°C</span>
                    </div>
                    <div className="weather-description">
                      {weatherDescriptions[weather.code] ?? "สภาพอากาศปัจจุบัน"}
                    </div>
                  </>
                ) : (
                  <div className="weather-description">
                    {weatherError || "กำลังโหลดข้อมูลสภาพอากาศ..."}
                  </div>
                )}
              </div>
              <div className="weather-icon">
                {weather ? getWeatherIcon(weather.code) : "🌤️"}
              </div>
            </div>

            <div className="weather-bottom">
              <div className="weather-detail">
                <span>♧</span>
                <div>
                  <small>ความเร็วลม</small>
                  <strong>{weather ? `${weather.windspeed} km/h` : "--"}</strong>
                </div>
              </div>
              <div className="weather-detail">
                <span>◷</span>
                <div>
                  <small>อัปเดต</small>
                  <strong>ข้อมูลปัจจุบัน</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-block" id="calendar">
          <div className="section-heading">
            <div>
              <div className="eyebrow">PLAN YOUR DAYS</div>
              <h2>ปฏิทินของฉัน</h2>
            </div>
            <span className="section-symbol">▦</span>
          </div>

          <div className="calendar-card">
            <div className="calendar-header">
              <div>
                <strong>{thaiMonths[monthDate.getMonth()]}</strong>
                <span>{monthDate.getFullYear() + 543}</span>
              </div>
              <div className="calendar-controls">
                <button onClick={() => changeMonth(-1)} aria-label="เดือนก่อน">‹</button>
                <button onClick={() => changeMonth(1)} aria-label="เดือนถัดไป">›</button>
              </div>
            </div>

            <div className="calendar-grid">
              {thaiDays.map((day) => (
                <div className="calendar-weekday" key={day}>{day}</div>
              ))}

              {calendarCells.map((day, index) => {
                const isToday =
                  day === now.getDate() &&
                  monthDate.getMonth() === now.getMonth() &&
                  monthDate.getFullYear() === now.getFullYear();

                return (
                  <div
                    key={`${day ?? "empty"}-${index}`}
                    className={`calendar-day ${isToday ? "today" : ""} ${day ? "" : "empty"}`}
                  >
                    {day ?? ""}
                  </div>
                );
              })}
            </div>

            <div className="calendar-note">
              <span className="today-dot" />
              วันนี้ · {now.getDate()} {thaiMonths[now.getMonth()]}
            </div>
          </div>
        </section>

        <section className="section-block" id="stopwatch">
          <div className="section-heading">
            <div>
              <div className="eyebrow">TRACK YOUR TIME</div>
              <h2>นาฬิกาจับเวลา</h2>
            </div>
            <span className="section-symbol">◷</span>
          </div>

          <div className="stopwatch-card">
            <div className="stopwatch-label">STOPWATCH</div>
            <div className="stopwatch-display">{stopwatchText}</div>
            <div className="stopwatch-actions">
              <button
                className="stopwatch-primary"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? "หยุดชั่วคราว" : "เริ่มจับเวลา"}
              </button>
              <button
                className="stopwatch-secondary"
                onClick={() => {
                  setIsRunning(false);
                  setStopwatch(0);
                }}
              >
                รีเซ็ต
              </button>
            </div>
            <div className={`stopwatch-status ${isRunning ? "running" : ""}`}>
              <i /> {isRunning ? "กำลังจับเวลา" : "พร้อมใช้งาน"}
            </div>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <div>
              <div className="eyebrow">YOUR DAILY PROGRESS</div>
              <h2>เวลาของวันนี้</h2>
            </div>
            <span className="section-symbol">✦</span>
          </div>

          <div className="progress-card">
            <div className="progress-top">
              <div>
                <span>ผ่านไปแล้ว</span>
                <strong>{dayProgress.toFixed(1)}%</strong>
              </div>
              <div className="progress-sun">☀</div>
            </div>
            <div className="progress-track">
              <div style={{ width: `${dayProgress}%` }} />
            </div>
            <div className="progress-caption">
              <span>00:00</span>
              <span>24:00</span>
            </div>
            <p>ทุกวินาทีมีค่า ใช้วันนี้ให้ดีที่สุด</p>
          </div>
        </section>

        <section className="quote-card">
          <div className="quote-mark">“</div>
          <p>เวลาเป็นสิ่งมีค่า จงใช้ทุกช่วงเวลาให้มีความหมาย</p>
          <span>MAKE EVERY MOMENT COUNT</span>
        </section>

        <footer className="app-footer">
          <div className="footer-logo">TIMELESS</div>
          <p>Designed for your beautiful moments</p>
          <span>© {now.getFullYear()} TIMELESS</span>
        </footer>
      </div>

      <nav className="bottom-nav" aria-label="เมนูหลัก">
        <button
          className={activeTab === "home" ? "active" : ""}
          onClick={() => scrollToSection("home")}
        >
          <span>⌂</span><small>หน้าหลัก</small>
        </button>
        <button
          className={activeTab === "calendar" ? "active" : ""}
          onClick={() => scrollToSection("calendar")}
        >
          <span>▦</span><small>ปฏิทิน</small>
        </button>
        <button
          className={activeTab === "stopwatch" ? "active" : ""}
          onClick={() => scrollToSection("stopwatch")}
        >
          <span>◷</span><small>จับเวลา</small>
        </button>
        <button
          className={activeTab === "weather" ? "active" : ""}
          onClick={() => scrollToSection("weather")}
        >
          <span>☼</span><small>อากาศ</small>
        </button>
      </nav>
    </main>
  );
}
