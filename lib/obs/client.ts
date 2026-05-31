import { computeObsAuth } from "./auth";

type ObsMessageHandler = (data: Record<string, unknown>) => void;

interface PendingRequest {
  resolve: (data: Record<string, unknown>) => void;
  reject: (error: Error) => void;
}

/**
 * Minimal OBS WebSocket v5 client for browser (iPad presenter remote).
 */
export class ObsWebSocketClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, PendingRequest>();
  private eventHandlers = new Map<string, Set<ObsMessageHandler>>();
  private requestCounter = 0;

  onEvent(eventType: string, handler: ObsMessageHandler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
    return () => this.eventHandlers.get(eventType)?.delete(handler);
  }

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect(host: string, port: number, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws) {
        this.disconnect();
      }

      const url = `ws://${host}:${port}`;
      const ws = new WebSocket(url);
      this.ws = ws;

      let identified = false;

      ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data as string) as {
            op: number;
            d: Record<string, unknown>;
          };

          if (message.op === 0) {
            const auth = message.d.authentication as
              | { challenge: string; salt: string }
              | undefined;

            const identifyPayload: Record<string, unknown> = {
              rpcVersion: 1,
            };

            if (auth && password) {
              identifyPayload.authentication = await computeObsAuth(
                password,
                auth.salt,
                auth.challenge
              );
            } else if (auth && !password) {
              reject(new Error("OBS requires a password — enter it in settings."));
              ws.close();
              return;
            }

            ws.send(JSON.stringify({ op: 1, d: identifyPayload }));
            return;
          }

          if (message.op === 2) {
            identified = true;
            resolve();
            return;
          }

          if (message.op === 7) {
            const d = message.d;
            const requestId = d.requestId as string;
            const pending = this.pending.get(requestId);
            if (!pending) return;

            this.pending.delete(requestId);
            const status = d.requestStatus as { result: boolean; comment?: string };
            if (status.result) {
              pending.resolve((d.responseData as Record<string, unknown>) ?? {});
            } else {
              pending.reject(
                new Error(status.comment ?? "OBS request failed")
              );
            }
            return;
          }

          if (message.op === 5) {
            const eventType = message.d.eventType as string;
            const eventData = message.d.eventData as Record<string, unknown>;
            this.eventHandlers.get(eventType)?.forEach((handler) => {
              handler(eventData);
            });
          }
        } catch (err) {
          if (!identified) {
            reject(err instanceof Error ? err : new Error(String(err)));
          }
        }
      };

      ws.onerror = () => {
        reject(new Error(`Cannot connect to OBS at ${url}`));
      };

      ws.onclose = () => {
        this.ws = null;
        this.pending.forEach((pending) => {
          pending.reject(new Error("OBS connection closed"));
        });
        this.pending.clear();
      };
    });
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
  }

  async request(
    requestType: string,
    requestData?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!this.connected || !this.ws) {
      throw new Error("Not connected to OBS");
    }

    const requestId = `sn-${++this.requestCounter}`;
    return new Promise((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
      this.ws!.send(
        JSON.stringify({
          op: 6,
          d: { requestType, requestId, requestData: requestData ?? {} },
        })
      );

      setTimeout(() => {
        if (this.pending.has(requestId)) {
          this.pending.delete(requestId);
          reject(new Error(`OBS request timed out: ${requestType}`));
        }
      }, 8000);
    });
  }

  async getCurrentScene(): Promise<string> {
    const data = await this.request("GetCurrentProgramScene");
    return data.currentProgramSceneName as string;
  }

  async setScene(sceneName: string): Promise<void> {
    await this.request("SetCurrentProgramScene", { sceneName });
  }
}
