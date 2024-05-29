"use client";
import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { MuiTelInput } from "mui-tel-input";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useContext } from "react";
import { auth } from "@/firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  EmailAuthProvider,
  linkWithCredential,
  PhoneAuthProvider,
  signInWithCredential,
  updatePassword,
} from "firebase/auth";
import "./styles.scss";
import { AuthContext } from "@/context/AuthProvider";
import Loading from "@/components/Loading";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import formatPhoneNumber from "@/utils/formatPhoneNumber";
import { format } from "path";
import axiosPrivate from "@/apis/axios";
import authApis from "@/apis/authApis";
import firebase from "firebase/app";
import { red } from "@mui/material/colors";
import { notification } from "antd";
function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://mui.com/">
        Zola
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// TODO remove, this demo shouldn't need to reset the theme.

const defaultTheme = createTheme();
export default function SignUp() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [number, setNumber] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [otp, setOtp] = useState("");
  const [isCheck, setIsCheck] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConrfirmPassword] = useState("");
  const recaptchaVerifier = useRef(null);
  const currentUser = useContext(AuthContext);
  const [timer, setTimer] = useState(60);
  const [userCr, setUserCr] = useState(null);
  const [error, setError] = useState(null);
  const [otpState, setOtpState] = useState(0);
  const [isInvalidPassword, setIsInvalidPassword] = useState(false);
  const [isInvalidConfirmPassword, setIsInvalidConfirmPassword] = useState(false);
 
  useEffect(() => {
    let intervalId;
    if (timer > 0 && confirmation) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [confirmation, timer]);

  useEffect(() => {
    if (currentUser) setIsAuthenticated(true);
    else setIsAuthenticated(false);
    setIsLoading(false);
  }, [currentUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (otpState !== 2) {
      //checknumber exist; 
      try {
        const isExist = await axiosPrivate(`/check/number/${formatPhoneNumber(number)}`);  
        if (!isExist.numberExists)  
          throw new Error("This phone number is not registered!");
        let phoneProvider = new PhoneAuthProvider(auth);
        const recaptcha = new RecaptchaVerifier(
          auth,
          recaptchaVerifier.current,
          {}
        );
        setIsCheck(true);
        // const confirmation = await signInWithPhoneNumber(auth, number, recaptcha);
        const confirmation = await phoneProvider.verifyPhoneNumber(
          number,
          recaptcha,
          {
            // mã xác thực sẽ hết hạn sau 2 phút
            timeout: 120000,
          }
        );
        setOtpState(1);
        setConfirmation(confirmation);
      } catch (error) {
        setError(error.message);
      }
    } 
    
    else {
      try {
        // check regex password
        if (isInvalidPassword || isInvalidConfirmPassword) 
          throw new Error("Invalid password");
        updatePassword(userCr, password);
        router.push("/", { changePassword: true });
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const verifyOtp = async () => {
    try {
      const authCredential = await PhoneAuthProvider.credential(
        confirmation,
        otp
      );
      const UserCredentialImpl = await signInWithCredential(
        auth,
        authCredential
      );
      const user = UserCredentialImpl.user;
      setOtpState(2);
      setUserCr(user);
    } catch (error) {
      setError("Invalid otp");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  const checkPassword = (e) => {
    setPassword(e.target.value);
    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=|\\{}\[\]:;'"<>,.?/])[A-Za-z\d!@#$%^&*()-_+=|\\{}\[\]:;'"<>,.?/]{8,}$/;
    if (!regex.test(e.target.value) && e.target.value !== "") {
      setIsInvalidPassword(true);
    } else {
      setIsInvalidPassword(false);
    }

    if (confirmPassword !== "" && confirmPassword !== e.target.value) {
      setIsInvalidConfirmPassword(true);
    }

    if (confirmPassword !== "" && confirmPassword === e.target.value) {
      setIsInvalidConfirmPassword(false);
    }
  };

  const checkConfirmPassword = (e) => {
    setConrfirmPassword(e.target.value);
    if (password !== e.target.value && e.target.value !== "") {
      setIsInvalidConfirmPassword(true);
    } else {
      setIsInvalidConfirmPassword(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        {isCheck && (
          <div>
            {otpState === 1 && (
              <div className="otp">
                {timer > 0 && <p>Resend in {timer}s</p>}
                {timer === 0 && (
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="success"
                  >
                    Resend otp
                  </Button>
                )}
                <TextField
                  onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                  sx={{ marginTop: "10px", width: "300px" }}
                  variant="outlined"
                  size="smail"
                  label="Enter the code"
                />
                {error && <p style={{ color: "red" }}>{error}</p>}
                <Button onClick={verifyOtp} variant="contained" color="success">
                  Verify otp
                </Button>
              </div>
            )}
          </div>
        )}
        {otpState !== 1 && (
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Get back your account
            </Typography>
            { (!isCheck || otpState === 2) &&
              (<Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ mt: 3 }}
              >
                <Grid container spacing={2}>
                  {<p style={{ color: "red" }}>{error}</p>}

                  {/* Nhập số điện thoại */}
                  {!userCr && (
                    <Grid item xs={12}>
                      <MuiTelInput
                        defaultCountry={"VN"}
                        value={number}
                        onChange={setNumber}
                        required
                        fullWidth
                        id="phone"
                        label="Phone number"
                        name="phone"
                      />
                    </Grid>
                  )}
                  
                  {/* Nhập pass word */}
                  {userCr && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          error={isInvalidPassword}
                          helperText={
                            isInvalidPassword &&
                            "Password incluces 1 uppercase letter, 1 lowercase letter, and 1 number, may contain special characters (8-16 characters long)"
                          }
                          required
                          fullWidth
                          name="password"
                          label="Password"
                          type="password"
                          id="password"
                          autoComplete="new-password"
                          value={password}
                          onChange={checkPassword}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          error={isInvalidConfirmPassword}
                          helperText={
                            isInvalidConfirmPassword &&
                            "Password confirm do not match"
                          }
                          required
                          fullWidth
                          name="conrfirmPassword"
                          label="Confirm password"
                          type="password"
                          id="conrfirmPassword"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={checkConfirmPassword}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Submit
                </Button>
                { otpState !== 2 && 
                  (<Grid container justifyContent="flex-end">
                  <Grid item>
                    <Link href="/login" variant="body2">
                      Already have an account? Sign in
                    </Link>
                  </Grid>
                </Grid> )}
              </Box>)
            }
          </Box>
        )}
        {!confirmation && (
          <div className="recaptcha" ref={recaptchaVerifier}></div>
        )}
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}
