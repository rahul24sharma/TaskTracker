import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import { useSelector } from "react-redux";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigateTo = useNavigate();

  const { isAuthorized } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/alltasks", {
          withCredentials: true,
        });
        setJobs(res.data); // res.data is already an array
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (!isAuthorized) {
    navigateTo("/");
    return null;
  }

  return (
    <section className="bg-gray-100 py-8 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          CURRENT JOB OPENINGS
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Button variant="primary" disabled>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              <span className="visually-hidden">Loading...</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {jobs.map((element) => (
              <div
                className="card bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
                key={element.id}
              >
                <p className="text-lg font-semibold text-gray-800">{element.title}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Category: {element.category || "Not specified"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Country: {element.country || "Not specified"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Submitted By: {element.User?.name || "Unknown"}
                </p>
                <div className="mt-4">
                  <Link
                    to={`/job/${element.id}`}
                    className="inline-block text-md font-semibold text-black hover:text-blue-800 transition-colors"
                  >
                    Job Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Jobs;
