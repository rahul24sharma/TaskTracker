import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Banner from "./Banner";
import axios from "axios";
import Sidebar from "./Sidebar";
import NewsLetter from "./NewsLetter";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { isAuthorized, username } = useSelector((state) => state.auth);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState({ title: "", description: "" });
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(5);

  const role = localStorage.getItem("role");

  const handleSelectTask = (taskId) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/alltasks/", {
          withCredentials: true,
        });

        let tasksData = [];
        if (Array.isArray(res.data)) {
          tasksData = res.data;
        } else if (res.data?.tasks) {
          tasksData = res.data.tasks;
        } else {
          tasksData = Object.values(res.data);
        }

        // Sort tasks by creation date (newest first)
        tasksData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setResult(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setResult([]);
      } finally {
        setIsLoading(false);
      }
      
    };

    fetchData();
  }, []);

  const handleAddTask = async () => {
    if (!title || !description) {
      toast.error("Title and description are required!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3001/api/tasks/create",
        {
          title,
          description,
          status: "pending",
          creator: username,
        },
        { withCredentials: true }
      );

      // Add new task to the beginning of the list (newest first)
      setResult((prev) => [res.data, ...prev]);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to add task. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/tasks/${id}`, {
        withCredentials: true,
      });
      setResult((prev) =>
        prev.filter((task) => task.id !== id && task._id !== id)
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting task");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      let url = `http://localhost:3001/api/tasks/${id}/status`;

      if (newStatus === "done") {
        url = `http://localhost:3001/api/tasks/${id}/done`;
      }

      const res = await axios.put(
        url,
        { status: newStatus },
        { withCredentials: true }
      );

      setResult((prev) =>
        prev.map((task) => ((task._id || task.id) === id ? res.data : task))
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update task status");
    }
  };

  const handleEdit = (task) => {
    setEditingTaskId(task._id || task.id);
    setEditedTask({ title: task.title, description: task.description });
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.put(`http://localhost:3001/api/tasks/${id}`, editedTask, {
        withCredentials: true,
      });
      setResult((prev) =>
        prev.map((task) =>
          (task._id || task.id) === id ? { ...task, ...editedTask } : task
        )
      );
      setEditingTaskId(null);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error updating task: " + error.message);
      }
      setEditingTaskId(null);
    }
  };

  // Drag and drop handler
  const handleDragEnd = ({ destination, source }) => {
    // 1) dropped outside the list
    if (!destination) return;
  
    // 2) no position change
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
  
    // 3) reorder a *copy* of the current tasks
    const reordered = Array.from(result);
    const [moved] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, moved);
  
    setResult(reordered);
    toast.success("Task order updated");
  };
  

  if (!isAuthorized) return <Navigate to="/login" />;

  // Apply filters (for all roles)
  const filteredTasks = statusFilter
    ? result.filter(
        (task) =>
          (task.status || "").toLowerCase() === statusFilter.toLowerCase()
      )
    : result;

  // Get current tasks for pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  return (
    <div>
      <Banner />
      <div className="bg-[#FAFAFA] md:grid grid-cols-4 gap-8 lg:px-24 px-4 py-12">
        <div className="bg-white p-4 rounded">
          <Sidebar />
        </div>

        <div className="col-span-2 bg-white p-6 rounded-sm shadow-md">
          <h2 className="text-2xl font-bold mb-4">Task Tracker</h2>

          {role === "submitter" && (
            <div className="flex flex-col md:flex-row gap-2 mb-6">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full md:flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full md:flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTask}
                className="w-full md:w-auto bg-blue-600 text-black px-4 py-2 rounded border-2 border-black hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          )}

          <div className="mb-4">
            <label className="mr-2">Filter:</label>
            <select
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="p-2 border rounded"
              value={statusFilter}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="done">Done</option>
            </select>
          </div>

          {isLoading ? (
            <p>Loading tasks...</p>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <ul
                    className="space-y-3"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {currentTasks.length > 0 ? (
                      currentTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={String(task.id)}
                          index={index}
                        >
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex flex-col md:flex-row md:items-start justify-between border p-3 rounded shadow-sm hover:shadow transition"
                            >
                              <div className="flex-1">
                                {editingTaskId === task.id ? (
                                  <>
                                    <input
                                      type="text"
                                      value={editedTask.title}
                                      onChange={(e) =>
                                        setEditedTask({
                                          ...editedTask,
                                          title: e.target.value,
                                        })
                                      }
                                      className="border rounded px-2 py-1 mb-2 w-full"
                                    />
                                    <textarea
                                      value={editedTask.description}
                                      onChange={(e) =>
                                        setEditedTask({
                                          ...editedTask,
                                          description: e.target.value,
                                        })
                                      }
                                      className="border rounded px-2 py-1 w-full"
                                    />
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2 text-lg font-medium">
                                      <span className="cursor-move text-gray-500">
                                        ☰
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={selectedTasks.includes(
                                          task.id
                                        )}
                                        onChange={() =>
                                          handleSelectTask(task.id)
                                        }
                                        className="accent-blue-600"
                                      />
                                      {task.title}
                                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                                        {task.status}
                                      </span>
                                    </div>

                                    {/* Show these details only when task is selected */}
                                    {selectedTasks.includes(task.id) && (
                                      <div className="mt-2 pl-6 border-l-2 border-blue-200">
                                        <div className="text-sm text-gray-600 mb-1">
                                          {task.description}
                                        </div>
                                        <span className="text-xs text-gray-500 block">
                                          Created by{" "}
                                          {task.User?.name ||
                                            task.creator ||
                                            username}{" "}
                                          at{" "}
                                          {new Date(
                                            task.createdAt
                                          ).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 mt-2 md:mt-0 justify-start md:justify-end">
                                {role === "submitter" &&
                                  task.creator === username &&
                                  task.status === "pending" && (
                                    <>
                                      {editingTaskId === task.id ? (
                                        <button
                                          className="text-green-600"
                                          onClick={() =>
                                            handleSaveEdit(task.id)
                                          }
                                        >
                                          Save
                                        </button>
                                      ) : (
                                        <button
                                          className="text-gray-500 hover:text-blue-600"
                                          onClick={() => handleEdit(task)}
                                          title="Edit"
                                        >
                                          ✏️
                                        </button>
                                      )}
                                      <button
                                        className="text-gray-500 hover:text-red-600"
                                        onClick={() =>
                                          handleDelete(task._id || task.id)
                                        }
                                        title="Delete"
                                      >
                                        🗑️
                                      </button>
                                    </>
                                  )}
                                {role === "approver" &&
                                  task.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleStatusChange(
                                            task._id || task.id,
                                            "approved"
                                          )
                                        }
                                        className="px-4 py-1 text-white bg-green-600 font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleStatusChange(
                                            task._id || task.id,
                                            "rejected"
                                          )
                                        }
                                        className="px-4 py-1 text-white bg-red-600 font-semibold rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}

                                {role === "approver" &&
                                  task.status === "approved" && (
                                    <button
                                      onClick={() =>
                                        handleStatusChange(
                                          task._id || task.id,
                                          "done"
                                        )
                                      }
                                      className="px-4 py-1 bg-blue-600 text-black font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-black"
                                    >
                                      Mark as Done
                                    </button>
                                  )}
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <p>No tasks found</p>
                    )}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Pagination */}
          {filteredTasks.length > tasksPerPage && (
            <div className="mt-6 flex items-center justify-center">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    paginate(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded">
          <NewsLetter />
        </div>
      </div>
    </div>
  );
};

export default Home;

// import React, { useState, useEffect } from "react";
// import { Navigate } from "react-router-dom";
// import Banner from "./Banner";
// import axios from "axios";
// import Sidebar from "./Sidebar";
// import NewsLetter from "./NewsLetter";
// import { useSelector } from "react-redux";
// import { toast } from "react-hot-toast";
// const Home = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [result, setResult] = useState([]);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const { isAuthorized, username } = useSelector((state) => state.auth);
//   const [editingTaskId, setEditingTaskId] = useState(null);
//   const [editedTask, setEditedTask] = useState({ title: "", description: "" });
//   const [selectedTasks, setSelectedTasks] = useState([]);

//   const role = localStorage.getItem("role");
//   console.log(role);

//   const handleSelectTask = (taskId) => {
//     setSelectedTasks((prev) =>
//       prev.includes(taskId)
//         ? prev.filter((id) => id !== taskId)
//         : [...prev, taskId]
//     );
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get("http://localhost:3001/api/alltasks/", {
//           withCredentials: true,
//         });

//         if (Array.isArray(res.data)) {
//           setResult(res.data);
//         } else if (res.data?.tasks) {
//           setResult(res.data.tasks);
//         } else {
//           setResult(Object.values(res.data));
//         }
//       } catch (error) {
//         console.error("Error fetching tasks:", error);
//         setResult([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleAddTask = async () => {
//     if (!title || !description) {
//       toast.error("Title and description are required!");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         "http://localhost:3001/api/tasks/create",
//         {
//           title,
//           description,
//           status: "pending",
//           creator: username,
//         },
//         { withCredentials: true }
//       );
//       setResult((prev) => [...prev, res.data]);
//       setTitle("");
//       setDescription("");
//       console.log(res.data);
//     } catch (error) {
//       console.error("Error adding task:", error);
//       toast.error("Failed to add task. Please try again later.");
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://localhost:3001/api/tasks/${id}`, {
//         withCredentials: true,
//       });
//       setResult((prev) => prev.filter((task) => task.id !== id));
//     } catch (error) {
//       toast.error(error.response.data.message);    }
//   };

//   const handleStatusChange = async (id, newStatus) => {
//     try {
//       let url = `http://localhost:3001/api/tasks/${id}/status`;

//       if (newStatus === "done") {
//         url = `http://localhost:3001/api/tasks/${id}/done`;
//       }

//       const res = await axios.put(
//         url,
//         { status: newStatus },
//         { withCredentials: true }
//       );
//       setResult((prev) =>
//         prev.map((task) => (task.id === id ? res.data : task))
//       );
//     } catch (error) {
//       console.error("Error updating status:", error);
//     }
//   };

//   const handleEdit = (task) => {
//     setEditingTaskId(task._id || task.id);
//     setEditedTask({ title: task.title, description: task.description });
//   };

//   const handleSaveEdit = async (id) => {
//     try {
//       await axios.put(`http://localhost:3001/api/tasks/${id}`, editedTask, {
//         withCredentials: true,
//       });
//       setResult((prev) =>
//         prev.map((task) =>
//           (task._id || task.id) === id ? { ...task, ...editedTask } : task
//         )
//       );
//       setEditingTaskId(null);
//     } catch (error) {
//       if (
//         error.response &&
//         error.response.data &&
//         error.response.data.message
//       ) {
//         toast.error(error.response.data.message);
//         setEditingTaskId(null);
//       } else {
//         toast.error("Error updating task: " + error.message);
//       }
//     }
//   };

//   if (!isAuthorized) return <Navigate to="/login" />;

//   const filteredTasks =
//     role === "approver"
//       ? result
//       : result.filter((task) =>
//           statusFilter ? task.status === statusFilter : true
//         );

//   return (
//     <div>
//       <Banner />
//       <div className="bg-[#FAFAFA] md:grid grid-cols-4 gap-8 lg:px-24 px-4 py-12">
//         <div className="bg-white p-4 rounded">
//           <Sidebar />
//         </div>

//         <div className="col-span-2 bg-white p-6 rounded-sm shadow-md">
//           <h2 className="text-2xl font-bold mb-4">Task Tracker</h2>

//           {role === "submitter" && (
//             <div className="flex gap-2 mb-6">
//               <input
//                 type="text"
//                 placeholder="Title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <input
//                 type="text"
//                 placeholder="Description"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <button
//                 onClick={handleAddTask}
//                 className="bg-blue-600 text-black px-4 py-2 rounded border-2 border-black hover:bg-blue-700"
//               >
//                 Add
//               </button>
//             </div>
//           )}

//           <div className="mb-4">
//             <label className="mr-2">Filter:</label>
//             <select
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="p-2 border rounded"
//             >
//               <option value="">All</option>
//               <option value="pending">Pending</option>
//               <option value="approved">Approved</option>
//               <option value="rejected">Rejected</option>
//               <option value="done">Done</option>
//             </select>
//           </div>

//           <ul className="space-y-3">
//             {isLoading ? (
//               <p>Loading...</p>
//             ) : filteredTasks.length > 0 ? (
//               filteredTasks.map((task) => (
//                 <li
//                   key={task._id || task.id}
//                   className="flex flex-col md:flex-row md:items-center justify-between border p-3 rounded shadow-sm hover:shadow transition"
//                 >
//                   <div className="flex-1">
//                     {editingTaskId === (task._id || task.id) ? (
//                       <>
//                         <input
//                           type="text"
//                           value={editedTask.title}
//                           onChange={(e) =>
//                             setEditedTask({
//                               ...editedTask,
//                               title: e.target.value,
//                             })
//                           }
//                           className="border rounded px-2 py-1 mb-2 w-full"
//                         />
//                         <textarea
//                           value={editedTask.description}
//                           onChange={(e) =>
//                             setEditedTask({
//                               ...editedTask,
//                               description: e.target.value,
//                             })
//                           }
//                           className="border rounded px-2 py-1 w-full"
//                         />
//                       </>
//                     ) : (
//                       <>
//                         <div className="flex items-center gap-2 text-lg font-medium">
//                           <input
//                             type="checkbox"
//                             checked={selectedTasks.includes(
//                               task._id || task.id
//                             )}
//                             onChange={() =>
//                               handleSelectTask(task._id || task.id)
//                             }
//                             className="accent-blue-600"
//                           />
//                           {task.title}
//                         </div>

//                         <div className="text-lg font-medium">{task.title}</div>
//                         <div className="text-sm text-gray-600">
//                           {task.description}
//                         </div>
//                         <div className="text-sm text-gray-600">
//                           {task.status}
//                         </div>
//                         <span className="text-sm text-gray-500">
//                           Created by {task.User?.name} at{" "}
//                           {new Date(task.createdAt).toLocaleString()}
//                         </span>
//                       </>
//                     )}
//                   </div>

//                   <div className="flex gap-2 mt-2 md:mt-0">
//                     {role === "submitter" &&
//                       task.creator === username &&
//                       task.status === "pending" && (
//                         <>
//                           {editingTaskId === (task._id || task.id) ? (
//                             <button
//                               className="text-green-600 hover:underline"
//                               onClick={() =>
//                                 handleSaveEdit(task._id || task.id)
//                               }
//                             >
//                               Save
//                             </button>
//                           ) : (
//                             <button
//                               className="text-gray-500 hover:text-blue-600"
//                               onClick={() => handleEdit(task)}
//                               title="Edit"
//                             >
//                               ✏️
//                             </button>
//                           )}
//                           <button
//                             className="text-gray-500 hover:text-red-600"
//                             onClick={() => handleDelete(task._id || task.id)}
//                             title="Delete"
//                           >
//                             🗑️
//                           </button>
//                         </>
//                       )}
//                     {role === "approver" && task.status === "pending" && (
//                       <>
//                         <button
//                           onClick={() =>
//                             handleStatusChange(task._id || task.id, "approved")
//                           }
//                           className="px-6 py-2 text-white bg-green-600 font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
//                           >
//                           Approve
//                         </button>
//                         <button
//                           onClick={() =>
//                             handleStatusChange(task._id || task.id, "rejected")
//                           }
//                           className="px-6 py-2 text-white bg-red-600 font-semibold rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
//                           >
//                           Reject
//                         </button>
//                       </>
//                     )}

//                     {role === "approver" && task.status === "approved" && (
//                       <button
//                         onClick={() =>
//                           handleStatusChange(task._id || task.id, "done")
//                         }
//                         className="px-6 py-2 bg-blue-600 text-black font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg  focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-black"

//                       >
//                         Mark as Done
//                       </button>
//                     )}
//                   </div>
//                 </li>
//               ))
//             ) : (
//               <p>No tasks found</p>
//             )}
//           </ul>
//         </div>

//         <div className="bg-white p-4 rounded">
//           <NewsLetter />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

// import React, { useState, useEffect } from "react";
// import { Navigate } from "react-router-dom";
// import Banner from "./Banner";
// import axios from "axios";
// import Sidebar from "./Sidebar";
// import NewsLetter from "./NewsLetter";
// import { useSelector } from "react-redux";
// import { toast } from "react-hot-toast";

// const Home = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [result, setResult] = useState([]);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const { isAuthorized, username } = useSelector((state) => state.auth);
//   const [editingTaskId, setEditingTaskId] = useState(null);
//   const [editedTask, setEditedTask] = useState({ title: "", description: "" });
//   const [selectedTasks, setSelectedTasks] = useState([]);

//   const role = localStorage.getItem("role");
//   console.log(role);

//   const handleSelectTask = (taskId) => {
//     setSelectedTasks((prev) =>
//       prev.includes(taskId)
//         ? prev.filter((id) => id !== taskId)
//         : [...prev, taskId]
//     );
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get("http://localhost:3001/api/alltasks/", {
//           withCredentials: true,
//         });

//         if (Array.isArray(res.data)) {
//           setResult(res.data);
//         } else if (res.data?.tasks) {
//           setResult(res.data.tasks);
//         } else {
//           setResult(Object.values(res.data));
//         }
//       } catch (error) {
//         console.error("Error fetching tasks:", error);
//         setResult([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleAddTask = async () => {
//     if (!title || !description) {
//       toast.error("Title and description are required!");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         "http://localhost:3001/api/tasks/create",
//         {
//           title,
//           description,
//           status: "pending",
//           creator: username,
//         },
//         { withCredentials: true }
//       );
//       setResult((prev) => [...prev, res.data]);
//       setTitle("");
//       setDescription("");
//       console.log(res.data);
//     } catch (error) {
//       console.error("Error adding task:", error);
//       toast.error("Failed to add task. Please try again later.");
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://localhost:3001/api/tasks/${id}`, {
//         withCredentials: true,
//       });
//       setResult((prev) => prev.filter((task) => task.id !== id));
//     } catch (error) {
//       toast.error(error.response.data.message);
//     }
//   };

//   const handleStatusChange = async (id, newStatus) => {
//     try {
//       let url = `http://localhost:3001/api/tasks/${id}/status`;

//       if (newStatus === "done") {
//         url = `http://localhost:3001/api/tasks/${id}/done`;
//       }

//       const res = await axios.put(
//         url,
//         { status: newStatus },
//         { withCredentials: true }
//       );
//       setResult((prev) =>
//         prev.map((task) => (task.id === id ? res.data : task))
//       );
//     } catch (error) {
//       console.error("Error updating status:", error);
//     }
//   };

//   const handleEdit = (task) => {
//     setEditingTaskId(task._id || task.id);
//     setEditedTask({ title: task.title, description: task.description });
//   };

//   const handleSaveEdit = async (id) => {
//     try {
//       await axios.put(`http://localhost:3001/api/tasks/${id}`, editedTask, {
//         withCredentials: true,
//       });
//       setResult((prev) =>
//         prev.map((task) =>
//           (task._id || task.id) === id ? { ...task, ...editedTask } : task
//         )
//       );
//       setEditingTaskId(null);
//     } catch (error) {
//       if (
//         error.response &&
//         error.response.data &&
//         error.response.data.message
//       ) {
//         toast.error(error.response.data.message);
//         setEditingTaskId(null);
//       } else {
//         toast.error("Error updating task: " + error.message);
//       }
//     }
//   };

//   if (!isAuthorized) return <Navigate to="/login" />;

//   const filteredTasks =
//     role === "approver"
//       ? result
//       : result.filter((task) =>
//           statusFilter ? task.status === statusFilter : true
//         );

//   return (
//     <div>
//       <Banner />
//       <div className="bg-[#FAFAFA] md:grid grid-cols-4 gap-8 lg:px-24 px-4 py-12">
//         <div className="bg-white p-4 rounded">
//           <Sidebar />
//         </div>

//         <div className="col-span-2 bg-white p-6 rounded-sm shadow-md">
//           <h2 className="text-2xl font-bold mb-4">Task Tracker</h2>

//           {role === "submitter" && (
//             <div className="flex gap-2 mb-6">
//               <input
//                 type="text"
//                 placeholder="Title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <input
//                 type="text"
//                 placeholder="Description"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <button
//                 onClick={handleAddTask}
//                 className="bg-blue-600 text-black px-4 py-2 rounded border-2 border-black hover:bg-blue-700"
//               >
//                 Add
//               </button>
//             </div>
//           )}

//           <div className="mb-4">
//             <label className="mr-2">Filter:</label>
//             <select
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="p-2 border rounded"
//             >
//               <option value="">All</option>
//               <option value="pending">Pending</option>
//               <option value="approved">Approved</option>
//               <option value="rejected">Rejected</option>
//               <option value="done">Done</option>
//             </select>
//           </div>

//           <ul className="space-y-3">
//             {isLoading ? (
//               <p>Loading...</p>
//             ) : filteredTasks.length > 0 ? (
//               filteredTasks.map((task) => (
//                 <li
//                   key={task._id || task.id}
//                   className="flex flex-col md:flex-row md:items-start justify-between border p-3 rounded shadow-sm hover:shadow transition"
//                 >
//                   <div className="flex-1">
//                     {editingTaskId === (task._id || task.id) ? (
//                       <>
//                         <input
//                           type="text"
//                           value={editedTask.title}
//                           onChange={(e) =>
//                             setEditedTask({
//                               ...editedTask,
//                               title: e.target.value,
//                             })
//                           }
//                           className="border rounded px-2 py-1 mb-2 w-full"
//                         />
//                         <textarea
//                           value={editedTask.description}
//                           onChange={(e) =>
//                             setEditedTask({
//                               ...editedTask,
//                               description: e.target.value,
//                             })
//                           }
//                           className="border rounded px-2 py-1 w-full"
//                         />
//                       </>
//                     ) : (
//                       <>
//                         <div className="flex items-center gap-2 text-lg font-medium">
//                           <input
//                             type="checkbox"
//                             checked={selectedTasks.includes(task._id || task.id)}
//                             onChange={() => handleSelectTask(task._id || task.id)}
//                             className="accent-blue-600"
//                           />
//                           {task.title}
//                           <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
//                             {task.status}
//                           </span>
//                         </div>

//                         {/* Show these details only when task is selected */}
//                         {selectedTasks.includes(task._id || task.id) && (
//                           <div className="mt-2 pl-6 border-l-2 border-blue-200">
//                             <div className="text-sm text-gray-600 mb-1">
//                               {task.description}
//                             </div>
//                             <span className="text-xs text-gray-500 block">
//                               Created by {task.User?.name || username} at {" "}
//                               {new Date(task.createdAt).toLocaleString()}
//                             </span>
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>

//                   <div className="flex gap-2 mt-2 md:mt-0">
//                     {role === "submitter" &&
//                       task.creator === username &&
//                       task.status === "pending" && (
//                         <>
//                           {editingTaskId === (task._id || task.id) ? (
//                             <button
//                               className="text-green-600 hover:underline"
//                               onClick={() => handleSaveEdit(task._id || task.id)}
//                             >
//                               Save
//                             </button>
//                           ) : (
//                             <button
//                               className="text-gray-500 hover:text-blue-600"
//                               onClick={() => handleEdit(task)}
//                               title="Edit"
//                             >
//                               ✏️
//                             </button>
//                           )}
//                           <button
//                             className="text-gray-500 hover:text-red-600"
//                             onClick={() => handleDelete(task._id || task.id)}
//                             title="Delete"
//                           >
//                             🗑️
//                           </button>
//                         </>
//                       )}
//                     {role === "approver" && task.status === "pending" && (
//                       <>
//                         <button
//                           onClick={() => handleStatusChange(task._id || task.id, "approved")}
//                           className="px-6 py-2 text-white bg-green-600 font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
//                         >
//                           Approve
//                         </button>
//                         <button
//                           onClick={() => handleStatusChange(task._id || task.id, "rejected")}
//                           className="px-6 py-2 text-white bg-red-600 font-semibold rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
//                         >
//                           Reject
//                         </button>
//                       </>
//                     )}

//                     {role === "approver" && task.status === "approved" && (
//                       <button
//                         onClick={() => handleStatusChange(task._id || task.id, "done")}
//                         className="px-6 py-2 bg-blue-600 text-black font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-black"
//                       >
//                         Mark as Done
//                       </button>
//                     )}
//                   </div>
//                 </li>
//               ))
//             ) : (
//               <p>No tasks found</p>
//             )}
//           </ul>
//         </div>

//         <div className="bg-white p-4 rounded">
//           <NewsLetter />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

// import React, { useState, useEffect } from "react";
// import { Navigate } from "react-router-dom";
// import Banner from "./Banner";
// import axios from "axios";
// import Sidebar from "./Sidebar";
// import NewsLetter from "./NewsLetter";
// import { useSelector } from "react-redux";
// import { toast } from "react-hot-toast";

// const Home = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [result, setResult] = useState([]);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const { isAuthorized, username } = useSelector((state) => state.auth);
//   const [editingTaskId, setEditingTaskId] = useState(null);
//   const [editedTask, setEditedTask] = useState({ title: "", description: "" });
//   const [selectedTasks, setSelectedTasks] = useState([]);

//   const role = localStorage.getItem("role");
//   console.log(role);

//   const handleSelectTask = (taskId) => {
//     setSelectedTasks((prev) =>
//       prev.includes(taskId)
//         ? prev.filter((id) => id !== taskId)
//         : [...prev, taskId]
//     );
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get("http://localhost:3001/api/alltasks/", {
//           withCredentials: true,
//         });

//         if (Array.isArray(res.data)) {
//           setResult(res.data);
//         } else if (res.data?.tasks) {
//           setResult(res.data.tasks);
//         } else {
//           setResult(Object.values(res.data));
//         }
//       } catch (error) {
//         console.error("Error fetching tasks:", error);
//         setResult([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleAddTask = async () => {
//     if (!title || !description) {
//       toast.error("Title and description are required!");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         "http://localhost:3001/api/tasks/create",
//         {
//           title,
//           description,
//           status: "pending",
//           creator: username,
//         },
//         { withCredentials: true }
//       );
//       setResult((prev) => [...prev, res.data]);
//       setTitle("");
//       setDescription("");
//       console.log(res.data);
//     } catch (error) {
//       console.error("Error adding task:", error);
//       toast.error("Failed to add task. Please try again later.");
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://localhost:3001/api/tasks/${id}`, {
//         withCredentials: true,
//       });
//       setResult((prev) => prev.filter((task) => task.id !== id));
//     } catch (error) {
//       toast.error(error.response.data.message);
//     }
//   };

//   const handleStatusChange = async (id, newStatus) => {
//     try {
//       let url = `http://localhost:3001/api/tasks/${id}/status`;

//       if (newStatus === "done") {
//         url = `http://localhost:3001/api/tasks/${id}/done`;
//       }

//       const res = await axios.put(
//         url,
//         { status: newStatus },
//         { withCredentials: true }
//       );
//       setResult((prev) =>
//         prev.map((task) => (task.id === id ? res.data : task))
//       );
//     } catch (error) {
//       console.error("Error updating status:", error);
//     }
//   };

//   const handleEdit = (task) => {
//     setEditingTaskId(task._id || task.id);
//     setEditedTask({ title: task.title, description: task.description });
//   };

//   const handleSaveEdit = async (id) => {
//     try {
//       await axios.put(`http://localhost:3001/api/tasks/${id}`, editedTask, {
//         withCredentials: true,
//       });
//       setResult((prev) =>
//         prev.map((task) =>
//           (task._id || task.id) === id ? { ...task, ...editedTask } : task
//         )
//       );
//       setEditingTaskId(null);
//     } catch (error) {
//       if (
//         error.response &&
//         error.response.data &&
//         error.response.data.message
//       ) {
//         toast.error(error.response.data.message);
//         setEditingTaskId(null);
//       } else {
//         toast.error("Error updating task: " + error.message);
//       }
//     }
//   };

//   if (!isAuthorized) return <Navigate to="/login" />;

//   const filteredTasks = statusFilter
//   ? result.filter(task =>
//       (task.status || "").toLowerCase() === statusFilter.toLowerCase())
//   : result;

//   return (
//     <div>
//       <Banner />
//       <div className="bg-[#FAFAFA] md:grid grid-cols-4 gap-8 lg:px-24 px-4 py-12">
//         <div className="bg-white p-4 rounded">
//           <Sidebar />
//         </div>

//         <div className="col-span-2 bg-white p-6 rounded-sm shadow-md">
//           <h2 className="text-2xl font-bold mb-4">Task Tracker</h2>

//           {role === "submitter" && (
//             <div className="flex flex-col md:flex-row gap-2 mb-6">
//               <input
//                 type="text"
//                 placeholder="Title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 className="w-full md:flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <input
//                 type="text"
//                 placeholder="Description"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 className="w-full md:flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <button
//                 onClick={handleAddTask}
//                 className="w-full md:w-auto bg-blue-600 text-black px-4 py-2 rounded border-2 border-black hover:bg-blue-700"
//               >
//                 Add
//               </button>
//             </div>
//           )}

//           <div className="mb-4">
//             <label className="mr-2">Filter:</label>
//             <select
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="p-2 border rounded"
//             >
//               <option value="">All</option>
//               <option value="pending">Pending</option>
//               <option value="approved">Approved</option>
//               <option value="rejected">Rejected</option>
//               <option value="done">Done</option>
//             </select>
//           </div>

//           <ul className="space-y-3">
//             {isLoading ? (
//               <p>Loading...</p>
//             ) : filteredTasks.length > 0 ? (
//               filteredTasks.map((task) => (
//                 <li
//                   key={task._id || task.id}
//                   className="flex flex-col md:flex-row md:items-start justify-between border p-3 rounded shadow-sm hover:shadow transition"
//                 >
//                   <div className="flex-1">
//                     {editingTaskId === (task._id || task.id) ? (
//                       <>
//                         <input
//                           type="text"
//                           value={editedTask.title}
//                           onChange={(e) =>
//                             setEditedTask({
//                               ...editedTask,
//                               title: e.target.value,
//                             })
//                           }
//                           className="border rounded px-2 py-1 mb-2 w-full"
//                         />
//                         <textarea
//                           value={editedTask.description}
//                           onChange={(e) =>
//                             setEditedTask({
//                               ...editedTask,
//                               description: e.target.value,
//                             })
//                           }
//                           className="border rounded px-2 py-1 w-full"
//                         />
//                       </>
//                     ) : (
//                       <>
//                         <div className="flex items-center gap-2 text-lg font-medium">
//                           <input
//                             type="checkbox"
//                             checked={selectedTasks.includes(task._id || task.id)}
//                             onChange={() => handleSelectTask(task._id || task.id)}
//                             className="accent-blue-600"
//                           />
//                           {task.title}
//                           <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
//                             {task.status}
//                           </span>
//                         </div>

//                         {/* Show these details only when task is selected */}
//                         {selectedTasks.includes(task._id || task.id) && (
//                           <div className="mt-2 pl-6 border-l-2 border-blue-200">
//                             <div className="text-sm text-gray-600 mb-1">
//                               {task.description}
//                             </div>
//                             <span className="text-xs text-gray-500 block">
//                               Created by {task.User?.name || username} at {" "}
//                               {new Date(task.createdAt).toLocaleString()}
//                             </span>
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>

//                   <div className="flex flex-wrap gap-2 mt-2 md:mt-0 justify-start md:justify-end">
//                     {role === "submitter" &&
//                       task.creator === username &&
//                       task.status === "pending" && (
//                         <>
//                           {editingTaskId === (task._id || task.id) ? (
//                             <button
//                               className="text-green-600 hover:underline"
//                               onClick={() => handleSaveEdit(task._id || task.id)}
//                             >
//                               Save
//                             </button>
//                           ) : (
//                             <button
//                               className="text-gray-500 hover:text-blue-600"
//                               onClick={() => handleEdit(task)}
//                               title="Edit"
//                             >
//                               ✏️
//                             </button>
//                           )}
//                           <button
//                             className="text-gray-500 hover:text-red-600"
//                             onClick={() => handleDelete(task._id || task.id)}
//                             title="Delete"
//                           >
//                             🗑️
//                           </button>
//                         </>
//                       )}
//                     {role === "approver" && task.status === "pending" && (
//                       <>
//                         <button
//                           onClick={() => handleStatusChange(task._id || task.id, "approved")}
//                           className="px-4 py-1 text-white bg-green-600 font-semibold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
//                         >
//                           Approve
//                         </button>
//                         <button
//                           onClick={() => handleStatusChange(task._id || task.id, "rejected")}
//                           className="px-4 py-1 text-white bg-red-600 font-semibold rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
//                         >
//                           Reject
//                         </button>
//                       </>
//                     )}

//                     {role === "approver" && task.status === "approved" && (
//                       <button
//                         onClick={() => handleStatusChange(task._id || task.id, "done")}
//                         className="px-4 py-1 bg-blue-600 text-black font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200 outline-black"
//                       >
//                         Mark as Done
//                       </button>
//                     )}
//                   </div>
//                 </li>
//               ))
//             ) : (
//               <p>No tasks found</p>
//             )}
//           </ul>
//         </div>

//         <div className="bg-white p-4 rounded">
//           <NewsLetter />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;
