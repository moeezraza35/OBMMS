async function getHistory(session_id="", callback = () => {}, errorCase=null, navigate=null){
  callback([{id: 1, package: 1, amount: 5000, date: "2026-1-20", time: "12:00:00"}])
}
async function deleteHistory(){}

export {getHistory, deleteHistory}