import { Edit, Eye, Plus, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { userDeleteData, usersData, usersUpdateData } from "../../../utils/user.utils";
import { toast } from "react-toastify";

export default function UserProfile({ users, setUsers }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    funds: "",
    status: "inActive",
    role: "user",
  });

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);

    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        funds: user.funds ?? "",
        status: user.status || "inActive",
        role: user.role || "user",
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        funds: "",
        status: "inActive",
        role: "user",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      funds: "",
      status: "inActive",
      role: "user",
    });
  };
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [userToDelete, setUserToDelete] = useState(null);

  const handleDeleteClick = (user) => {
  setUserToDelete(user);
  setShowDeleteModal(true);
};


  const statusCounts = users.reduce(
    (acc, user) => {
      acc.all += 1;

      if (user.status === "active") acc.active += 1;
      else if (user.status === "inActive") acc.inActive += 1;
      else if (user.status === "pending") acc.pending += 1;
      else if (user.status === "rejected") acc.rejected += 1;

      return acc;
    },
    {
      all: 0,
      active: 0,
      inActive: 0,
      pending: 0,
      rejected: 0,
    }
  );

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
      alert("Please fill in all required fields");
      return;
    }

    if (modalType === "add") {
      const newUser = {
        _id: Date.now().toString(),
        ...formData,
        funds: Number(formData.funds),
        createdAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
      closeModal();
    }

    if (modalType === "edit") {
      try {
        // Update user via API
        let updateData = await usersUpdateData(selectedUser._id, {
          status: formData.status,
        }); 
        if (updateData.success === true) {
          toast.success(updateData.message);
        }else{
          toast.error(updateData.message);
        }

        // Refetch all users from API to update table
        const updatedUsersData = await usersData();
        setUsers(updatedUsersData.data);

        closeModal();
      } catch (error) {
        console.error(error);
        alert("Failed to update user");
      }
    }
  };

  const confirmDelete = async () => {
  try {
    const deleteData = await userDeleteData(userToDelete._id);

    if (deleteData.success === true) {
      toast.success(deleteData.message);

      // Remove user from UI
      setUsers(users.filter((u) => u._id !== userToDelete._id));
    } else {
      toast.error(deleteData.message);
    }
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete user");
  } finally {
    setShowDeleteModal(false);
    setUserToDelete(null);
  }
};


  // Filtered & paginated users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user._id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);

    const matchesStatus =
      statusFilter === "All" ? true : user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handleUsersPerPageChange = (e) => {
    setUsersPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6">
        {/* Top Controls */}
        <div className="flex flex-col gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            User Management
          </h2>

          {/* Search Bar - Full Width on Mobile */}
          <input
            type="text"
            placeholder="Search by name, email, or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
          />

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none sm:w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            >
              <option value="All">All ({statusCounts.all})</option>
              <option value="active">Active ({statusCounts.active})</option>
              <option value="inActive">
                Inactive ({statusCounts.inActive})
              </option>
              <option value="pending">Pending ({statusCounts.pending})</option>
              <option value="rejected">
                Rejected ({statusCounts.rejected})
              </option>
            </select>

            <select
              value={usersPerPage}
              onChange={handleUsersPerPageChange}
              className="flex-1 sm:flex-none sm:w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={users.length}>All</option>
            </select>

            {/* <button
              onClick={() => openModal("add")}
              className="flex-1 sm:flex-none bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              <Plus size={18} /> Add User
            </button> */}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {currentUsers.map((user) => (
            <div
              key={user._id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1">
                    {user.fullName}
                  </h3>
                  <p className="text-sm text-gray-600 break-all">
                    {user.email}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                    user.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : user.status === "inActive"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {user.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <p className="font-medium text-gray-900 break-all">
                    {user.phoneNumber}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Funds:</span>
                  <p className="font-bold text-gray-900">
                    ${user.funds.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Role:</span>
                  <p className="font-medium text-gray-900">{user.role}</p>
                </div>
                <div>
                  <span className="text-gray-500">ID:</span>
                  <p className="font-medium text-gray-900 text-xs">
                    {user._id.slice(-8)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => openModal("view", user)}
                  className="flex-1 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                >
                  <Eye size={16} /> View
                </button>
                <button
                  onClick={() => openModal("edit", user)}
                  className="flex-1 py-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                >
                  <Edit size={16} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(user._id)}
                  className="flex-1 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                  ID
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                  Full Name
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                  Phone Number
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                  Funds
                </th>
                <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
                  Status
                </th>

                <th className="text-left py-3 px-4 text-gray-600 font-semibold text-sm">
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
                  <td className="py-3 px-4 font-medium text-gray-800 text-sm">
                    {/* {user._id.slice(-8)} */}
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-800 text-sm">
                    {user.fullName}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {user.email}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {user.phoneNumber}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-semibold text-sm">
                    ${user.funds.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
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

                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal("view", user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openModal("edit", user)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-sm ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
            }`}
          >
            Previous
          </button>

          <span className="text-gray-700 font-medium text-sm">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-sm ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                {modalType === "add" && "Add New User"}
                {modalType === "edit" && "Edit User"}
                {modalType === "view" && "User Details"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">
              {modalType === "view" && (
                <div className="flex flex-col lg:flex-row gap-6 bg-white ">
                  {/* Left: User Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Full Name
                      </label>
                      <p className="text-base font-semibold text-gray-800 break-words">
                        {selectedUser?.fullName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Email
                      </label>
                      <p className="text-base font-semibold text-gray-800 break-all">
                        {selectedUser?.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Phone Number
                      </label>
                      <p className="text-base font-semibold text-gray-800 break-all">
                        {selectedUser?.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Funds
                      </label>
                      <p className="text-base font-semibold text-gray-800">
                        ${selectedUser?.funds.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Status
                      </label>
                      <p className="text-base font-semibold text-gray-800">
                        {selectedUser?.status}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Role
                      </label>
                      <p className="text-base font-semibold text-gray-800">
                        {selectedUser?.role}
                      </p>
                    </div>
                  </div>

                  {/* Right: CNIC Images */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-600 block mb-1">
                        CNIC Front
                      </label>
                      {selectedUser?.nic?.frontImage ? (
                        <img
                          src={selectedUser.nic.frontImage}
                          alt="CNIC Front"
                          className="w-full h-auto border rounded-md shadow-md object-cover"
                        />
                      ) : (
                        <p className="text-gray-400 text-sm">
                          No CNIC front uploaded
                        </p>
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="text-sm text-gray-600 block mb-1">
                        CNIC Back
                      </label>
                      {selectedUser?.nic?.backImage ? (
                        <img
                          src={selectedUser.nic.backImage}
                          alt="CNIC Back"
                          className="w-full h-auto border rounded-md shadow-md object-cover"
                        />
                      ) : (
                        <p className="text-gray-400 text-sm">
                          No CNIC back uploaded
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {modalType === "edit" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-gray-300 bg-[#00000025] rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-gray-300 bg-[#00000025] rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inActive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={handleSubmit}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg transition text-sm"
                    >
                      {modalType === "add" ? "Add User" : "Update User"}
                    </button>
                    <button
                      onClick={closeModal}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {modalType === "add" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phoneNumber: e.target.value,
                        })
                      }
                      placeholder="+92 333 5486698"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Funds
                    </label>
                    <input
                      type="number"
                      value={formData.funds}
                      onChange={(e) =>
                        setFormData({ ...formData, funds: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    >
                      <option>Active</option>
                      <option>inActive</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    >
                      <option>user</option>
                      <option>admin</option>
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={handleSubmit}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-lg transition text-sm"
                    >
                      {modalType === "add" ? "Add User" : "Update User"}
                    </button>
                    <button
                      onClick={closeModal}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">
          Confirm Deletion
        </h3>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-700">
          Are you sure you want to delete this user?
        </p>

        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <p className="font-semibold">{userToDelete?.fullName}</p>
          <p className="text-gray-600">{userToDelete?.email}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex gap-3">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={confirmDelete}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}




    </div>
  );
}
