import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  MultiSelect,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/hooks";
// import { RichTextEditor } from "@mantine/rte";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { ClipboardEventHandler, ReactElement, useEffect, useMemo, useRef } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { UNSET, View } from "../lib/common";
import { addRecipe, FormFields, scrape } from "../lib/operations";
import { currentViewState, selectedRecipeIdState } from "../store";
import { Category, Recipe } from "../types";

import { FlipButton } from "./FlipButton";
import { useMutation, useQuery, useQueryClient } from "react-query";

const baseForm = {
  name: "",
  desc: "",
  imgSrc: "",
  cookTime: "",
  yield: "",
  categories: [] as string[],
  ingredients: "",
  instructions: "",
  // ingredients: "<ul><li></li></ul>",
  // instructions: "<ol><li></li></ol>",
  urlToScrape: "",
};

interface AddFormProps {
  editMode: boolean;
}

export default ({ editMode }: AddFormProps): ReactElement => {
  const queryClient = useQueryClient();
  const [currentView, setCurrentView] = useRecoilState(currentViewState);
  const recipes = queryClient.getQueryData<Map<number, Recipe>>("recipes");
  const categories = queryClient.getQueryData<Map<number, Category>>("categories");
  const selectedRecipeId = useRecoilValue(selectedRecipeIdState);
  const initialValues = useRef({ ...baseForm });
  const form = useForm({ initialValues: { ...initialValues.current } });

  const addRecipeMutation = useMutation(
    recipe => addRecipe(recipe, editMode ? selectedRecipeId : undefined),
    {
      onMutate: async (recipe: FormFields) => {
        await queryClient.cancelQueries("recipes");
        await queryClient.cancelQueries("categories");

        const previousRecipes = queryClient.getQueryData<Map<number, Recipe>>("recipes");
        const previousCategories = queryClient.getQueryData<Map<number, Category>>("categories");

        if (previousCategories) {
          const newCategories = new Map(previousCategories);
          const categoryNamesToIds = new Map(
            Array.from(newCategories).map(([id, { name }]) => [name, id]),
          );
          recipe.categories.forEach(c => {
            if (!categoryNamesToIds.has(c)) {
              const categoryId = Math.random();
              newCategories.set(Math.random(), {
                categoryId,
                name: c,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString(),
                userId: "",
              });
              categoryNamesToIds.set(c, categoryId);
            }
          });
          queryClient.setQueryData("categories", newCategories);

          if (previousRecipes) {
            const newRecipes = new Map(previousRecipes);
            const recipeId = Math.random();
            newRecipes.set(recipeId, {
              recipeId,
              ...recipe,
              categories: recipe.categories.map(c => categoryNamesToIds.get(c) || UNSET),
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString(),
              userId: "",
            });
            queryClient.setQueryData("recipes", newRecipes);
          }
        }

        setCurrentView(View.HOME);
        return { previousRecipes, previousCategories };
      },
      onSuccess: data => {
        const previousRecipes = queryClient.getQueryData<Map<number, Recipe>>("recipes");
        const previousCategories = queryClient.getQueryData<Map<number, Category>>("categories");
        previousRecipes &&
          queryClient.setQueryData("recipes", previousRecipes.set(data.recipeId, data));
        data.newCategories &&
          previousCategories &&
          queryClient.setQueryData("categories", () => {
            data.newCategories?.forEach(c => previousCategories.set(c.categoryId, c));
            return new Map(previousCategories);
          });
      },
      onError: (_, __, context) => {
        context?.previousRecipes && queryClient.setQueryData("recipes", context.previousRecipes);
        context?.previousCategories &&
          queryClient.setQueryData("categories", context.previousCategories);
      },
    },
  );
  const scrapeQuery = useQuery(
    ["scrape", form.values.urlToScrape],
    () => scrape(form.values.urlToScrape),
    {
      enabled: false,
      onSuccess: data => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        form.setValues({ ...form.values, ...data });
      },
    },
  );

  const formVisible = useMemo(() => currentView === View.ADD, [currentView]);

  const requestInProgress = useMemo(
    () => addRecipeMutation.isLoading || scrapeQuery.isLoading,
    [addRecipeMutation.status, scrapeQuery.status],
  );

  useEffect(() => {
    if (!formVisible) {
      return;
    }
    if (editMode) {
      const selectedRecipe = recipes?.get(selectedRecipeId);
      selectedRecipe &&
        (initialValues.current = {
          name: selectedRecipe.name,
          desc: selectedRecipe.desc ?? "",
          imgSrc: selectedRecipe.imgSrc ?? "",
          cookTime: selectedRecipe.cookTime ?? "",
          yield: `${selectedRecipe.yield ?? ""}`,
          categories:
            selectedRecipe?.categories?.map(c => (categories?.get(c) as Category).name) ?? [],
          ingredients: "",
          instructions: "",
          urlToScrape: "",
        });
    } else {
      initialValues.current = { ...baseForm };
    }
    form.setValues({ ...initialValues.current });
  }, [formVisible, editMode]);

  const valueChanged = (initialValue: keyof FormFields, newValue: FormFields[keyof FormFields]) =>
    // Value is list, new value altered
    (typeof newValue === "object" && JSON.stringify(newValue) !== JSON.stringify(initialValue)) ||
    // Value initially present, new value altered
    (initialValue && newValue !== initialValue) ||
    // Value not initially present, new value present
    (initialValue === undefined && newValue);

  const handleSubmit = async (values: typeof form.values) => {
    const recipe = {
      ...values,
      ingredients: [values.ingredients],
      instructions: [values.instructions],
      urlToScrape: undefined,
      // ingredients: values.ingredients?.map(i => i.trim()).filter(item => item !== ""),
      // instructions: values.instructions?.map(i => i.trim()).filter(item => item !== ""),
    };

    for (const [k, v] of Object.entries(recipe)) {
      // No op if nothing to update
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      let initialValue = initialValues.current[k as keyof FormFields];
      if (k === "categories" && (initialValue as string[])[0] !== "") {
        // Categories holds IDs, map to category names
        initialValue = (initialValue as NonNullable<typeof recipe.categories>).map(
          c => (categories?.get(+c) as Category).name,
        );
      }
      if (valueChanged(initialValue, v)) {
        await addRecipeMutation.mutateAsync(recipe);
        break;
      }
    }
  };

  const handlePaste: ClipboardEventHandler<HTMLDivElement> = e => {
    const file = e.clipboardData.files[0];
    if (!file) {
      return;
    }
    const fr = new FileReader();
    fr.addEventListener("load", () => form.setFieldValue("imgSrc", fr.result as string));
    fr.readAsDataURL(e.clipboardData.files[0]);
  };

  return (
    <Modal
      title={`${editMode ? "Edit" : "New"} Recipe`}
      opened={formVisible}
      onClose={() => setCurrentView(View.HOME)}
      overflow="inside"
      centered
    >
      <Box
        component="form"
        onSubmit={form.onSubmit(handleSubmit)}
        sx={theme => ({ marginRight: theme.spacing.lg })}
      >
        <Group direction="column" sx={{ position: "relative" }} grow>
          <TextInput
            label="Recipe Name"
            placeholder="Saag Feta"
            maxLength={200}
            autoFocus
            {...form.getInputProps("name")}
          />
          <TextInput
            label="Description"
            placeholder="Brong's favorite"
            {...form.getInputProps("desc")}
          />
          <TextInput
            label="Image URL"
            placeholder="https://assets.bonappetit.com/photos/5c8a90c7623f1366f6166492/1:1/w_2240,c_limit/Saag-Paneer-but-with-Feta.jpg"
            onPaste={handlePaste}
            {...form.getInputProps("imgSrc")}
          />
          <TextInput label="Cook Time (min)" placeholder="30" {...form.getInputProps("cookTime")} />
          <TextInput label="Yield" placeholder="4 servings" {...form.getInputProps("yield")} />
          <MultiSelect
            label="Categories"
            placeholder="Select and/or create"
            data={Array.from(categories || [])
              .sort(([, { name: name1 }], [, { name: name2 }]) =>
                name1.toLowerCase() >= name2.toLowerCase() ? 1 : -1,
              )
              .map(([, c]) => c.name)}
            getCreateLabel={v => `+ ${v}`}
            creatable
            searchable
            clearable
            {...form.getInputProps("categories")}
          />
          <TextInput
            label="Ingredients"
            placeholder="Feta, spinach, ginger"
            {...form.getInputProps("ingredients")}
          />
          <TextInput
            label="Instructions"
            placeholder="Blend spinach, add feta"
            {...form.getInputProps("instructions")}
          />
          {/*<Text size="sm" sx={{ "&:hover": { cursor: "default" } }}>*/}
          {/*  Ingredients*/}
          {/*</Text>*/}
          {/*<RichTextEditor*/}
          {/*  value={form.values.ingredients}*/}
          {/*  onChange={value => {*/}
          {/*    console.log(value);*/}
          {/*    // if (!value.includes("<li>")) {*/}
          {/*    //   form.setFieldValue("ingredients", "<ul><li></li></ul>");*/}
          {/*    // } else {*/}
          {/*    form.setFieldValue("ingredients", value);*/}
          {/*    // }*/}
          {/*  }}*/}
          {/*  controls={[]}*/}
          {/*  styles={{ toolbar: { display: "none" } }}*/}
          {/*/>*/}
          {/*<Text size="sm" sx={{ "&:hover": { cursor: "default" } }}>*/}
          {/*  Instructions*/}
          {/*</Text>*/}
          {/*<RichTextEditor*/}
          {/*  value={form.values.instructions}*/}
          {/*  onChange={value => form.setFieldValue("instructions", value)}*/}
          {/*  controls={[]}*/}
          {/*  styles={{ toolbar: { display: "none" } }}*/}
          {/*/>*/}
          <Title order={4} align="center">
            OR
          </Title>
          <TextInput
            label="Add by URL"
            placeholder="https://www.bonappetit.com/recipe/saag-paneer-but-with-feta"
            name="scrapeUrl"
            {...form.getInputProps("urlToScrape")}
          />
          <LoadingOverlay visible={scrapeQuery.isLoading} sx={({ fn }) => fn.cover(-10)} />
        </Group>
        <Group position="right" mt="md">
          <Button
            variant="outline"
            size="md"
            color={scrapeQuery.isError ? "red" : ""}
            onClick={() => scrapeQuery.refetch()}
            loading={scrapeQuery.isLoading}
            disabled={form.values.urlToScrape === "" || requestInProgress}
            leftIcon={
              scrapeQuery.isSuccess ? (
                <CheckCircledIcon />
              ) : scrapeQuery.isError ? (
                <CrossCircledIcon />
              ) : (
                ""
              )
            }
            sx={theme => ({ transitionDuration: `${theme.other.transitionDuration}ms` })}
          >
            Scrape
          </Button>
          <FlipButton
            type="submit"
            size="md"
            loading={addRecipeMutation.isLoading}
            disabled={form.values.name === "" || requestInProgress}
            sx={theme => ({ transitionDuration: `${theme.other.transitionDuration}ms` })}
            border
          >
            Save Recipe
          </FlipButton>
        </Group>
      </Box>
    </Modal>
  );
};
