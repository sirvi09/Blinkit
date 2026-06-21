import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./route/index.jsx";
import store from "./store/store.js";
import { Provider } from "react-redux";
import GlobalProvider from "./provider/GlobalProvider.jsx";

createRoot(document.getElementById("root")).render(
  //<StrictMode>
  <Provider store={store}>
    <GlobalProvider>
      <RouterProvider router={router} />
    </GlobalProvider>
  </Provider>,
  //</StrictMode>,
);