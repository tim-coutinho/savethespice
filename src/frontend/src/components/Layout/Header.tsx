import {
  ActionIcon,
  Burger,
  Paper,
  Popover,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useBooleanToggle } from "@mantine/hooks";
import { GearIcon, MagnifyingGlassIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { FC, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRecoilState } from "recoil";

import { FlipButton } from "@/components/Elements";
import { useCategories } from "@/features/categories";
import { filterOptionsState, filterState, sidebarOpenedState } from "@/stores";

export const Header: FC = () => {
  const [popoverOpened, togglePopoverOpened] = useBooleanToggle(false);
  const [filterFocused, toggleFilterFocused] = useBooleanToggle(false);
  const ref = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useRecoilState(filterState);
  const [filterOptions, setFilterOptions] = useRecoilState(filterOptionsState);
  const [sidebarOpened, setSidebarOpened] = useRecoilState(sidebarOpenedState);
  const theme = useMantineTheme();

  const [searchParams] = useSearchParams();

  const { data: categories } = useCategories();

  const headerTitle = useMemo(() => {
    const categoryFilter = searchParams.get("categories")?.split("|") ?? [];
    if (categoryFilter.length === 0) {
      return "All Recipes";
    } else if (categoryFilter.length === 1) {
      return categories?.get(+categoryFilter[0])?.name ?? "";
    } else {
      return categories ? categoryFilter.map(c => categories.get(+c)?.name).join(", ") : "";
    }
  }, [searchParams, categories]);

  const filterExpanded = filter !== "" || popoverOpened || filterFocused;
  const allChecked = Object.values(filterOptions).every(v => v);
  const switchProps = (optionName: keyof typeof filterOptions) => ({
    checked: filterOptions[optionName],
    onChange: () => setFilterOptions(prev => ({ ...prev, [optionName]: !prev[optionName] })),
    sx: { ".mantine-Switch-input:hover": { cursor: "pointer" } },
  });

  return (
    <Paper
      radius={0}
      sx={theme => ({
        padding: theme.spacing.sm,
        borderBottom: `1px solid ${theme.colors.gray[7]}`,
        display: "grid",
        gridTemplateColumns: "40px auto 40px",
        gap: theme.spacing.sm,
        position: "relative",
      })}
    >
      <FlipButton
        size="md"
        component="div"
        onClick={() => setSidebarOpened(!sidebarOpened)}
        sx={theme => ({
          transitionDuration: `${theme.other.transitionDuration}ms`,
          ".mantine-Burger-burger:not(.mantine-Burger-opened), .mantine-Burger-burger::before, .mantine-Burger-burger::after":
            { backgroundColor: theme.white },
          "&:hover": {
            ".mantine-Burger-burger:not(.mantine-Burger-opened), .mantine-Burger-burger::before, .mantine-Burger-burger::after":
              { backgroundColor: theme.colors[theme.primaryColor][6] },
          },
        })}
        length={theme.other.buttonLength}
        border
        square
      >
        <Burger opened={sidebarOpened} />
      </FlipButton>
      <Title
        order={4}
        sx={theme => ({
          position: "absolute",
          left: 75,
          top: "50%",
          transform: "translateY(-50%)",
          color: theme.colors[theme.primaryColor][6],
          opacity: filterExpanded ? 0 : 1,
        })}
      >
        {headerTitle}
      </Title>
      <div>
        <FlipButton
          size="md"
          component="div"
          onClick={() => ref.current?.focus()}
          sx={{
            padding: "0 0 0 4px",
            transitionDuration: `${theme.other.transitionDuration}ms`,
            overflowX: "hidden",
            width: filterExpanded ? "100%" : 40,
            float: "right",
          }}
          leftIcon={<MagnifyingGlassIcon width={30} height={30} />}
          rightIcon={
            <TextInput
              placeholder="Filter"
              value={filter}
              onChange={({ target: { value } }) => setFilter(value)}
              onFocus={() => toggleFilterFocused()}
              onBlur={() => toggleFilterFocused()}
              ref={ref}
              sx={{ transitionDuration: `${theme.other.transitionDuration}ms` }}
              styles={theme => ({
                input: {
                  backgroundColor: theme.white,
                  border: "none",
                  color: theme.colors.dark[6],
                  padding: `0 ${filterExpanded ? 25 : 0}px 0 5px`,
                },
                rightSection: {
                  opacity: filterExpanded ? 1 : 0,
                  transitionDuration: `${theme.other.transitionDuration}ms`,
                },
              })}
              rightSectionWidth={25}
              rightSection={
                <Popover
                  opened={popoverOpened}
                  onClose={() =>
                    togglePopoverOpened(v => {
                      if (!v) {
                        ref.current?.focus();
                      }
                      return !v;
                    })
                  }
                  position="bottom"
                  placement="end"
                  gutter={5}
                  target={
                    <ActionIcon
                      variant="transparent"
                      color="dark"
                      onClick={() => togglePopoverOpened()}
                    >
                      <GearIcon />
                    </ActionIcon>
                  }
                  withArrow
                >
                  <form>
                    <Text size="sm">Search across:</Text>
                    <Stack mt="sm">
                      <Switch
                        label="All"
                        {...switchProps("name")}
                        checked={allChecked}
                        onChange={() =>
                          setFilterOptions({
                            name: !allChecked,
                            desc: !allChecked,
                            ingredients: !allChecked,
                            instructions: !allChecked,
                          })
                        }
                        sx={{ ".mantine-Switch-input:hover": { cursor: "pointer" } }}
                      />
                      <Switch label="Name" {...switchProps("name")} />
                      <Switch label="Description" {...switchProps("desc")} />
                      <Switch label="Ingredients" {...switchProps("ingredients")} />
                      <Switch label="Instructions" {...switchProps("instructions")} />
                    </Stack>
                  </form>
                </Popover>
              }
            />
          }
          styles={{
            inner: { float: "left" },
            leftIcon: { marginRight: "auto" },
            rightIcon: {
              marginLeft: 0,
              opacity: filterExpanded ? 1 : 0,
              userSelect: filterExpanded ? "auto" : "none",
              pointerEvents: filterExpanded ? "auto" : "none",
              transitionDuration: `${theme.other.transitionDuration}ms`,
            },
          }}
          hoverOverride={filterExpanded}
          border
        />
      </div>
      <FlipButton
        component={Link}
        to={`/create?${searchParams}`}
        size="md"
        onClick={() => setSidebarOpened(false)}
        sx={{ transitionDuration: `${theme.other.transitionDuration}ms` }}
        length={theme.other.buttonLength}
        border
        square
      >
        <PlusCircledIcon width={30} height={30} />
      </FlipButton>
    </Paper>
  );
};
