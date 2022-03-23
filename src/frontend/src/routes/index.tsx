import { FC } from "react";
import { Navigate, useRoutes } from "react-router-dom";

import App from "@/App";
import { AuthForm } from "@/features/auth";
import { RecipeDetails } from "@/features/recipes";
import { ShareComponent } from "@/features/share";

export const AppRoutes: FC = () =>
  useRoutes([
    {
      path: "/",
      element: <App />,
      children: [
        { path: "recipes/:recipeId/*", element: <RecipeDetails /> },
        { path: "share/:shareId", element: <ShareComponent /> },
        { path: "*", element: <Navigate to="/" /> },
      ],
    },
    { path: "/auth", element: <AuthForm /> },
  ]);
