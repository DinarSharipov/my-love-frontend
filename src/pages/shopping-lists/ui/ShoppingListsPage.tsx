import { Archive, Check, Plus, RotateCcw, ShoppingBasket } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import type { ShoppingList } from '@/entities/shopping';
import {
  getApiErrorMessage,
  useAddMutation,
  useArchive7Mutation,
  useCheckMutation,
  useCreate9Mutation,
  useListsQuery,
  useUncheckMutation,
} from '@/shared/api';
import { AnimatedPanel, AsyncState, Button, Input, PageLayout } from '@/shared/ui';

type ItemDraft = {
  name: string;
  quantity: string;
};

const emptyDraft: ItemDraft = { name: '', quantity: '' };

export const ShoppingListsPage = () => {
  const listsQuery = useListsQuery();
  const [createList, createState] = useCreate9Mutation();
  const [addItem, addState] = useAddMutation();
  const [checkItem] = useCheckMutation();
  const [uncheckItem] = useUncheckMutation();
  const [archiveList] = useArchive7Mutation();
  const [listName, setListName] = useState('');
  const [drafts, setDrafts] = useState<Record<string, ItemDraft>>({});
  const [pendingAction, setPendingAction] = useState<string>();
  const [error, setError] = useState<string>();

  const lists = ((listsQuery.data as ShoppingList[] | undefined) ?? []).filter(
    (list) => !list.archived,
  );
  const refresh = () => listsQuery.refetch();

  const submitList = async (event: FormEvent) => {
    event.preventDefault();
    const name = listName.trim();
    if (!name) return;

    setError(undefined);
    try {
      await createList({ createShoppingListDto: { name } }).unwrap();
      setListName('');
      await refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось создать список покупок'));
    }
  };

  const submitItem = async (event: FormEvent, listId: string) => {
    event.preventDefault();
    const draft = drafts[listId] ?? emptyDraft;
    const name = draft.name.trim();
    if (!name) return;

    setError(undefined);
    setPendingAction(`add:${listId}`);
    try {
      await addItem({
        listId,
        createShoppingItemDto: {
          name,
          quantity: draft.quantity.trim() || undefined,
        },
      }).unwrap();
      setDrafts((current) => ({ ...current, [listId]: emptyDraft }));
      await refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось добавить товар'));
    } finally {
      setPendingAction(undefined);
    }
  };

  const runAction = async (key: string, action: () => Promise<unknown>, message: string) => {
    setError(undefined);
    setPendingAction(key);
    try {
      await action();
      await refresh();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, message));
    } finally {
      setPendingAction(undefined);
    }
  };

  const updateDraft = (listId: string, patch: Partial<ItemDraft>) => {
    setDrafts((current) => ({
      ...current,
      [listId]: { ...(current[listId] ?? emptyDraft), ...patch },
    }));
  };

  return (
    <PageLayout>
      <AnimatedPanel className="page-header">
        <p className="text-cyber-cyan text-xs font-semibold uppercase tracking-[0.2em]">
          Семейный стол
        </p>
        <h1 className="text-text mt-1 text-2xl font-semibold sm:text-3xl">Списки покупок</h1>
        <p className="text-muted-text mt-1 text-sm">
          Собирайте покупки вместе и отмечайте уже взятое.
        </p>
      </AnimatedPanel>

      <AnimatedPanel className="p-5 sm:p-6">
        <form className="flex flex-col gap-gap sm:flex-row sm:items-end" onSubmit={submitList}>
          <Input
            label="Новый список"
            maxLength={150}
            onChange={(event) => setListName(event.target.value)}
            placeholder="Например, продукты на неделю"
            value={listName}
          />
          <Button
            containerClassName="shrink-0"
            disabled={createState.isLoading || !listName.trim()}
            type="submit"
          >
            Создать список
          </Button>
        </form>
        {error && (
          <p className="text-neon-pink mt-3 text-sm" role="alert">
            {error}
          </p>
        )}
      </AnimatedPanel>

      <AsyncState
        empty={
          !listsQuery.isLoading && lists.length === 0 ? (
            <AnimatedPanel className="text-muted-text p-8 text-center">
              <ShoppingBasket className="text-cyber-cyan mx-auto mb-3 size-8" />
              Списков пока нет. Создайте первый список выше.
            </AnimatedPanel>
          ) : undefined
        }
        error={listsQuery.error}
        errorMessage="Не удалось загрузить списки покупок"
        hasData={Boolean(listsQuery.data)}
        isLoading={listsQuery.isLoading}
        loading={<AnimatedPanel className="text-muted-text p-6">Загружаем покупки…</AnimatedPanel>}
        onRetry={refresh}
      >
        <div className="grid items-start gap-gap lg:grid-cols-2">
          {lists.map((list) => {
            const draft = drafts[list.id] ?? emptyDraft;
            const activeItems = list.items.filter((item) => !item.checked);
            const checkedItems = list.items.filter((item) => item.checked);

            return (
              <AnimatedPanel className="min-w-0 p-5" key={list.id}>
                <div className="flex items-start justify-between gap-gap">
                  <div className="min-w-0">
                    <h2 className="text-text truncate text-lg font-semibold">{list.name}</h2>
                    <p className="text-muted-text mt-1 text-xs">
                      Осталось {activeItems.length} · взято {checkedItems.length}
                    </p>
                  </div>
                  <Button
                    aria-label={`Архивировать список «${list.name}»`}
                    className="text-neon-pink"
                    disabled={Boolean(pendingAction)}
                    icon={<Archive aria-hidden="true" className="size-4" />}
                    onClick={() =>
                      runAction(
                        `archive:${list.id}`,
                        () => archiveList({ listId: list.id }).unwrap(),
                        'Не удалось архивировать список',
                      )
                    }
                    size="s"
                  />
                </div>

                <form
                  className="mt-4 grid gap-gap sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end"
                  onSubmit={(event) => submitItem(event, list.id)}
                >
                  <Input
                    aria-label={`Название товара для списка «${list.name}»`}
                    maxLength={200}
                    onChange={(event) => updateDraft(list.id, { name: event.target.value })}
                    placeholder="Добавить товар"
                    value={draft.name}
                  />
                  <Input
                    aria-label={`Количество товара для списка «${list.name}»`}
                    maxLength={80}
                    onChange={(event) => updateDraft(list.id, { quantity: event.target.value })}
                    placeholder="Количество"
                    value={draft.quantity}
                  />
                  <Button
                    aria-label={`Добавить товар в список «${list.name}»`}
                    disabled={
                      addState.isLoading || pendingAction === `add:${list.id}` || !draft.name.trim()
                    }
                    size="s"
                    type="submit"
                  >
                    <Plus aria-hidden="true" className="size-4" />
                  </Button>
                </form>

                <div className="mt-4 space-y-2">
                  {[...activeItems, ...checkedItems].map((item) => (
                    <article
                      className="border-border bg-elevated/35 flex min-w-0 items-center gap-gap rounded-2xl border p-3"
                      key={item.id}
                    >
                      <button
                        aria-label={
                          item.checked
                            ? `Вернуть товар «${item.name}»`
                            : `Отметить товар «${item.name}»`
                        }
                        className="text-acid-green shrink-0 rounded-lg p-1 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-neon)] disabled:opacity-50"
                        disabled={Boolean(pendingAction)}
                        onClick={() =>
                          runAction(
                            `item:${item.id}`,
                            () =>
                              item.checked
                                ? uncheckItem({ listId: list.id, itemId: item.id }).unwrap()
                                : checkItem({ listId: list.id, itemId: item.id }).unwrap(),
                            'Не удалось обновить товар',
                          )
                        }
                        type="button"
                      >
                        {item.checked ? (
                          <RotateCcw aria-hidden="true" className="size-4" />
                        ) : (
                          <Check aria-hidden="true" className="size-4" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p
                          className={
                            item.checked
                              ? 'text-muted-text truncate text-sm line-through'
                              : 'text-text truncate text-sm'
                          }
                        >
                          {item.name}
                        </p>
                        {item.quantity && (
                          <p className="text-muted-text mt-0.5 truncate text-xs">{item.quantity}</p>
                        )}
                      </div>
                    </article>
                  ))}
                  {list.items.length === 0 && (
                    <p className="text-muted-text py-3 text-center text-sm">
                      В этом списке пока нет товаров.
                    </p>
                  )}
                </div>
              </AnimatedPanel>
            );
          })}
        </div>
      </AsyncState>
    </PageLayout>
  );
};
