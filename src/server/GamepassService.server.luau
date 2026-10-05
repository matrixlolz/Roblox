-- Checks gamepass ownership, handles in-game purchases and grants perks.
-- Perks are exposed as player attributes so any other script can read them:
--   player:GetAttribute("VIP")             -> boolean
--   player:GetAttribute("MoneyMultiplier") -> number (1 or 2)
--   player:GetAttribute("HDAdmin")         -> boolean

local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local GamepassConfig = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("GamepassConfig"))
local Passes = GamepassConfig.Passes

local function ownsPass(player, passId)
	local ok, owns = pcall(MarketplaceService.UserOwnsGamePassAsync, MarketplaceService, player.UserId, passId)
	if not ok then
		warn(`[Gamepass] Ownership check failed for {player.Name} ({passId}): {owns}`)
		return false
	end
	return owns
end

local function addVipTag(character)
	local head = character:WaitForChild("Head", 10)
	if not head or head:FindFirstChild("VipTag") then
		return
	end
	local billboard = Instance.new("BillboardGui")
	billboard.Name = "VipTag"
	billboard.Size = UDim2.fromOffset(100, 30)
	billboard.StudsOffset = Vector3.new(0, 2.5, 0)
	billboard.AlwaysOnTop = true
	billboard.MaxDistance = 75

	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Text = "VIP"
	label.TextColor3 = Color3.fromRGB(255, 215, 0)
	label.TextStrokeTransparency = 0
	label.Font = Enum.Font.GothamBold
	label.TextScaled = true
	label.Parent = billboard

	billboard.Parent = head
end

local function grantHDAdmin(player)
	local setup = ReplicatedStorage:WaitForChild("HDAdminSetup", 30)
	if not setup then
		warn("[Gamepass] HD Admin not found; insert HD Admin into the game to enable the HD Admin pass.")
		return
	end
	local ok, err = pcall(function()
		local hdMain = require(setup):GetMain()
		local api = hdMain:GetModule("API")
		-- Only raise the rank, never lower an existing higher rank (e.g. owner).
		if api:GetRank(player) < GamepassConfig.HDAdminRank then
			api:SetRank(player, GamepassConfig.HDAdminRank, "Server")
		end
	end)
	if not ok then
		warn(`[Gamepass] Failed to give HD Admin rank to {player.Name}: {err}`)
	end
end

local function grant(player, passKey)
	if passKey == "VIP" then
		player:SetAttribute("VIP", true)
		if player.Character then
			task.spawn(addVipTag, player.Character)
		end
	elseif passKey == "DoubleMoney" then
		player:SetAttribute("MoneyMultiplier", GamepassConfig.MoneyMultiplier)
	elseif passKey == "HDAdmin" then
		player:SetAttribute("HDAdmin", true)
		task.spawn(grantHDAdmin, player)
	end
end

local function onPlayerAdded(player)
	player:SetAttribute("MoneyMultiplier", 1)

	player.CharacterAdded:Connect(function(character)
		if player:GetAttribute("VIP") then
			addVipTag(character)
		end
	end)

	for passKey, pass in Passes do
		task.spawn(function()
			if ownsPass(player, pass.Id) then
				grant(player, passKey)
			end
		end)
	end
end

MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, purchased)
	if not purchased then
		return
	end
	for passKey, pass in Passes do
		if pass.Id == passId then
			grant(player, passKey)
		end
	end
end)

Players.PlayerAdded:Connect(onPlayerAdded)
for _, player in Players:GetPlayers() do
	task.spawn(onPlayerAdded, player)
end
