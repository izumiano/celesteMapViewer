local binfile = require("utils.binfile")
local binaryReader = require("utils.binary_reader")
local utf8 = require("utf8")

local mapcoder = {}

function mapcoder.look(reader, lookup)
    return lookup[reader:readShort() + 1]
end

local decodeFunctions = {
    "readBool",
    "readByte",
    "readSignedShort",
    "readSignedLong",
    "readFloat"
}

local typeHeaders = {
    bool = 0,
    byte = 1,
    signedShort = 2,
    signedLong = 3,
    float32 = 4,
    stringLookup = 5,
    string = 6,
    runLengthEncoded = 7
}

local function decodeValue(reader, lookup, typ)
    if typ >= 0 and typ <= 4 then
        return reader[decodeFunctions[typ + 1]](reader)

    elseif typ == 5 then
        return mapcoder.look(reader, lookup)

    elseif typ == 6 then
        return reader:readString()

    elseif typ == 7 then
        return reader:readRunLengthEncoded()
    end
end

local function decodeElement(reader, lookup)
    -- coroutine.yield()

    local name = mapcoder.look(reader, lookup)
    local element = {__name=name}
    local attributeCount = reader:readByte()

    for i = 1, attributeCount do
        local key = mapcoder.look(reader, lookup)
        local typ = reader:readByte()

        local value = decodeValue(reader, lookup, typ)

        if key then
            element[key] = value
        end
    end

    local elementCount = reader:readShort()

    if elementCount > 0 then
        element.__children = {}

        for i = 1, elementCount do
            table.insert(element.__children, decodeElement(reader, lookup))
        end
    end

    return element
end

function mapcoder.decodeFile(path, header)
    header = header or "CELESTE MAP"

    local writer = io.open(path, "rb")
    local res = {}

    if not writer then
        return false, "File not found"
    end

    local reader = binaryReader(writer)

		local readHeader = reader:readString()
    if #header > 0 and readHeader ~= header then
        return false, "Invalid Celeste map file"
    end

    local package = reader:readString()

    local lookupLength = reader:readShort()
    local lookup = {}

    for i = 1, lookupLength do
        lookup[i] = reader:readString()
    end

    res = decodeElement(reader, lookup)
    res._package = package

    -- coroutine.yield("update", res)

    return res
end

local function countStrings(data, seen)
    seen = seen or {}

    local name = data.__name or ""
    local children = data.__children

    seen[name] = (seen[name] or 0) + 1

    for k, v in pairs(data) do
        if type(k) == "string" and k ~= "__name" and k ~= "__children" then
            seen[k] = (seen[k] or 0) + 1
        end

        if type(v) == "string" and k ~= "innerText" then
            seen[v] = (seen[v] or 0) + 1
        end
    end

    if children then
        for i, child in ipairs(children) do
            countStrings(child, seen)
        end
    end

    return seen
end

local integerBits = {
    {typeHeaders.byte, 0, 255, "writeByte"},
    {typeHeaders.signedShort, -32768, 32767, "writeSignedShort"},
    {typeHeaders.signedLong, -2147483648, 2147483647, "writeSignedLong"},
}

local function findInLookup(lookup, s)
    return lookup[s]
end

return mapcoder