package com.skillportal.user;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
@Tag(name = "User Profile", description = "Endpoints for viewing and editing student profile information")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Get full profile information for currently authenticated user")
    public ResponseEntity<ApiResponse<StudentProfileDto.ProfileView>> getProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        StudentProfileDto.ProfileView profile = userService.getProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping
    @Operation(summary = "Update permitted student profile fields (bio, links, phone, avatar)")
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody StudentProfileDto.UpdateProfileRequest request) {
        userService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", null));
    }
}
