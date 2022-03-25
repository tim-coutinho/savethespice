import { FC } from "react";
import { Navigate, useRoutes } from "react-router-dom";

import App from "@/App";
import { AuthForm } from "@/features/auth";
import { RecipeDetails } from "@/features/recipes";
import { ShareComponent } from "@/features/share";

// Routes that handle rendering manually within the code rather than by react-router
const manualRoutes = ["create", "import"];

export const AppRoutes: FC = () =>
  useRoutes([
    {
      path: "/",
      element: <App />,
      children: [
        { path: "recipes/:recipeId/*", element: <RecipeDetails /> },
        ...manualRoutes.map(r => ({ path: r, element: null })),
        { path: "*", element: <Navigate to="/" /> },
      ],
    },
    { path: "/auth", element: <AuthForm /> },
    { path: "/share/:shareId", element: <ShareComponent /> },
  ]);
