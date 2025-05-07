
import {

    createAsyncThunk,
    createSlice,
  } from "@reduxjs/toolkit";
  import axios from "axios";
  
  const VITE_API_URL = "http://3.34.40.154:5004";

  export const fetchFlightData =createAsyncThunk(
    "flightData/fetchFlightData",
    async(_,{rejectWithValue})=>{
      try{
        const response = await axios.get(`${VITE_API_URL}/flightData`);
        return response.data;
      }catch(error){
        return rejectWithValue(error.response?.data || "Failed to fetch flight data.");
      }
    }
  );

  const flightDataSlice= createSlice({
    name:"flightData",
    initialState:{
        flightData:[],
        currentFlightData:null,
        loading:false,
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder

        //fetch flight data
        .addCase(fetchFlightData.pending,(state)=>{
            state.loading = true;
          })
          .addCase(fetchFlightData.fulfilled,(state,action)=>{
            state.loading=false;
            state.flightData=action.payload;
          })
          .addCase(fetchFlightData.rejected,(state,action)=>{
            state.loading=false;
            state.error = action.payload || "An error occurred while fetching flight data"
          })
    }
  })

export default flightDataSlice.reducer;