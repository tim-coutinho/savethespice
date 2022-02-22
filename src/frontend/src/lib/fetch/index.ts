import { endpoint } from "@/config";
import { prefix } from "@/utils/common";

interface FetchResponse<T> {
  data: T;
  message: string;
}

const serialize = (obj?: Record<string, unknown> | string) =>
  encodeURI(
    Object.entries(obj ?? {}).reduce(
      (acc, [key, val]) => `${acc}${acc === "" ? "?" : "&"}${key}=${val}`,
      "",
    ),
  );

const wrapFetch = <T = undefined>(
  resource: string,
  config: { options?: RequestInit; params?: string | Record<string, unknown> } = {
    options: { method: "GET" },
    params: "",
  },
): Promise<[FetchResponse<T>, number]> =>
  fetch(`${endpoint}/${resource}${serialize(config.params)}`, {
    headers: {
      Authorization: sessionStorage.getItem(`${prefix}idToken`) as string,
      "Content-Type": "application/json",
    },
    ...config.options,
    body: config.options?.body ?? null,
  })
    .then(async res => {
      if (res.status === 204) {
        return [{}, res.status];
      }
      const body = await res.json();
      return [body, res.status];
    })
    .catch(e => {
      console.error(e);
      return [{}, 500];
    }) as Promise<[FetchResponse<T>, number]>; // Fetch only rejects on network errors

export const api = {
  get: <T>(
    resource: string,
    params?: Record<string, unknown>,
  ): Promise<[FetchResponse<T>, number]> =>
    wrapFetch<T>(resource, { options: { method: "GET" }, params }),
  post: <T, S>(resource: string, body: S): Promise<[FetchResponse<T>, number]> =>
    wrapFetch<T>(resource, { options: { method: "POST", body: JSON.stringify(body) } }),
  put: <T, S>(resource: string, body: S): Promise<[FetchResponse<T>, number]> =>
    wrapFetch<T>(resource, { options: { method: "PUT", body: JSON.stringify(body) } }),
  delete: <T>(resource: string): Promise<[FetchResponse<T>, number]> =>
    wrapFetch<T>(resource, { options: { method: "DELETE" } }),
};
