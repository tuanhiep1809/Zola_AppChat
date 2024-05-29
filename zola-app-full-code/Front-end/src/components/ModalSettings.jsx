import React, { useState } from "react";
import { Modal, Button, Switch, Select } from "antd";
import { useTranslation } from "react-i18next";

const ModalSettings = ({ visible, onClose }) => {
  const [language, setLanguage] = useState("vi");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { t, i18n } = useTranslation();

  const handleChangeLanguage = (value) => {
    setLanguage(value);
  };

  const handleToggleSound = (checked) => {
    setSoundEnabled(checked);
  };

  const handleSave = () => {
    i18n.changeLanguage(language);
    onClose();
  };

  return (
    <Modal
      title={t("settings")}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t("cancel")}
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          {t("save")}
        </Button>,
      ]}
    >
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          {t("language")}:
        </label>
        <Select
          placeholder={t("selectLanguage")}
          defaultValue="vietnamese"
          key={language}
          size="large"
          bordered={false}
          value={language}
          onChange={(value) => handleChangeLanguage(value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid #d9d9d9",
            fontSize: "16px",
          }}
        >
          <Select.Option key="vi" value="vi">
            {t("vietnamese")}
          </Select.Option>
          <Select.Option key="en" value="en">
            {t("english")}
          </Select.Option>
          <Select.Option key="es" value="es">
            {t("spanish")}
          </Select.Option>
        </Select>
      </div>

      <div className="switch-container" style={{ marginBottom: "1rem" }}>
        <span style={{ marginRight: "3rem" }} className="switch-label">
          {t("sound")}:
        </span>
        <Switch checked={soundEnabled} onChange={handleToggleSound} />
      </div>
    </Modal>
  );
};
export default ModalSettings;
