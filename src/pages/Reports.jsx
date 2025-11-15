import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Filter,
  DollarSign,
  Wrench,
  BarChart2,
} from "lucide-react";
import axios from "axios";

// Simplified mock data
const monthlyCostData = [
  { name: "Jan", cost: 420000 },
  { name: "Feb", cost: 380000 },
  { name: "Mar", cost: 510000 },
  { name: "Apr", cost: 270000 },
  { name: "May", cost: 390000 },
  { name: "Jun", cost: 480000 },
];

const departmentCostData = [
  { name: "Manufacturing", cost: 2450000 },
  { name: "Packaging", cost: 1280000 },
  { name: "Production", cost: 1820000 },
];

const machineReliabilityData = [
  { name: "Machine A", value: 85, color: "#10B981" },
  { name: "Machine B", value: 65, color: "#F59E0B" },
  { name: "Machine C", value: 92, color: "#10B981" },
];

// Helper function to format currency in Indian Rupees
const formatIndianRupees = (value) => {
  return `₹${value.toLocaleString("en-IN")}`;
};

const Reports = () => {
  const [reportType, setReportType] = useState("costAnalysis");
  const [selectedTimeframe, setSelectedTimeframe] = useState("thisYear");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const [loadingTasks, setLoadingTasks] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");
  const [historyMaitenenceTasks, setHistoryMaitenenceTasks] = useState([]);
  const [historyRepairTasks, setHistoryRepairTasks] = useState([]);
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState(null);
  const [nextRepairDate, setNextRepairDate] = useState(null);
  const [totalMaintenanceCost, setTotalMaintenanceCost] = useState(0);
  const [totalRepairCost, setTotalRepairCost] = useState(0);
  const [totalRepairPurchasePrise, setTotalRepairPurchasePrise] = useState(0);
  const [totalMaintenancePurchasePrise, setTotalMaintenancePurchasePrise] =
    useState(0);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [repairCount, setRepairCount] = useState(0);
  const [metainanceHealthScore, setMetainanceHealthScore] = useState(0);
  const [repairHealthScore, setRepairHealthScore] = useState(0);
  const [temperatureGraphData, setTemperatureGraphData] = useState([]);
  const [percentRepairToPurchase, setPercentRepairToPurchase] = useState(0);
  const [percentMaintenanceToPurchase, setPercentMaintenanceToPurchase] =
    useState(0);

  const getMonthlyMaintenanceCosts = () => {
    const monthlyCosts = {};

    historyMaitenenceTasks.forEach((task) => {
      if (task["Actual Date"] && task["Maintenace Cost"]) {
        const date = new Date(task["Actual Date"]);
        const month = date.toLocaleString("default", { month: "short" });
        const year = date.getFullYear();
        const monthYear = `${month}-${year}`;

        if (monthlyCosts[monthYear]) {
          monthlyCosts[monthYear] += task["Maintenace Cost"];
        } else {
          monthlyCosts[monthYear] = task["Maintenace Cost"];
        }
      }
    });

    // Convert to array format for the chart
    return Object.keys(monthlyCosts).map((monthYear) => ({
      month: monthYear,
      cost: monthlyCosts[monthYear],
    }));
  };

  // const monthlyRepairCosts = getMonthlyRepairCosts();
  const monthlyMaintenanceCosts = getMonthlyMaintenanceCosts();

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwoqwF1yHxpeW-twfWmtrlk4wFIc0L-02BnjdbivrjZxg0O914udxPgVL6_ksolfFDK/exec";
  const SHEET_Id = "1MAOfOecxPNZr-5YlZ5sSsXgAPOJ8PVGupBkyp7h_9Jg";

  const fetchMaintenceTasks = async () => {
    setLoadingTasks(true);
    try {
      const HistoryData = await axios.get(
        `${SCRIPT_URL}?sheetId=${SHEET_Id}&sheet=Maitenance%20Task%20Assign`
      );

      // console.log("histr", HistoryData);

      const formattedHistoryData = formatSheetData(HistoryData?.data?.table);

      const taskStartDates = formattedHistoryData
        .map((task) => new Date(task["Task Start Date"]).toLocaleDateString())
        .filter((date) => !!date);

      const temperatureData = formattedHistoryData.map(
        (task) => task["Temperature Status"]
      );

      const temperatureGraphData = taskStartDates.map((date, index) => ({
        time: date,
        temp: Number(temperatureData[index]) || 0, // fallback to 0 if empty or invalid
      }));

      // console.log("temperatureGraphData", temperatureGraphData);

      setTemperatureGraphData(temperatureGraphData);

      // filter tasks for the current machine
      const filteredTasks = formattedHistoryData.filter(
        (task) => task["Actual Date"] !== ""
      );

      setHistoryMaitenenceTasks(filteredTasks);

      // total purchase prise
      const totalPriseCost = filteredTasks.reduce((sum, task) => {
        const cost = parseFloat(task["Purchase Price"]) || 0;
        return sum + cost;
      }, 0);

      setTotalMaintenancePurchasePrise(totalPriseCost);

      // for next maintenance date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcomingTask = filteredTasks.find((task) => {
        const dateOnlyStr = task["Task Start Date"].split(" ")[0];
        const taskDate = new Date(dateOnlyStr);
        return taskDate > today;
      });

      // console.log("upcomingTask", upcomingTask);
      setNextMaintenanceDate(upcomingTask);

      // total maintenance cost
      const totalCost = filteredTasks.reduce((sum, task) => {
        const cost = parseFloat(task["Maintenace Cost"]) || 0;
        return sum + cost;
      }, 0);

      // console.log("totalCost", totalCost);
      setTotalMaintenanceCost(totalCost);

      // percentage of maintenance cost to purchase price
      const maintenanceToPurchaseRatio = (totalCost * 100) / totalPriseCost;
      setPercentMaintenanceToPurchase(maintenanceToPurchaseRatio);

      //  for Maintenance count
      const maintenanceCount = filteredTasks.length;
      setMaintenanceCount(maintenanceCount);

      // for maintenance health score
      const healthScore = Math.floor(
        (filteredTasks.length * 100) / formattedHistoryData.length
      );
      setMetainanceHealthScore(healthScore);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchMaintenceTasks();
    // fetchRepairTasks();
  }, []);

  const formatSheetData = (sheetData) => {
    const columns = sheetData.cols.map((col) => col?.label);
    const rows = sheetData?.rows;

    return rows.map((row) => {
      const obj = {};
      row.c.forEach((cell, i) => {
        obj[columns[i]] = cell?.v || ""; // Use raw value (not formatted version)
      });
      return obj;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
      </div>



      {/* Cost Analysis Report */}
      {reportType === "costAnalysis" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center">
              <DollarSign size={20} className="mr-2 text-indigo-600" />
              Monthly Maintenance Costs
            </h2>
            <div className="h-60 sm:h-80">
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
            </div>
          </div>

          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <Wrench size={20} className="mr-2 text-indigo-600" />
                Department Cost Breakdown
              </h2>
              <div className="h-60 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentCostData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="cost"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {departmentCostData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={["#4F46E5", "#60A5FA", "#F59E0B"][index % 3]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatIndianRupees(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <BarChart2 size={20} className="mr-2 text-indigo-600" />
                Machine Reliability
              </h2>
              <div className="h-60 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={machineReliabilityData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="Reliability Score (%)"
                      background={{ fill: "#eee" }}
                    >
                      {machineReliabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default Reports;