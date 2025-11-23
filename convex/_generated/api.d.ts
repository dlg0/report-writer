/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as features_agent from "../features/agent.js";
import type * as features_locking from "../features/locking.js";
import type * as features_versions from "../features/versions.js";
import type * as tables_agentMessages from "../tables/agentMessages.js";
import type * as tables_agentThreads from "../tables/agentThreads.js";
import type * as tables_blocks from "../tables/blocks.js";
import type * as tables_comments from "../tables/comments.js";
import type * as tables_locks from "../tables/locks.js";
import type * as tables_projectMembers from "../tables/projectMembers.js";
import type * as tables_projects from "../tables/projects.js";
import type * as tables_reportVersions from "../tables/reportVersions.js";
import type * as tables_sections from "../tables/sections.js";
import type * as tables_users from "../tables/users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "features/agent": typeof features_agent;
  "features/locking": typeof features_locking;
  "features/versions": typeof features_versions;
  "tables/agentMessages": typeof tables_agentMessages;
  "tables/agentThreads": typeof tables_agentThreads;
  "tables/blocks": typeof tables_blocks;
  "tables/comments": typeof tables_comments;
  "tables/locks": typeof tables_locks;
  "tables/projectMembers": typeof tables_projectMembers;
  "tables/projects": typeof tables_projects;
  "tables/reportVersions": typeof tables_reportVersions;
  "tables/sections": typeof tables_sections;
  "tables/users": typeof tables_users;
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
