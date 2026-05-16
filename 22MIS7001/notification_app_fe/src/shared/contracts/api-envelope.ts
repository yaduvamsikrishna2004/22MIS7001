export interface ApiMeta {
  requestId: string;
  timestamp: string;
}

export interface ApiSuccessEnvelope<TData> {
  data: TData;
  meta: ApiMeta;
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    traceId: string;
    timestamp: string;
    retryable: boolean;
  };
}
