/* eslint-disable */
import type { CreateShareLinkRequest } from "../types/CreateShareLinkRequest";
import type { CreateShareLinkResponse } from "../types/CreateShareLinkResponse";
import type { GetRecipeWithShareIdResponse } from "../types/GetRecipeWithShareIdResponse";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class ShareService {

  /**
   * Get
   * Get the details for a recipe given a share link.
   * @param shareId
   * @returns GetRecipeWithShareIdResponse Successful Response
   * @throws ApiError
   */
  public static get(
    shareId: string,
  ): CancelablePromise<GetRecipeWithShareIdResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/public/share/{share_id}",
      path: {
        'share_id': shareId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create Share Link
   * Generate a share link for the given recipe.
   * @param requestBody
   * @returns CreateShareLinkResponse Successful Response
   * @throws ApiError
   */
  public static createShareLink(
    requestBody: CreateShareLinkRequest,
  ): CancelablePromise<CreateShareLinkResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/public/share",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

}