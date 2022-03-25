import json
from sys import stdin

openapi_content = json.loads(stdin.read())

for path_data in openapi_content["paths"].values():
    for operation in path_data.values():
        operation["operationId"] = operation["operationId"].removeprefix(f"{operation['tags'][0]}-")

print(json.dumps(openapi_content))
