import dayjs from 'dayjs';
import {
  ChevronUp,
  Circle,
  Mic,
  LoaderCircle,
  MessageCircleMore,
  Pencil,
  Paperclip,
  SendHorizontal,
  Square,
  Trash2,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import {
  asText,
  asUrl,
  participantName,
  useConversationsQuery,
  useCreateConversationMutation,
  useCreateMessageMutation,
  useAddMemberMutation,
  useLeaveMutation,
  useMarkReadMutation,
  useMessagesQuery,
  useRemoveMemberMutation,
  useTransferOwnershipMutation,
  useUpdateConversationMutation,
  type MessengerConversation,
  type MessengerMessage,
} from '@/entities/messenger';
import { selectCurrentUser } from '@/entities/user';
import { useMessengerCommands } from '@/features/send-message';
import { useMediaUploadDirectMutation, type Media } from '@/entities/media';
import {
  getApiErrorMessage,
  type CreateMessageDto,
  useFindCurrentUserQuery,
  useFindMyFamilyQuery,
} from '@/shared/api';
import {
  AnimatedPanel,
  AsyncState,
  Button,
  ConfirmDialog,
  HeaderPanel,
  Input,
  Modal,
  PageLayout,
  Textarea,
} from '@/shared/ui';
import type { RootState } from '@/app/providers/store';

type PendingMessage = { clientMessageId: string; status: 'pending' | 'failed'; text: string };
const MESSAGE_LIMIT = 50;
const voiceRecordingFormats = [
  { recorderMimeType: 'audio/webm;codecs=opus', uploadMimeType: 'audio/webm' },
  { recorderMimeType: 'audio/ogg;codecs=opus', uploadMimeType: 'audio/ogg' },
  { recorderMimeType: 'audio/mp4', uploadMimeType: 'audio/mp4' },
];
const runSafely = (operation: Promise<unknown>) => {
  operation.catch(() => undefined);
};

const conversationTitle = (conversation: MessengerConversation, userId?: string) => {
  const title = asText(conversation.title);
  if (title) return title;
  const others = conversation.members.filter((member) => member.userId !== userId);
  return others.map((member) => participantName(member.user)).join(', ') || 'Личный чат';
};

const lastMessageText = (conversation: MessengerConversation) => {
  const message = conversation.lastMessage;
  if (!message) return 'Сообщений пока нет';
  if (message.type === 'IMAGE') return 'Изображение';
  if (message.type === 'VIDEO') return 'Видео';
  if (message.type === 'VOICE') return 'Голосовое сообщение';
  return asText(message.text) || 'Сообщение';
};

const memberRoleTitle = (role: MessengerConversation['members'][number]['role']) => {
  if (role === 'OWNER') return 'Владелец';
  if (role === 'ADMIN') return 'Администратор';
  return 'Участник';
};

const Avatar = ({ name, url }: { name: string; url: string | null }) => (
  <div className="border-primary-neon/40 bg-primary-neon/10 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-sm font-semibold text-primary-neon">
    {url ? (
      <img alt="" className="h-full w-full object-cover" src={url} />
    ) : (
      name.slice(0, 2).toUpperCase()
    )}
  </div>
);

type MessageAttachmentProps = {
  attachment: MessengerMessage['media'][number];
  messageType: MessengerMessage['type'];
};

const MessageAttachment = ({ attachment, messageType }: MessageAttachmentProps) => {
  const { media } = attachment;
  const receivedUrl = asUrl(media.downloadUrl);
  const previewUrl = asUrl(media.previewUrl) ?? receivedUrl;
  const [sourceUrl, setSourceUrl] = useState(receivedUrl);
  const [previewSourceUrl, setPreviewSourceUrl] = useState(previewUrl);

  const refreshExpiredUrl = () => {
    if (receivedUrl && receivedUrl !== sourceUrl) {
      setSourceUrl(receivedUrl);
      setPreviewSourceUrl(previewUrl);
    }
  };

  if (!sourceUrl) return null;
  if (messageType === 'IMAGE') {
    return (
      <a
        className="mt-2 block overflow-hidden rounded-xl"
        href={sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        <img
          alt={media.originalName}
          className="max-h-72 w-full object-cover"
          onError={refreshExpiredUrl}
          src={previewSourceUrl ?? sourceUrl}
        />
      </a>
    );
  }
  if (messageType === 'VIDEO') {
    return (
      <video
        className="mt-2 block max-h-72 w-full min-w-64 rounded-xl"
        controls
        onError={refreshExpiredUrl}
        preload="metadata"
        src={sourceUrl}
      >
        <track kind="captions" label="Субтитры отсутствуют" srcLang="ru" />
      </video>
    );
  }
  return (
    <audio
      className="mt-2 block h-10 w-[min(22rem,100%)] min-w-64 max-w-full accent-primary-neon"
      controls
      onError={refreshExpiredUrl}
      preload="auto"
      src={sourceUrl}
    >
      <track kind="captions" label="Субтитры отсутствуют" srcLang="ru" />
    </audio>
  );
};

const messageMediaType = (media: Media): 'IMAGE' | 'VIDEO' | 'VOICE' => {
  if (media.kind === 'IMAGE') return 'IMAGE';
  if (media.kind === 'VIDEO') return 'VIDEO';
  return 'VOICE';
};

export const MessengerWorkspace = () => {
  const currentUser = useSelector((state: RootState) => selectCurrentUser(state));
  const currentUserQuery = useFindCurrentUserQuery();
  const currentUserId = currentUserQuery.data?.id ?? currentUser?.id;
  const connectionStatus = useSelector(
    (state: RootState) => state.messengerRealtime.connectionStatus,
  );
  const typingByConversation = useSelector(
    (state: RootState) => state.messengerRealtime.typingByConversation,
  );
  const {
    data: conversations = [],
    error: conversationsError,
    isLoading: isLoadingConversations,
    refetch,
  } = useConversationsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [beforeId, setBeforeId] = useState<string | undefined>();
  const [pages, setPages] = useState<Record<string, MessengerMessage[]>>({});
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<PendingMessage[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessengerMessage | null>(null);
  const [editingText, setEditingText] = useState('');
  const [messageToDelete, setMessageToDelete] = useState<MessengerMessage | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [newConversationType, setNewConversationType] = useState<'DIRECT' | 'GROUP'>('DIRECT');
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [newMemberIds, setNewMemberIds] = useState<string[]>([]);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSendingAttachment, setIsSendingAttachment] = useState(false);
  const typingTimerRef = useRef<number | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const lastReadMessageByConversationRef = useRef<Record<string, string>>({});
  const familyQuery = useFindMyFamilyQuery();
  const [createMessage] = useCreateMessageMutation();
  const [uploadMedia] = useMediaUploadDirectMutation();
  const [createConversation, { isLoading: isCreatingConversation }] =
    useCreateConversationMutation();
  const [addMember, { isLoading: isAddingMember }] = useAddMemberMutation();
  const [removeMember, { isLoading: isRemovingMember }] = useRemoveMemberMutation();
  const [transferOwnership, { isLoading: isTransferringOwnership }] =
    useTransferOwnershipMutation();
  const [leaveConversationHttp, { isLoading: isLeavingConversation }] = useLeaveMutation();
  const [updateConversation, { isLoading: isUpdatingConversation }] =
    useUpdateConversationMutation();
  const [markRead] = useMarkReadMutation();
  const {
    deleteMessage,
    editMessage,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendText,
    setTyping,
  } = useMessengerCommands();
  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const messageQuery = useMessagesQuery(
    { beforeId, conversationId: selectedId ?? '', limit: MESSAGE_LIMIT },
    { skip: !selectedId },
  );

  useEffect(() => {
    if (!conversations.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !conversations.some((conversation) => conversation.id === selectedId)) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    setBeforeId(undefined);
    setPages({});
    setDraft('');
    setPending([]);
  }, [selectedId]);

  useEffect(() => {
    const page = messageQuery.currentData;
    if (!selectedId || !page) return;
    setPages((previous) => ({
      ...previous,
      [beforeId ?? 'latest']: page.items,
    }));
  }, [beforeId, messageQuery.currentData, selectedId]);

  useEffect(() => {
    if (!selectedId) return undefined;
    runSafely(joinConversation(selectedId));
    return () => {
      runSafely(leaveConversation(selectedId));
    };
  }, [joinConversation, leaveConversation, selectedId]);

  const messages = useMemo(() => {
    const messageIds = new Set<string>();
    return Object.values(pages)
      .flat()
      .sort((left, right) => dayjs(left.createdAt).valueOf() - dayjs(right.createdAt).valueOf())
      .filter((message) => {
        if (messageIds.has(message.id)) return false;
        messageIds.add(message.id);
        return true;
      });
  }, [pages]);

  const latestMessageId = messages.at(-1)?.id;

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return undefined;
    const frame = window.requestAnimationFrame(() => {
      messageList.scrollTo({ behavior: 'smooth', top: messageList.scrollHeight });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [latestMessageId, pending.length, selectedId]);

  useEffect(() => {
    const latest = messages.at(-1);
    if (!selectedId || !latest || latest.senderId === currentUserId) return;
    if (lastReadMessageByConversationRef.current[selectedId] === latest.id) return;
    lastReadMessageByConversationRef.current[selectedId] = latest.id;
    runSafely(markRead({ conversationId: selectedId, messageId: latest.id }));
  }, [currentUserId, markRead, messages, selectedId]);

  useEffect(() => {
    if (!messages.length) return;
    const delivered = new Set(messages.map((message) => message.clientMessageId));
    setPending((items) => items.filter((item) => !delivered.has(item.clientMessageId)));
  }, [messages]);

  useEffect(
    () => () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
      mediaRecorderRef.current?.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const onChooseConversation = (conversationId: string) => {
    setSelectedId(conversationId);
  };

  const resetCreateDialog = () => {
    setIsCreateOpen(false);
    setNewConversationType('DIRECT');
    setNewConversationTitle('');
    setNewMemberIds([]);
    setConversationError(null);
  };

  const toggleNewMember = (userId: string) => {
    setNewMemberIds((ids) =>
      ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId],
    );
  };

  const onCreateConversation = async () => {
    if (newConversationType === 'DIRECT' && newMemberIds.length !== 1) {
      setConversationError('Выберите одного собеседника для личного чата.');
      return;
    }
    if (newConversationType === 'GROUP' && !newConversationTitle.trim()) {
      setConversationError('Укажите название группы.');
      return;
    }
    try {
      const conversation = await createConversation({
        createConversationDto: {
          memberIds: newMemberIds,
          title: newConversationType === 'GROUP' ? newConversationTitle.trim() : undefined,
          type: newConversationType,
        },
      }).unwrap();
      resetCreateDialog();
      setSelectedId(conversation.id);
    } catch (error) {
      setConversationError(getApiErrorMessage(error, 'Не удалось создать чат.'));
    }
  };

  const onAddMember = async (userId: string) => {
    if (!selectedConversation) return;
    try {
      await addMember({
        conversationId: selectedConversation.id,
        conversationMemberDto: { userId },
      }).unwrap();
    } catch (error) {
      setConversationError(getApiErrorMessage(error, 'Не удалось добавить участника.'));
    }
  };

  const onRemoveMember = async (userId: string) => {
    if (!selectedConversation) return;
    try {
      await removeMember({ conversationId: selectedConversation.id, userId }).unwrap();
    } catch (error) {
      setConversationError(getApiErrorMessage(error, 'Не удалось удалить участника.'));
    }
  };

  const onTransferOwnership = async (userId: string) => {
    if (!selectedConversation) return;
    try {
      await transferOwnership({
        conversationId: selectedConversation.id,
        transferConversationOwnershipDto: { userId },
      }).unwrap();
    } catch (error) {
      setConversationError(getApiErrorMessage(error, 'Не удалось передать права владельца.'));
    }
  };

  const onRenameConversation = async () => {
    if (!selectedConversation || !newConversationTitle.trim()) return;
    try {
      await updateConversation({
        conversationId: selectedConversation.id,
        updateConversationDto: { title: newConversationTitle.trim() },
      }).unwrap();
      setNewConversationTitle('');
    } catch (error) {
      setConversationError(getApiErrorMessage(error, 'Не удалось изменить название.'));
    }
  };

  const onLeaveConversation = async () => {
    if (!selectedConversation) return;
    try {
      await leaveConversationHttp({ conversationId: selectedConversation.id }).unwrap();
      setIsMembersOpen(false);
      setSelectedId(null);
    } catch (error) {
      setConversationError(getApiErrorMessage(error, 'Не удалось выйти из чата.'));
    }
  };

  const stopTypingSoon = (conversationId: string) => {
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      runSafely(setTyping(conversationId, false));
    }, 900);
  };

  const onDraftChange = (value: string) => {
    setDraft(value);
    if (!selectedId) return;
    runSafely(setTyping(selectedId, value.trim().length > 0));
    stopTypingSoon(selectedId);
  };

  const onSend = async () => {
    const text = draft.trim();
    if (!selectedId || !text) return;
    const clientMessageId = crypto.randomUUID();
    setDraft('');
    setSendError(null);
    setPending((items) => [...items, { clientMessageId, status: 'pending', text }]);
    runSafely(setTyping(selectedId, false));

    const response = await sendText(selectedId, text, clientMessageId);
    if (response.ok) {
      await messageQuery.refetch();
      return;
    }

    try {
      await createMessage({
        conversationId: selectedId,
        createMessageDto: { clientMessageId, text, type: 'TEXT' },
      }).unwrap();
      await messageQuery.refetch();
    } catch (error) {
      setPending((items) =>
        items.map((item) =>
          item.clientMessageId === clientMessageId ? { ...item, status: 'failed' } : item,
        ),
      );
      setSendError(getApiErrorMessage(error, response.error.message));
    }
  };

  const onRetry = async (message: PendingMessage) => {
    if (!selectedId) return;
    setPending((items) =>
      items.map((item) =>
        item.clientMessageId === message.clientMessageId ? { ...item, status: 'pending' } : item,
      ),
    );
    const response = await sendText(selectedId, message.text, message.clientMessageId);
    if (!response.ok) {
      setPending((items) =>
        items.map((item) =>
          item.clientMessageId === message.clientMessageId ? { ...item, status: 'failed' } : item,
        ),
      );
      setSendError(response.error.message);
    }
  };

  const onSendAttachment = async (file: File) => {
    if (!selectedId) return;
    setSendError(null);
    setIsSendingAttachment(true);
    const clientMessageId = crypto.randomUUID();
    try {
      const media = await uploadMedia(file).unwrap();
      const createMessageDto: CreateMessageDto = {
        clientMessageId,
        mediaIds: [media.id],
        type: messageMediaType(media),
      };
      const response = await sendMessage(selectedId, createMessageDto);
      if (!response.ok) {
        await createMessage({ conversationId: selectedId, createMessageDto }).unwrap();
      }
      await messageQuery.refetch();
    } catch (error) {
      setSendError(getApiErrorMessage(error, 'Не удалось отправить вложение.'));
    } finally {
      setIsSendingAttachment(false);
    }
  };

  const onAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (file) runSafely(onSendAttachment(file));
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const startRecording = async () => {
    if (!selectedId || isSendingAttachment || !navigator.mediaDevices?.getUserMedia) return;
    setSendError(null);
    if (typeof MediaRecorder === 'undefined') {
      setSendError('Запись голоса не поддерживается этим браузером.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recordingFormat = voiceRecordingFormats.find(({ recorderMimeType }) =>
        MediaRecorder.isTypeSupported(recorderMimeType),
      );
      if (!recordingFormat) {
        stream.getTracks().forEach((track) => track.stop());
        setSendError('Этот браузер не поддерживает формат голосовых сообщений.');
        return;
      }
      const recorder = new MediaRecorder(stream, { mimeType: recordingFormat.recorderMimeType });
      const chunks: BlobPart[] = [];
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size) chunks.push(event.data);
      });
      recorder.addEventListener('stop', () => {
        mediaRecorderRef.current = null;
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        setIsRecording(false);
        if (!chunks.length) return;
        const extension = recordingFormat.uploadMimeType.split('/')[1];
        const voiceFile = new File(
          [new Blob(chunks, { type: recordingFormat.uploadMimeType })],
          `voice-${Date.now()}.${extension}`,
          { type: recordingFormat.uploadMimeType },
        );
        runSafely(onSendAttachment(voiceFile));
      });
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      setSendError(getApiErrorMessage(error, 'Не удалось получить доступ к микрофону.'));
    }
  };

  const onEdit = async () => {
    const message = editingMessage;
    if (!selectedId) return;
    if (!message || !editingText.trim()) return;
    const response = await editMessage(selectedId, message.id, editingText.trim());
    if (response.ok) setEditingMessage(null);
    else setSendError(response.error.message);
  };

  const onDelete = async (message: MessengerMessage) => {
    if (!selectedId) return;
    const response = await deleteMessage(selectedId, message.id);
    if (response.ok) setMessageToDelete(null);
    else setSendError(response.error.message);
  };

  const nextCursor = asText(messageQuery.currentData?.nextCursor);
  const typingUsers = (typingByConversation[selectedId ?? ''] ?? []).filter(
    (userId) => userId !== currentUserId,
  );

  return (
    <PageLayout contentClassName="overflow-hidden [&>div]:h-full [&>div]:min-h-0">
      <HeaderPanel
        left={
          <>
            <div className="text-primary-neon mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
              <MessageCircleMore aria-hidden="true" className="h-4 w-4" />
              Семейный чат
            </div>
            <h1 className="text-text text-2xl font-semibold sm:text-3xl">Сообщения</h1>
            <p className="text-muted-text mt-1 text-sm">
              Обсуждайте планы, события и важные моменты семьи.
            </p>
          </>
        }
        right={
          <div className="flex items-center gap-2">
            <span className="text-muted-text inline-flex items-center gap-2 text-xs">
              <Circle
                aria-hidden="true"
                className={`h-2.5 w-2.5 fill-current ${connectionStatus === 'online' ? 'text-primary-neon' : 'text-muted-text'}`}
              />
              {connectionStatus === 'online' ? 'В сети' : 'Соединение…'}
            </span>
            <Button
              icon={<UserPlus aria-hidden="true" className="h-4 w-4" />}
              onClick={() => setIsCreateOpen(true)}
              size="s"
            >
              Новый чат
            </Button>
          </div>
        }
      />

      <div className="grid min-h-0 flex-1 gap-gap lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.7fr)]">
        <AnimatedPanel className="flex min-h-0 flex-col overflow-hidden p-0">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-text font-semibold">Чаты</h2>
            <Button onClick={() => runSafely(refetch())} size="s" title="Обновить список">
              Обновить
            </Button>
          </div>
          <AsyncState
            error={conversationsError}
            hasData={conversations.length > 0}
            isLoading={isLoadingConversations}
            onRetry={() => runSafely(refetch())}
            empty={<p className="text-muted-text px-4 py-8 text-center text-sm">Чатов пока нет.</p>}
          >
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {conversations.map((conversation) => {
                const title = conversationTitle(conversation, currentUserId);
                const other = conversation.members.find(
                  (member) => member.userId !== currentUserId,
                )?.user;
                return (
                  <button
                    className={`hover:border-primary-neon/60 w-full rounded-2xl border p-3 text-left transition ${selectedId === conversation.id ? 'border-primary-neon bg-primary-neon/10' : 'border-transparent'}`}
                    key={conversation.id}
                    onClick={() => onChooseConversation(conversation.id)}
                    type="button"
                  >
                    <div className="flex gap-3">
                      <Avatar name={title} url={asUrl(other?.avatarUrl)} />
                      <span className="min-w-0 flex-1">
                        <span className="text-text flex items-center justify-between gap-2 font-semibold">
                          <span className="truncate">{title}</span>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-primary-neon text-background grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px]">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </span>
                        <span className="text-muted-text mt-1 block truncate text-xs">
                          {lastMessageText(conversation)}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </AsyncState>
        </AnimatedPanel>

        <AnimatedPanel className="flex min-h-0 flex-col overflow-hidden p-0">
          {selectedConversation ? (
            <>
              <div className="border-border flex shrink-0 items-center gap-3 border-b px-4 py-3">
                <Avatar
                  name={conversationTitle(selectedConversation, currentUserId)}
                  url={asUrl(
                    selectedConversation.members.find((member) => member.userId !== currentUserId)
                      ?.user.avatarUrl,
                  )}
                />
                <div className="min-w-0">
                  <h2 className="text-text truncate font-semibold">
                    {conversationTitle(selectedConversation, currentUserId)}
                  </h2>
                  <p className="text-muted-text text-xs">
                    {typingUsers.length
                      ? 'Печатает…'
                      : `${selectedConversation.members.length} участника`}
                  </p>
                </div>
                {selectedConversation.type === 'GROUP' && (
                  <Button
                    className="ml-auto"
                    onClick={() => {
                      setConversationError(null);
                      setIsMembersOpen(true);
                    }}
                    size="s"
                  >
                    Участники
                  </Button>
                )}
              </div>

              <div
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3"
                ref={messageListRef}
              >
                {nextCursor && (
                  <div className="mb-4 flex justify-center">
                    <Button
                      icon={<ChevronUp aria-hidden="true" className="h-4 w-4" />}
                      isLoading={messageQuery.isFetching}
                      onClick={() => setBeforeId(nextCursor)}
                      size="s"
                    >
                      Ранее
                    </Button>
                  </div>
                )}
                {messageQuery.isLoading && !messages.length ? (
                  <div className="grid h-full place-items-center">
                    <LoaderCircle className="text-primary-neon h-7 w-7 animate-spin" />
                  </div>
                ) : (
                  <div className="flex min-h-full flex-col justify-end gap-3">
                    {messages.map((message) => {
                      const isOwn = message.senderId === currentUserId;
                      const text = message.deletedAt ? 'Сообщение удалено' : asText(message.text);
                      const attachments = message.media ?? [];
                      return (
                        <div
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          key={message.id}
                        >
                          <div
                            className={`w-fit min-w-36 max-w-[min(85%,32rem)] rounded-2xl border px-3 py-2 ${isOwn ? 'border-primary-neon/70 bg-primary-neon/15' : 'border-border bg-surface/50'}`}
                          >
                            {!isOwn && (
                              <p className="text-primary-neon mb-1 text-xs">
                                {participantName(message.sender)}
                              </p>
                            )}
                            {text && (
                              <p className="text-text whitespace-pre-wrap break-words text-sm">
                                {text}
                              </p>
                            )}
                            {!message.deletedAt &&
                              attachments.map((attachment) => (
                                <MessageAttachment
                                  attachment={attachment}
                                  key={attachment.mediaId}
                                  messageType={message.type}
                                />
                              ))}
                            <div className="text-muted-text mt-1 flex items-center justify-end gap-2 text-[10px]">
                              {message.updatedAt !== message.createdAt && !message.deletedAt && (
                                <span>изменено</span>
                              )}
                              <span>{dayjs(message.createdAt).format('HH:mm')}</span>
                              {isOwn && !message.deletedAt && (
                                <>
                                  {message.type === 'TEXT' && (
                                    <button
                                      aria-label="Изменить"
                                      onClick={() => {
                                        setEditingMessage(message);
                                        setEditingText(asText(message.text));
                                      }}
                                      type="button"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  <button
                                    aria-label="Удалить"
                                    onClick={() => setMessageToDelete(message)}
                                    type="button"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {pending.map((message) => (
                      <div className="flex justify-end" key={message.clientMessageId}>
                        <button
                          className={`w-fit min-w-36 max-w-[min(85%,32rem)] rounded-2xl border px-3 py-2 text-left text-sm ${message.status === 'failed' ? 'border-neon-pink/70 bg-neon-pink/10' : 'border-primary-neon/40 bg-primary-neon/10'}`}
                          onClick={() => {
                            if (message.status === 'failed') runSafely(onRetry(message));
                          }}
                          type="button"
                        >
                          <p className="text-text whitespace-pre-wrap break-words">
                            {message.text}
                          </p>
                          <p className="text-muted-text mt-1 text-[10px]">
                            {message.status === 'failed'
                              ? 'Не отправлено — нажмите, чтобы повторить'
                              : 'Отправка…'}
                          </p>
                        </button>
                      </div>
                    ))}
                    {!messages.length && !pending.length && (
                      <p className="text-muted-text m-auto text-center text-sm">
                        Начните разговор.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-border shrink-0 border-t p-3">
                {sendError && <p className="text-neon-pink mb-2 text-xs">{sendError}</p>}
                <div className="flex items-start gap-2">
                  <input
                    accept="image/*,video/*,audio/*"
                    className="sr-only"
                    disabled={isSendingAttachment || isRecording}
                    onChange={onAttachmentChange}
                    ref={attachmentInputRef}
                    type="file"
                  />
                  <Textarea
                    className="h-28 min-h-28 flex-1 resize-none"
                    maxLength={4000}
                    onChange={(event) => onDraftChange(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        runSafely(onSend());
                      }
                    }}
                    placeholder="Напишите сообщение…"
                    rows={4}
                    value={draft}
                  />
                  <div className="flex shrink-0 flex-col items-stretch gap-2">
                    <Button
                      aria-label="Прикрепить файл"
                      disabled={isSendingAttachment || isRecording}
                      icon={<Paperclip aria-hidden="true" className="h-4 w-4" />}
                      isLoading={isSendingAttachment}
                      onClick={() => attachmentInputRef.current?.click()}
                      size="s"
                      title="Фото, видео или аудио"
                    />
                    <Button
                      aria-label={
                        isRecording ? 'Остановить запись' : 'Записать голосовое сообщение'
                      }
                      disabled={isSendingAttachment}
                      icon={
                        isRecording ? (
                          <Square aria-hidden="true" className="h-4 w-4" />
                        ) : (
                          <Mic aria-hidden="true" className="h-4 w-4" />
                        )
                      }
                      onClick={isRecording ? stopRecording : () => runSafely(startRecording())}
                      size="s"
                      title={isRecording ? 'Остановить запись' : 'Записать голосовое сообщение'}
                    />
                    <Button
                      aria-label="Отправить сообщение"
                      disabled={!draft.trim() || isSendingAttachment || isRecording}
                      icon={<SendHorizontal aria-hidden="true" className="h-4 w-4" />}
                      onClick={() => runSafely(onSend())}
                      size="s"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-muted-text grid h-full place-items-center p-6 text-center text-sm">
              Выберите чат, чтобы начать общение.
            </div>
          )}
        </AnimatedPanel>
      </div>
      {editingMessage && (
        <Modal onClose={() => setEditingMessage(null)} open>
          <div className="min-w-[min(32rem,80vw)] space-y-4 p-5">
            <h2 className="text-text text-lg font-semibold">Изменить сообщение</h2>
            <Textarea
              maxLength={4000}
              onChange={(event) => setEditingText(event.target.value)}
              value={editingText}
            />
            <div className="flex justify-end gap-2">
              <Button onClick={() => setEditingMessage(null)} size="s">
                Отмена
              </Button>
              <Button disabled={!editingText.trim()} onClick={() => runSafely(onEdit())} size="s">
                Сохранить
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {isCreateOpen && (
        <Modal
          contentClassName="!w-[min(34rem,calc(100vw-2rem))] !p-0"
          onClose={resetCreateDialog}
          open
        >
          <div className="w-full space-y-4 p-5">
            <div>
              <h2 className="text-text text-lg font-semibold">Новый чат</h2>
              <p className="text-muted-text mt-1 text-sm">Выберите членов вашей семьи.</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setNewConversationType('DIRECT');
                  setNewMemberIds([]);
                }}
                size="s"
              >
                Личный
              </Button>
              <Button onClick={() => setNewConversationType('GROUP')} size="s">
                Группа
              </Button>
            </div>
            {newConversationType === 'GROUP' && (
              <Input
                label="Название группы"
                maxLength={120}
                onChange={(event) => setNewConversationTitle(event.target.value)}
                value={newConversationTitle}
              />
            )}
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {!currentUserId ? (
                <p className="text-muted-text py-4 text-center text-sm">Загружаем состав семьи…</p>
              ) : (
                (familyQuery.data?.members ?? [])
                  .filter((member) => member.user.id !== currentUserId)
                  .map((member) => {
                    const name = participantName(member.user);
                    const checked = newMemberIds.includes(member.user.id);
                    return (
                      <label
                        className="border-border hover:border-primary-neon/60 flex cursor-pointer items-center gap-3 rounded-xl border p-3"
                        htmlFor={`new-conversation-member-${member.user.id}`}
                        key={member.user.id}
                      >
                        <input
                          checked={checked}
                          className="accent-primary-neon h-4 w-4"
                          disabled={
                            newConversationType === 'DIRECT' && !checked && newMemberIds.length > 0
                          }
                          id={`new-conversation-member-${member.user.id}`}
                          onChange={() => toggleNewMember(member.user.id)}
                          type="checkbox"
                        />
                        <Avatar name={name} url={asUrl(member.user.avatarUrl)} />
                        <span className="text-text text-sm font-medium">{name}</span>
                      </label>
                    );
                  })
              )}
            </div>
            {conversationError && (
              <p className="text-neon-pink text-sm" role="alert">
                {conversationError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button onClick={resetCreateDialog} size="s">
                Отмена
              </Button>
              <Button
                isLoading={isCreatingConversation}
                onClick={() => runSafely(onCreateConversation())}
                size="s"
              >
                Создать
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {isMembersOpen && selectedConversation && (
        <Modal onClose={() => setIsMembersOpen(false)} open>
          <div className="w-[min(38rem,calc(100vw-2rem))] space-y-4 p-5">
            <div>
              <h2 className="text-text flex items-center gap-2 text-lg font-semibold">
                <UsersRound className="text-primary-neon h-5 w-5" />
                Участники
              </h2>
              <p className="text-muted-text mt-1 text-sm">
                Управление доступно владельцу и администраторам группы.
              </p>
            </div>
            {conversationError && (
              <p className="text-neon-pink text-sm" role="alert">
                {conversationError}
              </p>
            )}
            {selectedConversation.members.map((member) => {
              const isSelf = member.userId === currentUserId;
              const myRole = selectedConversation.members.find(
                (item) => item.userId === currentUserId,
              )?.role;
              const canManage = myRole === 'OWNER' || myRole === 'ADMIN';
              const canRemove =
                canManage &&
                member.role !== 'OWNER' &&
                !(myRole === 'ADMIN' && member.role === 'ADMIN');
              return (
                <div
                  className="border-border flex items-center gap-3 rounded-xl border p-3"
                  key={member.userId}
                >
                  <Avatar name={participantName(member.user)} url={asUrl(member.user.avatarUrl)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-text truncate text-sm font-medium">
                      {participantName(member.user)}
                      {isSelf ? ' (вы)' : ''}
                    </p>
                    <p className="text-muted-text text-xs">{memberRoleTitle(member.role)}</p>
                  </div>
                  {myRole === 'OWNER' && !isSelf && (
                    <Button
                      isLoading={isTransferringOwnership}
                      onClick={() => runSafely(onTransferOwnership(member.userId))}
                      size="s"
                    >
                      Сделать владельцем
                    </Button>
                  )}
                  {canRemove && (
                    <Button
                      isLoading={isRemovingMember}
                      onClick={() => runSafely(onRemoveMember(member.userId))}
                      size="s"
                    >
                      Удалить
                    </Button>
                  )}
                </div>
              );
            })}
            <div className="border-border space-y-2 border-t pt-4">
              <Input
                label="Переименовать группу"
                maxLength={120}
                onChange={(event) => setNewConversationTitle(event.target.value)}
                placeholder={asText(selectedConversation.title)}
                value={newConversationTitle}
              />
              <Button
                isLoading={isUpdatingConversation}
                onClick={() => runSafely(onRenameConversation())}
                size="s"
              >
                Сохранить название
              </Button>
            </div>
            <div className="border-border space-y-2 border-t pt-4">
              <p className="text-muted-text text-xs">Добавить из семьи</p>
              <div className="flex flex-wrap gap-2">
                {(familyQuery.data?.members ?? [])
                  .filter(
                    (member) =>
                      !selectedConversation.members.some((item) => item.userId === member.user.id),
                  )
                  .map((member) => (
                    <Button
                      isLoading={isAddingMember}
                      key={member.user.id}
                      onClick={() => runSafely(onAddMember(member.user.id))}
                      size="s"
                    >
                      + {participantName(member.user)}
                    </Button>
                  ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                isLoading={isLeavingConversation}
                onClick={() => runSafely(onLeaveConversation())}
                size="s"
              >
                Выйти из чата
              </Button>
              <Button onClick={() => setIsMembersOpen(false)} size="s">
                Готово
              </Button>
            </div>
          </div>
        </Modal>
      )}
      <ConfirmDialog
        confirmLabel="Удалить"
        description="Сообщение исчезнет у всех участников чата."
        open={Boolean(messageToDelete)}
        onCancel={() => setMessageToDelete(null)}
        onConfirm={() => {
          if (messageToDelete) runSafely(onDelete(messageToDelete));
        }}
        title="Удалить сообщение?"
      />
    </PageLayout>
  );
};
