FROM ubuntu:xenial

# Build environment vars
ARG AEROSPIKE_USER_NAME="${AEROSPIKE_USER_NAME}"
ARG AEROSPIKE_PASSWORD="${AEROSPIKE_PASSWORD}"

RUN apt-get update -y \
&& apt-get -y install wget default-jdk \
&& wget "https://www.aerospike.com/enterprise/download/solutions/aerospike-kafka/1.0.1/artifact/deb" -O aerospike-kafka-1.0.1.deb --user=${AEROSPIKE_USER_NAME} --password=${AEROSPIKE_PASSWORD} \
&& dpkg -i aerospike-kafka-1.0.1.deb \
&& rm -rf aerospike-kafka-1.0.1.deb

EXPOSE 8080

ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
ENV PATH $JAVA_HOME/bin:$PATH
ENV SPRING_CONFIG_ADDITIONAL_LOCATION file:/etc/aerospike-kafka/
ENV LOG4J_CONFIGURATION_FILE file:/etc/aerospike-kafka/log4j2-stdout.xml

CMD ["/opt/aerospike-kafka/bin/start.sh"]
