# BalanceBuddyWebApi

This project bundles a .NET 8 Web API backend and a React (MUI) frontend.
The frontend build is copied into the backend’s wwwroot, so everything runs from one server.


Requirements
------------
- .NET 8 SDK (https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
- Node.js + npm (https://nodejs.org/) for frontend build
- make (optional but recommended for easier commands)


Development (local run)
-----------------------
1. Build frontend and copy into backend:
   make

2. Run backend + frontend together:
   make run

3. Open in browser:
   http://localhost:5000  (HTTP)

APIs are available under /api/...


Production / Publishing
-----------------------
1. Publish backend + frontend bundle:
   make publish

2. Go to the publish folder:
   BalanceBuddyWebApi/bin/Release/net8.0/publish

3. Run the server:
   dotnet BalanceBuddyWebApi.dll

   If you want a standalone .exe (no .NET required), run:
   dotnet publish -c Release -r win-x64 --self-contained true

   Then start with:
   BalanceBuddyWebApi.exe


Cleaning
--------
Remove build artifacts:
   make clean


Folder Structure
----------------
```
BalanceBuddyWebApi/
├── balancebuddy-frontend/       (React frontend)
├── Controllers/                 (API controllers)
├── Data/                        (Database files)
├── Services/                    (Business logic & parsers)
├── wwwroot/                     (React build copied here for dev run)
├── bin/Release/net8.0/publish/  (Final publish output)
```
