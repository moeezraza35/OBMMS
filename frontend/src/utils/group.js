import makeRequest from "./request";

async function getGroups(session_id="", callBack = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/group/all/",
    "GET",
    session_id,
    null,
    data => callBack(data.groups),
    errorCase,
    navigate
  )
}
async function getGroupsName(session_id="", callBack = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "auth/groups/",
    "GET",
    session_id,
    null,
    data => callBack(data.groups),
    errorCase,
    navigate
  )
}
async function addGroup(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/group/add/",
    "POST",
    session_id,
    formData,
    data => callback(data.group),
    errorCase,
    navigate
  )
}
async function updateGroup(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/group/update/",
    "POST",
    session_id,
    formData,
    data => callback(data.group),
    errorCase,
    navigate
  )
}
async function deleteGroup(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/group/delete/",
    "POST",
    session_id,
    formData,
    () => callback(),
    errorCase,
    navigate
  )
}
export {getGroups, getGroupsName, addGroup, updateGroup, deleteGroup}