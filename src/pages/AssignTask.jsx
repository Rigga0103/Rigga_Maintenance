// import { set } from "date-fns";
// import { Loader2Icon, LoaderIcon } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import useAuthStore from "../store/authStore";
// import Select from "react-select";

// function AssignTask() {
//   const { user } = useAuthStore();
//   console.log("user from assign task", user);
//   const [time, setTime] = useState("09:00");
//   const [accordionOpen, setAccordionOpen] = useState(false);
//   const [sheetData, setSheetData] = useState([]);
//   const [doerName, setDoerName] = useState([]);
//   const [taskStatusData, setTaskStatusData] = useState([]);

//   const [selectedMachine, setSelectedMachine] = useState("");
//   const [filteredSerials, setFilteredSerials] = useState([]);
//   const [imageFile, setImageFile] = useState(null);
//   const [startDate, setStartDate] = useState("");
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [endTaskDate, setEndTaskDate] = useState("");
//   const [availableFrequencies, setAvailableFrequencies] = useState([]);

//   const [selectedSerialNo, setSelectedSerialNo] = useState("");
//   const [selectedDoerName, setSelectedDoerName] = useState("");
//   const [selectedTaskType, setSelectedTaskType] = useState("Maintence"); // Changed default to Maintence
//   const [description, setWorkDescription] = useState("");
//   const [machineArea, setMachineArea] = useState("");
//   const [partName, setPartName] = useState("");
//   const [taskList, setTaskList] = useState([]);

//   const [loaderSheetData, setLoaderSheetData] = useState(false);
//   const [loaderWorkingDayData, setLoaderWorkingDayData] = useState(false);
//   const [loaderSubmit, setLoaderSubmit] = useState(false);
//   const [loaderMasterSheetData, setLoaderMasterSheetData] = useState(false);
//   const [generatedTasks, setGeneratedTasks] = useState([]);
//   const [showTaskPreview, setShowTaskPreview] = useState(false);
//   const [frequency, setFrequency] = useState("");
//   const [workingDaysData, setWorkingDaysData] = useState([]);

//   const [enableReminder, setEnableReminder] = useState(false);
//   const [requireAttachment, setRequireAttachment] = useState(false);

//   const [loaderUserMachineData, setLoaderUserMachineData] = useState(false);

//   const [userMachineData, setUserMachineData] = useState([]);
//   const [AllMachineData, setAllMachineData] = useState([]);

//   const [userSerialData, setUserSerialData] = useState([]);

//   // Maintenance script and sheet details
//   const SCRIPT_URL =
//     "https://script.google.com/macros/s/AKfycbwoqwF1yHxpeW-twfWmtrlk4wFIc0L-02BnjdbivrjZxg0O914udxPgVL6_ksolfFDK/exec";
//   const SHEET_Id = "1MAOfOecxPNZr-5YlZ5sSsXgAPOJ8PVGupBkyp7h_9Jg";
//   const FOLDER_ID = "1nOQjTXrpn5wLOaOjn_J8u8mspFLkd3l0";

//   // Repair script and sheet details
//   const REPAIR_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw0ofs6yopMfqLgA3V33EHh44kXR_rrqrf1hUKARLToPPhEtYhCIgt4ZOEktAVwgc1PIQ/exec";
//   const REPAIR_SHEET_ID = "1NdI3kxXlyPdflmWr3Da53Dt9YHGRVRylm3naJLNWNHE";

//   // Fetch working days calendar data
//   const fetchWorkingDaysCalendar = async () => {
//     try {
//       const SHEET_NAME = "Working Day Calendar";
//       const res = await fetch(
//         `${SCRIPT_URL}?sheetId=${SHEET_Id}&&sheet=${SHEET_NAME}`
//       );
//       const result = await res.json();

//       if (result.success && result.table) {
//         const headers = result.table.cols.map((col) => col.label);
//         const rows = result.table.rows.map((rowObj) => {
//           const row = rowObj.c;
//           const rowData = {};
//           row.forEach((cell, i) => {
//             rowData[headers[i]] = cell?.f || cell?.v || "";
//           });
//           return rowData;
//         });

//         const validRows = rows.filter((row) => row["Working Dates"]);
//         setWorkingDaysData(validRows);

//         if (validRows.length > 0) {
//           const lastWorkingDate =
//             validRows[validRows.length - 1]["Working Dates"];
//           if (lastWorkingDate) {
//             let formattedDate;
//             if (lastWorkingDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
//               const [day, month, year] = lastWorkingDate.split("/");
//               formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
//                 2,
//                 "0"
//               )}`;
//             } else if (lastWorkingDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
//               formattedDate = lastWorkingDate;
//             }

//             if (formattedDate) {
//               setEndDate(formattedDate);
//             }
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Failed to fetch working days calendar", error);
//       toast.error("Failed to load working days calendar");
//     }
//   };

//   const fetchAllTasks = async () => {
//     console.log("slectedfdf", selectedTaskType);
//     try {
//       const SHEET_NAME_TASK =
//         selectedTaskType === "Repair"
//           ? "Repair System"
//           : "Maitenance Task Assign";
//       const res = await fetch(
//         `${SCRIPT_URL}?sheetId=${SHEET_Id}&&sheet=${SHEET_NAME_TASK}`
//       );
//       const result = await res.json();
//       if (result.success && result.table) {
//         const headers = result.table.cols.map((col) => col.label);
//         const rows = result.table.rows.map((rowObj) => {
//           const row = rowObj.c;
//           const rowData = {};
//           row.forEach((cell, i) => {
//             rowData[headers[i]] = cell?.v || "";
//           });
//           return rowData;
//         });
//         console.log("taskResult111", rows);
//         console.log("taskResult", headers);
//         setTaskList(rows);
//       }
//     } catch (error) {
//       console.error("Failed to fetch tasks for Task No generation", error);
//     }
//   };

//   useEffect(() => {
//     selectedTaskType === "Repair"
//       ? setEndDate(endTaskDate)
//       : fetchWorkingDaysCalendar();
//   }, [selectedTaskType, endTaskDate]);

//   console.log("Task List", taskList);

//   useEffect(() => {
//     fetchAllTasks();
//   }, [selectedTaskType]);

//   const fetchSheetData = async () => {
//     const SHEET_NAME = "FormResponses";
//     try {
//       setLoaderSheetData(true);
//       const res = await fetch(
//         `${SCRIPT_URL}?sheetId=${SHEET_Id}&sheet=${SHEET_NAME}`
//       );
//       const result = await res.json();

//       if (result.success && result.table) {
//         const headers = result.table.cols.map((col) => col.label);
//         const rows = result.table.rows;

//         const formattedRows = rows.map((rowObj) => {
//           const row = rowObj.c;
//           const rowData = {};
//           row.forEach((cell, i) => {
//             rowData[headers[i]] = cell.v;
//           });
//           return rowData;
//         });

//         setSheetData(formattedRows);
//       } else {
//         console.error("Server error:", result.message || result.error);
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//     } finally {
//       setLoaderSheetData(false);
//     }
//   };

//   const fetchUserMachineData = async () => {
//     console.log("=== fetchUserMachineData CALLED ===");

//     if (!user?.username) {
//       console.log("No username found:", user);
//       return;
//     }

//     try {
//       setLoaderUserMachineData(true);
//       console.log("Fetching data for username:", user.username);

//       const SHEET_NAME = "Maitenance Task Assign";

//       const res = await fetch(
//         `${SCRIPT_URL}?action=getRawData&sheetId=${SHEET_Id}&sheet=${SHEET_NAME}&pageSize=50000`
//       );

//       const result = await res.json();
//       console.log("fetchUserMachineData API result:", result);

//       let rows = [];
//       let headers = [];

//       if (result.success && result.table) {
//         headers = result.table.cols.map((col) => col.label);
//         rows = result.table.rows.map((rowObj) => {
//           const row = rowObj.c;
//           const rowData = {};
//           row.forEach((cell, i) => {
//             rowData[headers[i]] = cell?.v || "";
//           });
//           return rowData;
//         });
//       } else if (result.success && result.rows && result.headers) {
//         headers = result.headers;
//         rows = result.rows.map((rowArr) => {
//           const rowData = {};
//           headers.forEach((header, i) => {
//             rowData[header] = rowArr[i] || "";
//           });
//           return rowData;
//         });
//       } else {
//         console.error("fetchUserMachineData API failed:", result);
//       }

//       if (rows.length > 0) {
//         console.log("fetchUserMachineData Headers:", headers);
//         console.log("fetchUserMachineData Total rows:", rows.length);
//         console.log("Looking for Doer Name:", user.username);

//         console.log("Sample rows:", rows.slice(0, 5));

//         const allDoerNames = rows.map((row) => row["Doer Name"]).filter(Boolean);
//         const uniqueDoerNames = [...new Set(allDoerNames)];
//         console.log("All unique Doer Names in sheet:", uniqueDoerNames);

//         const userRows = rows
//           .filter((row) => {
//             const doerName = row["Doer Name"]?.toString().trim();
//             const trimmedUserName = user.username?.toString().trim();
//             return (
//               doerName &&
//               (doerName === trimmedUserName ||
//                 doerName.toLowerCase() === trimmedUserName.toLowerCase())
//             );
//           })
//           .map((row) => ({
//             "Machine Name": row["Machine Name"],
//             "Serial No": row["Serial No"],
//           }));

//         console.log(`Found ${userRows.length} rows for user ${user.username}`);
//         console.log("User rows:", userRows);

//         setUserMachineData(userRows);
//         setAllMachineData(rows);
//       }
//     } catch (error) {
//       console.error("Failed to fetch user machine data", error);
//     } finally {
//       setLoaderUserMachineData(false);
//     }
//   };

//   useEffect(() => {
//     console.log("User changed:", user);
//     console.log("User username:", user?.username);
//     console.log("Will call fetchUserMachineData:", !!user?.username);

//     if (user?.username) {
//       fetchUserMachineData();
//     }
//   }, [user]);

//   const fetchMasterSheetData = async () => {
//     const SHEET_NAME = "Master";
//     try {
//       setLoaderMasterSheetData(true);
//       const res = await fetch(
//         `${SCRIPT_URL}?sheetId=${SHEET_Id}&&sheet=${SHEET_NAME}`
//       );
//       const result = await res.json();

//       if (result.success && result.table) {
//         const headers = result.table.cols.map((col) => col.label);
//         const rows = result.table.rows;

