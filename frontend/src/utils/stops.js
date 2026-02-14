import makeRequest from "./request"

async function getStops(session_id="", callback=()=>{}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/stops/all/",
    "GET",
    session_id,
    null,
    (data) => callback(data.stops),
    errorCase,
    navigate
  )
  return data.stops
}
async function addStop(formData={}, session_id="", callback=()=>{}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/stops/add/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.stop),
    errorCase,
    navigate
  )
  return data.stop
}
async function updateStop(formData={}, session_id="", callback=()=>{}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/stops/update/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.stop),
    errorCase,
    navigate
  )
  return data.stop
}
export {getStops, addStop, updateStop}