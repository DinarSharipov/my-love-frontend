import {
  Archive,
  CalendarDays,
  ChefHat,
  Edit3,
  ListPlus,
  Plus,
  RotateCcw,
  ShoppingBasket,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import type { MealPlan, MealRecipe } from '@/entities/meals';
import {
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
} from '@/entities/meals';
import type { ShoppingList } from '@/entities/shopping';
import { getApiErrorMessage, useListsQuery } from '@/shared/api';
import {
  AnimatedPanel,
  AsyncState,
  Button,
  DatePicker,
  HeaderPanel,
  Input,
  PageLayout,
  Select,
  Tabs,
  Textarea,
} from '@/shared/ui';

type Tab = 'recipes' | 'plans';

type RecipeDraft = {
  name: string;
  instructions: string;
  ingredients: string;
  dietaryLabels: string;
};

type PlanDraft = {
  plannedFor: string;
  mealSlot: string;
  recipeId: string;
  servings: string;
};

const emptyRecipeDraft: RecipeDraft = {
  name: '',
  instructions: '',
  ingredients: '',
  dietaryLabels: '',
};

const emptyPlanDraft: PlanDraft = {
  plannedFor: '',
  mealSlot: '',
  recipeId: '',
  servings: '1',
};

const dateInput = (date: Date) => date.toISOString().slice(0, 10);
const monthStart = () => {
  const now = new Date();
  return dateInput(new Date(now.getFullYear(), now.getMonth(), 1));
};
const monthEnd = () => {
  const now = new Date();
  return dateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0));
};

const recipeToDraft = (recipe: MealRecipe): RecipeDraft => ({
  name: recipe.name,
  instructions: recipe.instructions ?? '',
  ingredients: recipe.ingredients
    .map(
      (ingredient) => `${ingredient.name}${ingredient.quantity ? ` | ${ingredient.quantity}` : ''}`,
    )
    .join('\n'),
  dietaryLabels: recipe.dietaryLabels.map((label) => label.label).join(', '),
});

const parseIngredients = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...quantityParts] = line.split('|');
      return {
        name: name.trim(),
        quantity: quantityParts.join('|').trim() || undefined,
      };
    })
    .filter((ingredient) => ingredient.name);

const planToDraft = (plan: MealPlan): PlanDraft => ({
  plannedFor: plan.plannedFor.slice(0, 10),
  mealSlot: plan.mealSlot,
  recipeId: plan.recipeId,
  servings: String(plan.servings),
});

