export {
  connectMessengerSocket,
  disconnectMessengerSocket,
  emitMessengerCommand,
  getMessengerSocket,
  type CommandResponse,
  type MessengerSocket,
} from '@/features/messenger-realtime/model/messengerSocket';
export {
  messengerRealtimeReducer,
  resetMessengerRealtime,
  setConnectionStatus,
  setPresence,
  setTyping,
} from '@/features/messenger-realtime/model/messengerRealtimeSlice';
