import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8001/api'

export const api = axios.create({ baseURL: API_BASE })
