import { createClient } from "@libsql/client";
import { createRouterClient } from "@orpc/server";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { drizzle } from "drizzle-orm/libsql";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as schema from "../../db/schema";
import type { ORPCContext } from "./context";
import { router } from "./router";

vi.mock("@/lib/orpc/repositories/log.repository", () => ({
  findLatestByUserId: async (
    database: LibSQLDatabase<typeof schema>,
    userId: string,
  ) => {
    const [log] = await database
      .select()
      .from(schema.logs)
      .where(eq(schema.logs.userId, userId))
      .orderBy(desc(schema.logs.createdAt), desc(schema.logs.id))
      .limit(1);

    return log;
  },
  insertLog: async (
    database: LibSQLDatabase<typeof schema>,
    values: typeof schema.logs.$inferInsert,
  ) => {
    const [log] = await database.insert(schema.logs).values(values).returning();

    if (!log) {
      throw new Error("Failed to insert log");
    }

    return log;
  },
  findAllByUserId: async (
    database: LibSQLDatabase<typeof schema>,
    userId: string,
  ) => {
    return database
      .select()
      .from(schema.logs)
      .where(eq(schema.logs.userId, userId))
      .orderBy(desc(schema.logs.createdAt), desc(schema.logs.id));
  },
  findByUserIdAndDate: async (
    database: LibSQLDatabase<typeof schema>,
    userId: string,
    date: string,
  ) => {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    return database
      .select()
      .from(schema.logs)
      .where(
        and(
          eq(schema.logs.userId, userId),
          gte(schema.logs.createdAt, start),
          lt(schema.logs.createdAt, end),
        ),
      )
      .orderBy(desc(schema.logs.createdAt), desc(schema.logs.id));
  },
}));

// 全テストで同一のインメモリ SQLite インスタンスを共有
const client = createClient({ url: ":memory:" });
const db = drizzle(client, { schema });

// テーブル再作成ヘルパー
async function recreateTables() {
  // FK制約を有効化
  await db.run("PRAGMA foreign_keys = ON");
  // FK順序を考慮して逆順にDROP
  await db.run("DROP TABLE IF EXISTS log");
  await db.run("DROP TABLE IF EXISTS verification");
  await db.run("DROP TABLE IF EXISTS account");
  await db.run("DROP TABLE IF EXISTS session");
  await db.run("DROP TABLE IF EXISTS user");
  // スキーマからテーブルを再作成
  await db.run(
    `CREATE TABLE user (id text PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE, email_verified integer NOT NULL, image text, created_at integer NOT NULL, updated_at integer NOT NULL)`,
  );
  await db.run(
    `CREATE TABLE session (id text PRIMARY KEY, expires_at integer NOT NULL, token text NOT NULL UNIQUE, created_at integer NOT NULL, updated_at integer NOT NULL, ip_address text, user_agent text, user_id text NOT NULL REFERENCES user(id))`,
  );
  await db.run(
    `CREATE TABLE account (id text PRIMARY KEY, account_id text NOT NULL, provider_id text NOT NULL, user_id text NOT NULL REFERENCES user(id), access_token text, refresh_token text, id_token text, access_token_expires_at integer, refresh_token_expires_at integer, scope text, password text, created_at integer NOT NULL, updated_at integer NOT NULL)`,
  );
  await db.run(
    `CREATE TABLE verification (id text PRIMARY KEY, identifier text NOT NULL, value text NOT NULL, expires_at integer NOT NULL, created_at integer, updated_at integer)`,
  );
  await db.run(
    `CREATE TABLE log (id text PRIMARY KEY, user_id text NOT NULL REFERENCES user(id) ON DELETE CASCADE, author text NOT NULL, message text NOT NULL, parent text REFERENCES log(id), created_at integer NOT NULL)`,
  );
}

beforeEach(async () => {
  await recreateTables();
});

