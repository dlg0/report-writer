import { describe, it, expect, beforeEach } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { Id } from "convex/values";
import * as lockingModule from "../features/locking";

describe("Lock acquisition", () => {
  let t: ReturnType<typeof convexTest>;
  let user1Id: Id<"users">;
  let user2Id: Id<"users">;
  let projectId: Id<"projects">;
  let sectionId: Id<"sections">;

  beforeEach(async () => {
    t = convexTest(schema, {});

    user1Id = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "user1@example.com",
        name: "User 1",
        createdAt: Date.now(),
      });
    });

    user2Id = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        email: "user2@example.com",
        name: "User 2",
        createdAt: Date.now(),
      });
    });

    projectId = await t.run(async (ctx) => {
      return await ctx.db.insert("projects", {
        ownerId: user1Id,
        name: "Test Project",
        createdAt: Date.now(),
        archived: false,
      });
    });

    sectionId = await t.run(async (ctx) => {
      return await ctx.db.insert("sections", {
        projectId,
        headingText: "Test Section",
        headingLevel: 1,
        order: 0,
        createdAt: Date.now(),
      });
    });
  });

  it("acquires lock when none exists", async () => {
    const lock = await t.mutation(lockingModule.acquireLock, {
      projectId,
      resourceType: "section",
      resourceId: sectionId,
    });

    expect(lock).toBeTruthy();
    expect(lock.resourceType).toBe("section");
    expect(lock.resourceId).toBe(sectionId);
  });

  it("acquires lock for different resource types", async () => {
    const blockId = await t.run(async (ctx) => {
      return await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 0,
        blockType: "paragraph",
        markdownText: "Test",
        lastEditorUserId: user1Id,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    const sectionLock = await t.mutation(lockingModule.acquireLock, {
      projectId,
      resourceType: "section",
      resourceId: sectionId,
    });

    const blockLock = await t.mutation(lockingModule.acquireLock, {
      projectId,
      resourceType: "block",
      resourceId: blockId,
    });

    expect(sectionLock.resourceType).toBe("section");
    expect(blockLock.resourceType).toBe("block");
  });

  it("refreshes lock when acquiring existing lock as same user", async () => {
    const lock1 = await t.mutation(lockingModule.acquireLock, {
      projectId,
      resourceType: "section",
      resourceId: sectionId,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const lock2 = await t.mutation(lockingModule.acquireLock, {
      projectId,
      resourceType: "section",
      resourceId: sectionId,
    });

    expect(lock2._id).toBe(lock1._id);
    expect(lock2.lockedAt).toBeGreaterThan(lock1.lockedAt);
  });

  it("releases lock", async () => {
    const lock = await t.mutation(lockingModule.acquireLock, {
      projectId,
      resourceType: "section",
      resourceId: sectionId,
    });

    await t.mutation(lockingModule.releaseLock, {
      lockId: lock._id,
    });

    const releasedLock = await t.run(async (ctx) => {
      return await ctx.db.get(lock._id);
    });

    expect(releasedLock).toBeNull();
  });

  it("refreshes lock timestamp", async () => {
    const lock = await t.mutation(lockingModule.acquireLock, {
      projectId,
      resourceType: "section",
      resourceId: sectionId,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const refreshed = await t.mutation(lockingModule.refreshLock, {
      lockId: lock._id,
    });

    expect(refreshed.lockedAt).toBeGreaterThan(lock.lockedAt);
  });

  it("allows acquiring expired lock", async () => {
    const twoHoursAgo = Date.now() - 7200000 - 1000;

    const oldLockId = await t.run(async (ctx) => {
      return await ctx.db.insert("locks", {
        projectId,
        resourceType: "section",
        resourceId: sectionId,
        userId: user2Id,
        lockedAt: twoHoursAgo,
      });
    });

    const newLock = await t.mutation(lockingModule.acquireLock, {
      projectId,
      resourceType: "section",
      resourceId: sectionId,
    });

    const oldLock = await t.run(async (ctx) => {
      return await ctx.db.get(oldLockId);
    });

    expect(oldLock).toBeNull();
    expect(newLock).toBeTruthy();
  });

  it("gets locks for project", async () => {
    await t.mutation(lockingModule.acquireLock, {
      projectId,
      resourceType: "section",
      resourceId: sectionId,
    });

    const blockId = await t.run(async (ctx) => {
      return await ctx.db.insert("blocks", {
        projectId,
        sectionId,
        order: 0,
        blockType: "paragraph",
        markdownText: "Test",
        lastEditorUserId: user1Id,
        lastEditType: "human",
        lastEditedAt: Date.now(),
      });
    });

    await t.mutation(lockingModule.acquireLock, {
      projectId,
      resourceType: "block",
      resourceId: blockId,
    });

    const locks = await t.query(lockingModule.getLocksForProject, {
      projectId,
    });

    expect(locks).toHaveLength(2);
  });

  it("gets lock for specific resource", async () => {
    await t.mutation(lockingModule.acquireLock, {
      projectId,
      resourceType: "section",
      resourceId: sectionId,
    });

    const lock = await t.query(lockingModule.getLockForResource, {
      resourceType: "section",
      resourceId: sectionId,
    });

    expect(lock).toBeTruthy();
    expect(lock?.resourceId).toBe(sectionId);
  });

  it("returns null for unlocked resource", async () => {
    const lock = await t.query(lockingModule.getLockForResource, {
      resourceType: "section",
      resourceId: sectionId,
    });

    expect(lock).toBeNull();
  });

  it("filters out expired locks from project query", async () => {
    const twoHoursAgo = Date.now() - 7200000 - 1000;

    await t.run(async (ctx) => {
      return await ctx.db.insert("locks", {
        projectId,
        resourceType: "section",
        resourceId: sectionId,
        userId: user1Id,
        lockedAt: twoHoursAgo,
      });
    });

    const locks = await t.query(lockingModule.getLocksForProject, {
      projectId,
    });

    expect(locks).toHaveLength(0);
  });
});