//         const formattedRows = rows.map((rowObj) => {
//           const row = rowObj.c;
//           const rowData = {};
//           row.forEach((cell, i) => {
//             rowData[headers[i]] = cell.v;
//           });
//           return rowData;
//         });
//         const DoerNameData = formattedRows.map((item) => item["Doer Name"]);
//         setDoerName(DoerNameData);
//         const taskStatus = formattedRows.map((item) => item["Task Status"]);
//         setTaskStatusData(taskStatus);
//       } else {
//         console.error("Server error:", result.message || result.error);
//       }
//     } catch (err) {
//       console.error("Fetch error:", err);
//     } finally {
//       setLoaderMasterSheetData(false);
//     }
//   };

//   useEffect(() => {
//     fetchSheetData();
//     fetchMasterSheetData();
//   }, []);

//   useEffect(() => {
//     if (startDate && endDate) {
//       const start = new Date(startDate);
//       const end = new Date(endDate);
//       const diffInDays = (end - start) / (1000 * 60 * 60 * 24);

//       let frequencies = [];
//       if (diffInDays >= 365) {
//         frequencies = [
//           "one-time",
//           "Daily",
//           "Weekly",
//           "15 Days",
//           "Monthly",
//           "Quarterly",
//           "Half Yearly",
//           "Yearly",
//         ];
//       } else if (diffInDays >= 180) {
//         frequencies = [
//           "one-time",
//           "Daily",
//           "Weekly",
//           "15 Days",
//           "Monthly",
//           "Quarterly",
//           "Half Yearly",
//         ];
//       } else if (diffInDays >= 90) {
//         frequencies = ["one-time", "Daily", "Weekly", "15 Days", "Monthly", "Quarterly"];
//       } else if (diffInDays >= 30) {
//         frequencies = ["one-time", "Daily", "Weekly", "15 Days", "Monthly"];
//       } else if (diffInDays >= 15) {
//         frequencies = ["one-time", "Daily", "Weekly", "15 Days"];
//       } else if (diffInDays >= 7) {
//         frequencies = ["one-time", "Daily", "Weekly"];
//       } else if (diffInDays > 0) {
//         frequencies = ["one-time", "Daily"];
//       }

//       setAvailableFrequencies(frequencies);
//     } else {
//       setAvailableFrequencies([]);
//     }
//   }, [startDate, endDate]);

//   useEffect(() => {
//     if (user?.name) {
//       setSelectedDoerName(user.name);
//     }
//   }, [user]);

//   useEffect(() => {
//     if (user?.department) {
//       setMachineArea(user.department);
//     }
//   }, [user]);

//   const formatDateTimeForStorage = (date, time) => {
//     if (!date || !time) return "";

//     const d = new Date(date);
//     const day = d.getDate().toString().padStart(2, "0");
//     const month = (d.getMonth() + 1).toString().padStart(2, "0");
//     const year = d.getFullYear();

//     const timeWithSeconds = time + ":00";

//     return `${day}/${month}/${year} ${time}`;
//   };

//   const formatDateToDDMMYYYY = (date) => {
//     const d = new Date(date);
//     const day = d.getDate().toString().padStart(2, "0");
//     const month = (d.getMonth() + 1).toString().padStart(2, "0");
//     const year = d.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const findNextWorkingDay = (targetDate, workingDays) => {
//     const targetDateStr = formatDateToDDMMYYYY(targetDate);

//     if (workingDays.includes(targetDateStr)) {
//       return targetDateStr;
//     }

//     let checkDate = new Date(targetDate);
//     for (let i = 1; i <= 30; i++) {
//       checkDate = addDays(targetDate, i);
//       const checkDateStr = formatDateToDDMMYYYY(checkDate);
//       if (workingDays.includes(checkDateStr)) {
//         return checkDateStr;
//       }
//     }

//     return targetDateStr;
//   };

//   const addDays = (date, days) => {
//     const newDate = new Date(date);
//     newDate.setDate(newDate.getDate() + days);
//     return newDate;
//   };

//   const addMonths = (date, months) => {
//     const newDate = new Date(date);
//     newDate.setMonth(newDate.getMonth() + months);
//     return newDate;
//   };

//   const addYears = (date, years) => {
//     const newDate = new Date(date);
//     newDate.setFullYear(newDate.getFullYear() + years);
//     return newDate;
//   };

//   const fetchWorkingDays = async () => {
//     try {
//       const SCRIPT_URL =
//         "https://script.google.com/macros/s/AKfycbwoqwF1yHxpeW-twfWmtrlk4wFIc0L-02BnjdbivrjZxg0O914udxPgVL6_ksolfFDK/exec";
//       const SHEET_NAME = "Working Day Calendar";

//       const response = await fetch(
//         `${SCRIPT_URL}?sheetId=${SHEET_Id}&sheet=${SHEET_NAME}`
//       );
//       if (!response.ok) {
//         throw new Error(`Failed to fetch working days: ${response.status}`);
//       }

//       const text = await response.text();
//       const jsonStart = text.indexOf("{");
//       const jsonEnd = text.lastIndexOf("}");
//       const jsonString = text.substring(jsonStart, jsonEnd + 1);
//       const data = JSON.parse(jsonString);

//       console.log("Data", data);

//       if (!data.table || !data.table.rows) {
//         console.log("No working day data found");
//         return [];
//       }

//       const workingDays = [];
//       data.table.rows.forEach((row) => {
//         if (row.c && row.c[0] && row.c[0].f) {
//           let dateValue = row.c[0].f;

//           if (
//             typeof dateValue === "string" &&
//             dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/)
//           ) {
//             workingDays.push(dateValue);
//           }
//         }
//       });

//       console.log(`Fetched ${workingDays.length} working days`);
//       console.log("Sample dates:", workingDays.slice(0, 5));
//       return workingDays;
//     } catch (error) {
//       console.error("Error fetching working days:", error);
//       return [];
//     }
//   };

//   const generateTasks = async () => {
//     if (
//       !startDate ||
//       !endDate ||
//       (selectedTaskType === "Maintence" ? !frequency : !endTaskDate)
//     ) {
//       toast.error(
//         "Please fill in all required fields including date range and frequency"
//       );
//       return;
//     }

//     const startDateObj = new Date(startDate);
//     const endDateObj = new Date(endDate);

//     if (startDateObj > endDateObj) {
//       toast.error("End date must be after start date");
//       return;
//     }

//     setLoaderWorkingDayData(true);
//     const workingDays = await fetchWorkingDays();
//     setLoaderWorkingDayData(false);
//     if (workingDays.length === 0) {
//       toast.error("Could not retrieve working days calendar");
//       return;
//     }

//     const tasks = [];

//     if (frequency === "one-time") {
//       const taskDate = findNextWorkingDay(startDateObj, workingDays);
//       if (!taskDate) {
//         toast.error("No working days found in the selected date range");
//         return;
//       }

//       tasks.push({
//         description,
//         doer: selectedDoerName,
//         dueDate: formatDateTimeForStorage(
//           new Date(taskDate.split("/").reverse().join("-")),
//           time
//         ),
//         status: "pending",
//         frequency,
//       });
//     } else {
//       let currentDate = new Date(startDateObj);
//       let taskCount = 0;
//       const maxTasks = 1000;

//       while (currentDate <= endDateObj && taskCount < maxTasks) {
//         const currentDateStr = formatDateToDDMMYYYY(currentDate);

//         if (workingDays.includes(currentDateStr)) {
//           tasks.push({
//             description,
//             doer: selectedDoerName,
//             dueDate: formatDateTimeForStorage(currentDate, time),
//             status: "pending",
//             frequency,
//           });
//           taskCount++;
//         }

//         switch (frequency.toLowerCase()) {
//           case "daily":
//             currentDate = addDays(currentDate, 1);
//             break;
//           case "weekly":
//             currentDate = addDays(currentDate, 7);
//             break;
//           case "15 days":
//             currentDate = addDays(currentDate, 15);
//             break;
//           case "monthly":
//             currentDate = addMonths(currentDate, 1);
//             break;
//           case "quarterly":
//             currentDate = addMonths(currentDate, 3);
//             break;
//           case "half yearly":
//           case "half-yearly":
//             currentDate = addMonths(currentDate, 6);
//             break;
//           case "yearly":
//             currentDate = addYears(currentDate, 1);
//             break;
//           default:
//             currentDate = addDays(currentDate, 1);
//             break;
//         }
//       }
//     }

//     if (tasks.length === 0) {
//       toast.error(
//         "No tasks generated - check your date range and working days"
//       );
//       return;
//     }

//     setGeneratedTasks(tasks);
//     setShowTaskPreview(true);
//     toast.success(
//       `Generated ${tasks.length} tasks between ${formatDateToDDMMYYYY(
//         startDateObj
//       )} and ${formatDateToDDMMYYYY(endDateObj)}`
//     );
//   };

//   const uploadImageToDrive = async (file, taskNo) => {
//     const reader = new FileReader();

//     return new Promise((resolve, reject) => {
//       reader.onload = async () => {
//         const base64Data = reader.result.split(',')[1];

//         try {
//           const uploadScriptUrl = selectedTaskType === "Repair" ? REPAIR_SCRIPT_URL : SCRIPT_URL;

//           const response = await fetch(uploadScriptUrl, {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/x-www-form-urlencoded",
//             },
//             body: new URLSearchParams({
//               action: "uploadFile",
//               base64Data: base64Data,
//               fileName: `${taskNo}_${Date.now()}_${file.name}`,
//               mimeType: file.type,
//               folderId: FOLDER_ID,
//             }).toString(),
//           });

//           const data = await response.json();

//           if (data.success && data.fileUrl) {
//             resolve(data.fileUrl);
//           } else {
//             toast.error("❌ Image upload failed");
//             resolve("");
//           }
//         } catch (err) {
//           console.error("Upload error:", err);
//           toast.error("❌ Image upload failed due to network error");
//           resolve("");
//         }
//       };

//       reader.onerror = () => {
//         reject("❌ Failed to read file");
//       };

//       reader.readAsDataURL(file);
//     });
//   };

//   const handleSubmitForm = async (e) => {
//     e.preventDefault();

//     try {
//       setLoaderSubmit(true);

//       const scriptUrl = selectedTaskType === "Repair" ? REPAIR_SCRIPT_URL : SCRIPT_URL;
//       const sheetId = selectedTaskType === "Repair" ? REPAIR_SHEET_ID : SHEET_Id;
//       const sheetName = selectedTaskType === "Repair" ? "Repair System" : "Maitenance Task Assign";

//       const payload = {
//         action: "insert1",
//         sheetName: sheetName,
//         sheetId: sheetId
//       };

