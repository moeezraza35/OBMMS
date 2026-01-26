import { useContext, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { LoadingContext } from "../context/loading"
import { AuthContext } from "../context/auth"
import { getModels } from "../utils/models"
import { frontend } from "../config"
import UsersTable from "./usertable"
import GroupTable from "./grouptable"
import Aside from "../components/aside"
import TitleBar from "../components/titlebar"
import BusTable from "./bustable"
import Location from "../components/location"
import redirect from "../utils/redirect"

function Dashboard(){
  const params = useParams()
  const [models, setModels] = useState([])
  const {setLoading} = useContext(LoadingContext)
  const {user, checkFlag, session_id} = useContext(AuthContext)
  const navigate = useNavigate()
  const loadData = async () => {
    if (!checkFlag) {
      return
    }
    await redirect(user, navigate)
    setLoading(true)
    getModels(
      session_id,
      data => {
        setModels(data)
      },
      null,
      navigate
    )
  }
  useEffect(() => {
    loadData()
    .then(() => setLoading(false))
  }, [checkFlag])
  return (
    <main className="flex relative">
      <Aside title="Activities">
        {models.map((model) => (
          <li key={model} className={params.model==model?"active":""}>
            <Link to={frontend+"/dashboard/"+model+'/'}>{model}</Link>
          </li>
        ))}
      </Aside>
      <section className="flex-1 min-w-max mr-2 overflow-x-auto">
        <TitleBar>Dashboard</TitleBar>
        {params.model==="users"?<UsersTable/>
        :params.model==="group"?<GroupTable models={models}/>
        :params.model==="buses"?<BusTable/>
        :params.model === "location" || params.model === "stops"?<Location/>
        :""}
      </section>
    </main>
  )
}
export default Dashboard