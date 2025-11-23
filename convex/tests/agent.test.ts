import { describe, it, expect, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { Id } from "convex/values";
import * as agentModule from "../features/agent";
import * as agentThreadsModule from "../tables/agentThreads";
import * as blocksModule from "../tables/blocks";

describe("Agent threads", () => {
  let t: ReturnType<typeof convexTest>;
  let userId: Id<"users">;
  let projectId: Id<"projects">;
  let sectionId: Id<"sections">;

  beforeEach(async () => {
    t = convexTest(schema, {});

    userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "test@example.com",
        name: "Test User",
        createdAt: Date.now(),
      });
    });

    projectId = await t.run(async (ctx) => {
      return await ctx.db.insert("projects", {
        ownerId: userId,
        name: "Test Project",
        createdAt: Date.now(),
        archived: false,
      });
    });

    sectionId = await t.run(async (ctx) => {
      return await ctx.db.insert("sections", {
        projectId,
        headingText: "Introduction",
        headingLevel: 1,
        order: 0,
        createdAt: Date.now(),
      });
    });
  });

  it("creates thread", async () => {
    const threadId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentThreads", {
        projectId,
        title: "Test Thread",
        createdByUserId: userId,
        createdAt: Date.now(),
        status: "active",
      });
    });

    const thread = await t.query(agentThreadsModule.getById, {
      id: threadId,
    });

    expect(thread).toBeTruthy();
    expect(thread?.title).toBe("Test Thread");
    expect(thread?.status).toBe("active");
  });

  it("creates thread with anchor section", async () => {
    const threadId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentThreads", {
        projectId,
        title: "Anchored Thread",
        createdByUserId: userId,
        createdAt: Date.now(),
        status: "active",
        anchorSectionId: sectionId,
      });
    });

    const thread = await t.query(agentThreadsModule.getById, {
      id: threadId,
    });

    expect(thread?.anchorSectionId).toBe(sectionId);
  });

  it("forks thread with parent metadata", async () => {
    const parentThreadId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentThreads", {
        projectId,
        title: "Parent Thread",
        createdByUserId: userId,
        createdAt: Date.now(),
        status: "active",
        anchorSectionId: sectionId,
      });
    });

    const forkedThreadId = await t.mutation(agentModule.forkThread, {
      parentThreadId,
      title: "Custom Fork Title",
    });

    const forkedThread = await t.query(agentThreadsModule.getById, {
      id: forkedThreadId,
    });

    expect(forkedThread?.title).toBe("Custom Fork Title");
    expect(forkedThread?.projectId).toBe(projectId);
    expect(forkedThread?.anchorSectionId).toBe(sectionId);
    expect(forkedThread?.metadata).toHaveProperty("parent_thread_id");
    expect(forkedThread?.metadata.parent_thread_id).toBe(parentThreadId);
  });

  it("forks thread with default title", async () => {
    const parentThreadId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentThreads", {
        projectId,
        title: "Original",
        createdByUserId: userId,
        createdAt: Date.now(),
        status: "active",
      });
    });

    const forkedThreadId = await t.mutation(agentModule.forkThread, {
      parentThreadId,
    });

    const forkedThread = await t.query(agentThreadsModule.getById, {
      id: forkedThreadId,
    });

    expect(forkedThread?.title).toBe('Fork of "Original"');
  });

  it("appends message to thread", async () => {
    const threadId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentThreads", {
        projectId,
        title: "Test Thread",
        createdByUserId: userId,
        createdAt: Date.now(),
        status: "active",
      });
    });

    const messageId = await t.mutation(agentModule.appendMessage, {
      threadId,
      senderType: "user",
      content: "Hello, agent!",
      senderUserId: userId,
    });

    const message = await t.run(async (ctx) => {
      return await ctx.db.get(messageId);
    });

    expect(message).toBeTruthy();
    expect(message?.content).toBe("Hello, agent!");
    expect(message?.senderType).toBe("user");
    expect(message?.senderUserId).toBe(userId);
  });

  it("appends agent message", async () => {
    const threadId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentThreads", {
        projectId,
        title: "Test Thread",
        createdByUserId: userId,
        createdAt: Date.now(),
        status: "active",
      });
    });

    const messageId = await t.mutation(agentModule.appendMessage, {
      threadId,
      senderType: "agent",
      content: "I can help with that.",
    });

    const message = await t.run(async (ctx) => {
      return await ctx.db.get(messageId);
    });

    expect(message?.senderType).toBe("agent");
    expect(message?.senderUserId).toBeUndefined();
  });

  it("applies agent edits to blocks", async () => {
    const blockId = await t.run(async (ctx) => {
      return await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 0,
        blockType: "paragraph",
        markdownText: "Original text",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    const threadId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentThreads", {
        projectId,
        title: "Edit Thread",
        createdByUserId: userId,
        createdAt: Date.now(),
        status: "active",
      });
    });

    const messageId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentMessages", {
        threadId,
        senderType: "agent",
        createdAt: Date.now(),
        content: "I've made the changes.",
        toolCalls: [
          {
            type: "edit_block",
            blockId,
            newText: "Agent-edited text",
          },
        ],
      });
    });

    const versionId = await t.mutation(agentModule.applyAgentEdits, {
      threadId,
      messageId,
    });

    const block = await t.run(async (ctx) => {
      return await ctx.db.get(blockId);
    });

    expect(block?.markdownText).toBe("Agent-edited text");
    expect(block?.lastEditType).toBe("agent");

    expect(versionId).toBeTruthy();

    const message = await t.run(async (ctx) => {
      return await ctx.db.get(messageId);
    });

    expect(message?.appliedEditVersionId).toBe(versionId);
  });

  it("applies multiple agent edits", async () => {
    const block1Id = await t.run(async (ctx) => {
      return await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 0,
        blockType: "paragraph",
        markdownText: "Block 1",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    const block2Id = await t.run(async (ctx) => {
      return await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 1,
        blockType: "paragraph",
        markdownText: "Block 2",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    const threadId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentThreads", {
        projectId,
        title: "Multi-edit Thread",
        createdByUserId: userId,
        createdAt: Date.now(),
        status: "active",
      });
    });

    const messageId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentMessages", {
        threadId,
        senderType: "agent",
        createdAt: Date.now(),
        content: "Updated both blocks.",
        toolCalls: [
          {
            type: "edit_block",
            blockId: block1Id,
            newText: "Updated Block 1",
          },
          {
            type: "edit_block",
            blockId: block2Id,
            newText: "Updated Block 2",
          },
        ],
      });
    });

    await t.mutation(agentModule.applyAgentEdits, {
      threadId,
      messageId,
    });

    const block1 = await t.run(async (ctx) => {
      return await ctx.db.get(block1Id);
    });

    const block2 = await t.run(async (ctx) => {
      return await ctx.db.get(block2Id);
    });

    expect(block1?.markdownText).toBe("Updated Block 1");
    expect(block2?.markdownText).toBe("Updated Block 2");
  });

  it("creates version snapshot after applying edits", async () => {
    const blockId = await t.run(async (ctx) => {
      return await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 0,
        blockType: "paragraph",
        markdownText: "Original",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    const threadId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentThreads", {
        projectId,
        title: "Test Thread",
        createdByUserId: userId,
        createdAt: Date.now(),
        status: "active",
      });
    });

    const messageId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentMessages", {
        threadId,
        senderType: "agent",
        createdAt: Date.now(),
        content: "Changes made.",
        toolCalls: [
          {
            type: "edit_block",
            blockId,
            newText: "Modified",
          },
        ],
      });
    });

    const versionId = await t.mutation(agentModule.applyAgentEdits, {
      threadId,
      messageId,
    });

    const version = await t.run(async (ctx) => {
      return await ctx.db.get(versionId);
    });

    expect(version).toBeTruthy();
    expect(version?.summary).toContain("Applied agent edits");
    expect(version?.summary).toContain("Test Thread");

    const snapshot = version?.snapshot as any;
    expect(snapshot.sections).toHaveLength(1);
    expect(snapshot.sections[0].blocks).toHaveLength(1);
    expect(snapshot.sections[0].blocks[0].markdownText).toBe("Modified");
  });

  it("throws error when applying edits without toolCalls", async () => {
    const threadId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentThreads", {
        projectId,
        title: "Test Thread",
        createdByUserId: userId,
        createdAt: Date.now(),
        status: "active",
      });
    });

    const messageId = await t.run(async (ctx) => {
      return await ctx.db.insert("agentMessages", {
        threadId,
        senderType: "agent",
        createdAt: Date.now(),
        content: "No edits here.",
      });
    });

    await expect(
      t.mutation(agentModule.applyAgentEdits, {
        threadId,
        messageId,
      })
    ).rejects.toThrow("No proposed edits in message");
  });
});
