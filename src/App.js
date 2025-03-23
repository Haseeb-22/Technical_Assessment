import { useState } from "react";
import {
  FaPlusCircle,
  FaCloudUploadAlt,
  FaCalendarAlt,
  FaPhone,
  FaFlag,
  FaSun,
  FaMoon,
  FaTrash,
  FaEdit,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import countries from "./countries"; // Import the list of countries
import "./index.css";

function App() {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const fieldTypes = {
    text: { type: "text", label: "Text Field" },
    dropdown: {
      type: "dropdown",
      label: "Dropdown",
      options: ["Option 1", "Option 2"],
    },
    radio: { type: "radio", label: "Radio Button", options: ["Yes", "No"] },
    file: { type: "file", label: "File Upload" },
    checkbox: {
      type: "checkbox",
      label: "Checkbox",
      options: ["Option 1", "Option 2"],
    },
    country: { type: "country", label: "Country" },
    date: { type: "date", label: "Date Picker" },
    phone: { type: "phone", label: "Phone Number" },
    section: { type: "section", label: "Section", fields: [] },
  };

  const addField = (type) => {
    const newField = { ...fieldTypes[type], id: Date.now() };
    setFields([...fields, newField]);
  };

  const addNestedField = (sectionId, type) => {
    const newField = { ...fieldTypes[type], id: Date.now() };
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === sectionId
          ? { ...field, fields: [...(field.fields || []), newField] }
          : field
      )
    );
  };

  const addSection = () => {
    const newSection = { ...fieldTypes.section, id: Date.now() };
    setFields([...fields, newSection]);
  };

  const deleteField = (fieldId) => {
    setFields((prevFields) =>
      prevFields.filter((field) => field.id !== fieldId)
    );
  };

  const editField = (fieldId, updates) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const validateField = (fieldId, value) => {
    let error = "";
    if (fieldId === "email" && !value.includes("@")) {
      error = "Invalid email";
    }
    if (fieldId === "phone" && !/^\d{10}$/.test(value)) {
      error = "Invalid phone number";
    }
    if (fieldId === "file" && value) {
      if (value.size > 1048576) {
        error = "File size should be less than 1MB";
      }
      if (!["image/jpeg", "image/png", "application/pdf"].includes(value.type)) {
        error = "Invalid file type. Only JPEG, PNG, and PDF are allowed.";
      }
    }
    if (fieldId === "date" && new Date(value) > new Date()) {
      error = "Date cannot be in the future";
    }
    if (fieldId === "checkbox" && !value.length) {
      error = "At least one option must be selected";
    }
    setErrors({ ...errors, [fieldId]: error });
  };

  const handleChange = (e, fieldId, parentId = null) => {
    const value = e.target.type === "file" ? e.target.files[0] : e.target.value;
    validateField(fieldId, value);

    if (parentId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [parentId]: {
          ...prevFormData[parentId],
          [fieldId]: value,
        },
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [fieldId]: value,
      }));
    }
  };

  const shouldShowField = (field) => {
    if (field.condition) {
      return field.condition(formData);
    }
    return true;
  };

  const formatPhoneNumber = (countryCode, phoneNumber) => {
    const phone = parsePhoneNumberFromString(phoneNumber, countryCode);
    return phone ? phone.formatInternational() : phoneNumber;
  };

  const renderField = (field, parentId = null) => {
    if (editingFieldId === field.id) {
      return (
        <div className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
            Edit Field
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              value={field.label}
              onChange={(e) =>
                editField(field.id, { label: e.target.value })
              }
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600"
              placeholder="Field Label"
            />
            {field.options && (
              <textarea
                value={field.options.join("\n")}
                onChange={(e) =>
                  editField(field.id, { options: e.target.value.split("\n") })
                }
                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600"
                placeholder="Options (one per line)"
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setEditingFieldId(null)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center"
              >
                <FaCheck className="mr-2" />
                Save
              </button>
              <button
                onClick={() => setEditingFieldId(null)}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 flex items-center"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (field.type) {
      case "text":
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {field.label}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingFieldId(field.id)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <input
              type="text"
              className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600"
              onChange={(e) => handleChange(e, field.id, parentId)}
            />
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        );

      case "dropdown":
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {field.label}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingFieldId(field.id)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <select
              className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600"
              onChange={(e) => handleChange(e, field.id, parentId)}
            >
              {field.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case "radio":
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {field.label}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingFieldId(field.id)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              {field.options.map((option, index) => (
                <label key={index} className="inline-flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    onChange={(e) => handleChange(e, field.id, parentId)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-200">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case "file":
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {field.label}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingFieldId(field.id)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                className="sr-only"
                id={`file-upload-${field.id}`}
                onChange={(e) => handleChange(e, field.id, parentId)}
              />
              <label
                htmlFor={`file-upload-${field.id}`}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-blue-700"
              >
                <FaCloudUploadAlt className="inline-block mr-2" />
                Upload File
              </label>
            </div>
            {formData[field.id] && (
              <div className="mt-2">
                <img
                  src={URL.createObjectURL(formData[field.id])}
                  alt="Uploaded File"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {field.label}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingFieldId(field.id)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              {field.options.map((option, index) => (
                <label key={index} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name={field.id}
                    value={option}
                    onChange={(e) => handleChange(e, field.id, parentId)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-200">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case "country":
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {field.label}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingFieldId(field.id)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <select
              className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600"
              onChange={(e) => handleChange(e, field.id, parentId)}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
        );

      case "date":
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {field.label}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingFieldId(field.id)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <input
              type="date"
              className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600"
              onChange={(e) => handleChange(e, field.id, parentId)}
            />
          </div>
        );

      case "phone":
        return (
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {field.label}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingFieldId(field.id)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="flex gap-4">
              <select
                className="w-1/3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600"
                onChange={(e) => handleChange(e, field.id, parentId)}
              >
                <option value="">Select Code</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.phone}>
                    {country.name} ({country.phone})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Phone Number"
                className="w-2/3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600"
                onChange={(e) => handleChange(e, field.id, parentId)}
              />
            </div>
            {formData[field.id] && (
              <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                Formatted:{" "}
                {formatPhoneNumber(
                  formData[`${field.id}-country`],
                  formData[field.id]
                )}
              </p>
            )}
          </div>
        );

      case "section":
        return (
          <div className="mb-6 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
                {field.label}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingFieldId(field.id)}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => deleteField(field.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {field.fields?.map((nestedField) => (
                <div key={nestedField.id}>
                  {renderField(nestedField, field.id)}
                </div>
              ))}
              <button
                onClick={() => addNestedField(field.id, "text")}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
              >
                Add Nested Field
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    setSubmittedData(formData);
  };

  const renderData = (data) => {
    return Object.entries(data).map(([key, value]) => {
      if (typeof value === "object" && !Array.isArray(value)) {
        return (
          <div key={key} className="mb-4">
            <strong className="text-gray-700 dark:text-gray-200"> </strong>
            <div className="ml-4">{renderData(value)}</div>
          </div>
        );
      } else if (value instanceof File) {
        return (
          <div key={key} className="mb-4">
            <strong className="text-gray-700 dark:text-gray-200"> </strong>
            <div className="mt-2">
              <img
                src={URL.createObjectURL(value)}
                alt="Uploaded File"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </div>
        );
      } else {
        return (
          <div key={key} className="mb-2">
            <strong className="text-gray-700 dark:text-gray-200"> </strong>
            {value}
          </div>
        );
      }
    });
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-100"
      } transition-colors duration-300`}
    >
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <button
          onClick={toggleDarkMode}
          className="fixed top-4 right-4 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* Form Card */}
        <div
          className={`${
            darkMode ? "bg-gray-800" : "bg-white"
          } rounded-lg shadow-lg p-6 sm:p-8 transition-colors duration-300`}
        >
          <h1
            className={`text-3xl font-bold text-center mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Dynamic Form Builder
          </h1>
          <div className="mb-8">
            <h2
              className={`text-xl font-semibold mb-4 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Add Fields
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => addField("text")}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
              >
                <FaPlusCircle className="mr-2" />
                Text Field
              </button>
              <button
                onClick={() => addField("dropdown")}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
              >
                <FaPlusCircle className="mr-2" />
                Dropdown
              </button>
              <button
                onClick={() => addField("radio")}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
              >
                <FaPlusCircle className="mr-2" />
                Radio Button
              </button>
              <button
                onClick={() => addField("file")}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
              >
                <FaCloudUploadAlt className="mr-2" />
                File Upload
              </button>
              <button
                onClick={() => addField("checkbox")}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
              >
                <FaPlusCircle className="mr-2" />
                Checkbox
              </button>
              <button
                onClick={() => addField("country")}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
              >
                <FaFlag className="mr-2" />
                Country
              </button>
              <button
                onClick={() => addField("date")}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
              >
                <FaCalendarAlt className="mr-2" />
                Date Picker
              </button>
              <button
                onClick={() => addField("phone")}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700"
              >
                <FaPhone className="mr-2" />
                Phone Number
              </button>
              <button
                onClick={addSection}
                className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700"
              >
                <FaPlusCircle className="mr-2" />
                Add Section
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {fields.map((field) => (
                <div key={field.id}>
                  {shouldShowField(field) && renderField(field)}
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700"
            >
              Submit
            </button>
          </form>
        </div>

        {submittedData && (
          <div
            className={`mt-8 p-6 sm:p-8 ${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-lg shadow-lg transition-colors duration-300`}
          >
            <h2
              className={`text-xl font-semibold mb-4 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Submitted Data
            </h2>
            {renderData(submittedData)}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;