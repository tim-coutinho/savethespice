import {
  Box,
  Button,
  CloseButton,
  Group,
  Navbar,
  Paper,
  Portal,
  ScrollArea,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useBooleanToggle, useClipboard, useInputState } from "@mantine/hooks";
import { useNotifications } from "@mantine/notifications";
import {
  ClipboardIcon,
  CopyIcon,
  MoonIcon,
  PlusCircledIcon,
  SunIcon,
  TrashIcon,
  TriangleRightIcon,
} from "@radix-ui/react-icons";
import { MouseEvent, ReactElement, useEffect, useRef, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

import { FlipButton } from "@/components/Elements";
import { Confirmation } from "@/components/Elements/DeleteConfirmation/Confirmation";
import { signOut } from "@/features/auth";
import {
  Category,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/features/categories";
import { useRecipes } from "@/features/recipes";
import {
  currentViewState,
  selectedCategoryIdState,
  selectedRecipeIdState,
  signedInState,
} from "@/stores";
import { SignedInState, UNSET, View } from "@/utils/common";

export function Sidebar(): ReactElement {
  const newCategoryNameInputRef = useRef<HTMLInputElement>(null);
  const copyTextRef = useRef<HTMLDivElement>(null);
  const [shiftedLeft, toggleShiftedLeft] = useBooleanToggle(false);
  const [newCategoryName, setNewCategoryName] = useInputState("");
  const [selectedCategoryId, setSelectedCategoryId] = useRecoilState(selectedCategoryIdState);
  const setSelectedRecipeId = useSetRecoilState(selectedRecipeIdState);
  const setCurrentView = useSetRecoilState(currentViewState);
  const setSignedIn = useSetRecoilState(signedInState);
  const { toggleColorScheme } = useMantineColorScheme();
  const clipboard = useClipboard();
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const theme = useMantineTheme();
  const { showNotification } = useNotifications();

  const { data: recipes } = useRecipes();
  const { data: categories } = useCategories();
  const deleteCategoryMutation = useDeleteCategory();
  const addCategoryMutation = useCreateCategory();

  useEffect(() => {
    shiftedLeft &&
      setTimeout(() => newCategoryNameInputRef.current?.focus(), theme.other.transitionDuration);
  }, [shiftedLeft]);

  useEffect(() => {
    if (clipboard.copied && copyTextRef.current) {
      copyTextRef.current.animate(
        [{ opacity: 1 }, { opacity: 0, transform: "translateY(-50px)" }],
        { duration: 2000, iterations: 1, easing: "cubic-bezier(.19, 1, .22, 1)" },
      );
    }
  }, [clipboard.copied]);

  return (
    <Paper radius={0}>
      <Navbar
        width={{ base: `${theme.other.sidebarWidth}px` }}
        zIndex={-1}
        sx={{
          "& > div:not(:first-of-type)": { boxShadow: `0 -1px ${theme.colors.gray[7]}` },
          ".arrow": {
            width: 30,
            height: 30,
            position: "absolute",
            left: -12,
            color: theme.colors[theme.primaryColor][6],
          },
          ".sidebar-item": {
            cursor: "pointer",
            padding: 25,
            position: "relative",
            transitionDuration: "300ms",
            ".arrow, .mantine-ActionIcon-root, .mantine-Button-root": {
              opacity: 0,
              transition: "opacity 50ms, color 150ms, background-color 150ms",
            },
            "&.selected": {
              backgroundColor:
                theme.colorScheme === "light" ? theme.colors.gray[4] : theme.colors.dark[4],
              ".arrow, .mantine-ActionIcon-root, .mantine-Button-root": { opacity: 1 },
            },
            "&:hover:not(.selected)": {
              backgroundColor:
                theme.colorScheme === "light"
                  ? theme.fn.rgba(theme.colors.gray[4], 0.4)
                  : theme.fn.rgba(theme.colors.dark[4], 0.3),
              ".arrow, .mantine-ActionIcon-root": { opacity: 0.5 },
              ".mantine-Button-root": { opacity: 1 },
            },
          },
        }}
        fixed
      >
        <Navbar.Section>
          <Group
            sx={{
              padding: 33,
              // transitionDuration: `${theme.other.transitionDuration}ms`,
              transform: shiftedLeft ? "translateX(-100%)" : "",
            }}
          >
            <Title
              order={4}
              sx={{
                color: theme.colors[theme.primaryColor][6],
                position: "absolute",
                left: theme.spacing.lg,
              }}
            >
              Categories
            </Title>
            <Button
              variant="outline"
              onClick={() => toggleShiftedLeft()}
              sx={{
                position: "absolute",
                right: theme.spacing.sm,
                width: 30,
                height: 30,
                padding: 0,
              }}
              compact
            >
              <PlusCircledIcon width={20} height={20} />
            </Button>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (
                  Array.from(categories || []).every(([, { name }]) => name !== newCategoryName)
                ) {
                  addCategoryMutation.mutate(newCategoryName, {
                    onSuccess: ({ name }) => {
                      showNotification({
                        message: `Category ${name} created!`,
                      });
                    },
                  });
                  setNewCategoryName("");
                  toggleShiftedLeft();
                }
              }}
              style={{ position: "absolute", left: "100%", width: "100%", padding: 5 }}
            >
              <TextInput
                placeholder="Category Name"
                onChange={setNewCategoryName}
                value={newCategoryName}
                onBlur={() => newCategoryName === "" && toggleShiftedLeft()}
                rightSection={
                  newCategoryName !== "" && <CloseButton onClick={() => setNewCategoryName("")} />
                }
                ref={newCategoryNameInputRef}
              />
            </form>
          </Group>
        </Navbar.Section>
        <Navbar.Section component={ScrollArea} grow>
          <Group
            onClick={() => setSelectedCategoryId(UNSET)}
            className={`sidebar-item${selectedCategoryId === UNSET ? " selected" : ""}`}
          >
            <TriangleRightIcon className="arrow" />
            <span style={{ position: "absolute", left: theme.spacing.lg }}>All Recipes</span>
          </Group>
          {Array.from(categories || [])
            .sort(([, { name: name1 }], [, { name: name2 }]) =>
              name1.toLowerCase() >= name2.toLowerCase() ? 1 : -1,
            )
            .map(([categoryId, { name }]) => (
              <Group
                key={categoryId}
                onClick={() => setSelectedCategoryId(categoryId)}
                className={`sidebar-item${selectedCategoryId === categoryId ? " selected" : ""}`}
              >
                <Group>
                  <TriangleRightIcon className="arrow" />
                  <span style={{ position: "absolute", left: theme.spacing.lg }}>{name}</span>
                </Group>
                <Confirmation
                  active={!deleteCategoryMutation.isSuccess}
                  title="Permanently delete category?"
                  message="This cannot be undone."
                  triggerButton={
                    <FlipButton
                      border
                      size="xs"
                      color="red"
                      sx={{ padding: "0 10px", position: "absolute", right: theme.spacing.xl }}
                    >
                      <TrashIcon width={20} height={20} />
                    </FlipButton>
                  }
                  confirmButton={
                    <FlipButton
                      color="red"
                      onClick={() => {
                        deleteCategoryMutation.mutate(categoryId, {
                          onSuccess: () => {
                            showNotification({ message: "Category deleted!" });
                          },
                        });
                        categoryId === selectedCategoryId && setSelectedCategoryId(UNSET);
                      }}
                      sx={theme => ({ transitionDuration: `${theme.other.transitionDuration}ms` })}
                      border
                    >
                      Delete
                    </FlipButton>
                  }
                />
              </Group>
            ))}
        </Navbar.Section>
        <Navbar.Section>
          <Group onClick={() => setCurrentView(View.IMPORT)} className="sidebar-item">
            <span style={{ position: "absolute", left: theme.spacing.lg }}>Import Recipes</span>
            <ClipboardIcon style={{ position: "absolute", right: theme.spacing.sm }} />
          </Group>
          <Group
            onClick={e => {
              if (!clipboard.copied) {
                // Rate limit
                setCoords({ x: e.clientX, y: e.clientY });
                clipboard.copy(
                  JSON.stringify(
                    Array.from(recipes || []).map(([, recipe]) =>
                      recipe.categories
                        ? {
                            ...recipe,
                            categories: recipe.categories.map(
                              c => (categories?.get(c) as Category).name,
                            ),
                            recipeId: undefined,
                            createTime: undefined,
                            updateTime: undefined,
                          }
                        : {
                            ...recipe,
                            recipeId: undefined,
                            createTime: undefined,
                            updateTime: undefined,
                          },
                    ),
                  ),
                );
              }
            }}
            className="sidebar-item"
          >
            <span style={{ position: "absolute", left: theme.spacing.lg }}>Export Recipes</span>
            <CopyIcon style={{ position: "absolute", right: theme.spacing.sm }} />
          </Group>
          <Portal>
            <Text
              ref={copyTextRef}
              sx={{
                display: clipboard.copied ? "block" : "none",
                position: "absolute",
                left: coords.x,
                top: coords.y - 10,
                userSelect: "none",
                pointerEvents: "none",
              }}
            >
              Copied to clipboard!
            </Text>
          </Portal>

          <Group
            onClick={() => {
              document.querySelector("#app")?.setAttribute("data-themechange", "");
              toggleColorScheme();
              setTimeout(
                () => document.querySelector("#app")?.removeAttribute("data-themechange"),
                300,
              );
            }}
            className="sidebar-item"
          >
            <span style={{ position: "absolute", left: theme.spacing.lg }}>Theme</span>
            <Box
              component={theme.colorScheme === "light" ? SunIcon : MoonIcon}
              sx={{ position: "absolute", right: theme.spacing.sm }}
            />
          </Group>
          <Group
            onClick={() => {
              signOut();
              setSignedIn(SignedInState.SIGNED_OUT);
              setSelectedCategoryId(UNSET);
              setSelectedRecipeId(UNSET);
            }}
            className="sidebar-item"
            sx={{ color: theme.colors.red[7] }}
          >
            <span style={{ position: "absolute", left: theme.spacing.lg }}>Sign Out</span>
          </Group>
        </Navbar.Section>
      </Navbar>
    </Paper>
  );
}
