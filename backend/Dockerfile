FROM --platform=linux/amd64 openjdk:17-slim
WORKDIR /app
COPY target/demo-0.0.3-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]