// src/components/TaskTable.js

import React, { useEffect, useRef, useState } from "react";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import "../styles/TaskTable.css";
import toast from "react-hot-toast";

const TaskTable = ({ tasks, updateTask, deleteTask, cancelEdit }) => {
    const tableRef = useRef(null);
    const tabulatorInstance = useRef(null);

    // State for filtered tasks
    const [filteredTasks, setFilteredTasks] = useState(tasks);
    const [searchQuery, setSearchQuery] = useState("");


    useEffect(() => {
        // Destroy any existing Tabulator instance to avoid re-initialization issues
        if (tabulatorInstance.current) {
            tabulatorInstance.current.destroy();
        }

        tabulatorInstance.current = new Tabulator(tableRef.current, {
            data: filteredTasks, // Use filtered tasks for the table
            layout: "fitColumns", // Fit columns to width
            reactiveData: true, // Enable reactive updates
            columns: [
                {
                    title: "Task ID",
                    field: "id",
                    hozAlign: "center",
                    width: 100,
                },
                {
                    title: "Title",
                    field: "title",
                    editor: "input",
                    editorParams: { placeholder: "Enter title" },
                    cellEdited: (cell) => {
                        const oldValue = cell.getOldValue(); // Previous value
                        const newValue = cell.getValue(); // Current value

                        if (newValue !== oldValue) {
                            const updatedTask = { ...cell.getRow().getData(), title: newValue };
                            updateTask(updatedTask); // Save valid updates
                            toast.success("Task title updated successfully!"); // Show success toast
                        }
                    },
                },
                {
                    title: "Description",
                    field: "description",
                    editor: "textarea",
                    editorParams: { placeholder: "Enter description" },
                    cellEdited: (cell) => {
                        const oldValue = cell.getOldValue(); // Previous value
                        const newValue = cell.getValue(); // Current value

                        if (newValue !== oldValue) {
                            const updatedTask = { ...cell.getRow().getData(), description: newValue };
                            updateTask(updatedTask); // Save valid updates
                            toast.success("Task description updated successfully!"); // Show success toast
                        }
                    },
                },
                {
                    title: "Status",
                    field: "status",
                    editor: "input",
                    cellEdited: (cell) => {
                        const allowedValues = ["To Do", "In Progress", "Done"];
                        const newValue = cell.getValue();

                        if (!allowedValues.includes(newValue)) {
                            console.error(`Invalid value: "${newValue}". Resetting to previous value.`);
                            cell.setValue(cell.getOldValue(), true); // Reset to the previous value
                            alert(`Invalid status. Use: ${allowedValues.join(", ")}`);
                        } else {
                            const updatedTask = cell.getRow().getData();
                            updateTask(updatedTask); // Save valid updates in your state/store
                            toast.success("Task status updated successfully!"); // Show success toast
                        }
                    },
                },
                {
                    title: "Actions",
                    field: "actions",
                    formatter: () => `
                        <button class="delete-btn" data-action="delete">Delete</button>
                    `,
                    width: 150,
                    hozAlign: "center",
                    cellClick: (e, cell) => {
                        const taskData = cell.getRow().getData();
                        const actionType = e.target.getAttribute("data-action");

                        if (actionType === "delete") {
                            deleteTask(taskData.id);
                            toast.error("Task deleted successfully!!"); // Delete toast
                        } else if (actionType === "cancel") {
                            cancelEdit(taskData.id);
                        }
                    },
                },
            ],
        });

        return () => {
            if (tabulatorInstance.current) {
                tabulatorInstance.current.destroy();
                tabulatorInstance.current = null;
            }
        };
    }, [filteredTasks, updateTask, deleteTask, cancelEdit]);

    // Update tasks when the tasks prop changes
    useEffect(() => {
        setFilteredTasks(tasks);
    }, [tasks]);

    // Dropdown filter handler
    const handleFilterChange = (event) => {
        const selectedStatus = event.target.value;
        filterTasks(selectedStatus, searchQuery);
    };

    // Search filter handler
    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        filterTasks(document.getElementById("status-filter").value, query);
    };

    // Filter tasks by status and search query
    const filterTasks = (status, query) => {
        let filtered = tasks;

        if (status !== "All") {
            filtered = filtered.filter((task) => task.status === status);
        }

        if (query) {
            filtered = filtered.filter(
                (task) =>
                    task.title.toLowerCase().includes(query) ||
                    task.description.toLowerCase().includes(query)
            );
        }

        setFilteredTasks(filtered);
    };

    // Task counters
    const getTaskCount = (status) =>
        tasks.filter((task) => task.status === status).length;

    return (
        <div>
            {/* Header Section */}
            <div className="task-header">
                {/* Task Counters */}
                <div className="task-counters">
                    <span>To Do: {getTaskCount("To Do")}</span>
                    <span>In Progress: {getTaskCount("In Progress")}</span>
                    <span>Done: {getTaskCount("Done")}</span>
                    <span>Total: {tasks.length}</span>
                </div>

                {/* Search Bar */}
                <div className="search-container">
                    <label htmlFor="search-bar">Search:</label>
                    <input
                        type="text"
                        id="search-bar"
                        placeholder="Search by Title or Description"
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>

                {/* Filter Dropdown */}
                <div className="filter-container">
                    <label htmlFor="status-filter">Filter by Status:</label>
                    <select id="status-filter" onChange={handleFilterChange}>
                        <option value="All">All</option>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                </div>
            </div>

            {/* Tabulator Table */}
            <div ref={tableRef}></div>
        </div>
    );
};

export default TaskTable;
