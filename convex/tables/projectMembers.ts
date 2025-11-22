import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const add = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, { projectId, userId, role }) => {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const existing = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_user", (q) =>
        q.eq("projectId", projectId).eq("userId", userId)
      )
      .unique();

    if (existing) {
      throw new Error(
        `User ${userId} is already a member of project ${projectId}`
      );
    }

    return await ctx.db.insert("projectMembers", {
      projectId,
      userId,
      role,
      invitedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("projectMembers") },
  handler: async (ctx, { id }) => {
    const member = await ctx.db.get(id);
    if (!member) {
      throw new Error(`Project member ${id} not found`);
    }

    await ctx.db.delete(id);
  },
});

export const updateRole = mutation({
  args: {
    id: v.id("projectMembers"),
    role: v.union(v.literal("owner"), v.literal("editor"), v.literal("viewer")),
  },
  handler: async (ctx, { id, role }) => {
    const member = await ctx.db.get(id);
    if (!member) {
      throw new Error(`Project member ${id} not found`);
    }

    await ctx.db.patch(id, { role });
  },
});