export const MealsPage = () => {
  const [tab, setTab] = useState<Tab>('recipes');
  const [showArchived, setShowArchived] = useState(false);
  const [recipeDraft, setRecipeDraft] = useState<RecipeDraft>(emptyRecipeDraft);
  const [editingRecipe, setEditingRecipe] = useState<MealRecipe | null>(null);
  const [planDraft, setPlanDraft] = useState<PlanDraft>(emptyPlanDraft);
  const [editingPlan, setEditingPlan] = useState<MealPlan | null>(null);
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(monthEnd);
  const [shoppingListId, setShoppingListId] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recipesQuery = useListMealRecipesQuery();
  const archivedRecipesQuery = useListArchivedMealRecipesQuery();
  const plansQuery = useListMealPlansQuery({ from: from || undefined, to: to || undefined });
  const shoppingQuery = useListsQuery();
  const [createRecipe, createRecipeState] = useCreateMealRecipeMutation();
  const [updateRecipe, updateRecipeState] = useUpdateMealRecipeMutation();
  const [archiveRecipe] = useArchiveMealRecipeMutation();
  const [restoreRecipe] = useRestoreMealRecipeMutation();
  const [createPlan, createPlanState] = useCreateMealPlanMutation();
  const [updatePlan, updatePlanState] = useUpdateMealPlanMutation();
  const [deletePlan] = useDeleteMealPlanMutation();
  const [generateShopping] = useGenerateMealShoppingMutation();

  const recipes = showArchived ? (archivedRecipesQuery.data ?? []) : (recipesQuery.data ?? []);
  const recipesState = showArchived ? archivedRecipesQuery : recipesQuery;
  const activeRecipes = recipesQuery.data ?? [];
  const shoppingLists = useMemo(
    () =>
      ((shoppingQuery.data as ShoppingList[] | undefined) ?? []).filter((list) => !list.archived),
    [shoppingQuery.data],
  );
  const effectiveShoppingListId = shoppingListId || shoppingLists[0]?.id || '';

  useEffect(() => {
    if (shoppingListId && shoppingLists.some((list) => list.id === shoppingListId)) return;
    if (shoppingLists[0]) setShoppingListId(shoppingLists[0].id);
  }, [shoppingListId, shoppingLists]);

  const runAction = async (key: string, action: () => Promise<unknown>, fallback: string) => {
    setError(null);
    setPendingAction(key);
    try {
      await action();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, fallback));
    } finally {
      setPendingAction(null);
    }
  };

  const submitRecipe = async (event: FormEvent) => {
    event.preventDefault();
    const ingredients = parseIngredients(recipeDraft.ingredients);
    if (!recipeDraft.name.trim() || !ingredients.length) {
      setError('Укажите название рецепта и хотя бы один ингредиент.');
      return;
    }
    const body = {
      name: recipeDraft.name.trim(),
      instructions: recipeDraft.instructions.trim() || undefined,
      ingredients,
      dietaryLabels: recipeDraft.dietaryLabels
        .split(',')
        .map((label) => label.trim())
        .filter(Boolean),
    };
    await runAction(
      'recipe-submit',
      async () => {
        if (editingRecipe) {
          await updateRecipe({
            id: editingRecipe.id,
            body,
            version: editingRecipe.version,
          }).unwrap();
        } else {
          await createRecipe(body).unwrap();
        }
        setRecipeDraft(emptyRecipeDraft);
        setEditingRecipe(null);
      },
      editingRecipe ? 'Не удалось обновить рецепт' : 'Не удалось создать рецепт',
    );
  };

  const submitPlan = async (event: FormEvent) => {
    event.preventDefault();
    const servings = Math.max(1, Number(planDraft.servings) || 1);
    if (!planDraft.plannedFor || !planDraft.mealSlot.trim() || !planDraft.recipeId) {
      setError('Укажите дату, приём пищи и рецепт.');
      return;
    }
    const body = {
      plannedFor: planDraft.plannedFor,
      mealSlot: planDraft.mealSlot.trim(),
      recipeId: planDraft.recipeId,
      servings,
    };
    await runAction(
      'plan-submit',
      async () => {
        if (editingPlan) {
          await updatePlan({ id: editingPlan.id, body, version: editingPlan.version }).unwrap();
        } else {
          await createPlan(body).unwrap();
        }
        setPlanDraft({ ...emptyPlanDraft, recipeId: activeRecipes[0]?.id ?? '' });
        setEditingPlan(null);
      },
      editingPlan ? 'Не удалось обновить план' : 'Не удалось добавить блюдо в план',
    );
  };

  const resetRecipe = () => {
    setRecipeDraft(emptyRecipeDraft);
    setEditingRecipe(null);
  };

  const resetPlan = () => {
    setPlanDraft({ ...emptyPlanDraft, recipeId: activeRecipes[0]?.id ?? '' });
    setEditingPlan(null);
  };

  return (
    <PageLayout>
      <HeaderPanel
        left={
          <>
            <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
              Семейная кухня
            </p>
            <h1 className="text-text mt-1 flex items-center gap-2 text-2xl font-semibold sm:text-3xl">
              <ChefHat aria-hidden="true" className="text-primary-neon size-7" />
              Рецепты и план питания
            </h1>
            <p className="text-muted-text mt-1 text-sm">
              Храните семейные рецепты и заранее планируйте блюда на нужные даты.
            </p>
          </>
        }
      />

      {error && (
        <AnimatedPanel className="border-neon-pink/60 p-4" role="alert">
          <div className="flex items-start justify-between gap-3">
            <p className="text-neon-pink text-sm">{error}</p>
            <Button
              aria-label="Закрыть сообщение"
              icon={<X aria-hidden="true" className="size-4" />}
              onClick={() => setError(null)}
              size="s"
            />
          </div>
        </AnimatedPanel>
      )}

      <Tabs
        activeId={tab}
        items={[
          {
            icon: <ListPlus aria-hidden="true" className="size-4" />,
            id: 'recipes',
            label: 'Рецепты',
          },
          {
            icon: <CalendarDays aria-hidden="true" className="size-4" />,
            id: 'plans',
            label: 'План питания',
          },
        ]}
        onChange={(id) => setTab(id as Tab)}
      >
        {tab === 'recipes' ? (
          <>
            <AnimatedPanel className="p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-text text-lg font-semibold">
                    {editingRecipe ? 'Редактирование рецепта' : 'Новый рецепт'}
                  </h2>
                  <p className="text-muted-text mt-1 text-sm">
                    Ингредиенты вводятся по одному на строку: <code>название | количество</code>.
                  </p>
                </div>
                {editingRecipe && (
                  <Button onClick={resetRecipe} size="s">
                    Отменить
                  </Button>
                )}
              </div>
              <form className="grid gap-gap md:grid-cols-2" onSubmit={submitRecipe}>
                <Input
                  className="md:col-span-2"
                  label="Название"
                  maxLength={160}
                  onChange={(event) =>
                    setRecipeDraft((draft) => ({ ...draft, name: event.target.value }))
                  }
                  required
                  value={recipeDraft.name}
                />
                <Textarea
                  className="md:col-span-2"
                  label="Инструкция"
                  maxLength={10000}
                  onChange={(event) =>
                    setRecipeDraft((draft) => ({ ...draft, instructions: event.target.value }))
                  }
                  value={recipeDraft.instructions}
                />
                <Textarea
                  className="md:col-span-2"
                  label="Ингредиенты"
                  onChange={(event) =>
                    setRecipeDraft((draft) => ({ ...draft, ingredients: event.target.value }))
                  }
                  placeholder={'Макароны | 300 г\nСыр | 100 г'}
                  required
                  value={recipeDraft.ingredients}
                />
                <Input
                  className="md:col-span-2"
                  label="Метки питания"
                  onChange={(event) =>
                    setRecipeDraft((draft) => ({ ...draft, dietaryLabels: event.target.value }))
                  }
                  placeholder="Например: быстро, без мяса"
                  value={recipeDraft.dietaryLabels}
                />
                <div className="md:col-span-2">
                  <Button
                    disabled={createRecipeState.isLoading || updateRecipeState.isLoading}
                    type="submit"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    {editingRecipe ? 'Сохранить рецепт' : 'Добавить рецепт'}
                  </Button>
                </div>
              </form>
            </AnimatedPanel>

            <AnimatedPanel className="p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-text text-lg font-semibold">
                    {showArchived ? 'Архив рецептов' : 'Активные рецепты'}
                  </h2>
                  <p className="text-muted-text mt-1 text-sm">{recipes.length} рецептов</p>
                </div>
                <Button onClick={() => setShowArchived((value) => !value)} size="s">
                  {showArchived ? (
                    <RotateCcw aria-hidden="true" className="size-4" />
                  ) : (
                    <Archive aria-hidden="true" className="size-4" />
                  )}
                  {showArchived ? 'К активным' : 'Открыть архив'}
                </Button>
              </div>
              <AsyncState
                empty={
                  !recipesState.isLoading ? (
                    <p className="text-muted-text py-8 text-center text-sm">
                      {showArchived
                        ? 'Архив рецептов пуст.'
                        : 'Рецептов пока нет. Добавьте первый выше.'}
                    </p>
                  ) : undefined
                }
                error={recipesState.error}
                hasData={Boolean(recipesState.data)}
                isLoading={recipesState.isLoading}
                loading={
                  <p className="text-muted-text py-8 text-center text-sm">Загружаем рецепты…</p>
                }
                onRetry={() => recipesState.refetch()}
              >
                <div className="grid gap-gap md:grid-cols-2">
                  {recipes.map((recipe) => (
                    <article
                      className="border-border bg-elevated/30 min-w-0 rounded-2xl border p-5"
                      key={recipe.id}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-text truncate text-lg font-semibold">
                            {recipe.name}
                          </h3>
                          <p className="text-muted-text mt-1 text-xs">
                            Обновлён {new Date(recipe.updatedAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <ChefHat aria-hidden="true" className="text-primary-neon size-5 shrink-0" />
                      </div>
                      {recipe.dietaryLabels.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {recipe.dietaryLabels.map((label) => (
                            <span
                              className="border-primary-neon/40 text-cyber-cyan rounded-full border px-2 py-1 text-xs"
                              key={label.id}
                            >
                              {label.label}
                            </span>
                          ))}
                        </div>
                      )}
                      <ul className="text-muted-text mt-4 space-y-1 text-sm">
                        {recipe.ingredients.map((ingredient) => (
                          <li className="flex justify-between gap-3" key={ingredient.id}>
                            <span>{ingredient.name}</span>
                            {ingredient.quantity && (
                              <span className="text-text shrink-0">{ingredient.quantity}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                      {recipe.instructions && (
                        <p className="text-muted-text mt-4 whitespace-pre-line text-sm">
                          {recipe.instructions}
                        </p>
                      )}
                      <div className="mt-5 flex flex-wrap gap-2">
                        {showArchived ? (
                          <Button
                            disabled={Boolean(pendingAction)}
                            onClick={() =>
                              runAction(
                                `restore-recipe:${recipe.id}`,
                                () =>
                                  restoreRecipe({
                                    id: recipe.id,
                                    version: recipe.version,
                                  }).unwrap(),
                                'Не удалось восстановить рецепт',
                              )
                            }
                            size="s"
                          >
                            <RotateCcw aria-hidden="true" className="size-4" />
                            Восстановить
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => {
                                setEditingRecipe(recipe);
                                setRecipeDraft(recipeToDraft(recipe));
                              }}
                              size="s"
                            >
                              <Edit3 aria-hidden="true" className="size-4" />
                              Изменить
                            </Button>
                            <Button
                              className="text-neon-pink"
                              disabled={Boolean(pendingAction)}
                              onClick={() =>
                                runAction(
                                  `archive-recipe:${recipe.id}`,
                                  () =>
                                    archiveRecipe({
                                      id: recipe.id,
                                      version: recipe.version,
                                    }).unwrap(),
                                  'Не удалось архивировать рецепт',
                                )
                              }
                              size="s"
                            >
                              <Archive aria-hidden="true" className="size-4" />В архив
                            </Button>
                          </>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </AsyncState>
            </AnimatedPanel>
          </>
        ) : (
          <>
            <AnimatedPanel className="p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-text text-lg font-semibold">
                    {editingPlan ? 'Редактирование блюда' : 'Добавить блюдо в план'}
                  </h2>
                  <p className="text-muted-text mt-1 text-sm">
                    План строится по дням и приёмам пищи.
                  </p>
                </div>
                {editingPlan && (
                  <Button onClick={resetPlan} size="s">
                    Отменить
                  </Button>
                )}
              </div>
              <form className="grid gap-gap md:grid-cols-2" onSubmit={submitPlan}>
                <DatePicker
                  label="Дата"
                  onChange={(event) =>
                    setPlanDraft((draft) => ({ ...draft, plannedFor: event.target.value }))
                  }
                  required
                  value={planDraft.plannedFor}
                />
                <Input
                  label="Приём пищи"
                  maxLength={40}
                  onChange={(event) =>
                    setPlanDraft((draft) => ({ ...draft, mealSlot: event.target.value }))
                  }
                  placeholder="Например, ужин"
                  required
                  value={planDraft.mealSlot}
                />
                <Select
                  label="Рецепт"
                  onChange={(value) => setPlanDraft((draft) => ({ ...draft, recipeId: value }))}
                  options={activeRecipes.map((recipe) => ({
                    label: recipe.name,
                    value: recipe.id,
                  }))}
                  placeholder="Выберите рецепт"
                  value={planDraft.recipeId}
                />
                <Input
                  label="Порции"
                  min="1"
                  onChange={(event) =>
                    setPlanDraft((draft) => ({ ...draft, servings: event.target.value }))
                  }
                  type="number"
                  value={planDraft.servings}
                />
                <div className="md:col-span-2">
                  <Button
                    disabled={
                      createPlanState.isLoading ||
                      updatePlanState.isLoading ||
                      !activeRecipes.length
                    }
                    type="submit"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                    {editingPlan ? 'Сохранить блюдо' : 'Добавить в план'}
                  </Button>
                </div>
              </form>
            </AnimatedPanel>

            <AnimatedPanel className="p-5 sm:p-6">
              <div className="grid gap-gap sm:grid-cols-3 sm:items-end">
                <DatePicker
                  label="С даты"
                  onChange={(event) => setFrom(event.target.value)}
                  value={from}
                />
                <DatePicker
                  label="По дату"
                  onChange={(event) => setTo(event.target.value)}
                  value={to}
                />
                <Select
                  label="Список для покупок"
                  onChange={setShoppingListId}
                  options={shoppingLists.map((list) => ({ label: list.name, value: list.id }))}
                  placeholder="Выберите список"
                  value={effectiveShoppingListId}
                />
              </div>
            </AnimatedPanel>

            <AnimatedPanel className="p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays aria-hidden="true" className="text-primary-neon size-5" />
                <h2 className="text-text text-lg font-semibold">Запланированные блюда</h2>
              </div>
              <AsyncState
                empty={
                  !plansQuery.isLoading ? (
                    <p className="text-muted-text py-8 text-center text-sm">
                      На этот период блюд нет.
                    </p>
                  ) : undefined
                }
                error={plansQuery.error}
                hasData={Boolean(plansQuery.data)}
                isLoading={plansQuery.isLoading}
                loading={
                  <p className="text-muted-text py-8 text-center text-sm">Загружаем план…</p>
                }
                onRetry={() => plansQuery.refetch()}
              >
                <div className="space-y-3">
                  {(plansQuery.data ?? []).map((plan) => (
                    <article
                      className="border-border bg-elevated/30 flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                      key={plan.id}
                    >
                      <div className="min-w-0">
                        <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.15em]">
                          {new Date(plan.plannedFor).toLocaleDateString('ru-RU')}
                        </p>
                        <h3 className="text-text mt-1 text-lg font-semibold">{plan.recipe.name}</h3>
                        <p className="text-muted-text mt-1 text-sm">
                          {plan.mealSlot} · {plan.servings} порц.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          onClick={() => {
                            setEditingPlan(plan);
                            setPlanDraft(planToDraft(plan));
                          }}
                          size="s"
                        >
                          <Edit3 aria-hidden="true" className="size-4" />
                          Изменить
                        </Button>
                        <Button
                          disabled={!effectiveShoppingListId || Boolean(pendingAction)}
                          onClick={() =>
                            runAction(
                              `shopping:${plan.id}`,
                              () =>
                                generateShopping({
                                  planId: plan.id,
                                  listId: effectiveShoppingListId,
                                }).unwrap(),
                              'Не удалось добавить ингредиенты в покупки',
                            )
                          }
                          size="s"
                        >
                          <ShoppingBasket aria-hidden="true" className="size-4" />В покупки
                        </Button>
                        <Button
                          className="text-neon-pink"
                          disabled={Boolean(pendingAction)}
                          onClick={() =>
                            runAction(
                              `delete-plan:${plan.id}`,
                              () => deletePlan(plan.id).unwrap(),
                              'Не удалось удалить блюдо из плана',
                            )
                          }
                          size="s"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                          Удалить
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </AsyncState>
            </AnimatedPanel>
          </>
        )}
      </Tabs>
    </PageLayout>
  );
};
