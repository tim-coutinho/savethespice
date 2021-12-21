import { ActionIcon, Burger, Group, Popover, Switch, Text, TextInput, Title } from "@mantine/core";
import { useBooleanToggle } from "@mantine/hooks";
import { GearIcon, MagnifyingGlassIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { MouseEventHandler, ReactElement, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { transitionDuration, View } from "../lib/common";
import {
  categoriesState,
  currentViewState,
  filterOptionsState,
  filterState,
  selectedCategoryIdState,
} from "../store";
import { FlipButton } from "./FlipButton";
import "./Header.scss";

interface HeaderProps {
  handleViewChange: (source: typeof View[keyof typeof View]) => MouseEventHandler;
}

export default ({ handleViewChange }: HeaderProps): ReactElement => {
  const [popoverOpened, togglePopoverOpened] = useBooleanToggle(false);
  const [filterFocused, toggleFilterFocused] = useBooleanToggle(false);
  const ref = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useRecoilState(filterState);
  const [filterOptions, setFilterOptions] = useRecoilState(filterOptionsState);
  const currentView = useRecoilValue(currentViewState);
  const allCategories = useRecoilValue(categoriesState);
  const selectedCategoryId = useRecoilValue(selectedCategoryIdState);

  const filterExpanded = filter !== "" || popoverOpened || filterFocused;
  const allChecked = Object.values(filterOptions).every(v => v);
  const switchProps = (optionName: keyof typeof filterOptions) => ({
    checked: filterOptions[optionName],
    onChange: () => setFilterOptions(prev => ({ ...prev, [optionName]: !prev[optionName] })),
    sx: { ".mantine-Switch-input:hover": { cursor: "pointer" } },
  });

  return (
    <Group
      position="apart"
      sx={theme => ({
        padding: theme.spacing.sm,
        borderBottom: `1px solid ${theme.colors.gray[7]}`,
        ".mantine-TextInput-rightSection": {
          opacity: filterExpanded ? 1 : 0,
          transitionDuration: `${transitionDuration}ms`,
        },
        h4: { opacity: filterExpanded ? 0 : 1 },
      })}
      noWrap
    >
      <FlipButton
        size="md"
        component="div"
        onClick={handleViewChange(View.SIDEBAR)}
        sx={theme => ({
          transitionDuration: `${transitionDuration}ms`,
          ".mantine-Burger-burger:not(.mantine-Burger-opened), .mantine-Burger-burger::before, .mantine-Burger-burger::after":
            { backgroundColor: theme.white },
          "&:hover": {
            ".mantine-Burger-burger:not(.mantine-Burger-opened), .mantine-Burger-burger::before, .mantine-Burger-burger::after":
              { backgroundColor: theme.colors[theme.primaryColor][6] },
          },
        })}
        length={40}
        border
        square
      >
        <Burger opened={currentView === View.SIDEBAR} />
      </FlipButton>
      <Title
        order={4}
        sx={theme => ({
          position: "absolute",
          transitionDuration: `${transitionDuration}ms`,
          left: 75,
          color: theme.colors[theme.primaryColor][6],
        })}
      >
        {allCategories.get(selectedCategoryId)?.name ?? "All Recipes"}
      </Title>
      <FlipButton
        size="md"
        component="div"
        onClick={() => ref.current?.focus()}
        sx={{
          padding: 5,
          transition: `${transitionDuration}ms`,
          flexBasis: filterExpanded ? "200px" : "40px",
          marginLeft: "auto",
          overflowX: "hidden",
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
                  <Group direction="column" mt="sm">
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
                  </Group>
                </form>
              </Popover>
            }
            rightSectionWidth={25}
            sx={{
              transitionDuration: `${transitionDuration}ms`,
            }}
            styles={theme => ({
              input: {
                backgroundColor: theme.white,
                border: "none",
                color: theme.colors.dark[6],
                paddingLeft: 5,
              },
            })}
          />
        }
        styles={{
          inner: { float: "left" },
          leftIcon: { marginRight: "auto" },
          rightIcon: {
            marginLeft: 0,
            width: filterExpanded ? "100%" : "0%",
            transitionDuration: `${transitionDuration}ms`,
          },
        }}
        hoverOverride={filterExpanded}
        border
      />
      <FlipButton
        size="md"
        onClick={handleViewChange(View.ADD)}
        sx={{ transitionDuration: `${transitionDuration}ms` }}
        length={40}
        border
        square
      >
        <PlusCircledIcon width={30} height={30} />
      </FlipButton>
    </Group>
  );
};
