import React from "react";
import { useState } from "react";
import { API_BASE } from '../../config/api';
import { useNavigate,useLocation } from 'react-router-dom';


export default function () {
  const [timerCount, setTimer] = React.useState(60);
  const [OTPinput, setOTPinput] = useState([0, 0, 0, 0]);
  const [disable, setDisable] = useState(true);
 const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;
  function resendOTP() {
    if (disable) return;
    axios
      .post(`${API_BASE}/auth/send_recovery_email`, {
        OTP: otp,
        recipient_email: email,
      })
      .then(() => setDisable(true))
      .then(() => alert("A new OTP has succesfully been sent to your email."))
      .then(() => setTimer(60))
      .catch(console.log);
  }

  function verifyOTP() {
    if (parseInt(OTPinput.join("")) === otp) {
      navigate("/reset", { state: { email } });
      return;
    }
    alert(
      "The code you have entered is not correct, try again or re-send the link"
    );
    return;
  }
  React.useEffect(() => {
    if (!email || !otp) {
      navigate("/home"); // redirect if accessed directly
    }
  }, [email, otp, navigate]);
  React.useEffect(() => {
    let interval = setInterval(() => {
      setTimer((lastTimerCount) => {
        lastTimerCount <= 1 && clearInterval(interval);
        if (lastTimerCount <= 1) setDisable(false);
        if (lastTimerCount <= 0) return lastTimerCount;
        return lastTimerCount - 1;
      });
    }, 1000); //each count lasts for a second
    //cleanup the interval on complete
    return () => clearInterval(interval);
  }, [disable]);

  return (
    <>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 12px;
          margin: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          border-radius: 12px;
          border: 2px solid #1f2937;
          transition: all 0.3s ease;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #9ca3af, #6b7280);
          transform: scale(1.1);
        }
        .glass-effect {
          background: rgba(17, 24, 39, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(75, 85, 99, 0.3);
        }
        .gradient-bg {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
        }
        .tab-active {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }
        .tab-inactive {
          background: rgba(75, 85, 99, 0.2);
          color: #9ca3af;
        }
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 768px) {
          .table-responsive table {
            min-width: 600px;
          }
        }
      `}</style>
    <div className="flex justify-center items-center w-full h-screen gradient-bg">
      <div className="glass-effect px-10 pt-10 pb-10 shadow-xl mx-auto w-90 max-w-lg rounded-2xl">
        <div className="mx-auto flex w-full max-w-md flex-col space-y-10">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-3xl">
              <p className="text-orange-400">Email Verification</p>
            </div>
            <div className="flex flex-row text-sm font-medium text-gray-400">
              <p>We have sent a code to your email {email}</p>
            </div>
          </div>

          <div>
            <form>
              <div className="flex flex-col space-y-12">
                <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                  <div className="w-14 h-14 ">
                    <input
                      maxLength="1"
                      className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-white text-md glass-center focus:bg-transparent focus:ring-1 ring-blue-700"
                      type="text"
                      name=""
                      id=""
                      onChange={(e) =>
                        setOTPinput([
                          e.target.value,
                          OTPinput[1],
                          OTPinput[2],
                          OTPinput[3],
                        ])
                      }
                    ></input>
                  </div>
                  <div className="w-14 h-14 ">
                    <input
                      maxLength="1"
                      className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-white text-md glass-center focus:bg-transparent focus:ring-1 ring-blue-700"
                      type="text"
                      name=""
                      id=""
                      onChange={(e) =>
                        setOTPinput([
                          OTPinput[0],
                          e.target.value,
                          OTPinput[2],
                          OTPinput[3],
                        ])
                      }
                    ></input>
                  </div>
                  <div className="w-14 h-14 ">
                    <input
                      maxLength="1"
                      className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-white text-md glass-center focus:bg-transparent focus:ring-1 ring-blue-700"
                      type="text"
                      name=""
                      id=""
                      onChange={(e) =>
                        setOTPinput([
                          OTPinput[0],
                          OTPinput[1],
                          e.target.value,
                          OTPinput[3],
                        ])
                      }
                    ></input>
                  </div>
                  <div className="w-14 h-14 ">
                <input
  maxLength="1"
  className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-white text-md glass-center focus:bg-transparent focus:ring-1 ring-blue-700"
  type="text"
  onChange={(e) =>
    setOTPinput([
      OTPinput[0],
      OTPinput[1],
      OTPinput[2],
      e.target.value,
    ])
  }
/>

                  </div>
                </div>
                 <div className="h-1">
                    <a
                      onClick={() => navigate('/')}
                      className="text-orange-400 hover:text-orange-300 font-medium disabled:text-orange-500 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                      Go Back
                    </a>
                  </div>

                <div className="flex flex-col space-y-9">
                  <div>
                    <a
                      onClick={() => verifyOTP()}
                      className="flex flex-row cursor-pointer items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-blue-700 border-none text-white text-sm shadow-sm"
                    >
                      Verify Account
                    </a>
                  </div>
                 
                  <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                    <p>Didn't recieve code?</p>{" "}
                    <a
                      className="flex flex-row items-center"
                      style={{
                        color: disable ? "gray" : "blue",
                        cursor: disable ? "none" : "pointer",
                        textDecorationLine: disable ? "none" : "underline",
                      }}
                      onClick={() => resendOTP()}
                    >
                      {disable ? `Resend OTP in ${timerCount}s` : "Resend OTP"}
                    </a>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}