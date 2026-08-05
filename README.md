# Cat Platformer

Cat Platformer ist ein browserbasiertes Phaser-Plattformspiel mit 52 Levels, Bossen, Levelvarianten, Aufgaben, adaptiver Schwierigkeit und fortsetzbaren Läufen. Ein sichtbares Mission-HUD, Flow-Zeitfenster und unterscheidbares Aktionsfeedback machen die Mäusejagd auf Desktop und Touch unmittelbar lesbar.

## Lokal starten

Voraussetzung ist Node.js 20 oder neuer.

```powershell
npm ci
npm run dev
```

Danach läuft das Spiel unter `http://127.0.0.1:4174`. Der Entwicklungsserver bindet nur an localhost.

## Steuerung

- Pfeile oder A/D: laufen
- Leertaste, W oder Pfeil hoch: springen und Doppelsprung
- P: Pause, R: Lauf neu starten, M: Audio wechseln
- Touch: horizontal ziehen zum Laufen, nach oben wischen zum Springen

Neustart, Pause, Audio, Touch-Profil, Reisekarte und Hilfe sind zusätzlich als benannte Buttons verfügbar. Während eines aktiven Laufs muss der Neustart innerhalb von 2,5 Sekunden bestätigt werden. Nach jedem abgeschlossenen Level wird der Lauf gespeichert und beim nächsten Start zum Fortsetzen angeboten. Die Reisekarte hält Bestzeit, Aufgabe und Entdeckung je Level fest und startet freigeschaltete Etappen als neuen Lauf.

## Entwicklung und Qualität

```powershell
npm run check   # ESLint, Node-Tests und Headless-Chrome-Smoke-Test
npm run build   # erzeugt das manifestgesteuerte Release in dist/
```

Nützliche Query-Parameter:

- `?debug=1` aktiviert Hitbox-Debugging über F2.
- `?testlevel=1` beziehungsweise `?boss=1` startet Testinhalte.
- `?touch=easy` oder `?touch=precise` setzt das Touch-Profil.
- `?bgm=primary`, `?bgm=alt` oder `?bgm=off` überschreibt die gespeicherte Audioauswahl.
- `?help=1` öffnet die Hilfe; `?help=0` unterdrückt nur das automatische Öffnen.
- `?resume=1`, `?resume=0` oder `?new=1` steuert den gespeicherten Lauf für automatisierte Prüfungen.

`src/game.js` enthält weiterhin den Phaser-Szenenlebenszyklus. Generator, Progression/Aufgaben, Persistenz und HUD-Textformatierung liegen als browserunabhängig getestete Module daneben.

## Release und Assets

`npm run build` liest `assets/assets-manifest.json` und kopiert nur referenzierte Runtime-Assets sowie HTML, CSS, JavaScript, Phaser, Icon und Domainkonfiguration. Unreferenzierte Audiodateien, `.piskel`-Quellen, Tests und Auditbilder werden ausgeschlossen. Das Build bricht oberhalb von 16 MiB ab und schreibt `dist/release-manifest.json`.

Nur die ausgewählte Musikschicht wird vorbereitet; `preload="none"` verhindert einen Audio-Download vor der ersten Nutzergeste. Die beiden ausgelieferten Musikdateien dominieren das verbleibende 15,5-MB-Artefakt und sind der nächste Optimierungshebel.

Vor einer Veröffentlichung die [Release-Checkliste](docs/RELEASE.md) und das [Asset-Inventar](docs/ASSETS.md) prüfen. Der ausführliche technische Stand steht in [AUDIT.md](AUDIT.md).

Unterstützt werden aktuelle Versionen von Chrome/Edge, Firefox und Safari. Physische Touchgeräte, lange Komplettläufe und Screenreader bleiben Teil der manuellen Releaseprüfung.
