# Mollweide content

Website facts now live separately from website code.

## Add an airline

1. Copy `airlines/_template.json` and give it the next number and airline name, for example `40-example-airways.json`.
2. Replace the example information. A short submission may omit `short`, `group` and the entire `profile` section.
3. Add the transparent livery image to `assets/img/members/`.
4. Run `npm run build`.
5. Run `npm test` before asking for review.

The build joins all airline files into `assets/js/members.generated.js`, rebuilds the pages and checks for common mistakes such as duplicate airline codes, missing hubs and missing artwork.

Do not edit `assets/js/members.generated.js`; it is generated automatically.

## Why each airline has its own file

- A submission changes one small, readable record rather than a 1,800-line JavaScript file.
- Two airlines can be added at the same time without their changes colliding.
- A Discord bot can create exactly one file and attach one livery image.
- GitHub can show a clear review: what the member submitted, what was changed, and who approved it.
