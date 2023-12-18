import axios from "axios";

const URL =
  "https://api.openweathermap.org/data/2.5/weather?q=Hanoi&appid=3f88d3965284994a234423fca9bfbd2f";
// const URL =
//   "https://api.openweathermap.org/data/2.5/weather?q=London&appid=3f88d3965284994a234423fca9bfbd2f";
const API_KEY = "3f88d3965284994a234423fca9bfbd2f";

export const fetchWeather = async () => {
  const { data } = await axios.get(URL);

  return data;
};
