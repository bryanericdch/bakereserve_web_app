import { useEffect, useState } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

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

// const API_URL = "http://localhost:5000/api";
const API_URL = "https://bakereserve-api.onrender.com/api";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mainView, setMainView] = useState("manage");
  const [statusTab, setStatusTab] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statsPeriod, setStatsPeriod] = useState("month");
  const [rankSort, setRankSort] = useState("highest");

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/orders`, config);
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getCount = (status) => {
    const filteredByType = orders.filter((o) => {
      if (typeFilter === "cake") return o.orderType === "cake";
      if (typeFilter === "custom_cake") return o.orderType === "custom_cake";
      if (typeFilter === "bakery") return o.orderType === "bakery";
      return true;
    });

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

  const updateStatus = async (id, status) => {
    const action = status === "rejected" ? "reject" : "mark as " + status;
    if (!window.confirm(`Are you sure you want to ${action} this order?`))
      return;
    try {
      await axios.put(`${API_URL}/orders/${id}/status`, { status }, config);
      fetchOrders();
    } catch {
      alert("Update failed");
    }
  };

  const getManageOrders = () => {
    return orders.filter((order) => {
      if (statusTab === "rejected") {
        if (!["rejected", "cancelled"].includes(order.orderStatus))
          return false;
      } else if (statusTab !== "all" && order.orderStatus !== statusTab) {
        return false;
      }
      if (typeFilter === "cake" && order.orderType !== "cake") return false;
      if (typeFilter === "custom_cake" && order.orderType !== "custom_cake")
        return false;
      if (typeFilter === "bakery" && order.orderType !== "bakery") return false;
      return true;
    });
  };

  const getStats = () => {
    // ... logic remains exactly the same as before
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
        if (!item.product) return;
        if (item.product.category === "cake") {
          const key = item.product.subCategory || "Custom Cake";
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

          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-bold text-gray-700 capitalize">
              {statusTab.replace("_", " ")} Orders
            </h2>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-gray-300 text-sm rounded-lg p-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
            >
              <option value="all">All Types</option>
              <option value="custom_cake">Custom Cakes</option>
              <option value="cake">Pre-made Cakes</option>
              <option value="bakery">Bakery Packs</option>
            </select>
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

                      {/* --- NEW ORDER TYPE BADGES --- */}
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
                    <p className="font-bold text-lg text-gray-800">
                      ₱ {order.totalPrice.toLocaleString()}
                    </p>
                    {order.orderStatus === "pending" && (
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => updateStatus(order._id, "approved")}
                          className="flex-1 bg-slate-900 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 shadow-sm transition"
                        >
                          APPROVE
                        </button>
                        <button
                          onClick={() => updateStatus(order._id, "rejected")}
                          className="px-3 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition"
                        >
                          <CancelOutlinedIcon fontSize="small" />
                        </button>
                      </div>
                    )}
                    {order.orderStatus === "approved" && (
                      <button
                        onClick={() => updateStatus(order._id, "in_process")}
                        className="w-full bg-blue-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition"
                      >
                        START PROCESS
                      </button>
                    )}
                    {order.orderStatus === "in_process" && (
                      <button
                        onClick={() =>
                          updateStatus(order._id, "ready_for_pickup")
                        }
                        className="w-full bg-purple-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 shadow-sm transition"
                      >
                        READY FOR PICKUP
                      </button>
                    )}
                    {order.orderStatus === "ready_for_pickup" && (
                      <button
                        onClick={() => updateStatus(order._id, "completed")}
                        className="w-full bg-green-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm transition"
                      >
                        COMPLETE ORDER
                      </button>
                    )}
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

      {/* Stats View omitted to save space, unchanged from your previous version */}
    </div>
  );
};
export default AdminDashboard;
