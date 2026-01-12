import { api_prefix, backend } from "../config";

async function getGroups(session_id=""){
  const res = await fetch(backend+api_prefix+"admin/group/all/", {
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

async function addGroup(formData, session_id=""){
  const res = await fetch(backend+api_prefix+"admin/group/add/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+session_id
    },
    body: JSON.stringify(formData)
  })
  const data = res.json()
  return data
}

async function updateGroup(formData, session_id=""){
  const res = await fetch(backend+api_prefix+"admin/group/update", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": session_id
    },
    body: JSON.stringify(formData)
  })
  const data = await res.json()
  return data
}

export {getGroups, addGroup, updateGroup}