"use client";
import React from "react";

import { useTranslation } from "react-i18next";

const TinNhan = () => {
  const { t } = useTranslation();

  return (
    <div className="conversation">
      <header id="header-conver">
        <h1 className="title">{t("welcomeTitle")}</h1>
        <p className="description">{t("welcomeDescription")}</p>
      </header>
      <div className="image-desc">
        <img
          src="https://chat.zalo.me/assets/quick-message-onboard.3950179c175f636e91e3169b65d1b3e2.png"
          alt=""
          width={"100%"}
          height={"330px"}
          style={{ objectFit: "cover", marginBottom: "30px" }}
        />
      </div>
      <section id="end-to-end-encryption">
        <h2 className="title">{t("encryptionTitle")}</h2>
        <p className="description">{t("encryptionDescription")}</p>
        <a href={t("learnMoreLink")}>{t("learnMore")}</a>
      </section>
    </div>
  );
};

export default TinNhan;
