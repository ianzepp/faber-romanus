# Tempus - Time Operations

## Overview

Time operations for getting current time, sleeping, scheduling, and date manipulation.

## Etymology

- `tempus` - "time, period" — the Date type
- `nunc` - "now" — current instant
- `dormi` - "sleep!" — pause execution
- `mora` - "delay" — a duration of waiting
- `intervallum` - "interval" — space between
- `duratio` - "duration" — length of time

---

## Current Time

### Instant

```
ex "norma/tempus" importa { nunc }

fixum now = nunc()                    // current instant (ms since epoch)
fixum now_ns = nunc_nano()            // nanosecond precision
fixum now_sec = nunc_secunda()        // seconds since epoch
```

### Date/Time

```
ex "norma/tempus" importa { hodie, tempus }

fixum today = hodie()                 // current date (no time)
fixum now = tempus.nunc()             // full datetime

scribe now.annus                      // 2025
scribe now.mensis                     // 12
scribe now.dies                       // 24
scribe now.hora                       // 14
scribe now.minutum                    // 30
scribe now.secundum                   // 45
```

---

## Sleeping

### Basic Sleep

```
ex "norma/tempus" importa { dormi }

cede dormi(1000)                      // sleep 1000ms
cede dormi(5 * SECUNDUM)              // sleep 5 seconds
cede dormi(2 * MINUTUM)               // sleep 2 minutes
```

### Duration Constants

```
ex "norma/tempus" importa {
    MILLISECUNDUM,    // 1
    SECUNDUM,         // 1000
    MINUTUM,          // 60_000
    HORA,             // 3_600_000
    DIES              // 86_400_000
}

cede dormi(30 * SECUNDUM)
cede dormi(HORA + 30 * MINUTUM)
```

---

## Durations

### Creating Durations

```
ex "norma/tempus" importa { duratio }

fixum d = duratio(5000)               // 5000ms
fixum d = duratio.secunda(5)          // 5 seconds
fixum d = duratio.minuta(2)           // 2 minutes
fixum d = duratio.horae(1)            // 1 hour

// Combined
fixum d = duratio.horae(1) + duratio.minuta(30)  // 1h 30m
```

### Duration Arithmetic

```
fixum start = nunc()
// ... work ...
fixum elapsed = nunc() - start

si elapsed > duratio.secunda(5) {
    mone "Operation took too long"
}
```

---

## Timers

### One-shot Timer

```
ex "norma/tempus" importa { post }

// Execute after delay
post(5 * SECUNDUM, fac fit {
    scribe "5 seconds elapsed"
})
```

### Repeating Interval

```
ex "norma/tempus" importa { intervallum }

// Execute every second
fixum timer = intervallum(SECUNDUM, fac fit {
    scribe "tick"
})

// Stop after 10 seconds
cede dormi(10 * SECUNDUM)
timer.siste()
```

### Interval as Stream

```
ex "norma/tempus" importa { intervallum }

// Process ticks as event stream
ex ausculta intervallum(SECUNDUM) fiet tick {
    scribe "tick:", tick
    si tick >= 10 { exi }
}
```

---

## Formatting

### To String

```
ex "norma/tempus" importa { forma }

fixum now = tempus.nunc()

scribe forma(now, "YYYY-MM-DD")           // "2025-12-24"
scribe forma(now, "HH:mm:ss")             // "14:30:45"
scribe forma(now, "YYYY-MM-DD HH:mm:ss")  // "2025-12-24 14:30:45"
scribe forma(now, "ISO")                  // "2025-12-24T14:30:45.000Z"
```

### Format Tokens

| Token | Meaning | Example |
|-------|---------|---------|
| `YYYY` | 4-digit year | 2025 |
| `MM` | Month (01-12) | 12 |
| `DD` | Day (01-31) | 24 |
| `HH` | Hour 24h (00-23) | 14 |
| `hh` | Hour 12h (01-12) | 02 |
| `mm` | Minutes (00-59) | 30 |
| `ss` | Seconds (00-59) | 45 |
| `SSS` | Milliseconds | 123 |
| `a` | AM/PM | PM |

---

## Parsing

```
ex "norma/tempus" importa { lege_tempus }

fixum date = lege_tempus("2025-12-24", "YYYY-MM-DD")
fixum datetime = lege_tempus("2025-12-24 14:30:00", "YYYY-MM-DD HH:mm:ss")
fixum iso = lege_tempus("2025-12-24T14:30:45.000Z", "ISO")
```

