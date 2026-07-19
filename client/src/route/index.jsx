import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import App from "../App";

// Lazy loading all pages for better performance
const Home = lazy(() => import("../pages/Home.jsx"));
const SearchPage = lazy(() => import("../pages/SearchPage.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Register = lazy(() => import("../pages/Register.jsx"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword.jsx"));
const OtpVerification = lazy(() => import("../pages/OtpVerification.jsx"));
const ResetPassword = lazy(() => import("../pages/ResetPassword.jsx"));
const UserMenuMobile = lazy(() => import("../pages/UserMenuMobile.jsx"));
const Dashboard = lazy(() => import("../layouts/Dashboard.jsx"));
const Profile = lazy(() => import("../pages/Profile.jsx"));
const MyOrders = lazy(() => import("../pages/MyOrders.jsx"));
const Address = lazy(() => import("../pages/Address.jsx"));
const Categorypage = lazy(() => import("../pages/CategoryPage.jsx"));
const SubCategoryPage = lazy(() => import("../pages/SubCategoryPage.jsx"));
const UploadProduct = lazy(() => import("../pages/UploadProduct.jsx"));
const ProductAdmin = lazy(() => import("../pages/ProductAdmin.jsx"));
const AdminPermission = lazy(() => import("../layouts/AdminPermission.jsx"));
const ProductListPage = lazy(() => import("../pages/ProductListPage.jsx"));
const ProductDisplayPage = lazy(() => import("../pages/ProductDisplayPage.jsx"));
const CartMobile = lazy(() => import("../pages/CartMobile.jsx"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage.jsx"));
const Success = lazy(() => import("../pages/Success.jsx"));
const Cancel = lazy(() => import("../pages/Cancel.jsx"));
const AdminDashboard = lazy(() => import("../pages/AdminDashBoard.jsx"));

// eslint-disable-next-line react-refresh/only-export-components
const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<div className="flex justify-center items-center h-screen"><p>Loading...</p></div>}>
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <SuspenseWrapper><Home /></SuspenseWrapper>,
      },
      {
        path: "search",
        element: <SuspenseWrapper><SearchPage /></SuspenseWrapper>,
      },
      {
        path: "login",
        element: <SuspenseWrapper><Login /></SuspenseWrapper>,
      },
      {
        path: "register",
        element: <SuspenseWrapper><Register /></SuspenseWrapper>,
      },
      {
        path: "forgot-password",
        element: <SuspenseWrapper><ForgotPassword /></SuspenseWrapper>,
      },
      {
        path: "verification-otp",
        element: <SuspenseWrapper><OtpVerification /></SuspenseWrapper>,
      },
      {
        path: "reset-password",
        element: <SuspenseWrapper><ResetPassword /></SuspenseWrapper>,
      },
      {
        path: "user",
        element: <SuspenseWrapper><UserMenuMobile /></SuspenseWrapper>,
      },
      {
        path: "/:category/:subcategory",
        element: <SuspenseWrapper><ProductListPage /></SuspenseWrapper>,
      },
      {
        path: "product/:product",
        element: <SuspenseWrapper><ProductDisplayPage /></SuspenseWrapper>,
      },
      {
        path: "cart",
        element: <SuspenseWrapper><CartMobile /></SuspenseWrapper>,
      },
      {
        path: "checkout",
        element: <SuspenseWrapper><CheckoutPage /></SuspenseWrapper>,
      },
      {
        path: "success",
        element: <SuspenseWrapper><Success /></SuspenseWrapper>,
      },
      {
        path: "cancel",
        element: <SuspenseWrapper><Cancel /></SuspenseWrapper>,
      },

      {
        path: "dashboard",
        element: <SuspenseWrapper><Dashboard /></SuspenseWrapper>,
        children: [
          {
            path: "profile",
            element: <SuspenseWrapper><Profile /></SuspenseWrapper>,
          },
          {
            path: "myorders",
            element: <SuspenseWrapper><MyOrders /></SuspenseWrapper>,
          },
          {
            path: "address",
            element: <SuspenseWrapper><Address /></SuspenseWrapper>,
          },
          {
            path: "category",
            element: (
              <SuspenseWrapper>
                <AdminPermission>
                  <Categorypage />
                </AdminPermission>
              </SuspenseWrapper>
            ),
          },
          {
            path: "subcategory",
            element: (
              <SuspenseWrapper>
                <AdminPermission>
                  <SubCategoryPage />
                </AdminPermission>
              </SuspenseWrapper>
            ),
          },
          {
            path: "upload-product",
            element: (
              <SuspenseWrapper>
                <AdminPermission>
                  <UploadProduct />
                </AdminPermission>
              </SuspenseWrapper>
            ),
          },
          {
            path: "product",
            element: (
              <SuspenseWrapper>
                <AdminPermission>
                  <ProductAdmin />
                </AdminPermission>
              </SuspenseWrapper>
            ),
          },
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <AdminPermission>
                  <AdminDashboard />
                </AdminPermission>
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
