
FROM maven:latest as builder

WORKDIR /tmp

COPY pom.xml /usr/local/pom.xml
COPY src /usr/local/src
WORKDIR /usr/local/

RUN mvn clean install

FROM openjdk:11-jre-slim
COPY --from=builder /usr/local/target/tags-campaigns-data-1.0-SNAPSHOT-jar-with-dependencies.jar /usr/local/lib/tags-campaigns-data.jar
ENTRYPOINT ["java","-jar","/usr/local/lib/tags-campaigns-data.jar"]