//       if (selectedTaskType === "Repair") {
//         let imageUrl = "";
//         if (imageFile) {
//           const uniqueId = Date.now();
//           imageUrl = await uploadImageToDrive(imageFile, `repair_${uniqueId}`);
//         }

//         Object.assign(payload, {
//           "Time Stemp": new Date().toLocaleString("en-IN", {
//             timeZone: "Asia/Kolkata",
//           }),
//           "Serial No": selectedSerialNo,
//           "Machine Name": selectedMachine,
//           "Machine Part Name": partName,
//           "Doer Name": selectedDoerName,
//           "Problem With Machine": description,
//           "Enable Reminders": enableReminder ? "Yes" : "No",
//           "Require Attachment": requireAttachment ? "Yes" : "No",
//           "Task Start Date": `${startDate} ${startTime}:00`,
//           "Task Ending Date": `${endTaskDate} ${endTime}:00`,
//           "Priority": selectedPriority,
//           "Department": machineArea,
//           "Image Link": imageUrl
//         });
//       } else {
//         if (generatedTasks.length === 0) {
//           toast.error("❌ No generated tasks to assign. Please preview first.");
//           return;
//         }

//         const maintTasks = taskList.filter(task =>
//           task["Task No"] &&
//           typeof task["Task No"] === 'string' &&
//           task["Task No"].startsWith("TM-")
//         );

//         let lastTaskNo = 0;
//         if (maintTasks.length > 0) {
//           const taskNumbers = maintTasks.map(task => {
//             const numPart = task["Task No"].split("TM-")[1];
//             return parseInt(numPart) || 0;
//           });
//           lastTaskNo = Math.max(...taskNumbers);
//         }

//         payload.batchInsert = "true";
//         payload.rowData = JSON.stringify(
//           generatedTasks.map((task, idx) => ({
//             "Time Stemp": new Date().toLocaleString("en-IN", {
//               timeZone: "Asia/Kolkata",
//             }),
//             "Task No": `TM-${String(lastTaskNo + idx + 1).padStart(3, "0")}`,
//             "Serial No": selectedSerialNo,
//             "Machine Name": selectedMachine,
//             "Doer Name": selectedDoerName,
//             "Task Type": selectedTaskType,
//             "Machine Area": machineArea,
//             "Part Name": partName,
//             "Enable Reminders": enableReminder ? "Yes" : "No",
//             "Require Attachment": requireAttachment ? "Yes" : "No",
//             "Task Start Date": `${task.dueDate.split(" ")[0]} ${startTime}:00`,
//             "Frequency": frequency,
//             "Description": description,
//           }))
//         );
//       }

//       const response = await fetch(scriptUrl, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: new URLSearchParams(payload).toString(),
//       });

//       const result = await response.json();
//       console.log("Server response:", result);

//       if (result.success) {
//         toast.success("✅ Task assigned successfully!");

//         setSelectedSerialNo("");
//         setSelectedMachine("");
//         setSelectedDoerName("");
//         setSelectedTaskType("Maintence"); // Reset to Maintence
//         setStartDate("");
//         setEndDate("");
//         setEndTaskDate("");
//         setFrequency("");
//         setWorkDescription("");
//         setShowTaskPreview(false);
//         setStartTime("");
//         setEndTime("");
//         setEnableReminder(false);
//         setRequireAttachment(false);
//         setMachineArea("");
//         setPartName("");
//         setImageFile(null);
//         setGeneratedTasks([]);
//       } else {
//         throw new Error(result.error || "Unknown error occurred");
//       }
//     } catch (error) {
//       console.error("❌ Submission failed:", error);
//       toast.error(`❌ Failed to assign task: ${error.message}`);
//     } finally {
//       setLoaderSubmit(false);
//     }
//   };

//   return (
//     <div className="p-2">
//       <h1 className="text-2xl font-bold mb-6 text-center">Assign Maintenance Task</h1>
//       <div className="flex justify-center">
//         <div className="bg-white rounded-lg shadow p-6 w-[90vw]">
//           <form className="space-y-4" onSubmit={handleSubmitForm}>
//             {/* Task Type - Hidden but set to Maintence */}
//             <div className="hidden">
//               <select
//                 id="taskType"
//                 value={selectedTaskType}
//                 onChange={(e) => setSelectedTaskType(e.target.value)}
//                 className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white"
//               >
//                 <option value="Maintence">Maintenance</option>
//               </select>
//             </div>

//             {/* Maintenance Form - Always Visible */}
//             <div className="flex justify-between">
//               {/* left */}
//               <div className="w-[45%] space-y-4">
//                 {/* Machine Name Dropdown */}
//                 <div>
//                   <label
//                     htmlFor="machineName"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Machine Name
//                   </label>
//                   <select
//                     id="machineName"
//                     value={selectedMachine}
//                     onChange={(e) => {
//                       const selected = e.target.value;
//                       setSelectedMachine(selected);
//                       const serials = sheetData
//                         .filter((item) => item["Machine Name"] === selected)
//                         .map((item) => item["Serial No"]);
//                       setFilteredSerials(serials);
//                     }}
//                     className="w-full py-2 rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="">Select Machine</option>
//                     {loaderMasterSheetData ? (
//                       <option className="flex gap-5 items-center justify-center">
//                         <Loader2Icon className="animate-spin text-red-500" />
//                         <h1>Wait Please...</h1>
//                       </option>
//                     ) : (
//                       <>
//                         {[
//                           ...new Set(
//                             sheetData.map((item) => item["Machine Name"])
//                           ),
//                         ]
//                           .filter(Boolean)
//                           .map((machineName, index) => (
//                             <option key={index} value={machineName}>
//                               {machineName}
//                             </option>
//                           ))}
//                       </>
//                     )}
//                   </select>
//                 </div>
//                 {/* Serial No Dropdown */}
//                 {selectedMachine && !loaderSheetData && (
//                   <div className="">
//                     <label
//                       htmlFor="serialNo"
//                       className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                       Serial Number
//                     </label>
//                     <select
//                       id="serialNo"
//                       onChange={(e) => setSelectedSerialNo(e.target.value)}
//                       className="py-2 w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     >
//                       <option value="">Select Serial No</option>
//                       {filteredSerials.map((serial, idx) => (
//                         <option key={idx} value={serial}>
//                           {serial}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}

//                 {/* Doer's Name */}
//                 <div>
//                   <label
//                     htmlFor="doerName"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Doer's Name
//                   </label>
//                   <input
//                     id="doerName"
//                     list="doerNameList"
//                     value={selectedDoerName}
//                     onChange={(e) => setSelectedDoerName(e.target.value)}
//                     className="py-2 rounded-md w-full border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="Select or type new name"
//                   />
//                   <datalist id="doerNameList">
//                     {loaderMasterSheetData ? (
//                       <option disabled>Loading...</option>
//                     ) : (
//                       <>
//                         {user?.name && (
//                           <option key="current-user" value={user.name}>
//                             {user.name}
//                           </option>
//                         )}
//                         {doerName
//                           .filter(item => item && item !== user?.name)
//                           .map((item, index) => (
//                             <option key={index} value={item}>
//                               {item}
//                             </option>
//                           ))
//                         }
//                       </>
//                     )}
//                   </datalist>
//                 </div>

//               </div>

//               {/* right */}
//               <div className="w-[45%] space-y-4">
//                 {/* Task Status */}
//                 <div>
//                   <label
//                     htmlFor="taskStatus"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Task Status
//                   </label>
//                   <select
//                     id="taskStatus"
//                     className="py-2 w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   >
//                     <option value="">Select Task Status</option>
//                     {loaderMasterSheetData ? (
//                       <option className="flex gap-5 items-center justify-center">
//                         <Loader2Icon className="animate-spin text-red-500" />
//                         <h1>Wait Please...</h1>
//                       </option>
//                     ) : (
//                       taskStatusData.map(
//                         (item, index) =>
//                           item && (
//                             <option key={index} value={item}>
//                               {item}
//                             </option>
//                           )
//                       )
//                     )}
//                   </select>
//                 </div>

//                 {/* Machine Area */}
//                 <div>
//                   <label
//                     htmlFor="machineArea"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Machine Area
//                   </label>
//                   <input
//                     id="machineArea"
//                     onChange={(e) => setMachineArea(e.target.value)}
//                     value={machineArea}
//                     className="py-2 w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="Enter machine area..."
//                   />
//                 </div>

//                 {/* Part Name */}
//                 <div>
//                   <label
//                     htmlFor="partName"
//                     className="block text-sm font-medium text-gray-700 mb-1"
//                   >
//                     Part Name
//                   </label>
//                   <input
//                     id="partName"
//                     onChange={(e) => setPartName(e.target.value)}
//                     value={partName}
//                     className="py-2 w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="Enter part name..."
//                   />
//                 </div>

//               </div>
//             </div>

//             {/* Work Description */}
//             <div>
//               <label
//                 htmlFor="description"
//                 className="block text-sm font-medium text-gray-700 mb-1"
//               >
//                 Work Description
//               </label>
//               <textarea
//                 id="description"
//                 onChange={(e) => setWorkDescription(e.target.value)}
//                 value={description}
//                 rows={4}
//                 className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter task description..."
//               />
//             </div>

//             {/* Start Date, Time and Frequency */}
//             <div className="flex space-x-10">
//               <div>
//                 <label
//                   htmlFor="startDate"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Task Start Date
//                 </label>
//                 <input
//                   type="date"
//                   id="startDate"
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="startTime"
//                   className="block text-sm font-medium text-gray-700"
//                 >
//                   Task Time
//                 </label>
//                 <input
//                   type="time"
//                   id="startTime"
//                   value={startTime}
//                   onChange={(e) => setStartTime(e.target.value)}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
//                 />
//               </div>

//               <div>
//                 <label
//                   htmlFor="frequency"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Frequency
//                 </label>
//                 <select
//                   id="frequency"
//                   onChange={(e) => setFrequency(e.target.value)}
//                   className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   disabled={availableFrequencies.length === 0}
//                 >
//                   <option value="">Select Frequency</option>
//                   {availableFrequencies.map((freq, idx) => (
//                     <option key={idx} value={freq.toLowerCase()}>
//                       {freq}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Preview Generated Tasks Button */}
//             <button
//               type="button"
//               disabled={loaderWorkingDayData}
//               onClick={generateTasks}
//               className={`w-full flex items-center justify-center gap-2 mb-4 px-4 py-2 text-sm bg-blue-100 border border-blue-400 text-blue-700 rounded hover:bg-blue-200 ${loaderWorkingDayData ? "opacity-50 cursor-not-allowed" : ""
//                 }`}
//             >
//               {loaderWorkingDayData && (
//                 <LoaderIcon className="animate-spin w-4 h-4" />
//               )}
//               Preview Generated Tasks
//             </button>

