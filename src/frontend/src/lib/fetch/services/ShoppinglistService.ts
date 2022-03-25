/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class ShoppinglistService {

  /**
   * Get Shopping List
   * Get all shopping list items in the database.
   * @returns string Successful Response
   * @throws ApiError
   */
  public static getShoppingList(): CancelablePromise<string[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/private/shoppinglist",
    });
  }

  /**
   * Put Shopping List
   * Overwrite the shopping list, replacing the existing list with the items provided.
   * @param requestBody
   * @returns void
   * @throws ApiError
   */
  public static putShoppingList(
    requestBody: string[],
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/private/shoppinglist",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Patch Shopping List
   * Update the shopping list, adding the items provided.
   * @param requestBody
   * @returns void
   * @throws ApiError
   */
  public static patchShoppingList(
    requestBody: string[],
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/private/shoppinglist",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

}