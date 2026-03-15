import { useEffect, useState } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";

import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloseIcon from "@mui/icons-material/Close";

const API_URL = "https://bakereserve-api.onrender.com/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, userId: null });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusInput, setStatusInput] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/users`, config);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openStatusModal = (user) => {
    setSelectedUser(user);
    setStatusInput(user.accountStatus);
    setWarningMessage(user.warningMessage || "");
    setModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (statusInput === "warned" && !warningMessage.trim())
      return alert("Please enter a warning message.");

    setActionLoading(true);
    try {
      await axios.put(
        `${API_URL}/users/${selectedUser._id}/status`,
        { status: statusInput, warningMessage },
        config,
      );
      setModalOpen(false);
      fetchUsers();
    } catch (error) {
      alert("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`${API_URL}/users/${deleteModal.userId}`, config);
      fetchUsers();
    } catch (error) {
      alert("Failed to delete user.");
    } finally {
      setDeleteModal({ open: false, userId: null });
    }
  };

  const getStatusColor = (status) => {
    if (status === "banned") return "error";
    if (status === "warned") return "warning";
    return "success";
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      <div className="max-w-7xl mx-auto mb-6 flex items-center gap-3">
        <ManageAccountsIcon fontSize="large" className="text-amber-500" />
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <CircularProgress />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                <tr>
                  <th className="p-4 border-b">Customer Name</th>
                  <th className="p-4 border-b">Contact Info</th>
                  <th className="p-4 border-b text-center">Purchases</th>
                  <th className="p-4 border-b text-center">Cancellations</th>
                  <th className="p-4 border-b text-center">Status</th>
                  <th className="p-4 border-b text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <span className="font-bold text-gray-800 block">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-gray-500">
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-700">
                        {user.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.contactNumber}
                      </p>
                    </td>
                    <td className="p-4 text-center font-bold text-green-600">
                      {user.purchaseCount}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`font-bold ${user.cancellationCount >= 3 ? "text-red-600" : "text-gray-600"}`}
                      >
                        {user.cancellationCount}
                      </span>
                      {user.cancellationCount >= 3 && (
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1"></p>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <Chip
                        label={user.accountStatus.toUpperCase()}
                        color={getStatusColor(user.accountStatus)}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <IconButton
                        color="primary"
                        onClick={() => openStatusModal(user)}
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          setDeleteModal({ open: true, userId: user._id })
                        }
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center font-bold border-b pb-3">
          Manage Account Status
          <IconButton onClick={() => setModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="pt-5 space-y-4">
          <p className="text-sm text-gray-600">
            Update status for{" "}
            <b>
              {selectedUser?.firstName} {selectedUser?.lastName}
            </b>
          </p>

          <TextField
            select
            fullWidth
            label="Account Status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
            size="small"
          >
            <MenuItem value="active">Active (Normal)</MenuItem>
            <MenuItem value="warned">Warned (Sends Alert)</MenuItem>
            <MenuItem value="banned">Banned (Cannot Login)</MenuItem>
          </TextField>

          {statusInput === "warned" && (
            <TextField
              fullWidth
              label="Warning Message"
              multiline
              rows={3}
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              size="small"
              placeholder="Reason for warning..."
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #f3f4f6" }}>
          <Button onClick={() => setModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            disabled={actionLoading}
            sx={{ bgcolor: "#111827" }}
          >
            {actionLoading ? "Saving..." : "Update Status"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete User Modal */}
      <Dialog
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, userId: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="font-bold text-red-600 border-b pb-3">
          Delete User Account
        </DialogTitle>
        <DialogContent className="pt-4">
          <p className="text-gray-700">
            Are you sure you want to permanently delete this user?
          </p>
          <p className="text-xs text-gray-500 mt-2">
            This action is irreversible and will remove their access to the
            system entirely.
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #f3f4f6" }}>
          <Button
            onClick={() => setDeleteModal({ open: false, userId: null })}
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            onClick={executeDelete}
            variant="contained"
            color="error"
            sx={{ fontWeight: "bold" }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
