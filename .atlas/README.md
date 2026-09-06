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

## Lizenz

redlib steht unter AGPL-3.0. Der Fork bleibt oeffentlich, damit die
Weitergabepflicht fuer die betriebene Instanz erfuellt ist.
