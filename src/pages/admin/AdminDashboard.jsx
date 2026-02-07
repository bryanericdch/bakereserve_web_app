import { useEffect, useState } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

// Icons
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

const API_URL = "https://bakereserve-api.onrender.com/api";

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- VIEW STATES ---
  const [mainView, setMainView] = useState("manage");
  const [statusTab, setStatusTab] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statsPeriod, setStatsPeriod] = useState("month");
  const [rankSort, setRankSort] = useState("highest"); // 'highest' | 'lowest'

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
    if (status === "all") return orders.length;
    if (status === "rejected_cancelled") {
      return orders.filter((o) =>
        ["rejected", "cancelled"].includes(o.orderStatus),
      ).length;
    }
    return orders.filter((o) => o.orderStatus === status).length;
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

  // --- STATS LOGIC ---
  const getStats = () => {
    const now = new Date();
    // 1. Filter Orders by Time
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

    // 2. Basic Counters
    const completed = filteredByTime.filter(
      (o) => o.orderStatus === "completed",
    );
    const revenue = completed.reduce((acc, curr) => acc + curr.totalPrice, 0);

    // 3. Product Rankings Logic
    const breadMap = {};
    const cakeMap = {};

    completed.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (!item.product) return;

        // LOGIC UPDATE: Use "Category is NOT cake" to mean "Breads/Others"
        if (item.product.category === "cake") {
          // Rank Cakes by SubCategory (Type)
          const key = item.product.subCategory || "Custom Cake";
          cakeMap[key] = (cakeMap[key] || 0) + item.quantity;
        } else {
          // Rank everything else (Breads, Pastries, etc.) by Product Name
          const key = item.name;
          breadMap[key] = (breadMap[key] || 0) + item.quantity;
        }
      });
    });

    // Helper to sort and slice
    const sortRank = (map) => {
      return Object.entries(map)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) =>
          rankSort === "highest" ? b.count - a.count : a.count - b.count,
        )
        .slice(0, 10);
    };

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
      const isCake = order.orderItems.some((i) => i.customization);
      if (typeFilter === "cake" && !isCake) return false;
      if (typeFilter === "regular" && isCake) return false;
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      {/* HEADER */}
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

      {/* VIEW: MANAGE ORDERS */}
      {mainView === "manage" && (
        <div className="max-w-7xl mx-auto">
          {/* Status Tabs */}
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

          {/* Type Filter */}
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
              <option value="regular">Regular Orders</option>
              <option value="cake">Cake Reservations</option>
            </select>
          </div>

          {/* Orders List */}
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
                      {order.orderItems.some((i) => i.customization) && (
                        <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold border border-pink-200">
                          CAKE
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

      {/* VIEW: STATISTICS */}
      {mainView === "stats" && (
        <div className="max-w-7xl mx-auto">
          {/* Time Filter */}
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

          {/* Stats Cards */}
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

          {/* --- NEW SECTION: PRODUCT RANKINGS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Header for Ranking */}
            <div className="md:col-span-2 flex justify-between items-end border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUpIcon className="text-amber-500" />
                Product Rankings (Top 10)
              </h2>
              <button
                onClick={() =>
                  setRankSort(rankSort === "highest" ? "lowest" : "highest")
                }
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <SortIcon fontSize="small" />
                Showing:{" "}
                {rankSort === "highest" ? "Best Selling" : "Least Selling"}
              </button>
            </div>

            {/* Breads Ranking */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">
                Top Products
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

            {/* Cakes Ranking */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">
                Top Cake Types
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
    </div>
  );
};

export default AdminDashboard;
