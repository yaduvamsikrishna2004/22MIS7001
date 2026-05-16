export interface ApiMeta {
  requestId: string;
  timestamp: string;
}

export interface ApiSuccessEnvelope<TData> {
  data: TData;
  meta: ApiMeta;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  traceId: string;
  timestamp: string;
  retryable: boolean;
  details?: Record<string, string | number | boolean | null>;
}

export interface ApiErrorEnvelope {
  error: ApiErrorBody;
}
