async function getPackages(session_id="", callback = () => {}, errorCase=null, navigate=null){
  return [{id: 1, user: 1, price: 10000.00, amount: "Rs. 5,000", installments: 1, start: "2026-1-1", end: "2026-2-28", active: true}]
}
async function addPackages(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){}
async function updatePackages(formData, session_id="", callback = () => {}, errorCase=null, navigate=null){}
async function deletePackages(){}

export {getPackages, addPackages, updatePackages, deletePackages}