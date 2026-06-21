import React, { useState, useEffect } from 'react';
import { 
  Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, 
  Search, Navigation, Thermometer, Loader2, Compass, Moon, Sunrise, Sunset
} from 'lucide-react';

interface WeatherData {
  city: string;
  country?: string;
  temp: number;
  feelsLike: number;
  condition: string;
  code: number;
  humidity: number;
  windSpeed: number;
  maxTemp: number;
  minTemp: number;
  sunrise: string;
  sunset: string;
  hourly: { time: string; temp: number; icon: any }[];
  daily: { day: string; max: number; min: number; condition: string; icon: any }[];
}

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

// Map WMO codes to human readable Italian weather text and custom backgrounds
const getWeatherDetails = (code: number) => {
  if (code === 0) return { label: 'Sereno', icon: Sun, bg: 'from-amber-400 to-orange-500 text-amber-950' };
  if (code >= 1 && code <= 3) return { label: 'Poco Nuvoloso', icon: Cloud, bg: 'from-blue-400/80 to-indigo-600 text-blue-50' };
  if (code >= 45 && code <= 48) return { label: 'Nebbia', icon: Cloud, bg: 'from-zinc-400 to-slate-600 text-slate-100' };
  if (code >= 51 && code <= 67) return { label: 'Pioviggine', icon: CloudRain, bg: 'from-sky-400 to-slate-600 text-sky-50' };
  if (code >= 71 && code <= 77) return { label: 'Neve', icon: CloudSnow, bg: 'from-indigo-300 to-slate-400 text-indigo-950' };
  if (code >= 80 && code <= 82) return { label: 'Pioggia Forte', icon: CloudRain, bg: 'from-blue-600 to-cyan-800 text-blue-50' };
  if (code >= 95 && code <= 99) return { label: 'Temporale', icon: CloudLightning, bg: 'from-indigo-900 via-slate-800 to-zinc-900 text-purple-100' };
  return { label: 'Variabile', icon: Cloud, bg: 'from-sky-400 to-indigo-500 text-white' };
};

// Default high-fidelity coordinates in case of open-weather lag/offline state
const POPULAR_CITIES = [
  { name: 'Roma', lat: 41.8903, lon: 12.4922, country: 'Italia' },
  { name: 'Milano', lat: 45.4642, lon: 9.1900, country: 'Italia' },
  { name: 'Napoli', lat: 40.8518, lon: 14.2681, country: 'Italia' },
  { name: 'Firenze', lat: 43.7696, lon: 11.2558, country: 'Italia' },
  { name: 'Palermo', lat: 38.1157, lon: 13.3615, country: 'Italia' }
];

