import { MoreHorizontal } from "lucide-react";
import React from "react";
import useSWR from "swr";
import PortRow from "./PortRow";


const fetcher = (url) => fetch(url).then((res) => res.json());

const PortShowResult = () => {
  const { data, isLoading, error } = useSWR(
   "http://3.34.40.154:8080/api/ports/list",
    fetcher
  );

  return (
    <div className="w-full max-w-4xl mx-auto mt-10">
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">
                IP
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">
                Port
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
          {data?.map((port) => (
            <PortRow key={port.id} port={port} />
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortShowResult;
