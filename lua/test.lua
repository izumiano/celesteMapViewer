local mapcoder = require("mapcoder")
local tiles = require("structs.tiles")

local function dump(o)
	if type(o) == 'table' then
		local s = '{ '
		for k,v in pairs(o) do
			if type(k) ~= 'number' then k = '"'..k..'"' end
			s = s .. '['..k..'] = ' .. dump(v) .. ',\n'
		end
		return s .. '} '
	else
		return tostring(o)
	end
end

local path = "C:\\Users\\elibr\\Dev\\Web\\celesteMapViewer\\testData\\0-Prologue.bin";
local mapData = mapcoder.decodeFile(path)
-- print(dump(mapData))
local first = mapData.__children[1]
-- print(first.__name)
local second = first.__children[1]
-- print(second.name)
local third = second.__children[1]
-- print(third.__name)
-- print(dump(third))

print(dump(tiles.decode(third)))