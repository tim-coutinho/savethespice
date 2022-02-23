export const endpoint =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:5000"
    : "https://60w0oys2v9.execute-api.us-west-2.amazonaws.com/prod";
// export const jwkEndpoint =
//   "https://cognito-idp.us-west-2.amazonaws.com/us-west-2_ZXVJmIRp1/.well-known/jwks.json";
