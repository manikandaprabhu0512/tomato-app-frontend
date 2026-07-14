import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/protectedRote";
import PublicRoute from "./components/publicRoute";
import SelectRole from "./pages/SelectRole";
import Navbar from "./components/navbar";
import Account from "./pages/Account";
import { useAppData } from "./context/AppContext";
import Restaurant from "./pages/Restaurant";
import RestaurantPage from "./pages/RestaurantPage";
import Cart from "./pages/Cart";
import AddAddressPage from "./pages/Address";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderPage from "./pages/OrderPage";
import RiderDashboard from "./pages/RiderDashboard";
import Admin from "./pages/Admin";
import { useEffect, useState } from "react";
import axios from "axios";

const AppLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const App = () => {
  const { user, loading } = useAppData();
  const [isServerStarting, setIsServerStarting] = useState(true);
  const [startupSecondsLeft, setStartupSecondsLeft] = useState(60);

  useEffect(() => {
    if (!isServerStarting) return;

    const timer = window.setInterval(() => {
      setStartupSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isServerStarting]);

  useEffect(() => {
    if (!isServerStarting) return;

    let isCheckingHealth = false;

    const healthCheck = async () => {
      if (isCheckingHealth) return;

      isCheckingHealth = true;

      try {
        const responses = await Promise.all([
          axios.get("https://api.tomatoapp.store/api/v1/gateway/health"),
          axios.get(
            "https://tomato-admin-service.onrender.com/api/v1/admin/health",
          ),
          axios.get("https://tomato-auth-service.onrender.com/api/auth/health"),
          axios.get(
            "https://tomato-restaurant-service.onrender.com/api/restaurant/health",
          ),
          axios.get(
            "https://tomato-realtime-service.onrender.com/api/v1/internal/health",
          ),
          axios.get(
            "https://tomato-rider-service.onrender.com/api/rider/health",
          ),
          axios.get(
            "https://tomato-utils-service.onrender.com/api/utils/health",
          ),
        ]);

        console.log("Health check responses");

        if (responses.every((response) => response.status === 200)) {
          console.log("All services are healthy. Starting the app...");
          setIsServerStarting(false);
        }
      } catch (error) {
        console.log("Health check failed:", error);
      } finally {
        isCheckingHealth = false;
      }
    };

    healthCheck();

    const intervalId = window.setInterval(healthCheck, 5000);

    return () => window.clearInterval(intervalId);
  }, [isServerStarting]);

  if (isServerStarting) {
    const progress = ((60 - startupSecondsLeft) / 60) * 100;

    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-orange-100 dark:from-[#030303] dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4 text-gray-900 dark:text-gray-100">
        <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 shadow-2xl p-8 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-8 border-orange-100 dark:border-slate-800">
            <span className="text-3xl font-bold text-orange-600">
              {startupSecondsLeft}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-3">Starting server</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            Render may need a short cold start. Your App will load automatically
            once the backend is ready.
          </p>

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-orange-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400">
            {startupSecondsLeft > 0
              ? "Please keep this tab open."
              : "Still waking up. This can take a little longer sometimes."}
          </p>
        </div>
      </div>
    );
  }

  if (user && user.role === "seller") {
    return <Restaurant />;
  }
  if (user && user.role === "rider") {
    return <RiderDashboard />;
  }

  if (user && user.role === "admin") {
    return <Admin />;
  }

  if (loading) {
    return (
      <h1 className="text-2xl font-bold text-red-500 text-center mt-56">
        Loading...
      </h1>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route
              path="/paymentsuccess/:paymentId"
              element={<PaymentSuccess />}
            />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order/:id" element={<OrderPage />} />
            <Route path="/ordersuccess" element={<OrderSuccess />} />
            <Route path="/address" element={<AddAddressPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/restaurant/:id" element={<RestaurantPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/account" element={<Account />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
