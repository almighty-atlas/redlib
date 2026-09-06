# Triage der offenen Upstream-PRs

Stand: 2026-09-07, gegen `upstream/main` = `a4d36e9` (2026-04-24).
Alle 45 zu diesem Zeitpunkt offenen PRs von `redlib-org/redlib`.

Spalte *Merge* ist das Ergebnis von `git merge-tree` gegen `upstream/main`,
nicht eine Bewertung des Inhalts.

## Uebernommen

| PR | Merge | Was | Warum |
| --- | --- | --- | --- |
| #542 | clean | Out-of-bounds bei `comments[0].author.name` | Absturz bei Posts ohne Kommentare. Einzeiler. |
| #560 | clean | Share-Links auf Profilseiten | Erzeugte bisher kaputte Links. |
| #521 | clean | Default-Sortierung greift ohne gespeicherte Settings | Betrifft jede frische Session. |
| #520 | clean | Groessere Trefferflaeche fuer Kommentar-Collapse mobil | Reine Bedienbarkeit. |
| #524 | clean | Fokus-Outline der Suchbox | Sichtbarer Fokus, Barrierefreiheit. |
| #413 | clean | Innenabstaende in Posts und Kommentaren | Behebt inkonsistente Abstaende. |
| #291 | clean | Kommentar per Klick auf die Einrueckungslinie einklappen | Sehr nuetzlich in tiefen Threads. |
| #194 | clean | Autoplay nur fuer sichtbare Videos | Spart Bandbreite spuerbar. |
| #539 | clean | Lazy Loading fuer Post-Bilder | Entfernt mehr Code als es hinzufuegt. |
| #298 | clean | **Galerie als horizontaler Slider** | Kernpunkt: Galerien waren untereinander gestapelt. Draft-Stand, Fortschrittspunkte sind noch auskommentiert. |
| #546 | clean | Galerie herunterladen | Ergaenzt #298. |
| #506 | clean | CMAF-Videoformat zusaetzlich zu DASH | Reddit liefert zunehmend CMAF. |
| #507 | clean | RedGifs mit Proxy | Musste auf `wreq` portiert werden, siehe unten. |
| #561 | clean | Giphy-GIFs in Kommentaren proxen und einbetten | Vermeidet Direktzugriffe des Browsers auf Giphy. |
| #566 | clean | `REDLIB_DEFAULT_GEO_FILTER` | Regionsfilter als Instanz-Default. |
| #568 | clean | `REDLIB_SOURCE_URL` konfigurierbar | Fuer einen Fork noetig: die AGPL verlangt, dass der Footer auf *diesen* Quellcode zeigt, nicht auf Upstream. |
| #422 | clean | Tastaturnavigation | Kostet nur eine JS-Datei. |
| #410 | clean | Lizenzlinks in den restlichen JS-Dateien | AGPL-Hygiene, relevant weil dieser Fork oeffentlich ausgeliefert wird. |

### Nacharbeit an uebernommenen PRs

- **#507 (RedGifs)** kompilierte nicht mehr. Upstream hat in #544 den
  HTTP-Client von `hyper` auf `wreq` umgestellt; `CLIENT::request` nimmt
  seither Methode *und* URI und liefert einen `RequestBuilder` statt eines
  Futures. Portiert in `fix(redgifs): port the RedGifs client to wreq` -
  Anfragen laufen jetzt ueber den gemeinsamen Client, erben also dessen
  TLS-Emulation und Proxy-Konfiguration.
- **#561 gegen #507**, **#566 gegen #568**, **#422 gegen #546**: jeweils
  additive Konflikte an derselben Stelle (Routentabelle bzw. Config-Struct).
  Aufgeloest durch Behalten beider Seiten; `git rerere` wiederholt das bei
  kuenftigen Rebuilds automatisch.

## Abgelehnt

| PR | Warum |
| --- | --- |
| #545 | Bettet 32 MB `ffmpeg-core.wasm` per `include_bytes!` ins Binary, nur um Video und Audio clientseitig zu muxen. Kollidiert zusaetzlich mit #546. |
| #549 | Der CMAF-Teil ist inhaltlich #506, routet aber generisch ueber `/vid/:id/:prefix/:size` und schiebt einen Nutzerwert in die Upstream-URL. Der zusaetzliche `rich:video`-Zweig prueft dieselbe Bedingung wie der erste Zweig derselben `if`-Kette und ist damit unerreichbar. |
| #509 | Wechsel auf `hyper-tls`. Ueberholt: Upstream ist mit #544 auf `wreq` gegangen. |
| #548 | Umbau auf Axum/Hyper v1. Vom Autor selbst als unfertig und aufgegeben markiert, 38 Konfliktdateien. |
| #254 | Schaltet die TLS-Zertifikatspruefung zum Debuggen ab. In einer erreichbaren Instanz nichts verloren. |
| #400 | Laedt Medien clientseitig direkt von Reddit. Hebt genau die Proxy-Eigenschaft auf, wegen der redlib hier laeuft. |
| #179, #181 | Zwei konkurrierende DASH-Player (Video.js bzw. dash.js), je ueber 20 Konfliktdateien. Die Instanz laeuft auf HLS. |

## Nicht relevant fuer diese Instanz

| PR | Warum |
| --- | --- |
| #552, #492 | Nix-Abhaengigkeiten. Nix wird hier nicht benutzt. |
| #556 | Betrifft nur `Dockerfile.alpine`. Gebaut wird mit `Dockerfile.ubuntu`. |
| #517, #133 | Betreffen das Release-`Dockerfile`, das ein vorgebautes Binary erwartet. |
| #439 | Alpine-Basisimage. Siehe #556. |
| #435 | Devcontainer-Image. |
| #486 | README-Korrektur bei Upstream. |
| #454 | Erhaelt Einstellungen beim Wechsel auf eine zufaellige andere Instanz. Bei einer Einzelinstanz ohne Wirkung. |
| #476 | Bump von brotli 7 auf 8. Dependency-Updates macht der Fork besser selbst und gesammelt. |

## Offen - Geschmacks- oder Bedarfsfrage

Diese sind nicht abgelehnt, sondern warten auf eine Entscheidung. Aufnehmen
mit `atlasctl adopt <nr> <name>` plus Eintrag in `patches.list`.

| PR | Merge | Was | Anmerkung |
| --- | --- | --- | --- |
| #378 | Konflikt | Getrennte Themes fuer hell und dunkel | Passt zum hiesigen `REDLIB_DEFAULT_THEME=system`. Konflikt nur in README und `utils.rs`. |
| #290 | Konflikt | Unblur per Klick als Default, Unblur bei Hover als Option | Aendert das Verhalten von NSFW-Spoilern. |
| #538 | Konflikt | Catppuccin-Themes | Konflikt nur in der README. |
| #396 | Konflikt | Cache merkt sich Fehler | Stabilitaet: verhindert, dass Fehlerantworten dauerhaft gecacht werden. |
| #460 | Konflikt | Tracking-Parameter aus Links entfernen | Passt zum Zweck der Instanz, schneidet aber breit. |
| #394 | clean | Footer fix am unteren Bildschirmrand | Reine Geschmackssache. |
| #572, #563 | clean | Bilder in RSS-Feeds | Nur sinnvoll, wenn die RSS-Feeds genutzt werden. |
| #564 | clean | Anzahl Posts pro Seite konfigurierbar | Vom Autor als WIP markiert. |
