import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  MdNotifications,
  MdHome,
  MdPerson,
  MdMenu,
  MdArrowDropDown,
} from "react-icons/md";
import socket from "../utils/socket";

interface UserProps {
  logo: string;
  avatarUser: string;
  onHomeClick: () => void;
  onMenuClick: () => void;
}

interface Notification {
  id: number;
  type: string;
  anuncioId: number;
  propostaId: number;
  title: string;
  titleGame: string,
  message: string;
  timestamp: string;
}

const HeaderHome = ({ user }: { user: UserProps }) => {
  const router = useRouter();
  const isValidAvatar =
    typeof user.avatarUser === "string" && user.avatarUser.length > 0;
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [newNotification, setNewNotification] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser?.id) {
      socket.emit("join", storedUser.id);
    }

    const handleNotification = (data: Notification) => {
      setNotifications((prev) => [...prev, data]);
      setNewNotification(true);
      setUnreadNotificationsCount((prev) => prev + 1);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleNotificationClick = () => {
    setNotificationsVisible(!notificationsVisible);
    setNewNotification(false);
    setUnreadNotificationsCount(0);
  };

  return (
    <div className="fixed w-full h-20 bg-background flex items-center justify-between px-8 z-50">
      <div className="cursor-pointer">
        <Image
          src={user.logo}
          alt="Logo"
          width={150}
          height={50}
          onClick={() => router.push("/")}
        />
      </div>

      <div className="flex items-center text-white space-x-6 relative">
        {isMobile ? (
          router.pathname !== "/home" && (
            <MdMenu size={25} className="cursor-pointer" onClick={user.onMenuClick} />
          )
        ) : (
          <MdHome size={25} className="cursor-pointer" onClick={() => router.push("/")} />
        )}

        <div className="relative">
          <MdNotifications
            size={25}
            className={`cursor-pointer text-white ${newNotification ? "animate-wiggle text-red-500" : ""}`}
            onClick={handleNotificationClick}
          />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 text-[10px] bg-[#012AE1] text-white rounded-full w-4 h-4 flex items-center justify-center">
              {unreadNotificationsCount}
            </span>
          )}
        </div>

        {notificationsVisible && (
          <div
            className={`fixed ${isMobile ? 'top-20 left-1/2 transform -translate-x-1/2' : 'top-16 right-4'} bg-cardBackground shadow-xl rounded-lg w-80 p-4 z-50 max-h-96 overflow-y-auto transition-opacity ease-in-out duration-300`}
          >
            <h3 className="text-lg font-semibold text-white border-b pb-2 mb-4">Notificações</h3>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 rounded-lg bg-cardBackground hover:bg-cardHover transition-all duration-200 cursor-pointer shadow-md"
                    onClick={() => router.push(`/dashboardUser?tab=propostas&id=${notification.propostaId}`)}
                  >
                    <div>
                      <p className="text-xs text-white font-semibold">{notification.title}</p>
                      <p className="text-xs text-gray-300">
                        {notification.message}{' '}
                        <span className="text-white font-semibold italic">{notification.titleGame}</span>
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400">Sem notificações</p>
              )}
            </div>
            <button
              onClick={() => setNotificationsVisible(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-400 text-xl"
            >
              ×
            </button>
          </div>
        )}
        {isValidAvatar ? (
          <div className="relative">
            <div className="flex items-center space-x-2">
              <Image
                src={user.avatarUser}
                alt="User Avatar"
                width={50}
                height={50}
                className="w-12 h-12 rounded-full cursor-pointer"
                onClick={() => router.push("/dashboardUser")}
              />
              <MdArrowDropDown
                size={20}
                className="cursor-pointer transition-all duration-300 ease-in-out hover:rotate-180"
                onClick={() => setDropdownVisible(!dropdownVisible)}
              />
            </div>

            {dropdownVisible && (
              <div className="absolute right-0 mt-2 bg-cardBackground rounded-md shadow-lg py-2 w-32 z-50 transition-all duration-300 ease-in-out opacity-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-white bg-buttonLogout hover:bg-buttonLogoutHover rounded-md text-base transition-all duration-200 ease-in-out"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <MdPerson className="cursor-pointer" size={25} onClick={() => router.push("/dashboardUser")} />
        )}
      </div>
    </div>
  );
};

export default HeaderHome;