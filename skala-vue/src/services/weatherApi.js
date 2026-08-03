import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

// 화면에 보여줄 도시 메타데이터. name은 한글 표시용, query는 OpenWeatherMap 검색용(영문+국가코드).
// mapX/mapY는 KoreaMapDots 지도 패널 위에서의 상대 위치(0~1)로, 실측 GPS 좌표가 아니라
// 다른 아이콘들과 마찬가지로 손으로 근사한 스타일화된 배치 값이다.
export const CITY_LIST = [
  { id: 'city_01', name: '서울', query: 'Seoul,KR', mapX: 0.432, mapY: 0.598 },
  { id: 'city_02', name: '수원', query: 'Suwon,KR', mapX: 0.432, mapY: 0.634 },
  { id: 'city_03', name: '부산', query: 'Busan,KR', mapX: 0.659, mapY: 0.817 },
  { id: 'city_04', name: '인천', query: 'Incheon,KR', mapX: 0.364, mapY: 0.598 },
  { id: 'city_05', name: '대전', query: 'Daejeon,KR', mapX: 0.477, mapY: 0.695 },
  { id: 'city_06', name: '대구', query: 'Daegu,KR', mapX: 0.614, mapY: 0.744 },
  { id: 'city_07', name: '광주', query: 'Gwangju,KR', mapX: 0.341, mapY: 0.805 },
  { id: 'city_08', name: '울산', query: 'Ulsan,KR', mapX: 0.705, mapY: 0.78 },
  { id: 'city_09', name: '제주', query: 'Jeju,KR', mapX: 0.295, mapY: 0.963 },
]

export function findCityById(id) {
  return CITY_LIST.find((city) => city.id === id)
}

// OpenWeatherMap의 영문 날씨 대분류(main)를 DotMatrixIcon이 그릴 수 있는 종류로 매핑한다.
// 우선순위 순서로 정의 — 뇌우가 비보다 먼저 판정되어야 하므로 순서가 중요하다.
const CONDITION_KEYWORDS = {
  thunderstorm: ['thunderstorm'],
  snow: ['snow'],
  fog: ['mist', 'fog', 'haze', 'smoke', 'dust', 'sand', 'ash'],
  rain: ['rain', 'drizzle'],
  cloud: ['cloud'],
}
export function mapWeatherMainToCondition(weatherMain) {
  const normalized = weatherMain?.toLowerCase() ?? ''
  const matched = Object.entries(CONDITION_KEYWORDS).find(([, keywords]) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  )
  return matched?.[0] ?? 'sun'
}

// OpenWeatherMap 현재 날씨 API를 호출해, 화면에서 쓰기 좋은 형태로 가공해 반환한다.
// 온도는 항상 섭씨(metric)로 받아오고, 화씨 표시는 각 화면의 computed에서 변환한다.
// 6가지 날씨 조건을 도시 순서대로 돌아가며 배정하는 더미 데이터.
// API 응답 없이 즉시 만들어지므로, 실제 날씨와 상관없이 모든 아이콘/애니메이션을 바로 볼 수 있다.
const DUMMY_CONDITIONS = ['sun', 'cloud', 'rain', 'snow', 'thunderstorm', 'fog']
const DUMMY_STATUS_TEXT = {
  sun: '맑음 (데모)',
  cloud: '구름많음 (데모)',
  rain: '비 (데모)',
  snow: '눈 (데모)',
  thunderstorm: '뇌우 (데모)',
  fog: '안개 (데모)',
}
const DUMMY_TEMP_BY_CONDITION = {
  sun: 28,
  cloud: 22,
  rain: 19,
  snow: -2,
  thunderstorm: 24,
  fog: 15,
}

export function getDummyWeather(city, index) {
  const condition = DUMMY_CONDITIONS[index % DUMMY_CONDITIONS.length]
  const temp = DUMMY_TEMP_BY_CONDITION[condition]
  const now = Math.floor(Date.now() / 1000)

  return {
    id: city.id,
    name: city.name,
    mapX: city.mapX,
    mapY: city.mapY,
    temp,
    status: DUMMY_STATUS_TEXT[condition],
    condition,
    windDeg: 180,
    windSpeed: 3.2,
    humidity: 60,
    pressure: 1013,
    feelsLike: temp - 1,
    tempMin: temp - 3,
    tempMax: temp + 3,
    visibility: 10000,
    cloudiness: condition === 'sun' ? 5 : 70,
    sunrise: now - 3600 * 3,
    sunset: now + 3600 * 5,
  }
}

export async function fetchCurrentWeather(city) {
  const { data } = await axios.get(BASE_URL, {
    params: {
      q: city.query,
      appid: API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  })

  const { main, weather, wind, visibility, clouds, sys } = data
  const [{ main: weatherMain, description } = {}] = weather ?? []

  return {
    id: city.id,
    name: city.name,
    mapX: city.mapX,
    mapY: city.mapY,
    temp: Math.round(main.temp),
    status: description,
    condition: mapWeatherMainToCondition(weatherMain),
    windDeg: wind?.deg ?? 0,
    windSpeed: wind?.speed ?? 0,
    humidity: main.humidity,
    pressure: main.pressure,
    feelsLike: Math.round(main.feels_like),
    tempMin: Math.round(main.temp_min),
    tempMax: Math.round(main.temp_max),
    visibility: visibility ?? 10000,
    cloudiness: clouds?.all ?? 0,
    sunrise: sys?.sunrise,
    sunset: sys?.sunset,
  }
}
