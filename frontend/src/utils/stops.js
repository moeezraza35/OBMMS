import makeRequest from "./request"

async function getStops(session_id="", callback=()=>{}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/stops/all/",
    "GET",
    session_id,
    null,
    (data) => callback(data.stops),
    errorCase,
    navigate
  )
}
async function getActiveStops(session_id="", callback=()=>{}, errorCase=null, navigate=null){
  await makeRequest(
    "tracking/stops/",
    "GET",
    session_id,
    null,
    (data) => callback(data.stops),
    errorCase,
    navigate
  )
}
async function addStop(formData={}, session_id="", callback=()=>{}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/stops/add/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.stop),
    errorCase,
    navigate
  )
}
async function updateStop(formData={}, session_id="", callback=()=>{}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/stops/update/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.stop),
    errorCase,
    navigate
  )
}
async function deleteStop(formData={}, session_id="", callback=()=>{}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/stops/delete/",
    "POST",
    session_id,
    formData,
    () => callback(),
    errorCase,
    navigate
  )
}
export {getStops, getActiveStops, addStop, updateStop, deleteStop}