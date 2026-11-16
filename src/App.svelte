<script lang="ts">
  import { createWindowVirtualizer } from "@tanstack/svelte-virtual";
  import { untrack } from "svelte";
  import DatePicker from "./DatePicker.svelte";
  import { defaultBase, loadIndex, loadRanking } from "./rankings.ts";
  import { buildSearchIndex, searchRepos } from "./search.ts";
  import type { Ranking } from "./types.ts";

  const ROW_HEIGHT = 88;
  const fmt = new Intl.NumberFormat("en-US");
  const diffFmt = new Intl.NumberFormat("en-US", { signDisplay: "exceptZero" });

  /** Dates with a ranking file, newest first (rankings/index.json). */
  let dates = $state.raw<string[]>([]);
  /** What the user asked for: the day to show, and the day its star diff is measured from. */
  let view = $state.raw<{ date: string; base: string | null } | null>(null);
  /** What is on screen; replaced only once both files of a new view have arrived. */
  let ranking = $state.raw<Ranking | null>(null);
  /** Stars per repo id on the base day; null when there is no base. */
  let baseStars = $state.raw<Map<number, number> | null>(null);
  let error = $state<string | null>(null);
  let query = $state("");
  let sort = $state<"stars" | "gained" | "lost">("stars");
  let list = $state<HTMLElement>();
  let listTop = $state(0);

  const repos = $derived(ranking?.repositories ?? []);
  const searchIndex = $derived(buildSearchIndex(repos));
  // The index is in rank order, so search results stay sorted by stars.
  const filtered = $derived(query.trim() ? searchRepos(searchIndex, query) : repos);
  // Star change needs a base day; without one the list falls back to stars.
  const shown = $derived.by(() => {
    if (!baseStars || sort === "stars") return filtered;
    const sign = sort === "gained" ? 1 : -1;
    // Repos new since the base have no change to rank by; they go last. The sort is stable,
    // so ties keep rank order.
    return filtered
      .map((repo) => {
        const prev = baseStars!.get(repo.id);
        return { repo, key: prev === undefined ? -Infinity : sign * (repo.stars - prev) };
      })
      .sort((a, b) => (b.key > a.key ? 1 : b.key < a.key ? -1 : 0))
      .map((e) => e.repo);
  });

  const virtualizer = createWindowVirtualizer<HTMLDivElement>({
    count: 0,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  function message(e: unknown): string {
    return e instanceof Error ? e.message : String(e);
  }

  async function init() {
    error = null;
    try {
      dates = await loadIndex();
    } catch (e) {
      error = message(e);
      return;
    }
    select(dates[0], defaultBase(dates, dates[0]));
  }
  init();

  async function select(date: string, base: string | null) {
    const current = { date, base };
    view = current;
    error = null;
    try {
      const [next, baseRanking] = await Promise.all([
        loadRanking(date),
        base ? loadRanking(base) : null,
      ]);
      // A later pick may have finished first; only the latest one renders.
      if (view !== current) return;
      ranking = next;
      baseStars = baseRanking && new Map(baseRanking.repositories.map((r) => [r.id, r.stars]));
    } catch (e) {
      if (view === current) error = message(e);
    }
  }

  function retry() {
    if (view) select(view.date, view.base);
    else init();
  }

  // The list starts below the header; the virtualizer needs that offset in page coordinates.
  $effect(() => {
    if (!list) return;
    const measure = () => (listTop = list!.getBoundingClientRect().top + window.scrollY);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  });

  // .pre: the virtualizer must know the new count before the rows re-render against `shown`.
  $effect.pre(() => {
    const count = shown.length;
    const scrollMargin = listTop;
    // setOptions writes the store; untrack so this effect doesn't depend on its own write.
    untrack(() => $virtualizer.setOptions({ count, scrollMargin }));
  });
</script>

<header class="bar">
  <div class="bar-inner">
    <h1>GitHub Ranking</h1>
    <input
      class="search"
      type="search"
      placeholder="Search"
      aria-label="Search repositories"
      autocomplete="off"
      spellcheck="false"
      bind:value={query}
      oninput={() => {
        // A new search starts from the top of the list.
        window.scrollTo({ top: 0 });
      }}
      disabled={!ranking}
    />
    {#if view}
      <DatePicker {dates} date={view.date} base={view.base} onselect={select} />
    {/if}
    <select
      class="sort"
      aria-label="Sort"
      value={baseStars ? sort : "stars"}
      onchange={(e) => {
        sort = e.currentTarget.value as typeof sort;
        window.scrollTo({ top: 0 });
      }}
      disabled={!baseStars}
    >
      <option value="stars">Stars</option>
      <option value="gained">Gained</option>
      <option value="lost">Lost</option>
    </select>
    <a
      class="github"
      href="https://github.com/MioYiSama/github-ranking"
      target="_blank"
      rel="noopener"
      aria-label="GitHub repository"
    >
      <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
        <path
          fill="currentColor"
          d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"
        />
      </svg>
    </a>
  </div>
</header>

<main bind:this={list}>
  {#if error}
    <div class="message">
      <span>Couldn't load the ranking. {error}</span>
      <button type="button" onclick={retry}>Retry</button>
    </div>
  {:else if !ranking}
    <div class="sheet" aria-busy="true">
      {#each { length: 12 } as _}
        <div class="row skeleton" style:height="{ROW_HEIGHT}px">
          <span class="rank"><i style:width="20px"></i></span>
          <span class="avatar"></span>
          <span class="name"
            ><i style:width="40%"></i><i style:width="70%"></i><i style:width="30%"></i></span
          >
          <span class="lang"><i style:width="64px"></i></span>
          <span class="stars"><i style:width="56px"></i></span>
        </div>
      {/each}
    </div>
  {:else if shown.length === 0}
    <div class="message">No repositories match “{query.trim()}”.</div>
  {:else}
    <ol class="sheet" class:with-diff={baseStars} style:height="{$virtualizer.getTotalSize()}px">
      {#each $virtualizer.getVirtualItems() as item (item.key)}
        {@const repo = shown[item.index]}
        {@const name = repo.full_name.slice(repo.owner.length + 1)}
        <li
          class="slot"
          style:height="{item.size}px"
          style:transform="translateY({item.start - listTop}px)"
        >
          <a class="row" href={repo.html_url} target="_blank" rel="noopener">
            <span class="rank">{repo.rank}</span>
            <img
              class="avatar"
              src="{repo.avatar_url}&s=64"
              alt=""
              width="32"
              height="32"
              decoding="async"
            />
            <span class="name">
              <span class="full-name"><span class="owner">{repo.owner}/</span>{name}</span>
              <span class="desc">
                {#if repo.language}
                  <span class="lang-inline">{repo.language}{repo.description ? " · " : ""}</span>
                {/if}{repo.description ?? ""}
              </span>
              {#if repo.topics.length}
                <span class="topics">
                  {#each repo.topics as topic (topic)}<span class="topic">{topic}</span>{/each}
                </span>
              {/if}
            </span>
            <span class="lang">{repo.language ?? "—"}</span>
            <span class="stars">{fmt.format(repo.stars)}</span>
            {#if baseStars}
              {@const prev = baseStars.get(repo.id)}
              {#if prev === undefined}
                <span class="diff">new</span>
              {:else}
                <span class="diff" class:up={repo.stars > prev} class:down={repo.stars < prev}
                  >{diffFmt.format(repo.stars - prev)}</span
                >
              {/if}
            {/if}
          </a>
        </li>
      {/each}
    </ol>
  {/if}
</main>
