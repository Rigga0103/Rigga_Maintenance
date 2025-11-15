import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  Clock,
  CheckCircle,
  FileText,
  User,
  Wrench,
  DollarSign,
  Calendar,
  AlertTriangle,
  Upload,
  MessageSquare,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import useAuthStore from "../store/authStore";
const mockTask = {
  id: 3,
  machineId: 2,
  machineName: "CNC Machine CNC-305",
  department: "Manufacturing",
  type: "Off-site Service",
  status: "in-progress",
  dueDate: "2024-03-22",
  assignedTo: "External Vendor",
  priority: "high",
  location: "Off-site",
  vendor: "Precision Machines Inc.",
  description:
    "Send control unit for recalibration and firmware update. The machine has been showing inconsistent precision measurements over the past month. The vendor needs to perform a full diagnostic, recalibration, and update the firmware to the latest version to address known issues with the control system.",
  estimatedCost: 2800,
  checklist: [
    { id: 1, text: "Disconnect power and tag out machine", completed: true },
    { id: 2, text: "Remove control unit from housing", completed: true },
    {
      id: 3,
      text: "Pack for shipping with appropriate padding",
      completed: true,
    },
    { id: 4, text: "Complete shipping documentation", completed: true },
    { id: 5, text: "Send to vendor's service center", completed: true },
    { id: 6, text: "Vendor: Run diagnostic tests", completed: true },
    { id: 7, text: "Vendor: Update firmware to v4.2.1", completed: false },
    { id: 8, text: "Vendor: Recalibrate axis alignment", completed: false },
    { id: 9, text: "Vendor: Complete performance tests", completed: false },
    { id: 10, text: "Return shipping to factory", completed: false },
    { id: 11, text: "Reinstall and test operation", completed: false },
  ],
  history: [
    {
      id: 1,
      date: "2024-03-01",
      user: "John Smith",
      action: "Created maintenance task",
      notes: "Scheduled based on detection of precision issues",
    },
    {
      id: 2,
      date: "2024-03-05",
      user: "Sarah Johnson",
      action: "Updated task priority to High",
      notes: "Production schedule requires this to be fixed ASAP",
    },
    {
      id: 3,
      date: "2024-03-10",
      user: "Mike Anderson",
      action: "Prepared for shipping",
      notes: "Disconnected and packed the control unit for shipping",
    },
    {
      id: 4,
      date: "2024-03-12",
      user: "Mike Anderson",
      action: "Shipped to vendor",
      notes: "Tracking #: SHIP12345678",
    },
    {
      id: 5,
      date: "2024-03-15",
      user: "Vendor: Tech Support",
      action: "Received unit",
      notes: "Initial inspection shows no physical damage",
    },
    {
      id: 6,
      date: "2024-03-17",
      user: "Vendor: Tech Support",
      action: "Diagnostic complete",
      notes: "Found memory corruption and alignment drift issues",
    },
  ],
  comments: [
    {
      id: 1,
      user: "John Smith",
      timestamp: "2024-03-01T10:30:00",
      text: "Please make sure to document all firmware versions before and after the update.",
    },
    {
      id: 2,
      user: "Sarah Johnson",
      timestamp: "2024-03-02T14:15:00",
      text: "I've added this to the priority list. We need this back in operation by month end for the new production run.",
    },
    {
      id: 3,
      user: "Vendor: Tech Support",
      timestamp: "2024-03-17T09:45:00",
      text: "We've identified the issue. The control board has a corrupted memory sector and the Z-axis calibration is out of spec. We'll need to replace one chip and recalibrate all axes. This should be covered under your service agreement.",
    },
  ],
  documents: [
    {
      id: 1,
      name: "Service Request Form.pdf",
      type: "PDF",
      uploadedBy: "John Smith",
      date: "2024-03-01",
    },
    {
      id: 2,
      name: "Shipping Documentation.pdf",
      type: "PDF",
      uploadedBy: "Mike Anderson",
      date: "2024-03-12",
    },
    {
      id: 3,
      name: "Initial Diagnostic Report.pdf",
      type: "PDF",
      uploadedBy: "Vendor: Tech Support",
      date: "2024-03-17",
    },
  ],
};

