import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { HomePage } from "./pages/HomePage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TalksPage } from "./pages/TalksPage";
import { AdminPage } from "./pages/AdminPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "register", Component: RegisterPage },
      { path: "profile/:userId", Component: ProfilePage },
      { path: "talks", Component: TalksPage },
      { path: "feedback", Component: FeedbackPage },
      { path: "admin", Component: AdminPage },
      { path: "adminlogin", Component: AdminLoginPage },
      { path: "*", Component: NotFound },
    ],
  },
]);
