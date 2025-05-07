import { Suspense } from "react";
import { Outlet, useLocation} from "react-router-dom";
import Footer from "../../../components/Footer"
import SidebarDashboard from "./SidebarDashboard";
import TopBar from "./TopBar";
import PageLoading from "../../../components/PageLoading"

const DashboardLayout = () => {
  const location = useLocation();
  
  const isFlightMap = location.pathname === "/dashboard";
   
  return (
    <div className="flex bg-[#f8f9fe]">
      <SidebarDashboard />
      {/* Main Content */}
      <div className="flex flex-1 flex-col w-5/6 min-h-screen justify-between">
      {!isFlightMap && (
        <div className="w-full p-3">
          <TopBar />
        </div>
      )}
        <div className="flex flex-col min-h-screen xl:min-h-[700px] w-full">
          <Suspense fallback={<PageLoading/>}>
            <Outlet />
          </Suspense>
        </div>
      <div className="w-full lg:px-6 xl:px-0 bottom-0">
      {!isFlightMap && <Footer/>}
      </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
