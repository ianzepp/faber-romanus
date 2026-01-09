# Norma (Standard Library)

The Faber standard library, defined via `@ verte` annotations that specify per-target translations. Both compilers (faber and rivus) auto-generate from these definitions.

## How It Works

Each `.fab` file defines methods with translation annotations:

```fab
# From lista.fab
@ verte ts "push"
@ verte py "append"
@ verte rs "push"
@ verte zig (ego, elem, alloc) -> "§0.adde(§2, §1)"
functio adde(T elem) -> vacuum
```

**Build:** `bun run build:norma` generates `norma-registry.gen.ts` (for faber) and `norma-registry.gen.fab` (for rivus).

**Runtime libraries** for complex translations live in `fons/subsidia/`:
- `subsidia/zig/` - `Lista`, `Tabula`, `Copia` wrappers
- `subsidia/cpp/` - Helper functions
- `subsidia/rs/` - Helper functions

Status: ● implemented, ◐ partial, ○ not implemented, — not applicable

## Lista (Array) Methods

| Latin | TypeScript | Zig | Python | Rust | C++23 |
| ----- | :--------: | :-: | :----: | :--: | :---: |
| `adde` (push) | ● | ● | ● | ● | ● |
| `addita` (push copy) | ● | — | ● | ● | ● |
| `praepone` (unshift) | ● | ● | ● | ● | ● |
| `praeposita` (unshift copy) | ● | — | ● | ● | ● |
| `remove` (pop) | ● | ● | ● | ● | ● |
| `remota` (pop copy) | ● | — | ● | ● | ● |
| `decapita` (shift) | ● | ● | ● | ● | ● |
| `decapitata` (shift copy) | ● | — | ● | ● | ● |
| `purga` (clear) | ● | ● | ● | ● | ● |
| `primus` (first) | ● | ● | ● | ● | ● |
| `ultimus` (last) | ● | ● | ● | ● | ● |
| `accipe` (at index) | ● | ● | ● | ● | ● |
| `longitudo` (length) | ● | ● | ● | ● | ● |
| `vacua` (is empty) | ● | ● | ● | ● | ● |
| `continet` (includes) | ● | ● | ● | ● | ● |
| `indiceDe` (indexOf) | ● | ● | ● | ● | ● |
| `inveni` (find) | ● | ● | ● | ● | ● |
| `inveniIndicem` (findIndex) | ● | ● | ● | ● | ● |
| `filtrata` (filter) | ● | ● | ● | ● | ● |
| `mappata` (map) | ● | ● | ● | ● | ● |
| `reducta` (reduce) | ● | ● | ● | ● | ● |
| `explanata` (flatMap) | ● | — | ● | ● | ● |
| `plana` (flat) | ● | — | ● | ● | ● |
| `inversa` (reverse copy) | ● | ● | ● | ● | ● |
| `ordinata` (sort copy) | ● | ● | ● | ● | ● |
| `sectio` (slice) | ● | ● | ● | ● | ● |
| `prima` (take first n) | ● | ● | ● | ● | ● |
| `ultima` (take last n) | ● | ● | ● | ● | ● |
| `omissa` (skip first n) | ● | ● | ● | ● | ● |
| `omnes` (every) | ● | ● | ● | ● | ● |
| `aliquis` (some) | ● | ● | ● | ● | ● |
| `coniunge` (join) | ● | — | ● | ● | ● |
| `perambula` (forEach) | ● | ● | ● | ● | ● |
| `filtra` (filter in-place) | ● | — | ● | ○ | ● |
| `ordina` (sort in-place) | ● | ● | ● | ● | ● |
| `inverte` (reverse in-place) | ● | ● | ● | ● | ● |
| `congrega` (groupBy) | ● | — | ● | ○ | ● |
| `unica` (unique) | ● | — | ● | ● | ● |
| `planaOmnia` (flattenDeep) | ● | — | ○ | ○ | ◐ |
| `fragmenta` (chunk) | ● | — | ● | ● | ● |
| `densa` (compact) | ● | — | ● | ○ | ● |
| `partire` (partition) | ● | — | ● | ● | ● |
| `miscita` (shuffle) | ● | — | ● | ○ | ● |
| `specimen` (sample one) | ● | — | ● | ○ | ● |
| `specimina` (sample n) | ● | — | ● | ○ | ● |
| `summa` (sum) | ● | ● | ● | ● | ● |
| `medium` (average) | ● | ● | ● | ● | ● |
| `minimus` (min) | ● | ● | ● | ● | ● |
| `maximus` (max) | ● | ● | ● | ● | ● |
| `minimusPer` (minBy) | ● | — | ○ | ● | ● |
| `maximusPer` (maxBy) | ● | — | ○ | ● | ● |
| `numera` (count) | ● | ● | ● | ● | ● |

