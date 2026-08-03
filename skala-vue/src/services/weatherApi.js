import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather'

// 화면에 보여줄 도시 메타데이터. name은 한글 표시용, query는 OpenWeatherMap 검색용(영문+국가코드).
export const CITY_LIST = [
  { id: 'city_01', name: '서울', query: 'Seoul,KR' },
  { id: 'city_02', name: '수원', query: 'Suwon,KR' },
  { id: 'city_03', name: '부산', query: 'Busan,KR' },
]

export function findCityById(id) {
  return CITY_LIST.find((city) => city.id === id)
}

// OpenWeatherMap 현재 날씨 API를 호출해, 화면에서 쓰기 좋은 형태로 가공해 반환한다.
// 온도는 항상 섭씨(metric)로 받아오고, 화씨 표시는 각 화면의 computed에서 변환한다.
export async function fetchCurrentWeather(city) {
  const { data } = await axios.get(BASE_URL, {
    params: {
      q: city.query,
      appid: API_KEY,
      units: 'metric',
      lang: 'kr',
    },
  })

  return {
    id: city.id,
    name: city.name,
    temp: Math.round(data.main.temp),
    status: data.weather[0].description,
  }
}
