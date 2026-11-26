
"use client";

import { useEffect, useState } from "react";

type WeatherData = {
  temperature: number;
  humidity: number;
  feelsLike: number;
  windSpeed: number;
  code: number;
};

const weatherDescription = (code: number) => {
  if (code === 0) return { text: "ท้องฟ้าแจ่มใส", icon: "☀️" };
  if ([1, 2].includes(code)) return { text: "มีเมฆบางส่วน", icon: "🌤️" };
  if (code === 3) return { text: "มีเมฆมาก", icon: "☁️" };
  if ([45, 48].includes(code)) return { text: "มีหมอก", icon: "🌫️" };
  if ([51, 53, 55, 56, 57].includes(code)) return { text: "ฝนละออง", icon: "🌦️" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { text: "ฝนตก", icon: "🌧️" };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { text: "หิมะตก", icon: "❄️" };
  if ([95, 96, 99].includes(code))
    return { text: "พายุฝนฟ้าคะนอง", icon: "⛈️" };
  return { text: "ไม่ทราบสภาพอากาศ", icon: "🌤️" };
};

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("home");
  const [darkMode, setDarkMode] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [locationName, setLocationName] = useState("ตำแหน่งปัจจุบัน");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const thaiDate = new Intl.DateTimeFormat("th-TH", {
    timeZone: "Asia/Bangkok",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(time);

  const currentTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).format(time);

  const fetchWeather = () => {
    if (!navigator.geolocation) {
      setWeatherError("อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }

    setWeatherLoading(true);
    setWeatherError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Asia%2FBangkok`
          );

          if (!response.ok) throw new Error("ไม่สามารถโหลดข้อมูลอากาศได้");

          const data = await response.json();
          const current = data.current;

          setWeather({
            temperature: current.temperature_2m,
            humidity: current.relative_humidity_2m,
            feelsLike: current.apparent_temperature,
            windSpeed: current.wind_speed_10m,
            code: current.weather_code,
          });

          setLocationName("ตำแหน่งที่คุณอนุญาต");
        } catch {
          setWeatherError("ไม่สามารถเชื่อมต่อข้อมูลสภาพอากาศได้");
        } finally {
          setWeatherLoading(false);
        }
      },
      () => {
        setWeatherError("กรุณาอนุญาตให้เว็บไซต์เข้าถึงตำแหน่งของคุณ");
        setWeatherLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const weatherInfo = weather
    ? weatherDescription(weather.code)
    : null;

  return (
    <main className={`app ${darkMode ? "dark" : "light"}`}>
      <div className="app-container">

        {/* HEADER */}
        <header className="header">
          <div className="brand">
            <div className="brand-logo">T</div>
            <div>
              <h2>TIMELESS</h2>
              <p>YOUR DAILY COMPANION</p>
            </div>
          </div>

          <button
            className="theme-button"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="เปลี่ยนธีม"
          >
            {darkMode ? "☼" : "☾"}
          </button>
        </header>

        {/* WELCOME */}
        <section className="welcome">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>
            ช่วงเวลาดี ๆ <span>เริ่มต้นที่นี่</span>
          </h1>
          <p>จัดการทุกช่วงเวลาของคุณให้ง่ายและมีสไตล์</p>
        </section>

        {/* HOME */}
        {activeTab === "home" && (
          <>
            <section className="clock-card">
              <div className="card-top">
                <span>เวลาปัจจุบัน</span>
                <span className="live">
                  <i /> LIVE
                </span>
              </div>

              <div className="clock-content">
                <div className="clock-time">{currentTime}</div>
                <div className="clock-date">{thaiDate}</div>
                <div className="clock-decoration">✦</div>
              </div>

              <div className="card-bottom">
                <span>THAILAND · GMT+7</span>
                <span>✦ TIME IS PRECIOUS</span>
              </div>
            </section>

            <section className="weather-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">WEATHER TODAY</span>
                  <h2>สภาพอากาศ</h2>
                </div>
                <button className="refresh-button" onClick={fetchWeather}>
                  ↻
                </button>
              </div>

              <div className="weather-card">
                {weatherLoading ? (
                  <div className="weather-message">
                    กำลังโหลดข้อมูลสภาพอากาศ...
                  </div>
                ) : weather ? (
                  <div className="weather-overview">
                    <div className="weather-main">
                      <span className="weather-icon">{weatherInfo?.icon}</span>
                      <div>
                        <div className="temperature">
                          {Math.round(weather.temperature)}°
                        </div>
                        <p>{weatherInfo?.text}</p>
                        <small>{locationName}</small>
                      </div>
                    </div>
                    <div className="weather-details">
                      <div>
                        <span>💧</span>
                        <small>ความชื้น</small>
                        <strong>{weather.humidity}%</strong>
                      </div>
                      <div>
                        <span>🌡️</span>
                        <small>รู้สึกเหมือน</small>
                        <strong>{Math.round(weather.feelsLike)}°C</strong>
                      </div>
                      <div>
                        <span>💨</span>
                        <small>ความเร็วลม</small>
                        <strong>{weather.windSpeed} km/h</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="weather-message">
                    <span className="weather-icon">🌤️</span>
                    <p>{weatherError || "ยังไม่มีข้อมูลสภาพอากาศ"}</p>
                    <button className="gold-button" onClick={fetchWeather}>
                      ตรวจสอบสภาพอากาศ
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="quote-card">
              <span>✦ DAILY INSPIRATION</span>
              <h3>Make every second count.</h3>
              <p>ทุกวินาทีมีคุณค่า จงใช้เวลาให้ดีที่สุด</p>
            </section>
          </>
        )}

        {/* WEATHER PAGE */}
        {activeTab === "weather" && (
          <section className="page-section">
            <span className="eyebrow">WEATHER INFORMATION</span>
            <h1>สภาพอากาศวันนี้</h1>
            <p className="page-description">
              ตรวจสอบสภาพอากาศจากตำแหน่งปัจจุบันของคุณ
            </p>

            <div className="weather-card large-weather">
              {weather ? (
                <>
                  <div className="large-weather-icon">{weatherInfo?.icon}</div>
                  <div className="large-temperature">
                    {Math.round(weather.temperature)}°C
                  </div>
                  <h2>{weatherInfo?.text}</h2>
                  <p>{locationName}</p>

                  <div className="weather-details">
                    <div>
                      <span>💧</span>
                      <small>ความชื้น</small>
                      <strong>{weather.humidity}%</strong>
                    </div>
                    <div>
                      <span>🌡️</span>
                      <small>รู้สึกเหมือน</small>
                      <strong>{Math.round(weather.feelsLike)}°C</strong>
                    </div>
                    <div>
                      <span>💨</span>
                      <small>ความเร็วลม</small>
                      <strong>{weather.windSpeed} km/h</strong>
                    </div>
                  </div>
                </>
              ) : (
                <div className="weather-message">
                  {weatherLoading
                    ? "กำลังโหลดข้อมูล..."
                    : weatherError || "ยังไม่มีข้อมูลสภาพอากาศ"}
                </div>
              )}

              <button className="gold-button" onClick={fetchWeather}>
                ↻ อัปเดตสภาพอากาศ
              </button>
            </div>
          </section>
        )}

        {/* SETTINGS PAGE */}
        {activeTab === "settings" && (
          <section className="page-section">
            <span className="eyebrow">PERSONALIZATION</span>
            <h1>ตั้งค่าแอปพลิเคชัน</h1>
            <p className="page-description">
              ปรับแต่ง TIMELESS ในรูปแบบที่คุณต้องการ
            </p>

            <div className="settings-card">
              <div className="setting-item">
                <div>
                  <strong>รูปแบบหน้าจอ</strong>
                  <p>เลือกธีมการแสดงผลของแอป</p>
                </div>
                <button
                  className="setting-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? "☀️ สว่าง" : "🌙 มืด"}
                </button>
              </div>

              <div className="setting-item">
                <div>
                  <strong>เขตเวลา</strong>
                  <p>เวลาประเทศไทย GMT+7</p>
                </div>
                <span className="setting-value">GMT+7</span>
              </div>

              <div className="setting-item">
                <div>
                  <strong>ชื่อแอปพลิเคชัน</strong>
                  <p>TIMELESS - Your Daily Companion</p>
                </div>
                <span className="setting-value">T</span>
              </div>
            </div>

            <div className="about-card">
              <div className="brand-logo">T</div>
              <h2>TIMELESS</h2>
              <p>YOUR DAILY COMPANION</p>
              <small>Version 1.0.0</small>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="footer">
          <span>TIMELESS © 2026</span>
          <span>DESIGNED FOR YOUR TIME ✦</span>
        </footer>

      </div>

      {/* BOTTOM NAVIGATION */}
      <nav className="bottom-nav">
        <button
          className={activeTab === "home" ? "nav-item active" : "nav-item"}
          onClick={() => setActiveTab("home")}
        >
          <span>⌂</span>
          <small>หน้าหลัก</small>
        </button>

        <button
          className={activeTab === "weather" ? "nav-item active" : "nav-item"}
          onClick={() => setActiveTab("weather")}
        >
          <span>☀</span>
          <small>สภาพอากาศ</small>
        </button>

        <button
          className={activeTab === "settings" ? "nav-item active" : "nav-item"}
          onClick={() => setActiveTab("settings")}
        >
          <span>⚙</span>
          <small>ตั้งค่า</small>
        </button>
      </nav>
    </main>
  );
}
