import makeRequest from "./request"

async function getBuses(session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/buses/all/",
    "GET",
    session_id,
    null,
    (data) => callback(data.buses),
    errorCase,
    navigate
  )
}
async function getActiveBuses(session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "tracking/buses/active/",
    "GET",
    session_id,
    null,
    (data) => callback(data.buses),
    errorCase,
    navigate
  )
}
async function getBusesName(session_id="", callback = () => {}, errorCase=null, navigate=null){
  await makeRequest(
    "tracking/buses/",
    "GET",
    session_id,
    null,
    (data) => callback(data.buses),
    errorCase,
    navigate
  )
}
async function addBus(formData={}, session_id="", callback=()=>{}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/buses/add/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.bus),
    errorCase,
    navigate
  )
}
async function updateBus(formData={}, session_id="", callback=()=>{}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/buses/update/",
    "POST",
    session_id,
    formData,
    (data) => callback(data.bus),
    errorCase,
    navigate
  )
}
async function deleteBus(formData={}, session_id="", callback=()=>{}, errorCase=null, navigate=null){
  await makeRequest(
    "admin/buses/delete/",
    "POST",
    session_id,
    formData,
    () => callback(),
    errorCase,
    navigate
  )
}
export {getBuses, getActiveBuses, getBusesName, addBus, updateBus, deleteBus}