<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

//use i18n
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

class Message {
   constructor(
    public role: 'user' | 'assistant',
    public content: string
   ) {}
}

const messages = ref<Message[]>([])
const isLoading = ref(false)

const loadConversation = async () => {
  try {
    const response = await fetch('/api/chat/history', {
      credentials: 'include'  
    })
    const history = await response.json()
    messages.value = history.map((msg: any) => new Message(msg.role, msg.content))
  } catch (error) {
    console.error('Error loading conversation:', error)
  }
}

const startConversation = async () => {
  isLoading.value = true
  try {
    const response = await fetch('/api/chat/start', {
      method: 'POST',
      credentials: 'include'  
    })
    
    const reader = response.body?.getReader()
    if (!reader) return
    
    let assistantMessage = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = new TextDecoder().decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = JSON.parse(line.slice(6))
          assistantMessage += content
          if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'assistant') {
            messages.value[messages.value.length - 1].content = assistantMessage
          } else {
            messages.value.push(new Message('assistant', assistantMessage))
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    isLoading.value = false
  }
}

const sendMessage = async () => {
  if (!input.value.trim()) return
  
  const userMessage = new Message('user', input.value)
  messages.value.push(userMessage)
  const messageContent = input.value
  input.value = ''
  isLoading.value = true

  try {
    const response = await fetch('/api/chat/message', {
      method: 'POST',
      credentials: 'include',  
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageContent
      })
    })

    const reader = response.body?.getReader()
    if (!reader) return

    let assistantMessage = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = new TextDecoder().decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = JSON.parse(line.slice(6))
          assistantMessage += content
          if (messages.value.length > 0 && messages.value[messages.value.length - 1].role === 'assistant') {
            messages.value[messages.value.length - 1].content = assistantMessage
          } else {
            messages.value.push(new Message('assistant', assistantMessage))
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    isLoading.value = false
  }
}

// On mount, try to load existing conversation or start a new one
onMounted(async () => {
  await loadConversation()
  if (messages.value.length === 0) {
    await startConversation()
  }
})

const input = ref('')

// Add a method to safely render markdown
const renderMarkdown = (content: string) => {
  const rawHtml = marked.parse(content)
  return DOMPurify.sanitize(rawHtml)
}
</script>

<template>
  <div class="chat-container">
    <div class="chat-header">
    </div>
    <div class="conversation">
      <div 
        v-for="message in messages" 
        :key="message.content" 
        class="chat-message" 
        :class="message.role"
      >
        <div v-if="message.role === 'assistant'" v-html="renderMarkdown(message.content)"></div>
        <template v-else>{{ message.content }}</template>
      </div>
    </div>
    <div class="chat-input" @keydown.enter="sendMessage">
      <div class="input-container">
        <input type="text" v-model="input" class="input-field" :placeholder="t('chat.input')" />
        <button @click="sendMessage">{{ t('chat.send') }}</button>
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
  
  &.user {
    margin-left: auto;
    border-bottom-right-radius: 0;
    background-color: #fab3;
    text-align: right;
  }

  &.assistant {
    margin-right: auto;
    border-top-left-radius: 0;
    background-color: #aff1;
    text-align: left;
    
    :deep(p) {
      margin: 0.3rem 0;
    }

    :deep(h1, h2, h3, h4, h5, h6) {
      margin: 0.3rem 0;
      font-size: 1.2rem;
    }

    :deep(code) {
      background-color: #0002;
      padding: 0.2rem 0.4rem;
      border-radius: 0.3rem;
    }

    :deep(pre) {
      background-color: #0002;
      padding: 0.5rem;
      border-radius: 0.3rem;
      overflow-x: auto;
    }

    :deep(strong) {
      color: #fff;
    }

    :deep(ul, ol) {
      margin: 0.2rem 0;
      padding-left: 0.5rem;
    }
  }
}

.input-container {
  display: flex;
  border-radius: 20px;
  overflow: hidden;
  background-color: #1118;
  button {
    border-radius: 0;
    background-color: #0008;
    &:focus{
      outline: none;
      background-color: #000c;
    }
  }
}

.input-field {
  border: none;
  outline: none;
  background: none;
  flex: 1;
  padding: 1rem; 
}

</style>
