import json

def update_params_file(path):
    with open(path) as params_file:
        params = json.load(params_file)
    for guild in params.keys():
        params[guild]["sfw"] = str(params[guild]["sfw"])
        params[guild]["nsfw"] = str(params[guild]["nsfw"])
        params[guild]["emoji"] = str(params[guild]["emoji"])
    with open(path, 'w') as params_file:
        json.dump(params, params_file)


def update_starred_file(path):
    with open(path) as starred_file:
        starred = json.load(starred_file)
    for guild in starred.keys():
        for starred_message in starred[guild]:
            starred[guild][starred_message]["id"] = str(starred[guild][starred_message]["id"])
            starred[guild][starred_message]["author"] = str(starred[guild][starred_message]["author"])
    with open(path, 'w') as starred_file:
        json.dump(starred, starred_file)


def main():
    update_params_file("../../../params.json")
    update_starred_file("../../../starred.json")


if __name__ == '__main__':
    main()
