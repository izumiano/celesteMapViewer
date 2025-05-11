local mapcoder = require("mapcoder")

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

local path = "C:\\Users\\elibr\\Dev\\Web\\celesteMapViewer\\testData\\6-ReflectionD-B.bin";
print(dump(mapcoder.decodeFile(path)))