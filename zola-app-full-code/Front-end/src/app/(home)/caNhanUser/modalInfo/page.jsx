import React from "react";
import { useTranslation } from "react-i18next";

const ModalInfo = ({
  show,
  handleClose,
  newName,
  setNewName,
  newGender,
  setNewGender,
  newDateOfBirth,
  setNewDateOfBirth,
  handleUpdateUserInfo,
}) => {
  const { t } = useTranslation();

  if (!show) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="modal-close" onClick={handleClose}>
          &times;
        </span>
        <h2>{t("personal_info")}</h2>
        <div className="form-group">
          <label htmlFor="name">{t("name")}:</label>
          <input
            type="text"
            id="name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender">{t("gender")}:</label>
          <select
            id="gender"
            value={newGender}
            onChange={(e) => setNewGender(e.target.value)}
          >
            <option value="male">{t("male")}</option>
            <option value="female">{t("female")}</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="dateOfBirth">{t("date_of_birth")}:</label>
          <input
            type="date"
            id="dateOfBirth"
            value={newDateOfBirth}
            onChange={(e) => setNewDateOfBirth(e.target.value)}
          />
        </div>
        <button onClick={handleUpdateUserInfo}>{t("submit")}</button>
      </div>
    </div>
  );
};

export default ModalInfo;
