# Release-Checkliste

## Automatisch

- [x] `npm ci` läuft mit der vorgesehenen Node-LTS-Version.
- [x] `npm run check` endet mit 0 Fehlern, 0 Warnungen, 12 grünen Node-Tests und grünem Browser-Smoke-Test.
- [x] `npm run build` hält das 16-MiB-Budget ein und enthält ausschließlich manifestierte Assets.
- [x] CI ist für den Zielcommit grün.

## Manuell

- [ ] Desktop und Hochkantansicht starten ohne Konsolenfehler.
- [ ] Erststart-Hilfe sowie alle fünf Actions funktionieren per Pointer und Tastatur.
- [ ] Ziehen, Wischen, Doppelsprung und beide Touch-Profile wurden auf einem physischen Gerät geprüft.
- [ ] Neustartbestätigung, Pause und Audiozustände sind verständlich und korrekt angesagt.
- [ ] Speichern/Fortsetzen wurde mit normalem, beschädigtem und blockiertem Storage geprüft.
- [ ] Mindestens ein kompletter 52-Level-Lauf inklusive aller Bosslevel wurde gespielt.
- [ ] Browserzoom, Fokusreihenfolge und ein Screenreader-Smoke-Test wurden geprüft.
- [ ] `docs/ASSETS.md` enthält belegte Rechte für Phaser, Sprites, Musik und Icon.

## Veröffentlichung

- [ ] Ausschließlich der Inhalt von `dist/` wird deployt.
- [ ] Domain/HTTPS und `CNAME` zeigen auf das gewünschte Ziel.
- [ ] Audio lädt im Netzwerkprotokoll erst nach einer Nutzergeste und nur für die aktive Auswahl.
- [ ] Nach dem Deployment werden Start, Asset-Requests, Fortsetzen und Offline-/Fehlerfallback geprüft.
