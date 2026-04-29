import { Button } from "@mui/material";
import React, { useState, useContext, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { CgLogIn } from "react-icons/cg";
import { FaRegUser } from "react-icons/fa6";
import { MyContext } from "../../App";
import CircularProgress from '@mui/material/CircularProgress';
import { postData, fetchDataFromApi } from "../../utils/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    fetchDataFromApi("/api/logo").then((res) => {
      localStorage.setItem('logo', res?.logo[0]?.logo)
    })
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "") {
      context.alertBox("error", "Please enter your email");
      return;
    }

    setIsLoading(true);

    // Store email and action type in localStorage
    localStorage.setItem("userEmail", email);
    localStorage.setItem("actionType", "forgot-password");

    postData("/api/user/forgot-password", {
      email: email,
    }).then((res) => {
      if (res?.error === false) {
        context.alertBox("success", res?.message);
        history("/verify-account");
      } else {
        context.alertBox("error", res?.message);
      }
      setIsLoading(false);
    }).catch((error) => {
      context.alertBox("error", "Something went wrong. Please try again.");
      setIsLoading(false);
    });
  };

  return (
    <section className="bg-white w-full h-[100vh]">
      <header className="w-full fixed top-0 left-0  px-4 py-3 flex items-center justify-between z-50">
        <Link to="/">
          <img
            src={localStorage.getItem('logo') || "https://isomorphic-furyroad.vercel.app/_next/static/media/logo.a795e14a.svg"}
            className="w-[200px]"
          />
        </Link>

        <div className="flex items-center gap-0">
          <NavLink to="/login" exact={true} activeClassName="isActive">
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] !px-5 flex gap-1">
              <CgLogIn className="text-[18px]" /> Login
            </Button>
          </NavLink>

          <NavLink to="/sign-up" exact={true} activeClassName="isActive">
            <Button className="!rounded-full !text-[rgba(0,0,0,0.8)] !px-5 flex gap-1">
              <FaRegUser className="text-[15px]" /> Sign Up
            </Button>
          </NavLink>
        </div>
      </header>
      <img src="/patern.webp" className="w-full fixed top-0 left-0 opacity-5" />

      <div className="loginBox card w-[600px] h-[auto] pb-20 mx-auto pt-20 relative z-50">
        <div className="text-center">
          <img src="/icon.svg" className="m-auto" />
        </div>

        <h1 className="text-center text-[35px] font-[800] mt-4">
          Having trouble to sign in?<br />
          Reset your password.
        </h1>

        <br />

        <form className="w-full px-8 mt-3" onSubmit={handleSubmit}>
          <div className="form-group mb-4 w-full">
            <h4 className="text-[14px] font-[500] mb-1">Email</h4>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full h-[50px] border-2 border-[rgba(0,0,0,0.1)] rounded-md focus:border-[rgba(0,0,0,0.7)] focus:outline-none px-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || email === ""} 
            className="btn-blue btn-lg w-full"
          >
            {isLoading ? (
              <CircularProgress color="inherit" size={24} />
            ) : (
              "Reset Password"
            )}
          </Button>

          <br/><br/>
          <div className="text-center flex items-center justify-center gap-4">
            <span>Don't want to reset? </span>
            <Link
              to="/login"
              className="text-primary font-[700] text-[15px] hover:underline hover:text-gray-700"
            >
              Sign In?
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ForgotPassword;
