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
  let list = $state<HTMLElement>();
  let listTop = $state(0);

  const repos = $derived(ranking?.repositories ?? []);
  const searchIndex = $derived(buildSearchIndex(repos));
  // The index is in rank order, so search results stay sorted by stars.
  const filtered = $derived(query.trim() ? searchRepos(searchIndex, query) : repos);

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

  // .pre: the virtualizer must know the new count before the rows re-render against `filtered`.
  $effect.pre(() => {
    const count = filtered.length;
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
  {:else if filtered.length === 0}
    <div class="message">No repositories match “{query.trim()}”.</div>
  {:else}
    <ol class="sheet" class:with-diff={baseStars} style:height="{$virtualizer.getTotalSize()}px">
      {#each $virtualizer.getVirtualItems() as item (item.key)}
        {@const repo = filtered[item.index]}
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
