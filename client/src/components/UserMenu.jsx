import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Divider from "./Divider.jsx";
import AxiosToastError from "../utils/AxiosToastError.js";
import toast from "react-hot-toast";
import SummaryApi from "../common/SummaryApi.js";
import { logout } from "../store/userSlice.js";
import Axios from "../utils/Axios.js";
import { HiOutlineExternalLink } from "react-icons/hi";

const UserMenu = ({ close }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClose = () => {
    if (close) {
      close();
    }
  };

  const handleLogout = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.logout,
      });
      console.log("logout", response);

      if (response.data.success) {
        dispatch(logout());
        localStorage.clear();
        toast.success(response.data.message);

        if (typeof close === "function") {
          close();
        }

        navigate("/");
      }
    } catch (error) {
      console.log(error);
      AxiosToastError(error);
    }
  };

  return (
    <div>
      <div className="font-semibold">My Account</div>
      <div className="text-sm flex items-center gap-2">
        <span className="max-w-52 text-ellipsis line-clamp-1 ">
          {user.name || user.mobile}
          <span className="text-medium text-red-600">
            {user.role === "ADMIN" ? "(Admin)" : ""}
          </span>
        </span>
        <Link
          onClick={handleClose}
          to={"/dashboard/profile"}
          className="hover:text-primary-200"
        >
          <HiOutlineExternalLink size={15} />
        </Link>
      </div>

      <Divider />
      <div className="text-sm grid gap-2">
        {user.role ===
          "ADMIN" && (
            <Link
              onClick={handleClose}
              to={"/dashboard/category"}
              className="px-2 hover:bg-orange-200 py-1"
            >
              Category
            </Link>
          )}

        {user.role === "ADMIN" && (
          <Link
            onClick={handleClose}
            to={"/dashboard/subcategory"}
            className="px-2 hover:bg-orange-200 py-1"
          >
            Sub Category
          </Link>
        )}

        {user.role ===
          "ADMIN"&&(
            <Link
              onClick={handleClose}
              to={"/dashboard/upload-product"}
              className="px-2 hover:bg-orange-200 py-1"
            >
              Upload Product
            </Link>
          )}

          {user.role ===
          "ADMIN"&&(
            <Link
              onClick={handleClose}
              to={"/dashboard/product"}
              className="px-2 hover:bg-orange-200 py-1"
            >
               Products
            </Link>
          )}
        <Link
          onClick={handleClose}
          to={"/dashboard/myorders"}
          className="px-2 hover:bg-orange-200 py-1"
        >
          My Orders
        </Link>

        <Link
          onClick={handleClose}
          to={"/dashboard/address"}
          className="px-2 hover:bg-orange-200 py-1"
        >
          Save Address
        </Link>

        <button
          onClick={handleLogout}
          className="text-left px-2 hover:bg-orange-200 py-1"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
