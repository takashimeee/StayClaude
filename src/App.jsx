import { Navigate, Route, Routes } from "react-router-dom";
import ScrollToHash from "./components/ScrollToHash";
import RequireAuth from "./components/RequireAuth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Rooms from "./pages/Rooms";
import RoomDetails from "./pages/RoomDetails";
import Booking from "./pages/Booking";
import BookingReview from "./pages/BookingReview";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import MyReservations from "./pages/MyReservations";
import Profile from "./pages/Profile";
import LegalPage from "./pages/LegalPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route
          path="/booking"
          element={
            <RequireAuth>
              <Booking />
            </RequireAuth>
          }
        />
        <Route
          path="/booking/review"
          element={
            <RequireAuth>
              <BookingReview />
            </RequireAuth>
          }
        />
        <Route
          path="/booking/payment"
          element={
            <RequireAuth>
              <Payment />
            </RequireAuth>
          }
        />
        <Route
          path="/booking/confirmation/:id"
          element={
            <RequireAuth>
              <Confirmation />
            </RequireAuth>
          }
        />
        <Route
          path="/my-reservations"
          element={
            <RequireAuth>
              <MyReservations />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route path="/terms" element={<LegalPage kind="terms" />} />
        <Route path="/privacy" element={<LegalPage kind="privacy" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
