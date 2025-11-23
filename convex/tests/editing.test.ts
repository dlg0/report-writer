import { describe, it, expect, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { Id } from "convex/values";
import * as blocksModule from "../tables/blocks";
import * as sectionsModule from "../tables/sections";

describe("Block editing", () => {
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

  it("creates block with proper order", async () => {
    const blockId = await t.mutation(blocksModule.create, {
      projectId,
      sectionId,
      order: 0,
      blockType: "paragraph",
      markdownText: "First paragraph",
    });

    const block = await t.run(async (ctx) => {
      return await ctx.db.get(blockId);
    });

    expect(block).toBeTruthy();
    expect(block?.order).toBe(0);
    expect(block?.blockType).toBe("paragraph");
    expect(block?.markdownText).toBe("First paragraph");
  });

  it("creates multiple blocks with sequential order", async () => {
    const block1 = await t.mutation(blocksModule.create, {
      projectId,
      sectionId,
      order: 0,
      blockType: "paragraph",
      markdownText: "First",
    });

    const block2 = await t.mutation(blocksModule.create, {
      projectId,
      sectionId,
      order: 1,
      blockType: "paragraph",
      markdownText: "Second",
    });

    const blocks = await t.query(blocksModule.listBySection, {
      sectionId,
    });

    expect(blocks).toHaveLength(2);
    expect(blocks[0].order).toBe(0);
    expect(blocks[1].order).toBe(1);
  });

  it("updates block text", async () => {
    const blockId = await t.mutation(blocksModule.create, {
      projectId,
      sectionId,
      order: 0,
      blockType: "paragraph",
      markdownText: "Original text",
    });

    await t.mutation(blocksModule.updateText, {
      id: blockId,
      markdownText: "Updated text",
      editorUserId: userId,
      editType: "human",
    });

    const block = await t.run(async (ctx) => {
      return await ctx.db.get(blockId);
    });

    expect(block?.markdownText).toBe("Updated text");
    expect(block?.lastEditType).toBe("human");
  });

  it("reorders blocks", async () => {
    const block1 = await t.mutation(blocksModule.create, {
      projectId,
      sectionId,
      order: 0,
      blockType: "paragraph",
      markdownText: "First",
    });

    const block2 = await t.mutation(blocksModule.create, {
      projectId,
      sectionId,
      order: 1,
      blockType: "paragraph",
      markdownText: "Second",
    });

    await t.mutation(blocksModule.reorder, {
      sectionId,
      newOrder: [
        { id: block2, order: 0 },
        { id: block1, order: 1 },
      ],
    });

    const blocks = await t.query(blocksModule.listBySection, {
      sectionId,
    });

    expect(blocks[0]._id).toBe(block2);
    expect(blocks[0].order).toBe(0);
    expect(blocks[1]._id).toBe(block1);
    expect(blocks[1].order).toBe(1);
  });

  it("deletes block", async () => {
    const blockId = await t.mutation(blocksModule.create, {
      projectId,
      sectionId,
      order: 0,
      blockType: "paragraph",
      markdownText: "To be deleted",
    });

    await t.mutation(blocksModule.deleteBlock, {
      id: blockId,
    });

    const block = await t.run(async (ctx) => {
      return await ctx.db.get(blockId);
    });

    expect(block).toBeNull();
  });
});

describe("Section management", () => {
  let t: ReturnType<typeof convexTest>;
  let userId: Id<"users">;
  let projectId: Id<"projects">;

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
  });

  it("creates section", async () => {
    const sectionId = await t.mutation(sectionsModule.create, {
      projectId,
      headingText: "Methods",
      headingLevel: 2,
      order: 0,
    });

    const section = await t.run(async (ctx) => {
      return await ctx.db.get(sectionId);
    });

    expect(section).toBeTruthy();
    expect(section?.headingText).toBe("Methods");
    expect(section?.headingLevel).toBe(2);
  });

  it("updates section", async () => {
    const sectionId = await t.mutation(sectionsModule.create, {
      projectId,
      headingText: "Original",
      headingLevel: 1,
      order: 0,
    });

    await t.mutation(sectionsModule.update, {
      id: sectionId,
      headingText: "Updated",
      headingLevel: 2,
    });

    const section = await t.run(async (ctx) => {
      return await ctx.db.get(sectionId);
    });

    expect(section?.headingText).toBe("Updated");
    expect(section?.headingLevel).toBe(2);
  });

  it("deletes section", async () => {
    const sectionId = await t.mutation(sectionsModule.create, {
      projectId,
      headingText: "To Delete",
      headingLevel: 1,
      order: 0,
    });

    await t.mutation(sectionsModule.deleteSection, {
      id: sectionId,
    });

    const section = await t.run(async (ctx) => {
      return await ctx.db.get(sectionId);
    });

    expect(section).toBeNull();
  });

  it("reorders sections", async () => {
    const section1 = await t.mutation(sectionsModule.create, {
      projectId,
      headingText: "First",
      headingLevel: 1,
      order: 0,
    });

    const section2 = await t.mutation(sectionsModule.create, {
      projectId,
      headingText: "Second",
      headingLevel: 1,
      order: 1,
    });

    await t.mutation(sectionsModule.reorder, {
      projectId,
      newOrder: [
        { id: section2, order: 0 },
        { id: section1, order: 1 },
      ],
    });

    const sections = await t.query(sectionsModule.listByProject, {
      projectId,
    });

    expect(sections[0]._id).toBe(section2);
    expect(sections[0].order).toBe(0);
    expect(sections[1]._id).toBe(section1);
    expect(sections[1].order).toBe(1);
  });
});
