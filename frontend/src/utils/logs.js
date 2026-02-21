async function getLogs(session_id="", callback = () => {}, errorCase=null, navigate=null){
  callback([{id: 1, model: "users", action: "c", row: "1", date: "2026-1-1", time: "12:00:00"}])
}
async function deleteLogs(){}

export {getLogs, deleteLogs}