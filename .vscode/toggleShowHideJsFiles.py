import json;

try:
	with open('.vscode/settingsPath.txt', 'r+') as file:
		line = file.readline()

		if line != '':
			path = line
		else:
			path = input("path to your vscode settings file: ")
			file.write(path)
except FileNotFoundError:
	print('.vscode/settingsPath.txt not found. creating it')
	with open('.vscode/settingsPath.txt', "x") as file:
		path = input("path to your vscode settings file: ")
		file.write(path)

try:
	with open(path, 'r') as file:
		settingsStr = file.read()

	settingsObj = json.loads(settingsStr)
	if "files.exclude" not in settingsObj:
		settingsObj["files.exclude"] = {}
	

	if "**/*.js" in settingsObj["files.exclude"]:
		isExcluding = settingsObj["files.exclude"]["**/*.js"]
		if isExcluding:
			print("showing .js files")
		else:
			print("hiding .js files")
		settingsObj["files.exclude"]["**/*.js"] = not isExcluding
	else:
		print("hiding .js files")
		settingsObj["files.exclude"]["**/*.js"] = True

	with open(path, 'w') as file:
		file.write(json.dumps(settingsObj, indent=2))
		
except FileNotFoundError as err:
	print(err)