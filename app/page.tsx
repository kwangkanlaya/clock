
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type WeatherInfo = {
  temperature: number;
  humidity: number;
  wind: number;
  description: string;
  icon: string;
  updatedAt: string;
};

const THAI_DAYS = [
  "วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ",
  "วันพฤหัสบดี", "วันศุกร์", "วันเสาร์",
];

const THAI_MONTHS = [
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
  71: { description: "หิมะตกเล็กน้อย", icon: "🌨️" },
  73: { description: "หิมะตกปานกลาง", icon: "🌨️" },
  75: { description: "หิมะตกหนัก", icon: "❄️" },
  80: { description: "ฝนตกเป็นช่วง", icon: "🌦️" },
  81: { description: "ฝนตกเป็นช่วงปานกลาง", icon: "🌧️" },
  82: { description: "ฝนตกหนักเป็นช่วง", icon: "⛈️" },
  95: { description: "พายุฝนฟ้าคะนอง", icon: "⛈️" },
  96: { description: "พายุฝนฟ้าคะนอง", icon: "⛈️" },
  99: { description: "พายุฝนฟ้าคะนองรุนแรง", icon: "⛈️" },
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatStopwatch(milliseconds: number): string {
  const centiseconds = Math.floor(milliseconds / 10) % 100;
  const seconds = Math.floor(milliseconds / 1000) % 60;
  const minutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${pad(hours)}:${pad(remainingMinutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  }

  return `${pad(remainingMinutes)}:${pad(seconds)}.${pad(centiseconds)}`;
}

export default function HomePage() {
  const [now, setNow] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date | null>(null);
  const [isLight, setIsLight] = useState(false);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherStatus, setWeatherStatus] = useState("กำลังโหลดข้อมูลสภาพอากาศ...");
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchMs, setStopwatchMs] = useState(0);

  const stopwatchStartRef = useRef(0);
  const stopwatchElapsedRef = useRef(0);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 1000);
    setCalendarMonth(new Date());

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!stopwatchRunning) return;

    stopwatchStartRef.current = Date.now();
    const timer = window.setInterval(() => {
      setStopwatchMs(
        stopwatchElapsedRef.current + Date.now() - stopwatchStartRef.current,
      );
    }, 30);

    return () => window.clearInterval(timer);
  }, [stopwatchRunning]);

  const loadWeather = useCallback(
    async (latitude = 17.0078, longitude = 99.823, place = "สุโขทัย") => {
      setWeatherStatus(`กำลังโหลดสภาพอากาศ${place}...`);

      try {
        const params = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          current:
            "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
          timezone: "Asia/Bangkok",
        });

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
          { cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลสภาพอากาศได้");
        }

        const result = await response.json();
        const current = result.current;
        const weatherCode = WEATHER_CODES[Number(current.weather_code)] ?? {
          description: "ไม่ทราบสภาพอากาศ",
          icon: "🌡️",
        };

        setWeather({
          temperature: Math.round(Number(current.temperature_2m)),
          humidity: Number(current.relative_humidity_2m),
          wind: Math.round(Number(current.wind_speed_10m)),
          description: weatherCode.description,
          icon: weatherCode.icon,
          updatedAt: new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });

        setWeatherStatus(
          `ข้อมูลล่าสุด ${new Date().toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })} · Open-Meteo`,
        );
      } catch {
        setWeatherStatus("โหลดข้อมูลไม่สำเร็จ โปรดตรวจสอบอินเทอร์เน็ต");
      }
    },
    [],
  );

  useEffect(() => {
    void loadWeather();

    const refreshTimer = window.setInterval(
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
        () => {
          // หากไม่อนุญาตใช้ตำแหน่ง จะใช้พิกัดสุโขทัยเป็นค่าเริ่มต้น
        },
        { timeout: 5000 },
      );
    }

    return () => window.clearInterval(refreshTimer);
  }, [loadWeather]);

  const calendarCells = useMemo(() => {
    if (!calendarMonth) return [];

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();

    return Array.from({ length: 42 }, (_, index) => {
      if (index < firstDay) {
        return {
          day: previousMonthDays - firstDay + index + 1,
          muted: true,
          key: `prev-${index}`,
          today: false,
        };
      }

      if (index >= firstDay + daysInMonth) {
        return {
          day: index - firstDay - daysInMonth + 1,
          muted: true,
          key: `next-${index}`,
          today: false,
        };
      }

      const day = index - firstDay + 1;
      const currentDate = new Date();

      return {
        day,
        muted: false,
        key: `current-${day}`,
        today:
          day === currentDate.getDate() &&
          month === currentDate.getMonth() &&
          year === currentDate.getFullYear(),
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

  const startStopwatch = () => {
    if (stopwatchRunning) {
      const total =
        stopwatchElapsedRef.current +
        Date.now() -
        stopwatchStartRef.current;

      stopwatchElapsedRef.current = total;
      setStopwatchMs(total);
      setStopwatchRunning(false);
    } else {
      setStopwatchRunning(true);
    }
  };

  const resetStopwatch = () => {
    setStopwatchRunning(false);
    stopwatchElapsedRef.current = 0;
    stopwatchStartRef.current = 0;
    setStopwatchMs(0);
  };

  if (!now) {
    return (
      <main className={`dashboard ${isLight ? "light" : ""}`}>
        <div className="loading-screen">กำลังเตรียม Dashboard...</div>
      </main>
    );
  }

  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const secondsToday = hour * 3600 + minute * 60 + second;
  const dayProgress = (secondsToday / 86400) * 100;

  return (
    <main className={`dashboard ${isLight ? "light" : ""}`}>
      <div className="dashboard-shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand-logo">◷</div>
            <div>
              <h1>Multimedia &amp; Clock</h1>
              <p>Your personal live widget dashboard</p>
            </div>
          </div>

          <div className="top-actions">
            <span className="system-status">
              <span className="status-dot" />
              ระบบพร้อมใช้งาน
            </span>

            <button
              className="theme-button"
              type="button"
              onClick={() => setIsLight((value) => !value)}
              aria-label="เปลี่ยนธีม"
              title="เปลี่ยนธีม"
            >
              {isLight ? "☾" : "☼"}
            </button>
          </div>
        </header>

        <div className="section-heading">
          <h2>ภาพรวมของคุณ</h2>
          <span>
            อัปเดตล่าสุด {pad(hour)}:{pad(minute)}:{pad(second)}
          </span>
        </div>

        <section className="widget-grid">
          <article className="widget date-widget">
            <div className="widget-heading">
              <span>วันที่วันนี้</span>
              <span className="heading-icon">▦</span>
            </div>

            <div className="date-day">{THAI_DAYS[now.getDay()]}</div>
            <div className="date-number">{now.getDate()}</div>

            <div className="date-month">
              {THAI_MONTHS[now.getMonth()]} {now.getFullYear() + 543}
            </div>
          </article>

          <article className="widget digital-widget">
            <div className="widget-heading">
              <span>
                <span className="status-dot" />
                เวลาปัจจุบัน
              </span>
              <span>LIVE</span>
            </div>

            <div className="digital-time">
              {pad(hour)}:{pad(minute)}:{pad(second)}
            </div>

            <div className="muted-text">
              {THAI_DAYS[now.getDay()]}ที่ {now.getDate()}{" "}
              {THAI_MONTHS[now.getMonth()]} {now.getFullYear() + 543}
            </div>
          </article>

          <article className="widget analog-widget">
            <div className="widget-heading">
              <span>นาฬิกาเข็ม</span>
              <span className="heading-icon">◷</span>
            </div>

            <div className="clock-face" aria-label="นาฬิกาเข็ม">
              <span className="clock-label label-12">12</span>
              <span className="clock-label label-3">3</span>
              <span className="clock-label label-6">6</span>
              <span className="clock-label label-9">9</span>

              <i
                className="clock-hand hour-hand"
                style={{
                  transform: `translateX(-50%) rotate(${(hour % 12) * 30 + minute * 0.5}deg)`,
                }}
              />

              <i
                className="clock-hand minute-hand"
                style={{
                  transform: `translateX(-50%) rotate(${minute * 6 + second * 0.1}deg)`,
                }}
              />

              <i
                className="clock-hand second-hand"
                style={{
                  transform: `translateX(-50%) rotate(${second * 6}deg)`,
                }}
              />

              <span className="clock-center" />
            </div>
          </article>

          <article className="widget weather-widget">
            <div className="widget-heading">
              <span>สภาพอากาศ</span>
              <span className="heading-icon">☁</span>
            </div>

            {weather ? (
              <>
                <div className="weather-main">
                  <div>
                    <div className="temperature">
                      {weather.temperature}°
                    </div>
                    <div className="muted-text">
                      {weather.description}
                    </div>
                  </div>

                  <div className="weather-icon">{weather.icon}</div>
                </div>

                <div className="weather-meta">
                  <span>
                    💧 ความชื้น <b>{weather.humidity}%</b>
                  </span>
                  <span>
                    💨 ลม <b>{weather.wind} กม./ชม.</b>
                  </span>
                </div>
              </>
            ) : (
              <div className="weather-placeholder">
                กำลังโหลดข้อมูลอากาศ...
              </div>
            )}

            <div className="small-status">{weatherStatus}</div>
          </article>

          <article className="widget stopwatch-widget">
            <div className="widget-heading">
              <span>นาฬิกาจับเวลา</span>
              <span className="heading-icon">⏱</span>
            </div>

            <div className="stopwatch-time">
              {formatStopwatch(stopwatchMs)}
            </div>

            <div className="button-row">
              <button
                className="primary-button"
                type="button"
                onClick={startStopwatch}
              >
                {stopwatchRunning ? "หยุด" : "เริ่ม"}
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={resetStopwatch}
              >
                รีเซ็ต
              </button>
            </div>
          </article>

          <article className="widget calendar-widget">
            <div className="widget-heading">
              <span>ปฏิทิน</span>
              <span className="heading-icon">▦</span>
            </div>

            <div className="calendar-top">
              <strong>
                {calendarMonth
                  ? `${THAI_MONTHS[calendarMonth.getMonth()]} ${calendarMonth.getFullYear() + 543}`
                  : ""}
              </strong>

              <div className="calendar-controls">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label="เดือนก่อน"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="เดือนถัดไป"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="calendar-grid">
              {WEEKDAYS.map((day) => (
                <span className="weekday" key={day}>
                  {day}
                </span>
              ))}

              {calendarCells.map((cell) => (
                <span
                  className={`calendar-day ${cell.muted ? "muted" : ""} ${cell.today ? "today" : ""}`}
                  key={cell.key}
                >
                  {cell.day}
                </span>
              ))}
            </div>
          </article>

          <article className="widget progress-widget">
            <div className="widget-heading">
              <span>สรุปเวลาประจำวัน</span>
              <span className="heading-icon">✦</span>
            </div>

            <div className="progress-time">
              {pad(hour)}:{pad(minute)}:{pad(second)}
            </div>

            <div className="muted-text">
              เวลาที่ผ่านไปตั้งแต่เริ่มต้นวันนี้
            </div>

            <div className="progress-track">
              <span style={{ width: `${dayProgress}%` }} />
            </div>

            <div className="muted-text">
              วันนี้ผ่านไป {dayProgress.toFixed(1)}%
            </div>
          </article>

          <article className="widget quote-widget">
            <div>
              <div className="widget-heading">
                <span>ข้อความประจำวัน</span>
                <span className="heading-icon">✧</span>
              </div>

              <p className="quote-text">
                เริ่มต้นจากสิ่งเล็ก ๆ แล้วค่อย ๆ พัฒนาให้ดีขึ้นในทุกวัน
              </p>
            </div>

            <div className="muted-text">Have a nice day ✨</div>
          </article>
        </section>

        <footer className="footer">
          Multimedia &amp; Clock Dashboard · Responsive for all devices
        </footer>
      </div>
    </main>
  );
}
