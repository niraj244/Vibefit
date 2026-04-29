import React, { useContext, useEffect, useState } from "react";
import OtpBox from "../../components/OtpBox";
import Button from "@mui/material/Button";
import { postData } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../App";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const history = useNavigate();
  const context = useContext(MyContext)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token && token !== "" && token !== null) {
      // User is logged in, redirect to home after verification
    }
  }, []);

  const resendOtp = () => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      context.alertBox("error", "Email not found");
      return;
    }

    setIsResending(true);
    postData("/api/user/resend-otp", { email }).then((res) => {
      if (res?.error === false) {
        context.alertBox("success", res?.message);
      } else {
        context.alertBox("error", res?.message);
      }
      setIsResending(false);
    })
  }

  const verityOTP = (e) => {
    e.preventDefault();

    if (otp === "") {
      context.alertBox("error", "Please enter OTP");
      return;
    }

    setIsLoading(true);
    const actionType = localStorage.getItem("actionType");
    const token = localStorage.getItem('accessToken');

    if (actionType !== "forgot-password") {

      postData("/api/user/verifyEmail", {
        email: localStorage.getItem("userEmail"),
        otp: otp
      }).then((res) => {
        if (res?.error === false) {
          context.alertBox("success", res?.message);
          localStorage.removeItem("userEmail")
          setIsLoading(false);
          // If user is already logged in, redirect to home, otherwise to login
          if (token && token !== "" && token !== null) {
            history("/")
          } else {
            history("/login")
          }
        } else {
          context.alertBox("error", res?.message);
          setIsLoading(false);
        }
      })
    }
    
    else{
      postData("/api/user/verify-forgot-password-otp", {
        email: localStorage.getItem("userEmail"),
        otp: otp
      }).then((res) => {
        if (res?.error === false) {
          context.alertBox("success", res?.message);
          setIsLoading(false);
          history("/forgot-password")
        } else {
          context.alertBox("error", res?.message);
          setIsLoading(false);
        }
      })
    }

  }

  return (
    <section className="section py-5 lg:py-10">
      <div className="container">
        <div className="card shadow-md w-full sm:w-[400px] m-auto rounded-md bg-white p-5 px-10">
          <div className="text-center flex items-center justify-center">
            <img src="/verify3.png" width="80" />
          </div>
          <h3 className="text-center text-[18px] text-black mt-4 mb-1">
            Verify OTP
          </h3>

          <p className="text-center mt-0 mb-4">
            OTP send to{" "}
            <span className="text-primary font-bold">{localStorage.getItem("userEmail")}</span>
          </p>

          <form onSubmit={verityOTP}>
            <OtpBox length={6} onChange={handleOtpChange} />

            <div className="flex items-center justify-center mt-5 px-3">
              <Button type="submit" disabled={isLoading} className="w-full btn-org btn-lg">
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>
            </div>

            <div className="flex items-center justify-center mt-3 px-3">
              <Button 
                type="button" 
                onClick={resendOtp} 
                disabled={isResending}
                className="text-primary text-[14px] hover:underline"
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Verify;
