FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY src/Akademik.sln .
COPY src/Akademik/Akademik.csproj Akademik/
COPY src/Akademik.DataProvider/Akademik.DataProvider.csproj Akademik.DataProvider/
COPY src/Akademik.Services/Akademik.Services.csproj Akademik.Services/
COPY src/Akademik.IntegrationTests/Akademik.IntegrationTests.csproj Akademik.IntegrationTests/

RUN dotnet restore Akademik.sln

COPY src/ .

RUN dotnet publish Akademik/Akademik.csproj -c Release -o /out --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .

EXPOSE 3001
ENTRYPOINT ["dotnet", "Akademik.dll"]
