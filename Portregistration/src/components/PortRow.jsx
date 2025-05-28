
import { Edit, Trash, Trash2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useSWRConfig } from "swr";

const PortRow = ({ port }) => {
    const { id } = port;
  const { mutate } = useSWRConfig();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteBtn = async () => {
    setIsDeleting(true);

    await fetch(`http://13.209.33.15:8080/api/ports/delete/${id}`, {
      method: "DELETE",
    });
    toast.success("Port deleted successfully");
    mutate("http://13.209.33.15:8080/api/ports/list");
  };
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border border-gray-300">
          {port.ipAddress}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border border-gray-300">
          {port.port}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border border-gray-300">
        <td className="px-6 py-4 text-end flex gap-2">
  
        <button
            type="button"
            onClick={handleDeleteBtn}
            className="size-6 flex justify-center items-center text-sm font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white"
          >
         <Trash2 className="size-6"/>
   
          </button>
      </td>
        </td>
      </tr>
    </>
  );
};

export default PortRow;
