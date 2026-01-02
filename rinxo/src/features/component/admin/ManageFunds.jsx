import { FileText, Minus, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { usersData } from "../../../utils/user.utils";
import ManageFundsReport from "./Manage Funds Report/ManageFundsReport";

export default function ManageFunds() {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await usersData();
      setUsers(data.data);
    };
    fetchUsers();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(3);

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="p-6">
      {showReport ? (
        <ManageFundsReport userId={userId} setShowReport={setShowReport} />
      ) : (
        <>
          {/* Dropdown for users per page */}
          <div className="flex justify-end mb-4">
            <label className="mr-2 text-gray-700 font-medium">
              Users per page:
            </label>
            <select
              value={usersPerPage}
              onChange={handleUsersPerPageChange}
              className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-yellow-400"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={users.length}>All</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
            <table className="w-full text-left">
              <thead className="border-b-2 border-gray-200 bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-gray-600 font-semibold">Id</th>
                  <th className="py-3 px-4 text-gray-600 font-semibold">
                    Name
                  </th>
                  <th className="py-3 px-4 text-gray-600 font-semibold">
                    Email
                  </th>
                  {/* <th className="py-3 px-4 text-gray-600 font-semibold">Phone</th> */}
                  <th className="py-3 px-4 text-gray-600 font-semibold">
                    Status
                  </th>
                  <th className="py-3 px-4 text-gray-600 font-semibold">
                    Balance
                  </th>
                  <th className="py-3 px-4 text-gray-600 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4 font-medium text-gray-800">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-800">
                      {user.fullName}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{user.email}</td>
                    {/* <td className="py-4 px-4 text-gray-600">{user.phone}</td> */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          // in your table & modal
                          user.status === "active"
                            ? "bg-green-100 text-green-700"
                            : user.status === "inActive"
                            ? "bg-gray-100 text-gray-700"
                            : user.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-800 font-semibold">
                      ${user.funds.toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <div className="flex gap-2">
                          <button className="flex-1 text-green-500 hover:text-green-800    transition-colors ">
                            <Plus size={18} />
                          </button>

                          <button className="flex-1 text-red-500 hover:text-red-800   transition-colors  ">
                            <Minus size={18} />
                          </button>

                          <button
                            className="flex-1 text-orange-500 hover:text-orange-800  transition-colors  "
                            onClick={() => {
                              setUserId(user._id);
                              setShowReport(true);
                            }}
                          >
                            <FileText size={18} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-semibold ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-semibold ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
