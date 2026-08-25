import { generatedApi } from '@/shared/api/generated/api';

export type MealRecipeIngredient = {
  id: string;
  name: string;
  quantity: string | null;
};

export type MealRecipe = {
  id: string;
  familyId: string;
  createdById: string;
  name: string;
  instructions: string | null;
  archived: boolean;
  version: number;
  ingredients: MealRecipeIngredient[];
  dietaryLabels: Array<{ id: string; label: string }>;
  createdAt: string;
  updatedAt: string;
};

export type RecipeIngredientInput = {
  name: string;
  quantity?: string;
};

export type CreateRecipeInput = {
  name: string;
  instructions?: string;
  ingredients: RecipeIngredientInput[];
  dietaryLabels?: string[];
};

export type UpdateRecipeInput = {
  name?: string;
  instructions?: string | null;
  ingredients?: RecipeIngredientInput[];
  dietaryLabels?: string[];
};

export type MealPlan = {
  id: string;
  familyId: string;
  createdById: string;
  recipeId: string;
  plannedFor: string;
  mealSlot: string;
  servings: number;
  version: number;
  recipe: MealRecipe;
  createdAt: string;
  updatedAt: string;
};

export type CreateMealPlanInput = {
  plannedFor: string;
  mealSlot: string;
  recipeId: string;
  servings?: number;
};

export type UpdateMealPlanInput = Partial<CreateMealPlanInput>;

const mealsApi = generatedApi.injectEndpoints({
  endpoints: (build) => ({
    listMealRecipes: build.query<MealRecipe[], void>({
      query: () => '/api/v1/families/me/recipes',
      providesTags: ['meals'],
    }),
    listArchivedMealRecipes: build.query<MealRecipe[], void>({
      query: () => '/api/v1/families/me/recipes/archived',
      providesTags: ['meals'],
    }),
    createMealRecipe: build.mutation<MealRecipe, CreateRecipeInput>({
      query: (body) => ({
        url: '/api/v1/families/me/recipes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['meals'],
    }),
    updateMealRecipe: build.mutation<
      MealRecipe,
      { id: string; body: UpdateRecipeInput; version?: number }
    >({
      query: ({ id, body, version }) => ({
        url: `/api/v1/families/me/recipes/${id}`,
        method: 'PATCH',
        body,
        headers: version === undefined ? undefined : { 'If-Match': String(version) },
      }),
      invalidatesTags: ['meals'],
    }),
    archiveMealRecipe: build.mutation<void, { id: string; version?: number }>({
      query: ({ id, version }) => ({
        url: `/api/v1/families/me/recipes/${id}`,
        method: 'DELETE',
        headers: version === undefined ? undefined : { 'If-Match': String(version) },
      }),
      invalidatesTags: ['meals'],
    }),
    restoreMealRecipe: build.mutation<MealRecipe, { id: string; version?: number }>({
      query: ({ id, version }) => ({
        url: `/api/v1/families/me/recipes/${id}/restore`,
        method: 'POST',
        headers: version === undefined ? undefined : { 'If-Match': String(version) },
      }),
      invalidatesTags: ['meals'],
    }),
    listMealPlans: build.query<MealPlan[], { from?: string; to?: string }>({
      query: ({ from, to }) => ({
        url: '/api/v1/families/me/recipes/plans',
        params: { from, to },
      }),
      providesTags: ['meals'],
    }),
    createMealPlan: build.mutation<MealPlan, CreateMealPlanInput>({
      query: (body) => ({
        url: '/api/v1/families/me/recipes/plans',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['meals'],
    }),
    updateMealPlan: build.mutation<
      MealPlan,
      { id: string; body: UpdateMealPlanInput; version?: number }
    >({
      query: ({ id, body, version }) => ({
        url: `/api/v1/families/me/recipes/plans/${id}`,
        method: 'PATCH',
        body,
        headers: version === undefined ? undefined : { 'If-Match': String(version) },
      }),
      invalidatesTags: ['meals'],
    }),
    deleteMealPlan: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/families/me/recipes/plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['meals'],
    }),
    generateMealShopping: build.mutation<unknown, { planId: string; listId: string }>({
      query: ({ planId, listId }) => ({
        url: `/api/v1/families/me/recipes/plans/${planId}/generate-shopping`,
        method: 'POST',
        body: { listId },
      }),
      invalidatesTags: ['meals', 'shopping'],
    }),
  }),
});

export const {
  useArchiveMealRecipeMutation,
  useCreateMealPlanMutation,
  useCreateMealRecipeMutation,
  useDeleteMealPlanMutation,
  useGenerateMealShoppingMutation,
  useListArchivedMealRecipesQuery,
  useListMealPlansQuery,
  useListMealRecipesQuery,
  useRestoreMealRecipeMutation,
  useUpdateMealPlanMutation,
  useUpdateMealRecipeMutation,
} = mealsApi;
