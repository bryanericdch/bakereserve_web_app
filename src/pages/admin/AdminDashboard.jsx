import { useEffect, useState } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import SoupKitchenOutlinedIcon from "@mui/icons-material/SoupKitchenOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SortIcon from "@mui/icons-material/Sort";
import CakeIcon from "@mui/icons-material/Cake";
import BakeryDiningIcon from "@mui/icons-material/BakeryDining";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";

const API_URL = "https://bakereserve-api.onrender.com/api";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [mainView, setMainView] = useState("manage");
  const [statusTab, setStatusTab] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [statsPeriod, setStatsPeriod] = useState("month");
  const [rankSort, setRankSort] = useState("highest");

  const [selectedOrder, setSelectedOrder] = useState(null);

  // Custom Cancel/Reject Modal State
  const [confirmCancel, setConfirmCancel] = useState({
    open: false,
    id: null,
    status: null,
  });
  const [rejectReason, setRejectReason] = useState("");

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/orders`, config);
      setOrders(data);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getCount = (status) => {
    const filteredByType = orders.filter((o) =>
      typeFilter === "all" ? true : o.orderType === typeFilter,
    );
    if (status === "all") return filteredByType.length;
    if (status === "rejected_cancelled")
      return filteredByType.filter((o) =>
        ["rejected", "cancelled"].includes(o.orderStatus),
      ).length;
    return filteredByType.filter((o) => o.orderStatus === status).length;
  };

  const statusTabs = [
    {
      id: "pending",
      label: "Pending",
      icon: <AccessTimeOutlinedIcon />,
      color: "text-amber-500",
      border: "border-amber-200",
    },
    {
      id: "approved",
      label: "Approved",
      icon: <ThumbUpOutlinedIcon />,
      color: "text-blue-500",
      border: "border-blue-200",
    },
    {
      id: "in_process",
      label: "In Process",
      icon: <SoupKitchenOutlinedIcon />,
      color: "text-purple-500",
      border: "border-purple-200",
    },
    {
      id: "ready_for_pickup",
      label: "Ready",
      icon: <LocalShippingOutlinedIcon />,
      color: "text-indigo-500",
      border: "border-indigo-200",
    },
    {
      id: "completed",
      label: "Completed",
      icon: <CheckCircleOutlineIcon />,
      color: "text-green-500",
      border: "border-green-200",
    },
    {
      id: "rejected",
      label: "Rejected",
      icon: <CancelOutlinedIcon />,
      color: "text-red-500",
      border: "border-red-200",
    },
  ];

  const updateStatus = async (id, status, reason = "") => {
    setActionLoading(id);
    try {
      await axios.put(
        `${API_URL}/orders/${id}/status`,
        { status, rejectReason: reason },
        config,
      );
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, orderStatus: status });
      }
    } catch (error) {
      console.error(error);
      alert(
        `Update failed: ${error.response?.data?.message || "Server Error"}`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getManageOrders = () => {
    const now = new Date();
    return orders.filter((order) => {
      if (statusTab === "rejected") {
        if (!["rejected", "cancelled"].includes(order.orderStatus))
          return false;
      } else if (statusTab !== "all" && order.orderStatus !== statusTab)
        return false;

      if (typeFilter !== "all" && order.orderType !== typeFilter) return false;

      const orderDate = new Date(order.createdAt);
      if (
        dateFilter === "today" &&
        orderDate.toDateString() !== now.toDateString()
      )
        return false;
      if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        if (orderDate < weekAgo) return false;
      }
      return true;
    });
  };

  const getStats = () => {
    const now = new Date();
    const filteredByTime = orders.filter((order) => {
      const d = new Date(order.createdAt);
      if (statsPeriod === "day") return d.toDateString() === now.toDateString();
      if (statsPeriod === "month")
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      if (statsPeriod === "year") return d.getFullYear() === now.getFullYear();
      return true;
    });

    const completed = filteredByTime.filter(
      (o) => o.orderStatus === "completed",
    );
    const revenue = completed.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const breadMap = {};
    const cakeMap = {};

    completed.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (order.orderType === "cake" || order.orderType === "custom_cake") {
          const key = item.customization?.shape || item.name;
          cakeMap[key] = (cakeMap[key] || 0) + item.quantity;
        } else {
          const key = item.name;
          breadMap[key] = (breadMap[key] || 0) + item.quantity;
        }
      });
    });

    const sortRank = (map) =>
      Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) =>
          rankSort === "highest" ? b.count - a.count : a.count - b.count,
        )
        .slice(0, 10);
    return {
      total: filteredByTime.length,
      completed: completed.length,
      rejected: filteredByTime.filter((o) =>
        ["rejected", "cancelled"].includes(o.orderStatus),
      ).length,
      revenue,
      breadRank: sortRank(breadMap),
      cakeRank: sortRank(cakeMap),
    };
  };

  const statsData = getStats();

  const rejectionReasons = [
    "Delivery address is out of our shop range.",
    "Selected items are unexpectedly out of stock.",
    "Store is currently fully booked for the selected date.",
    "Custom cake instructions cannot be accommodated.",
    "Other/Contact Store for details.",
  ];

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex">
          <button
            onClick={() => setMainView("manage")}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${mainView === "manage" ? "bg-slate-800 text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <Inventory2OutlinedIcon fontSize="small" /> Manage
          </button>
          <button
            onClick={() => setMainView("stats")}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${mainView === "stats" ? "bg-slate-800 text-white" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <TrendingUpIcon fontSize="small" /> Statistics
          </button>
        </div>
      </div>

      {mainView === "manage" && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {statusTabs.map((tab) => {
              const isActive = statusTab === tab.id;
              const count = getCount(
                tab.id === "rejected" ? "rejected_cancelled" : tab.id,
              );
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusTab(tab.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left flex flex-col justify-between h-24 ${isActive ? `bg-white ${tab.border} shadow-md ring-1 ring-offset-1 ring-slate-300` : "bg-white border-transparent hover:border-gray-200 hover:shadow-sm opacity-70 hover:opacity-100"}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-gray-700" : "text-gray-400"}`}
                    >
                      {tab.label}
                    </span>
                    <span
                      className={`${tab.color} ${isActive ? "opacity-100" : "opacity-50"}`}
                    >
                      {tab.icon}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800 mt-2">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-4 px-1 gap-4">
            <h2 className="text-lg font-bold text-gray-700 capitalize">
              {statusTab.replace("_", " ")} Orders
            </h2>
            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white border border-gray-300 text-sm rounded-lg p-2 focus:ring-amber-500 shadow-sm flex-1 md:flex-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past 7 Days</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border border-gray-300 text-sm rounded-lg p-2 focus:ring-amber-500 shadow-sm flex-1 md:flex-none"
              >
                <option value="all">All Types</option>
                <option value="custom_cake">Custom Cakes</option>
                <option value="cake">Pre-made Cakes</option>
                <option value="bakery">Bakery Packs</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pb-10">
            {loading ? (
              <div className="flex justify-center py-20">
                <CircularProgress />
              </div>
            ) : getManageOrders().length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <Inventory2OutlinedIcon
                  className="text-gray-300 mb-2"
                  style={{ fontSize: 40 }}
                />
                <p className="text-gray-400 font-medium">No orders found.</p>
              </div>
            ) : (
              getManageOrders().map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between gap-4 hover:border-blue-300 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-lg text-gray-800">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      {order.orderType === "custom_cake" ? (
                        <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-bold border border-purple-200 flex items-center gap-1">
                          <CakeIcon style={{ fontSize: 12 }} /> CUSTOM CAKE
                        </span>
                      ) : order.orderType === "cake" ? (
                        <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold border border-pink-200 flex items-center gap-1">
                          <CakeIcon style={{ fontSize: 12 }} /> PRE-MADE CAKE
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-bold border border-amber-200 flex items-center gap-1">
                          <BakeryDiningIcon style={{ fontSize: 12 }} /> BAKERY
                          PACKS
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>{" "}
                        <span className="font-semibold text-gray-900">
                          {order.user?.firstName} {order.user?.lastName}
                        </span>
                      </p>
                      <p className="pl-4 text-xs text-gray-500 truncate max-w-md">
                        {order.orderItems
                          .map((i) => `${i.quantity}x ${i.name}`)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 min-w-[200px]">
                    <div className="flex items-center gap-3 w-full justify-between">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-xs font-bold transition-colors"
                      >
                        <VisibilityOutlinedIcon fontSize="small" /> DETAILS
                      </button>
                      <p className="font-bold text-lg text-gray-800">
                        ₱ {order.totalPrice.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex gap-2 w-full mt-2">
                      {order.orderStatus === "pending" && (
                        <button
                          onClick={() => updateStatus(order._id, "approved")}
                          disabled={actionLoading === order._id}
                          className="flex-1 bg-slate-900 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 shadow-sm transition disabled:opacity-50"
                        >
                          {actionLoading === order._id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            "APPROVE"
                          )}
                        </button>
                      )}
                      {order.orderStatus === "approved" && (
                        <button
                          onClick={() => updateStatus(order._id, "in_process")}
                          disabled={actionLoading === order._id}
                          className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
                        >
                          {actionLoading === order._id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            "START PROCESS"
                          )}
                        </button>
                      )}
                      {order.orderStatus === "in_process" && (
                        <button
                          onClick={() =>
                            updateStatus(order._id, "ready_for_pickup")
                          }
                          disabled={actionLoading === order._id}
                          className="flex-1 bg-purple-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 shadow-sm transition disabled:opacity-50"
                        >
                          {actionLoading === order._id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            "READY FOR PICKUP"
                          )}
                        </button>
                      )}
                      {order.orderStatus === "ready_for_pickup" && (
                        <button
                          onClick={() => updateStatus(order._id, "completed")}
                          disabled={actionLoading === order._id}
                          className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm transition disabled:opacity-50"
                        >
                          {actionLoading === order._id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            "COMPLETE"
                          )}
                        </button>
                      )}

                      {/* Cancel / Reject Button for ALL Active Stages */}
                      {[
                        "pending",
                        "approved",
                        "in_process",
                        "ready_for_pickup",
                      ].includes(order.orderStatus) && (
                        <button
                          onClick={() => {
                            setRejectReason("");
                            setConfirmCancel({
                              open: true,
                              id: order._id,
                              status:
                                order.orderStatus === "pending"
                                  ? "rejected"
                                  : "cancelled",
                            });
                          }}
                          disabled={actionLoading === order._id}
                          className="px-3 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition disabled:opacity-50 flex items-center justify-center"
                          title={
                            order.orderStatus === "pending"
                              ? "Reject Order"
                              : "Cancel Order"
                          }
                        >
                          {actionLoading === order._id ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            <CancelOutlinedIcon fontSize="small" />
                          )}
                        </button>
                      )}
                    </div>

                    {["completed", "rejected", "cancelled"].includes(
                      order.orderStatus,
                    ) && (
                      <span
                        className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded border ${order.orderStatus === "completed" ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200"}`}
                      >
                        {order.orderStatus}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* STATISTICS VIEW */}
      {mainView === "stats" && (
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex">
              {["day", "month", "year"].map((period) => (
                <button
                  key={period}
                  onClick={() => setStatsPeriod(period)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${statsPeriod === period ? "bg-amber-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  This {period}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 p-4 opacity-5">
                <AttachMoneyIcon style={{ fontSize: 100, color: "green" }} />
              </div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">
                Revenue
              </p>
              <h2 className="text-3xl font-black text-gray-800">
                ₱ {statsData.revenue.toLocaleString()}
              </h2>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 p-4 opacity-5">
                <Inventory2OutlinedIcon
                  style={{ fontSize: 100, color: "blue" }}
                />
              </div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">
                Total Orders
              </p>
              <h2 className="text-3xl font-black text-gray-800">
                {statsData.total}
              </h2>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 p-4 opacity-5">
                <CheckCircleOutlineIcon
                  style={{ fontSize: 100, color: "orange" }}
                />
              </div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">
                Completed
              </p>
              <h2 className="text-3xl font-black text-gray-800">
                {statsData.completed}
              </h2>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 p-4 opacity-5">
                <CancelOutlinedIcon style={{ fontSize: 100, color: "red" }} />
              </div>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">
                Rejected
              </p>
              <h2 className="text-3xl font-black text-gray-800">
                {statsData.rejected}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 flex justify-between items-end border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUpIcon className="text-amber-500" /> Product Rankings
                (Top 10)
              </h2>
              <button
                onClick={() =>
                  setRankSort(rankSort === "highest" ? "lowest" : "highest")
                }
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <SortIcon fontSize="small" /> Showing:{" "}
                {rankSort === "highest" ? "Best Selling" : "Least Selling"}
              </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">
                Top Bakery Packs
              </h3>
              {statsData.breadRank.length === 0 ? (
                <p className="text-gray-400 text-sm">No sales data.</p>
              ) : (
                <div className="space-y-3">
                  {statsData.breadRank.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx < 3 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-gray-700 font-medium">
                          {item.name}
                        </span>
                      </span>
                      <span className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">
                        {item.count} sold
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">
                Top Cakes
              </h3>
              {statsData.cakeRank.length === 0 ? (
                <p className="text-gray-400 text-sm">No sales data.</p>
              ) : (
                <div className="space-y-3">
                  {statsData.cakeRank.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx < 3 ? "bg-pink-100 text-pink-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-gray-700 font-medium">
                          {item.name}
                        </span>
                      </span>
                      <span className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">
                        {item.count} sold
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM CANCEL / REJECT MODAL --- */}
      <Dialog
        open={confirmCancel.open}
        onClose={() =>
          setConfirmCancel({ open: false, id: null, status: null })
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="font-bold text-red-600 border-b pb-3">
          Confirm Action
        </DialogTitle>
        <DialogContent className="pt-4 space-y-4">
          <p className="text-gray-700 font-medium">
            Are you sure you want to{" "}
            <b>{confirmCancel.status === "rejected" ? "reject" : "cancel"}</b>{" "}
            this order?
          </p>

          {confirmCancel.status === "rejected" && (
            <TextField
              select
              fullWidth
              size="small"
              label="Reason for Rejection"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            >
              {rejectionReasons.map((reason, idx) => (
                <MenuItem key={idx} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </TextField>
          )}
          <p className="text-xs text-gray-500">
            The customer will be notified of this update.
          </p>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #f3f4f6" }}>
          <Button
            onClick={() =>
              setConfirmCancel({ open: false, id: null, status: null })
            }
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Go Back
          </Button>
          <Button
            onClick={() => {
              updateStatus(
                confirmCancel.id,
                confirmCancel.status,
                rejectReason,
              );
              setConfirmCancel({ open: false, id: null, status: null });
            }}
            variant="contained"
            color="error"
            disabled={confirmCancel.status === "rejected" && !rejectReason}
            sx={{ fontWeight: "bold" }}
          >
            Yes, {confirmCancel.status === "rejected" ? "Reject" : "Cancel"}{" "}
            Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- ORDER DETAILS MODAL (Now includes Contact & Address) --- */}
      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle className="flex justify-between items-center font-bold border-b pb-4">
              <span>Order #{selectedOrder._id.slice(-6).toUpperCase()}</span>
              <IconButton onClick={() => setSelectedOrder(null)}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">
                    Customer Info
                  </h4>
                  <p className="font-bold text-gray-800">
                    {selectedOrder.user?.firstName}{" "}
                    {selectedOrder.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.user?.email}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Phone:</span>{" "}
                    {selectedOrder.user?.contactNumber || "Not provided"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-semibold">Address:</span>{" "}
                    {selectedOrder.user?.address || "Not provided"}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="text-xs font-bold text-amber-700 uppercase mb-2">
                    Pickup/Delivery Details
                  </h4>
                  <p className="font-bold text-gray-800">
                    Date:{" "}
                    {new Date(selectedOrder.pickupDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-800 font-bold">
                    Time: {selectedOrder.pickupTime}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 capitalize border-t border-amber-200 pt-1">
                    Payment: {selectedOrder.paymentMethod} (
                    {selectedOrder.paymentStatus})
                  </p>
                </div>
              </div>

              <h4 className="font-bold text-gray-800 border-b pb-2 mb-4">
                Order Items
              </h4>
              <div className="space-y-4">
                {selectedOrder.orderItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start"
                  >
                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg border flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase text-center p-2">
                        No Image
                      </div>
                    )}
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start">
                        <h5 className="font-bold text-gray-800 text-lg">
                          <span className="text-amber-500 mr-2">
                            {item.quantity}x
                          </span>
                          {item.name}
                        </h5>
                        <p className="font-bold text-gray-800 text-lg">
                          ₱{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        Price per unit: ₱{item.price}
                      </p>
                      {item.customization &&
                        Object.keys(item.customization).length > 0 && (
                          <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg mt-2">
                            <p className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-2">
                              Customization Details
                            </p>
                            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                              {item.customization.flavor && (
                                <li>
                                  <b>Flavor:</b> {item.customization.flavor}
                                </li>
                              )}
                              {item.customization.shape && (
                                <li>
                                  <b>Shape:</b> {item.customization.shape}
                                </li>
                              )}
                              {item.customization.size && (
                                <li>
                                  <b>Size:</b> {item.customization.size}
                                </li>
                              )}
                              {item.customization.tiers &&
                                item.customization.tiers !== "N/A" && (
                                  <li>
                                    <b>Tiers:</b> {item.customization.tiers}
                                  </li>
                                )}
                              {item.customization.message && (
                                <li>
                                  <b>Dedication:</b> "
                                  {item.customization.message}"
                                </li>
                              )}
                              {item.customization.notes && (
                                <li>
                                  <b>Notes:</b> {item.customization.notes}
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  );
};
export default AdminDashboard;
