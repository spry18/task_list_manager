// src/components/TaskManager.js

import React, { useEffect, useState } from 'react';
import TaskTable from './TaskTable';
import TaskForm from './TaskForm';
import { Toaster } from 'react-hot-toast'; // Import Toaster here
import '../styles/TaskManager.css';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);

    // Fetch tasks from the API
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/todos');
                const data = await response.json();

                // Map 'completed: true/false' to 'status: Done/To Do' and limit to first 20 tasks
                const mappedTasks = data.slice(0, 20).map((task) => ({
                    id: task.id,
                    title: task.title,
                    description: `Description for task ${task.id}`, // You can replace this with a meaningful description if available
                    status: task.completed ? 'Done' : 'To Do',
                }));

                setTasks(mappedTasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchTasks();
    }, []); // Empty dependency array to run only once when the component mounts

    // Add a new task
    const addTask = (task) => {
        const newTask = { id: tasks.length + 1, ...task };
        setTasks([...tasks, newTask]);
    };

    // Update an existing task
    const updateTask = (updatedTask) => {
        setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
    };

    // Delete a task
    const deleteTask = (taskId) => {
        setTasks(tasks.filter((task) => task.id !== taskId));
    };

    return (
        <div className="task-manager">
            <h1>Task List Manager</h1>
            <TaskForm addTask={addTask} />
            <TaskTable tasks={tasks} updateTask={updateTask} deleteTask={deleteTask} />
            <Toaster position="top-right" /> {/* Add Toaster here */}
        </div>
    );
};

export default TaskManager;
