package com.skillportal.auth;

import com.skillportal.exception.ApiException;
import com.skillportal.exception.BadRequestException;
import com.skillportal.exception.UnauthorizedException;
import com.skillportal.security.JwtTokenProvider;
import com.skillportal.security.UserPrincipal;
import com.skillportal.user.StudentProfileRepository;
import com.skillportal.user.User;
import com.skillportal.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            RefreshTokenRepository refreshTokenRepository,
            JwtTokenProvider tokenProvider,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        User user = findUserByIdentifier(request.getIdentifier());
        return processAuthentication(user, request.getPassword(), user.getRole());
    }

    @Transactional
    public AuthDto.AuthResponse loginStudent(AuthDto.LoginRequest request) {
        User user = findUserByIdentifier(request.getIdentifier());
        return processAuthentication(user, request.getPassword(), "ROLE_STUDENT");
    }

    @Transactional
    public AuthDto.AuthResponse loginAdmin(AuthDto.LoginRequest request) {
        User user = findUserByIdentifier(request.getIdentifier());
        return processAuthentication(user, request.getPassword(), "ROLE_ADMIN");
    }

    private User findUserByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            throw new UnauthorizedException("Invalid credentials");
        }
        String cleanId = identifier.trim();
        Optional<User> userOpt = userRepository.findByEmail(cleanId);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByStudentId(cleanId);
        }
        return userOpt.orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
    }

    private AuthDto.AuthResponse processAuthentication(User user, String rawPassword, String expectedRole) {
        // Check if account is temporarily locked
        if (user.isLocked()) {
            long minutesRemaining = Duration.between(Instant.now(), user.getLockedUntil()).toMinutes() + 1;
            throw new ApiException(
                    "Account is temporarily locked due to repeated failed login attempts. Try again in " + minutesRemaining + " minutes.",
                    HttpStatus.LOCKED,
                    "ACCOUNT_LOCKED"
            );
        }

        // Validate Role separation
        if (!user.getRole().equals(expectedRole)) {
            throw new UnauthorizedException("Unauthorized: Account does not have " + expectedRole + " privileges");
        }

        // Verify Password
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                userRepository.lockUser(user.getId(), Instant.now().plus(LOCK_DURATION));
                throw new ApiException(
                        "Account has been locked for 15 minutes due to multiple failed login attempts.",
                        HttpStatus.LOCKED,
                        "ACCOUNT_LOCKED"
                );
            } else {
                userRepository.updateFailedAttempts(user.getId(), attempts);
                throw new UnauthorizedException("Invalid credentials (" + (MAX_FAILED_ATTEMPTS - attempts) + " attempts remaining)");
            }
        }

        // High-performance optimization: Only reset failed login count if it was greater than 0
        if (user.getFailedLoginAttempts() > 0) {
            userRepository.resetFailedAttempts(user.getId());
        }

        return createAuthResponse(user);
    }

    @Transactional
    public AuthDto.AuthResponse refreshToken(AuthDto.RefreshTokenRequest request) {
        RefreshTokenRepository.RefreshTokenRecord tokenRecord = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid or revoked refresh token"));

        if (tokenRecord.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.revokeToken(request.getRefreshToken());
            throw new UnauthorizedException("Refresh token has expired. Please login again.");
        }

        User user = userRepository.findById(tokenRecord.getUserId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Refresh token rotation
        refreshTokenRepository.revokeToken(request.getRefreshToken());

        return createAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.revokeToken(refreshToken);
        }
    }

    @Transactional
    public void changePassword(Long userId, AuthDto.PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        String newHash = passwordEncoder.encode(request.getNewPassword());
        userRepository.updatePassword(userId, newHash);
        refreshTokenRepository.revokeAllUserTokens(userId);
    }

    private AuthDto.AuthResponse createAuthResponse(User user) {
        UserPrincipal principal = new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getFullName(),
                user.getRole(),
                "ACTIVE".equalsIgnoreCase(user.getStatus())
        );

        String accessToken = tokenProvider.generateAccessToken(principal);
        String refreshToken = tokenProvider.generateRefreshToken();
        Instant refreshExpiry = Instant.now().plusMillis(tokenProvider.getRefreshExpirationMs());

        refreshTokenRepository.save(user.getId(), refreshToken, refreshExpiry);

        String studentIdNumber = null;
        String avatarUrl = null;
        if ("ROLE_STUDENT".equals(user.getRole())) {
            Optional<StudentProfileRepository.StudentRecord> profileOpt = studentProfileRepository.findByUserId(user.getId());
            if (profileOpt.isPresent()) {
                studentIdNumber = profileOpt.get().getStudentIdNumber();
                avatarUrl = profileOpt.get().getAvatarUrl();
            }
        }

        AuthDto.UserSummary summary = new AuthDto.UserSummary(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                studentIdNumber,
                avatarUrl
        );

        return new AuthDto.AuthResponse(accessToken, refreshToken, 900L, summary);
    }
}
