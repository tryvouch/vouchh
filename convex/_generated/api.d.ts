/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_analyzeSentiment from "../actions/analyzeSentiment.js";
import type * as actions_processReview from "../actions/processReview.js";
import type * as actions_seedReviews from "../actions/seedReviews.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as crons from "../crons.js";
import type * as dunning from "../dunning.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as public_reviews from "../public/reviews.js";
import type * as reviews from "../reviews.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";
import type * as widgets from "../widgets.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/analyzeSentiment": typeof actions_analyzeSentiment;
  "actions/processReview": typeof actions_processReview;
  "actions/seedReviews": typeof actions_seedReviews;
  analytics: typeof analytics;
  auth: typeof auth;
  billing: typeof billing;
  crons: typeof crons;
  dunning: typeof dunning;
  helpers: typeof helpers;
  http: typeof http;
  "public/reviews": typeof public_reviews;
  reviews: typeof reviews;
  users: typeof users;
  webhooks: typeof webhooks;
  widgets: typeof widgets;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
