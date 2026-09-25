package com.skillportal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.TimeZone;

@SpringBootApplication
@EnableTransactionManagement
public class SkillPortalApplication {

    public static void main(String[] args) {
        // Enforce UTC globally across JVM for reliable database timestamps
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(SkillPortalApplication.class, args);
    }
}
