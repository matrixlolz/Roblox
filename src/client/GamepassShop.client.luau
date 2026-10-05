-- Gamepass shop UI: a "Shop" button that opens a list of passes with Buy buttons.
-- Also adds the [VIP] chat prefix.

local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TextChatService = game:GetService("TextChatService")

local GamepassConfig = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("GamepassConfig"))

local player = Players.LocalPlayer

local ORDER = { "VIP", "DoubleMoney", "HDAdmin" }
local OWNED_ATTRIBUTE = {
	VIP = "VIP",
	HDAdmin = "HDAdmin",
}

local function isOwned(passKey)
	if passKey == "DoubleMoney" then
		return (player:GetAttribute("MoneyMultiplier") or 1) > 1
	end
	return player:GetAttribute(OWNED_ATTRIBUTE[passKey]) == true
end

local gui = Instance.new("ScreenGui")
gui.Name = "GamepassShop"
gui.ResetOnSpawn = false

local openButton = Instance.new("TextButton")
openButton.Name = "OpenShop"
openButton.AnchorPoint = Vector2.new(0, 0.5)
openButton.Position = UDim2.new(0, 12, 0.5, 0)
openButton.Size = UDim2.fromOffset(90, 40)
openButton.BackgroundColor3 = Color3.fromRGB(0, 170, 90)
openButton.TextColor3 = Color3.new(1, 1, 1)
openButton.Font = Enum.Font.GothamBold
openButton.TextSize = 20
openButton.Text = "Shop"
Instance.new("UICorner", openButton)
openButton.Parent = gui

local frame = Instance.new("Frame")
frame.Name = "ShopFrame"
frame.AnchorPoint = Vector2.new(0.5, 0.5)
frame.Position = UDim2.fromScale(0.5, 0.5)
frame.Size = UDim2.fromOffset(340, 300)
frame.BackgroundColor3 = Color3.fromRGB(30, 30, 36)
frame.Visible = false
Instance.new("UICorner", frame)
frame.Parent = gui

local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, -50, 0, 40)
title.Position = UDim2.fromOffset(14, 6)
title.BackgroundTransparency = 1
title.TextXAlignment = Enum.TextXAlignment.Left
title.TextColor3 = Color3.new(1, 1, 1)
title.Font = Enum.Font.GothamBold
title.TextSize = 22
title.Text = "Gamepasses"
title.Parent = frame

local closeButton = Instance.new("TextButton")
closeButton.AnchorPoint = Vector2.new(1, 0)
closeButton.Position = UDim2.new(1, -8, 0, 8)
closeButton.Size = UDim2.fromOffset(32, 32)
closeButton.BackgroundColor3 = Color3.fromRGB(200, 60, 60)
closeButton.TextColor3 = Color3.new(1, 1, 1)
closeButton.Font = Enum.Font.GothamBold
closeButton.TextSize = 18
closeButton.Text = "X"
Instance.new("UICorner", closeButton)
closeButton.Parent = frame

local list = Instance.new("Frame")
list.Position = UDim2.fromOffset(10, 52)
list.Size = UDim2.new(1, -20, 1, -62)
list.BackgroundTransparency = 1
list.Parent = frame
local layout = Instance.new("UIListLayout")
layout.Padding = UDim.new(0, 8)
layout.SortOrder = Enum.SortOrder.LayoutOrder
layout.Parent = list

local buyButtons = {}

local function refresh()
	for passKey, button in buyButtons do
		if isOwned(passKey) then
			button.Text = "Owned"
			button.BackgroundColor3 = Color3.fromRGB(90, 90, 90)
			button.AutoButtonColor = false
		end
	end
end

for index, passKey in ORDER do
	local pass = GamepassConfig.Passes[passKey]

	local row = Instance.new("Frame")
	row.LayoutOrder = index
	row.Size = UDim2.new(1, 0, 0, 70)
	row.BackgroundColor3 = Color3.fromRGB(45, 45, 54)
	Instance.new("UICorner", row)
	row.Parent = list

	local name = Instance.new("TextLabel")
	name.Position = UDim2.fromOffset(10, 6)
	name.Size = UDim2.new(1, -120, 0, 26)
	name.BackgroundTransparency = 1
	name.TextXAlignment = Enum.TextXAlignment.Left
	name.TextColor3 = Color3.new(1, 1, 1)
	name.Font = Enum.Font.GothamBold
	name.TextSize = 18
	name.Text = pass.DisplayName
	name.Parent = row

	local desc = Instance.new("TextLabel")
	desc.Position = UDim2.fromOffset(10, 32)
	desc.Size = UDim2.new(1, -120, 0, 32)
	desc.BackgroundTransparency = 1
	desc.TextXAlignment = Enum.TextXAlignment.Left
	desc.TextYAlignment = Enum.TextYAlignment.Top
	desc.TextWrapped = true
	desc.TextColor3 = Color3.fromRGB(190, 190, 200)
	desc.Font = Enum.Font.Gotham
	desc.TextSize = 13
	desc.Text = pass.Description
	desc.Parent = row

	local buy = Instance.new("TextButton")
	buy.AnchorPoint = Vector2.new(1, 0.5)
	buy.Position = UDim2.new(1, -10, 0.5, 0)
	buy.Size = UDim2.fromOffset(95, 40)
	buy.BackgroundColor3 = Color3.fromRGB(0, 170, 90)
	buy.TextColor3 = Color3.new(1, 1, 1)
	buy.Font = Enum.Font.GothamBold
	buy.TextSize = 16
	buy.Text = "Buy"
	Instance.new("UICorner", buy)
	buy.Parent = row
	buyButtons[passKey] = buy

	-- Show the live Robux price from Roblox.
	task.spawn(function()
		local ok, info = pcall(MarketplaceService.GetProductInfo, MarketplaceService, pass.Id, Enum.InfoType.GamePass)
		if ok and info and not isOwned(passKey) then
			if info.IsForSale and info.PriceInRobux then
				buy.Text = `R$ {info.PriceInRobux}`
			else
				buy.Text = "Offsale"
			end
		end
	end)

	buy.Activated:Connect(function()
		if not isOwned(passKey) then
			MarketplaceService:PromptGamePassPurchase(player, pass.Id)
		end
	end)
end

openButton.Activated:Connect(function()
	frame.Visible = not frame.Visible
end)
closeButton.Activated:Connect(function()
	frame.Visible = false
end)

player:GetAttributeChangedSignal("VIP"):Connect(refresh)
player:GetAttributeChangedSignal("HDAdmin"):Connect(refresh)
player:GetAttributeChangedSignal("MoneyMultiplier"):Connect(refresh)
refresh()

gui.Parent = player:WaitForChild("PlayerGui")

-- [VIP] chat prefix.
TextChatService.OnIncomingMessage = function(message)
	local props = Instance.new("TextChatMessageProperties")
	local source = message.TextSource
	if source then
		local sender = Players:GetPlayerByUserId(source.UserId)
		if sender and sender:GetAttribute("VIP") then
			props.PrefixText = `<font color="#FFD700">[VIP]</font> {message.PrefixText}`
		end
	end
	return props
end
