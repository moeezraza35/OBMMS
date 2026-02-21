async function getRoutes(session_id="", callback = () => {}, errorCase=null, navigate=null){
  callback([{id: 1, departure: "City A", destination: "City B", bus: "Bus 1", time: "10:00", active: true}])
}
async function addRoute(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){}
async function updateRoute(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){}
async function deleteRoute(){}

export {getRoutes, addRoute, updateRoute, deleteRoute}