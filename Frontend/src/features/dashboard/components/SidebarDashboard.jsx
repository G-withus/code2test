
import sidebarlogo from "../../../assets/aioceaneye_logo.png";
import versionlogo from "../../../assets/version_icon.png";
import { Link, useLocation } from "react-router-dom";
import { setSelectedItem } from "../../../stores/selectedItem/selectedItemSlice";
import { useDispatch } from "react-redux";
import { useTranslations } from '../../../components/Language';
import { FaConnectdevelop,  } from "react-icons/fa";
import { MdConnectedTv } from "react-icons/md";
import { TbWorldPin } from "react-icons/tb";



const SidebarDashboard = () => {

  const t = useTranslations();
  const dispatch = useDispatch();
  const loc = useLocation();

    const handleSelectItem = (item) => {
      dispatch(setSelectedItem(item)); // Dispatch the action to update selectedItem
    };

  return (
    <>
      {/* Sidebar */}
      <div className={`w-1/6 ${loc.pathname == "/dashboard" ? "h-screen" : "min-h-full"} bg-primary text-white flex flex-col overflow-scroll`}>
        {/* Logo Section */}
        <div className="p-4 border-b border-[#3B5BDC] flex mt-auto sticky top-0 z-50 bg-primary">
          <img src={sidebarlogo} alt="sidebarlogo" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2 sticky">
          <div className="space-y-1">
            {/* User Info */}
            <Link to="/dashboard" className="w-full flex items-center justify-between p-2 hover:bg-[#3B5BDC] rounded-md" onClick={() => handleSelectItem("Flight Map")}>
            <div className="flex items-center gap-3">
              <TbWorldPin  size={20} />
              <span>{t.flightMap}</span>
            </div>
          </Link>
            
            {/* Dashboard */}
            <Link to="/dashboard/flightdata" className="w-full flex items-center justify-between p-2 hover:bg-[#3B5BDC] rounded-md" onClick={() => handleSelectItem("Flight Data")}>
              <div className="flex items-center gap-3">
                <MdConnectedTv  size={20} />
                <span>{t.flightdata}</span>
              </div>
            </Link>


            {/* Help Center */}
            <Link to="/dashboard/connect-info" className="w-full flex items-center justify-between p-2 hover:bg-[#3B5BDC] rounded-md">
              <div className="flex items-center gap-3" onClick={() => handleSelectItem(t.connectInfo)}>
                <FaConnectdevelop  size={20} />
                <span>{t.connectInfo}</span>
              </div>
            </Link>
          </div>
        </nav>

        {/* Version */}
        <div className="flex items-center gap-3 px-4 pb-5">
          <img src={versionlogo} alt="logo" className="w-6 h-6" />
          <span> ver. 0.9.0</span>
        </div>
      </div>
    </>
  );
};

export default SidebarDashboard;
