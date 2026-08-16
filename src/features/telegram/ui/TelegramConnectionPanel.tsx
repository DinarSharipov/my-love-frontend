import { Copy, ExternalLink, Send, Unplug } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  useCreateTelegramLinkTokenMutation,
  useDeleteTelegramConnectionMutation,
  useGetTelegramConnectionQuery,
} from '@/features/telegram';
import { getApiErrorMessage } from '@/shared/api';
import { AnimatedPanel, Button } from '@/shared/ui';

const BOT_URL = 'https://t.me/my_LOVE_telegrem_bot';

export const TelegramConnectionPanel = () => {
  const connection = useGetTelegramConnectionQuery(undefined, { pollingInterval: 15_000 });
  const [createToken, createState] = useCreateTelegramLinkTokenMutation();
  const [deleteConnection, deleteState] = useDeleteTelegramConnectionMutation();
  const [link, setLink] = useState<{ token: string; expiresAt: string }>();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const refresh = () => connection.refetch();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [connection]);

  useEffect(() => {
    if (connection.data?.status === 'ACTIVE') setLink(undefined);
  }, [connection.data?.status]);

  const connect = async () => {
    setError(undefined);
    try {
      const result = await createToken().unwrap();
      setLink(result);
      window.open(`${BOT_URL}?start=${encodeURIComponent(result.token)}`, '_blank', 'noopener,noreferrer');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось создать код подключения'));
    }
  };

  const disconnect = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Отключить Telegram от аккаунта?')) return;
    setError(undefined);
    try {
      await deleteConnection().unwrap();
      setLink(undefined);
      await connection.refetch();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Не удалось отключить Telegram'));
    }
  };

  const copyToken = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link.token);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const active = connection.data?.status === 'ACTIVE';
  return (
    <AnimatedPanel className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-text flex items-center gap-2 font-semibold"><Send className="text-cyber-cyan size-5" /> Telegram</h2>
          <p className="text-muted-text mt-1 text-xs">{active ? `Подключён ${new Intl.DateTimeFormat('ru-RU').format(new Date(connection.data!.linkedAt))}` : 'Не подключён'}</p>
        </div>
        {active ? <Button disabled={deleteState.isLoading} onClick={disconnect} size="s"><Unplug className="size-4" /> Отключить</Button> : <Button disabled={createState.isLoading} onClick={connect} size="s"><ExternalLink className="size-4" /> Подключить</Button>}
      </div>
      {link && !active && (
        <div className="border-border bg-elevated/40 mt-4 rounded-xl border p-3">
          <p className="text-muted-text text-xs">Если Telegram не открылся, отправьте боту одноразовый код в течение 10 минут:</p>
          <div className="mt-2 flex items-center gap-2"><code className="text-text min-w-0 flex-1 truncate text-sm">{link.token}</code><Button aria-label="Скопировать код" onClick={copyToken} size="s"><Copy className="size-4" />{copied ? 'Скопировано' : 'Копировать'}</Button></div>
          <button className="text-muted-text mt-2 text-xs underline" onClick={() => setLink(undefined)} type="button">Скрыть код</button>
        </div>
      )}
      {error && <p className="text-neon-pink mt-3 text-xs" role="alert">{error}</p>}
    </AnimatedPanel>
  );
};
