import { os } from "@orpc/server";
import { createLogSchema, listLogsSchema } from "@/shared/schemas/log.schema";
import { updateNameSchema } from "@/shared/schemas/user.schema";
import type { ORPCContext } from "./context";
import { createLog, listLogs } from "./services/log.service";
import { updateUserName } from "./services/user.service";

const base = os.$context<ORPCContext>();

function getUserId(context: ORPCContext) {
  const userId = context.session?.user.id;

  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }

  return userId;
}

const protectedProcedure = base.use(async ({ context, next }) => {
  if (!context.session) {
    throw new Error("UNAUTHORIZED");
  }

  return next();
});

export const router = {
  health: base.handler(() => {
    return { ok: true };
  }),

  log: {
    /**
     * 新しいログを作成する
     * 認証必須。同一ユーザーの直前ログを parent として自動設定する。
     * 著者名は作成時点の session.user.name のスナップショット。
     */
    create: protectedProcedure
      .input(createLogSchema)
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
      .input(listLogsSchema)
      .handler(async ({ input, context }) => {
        const userId = getUserId(context);
        return listLogs(context.db, userId, input.date);
      }),
  },

  user: {
    /**
     * ユーザー名を更新する
     * 認証必須。自分自身の名前のみ更新可能。
     */
    updateName: protectedProcedure
      .input(updateNameSchema)
      .handler(async ({ input, context }) => {
        const userId = getUserId(context);
        const updated = await updateUserName(context.db, userId, input.name);
        return updated;
      }),
  },
};

export type AppRouter = typeof router;
