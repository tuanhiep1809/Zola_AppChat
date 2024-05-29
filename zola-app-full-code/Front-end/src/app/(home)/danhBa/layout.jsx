"use client";
import React, { useEffect, useState } from "react";
import "./styles.scss";
import DraftsIcon from "@mui/icons-material/Drafts";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import { useRouter } from "next/navigation";

const Layout = ({ children }) => {
  const items = [
    { id: 1, title: "Friend Lists", icon: <PersonIcon className="icon" /> },
    { id: 2, title: "Joined Groups", icon: <GroupIcon className="icon" /> },
    { id: 3, title: "Friend Requests", icon: <DraftsIcon className="icon" /> },
  ];
  // "Danh sách bạn bè" "Danh sách nhóm" "Lời mời kết bạn"

  const router = useRouter();
  const [active, setActive] = useState(1);
  const [selected, setSelected] = useState(items[0]);
  const [urlPage, setUrlPage] = useState("/danhBa/friend");

  const changePageChildren = (active) => {
    switch (active) {
      case 1:
        return "/danhBa/friend";
      case 2:
        return "/danhBa/group";
      case 3:
        return "/danhBa/friendRequest";
    }
  };

  const handleSelectMenu = (item) => {
    setSelected(item);
    setActive(item.id);
  };

  useEffect(() => {
    router.push(changePageChildren(active));
  }, [active]);

  return (
    <div className="danhBa">
      <div className="itemL">
        <div className="search"></div>
        <div className="items">
          {items.map((item) => (
            <div
              className={`item ${active == item.id && "active"}`}
              key={item.id}
              onClick={() => handleSelectMenu(item)}
            >
              {item.icon} {item.title}
            </div>
          ))}
        </div>
      </div>
      <div className="itemR">
        <div className="title">
          {selected.icon} {selected.title}
        </div>
        <div className="children">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