const TaskDetails = () => {
  const { user } = useAuthStore();
  const { taskNo, serialNo, taskType } = useParams();
  const [allRelatedTasks, setAllRelatedTasks] = useState([]);
  const [machineName, setMachineName] = useState("");
  const [loading, setLoading] = useState(true);
  const [taskView, setTaskView] = useState("Todays Tasks");
  const [checkedItems, setCheckedItems] = useState({});
  const [taskStatuses, setTaskStatuses] = useState({});
  const [remarks, setRemarks] = useState({});
  const [imageFiles, setImageFiles] = useState({});
  const [submittingTasks, setSubmittingTasks] = useState({});
  const [task] = useState(mockTask);
  const [activeTab, setActiveTab] = useState("details");
  const [commentText, setCommentText] = useState("");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(task.status);
  const [checklist, setChecklist] = useState(task.checklist);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [repairCosts, setRepairCosts] = useState({});
  const [soundStatuses, setSoundStatuses] = useState({});
  const [temperatures, setTemperatures] = useState({});
  const [taskProgress, setTaskProgress] = useState(0);

  const [downtimes, setDowntimes] = useState({});
  const [partReplaceds, setPartReplaceds] = useState({});
  const [performedBys, setPerformedBys] = useState({});
  const [workDones, setWorkDones] = useState({});
  const [reasonForWorks, setReasonForWorks] = useState({});
  const [remarksOtherInputs, setRemarksOtherInputs] = useState({});

  // console.log("pendingTasks", pendingTasks);

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwoqwF1yHxpeW-twfWmtrlk4wFIc0L-02BnjdbivrjZxg0O914udxPgVL6_ksolfFDK/exec";
  const SHEET_ID = "1MAOfOecxPNZr-5YlZ5sSsXgAPOJ8PVGupBkyp7h_9Jg";
  const FOLDER_ID = "1l9QPqg5JobALifsFoDuqCanTVnvGTLwu";

  const fetchMachineRelatedTasks = async () => {
    setLoading(true);
    try {
      const sheetName = taskNo.startsWith("TM")
        ? "Maitenance Task Assign"
        : "Repair Task Assign";

      // Use the raw data endpoint that returns the new format
      const rawDataUrl = `${SCRIPT_URL}?action=getRawData&sheetId=${SHEET_ID}&sheet=${encodeURIComponent(
        sheetName
      )}`;
      const res = await axios.get(rawDataUrl);

      // Handle the new response format
      if (!res.data.success || !res.data.headers || !res.data.rows) {
        return;
      }

      const headers = res.data.headers;
      const rows = res.data.rows;

      // Convert rows to objects using headers
      const formattedData = rows
        .map((row) => {
          const obj = {};
          headers.forEach((header, index) => {
            if (header && row[index] !== undefined) {
              obj[header] = row[index] || "";
            }
          });
          return obj;
        })
        .filter((obj) => Object.keys(obj).length > 0);

      // Frontend filtering for additional security
      let userFilteredData = formattedData;

      console.log(`👤 User role: ${user?.role}, Username: ${user?.username}`);

      if (user?.role === "user") {
        userFilteredData = formattedData.filter(
          (task) =>
            task["Doer Name"]?.toLowerCase() === user.username?.toLowerCase()
        );
        console.log(
          `🔒 User filtering: ${formattedData.length} → ${userFilteredData.length} records`
        );
      } else if (user?.role === "admin") {
        userFilteredData = formattedData;
        console.log(
          `🔓 Admin access: showing all ${formattedData.length} records`
        );
      } else {
        console.log(`⚠️ Unknown role: ${user?.role}, showing all records`);
        userFilteredData = formattedData;
      }

      // First find the specific task we're looking at
      const currentTask = userFilteredData.find(
        (row) => row["Serial No"] === serialNo || row["Task No"] === taskNo
      );

      if (!currentTask) {
        console.warn(
          "⚠️ No matching task found for serialNo:",
          serialNo,
          "or taskNo:",
          taskNo
        );
        setAllRelatedTasks([]);
        setCompletedTasks([]);
        setPendingTasks([]);
        return;
      }

      const currentMachineName = currentTask["Machine Name"];
      const currentSerialNo = currentTask["Serial No"];
      setMachineName(currentMachineName);

      // Filter tasks by Machine Name
      let relatedTasks;

      // Filter by exact machine name match
      relatedTasks = userFilteredData.filter((row) => {
        const rowMachineName = row["Machine Name"]?.trim() || "";
        const currentMachineNameTrimmed = currentMachineName?.trim() || "";

        return (
          rowMachineName.toLowerCase() ===
          currentMachineNameTrimmed.toLowerCase()
        );
      });

      // Filter pending tasks (for details tab)
      const pendingTaskss = relatedTasks.filter(
        (item) => !item["Actual Date"] || item["Actual Date"].trim() === ""
      );

      setPendingTasks(pendingTaskss);
      console.log(`📋 Pending tasks: ${pendingTaskss.length}`);

      // Active tasks (empty Actual Date) for checklist tab
      const activeTasks = relatedTasks.filter(
        (row) => !row["Actual Date"] || row["Actual Date"].trim() === ""
      );

      // Completed tasks (has Actual Date) for history tab
      const completedTasks = relatedTasks.filter(
        (row) => row["Actual Date"] && row["Actual Date"].trim() !== ""
      );

      setAllRelatedTasks(activeTasks);
      setCompletedTasks(completedTasks);

      console.log(`✅ Active tasks: ${activeTasks.length}`);
      console.log(`🏁 Completed tasks: ${completedTasks.length}`);

      const totalTasks = activeTasks.length + completedTasks.length;
      const precent =
        totalTasks > 0
          ? Math.floor((completedTasks.length * 100) / totalTasks)
          : 0;
      setTaskProgress(precent);

      // Initialize states only for active tasks

      const initialCheckedItems = {};
      const initialTaskStatuses = {};
      const initialRemarks = {};
      const initialDowntimes = {};
      const initialPartReplaceds = {};
      const initialPerformedBys = {};
      const initialWorkDones = {};
      const initialReasonForWorks = {};
      const initialRemarksOtherInputs = {};

      activeTasks.forEach((task) => {
        const taskNo = task["Task No"];
        initialCheckedItems[taskNo] = false;
        initialTaskStatuses[taskNo] = task["Task Status"] || "";
        initialRemarks[taskNo] = task["Remarks"] || "";
        initialRemarksOtherInputs[taskNo] = ""; // ✅ Now it works
        initialDowntimes[taskNo] = task["Downtime (Hours)"] || "";
        initialPartReplaceds[taskNo] = task["Part Replaced"] || "";
        initialPerformedBys[taskNo] = task["Performed By"] || "";
        initialWorkDones[taskNo] = task["Work Done"] || "";
        initialReasonForWorks[taskNo] = task["Reason for Work"] || "";
      });

      setCheckedItems(initialCheckedItems);
      setTaskStatuses(initialTaskStatuses);
      setRemarks(initialRemarks);
      setRemarksOtherInputs(initialRemarksOtherInputs); // ✅ Now has data
      setDowntimes(initialDowntimes);
      setPartReplaceds(initialPartReplaceds);
      setPerformedBys(initialPerformedBys);
      setWorkDones(initialWorkDones);
      setReasonForWorks(initialReasonForWorks);
      setImageFiles({});
    } catch (error) {
      console.error("❌ Error fetching tasks:", error);
      setAllRelatedTasks([]);
      setCompletedTasks([]);
      setPendingTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const [masterData, setMasterData] = useState({
    workDone: [],
    reasonForWork: [],
    performedBy: [],
    status: [],
    remarks: [],
  });

  // Add this useEffect to fetch Master sheet data
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const rawDataUrl = `${SCRIPT_URL}?action=getRawData&sheetId=${SHEET_ID}&sheet=Master`;
        const res = await axios.get(rawDataUrl);

        if (res.data.success && res.data.headers && res.data.rows) {
          const headers = res.data.headers;
          const rows = res.data.rows;

          // Find column indices
          const workDoneIdx = headers.indexOf("Work Done");
          const reasonIdx = headers.indexOf("Reason for Work");
          const performedByIdx = headers.indexOf("Performed By");
          const statusIdx = headers.indexOf("Status");
          const remarksIdx = headers.indexOf("Remarks / Comments");

          setMasterData({
            workDone: rows.map((row) => row[workDoneIdx]).filter(Boolean),
            reasonForWork: rows.map((row) => row[reasonIdx]).filter(Boolean),
            performedBy: rows.map((row) => row[performedByIdx]).filter(Boolean),
            status: rows.map((row) => row[statusIdx]).filter(Boolean),
            remarks: rows.map((row) => row[remarksIdx]).filter(Boolean),
          });
        }
      } catch (error) {
        console.error("Error fetching Master data:", error);
      }
    };

    fetchMasterData();
  }, []);

  useEffect(() => {
    fetchMachineRelatedTasks();
  }, [taskNo, serialNo]);

  const handleRemarksOtherInputChange = (taskNo, value) => {
    setRemarksOtherInputs((prev) => ({
      ...prev,
      [taskNo]: value,
    }));
  };

  const handleDowntimeChange = (taskNo, value) => {
    setDowntimes((prev) => ({
      ...prev,
      [taskNo]: value,
    }));
  };

  const handlePartReplacedChange = (taskNo, value) => {
    setPartReplaceds((prev) => ({
      ...prev,
      [taskNo]: value,
    }));
  };

  const handlePerformedByChange = (taskNo, value) => {
    setPerformedBys((prev) => ({
      ...prev,
      [taskNo]: value,
    }));
  };

  const handleWorkDoneChange = (taskNo, value) => {
    setWorkDones((prev) => ({
      ...prev,
      [taskNo]: value,
    }));
  };

  const handleReasonForWorkChange = (taskNo, value) => {
    setReasonForWorks((prev) => ({
      ...prev,
      [taskNo]: value,
    }));
  };

  const handleCheckboxChange = (taskNo) => {
    setCheckedItems((prev) => ({
      ...prev,
      [taskNo]: !prev[taskNo],
    }));

    if (checkedItems[taskNo]) {
      setTaskStatuses((prev) => {
        const newStatuses = { ...prev };
        delete newStatuses[taskNo];
        return newStatuses;
      });
      setRemarks((prev) => {
        const newRemarks = { ...prev };
        delete newRemarks[taskNo];
        return newRemarks;
      });
      setImageFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[taskNo];
        return newFiles;
      });
    }
  };

  const handleStatusChange = (taskNo, value) => {
    setTaskStatuses((prev) => ({
      ...prev,
      [taskNo]: value,
    }));
  };

  const handleRemarksChange = (taskNo, value) => {
    setRemarks((prev) => ({
      ...prev,
      [taskNo]: value,
    }));

    // Clear the "Other" input if user switches away from "Other"
    if (value !== "Other") {
      setRemarksOtherInputs((prev) => ({
        ...prev,
        [taskNo]: "",
      }));
    }
  };

  const handleImageUpload = (taskNo, file) => {
    setImageFiles((prev) => ({
      ...prev,
      [taskNo]: file,
    }));
  };

  const handleRepairCostChange = (taskNo, value) => {
    setRepairCosts((prev) => ({
      ...prev,
      [taskNo]: value,
    }));
  };

  const handleSoundStatusChange = (taskNo, value) => {
    setSoundStatuses((prev) => ({
      ...prev,
      [taskNo]: value,
    }));
  };

  const handleTemperatureChange = (taskNo, value) => {
    setTemperatures((prev) => ({
      ...prev,
      [taskNo]: value,
    }));
  };

  const uploadFileToDrive = async (file) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const base64Data = reader.result;

        // console.log("base64Data", base64Data);
        // console.log("file.name", file.name);
        // console.log("file.type", file.type);
        // console.log("FOLDER_ID", FOLDER_ID);

        try {
          const res = await fetch(SCRIPT_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              action: "uploadFile",
              base64Data: base64Data,
              fileName: file.name,
              mimeType: file.type,
              folderId: FOLDER_ID,
            }).toString(),
          });

          const data = await res.json();

          console.log("FileUploadData", data);

          if (data.success && data.fileUrl) {
            resolve(data.fileUrl);
          } else {
            toast.error("❌ File upload failed");
            resolve("");
          }
        } catch (err) {
          console.error("Upload error:", err);
          toast.error("❌ Upload failed due to network error");
          resolve("");
        }
      };

      reader.onerror = () => {
        reject("❌ Failed to read file");
      };

      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (taskNo) => {
    setSubmittingTasks((prev) => ({ ...prev, [taskNo]: true }));

    try {
      const task = allRelatedTasks.find((t) => t["Task No"] === taskNo);
      if (!task) {
        toast.error("Task not found");
        return;
      }

      // Handle image upload if exists
      let imgRes = "";
      let fileName = "";
      let fileType = "";
      if (imageFiles[taskNo]) {
        imgRes = await uploadFileToDrive(imageFiles[taskNo]);
        fileName = imageFiles[taskNo].name;
        fileType = fileName.split(".").pop().toLowerCase(); // Get file extension
      }

      const payload =
        taskType === "Maintence"
          ? {
              sheetId: SHEET_ID,
              sheetName: taskNo.startsWith("TM")
                ? "Maitenance Task Assign"
                : "Repair Task Assign",
              action: "update",
              taskNo: taskNo,
              "Task Status": taskStatuses[taskNo],
              // Remarks: remarks[taskNo] || "",

              Remarks:
                remarks[taskNo] === "Other"
                  ? remarksOtherInputs[taskNo] || ""
                  : remarks[taskNo] || "",

              "Maintenace Cost": repairCosts[taskNo] || "",
              "Work Done": workDones[taskNo] || "",
              "Reason for Work": reasonForWorks[taskNo] || "",
              "Downtime (Hours)": downtimes[taskNo] || "",
              "Part Replaced": partReplaceds[taskNo] || "",
              "Performed By": performedBys[taskNo] || "",
              ...(imgRes && {
                "Image Link": imgRes,
                "File Name": fileName,
                "File Type": fileType,
              }),
            }
          : {
              sheetId: SHEET_ID,
              sheetName: taskNo.startsWith("TM")
                ? "Maitenance Task Assign"
                : "Repair Task Assign",
              action: "update",
              taskNo: taskNo,
              "Task Status": taskStatuses[taskNo],
              Remarks: remarks[taskNo] || "",
              "Repair Cost": repairCosts[taskNo] || "",
              "Sound Status": soundStatuses[taskNo] || "",
              "Temperature Status": temperatures[taskNo] || "",
              ...(imgRes && {
                "Image Link": imgRes,
                "File Name": fileName,
                "File Type": fileType,
              }),
            };

      // Only add Actual Date if status is "Yes"
      if (taskStatuses[taskNo]) {
        payload["Actual Date"] = new Date().toISOString().split("T")[0];
      }

      // Send the update request
      const response = await axios.post(SCRIPT_URL, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // console.log("response",response);

      if (response.data.success) {
        toast.success("Task updated successfully");

        fetchMachineRelatedTasks();

        // Reset the form state for this item
        setCheckedItems((prev) => {
          const newChecked = { ...prev };
          delete newChecked[taskNo];
          return newChecked;
        });
        setTaskStatuses((prev) => {
          const newStatuses = { ...prev };
          delete newStatuses[taskNo];
          return newStatuses;
        });
        setRemarks((prev) => {
          const newRemarks = { ...prev };
          delete newRemarks[taskNo];
          return newRemarks;
        });
        setImageFiles((prev) => {
          const newFiles = { ...prev };
          delete newFiles[taskNo];
          return newFiles;
        });
        setRepairCosts((prev) => {
          const newCosts = { ...prev };
          delete newCosts[taskNo];
          return newCosts;
        });
        setSoundStatuses((prev) => {
          const newSounds = { ...prev };
          delete newSounds[taskNo];
          return newSounds;
        });
        setTemperatures((prev) => {
          const newTemps = { ...prev };
          delete newTemps[taskNo];
          return newTemps;
        });
      } else {
        toast.error(response.data.error || "Failed to update task");
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error(error.response?.data?.error || "Error updating task");
    } finally {
      setSubmittingTasks((prev) => {
        const newState = { ...prev };
        delete newState[taskNo];
        return newState;
      });
    }
  };

  const handleChecklistItemToggle = (itemId) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      toast.success("Comment added successfully");
      setCommentText("");
    }
  };

  const handleStatusUpdate = (e) => {
    e.preventDefault();
    toast.success(`Status updated to ${updateStatus}`);
    setShowUpdateForm(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle size={16} className="mr-1" />
            Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock size={16} className="mr-1" />
            Pending
          </span>
        );
      case "in-progress":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <Clock size={16} className="mr-1" />
            In Progress
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <AlertTriangle size={16} className="mr-1" />
            Overdue
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "critical":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300">
            Critical
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
            High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Medium
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Normal
          </span>
        );
    }
  };

  const completedItems = checklist.filter((item) => item.completed).length;

  const handleSelectAll = (isChecked) => {
    const today = new Date();

    const todaysTasks = allRelatedTasks.filter((task) => {
      const taskDate = new Date(task["Task Start Date"]);
      return (
        taskDate.getDate() === today.getDate() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getFullYear() === today.getFullYear()
      );
    });

    const updated = {};
    todaysTasks.forEach((task) => {
      if (!task["Actual Date"]) {
        // ✅ already done tasks skip ho
        updated[task["Task No"]] = isChecked;
      }
    });

    setCheckedItems((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Link
          to="/tasks"
          className="text-indigo-600 hover:text-indigo-900 mr-4 flex items-center"
        >
          <ChevronLeft size={20} />
          <span>Back to Tasks</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 flex-1">
          {task.type} - {task.machineName}
        </h1>
        {/* <div className="flex items-center space-x-2">
          {getStatusBadge(task.status)}
          {getPriorityBadge(task.priority)}
        </div> */}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div className="">
              <h2 className="text-xl font-semibold">
                {machineName}{" "}
                <span className="text-blue-600">({serialNo})</span>
              </h2>
              <p className="text-gray-500">
                {" "}
                Task Type <span className="text-blue-600">({taskType})</span>
              </p>
            </div>

            <div className="w-1/2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Completion Progress
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${taskProgress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                {taskProgress}% Complete
              </div>
            </div>
          </div>

          {/* Task Progress Section */}
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap sm:flex-nowrap -mb-px overflow-x-auto">
            {/* Description */}
            <button
              className={`flex items-center py-3 px-4 sm:py-4 sm:px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === "details"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("details")}
            >
              <FileText size={16} className="mr-2" />
              Description
            </button>

            {/* Checklist */}
            <button
              className={`flex items-center py-3 px-4 sm:py-4 sm:px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === "checklist"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("checklist")}
            >
              <CheckCircle size={16} className="mr-2" />
              Checklist
            </button>

            {/* History */}
            <button
              className={`flex items-center py-3 px-4 sm:py-4 sm:px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === "history"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <Clock size={16} className="mr-2" />
              History
            </button>

            {/* Documents */}
            <button
              className={`flex items-center py-3 px-4 sm:py-4 sm:px-6 font-medium text-sm border-b-2 whitespace-nowrap ${
                activeTab === "documents"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("documents")}
            >
              <Paperclip size={16} className="mr-2" />
              Documents
            </button>
          </nav>
        </div>

        {/* Bellow section */}

        {loading ? (
          <div className="flex justify-center py-8 flex-col items-center text-gray-600 text-sm">
            <div className="w-6 h-6 border-4 border-blue-500 border-dashed rounded-full animate-spin mb-2"></div>
            Loading tasks...
          </div>
        ) : (
          <div className="p-2">
            {/* Details Tab */}
            {/* Details Tab */}
            <div
              className="overflow-x-auto"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {activeTab === "details" && (
                <div>
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="border px-4 py-3 text-left font-medium text-gray-700">
                          Task No
                        </th>
                        <th className="border px-4 py-3 text-left font-medium text-gray-700">
                          Task Date
                        </th>
                        <th className="border px-4 py-3 text-left font-medium text-gray-700">
                          Description
                        </th>
                        <th className="border px-4 py-3 text-left font-medium text-gray-700">
                          Task Sound Test
                        </th>
                        <th className="border px-4 py-3 text-left font-medium text-gray-700">
                          Task Temperature
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingTasks
                        .filter((pendingTask) => {
                          // Filter to show only tasks with today's date
                          const taskDate = new Date(
                            pendingTask["Task Start Date"]
                          );
                          const today = new Date();

                          return (
                            taskDate.getDate() === today.getDate() &&
                            taskDate.getMonth() === today.getMonth() &&
                            taskDate.getFullYear() === today.getFullYear()
                          );
                        })
                        .map((pendingTask, indx) => (
                          <tr key={indx} className="hover:bg-gray-50">
                            <td className="border px-4 py-3 font-medium text-blue-600">
                              {pendingTask["Task No"]}
                            </td>
                            <td className="border px-4 py-3 text-gray-900">
                              {new Date(
                                pendingTask["Task Start Date"]
                              ).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="border px-4 py-3 text-gray-700 max-w-md">
                              <div className="line-clamp-3 break-words">
                                {pendingTask["Description"]}
                              </div>
                            </td>
                            <td className="border px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  pendingTask["Need Sound Test"] === "Yes"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {pendingTask["Need Sound Test"] === "Yes"
                                  ? "Yes"
                                  : "No"}
                              </span>
                            </td>
                            <td className="border px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  pendingTask["Temperature"] === "Yes"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {pendingTask["Temperature"] === "Yes"
                                  ? "Yes"
                                  : "No"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  {pendingTasks.filter((pendingTask) => {
                    const taskDate = new Date(pendingTask["Task Start Date"]);
                    const today = new Date();

                    return (
                      taskDate.getDate() === today.getDate() &&
                      taskDate.getMonth() === today.getMonth() &&
                      taskDate.getFullYear() === today.getFullYear()
                    );
                  }).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No tasks found for today.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CheckList Tab */}

            <div
              className="overflow-x-auto"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {activeTab === "checklist" && (
                <div>
                  <table className="min-w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="border px-2 py-1 text-center">
                          <input
                            type="checkbox"
                            checked={allRelatedTasks
                              .filter((task) => {
                                const taskDate = new Date(
                                  task["Task Start Date"]
                                );
                                const today = new Date();
                                return (
                                  taskDate.getDate() === today.getDate() &&
                                  taskDate.getMonth() === today.getMonth() &&
                                  taskDate.getFullYear() === today.getFullYear()
                                );
                              })
                              .every((task) => checkedItems[task["Task No"]])}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                        </th>

                        <th className="border px-2 py-1 text-blue-700">
                          Task No
                        </th>
                        <th className="border px-2 py-1 text-blue-700">
                          Department
                        </th>
                        <th className="border px-2 py-1 text-blue-700">
                          Description
                        </th>
                        <th className="border px-2 py-1 text-blue-700">
                          Task Status
                        </th>
                        <th className="border px-2 py-1 text-blue-700">
                          Image
                        </th>
                        <th className="border px-2 py-1 text-blue-700">
                          Remarks
                        </th>

                        <th className="border px-2 py-1 text-blue-700">
                          Work Done
                        </th>
                        <th className="border px-2 py-1 text-blue-700">
                          Reason for Work
                        </th>
                        <th className="border px-2 py-1 text-blue-700">
                          {taskType === "Maintence"
                            ? "Maintenace Cost"
                            : "Repair Cost"}
                        </th>

                        <th className="border px-2 py-1 text-blue-700">
                          Performed By
                        </th>
                        <th className="border px-2 py-1 text-blue-700">
                          Downtime (Hours)
                        </th>
                        <th className="border px-2 py-1 text-blue-700">
                          Part Replaced
                        </th>

                        <th className="border px-2 py-1 text-blue-700">
                          Submit
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {allRelatedTasks
                        .filter((task) => {
                          // Filter to show only tasks with today's date
                          const taskDate = new Date(task["Task Start Date"]);
                          const today = new Date();

                          return (
                            taskDate.getDate() === today.getDate() &&
                            taskDate.getMonth() === today.getMonth() &&
                            taskDate.getFullYear() === today.getFullYear()
                          );
                        })
                        .map((task) => {
                          const taskNo = task["Task No"];
                          const isChecked = checkedItems[taskNo] || false;
                          const taskStatus = taskStatuses[taskNo] || "";
                          // const canSubmit =
                          //   isChecked &&
                          //   (taskStatus === "Yes" || taskStatus === "No");

                          const canSubmit = isChecked && taskStatus !== "";

                          const isDone = !!task["Actual Date"];

                          return (
                            <tr
                              key={taskNo}
                              className={`${
                                isDone
                                  ? "bg-green-50 border-green-200 text-gray-500 line-through"
                                  : "bg-white border-gray-200 text-gray-900"
                              }`}
                            >
                              <td className="border px-2 py-1 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleCheckboxChange(taskNo)}
                                  disabled={isDone}
                                  className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                                />
                              </td>
                              <td className="border px-2 py-1 text-center">
                                {taskNo}
                              </td>
                              <td className="border px-2 py-1 text-center">
                                {task["Department"]}
                              </td>
                              <td className="border px-2 py-1 text-left max-w-xs">
                                <div
                                  className="truncate"
                                  title={task["Description"]}
                                >
                                  {task["Description"]}
                                </div>
                              </td>

                              <td className="border px-2 py-1 text-center">
                                {/* <select
                                  value={taskStatus}
                                  onChange={(e) =>
                                    handleStatusChange(taskNo, e.target.value)
                                  }
                                  disabled={!isChecked || isDone}
                                  className="border rounded px-2 py-1 w-full"
                                >
                                  <option value="">Select</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select> */}

                                <select
                                  value={taskStatus}
                                  onChange={(e) =>
                                    handleStatusChange(taskNo, e.target.value)
                                  }
                                  disabled={!isChecked || isDone}
                                  className="border rounded px-2 py-1 w-full"
                                >
                                  <option value="">Select</option>
                                  {masterData.status.map((item, idx) => (
                                    <option key={idx} value={item}>
                                      {item}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="border px-2 py-1 text-center">
                                <label
                                  className={`cursor-pointer ${
                                    !isChecked || isDone
                                      ? "text-gray-400"
                                      : "text-blue-600 hover:underline"
                                  } ${
                                    task["Require Attachment"] === "Yes" &&
                                    "text-red-600"
                                  }`}
                                >
                                  Upload
                                  <input
                                    type="file"
                                    className="hidden"
                                    disabled={!isChecked || isDone}
                                    onChange={(e) =>
                                      handleImageUpload(
                                        taskNo,
                                        e.target.files[0]
                                      )
                                    }
                                  />
                                  {imageFiles[taskNo] && (
                                    <span className="ml-1 text-xs">
                                      ({imageFiles[taskNo].name})
                                    </span>
                                  )}
                                </label>
                              </td>

                              <td className="border px-2 py-1 text-center">
                                {/* <input
                                  type="text"
                                  value={remarks[taskNo] || ""}
                                  onChange={(e) =>
                                    handleRemarksChange(taskNo, e.target.value)
                                  }
                                  disabled={!isChecked || isDone}
                                  placeholder="Enter remarks"
                                  className="outline-none border px-1 py-1 rounded-md w-full"
                                /> */}

                                <select
                                  value={remarks[taskNo] || ""}
                                  onChange={(e) =>
                                    handleRemarksChange(taskNo, e.target.value)
                                  }
                                  disabled={!isChecked || isDone}
                                  className="border rounded px-2 py-1 w-full mb-1"
                                >
                                  <option value="">Select</option>
                                  {masterData.remarks.map((item, idx) => (
                                    <option key={idx} value={item}>
                                      {item}
                                    </option>
                                  ))}
                                  <option value="Other">Other</option>
                                </select>

                                {/* Show text input when "Other" is selected */}
                                {remarks[taskNo] === "Other" && (
                                  <input
                                    type="text"
                                    value={remarksOtherInputs[taskNo] || ""}
                                    onChange={(e) =>
                                      handleRemarksOtherInputChange(
                                        taskNo,
                                        e.target.value
                                      )
                                    }
                                    disabled={!isChecked || isDone}
                                    placeholder="Enter custom remark"
                                    className="outline-none border px-2 py-1 rounded-md w-full mt-1"
                                  />
                                )}
                              </td>

                              <td className="border px-2 py-1 text-center">
                                {/* <select
                                  value={soundStatuses[taskNo] || ""}
                                  onChange={(e) =>
                                    handleSoundStatusChange(
                                      taskNo,
                                      e.target.value
                                    )
                                  }
                                  disabled={!isChecked || isDone}
                                  className="border rounded px-2 py-1 w-full"
                                >
                                  <option value="">Select</option>
                                  <option value="Good">Good</option>
                                  <option value="Bad">Bad</option>
                                  <option value="Need Repair">
                                    Need Repair
                                  </option>
                                  <option value="Ok">Ok</option>
                                </select> */}

                                <select
                                  value={workDones[taskNo] || ""}
                                  onChange={(e) =>
                                    handleWorkDoneChange(taskNo, e.target.value)
                                  }
                                  disabled={!isChecked || isDone}
                                  className="border rounded px-2 py-1 w-full"
                                >
                                  <option value="">Select</option>
                                  {masterData.workDone.map((item, idx) => (
                                    <option key={idx} value={item}>
                                      {item}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="border px-2 py-1 text-center">
                                {/* <input
                                  type="number"
                                  value={temperatures[taskNo] || ""}
                                  onChange={(e) =>
                                    handleTemperatureChange(
                                      taskNo,
                                      e.target.value
                                    )
                                  }
                                  disabled={!isChecked || isDone}
                                  placeholder="Temperature"
                                  className="outline-none border px-1 py-1 rounded-md w-full"
                                /> */}

                                <select
                                  value={reasonForWorks[taskNo] || ""}
                                  onChange={(e) =>
                                    handleReasonForWorkChange(
                                      taskNo,
                                      e.target.value
                                    )
                                  }
                                  disabled={!isChecked || isDone}
                                  className="border rounded px-2 py-1 w-full"
                                >
                                  <option value="">Select</option>
                                  {masterData.reasonForWork.map((item, idx) => (
                                    <option key={idx} value={item}>
                                      {item}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="border px-2 py-1 text-center">
                                <input
                                  type="number"
                                  value={repairCosts[taskNo] || ""}
                                  onChange={(e) =>
                                    handleRepairCostChange(
                                      taskNo,
                                      e.target.value
                                    )
                                  }
                                  disabled={!isChecked || isDone}
                                  placeholder={
                                    taskType === "Maintence"
                                      ? "Maintenace Cost"
                                      : "Repair Cost"
                                  }
                                  className="outline-none border px-1 py-1 rounded-md w-full"
                                />
                              </td>

                              <td className="border px-2 py-1 text-center">
                                <select
                                  value={performedBys[taskNo] || ""}
                                  onChange={(e) =>
                                    handlePerformedByChange(
                                      taskNo,
                                      e.target.value
                                    )
                                  }
                                  disabled={!isChecked || isDone}
                                  className="border rounded px-2 py-1 w-full"
                                >
                                  <option value="">Select</option>
                                  {masterData.performedBy.map((item, idx) => (
                                    <option key={idx} value={item}>
                                      {item}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td className="border px-2 py-1 text-center">
                                <input
                                  type="number"
                                  value={downtimes[taskNo] || ""}
                                  onChange={(e) =>
                                    handleDowntimeChange(taskNo, e.target.value)
                                  }
                                  disabled={!isChecked || isDone}
                                  placeholder="Hours"
                                  className="outline-none border px-1 py-1 rounded-md w-full"
                                />
                              </td>

                              <td className="border px-2 py-1 text-center">
                                <input
                                  type="text"
                                  value={partReplaceds[taskNo] || ""}
                                  onChange={(e) =>
                                    handlePartReplacedChange(
                                      taskNo,
                                      e.target.value
                                    )
                                  }
                                  disabled={!isChecked || isDone}
                                  placeholder="Part name"
                                  className="outline-none border px-1 py-1 rounded-md w-full"
                                />
                              </td>

                              <td className="border px-2 py-1 text-center">
                                <button
                                  className={`px-2 py-1 rounded ${
                                    canSubmit &&
                                    (task["Require Attachment"] !== "Yes" ||
                                      imageFiles[taskNo])
                                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  }`}
                                  disabled={
                                    !canSubmit ||
                                    isDone ||
                                    submittingTasks[taskNo] ||
                                    (task["Require Attachment"] === "Yes" &&
                                      !imageFiles[taskNo])
                                  }
                                  onClick={() => handleSubmit(taskNo)}
                                >
                                  {submittingTasks[taskNo]
                                    ? "Submitting..."
                                    : "Submit"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>

                  {allRelatedTasks.filter((task) => {
                    const taskDate = new Date(task["Task Start Date"]);
                    const today = new Date();

                    return (
                      taskDate.getDate() === today.getDate() &&
                      taskDate.getMonth() === today.getMonth() &&
                      taskDate.getFullYear() === today.getFullYear()
                    );
                  }).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No tasks found for today.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* History Tab */}

            <div
              className="overflow-x-auto"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {activeTab === "history" && (
                <div>
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 left-3.5 w-0.5 bg-gray-200"></div>

                    <ul className="space-y-6">
                      {[...completedTasks].reverse().map((task) => (
                        <li key={task["Task No"]} className="relative pl-10">
                          <div className="absolute left-0 top-1.5 h-7 w-7 rounded-full border-2 border-indigo-500 bg-white flex items-center justify-center">
                            <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-start">
                              <div className="font-medium">
                                {task["Task Type"]} completed{" "}
                                <span className="text-blue-600">
                                  ({task["Task No"]})
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Completed by:{" "}
                                <span className="text-blue-600">
                                  ({task["Doer Name"]})
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 flex gap-10">
                                <h1 className="text-green-600 font-bold">
                                  {new Date(
                                    task["Task Start Date"]
                                  ).toLocaleDateString()}
                                </h1>
                                <h1 className="text-red-600 font-bold">
                                  {new Date(
                                    task["Actual Date"]
                                  ).toLocaleDateString()}
                                </h1>
                              </div>
                            </div>

                            {task["Remarks"] && (
                              <div className="text-sm bg-gray-50 rounded">
                                Remarks: {task["Remarks"]}
                              </div>
                            )}
                            <div className="text-sm bg-gray-50 rounded">
                              Description:-{" "}
                              <span className="text-blue-600">
                                ({task["Description"]})
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Documents Tab */}

            <div
              className="overflow-x-auto"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              {activeTab === "documents" && (
                <div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Task No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[...completedTasks].reverse().map((task) => {
                        const fileName = task["File Name"] || "Document";
                        const fileType = task["File Type"]?.toUpperCase();

                        return (
                          <tr
                            key={task["Task No"]}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-indigo-600">
                              {task["Task No"]}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-indigo-600">
                              {fileName.length > 10
                                ? `${fileName.slice(0, 10)}...`
                                : fileName}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                              {fileType}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                              {task["Doer Name"]}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                task["Task Start Date"]
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                              <a
                                href={task["Image Link"]}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Download
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {completedTasks.filter((task) => task["Image Link"])
                    .length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No documents attached to this task.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;
