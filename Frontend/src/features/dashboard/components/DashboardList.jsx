import { LayoutGrid, Menu, Search } from "lucide-react";
import Container from "../../../components/Container";
import { useState } from "react";
import CompanyInformationGrid from "../datamanage/shipcompany/components/CompanyInformationGrid";
import { useSelector } from "react-redux";
import { HelpCenter } from "../workmanage/components/HelpCenter";
// import HelpCenterPage from "../workmanage/pages/HelpCenterPage";

const DashboardList = () => {

    const selectedItem = useSelector((state) => state.selectedItem);//global state

  const [activeButton, setActiveButton] = useState("overview");

  const handleClick = (button) => {
    setActiveButton(button);
  };
  return (
    <div className="">
      <div className="flex gap-3 pt-4  px-4">
        {/* <button
          onClick={() => handleClick("overview")}
          className={`button ${
            activeButton === "overview"
              ? "text-black border-b-2 border-blue-500"
              : "text-gray-500"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => handleClick("register")}
          className={`button ${
            activeButton === "register"
              ? "text-black border-b-2 border-blue-500"
              : "text-gray-500"
          }`}
        >
          Register
        </button> */}
      </div>
      {/* Header */}
      <Container>
        <header className="flex items-center justify-between py-4 lg:gap-4 ">
          {/* <h1 className="text-2xl font-semibold text-black">{selectedItem.selectedItem} List</h1> */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            {/* <div className="relative">
              <input
                type="text"
                placeholder="Quick Search in......"
                className="w-64 px-4 py-2 text-sm  text-white rounded-md border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div> */}
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              {/* <button className="p-2 text-gray-400 hover:text-primary">
                <Menu className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-primary">
                <LayoutGrid className="w-5 h-5" />
              </button> */}
            </div>
          </div>
        </header>
      </Container>

      {/* Content */}
      <main className="p-6">
        {/* <CompanyInformationGrid/> */}
        <HelpCenter/>
      </main>
    </div>
  );
};

export default DashboardList;
