# PDA.OK Todo

> This file is the running log of fixes from across the build. Most items
> are complete. A few open ones below the line are deliberately kept
> as a record of what's known, not what's promised.

---

## Closed ✅

All items previously tracked in this file have been completed:

- Mirror & Mystery emoji rendering — fixed (universal emoji stripping)
- AddMovementModal — rewritten from scratch, modal opens correctly
- Substance Journal duplicate-entry bug on "Did It" — fixed
- Craft a Moment field labels (Notice / Act / Reflect) — done
- BloomEffect somatic feedback layer — implemented
- Theme system (Liminal / Crystalline / Organic) — shipped
- Nourish page restructure (Compass Rose, Movement Field, Momentum Monitor) — shipped
- Migration system through v13 — stable
- Council Voice System integration — shipped
- Companion-first voice system + relationship-awareness layer — shipped
- Gemini 2.5 Pro upgrade — done
- Android home-screen widget — first build → refined → redesigned
- Widget quick-log modal color (was depressing gray, now carries the field) — done
- Journalistic Synthesis modal asymmetry — fixed
- Widget redesigned as 4×1 thin strip, resizable, breathes with the day — done

---

## Known and open

These are real but not blocking. Kept here so they aren't lost.

- [ ] **Substances tab — journal entry detail modal sometimes doesn't open on tap.**
  Nourishment tab modal works correctly. Most likely an `onPress` wiring
  or state-passing issue, not the modal component itself.
  Documented in README, "Known Issues."

- [ ] **One late-time anchor was removed during a Temperature Ground cleanup
  that went one item too far.** "Stillness Signal" was restored in
  migration v9. If a fourth late anchor still feels missing, it's the
  one that's not in the data — check `app/_constants/DefaultData.ts`
  against the original anchor manifest.

- [ ] **Color interpolation utilities.** Reverted to discrete circadian
  colors (correct decision). `colorInterpolation.ts` and an extended
  `timeUtils.ts` were never actually deleted from disk during the
  revert — they just stopped being imported. If a future pass cleans
  up unused code, those two are candidates for removal.

---

See `FINAL.md` for the closing note on the project as a whole.
