FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy everything at once
COPY . .

# Restore dependencies
RUN dotnet restore TrainManagment.sln

# Build the project
RUN dotnet build TrainManagment.sln -c Release -o /app/build

# Publish the project
FROM build AS publish
RUN dotnet publish TrainManagment.sln -c Release -o /app/publish

# Set up EF migrations
FROM build AS migration
# Install EF Core tools
RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

# Create migration script
#RUN echo '#!/bin/bash \n\
#    echo "Waiting for database to be ready..." \n\
#    sleep 10 \n\
#    echo "Running database migrations..." \n\
#    cd TrainManagment \n\
#    dotnet ef database update \n\
#    echo "Migrations completed successfully."' > /app/migrate.sh && \
#    chmod +x /app/migrate.sh

# Final image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create entrypoint script
RUN echo '#!/bin/bash \n\
    dotnet TrainManagment.dll' > /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]