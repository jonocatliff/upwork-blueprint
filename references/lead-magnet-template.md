# Template source

The report shell comes from the proposal lead magnet it was adapted from, at source commit
`b86a6d8f9f5e8b32c9d81b72fed9fc044984edc0`. Git commit `880b0a9` in this
repository contains the byte-identical source snapshot before adaptation.

The vendored source lives in `templates/lead-magnet/src/proposal/`. The portable runtime in
`templates/lead-magnet/src/main.tsx` supplies report data and Vite builds the complete report
into `templates/lead-magnet/dist/index.html`.

Keep the illustrations, the scorecard, the interactions and the visual system.
The component structure is not frozen: a component the generator stops feeding is
dead weight in every report that ships afterwards, and it goes. What an
independent freelancer installation requires:

- remove the original names, logos and operator-specific links;
- remove tracking, pricing, calendars and off-platform contact routes;
- remove remote media fallbacks;
- map measured job evidence into the existing report data model;
- show missing evidence as missing, never as a fabricated result;
- end with an Upwork reply instruction.

The built file must remain self-contained. It may load data URI images and run
its bundled script. It must make no network request.
