import { ContentfulStatusCode } from "hono/utils/http-status";

export type ResultType<T, E> =
  | {
      ok: true;
      message?: string;
      data?: T;
      statusCode: ContentfulStatusCode | 200;
    }
  | {
      ok: false;
      message?: string;
      errors?: E;
      statusCode: ContentfulStatusCode;
    };
