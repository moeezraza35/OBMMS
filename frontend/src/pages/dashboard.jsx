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
import LocationTable from "./locationtable"
import StopsTable from "./stopstable"
import RoutesTable from "./routestable"
import PackagesTable from "./packagestable"
import HistoryTable from "./historytable"
import LogsTable from "./logstable"
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
    await getModels(
      session_id,
      data => setModels(data),
      null,
      navigate
    )
    setLoading(false)
  }
  useEffect(() => {
    loadData()
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
        :params.model==="location"?<LocationTable/>
        :params.model==="stops"?<StopsTable/>
        :params.model==="routes"?<RoutesTable/>
        :params.model==="packages"?<PackagesTable/>
        :params.model==="history"?<HistoryTable/>
        :<LogsTable/>}
      </section>
    </main>
  )
}
export default Dashboard