export default function AppMeteo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const saved = localStorage.getItem('scriba_weather_location_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return { name: 'Roma', lat: 41.8903, lon: 12.4922, country: 'Italia' };
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Weather Data from free Open-Meteo API
  const fetchWeather = async (lat: number, lon: number, cityName: string, countryName?: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Errore durante il recupero dei dati climatici.");
      
      const data = await response.json();
      
      // Parse Current Info
      const tempVal = Math.round(data.current.temperature_2m);
      const feeVal = Math.round(data.current.apparent_temperature);
      const humVal = data.current.relative_humidity_2m;
      const windVal = Math.round(data.current.wind_speed_10m);
      const codeVal = data.current.weather_code;
      const condDetails = getWeatherDetails(codeVal);

      // Parse Hourly forecast info (take next 6 elements)
      const hourlyList = (data.hourly.time || []).slice(0, 6).map((timeStr: string, idx: number) => {
        const d = new Date(timeStr);
        const hours = d.getHours().toString().padStart(2, '0') + ':00';
        const tVal = Math.round(data.hourly.temperature_2m[idx]);
        const subDetails = getWeatherDetails(data.hourly.weather_code[idx]);
        return {
          time: hours,
          temp: tVal,
          icon: subDetails.icon
        };
      });

      // Parse Weekly data (5 days)
      const daysOfIndex = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
      const dailyList = (data.daily.time || []).slice(0, 5).map((dateStr: string, idx: number) => {
        const d = new Date(dateStr);
        const nameOfDay = idx === 0 ? 'Oggi' : daysOfIndex[d.getDay()];
        const minTemp = Math.round(data.daily.temperature_2m_min[idx]);
        const maxTemp = Math.round(data.daily.temperature_2m_max[idx]);
        const dCode = data.daily.weather_code[idx];
        const subDetails = getWeatherDetails(dCode);
        return {
          day: nameOfDay,
          max: maxTemp,
          min: minTemp,
          condition: subDetails.label,
          icon: subDetails.icon
        };
      });

      // Sunset / sunrise parses
      const sunr = data.daily.sunrise[0] ? new Date(data.daily.sunrise[0]).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '06:12';
      const suns = data.daily.sunset[0] ? new Date(data.daily.sunset[0]).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '20:45';

      const weatherObj = {
        city: cityName,
        country: countryName,
        temp: tempVal,
        feelsLike: feeVal,
        condition: condDetails.label,
        code: codeVal,
        humidity: humVal,
        windSpeed: windVal,
        maxTemp: Math.round(data.daily.temperature_2m_max[0]),
        minTemp: Math.round(data.daily.temperature_2m_min[0]),
        sunrise: sunr,
        sunset: suns,
        hourly: hourlyList,
        daily: dailyList
      };

      setWeather(weatherObj);
      
      // Save for widget to read
      localStorage.setItem('scriba_weather_location_v1', JSON.stringify({ name: cityName, lat, lon, country: countryName }));
      localStorage.setItem('scriba_current_weather_v1', JSON.stringify({ temp: tempVal, condition: condDetails.label, code: codeVal, city: cityName }));
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      setErrorMsg("Errore nel caricamento del meteo. Caricamento dati offline dimostrativi.");
      fallbackStaticData(cityName, countryName || 'Italia');
    } finally {
      setLoading(false);
    }
  };

  // Provide realistic mock data if internet disconnects or API limit exceeded
  const fallbackStaticData = (cityName: string, countryName: string) => {
    setWeather({
      city: cityName,
      country: countryName,
      temp: 24,
      feelsLike: 25,
      condition: 'Parzialmente Nuvoloso',
      code: 2,
      humidity: 55,
      windSpeed: 12,
      maxTemp: 28,
      minTemp: 18,
      sunrise: '05:48',
      sunset: '20:30',
      hourly: [
        { time: 'Ora', temp: 24, icon: Cloud },
        { time: '13:00', temp: 26, icon: Sun },
        { time: '14:00', temp: 27, icon: Sun },
        { time: '15:00', temp: 28, icon: Sun },
        { time: '16:00', temp: 25, icon: Cloud },
        { time: '17:00', temp: 23, icon: Cloud }
      ],
      daily: [
        { day: 'Oggi', max: 28, min: 18, condition: 'Nuvoloso', icon: Cloud },
        { day: 'Lun', max: 27, min: 17, condition: 'Sereno', icon: Sun },
        { day: 'Mar', max: 29, min: 19, condition: 'Sereno', icon: Sun },
        { day: 'Mer', max: 25, min: 16, condition: 'Temporale', icon: CloudLightning },
        { day: 'Gio', max: 26, min: 15, condition: 'Piovoso', icon: CloudRain }
      ]
    });
  };

  // Execute Search via Geocoding free API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=it&format=json`;
      const res = await fetch(geoUrl);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setSearchResults(data.results);
        setErrorMsg(null);
      } else {
        setErrorMsg("Nessuna città trovata con questo nome.");
        setSearchResults([]);
      }
    } catch (err) {
      setErrorMsg("Errore di rete durante la ricerca città.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger default city fetch on launch
  useEffect(() => {
    fetchWeather(selectedLocation.lat, selectedLocation.lon, selectedLocation.name, selectedLocation.country);
  }, [selectedLocation]);

  const condObj = weather ? getWeatherDetails(weather.code) : { label: '', icon: Sun, bg: 'from-zinc-900 to-zinc-800 text-white' };
  const WeatherIconComp = condObj.icon;

  return (
    <div id="app-meteo" className="h-full w-full bg-zinc-950 text-white rounded-3xl p-4 lg:p-6 flex flex-col font-sans select-none overflow-y-auto">
      
      {/* Header Search and Location list */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cerca città (es. Roma, Paris, Kyoto...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 text-xs text-white pl-10 pr-3 py-2.5 rounded-2xl border border-white/5 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-zinc-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 px-4 rounded-2xl text-xs font-semibold hover:scale-102 flex items-center gap-1 active:scale-98 transition"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Cerca</span>}
          </button>
        </form>

        {/* Search Suggestion box */}
        {searchResults.length > 0 && (
          <div className="bg-zinc-900 border border-white/5 rounded-2xl p-2 space-y-1 max-h-40 overflow-y-auto z-15">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 px-2 font-bold block mb-1">Città trovate:</span>
            {searchResults.map((city, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedLocation({
                    name: city.name,
                    lat: city.latitude,
                    lon: city.longitude,
                    country: city.country || 'Estero'
                  });
                  setSearchResults([]);
                  setSearchQuery('');
                }}
                className="w-full text-left text-xs hover:bg-zinc-800 transition py-2 px-2.5 rounded-xl flex justify-between items-center"
              >
                <span className="font-medium text-zinc-100">{city.name}</span>
                <span className="text-[10px] text-zinc-400 font-semibold uppercase">{city.admin1 ? `${city.admin1}, ` : ''}{city.country}</span>
              </button>
            ))}
          </div>
        )}

        {/* Popular rapid selection hubs */}
        <div className="flex gap-1.5 flex-wrap">
          {POPULAR_CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedLocation({ name: c.name, lat: c.lat, lon: c.lon, country: c.country })}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
                selectedLocation.name === c.name
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500'
                  : 'bg-zinc-900 text-zinc-400 border-white/5 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2.5 rounded-xl text-xs flex items-center gap-2">
            <Thermometer className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {loading && !weather ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-sm font-semibold text-zinc-400">Interrogazione stazioni climatiche...</span>
        </div>
      ) : weather ? (
        <div className="flex-1 flex flex-col justify-between mt-4">
          
          {/* Main Hero Card displaying current state conditions */}
          <div className={`p-5 rounded-3xl bg-gradient-to-br ${condObj.bg} shadow-xl relative overflow-hidden transition-all duration-300`}>
            {/* Ambient decorative back circle */}
            <div className="absolute right-[-15px] top-[-15px] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start z-10 relative">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 fill-current" />
                  <h2 className="text-xl font-black tracking-tight">{weather.city}</h2>
                </div>
                <p className="text-xs opacity-85 font-semibold text-zinc-200">{weather.country || 'Italia'}</p>
                <p className="text-xs font-bold uppercase tracking-wide bg-black/15 py-0.5 px-2 rounded-lg inline-block mt-2">
                  {weather.condition}
                </p>
              </div>

              <div className="text-right">
                <WeatherIconComp className="w-12 h-12 stroke-[1.5]" />
              </div>
            </div>

            <div className="mt-8 flex justify-between items-end z-10 relative">
              <div>
                <span className="text-6xl font-light tracking-tighter block leading-none select-none">{weather.temp}°</span>
                <span className="text-[11px] opacity-80 font-bold block mt-1">Percepito {weather.feelsLike}°c</span>
              </div>
              <div className="text-right text-xs space-y-0.5 font-bold">
                <span className="block">Max: {weather.maxTemp}°c</span>
                <span className="block opacity-75">Min: {weather.minTemp}°c</span>
              </div>
            </div>
          </div>

          {/* Quick hour forecasts (6 elements horizontally) */}
          <div className="mt-4 space-y-2">
            <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase block">Meteo Orario</span>
            <div className="grid grid-cols-6 gap-2 bg-zinc-900/60 p-3.5 rounded-2xl border border-white/5">
              {weather.hourly.map((h, i) => {
                const SubIcon = h.icon;
                return (
                  <div key={i} className="flex flex-col items-center space-y-1">
                    <span className="text-[9px] text-zinc-500 font-semibold">{h.time}</span>
                    <SubIcon className="w-4 h-4 text-zinc-300 stroke-[1.8]" />
                    <span className="text-xs font-bold text-zinc-100">{h.temp}°</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Core metadata (Humidity, Wind, Sunset/Sunrise) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            
            <div className="bg-zinc-900 border border-white/5 p-3 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Wind className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Vento</span>
              </div>
              <span className="text-sm font-black text-zinc-100 block">{weather.windSpeed} km/h</span>
              <span className="text-[9px] text-zinc-500 font-medium">Brezza leggera</span>
            </div>

            <div className="bg-zinc-900 border border-white/5 p-3 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Umidità</span>
              </div>
              <span className="text-sm font-black text-zinc-100 block">{weather.humidity}%</span>
              <span className="text-[9px] text-zinc-500 font-medium">Umidità nell'aria</span>
            </div>

            <div className="bg-zinc-900 border border-white/5 p-3 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Sunrise className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Alba</span>
              </div>
              <span className="text-sm font-black text-zinc-100 block">{weather.sunrise}</span>
              <span className="text-[9px] text-zinc-500 font-medium">Luce al mattino</span>
            </div>

            <div className="bg-zinc-900 border border-white/5 p-3 rounded-2xl space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400">
                <Sunset className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Tramonto</span>
              </div>
              <span className="text-sm font-black text-zinc-100 block">{weather.sunset}</span>
              <span className="text-[9px] text-zinc-500 font-medium font-sans">Inizio crepuscolo</span>
            </div>
          </div>

          {/* 5-Days future calendar lists */}
          <div className="mt-4 space-y-2">
            <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase block">Previsioni a 5 Giorni</span>
            <div className="bg-zinc-900/60 rounded-2xl border border-white/5 p-3.5 space-y-2 text-xs">
              {weather.daily.map((d, i) => {
                const SubIcon = d.icon;
                return (
                  <div key={i} className="flex justify-between items-center font-bold">
                    <span className="w-12 text-zinc-300 font-medium text-left">{d.day}</span>
                    <div className="flex items-center gap-1.5 w-28">
                      <SubIcon className="w-4 h-4 text-zinc-400 stroke-[1.8]" />
                      <span className="text-[10px] text-zinc-400 leading-none truncate font-medium">{d.condition}</span>
                    </div>
                    <div className="flex gap-2 text-right">
                      <span className="w-8 text-zinc-100">{d.max}°c</span>
                      <span className="w-8 text-zinc-500 font-medium">{d.min}°c</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : null}

      <div className="mt-6 pt-3 border-t border-zinc-920 text-center text-[10px] font-semibold text-zinc-600 uppercase tracking-widest leading-none">
        Open-Meteo Public API • Real-Time Core
      </div>
    </div>
  );
}
