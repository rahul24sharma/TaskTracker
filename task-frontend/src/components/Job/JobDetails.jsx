import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom";
const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState({});
  const navigateTo = useNavigate();

  const { isAuthorized, user } = useSelector((state) => {
    return state.auth;
  });

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/v1/job/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        setJob(res.data.job);
        console.log(res.data.job)
      })
      .catch((error) => {
        navigateTo("/notfound");
        console.log(error)
      });
  }, []);

  if (!isAuthorized) {
    navigateTo("/login");
  }

  return (
<section className="bg-gray-50 py-8 w-11/12 mx-auto">
  <div className="container mx-auto px-4">
    <h3 className="text-3xl font-semibold text-gray-800 mb-6">POSITION OVERWIEW</h3>
    
    <div className="bg-white shadow-lg rounded-lg p-6">
      {/* Company Logo */}
      <div className="flex items-center space-x-4 mb-6">
      {job.companyLogo?.path && (
          <img
            src={`http://localhost:4000/${job.companyLogo.path}`}
            alt={`${job.companyName} Logo`}
            className="w-24 h-24 object-contain"
          />
        )}
        <div>
          <p className="text-xl font-medium text-gray-800">{job.companyName}</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Title:</span> {job.title}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Category:</span> {job.category}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Country:</span> {job.country}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">City:</span> {job.city}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Location:</span> {job.location}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Description:</span> {job.description}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Job Posted On:</span> {job.jobPostedOn}
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Salary:</span> 
          {job.fixedSalary ? (
            <span>{job.fixedSalary}</span>
          ) : (
            <span>{job.salaryFrom} - {job.salaryTo}</span>
          )}
        </p>
        
        {/* Apply Now button */}
        {user && user.role === "Employer" ? null : (
          <Link
            to={`/application/${job._id}`}
            className="inline-block bg-blue text-white py-2 px-6 rounded-md text-lg font-medium hover:bg-blue-700 transition duration-300"
          >
            Apply Now
          </Link>
        )}
      </div>
    </div>
  </div>
</section>
  )
}

export default JobDetails