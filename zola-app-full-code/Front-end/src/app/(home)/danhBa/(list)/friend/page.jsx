"use client";
import React, { useContext, useEffect, useState } from "react";
import "./styles.scss";
import { useTranslation } from "react-i18next";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import userApis from "@/apis/userApis";
import Image from "next/image";
import { AuthContext } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import CombineUserId from "@/utils/CombineUserId";
import ConversationApi from "@/apis/ConversationApi";
import FriendApi from "@/apis/FriendApi";

const FriendPage = () => {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [filterType, setFilterType] = useState(0);
  const { t } = useTranslation();
  const currentUser = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const fetchdata = async () => {
      const users = await FriendApi.getFriends(currentUser.uid);
      // console.log(users);
      setFriends(users);
    };
    fetchdata();
  }, [currentUser?.uid]);

  const handleDirectToConversation = async (userId) => {
    const conversation = await ConversationApi.getConversationById(
      CombineUserId(currentUser?.uid, userId)
    );
    if (conversation?._id) router.push(`/tinNhan/${conversation._id}`);
    else router.push(`/tinNhan/${userId}`);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(parseInt(event.target.value));
  };

  const handleFilterChange = (event) => {
    setFilterType(parseInt(event.target.value));
  };

  const sortedFriends = friends.sort((a, b) => {
    if (sortOrder === 0) {
      return a.name?.localeCompare(b.name);
    } else {
      return b.name?.localeCompare(a.name);
    }
  });

  const filteredFriends = sortedFriends
    .filter((friend) => {
      const searchValue = searchTerm.toLowerCase();
      return friend.name.toLowerCase().includes(searchValue);
    })
    .filter((friend) => {
      if (filterType === 0) {
        return true;
      } else {
        return friend.category !== undefined && friend.category !== null;
      }
    });

  return (
    <div className="friend">
      <h3>
        {t("Friends")} ({filteredFriends.length})
      </h3>
      <div className="contentF">
        <div className="timLoc">
          <div className="timKiem">
            <SearchIcon sx={{ color: "#858585" }} />
            <input
              type="text"
              placeholder={t("Search friends")}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="loc">
            <div className="selectLoc">
              <SwapVertIcon />
              <select
                name="locTen"
                id="locTen"
                onChange={handleSortChange}
                value={sortOrder}
              >
                <option value={0}>{t("Name (A - Z)")}</option>
                <option value={1}>{t("Name (Z - A)")}</option>
              </select>
            </div>
            <div className="selectLoc">
              <FilterAltOutlinedIcon />
              <select
                name="locType"
                id="locType"
                onChange={handleFilterChange}
                value={filterType}
              >
                <option value={0}>{t("All")}</option>
                <option value={1}>{t("Categorized")}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="listF">
          {filteredFriends.map((item, index) => (
            <div
              key={item.userId + index}
              className="itemF"
              onClick={() => handleDirectToConversation(item.userId)}
            >
              <img
                className="avatar-img"
                src={item.avatar}
                alt=""
                width={50}
                height={50}
              />
              <h4 className="nameF">{item.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendPage;
