import { ORPCError, os } from "@orpc/server";
import {
  createLogSchema,
  listLogsSchema,
  logCreateResponseSchema,
  logListResponseSchema,
} from "@/shared/schemas/log.schema";
import {
  updateNameResponseSchema,
  updateNameSchema,
} from "@/shared/schemas/user.schema";
import type { ORPCContext } from "./context";
import { createLog, listLogs } from "./services/log.service";
import { updateUserName } from "./services/user.service";

const base = os.$context<ORPCContext>().errors({
  UNAUTHORIZED: {
    status: 401,
    message:
      "Authentication required. Obtain a session cookie via Google OAuth2 PKCE flow.",
  },
  BAD_REQUEST: {
    status: 400,
    message: "Input validation failed. Check request body against the schema.",
  },
});

function getUserId(context: ORPCContext) {
  const userId = context.session?.user.id;

  if (!userId) {
    throw new ORPCError("UNAUTHORIZED", { message: "Authentication required" });
  }

  return userId;
}

const protectedProcedure = base
  .use(async ({ context, next, errors }) => {
    if (!context.session) {
      throw errors.UNAUTHORIZED({ message: "Authentication required" });
    }

    return next();
  })
  .route({ spec: { security: [{ cookieAuth: [] }] } });

export const router = {
  health: base
    .route({
      method: "GET",
      path: "/health",
      summary: "Health check",
      operationId: "healthCheck",
      tags: ["Health"],
    })
    .handler(() => {
      return { ok: true };
    }),

  log: {
    /**
     * 新しいログを作成する
     * 認証必須。同一ユーザーの直前ログを parent として自動設定する。
     * 著者名は作成時点の session.user.name のスナップショット。
     */
    create: protectedProcedure
      .route({
        method: "POST",
        path: "/logs",
        summary: "Create a log entry",
        operationId: "createLog",
        tags: ["Logs"],
      })
      .input(createLogSchema)
      .output(logCreateResponseSchema)
      .handler(async ({ input, context }) => {
        const userId = getUserId(context);
        const log = await createLog(
          context.db,
          userId,
          context.session?.user.name,
          input.message,
        );
        return log;
      }),

    /**
     * ログ一覧を取得する
     * 認証必須。自分のログのみ返す。
     * date 指定時は UTC 基準でその日のログのみ返す。
     */
    list: protectedProcedure
      .route({
        method: "GET",
        path: "/logs",
        summary: "List log entries",
        operationId: "listLogs",
        tags: ["Logs"],
        description:
          "ログ一覧を取得する。認証必須。自分のログのみ返す。date 指定時は UTC 基準でその日のログのみ返す。",
      })
      .input(listLogsSchema)
      .output(logListResponseSchema)
      .handler(async ({ input, context }) => {
        const userId = getUserId(context);
        const logs = await listLogs(context.db, userId, input.date);
        return { logs };
      }),
  },

  user: {
    /**
     * ユーザー名を更新する
     * 認証必須。自分自身の名前のみ更新可能。
     */
    updateName: protectedProcedure
      .route({
        method: "PATCH",
        path: "/users/me/name",
        summary: "Update user name",
        operationId: "updateUserName",
        tags: ["Users"],
      })
      .input(updateNameSchema)
      .output(updateNameResponseSchema)
      .handler(async ({ input, context }) => {
        const userId = getUserId(context);
        const updated = await updateUserName(context.db, userId, input.name);
        return updated;
      }),
  },
};

export type AppRouter = typeof router;
