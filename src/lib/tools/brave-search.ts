import { tool } from "ai";
import { z } from "zod";

const BRAVE_SEARCH_ENDPOINT = "https://api.search.brave.com/res/v1/web/search";
const DEFAULT_RESULT_COUNT = 3;
const MAX_RESULT_COUNT = 5;

interface BraveWebResult {
  title: string;
  url: string;
  description: string;
}

interface BraveSearchApiResult {
  query: string;
  results: BraveWebResult[];
  totalResults: number;
  source: "Brave Search";
  fetchedAt: string;
  message?: string;
  error?: string;
}

interface BraveSearchApiResponse {
  web?: {
    results?: Array<{
      title?: string;
      url?: string;
      description?: string;
      snippet?: string;
    }>;
  };
  query?: {
    original?: string;
  };
}

const braveSearchParameters = z
  .object({
    query: z
      .string()
      .min(3, "Query should be at least 3 characters long")
      .describe("Search query to send to Brave Search."),
    count: z
      .number()
      .int()
      .min(1)
      .max(MAX_RESULT_COUNT)
      .optional()
      .describe("Number of results to return (1-5). Defaults to 3."),
    country: z
      .string()
      .length(2)
      .optional()
      .describe("Two-letter country code to localize results (e.g., US, GB)."),
    freshness: z
      .enum(["hour", "day", "week", "month"])
      .optional()
      .describe("Restrict results to a specific freshness window."),
  })
  .strict();

type BraveSearchInput = z.infer<typeof braveSearchParameters>;

function normalizeCount(count?: number): number {
  if (typeof count !== "number" || Number.isNaN(count)) {
    return DEFAULT_RESULT_COUNT;
  }
  return Math.min(Math.max(Math.trunc(count), 1), MAX_RESULT_COUNT);
}

function toBraveResults(
  data: BraveSearchApiResponse,
  count: number
): BraveWebResult[] {
  const rawResults = data.web?.results;
  if (!Array.isArray(rawResults)) {
    return [];
  }

  return rawResults
    .slice(0, count)
    .map((result) => {
      if (!result?.url) {
        return null;
      }

      const description = result.description ?? result.snippet ?? "";

      return {
        title: result.title ?? result.url,
        url: result.url,
        description,
      } satisfies BraveWebResult;
    })
    .filter((item): item is BraveWebResult => item !== null);
}

function buildSuccessResult(
  query: string,
  results: BraveWebResult[]
): BraveSearchApiResult {
  return {
    query,
    results,
    totalResults: results.length,
    source: "Brave Search",
    fetchedAt: new Date().toISOString(),
    message: results.length === 0 ? "No results found." : undefined,
  };
}

function buildErrorResult(query: string, error: string): BraveSearchApiResult {
  return {
    query,
    results: [],
    totalResults: 0,
    source: "Brave Search",
    fetchedAt: new Date().toISOString(),
    error,
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text ? text.slice(0, 500) : response.statusText;
  } catch (error) {
    return response.statusText || "Unexpected Brave Search response";
  }
}

async function executeBraveSearch({
  query,
  count,
  country,
  freshness,
}: BraveSearchInput): Promise<BraveSearchApiResult> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;

  if (!apiKey) {
    return buildErrorResult(
      query,
      "Brave Search API key is not configured. Please set BRAVE_SEARCH_API_KEY on the server."
    );
  }

  const normalizedCount = normalizeCount(count);
  const params = new URLSearchParams({
    q: query,
    count: normalizedCount.toString(),
  });

  if (country) {
    params.set("country", country);
  }
  if (freshness) {
    params.set("freshness", freshness);
  }

  const requestUrl = `${BRAVE_SEARCH_ENDPOINT}?${params.toString()}`;

  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": apiKey,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const message = await readErrorMessage(response);
      return buildErrorResult(
        query,
        `Brave Search request failed with status ${response.status}: ${message}`
      );
    }

    const payload = (await response.json()) as BraveSearchApiResponse;
    const resolvedQuery = payload.query?.original ?? query;
    const results = toBraveResults(payload, normalizedCount);

    return buildSuccessResult(resolvedQuery, results);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Brave Search error";
    return buildErrorResult(query, message);
  }
}

export const braveSearchTool = tool({
  name: "brave-web-search",
  description:
    "Search the web with Brave Search. Use this tool when you need up-to-date information, news, or details about recent events.",
  inputSchema: braveSearchParameters,
  execute: async (input: BraveSearchInput) => executeBraveSearch(input),
});

export type BraveSearchToolResult = BraveSearchApiResult;
export type BraveSearchToolInvocationInput = BraveSearchInput;
