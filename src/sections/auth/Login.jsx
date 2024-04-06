import Logo from "@/components/Logo/logo";
import { memo, useEffect } from "react";
import { MotionContainer, varSlide } from "@/components/animate";
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  AppBar,
  Box,
  FormHelperText,
  Link,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";
import React, { useState } from "react";
import { m } from "framer-motion";
import EmailInboxIcon from "@/assets/icons/email-inbox-icon";
import SentIcon from "@/assets/icons/sent-icon";
import { object, string } from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axiosInstance from "@/utils/axiosInstance";
import Iconify from "@/components/iconify/iconify";
import { useAuthContext } from "@/auth/hooks/use-auth-context";
import parsePhoneNumberFromString, {
  isValidPhoneNumber,
} from "libphonenumber-js";
// import axiosInstance from "@/utils/axiosInstance";

function Login() {
  const [showOtp, setShowOtp] = useState(false);
  const { login } = useAuthContext();
  const LoginSchema = object().shape({
    UserName: string().required("Email / PhoneNumber is required"),
  });
  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues: {
      UserName: "",
      OTP: "",
    },
  });
  const {
    handleSubmit,
    formState: { isSubmitting, errors, submitCount },
    register,
    reset,
    getValues,
    setValue,
    setError,
    watch,
  } = methods;
  watch("OTP");

  const Onsumbit = async () => {
    try {
      let UserName = getValues("UserName").trim();
      const IfNumber = parsePhoneNumberFromString(UserName, "IN");
      if (isValidPhoneNumber(IfNumber?.number || "")) {
        UserName = IfNumber.number;
      }
      if (showOtp) {
        if (!getValues("OTP")) {
          setError("OTP", {
            message: "OTP is required",
          });
          return;
        }
        if (getValues("OTP")?.length != 6) {
          setError("OTP", {
            message: "OTP must be at least 6 characters",
          });
          return;
        }

        const data = await axiosInstance({
          baseURL: process.env.BASE_URL,
          url: "/auth/auth/loginNew",
          method: "POST",
          data: {
            UserName: UserName,
            Password: getValues("OTP").trim(),
            useragent: window.navigator.userAgent,
          },
        });
        await login(data.data.tokens);
        reset({ UserName: "", OTP: "" });
        window.location.reload();
        // setShowOtp(false);
      } else {
        await axiosInstance({
          url: "/auth/auth/CheckUserName",
          method: "POST",
          data: {
            UserName: UserName,

            reqOtp: true,
          },
        });
        setShowOtp(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const HandleResend = async () => {
    let UserName = getValues("UserName").trim();
    const IfNumber = parsePhoneNumberFromString(UserName, "IN");
    if (isValidPhoneNumber(IfNumber?.number || "")) {
      UserName = IfNumber.number;
    }
    await axiosInstance({
      url: "/auth/auth/CheckUserName",
      method: "POST",
      data: {
        UserName: UserName,

        reqOtp: true,
      },
    });
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (navigator?.credentials) {
        const ac = new AbortController();
        navigator.credentials
          .get({
            otp: { transport: ["sms"] },
            signal: ac.signal,
          })
          .then((otp) => {
            if (otp && showOtp) {
              if (otp?.code) {
                if (otp?.type?.toLowerCase()?.trim() === "otp") {
                  setValue("Password", otp?.code);
                }
              }
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOtp]);
  return (
    <>
      <Logo
        disabledLink
        sx={{
          width: 440,
          height: 40,
          mt: 4,
        }}
      />
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          height: "80vh",
          overflow: "hidden",
          position: "relative",
          m: "auto",
          px: { xs: 2, md: 8 },
          py: { xs: 15, md: 30 },
        }}
      >
        {showOtp ? <SentIcon height={120} /> : <EmailInboxIcon height={120} />}
        <Stack spacing={1}>
          <Typography variant="h4">
            {!showOtp
              ? "Enter your details"
              : "Please check your mobile or email!"}
          </Typography>

          {showOtp && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              We have sent a 6-digit OTP, please enter the code in below box.
            </Typography>
          )}
        </Stack>
        <Box component="form" width="100%" onSubmit={handleSubmit(Onsumbit)}>
          {!showOtp && (
            <MotionContainer
              sx={{
                width: "100%",
              }}
            >
              <m.div variants={varSlide().inLeft}>
                <TextField
                  margin="normal"
                  autoFocus
                  error={Boolean(errors?.UserName?.message)}
                  helperText={errors?.UserName?.message}
                  label="Email or PhoneNumber"
                  fullWidth
                  {...register("UserName")}
                />
              </m.div>
            </MotionContainer>
          )}
          {showOtp && (
            <MotionContainer>
              <m.div variants={varSlide().inRight}>
                <MuiOtpInput
                  gap={1}
                  autoFocus
                  length={6}
                  value={getValues("OTP")}
                  onChange={(newValue) => {
                    setValue("OTP", newValue);
                  }}
                  TextFieldsProps={{
                    margin: "normal",
                    placeholder: "-",
                    error: Boolean(errors?.OTP?.message),
                    type: "number",
                    InputProps: {
                      type: "number",
                    },
                    // helperText: errors?.OTP?.message,
                  }}
                />
                {Boolean(errors?.OTP?.message) && (
                  <FormHelperText sx={{ px: 2 }} error>
                    {errors?.OTP?.message}
                  </FormHelperText>
                )}
              </m.div>
            </MotionContainer>
          )}
        </Box>
        {showOtp && (
          <Alert
            severity="info"
            variant="outlined"
            sx={{ width: 1, mt: 2 }}
            action={
              <LoadingButton
                loading={submitCount > 0 && isSubmitting}
                color="info"
                size="small"
                onClick={HandleResend}
                variant="contained"
                sx={{
                  bgcolor: "info.dark",
                }}
              >
                Resend
              </LoadingButton>
            }
          >
            `Don’t have a code?
          </Alert>
        )}
      </Stack>
      {showOtp && (
        <Link
          color="inherit"
          variant="subtitle2"
          onClick={() => {
            setShowOtp(false);
          }}
          sx={{
            alignItems: "center",
            display: "inline-flex",
            position: "absolute",
            left: "30%",
            bottom: "61px",
          }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={16} />
          Return to sign in
        </Link>
      )}
      {/* <Toolbar variant="dense" />  */}
      <AppBar position="fixed" color="primary" sx={{ top: "auto", bottom: 0 }}>
        <Toolbar
          sx={{
            m: 0,
            p: 0,
            minHeight: 12,
          }}
        >
          <LoadingButton
            sx={{
              borderRadius: 0,
            }}
            loading={isSubmitting}
            onClick={handleSubmit(Onsumbit)}
            size="large"
            variant="contained"
            fullWidth
            color="primary"
          >
            Continue
          </LoadingButton>
        </Toolbar>
      </AppBar>

      {/* </Stack> */}
    </>
  );
}

export default memo(Login);
