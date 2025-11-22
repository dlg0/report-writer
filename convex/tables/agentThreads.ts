import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: { id: v.id("agentThreads") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("agentThreads")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    anchorSectionId: v.optional(v.id("sections")),
    anchorCommentId: v.optional(v.id("comments")),
    metadata: v.optional(v.any()),
  },
  handler: async (
    ctx,
    { projectId, title, anchorSectionId, anchorCommentId, metadata }
  ) => {
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

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    if (anchorSectionId) {
      const section = await ctx.db.get(anchorSectionId);
      if (!section || section.projectId !== projectId) {
        throw new Error("Invalid anchor section");
      }
    }

    if (anchorCommentId) {
      const comment = await ctx.db.get(anchorCommentId);
      if (!comment || comment.projectId !== projectId) {
        throw new Error("Invalid anchor comment");
      }
    }

    return await ctx.db.insert("agentThreads", {
      projectId,
      title,
      createdByUserId: user._id,
      createdAt: Date.now(),
      status: "active",
      anchorSectionId,
      anchorCommentId,
      metadata,
    });
  },
});
