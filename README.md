# Roblox
## Gamepasses

| Pass | ID | Perk |
| --- | --- | --- |
| VIP | 2006751545 | Gold `VIP` tag over head + `[VIP]` chat prefix |
| 2x Money | 2006625592 | `MoneyMultiplier` attribute set to 2 |
| HD Admin | 2006289583 | HD Admin rank (default 3 = Admin) |

IDs and settings live in `src/shared/GamepassConfig.luau`. Sync with [Rojo](https://rojo.space) using `default.project.json`.

Players get an in-game **Shop** button to buy each pass. Ownership is checked on join and purchases apply instantly.

To use the 2x pass when awarding currency:

```lua
local amount = 10 * (player:GetAttribute("MoneyMultiplier") or 1)
```

The HD Admin pass needs the HD Admin model inserted into the game (it creates `ReplicatedStorage.HDAdminSetup`).

**Passes must be put on sale on the Creator Dashboard** (Creations → your experience → Monetization → Passes → each pass → Sales → toggle "Item for Sale" and set a price). Code cannot do this.
