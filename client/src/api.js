import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8010",  // or your deployment URL
});

export default API;
