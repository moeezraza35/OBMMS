import { api_prefix, backend } from "../config";

async function getGroups(session_id="", callBack = () => {}, errorCase = () => {}){
  const res = await fetch(backend+api_prefix+"admin/group/all/", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": session_id
    }
  })
  let data
  try{data = await res.json()} catch (e) {data = null}
  if (!res.ok){
    let msg = data.detail? data.detail : null
    alert(msg)
    errorCase()
  }
  if (data && data.groups){
    callBack(data.groups)
  }
  return data
}

async function addGroup(formData, session_id="", callback = () => {}, errorCase = () => {}){
  const res = await fetch(backend+api_prefix+"admin/group/add/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer "+session_id
    },
    body: JSON.stringify(formData)
  })
  let data;
  try{data = await res.json()} catch (e) {data = null}
  if (!res.ok){
    let msg = data.detail? data.detail : null
    alert(msg)
    errorCase(res.status)
  } else  if (data && data.group){
    callback(data.group)
  }
  return data
}

async function updateGroup(formData, session_id="", callback = () => {}, errorCase = () => {}){
  const res = await fetch(backend+api_prefix+"admin/group/update", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": session_id
    },
    body: JSON.stringify(formData)
  })
  let data;
  try{data = await res.json()} catch (e) {data = null}
  if (!res.ok){
    let msg = data.detail? data.detail : null
    alert(msg)
    errorCase(res.status)
  } else  if (data && data.group){
    callback(data.group)
  }
  return data
}

export {getGroups, addGroup, updateGroup}