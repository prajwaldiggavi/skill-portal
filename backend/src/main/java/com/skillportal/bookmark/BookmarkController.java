package com.skillportal.bookmark;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookmarks")
@Tag(name = "Bookmarks", description = "Endpoints for bookmarking and retrieving saved questions, topics, and materials")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @GetMapping
    @Operation(summary = "Get bookmarks for current user with optional type filter")
    public ResponseEntity<ApiResponse<List<BookmarkDto.BookmarkItem>>> getBookmarks(
            @RequestParam(required = false, defaultValue = "ALL") String type,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<BookmarkDto.BookmarkItem> list = bookmarkService.getUserBookmarks(principal.getId(), type);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    @Operation(summary = "Add or update bookmark")
    public ResponseEntity<ApiResponse<Void>> addBookmark(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BookmarkDto.ToggleBookmarkRequest request) {
        bookmarkService.addBookmark(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Bookmark saved", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove bookmark by ID")
    public ResponseEntity<ApiResponse<Void>> deleteBookmark(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        bookmarkService.deleteBookmark(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Bookmark removed", null));
    }
}
