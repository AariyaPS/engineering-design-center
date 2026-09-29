import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import "./MainLayout.css";

function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="app-main">
        <Topbar />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;



{/* Outlet is an important React Router concept. */}
{/* <Outlet /> tells React Router:

"Put whichever child page matches the current URL here." */}