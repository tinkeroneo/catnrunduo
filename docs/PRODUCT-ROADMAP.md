# Produktrichtung: Cat Platformer

Stand: 2026-08-05

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
| P1 | Levelabschlusskarte | Bonus, Aufgabe und Serienfortschritt werden vor dem nächsten Level verständlich zusammengefasst | nächste Iteration |
| P1 | Entdeckungen | optionale Nebenrouten, sichtbare Geheimnisse und riskantere Mäuseketten erhöhen Wiederspielwert | Backlog |
| P1 | Levelauswahl/Abzeichen | bereits erreichte Level, Bestzeit und Aufgabenstatus werden außerhalb des Runs vergleichbar | Backlog |
| P2 | Zusätzliche Animationen | Landung, Bremsen, Treffer und Sieg erhalten eigene Sprite-/Effektzustände | benötigt Assetarbeit |
| P2 | Tägliche Route | reproduzierbarer Seed mit Tageswertung schafft einen kurzen Wiederkehrgrund | Backlog |

## Erfolgskriterien dieser Iteration

- Spielziel und aktuelle Aufgabe sind ohne Hilfe-Dialog ablesbar.
- Das Combo-Zeitfenster ist verständlich und reagiert auf Sammeln sowie Ablauf.
- Sammeln, Stompen, Schaden und Levelabschluss fühlen sich visuell unterschiedlich an.
- Die neue Oberfläche bleibt auf schmalen Viewports bedienbar und zoomfähig.
- Automatische Tests, Browser-Smoke und Release-Budget bleiben grün.
