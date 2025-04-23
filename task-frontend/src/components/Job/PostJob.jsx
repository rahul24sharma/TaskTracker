import { CssVarsProvider } from "@mui/joy/styles";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import { useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import { Grid } from "@mui/material";
import Textarea from "@mui/joy/Textarea";
import React from "react";
import { useSelector } from "react-redux"

const PostJob = () => {
  const [companyName, setCompanyName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [salaryTypeMain, setSalaryTypeMain] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [fixedSalary, setFixedSalary] = useState("");
  const [salaryType, setSalaryType] = useState("");
  const [logo, setLogo] = useState(null);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  const { isAuthorized, user } = useSelector((state) => {
    return state.auth;
  });
  const handleJobPost = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !companyName ||
      !title ||
      !description ||
      !category ||
      !country ||
      !city ||
      !location ||
      !experienceLevel ||
      !salaryTypeMain
    ) {
      toast.error("Please fill in all required job details");
      return;
    }

    // Create FormData
    const formData = new FormData();

    // Append basic job details
    formData.append("companyName", companyName);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("country", country);
    formData.append("city", city);
    formData.append("location", location);
    formData.append("salaryType", salaryTypeMain);
    formData.append("experienceLevel", experienceLevel);
    formData.append("employmentType", employmentType);


    // Handle salary based on selected type
    switch (salaryType) {
      case "Fixed Salary":
        if (!fixedSalary || fixedSalary.length < 4) {
          toast.error("Please provide a valid fixed salary (minimum 4 digits)");
          return;
        }
        formData.append("fixedSalary", fixedSalary);
        break;

      case "Ranged Salary":
        if (
          !salaryFrom ||
          !salaryTo ||
          salaryFrom.length < 4 ||
          salaryTo.length < 4
        ) {
          toast.error("Please provide a valid salary range (minimum 4 digits)");
          return;
        }
        formData.append("salaryFrom", salaryFrom);
        formData.append("salaryTo", salaryTo);
        break;

      default:
        toast.error("Please select a salary type");
        return;
    }

    // Append the logo file if exists
    if (logo) {
      // Additional file validation
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(logo.type)) {
        toast.error("Only JPEG, PNG, and GIF files are allowed");
        return;
      }

      if (logo.size > maxSize) {
        toast.error("Company logo should not exceed 5MB");
        return;
      }

      formData.append("companyLogo", logo);
    }

    try {
      const res = await axios.post(
        "http://localhost:4000/api/v1/job/post",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(salaryTypeMain);

      toast.success(res.data.message);

      resetFormState();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "An error occurred while posting the job"
      );
    }
  };

  const resetFormState = () => {
    setCompanyName("");
    setTitle("");
    setDescription("");
    setCategory("");
    setCountry("");
    setCity("");
    setLocation("");
    setSalaryType("");
    setSalaryTypeMain("");
    setFixedSalary("");
    setSalaryFrom("");
    setSalaryTo("");
    setLogo(null);
    setExperienceLevel("");
    setEmploymentType("");
  };

  const navigateTo = useNavigate();
  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/");
  }

  return (
    <>
      <CssVarsProvider>
        <main style={{ marginTop: "5%" }}>
          <form onSubmit={handleJobPost}>
            <Sheet
              sx={{
                width: 500,
                mx: "auto", // margin left & right
                my: 1, // margin top & bottom
                py: 3, // padding top & bottom
                px: 2, // padding left & right
                display: "flex",
                flexDirection: "column",
                gap: 2,
                borderRadius: "sm",
                boxShadow: "md",
              }}
              variant="outlined"
            >
              <div>
                <Typography level="h4" component="h1">
                  <b>Welcome!</b>
                </Typography>
                <Typography level="body2">Create a New Job Listing.</Typography>
              </div>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <FormLabel>Company Name</FormLabel>
                    <Input
                      type="text"
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <FormLabel>Job Title</FormLabel>
                    <Input
                      type="text"
                      placeholder="Job Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={category}
                      onChange={(e, newValue) => setCategory(newValue)}
                    >
                      <Option value="">Select Category</Option>
                      <Option value="Graphics & Design">
                        Graphics & Design
                      </Option>
                      <Option value="Mobile App Development">
                        Mobile App Development
                      </Option>
                      <Option value="Frontend Web Development">
                        Frontend Web Development
                      </Option>
                      <Option value="MERN Stack Development">
                        MERN Stack Development
                      </Option>
                      <Option value="Account & Finance">
                        Account & Finance
                      </Option>
                      <Option value="Artificial Intelligence">
                        Artificial Intelligence
                      </Option>
                      <Option value="Video Animation">Video Animation</Option>
                      <Option value="MEAN Stack Development">
                        MEAN Stack Development
                      </Option>
                      <Option value="MEVN Stack Development">
                        MEVN Stack Development
                      </Option>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <FormControl>
                      <FormLabel>Country</FormLabel>
                      <Input
                        type="text"
                        placeholder="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </FormControl>
                  </FormControl>
                </Grid>
              </Grid>
              <FormControl fullWidth>
                      <FormLabel>Employment Type</FormLabel>
                      <Select
                      value={employmentType}
                      onChange={(e, newValue) => setEmploymentType(newValue)}
                    >
                      <Option value="">Select Employment Type</Option>
                      <Option value="Full-time">
                      Full-time
                      </Option>
                      <Option value="Part-time">
                      Part-time
                      </Option>
                      <Option value="Contract">
                        Contract
                      </Option>
                    </Select>
                    </FormControl>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <FormLabel>City</FormLabel>
                    <Input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <FormLabel>Location</FormLabel>
                    <Input
                      type="text"
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <FormLabel>Salary Type</FormLabel>
                    <Select
                      value={salaryType}
                      onChange={(e, newValue) => setSalaryType(newValue)}
                    >
                      <Option value="">Salary Range</Option>
                      <Option value="Fixed Salary">Fixed Salary</Option>
                      <Option value="Ranged Salary">Ranged Salary</Option>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  {salaryType === "default" ? (
                    <p>Please provide Salary Type *</p>
                  ) : salaryType === "Fixed Salary" ? (
                    <FormControl fullWidth>
                      <FormLabel>Fixed Salary</FormLabel>
                      <Input
                        type="number"
                        placeholder="Enter Fixed Salary"
                        value={fixedSalary}
                        onChange={(e) => setFixedSalary(e.target.value)}
                      />
                    </FormControl>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <FormLabel>Salary From</FormLabel>

                          <Input
                            type="number"
                            placeholder="Salary From"
                            value={salaryFrom}
                            onChange={(e) => setSalaryFrom(e.target.value)}
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <FormLabel>Salary To</FormLabel>

                          <Input
                            type="number"
                            placeholder="Salary To"
                            value={salaryTo}
                            onChange={(e) => setSalaryTo(e.target.value)}
                          />
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              <Textarea
                rows="10"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Job Description"
              />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <FormLabel>Salary Type</FormLabel>
                    <Select
                      value={salaryTypeMain}
                      onChange={(e, newValue) => setSalaryTypeMain(newValue)}
                    >
                      <Option value="">Select Salary Type</Option>
                      <Option value="Hourly">Hourly</Option>
                      <Option value="Weekly">Weekly</Option>
                      <Option value="Monthly">Monthly</Option>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  {/* <FormControl fullWidth>
                    <FormLabel>Experience Level</FormLabel>
                    <Input
                      type="text"
                      placeholder="Experience Level"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                    />
                  </FormControl> */}
                  <FormControl fullWidth>
                    <FormLabel>Experience Level</FormLabel>
                    <Select
                      value={experienceLevel}
                      onChange={(e, newValue) => setExperienceLevel(newValue)}
                    >
                      <Option value="">Select Experience Level</Option>
                      <Option value="Entry-Level">Entry-Level</Option>
                      <Option
                        value="Associate-Level"
                      >
                        Associate-Level
                      </Option>
                      <Option value="Mid-Level">
                      Mid-Level
                      </Option>
                      <Option value="Senior-Level">
                      Senior-Level
                      </Option>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <FormLabel>Company Logo</FormLabel>
                    <Input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        const allowedTypes = [
                          "image/jpeg",
                          "image/png",
                          "image/gif",
                        ];
                        const maxSize = 5 * 1024 * 1024; // 5MB

                        if (file) {
                          if (!allowedTypes.includes(file.type)) {
                            toast.error(
                              "Only JPEG, PNG, and GIF files are allowed"
                            );
                            e.target.value = null;
                            setLogo(null);
                            return;
                          }
                          if (file.size > maxSize) {
                            toast.error("File size should not exceed 5MB");
                            e.target.value = null;
                            setLogo(null);
                            return;
                          }
                          setLogo(file);
                        }
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Button type="submit" sx={{ mt: 1 /* margin top */ }}>
                Create
              </Button>
            </Sheet>
          </form>
        </main>
      </CssVarsProvider>
    </>
  );
};

export default PostJob;
