import { Link, useParams } from "react-router-dom"
import { frontend } from "../config"
import { UsersTable } from "../components/tables"
import Aside from "../components/aside"
import TitleBar from "../components/titlebar"

function Dashboard(){
  const params = useParams()
  return (
    <main className="flex relative">
      <Aside title="Activities">
        <li className={params.model=="users"?"active":""}>
          <Link to={frontend+"/dashboard/users/"}>Users</Link>
        </li>
        <li className={params.model=="groups"?"active":""}>
          <Link to={frontend+"/dashboard/groups/"}>Groups</Link>
        </li>
      </Aside>
      <section className="flex-1 min-w-max mr-2 overflow-x-auto">
        <TitleBar>Dashboard</TitleBar>
        {params.model=="users"?<UsersTable/>
        :""}
      </section>
    </main>
  )
}
export default Dashboard