import DashboardLayout from "../features/dashboard/components/DashboardLayout";
import RealTimeInfo from "../features/dashboard/control/components/RealTimeInfo"
import realTimeInfoRoute from "./RealTimeInfoRoute"
import connectInfoRoute from "../routes/connectInfoRoute"
import flightDataRoute from "./flightDataRoute";

const dashboardRoute = [
  {
    path: "/dashboard",
    element: <DashboardLayout/>,
    children: [
      {
        index: true, // Redirect to RealTimeInfo after login
        element: <RealTimeInfo />,
      },
      ...realTimeInfoRoute,
      ...flightDataRoute,
      ...connectInfoRoute
    ],
  },
];

export default dashboardRoute;
