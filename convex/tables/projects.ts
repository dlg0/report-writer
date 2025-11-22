import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
  },
});

export const create = mutation({
  args: {
    ownerId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { ownerId, name, description }) => {
    const owner = await ctx.db.get(ownerId);
    if (!owner) {
      throw new Error(`User ${ownerId} not found`);
    }

    return await ctx.db.insert("projects", {
      ownerId,
      name,
      description,
      createdAt: Date.now(),
      archived: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, name, description }) => {
    const project = await ctx.db.get(id);
    if (!project) {
      throw new Error(`Project ${id} not found`);
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    await ctx.db.patch(id, updates);
  },
});

export const archive = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const project = await ctx.db.get(id);
    if (!project) {
      throw new Error(`Project ${id} not found`);
    }

    await ctx.db.patch(id, { archived: true });
  },
});
