import axios from "axios";
import { useSelector } from "react-redux"
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";

const MyJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [editingMode, setEditingMode] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthorized, user } = useSelector((state) => {
    return state.auth;
  });

  const navigateTo = useNavigate();
  //Fetching all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/job/getmyjobs",
          { withCredentials: true }
        );
        setMyJobs(data.myJobs);
        console.log(data.myJobs);
      } catch (error) {
        toast.error(error.response.data.message);
        setMyJobs([]);
      }
      finally {
        setLoading(false); 
      }
    };
    fetchJobs();
  }, []);
  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/");
  }

  const handleEnableEdit = (jobId) => {
    setEditingMode(jobId);
  };

  const handleDisableEdit = () => {
    setEditingMode(null);
  };

  const handleUpdateJob = async (jobId) => {
    const updatedJob = myJobs.find((job) => job._id === jobId);
    await axios
      .put(`http://localhost:4000/api/v1/job/updatejobs/${jobId}`, updatedJob, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setEditingMode(null);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handleDeleteJob = async (jobId) => {
    await axios
      .delete(`http://localhost:4000/api/v1/job/delete/${jobId}`, {
        withCredentials: true,
      })
      .then((res) => {
        toast.success(res.data.message);
        setMyJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handleInputChange = (jobId, field, value) => {
    setMyJobs((prevJobs) =>
      prevJobs.map((job) =>
        job._id === jobId ? { ...job, [field]: value } : job
      )
    );
  };

  return (
    <>
<div className="bg-gray-50 py-8 w-11/12 mx-auto">
  <div className="container mx-auto px-4">
    <h1 className="text-3xl font-semibold text-gray-800 mb-6">
      Your Job Listings
    </h1>
    {loading ? (
      <div className="flex justify-center items-center">
        <Spinner animation="border" role="status" variant="primary" />
      </div>
    ) : myJobs.length > 0 ? (
      <div className="space-y-6">
        {myJobs.map((element) => (
          <div
            className="bg-white shadow-lg rounded-lg p-6 space-y-6"
            key={element._id}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Company:</span>
                  <input
                    type="text"
                    disabled={editingMode !== element._id}
                    value={element.companyName}
                    onChange={(e) =>
                      handleInputChange(
                        element._id,
                        "companyName",
                        e.target.value
                      )
                    }
                    className="mt-2 p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Company Logo:</span>
                  {element.companyLogo?.path ? (
                    <img
                      src={`http://localhost:4000/${element.companyLogo.path}`}
                      alt="Company Logo"
                      className="mt-2 w-24 h-24 object-contain"
                    />
                  ) : (
                    <span className="mt-2 text-gray-500">No logo available</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Title:</span>
                  <input
                    type="text"
                    disabled={editingMode !== element._id}
                    value={element.title}
                    onChange={(e) =>
                      handleInputChange(
                        element._id,
                        "title",
                        e.target.value
                      )
                    }
                    className="mt-2 p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Country:</span>
                  <input
                    type="text"
                    disabled={editingMode !== element._id}
                    value={element.country}
                    onChange={(e) =>
                      handleInputChange(
                        element._id,
                        "country",
                        e.target.value
                      )
                    }
                    className="mt-2 p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">City:</span>
                  <input
                    type="text"
                    disabled={editingMode !== element._id}
                    value={element.city}
                    onChange={(e) =>
                      handleInputChange(
                        element._id,
                        "city",
                        e.target.value
                      )
                    }
                    className="mt-2 p-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Category:</span>
                  <select
                    value={element.category}
                    onChange={(e) =>
                      handleInputChange(
                        element._id,
                        "category",
                        e.target.value
                      )
                    }
                    disabled={editingMode !== element._id}
                    className="mt-2 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Graphics & Design">Graphics & Design</option>
                    <option value="Mobile App Development">Mobile App Development</option>
                    <option value="Frontend Web Development">Frontend Web Development</option>
                    <option value="MERN Stack Development">MERN Stack Development</option>
                    <option value="Account & Finance">Account & Finance</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Video Animation">Video Animation</option>
                    <option value="MEAN Stack Development">MEAN Stack Development</option>
                    <option value="MEVN Stack Development">MEVN Stack Development</option>
                    <option value="Data Entry Operator">Data Entry Operator</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Salary:</span>
                  {element.fixedSalary ? (
                    <input
                      type="number"
                      disabled={editingMode !== element._id}
                      value={element.fixedSalary}
                      onChange={(e) =>
                        handleInputChange(
                          element._id,
                          "fixedSalary",
                          e.target.value
                        )
                      }
                      className="mt-2 p-2 border border-gray-300 rounded-md"
                    />
                  ) : (
                    <div className="flex gap-4">
                      <input
                        type="number"
                        disabled={editingMode !== element._id}
                        value={element.salaryFrom}
                        onChange={(e) =>
                          handleInputChange(
                            element._id,
                            "salaryFrom",
                            e.target.value
                          )
                        }
                        className="p-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="number"
                        disabled={editingMode !== element._id}
                        value={element.salaryTo}
                        onChange={(e) =>
                          handleInputChange(
                            element._id,
                            "salaryTo",
                            e.target.value
                          )
                        }
                        className="p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Expired:</span>
                  <select
                    value={element.expired}
                    onChange={(e) =>
                      handleInputChange(
                        element._id,
                        "expired",
                        e.target.value
                      )
                    }
                    disabled={editingMode !== element._id}
                    className="mt-2 p-2 border border-gray-300 rounded-md"
                  >
                    <option value={true}>TRUE</option>
                    <option value={false}>FALSE</option>
                  </select>
                </div>
              </div>

              <div className="long_field space-y-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Description:</span>
                  <textarea
                    rows={5}
                    value={element.description}
                    disabled={editingMode !== element._id}
                    onChange={(e) =>
                      handleInputChange(
                        element._id,
                        "description",
                        e.target.value
                      )
                    }
                    className="mt-2 p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-700">Location:</span>
                  <textarea
                    rows={5}
                    value={element.location}
                    disabled={editingMode !== element._id}
                    onChange={(e) =>
                      handleInputChange(
                        element._id,
                        "location",
                        e.target.value
                      )
                    }
                    className="mt-2 p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="button_wrapper flex justify-between mt-6">
              <div className="edit_btn_wrapper flex gap-4">
                {editingMode === element._id ? (
                  <>
                    <button
                      onClick={() => handleUpdateJob(element._id)}
                      className="p-2 bg-green-500 text-white rounded-md"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => handleDisableEdit()}
                      className="p-2 bg-red-500 text-white rounded-md"
                    >
                      <RxCross2 />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleEnableEdit(element._id)}
                    className="p-2 bg-blue text-white rounded-md"
                  >
                    Edit
                  </button>
                )}
              </div>
              <button
                onClick={() => handleDeleteJob(element._id)}
                className="p-2 bg-red-600 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500">
        You've not posted any job or may have deleted all of your jobs!
      </p>
    )}
  </div>
</div>

    </>
  );
};

export default MyJobs;
