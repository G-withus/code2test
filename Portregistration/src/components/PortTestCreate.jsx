import React, { useState } from "react";
import { useForm } from "react-hook-form";
import PortListPage from "../pages/PortListPage";
import toast from "react-hot-toast";
import { mutate } from "swr";
import {RxOpenInNewWindow} from "react-icons/rx";

const PortTestCreate = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [isSending, setIsSending] = useState(false);

  const handleCreatePort = async (data) => {
    console.log("Create Port", data);
    setIsSending(true);

    try {
      const response = await fetch("http://13.209.33.15:8080/api/ports/register", {
        method: "POST",
        body: JSON.stringify({
          ipAddress: data.ipAddress,
          port: data.port,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        toast.success("Port create successfully");
        reset();
        mutate(`http://13.209.33.15:8080/api/ports/list`);
      } else if (response.status === 409) {
        toast.error("Port is already registered");
        reset();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create port");
      }
    } catch (error) {
      toast.error(error.message || "Failed to create port");
    } finally {
      setIsSending(false);
    }
  };
  return (
    <div className="w-full max-w-sm mx-auto mt-10">
      <form onSubmit={handleSubmit(handleCreatePort)} className="space-y-4">
        {/* Input for IP */}
        <div>
          <label
            htmlFor="ip"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <span>IP</span>
            <span className="text-xs text-blue-600 cursor-pointer flex items-center"
                  onClick={() => window.open("https://whatismyipaddress.com/")}>(Check your IP here 
                  <RxOpenInNewWindow className="text-sm" />)
                  </span>
          </label>
          <input
            {...register("ipAddress", { required: "ipAddress is required" })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.ipAddress && (
            <p className="text-red-500 text-xs">{errors.ipAddress.message}</p>
          )}
        </div>

        {/* Input for port */}
        <div>
          <label
            htmlFor="port"
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <span>Port Number</span>
            <span className="text-xs text-red-600 ">(14000 ~ 14050)</span>
          </label>
          <input
            {...register("port", {
              required: "Port Number is required",
              pattern: {
                value: /^[0-9]+$/,
                message: "Port must be a number",
              },
            })}
            id="port"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.port && (
            <p className="text-red-500 text-xs">{errors.port.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Submit
        </button>
      </form>

      <div className="flex gap-1 w-full justify-center items-center mt-2 text-sm">
        <span>Remote-Server IP:</span>
        <span className="text-blue-600">13.209.33.15</span>
      </div>

      <PortListPage />
    </div>
  );
};

export default PortTestCreate;