//             {/* Task Preview */}
//             {showTaskPreview && (
//               <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg">
//                 <div className="text-blue-800 font-semibold mb-2">
//                   {generatedTasks.length} Tasks Generated (Will be stored in
//                   Checklist sheet)
//                 </div>
//                 <div className="max-h-[300px] overflow-y-auto space-y-3">
//                   {generatedTasks.slice(0, 10).map((task, idx) => (
//                     <div
//                       key={idx}
//                       className="bg-white rounded p-3 shadow-sm border border-blue-200"
//                     >
//                       <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded inline-block mb-1">
//                         Reminders
//                       </div>
//                       <div className="text-sm">{task.description}</div>
//                       <div className="text-xs text-gray-600">
//                         Due: {task.dueDate}
//                       </div>
//                     </div>
//                   ))}
//                   {generatedTasks.length > 10 && (
//                     <div className="text-xs text-blue-600 italic">
//                       ...and {generatedTasks.length - 10} more tasks
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Additional Options */}
//             <div className="w-full">
//               <h1 className="text-[1.4rem] text-blue-700 mb-5">
//                 Additional Option
//               </h1>
//               <div className="space-y-5">
//                 <div className="flex justify-between">
//                   <div>
//                     <h1 className="text-[1.2rem] text-blue-600">
//                       Enable Reminder
//                     </h1>
//                     <h1 className="text-[1rem] text-blue-500">
//                       Send reminders before task due date
//                     </h1>
//                   </div>
//                   <div
//                     onClick={() => setEnableReminder((prev) => !prev)}
//                     className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${enableReminder ? "bg-blue-600" : "bg-gray-200"
//                       }`}
//                   >
//                     <div
//                       className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enableReminder ? "translate-x-5" : "translate-x-0"
//                         }`}
//                     ></div>
//                   </div>
//                 </div>

//                 <div className="flex justify-between">
//                   <div>
//                     <h1 className="text-[1.2rem] text-blue-600">
//                       Require Attachment
//                     </h1>
//                     <h1 className="text-[1rem] text-blue-500">
//                       User must upload a file when completing task
//                     </h1>
//                   </div>
//                   <div
//                     onClick={() => setRequireAttachment((prev) => !prev)}
//                     className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${requireAttachment ? "bg-blue-600" : "bg-gray-200"
//                       }`}
//                   >
//                     <div
//                       className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${requireAttachment
//                         ? "translate-x-5"
//                         : "translate-x-0"
//                         }`}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="pt-4">
//               <button
//                 type="submit"
//                 disabled={loaderSubmit}
//                 className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loaderSubmit ? "opacity-50 cursor-not-allowed" : ""
//                   }`}
//               >
//                 {loaderSubmit && (
//                   <LoaderIcon className="animate-spin w-4 h-4" />
//                 )}
//                 {loaderSubmit ? "Assigning..." : "Assign Task"}
//               </button>
//             </div>

//             {/* ========== REPAIR FORM - COMMENTED OUT ========== */}
//             {/*
//             {selectedTaskType === "Repair" && (
//               <>
//                 <div className="flex justify-between">
//                   <div className="w-[45%] space-y-4">
//                     <div>
//                       <label
//                         htmlFor="machineName"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                       >
//                         Machine Name
//                       </label>

//                       {loaderUserMachineData ? (
//                         <div className="w-full px-4 py-2 border rounded-md text-gray-500 bg-gray-100">
//                           Loading machines...
//                         </div>
//                       ) : (
//                         <Select
//                           id="machineName"
//                           value={
//                             selectedMachine
//                               ? { label: selectedMachine, value: selectedMachine }
//                               : null
//                           }
//                           onChange={(option) => {
//                             const selected = option?.value || "";
//                             setSelectedMachine(selected);

//                             const dataSource = user?.role === "admin" ? AllMachineData : userMachineData;

//                             const serials = dataSource
//                               .filter((item) => item["Machine Name"] === selected)
//                               .map((item) => item["Serial No"])
//                               .filter(Boolean);

//                             setFilteredSerials([...new Set(serials)]);
//                           }}
//                           options={
//                             (user?.role === "admin"
//                               ? AllMachineData
//                               : userMachineData
//                             )
//                               .map((item) => item["Machine Name"])
//                               .filter(Boolean)
//                               .filter((v, i, arr) => arr.indexOf(v) === i)
//                               .map((machineName) => ({
//                                 label: machineName,
//                                 value: machineName,
//                               }))
//                           }
//                           placeholder="Select Machine..."
//                           isClearable
//                           isSearchable
//                           className="w-full"
//                         />
//                       )}
//                     </div>

//                     {selectedMachine && !loaderSheetData && (
//                       <div className="mt-4">
//                         <label htmlFor="serialNo" className="block text-sm font-medium text-gray-700 mb-1">
//                           Serial Number
//                         </label>
//                         <select
//                           id="serialNo"
//                           onChange={(e) => setSelectedSerialNo(e.target.value)}
//                           className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         >
//                           <option value="">Select Serial No</option>
//                           {filteredSerials.map((serial, idx) => (
//                             <option key={idx} value={serial}>
//                               {serial}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     )}

//                     <div>
//                       <label htmlFor="partName" className="block text-sm font-medium text-gray-700 mb-1">
//                         Machine Part Name
//                       </label>
//                       <input
//                         type="text"
//                         id="partName"
//                         value={partName}
//                         onChange={(e) => setPartName(e.target.value)}
//                         className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="Enter part name"
//                       />
//                     </div>

//                     <div>
//                       <label htmlFor="givenBy" className="block text-sm font-medium text-gray-700 mb-1">
//                         Given By
//                       </label>
//                       <select
//                         id="givenBy"
//                         onChange={(e) => setSelectedGivenBy(e.target.value)}
//                         className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       >
//                         <option value="">Select Given By</option>
//                         {loaderMasterSheetData ? (
//                           <option className="flex gap-5 items-center justify-center">
//                             <Loader2Icon className="animate-spin text-red-500" />
//                             <h1>Wait Please...</h1>
//                           </option>
//                         ) : (
//                           giveByData.map((item, index) =>
//                             item ? (
//                               <option key={index} value={item}>
//                                 {item}
//                               </option>
//                             ) : null
//                           )
//                         )}
//                       </select>
//                     </div>
//                   </div>

//                   <div className="w-[45%] space-y-4">
//                     <div>
//                       <label
//                         htmlFor="doerNameRepair"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                       >
//                         Doer's Name
//                       </label>

//                       {user?.role === "admin" ? (
//                         <select
//                           id="doerNameRepair"
//                           value={selectedDoerName}
//                           onChange={(e) => setSelectedDoerName(e.target.value)}
//                           className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         >
//                           <option value="">Select Doer Name</option>
//                           {loaderMasterSheetData ? (
//                             <option disabled>Loading...</option>
//                           ) : (
//                             doerName.map(
//                               (item, index) =>
//                                 item && (
//                                   <option key={index} value={item}>
//                                     {item}
//                                   </option>
//                                 )
//                             )
//                           )}
//                         </select>
//                       ) : (
//                         <>
//                           <input
//                             id="doerNameRepair"
//                             list="doerNameListRepair"
//                             value={selectedDoerName}
//                             onChange={(e) => setSelectedDoerName(e.target.value)}
//                             className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                             placeholder="Select or type new name"
//                           />
//                           <datalist id="doerNameListRepair">
//                             {loaderMasterSheetData ? (
//                               <option disabled>Loading...</option>
//                             ) : (
//                               <>
//                                 {user?.name && (
//                                   <option key="current-user" value={user.name}>
//                                     {user.name}
//                                   </option>
//                                 )}
//                               </>
//                             )}
//                           </datalist>
//                         </>
//                       )}
//                     </div>

//                     <div>
//                       <label
//                         htmlFor="department"
//                         className="block text-sm font-medium text-gray-700 mb-1"
//                       >
//                         Department
//                       </label>
//                       <input
//                         type="text"
//                         id="department"
//                         value={machineArea}
//                         onChange={(e) => setMachineArea(e.target.value)}
//                         className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="Enter department"
//                       />
//                     </div>

//                     <div>
//                       <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
//                         Location
//                       </label>
//                       <input
//                         type="text"
//                         id="location"
//                         value={temperature}
//                         onChange={(e) => setTemperature(e.target.value)}
//                         className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="Enter location"
//                       />
//                     </div>

//                     <div>
//                       <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
//                         Priority
//                       </label>
//                       <select
//                         id="priority"
//                         onChange={(e) => setSelectedPriority(e.target.value)}
//                         className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       >
//                         <option value="">Select Priority</option>
//                         {loaderMasterSheetData ? (
//                           <option className="flex gap-5 items-center justify-center">
//                             <Loader2Icon className="animate-spin text-red-500" />
//                             <h1>Wait Please...</h1>
//                           </option>
//                         ) : (
//                           priorityData.map((item, index) =>
//                             item ? (
//                               <option key={index} value={item}>
//                                 {item}
//                               </option>
//                             ) : null
//                           )
//                         )}
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label htmlFor="machineProblem" className="block text-sm font-medium text-gray-700 mb-1">
//                     Problem With Machine
//                   </label>
//                   <textarea
//                     id="machineProblem"
//                     onChange={(e) => setWorkDescription(e.target.value)}
//                     value={description}
//                     rows={3}
//                     className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="Describe the problem..."
//                   />
//                 </div>

//                 <div className="flex flex-col md:flex-row md:space-x-10 space-y-4 md:space-y-0">
//                   <div>
//                     <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
//                       Task Start Date
//                     </label>
//                     <input
//                       type="date"
//                       id="startDate"
//                       value={startDate}
//                       onChange={(e) => setStartDate(e.target.value)}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
//                       Task Start Time
//                     </label>
//                     <input
//                       type="time"
//                       id="startTime"
//                       value={startTime}
//                       onChange={(e) => setStartTime(e.target.value)}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
//                       Task End Date
//                     </label>
//                     <input
//                       type="date"
//                       id="endDate"
//                       value={endTaskDate}
//                       onChange={(e) => setEndTaskDate(e.target.value)}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
//                       Task End Time
//                     </label>
//                     <input
//                       type="time"
//                       id="endTime"
//                       value={endTime}
//                       onChange={(e) => setEndTime(e.target.value)}
//                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
//                     />
//                   </div>
//                 </div>

