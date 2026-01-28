from backend.app import app

print("---| REGISTERED ROUTES |---")
for route in app.routes:
    methods = getattr(route, "methods", "GET")
    path = getattr(route, "path", route)
    print(f"{methods} {path}")
print("---------------------------")
