import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  Wrench,
  AlertTriangle,
  CheckCircle,
  FileText,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  Clock,
  User,
  ArrowLeft,
  Thermometer,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import axios from "axios";
import { set } from "date-fns";

const MachineDetails = ({ machine, goBack }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [historyMaitenenceTasks, setHistoryMaitenenceTasks] = useState([]);
  const [historyRepairTasks, setHistoryRepairTasks] = useState([]);
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState(null);
  const [nextRepairDate, setNextRepairDate] = useState(null);
  const [totalMaintenanceCost, setTotalMaintenanceCost] = useState(0);
  const [totalRepairCost, setTotalRepairCost] = useState(0);
  const [totalRepairPurchasePrise, setTotalRepairPurchasePrise] = useState(0);
  const [totalMaintenancePurchasePrise, setTotalMaintenancePurchasePrise] = useState(0);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [repairCount, setRepairCount] = useState(0);
  const [metainanceHealthScore, setMetainanceHealthScore] = useState(0);
  const [repairHealthScore, setRepairHealthScore] = useState(0);
  const [temperatureGraphData, setTemperatureGraphData] = useState([]);
  const [percentRepairToPurchase, setPercentRepairToPurchase] = useState(0);
  const [percentMaintenanceToPurchase, setPercentMaintenanceToPurchase] = useState(0);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const { serialNo } = useParams();

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwoqwF1yHxpeW-twfWmtrlk4wFIc0L-02BnjdbivrjZxg0O914udxPgVL6_ksolfFDK/exec";
  const SHEET_Id = "1MAOfOecxPNZr-5YlZ5sSsXgAPOJ8PVGupBkyp7h_9Jg";

  // Enhanced formatSheetData with proper error handling
  const formatSheetData = (sheetData) => {
    // Check if sheetData exists and has the expected structure
    if (!sheetData || !sheetData.cols || !sheetData.rows) {
      console.error("Invalid sheet data structure:", sheetData);
      return [];
    }

    try {
      const columns = sheetData.cols.map((col) => col?.label || "");
      const rows = sheetData.rows || [];

      return rows.map((row, rowIndex) => {
        const obj = {};
        if (row && row.c) {
          row.c.forEach((cell, i) => {
            obj[columns[i]] = cell?.v || ""; // Use raw value (not formatted version)
          });
        }
        return obj;
      });
    } catch (error) {
      console.error("Error formatting sheet data:", error);
      return [];
    }
  };

  const fetchMaintenceTasks = async () => {
    if (!machine || !machine["Serial No"]) {
      console.warn("Machine data not available yet");
      return;
    }

    setLoadingTasks(true);
    try {
      const response = await axios.get(
        `${SCRIPT_URL}?sheetId=${SHEET_Id}&sheet=Maitenance%20Task%20Assign`
      );

      // Check if response has data
      if (!response.data) {
        console.error("No data received from API");
        return;
      }

      const formattedHistoryData = formatSheetData(response.data.table);
      
      if (formattedHistoryData.length === 0) {
        console.warn("No formatted data available");
        return;
      }

      // Filter tasks for the current machine
      const machineFilteredTasks = formattedHistoryData.filter(
        (task) => task["Serial No"] === machine["Serial No"]
      );

      // Generate temperature graph data
      const taskStartDates = machineFilteredTasks
        .map((task) => {
          if (task["Task Start Date"]) {
            try {
              return new Date(task["Task Start Date"]).toLocaleDateString();
            } catch {
              return null;
            }
          }
          return null;
        })
        .filter((date) => date !== null);

      const temperatureData = machineFilteredTasks.map(
        (task) => task["Temperature Status"] || 0
      );

      const temperatureGraphData = taskStartDates.map((date, index) => ({
        time: date,
        temp: Number(temperatureData[index]) || 0,
      }));

      setTemperatureGraphData(temperatureGraphData);

      // Filter completed tasks
      const filteredTasks = machineFilteredTasks.filter(
        (task) => task["Actual Date"] && task["Actual Date"] !== ""
      );

      setHistoryMaitenenceTasks(filteredTasks);

      // Get purchase price from machine data first, then from tasks as fallback
      const purchasePrice = machine["Purchase Price"] 
        ? parseFloat(machine["Purchase Price"])
        : (filteredTasks.length > 0 && filteredTasks[0]["Purchase Price"] 
           ? parseFloat(filteredTasks[0]["Purchase Price"]) 
           : 0);

      setTotalMaintenancePurchasePrise(purchasePrice);

      // Find next maintenance date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcomingTask = machineFilteredTasks.find((task) => {
        if (!task["Task Start Date"]) return false;
        try {
          const dateOnlyStr = task["Task Start Date"].split(" ")[0];
          const taskDate = new Date(dateOnlyStr);
          return taskDate > today;
        } catch {
          return false;
        }
      });

      setNextMaintenanceDate(upcomingTask);

      // Calculate total maintenance cost
      const totalCost = filteredTasks.reduce((sum, task) => {
        const cost = parseFloat(task["Maintenace Cost"]) || 0;
        return sum + cost;
      }, 0);

      setTotalMaintenanceCost(totalCost);

      // Calculate percentage of maintenance cost to purchase price
      const maintenanceToPurchaseRatio = purchasePrice > 0 
        ? (totalCost * 100) / purchasePrice 
        : 0;
      setPercentMaintenanceToPurchase(maintenanceToPurchaseRatio);

      // Set maintenance count
      setMaintenanceCount(filteredTasks.length);

      // Calculate maintenance health score
      const healthScore = machineFilteredTasks.length > 0 
        ? Math.floor((filteredTasks.length * 100) / machineFilteredTasks.length)
        : 0;
      setMetainanceHealthScore(healthScore);

    } catch (error) {
      console.error("Error fetching maintenance tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchRepairTasks = async () => {
    if (!machine || !machine["Serial No"]) {
      console.warn("Machine data not available yet");
      return;
    }

    setLoadingTasks(true);
    try {
      const response = await axios.get(
        `${SCRIPT_URL}?sheetId=${SHEET_Id}&sheet=Repair%20Task%20Assign`
      );

      // Check if response has data
      if (!response.data) {
        console.error("No data received from API");
        return;
      }

      const formattedHistoryData = formatSheetData(response.data.table);
      
      if (formattedHistoryData.length === 0) {
        console.warn("No formatted data available");
        return;
      }

      // Filter tasks for the current machine
      const machineFilteredTasks = formattedHistoryData.filter(
        (task) => task["Serial No"] === machine["Serial No"]
      );

      // Filter completed tasks
      const filteredTasks = machineFilteredTasks.filter(
        (task) => task["Actual Date"] && task["Actual Date"] !== ""
      );

      setHistoryRepairTasks(filteredTasks);

      // Find next repair date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcomingTask = machineFilteredTasks.find((task) => {
        if (!task["Task Start Date"]) return false;
        try {
          const dateOnlyStr = task["Task Start Date"].split(" ")[0];
          const taskDate = new Date(dateOnlyStr);
          return taskDate > today;
        } catch {
          return false;
        }
      });

      setNextRepairDate(upcomingTask);

      // Calculate total repair cost
      const totalCost = filteredTasks.reduce((sum, task) => {
        const cost = parseFloat(task["Repair Cost"]) || 0;
        return sum + cost;
      }, 0);

      setTotalRepairCost(totalCost);

      // Get purchase price from machine data first, then from tasks as fallback
      const purchasePrice = machine["Purchase Price"]
        ? parseFloat(machine["Purchase Price"])
        : (filteredTasks.length > 0 && filteredTasks[0]["Purchase Price"]
           ? parseFloat(filteredTasks[0]["Purchase Price"])
           : 0);

      setTotalRepairPurchasePrise(purchasePrice);

      // Calculate percentage of repair cost to purchase price
      const repairToPurchaseRatio = purchasePrice > 0 
        ? (totalCost * 100) / purchasePrice 
        : 0;
      setPercentRepairToPurchase(repairToPurchaseRatio);

      // Set repair count
      setRepairCount(filteredTasks.length);

      // Calculate repair health score
      const healthScore = machineFilteredTasks.length > 0 
        ? Math.floor((filteredTasks.length * 100) / machineFilteredTasks.length)
        : 0;
      setRepairHealthScore(healthScore);

    } catch (error) {
      console.error("Error fetching repair tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    // Only fetch if machine data is available
    if (machine && machine["Serial No"]) {
      fetchMaintenceTasks();
      fetchRepairTasks();
    }
  }, [machine]);

  const getMonthlyRepairCosts = () => {
    const monthlyCosts = {};

    historyRepairTasks.forEach((task) => {
      if (task["Actual Date"] && task["Repair Cost"]) {
        try {
          const date = new Date(task["Actual Date"]);
          const month = date.toLocaleString("default", { month: "short" });
          const year = date.getFullYear();
          const monthYear = `${month}-${year}`;
          const cost = parseFloat(task["Repair Cost"]) || 0;

          if (monthlyCosts[monthYear]) {
            monthlyCosts[monthYear] += cost;
          } else {
            monthlyCosts[monthYear] = cost;
          }
        } catch (error) {
          console.warn("Invalid date format:", task["Actual Date"]);
        }
      }
    });

    return Object.keys(monthlyCosts).map((monthYear) => ({
      month: monthYear,
      cost: monthlyCosts[monthYear],
    }));
  };

  const getMonthlyMaintenanceCosts = () => {
    const monthlyCosts = {};

    historyMaitenenceTasks.forEach((task) => {
      if (task["Actual Date"] && task["Maintenace Cost"]) {
        try {
          const date = new Date(task["Actual Date"]);
          const month = date.toLocaleString("default", { month: "short" });
          const year = date.getFullYear();
          const monthYear = `${month}-${year}`;
          const cost = parseFloat(task["Maintenace Cost"]) || 0;

          if (monthlyCosts[monthYear]) {
            monthlyCosts[monthYear] += cost;
          } else {
            monthlyCosts[monthYear] = cost;
          }
        } catch (error) {
          console.warn("Invalid date format:", task["Actual Date"]);
        }
      }
    });

    return Object.keys(monthlyCosts).map((monthYear) => ({
      month: monthYear,
      cost: monthlyCosts[monthYear],
    }));
  };

  const monthlyRepairCosts = getMonthlyRepairCosts();
  const monthlyMaintenanceCosts = getMonthlyMaintenanceCosts();

  const getStatusBadge = (status) => {
    switch (status) {
      case "operational":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle size={16} className="mr-1" />
            Operational
          </span>
        );
      case "maintenance":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Wrench size={16} className="mr-1" />
            Maintenance
          </span>
        );
      case "repair":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
            <AlertTriangle size={16} className="mr-1" />
            Repair
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  const getHealthIndicator = (score) => {
    let color = "";
    if (score >= 90) color = "bg-green-500";
    else if (score >= 70) color = "bg-blue-500";
    else if (score >= 50) color = "bg-amber-500";
    else color = "bg-red-500";

    return (
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
        <span className="font-medium">{score}%</span>
      </div>
    );
  };

  // Show loading or error state if machine data is not available
  if (!machine) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-700">Loading machine details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6 gap-3">
        <button
          onClick={goBack}
          className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-2"
        >
          <ArrowLeft size={18} />
          <span>Back to Machines</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-800 flex-1">
          {machine["Machine Name"] || "Unknown Machine"}
        </h1>
      </div>

      {/* Machine Overview Cards */}
      {activeTab === "maintenance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <Calendar size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Next Maintenance
                </p>
                <h3 className="text-lg font-bold text-gray-800">
                  {nextMaintenanceDate?.["Task Start Date"]?.split("T")[0] ||
                    "No upcoming maintenance"}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Maintenance Cost
                </p>
                <h3 className="text-lg font-bold text-gray-800">
                  ₹{totalMaintenanceCost || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 mr-4">
                <Wrench size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Maintenance Count
                </p>
                <h3 className="text-lg font-bold text-gray-800">
                  {maintenanceCount || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <BarChart3 size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Maintenance Health Score
                </p>
                <h3 className="text-lg font-bold text-gray-800">
                  {metainanceHealthScore}%
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "repair" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <Calendar size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Next Repair</p>
                <h3 className="text-lg font-bold text-gray-800">
                  {nextRepairDate?.["Task Start Date"]?.split("T")[0] ||
                    "No upcoming maintenance"}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <DollarSign size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Total Repair Cost
                </p>
                <h3 className="text-lg font-bold text-gray-800">
                  ₹{totalRepairCost || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 mr-4">
                <Wrench size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Repair Count
                </p>
                <h3 className="text-lg font-bold text-gray-800">
                  {repairCount || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 mr-4">
                <BarChart3 size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">
                  Health Score
                </p>
                <h3 className="text-lg font-bold text-gray-800">
                  {repairHealthScore}%
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <FileText size={16} className="inline mr-2" />
              Overview
            </button>
            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === "maintenance"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("maintenance")}
            >
              <Wrench size={16} className="inline mr-2" />
              Maintenance History
            </button>

            <button
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === "maintenance analytics"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("maintenance analytics")}
            >
              <BarChart3 size={16} className="inline mr-2" />
              Maintenance Analytics
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Machine Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex gap-10">
                      <span className="text-gray-500">Serial Number:</span>
                      <span className="font-medium">
                        {machine?.["Serial No"] || "N/A"}
                      </span>
                    </div>
                    <div className="flex gap-10">
                      <span className="text-gray-500">Model:</span>
                      <span className="font-medium">
                        {machine?.["Model No"] || "N/A"}
                      </span>
                    </div>
                    <div className="flex gap-10">
                      <span className="text-gray-500">Manufacturer:</span>
                      <span className="font-medium">
                        {machine?.Manufacturer || "N/A"}
                      </span>
                    </div>
                    <div className="flex gap-10">
                      <span className="text-gray-500">Department:</span>
                      <span className="font-medium">{machine?.Department || "N/A"}</span>
                    </div>
                    <div className="flex gap-10">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium">{machine?.Location || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Purchase Details</h3>
                  <div className="space-y-3">
                    <div className="flex gap-10">
                      <span className="text-gray-500">Purchase Date:</span>
                      <span className="font-medium">
                        {machine?.["Purchase Date"] 
                          ? new Date(machine["Purchase Date"]).toLocaleDateString()
                          : "N/A"
                        }
                      </span>
                    </div>
                    <div className="flex gap-10">
                      <span className="text-gray-500">Purchase Price:</span>
                      <span className="font-medium">
                        ₹{machine?.["Purchase Price"]?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                    <div className="flex gap-10">
                      <span className="text-gray-500">Vendor:</span>
                      <span className="font-medium">{machine?.Vendor || "N/A"}</span>
                    </div>
                    <div className="flex gap-10">
                      <span className="text-gray-500">Warranty Expires:</span>
                      <span className="font-medium">
                        {machine?.["Warranty Expiration"]
                          ? new Date(machine["Warranty Expiration"]).toLocaleDateString()
                          : "N/A"
                        }
                      </span>
                    </div>
                    <div className="flex gap-10">
                      <span className="text-gray-500">Last Maintenance:</span>
                      <span className="font-medium">
                        {machine?.["Initial Maintenance Date"]
                          ? new Date(machine["Initial Maintenance Date"]).toLocaleDateString()
                          : "N/A"
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Thermometer size={20} className="mr-2 text-indigo-600" />
                  Latest Temperature Readings
                </h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="h-64">
                    {temperatureGraphData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={temperatureGraphData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis domain={[0, 50]} />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="temp"
                            name="Temperature (°C)"
                            stroke="#4F46E5"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">No temperature data available</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Maintenance History</h3>
                <Link
                  to="/assign-task"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus size={16} className="mr-2" />
                  Schedule Maintenance
                </Link>
              </div>

              {loadingTasks ? (
                <div className="flex justify-center py-8">
                  <div className="text-gray-500">Loading maintenance history...</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Technician
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {historyMaitenenceTasks.length > 0 ? (
                        historyMaitenenceTasks.map((record) => (
                          <tr
                            key={record["Task No"] || Math.random()}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record["Task Start Date"] 
                                ? new Date(record["Task Start Date"]).toLocaleDateString()
                                : "N/A"
                              }
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record["Task Type"] || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <User size={16} className="text-gray-400 mr-2" />
                                {record["Doer Name"] || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{record["Maintenace Cost"] || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle size={12} className="mr-1" />
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No maintenance history available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "maintenance analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">
                    Monthly Maintenance Costs
                  </h3>
                  <div className="h-80">
                    {monthlyMaintenanceCosts.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyMaintenanceCosts}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => `₹${value.toLocaleString()}`}
                          />
                          <Legend />
                          <Bar dataKey="cost" name="Cost" fill="#4F46E5" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">No cost data available</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <DollarSign size={20} className="mr-2 text-indigo-600" />
                    Cost Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center">
                      <p className="text-sm text-gray-500 mb-2">
                        Total Purchase Price
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        ₹{totalMaintenancePurchasePrise?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center">
                      <p className="text-sm text-gray-500 mb-2">
                        Total Maintenance Cost
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        ₹{totalMaintenanceCost?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center col-span-2">
                      <p className="text-sm text-gray-500 mb-2">
                        Maintenance to Purchase Ratio
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {percentMaintenanceToPurchase.toFixed(2)}%
                      </p>
                      <div className="w-full mt-2 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            percentMaintenanceToPurchase < 10
                              ? "bg-green-500"
                              : percentMaintenanceToPurchase < 20
                              ? "bg-blue-500"
                              : percentMaintenanceToPurchase < 30
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(percentMaintenanceToPurchase, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 text-center">
                        {percentMaintenanceToPurchase < 10
                          ? "Excellent value - low maintenance costs"
                          : percentMaintenanceToPurchase < 20
                          ? "Good value - reasonable maintenance costs"
                          : percentMaintenanceToPurchase < 30
                          ? "Fair value - increasing maintenance costs"
                          : "Poor value - high maintenance costs, consider replacement"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">
                  Key Performance Indicators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {metainanceHealthScore}%
                    </div>
                    <div className="text-sm text-gray-500">
                      Maintenance Health Score
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {maintenanceCount}
                    </div>
                    <div className="text-sm text-gray-500">
                      Total Maintenance Tasks
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      ₹{Math.round(totalMaintenanceCost / Math.max(maintenanceCount, 1)).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Average Cost per Task
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineDetails;