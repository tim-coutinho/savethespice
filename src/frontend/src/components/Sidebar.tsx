import {
  Box,
  Button,
  CloseButton,
  Group,
  Navbar,
  Portal,
  ScrollArea,
  TextInput,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useBooleanToggle, useClipboard } from "@mantine/hooks";
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
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { SignedInState, transitionDuration, UNSET, View } from "../lib/common";
import { useAsync } from "../lib/hooks";
import { addCategory, getAllCategories, signOut } from "../lib/operations";
import {
  allRecipesState,
  categoriesState,
  currentViewState,
  itemToDeleteState,
  selectedCategoryIdState,
  signedInState,
} from "../store";
import { Category } from "../types";
import { FlipButton } from "./FlipButton";

interface SidebarProps {
  handleDeleteCategory: () => void;
}

export default ({ handleDeleteCategory }: SidebarProps): ReactElement => {
  const newCategoryNameInputRef = useRef<HTMLInputElement>(null);
  const copyTextRef = useRef<HTMLSpanElement>(null);
  const [shiftedLeft, toggleShiftedLeft] = useBooleanToggle(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useRecoilState(selectedCategoryIdState);
  const [allCategories, setAllCategories] = useRecoilState(categoriesState);
  const allRecipes = useRecoilValue(allRecipesState);
  const setItemToDelete = useSetRecoilState(itemToDeleteState);
  const setCurrentView = useSetRecoilState(currentViewState);
  const setSignedIn = useSetRecoilState(signedInState);
  const [executeAddCategory, addCategoryRequest] = useAsync(addCategory);
  const [executeGetAllCategories, getAllCategoriesRequest] = useAsync(getAllCategories);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const clipboard = useClipboard();
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const theme = useMantineTheme();

  useEffect(() => {
    executeGetAllCategories();
  }, []);

  useEffect(() => {
    if (getAllCategoriesRequest.value) {
      setAllCategories(
        new Map(getAllCategoriesRequest.value.categories.map(c => [c.categoryId, c])),
      );
    }
  }, [getAllCategoriesRequest.status]);

  useEffect(() => {
    shiftedLeft && setTimeout(() => newCategoryNameInputRef.current?.focus(), transitionDuration);
  }, [shiftedLeft]);

  useEffect(() => {
    const { value } = addCategoryRequest;
    if (value !== null) {
      setAllCategories(categories => new Map(categories.set(value.categoryId, value)));
      setNewCategoryName("");
      toggleShiftedLeft();
    }
  }, [addCategoryRequest.status]);

  useEffect(() => {
    if (clipboard.copied && copyTextRef.current) {
      copyTextRef.current.animate(
        [{ opacity: 1 }, { opacity: 0, transform: "translateY(-50px)" }],
        { duration: 2000, iterations: 1, easing: "cubic-bezier(0.35, 1, 0.5, 1)" },
      );
    }
  }, [clipboard.copied]);

  return (
    <Navbar
      width={{ base: 250 }}
      zIndex={-1}
      sx={theme => ({
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
          transitionDuration: "50ms",
          ".arrow, .mantine-ActionIcon-root, .mantine-Button-root": {
            opacity: 0,
            transition: "opacity 50ms, color 150ms, background-color 150ms",
          },
          "&.selected": {
            backgroundColor: colorScheme === "light" ? theme.colors.gray[3] : theme.colors.dark[5],
            ".arrow, .mantine-ActionIcon-root, .mantine-Button-root": { opacity: 1 },
          },
          "&:hover:not(.selected)": {
            backgroundColor: colorScheme === "light" ? theme.colors.gray[2] : theme.colors.dark[6],
            ".arrow, .mantine-ActionIcon-root": { opacity: 0.5 },
            ".mantine-Button-root": { opacity: 1 },
          },
        },
      })}
      fixed
    >
      <Navbar.Section>
        <Group
          sx={{
            padding: 33,
            transitionDuration: `${transitionDuration}ms`,
            transform: shiftedLeft ? "translateX(-100%)" : "",
          }}
        >
          <Title
            order={4}
            sx={theme => ({
              color: theme.colors[theme.primaryColor][6],
              position: "absolute",
              left: "1.5rem",
            })}
          >
            Categories
          </Title>
          <Button
            variant="outline"
            onClick={() => toggleShiftedLeft()}
            sx={{ position: "absolute", right: "0.5rem", width: 30, height: 30, padding: 0 }}
            compact
          >
            <PlusCircledIcon width={20} height={20} />
          </Button>
          <form
            onSubmit={e => {
              e.preventDefault();
              Array.from(allCategories).some(([, { name }]) => name === newCategoryName) ||
                executeAddCategory(newCategoryName);
            }}
            style={{ position: "absolute", left: "100%", width: "100%", padding: 5 }}
          >
            <TextInput
              placeholder="Category Name"
              onChange={({ currentTarget: { value } }) => setNewCategoryName(value)}
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
          <span style={{ position: "absolute", left: "1.5rem" }}>All Recipes</span>
        </Group>
        {Array.from(allCategories)
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
                <span style={{ position: "absolute", left: "1.5rem" }}>{name}</span>
              </Group>
              <FlipButton
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  setItemToDelete({ type: "category", id: categoryId });
                  handleDeleteCategory();
                }}
                border
                size="xs"
                color="red"
                sx={{ padding: "0 10px", position: "absolute", right: "2rem" }}
              >
                <TrashIcon width={20} height={20} />
              </FlipButton>
            </Group>
          ))}
      </Navbar.Section>
      <Navbar.Section>
        <Group onClick={() => setCurrentView(View.IMPORT)} className="sidebar-item">
          <span style={{ position: "absolute", left: "1.5rem" }}>Import Recipes</span>
          <ClipboardIcon style={{ position: "absolute", right: "1rem" }} />
        </Group>
        <Group
          onClick={e => {
            if (!clipboard.copied) {
              // Rate limit
              setCoords({ x: e.clientX, y: e.clientY });
              clipboard.copy(
                JSON.stringify(
                  Array.from(allRecipes).map(([, recipe]) =>
                    recipe.categories
                      ? {
                          ...recipe,
                          categories: recipe.categories.map(
                            c => (allCategories.get(c) as Category).name,
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
          <span style={{ position: "absolute", left: "1.5rem" }}>Export Recipes</span>
          <CopyIcon style={{ position: "absolute", right: "1rem" }} />
        </Group>
        <Portal>
          <span
            ref={copyTextRef}
            style={{
              display: clipboard.copied ? "block" : "none",
              position: "absolute",
              left: coords.x,
              top: coords.y - 10,
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            Copied to clipboard!
          </span>
        </Portal>

        <Group onClick={() => toggleColorScheme()} className="sidebar-item">
          <span style={{ position: "absolute", left: "1.5rem" }}>Theme</span>
          <Box
            component={theme.colorScheme === "light" ? SunIcon : MoonIcon}
            sx={{ position: "absolute", right: "1rem" }}
          />
        </Group>
        <Group
          onClick={() => signOut().then(() => setSignedIn(SignedInState.SIGNED_OUT))}
          className="sidebar-item"
          sx={theme => ({ color: theme.colors.red[7] })}
        >
          <span style={{ position: "absolute", left: "1.5rem" }}>Sign Out</span>
        </Group>
      </Navbar.Section>
    </Navbar>
  );
};
