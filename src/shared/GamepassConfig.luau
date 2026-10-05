-- Gamepass IDs and settings shared by server and client.
local GamepassConfig = {}

GamepassConfig.Passes = {
	VIP = {
		Id = 2006751545,
		DisplayName = "VIP",
		Description = "VIP tag over your head and in chat.",
	},
	DoubleMoney = {
		Id = 2006625592,
		DisplayName = "2x Money",
		Description = "Earn double from everything.",
	},
	HDAdmin = {
		Id = 2006289583,
		DisplayName = "HD Admin",
		Description = "Admin commands via HD Admin.",
	},
}

-- HD Admin rank given to HDAdmin pass owners (0 NonAdmin, 1 VIP, 2 Mod, 3 Admin, 4 HeadAdmin, 5 Owner).
GamepassConfig.HDAdminRank = 3

-- Multiplier applied for DoubleMoney owners.
GamepassConfig.MoneyMultiplier = 2

return GamepassConfig
