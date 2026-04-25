package com.kbf.Api.runner;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.kbf.Api.model.User;
import com.kbf.Api.security.WebSecurityConfig;
import com.kbf.Api.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class DatabaseInitializer implements CommandLineRunner {

	private final UserService userService;
	private final PasswordEncoder passwordEncoder;
	

	@Override
	public void run(String... args) {
		
		if (!userService.getUsers().isEmpty()) {
			return;
		}
		USERS.forEach(user -> {
			user.setPassword(passwordEncoder.encode(user.getPassword()));
			userService.saveUser(user);
		});
		log.info("Database initialized");

	}

}