//                 <div className="w-full pt-6">
//                   <h1 className="text-[1.4rem] text-blue-700 mb-5">Additional Option</h1>
//                   <div className="space-y-5">
//                     <div className="flex justify-between">
//                       <div>
//                         <h1 className="text-[1.2rem] text-blue-600">Enable Reminder</h1>
//                         <h1 className="text-[1rem] text-blue-500">Send reminders before task due date</h1>
//                       </div>
//                       <div
//                         onClick={() => setEnableReminder((prev) => !prev)}
//                         className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${enableReminder ? "bg-blue-600" : "bg-gray-200"
//                           }`}
//                       >
//                         <div
//                           className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enableReminder ? "translate-x-5" : "translate-x-0"
//                             }`}
//                         ></div>
//                       </div>
//                     </div>

//                     <div className="flex justify-between">
//                       <div>
//                         <h1 className="text-[1.2rem] text-blue-600">Require Attachment</h1>
//                         <h1 className="text-[1rem] text-blue-500">User must upload a file when completing task</h1>
//                       </div>
//                       <div
//                         onClick={() => setRequireAttachment((prev) => !prev)}
//                         className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${requireAttachment ? "bg-blue-600" : "bg-gray-200"
//                           }`}
//                       >
//                         <div
//                           className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${requireAttachment ? "translate-x-5" : "translate-x-0"
//                             }`}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="pt-4">
//                   <label htmlFor="machineImage" className="block text-sm font-medium text-gray-700 mb-1">
//                     Upload Machine Image (Optional)
//                   </label>
//                   <input
//                     type="file"
//                     id="machineImage"
//                     accept="image/*"
//                     onChange={(e) => setImageFile(e.target.files[0])}
//                     className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white"
//                   />
//                 </div>

//                 <div className="pt-4">
//                   <button
//                     type="submit"
//                     disabled={loaderSubmit}
//                     className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loaderSubmit ? "opacity-50 cursor-not-allowed" : ""
//                       }`}
//                   >
//                     {loaderSubmit && <LoaderIcon className="animate-spin w-4 h-4" />}
//                     {loaderSubmit ? "Assigning..." : "Assign Task"}
//                   </button>
//                 </div>
//               </>
//             )}
//             */}
//             {/* ========== END REPAIR FORM ========== */}
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AssignTask;

