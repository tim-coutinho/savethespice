/* eslint-disable */
import type { ConfirmForgotPasswordRequest } from "../types/ConfirmForgotPasswordRequest";
import type { ConfirmForgotPasswordResponse } from "../types/ConfirmForgotPasswordResponse";
import type { ConfirmSignUpRequest } from "../types/ConfirmSignUpRequest";
import type { ConfirmSignUpResponse } from "../types/ConfirmSignUpResponse";
import type { ForgotPasswordRequest } from "../types/ForgotPasswordRequest";
import type { ForgotPasswordResponse } from "../types/ForgotPasswordResponse";
import type { RefreshIdTokenRequest } from "../types/RefreshIdTokenRequest";
import type { RefreshIdTokenResponse } from "../types/RefreshIdTokenResponse";
import type { ResendCodeRequest } from "../types/ResendCodeRequest";
import type { ResendCodeResponse } from "../types/ResendCodeResponse";
import type { SignInRequest } from "../types/SignInRequest";
import type { SignInResponse } from "../types/SignInResponse";
import type { SignUpRequest } from "../types/SignUpRequest";
import type { SignUpResponse } from "../types/SignUpResponse";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class AuthService {

  /**
   * Sign Up
   * Sign up using email and password, sending a confirmation code to the email.
   * @param requestBody
   * @returns SignUpResponse Successful Response
   * @throws ApiError
   */
  public static signUp(
    requestBody: SignUpRequest,
  ): CancelablePromise<SignUpResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/public/auth/signup",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Confirm Sign Up
   * Confirm sign up using a confirmation code.
   * @param requestBody
   * @returns ConfirmSignUpResponse Successful Response
   * @throws ApiError
   */
  public static confirmSignUp(
    requestBody: ConfirmSignUpRequest,
  ): CancelablePromise<ConfirmSignUpResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/public/auth/confirmsignup",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Sign In
   * Sign in using email and password, returning an id token, refresh token, and user string.
   * @param requestBody
   * @returns SignInResponse Successful Response
   * @throws ApiError
   */
  public static signIn(
    requestBody: SignInRequest,
  ): CancelablePromise<SignInResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/public/auth/signin",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Refresh Id Token
   * Refresh a user's ID token using a refresh token, returning an id token and user string.
   * @param requestBody
   * @returns RefreshIdTokenResponse Successful Response
   * @throws ApiError
   */
  public static refreshIdToken(
    requestBody: RefreshIdTokenRequest,
  ): CancelablePromise<RefreshIdTokenResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/public/auth/refreshidtoken",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Resend Code
   * Resend a confirmation code to a user's email.
   * @param requestBody
   * @returns ResendCodeResponse Successful Response
   * @throws ApiError
   */
  public static resendCode(
    requestBody: ResendCodeRequest,
  ): CancelablePromise<ResendCodeResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/public/auth/resendcode",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Forgot Password
   * Send a forgot password email to a user.
   * @param requestBody
   * @returns ForgotPasswordResponse Successful Response
   * @throws ApiError
   */
  public static forgotPassword(
    requestBody: ForgotPasswordRequest,
  ): CancelablePromise<ForgotPasswordResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/public/auth/forgotpassword",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Confirm Forgot Password
   * Reset a user's password using a confirmation code and a new password.
   * @param requestBody
   * @returns ConfirmForgotPasswordResponse Successful Response
   * @throws ApiError
   */
  public static confirmForgotPassword(
    requestBody: ConfirmForgotPasswordRequest,
  ): CancelablePromise<ConfirmForgotPasswordResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/public/auth/confirmforgotpassword",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

}