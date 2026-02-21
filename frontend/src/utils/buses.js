import makeRequest from "./request"

async function getBuses(session_id="", callback = () => {}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/buses/all/",
    "GET",
    session_id,
    null,
    (data) => callback(data.buses),
    errorCase,
    navigate
  )
  return data.buses || []
}
async function getActiveBuses(session_id="", callback = () => {}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "tracking/buses/",
    "GET",
    session_id,
    null,
    (data) => callback(data.buses),
    errorCase,
    navigate
  )
  return data.buses || []
}
async function getBusesName(session_id="", callback = () => {}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "tracking/buses/name/",
    "GET",
    session_id,
    null,
    (data) => callback(data.buses),
    errorCase,
    navigate
  )
  return data.buses || []
}
async function addBus(formData={}, session_id="", callback=()=>{}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/buses/add/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.bus),
    errorCase,
    navigate
  )
  return data.bus
}
async function updateBus(formData={}, session_id="", callback=()=>{}, errorCase=null, navigate=null){
  const data = await makeRequest(
    "admin/buses/update/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.bus),
    errorCase,
    navigate
  )
  return data.bus
}
export {getBuses, getActiveBuses, getBusesName, addBus, updateBus}