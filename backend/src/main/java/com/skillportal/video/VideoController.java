package com.skillportal.video;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/videos")
@Tag(name = "Recorded Classes & Video Progress", description = "Endpoints for streaming recorded classes and saving playback progress")
public class VideoController {

    private final VideoService videoService;

    public VideoController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get video lecture details including student progress")
    public ResponseEntity<ApiResponse<VideoDto.VideoDetail>> getVideoById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        VideoDto.VideoDetail detail = videoService.getVideoById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @PostMapping("/{id}/progress")
    @Operation(summary = "Save and synchronize student video playback position and watched percentage")
    public ResponseEntity<ApiResponse<Void>> updateProgress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody VideoDto.UpdateProgressRequest request) {
        videoService.updateProgress(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Video progress updated", null));
    }
}
