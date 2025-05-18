try:
	with open('.vscode\\settingsPath.txt', 'r+') as file:
		line = file.readline()

		if line != '':
			path = line
		else:
			path = input("path to your vscode settings file: ")
			file.write(path)
except FileNotFoundError:
	print('.vscode/settingsPath.txt not found. creating it')
	with open('.vscode\\settingsPath.txt', "x") as file:
		path = input("path to your vscode settings file: ")
		file.write(path)
	exit()

try:
	with open(path, 'r') as file:
			lines = file.readlines()

	found = False
	for i, line in enumerate(lines):
			if '// "**/*.js": true' in line:
					lines[i] = line.replace('// "**/*.js": true', '"**/*.js": true')
					print('Hiding .js files')
					found = True
					break
			elif '"**/*.js": true' in line:
					lines[i] = line.replace('"**/*.js": true', '// "**/*.js": true')
					print("Showing .js files")
					found = True
					break


	if found:
		with open(path, 'w') as file:
				file.writelines( lines )
	else:
		print('missing: \n"files.exclude": {\n"**/*.js": true\n}\nfrom vscode settings file')
except FileNotFoundError as err:
	print(err)