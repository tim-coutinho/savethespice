import { FC } from "react";
import { useRoutes } from "react-router-dom";

import App from "@/App";
import { AuthForm } from "@/features/auth";
import { RecipeDetails } from "@/features/recipes";

export const AppRoutes: FC = () =>
  useRoutes([
    {
      path: "/*",
      element: <App />,
      children: [{ path: "recipes/:recipeId/*", element: <RecipeDetails /> }],
    },
    { path: "/auth", element: <AuthForm /> },
  ]);
