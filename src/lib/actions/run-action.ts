import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { failure, parseZodError, success } from "@/lib/actions/utils";
import { requireSessionUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import type { ActionResult } from "@/types";

type ActionContext<TInput> = {
  userId: string;
  input: TInput;
};

type QueryContext = {
  userId: string;
};

function handleActionError(error: unknown, fallback: string): ActionResult<never> {
  if (error instanceof Error) {
    if (error.message === "Unauthorized") return failure("Unauthorized");
    return failure(error.message);
  }
  return failure(fallback);
}

/** Run a validated mutation: session → zod → connectDB → handler → ActionResult */
export async function runMutation<TInput, TOutput>(options: {
  schema: z.ZodType<TInput>;
  input: unknown;
  handler: (ctx: ActionContext<TInput>) => Promise<TOutput>;
  errorMessage?: string;
  revalidatePaths?: string[];
}): Promise<ActionResult<TOutput>> {
  try {
    const userId = await requireSessionUserId();
    const parsed = options.schema.safeParse(options.input);

    if (!parsed.success) {
      return failure(parseZodError(parsed.error));
    }

    await connectDB();

    const data = await options.handler({
      userId,
      input: parsed.data,
    });

    options.revalidatePaths?.forEach((path) => revalidatePath(path));

    return success(data);
  } catch (error) {
    return handleActionError(error, options.errorMessage ?? "Action failed");
  }
}

/** Run a validated read: session → zod → connectDB → handler → ActionResult */
export async function runQuery<TInput, TOutput>(options: {
  schema: z.ZodType<TInput>;
  input: unknown;
  handler: (ctx: ActionContext<TInput>) => Promise<TOutput>;
  errorMessage?: string;
}): Promise<ActionResult<TOutput>> {
  try {
    const userId = await requireSessionUserId();
    const parsed = options.schema.safeParse(options.input);

    if (!parsed.success) {
      return failure(parseZodError(parsed.error));
    }

    await connectDB();

    const data = await options.handler({
      userId,
      input: parsed.data,
    });

    return success(data);
  } catch (error) {
    return handleActionError(error, options.errorMessage ?? "Failed to fetch data");
  }
}

/** Run a session-scoped query with no input validation */
export async function runQueryWithoutInput<TOutput>(options: {
  handler: (ctx: QueryContext) => Promise<TOutput>;
  errorMessage?: string;
}): Promise<ActionResult<TOutput>> {
  try {
    const userId = await requireSessionUserId();
    await connectDB();
    const data = await options.handler({ userId });
    return success(data);
  } catch (error) {
    return handleActionError(error, options.errorMessage ?? "Failed to fetch data");
  }
}
