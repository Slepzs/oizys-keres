# Game Systems

Feature modules that organize related game mechanics.

## Current Systems

| System | Purpose |
|--------|---------|
| `skills/` | Skill definitions, registry, lookups |

## Future Systems (Planned)

- `automation/` - Auto-training logic, unlock progression
- `combat/` - Combat calculations, enemy definitions
- `crafting/` - Recipe definitions, crafting logic
- `quests/` - Quest state, completion checks

## Pattern

Each system folder should have:
- `index.ts` - Barrel export
- Feature-specific files with pure functions
- No React imports

## Skills System

The `skills/` folder contains:
- `skill-registry.ts` - Lookup functions for skill definitions

```typescript
getSkillDefinition(skillId)    // Get single skill
getAllSkillDefinitions()       // Get all skills
isValidSkillId(id)            // Type guard
getAvailableSkills(level)     // Skills unlocked at player level
```

## Adding New Systems

1. Create folder: `systems/[name]/`
2. Create `index.ts` with exports
3. Export from `systems/index.ts`
4. Pure functions only - no React, no side effects
