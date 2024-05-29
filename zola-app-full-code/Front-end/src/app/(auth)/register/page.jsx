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
import openNotificationWithIcon from "@/components/OpenNotificationWithIcon";
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
  const [confirmPassword, setConfirmPassword] = useState("");
  const recaptchaVerifier = useRef(null);
  const currentUser = useContext(AuthContext);
  const [timer, setTimer] = useState(60);
  const [report, setReport] = useState("Looix");
  const [isNotValid, setIsNotValid] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [isValidPassword, setIsValidPassword] = useState(false);
  const [isValidConfirmPassword, setIsValidConfirmPassword] = useState(false);
  const [isValidName, setIsValidName] = useState(false);
  const [checked, setChecked] = useState(false);

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

  useEffect(() => {
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      number.split(" ").length == 1 ||
      password === "" ||
      name === "" ||
      confirmPassword === ""
    ) {
      setIsValidName(name === "");
      setIsValidPhone(number.split(" ").length == 1);
      setIsValidPassword(password === "");
      setIsValidConfirmPassword(confirmPassword === "");
      setIsNotValid(true);
      setReport("Not fully entered information");
      return;
    }

    if (isValidName) {
      setIsNotValid(true);
      setReport("Name error");
      return;
    }
    if (isValidPassword) {
      setIsNotValid(true);
      setReport("Pass error");
      return;
    }

    if (isValidConfirmPassword) {
      setIsNotValid(true);
      setReport("Pass Confirm error");
      return;
    }

    if (!checked) {
      setIsNotValid(true);
      setReport("Use must agree to Zola's terms before Sign up");
      return;
    }

    const isExist = await axiosPrivate(
      `/check/number/${formatPhoneNumber(number)}`
    );
    if (isExist.numberExists) {
      setIsNotValid(true);
      setReport("This phone number is registered!");
      return;
    }

    let phoneProvider = new PhoneAuthProvider(auth);
    try {
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
      console.log("confirmation: ");
      console.log(confirmation);
      setConfirmation(confirmation);
    } catch (error) {
      console.log(error);
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

      const email = `${formatPhoneNumber(number)}@gmail.com`;
      const credential = EmailAuthProvider.credential(email, password);
      try {
        const usercred = await linkWithCredential(user, credential);
        const user2 = usercred.user;
        const userInfo = {
          _id: user2.uid,
          name,
          number: user2.phoneNumber,
          avatar:
            "https://firebasestorage.googleapis.com/v0/b/zalo-78227.appspot.com/o/avatarDefault.jpg?alt=media&token=2b2922bb-ada3-4000-b5f7-6d97ff87becd",
        };
        // call register API to server
        await authApis.register(userInfo);
        setIsAuthenticated(true);
      } catch (error) {
        console.log("Account linking error", error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }
  if (isAuthenticated) {
    return <Loading />;
  }

  const checkName = (e) => {
    setName(e.target.value);
    const regex =
      /^[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝa-zA-Z\s]{2,42}$/;
    if (!regex.test(e.target.value) && name !== "") {
      //   setReport("Name must be alphanumeric");
      setIsValidName(true);
    } else {
      setIsValidName(false);
    }
  };

  const checkPassword = (e) => {
    setPassword(e.target.value);
    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=|\\{}\[\]:;'"<>,.?/])[A-Za-z\d!@#$%^&*()-_+=|\\{}\[\]:;'"<>,.?/]{8,}$/;
    if (!regex.test(e.target.value) && e.target.value !== "") {
      setIsValidPassword(true);
    } else {
      setIsValidPassword(false);
    }

    if (confirmPassword !== "" && confirmPassword !== e.target.value) {
      setIsValidConfirmPassword(true);
    }

    if (confirmPassword !== "" && confirmPassword === e.target.value) {
      setIsValidConfirmPassword(false);
    }
  };

  const checkConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
    if (password !== e.target.value && e.target.value !== "") {
      setIsValidConfirmPassword(true);
    } else {
      setIsValidConfirmPassword(false);
    }
  };
  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        {isCheck ? (
          <div>
            {confirmation && (
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
                <Button onClick={verifyOtp} variant="contained" color="success">
                  Verify otp
                </Button>
              </div>
            )}
          </div>
        ) : (
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
              Sign up
            </Typography>
            <p style={{ color: "red", marginTop: "5px" }}>
              {isNotValid && report}
            </p>
            {confirmation ? (
              <div className="otp">
                {confirmation && (
                  <div>
                    <TextField
                      onChange={(e) => setOtp(e.target.value)}
                      value={otp}
                      sx={{
                        marginTop: "10px",
                        width: "300px",
                      }}
                      variant="outlined"
                      size="smail"
                      label="Enter the code"
                    />
                    <Button
                      onClick={verifyOtp}
                      variant="contained"
                      color="success"
                    >
                      Verify otp
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <Box
                component="form"
                noValidate
                onSubmit={handleSubmit}
                sx={{ mt: 1 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      error={isValidName}
                      helperText={
                        isValidName &&
                        "Name must have at least 2 characters, no special characters or numbers"
                      }
                      autoComplete="given-name"
                      name="name"
                      required
                      fullWidth
                      id="name"
                      label="Name"
                      autoFocus
                      value={name}
                      onChange={checkName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MuiTelInput
                      error={isValidPhone}
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
                  <Grid item xs={12}>
                    <TextField
                      error={isValidPassword}
                      helperText={
                        isValidPassword &&
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
                      error={isValidConfirmPassword}
                      helperText={
                        isValidConfirmPassword &&
                        "Password confirm do not match"
                      }
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={checkConfirmPassword}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(e) => setChecked(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <>
                          I agree to{" "}
                          <Link href="https://zalo.vn/dieukhoan/">
                            Zola&apos;s terms
                          </Link>
                        </>
                      }
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign Up
                </Button>
                <Grid container justifyContent="flex-end">
                  <Grid item>
                    <Link href="/login" variant="body2">
                      Already have an account? Sign in
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            )}
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
