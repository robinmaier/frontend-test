import { defineStore } from 'pinia';
import { WebSocketService } from '../services/WebSocketService';
import { ref } from 'vue';

export const useWebSocketStore = defineStore('websocket', () => {
  const service = ref<WebSocketService | null>(null);
  const currentStreamingMessage = ref('');

  const initialize = () => {
    service.value = new WebSocketService('ws://localhost:8000/ws/chat', handleMessage);
    service.value.connect();
  };

  const handleMessage = (data: { role: string; content: string; streaming?: boolean }) => {
    if (data.streaming) {
      // Append to current streaming message
      currentStreamingMessage.value += data.content;
      // Update the last message if it's from assistant
      if (service.value?.messages.length && 
          service.value.messages[service.value.messages.length - 1].role === 'assistant') {
        service.value.messages[service.value.messages.length - 1].content = currentStreamingMessage.value;
      } else {
        service.value?.messages.push({ role: 'assistant', content: currentStreamingMessage.value });
      }
    } else {
      // Final message
      currentStreamingMessage.value = '';
      if (service.value?.messages.length && 
          service.value.messages[service.value.messages.length - 1].role === 'assistant') {
        service.value.messages[service.value.messages.length - 1].content = data.content;
      } else {
        service.value?.messages.push(data);
      }
    }
  };

  const sendMessage = (message: string) => {
    service.value?.sendMessage(message);
  };

  const cleanup = () => {
    service.value?.disconnect();
    service.value = null;
  };

  return {
    service,
    initialize,
    sendMessage,
    cleanup
  };
}); 