import { mutation, action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";

export const createThread = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    anchorSectionId: v.optional(v.id("sections")),
    anchorCommentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, { projectId, title, anchorSectionId, anchorCommentId }) => {
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

    const threadId = await ctx.runMutation(api.tables.agentThreads.create, {
      projectId,
      title,
      anchorSectionId,
      anchorCommentId,
    });

    return threadId;
  },
});

export const forkThread = mutation({
  args: {
    parentThreadId: v.id("agentThreads"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, { parentThreadId, title }) => {
    const parentThread = await ctx.db.get(parentThreadId);
    if (!parentThread) {
      throw new Error(`Parent thread ${parentThreadId} not found`);
    }

    const forkTitle = title || `Fork of "${parentThread.title}"`;

    const newThreadId = await ctx.runMutation(api.tables.agentThreads.create, {
      projectId: parentThread.projectId,
      title: forkTitle,
      anchorSectionId: parentThread.anchorSectionId,
      anchorCommentId: parentThread.anchorCommentId,
      metadata: {
        parent_thread_id: parentThreadId,
      },
    });

    return newThreadId;
  },
});

export const appendMessage = mutation({
  args: {
    threadId: v.id("agentThreads"),
    senderType: v.union(v.literal("user"), v.literal("agent")),
    content: v.string(),
    senderUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, { threadId, senderType, content, senderUserId }) => {
    const messageId = await ctx.runMutation(api.tables.agentMessages.create, {
      threadId,
      senderType,
      senderUserId,
      content,
    });

    return messageId;
  },
});

export const runAgentOnThread = action({
  args: {
    threadId: v.id("agentThreads"),
    userMessage: v.string(),
  },
  handler: async (ctx, { threadId, userMessage }) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(api.tables.users.getByEmail, {
      email: userId.email!,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const thread = await ctx.runQuery(api.tables.agentThreads.getById, {
      id: threadId,
    });

    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }

    const lock = await ctx.runMutation(api.features.locking.acquireLock, {
      projectId: thread.projectId,
      resourceType: "thread",
      resourceId: threadId,
    });

    try {
      const userMessageId = await ctx.runMutation(
        api.tables.agentMessages.create,
        {
          threadId,
          senderType: "user",
          senderUserId: user._id,
          content: userMessage,
        }
      );

      const messages = await ctx.runQuery(api.tables.agentMessages.listByThread, {
        threadId,
      });

      const sections = await ctx.runQuery(api.tables.sections.listByProject, {
        projectId: thread.projectId,
      });

      const contextSections = [];
      for (const section of sections) {
        const blocks = await ctx.runQuery(api.tables.blocks.listBySection, {
          sectionId: section._id,
        });
        contextSections.push({
          sectionId: section._id,
          headingText: section.headingText,
          headingLevel: section.headingLevel,
          blocks: blocks.map((b) => ({
            blockId: b._id,
            blockType: b.blockType,
            markdownText: b.markdownText,
          })),
        });
      }

      const sandboxUrl =
        process.env.SANDBOX_URL || "http://localhost:8000";

      let agentResponse;
      let proposedEdits = [];

      try {
        const response = await fetch(`${sandboxUrl}/v1/agent/run`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            threadId,
            messages: messages.map((m) => ({
              senderType: m.senderType,
              content: m.content,
            })),
            context: {
              sections: contextSections,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Sandbox API error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        agentResponse = data.response || "Agent processing complete";
        proposedEdits = data.proposed_edits || [];
      } catch (error: any) {
        console.error("Sandbox API error:", error);
        agentResponse = `Agent temporarily unavailable: ${error.message}. Please try again later.`;
      }

      const agentMessageId = await ctx.runMutation(
        api.tables.agentMessages.create,
        {
          threadId,
          senderType: "agent",
          content: agentResponse,
          toolCalls: proposedEdits.length > 0 ? proposedEdits : undefined,
        }
      );

      await ctx.runMutation(api.features.locking.releaseLock, {
        lockId: lock._id,
      });

      return {
        messageId: agentMessageId,
        proposedEdits,
      };
    } catch (error) {
      await ctx.runMutation(api.features.locking.releaseLock, {
        lockId: lock._id,
      });
      throw error;
    }
  },
});

export const applyAgentEdits = mutation({
  args: {
    threadId: v.id("agentThreads"),
    messageId: v.id("agentMessages"),
  },
  handler: async (ctx, { threadId, messageId }) => {
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

    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error(`Message ${messageId} not found`);
    }

    if (message.threadId !== threadId) {
      throw new Error("Message does not belong to thread");
    }

    if (!message.toolCalls || message.toolCalls.length === 0) {
      throw new Error("No proposed edits in message");
    }

    const thread = await ctx.db.get(threadId);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }

    for (const edit of message.toolCalls) {
      if (edit.type === "edit_block" && edit.blockId && edit.newText) {
        await ctx.runMutation(api.tables.blocks.updateText, {
          id: edit.blockId,
          markdownText: edit.newText,
          editorUserId: user._id,
          editType: "agent",
        });
      }
    }

    const versionId = await ctx.runMutation(
      api.features.versions.createVersionSnapshot,
      {
        projectId: thread.projectId,
        summary: `Applied agent edits from thread "${thread.title}"`,
      }
    );

    await ctx.db.patch(messageId, {
      appliedEditVersionId: versionId,
    });

    return versionId;
  },
});
