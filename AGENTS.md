<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Catalog (stores, products, prices, coupons) loads once via `catalogQuery` in src/lib/data.ts; the basket optimizer runs client-side in src/lib/optimizer.ts — small catalog, instant recompute.
- Guest state (basket, consent, location, language) lives in localStorage via src/lib/app-state.tsx and the guest basket merges into the user's account on sign-in.
- All UI text goes through the bilingual dictionary in src/lib/i18n.tsx (en/ar, RTL set on <html>) — never hardcode user-facing strings.
