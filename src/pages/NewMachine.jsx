import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Upload,
  CalendarPlus,
  Plus,
  Minus,
  Loader2Icon,
} from "lucide-react";
import toast from "react-hot-toast";

const NewMachine = () => {
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwoqwF1yHxpeW-twfWmtrlk4wFIc0L-02BnjdbivrjZxg0O914udxPgVL6_ksolfFDK/exec";
  const SHEET_NAME = "FormResponses";
  const SHEET_Id = "1MAOfOecxPNZr-5YlZ5sSsXgAPOJ8PVGupBkyp7h_9Jg";
  const FOLDER_ID = "1UIr-0LOzxImWQmCOc6xLUIUWfaLITOx5";

  const [formValues, setFormValues] = useState({
    serialNumber: "",
    machineName: "",
    model: "",
    manufacturer: "",
    department: "",
    location: "",
    purchaseDate: "",
    purchasePrice: "",
    vendor: "",
    warrantyExpiration: "",
    maintenanceSchedule: [], // will be managed separately
    initialMaintenanceDate: "",
    note: "",
  });

  const [userManualFile, setUserManualFile] = useState(null);
  const [purchaseBillFile, setPurchaseBillFile] = useState(null);
  const [sheetData, setSheetData] = useState([]);
  const [loaderSubmit, setLoaderSubmit] = useState(false);
  const [loaderSheetData, setLoaderSheetData] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [loaderMasterSheetData, setLoaderMasterSheetData] = useState(false);

  // console.log("sheetData",sheetDate);

  useEffect(() => {
    // console.log("ljkfldsjfsdl")
    const fetchSheetData = async () => {
      try {
        setLoaderSheetData(true);
        const res = await fetch(
          `${SCRIPT_URL}?sheetId=${SHEET_Id}&sheet=${SHEET_NAME}`
        );
        const result = await res.json();

        // console.log("data", result);

        if (result.success && result.table) {
          const headers = result.table.cols.map((col) => col.label);
          const rows = result.table.rows;

          // Transform rows into objects with key-value pairs
          const formattedRows = rows.map((rowObj) => {
            const row = rowObj.c;
            const rowData = {};
            row.forEach((cell, i) => {
              rowData[headers[i]] = cell.v;
            });
            return rowData;
          });

          setSheetData(formattedRows);
        } else {
          console.error("Server error:", result.message || result.error);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoaderSheetData(false);
      }
    };
    fetchSheetData();
  }, []);

  useEffect(() => {
    // Fetch Department options from Master sheet
    const fetchMasterSheetData = async () => {
      const MASTER_SHEET_NAME = "Master";
      try {
        setLoaderMasterSheetData(true);
        const res = await fetch(
          `${SCRIPT_URL}?sheetId=${SHEET_Id}&sheet=${MASTER_SHEET_NAME}`
        );
        const result = await res.json();

        if (result.success && result.table) {
          const headers = result.table.cols.map((col) => col.label);
          const rows = result.table.rows;

          // Transform rows into objects with key-value pairs
          const formattedRows = rows.map((rowObj) => {
            const row = rowObj.c;
            const rowData = {};
            row.forEach((cell, i) => {
              rowData[headers[i]] = cell ? cell.v : null;
            });
            return rowData;
          });

          // Extract Department data from column B (index 1)
          // Filter out empty/null values and get unique departments
          const departments = formattedRows
            .map((row) => {
              // Get the second column (index 1) which should be column B
              const columnBValue = Object.values(row)[1];
              return columnBValue;
            })
            .filter((dept) => dept && dept.toString().trim() !== "")
            .filter((dept, index, self) => self.indexOf(dept) === index); // Remove duplicates

          setDepartmentOptions(departments);
        } else {
          console.error("Server error:", result.message || result.error);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoaderMasterSheetData(false);
      }
    };
    fetchMasterSheetData();
  }, []);

  useEffect(() => {
    // console.log("sfkjsdlfjl");
    const generateSerialNumber = (records, machineName) => {
      const currentYear = new Date().getFullYear();
      const cleanedName = machineName.toLowerCase().replace(/\s+/g, "");
      const prefix = `SN-${currentYear}/${cleanedName}/`;

      let count = 0;

      records.forEach((row) => {
        const serialNo =
          row["Serial No"] || row["Serial no"] || row["serial no"];
        if (serialNo && serialNo.startsWith(prefix)) {
          count++; // count existing serials with this prefix
        }
      });

      // console.log("count", count);

      const suffix = String(count + 1).padStart(3, "0"); // next serial number
      return `${prefix}${suffix}`;
    };

    if (formValues.machineName.trim() !== "") {
      const newSerial = generateSerialNumber(sheetData, formValues.machineName);
      setFormValues((prev) => ({
        ...prev,
        serialNumber: newSerial,
      }));
    }
  }, [formValues.machineName, sheetData]);

  // ✅ Checkbox handler for maintenanceSchedule
  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;
    setFormValues((prev) => {
      const updated = checked
        ? [...prev.maintenanceSchedule, id]
        : prev.maintenanceSchedule.filter((item) => item !== id);
      return { ...prev, maintenanceSchedule: updated };
    });
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

  // ✅ Generic input handler
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  function formatDateToDDMMYYYY(dateStr) {
    if (!dateStr || dateStr === "") return "";
    try {
      const date = new Date(dateStr);
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    } catch (e) {
      return dateStr; // fallback to original if parsing fails
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoaderSubmit(true);
    const [userManualUrl, purchaseBillUrl] = await Promise.all([
      userManualFile ? uploadFileToDrive(userManualFile) : "",
      purchaseBillFile ? uploadFileToDrive(purchaseBillFile) : "",
    ]);

    const payload = {
      action: "insert",
      sheetName: SHEET_NAME,
      "Serial No": formValues.serialNumber,
      "Machine Name": formValues.machineName,
      "Model No": formValues.model,
      Manufacturer: formValues.manufacturer,
      Department: formValues.department,
      Location: formValues.location,
      "Purchase Date": formatDateToDDMMYYYY(formValues.purchaseDate),
      "Purchase Price": formValues.purchasePrice,
      Vendor: formValues.vendor,
      "Warranty Expiration": formatDateToDDMMYYYY(
        formValues.warrantyExpiration
      ),
      "Maintenance Schedule": JSON.stringify(formValues.maintenanceSchedule),
      "Initial Maintenance Date": formatDateToDDMMYYYY(
        formValues.initialMaintenanceDate
      ),
      "User Manual": userManualUrl,
      "Purchase Bill": purchaseBillUrl,
      Notes: formValues.note,
    };

    console.log("formValues.department",formValues.department);
    console.log("formValues.location",formValues.location);

    try {
      
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(payload).toString(),
      });

      const result = await response.json();

      console.log("result", result);

      if (result.success) {
        toast.success("✅ Submitted successfully.");
        setFormValues({
          machineName: "",
          serialNumber: "",
          model: "",
          manufacturer: "",
          department: "",
          location: "",
          purchaseDate: "",
          purchasePrice: "",
          vendor: "",
          warrantyExpiration: "",
          maintenanceSchedule: [],
          initialMaintenanceDate: "",
          note: "",
        });
        // navigate("/machines");
      } else {
        toast.error("❌ Failed: " + result.error);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("❌ Network error. Please try again.");
    } finally {
      setLoaderSubmit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Link
          to="/machines"
          className="text-indigo-600 hover:text-indigo-900 mr-4 flex items-center"
        >
          <ChevronLeft size={20} />
          <span>Back to Machines</span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Add New Machine</h1>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h2 className="font-medium text-lg text-gray-900 border-b pb-2">
                  Machine Information
                </h2>

                {/* Machine Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Machine Name*
                  </label>
                  <input
                    type="text"
                    id="machineName"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    placeholder="e.g., Hydraulic Press HP-102"
                    value={formValues.machineName}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Model No */}
                <div>
                  <label
                    htmlFor="model"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Model No
                  </label>
                  <input
                    type="text"
                    id="model"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    placeholder="e.g., HP-2000 Series"
                    value={formValues.model}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Manufacture */}
                <div>
                  <label
                    htmlFor="manufacturer"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    id="manufacturer"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formValues.manufacturer}
                    onChange={handleInputChange}
                    placeholder="e.g., Industrial Dynamics Ltd."
                  />
                </div>

                {/* Department - Updated with dynamic options */}
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Department*
                  </label>
                  <select
                    id="department"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formValues.department}
                    onChange={handleInputChange}
                    disabled={loaderMasterSheetData}
                  >
                    <option value="">
                      {loaderMasterSheetData ? "Loading departments..." : "Select Department"}
                    </option>
                    {departmentOptions.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {loaderMasterSheetData && (
                    <p className="text-xs text-gray-500 mt-1">
                      <Loader2Icon className="inline animate-spin w-3 h-3 mr-1" />
                      Loading department options...
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formValues.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Building A, Floor 2, Section 3"
                  />
                </div>
              </div>

              {/* Purchase & Maintenance Details */}

              <div className="space-y-6">
                <h2 className="font-medium text-lg text-gray-900 border-b pb-2">
                  Purchase & Maintenance Details
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="purchaseDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Purchase Date*
                    </label>
                    <input
                      type="date"
                      id="purchaseDate"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      value={formValues.purchaseDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="purchasePrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Purchase Price*
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        id="purchasePrice"
                        className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        placeholder="0.00"
                        value={formValues.purchasePrice}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="vendor"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Vendor
                  </label>
                  <input
                    type="text"
                    id="vendor"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formValues.vendor}
                    onChange={handleInputChange}
                    placeholder="e.g., Industrial Suppliers Inc."
                  />
                </div>

                <div>
                  <label
                    htmlFor="warrantyExpiration"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Warranty Expiration
                  </label>
                  <input
                    type="date"
                    id="warrantyExpiration"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formValues.warrantyExpiration}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maintenance Schedule
                  </label>
                  <div className="space-y-2">
                    {/* <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="Daily"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={formValues.maintenanceSchedule.includes(
                          "Daily"
                        )}
                        onChange={handleCheckboxChange}
                      />
                      <label
                        htmlFor="daily"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Daily
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="Weekly"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={formValues.maintenanceSchedule.includes(
                          "Weekly"
                        )}
                        onChange={handleCheckboxChange}
                      />
                      <label
                        htmlFor="weekly"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Weekly
                      </label>
                    </div> */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="Monthly"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={formValues.maintenanceSchedule.includes(
                          "Monthly"
                        )}
                        onChange={handleCheckboxChange}
                      />
                      <label
                        htmlFor="monthly"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Monthly
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="Quarterly"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={formValues.maintenanceSchedule.includes(
                          "Quarterly"
                        )}
                        onChange={handleCheckboxChange}
                        defaultChecked
                      />
                      <label
                        htmlFor="quarterly"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Quarterly
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="Biannual"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={formValues.maintenanceSchedule.includes(
                          "Biannual"
                        )}
                        onChange={handleCheckboxChange}
                      />
                      <label
                        htmlFor="biannual"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Bi-annual
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="Annual"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={formValues.maintenanceSchedule.includes(
                          "Annual"
                        )}
                        onChange={handleCheckboxChange}
                        defaultChecked
                      />
                      <label
                        htmlFor="annual"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Annual
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="initialSchedule"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Initial Maintenance Date*
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="date"
                      id="initialMaintenanceDate"
                      className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                      value={formValues.initialMaintenanceDate}
                      onChange={handleInputChange}
                    />
                    {/* <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-r-md hover:bg-gray-100"
                    >
                      <CalendarPlus size={16} />
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
            {/* Documentation Uploads */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h2 className="font-medium text-lg text-gray-900 mb-4">
                Documentation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Manual
                  </label>
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={(e) =>
                              setUserManualFile(e.target.files[0])
                            }
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {userManualFile
                          ? userManualFile.name
                          : "Image, PDF, DOC up to 10MB"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Bill
                  </label>
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="specs-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="specs-upload"
                            name="specs-upload"
                            type="file"
                            className="sr-only"
                            onChange={(e) =>
                              setPurchaseBillFile(e.target.files[0])
                            }
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {purchaseBillFile
                          ? purchaseBillFile.name
                          : "Image, PDF, DOC up to 10MB"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note Section */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h2 className="font-medium text-lg text-gray-900 mb-4">Notes</h2>
              <textarea
                rows={4}
                id="note"
                className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md p-2"
                placeholder="Add any additional notes about this machine..."
                value={formValues.note}
                onChange={handleInputChange}
              ></textarea>
            </div>

            {/* Submit Button */}

            <div className="mt-8 flex justify-end space-x-3">
              <Link
                to="/machines"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loaderSubmit && <Loader2Icon className="animate-spin" />}
                Save Machine
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewMachine;