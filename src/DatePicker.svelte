<script lang="ts">
  import { defaultBase } from "./rankings.ts";

  interface Props {
    /** Dates with a ranking, newest first. */
    dates: string[];
    date: string;
    base: string | null;
    onselect: (date: string, base: string | null) => void;
  }
  let { dates, date, base, onselect }: Props = $props();

  const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const monthFmt = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  let open = $state(false);
  /** Month on display, "YYYY-MM". */
  let month = $state("");
  /** First pick of a comparison; the next pick closes the range. */
  let anchor = $state<string | null>(null);
  let hover = $state<string | null>(null);
  let root = $state<HTMLElement>();

  const available = $derived(new Set(dates));
  // A base other than the day before is an explicit comparison; show it as a range.
  const comparing = $derived(base !== null && base !== defaultBase(dates, date));
  const firstMonth = $derived(dates.at(-1)!.slice(0, 7));
  const lastMonth = $derived(dates[0].slice(0, 7));

  /** Range to highlight: the pending one while picking, otherwise the current view. */
  const range = $derived.by(() => {
    if (anchor) {
      const other = hover && available.has(hover) ? hover : anchor;
      return anchor < other ? [anchor, other] : [other, anchor];
    }
    return [comparing ? base! : date, date];
  });

  /** Day cells of `month`, Monday first; null pads the first week. */
  const cells = $derived.by(() => {
    const [y, m] = month.split("-").map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const pad = (first.getUTCDay() + 6) % 7;
    return [
      ...Array.from({ length: pad }, () => null),
      ...Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
    ];
  });

  function shiftMonth(delta: number) {
    const [y, m] = month.split("-").map(Number);
    month = new Date(Date.UTC(y, m - 1 + delta, 1)).toISOString().slice(0, 7);
  }

  function toggle() {
    open = !open;
    month = date.slice(0, 7);
    anchor = null;
  }

  function pick(day: string) {
    if (!anchor) {
      // First pick shows that day right away; a second pick turns it into a comparison.
      anchor = day;
      onselect(day, defaultBase(dates, day));
      return;
    }
    if (day !== anchor) onselect(day > anchor ? day : anchor, day > anchor ? anchor : day);
    anchor = null;
    open = false;
  }

  $effect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root?.contains(e.target as Node)) open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") open = false;
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  });
</script>

<div class="picker" bind:this={root}>
  <button type="button" class="picker-trigger" aria-expanded={open} onclick={toggle}>
    {comparing ? `${base} → ${date}` : date}
  </button>
  {#if open}
    <div class="calendar" role="dialog" aria-label="Choose a date, or two to compare">
      <div class="calendar-head">
        <button
          type="button"
          aria-label="Previous month"
          disabled={month <= firstMonth}
          onclick={() => shiftMonth(-1)}>‹</button
        >
        <span>{monthFmt.format(new Date(`${month}-01T00:00:00Z`))}</span>
        <button
          type="button"
          aria-label="Next month"
          disabled={month >= lastMonth}
          onclick={() => shiftMonth(1)}>›</button
        >
      </div>
      <div class="calendar-grid" role="presentation" onpointerleave={() => (hover = null)}>
        {#each WEEKDAYS as weekday (weekday)}
          <span class="weekday">{weekday}</span>
        {/each}
        {#each cells as day, i (day ?? `pad-${i}`)}
          {#if day}
            <button
              type="button"
              class="day"
              class:edge={day === range[0] || day === range[1]}
              class:between={day > range[0] && day < range[1]}
              disabled={!available.has(day)}
              onpointerenter={() => (hover = day)}
              onclick={() => pick(day)}>{Number(day.slice(8))}</button
            >
          {:else}
            <span></span>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>
