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
  return data.groups || []
}
async function getGroupsName(session_id="", callBack = () => {}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "auth/groups/",
    "GET",
    session_id,
    null,
    data => callBack(data.groups),
    errorCase,
    navigate
  )
  return data.groups || []
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
  return data.group
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
  return data.group
}
export {getGroups, getGroupsName, addGroup, updateGroup}