## Tabula (Map) Methods

| Latin | TypeScript | Zig | Python | Rust | C++23 |
| ----- | :--------: | :-: | :----: | :--: | :---: |
| `pone` (set) | ● | ● | ● | ● | ● |
| `accipe` (get) | ● | ● | ● | ● | ● |
| `habet` (has) | ● | ● | ● | ● | ● |
| `dele` (delete) | ● | ● | ● | ● | ● |
| `longitudo` (size) | ● | ● | ● | ● | ● |
| `vacua` (isEmpty) | ● | ● | ● | ● | ● |
| `purga` (clear) | ● | ● | ● | ● | ● |
| `claves` (keys) | ● | ● | ● | ● | ● |
| `valores` (values) | ● | ● | ● | ● | ● |
| `paria` (entries) | ● | ● | ● | ● | ● |
| `accipeAut` (getOrDefault) | ● | ● | ● | ● | ● |
| `selecta` (pick) | ● | — | ● | ○ | ● |
| `omissa` (omit) | ● | — | ● | ○ | ● |
| `conflata` (merge) | ● | — | ● | ● | ● |
| `inversa` (invert) | ● | — | ● | ○ | ● |
| `mappaValores` (mapValues) | ● | — | ● | ○ | ● |
| `mappaClaves` (mapKeys) | ● | — | ● | ○ | ● |
| `inLista` (toArray) | ● | — | ● | ● | ● |
| `inObjectum` (toObject) | ● | — | ● | — | — |

## Copia (Set) Methods

| Latin | TypeScript | Zig | Python | Rust | C++23 |
| ----- | :--------: | :-: | :----: | :--: | :---: |
| `adde` (add) | ● | ● | ● | ● | ● |
| `habet` (has) | ● | ● | ● | ● | ● |
| `dele` (delete) | ● | ● | ● | ● | ● |
| `longitudo` (size) | ● | ● | ● | ● | ● |
| `vacua` (isEmpty) | ● | ● | ● | ● | ● |
| `purga` (clear) | ● | ● | ● | ● | ● |
| `unio` (union) | ● | — | ● | ● | ● |
| `intersectio` (intersection) | ● | — | ● | ● | ● |
| `differentia` (difference) | ● | — | ● | ● | ● |
| `symmetrica` (symmetric diff) | ● | — | ● | ● | ● |
| `subcopia` (isSubset) | ● | — | ● | ● | ● |
| `supercopia` (isSuperset) | ● | — | ● | ● | ● |
| `inLista` (toArray) | ● | — | ● | ● | ● |
| `valores` (values) | ● | ● | ● | ○ | ● |
| `perambula` (forEach) | ● | — | ● | ● | ● |

## Textus (String) Methods

| Latin | TypeScript | Zig | Python | Rust | C++23 |
| ----- | :--------: | :-: | :----: | :--: | :---: |
| `longitudo` (length) | ● | ● | ● | ● | ● |
| `sectio` (slice) | ● | ● | ● | ● | ● |
| `continet` (contains) | ● | ● | ● | ● | ● |
| `initium` (startsWith) | ● | ● | ● | ● | ● |
| `finis` (endsWith) | ● | ● | ● | ● | ● |
| `maiuscula` (toUpperCase) | ● | ● | ● | ● | ● |
| `minuscula` (toLowerCase) | ● | ● | ● | ● | ● |
| `recide` (trim) | ● | ● | ● | ● | ● |
| `divide` (split) | ● | ◐ | ● | ● | ◐ |
| `muta` (replaceAll) | ● | ◐ | ● | ● | ● |

