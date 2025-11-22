import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const listByThread = query({
  args: { threadId: v.id("agentThreads") },
  handler: async (ctx, { threadId }) => {
    return await ctx.db
      .query("agentMessages")
      .withIndex("by_thread_created", (q) => q.eq("threadId", threadId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    threadId: v.id("agentThreads"),
    senderType: v.union(v.literal("user"), v.literal("agent")),
    senderUserId: v.optional(v.id("users")),
    content: v.string(),
    toolCalls: v.optional(v.array(v.any())),
    appliedEditVersionId: v.optional(v.id("reportVersions")),
  },
  handler: async (
    ctx,
    {
      threadId,
      senderType,
      senderUserId,
      content,
      toolCalls,
      appliedEditVersionId,
    }
  ) => {
    const thread = await ctx.db.get(threadId);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }

    if (senderUserId) {
      const user = await ctx.db.get(senderUserId);
      if (!user) {
        throw new Error(`User ${senderUserId} not found`);
      }
    }

    return await ctx.db.insert("agentMessages", {
      threadId,
      senderType,
      senderUserId,
      createdAt: Date.now(),
      content,
      toolCalls,
      appliedEditVersionId,
    });
  },
});
