export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;
  
  public isConnected = false;
  public messages: Array<{ role: string; content: string }> = [];

  constructor(private url: string, private onMessage: (message: any) => void) {}

  public connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.onMessage(data);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.tryReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        this.ws?.close();
      };
    } catch (error) {
      this.isConnected = false;
      this.tryReconnect();
    }
  }

  private tryReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    }
  }

  public sendMessage(message: string): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ message }));
      this.messages.push({ role: 'user', content: message });
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }
} 