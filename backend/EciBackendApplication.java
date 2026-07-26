package com.eci.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EciBackendApplication {

    public static void main(String[] args) {
        // Load environment variables from .env if present
        try {
            Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
            dotenv.entries().forEach(entry -> {
                System.setProperty(entry.getKey(), entry.getValue());
            });
        } catch (Exception e) {
            System.out.println("Dotenv initialization note: " + e.getMessage());
        }

        SpringApplication.run(EciBackendApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" ECI Java Spring Boot Backend Service Started");
        System.out.println(" MySQL Database Connection Initialized");
        System.out.println("=================================================");
    }
}
