import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  MultiSelect,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";
import { ClipboardEventHandler, FC, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { FlipButton } from "@/components/Elements";
import { useCategories } from "@/features/categories";
import { useCreateRecipe, useRecipes, useScrape, useUpdateRecipe } from "@/features/recipes";
import { useGetRecipeWithShareId } from "@/features/share";
import { usePrevious } from "@/hooks";
import { Category, PutRecipeRequest } from "@/lib/fetch";
import { UNSET } from "@/utils/common";

const baseForm = {
  name: "",
  desc: "",
  imgSrc: "",
  cookTime: "",
  yields: "",
  categories: [] as string[],
  ingredients: "",
  instructions: "",
  // ingredients: "<ul><li></li></ul>",
  // instructions: "<ol><li></li></ol>",
  urlToScrape: "",
};

export const CreateRecipeForm: FC = () => {
  const initialValues = useRef({ ...baseForm });
  const form = useForm({ initialValues: { ...initialValues.current } });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shareId = searchParams.get("shareId") ?? "";
  const selectedRecipeId = +(useParams().recipeId ?? UNSET);
  const location = useLocation();
  // Need both so as to keep text updated during animation when navigating away from /edit
  const editMode = location.pathname.endsWith("edit");
  const prevEditMode = usePrevious(editMode);
  const formVisible = location.pathname.endsWith("create") || editMode;

  const { data: recipes } = useRecipes();
  const { data: categories } = useCategories();
  const { data: sharedRecipe } = useGetRecipeWithShareId(shareId);
  const updateRecipeMutation = useUpdateRecipe();
  const createRecipeMutation = useCreateRecipe();
  const scrapeQuery = useScrape(form.values.urlToScrape);

  const createRecipeLoading = useMemo(
    () => createRecipeMutation.isLoading || updateRecipeMutation.isLoading,
    [createRecipeMutation.isLoading, updateRecipeMutation.isLoading],
  );

  const requestInProgress = useMemo(
    () => createRecipeLoading || scrapeQuery.isLoading,
    [createRecipeLoading, scrapeQuery.isLoading],
  );

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    scrapeQuery.isSuccess && form.setValues({ ...form.values, ...scrapeQuery.data });
  }, [scrapeQuery.isSuccess]);

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
          yields: `${selectedRecipe.yields ?? ""}`,
          categories:
            selectedRecipe?.categories?.map(c => (categories?.get(c) as Category).name) ?? [],
          ingredients: "",
          instructions: "",
          urlToScrape: "",
        });
    } else if (sharedRecipe) {
      initialValues.current = { ...sharedRecipe };
    } else {
      initialValues.current = { ...baseForm };
    }
    form.setValues({ ...initialValues.current });
  }, [recipes, sharedRecipe, formVisible, editMode]);

  const valueChanged = (
    initialValue: keyof PutRecipeRequest,
    newValue: PutRecipeRequest[keyof PutRecipeRequest],
  ) =>
    // Value is list, new value altered
    (typeof newValue === "object" && JSON.stringify(newValue) !== JSON.stringify(initialValue)) ||
    // Value initially present, new value altered
    (initialValue && newValue !== initialValue) ||
    // Value not initially present, new value present
    (initialValue === undefined && newValue);

  const handleSubmit = (values: typeof form.values) => {
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
      const initialValue = initialValues.current[k as keyof PutRecipeRequest];
      if (valueChanged(initialValue, v)) {
        editMode
          ? updateRecipeMutation
              .mutateAsync({ recipe, recipeId: selectedRecipeId })
              .then(() => navigate(`/${location.search}`))
          : createRecipeMutation.mutateAsync(recipe).then(() => navigate(`/${location.search}`));
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
      title={`${editMode || prevEditMode ? "Edit" : "New"} Recipe`}
      opened={formVisible}
      onClose={() => {
        searchParams.delete("shareId");
        // Relative paths don't want to work sad
        navigate(`${location.pathname.replaceAll(/\/(edit|create)/g, "") || "/"}?${searchParams}`);
      }}
      overflow="inside"
      centered
    >
      <Box
        component="form"
        onSubmit={form.onSubmit(handleSubmit)}
        sx={theme => ({ marginRight: theme.spacing.lg })}
      >
        <Stack sx={{ position: "relative" }}>
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
          <TextInput label="Yield" placeholder="4 servings" {...form.getInputProps("yields")} />
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
        </Stack>
        <Group position="right" mt="md">
          <Button
            variant="outline"
            size="md"
            color={scrapeQuery.isError ? "red" : ""}
            onClick={scrapeQuery.refetch}
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
            loading={createRecipeLoading}
            disabled={form.values.name === "" || requestInProgress}
            sx={theme => ({ transitionDuration: `${theme.other.transitionDuration}ms` })}
            border
          >
            {editMode || prevEditMode ? "Update" : "Save"} Recipe
          </FlipButton>
        </Group>
      </Box>
    </Modal>
  );
};
