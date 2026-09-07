# Kuratierter redlib-Fork

Upstream ([redlib-org/redlib](https://github.com/redlib-org/redlib)) ist seit
April 2026 ohne Commit, das letzte Release `v0.36.0` stammt von Maerz 2025.
Dieser Fork sammelt brauchbare offene Upstream-PRs und eigene Aenderungen,
ohne die Rueckkehr zu Upstream zu verbauen.

## Branch-Modell

| Branch | Rolle |
| --- | --- |
| `main` | Exakte Spiegelung von `upstream/main`. Wird nie direkt bearbeitet. |
| `pr/<n>-<name>` | Ein uebernommener Upstream-PR, abgezweigt von `upstream/main`. |
| `feat/<name>`, `fix/<name>` | Eigene Aenderungen, ebenfalls von `upstream/main`. |
| `meta/atlas-tooling` | Dieses Verzeichnis plus die CI-Workflows des Forks. |
| `atlas` | Integrationsbranch. **Wird nicht gepflegt, sondern gebaut.** |

`atlas` entsteht ausschliesslich durch `atlasctl rebuild`: leerer Checkout von
`upstream/main`, danach ein `--no-ff`-Merge je Zeile in `patches.list`. Wer
direkt auf `atlas` committet, verliert die Aenderung beim naechsten Rebuild.

Der Grund fuer den Umweg: Aenderungen bleiben einzeln adressierbar. Bei einem
Upstream-Update wird jeder Topic-Branch fuer sich rebased; nur er kann
konfliktieren, und `git rerere` merkt sich die Aufloesung. Ein gewachsener
Sammelbranch waere nach zwei Upstream-Releases nicht mehr entwirrbar.

## Alltag

```bash
.atlas/atlasctl sync                 # upstream + alle PR-Refs holen
.atlas/atlasctl adopt 298 gallery    # PR #298 als pr/298-gallery uebernehmen
$EDITOR .atlas/patches.list          # Branch ins Manifest eintragen
.atlas/atlasctl rebuild              # atlas neu bauen
git push --force-with-lease origin atlas
```

`rebuild` erzwingt einen sauberen Working Tree und setzt `atlas` per
`branch -f` um - der Branch wird also bewusst ueberschrieben, deshalb der
Force-Push.

## Nach einem Upstream-Release

```bash
.atlas/atlasctl sync
.atlas/atlasctl status               # zeigt, welche Branches konfliktieren
.atlas/atlasctl rebase               # Topic-Branches auf neue Basis setzen
.atlas/atlasctl rebuild
git push --force-with-lease origin atlas
```

Der Workflow `atlas upstream watch` prueft das woechentlich und legt bei
Abweichung ein Issue mit Label `upstream-sync` an.

## Deployment

`atlas image` baut bei jedem Push auf `atlas` ein amd64-Image nach
`ghcr.io/almighty-atlas/redlib` (Tags: `atlas`, `sha-<commit>`, `<datum>`).
Gebaut wird mit `Dockerfile.ubuntu`, weil dieses aus dem Quellcode baut -
das offizielle `Dockerfile` erwartet ein Binary aus der Release-Pipeline.

Damit entfaellt der lokale Rust-Build auf tiny02; der Homelab-Stack zieht
nur noch das Image.

## Design-Grundlage

`feat/design-tokens` benennt die Groessenskala, die das Stylesheet ohnehin
benutzt: Spacing (5er-Raster), Radien, Typo-Stufen, `--tap-target-min` und
`--media-max-height`. Die Werte sind aus den bestehenden Regeln ausgezaehlt,
nicht erfunden - `--tap-target-min` ist die Ausnahme und stammt aus
WCAG 2.5.8, weil es dafuer nichts abzuleiten gab.

**Bestehende Regeln behalten ihre Literale.** 2300 Zeilen auf Tokens
umzuschreiben wuerde mit jeder Upstream-Aenderung kollidieren und die
guenstige Rebasebarkeit beenden. Neue und angefasste Regeln greifen die
Tokens auf, die Skala breitet sich also mit der Arbeit aus statt in einem
Rutsch.

Kein Framework: redlib rendert serverseitig mit Askama, hat kein Node, kein
Tailwind und keinen Bundler; die sieben JS-Dateien sind Progressive
Enhancement. Vorschlaege wie shadcn/ui setzen React voraus und kaemen einem
Frontend-Rewrite gleich - damit waere der Fork nicht mehr mergebar.

## Offene Arbeit

Die Befunde aus dem Usability-Durchgang vom 2026-09-07 liegen als Issues im
Fork, mit Labels `defekt` / `usability` / `geschmack` plus `mobile`, `feed`,
`galerie`. Jedes Issue nennt Viewport, Beispiel-URL und die gemessenen
Werte, damit es ohne den urspruenglichen Kontext bearbeitbar ist.

`geschmack` bedeutet: die Entscheidung liegt beim Betreiber. Diese Issues
stellen die Frage und treffen sie nicht.

## Lizenz

redlib steht unter AGPL-3.0. Der Fork bleibt oeffentlich, damit die
Weitergabepflicht fuer die betriebene Instanz erfuellt ist.
