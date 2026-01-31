# Utils

General-purpose utility functions.

## format.ts

Number and time formatting for display.

### formatNumber(num)
Formats large numbers with abbreviations:
```typescript
formatNumber(1234)      // "1234"
formatNumber(12345)     // "12.3K"
formatNumber(1234567)   // "1.23M"
formatNumber(1234567890) // "1.23B"
```

### formatTime(ms)
Formats milliseconds to readable time:
```typescript
formatTime(5000)      // "5s"
formatTime(65000)     // "1m 5s"
formatTime(3665000)   // "1h 1m"
formatTime(90000000)  // "1d 1h"
```

### formatPercent(value, decimals?)
Formats 0-1 value as percentage:
```typescript
formatPercent(0.5)    // "50.0%"
formatPercent(0.123, 2) // "12.30%"
```

### formatXp(current, required)
Formats XP display:
```typescript
formatXp(1500, 5000)  // "1.50K / 5.00K XP"
```

## Future Utils

| Util | Purpose |
|------|---------|
| `debounce.ts` | Debounce/throttle functions |
| `validation.ts` | Input validation helpers |

## Rules

1. Pure functions only
2. No side effects
3. Well-typed with generics where appropriate
