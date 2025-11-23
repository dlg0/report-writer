import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    sectionId: v.optional(v.id("sections")),
    blockId: v.optional(v.id("blocks")),
    body: v.string(),
    assigneeType: v.optional(v.union(v.literal("human"), v.literal("agent"))),
    assigneeUserId: v.optional(v.id("users")),
    linkedSections: v.optional(v.array(v.id("sections"))),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", userId.email!))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const commentId = await ctx.db.insert("comments", {
      projectId: args.projectId,
      sectionId: args.sectionId,
      blockId: args.blockId,
      authorUserId: user._id,
      createdAt: Date.now(),
      body: args.body,
      status: "open",
      assigneeType: args.assigneeType,
      assigneeUserId: args.assigneeUserId,
      linkedSections: args.linkedSections,
    });

    return commentId;
  },
});

export const listByProject = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(v.union(v.literal("open"), v.literal("resolved"), v.literal("deferred"))),
    assigneeUserId: v.optional(v.id("users")),
    assigneeType: v.optional(v.union(v.literal("human"), v.literal("agent"))),
  },
  handler: async (ctx, { projectId, status, assigneeUserId, assigneeType }) => {
    let comments = await ctx.db
      .query("comments")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    if (status) {
      comments = comments.filter((c) => c.status === status);
    }

    if (assigneeUserId) {
      comments = comments.filter((c) => c.assigneeUserId === assigneeUserId);
    }

    if (assigneeType) {
      comments = comments.filter((c) => c.assigneeType === assigneeType);
    }

    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorUserId);
        const assignee = comment.assigneeUserId ? await ctx.db.get(comment.assigneeUserId) : null;
        const resolvedBy = comment.resolvedByUserId ? await ctx.db.get(comment.resolvedByUserId) : null;
        const section = comment.sectionId ? await ctx.db.get(comment.sectionId) : null;
        const block = comment.blockId ? await ctx.db.get(comment.blockId) : null;

        return {
          ...comment,
          author,
          assignee,
          resolvedBy,
          section,
          block,
        };
      })
    );

    return commentsWithAuthors.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getById = query({
  args: { id: v.id("comments") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("comments"),
    body: v.optional(v.string()),
    status: v.optional(v.union(v.literal("open"), v.literal("resolved"), v.literal("deferred"))),
    assigneeType: v.optional(v.union(v.literal("human"), v.literal("agent"))),
    assigneeUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const resolve = mutation({
  args: {
    id: v.id("comments"),
    resolutionSummary: v.optional(v.string()),
  },
  handler: async (ctx, { id, resolutionSummary }) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", userId.email!))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(id, {
      status: "resolved",
      resolutionSummary,
      resolvedByUserId: user._id,
      resolvedAt: Date.now(),
    });

    return id;
  },
});

export const assignToAgent = mutation({
  args: {
    id: v.id("comments"),
  },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      assigneeType: "agent",
      assigneeUserId: undefined,
    });

    return id;
  },
});

export const assignToUser = mutation({
  args: {
    id: v.id("comments"),
    userId: v.id("users"),
  },
  handler: async (ctx, { id, userId }) => {
    await ctx.db.patch(id, {
      assigneeType: "human",
      assigneeUserId: userId,
    });

    return id;
  },
});
