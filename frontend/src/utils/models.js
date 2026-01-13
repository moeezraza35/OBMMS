import { api_prefix, backend } from "../config";

async function getModels(session_id=""){
  const res = await fetch(backend+api_prefix+"admin/models/", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": session_id
    }
  })
  const data = await res.json()
  return data
}
export {getModels}