// import  {  useState,useEffect, useContext } from "react";
// import { motion } from "framer-motion";
// import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
// import { styles } from "./styles";
// import { EarthCanvas, StarsCanvas } from "../Canvas/index";
// import { slideIn } from "./motion";
// import toast from "react-hot-toast";
// import axios from "axios";
// import { Navigate } from "react-router-dom";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { useDispatch } from "react-redux";
// import { setAuth } from "../redux/authSlice"
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux"
// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("");
//   const [type, setType] = useState("password");
//   const [icon, setIcon] = useState(faEye);
//   const [loading, setLoading] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const { isAuthorized, user } = useSelector((state) => {
//     return state.auth;
//   });
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const { data } = await axios.post(
//         "http://localhost:3001/api/auth/login",
//         { email, password, role },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//           withCredentials: true,
//         }
//       );

//       const { token, userRole, user } = data;

//       dispatch(setAuth({ token, role: userRole, user }));
//       if (user.role === "Employer" || user.role === "Job Seeker") {
//         console.log(`Navigating for ${user.role} role`);
//         navigate("/"); // Redirect to home page
//       } else {
//         console.log(`Navigating for ${user.role} role`);
//         navigate("/dashboard")
//       }
//       window.localStorage.setItem("role", data.user.role)
     
//       toast.success("Login successful!");
//       setEmail("");
//       setPassword("");
//       setRole("");

//       setLoading(false);
//     } catch (error) {
//       toast.error(error.response.data.message);
//       setLoading(false);
//     }
//   };



  

//   const handleToggle = () => {
//     if (type === "password") {
//       setIcon(faEye);
//       setType("text");
//     } else {
//       setIcon(faEyeSlash);
//       setType("password");
//     }
//   };

//   // Redirect if already authorized
//   if (isAuthorized) {
//     return <Navigate to={"/"} />;
//   }

//   return (
//     <div
//       className={` w-screen xl:mt-0 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden relative`}
//     >
//       <StarsCanvas />
//       <motion.div
//         variants={slideIn("left", "tween", 0.2, 1)}
//         className="flex-[0.75] p-8 rounded-2xl z-10 relative"
//       >
//         <p className={styles.sectionSubText}>Welcome Back</p>
//         <h3 className={styles.sectionHeadText}>Sign in.</h3>

//         <form className="mt-12 flex flex-col gap-8">
//           <label className="flex flex-col">
//             <span className="text-black font-medium mb-4">Select Role</span>
//             <select
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//               className="bg-transparent py-4 px-6 placeholder:text-secondary text-black rounded border font-medium"
//               required
//             >
//               <option value="">Select Role</option>
//               <option value="submitter">Submitter</option>
//               <option value="approver">Approver</option>
//             </select>
//           </label>

//           <label className="flex flex-col">
//             <span className="text-black font-medium mb-4">Your Email</span>
//             <input
//               type="email"
//               name="email"
//               placeholder="Enter your email"
//               className="bg-transparent py-4 px-6 placeholder:text-secondary text-black rounded border font-medium"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </label>

//           <label className="flex flex-col relative">
//             <span className="text-black font-medium mb-4">Password</span>
//             <input
//               type={type}
//               name="password"
//               placeholder="Enter your password"
//               className="bg-transparent py-4 px-6 placeholder:text-secondary text-black rounded border font-medium pr-12"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <FontAwesomeIcon
//               className="absolute right-4 bottom-3 transform -translate-y-1/2 cursor-pointer text-black"
//               onClick={handleToggle}
//               icon={icon}
//             />
//           </label>
        
//           <button
//             onClick={handleLogin}
//             type="submit"
//             className="py-3 px-8 rounded-xl outline-none w-fit text-black font-bold shadow-md shadow-primary hover:bg-tertiary transition-colors bg-white"
//             disabled={loading}
//           >
//             {loading ? "Signing in..." : "Sign In"}
//           </button>

//           <div className="flex justify-between text-sm">
//             <a href="/register" className="text-black hover:underline">
//               Don't have an account? Register
//             </a>
//             <a href="/forget" className="text-black hover:underline">
//               Forget Password?
//             </a>
//           </div>
//         </form>
//       </motion.div>

//       <motion.div
//         variants={slideIn("right", "tween", 0.2, 1)}
//         className="xl:flex-1 xl:h-auto md:h-[550px] h-[350px] z-10 relative"
//       >
//         <EarthCanvas />
//       </motion.div>
//     </div>
//   );
// };

// export default Login;

import { useState } from "react";
import { motion } from "framer-motion";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { styles } from "./styles";
import { EarthCanvas, StarsCanvas } from "../Canvas";
import { slideIn } from "./motion";
import toast from "react-hot-toast";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { setAuth } from "../redux/authSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(faEye);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthorized } = useSelector((state) => state.auth);

  /* ───────────────────────── handle login ───────────────────────── */
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:3001/api/auth/login",
        { email, password }, // ⬅️ role removed
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const { token, userRole, user } = data;

      dispatch(setAuth({ token, role: userRole, user }));
      window.localStorage.setItem("role", userRole);

      /* decide landing page by role */
      if (userRole === "submitter") {
        navigate("/");
      } else if (userRole === "approver") {
        navigate("/dashboard");
      } else {
        navigate("/"); // default fallback
      }

      toast.success("Login successful!");
      setEmail("");
      setPassword("");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────────────── toggle password ────────────────────── */
  const handleToggle = () => {
    setType((prev) => (prev === "password" ? "text" : "password"));
    setIcon((prev) => (prev === faEye ? faEyeSlash : faEye));
  };

  /* ───────────────────────── redirect if logged in ──────────────── */
  if (isAuthorized) return <Navigate to="/" />;

  /* ───────────────────────── component UI ───────────────────────── */
  return (
    <div className="w-screen xl:mt-0 flex xl:flex-row flex-col-reverse gap-10 overflow-hidden relative">
      <StarsCanvas />

      <motion.div
        variants={slideIn("left", "tween", 0.2, 1)}
        className="flex-[0.75] p-8 rounded-2xl z-10 relative"
      >
        <p className={styles.sectionSubText}>Welcome Back</p>
        <h3 className={styles.sectionHeadText}>Sign in.</h3>

        <form className="mt-12 flex flex-col gap-8" onSubmit={handleLogin}>
          {/* Email */}
          <label className="flex flex-col">
            <span className="text-black font-medium mb-4">Your Email</span>
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent py-4 px-6 placeholder:text-secondary text-black rounded border font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {/* Password */}
          <label className="flex flex-col relative">
            <span className="text-black font-medium mb-4">Password</span>
            <input
              type={type}
              placeholder="Enter your password"
              className="bg-transparent py-4 px-6 placeholder:text-secondary text-black rounded border font-medium pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FontAwesomeIcon
              className="absolute right-4 bottom-3 transform -translate-y-1/2 cursor-pointer text-black"
              onClick={handleToggle}
              icon={icon}
            />
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="py-3 px-8 rounded-xl outline-none w-fit text-black font-bold shadow-md shadow-primary hover:bg-tertiary transition-colors bg-white"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="flex justify-between text-sm">
            <a href="/register" className="text-black hover:underline">
              Don't have an account? Register
            </a>
            <a href="/forget" className="text-black hover:underline">
              Forgot Password?
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

export default Login;
