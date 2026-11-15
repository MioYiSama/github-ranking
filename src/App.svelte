<script lang="ts">
  import { createWindowVirtualizer } from "@tanstack/svelte-virtual";
  import Fuse from "fuse.js";
  import { untrack } from "svelte";
  import { loadLatestRanking, loadPreviousRanking } from "./rankings.ts";
  import type { Ranking } from "./types.ts";

  const ROW_HEIGHT = 88;
  const fmt = new Intl.NumberFormat("en-US");
  const diffFmt = new Intl.NumberFormat("en-US", { signDisplay: "exceptZero" });

  let ranking = $state<Ranking | null>(null);
  let error = $state<string | null>(null);
  let query = $state("");
  let list = $state<HTMLElement>();
  let listTop = $state(0);
  /** Stars per repo id on the previous day; null until loaded or when that day is missing. */
  let prevStars = $state.raw<Map<number, number> | null>(null);

  const repos = $derived(ranking?.repositories ?? []);
  const fuse = $derived(
    new Fuse(repos, {
      keys: [
        { name: "name", weight: 4, getFn: (r) => r.full_name.slice(r.owner.length + 1) },
        { name: "owner", weight: 2 },
        { name: "topics", weight: 2 },
        { name: "language", weight: 1 },
        { name: "description", weight: 1 },
      ],
      threshold: 0.3,
      // Descriptions are long; a match anywhere in them counts.
      ignoreLocation: true,
      includeScore: true,
      includeMatches: true,
    }),
  );

  // Exact hits in any field all score ~0, so Fuse alone can't tell a name hit from a
  // description hit. Order by where it matched, then how well (in 0.05 steps), then stars.
  const FIELD_TIER: Record<string, number> = { name: 0, owner: 1, topics: 1 };
  const filtered = $derived.by(() => {
    const q = query.trim();
    if (!q) return repos;
    return fuse
      .search(q)
      .map((r) => ({
        repo: r.item,
        tier: Math.min(...(r.matches ?? []).map((m) => FIELD_TIER[m.key ?? ""] ?? 2)),
        score: Math.round((r.score ?? 1) * 20),
      }))
      .sort((a, b) => a.tier - b.tier || a.score - b.score || a.repo.rank - b.repo.rank)
      .map((r) => r.repo);
  });

  const virtualizer = createWindowVirtualizer<HTMLDivElement>({
    count: 0,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  async function load() {
    error = null;
    try {
      ranking = await loadLatestRanking();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      return;
    }
    // The diff is extra: the list renders without waiting for it, and a failed load just omits it.
    loadPreviousRanking(ranking).then(
      (prev) => {
        if (prev) prevStars = new Map(prev.repositories.map((r) => [r.id, r.stars]));
      },
      (e) => console.warn("previous ranking unavailable:", e),
    );
  }
  load();

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
    {#if ranking}
      <time datetime={ranking.date}>{ranking.date}</time>
    {/if}
  </div>
</header>

<main bind:this={list}>
  {#if error}
    <div class="message">
      <span>Couldn't load the ranking. {error}</span>
      <button type="button" onclick={load}>Retry</button>
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
    <ol class="sheet" class:with-diff={prevStars} style:height="{$virtualizer.getTotalSize()}px">
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
            {#if prevStars}
              {@const prev = prevStars.get(repo.id)}
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
