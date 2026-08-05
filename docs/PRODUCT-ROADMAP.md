# Produktrichtung: Cat Platformer

Stand: 2026-08-06

## Zielbild

`Cat Platformer` soll sich wie eine kompakte, unmittelbar lesbare Mäusejagd anfühlen: kurze Level, präzise Bewegung, sichtbare Aufgaben und genug Tempo, dass Sammelrouten und Gegner-Stomps zu einem persönlichen Laufstil werden. Die 52 Level sind die Langzeitreise; der Spaß muss trotzdem bereits in den nächsten zehn Sekunden entstehen.

## Produktprinzipien

1. **Jede Aktion antwortet.** Sammeln, Stompen, Schaden und Levelabschluss brauchen klar unterscheidbares Bild-, Text- und Kamerafeedback.
2. **Ziele bleiben im Blick.** Mäuse, Flagge, Levelaufgabe und Combo dürfen nicht in Statusmeldungen verschwinden.
3. **Flow vor Menütiefe.** Neue Systeme sollen den Lauf bereichern, nicht regelmäßig unterbrechen.
4. **Lesbarkeit vor Dekoration.** HUD, Gegner und Plattformen müssen auf Desktop und Hochkantansicht sofort erfassbar bleiben.
5. **Faire Langzeitmotivation.** Varianten und Aufgaben belohnen Können, ohne schwächere Läufe zu blockieren.

## Priorisierte Roadmap

| Priorität | Thema | Konkreter Nutzen | Status |
|---|---|---|---|
| P0 | Mission-HUD | Levelweg, Mäuse, Leben, Punkte und Aufgabenfortschritt bilden eine klare visuelle Hierarchie | umgesetzt |
| P0 | Combo-Kommunikation | Zeitfenster und Multiplikator werden dauerhaft sichtbar statt nur kurz eingeblendet | umgesetzt |
| P0 | Game Feel | Sammelbursts, Punktetexte, kontrollierte Kamerareaktionen und Abschlussfeuerwerk verstärken Aktionen | umgesetzt |
| P1 | Levelabschlusskarte | Bonus, Aufgabe, Leistung, Entdeckungsbonus und nächstes Level werden vor dem bewussten Weitergehen zusammengefasst | umgesetzt |
| P1 | Entdeckungen | deterministische Goldmaus-Nebenrouten ab Level 3 erhöhen Risiko, Belohnung und Wiederspielwert, ohne den Abschluss zu blockieren | umgesetzt |
| P1 | Szeneninszenierung | Levelkarte, Vorhang, Kamerablende und finales Reisebild geben Start, Wechsel und Abschluss einen eigenen Rhythmus | umgesetzt |
| P1 | Sichere Übergänge | Physik und Spielzeit pausieren; wichtige Etappen laufen filmisch, normale kompakt und beide sind überspringbar | umgesetzt |
| P1 | Reviercharakter | Wald, Ozean, Wüste, Berg und Stadt verändern Schwerkraft, Lauf- oder Sprunggefühl nachvollziehbar | umgesetzt |
| P1 | Levelauswahl/Abzeichen | erreichte Level, Bestzeit, Aufgabe und Entdeckung werden auf einer persistenten 52-Etappen-Karte vergleichbar | umgesetzt |
| P1 | Revierbosse | die fünf Bossjagden rotieren durch alle Reviere und kündigen in Phase zwei ein eigenes, unterschiedlich getaktetes Sturmmanöver an | umgesetzt |
| P2 | Zusätzliche Animationen | Landungen besitzen bereits Squash, Partikel und optionalen Kameraimpuls; Bremsen, Treffer und Sieg brauchen eigene Spritezustände | teilweise umgesetzt; weitere Assetarbeit |
| P2 | Tägliche Route | reproduzierbarer Seed mit Tageswertung schafft einen kurzen Wiederkehrgrund | Backlog |

## Erfolgskriterien dieser Iteration

- Levelabschluss, Aufgabenbonus, Serienbonus und nächstes Ziel sind vor dem Weitergehen lesbar.
- Goldmaus-Routen sind sichtbar, optional und für Level 3 bis 52 deterministisch abgesichert.
- Die Einführungsaufgabe wird im Abschlussbericht neutral statt fälschlich als Fehlschlag gewertet.
- Oberfläche, Abschlussdialog und Entdeckungs-HUD bleiben auf schmalen Viewports bedienbar und zoomfähig.
- Intro, Menüs, Pause und Szenenwechsel verfälschen weder Lauf- noch Etappenzeit.
- Die Reisekarte sperrt zukünftige Level, erlaubt Wiederholungen und behält jeweils das beste Ergebnis.
- Automatische Tests, Browser-Smoke und Release-Budget bleiben grün.