## Numerus/Fractus Methods

| Latin | TypeScript | Zig | Python | Rust | C++23 |
| ----- | :--------: | :-: | :----: | :--: | :---: |
| `adTextum` (toString) | ● | ● | ● | ● | ● |

## Math (mathesis)

| Latin | TypeScript | Zig | Python | Rust | C++23 |
| ----- | :--------: | :-: | :----: | :--: | :---: |
| `pavimentum(x)` (floor) | ● | ● | ● | ● | ● |
| `tectum(x)` (ceiling) | ● | ● | ● | ● | ● |
| `radix(x)` (sqrt) | ● | ● | ● | ● | ● |
| `potentia(x, n)` (pow) | ● | ● | ● | ● | ● |
| `absolutum(x)` (abs) | ● | ● | ● | ● | ● |
| `signum(x)` (sign) | ● | ● | ● | ● | ● |
| `rotundum(x)` (round) | ● | ● | ● | ● | ● |
| `truncatum(x)` (trunc) | ● | ● | ● | ● | ● |
| `logarithmus(x)` (log) | ● | ● | ● | ● | ● |
| `logarithmus10(x)` (log10) | ● | ● | ● | ● | ● |
| `exponens(x)` (exp) | ● | ● | ● | ● | ● |
| `sinus(x)` (sin) | ● | ● | ● | ● | ● |
| `cosinus(x)` (cos) | ● | ● | ● | ● | ● |
| `tangens(x)` (tan) | ● | ● | ● | ● | ● |
| `minimus(a, b)` (min) | ● | ● | ● | ● | ● |
| `maximus(a, b)` (max) | ● | ● | ● | ● | ● |
| `constringens(x, lo, hi)` (clamp) | ● | ● | ● | ● | ● |
| `PI` (constant) | ● | ● | ● | ● | ● |
| `E` (constant) | ● | ● | ● | ● | ● |
| `TAU` (constant) | ● | ● | ● | ● | ● |

## Random (aleator)

| Latin | TypeScript | Zig | Python | Rust | C++23 |
| ----- | :--------: | :-: | :----: | :--: | :---: |
| `fractus()` (random 0-1) | ● | ● | ● | ● | ● |
| `inter(min, max)` (int) | ● | ● | ● | ● | ● |
| `octeti(n)` (random bytes) | ● | ● | ● | ● | ● |
| `uuid()` (UUID v4) | ● | ● | ● | ● | ● |
| `selige(lista)` (random pick) | ● | ● | ● | ● | ● |
| `miscita(lista)` (shuffle copy) | ● | ● | ● | ● | ● |
| `semen(n)` (seed) | ● | ● | ● | ● | ● |

## Time (tempus)

| Latin | TypeScript | Zig | Python | Rust | C++23 |
| ----- | :--------: | :-: | :----: | :--: | :---: |
| `nunc()` (current epoch) | ● | ● | ● | ● | ● |
| `nunc_nano()` (nanos) | ● | ● | ● | ● | ● |
| `nunc_secunda()` (secs) | ● | ● | ● | ● | ● |
| `dormi ms` (sleep) | ● | ● | ● | ● | ● |
| Duration constants | ● | ● | ● | ● | ● |

## Not Yet Implemented

The following modules are specified but have no translations yet:

- **File I/O (solum)** - read, write, exists, mkdir, etc.
- **Network (caelum)** - HTTP, WebSocket, sockets
- **Crypto** - hash, HMAC, encrypt/decrypt
- **Encoding (codex)** - base64, hex, URL encoding
- **Compression (comprimo)** - gzip, zstd, brotli
- **Database (arca)** - query DSL, transactions