// テスト用の認証済みコンテキストを作成
async function createAuthContext(
  userId = "test-user-id",
  name = "Test User",
): Promise<ORPCContext> {
  await db.insert(schema.user).values({
    id: userId,
    name,
    email: `${userId}@example.com`,
    emailVerified: false,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    db,
    session: {
      user: { id: userId, name },
    } as ORPCContext["session"],
  };
}

/**
 * テスト用のログレコードを直接作成する
 * create/list の振る舞いを検証するための下準備に使う。
 * @param values - 直接挿入するログの値
 * @returns 挿入されたログレコード
 */
async function insertLog(values: {
  id: string;
  userId: string;
  author: string;
  message: string;
  parent: string | null;
  createdAt: Date;
}) {
  const [log] = await db.insert(schema.logs).values(values).returning();

  if (!log) {
    throw new Error("Failed to insert test log");
  }

  return log;
}

// テスト用の未認証コンテキスト
const unauthContext: ORPCContext = { db, session: null };

async function createAuthedClient(userId = "test-user-id", name = "Test User") {
  const context = await createAuthContext(userId, name);
  return createRouterClient(router, {
    context,
  });
}

function createUnauthedClient() {
  return createRouterClient(router, {
    context: unauthContext,
  });
}

describe("log", () => {
  describe("log.create", () => {
    it("未認証の場合はエラーを返す", async () => {
      const client = createUnauthedClient();

      await expect(client.log.create({ message: "hello" })).rejects.toThrow(
        "UNAUTHORIZED",
      );
    });

    it("認証済みユーザーでログを作成できる", async () => {
      const client = await createAuthedClient("log-user-1", "Alice");
      const result = await client.log.create({ message: "最初のログ" });

      expect(result).toMatchObject({
        id: expect.any(String),
        userId: "log-user-1",
        author: "Alice",
        message: "最初のログ",
        parent: null,
        createdAt: expect.any(Date),
      });
    });

    it("2つ目のログの parent が1つ目のログの id になる", async () => {
      const client = await createAuthedClient("log-user-2", "Bob");
      const first = await client.log.create({ message: "1件目" });
      const second = await client.log.create({ message: "2件目" });

      expect(second.parent).toBe(first.id);
    });

    it("他ユーザーのログを parent として参照しない", async () => {
      const userBClient = await createAuthedClient("log-user-b", "User B");
      const userBLog = await userBClient.log.create({ message: "user b" });

      const userAClient = await createAuthedClient("log-user-a", "User A");
      const userALog = await userAClient.log.create({ message: "user a" });

      expect(userALog.parent).toBeNull();
      expect(userALog.parent).not.toBe(userBLog.id);
    });

    it("空文字のメッセージはエラーになる", async () => {
      const client = await createAuthedClient("log-user-3", "Charlie");

      await expect(client.log.create({ message: "" })).rejects.toThrow(
        "Input validation failed",
      );
    });
  });

  describe("log.list", () => {
    it("未認証の場合はエラーを返す", async () => {
      const client = createUnauthedClient();

      await expect(client.log.list({})).rejects.toThrow("UNAUTHORIZED");
    });

    it("自分のログのみが返る", async () => {
      const clientA = await createAuthedClient("list-user-a", "User A");
      const clientB = await createAuthedClient("list-user-b", "User B");

      await clientA.log.create({ message: "A-1" });
      await clientB.log.create({ message: "B-1" });
      await clientA.log.create({ message: "A-2" });

      const result = await clientA.log.list({});

      expect(result).toHaveLength(2);
      expect(result.every((log) => log.userId === "list-user-a")).toBe(true);
    });

    it("date 指定で特定日のログのみ返る", async () => {
      const context = await createAuthContext("date-user", "Date User");

      await insertLog({
        id: "date-log-1",
        userId: "date-user",
        author: "Date User",
        message: "2026-05-18 log",
        parent: null,
        createdAt: new Date("2026-05-18T09:00:00.000Z"),
      });
      await insertLog({
        id: "date-log-2",
        userId: "date-user",
        author: "Date User",
        message: "2026-05-19 log",
        parent: "date-log-1",
        createdAt: new Date("2026-05-19T09:00:00.000Z"),
      });

      const client = createRouterClient(router, {
        context,
      });
      const result = await client.log.list({ date: "2026-05-19" });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "date-log-2",
        userId: "date-user",
        message: "2026-05-19 log",
      });
      expect(result[0].createdAt.toISOString().slice(0, 10)).toBe("2026-05-19");
    });
  });
});

describe("user", () => {
  describe("user.updateName", () => {
    it("未認証の場合はエラーを返す", async () => {
      const client = createUnauthedClient();

      await expect(
        client.user.updateName({ name: "New Name" }),
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("認証済みユーザーで名前を更新できる", async () => {
      const client = await createAuthedClient("user-update-1", "Old Name");
      const result = await client.user.updateName({ name: "New Name" });

      expect(result).toMatchObject({
        id: "user-update-1",
        name: "New Name",
      });
    });

    it("空文字の名前はエラーになる", async () => {
      const client = await createAuthedClient("user-update-2", "Old Name");

      await expect(client.user.updateName({ name: "" })).rejects.toThrow(
        "Input validation failed",
      );
    });
  });
});