import { set } from "date-fns";
import { Loader2Icon, LoaderIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";
import Select from "react-select";

function AssignTask() {
  const { user } = useAuthStore();
  const [time, setTime] = useState("09:00");
  const [accordionOpen, setAccordionOpen] = useState(false);
  const [sheetData, setSheetData] = useState([]);
  const [doerName, setDoerName] = useState([]);
  const [giveByData, setGivenByData] = useState([]);
  const [taskStatusData, setTaskStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);

  const [selectedMachine, setSelectedMachine] = useState("");
  const [filteredSerials, setFilteredSerials] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTaskDate, setEndTaskDate] = useState("");
  const [availableFrequencies, setAvailableFrequencies] = useState([]);

  const [selectedSerialNo, setSelectedSerialNo] = useState("");
  const [selectedGivenBy, setSelectedGivenBy] = useState("");
  const [selectedDoerName, setSelectedDoerName] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("Select Task Type");
  const [needSoundTask, setNeedSoundTask] = useState("");
  const [temperature, setTemperature] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [description, setWorkDescription] = useState("");
  const [machineArea, setMachineArea] = useState("");
  const [partName, setPartName] = useState("");
  const [taskList, setTaskList] = useState([]);

  const [loaderSheetData, setLoaderSheetData] = useState(false);
  const [loaderWorkingDayData, setLoaderWorkingDayData] = useState(false);
  const [loaderSubmit, setLoaderSubmit] = useState(false);
  const [loaderMasterSheetData, setLoaderMasterSheetData] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [showTaskPreview, setShowTaskPreview] = useState(false);
  const [frequency, setFrequency] = useState("");
  const [workingDaysData, setWorkingDaysData] = useState([]);

  const [enableReminder, setEnableReminder] = useState(false);
  const [requireAttachment, setRequireAttachment] = useState(false);

  const [loaderUserMachineData, setLoaderUserMachineData] = useState(false);

  const [userMachineData, setUserMachineData] = useState([]);
  const [AllMachineData, setAllMachineData] = useState([]);

  const [userSerialData, setUserSerialData] = useState([]);

  // Maintenance script and sheet details
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwoqwF1yHxpeW-twfWmtrlk4wFIc0L-02BnjdbivrjZxg0O914udxPgVL6_ksolfFDK/exec";

  const SHEET_Id = "1MAOfOecxPNZr-5YlZ5sSsXgAPOJ8PVGupBkyp7h_9Jg";
  const FOLDER_ID = "1rf1Zd4PpxZZXe4zUWUA4cbNWjI7QjtGm";

  // Repair script and sheet details
  const REPAIR_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwrMqtt_V8Fb6paAhab9rPdCnYxZPo30Op5f8GQjjSgZIUa7nKCQD0kztUOkO8nVMrxqg/exec";
  const REPAIR_SHEET_ID = "1pcW63NQRkNVieiRyhOb7QFSu6rODIV7k_Ct-8VMatnY";

  // Fetch working days calendar data
  const fetchWorkingDaysCalendar = async () => {
    try {
      const SHEET_NAME = "Working Day Calendar";
      const res = await fetch(
        `${SCRIPT_URL}?sheetId=${SHEET_Id}&&sheet=${SHEET_NAME}`
      );
      const result = await res.json();

      if (result.success && result.table) {
        const headers = result.table.cols.map((col) => col.label);
        const rows = result.table.rows.map((rowObj) => {
          const row = rowObj.c;
          const rowData = {};
          row.forEach((cell, i) => {
            // Use formatted value (f) if available, otherwise raw value (v)
            rowData[headers[i]] = cell?.f || cell?.v || "";
          });
          return rowData;
        });

        // Filter out empty rows and set working days data
        const validRows = rows.filter((row) => row["Working Dates"]);
        setWorkingDaysData(validRows);

        // Set endDate to the last working date if available
        if (validRows.length > 0) {
          const lastWorkingDate =
            validRows[validRows.length - 1]["Working Dates"];
          if (lastWorkingDate) {
            // Handle different date formats
            let formattedDate;
            if (lastWorkingDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
              // DD/MM/YYYY format
              const [day, month, year] = lastWorkingDate.split("/");
              formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
                2,
                "0"
              )}`;
            } else if (lastWorkingDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // Already in YYYY-MM-DD format
              formattedDate = lastWorkingDate;
            }

            if (formattedDate) {
              setEndDate(formattedDate);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch working days calendar", error);
      toast.error("Failed to load working days calendar");
    }
  };

  const fetchAllTasks = async () => {
    try {
      const SHEET_NAME_TASK =
        selectedTaskType === "Repair"
          ? "Repair System"
          : "Maitenance Task Assign";
      const res = await fetch(
        `${SCRIPT_URL}?sheetId=${SHEET_Id}&&sheet=${SHEET_NAME_TASK}`
      );
      const result = await res.json();
      if (result.success && result.table) {
        const headers = result.table.cols.map((col) => col.label);
        const rows = result.table.rows.map((rowObj) => {
          const row = rowObj.c;
          const rowData = {};
          row.forEach((cell, i) => {
            rowData[headers[i]] = cell?.v || "";
          });
          return rowData;
        });
        setTaskList(rows);
      }
    } catch (error) {
      console.error("Failed to fetch tasks for Task No generation", error);
    }
  };

  useEffect(() => {
    selectedTaskType === "Repair"
      ? setEndDate(endTaskDate)
      : fetchWorkingDaysCalendar();
  }, [selectedTaskType, endTaskDate]);

  useEffect(() => {
    fetchAllTasks();
  }, [selectedTaskType]);

  const fetchSheetData = async () => {
    const SHEET_NAME = "FormResponses";
    try {
      setLoaderSheetData(true);
      const res = await fetch(
        `${SCRIPT_URL}?sheetId=${SHEET_Id}&sheet=${SHEET_NAME}`
      );
      const result = await res.json();

      if (result.success && result.table) {
        const headers = result.table.cols.map((col) => col.label); // Extract headers
        const rows = result.table.rows;

        // Transform rows into objects with key-value pairs
        const formattedRows = rows.map((rowObj) => {
          const row = rowObj.c;
          const rowData = {};
          row.forEach((cell, i) => {
            rowData[headers[i]] = cell.v; // you can also use `cell.f` if you want formatted version
          });
          return rowData;
        });

        setSheetData(formattedRows); // Set formatted data into state
      } else {
        console.error("Server error:", result.message || result.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoaderSheetData(false);
    }
  };

  const fetchUserMachineData = async () => {
    if (!user?.username) {
      return;
    }

    try {
      setLoaderUserMachineData(true);

      const SHEET_NAME = "Maitenance Task Assign";

      // ✅ action=getRawData add kiya
      const res = await fetch(
        `${SCRIPT_URL}?action=getRawData&sheetId=${SHEET_Id}&sheet=${SHEET_NAME}&pageSize=50000`
      );

      const result = await res.json();

      let rows = [];
      let headers = [];

      if (result.success && result.table) {
        // 🔹 Old format (Google Visualization API style)
        headers = result.table.cols.map((col) => col.label);
        rows = result.table.rows.map((rowObj) => {
          const row = rowObj.c;
          const rowData = {};
          row.forEach((cell, i) => {
            rowData[headers[i]] = cell?.v || "";
          });
          return rowData;
        });
      } else if (result.success && result.rows && result.headers) {
        // 🔹 New format (getRawData response)
        headers = result.headers;
        rows = result.rows.map((rowArr) => {
          const rowData = {};
          headers.forEach((header, i) => {
            rowData[header] = rowArr[i] || "";
          });
          return rowData;
        });
      } else {
        console.error("fetchUserMachineData API failed:", result);
      }

      if (rows.length > 0) {
        const allDoerNames = rows
          .map((row) => row["Doer Name"])
          .filter(Boolean);
        const uniqueDoerNames = [...new Set(allDoerNames)];

        const userRows = rows
          .filter((row) => {
            const doerName = row["Doer Name"]?.toString().trim();
            const trimmedUserName = user.username?.toString().trim();
            return (
              doerName &&
              (doerName === trimmedUserName ||
                doerName.toLowerCase() === trimmedUserName.toLowerCase())
            );
          })
          .map((row) => ({
            "Machine Name": row["Machine Name"],
            "Serial No": row["Serial No"],
          }));

        setUserMachineData(userRows);
        setAllMachineData(rows);
      }
    } catch (error) {
      console.error("Failed to fetch user machine data", error);
    } finally {
      setLoaderUserMachineData(false);
    }
  };

  useEffect(() => {
    if (user?.username) {
      fetchUserMachineData();
    }
  }, [user]);

  const fetchMasterSheetData = async () => {
    const SHEET_NAME = "Master";
    try {
      setLoaderMasterSheetData(true);
      const res = await fetch(
        `${SCRIPT_URL}?sheetId=${SHEET_Id}&&sheet=${SHEET_NAME}`
      );
      const result = await res.json();

      if (result.success && result.table) {
        const headers = result.table.cols.map((col) => col.label); // Extract headers
        const rows = result.table.rows;

        // Transform rows into objects with key-value pairs
        const formattedRows = rows.map((rowObj) => {
          const row = rowObj.c;
          const rowData = {};
          row.forEach((cell, i) => {
            rowData[headers[i]] = cell.v; // you can also use `cell.f` if you want formatted version
          });
          return rowData;
        });
        const DoerNameData = formattedRows.map((item) => item["Doer Name"]);
        setDoerName(DoerNameData);
        const giveBy = formattedRows.map((item) => item["Given By"]);
        setGivenByData(giveBy);
        const taskStatus = formattedRows.map((item) => item["Task Status"]);
        setTaskStatusData(taskStatus);
        const priority = formattedRows.map((item) => item["Priority"]);
        setPriorityData(priority);
      } else {
        console.error("Server error:", result.message || result.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoaderMasterSheetData(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
    fetchMasterSheetData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffInDays = (end - start) / (1000 * 60 * 60 * 24);

      let frequencies = [];
      if (diffInDays >= 365) {
        frequencies = [
          "one-time",
          "Daily",
          "Weekly",
          "15 Days",
          "Monthly",
          "Quarterly",
          "Half Yearly",
          "Yearly",
        ];
      } else if (diffInDays >= 180) {
        frequencies = [
          "one-time",
          "Daily",
          "Weekly",
          "15 Days",
          "Monthly",
          "Quarterly",
          "Half Yearly",
        ];
      } else if (diffInDays >= 90) {
        frequencies = [
          "one-time",
          "Daily",
          "Weekly",
          "15 Days",
          "Monthly",
          "Quarterly",
        ];
      } else if (diffInDays >= 30) {
        frequencies = ["one-time", "Daily", "Weekly", "15 Days", "Monthly"];
      } else if (diffInDays >= 15) {
        frequencies = ["one-time", "Daily", "Weekly", "15 Days"];
      } else if (diffInDays >= 7) {
        frequencies = ["one-time", "Daily", "Weekly"];
      } else if (diffInDays > 0) {
        frequencies = ["one-time", "Daily"];
      }

      setAvailableFrequencies(frequencies);
    } else {
      setAvailableFrequencies([]);
    }
  }, [startDate, endDate]);

  // Add this useEffect near your other useEffect hooks
  useEffect(() => {
    if (user?.name) {
      setSelectedDoerName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (user?.department) {
      setMachineArea(user.department);
    }
  }, [user]);

  // NEW: Function to combine date and time into DD/MM/YYYY HH:MM:SS format
  const formatDateTimeForStorage = (date, time) => {
    if (!date || !time) return "";

    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();

    // Time is already in HH:MM format, just add :00 for seconds
    const timeWithSeconds = time + ":00";

    return `${day}/${month}/${year} ${time}`;
  };

  // UPDATED: Date formatting function to return DD/MM/YYYY format (for working days comparison)
  const formatDateToDDMMYYYY = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // NEW: Helper function to find next working day for a given date
  const findNextWorkingDay = (targetDate, workingDays) => {
    const targetDateStr = formatDateToDDMMYYYY(targetDate);

    // If target date is already a working day, return it
    if (workingDays.includes(targetDateStr)) {
      return targetDateStr;
    }

    // Otherwise, find the next working day
    let checkDate = new Date(targetDate);
    for (let i = 1; i <= 30; i++) {
      // Check up to 30 days ahead
      checkDate = addDays(targetDate, i);
      const checkDateStr = formatDateToDDMMYYYY(checkDate);
      if (workingDays.includes(checkDateStr)) {
        return checkDateStr;
      }
    }

    // If no working day found in 30 days, return the original target date
    return targetDateStr;
  };

  const addDays = (date, days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  const addMonths = (date, months) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  };

  const addYears = (date, years) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
  };

  const fetchWorkingDays = async () => {
    try {
      const SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbwoqwF1yHxpeW-twfWmtrlk4wFIc0L-02BnjdbivrjZxg0O914udxPgVL6_ksolfFDK/exec";
      const SHEET_NAME = "Working Day Calendar";

      const response = await fetch(
        `${SCRIPT_URL}?sheetId=${SHEET_Id}&sheet=${SHEET_NAME}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch working days: ${response.status}`);
      }

      const text = await response.text();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonString = text.substring(jsonStart, jsonEnd + 1);
      const data = JSON.parse(jsonString);

      if (!data.table || !data.table.rows) {
        return [];
      }

      // ✅ Extract dates from column A using the formatted value (f)
      const workingDays = [];
      data.table.rows.forEach((row) => {
        if (row.c && row.c[0] && row.c[0].f) {
          let dateValue = row.c[0].f; // ✅ Use formatted string like "01/04/2025"

          if (
            typeof dateValue === "string" &&
            dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/) // DD/MM/YYYY pattern
          ) {
            workingDays.push(dateValue);
          }
        }
      });

      return workingDays;
    } catch (error) {
      return []; // Return empty array if fetch fails
    }
  };

  const generateTasks = async () => {
    // Validate required fields
    if (
      !startDate ||
      !endDate ||
      (selectedTaskType === "Maintence" ? !frequency : !endTaskDate)
    ) {
      toast.error(
        "Please fill in all required fields including date range and frequency"
      );
      return;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Validate date range
    if (startDateObj > endDateObj) {
      toast.error("End date must be after start date");
      return;
    }

    // Fetch working days
    setLoaderWorkingDayData(true);
    const workingDays = await fetchWorkingDays();
    setLoaderWorkingDayData(false);
    if (workingDays.length === 0) {
      toast.error("Could not retrieve working days calendar");
      return;
    }

    const tasks = [];

    // For one-time tasks
    if (frequency === "one-time") {
      const taskDate = findNextWorkingDay(startDateObj, workingDays);
      if (!taskDate) {
        toast.error("No working days found in the selected date range");
        return;
      }

      tasks.push({
        description,
        givenBy: selectedGivenBy,
        doer: selectedDoerName,
        dueDate: formatDateTimeForStorage(
          new Date(taskDate.split("/").reverse().join("-")),
          time
        ),
        status: "pending",
        frequency,
      });
    }
    // For recurring tasks
    else {
      let currentDate = new Date(startDateObj);
      let taskCount = 0;
      const maxTasks = 1000; // Safety limit

      while (currentDate <= endDateObj && taskCount < maxTasks) {
        const currentDateStr = formatDateToDDMMYYYY(currentDate);

        if (workingDays.includes(currentDateStr)) {
          tasks.push({
            description,
            givenBy: selectedGivenBy,
            doer: selectedDoerName,
            dueDate: formatDateTimeForStorage(currentDate, time),
            status: "pending",
            frequency,
          });
          taskCount++;
        }

        // Calculate next date based on frequency
        switch (frequency.toLowerCase()) {
          case "daily":
            currentDate = addDays(currentDate, 1);
            break;
          case "weekly":
            currentDate = addDays(currentDate, 7);
            break;
          case "15 days":
            currentDate = addDays(currentDate, 15);
            break;
          case "monthly":
            currentDate = addMonths(currentDate, 1);
            break;
          case "quarterly":
            currentDate = addMonths(currentDate, 3);
            break;
          case "half yearly":
          case "half-yearly":
            currentDate = addMonths(currentDate, 6);
            break;
          case "yearly":
            currentDate = addYears(currentDate, 1);
            break;
          default:
            currentDate = addDays(currentDate, 1); // Default to daily
            break;
        }
      }
    }

    // Show results
    if (tasks.length === 0) {
      toast.error(
        "No tasks generated - check your date range and working days"
      );
      return;
    }

    setGeneratedTasks(tasks);
    setShowTaskPreview(true);
    toast.success(
      `Generated ${tasks.length} tasks between ${formatDateToDDMMYYYY(
        startDateObj
      )} and ${formatDateToDDMMYYYY(endDateObj)}`
    );
  };

  const uploadImageToDrive = async (file, taskNo) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const base64Data = reader.result.split(",")[1]; // Get base64 data without prefix

        try {
          // Use repair script URL for image upload for repair tasks
          const uploadScriptUrl =
            selectedTaskType === "Repair" ? REPAIR_SCRIPT_URL : SCRIPT_URL;

          const response = await fetch(uploadScriptUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              action: "uploadFile",
              base64Data: base64Data,
              fileName: `${taskNo}_${Date.now()}_${file.name}`,
              mimeType: file.type,
              folderId: FOLDER_ID,
            }).toString(),
          });

          const data = await response.json();

          if (data.success && data.fileUrl) {
            resolve(data.fileUrl);
          } else {
            toast.error("❌ Image upload failed");
            resolve("");
          }
        } catch (err) {
          console.error("Upload error:", err);
          toast.error("❌ Image upload failed due to network error");
          resolve("");
        }
      };

      reader.onerror = () => {
        reject("❌ Failed to read file");
      };

      reader.readAsDataURL(file);
    });
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    try {
      setLoaderSubmit(true);

      // Set the script URL and sheet details based on task type
      const scriptUrl =
        selectedTaskType === "Repair" ? REPAIR_SCRIPT_URL : SCRIPT_URL;
      const sheetId =
        selectedTaskType === "Repair" ? REPAIR_SHEET_ID : SHEET_Id;
      const sheetName =
        selectedTaskType === "Repair"
          ? "Repair System"
          : "Maitenance Task Assign";

      // Prepare payload for Google Apps Script
      const payload = {
        action: "insert1",
        sheetName: sheetName,
        sheetId: sheetId,
      };

      if (selectedTaskType === "Repair") {
        // First upload image if exists
        let imageUrl = "";
        if (imageFile) {
          // Generate a unique identifier for the image since we're not using Task No
          const uniqueId = Date.now();
          imageUrl = await uploadImageToDrive(imageFile, `repair_${uniqueId}`);
        }

        // Prepare repair task data without Task No
        Object.assign(payload, {
          "Time Stemp": new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
          }),
          "Serial No": selectedSerialNo,
          "Machine Name": selectedMachine,
          "Machine Part Name": partName,
          "Given By": selectedGivenBy,
          "Doer Name": selectedDoerName,
          "Problem With Machine": description,
          "Enable Reminders": enableReminder ? "Yes" : "No",
          "Require Attachment": requireAttachment ? "Yes" : "No",
          "Task Start Date": `${startDate} ${startTime}:00`,
          "Task Ending Date": `${endTaskDate} ${endTime}:00`,
          Priority: selectedPriority,
          Department: machineArea,
          Location: temperature,
          "Image Link": imageUrl,
        });
      } else {
        // Maintenance Task handling (keep existing logic)
        if (generatedTasks.length === 0) {
          toast.error("❌ No generated tasks to assign. Please preview first.");
          return;
        }

        // Get all maintenance tasks and extract the highest number
        const maintTasks = taskList.filter(
          (task) =>
            task["Task No"] &&
            typeof task["Task No"] === "string" &&
            task["Task No"].startsWith("TM-")
        );

        let lastTaskNo = 0;
        if (maintTasks.length > 0) {
          const taskNumbers = maintTasks.map((task) => {
            const numPart = task["Task No"].split("TM-")[1];
            return parseInt(numPart) || 0;
          });
          lastTaskNo = Math.max(...taskNumbers);
        }

        // Prepare batch insert data for maintenance tasks
        payload.batchInsert = "true";
        payload.rowData = JSON.stringify(
          generatedTasks.map((task, idx) => ({
            "Time Stemp": new Date().toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            }),
            "Task No": `TM-${String(lastTaskNo + idx + 1).padStart(3, "0")}`,
            "Serial No": selectedSerialNo,
            "Machine Name": selectedMachine,
            "Given By": selectedGivenBy,
            "Doer Name": selectedDoerName,
            "Task Type": selectedTaskType,
            "Machine Area": machineArea,
            "Part Name": partName,
            "Need Sound Test": needSoundTask,
            Temperature: temperature,
            "Enable Reminders": enableReminder ? "Yes" : "No",
            "Require Attachment": requireAttachment ? "Yes" : "No",
            "Task Start Date": `${task.dueDate.split(" ")[0]} ${startTime}:00`,
            Frequency: frequency,
            Description: description,
            Priority: selectedPriority,
          }))
        );
      }

      // Submit to Google Sheets
      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(payload).toString(),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("✅ Task assigned successfully!");

        // Reset form
        setSelectedSerialNo("");
        setSelectedMachine("");
        setSelectedGivenBy("");
        setSelectedDoerName("");
        setSelectedTaskType("Select Task Type");
        setStartDate("");
        setEndDate("");
        setEndTaskDate("");
        setFrequency("");
        setWorkDescription("");
        setSelectedPriority("");
        setShowTaskPreview(false);
        setStartTime("");
        setEndTime("");
        setEnableReminder(false);
        setRequireAttachment(false);
        setMachineArea("");
        setPartName("");
        setNeedSoundTask("");
        setTemperature("");
        setImageFile(null);
        setGeneratedTasks([]);
      } else {
        throw new Error(result.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("❌ Submission failed:", error);
      toast.error(`❌ Failed to assign task: ${error.message}`);
    } finally {
      setLoaderSubmit(false);
    }
  };

  return (
    <div className="p-2">
      <h1 className="text-2xl font-bold mb-6 text-center">Assign Task</h1>
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow p-6 w-[90vw]">
          <form className="space-y-4" onSubmit={handleSubmitForm}>
            {/* Task Type */}
            <div className="">
              <label
                htmlFor="taskType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Task Type
              </label>
              <select
                id="taskType"
                onChange={(e) => setSelectedTaskType(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Task Type</option>
                <option value="Maintence">Maintenance</option>
                <option value="Repair">Repair</option>
              </select>
            </div>

            {selectedTaskType === "Maintence" && (
              <>
                {" "}
                <div className="flex justify-between">
                  {/* left */}
                  <div className="w-[45%] space-y-4">
                    {/* Machine Name Dropdown */}
                    <div>
                      <label
                        htmlFor="machineName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Machine Name
                      </label>
                      <select
                        id="machineName"
                        value={selectedMachine}
                        onChange={(e) => {
                          const selected = e.target.value;
                          setSelectedMachine(selected);
                          const serials = sheetData
                            .filter((item) => item["Machine Name"] === selected)
                            .map((item) => item["Serial No"]);
                          setFilteredSerials(serials);
                        }}
                        className="w-full py-2 rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Machine</option>
                        {loaderMasterSheetData ? (
                          <option className="flex gap-5 items-center justify-center">
                            <Loader2Icon className="animate-spin text-red-500" />
                            <h1>Wait Please...</h1>
                          </option>
                        ) : (
                          <>
                            {[
                              ...new Set(
                                sheetData.map((item) => item["Machine Name"])
                              ),
                            ]
                              .filter(Boolean)
                              .map((machineName, index) => (
                                <option key={index} value={machineName}>
                                  {machineName}
                                </option>
                              ))}
                          </>
                        )}
                      </select>
                    </div>
                    {/* Serial No Dropdown (after selecting Machine Name) */}

                    {selectedMachine && !loaderSheetData && (
                      <div className="">
                        <label
                          htmlFor="serialNo"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Serial Number
                        </label>
                        <select
                          id="serialNo"
                          onChange={(e) => setSelectedSerialNo(e.target.value)}
                          className="py-2 w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Serial No</option>
                          {filteredSerials.map((serial, idx) => (
                            <option key={idx} value={serial}>
                              {serial}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Given By */}
                    <div>
                      <label
                        htmlFor="taskType"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Given By
                      </label>
                      <select
                        id="taskType"
                        onChange={(e) => setSelectedGivenBy(e.target.value)}
                        className="py-2 w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Given By</option>
                        {loaderMasterSheetData ? (
                          <>
                            <option className="flex gap-5 items-center justify-center">
                              <Loader2Icon className="animate-spin text-red-500" />
                              <h1>Wait Please...</h1>
                            </option>
                          </>
                        ) : (
                          giveByData.map(
                            (item, index) =>
                              item && (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              )
                          )
                        )}
                      </select>
                    </div>
                    {/* Doer's Name */}
                    {/* Doer's Name */}
                    <div>
                      <label
                        htmlFor="doerName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Doer's Name
                      </label>
                      <input
                        id="doerName"
                        list="doerNameList"
                        value={selectedDoerName}
                        onChange={(e) => setSelectedDoerName(e.target.value)}
                        className="py-2 rounded-md w-full border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Select or type new name"
                      />
                      <datalist id="doerNameList">
                        {loaderMasterSheetData ? (
                          <option disabled>Loading...</option>
                        ) : (
                          <>
                            {/* Always show current user as first option */}
                            {user?.name && (
                              <option key="current-user" value={user.name}>
                                {user.name}
                              </option>
                            )}
                            {/* Show all other names from master sheet */}
                            {doerName
                              .filter((item) => item && item !== user?.name)
                              .map((item, index) => (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              ))}
                          </>
                        )}
                      </datalist>
                    </div>

                    {/* Task Temperature */}
                    {/* <div>
                      <label
                        htmlFor="temperature"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Temperature
                      </label>
                      <select
                        id="temperature"
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Temperature</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div> */}
                  </div>

                  {/* right */}
                  <div className="w-[45%] space-y-4">
                    {/* Task Status */}
                    <div>
                      <label
                        htmlFor="taskType"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Task Status
                      </label>
                      <select
                        id="taskType"
                        className="py-2 w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Task Status</option>
                        {loaderMasterSheetData ? (
                          <option className="flex gap-5 items-center justify-center">
                            <Loader2Icon className="animate-spin text-red-500" />
                            <h1>Wait Please...</h1>
                          </option>
                        ) : (
                          taskStatusData.map(
                            (item, index) =>
                              item && (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              )
                          )
                        )}
                      </select>
                    </div>
                    {/* Machine Area */}
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Machine Area
                      </label>
                      <input
                        id="description"
                        onChange={(e) => setMachineArea(e.target.value)}
                        value={machineArea}
                        rows={4}
                        className="py-2 w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter task description..."
                      />
                    </div>

                    {/* Part Name */}
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Part Name
                      </label>
                      <input
                        id="description"
                        onChange={(e) => setPartName(e.target.value)}
                        value={partName}
                        rows={4}
                        className="py-2 w-full rounded-md border border-gray-300 shadow-sm px-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter task description..."
                      />
                    </div>
                    {/* Task Type */}
                    {/* <div>
                      <label
                        htmlFor="needSoundTest"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Need Sound Test
                      </label>
                      <select
                        id="needSoundTest"
                        onChange={(e) => setNeedSoundTask(e.target.value)}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Need Sound Test</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div> */}

                    {/* Priority */}
                    <div>
                      <label
                        htmlFor="priority"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Priority
                      </label>
                      <select
                        id="priority"
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Priority</option>
                        {loaderMasterSheetData ? (
                          <option className="flex gap-5 items-center justify-center">
                            <Loader2Icon className="animate-spin text-red-500" />
                            <h1>Wait Please...</h1>
                          </option>
                        ) : (
                          priorityData.map(
                            (item, index) =>
                              item && (
                                <option key={index} value={item}>
                                  {item}
                                </option>
                              )
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>
                {/*Work Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Work Description
                  </label>
                  <textarea
                    id="description"
                    onChange={(e) => setWorkDescription(e.target.value)}
                    value={description}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter task description..."
                  />
                </div>
                {/* Start Date */}
                <div className="flex space-x-10">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Task Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                  </div>

                  {/* Task Time */}
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Task Time
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    />
                  </div>

                  {/* Frequency */}

                  <div>
                    <label
                      htmlFor="frequency"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Frequency
                    </label>
                    <select
                      id="frequency"
                      onChange={(e) => setFrequency(e.target.value)}
                      className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={availableFrequencies.length === 0}
                    >
                      <option value="">Select Frequency</option>
                      {availableFrequencies.map((freq, idx) => (
                        <option key={idx} value={freq.toLowerCase()}>
                          {freq}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Preview Generated */}
                <button
                  type="button"
                  disabled={loaderWorkingDayData}
                  onClick={generateTasks}
                  className={`w-full flex items-center justify-center gap-2 mb-4 px-4 py-2 text-sm bg-blue-100 border border-blue-400 text-blue-700 rounded hover:bg-blue-200 ${
                    loaderWorkingDayData ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loaderWorkingDayData && (
                    <LoaderIcon className="animate-spin w-4 h-4" />
                  )}
                  Preview Generated Tasks
                </button>
                {showTaskPreview && (
                  <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg">
                    <div className="text-blue-800 font-semibold mb-2">
                      {generatedTasks.length} Tasks Generated (Will be stored in
                      Checklist sheet)
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-3">
                      {generatedTasks.slice(0, 10).map((task, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded p-3 shadow-sm border border-blue-200"
                        >
                          <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded inline-block mb-1">
                            Reminders
                          </div>
                          <div className="text-sm">{task.description}</div>
                          <div className="text-xs text-gray-600">
                            Due: {task.due} | Department: {task.department}
                          </div>
                        </div>
                      ))}
                      {generatedTasks.length > 10 && (
                        <div className="text-xs text-blue-600 italic">
                          ...and {generatedTasks.length - 10} more tasks
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Additional Info */}
                <div className="w-full">
                  <h1 className="text-[1.4rem] text-blue-700 mb-5">
                    Additional Option
                  </h1>
                  <div className="space-y-5">
                    <div className="flex justify-between">
                      <div>
                        <h1 className="text-[1.2rem] text-blue-600">
                          Enable Reminder
                        </h1>
                        <h1 className="text-[1rem] text-blue-500">
                          Send remiders before task due date
                        </h1>
                      </div>
                      <div
                        onClick={() => setEnableReminder((prev) => !prev)}
                        className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
                          enableReminder ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            enableReminder ? "translate-x-5" : "translate-x-0"
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <div>
                        <h1 className="text-[1.2rem] text-blue-600">
                          Require Attachment
                        </h1>
                        <h1 className="text-[1rem] text-blue-500">
                          User must upload a file when completing task
                        </h1>
                      </div>
                      <div
                        onClick={() => setRequireAttachment((prev) => !prev)}
                        className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
                          requireAttachment ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            requireAttachment
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* submit button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loaderSubmit}
                    className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      loaderSubmit ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loaderSubmit && (
                      <LoaderIcon className="animate-spin w-4 h-4" />
                    )}
                    {loaderSubmit ? "Assigning..." : "Assign Task"}
                  </button>
                </div>
              </>
            )}

            {selectedTaskType === "Repair" && (
              <>
                <div className="flex justify-between">
                  {/* left */}
                  <div className="w-[45%] space-y-4">
                    {/* Machine Name Dropdown */}
                    <div>
                      <label
                        htmlFor="machineName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Machine Name
                      </label>

                      {loaderUserMachineData ? (
                        <div className="w-full px-4 py-2 border rounded-md text-gray-500 bg-gray-100">
                          Loading machines...
                        </div>
                      ) : (
                        <Select
                          id="machineName"
                          value={
                            selectedMachine
                              ? {
                                  label: selectedMachine,
                                  value: selectedMachine,
                                }
                              : null
                          }
                          // onChange={(option) => {
                          //   const selected = option?.value || "";
                          //   setSelectedMachine(selected);

                          //   // Filter serial numbers based on selected machine
                          //   const dataSource = user?.role === "admin" ? AllMachineData : userMachineData;

                          //   const serials = dataSource
                          //     .filter((item) => item["Machine Name"] === selected)
                          //     .map((item) => item["Serial No"])
                          //     .filter(Boolean);

                          //   setFilteredSerials([...new Set(serials)]);
                          // }}

                          onChange={(option) => {
                            const selected = option?.value || "";
                            setSelectedMachine(selected);
                            // Change this line:
                            const serials = sheetData // Use sheetData instead of dataSource
                              .filter(
                                (item) => item["Machine Name"] === selected
                              )
                              .map((item) => item["Serial No"])
                              .filter(Boolean);
                            setFilteredSerials([...new Set(serials)]);
                          }}
                          // options={
                          //   (user?.role === "admin"
                          //     ? AllMachineData
                          //     : userMachineData
                          //   )
                          //     .map((item) => item["Machine Name"])
                          //     .filter(Boolean)
                          //     .filter((v, i, arr) => arr.indexOf(v) === i) // Get unique values
                          //     .map((machineName) => ({
                          //       label: machineName,
                          //       value: machineName,
                          //     }))
                          // }

                          options={sheetData
                            .map((item) => item["Machine Name"])
                            .filter(Boolean)
                            .filter((v, i, arr) => arr.indexOf(v) === i)
                            .map((machineName) => ({
                              label: machineName,
                              value: machineName,
                            }))}
                          placeholder="Select Machine..."
                          isClearable
                          isSearchable
                          className="w-full"
                        />
                      )}
                    </div>

                    {/* Serial No Dropdown */}
                    {selectedMachine && !loaderSheetData && (
                      <div className="mt-4">
                        <label
                          htmlFor="serialNo"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Serial Number
                        </label>
                        <select
                          id="serialNo"
                          onChange={(e) => setSelectedSerialNo(e.target.value)}
                          className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Serial No</option>
                          {filteredSerials.map((serial, idx) => (
                            <option key={idx} value={serial}>
                              {serial}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Machine Part Name */}
                    <div>
                      <label
                        htmlFor="partName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Machine Part Name
                      </label>
                      <input
                        type="text"
                        id="partName"
                        value={partName}
                        onChange={(e) => setPartName(e.target.value)}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter part name"
                      />
                    </div>

                    {/* Given By */}
                    <div>
                      <label
                        htmlFor="givenBy"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Given By
                      </label>
                      <select
                        id="givenBy"
                        onChange={(e) => setSelectedGivenBy(e.target.value)}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Given By</option>
                        {loaderMasterSheetData ? (
                          <option className="flex gap-5 items-center justify-center">
                            <Loader2Icon className="animate-spin text-red-500" />
                            <h1>Wait Please...</h1>
                          </option>
                        ) : (
                          giveByData.map((item, index) =>
                            item ? (
                              <option key={index} value={item}>
                                {item}
                              </option>
                            ) : null
                          )
                        )}
                      </select>
                    </div>
                  </div>

                  {/* right */}
                  <div className="w-[45%] space-y-4">
                    {/* Doer Name */}
                    {/* Doer Name - Repair Section */}
                    <div>
                      <label
                        htmlFor="doerNameRepair"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Doer's Name
                      </label>

                      {user?.role === "admin" ? (
                        // 🔹 Admin -> direct dropdown, sabhi names dikhenge
                        <select
                          id="doerNameRepair"
                          value={selectedDoerName}
                          onChange={(e) => setSelectedDoerName(e.target.value)}
                          className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Doer Name</option>
                          {loaderMasterSheetData ? (
                            <option disabled>Loading...</option>
                          ) : (
                            doerName.map(
                              (item, index) =>
                                item && (
                                  <option key={index} value={item}>
                                    {item}
                                  </option>
                                )
                            )
                          )}
                        </select>
                      ) : (
                        // 🔹 User -> input + datalist, autofill user.name
                        <>
                          <input
                            id="doerNameRepair"
                            list="doerNameListRepair"
                            value={selectedDoerName}
                            onChange={(e) =>
                              setSelectedDoerName(e.target.value)
                            }
                            className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Select or type new name"
                          />
                          <datalist id="doerNameListRepair">
                            {loaderMasterSheetData ? (
                              <option disabled>Loading...</option>
                            ) : (
                              <>
                                {user?.name && (
                                  <option key="current-user" value={user.name}>
                                    {user.name}
                                  </option>
                                )}
                              </>
                            )}
                          </datalist>
                        </>
                      )}
                    </div>

                    {/* Department */}
                    {/* Department */}
                    <div>
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Department
                      </label>
                      <input
                        type="text"
                        id="department"
                        value={machineArea}
                        onChange={(e) => setMachineArea(e.target.value)}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter department"
                      />
                    </div>

                    {/* Location */}
                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter location"
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label
                        htmlFor="priority"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Priority
                      </label>
                      <select
                        id="priority"
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Priority</option>
                        {loaderMasterSheetData ? (
                          <option className="flex gap-5 items-center justify-center">
                            <Loader2Icon className="animate-spin text-red-500" />
                            <h1>Wait Please...</h1>
                          </option>
                        ) : (
                          priorityData.map((item, index) =>
                            item ? (
                              <option key={index} value={item}>
                                {item}
                              </option>
                            ) : null
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Problem With Machine */}
                <div>
                  <label
                    htmlFor="machineProblem"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Problem With Machine
                  </label>
                  <textarea
                    id="machineProblem"
                    onChange={(e) => setWorkDescription(e.target.value)}
                    value={description}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the problem..."
                  />
                </div>

                {/* Start & End Dates */}
                <div className="flex flex-col md:flex-row md:space-x-10 space-y-4 md:space-y-0">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Task Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="startTime"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Task Start Time
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Task End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endTaskDate}
                      onChange={(e) => setEndTaskDate(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="endTime"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Task End Time
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                    />
                  </div>
                </div>

                {/* Additional Options */}
                <div className="w-full pt-6">
                  <h1 className="text-[1.4rem] text-blue-700 mb-5">
                    Additional Option
                  </h1>
                  <div className="space-y-5">
                    <div className="flex justify-between">
                      <div>
                        <h1 className="text-[1.2rem] text-blue-600">
                          Enable Reminder
                        </h1>
                        <h1 className="text-[1rem] text-blue-500">
                          Send reminders before task due date
                        </h1>
                      </div>
                      <div
                        onClick={() => setEnableReminder((prev) => !prev)}
                        className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
                          enableReminder ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            enableReminder ? "translate-x-5" : "translate-x-0"
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <div>
                        <h1 className="text-[1.2rem] text-blue-600">
                          Require Attachment
                        </h1>
                        <h1 className="text-[1rem] text-blue-500">
                          User must upload a file when completing task
                        </h1>
                      </div>
                      <div
                        onClick={() => setRequireAttachment((prev) => !prev)}
                        className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
                          requireAttachment ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            requireAttachment
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="pt-4">
                  <label
                    htmlFor="machineImage"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Upload Machine Image (Optional)
                  </label>
                  <input
                    type="file"
                    id="machineImage"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loaderSubmit}
                    className={`w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      loaderSubmit ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loaderSubmit && (
                      <LoaderIcon className="animate-spin w-4 h-4" />
                    )}
                    {loaderSubmit ? "Assigning..." : "Assign Task"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AssignTask;
