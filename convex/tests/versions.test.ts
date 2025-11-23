import { describe, it, expect, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { Id } from "convex/values";
import * as versionsModule from "../features/versions";
import * as blocksModule from "../tables/blocks";
import * as sectionsModule from "../tables/sections";

describe("Version snapshots", () => {
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

  it("creates snapshot with all sections and blocks", async () => {
    const blockId = await t.run(async (ctx) => {
      return await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 0,
        blockType: "paragraph",
        markdownText: "Original content",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    const versionId = await t.mutation(
      versionsModule.createVersionSnapshot,
      {
        projectId,
        summary: "Test snapshot",
      }
    );

    const version = await t.run(async (ctx) => {
      return await ctx.db.get(versionId);
    });

    expect(version).toBeTruthy();
    expect(version?.summary).toBe("Test snapshot");

    const snapshot = version?.snapshot as any;
    expect(snapshot.sections).toHaveLength(1);
    expect(snapshot.sections[0].blocks).toHaveLength(1);
    expect(snapshot.sections[0].blocks[0].markdownText).toBe("Original content");
  });

  it("creates snapshot with multiple sections and blocks", async () => {
    const section2Id = await t.run(async (ctx) => {
      return await ctx.db.insert("sections", {
        projectId,
        headingText: "Methods",
        headingLevel: 1,
        order: 1,
        createdAt: Date.now(),
      });
    });

    await t.run(async (ctx) => {
      await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 0,
        blockType: "paragraph",
        markdownText: "Block 1",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });

      await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 1,
        blockType: "paragraph",
        markdownText: "Block 2",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });

      await ctx.db.insert("blocks", {
        projectId,
        sectionId: section2Id,
        order: 0,
        blockType: "bulletList",
        markdownText: "- Item 1",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    const versionId = await t.mutation(
      versionsModule.createVersionSnapshot,
      {
        projectId,
      }
    );

    const version = await t.run(async (ctx) => {
      return await ctx.db.get(versionId);
    });

    const snapshot = version?.snapshot as any;
    expect(snapshot.sections).toHaveLength(2);
    expect(snapshot.sections[0].blocks).toHaveLength(2);
    expect(snapshot.sections[1].blocks).toHaveLength(1);
  });

  it("restores version correctly (round-trip)", async () => {
    const block1Id = await t.run(async (ctx) => {
      return await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 0,
        blockType: "paragraph",
        markdownText: "Original block 1",
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
        markdownText: "Original block 2",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    const versionId = await t.mutation(
      versionsModule.createVersionSnapshot,
      {
        projectId,
        summary: "Before changes",
      }
    );

    await t.run(async (ctx) => {
      await ctx.db.patch(block1Id, { markdownText: "Modified block 1" });
      await ctx.db.delete(block2Id);
    });

    await t.mutation(versionsModule.restoreVersion, {
      versionId,
    });

    const blocks = await t.query(blocksModule.listBySection, {
      sectionId,
    });

    expect(blocks).toHaveLength(2);
    expect(blocks[0].markdownText).toBe("Original block 1");
    expect(blocks[1].markdownText).toBe("Original block 2");
  });

  it("restores preserves section structure", async () => {
    await t.run(async (ctx) => {
      await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 0,
        blockType: "paragraph",
        markdownText: "Content",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    const versionId = await t.mutation(
      versionsModule.createVersionSnapshot,
      {
        projectId,
      }
    );

    await t.run(async (ctx) => {
      await ctx.db.patch(sectionId, {
        headingText: "Changed Title",
        headingLevel: 3,
      });
    });

    await t.mutation(versionsModule.restoreVersion, {
      versionId,
    });

    const sections = await t.query(sectionsModule.listByProject, {
      projectId,
    });

    expect(sections).toHaveLength(1);
    expect(sections[0].headingText).toBe("Introduction");
    expect(sections[0].headingLevel).toBe(1);
  });

  it("compares two versions", async () => {
    const blockId = await t.run(async (ctx) => {
      return await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 0,
        blockType: "paragraph",
        markdownText: "Version 1 text",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    const version1Id = await t.mutation(
      versionsModule.createVersionSnapshot,
      {
        projectId,
        summary: "Version 1",
      }
    );

    await t.run(async (ctx) => {
      await ctx.db.patch(blockId, { markdownText: "Version 2 text" });
    });

    const version2Id = await t.mutation(
      versionsModule.createVersionSnapshot,
      {
        projectId,
        summary: "Version 2",
      }
    );

    const diffs = await t.query(versionsModule.compareVersions, {
      versionIdA: version1Id,
      versionIdB: version2Id,
    });

    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe("modified");
    expect(diffs[0].oldBlock.markdownText).toBe("Version 1 text");
    expect(diffs[0].newBlock.markdownText).toBe("Version 2 text");
  });

  it("detects added blocks in comparison", async () => {
    const version1Id = await t.mutation(
      versionsModule.createVersionSnapshot,
      {
        projectId,
        summary: "Version 1 - empty",
      }
    );

    await t.run(async (ctx) => {
      await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 0,
        blockType: "paragraph",
        markdownText: "New block",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    const version2Id = await t.mutation(
      versionsModule.createVersionSnapshot,
      {
        projectId,
        summary: "Version 2 - with block",
      }
    );

    const diffs = await t.query(versionsModule.compareVersions, {
      versionIdA: version1Id,
      versionIdB: version2Id,
    });

    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe("added");
    expect(diffs[0].block.markdownText).toBe("New block");
  });

  it("detects removed blocks in comparison", async () => {
    const blockId = await t.run(async (ctx) => {
      return await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 0,
        blockType: "paragraph",
        markdownText: "To be removed",
        lastEditorUserId: userId,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    const version1Id = await t.mutation(
      versionsModule.createVersionSnapshot,
      {
        projectId,
        summary: "Version 1 - with block",
      }
    );

    await t.run(async (ctx) => {
      await ctx.db.delete(blockId);
    });

    const version2Id = await t.mutation(
      versionsModule.createVersionSnapshot,
      {
        projectId,
        summary: "Version 2 - deleted",
      }
    );

    const diffs = await t.query(versionsModule.compareVersions, {
      versionIdA: version1Id,
      versionIdB: version2Id,
    });

    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe("removed");
    expect(diffs[0].block.markdownText).toBe("To be removed");
  });

  it("handles empty snapshots", async () => {
    const versionId = await t.mutation(
      versionsModule.createVersionSnapshot,
      {
        projectId,
        summary: "Empty snapshot",
      }
    );

    const version = await t.run(async (ctx) => {
      return await ctx.db.get(versionId);
    });

    const snapshot = version?.snapshot as any;
    expect(snapshot.sections).toHaveLength(1);
    expect(snapshot.sections[0].blocks).toHaveLength(0);
  });
});
