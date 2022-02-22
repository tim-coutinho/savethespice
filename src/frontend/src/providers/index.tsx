import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { useColorScheme, useLocalStorageValue } from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
import { ReactElement, StrictMode } from "react";
import { QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { RecoilRoot } from "recoil";

import { queryClient } from "@/lib/react-query";
import { prefix } from "@/utils/common";

interface AppProviderProps {
  children: ReactElement;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [colorScheme, setColorScheme] = useLocalStorageValue({
    key: `${prefix}theme`,
    defaultValue: useColorScheme(),
  });

  return (
    <StrictMode>
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
                    backgroundColor:
                      theme.colorScheme === "light" ? theme.colors.gray[3] : undefined,
                  },
                }),
              }}
            >
              <NotificationsProvider>{children}</NotificationsProvider>
            </MantineProvider>
          </ColorSchemeProvider>
        </QueryClientProvider>
      </RecoilRoot>
    </StrictMode>
  );
};
