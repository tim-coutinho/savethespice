import { ColorSchemeProvider, MantineProvider, TextStylesParams } from "@mantine/core";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
import { FC } from "react";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";

import { queryClient } from "@/lib/react-query";
import { prefix } from "@/utils/common";

export const AppProvider: FC = ({ children }) => {
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: `${prefix}theme`,
    defaultValue: useColorScheme(),
  });

  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools position="bottom-right" />
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={v => setColorScheme(v ?? colorScheme === "dark" ? "light" : "dark")}
        >
          <MantineProvider
            theme={{
              headings: { fontWeight: 600 },
              primaryColor: "violet",
              fontFamily: "Roboto",
              colorScheme,
              other: { buttonLength: 40, transitionDuration: 300, sidebarWidth: 250 },
            }}
            styles={{
              Image: theme => ({
                placeholder: {
                  backgroundColor: theme.colorScheme === "light" ? theme.colors.gray[3] : undefined,
                },
              }),
              Text: (theme, params: TextStylesParams) => ({
                root: {
                  color:
                    params.color in theme.colors
                      ? theme.colors[params.color][6]
                      : theme.colorScheme === "light"
                      ? theme.black
                      : theme.colors.dark[0],
                },
              }),
            }}
          >
            <NotificationsProvider>
              <BrowserRouter>{children}</BrowserRouter>
            </NotificationsProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </QueryClientProvider>
    </RecoilRoot>
  );
};
