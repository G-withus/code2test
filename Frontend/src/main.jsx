import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import router from "./routes/router";
import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux"; // Import the Provider from 'react-redux'
import {  store,persistor } from "./stores/store";
import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}> {/* Wrap your app with the Provider and pass the store */}
      <PersistGate loading={null} persistor={persistor}> {/* Wrap the app with the PersistGate */}
      <RouterProvider router={router}></RouterProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);