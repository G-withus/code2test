import { configureStore, combineReducers } from "@reduxjs/toolkit";
import selectedItemReducer from "./selectedItem";

import { persistReducer, persistStore } from "redux-persist";
import languageReducer from "../stores/language/languageSlice"; //translation
import flightDataReducer from "./flightData/flightData";
import storage from "redux-persist/lib/storage";


// Persist Config
const persistConfig = {
  key: "root",
  storage,
};

// Root Reducer with Persist
const rootReducer = combineReducers({
  selectedItem: persistReducer(persistConfig, selectedItemReducer),

  language: languageReducer,
  flightData: flightDataReducer
});

// Store Configuration
export const store = configureStore({
  reducer: rootReducer,
});

// Persistor
export const persistor = persistStore(store);
