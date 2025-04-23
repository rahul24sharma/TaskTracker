import { useState, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EarthCanvas, StarsCanvas } from "../Canvas/index";
import { motion } from "framer-motion";
import { slideIn } from "./motion";
import { styles } from "./styles";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/authSlice"
import { useSelector } from "react-redux"

const Register = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(faEye);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthorized } = useSelector((state) => {
    return state.auth;
  });

  const validateFields = () => {
    if (!email || !name || !password || !role) {
      toast.error("All fields are required");
      return false;
    }
  
    if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email)) {
      toast.error("Invalid email format");
      return false;
    }
  
  
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
  
    return true;
  };
  

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }
    try {
      const { data } = await axios.post(
        "http://localhost:3001/api/auth/signup",
        { name, email, role, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Ensure this is true
        }
      );
  
      console.log("Full registration response:", data);
      console.log("Received token:", data.token);
      console.log("Received user:", data.user);
      console.log("Received role:", data.user.role);
  
    
  
      dispatch(setAuth({ 
        token: data.token, 
        user: data.user, 
        role: data.user.role 
      }));
  
      // Ensure localStorage is set
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('loggedIn', 'true');
  
      navigate("/");
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const handleToggle = () => {
    if (type === "password") {
      setIcon(faEye);
      setType("text");
    } else {
      setIcon(faEyeSlash);
      setType("password");
    }
  };

  if (isAuthorized) {
    console.log(isAuthorized)
    return <Navigate to={"/"} />;
  }
  return (
    <div
      className={` w-screen xl:mt-0 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden relative`}
    >
      <StarsCanvas />
      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className="flex-[0.75] p-8 rounded-2xl z-10 relative"
      >
        <p className={styles.sectionSubText}>Welcome!</p>
        <h3 style={{color:"black"}} className={styles.sectionHeadText}>Sign up to continue.</h3>

        <form className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col">
            <span className="text-black font-medium mb-4">Select Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-transparent py-2 px-5 placeholder:text-secondary text-black rounded border font-medium"
              required
            >
              <option value="">Select Role</option>
              <option value="submitter">Submitter</option>
              <option value="approver">Approver</option>
            </select>
          </label>
          <label className="flex flex-col">
            <span className="text-black font-medium mb-4">Your Email</span>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="bg-transparent py-2 px-5 placeholder:text-secondary text-black rounded border font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col">
            <span className="text-black font-medium mb-4">Your Username</span>
            <input
              type="text"
              name="name"
              placeholder="Enter your username"
              className="bg-transparent py-2 px-5 placeholder:text-secondary text-black rounded border font-medium"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col relative">
            <span className="text-black font-medium mb-4">Password</span>
            <input
              type={type}
              name="password"
              placeholder="Enter your password"
              className="bg-transparent py-2 px-5 placeholder:text-secondary text-black rounded border font-medium pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FontAwesomeIcon
              className="absolute right-4 bottom-2 transform -translate-y-1/2 cursor-pointer text-black"
              onClick={handleToggle}
              icon={icon}
            />
          </label>
          <button
          
            onClick={handleRegister}
            type="submit"
            className="py-3 px-8 rounded-xl outline-none w-fit text-black font-bold shadow-md shadow-primary hover:bg-tertiary transition-colors bg-white"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <div className="flex justify-between text-sm">
            <a href="/login" className="text-black hover:underline">
              Already have an account? Login
            </a>
            
          </div>
        </form>
      </motion.div>

      <motion.div
        variants={slideIn("right", "tween", 0.2, 1)}
        className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px] z-10 relative"
      >
        <EarthCanvas />
      </motion.div>
    </div>
  );
};

export default Register;
