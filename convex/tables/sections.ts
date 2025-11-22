import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getById = query({
  args: { id: v.id("sections") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query("sections")
      .withIndex("by_project_order", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    headingText: v.string(),
    headingLevel: v.number(),
    order: v.number(),
  },
  handler: async (ctx, { projectId, headingText, headingLevel, order }) => {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    return await ctx.db.insert("sections", {
      projectId,
      headingText,
      headingLevel,
      order,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("sections"),
    headingText: v.optional(v.string()),
    headingLevel: v.optional(v.number()),
  },
  handler: async (ctx, { id, headingText, headingLevel }) => {
    const section = await ctx.db.get(id);
    if (!section) {
      throw new Error(`Section ${id} not found`);
    }

    const updates: Record<string, any> = {};
    if (headingText !== undefined) updates.headingText = headingText;
    if (headingLevel !== undefined) updates.headingLevel = headingLevel;

    await ctx.db.patch(id, updates);
  },
});

export const deleteSection = mutation({
  args: { id: v.id("sections") },
  handler: async (ctx, { id }) => {
    const section = await ctx.db.get(id);
    if (!section) {
      throw new Error(`Section ${id} not found`);
    }

    await ctx.db.delete(id);
  },
});

export const reorder = mutation({
  args: {
    projectId: v.id("projects"),
    newOrder: v.array(v.object({ id: v.id("sections"), order: v.number() })),
  },
  handler: async (ctx, { projectId, newOrder }) => {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    for (const { id, order } of newOrder) {
      const section = await ctx.db.get(id);
      if (!section) {
        throw new Error(`Section ${id} not found`);
      }
      if (section.projectId !== projectId) {
        throw new Error(`Section ${id} does not belong to project ${projectId}`);
      }
      await ctx.db.patch(id, { order });
    }
  },
});
