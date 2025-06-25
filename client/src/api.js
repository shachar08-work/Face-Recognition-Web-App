import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001",  // or your deployment URL
});

export default API;
