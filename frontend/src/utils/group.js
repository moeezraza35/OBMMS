import makeRequest from "./request";

async function getGroups(session_id="", callBack = () => {}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/group/all/",
    "GET",
    session_id,
    null,
    data => callBack(data.groups),
    errorCase,
    navigate
  )
  return data
}

async function addGroup(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/group/add/",
    "POST",
    session_id,
    formData,
    data => callback(data.group),
    errorCase,
    navigate
  )
  return data
}

async function updateGroup(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/group/update/",
    "POST",
    session_id,
    formData,
    data => callback(data.group),
    errorCase,
    navigate
  )
  return data
}

export {getGroups, addGroup, updateGroup}