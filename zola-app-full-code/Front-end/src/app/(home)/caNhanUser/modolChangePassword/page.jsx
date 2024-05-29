import React, { useState } from "react";
import { Modal } from "antd";
import { Box, Grid, TextField, Button } from "@mui/material";
import openNotificationWithIcon from "@/components/OpenNotificationWithIcon";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { useCurrentUser } from "@/context/AuthProvider";
import { useTranslation } from "react-i18next";

const ModalChangePassword = ({ show, handleClose }) => {
  const { t } = useTranslation();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isInValidOldPassword, setIsInValidOldPassword] = useState(false);
  const [isInValidNewPassword, setIsInValidNewPassword] = useState(false);
  const [isInValidConfirmPassword, setIsInValidConfirmPassword] =
    useState(false);
  const currentUser = useCurrentUser();

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdatePassword(password);
  };

  const handleUpdatePassword = async () => {
    if (oldPassword === "" || newPassword === "" || confirmPassword === "") {
      openNotificationWithIcon("error", t("error"), t("fill_all_fields"));
      setIsInValidOldPassword(oldPassword === "");
      setIsInValidNewPassword(newPassword === "");
      setIsInValidConfirmPassword(confirmPassword === "");
      return;
    }
    if (
      isInValidOldPassword ||
      isInValidNewPassword ||
      isInValidConfirmPassword
    ) {
      openNotificationWithIcon("error", t("error"), t("invalid_information"));
      return;
    }
    try {
      const credential = await EmailAuthProvider.credential(
        currentUser.email,
        oldPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // old password is correct here
      await updatePassword(currentUser, newPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      openNotificationWithIcon("success", t("success"), t("password_changed"));
      handleClose();
    } catch (error) {
      setIsInValidOldPassword(true);
    }
  };

  const checkOldPassword = (e) => {
    setOldPassword(e.target.value);
  };

  const checkNewPassword = (e) => {
    setNewPassword(e.target.value);
    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()-_+=|\\{}\[\]:;'"<>,.?/])[A-Za-z\d!@#$%^&*()-_+=|\\{}\[\]:;'"<>,.?/]{8,}$/;
    if (!regex.test(e.target.value) && e.target.value !== "") {
      setIsInValidNewPassword(true);
    } else {
      setIsInValidNewPassword(false);
    }

    if (confirmPassword !== "" && confirmPassword !== e.target.value) {
      setIsInValidConfirmPassword(true);
    }

    if (confirmPassword !== "" && confirmPassword === e.target.value) {
      setIsInValidConfirmPassword(false);
    }
  };

  const checkConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
    if (newPassword !== e.target.value && e.target.value !== "") {
      setIsInValidConfirmPassword(true);
    } else {
      setIsInValidConfirmPassword(false);
    }
  };
  return (
    <Modal
      open={show}
      title={<h3>{t("change_password")}</h3>}
      onCancel={handleClose}
      footer={[
        <Button
          key="back"
          variant="outlined"
          onClick={handleClose}
          style={{ marginRight: "5px" }}
        >
          {t("cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          variant="contained"
          color="success"
          onClick={handleUpdatePassword}
        >
          {t("update")}
        </Button>,
      ]}
    >
      <Box component="form" noInValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
        <Grid container spacing={2} style={{ marginTop: "5px" }}>
          <Grid item xs={12}>
            <TextField
              error={isInValidOldPassword}
              helperText={isInValidOldPassword && t("old_password_incorrect")}
              required
              fullWidth
              name="oldPassword"
              label={t("old_password")}
              type="password"
              id="oldPassword"
              autoComplete="new-password"
              value={oldPassword}
              onChange={checkOldPassword}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              error={isInValidNewPassword}
              helperText={isInValidNewPassword && t("invalid_password_pattern")}
              required
              fullWidth
              name="password"
              label={t("new_password")}
              type="password"
              id="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={checkNewPassword}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              error={isInValidConfirmPassword}
              helperText={
                isInValidConfirmPassword && t("password_confirm_mismatch")
              }
              required
              fullWidth
              name="confirmPassword"
              label={t("confirm_password")}
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={checkConfirmPassword}
            />
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ModalChangePassword;
