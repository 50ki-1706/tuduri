/**
 * ログ一覧画面の状態管理フック
 * ログの取得、日付フィルタ、ローディング/エラー状態を管理する
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { orpc } from "@/lib/orpc/client";
import type { ListLogsInput } from "@/shared/schemas/log.schema";

/**
 * ログエントリの型
 * logEntrySchema と互換
 */
interface LogEntry {
  id: string;
  author: string;
  message: string;
  parent: string | null;
  createdAt: string;
}

/**
 * useLogList フックの戻り値の型
 */
interface UseLogListReturn {
  /** 取得したログの配列（降順） */
  logs: LogEntry[];
  /** ログ取得中の場合は true */
  isLoading: boolean;
  /** エラーメッセージ。エラーがない場合は null */
  error: string | null;
  /** 現在の日付フィルタ値（YYYY-MM-DD 形式または空文字） */
  dateFilter: string;
  /** 日付フィルタを設定する */
  setDateFilter: (date: string) => void;
  /** 日付フィルタをクリアする */
  clearFilter: () => void;
}

/**
 * ログ一覧を取得・管理するカスタムフック
 * 認証確認後に enabled を true にして使用する
 * @param enabled - ログ取得を有効にするかどうか
 * @returns ログ一覧の状態と操作用関数
 */
export function useLogList(enabled: boolean): UseLogListReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchLogs = useCallback(async (date?: string) => {
    // Intent: 前回のリクエストが未完了の場合はキャンセルし、競合を防止する
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    try {
      const input: ListLogsInput = date ? { date } : {};
      const result = await orpc.log.list(input);
      // Intent: キャンセル済みのレスポンスは破棄する
      if (controller.signal.aborted) return;
      setLogs(result.logs);
    } catch (e: unknown) {
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : "ログの取得に失敗しました");
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    fetchLogs(dateFilter || undefined);
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [enabled, dateFilter, fetchLogs]);

  const clearFilter = useCallback(() => {
    setDateFilter("");
  }, []);

  return { logs, isLoading, error, dateFilter, setDateFilter, clearFilter };
}