---

## Time Zones

```
ex "norma/tempus" importa { zona }

fixum now = tempus.nunc()
fixum tokyo = now.in_zona("Asia/Tokyo")
fixum utc = now.in_zona("UTC")

scribe now.zona                       // "America/New_York"
scribe tokyo.hora                     // different hour
```

---

## Date Arithmetic

```
fixum now = tempus.nunc()

// Add/subtract
fixum tomorrow = now + DIES
fixum yesterday = now - DIES
fixum next_week = now + 7 * DIES
fixum in_2_hours = now + 2 * HORA

// Difference
fixum diff = end_date - start_date    // duratio
scribe diff.dies                      // days between
```

---

## Comparison

```
fixum a = tempus.nunc()
cede dormi(100)
fixum b = tempus.nunc()

si b > a { scribe "b is later" }
si a < b { scribe "a is earlier" }
si a == b { scribe "same instant" }
```

---

## Target Mappings

### TypeScript

```typescript
// nunc()
Date.now()

// tempus.nunc()
new Date()

// dormi(1000)
await new Promise(resolve => setTimeout(resolve, 1000))

// intervallum(1000, callback)
setInterval(callback, 1000)

// forma(date, "YYYY-MM-DD")
// Use Intl.DateTimeFormat or date-fns
```

### Python

```python
import time
import datetime
import asyncio

# nunc()
time.time() * 1000  # ms

# tempus.nunc()
datetime.datetime.now()

# dormi(1000)
await asyncio.sleep(1.0)

# forma(date, "YYYY-MM-DD")
date.strftime("%Y-%m-%d")
```

### Rust

```rust
use std::time::{Duration, Instant, SystemTime};
use chrono::{DateTime, Utc};

// nunc()
SystemTime::now().duration_since(UNIX_EPOCH)?.as_millis()

// tempus.nunc()
Utc::now()

// dormi(1000)
tokio::time::sleep(Duration::from_millis(1000)).await

// forma(date, "YYYY-MM-DD")
date.format("%Y-%m-%d").to_string()
```

### Zig

```zig
const std = @import("std");

// nunc()
std.time.milliTimestamp()

// nunc_nano()
std.time.nanoTimestamp()

// dormi(1000)
std.time.sleep(1_000_000_000)  // nanoseconds

// No built-in date formatting - needs external lib
```

---

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| `nunc` | Not Done | Current instant |
| `tempus.nunc()` | Not Done | Current datetime |
| `hodie` | Not Done | Current date |
| `dormi` | Not Done | Async sleep |
| Duration type | Not Done | Time spans |
| Duration constants | Not Done | SECUNDUM, etc. |
| `post` | Not Done | One-shot timer |
| `intervallum` | Not Done | Repeating timer |
| `forma` | Not Done | Format to string |
| `lege_tempus` | Not Done | Parse from string |
| Time zones | Not Done | Zona support |
| Date arithmetic | Not Done | Add/subtract |
| TypeScript codegen | Not Done | Date, setTimeout |
| Python codegen | Not Done | datetime, asyncio |
| Rust codegen | Not Done | chrono, tokio |
| Zig codegen | Not Done | std.time |

---

## Design Decisions

### Why `nunc` over `tempus.nunc()`?

Both provided:
- `nunc()` — quick epoch milliseconds (primitive)
- `tempus.nunc()` — full datetime object with fields

Most code needs one or the other, not both.

### Why `dormi` is async?

Blocking sleep halts the entire program. Async sleep yields to other tasks. Even in sync contexts, codegen can emit blocking sleep where appropriate.

### Why duration constants?

`dormi(5 * SECUNDUM)` is clearer than `dormi(5000)`. Constants are compile-time evaluated, no runtime cost.

### Why Latin date field names?

| Latin | English |
|-------|---------|
| `annus` | year |
| `mensis` | month |
| `dies` | day |
| `hora` | hour |
| `minutum` | minute |
| `secundum` | second |

Consistent with the language's Latin vocabulary. These are common Latin words that are recognizable.

### Timezone handling?

Timezones are complex. Default to local timezone, allow explicit conversion via `in_zona()`. Store instants in UTC internally.
