<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useWebSocketStore } from '../stores/websocketStore'
import { storeToRefs } from 'pinia'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useWebSocketStore()
const { service } = storeToRefs(store)
const userMessage = ref('')
const conversation = ref<HTMLElement | null>(null)

// Auto-scroll when messages change
watch(() => service.value?.messages, () => {
  setTimeout(() => {
    if (conversation.value) {
      conversation.value.scrollTop = conversation.value.scrollHeight
    }
  }, 0)
}, { deep: true })

onMounted(() => {
  store.initialize()
})

onUnmounted(() => {
  store.cleanup()
})

const sendMessage = () => {
  if (userMessage.value.trim()) {
    store.sendMessage(userMessage.value)
    userMessage.value = ''
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const renderMarkdown = (content: string) => {
  const rawHtml = marked.parse(content, { async: false }) as string
  return DOMPurify.sanitize(rawHtml)
}
</script>

<template>
  <div class="chat-container">
    <div class="chat-header">
    </div>
    <div ref="conversation" class="conversation">
      <div 
        v-for="(message, index) in service?.messages" 
        :key="index"
        class="chat-message" 
        :class="message.role"
      >
        <div v-if="message.role === 'assistant'" v-html="renderMarkdown(message.content)"></div>
        <template v-else>{{ message.content }}</template>
      </div>
    </div>
    <div class="chat-input">
      <div class="input-container">
        <input 
          type="text" 
          v-model="userMessage" 
          class="input-field" 
          :placeholder="t('chat.input')"
          :disabled="!service?.isConnected"
          @keydown="handleKeydown"
        />
        <button 
          @click="sendMessage"
          :disabled="!service?.isConnected || !userMessage.trim()"
        >
          {{ t('chat.send') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  color: #888;
}

.conversation {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(136, 136, 136, 0.8) transparent;
  padding-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.conversation::-webkit-scrollbar {
  width: 0.5rem;
  border-radius: 0.5rem; 
}

.conversation::-webkit-scrollbar-track {
  background: #8882; 
  border-radius: 0.5rem; 
}

.conversation::-webkit-scrollbar-thumb {
  background-color: rgba(136, 136, 136, 0.8); 
  border-radius: 0.5rem; 
}

.chat-message {
  display: block;
  max-width: 90%;
  padding: 0.5rem 1rem;
  color: #fff;
  margin: 0.5rem;
  border-radius: 1rem;
}

.chat-message.user {
  margin-left: auto;
  border-bottom-right-radius: 0;
  background-color: #fab3;
  text-align: right;
}

.chat-message.assistant {
  margin-right: auto;
  border-top-left-radius: 0;
  background-color: #aff1;
  text-align: left;
}

.chat-message.assistant :deep(p) {
  margin: 0.3rem 0;
}

.chat-message.assistant :deep(h1),
.chat-message.assistant :deep(h2),
.chat-message.assistant :deep(h3),
.chat-message.assistant :deep(h4),
.chat-message.assistant :deep(h5),
.chat-message.assistant :deep(h6) {
  margin: 0.3rem 0;
  font-size: 1.2rem;
}

.chat-message.assistant :deep(code) {
  background-color: #0002;
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
}

.chat-message.assistant :deep(pre) {
  background-color: #0002;
  padding: 0.5rem;
  border-radius: 0.3rem;
  overflow-x: auto;
}

.chat-message.assistant :deep(strong) {
  color: #fff;
}

.chat-message.assistant :deep(ul),
.chat-message.assistant :deep(ol) {
  margin: 0.2rem 0;
  padding-left: 0.5rem;
}

.input-container {
  display: flex;
  border-radius: 20px;
  overflow: hidden;
  background-color: #1118;
}

.input-container button {
  border-radius: 0;
  background-color: #0008;
}

.input-container button:focus {
  outline: none;
  background-color: #000c;
}

.input-field {
  border: none;
  outline: none;
  background: none;
  flex: 1;
  padding: 1rem;
}
</style>
