import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import TagsPage from "../pages/TagsPage";
import PromptsPage from "../pages/PromptsPage";
import SettingsPage from "../pages/SettingsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/tags",
    element: <TagsPage />,
  },
  {
    path: "/prompts",
    element: <PromptsPage />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
]);

export default router;
